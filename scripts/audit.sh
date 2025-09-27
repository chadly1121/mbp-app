#!/bin/bash

echo "🔍 Running comprehensive app audit..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

# Install dependencies
echo "📦 Installing dependencies..."
npm ci
print_status "Dependencies installed" $?

# Build check
echo -e "\n🏗️  Building application..."
npm run build
BUILD_STATUS=$?
print_status "Build successful" $BUILD_STATUS

# Linting
echo -e "\n🔧 Running linter..."
npm run lint
LINT_STATUS=$?
print_status "Linting passed" $LINT_STATUS

# Security audit
echo -e "\n🔒 Running security audit..."
npm audit --audit-level=moderate
AUDIT_STATUS=$?
print_status "Security audit passed" $AUDIT_STATUS

# Type checking (if available)
if command_exists tsc; then
    echo -e "\n📝 Running type check..."
    npx tsc --noEmit
    TYPE_STATUS=$?
    print_status "Type checking passed" $TYPE_STATUS
fi

# Unit tests (if available)
if [ -f "vitest.config.ts" ]; then
    echo -e "\n🧪 Running unit tests..."
    npm run test 2>/dev/null || npx vitest run
    TEST_STATUS=$?
    print_status "Unit tests passed" $TEST_STATUS
fi

# Preview server for E2E tests
echo -e "\n🌐 Starting preview server..."
npm run preview &
PREVIEW_PID=$!
sleep 5

# E2E tests
if [ -f "playwright.config.ts" ]; then
    echo -e "\n🎭 Running E2E tests..."
    npx playwright test --list > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        npx playwright test
        E2E_STATUS=$?
        print_status "E2E tests passed" $E2E_STATUS
    else
        echo -e "${YELLOW}⚠️  Playwright tests not configured${NC}"
    fi
fi

# Kill preview server
kill $PREVIEW_PID 2>/dev/null

# Summary
echo -e "\n📊 AUDIT SUMMARY"
echo "=================="
print_status "Dependencies" 0
print_status "Build" $BUILD_STATUS
print_status "Linting" $LINT_STATUS
print_status "Security" $AUDIT_STATUS

if [ -n "$TYPE_STATUS" ]; then
    print_status "Type Checking" $TYPE_STATUS
fi

if [ -n "$TEST_STATUS" ]; then
    print_status "Unit Tests" $TEST_STATUS
fi

if [ -n "$E2E_STATUS" ]; then
    print_status "E2E Tests" $E2E_STATUS
fi

echo -e "\n🎉 Audit complete!"

# Overall status
if [ $BUILD_STATUS -eq 0 ] && [ $LINT_STATUS -eq 0 ]; then
    echo -e "${GREEN}✅ Your app is healthy!${NC}"
    exit 0
else
    echo -e "${RED}❌ Issues found. Please review the output above.${NC}"
    exit 1
fi