#!/bin/bash

# Database Initialization Script for My Micro Workouts
# This script helps you set up the D1 database for local development or production

set -e

echo "🗄️  My Micro Workouts - Database Setup"
echo "======================================"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: Wrangler CLI is not installed."
    echo "Please install it with: npm install -g wrangler"
    exit 1
fi

echo "✓ Wrangler CLI found"
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
    if wrangler d1 list | grep -q "$DB_NAME"; then
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
    wrangler d1 execute $DB_NAME --local --file=./db/schema.sql
else
    wrangler d1 execute $DB_NAME --file=./db/schema.sql
fi

echo ""
echo "✅ Database setup complete!"
echo ""

# Verify tables were created
echo "🔍 Verifying tables..."
echo ""

if [ "$ENV" = "local" ]; then
    wrangler d1 execute $DB_NAME --local --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
else
    wrangler d1 execute $DB_NAME --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
fi

echo ""
echo "✨ All done! Your database is ready to use."
echo ""

if [ "$ENV" = "local" ]; then
    echo "Start the development server with: npm run dev"
else
    echo "Deploy to production with: npm run deploy"
fi
