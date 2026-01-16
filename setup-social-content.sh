#!/bin/bash

# Social Content AI Management System - Setup Script
# This script automates the initial setup process

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Social Content AI Management System - Setup               ║"
echo "║  Configuration & Installation Assistant                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check Node.js version
check_node_version() {
    echo ""
    echo "📦 Checking Node.js version..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        echo "   Please install Node.js v18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v)
    print_success "Node.js $NODE_VERSION found"
}

# Check npm version
check_npm_version() {
    echo ""
    echo "📦 Checking npm version..."
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    NPM_VERSION=$(npm -v)
    print_success "npm $NPM_VERSION found"
}

# Check PostgreSQL
check_postgresql() {
    echo ""
    echo "🗄️  Checking PostgreSQL..."
    
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL client not found locally"
        echo "   This is okay if using managed PostgreSQL (e.g., Neon, AWS RDS)"
    else
        PSQL_VERSION=$(psql --version)
        print_success "$PSQL_VERSION found"
    fi
}

# Create environment file
setup_env_file() {
    echo ""
    echo "🔐 Setting up environment variables..."
    
    if [ -f ".env.local" ]; then
        print_warning ".env.local already exists"
        read -p "Overwrite? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Skipping .env.local setup"
            return
        fi
    fi
    
    # Copy template
    cp ".env.social-content.example" ".env.local" 2>/dev/null || {
        print_error "Could not find .env.social-content.example"
        exit 1
    }
    
    print_success ".env.local created from template"
    
    # Prompt for values
    echo ""
    print_info "Please fill in the following values in .env.local:"
    echo ""
    echo "1. OPENAI_API_KEY"
    echo "   Get from: https://platform.openai.com/api-keys"
    echo ""
    echo "2. FACEBOOK_APP_ID & FACEBOOK_APP_SECRET"
    echo "   Get from: https://developers.facebook.com/apps/"
    echo ""
    echo "3. DATABASE_URL"
    echo "   Format: postgresql://user:password@host/database"
    echo "   Example: postgresql://user:pass@db.neon.tech/dbname"
    echo ""
    echo "4. CRON_SECRET"
    echo "   Generate: openssl rand -base64 32"
    echo ""
    
    # Generate CRON_SECRET
    print_info "Generating CRON_SECRET..."
    CRON_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "REPLACE_WITH_RANDOM_SECRET")
    
    # Try to update .env.local (basic sed replacement)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/CRON_SECRET=.*/CRON_SECRET=$CRON_SECRET/" ".env.local" 2>/dev/null || true
    else
        # Linux
        sed -i "s/CRON_SECRET=.*/CRON_SECRET=$CRON_SECRET/" ".env.local" 2>/dev/null || true
    fi
    
    print_success "CRON_SECRET generated: ${CRON_SECRET:0:20}..."
}

# Install dependencies
install_dependencies() {
    echo ""
    echo "📦 Installing dependencies..."
    
    if [ -f "node_modules/.package-lock.json" ] || [ -f "package-lock.json" ] || [ -f "pnpm-lock.yaml" ]; then
        print_warning "node_modules may already exist"
        read -p "Reinstall? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Skipping installation"
            return
        fi
    fi
    
    # Use npm
    npm install
    
    print_success "Dependencies installed"
}

# Check database connection
check_database_connection() {
    echo ""
    echo "🗄️  Checking database connection..."
    
    if [ -z "$DATABASE_URL" ]; then
        print_warning "DATABASE_URL not set in environment"
        echo "   Set it in .env.local and try again"
        return
    fi
    
    # Try to connect
    if psql "$DATABASE_URL" -c "SELECT 1" &>/dev/null; then
        print_success "Database connection successful"
    else
        print_warning "Could not connect to database"
        echo "   Verify DATABASE_URL is correct"
    fi
}

# Run database migration
run_migration() {
    echo ""
    echo "🗄️  Running database migration..."
    
    if [ ! -f "scripts/04-create-social-content-table.sql" ]; then
        print_error "Migration file not found: scripts/04-create-social-content-table.sql"
        return
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        print_warning "DATABASE_URL not set"
        echo "   Set DATABASE_URL in .env.local to run migration"
        echo "   Then run: psql \$DATABASE_URL < scripts/04-create-social-content-table.sql"
        return
    fi
    
    read -p "Run migration now? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Skipping migration"
        print_warning "Remember to run migration manually:"
        echo "   psql \$DATABASE_URL < scripts/04-create-social-content-table.sql"
        return
    fi
    
    if psql "$DATABASE_URL" < "scripts/04-create-social-content-table.sql"; then
        print_success "Database migration completed"
    else
        print_error "Migration failed"
        echo "   Check DATABASE_URL and try again manually"
    fi
}

# Verify installation
verify_installation() {
    echo ""
    echo "✓ Verifying installation..."
    
    # Check files
    FILES=(
        "app/api/social-content/route.ts"
        "app/api/social-accounts/route.ts"
        "app/api/social-automation/route.ts"
        "app/api/social-content/post/route.ts"
        "app/api/cron/social-content/route.ts"
        "app/admin/social-content/page.tsx"
        "components/social-content-editor.tsx"
        "lib/social-automation-worker.ts"
        "lib/social-content-utils.ts"
        "lib/social-content-debug.ts"
        "scripts/04-create-social-content-table.sql"
        ".env.local"
        "vercel.json"
    )
    
    MISSING=0
    for file in "${FILES[@]}"; do
        if [ -f "$file" ]; then
            print_success "Found: $file"
        else
            print_warning "Missing: $file"
            ((MISSING++))
        fi
    done
    
    echo ""
    if [ $MISSING -eq 0 ]; then
        print_success "All files present"
    else
        print_warning "$MISSING file(s) missing"
    fi
}

# Print next steps
print_next_steps() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  Setup Complete! 🎉                                        ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. Update .env.local with your API keys:"
    echo "   - OPENAI_API_KEY"
    echo "   - FACEBOOK_APP_ID"
    echo "   - FACEBOOK_APP_SECRET"
    echo "   - DATABASE_URL"
    echo ""
    echo "2. Run database migration (if not done):"
    echo "   psql \$DATABASE_URL < scripts/04-create-social-content-table.sql"
    echo ""
    echo "3. Start development server:"
    echo "   npm run dev"
    echo ""
    echo "4. Access admin panel:"
    echo "   http://localhost:3000/admin/social-content"
    echo ""
    echo "📚 Documentation:"
    echo "   - Quick Start: SOCIAL_CONTENT_QUICKSTART.md"
    echo "   - Full Guide: SOCIAL_CONTENT_GUIDE.md"
    echo "   - README: README_SOCIAL_CONTENT.md"
    echo ""
    echo "🚀 Deploy to Vercel:"
    echo "   1. Push to GitHub"
    echo "   2. Import in Vercel dashboard"
    echo "   3. Add environment variables"
    echo "   4. Deploy"
    echo ""
}

# Main execution
main() {
    check_node_version
    check_npm_version
    check_postgresql
    setup_env_file
    install_dependencies
    check_database_connection
    run_migration
    verify_installation
    print_next_steps
    
    echo ""
    print_success "Setup script completed!"
    echo ""
}

# Run main function
main
