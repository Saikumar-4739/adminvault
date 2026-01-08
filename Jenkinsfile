pipeline {
    agent {
        docker {
            image 'node:20-alpine'
            args '-v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build Project') {
            steps {
                sh '''
                  npm run build:shared
                  npm run build:backend
                  npm run build:frontend
                '''
            }
        }

        stage('Build Containers') {
            steps {
                sh 'podman compose build'
            }
        }

        stage('Deploy Containers') {
            steps {
                sh 'podman compose up -d'
            }
        }
    }
}
