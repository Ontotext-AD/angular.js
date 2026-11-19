Ontotext fork
=============

This is the Ontotext-maintained fork of the end-of-life AngularJS 1.3 branch. It ships security
fixes for applications that still run on AngularJS 1.3, such as the legacy part of the GraphDB
Workbench. It adds no features. The `v1.3.x` branch starts from the upstream `v1.3.x` branch,
after the last upstream 1.3 release, 1.3.20.

### Packages

`grunt package` builds these npm packages in `build/npm/`:

* `@ontotext/angular`
* `@ontotext/angular-animate`
* `@ontotext/angular-cookies`
* `@ontotext/angular-route`
* `@ontotext/angular-sanitize`

Each package holds the `.js`, `.min.js` and `.min.js.map` files of its module, and an `index.js`
that works with `require()` the same way as in the upstream `angular*` packages.

### Versioning

Versions have the form `1.3.N-onto`. The first fork release is `1.3.21-onto`, one step after
1.3.20. Each release increases `N` by one, whatever it contains.

The `version` field of `package.json` holds the last release, 1.3.20 before the first fork
release. The release job sets it to the new version, and the build takes the version from it.
Error messages link to `errors.angularjs.org` with this version, e.g.
`http://errors.angularjs.org/1.3.22-onto/...`. The link has no error page behind it, but scanners
such as retire.js read the AngularJS version of a minified file from it, so it must name the
fork's version.

### Build prerequisites

* Node.js 4.9 with npm 2
* Java 8 (runs the Closure Compiler for the minified files)
* `grunt-cli` 0.1 (`npm install -g grunt-cli@0.1.13`)
* Firefox ESR for the unit tests

The `Dockerfile` in this repository provides all of them.

### Releasing

The Jenkins job built from `release.Jenkinsfile` releases a version. Its parameters are the branch
(`GIT_BRANCH`, default `v1.3.x`), the version (`RELEASE_VERSION`, of the form in
[Versioning](#versioning)) and an optional Slack notification (`NOTIFY_SLACK`, `SLACK_CHANNEL`).
The job stops when the tag `v<version>` already exists. Otherwise it:

1. Sets the version in `package.json` and runs `grunt package` in the `Dockerfile` image.
2. Publishes the packages from `build/npm/` with Node 20, under the `latest` dist-tag.
3. Commits `package.json`, tags the commit `v<version>`, and pushes the commit to the branch and
   the tag to `origin` in one atomic push.

### License

MIT. The copyright notices of the original authors are kept in [LICENSE](LICENSE) and in the
header of each built file.


AngularJS [![Build Status](https://travis-ci.org/angular/angular.js.svg?branch=master)](https://travis-ci.org/angular/angular.js)
=========

AngularJS lets you write client-side web applications as if you had a smarter browser.  It lets you
use good old HTML (or HAML, Jade and friends!) as your template language and lets you extend HTML’s
syntax to express your application’s components clearly and succinctly.  It automatically
synchronizes data from your UI (view) with your JavaScript objects (model) through 2-way data
binding. To help you structure your application better and make it easy to test, AngularJS teaches
the browser how to do dependency injection and inversion of control.

Oh yeah and it helps with server-side communication, taming async callbacks with promises and 
deferreds. It also makes client-side navigation and deeplinking with hashbang urls or HTML5 pushState a
piece of cake. Best of all?? It makes development fun!

* Web site: http://angularjs.org
* Tutorial: http://docs.angularjs.org/tutorial
* API Docs: http://docs.angularjs.org/api
* Developer Guide: http://docs.angularjs.org/guide
* Contribution guidelines: [CONTRIBUTING.md](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md)
* Dashboard: http://dashboard.angularjs.org

Building AngularJS
---------
[Once you have your environment setup](http://docs.angularjs.org/misc/contribute) just run:

    grunt package


Running Tests
-------------
To execute all unit tests, use:

    grunt test:unit

To execute end-to-end (e2e) tests, use:

    grunt package
    grunt test:e2e

To learn more about the grunt tasks, run `grunt --help` and also read our
[contribution guidelines](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md).


[![Analytics](https://ga-beacon.appspot.com/UA-8594346-11/angular.js/README.md?pixel)](https://github.com/igrigorik/ga-beacon)

