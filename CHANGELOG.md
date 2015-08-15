# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased][unreleased]
### Changed
  * Improved compatibility with popular mocking frameworks.

## [0.1.1] - 2015-08-07
### Fixed
  * IE8 is now working again.
  * We now have our automated test suite running against IE8 on every check-in so we can ensure continued compatibility in the future.

## [0.1.0] - 2015-08-04
### Changed
  * We've simplified the fell API so that you get direct access to the logger, and so that you are no longer obliged to use JsHamcrest for testing.

## [0.0.4] - 2015-07-31
### Added
  * Made a number of changes to make the library more consistent with other typical NPM libraries, including:
    1. Use [karma](karma-runner.github.io/), [mocha](http://mochajs.org/) & [expectations](https://github.com/spmason/expectations) instead of [jasmine](http://jasmine.github.io/) for testing.
    1. Use [browserify](http://browserify.org/) instead of [webbuilder](https://github.com/BladeRunnerJS/webbuilder) for building.
    1. Use [eslint](http://eslint.org/) for linting.
    1. Use [npm](https://www.npmjs.com/) instead of [Grunt](http://gruntjs.com/) as our build tool.
    1. Use standard directory names: `lib` -> `src`, `spec` -> `test` & `target` -> `dist`.
    1. Use `npm test` for running all tests, including a locally run browser test against Firefox, and SauceLab tests against various other browsers.
    1. Stop using [jsdoc](http://usejsdoc.org/), and use example driven `README.md` based documentation only.
    1. Stop creating [browser-modules](https://github.com/BladeRunnerJS/browser-modules) compatible distributions of our libraries, that even we don't use.
    1. Use a `master` branch instead of a `gh-pages` branch for simplicity, and get rid of the extra styling, and links to the different presentations of the exact same content.
    1. Use `:` as a delimiter to indicate sub-tasks.
    1. Stop using browser detection guards within code and tests, and instead let browserify provide a consistent environment.

## [0.0.3] - 2014-07-30 [YANKED]

## [0.0.2] - 2013-09-30
### Added
  * First proper release of 'fell'.

[unreleased]: https://github.com/BladeRunnerJS/fell/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/BladeRunnerJS/fell/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/BladeRunnerJS/fell/compare/v0.0.4...v0.1.0
[0.0.4]: https://github.com/BladeRunnerJS/fell/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/BladeRunnerJS/fell/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/BladeRunnerJS/fell/compare/v0.0.1...v0.0.2
