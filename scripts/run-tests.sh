#!/bin/bash

# Chat UI Test Runner
# Runs all test suites for the chat functionality

set -e

echo "🧪 Starting Chat UI Test Suite"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if dependencies are installed
print_status "Checking dependencies..."
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install pnpm first."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    pnpm install
fi

# Create test results directory
mkdir -p test-results

# Initialize test results
UNIT_TESTS_PASSED=false
E2E_TESTS_PASSED=false
VISUAL_TESTS_PASSED=false

echo ""
print_status "🎯 Running Unit & Component Tests..."
echo "======================================"

if pnpm test --coverage --passWithNoTests 2>&1 | tee test-results/unit-tests.log; then
    print_success "Unit & Component tests passed!"
    UNIT_TESTS_PASSED=true
else
    print_error "Unit & Component tests failed!"
    echo "See test-results/unit-tests.log for details"
fi

echo ""
print_status "🌐 Starting development server for E2E tests..."
echo "================================================"

# Check if server is already running
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    print_success "Development server is already running on port 3001"
    SERVER_RUNNING=true
else
    print_status "Starting development server..."
    pnpm dev &
    DEV_SERVER_PID=$!
    SERVER_RUNNING=false
    
    # Wait for server to start
    print_status "Waiting for server to start..."
    for i in {1..30}; do
        if curl -s http://localhost:3001 > /dev/null 2>&1; then
            print_success "Development server started successfully!"
            SERVER_RUNNING=true
            break
        fi
        echo -n "."
        sleep 2
    done
    echo ""
    
    if [ "$SERVER_RUNNING" = false ]; then
        print_error "Failed to start development server"
        kill $DEV_SERVER_PID 2>/dev/null || true
        exit 1
    fi
fi

echo ""
print_status "🎭 Running E2E Tests..."
echo "========================"

if npx playwright test tests/playwright/chat.spec.ts --reporter=html 2>&1 | tee test-results/e2e-tests.log; then
    print_success "E2E tests passed!"
    E2E_TESTS_PASSED=true
else
    print_error "E2E tests failed!"
    echo "See test-results/e2e-tests.log for details"
    echo "Run 'npx playwright show-report' to view detailed results"
fi

echo ""
print_status "📸 Running Visual Regression Tests..."
echo "====================================="

if npx playwright test tests/playwright/chat-visual.spec.ts --reporter=html 2>&1 | tee test-results/visual-tests.log; then
    print_success "Visual regression tests passed!"
    VISUAL_TESTS_PASSED=true
else
    print_warning "Visual regression tests failed or need updates!"
    echo "See test-results/visual-tests.log for details"
    echo "If UI changes are intentional, run: npx playwright test --update-snapshots"
fi

# Clean up development server if we started it
if [ "$SERVER_RUNNING" = false ] && [ ! -z "$DEV_SERVER_PID" ]; then
    print_status "Stopping development server..."
    kill $DEV_SERVER_PID 2>/dev/null || true
    wait $DEV_SERVER_PID 2>/dev/null || true
fi

echo ""
echo "📊 TEST RESULTS SUMMARY"
echo "======================="

if [ "$UNIT_TESTS_PASSED" = true ]; then
    print_success "✅ Unit & Component Tests: PASSED"
else
    print_error "❌ Unit & Component Tests: FAILED"
fi

if [ "$E2E_TESTS_PASSED" = true ]; then
    print_success "✅ E2E Tests: PASSED"
else
    print_error "❌ E2E Tests: FAILED"
fi

if [ "$VISUAL_TESTS_PASSED" = true ]; then
    print_success "✅ Visual Regression Tests: PASSED"
else
    print_warning "⚠️  Visual Regression Tests: NEEDS ATTENTION"
fi

echo ""
echo "📁 Test artifacts saved to:"
echo "  - test-results/ (logs)"
echo "  - coverage/ (coverage reports)"
echo "  - playwright-report/ (E2E test results)"
echo ""

# Final status
if [ "$UNIT_TESTS_PASSED" = true ] && [ "$E2E_TESTS_PASSED" = true ]; then
    print_success "🎉 All critical tests passed! Chat functionality is ready."
    echo ""
    echo "Next steps:"
    echo "  - Review coverage report: open coverage/lcov-report/index.html"
    echo "  - Review E2E results: npx playwright show-report"
    if [ "$VISUAL_TESTS_PASSED" = false ]; then
        echo "  - Update visual snapshots if UI changes are intentional"
    fi
    exit 0
else
    print_error "❌ Some tests failed. Please fix issues before deploying."
    echo ""
    echo "Debugging help:"
    echo "  - Unit tests: pnpm test --verbose"
    echo "  - E2E tests: npx playwright test --debug"
    echo "  - Check logs in test-results/ directory"
    exit 1
fi
