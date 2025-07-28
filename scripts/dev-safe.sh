#!/bin/bash

# Development Server Safe Startup Script
# This script ensures only one development server runs at a time

set -e

echo "🚀 Starting development server safely..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Run the process check script
echo "🔍 Checking for existing processes..."
node scripts/check-dev-processes.js

# If the check script exits successfully, start the dev server
if [ $? -eq 0 ]; then
    echo "✅ Starting development server..."
    pnpm dev
else
    echo "❌ Process check failed. Please resolve conflicts manually."
    exit 1
fi
