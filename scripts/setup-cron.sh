#!/bin/bash

# Setup cron job for daily test execution
# Usage: ./setup-cron.sh [time] [environment]

TIME=${1:-"0 6 * * *"}  # Default: 6 AM daily
ENV=${2:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Setting up cron job for Playwright tests..."
echo "Schedule: $TIME"
echo "Environment: $ENV"
echo "Project Directory: $PROJECT_DIR"

# Create cron job entry
CRON_ENTRY="$TIME cd $PROJECT_DIR && ./scripts/run-scheduled-tests.sh $ENV"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "run-scheduled-tests.sh"; then
    echo "Existing cron job found. Updating..."
    # Remove old entry and add new one
    (crontab -l 2>/dev/null | grep -v "run-scheduled-tests.sh"; echo "$CRON_ENTRY") | crontab -
else
    echo "Adding new cron job..."
    # Add new entry to existing crontab
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
fi

echo "Cron job setup complete!"
echo "Current crontab:"
crontab -l

# Make sure the script is executable
chmod +x "$SCRIPT_DIR/run-scheduled-tests.sh"

echo "Setup completed successfully!"