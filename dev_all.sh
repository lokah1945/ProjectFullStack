#!/usr/bin/env bash
# dev_all.sh — Start both Strapi (develop) and Next.js (dev) for local development.
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
# Kill existing processes on ports 3200 and 3201
# ─────────────────────────────────────────────────────────────────────────────
log_info "Clearing ports 3200 and 3201..."
lsof -ti:3200 | xargs -r kill -9 || true
lsof -ti:3201 | xargs -r kill -9 || true
sleep 1
log_ok "Ports cleared."

# ─────────────────────────────────────────────────────────────────────────────
# Validate cms-strapi/.env exists
# ─────────────────────────────────────────────────────────────────────────────
if [ ! -f "$ROOT_DIR/cms-strapi/.env" ]; then
  log_error "cms-strapi/.env not found. Run install_all.sh first."
fi

# Validate web-nextjs/.env.local exists
if [ ! -f "$ROOT_DIR/web-nextjs/.env.local" ]; then
  log_warn "web-nextjs/.env.local not found. Creating with defaults..."
  cat > "$ROOT_DIR/web-nextjs/.env.local" << 'EOF'
STRAPI_URL=http://localhost:3200
STRAPI_API_TOKEN=
PORT=3201
EOF
  log_warn "Remember to add your STRAPI_API_TOKEN to web-nextjs/.env.local"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Start Strapi in develop mode (background)
# ─────────────────────────────────────────────────────────────────────────────
log_info "Starting Strapi in develop mode..."
cd "$ROOT_DIR/cms-strapi"
pnpm develop &
STRAPI_PID=$!
log_info "Strapi PID: $STRAPI_PID"

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
Check cms-strapi/.env and PostgreSQL connection."
fi

# ─────────────────────────────────────────────────────────────────────────────
# Start Next.js in dev mode (background)
# ─────────────────────────────────────────────────────────────────────────────
log_info "Starting Next.js dev server on port 3201..."
cd "$ROOT_DIR/web-nextjs"
pnpm dev &
NEXTJS_PID=$!
log_info "Next.js PID: $NEXTJS_PID"

echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Development servers running!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}Strapi CMS:${NC}   http://localhost:3200"
echo -e "  ${CYAN}Strapi Admin:${NC} http://localhost:3200/admin"
echo -e "  ${CYAN}Next.js:${NC}      http://localhost:3201"
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop all servers.${NC}"
echo ""

# Wait for all background processes
wait
