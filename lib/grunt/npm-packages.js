'use strict';

var versionInfo = require('../versions/version-info');

// The npm packages this fork publishes. Each one wraps the matching build/<name>.* files.
var PACKAGES = [
  {name: 'angular', description: 'HTML enhanced for web apps', exports: 'angular', extraFiles: ['angular-csp.css']},
  {name: 'angular-animate', description: 'AngularJS module for animations', exports: '\'ngAnimate\''},
  {name: 'angular-cookies', description: 'AngularJS module for cookies', exports: '\'ngCookies\''},
  {name: 'angular-route', description: 'AngularJS router module', exports: '\'ngRoute\''},
  {name: 'angular-sanitize', description: 'AngularJS module for sanitizing HTML', exports: '\'ngSanitize\''}
];

var SCOPE = '@ontotext';

module.exports = function(grunt) {

  grunt.registerTask('npm-packages', 'Create the @ontotext/angular* npm packages in build/npm', function() {
    var version = grunt.config('NG_VERSION').full;
    var repository = versionInfo.currentPackage.repository;

    PACKAGES.forEach(function(pkg) {
      var dir = 'build/npm/' + pkg.name + '/';
      var files = [pkg.name + '.js', pkg.name + '.min.js', pkg.name + '.min.js.map'].concat(pkg.extraFiles || []);

      files.forEach(function(file) {
        grunt.file.copy('build/' + file, dir + file);
      });
      grunt.file.copy('LICENSE', dir + 'LICENSE');

      grunt.file.write(dir + 'index.js', 'require(\'./' + pkg.name + '\');\nmodule.exports = ' + pkg.exports + ';\n');

      grunt.file.write(dir + 'package.json', JSON.stringify({
        name: SCOPE + '/' + pkg.name,
        version: version,
        description: pkg.description + ' (Ontotext-maintained fork of AngularJS 1.3)',
        main: 'index.js',
        files: ['index.js', 'LICENSE', 'README.md'].concat(files),
        repository: repository,
        keywords: ['angular', 'framework', 'browser', 'client-side'],
        license: 'MIT',
        homepage: 'https://github.com/Ontotext-AD/angular.js/tree/' + grunt.config('NG_VERSION').branch
      }, null, 2) + '\n');

      grunt.file.write(dir + 'README.md',
        '# ' + SCOPE + '/' + pkg.name + '\n\n' +
        'The `' + pkg.name + '` file of AngularJS ' + version + ', the Ontotext-maintained fork of the\n' +
        'end-of-life AngularJS 1.3 branch with security fixes.\n\n' +
        'Source and versioning policy: https://github.com/Ontotext-AD/angular.js\n');

      grunt.log.ok('Created ' + dir);
    });
  });
};
