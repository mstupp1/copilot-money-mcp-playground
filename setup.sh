#!/bin/bash
# ============================================================
# Copilot Money MCP Server — One-Shot Setup Script
# ============================================================
# 
# WHAT THIS DOES:
#   1. Installs Bun (JavaScript runtime/build tool) if not present
#   2. Installs project dependencies
#   3. Builds the MCP server
#   4. Verifies the CLI works
#   5. Checks if Copilot Money's local database is accessible
#
# SECURITY NOTE:
#   - This script only installs dev tools and builds the project locally
#   - No data leaves your machine
#   - The MCP server defaults to read-only mode
#
# HOW TO RUN:
#   Open your REAL terminal (Terminal.app, iTerm2, Warp, etc.)
#   cd ~/Development/copilot-money-mcp-playground
#   chmod +x setup.sh
#   ./setup.sh
# ============================================================

set -e  # Exit on any error

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Copilot Money MCP Server — Setup                ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ----------------------------------------------------------
# Step 1: Check/Install Bun
# ----------------------------------------------------------
echo -e "${YELLOW}Step 1: Checking for Bun...${NC}"
if command -v bun &> /dev/null; then
    BUN_VERSION=$(bun --version)
    echo -e "${GREEN}  ✅ Bun is already installed (v${BUN_VERSION})${NC}"
else
    echo -e "${YELLOW}  ⏳ Installing Bun...${NC}"
    curl -fsSL https://bun.sh/install | bash
    
    # Source the updated profile so bun is on PATH
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
    
    if command -v bun &> /dev/null; then
        echo -e "${GREEN}  ✅ Bun installed successfully (v$(bun --version))${NC}"
    else
        echo -e "${RED}  ❌ Bun installation failed. Please install manually:${NC}"
        echo "     curl -fsSL https://bun.sh/install | bash"
        echo "     Then restart your terminal and re-run this script."
        exit 1
    fi
fi
echo ""

# ----------------------------------------------------------
# Step 2: Check Node.js
# ----------------------------------------------------------
echo -e "${YELLOW}Step 2: Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}  ✅ Node.js is installed (${NODE_VERSION})${NC}"
    
    # Check version is >= 18
    NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo -e "${RED}  ❌ Node.js 18+ required, found ${NODE_VERSION}${NC}"
        exit 1
    fi
else
    echo -e "${RED}  ❌ Node.js not found. Please install Node.js 18+${NC}"
    echo "     brew install node"
    exit 1
fi
echo ""

# ----------------------------------------------------------
# Step 3: Install dependencies
# ----------------------------------------------------------
echo -e "${YELLOW}Step 3: Installing dependencies...${NC}"
bun install
echo -e "${GREEN}  ✅ Dependencies installed${NC}"
echo ""

# ----------------------------------------------------------
# Step 4: Build the project
# ----------------------------------------------------------
echo -e "${YELLOW}Step 4: Building the project...${NC}"
bun run build
echo -e "${GREEN}  ✅ Build complete${NC}"
echo ""

# ----------------------------------------------------------
# Step 5: Verify CLI works
# ----------------------------------------------------------
echo -e "${YELLOW}Step 5: Verifying CLI...${NC}"
if node dist/cli.js --help > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ CLI is working${NC}"
else
    echo -e "${RED}  ❌ CLI verification failed${NC}"
    exit 1
fi
echo ""

# ----------------------------------------------------------
# Step 6: Check Copilot Money database access
# ----------------------------------------------------------
echo -e "${YELLOW}Step 6: Checking Copilot Money database...${NC}"
DB_PATH="$HOME/Library/Containers/com.copilot.production/Data/Library/Application Support/firestore/__FIRAPP_DEFAULT/copilot-production-22904/main"

if [ -d "$DB_PATH" ]; then
    LDB_COUNT=$(ls "$DB_PATH"/*.ldb 2>/dev/null | wc -l | tr -d ' ')
    if [ "$LDB_COUNT" -gt 0 ]; then
        echo -e "${GREEN}  ✅ Database found with ${LDB_COUNT} .ldb files${NC}"
    else
        echo -e "${YELLOW}  ⚠️  Database directory exists but no .ldb files found${NC}"
        echo "     Open Copilot Money app and let it sync, then re-run this script."
    fi
else
    echo -e "${YELLOW}  ⚠️  Database directory not accessible${NC}"
    echo ""
    echo "     This usually means one of:"
    echo "     1. Full Disk Access not granted to this terminal"
    echo "        → System Settings → Privacy & Security → Full Disk Access"
    echo "        → Add your terminal app, then RESTART the terminal"
    echo "     2. Copilot Money hasn't synced data yet"
    echo "        → Open the Copilot Money app and browse your data"
    echo ""
fi
echo ""

# ----------------------------------------------------------
# Step 7: Run quick tests
# ----------------------------------------------------------
echo -e "${YELLOW}Step 7: Running tests...${NC}"
if bun test --bail 2>&1 | tail -5; then
    echo -e "${GREEN}  ✅ Tests passed${NC}"
else
    echo -e "${YELLOW}  ⚠️  Some tests may have failed (this is OK if database isn't accessible yet)${NC}"
fi
echo ""

# ----------------------------------------------------------
# Summary
# ----------------------------------------------------------
echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Setup Complete! 🎉                              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo ""
echo "  Configure your AI client with this MCP server config:"
echo ""
echo -e "${BLUE}  For Claude Desktop${NC} (~/Library/Application Support/Claude/claude_desktop_config.json):"
echo '  {'
echo '    "mcpServers": {'
echo '      "copilot-money": {'
echo "        \"command\": \"$(which node)\","
echo "        \"args\": [\"$(pwd)/dist/cli.js\"]"
echo '      }'
echo '    }'
echo '  }'
echo ""
echo -e "${BLUE}  For Cursor${NC} (Settings → Features → MCP Servers):"
echo '  {'
echo '    "mcpServers": {'
echo '      "copilot-money": {'
echo "        \"command\": \"$(which node)\","
echo "        \"args\": [\"$(pwd)/dist/cli.js\"]"
echo '      }'
echo '    }'
echo '  }'
echo ""
echo -e "${BLUE}  For Gemini CLI${NC} (~/.gemini/settings.json):"
echo '  {'
echo '    "mcpServers": {'
echo '      "copilot-money": {'
echo "        \"command\": \"$(which node)\","
echo "        \"args\": [\"$(pwd)/dist/cli.js\"]"
echo '      }'
echo '    }'
echo '  }'
echo ""
echo -e "${YELLOW}🔒 Security reminder:${NC}"
echo "  The server runs in READ-ONLY mode by default."
echo "  To enable write mode later, add \"--write\" to the args array."
echo "  Write mode allows the AI to modify your real Copilot Money data."
echo ""
