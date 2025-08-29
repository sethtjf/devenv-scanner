# DevEnv Scanner 🚀

A powerful CLI tool to scan, save, and recreate your development environment across different machines. Never manually set up your dev environment again!

## Features

- 🔍 **Comprehensive Scanning**: Detects installed tools, runtimes, package managers, and configurations
- 📦 **Multiple Output Formats**: JSON, YAML, Bash scripts, and Dockerfiles
- 🔄 **Environment Comparison**: Compare different setups and track changes
- ✅ **Validation**: Ensure your environment matches a saved configuration
- 🐳 **Docker Support**: Generate Dockerfiles from your environment
- 🎨 **VS Code Integration**: Captures installed extensions and settings

## Installation

```bash
# Using Bun (recommended)
bun add -g devenv-cli

# Or clone and build from source
git clone https://github.com/yourusername/devenv-scanner.git
cd devenv-scanner
bun install
bun run build
```

## Quick Start

```bash
# Scan your current environment
devenv scan

# Save scan to JSON
devenv scan -o myenv.json -f json

# Generate setup scripts
devenv scan -f script -o setup

# Compare two environments
devenv compare old.json new.json

# Validate current environment
devenv validate expected.json
```

## Development

```bash
# Install dependencies
bun install

# Run in development
bun run dev scan

# Run tests
bun test

# Build executable
bun run build

# Type checking
bun run typecheck
```

Built with ❤️ using Bun and TypeScript
