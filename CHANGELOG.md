# Changelog

All notable changes to DevEnv Scanner will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Documentation reorganization into `/docs` directory
- Comprehensive API documentation for scanners
- Architecture documentation
- Contributing guidelines

### Changed
- Improved documentation structure
- Enhanced build optimization strategies

### Fixed
- Banner display for JSON/YAML output formats
- TypeScript type checking warnings

## [1.0.0] - 2024-08-29

### Added
- Initial release of DevEnv Scanner
- Core scanning functionality for:
  - System information (OS, architecture, shell)
  - Package managers (npm, yarn, pnpm, bun, brew, apt, etc.)
  - Programming runtimes (Node.js, Python, Ruby, Go, Rust, etc.)
  - Development tools (Git, Docker, editors, databases)
  - Git configuration and aliases
  - Shell configuration
  - VS Code extensions
- Multiple output formats:
  - Human-readable summary
  - JSON export
  - YAML export
  - Bash setup scripts
  - Dockerfile generation
- Command-line interface with:
  - `scan` - Scan current environment
  - `generate` - Create setup scripts
  - `compare` - Compare two environments
  - `validate` - Validate against expected configuration
- Cross-platform support:
  - macOS (x64 and ARM64)
  - Linux (x64 and ARM64)
  - Windows (x64)
- Standalone binary compilation with Bun
- Comprehensive test suite
- GitHub Actions CI/CD pipeline
- Automated release workflow
- Beautiful CLI with colors and progress indicators
- Verbose mode for debugging
- Installation script for easy setup

### Technical Details
- Built with TypeScript and Bun
- Modular architecture with extensible scanners
- Parallel scanning for performance
- Zero runtime dependencies (standalone binary)
- ~57MB uncompressed binary size
- ~21MB compressed distribution size

### Documentation
- Complete README with examples
- Installation guide
- Usage documentation
- Distribution guide
- Binary size analysis
- Optimization strategies

## Version History

### Versioning Scheme
- **MAJOR**: Breaking changes to CLI or output format
- **MINOR**: New features, scanners, or generators
- **PATCH**: Bug fixes and minor improvements

[Unreleased]: https://github.com/sethtjf/devenv-scanner/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/sethtjf/devenv-scanner/releases/tag/v1.0.0