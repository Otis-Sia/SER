#!/usr/bin/env bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ensure NVM / Node is in PATH if present
if [ -d "$HOME/.nvm/versions/node" ]; then
  LATEST_NODE=$(ls -d "$HOME/.nvm/versions/node"/* 2>/dev/null | tail -n 1)
  if [ -n "$LATEST_NODE" ]; then
    export PATH="$LATEST_NODE/bin:$PATH"
  fi
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_ENV="$ROOT_DIR/server/.env"
CLIENT_ENV="$ROOT_DIR/client/.env.local"

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}   Cloudflare Full Deployment Script (CLI)    ${NC}"
echo -e "${BLUE}===============================================${NC}"

# 1. Check Wrangler authentication
echo -e "\n${YELLOW}[1/4] Checking Cloudflare Authentication...${NC}"
if ! npx wrangler whoami >/dev/null 2>&1; then
  echo -e "${YELLOW}Please log in to Cloudflare...${NC}"
  npx wrangler login
else
  echo -e "${GREEN}✓ Authenticated with Cloudflare!${NC}"
fi

# Function to safely parse and upload env file secrets to wrangler
upload_secrets_from_env() {
  local env_file="$1"
  local target_dir="$2"

  if [ ! -f "$env_file" ]; then
    echo -e "${YELLOW}Warning: $env_file not found. Skipping secret sync.${NC}"
    return 0
  fi

  echo -e "${BLUE}Uploading secrets from $(basename "$env_file") to $(basename "$target_dir")...${NC}"
  cd "$target_dir"

  # Read line by line, handling quotes and skipping comments / empty lines
  while IFS= read -r line || [ -n "$line" ]; do
    # Strip carriage returns
    line=$(echo "$line" | tr -d '\r')
    
    # Skip comments and empty lines
    if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "${line// }" ]]; then
      continue
    fi

    # Extract key and value
    if [[ "$line" =~ ^([A-Za-z0-9_]+)=(.*)$ ]]; then
      key="${BASH_REMATCH[1]}"
      val="${BASH_REMATCH[2]}"

      # Remove wrapping quotes if present
      val=$(echo "$val" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

      # Skip common local-only / non-secret variables if needed
      if [[ "$key" == "PORT" ]]; then
        continue
      fi

      echo -n "  • Setting secret: $key ... "
      if printf "%s" "$val" | npx wrangler secret put "$key" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
      else
        echo -e "${YELLOW}(skipped or unchanged)${NC}"
      fi
    fi
  done < "$env_file"

  cd "$ROOT_DIR"
}

# 2. Deploy Backend Worker & Sync Secrets
echo -e "\n${YELLOW}[2/4] Deploying Backend Worker (worker/)...${NC}"
upload_secrets_from_env "$SERVER_ENV" "$ROOT_DIR/worker"

cd "$ROOT_DIR/worker"
echo -e "${BLUE}Deploying worker...${NC}"
WORKER_DEPLOY_OUTPUT=$(npx wrangler deploy 2>&1)
echo "$WORKER_DEPLOY_OUTPUT"

# Extract deployed worker URL (https://*.workers.dev or custom route)
WORKER_URL=$(echo "$WORKER_DEPLOY_OUTPUT" | grep -o -E 'https://[^ ]+\.workers\.dev' | head -n 1 || true)
if [ -z "$WORKER_URL" ]; then
  WORKER_URL=$(echo "$WORKER_DEPLOY_OUTPUT" | grep -o -E 'https://[^ ]+' | tail -n 1 || echo "Deployed to Cloudflare Workers")
fi
cd "$ROOT_DIR"

# 3. Deploy Frontend Client & Sync Secrets
echo -e "\n${YELLOW}[3/4] Building & Deploying Next.js Client (client/)...${NC}"
upload_secrets_from_env "$CLIENT_ENV" "$ROOT_DIR/client"

# If we captured the worker URL, optionally update NEXT_PUBLIC_API_URL on the client
if [[ "$WORKER_URL" =~ ^https:// ]]; then
  echo -e "  • Setting NEXT_PUBLIC_API_URL -> $WORKER_URL on client..."
  cd "$ROOT_DIR/client"
  printf "%s" "$WORKER_URL" | npx wrangler secret put NEXT_PUBLIC_API_URL >/dev/null 2>&1 || true
  cd "$ROOT_DIR"
fi

cd "$ROOT_DIR/client"
echo -e "${BLUE}Building OpenNext bundle and deploying client...${NC}"
npx opennextjs-cloudflare build
CLIENT_DEPLOY_OUTPUT=$(npx wrangler deploy 2>&1)
echo "$CLIENT_DEPLOY_OUTPUT"

# Extract deployed client URL
CLIENT_URL=$(echo "$CLIENT_DEPLOY_OUTPUT" | grep -o -E 'https://[^ ]+\.workers\.dev|https://[^ ]+\.pages\.dev' | head -n 1 || true)
if [ -z "$CLIENT_URL" ]; then
  CLIENT_URL=$(echo "$CLIENT_DEPLOY_OUTPUT" | grep -o -E 'https://[^ ]+' | tail -n 1 || echo "Deployed to Cloudflare")
fi
cd "$ROOT_DIR"

# 4. Display Deployed Links
echo -e "\n${GREEN}===============================================${NC}"
echo -e "${GREEN}           🎉 DEPLOYMENT SUCCESSFUL!          ${NC}"
echo -e "${GREEN}===============================================${NC}"
echo -e "🌐 ${GREEN}Website (Client):${NC}  $CLIENT_URL"
echo -e "⚡ ${BLUE}API (Worker):${NC}      $WORKER_URL"
echo -e "${GREEN}===============================================${NC}\n"
