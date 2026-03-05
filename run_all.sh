#!/usr/bin/env bash
# run_all.sh — Build and start both services with pm2 for production.
# Runs as ROOT on Debian 13. No sudo anywhere.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ─────────────────────────────────────────────────────────────────────────────
# Colors
# ─────────────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

log_info()  { echo -e "${CYAN}[INFO]${NC} $*"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}   $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ─────────────────────────────────────────────────────────────────────────────
# Validate environment files exist
# ─────────────────────────────────────────────────────────────────────────────
if [ ! -f "$ROOT_DIR/cms-strapi/.env" ]; then
  log_error "cms-strapi/.env not found. Run install_all.sh first."
fi

if [ ! -f "$ROOT_DIR/web-nextjs/.env.local" ]; then
  log_error "web-nextjs/.env.local not found. Run install_all.sh first and configure STRAPI_API_TOKEN."
fi

# Warn if STRAPI_API_TOKEN is still empty
if ! grep -qE "^STRAPI_API_TOKEN=.+" "$ROOT_DIR/web-nextjs/.env.local"; then
  log_warn "STRAPI_API_TOKEN is not set in web-nextjs/.env.local."
  log_warn "The site will function but data fetching may fail without a valid token."
fi

# ─────────────────────────────────────────────────────────────────────────────
# Stop existing pm2 processes
# ─────────────────────────────────────────────────────────────────────────────
log_info "Stopping any existing pm2 processes..."
pm2 delete all 2>/dev/null || true
log_ok "pm2 processes cleared."

# ─────────────────────────────────────────────────────────────────────────────
# Ensure required directories exist
# ─────────────────────────────────────────────────────────────────────────────
mkdir -p "$ROOT_DIR/cms-strapi/public/uploads"
mkdir -p "$ROOT_DIR/web-nextjs/public"

# ─────────────────────────────────────────────────────────────────────────────
# Build Strapi
# ─────────────────────────────────────────────────────────────────────────────
log_info "Building Strapi admin panel..."
cd "$ROOT_DIR/cms-strapi"
pnpm build
log_ok "Strapi build complete."

# ─────────────────────────────────────────────────────────────────────────────
# Start Strapi with pm2
# ─────────────────────────────────────────────────────────────────────────────
log_info "Starting Strapi with pm2..."
pm2 start pnpm \
  --name "strapi" \
  --cwd "$ROOT_DIR/cms-strapi" \
  -- start
log_ok "Strapi pm2 process started."

# ─────────────────────────────────────────────────────────────────────────────
# Wait for Strapi health check
# ─────────────────────────────────────────────────────────────────────────────
log_info "Waiting for Strapi to be ready (max 120s)..."
STRAPI_READY=false
for i in $(seq 1 60); do
  if curl -sf http://localhost:3200/api/health > /dev/null 2>&1; then
    STRAPI_READY=true
    log_ok "Strapi ready at http://localhost:3200 (attempt $i)"
    break
  fi
  echo -n "."
  sleep 2
done
echo ""

if [ "$STRAPI_READY" = false ]; then
  log_error "Strapi did not become ready after 120 seconds.
Check pm2 logs with: pm2 logs strapi"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Build Next.js (while Strapi is alive)
# ─────────────────────────────────────────────────────────────────────────────
log_info "Building Next.js..."
cd "$ROOT_DIR/web-nextjs"
pnpm build
log_ok "Next.js build complete."

# ─────────────────────────────────────────────────────────────────────────────
# Start Next.js with pm2
# ─────────────────────────────────────────────────────────────────────────────
log_info "Starting Next.js with pm2..."
pm2 start pnpm \
  --name "nextjs" \
  --cwd "$ROOT_DIR/web-nextjs" \
  -- start
log_ok "Next.js pm2 process started."

# ─────────────────────────────────────────────────────────────────────────────
# Save pm2 process list (survives reboots with pm2 startup)
# ─────────────────────────────────────────────────────────────────────────────
pm2 save
log_ok "pm2 process list saved."

echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Production services running with pm2!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}Strapi CMS:${NC}   http://localhost:3200"
echo -e "  ${CYAN}Strapi Admin:${NC} http://localhost:3200/admin"
echo -e "  ${CYAN}Next.js:${NC}      http://localhost:3201"
echo ""
echo -e "  ${YELLOW}Useful pm2 commands:${NC}"
echo -e "    pm2 status          — Show all processes"
echo -e "    pm2 logs            — Tail all logs"
echo -e "    pm2 logs strapi     — Strapi logs only"
echo -e "    pm2 logs nextjs     — Next.js logs only"
echo -e "    pm2 restart all     — Restart all"
echo -e "    pm2 stop all        — Stop all"
echo -e "    pm2 startup         — Enable auto-start on reboot"
echo ""

# Stream logs
pm2 logs
