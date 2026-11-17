@Library('ontotext-platform@v0.1.51') _
pipeline {
    agent {
        label 'aws-large'
    }

    options {
        // A new push to the same branch or PR supersedes the running build, so abort it instead of queueing.
        disableConcurrentBuilds(abortPrevious: true)
        timeout(time: 1, unit: 'HOURS')
    }

    stages {
        // The stages run in the image from the Dockerfile; `post` runs on the agent itself.
        stage('CI') {
            agent {
                dockerfile {
                    reuseNode true
                }
            }

            environment {
                // Jenkins runs the container with the agent's UID, which has no writable home for the npm and bower caches.
                HOME = "${env.WORKSPACE}/.ci-home"
            }

            stages {
                stage('Install') {
                    steps {
                        sh 'npm install --loglevel warn'
                    }
                }

                stage('Lint') {
                    steps {
                        sh 'grunt ci-checks --no-color'
                    }
                }

                stage('Build') {
                    steps {
                        sh 'grunt minify --no-color'
                    }
                }

                stage('Test') {
                    steps {
                        sh 'grunt test:unit --browsers Firefox --reporters dots,junit --no-color --no-colors'
                        sh 'grunt test:promises-aplus --no-color'
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'test_out/*.xml'
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                notifySlack()
                workspaceCleanup()
            }
        }

        failure {
            wrap([$class: 'BuildUser']) {
                sendMail(env.BUILD_USER_EMAIL)
            }
        }
    }
}

def notifySlack() {
    configFileProvider([configFile(fileId: 'notify-slack-script', variable: 'NOTIFY_SLACK_SCRIPT')]) {
        def scriptContent = readFile(env.NOTIFY_SLACK_SCRIPT)
        evaluate(scriptContent)
    }
}

def workspaceCleanup() {
    configFileProvider([configFile(fileId: 'cleanup-script', variable: 'CLEANUP_SCRIPT')]) {
        def scriptContent = readFile(env.CLEANUP_SCRIPT)
        evaluate(scriptContent)
    }
}
