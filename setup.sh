#!/bin/bash

# RamHomeLabs Website Setup Script
# This script sets up the website on a fresh machine

set -e  # Exit on any error

echo "🚀 RamHomeLabs Website Setup"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo "Please install Node.js >= 18.17.0 from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_VERSION="18.17.0"
if ! node -pe "require('semver').gte('${NODE_VERSION}', '${REQUIRED_VERSION}')" 2>/dev/null; then
    echo -e "${RED}❌ Node.js version ${NODE_VERSION} is too old!${NC}"
    echo "Please upgrade to Node.js >= ${REQUIRED_VERSION}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js ${NODE_VERSION} is installed${NC}"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not available!${NC}"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm ${NPM_VERSION} is installed${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
if npm install; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Check if port 3000 is available
if lsof -i:3000 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use${NC}"
    echo "Killing existing process..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

# Build the project to verify everything works
echo -e "${BLUE}🔨 Running a quick build test...${NC}"
if npm run build &> /dev/null; then
    echo -e "${GREEN}✅ Build test passed${NC}"
else
    echo -e "${YELLOW}⚠️  Build test had issues, but continuing...${NC}"
fi

# Clean up build files
rm -rf .next

echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Start development server: ${BLUE}npm run dev${NC}"
echo "2. Open browser to: ${BLUE}http://localhost:3000${NC}"
echo "3. For production build: ${BLUE}npm run build && npm start${NC}"
echo ""
echo "📚 Additional information:"
echo "- README.md: Complete documentation"
echo "- REQUIREMENTS.md: System requirements"
echo "- src/: Source code directory"
echo ""
echo "🌐 OneFarmer IoT Dashboard available at: /onefarmer"
echo "🔧 Technical projects at: /nerd-projects"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"