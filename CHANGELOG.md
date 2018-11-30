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
