#!/usr/bin/env bash
# install_all.sh — Idempotent setup script for the multi-site blog/news platform.
# Runs as ROOT on Debian 13. No sudo anywhere.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ─────────────────────────────────────────────────────────────────────────────
# Colors
# ─────────────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info()    { echo -e "${CYAN}[INFO]${NC} $*"; }
log_ok()      { echo -e "${GREEN}[OK]${NC}   $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ─────────────────────────────────────────────────────────────────────────────
# 1. System packages
# ─────────────────────────────────────────────────────────────────────────────
log_info "Installing system packages..."
apt-get update -qq 2>/dev/null || log_warn "apt-get update had warnings (non-fatal)"
apt-get install -y git curl build-essential psmisc lsof 2>/dev/null
log_ok "System packages ready."

# ─────────────────────────────────────────────────────────────────────────────
# 2. Node.js — Strapi v5 supports v20, v22, v24 (even-numbered LTS only)
# ─────────────────────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  log_error "Node.js is not installed. Please install Node.js v20, v22, or v24 first.
Recommended: https://nodejs.org/en/download/package-manager
  apt-get install -y nodejs   (if available from system repos)
  or use nvm: https://github.com/nvm-sh/nvm"
fi

NODE_VERSION=$(node --version)
NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
log_ok "Node.js detected: $NODE_VERSION"

# Validate: must be even-numbered LTS >= 20
if [ "$NODE_MAJOR" -lt 20 ]; then
  log_error "Node.js $NODE_VERSION is too old. Strapi v5 requires >= v20. Please upgrade."
fi

# Warn for odd versions (not LTS)
if (( NODE_MAJOR % 2 != 0 )); then
  log_warn "Node.js $NODE_VERSION is an odd-numbered (non-LTS) release. Strapi recommends v20, v22, or v24."
fi

# ─────────────────────────────────────────────────────────────────────────────
# 3. pnpm (via corepack)
# ─────────────────────────────────────────────────────────────────────────────
if ! command -v pnpm &>/dev/null; then
  log_info "pnpm not found. Installing via corepack..."
  corepack enable
  corepack prepare pnpm@latest --activate
  log_ok "pnpm installed: $(pnpm --version)"
else
  log_ok "pnpm already installed: $(pnpm --version)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. pm2 (global)
# ─────────────────────────────────────────────────────────────────────────────
if ! command -v pm2 &>/dev/null; then
  log_info "pm2 not found. Installing globally via pnpm..."
  pnpm add -g pm2
  log_ok "pm2 installed: $(pm2 --version)"
else
  log_ok "pm2 already installed: $(pm2 --version)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 5. Install Strapi dependencies
# ─────────────────────────────────────────────────────────────────────────────
log_info "Installing Strapi (cms-strapi) dependencies..."
cd "$ROOT_DIR/cms-strapi"
pnpm install
log_ok "Strapi dependencies installed."

# ─────────────────────────────────────────────────────────────────────────────
# 6. Validate cms-strapi/.env — NEVER overwrite existing!
# ─────────────────────────────────────────────────────────────────────────────
ENV_FILE="$ROOT_DIR/cms-strapi/.env"
REQUIRED_VARS=(
  DATABASE_HOST
  DATABASE_PORT
  DATABASE_NAME
  DATABASE_USERNAME
  DATABASE_PASSWORD
  APP_KEYS
  API_TOKEN_SALT
  ADMIN_JWT_SECRET
  JWT_SECRET
  TRANSFER_TOKEN_SALT
)

if [ ! -f "$ENV_FILE" ]; then
  log_error "cms-strapi/.env not found!
Please create it with the following variables:
  DATABASE_HOST=
  DATABASE_PORT=5432
  DATABASE_NAME=
  DATABASE_USERNAME=
  DATABASE_PASSWORD=
  APP_KEYS=  (comma-separated, e.g. key1,key2,key3,key4)
  API_TOKEN_SALT=
  ADMIN_JWT_SECRET=
  JWT_SECRET=
  TRANSFER_TOKEN_SALT=
  HOST=0.0.0.0
  PORT=3200

Then re-run this script."
fi

log_info "Validating cms-strapi/.env variables..."
MISSING_VARS=()
for VAR in "${REQUIRED_VARS[@]}"; do
  if ! grep -qE "^${VAR}=.+" "$ENV_FILE"; then
    MISSING_VARS+=("$VAR")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  log_error "The following required variables are missing or empty in cms-strapi/.env:
$(printf '  - %s\n' "${MISSING_VARS[@]}")
Please fill them in and re-run this script."
fi

log_ok "All required .env variables are present."

# Ensure HOST and PORT are set (non-critical, provide defaults if absent)
if ! grep -qE "^HOST=" "$ENV_FILE"; then
  echo "HOST=0.0.0.0" >> "$ENV_FILE"
  log_warn "Added HOST=0.0.0.0 to cms-strapi/.env"
fi
if ! grep -qE "^PORT=" "$ENV_FILE"; then
  echo "PORT=3200" >> "$ENV_FILE"
  log_warn "Added PORT=3200 to cms-strapi/.env"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 7. Ensure required directories exist
# ─────────────────────────────────────────────────────────────────────────────
log_info "Creating required directories..."
mkdir -p "$ROOT_DIR/cms-strapi/public/uploads"
mkdir -p "$ROOT_DIR/web-nextjs/public"
log_ok "Required directories created."

# ─────────────────────────────────────────────────────────────────────────────
# 8. Build Strapi admin panel
# ─────────────────────────────────────────────────────────────────────────────
log_info "Building Strapi admin panel..."
cd "$ROOT_DIR/cms-strapi"
pnpm build
log_ok "Strapi build complete."

# ─────────────────────────────────────────────────────────────────────────────
# 8. Install Next.js dependencies
# ─────────────────────────────────────────────────────────────────────────────
log_info "Installing Next.js (web-nextjs) dependencies..."
cd "$ROOT_DIR/web-nextjs"
pnpm install
log_ok "Next.js dependencies installed."

# ─────────────────────────────────────────────────────────────────────────────
# 9. Create web-nextjs/.env.local if not exists
# ─────────────────────────────────────────────────────────────────────────────
ENV_LOCAL="$ROOT_DIR/web-nextjs/.env.local"
if [ ! -f "$ENV_LOCAL" ]; then
  log_info "Creating web-nextjs/.env.local..."
  cat > "$ENV_LOCAL" << 'EOF'
STRAPI_URL=http://localhost:3200
STRAPI_API_TOKEN=
PORT=3201
EOF
  log_ok "web-nextjs/.env.local created."
else
  log_ok "web-nextjs/.env.local already exists — not overwriting."
fi

# ─────────────────────────────────────────────────────────────────────────────
# 10. Start Strapi temporarily (for Next.js build)
# ─────────────────────────────────────────────────────────────────────────────
log_info "Starting Strapi temporarily for Next.js build..."

# Kill any existing processes on port 3200
lsof -ti:3200 | xargs -r kill -9 || true
sleep 1

cd "$ROOT_DIR/cms-strapi"
NODE_ENV=production pnpm start &
STRAPI_PID=$!
log_info "Strapi started with PID $STRAPI_PID"

# ─────────────────────────────────────────────────────────────────────────────
# 11. Health check loop (/api/health, max 60 attempts, 2s interval)
# ─────────────────────────────────────────────────────────────────────────────
log_info "Waiting for Strapi to be ready..."
STRAPI_READY=false
for i in $(seq 1 60); do
  if curl -sf http://localhost:3200/api/health > /dev/null 2>&1; then
    STRAPI_READY=true
    log_ok "Strapi is ready! (attempt $i)"
    break
  fi
  echo -n "."
  sleep 2
done
echo ""

if [ "$STRAPI_READY" = false ]; then
  kill "$STRAPI_PID" 2>/dev/null || true
  log_error "Strapi failed to start after 120 seconds.
Check cms-strapi/.env and make sure PostgreSQL is running."
fi

# ─────────────────────────────────────────────────────────────────────────────
# 12. Build Next.js (while Strapi is running)
# ─────────────────────────────────────────────────────────────────────────────
log_info "Building Next.js..."
cd "$ROOT_DIR/web-nextjs"
pnpm build
log_ok "Next.js build complete."

# ─────────────────────────────────────────────────────────────────────────────
# 13. Kill Strapi after Next.js build
# ─────────────────────────────────────────────────────────────────────────────
log_info "Stopping temporary Strapi instance..."
kill "$STRAPI_PID" 2>/dev/null || true
lsof -ti:3200 | xargs -r kill -9 || true
log_ok "Strapi stopped."

# ─────────────────────────────────────────────────────────────────────────────
# 14. Success message
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Installation complete!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}NEXT STEPS:${NC}"
echo ""
echo -e "  1. ${YELLOW}Create Strapi admin account:${NC}"
echo -e "     Start dev: bash dev_all.sh"
echo -e "     Open: http://localhost:3200/admin"
echo -e "     Register your admin email + password"
echo ""
echo -e "  2. ${YELLOW}Create API Token:${NC}"
echo -e "     Strapi Admin → Settings → API Tokens → + Create new API Token"
echo -e "     Name: Next.js Frontend"
echo -e "     Token type: Read-only"
echo -e "     Click Save and COPY the generated token"
echo ""
echo -e "  3. ${YELLOW}Paste token into .env.local:${NC}"
echo -e "     Edit: web-nextjs/.env.local"
echo -e "     Set: STRAPI_API_TOKEN=<your-copied-token>"
echo ""
echo -e "  4. ${YELLOW}Development mode:${NC}"
echo -e "     bash dev_all.sh"
echo -e "     - Strapi: http://localhost:3200"
echo -e "     - Next.js: http://localhost:3201"
echo ""
echo -e "  5. ${YELLOW}Production mode (pm2):${NC}"
echo -e "     bash run_all.sh"
echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
