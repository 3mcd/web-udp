# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.1](https://github.com/osofour/web-udp/compare/v4.0.0...v4.0.1) (2020-05-04)


### Bug Fixes

* fix ts definition files ([2753344](https://github.com/osofour/web-udp/commit/27533442af7eb9b7224adf01b6294ff039dbe76a))





# [4.0.0](https://github.com/osofour/web-udp/compare/v3.0.3...v4.0.0) (2020-04-26)


### Bug Fixes

* number -> Timeout in broker ([de49156](https://github.com/osofour/web-udp/commit/de491568edefa067e3495dae1e554d10569c23d2))
* use NodeJs timeout ([1a32277](https://github.com/osofour/web-udp/commit/1a32277cf303fb6a780fbc18316c77d48789ccd9))


### Features

* 🎸 upgrade node-webrtc and switch to yarn ([d2cc4be](https://github.com/osofour/web-udp/commit/d2cc4be7225ecc8e62b65f737760a86f37d73fbc))
* add port range option ([a9cb607](https://github.com/osofour/web-udp/commit/a9cb607684b2b8e6289696398edc1e7bac082c4b))
* add support for custom ice servers ([c29991e](https://github.com/osofour/web-udp/commit/c29991e4ff6cd40c5cdf19a619867cb41b4ece50))
* add UNSAFE_ordered option ([4a18baa](https://github.com/osofour/web-udp/commit/4a18baa26c41966c3ad83cc1446745360d961cb9))


### BREAKING CHANGES

* 🧨 upgrade of node-webrtc may introduce unexpected breaking changes





# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2018-11-26

### Added

- Fixed types of `maxRetransmits` and `maxPacketLifeTime` properties on `ConnectionOptions` interface

## [3.0.0] - 2018-11-26

### Added

- `maxRetransmits` and `maxPacketLifeTime` options
- Removed auto-binding of public `RTCChannel` methods

### Removed

- Removed Flow dependencies

### Changed

- Full TypeScript rewrite
- Moved build step to package level
- Updated all devDependency package versions
- Updated wrtc to `0.3.2`

## [2.3.0] - 2018-09-08

### Added

- `keepAlivePeriod` option to `Server`

## [2.1.0] - 2018-04-11

### Added

- `metadata` option in `Client#connect`

### Changed

- Update README for new `metadata` option and description of examples
- Removed some poorly written unit tests
- New unit test for `metadata` option
