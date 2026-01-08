pipeline {
    agent any

    options {
        // Prevent Jenkins from killing long-running steps
        timeout(time: 90, unit: 'MINUTES')
    }

    environment {
        // Reduce npm noise but keep heartbeat alive
        NPM_CONFIG_PROGRESS = 'false'
        CI = 'true'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                  echo "Node version:"
                  node -v
                  echo "NPM version:"
                  npm -v

                  echo "Configuring npm to avoid Jenkins heartbeat issue"
                  npm config set progress=false
                  npm config set fund=false
                  npm config set audit=false

                  echo "Installing dependencies with verbose logs"
                  npm install --loglevel=verbose
                '''
            }
        }

        stage('Build Shared') {
            steps {
                sh '''
                  echo "Building shared package"
                  npm run build:shared
                '''
            }
        }

        stage('Build Backend') {
            steps {
                sh '''
                  echo "Building backend"
                  npm run build:backend
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                sh '''
                  echo "Building frontend"
                  npm run build:frontend
                '''
            }
        }

        // 🔴 ENABLE THIS STAGE ONLY AFTER BUILDS PASS CONSISTENTLY
        /*
        stage('Build Containers') {
            steps {
                sh '''
                  echo "Building containers with podman"
                  podman compose build
                '''
            }
        }

        stage('Deploy Containers') {
            steps {
                sh '''
                  echo "Deploying containers"
                  podman compose up -d
                '''
            }
        }
        */
    }

    post {
        success {
            echo '✅ Jenkins pipeline completed successfully'
        }
        failure {
            echo '❌ Jenkins pipeline failed'
        }
        always {
            echo '🔚 Pipeline finished'
        }
    }
}
