pipeline {
    agent any

    options {
        timeout(time: 90, unit: 'MINUTES')
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
                  node -v
                  npm -v
                  npm config set progress=false
                  npm install --loglevel=verbose
                '''
            }
        }

        stage('Build Shared') {
            steps {
                sh 'npm run build:shared'
            }
        }

        stage('Build Backend') {
            steps {
                sh 'npm run build:backend'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'npm run build:frontend'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose up -d'
            }
        }
    }
}
