#!/bin/bash

# ============================================
# Ayvlo Quick Start Script
# ============================================
# Runs the application with one command
# Usage: bash run.sh
# ============================================

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
   ___             __
  / _ | __ _____  / /____
 / __ |/ // / _ \/ / __  /
/_/ |_|\_, /\___/_/\____/
      /___/

Starting Ayvlo...
EOF
echo -e "${NC}"

# Check if setup has been run
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠ First time setup required!${NC}"
    echo -e "Running setup script...\n"
    bash setup.sh
    echo -e "\n"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    pnpm install
fi

# Start the development server
echo -e "${GREEN}Starting development server...${NC}"
echo -e "${BLUE}→ http://localhost:3000${NC}\n"

pnpm dev
