# CI/CD Pipeline Setup Guide for OrangeHRM Test Automation

## Overview
This guide helps you set up comprehensive CI/CD pipelines to run your OrangeHRM website tests daily with automated reporting and notifications.

## Quick Start (Recommended: GitHub Actions)

### 1. GitHub Actions Setup (Daily at 6 AM UTC)
```bash
# Your workflow is already configured in .github/workflows/playwright-tests.yml
# Just push to GitHub and it will run automatically
git add .github/workflows/playwright-tests.yml
git commit -m "Add daily Playwright test automation"
git push
```

**Features:**
- ✅ Runs daily at 6:00 AM UTC
- ✅ Tests across Chrome, Firefox, Safari
- ✅ Automatic test reports
- ✅ Slack notifications on failure
- ✅ Artifact storage for 30 days

### 2. Configure Notifications
Add these secrets to your GitHub repository:

```bash
# Go to: Repository Settings → Secrets and variables → Actions
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

## Alternative CI/CD Platforms

### Jenkins Setup
```bash
# 1. Copy Jenkinsfile to your Jenkins server
# 2. Create new Pipeline job
# 3. Point to your repository
# 4. Configure daily schedule: H 6 * * *
```

### GitLab CI Setup  
```bash
# Configuration is ready in .gitlab-ci.yml
# Push to GitLab and it will auto-configure scheduling
```

### Docker Containerized Testing
```bash
# Build test container
docker build -t orangehrm-tests .

# Run tests locally
docker-compose up --build

# Run with custom environment
docker run --env-file .env orangehrm-tests
```

## Environment Configuration

### Create Environment File
```bash
# Copy example environment
cp .env.example .env

# Edit with your settings
nano .env
```

### Required Environment Variables
```bash
# Test Configuration
BASE_URL=https://www.orangehrm.com
HEADLESS=true
BROWSER_TIMEOUT=30000

# Jira Integration  
JIRA_BASE_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/YOUR/TEAMS/WEBHOOK
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK
EMAIL_FROM=tests@yourcompany.com
EMAIL_TO=team@yourcompany.com
SMTP_HOST=smtp.yourcompany.com
SMTP_PORT=587
SMTP_USER=smtp-user
SMTP_PASS=smtp-password
```

## Local Development & Testing

### Setup Local Cron Job (macOS/Linux)
```bash
# Run setup script
./scripts/setup-cron.sh

# Verify cron job
crontab -l
```

### Manual Test Execution
```bash
# Run all tests with reporting
npm run test:ci

# Run with notifications
./scripts/run-scheduled-tests.sh

# Run specific test suites
npm run test:solutions
npm run test:resources
npm run test:api
npm run test:accessibility
```

### Generate Reports
```bash
# Generate and open HTML report
npm run report:show

# Process CI results
node scripts/ci-report-processor.js

# Send notifications
./scripts/notify-results.sh
```

## Scheduling Options

### GitHub Actions (Recommended)
- **Current Schedule**: Daily at 6:00 AM UTC
- **Modify**: Edit `.github/workflows/playwright-tests.yml`
- **Cron Expression**: `0 6 * * *`

### Jenkins
- **Schedule**: `H 6 * * *` (daily around 6 AM)
- **Parallel Execution**: Yes (Chrome, Firefox, Safari)
- **Artifacts**: 7 days retention

### GitLab CI
- **Schedule**: Configure in GitLab UI
- **Docker**: Built-in container support
- **Multi-stage**: Build → Test → Report → Notify

### Local Cron
```bash
# Edit crontab
crontab -e

# Add daily 6 AM execution
0 6 * * * cd /path/to/project && ./scripts/run-scheduled-tests.sh
```

## Notification Setup

### Slack Integration
1. Create Slack webhook in your workspace
2. Add `SLACK_WEBHOOK_URL` to environment
3. Tests will notify on failures automatically

### Microsoft Teams
1. Add Teams webhook connector
2. Set `TEAMS_WEBHOOK_URL` environment variable
3. Customize message format in `notify-results.sh`

### Discord
1. Create Discord webhook in your server
2. Configure `DISCORD_WEBHOOK_URL`
3. Automatic notifications with test summaries

### Email Notifications
1. Configure SMTP settings in `.env`
2. Set recipient emails
3. HTML formatted reports included

## Test Report Features

### Automated Reports Include:
- ✅ Test execution summary
- ✅ Browser compatibility results
- ✅ Failed test screenshots
- ✅ Performance metrics
- ✅ Historical trending
- ✅ Jira issue integration

### Report Locations:
- **Local**: `playwright-report/index.html`
- **CI Artifacts**: Downloadable from pipeline
- **Docker Volume**: `/app/test-results`

## Jira Integration

### Link Test Results to User Stories:
- **DEM-2** (Solutions Testing): Automated linking
- **DEM-3** (Resources Testing): Automatic updates
- **DEM-4** (Defect Tracking): Status synchronization

### Automatic Jira Updates:
```bash
# Configure in ci-report-processor.js
JIRA_PROJECT_KEY=DEM
JIRA_AUTO_UPDATE=true
```

## Monitoring & Maintenance

### Health Checks
```bash
# Verify test infrastructure
npm run health-check

# Test notification systems
./scripts/test-notifications.sh

# Validate environment configuration
npm run config:validate
```

### Troubleshooting

#### Common Issues:
1. **Tests Failing**: Check OrangeHRM website availability
2. **No Notifications**: Verify webhook URLs and tokens
3. **Timeout Errors**: Increase `BROWSER_TIMEOUT` value
4. **Docker Issues**: Check container resource limits

#### Debug Commands:
```bash
# Run tests in debug mode
DEBUG=pw:* npm test

# Verbose logging
npm run test:verbose

# Check CI environment
npm run ci:debug
```

## Scaling & Performance

### Parallel Execution:
- **GitHub Actions**: 3 browsers simultaneously  
- **Jenkins**: Configurable parallel stages
- **Docker**: Multi-container execution
- **Local**: `--workers=3` parameter

### Resource Optimization:
```bash
# Reduce memory usage
BROWSER_ARGS="--no-sandbox --disable-dev-shm-usage"

# Faster execution  
HEADLESS=true
SLOW_MO=0
```

## Security Best Practices

### Sensitive Data:
- ✅ Use environment variables for secrets
- ✅ Never commit API tokens
- ✅ Rotate credentials regularly
- ✅ Use CI/CD secret management

### Network Security:
```bash
# Restrict test URLs
ALLOWED_DOMAINS=orangehrm.com,localhost

# Use VPN for internal testing
VPN_REQUIRED=true
```

## Next Steps

1. **Choose Your Platform**: GitHub Actions recommended for simplicity
2. **Configure Notifications**: Set up Slack/Teams webhook
3. **Deploy Pipeline**: Push configuration to your repository
4. **Monitor Results**: Check daily test execution
5. **Expand Tests**: Add remaining 31 test scenarios from comprehensive plan

## Support & Resources

- **Test Plan**: `specs/orangehrm-comprehensive-test-plan.md`
- **User Stories**: DEM-2 (Solutions), DEM-3 (Resources)
- **Current Tests**: `tests/solutions/solutions-navigation.spec.ts`
- **API Documentation**: `docs/api-testing-guide.md`
- **Accessibility**: `docs/accessibility-test-data-guide.md`

## Configuration Files Reference

| File | Purpose | Platform |
|------|---------|----------|
| `.github/workflows/playwright-tests.yml` | GitHub Actions | GitHub |
| `Jenkinsfile` | Jenkins Pipeline | Jenkins |
| `.gitlab-ci.yml` | GitLab CI | GitLab |
| `Dockerfile` | Container Build | Docker |
| `docker-compose.yml` | Multi-service | Docker |
| `scripts/run-scheduled-tests.sh` | Test Execution | All |
| `scripts/notify-results.sh` | Notifications | All |
| `.env` | Configuration | All |

---

**Ready to start?** Choose GitHub Actions and run:
```bash
git add .
git commit -m "Add comprehensive CI/CD automation for OrangeHRM tests"
git push
```

Your tests will automatically run daily at 6:00 AM UTC! 🚀