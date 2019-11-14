def githubStatusCheck(String state, String description){
    def commitHash = checkout(scm).GIT_COMMIT
    githubNotify account: 'interacto',sha: "${commitHash}", status: state, description: description, credentialsId: 'github-token', repo: 'interacto-ts-api'
}


pipeline {
    agent any

    tools {
        maven 'Maven'
    }

    stages {

        stage('Github Pending') {
            steps{
                script{
                    githubStatusCheck("PENDING", "Currently building the project");
                }
            }
        }

        stage('Node config') {
            steps {
                nodejs(nodeJSInstallationName: 'node10') {
                    sh 'npm -v'
                }
            }
        }

        stage ('Tools Info') {
            steps {
                sh '''
                    git --version
                    mvn -v
                '''
            }
        }

        stage ('Git') {
            steps {
                //going to build on the branch master
                git branch: 'master', url: "https://github.com/interacto/interacto-ts-api"
            }
        }
        
        stage ('NPM install') {
            steps {
                sh '''
                    npm install
                '''
            }
        }
        
        stage ('NPM build') {
            steps {
                sh '''
                    npm run package
                '''
            }
        }
    }

    post{
        success {
            githubStatusCheck("SUCCESS", "Build succeeded");
        }
        failure {
            githubStatusCheck("FAILURE", "Build failed");
        }
    }
}
