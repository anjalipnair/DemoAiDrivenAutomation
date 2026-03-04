#!/usr/bin/env node

/**
 * CI Report Processor - Processes Playwright test results and generates reports
 * Usage: node ci-report-processor.js [options]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CIReportProcessor {
    constructor(options = {}) {
        this.resultsDir = options.resultsDir || './test-results';
        this.reportDir = options.reportDir || './playwright-report';
        this.outputDir = options.outputDir || './ci-reports';
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    }

    // Process test results and generate CI-friendly reports
    async processResults() {
        console.log('Processing test results...');
        
        try {
            // Ensure output directory exists
            if (!fs.existsSync(this.outputDir)) {
                fs.mkdirSync(this.outputDir, { recursive: true });
            }

            // Process JSON results
            const jsonResults = await this.loadJsonResults();
            const summary = this.generateSummary(jsonResults);
            
            // Generate reports
            await this.generateJUnitReport(jsonResults);
            await this.generateSummaryReport(summary);
            await this.generateTrendReport(summary);
            
            console.log('✅ Report processing completed successfully');
            return summary;
            
        } catch (error) {
            console.error('❌ Report processing failed:', error.message);
            throw error;
        }
    }

    // Load and merge JSON results from all browsers
    async loadJsonResults() {
        const results = { suites: [], tests: [] };
        
        try {
            const resultsFiles = fs.readdirSync(this.resultsDir)
                .filter(file => file.endsWith('.json'));
            
            for (const file of resultsFiles) {
                const filePath = path.join(this.resultsDir, file);
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                if (data.suites) results.suites.push(...data.suites);
                if (data.tests) results.tests.push(...data.tests);
            }
            
        } catch (error) {
            console.warn('No JSON results found, using fallback method');
        }
        
        return results;
    }

    // Generate test summary statistics
    generateSummary(results) {
        const summary = {
            timestamp: this.timestamp,
            totalTests: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            flaky: 0,
            duration: 0,
            suites: {},
            browsers: {}
        };

        // Process test results
        for (const test of results.tests || []) {
            summary.totalTests++;
            
            switch (test.status) {
                case 'passed':
                    summary.passed++;
                    break;
                case 'failed':
                    summary.failed++;
                    break;
                case 'skipped':
                    summary.skipped++;
                    break;
                case 'flaky':
                    summary.flaky++;
                    break;
            }
            
            summary.duration += test.duration || 0;
            
            // Track by suite
            const suiteName = test.title?.split(' › ')[0] || 'Unknown';
            if (!summary.suites[suiteName]) {
                summary.suites[suiteName] = { total: 0, passed: 0, failed: 0 };
            }
            summary.suites[suiteName].total++;
            if (test.status === 'passed') summary.suites[suiteName].passed++;
            if (test.status === 'failed') summary.suites[suiteName].failed++;
            
            // Track by browser
            const browser = test.projectName || 'unknown';
            if (!summary.browsers[browser]) {
                summary.browsers[browser] = { total: 0, passed: 0, failed: 0 };
            }
            summary.browsers[browser].total++;
            if (test.status === 'passed') summary.browsers[browser].passed++;
            if (test.status === 'failed') summary.browsers[browser].failed++;
        }
        
        summary.successRate = summary.totalTests > 0 
            ? ((summary.passed / summary.totalTests) * 100).toFixed(2)
            : 0;
            
        return summary;
    }

    // Generate JUnit XML report for CI systems
    async generateJUnitReport(results) {
        const xmlContent = this.generateJUnitXML(results);
        const filePath = path.join(this.outputDir, `junit-results-${this.timestamp}.xml`);
        
        fs.writeFileSync(filePath, xmlContent);
        console.log(`📋 JUnit report generated: ${filePath}`);
    }

    // Generate summary report (JSON and Markdown)
    async generateSummaryReport(summary) {
        // JSON report
        const jsonPath = path.join(this.outputDir, `summary-${this.timestamp}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));
        
        // Markdown report
        const markdownContent = this.generateMarkdownReport(summary);
        const mdPath = path.join(this.outputDir, `summary-${this.timestamp}.md`);
        fs.writeFileSync(mdPath, markdownContent);
        
        console.log(`📊 Summary reports generated: ${jsonPath}, ${mdPath}`);
    }

    // Generate trend report (for tracking over time)
    async generateTrendReport(currentSummary) {
        const trendFile = path.join(this.outputDir, 'test-trends.json');
        let trends = [];
        
        // Load existing trends
        if (fs.existsSync(trendFile)) {
            try {
                trends = JSON.parse(fs.readFileSync(trendFile, 'utf8'));
            } catch (error) {
                console.warn('Could not load existing trends:', error.message);
            }
        }
        
        // Add current results
        trends.push({
            timestamp: currentSummary.timestamp,
            totalTests: currentSummary.totalTests,
            passed: currentSummary.passed,
            failed: currentSummary.failed,
            successRate: currentSummary.successRate,
            duration: currentSummary.duration
        });
        
        // Keep only last 30 runs
        trends = trends.slice(-30);
        
        fs.writeFileSync(trendFile, JSON.stringify(trends, null, 2));
        console.log(`📈 Trend report updated: ${trendFile}`);
    }

    // Generate JUnit XML format
    generateJUnitXML(results) {
        const testCases = results.tests || [];
        const totalTests = testCases.length;
        const failures = testCases.filter(t => t.status === 'failed').length;
        const duration = testCases.reduce((sum, t) => sum + (t.duration || 0), 0) / 1000;
        
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<testsuite name="Playwright Tests" tests="${totalTests}" failures="${failures}" time="${duration}">\n`;
        
        for (const test of testCases) {
            const name = test.title || 'Unknown Test';
            const className = test.location?.file || 'UnknownFile';
            const testDuration = (test.duration || 0) / 1000;
            
            xml += `  <testcase name="${this.escapeXML(name)}" classname="${this.escapeXML(className)}" time="${testDuration}">\n`;
            
            if (test.status === 'failed') {
                const error = test.errors?.[0] || { message: 'Test failed' };
                xml += `    <failure message="${this.escapeXML(error.message)}">${this.escapeXML(error.stack || error.message)}</failure>\n`;
            } else if (test.status === 'skipped') {
                xml += `    <skipped/>\n`;
            }
            
            xml += `  </testcase>\n`;
        }
        
        xml += `</testsuite>\n`;
        return xml;
    }

    // Generate Markdown report
    generateMarkdownReport(summary) {
        let md = `# Test Results Report\n\n`;
        md += `**Generated:** ${new Date().toLocaleString()}\n\n`;
        
        md += `## Summary\n\n`;
        md += `| Metric | Value |\n`;
        md += `|--------|-------|\n`;
        md += `| Total Tests | ${summary.totalTests} |\n`;
        md += `| ✅ Passed | ${summary.passed} |\n`;
        md += `| ❌ Failed | ${summary.failed} |\n`;
        md += `| ⏭️ Skipped | ${summary.skipped} |\n`;
        md += `| 🔄 Flaky | ${summary.flaky} |\n`;
        md += `| Success Rate | ${summary.successRate}% |\n`;
        md += `| Duration | ${(summary.duration / 1000 / 60).toFixed(2)} minutes |\n\n`;
        
        md += `## Results by Browser\n\n`;
        for (const [browser, stats] of Object.entries(summary.browsers)) {
            const rate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;
            md += `- **${browser}**: ${stats.passed}/${stats.total} (${rate}%)\n`;
        }
        
        md += `\n## Results by Test Suite\n\n`;
        for (const [suite, stats] of Object.entries(summary.suites)) {
            const rate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;
            md += `- **${suite}**: ${stats.passed}/${stats.total} (${rate}%)\n`;
        }
        
        return md;
    }

    // Escape XML special characters
    escapeXML(str) {
        if (!str) return '';
        return str.replace(/[<>&"']/g, (char) => {
            switch (char) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '"': return '&quot;';
                case "'": return '&apos;';
            }
        });
    }
}

// CLI execution
if (require.main === module) {
    const processor = new CIReportProcessor();
    processor.processResults()
        .then(summary => {
            console.log(`\n📊 Test Summary:`);
            console.log(`   Total: ${summary.totalTests}`);
            console.log(`   Passed: ${summary.passed}`);
            console.log(`   Failed: ${summary.failed}`);
            console.log(`   Success Rate: ${summary.successRate}%`);
            
            process.exit(summary.failed > 0 ? 1 : 0);
        })
        .catch(error => {
            console.error('Report processing failed:', error);
            process.exit(1);
        });
}

module.exports = CIReportProcessor;