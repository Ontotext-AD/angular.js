@Library('ontotext-platform@v0.1.51') _

// Releases the @ontotext/angular* npm packages: sets RELEASE_VERSION in package.json, builds them with
// `grunt package` into build/npm/<package>, publishes each one, then commits, tags v<version> and pushes.
pipeline {
    agent {
        label 'aws-large'
    }

    parameters {
        gitParameter name: 'GIT_BRANCH',
            description: 'The Git branch to release from',
            branchFilter: 'origin/(.*)',
            defaultValue: 'v1.3.x',
            selectedValue: 'DEFAULT',
            type: 'PT_BRANCH',
            listSize: '0',
            quickFilterEnabled: true

        string name: 'RELEASE_VERSION',
            description: 'Version to release, of the form 1.3.N-onto',
            defaultValue: ''

        booleanParam(
            name: 'NOTIFY_SLACK',
            defaultValue: false,
            description: 'Send Slack notification after successful build'
        )

        string(
            name: 'SLACK_CHANNEL',
            defaultValue: '#frontend-notifications',
            description: 'Slack channel for notification (only used if checkbox above is selected)'
        )
    }

    options {
        disableConcurrentBuilds()
        timeout(time: 1, unit: 'HOURS')
        timestamps()
    }

    stages {
        stage('Prepare') {
            steps {
                script {
                    // The versioning policy in README.md: 1.3.N-onto.
                    if (!(params.RELEASE_VERSION ==~ /1\.3\.\d+-onto/)) {
                        error "RELEASE_VERSION must have the form 1.3.N-onto, got '${params.RELEASE_VERSION}'"
                    }

                    git_cmd.checkout(branch: params.GIT_BRANCH)

                    // `ls-remote --exit-code` exits with 2 when no ref matches.
                    def tagStatus = sh(returnStatus: true, script: "git ls-remote --exit-code --tags origin refs/tags/v${params.RELEASE_VERSION}")
                    if (tagStatus == 0) {
                        error "Tag v${params.RELEASE_VERSION} already exists in origin"
                    } else if (tagStatus != 2) {
                        error "Could not check whether tag v${params.RELEASE_VERSION} exists in origin"
                    }
                }
            }
        }

        // The build runs in the image from the Dockerfile, with the toolchain of the 1.3.x branch.
        stage('Build') {
            agent {
                dockerfile {
                    reuseNode true
                }
            }

            environment {
                // Jenkins runs the container with the agent's UID, which has no writable home for the npm and bower caches.
                HOME = "${env.WORKSPACE}/.ci-home"
            }

            steps {
                // Not `npm version`: npm 2 also writes the version into npm-shrinkwrap.json.
                sh '''
                    node -e "var fs = require('fs'); var pkg = JSON.parse(fs.readFileSync('package.json')); pkg.version = process.argv[1]; fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\\n');" "$RELEASE_VERSION"
                '''
                sh 'npm install --loglevel warn'
                sh 'grunt package --no-color'

                // Stop before publishing anything when the build did not create the packages for this version.
                sh '''
                    ls -d build/npm/*/ > /dev/null 2>&1 || { echo "ERROR: grunt package created no packages in build/npm"; exit 1; }
                    for dir in build/npm/*/; do
                        version=$(node -p "require('./${dir}package.json').version")
                        if [ "$version" != "$RELEASE_VERSION" ]; then
                            echo "ERROR: ${dir} has version ${version}, expected ${RELEASE_VERSION}"
                            exit 1
                        fi
                    done
                '''
            }
        }

        // npm 2 from the build image cannot publish to today's registry, so the publish uses a current Node.
        stage('Publish') {
            agent {
                docker {
                    image 'node:20-bullseye'
                    reuseNode true
                    args '--entrypoint=""'
                }
            }

            environment {
                // Jenkins runs the container with the agent's UID, which has no writable home for the npm cache and .npmrc.
                HOME = "${env.WORKSPACE}/.ci-home"
            }

            steps {
                withKsm(application: [
                    [
                        credentialsId: 'ksm-jenkins',
                        secrets: [
                            [destination: 'env', envVar: 'NPM_TOKEN', filePath: '', notation: 'keeper://FcbEgbi287PN2yx_3uCz4Q/field/note'],
                        ]
                    ]
                ]) {
                    // The .npmrc holds a reference to the variable, not the token; npm expands it when it reads the file.
                    sh '''
                        mkdir -p "$HOME"
                        echo '//registry.npmjs.org/:_authToken=${NPM_TOKEN}' > "$HOME/.npmrc"
                        npm whoami || { echo 'ERROR: NPM authentication failed! Invalid or expired NPM_TOKEN.'; exit 1; }
                    '''

                    // A rerun after a partial failure skips the packages that are already published.
                    // The dist-tag is `latest`: the distTag field of package.json is for the upstream angular packages.
                    sh '''
                        for dir in build/npm/*/; do
                            name=$(node -p "require('./${dir}package.json').name")
                            if [ "$(npm view "${name}@${RELEASE_VERSION}" version 2>/dev/null)" = "$RELEASE_VERSION" ]; then
                                echo "${name}@${RELEASE_VERSION} is already published, skipping"
                                continue
                            fi
                            npm publish "$dir" --access public --tag latest
                        done
                    '''
                }
            }
        }

        // On the agent, without the HOME of the container stages: OpenSSH reads known_hosts from the passwd home.
        stage('Tag & Push') {
            steps {
                withKsm(application: [
                    [
                        credentialsId: 'ksm-jenkins',
                        secrets: [
                            [destination: 'env', envVar: 'GIT_USER', filePath: '', notation: 'keeper://8hm1g9HCfBPgoWAmpiHn6w/field/login'],
                        ]
                    ]
                ]) {
                    sh 'git config user.name "$GIT_USER"'
                    sh 'git config user.email "$GIT_USER@users.noreply.github.com"'

                    sh 'git add package.json'
                    sh 'git commit -m "Release $RELEASE_VERSION"'
                    sh 'git tag -a "v$RELEASE_VERSION" -m "Release v$RELEASE_VERSION"'

                    sh 'mkdir -p ~/.ssh'
                    sh 'ssh-keyscan github.com >> ~/.ssh/known_hosts'
                    sh 'git remote set-url origin git@github.com:Ontotext-AD/angular.js.git'
                    // From the parameter, not $GIT_BRANCH: the Git plugin also sets GIT_BRANCH, as origin/<branch>.
                    sh "git push origin HEAD:refs/heads/${params.GIT_BRANCH}"
                    sh 'git push origin "refs/tags/v$RELEASE_VERSION"'
                }
            }
        }
    }

    post {
        always {
            script {
                currentBuild.displayName = "${params.RELEASE_VERSION ?: currentBuild.displayName}"
            }
        }

        success {
            script {
                if (params.NOTIFY_SLACK && params.SLACK_CHANNEL?.trim()) {
                    try {
                        slack.notifyResult(channel: params.SLACK_CHANNEL, color: 'good', message: releaseMessage(params.RELEASE_VERSION))
                    } catch (e) {
                        echo "Slack notification failed: ${e.getMessage()}"
                    }
                }
            }
        }

        failure {
            wrap([$class: 'BuildUser']) {
                sendMail(env.BUILD_USER_EMAIL)
            }
        }

        cleanup {
            script {
                workspaceCleanup()
            }
        }
    }
}

// The intros take turns by build number: java.util.Random needs a script approval in the Jenkins sandbox.
def releaseMessage(String version) {
    def intros = [
        ":zombie: *It's alive!* AngularJS 1.3 claws its way out of the grave once more.\n" +
            "Upstream pulled the plug years ago, but this one has unfinished business: security fixes. " +
            "Lock the doors, hide the `\$rootScope`.",
        ":vampire: *End of life? Never heard of her.*\n" +
            "Another release of the framework that refuses to see the sunlight. " +
            "It still drinks two-way bindings for breakfast, and now it has fresh security fixes too.",
        ":coffin: *Upstream buried it in 2016. We brought a shovel.*\n" +
            "The tombstone says 1.3.20, but the patient keeps getting patched. " +
            "Rest in peace is not on the roadmap.",
        ":t-rex: *Jurassic JavaScript, freshly patched.*\n" +
            "Life, uh, finds a way. Somewhere between `bower install` and `\$digest`, " +
            "AngularJS 1.3 got another release. Do not tap on the glass.",
    ]
    def intro = intros[(env.BUILD_NUMBER as int) % intros.size()]

    return "${intro}\n\n" +
        ":package: <https://www.npmjs.com/package/@ontotext/angular/v/${version}|@ontotext/angular ${version}> " +
        "and its animate, cookies, route and sanitize friends are on npm\n" +
        ":label: <https://github.com/Ontotext-AD/angular.js/tree/v${version}|v${version}> tagged on `${params.GIT_BRANCH}`"
}

def workspaceCleanup() {
    configFileProvider([configFile(fileId: 'cleanup-script', variable: 'CLEANUP_SCRIPT')]) {
        def scriptContent = readFile(env.CLEANUP_SCRIPT)
        evaluate(scriptContent)
    }
}
