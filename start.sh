#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored messages
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if node_modules exists
check_dependencies() {
    local dir=$1
    if [ ! -d "$dir/node_modules" ]; then
        return 1
    fi
    return 0
}

# Main script
main() {
    print_info "Sky Light - Starting development servers..."
    echo ""

    # Check for Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi

    # Check Node version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    print_success "Node.js $(node -v) detected"

    # Check for npm
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    print_success "npm $(npm -v) detected"

    # Check if dependencies are installed
    NEEDS_INSTALL=false

    if ! check_dependencies "."; then
        print_warning "Root dependencies not found"
        NEEDS_INSTALL=true
    fi

    if ! check_dependencies "packages/shared-types"; then
        print_warning "Shared types dependencies not found"
        NEEDS_INSTALL=true
    fi

    if ! check_dependencies "apps/backend"; then
        print_warning "Backend dependencies not found"
        NEEDS_INSTALL=true
    fi

    if ! check_dependencies "apps/frontend"; then
        print_warning "Frontend dependencies not found"
        NEEDS_INSTALL=true
    fi

    # Install dependencies if needed
    if [ "$NEEDS_INSTALL" = true ]; then
        print_info "Installing dependencies..."
        npm install
        
        if [ $? -eq 0 ]; then
            print_success "Dependencies installed successfully"
        else
            print_error "Failed to install dependencies"
            exit 1
        fi
    else
        print_success "All dependencies are installed"
    fi

    # Check if ports are available
    check_port() {
        local port=$1
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            return 1
        fi
        return 0
    }

    if ! check_port 3000; then
        print_error "Port 3000 is already in use. Please free it before starting the backend."
        exit 1
    fi

    if ! check_port 5173; then
        print_error "Port 5173 is already in use. Please free it before starting the frontend."
        exit 1
    fi

    print_success "Ports 3000 and 5173 are available"
    echo ""

    # Start the servers
    print_info "Starting backend and frontend servers..."
    print_info "Backend: http://localhost:3000"
    print_info "Frontend: http://localhost:5173"
    echo ""
    print_warning "Press Ctrl+C to stop all servers"
    echo ""

    # Run both servers concurrently
    npm run dev
}

# Cleanup function
cleanup() {
    echo ""
    print_info "Shutting down servers..."
    print_success "Servers stopped"
    exit 0
}

# Trap Ctrl+C to cleanup
trap cleanup INT TERM

# Run main function
main

