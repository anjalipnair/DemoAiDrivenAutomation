# Multi-stage Dockerfile for Playwright testing
FROM mcr.microsoft.com/playwright:v1.40.0-focal as playwright-base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Install Playwright browsers
RUN npx playwright install --with-deps

# Create a non-root user for security
RUN groupadd -r testuser && useradd -r -g testuser testuser
RUN chown -R testuser:testuser /app
USER testuser

# Default command
CMD ["npm", "test"]

# Production stage for CI reports
FROM nginx:alpine as report-server
COPY --from=playwright-base /app/playwright-report /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]