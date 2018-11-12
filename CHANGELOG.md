# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased
### Changed
* Apply resources serially to avoid TLS timeout
* Apply command adds a default variable `timestamp` if it is not provided

## [1.8.6] - 2018-05-29
### Added
* Key value pairs as yargs for apply function

## [1.8.5] - 2018-05-25
### Fixed
* Fixed a typo in commands/index

## [1.8.4] - 2018-05-24
### Fixed
* Fixed apply command by exposing it in commands/index

## [1.8.3] - 2018-05-24
### Added
* Added apply command to apply a specific k8s yaml file on a target cluster

## [1.8.2] - 2018-04-13
### Changed
* Use full Node image

## [1.8.1] - 2018-02-28
### Added
- Initial public release
