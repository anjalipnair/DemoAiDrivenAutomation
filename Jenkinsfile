pipeline {
    agent any
    
    // Daily schedule at 6 AM
    triggers {
        cron('0 6 * * *')
    }
    
    environment {
        CI = 'true'
        NODE_VERSION = '18'
        BASE_URL = 'https://www.orangehrm.com'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Node.js') {
            steps {
                script {
                    def nodeHome = tool name: 'NodeJS', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Chromium Tests') {
                    steps {
                        sh 'npx playwright test --project=chromium --reporter=html,json'
                    }
                    post {
                        always {
                            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
                            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
                        }
                    }
                }
                
                stage('Firefox Tests') {
                    steps {
                        sh 'npx playwright test --project=firefox --reporter=html,json'
                    }
                }
                
                stage('WebKit Tests') {
                    steps {
                        sh 'npx playwright test --project=webkit --reporter=html,json'
                    }
                }
                
                stage('OrangeHRM Specific Tests') {
                    steps {
                        sh 'npx playwright test tests/solutions/ --reporter=html,json'
                    }
                }
            }
        }
        
        stage('Generate Reports') {
            steps {
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    reportName: 'Playwright Test Report'
                ])
            }
        }
    }
    
    post {
        always {
            // Clean workspace
            cleanWs()
        }
        failure {
            // Send notification on failure
            script {
                // Email or Slack notification here
                echo "Tests failed - sending notification"
            }
        }
        success {
            echo "All tests passed successfully!"
        }
    }
}