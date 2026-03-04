#!/bin/bash

# Scheduled test runner with error handling and notifications
# Usage: ./run-scheduled-tests.sh [environment]

set -e  # Exit on any error

# Configuration
ENV=${1:-production}
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
LOG_DIR="./logs"
REPORT_DIR="./playwright-report"
SLACK_WEBHOOK=${SLACK_WEBHOOK:-""}
EMAIL_RECIPIENTS=${EMAIL_RECIPIENTS:-""}

# Create directories
mkdir -p $LOG_DIR
mkdir -p $REPORT_DIR

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/test-run-$TIMESTAMP.log"
}

log "Starting scheduled test run for environment: $ENV"

# Function to send notifications
send_notification() {
    local status=$1
    local message=$2
    
    # Slack notification
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK" || log "Failed to send Slack notification"
    fi
    
    # Email notification (requires sendmail or similar)
    if [ -n "$EMAIL_RECIPIENTS" ]; then
        echo "$message" | mail -s "Test Run $status - $(date)" "$EMAIL_RECIPIENTS" || log "Failed to send email notification"
    fi
}

# Function to run specific test suites
run_test_suite() {
    local suite_name=$1
    local test_path=$2
    local timeout=${3:-300}  # 5 minutes default
    
    log "Running $suite_name tests..."
    
    if timeout $timeout npx playwright test "$test_path" --reporter=html,json; then
        log "$suite_name tests PASSED"
        return 0
    else
        log "$suite_name tests FAILED"
        return 1
    fi
}

# Main test execution
main() {
    local exit_code=0
    local failed_tests=()
    
    # Run OrangeHRM Solutions tests
    if ! run_test_suite "OrangeHRM Solutions" "tests/solutions/" 300; then
        failed_tests+=("OrangeHRM Solutions")
        exit_code=1
    fi
    
    # Run API tests
    if ! run_test_suite "API Tests" "tests/api/automated-api-tests.spec.ts" 180; then
        failed_tests+=("API Tests")
        exit_code=1
    fi
    
    # Run accessibility tests
    if ! run_test_suite "Accessibility" "tests/accessibility/" 240; then
        failed_tests+=("Accessibility")
        exit_code=1
    fi
    
    # Generate summary report
    if [ $exit_code -eq 0 ]; then
        local message="✅ All scheduled tests passed successfully!"
        log "$message"
        send_notification "SUCCESS" "$message"
    else
        local message="❌ Some tests failed: ${failed_tests[*]}"
        log "$message"
        send_notification "FAILURE" "$message"
    fi
    
    # Archive results
    tar -czf "$LOG_DIR/test-results-$TIMESTAMP.tar.gz" "$REPORT_DIR" || log "Failed to archive results"
    
    return $exit_code
}

# Trap to ensure cleanup
trap 'log "Test run interrupted"; exit 1' INT TERM

# Execute main function
if main; then
    log "Scheduled test run completed successfully"
    exit 0
else
    log "Scheduled test run completed with failures"
    exit 1
fi