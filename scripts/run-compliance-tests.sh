#!/bin/bash

# Backend Compliance Test Runner
# This script runs all compliance tests and generates a comprehensive report

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_RESULTS_DIR="./test-results"
COVERAGE_DIR="./coverage"
REPORT_FILE="$TEST_RESULTS_DIR/compliance-report-$(date +%Y%m%d-%H%M%S).md"

# Create results directory
mkdir -p "$TEST_RESULTS_DIR"

echo -e "${BLUE}🚀 Starting Backend Compliance Tests${NC}"
echo "=================================="

# Function to run test suite
run_test_suite() {
    local suite_name=$1
    local test_command=$2
    local output_file="$TEST_RESULTS_DIR/${suite_name}-results.txt"
    
    echo -e "${YELLOW}Running $suite_name tests...${NC}"
    
    if pnpm $test_command > "$output_file" 2>&1; then
        echo -e "${GREEN}✅ $suite_name tests passed${NC}"
        return 0
    else
        echo -e "${RED}❌ $suite_name tests failed${NC}"
        return 1
    fi
}

# Function to check test results
check_test_results() {
    local suite_name=$1
    local output_file="$TEST_RESULTS_DIR/${suite_name}-results.txt"
    
    if [ -f "$output_file" ]; then
        local passed=$(grep -c "✓" "$output_file" || echo "0")
        local failed=$(grep -c "✗" "$output_file" || echo "0")
        local total=$((passed + failed))
        
        echo "  - $suite_name: $passed/$total tests passed"
        return $failed
    else
        echo "  - $suite_name: No results found"
        return 1
    fi
}

# Initialize counters
total_passed=0
total_failed=0

# Run all test suites
test_suites=(
    "security:test:security"
    "compliance:test:compliance"
    "performance:test:performance"
    "scalability:test:scalability"
    "observability:test:observability"
    "ci:test:ci"
    "disaster-recovery:test:dr"
    "network:test:network"
    "cost:test:cost"
    "api:test:api"
)

for suite in "${test_suites[@]}"; do
    suite_name=$(echo $suite | cut -d: -f1)
    test_command=$(echo $suite | cut -d: -f3)
    
    if run_test_suite "$suite_name" "$test_command"; then
        total_passed=$((total_passed + 1))
    else
        total_failed=$((total_failed + 1))
    fi
done

# Run coverage test
echo -e "${YELLOW}Running code coverage test...${NC}"
if pnpm test:coverage > "$TEST_RESULTS_DIR/coverage-results.txt" 2>&1; then
    echo -e "${GREEN}✅ Code coverage test passed${NC}"
    total_passed=$((total_passed + 1))
else
    echo -e "${RED}❌ Code coverage test failed${NC}"
    total_failed=$((total_failed + 1))
fi

# Run security audit
echo -e "${YELLOW}Running security audit...${NC}"
if pnpm audit --audit-level=high > "$TEST_RESULTS_DIR/security-audit.txt" 2>&1; then
    echo -e "${GREEN}✅ Security audit passed${NC}"
    total_passed=$((total_passed + 1))
else
    echo -e "${RED}❌ Security audit failed${NC}"
    total_failed=$((total_failed + 1))
fi

# Generate comprehensive report
echo -e "${BLUE}📊 Generating Compliance Report${NC}"
echo "=================================="

cat > "$REPORT_FILE" << EOF
# Backend Compliance Test Report

**Generated:** $(date)
**Environment:** $(uname -s) $(uname -r)
**Node Version:** $(node --version)
**Package Manager:** $(pnpm --version)

## Test Summary

- **Total Test Suites:** $((total_passed + total_failed))
- **Passed:** $total_passed
- **Failed:** $total_failed
- **Success Rate:** $((total_passed * 100 / (total_passed + total_failed)))%

## Detailed Results

EOF

# Add detailed results for each test suite
for suite in "${test_suites[@]}"; do
    suite_name=$(echo $suite | cut -d: -f1)
    output_file="$TEST_RESULTS_DIR/${suite_name}-results.txt"
    
    echo "### $suite_name Tests" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    if [ -f "$output_file" ]; then
        local passed=$(grep -c "✓" "$output_file" || echo "0")
        local failed=$(grep -c "✗" "$output_file" || echo "0")
        local total=$((passed + failed))
        
        echo "- **Status:** $([ $failed -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")" >> "$REPORT_FILE"
        echo "- **Results:** $passed/$total tests passed" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        
        if [ $failed -gt 0 ]; then
            echo "**Failed Tests:**" >> "$REPORT_FILE"
            echo '```' >> "$REPORT_FILE"
            grep -A 5 "✗" "$output_file" >> "$REPORT_FILE" || true
            echo '```' >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
        fi
    else
        echo "- **Status:** ❌ NO RESULTS" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
    fi
done

# Add coverage information
echo "### Code Coverage" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ -f "$TEST_RESULTS_DIR/coverage-results.txt" ]; then
    coverage_line=$(grep "All files" "$TEST_RESULTS_DIR/coverage-results.txt" || echo "No coverage data")
    echo "- **Coverage:** $coverage_line" >> "$REPORT_FILE"
else
    echo "- **Coverage:** No coverage data available" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"

# Add security audit results
echo "### Security Audit" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ -f "$TEST_RESULTS_DIR/security-audit.txt" ]; then
    vulnerabilities=$(grep -c "vulnerabilities" "$TEST_RESULTS_DIR/security-audit.txt" || echo "0")
    echo "- **Vulnerabilities Found:** $vulnerabilities" >> "$REPORT_FILE"
    
    if [ $vulnerabilities -gt 0 ]; then
        echo "" >> "$REPORT_FILE"
        echo "**Vulnerability Details:**" >> "$REPORT_FILE"
        echo '```' >> "$REPORT_FILE"
        grep -A 10 "vulnerabilities" "$TEST_RESULTS_DIR/security-audit.txt" >> "$REPORT_FILE" || true
        echo '```' >> "$REPORT_FILE"
    fi
else
    echo "- **Security Audit:** No audit data available" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"

# Add recommendations
echo "## Recommendations" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ $total_failed -gt 0 ]; then
    echo "❌ **Immediate Actions Required:**" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "1. Review and fix failed tests" >> "$REPORT_FILE"
    echo "2. Address security vulnerabilities" >> "$REPORT_FILE"
    echo "3. Improve code coverage if below 80%" >> "$REPORT_FILE"
    echo "4. Update dependencies if security issues found" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
else
    echo "✅ **All tests passed!**" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "Continue monitoring and maintain compliance standards." >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

echo "## Next Steps" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "1. Review this report with the development team" >> "$REPORT_FILE"
echo "2. Address any failed tests or security issues" >> "$REPORT_FILE"
echo "3. Update compliance documentation if needed" >> "$REPORT_FILE"
echo "4. Schedule regular compliance reviews" >> "$REPORT_FILE"

# Final summary
echo ""
echo -e "${BLUE}📋 Test Summary${NC}"
echo "================"
echo -e "Total Test Suites: $((total_passed + total_failed))"
echo -e "Passed: ${GREEN}$total_passed${NC}"
echo -e "Failed: ${RED}$total_failed${NC}"
echo -e "Success Rate: $((total_passed * 100 / (total_passed + total_failed)))%"

echo ""
echo -e "${BLUE}📄 Report Generated${NC}"
echo "Report saved to: $REPORT_FILE"

# Exit with appropriate code
if [ $total_failed -eq 0 ]; then
    echo -e "${GREEN}🎉 All compliance tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some compliance tests failed. Please review the report.${NC}"
    exit 1
fi
