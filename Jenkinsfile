def githubStatusCheck(String state, String description){
    def commitHash = checkout(scm).GIT_COMMIT
    githubNotify account: 'interacto',sha: "${commitHash}", status: state, description: description, credentialsId: 'github-token', repo: 'interacto-ts-api'
}


pipeline {
    agent any

    stages {

        stage('Github Pending') {
            steps{
                script{
                    githubStatusCheck("PENDING", "Building the project");
                }
            }
        }

        stage('Node config') {
            steps {
                nodejs(nodeJSInstallationName: 'node12') {
                    sh 'npm -v'
                }
            }
        }

        stage ('Git') {
            steps {
                git branch: 'master', url: "https://github.com/interacto/interacto-ts-api"
            }
        }
        
        stage ('NPM install') {
            steps {
                nodejs(nodeJSInstallationName: 'node12') {
                    sh '''
                        npm install
                    '''
                }
            }
        }
        
        stage ('NPM build') {
            steps {
                nodejs(nodeJSInstallationName: 'node12') {
                    sh '''
                        npm run package
                    '''
                }

                step([
                    $class: 'CloverPublisher',
                    cloverReportDir: 'coverage',
                    cloverReportFileName: 'clover.xml',
                    healthyTarget: [methodCoverage: 100, conditionalCoverage: 100, statementCoverage: 100],
                    failingTarget: [methodCoverage: 85, conditionalCoverage: 75, statementCoverage: 90]
                ])
            }
        }
    }

    post{
        success {
            githubStatusCheck("SUCCESS", "Build success");
        }
        failure {
            githubStatusCheck("FAILURE", "Build failure");
        }
    }
}
