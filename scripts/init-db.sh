#!/bin/bash

# Database Initialization Script for My Micro Workouts
# This script helps you set up the D1 database for local development or production

set -e

echo "🗄️  My Micro Workouts - Database Setup"
echo "======================================"
echo ""

# Prefer local wrangler from node_modules, fall back to global
if [ -x "./node_modules/.bin/wrangler" ]; then
    WRANGLER="./node_modules/.bin/wrangler"
elif command -v wrangler &> /dev/null; then
    WRANGLER="wrangler"
else
    echo "❌ Error: Wrangler CLI is not installed."
    echo "Please run: npm install"
    exit 1
fi

echo "✓ Wrangler CLI found ($WRANGLER)"
echo ""

# Parse command line arguments
ENV=${1:-local}

if [ "$ENV" != "local" ] && [ "$ENV" != "production" ]; then
    echo "Usage: $0 [local|production]"
    echo "  local      - Set up local development database (default)"
    echo "  production - Set up production database"
    exit 1
fi

echo "📝 Environment: $ENV"
echo ""

# Check if database exists
DB_NAME="mymicroworkouts-db"

if [ "$ENV" = "production" ]; then
    echo "🔍 Checking if database '$DB_NAME' exists..."
    
    # List databases and check if ours exists
    if $WRANGLER d1 list | grep -q "$DB_NAME"; then
        echo "✓ Database '$DB_NAME' already exists"
    else
        echo "❌ Database '$DB_NAME' not found"
        echo ""
        echo "Please create the database first:"
        echo "  wrangler d1 create $DB_NAME"
        echo ""
        echo "Then update wrangler.toml with the database_id"
        exit 1
    fi
fi

echo ""
echo "🚀 Running database migration..."
echo ""

if [ "$ENV" = "local" ]; then
    $WRANGLER d1 execute $DB_NAME --local --file=./db/schema.sql
else
    $WRANGLER d1 execute $DB_NAME --file=./db/schema.sql
fi

echo ""
echo "✅ Database setup complete!"
echo ""

# Verify tables were created
echo "🔍 Verifying tables..."
echo ""

if [ "$ENV" = "local" ]; then
    $WRANGLER d1 execute $DB_NAME --local --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
else
    $WRANGLER d1 execute $DB_NAME --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
fi

echo ""
echo "✨ All done! Your database is ready to use."
echo ""

if [ "$ENV" = "local" ]; then
    echo "Start the development server with: npm run dev"
else
    echo "Deploy to production with: npm run deploy"
fi
