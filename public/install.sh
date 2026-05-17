#!/usr/bin/env bash
set -e

TATAI_VERSION="1.0.0"
INSTALL_DIR="$HOME/.tatai"
BIN_DIR="/usr/local/bin"
CLI_URL="https://www.tatai.cloud/tatai.js"
CLI_PATH="$INSTALL_DIR/tatai.js"
BIN_PATH="$BIN_DIR/tatai"

# ── Colours ────────────────────────────────────────────────────────────────────
PURPLE='\033[0;35m'
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
DIM='\033[2m'
NC='\033[0m'

print_logo() {
  echo ""
  echo -e "  ${PURPLE}${BOLD}████████╗ █████╗ ████████╗ █████╗ ██╗${NC}"
  echo -e "  ${PURPLE}${BOLD}   ██╔══╝██╔══██╗╚══██╔══╝██╔══██╗██║${NC}"
  echo -e "  ${PURPLE}${BOLD}   ██║   ███████║   ██║   ███████║██║${NC}"
  echo -e "  ${PURPLE}${BOLD}   ██║   ██╔══██║   ██║   ██╔══██║██║${NC}"
  echo -e "  ${PURPLE}${BOLD}   ██║   ██║  ██║   ██║   ██║  ██║██║${NC}"
  echo -e "  ${PURPLE}${BOLD}   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝${NC}"
  echo ""
  echo -e "  ${BOLD}tatAI CLI${NC} ${DIM}v${TATAI_VERSION} — Intelligence Unleashed${NC}"
  echo ""
}

step() { echo -e "  ${PURPLE}▶${NC} $1"; }
ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC}  $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; exit 1; }

# ── Check Node.js ──────────────────────────────────────────────────────────────
check_node() {
  if ! command -v node &>/dev/null; then
    fail "Node.js is required but not installed.\n\n  Install it from: https://nodejs.org  (v18 or later)\n  Then re-run this script."
  fi

  NODE_VER=$(node -e "process.stdout.write(process.version.slice(1).split('.')[0])")
  if [ "$NODE_VER" -lt 18 ]; then
    fail "Node.js v18+ is required. You have v${NODE_VER}.\n  Update at: https://nodejs.org"
  fi
  ok "Node.js v$(node --version | tr -d 'v') detected"
}

# ── Download CLI ───────────────────────────────────────────────────────────────
download_cli() {
  step "Downloading tatAI CLI..."
  mkdir -p "$INSTALL_DIR"

  if command -v curl &>/dev/null; then
    curl -fsSL "$CLI_URL" -o "$CLI_PATH"
  elif command -v wget &>/dev/null; then
    wget -qO "$CLI_PATH" "$CLI_URL"
  else
    fail "curl or wget is required to download tatAI."
  fi

  chmod +x "$CLI_PATH"
  ok "Downloaded to $CLI_PATH"
}

# ── Install symlink ────────────────────────────────────────────────────────────
install_bin() {
  # Try /usr/local/bin first; fall back to ~/bin
  if [ -w "$BIN_DIR" ]; then
    cat > "$BIN_PATH" <<EOF
#!/usr/bin/env bash
exec node "$CLI_PATH" "\$@"
EOF
    chmod +x "$BIN_PATH"
    ok "Installed at $BIN_PATH"
  else
    LOCAL_BIN="$HOME/.local/bin"
    mkdir -p "$LOCAL_BIN"
    BIN_PATH="$LOCAL_BIN/tatai"
    cat > "$BIN_PATH" <<EOF
#!/usr/bin/env bash
exec node "$CLI_PATH" "\$@"
EOF
    chmod +x "$BIN_PATH"
    ok "Installed at $BIN_PATH"

    # Check if on PATH
    if [[ ":$PATH:" != *":$LOCAL_BIN:"* ]]; then
      warn "$LOCAL_BIN is not on your PATH."
      echo ""
      echo -e "  Add this to your ${DIM}~/.zshrc${NC} or ${DIM}~/.bashrc${NC}:"
      echo -e "  ${DIM}export PATH=\"\$HOME/.local/bin:\$PATH\"${NC}"
      echo ""
    fi
  fi
}

# ── Done ───────────────────────────────────────────────────────────────────────
print_success() {
  echo ""
  echo -e "  ${GREEN}${BOLD}Installation complete!${NC}"
  echo ""
  echo -e "  Start coding with AI:"
  echo -e "  ${PURPLE}${BOLD}tatai${NC}                    ${DIM}# interactive session${NC}"
  echo -e "  ${PURPLE}${BOLD}tatai \"fix this bug\"${NC}      ${DIM}# one-shot prompt${NC}"
  echo -e "  ${PURPLE}${BOLD}tatai @src/app.ts${NC}         ${DIM}# include a file${NC}"
  echo ""
  echo -e "  ${DIM}Docs & login: https://www.tatai.cloud${NC}"
  echo ""
}

# ── Main ───────────────────────────────────────────────────────────────────────
print_logo
check_node
download_cli
install_bin
print_success
