#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

BFF_DIR="$PROJECT_ROOT/apps/bff"
LIBS_CONFIG_DIR="$PROJECT_ROOT/libs/configuration/src/lib"

# ── Case conversion helpers ──────────────────────────────────────────────────

to_pascal_case() {
    local result=""
    IFS='-' read -ra parts <<< "$1"
    for part in "${parts[@]}"; do
        result+="${part^}"
    done
    echo "$result"
}

to_screaming_snake() {
    echo "$1" | tr '-' '_' | tr '[:lower:]' '[:upper:]'
}

to_title_case() {
    local result=""
    IFS='-' read -ra parts <<< "$1"
    for part in "${parts[@]}"; do
        result+="${part^} "
    done
    echo "${result% }"
}

validate_kebab_case() {
    [[ "$1" =~ ^[a-z][a-z0-9]*(-[a-z0-9]+)*$ ]]
}

sedi() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "$@"
    else
        sed -i "$@"
    fi
}

# ── Main ─────────────────────────────────────────────────────────────────────

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════╗"
echo "║   NestJS App Generator (from BFF template)  ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

if [ ! -d "$BFF_DIR" ]; then
    echo -e "${RED}Error: BFF template not found at apps/bff/${NC}"
    exit 1
fi

# ── Prompt for app name ──────────────────────────────────────────────────────

while true; do
    read -rp "$(echo -e "${YELLOW}Enter app name (kebab-case, e.g. user-service, gateway):${NC} ")" APP_NAME

    if [ -z "$APP_NAME" ]; then
        echo -e "${RED}  App name cannot be empty.${NC}"
        continue
    fi

    if [ "$APP_NAME" = "bff" ]; then
        echo -e "${RED}  Cannot use 'bff' — it's the template itself.${NC}"
        continue
    fi

    if validate_kebab_case "$APP_NAME"; then
        break
    else
        echo -e "${RED}  Invalid! Must be kebab-case: lowercase letters, numbers, hyphens.${NC}"
        echo -e "${RED}  Examples: user-service, gateway, invoice-processor${NC}"
    fi
done

# ── Derive all case variants ─────────────────────────────────────────────────

KEBAB="$APP_NAME"
PASCAL=$(to_pascal_case "$KEBAB")
SCREAMING_SNAKE=$(to_screaming_snake "$KEBAB")
TITLE=$(to_title_case "$KEBAB")

echo ""
echo -e "${CYAN}Name variants that will be used:${NC}"
echo -e "  kebab-case            →  ${GREEN}${KEBAB}${NC}              (folders, files, tags)"
echo -e "  PascalCase            →  ${GREEN}${PASCAL}${NC}              (class names)"
echo -e "  SCREAMING_SNAKE_CASE  →  ${GREEN}${SCREAMING_SNAKE}${NC}              (constants)"
echo -e "  Title Case            →  ${GREEN}${TITLE}${NC}              (Swagger docs)"
echo ""

# ── Pre-flight checks ────────────────────────────────────────────────────────

APP_DIR="$PROJECT_ROOT/apps/$KEBAB"
ENV_CONFIG="$LIBS_CONFIG_DIR/${KEBAB}-env.config.ts"

ERRORS=0

if [ -d "$APP_DIR" ]; then
    echo -e "${RED}  ✗ apps/${KEBAB}/ already exists${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "$ENV_CONFIG" ]; then
    echo -e "${RED}  ✗ libs/configuration/src/lib/${KEBAB}-env.config.ts already exists${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ "$ERRORS" -gt 0 ]; then
    echo ""
    echo -e "${RED}Aborting due to conflicts above.${NC}"
    exit 1
fi

# ── Confirm ──────────────────────────────────────────────────────────────────

echo -e "${BOLD}The following will be created:${NC}"
echo -e "  ${CYAN}apps/${KEBAB}/${NC}                                    (app directory)"
echo -e "  ${CYAN}libs/configuration/src/lib/${KEBAB}-env.config.ts${NC}  (env config)"
echo ""
read -rp "$(echo -e "${YELLOW}Proceed? (y/N):${NC} ")" CONFIRM
if [[ ! "$CONFIRM" =~ ^[yY]$ ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 0
fi

echo ""

# ── Step 1: Copy app directory ───────────────────────────────────────────────

echo -e "${YELLOW}[1/4]${NC} Copying app template..."
cp -r "$BFF_DIR" "$APP_DIR"
rm -f "$APP_DIR/.env"

# ── Step 2: Copy & rename env config in libs ─────────────────────────────────

echo -e "${YELLOW}[2/4]${NC} Creating environment configuration..."
cp "$LIBS_CONFIG_DIR/bff-env.config.ts" "$ENV_CONFIG"

# ── Step 3: Replace all references ───────────────────────────────────────────

echo -e "${YELLOW}[3/4]${NC} Replacing references..."

# --- libs env config: class name ---
sedi "s|BffEnvConfiguration|${PASCAL}EnvConfiguration|g" "$ENV_CONFIG"

# --- project.json: name, paths, build targets (all are kebab) ---
sedi "s|bff|${KEBAB}|g" "$APP_DIR/project.json"

# --- webpack.config.js: output path ---
sedi "s|apps/bff|apps/${KEBAB}|g" "$APP_DIR/webpack.config.js"

# --- .env.example: service name ---
sedi "s|bff-service|${KEBAB}-service|g" "$APP_DIR/.env.example"

# --- src/main.ts (order: longest match first to avoid partial replacements) ---
sedi "s|BFF_CONFIG|${SCREAMING_SNAKE}_CONFIG|g"                      "$APP_DIR/src/main.ts"
sedi "s|'BFF API documentation'|'${TITLE} API documentation'|g"      "$APP_DIR/src/main.ts"
sedi "s|'BFF API'|'${TITLE} API'|g"                                  "$APP_DIR/src/main.ts"
sedi "s|addTag('bff')|addTag('${KEBAB}')|g"                          "$APP_DIR/src/main.ts"

# --- src/configuration/index.ts: imports, class, constant ---
sedi "s|BffEnvConfiguration|${PASCAL}EnvConfiguration|g"             "$APP_DIR/src/configuration/index.ts"
sedi "s|bff-env.config|${KEBAB}-env.config|g"                       "$APP_DIR/src/configuration/index.ts"
sedi "s|BFF_CONFIG|${SCREAMING_SNAKE}_CONFIG|g"                      "$APP_DIR/src/configuration/index.ts"

# --- src/app/app.module.ts: config constant ---
sedi "s|BFF_CONFIG|${SCREAMING_SNAKE}_CONFIG|g"                      "$APP_DIR/src/app/app.module.ts"

# Create .env from .env.example for immediate use
cp "$APP_DIR/.env.example" "$APP_DIR/.env"

# ── Step 4: Reset Nx daemon to pick up the new project ──────────────────────

echo -e "${YELLOW}[4/4]${NC} Resetting Nx daemon..."
cd "$PROJECT_ROOT"
npx nx reset > /dev/null 2>&1 || true

# ── Done ─────────────────────────────────────────────────────────────────────

echo ""
echo -e "${GREEN}${BOLD}"
echo "╔══════════════════════════════════════════════╗"
echo "║         App created successfully!            ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "  ${BOLD}App directory${NC}    apps/${KEBAB}/"
echo -e "  ${BOLD}Env config${NC}       libs/configuration/src/lib/${KEBAB}-env.config.ts"
echo -e "  ${BOLD}Environment${NC}      apps/${KEBAB}/.env  ${CYAN}(copied from .env.example)${NC}"
echo ""
echo -e "${YELLOW}${BOLD}Next steps:${NC}"
echo -e "  1. Update port numbers in ${CYAN}apps/${KEBAB}/.env${NC} to avoid conflicts with other services"
echo -e "  2. Customize env variables in ${CYAN}libs/configuration/src/lib/${KEBAB}-env.config.ts${NC}"
echo -e "  3. Start developing: ${CYAN}npx nx serve ${KEBAB}${NC}"
echo ""
echo -e "  ${BOLD}Note:${NC} Nx auto-discovers the new app via project.json — no workspace registration needed."
echo ""
