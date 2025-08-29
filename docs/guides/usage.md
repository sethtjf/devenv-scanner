# Usage Guide

## Command Overview

```
devenv [command] [options]
```

### Available Commands

| Command | Description |
|---------|-------------|
| `scan` | Scan the current system for developer tools |
| `generate` | Generate setup scripts from a scan file |
| `compare` | Compare two environment scans |
| `validate` | Validate current environment against a scan |

## Scan Command

The `scan` command analyzes your development environment and outputs the configuration.

### Basic Usage

```bash
# Simple scan with summary output
devenv scan

# Save to JSON file
devenv scan -o environment.json -f json

# Save to YAML file  
devenv scan -o environment.yaml -f yaml

# Generate setup scripts
devenv scan -f script -o setup
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <file>` | Output file path | stdout |
| `-f, --format <format>` | Output format (json, yaml, script, summary) | summary |
| `-v, --verbose` | Enable verbose output | false |
| `-i, --include <items...>` | Include specific scanners | all |
| `-e, --exclude <items...>` | Exclude specific scanners | none |

### Output Formats

#### Summary (Default)
Human-readable overview of your environment:
```bash
devenv scan
```

Output:
```
🖥️  System Information
  OS: darwin
  Architecture: arm64
  Shell: zsh
  
📦 Package Managers
  npm: 10.0.0
  brew: 4.0.0
  ...
```

#### JSON
Machine-readable format for automation:
```bash
devenv scan -f json -o config.json
```

#### YAML
Human-friendly structured data:
```bash
devenv scan -f yaml -o config.yaml
```

#### Script
Generates setup scripts:
```bash
devenv scan -f script -o mysetup
```
Creates:
- `mysetup.sh` - Bash installation script
- `mysetup.Dockerfile` - Docker configuration

### Filtering Scanners

Include only specific scanners:
```bash
# Only scan for Node.js and Python
devenv scan -i runtimes packageManagers

# Exclude certain scanners
devenv scan -e vscode docker
```

## Generate Command

Create setup scripts from a saved scan.

### Basic Usage

```bash
# Generate bash script
devenv generate scan.json -t bash -o setup.sh

# Generate Dockerfile
devenv generate scan.json -t docker -o Dockerfile

# Generate Ansible playbook (coming soon)
devenv generate scan.json -t ansible -o playbook.yml
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <file>` | Output file path | setup |
| `-t, --type <type>` | Script type (bash, docker, ansible) | bash |

### Script Types

#### Bash Script
Creates a shell script that installs all detected tools:
```bash
devenv generate env.json -t bash -o install.sh
chmod +x install.sh
./install.sh
```

#### Dockerfile
Creates a Dockerfile to replicate your environment:
```bash
devenv generate env.json -t docker -o Dockerfile
docker build -t mydev .
docker run -it mydev
```

## Compare Command

Compare two environment scans to see differences.

### Basic Usage

```bash
# Basic comparison
devenv compare old.json new.json

# Verbose comparison with details
devenv compare old.json new.json -v
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-v, --verbose` | Show detailed differences | false |

### Output

Shows:
- ✨ **Added**: New tools/packages in second scan
- ❌ **Removed**: Tools missing in second scan  
- 🔄 **Changed**: Version differences

Example:
```
📊 Environment Comparison
  File 1: old.json (2024-01-01)
  File 2: new.json (2024-01-15)

✨ Added tools:
  + docker (24.0.0)
  + rust (1.75.0)

❌ Removed tools:
  - python2 (2.7.18)

🔄 Changed versions:
  ~ node: 18.0.0 → 20.0.0
  ~ npm: 9.0.0 → 10.0.0
```

## Validate Command

Check if your current environment matches an expected configuration.

### Basic Usage

```bash
# Validate against saved configuration
devenv validate expected.json

# Verbose validation
devenv validate expected.json -v
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-v, --verbose` | Show detailed validation results | false |

### Output

Reports missing tools and version mismatches:
```
🔍 Environment Validation
  Expected: expected.json
  Current: Scanned at 2024-01-15

❌ Missing tools:
  - docker (24.0.0)
  - kubectl (1.28.0)

⚠️  Version mismatch:
  ~ node: expected 20.0.0, found 18.0.0
```

Exit codes:
- `0` - Environment matches
- `1` - Validation failed

## Advanced Usage

### Continuous Integration

#### GitHub Actions
```yaml
name: Validate Dev Environment
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Download devenv
        run: |
          curl -L https://github.com/sethtjf/devenv-scanner/releases/latest/download/devenv-linux-x64.tar.gz | tar xz
          chmod +x devenv-linux-x64
      - name: Validate environment
        run: ./devenv-linux-x64 validate expected-env.json
```

#### GitLab CI
```yaml
validate-env:
  script:
    - curl -L $DEVENV_URL | tar xz
    - ./devenv validate expected-env.json
```

### Automation Scripts

#### Daily Environment Backup
```bash
#!/bin/bash
# backup-env.sh
DATE=$(date +%Y%m%d)
devenv scan -o ~/env-backups/env-$DATE.json -f json
```

Add to crontab:
```bash
0 0 * * * /path/to/backup-env.sh
```

#### Team Environment Check
```bash
#!/bin/bash
# check-team-env.sh
devenv validate team-standard.json || {
  echo "Environment doesn't match team standard!"
  echo "Run: devenv generate team-standard.json -t bash | bash"
  exit 1
}
```

### Docker Integration

#### Multi-stage Build
```dockerfile
# Stage 1: Scan environment
FROM ubuntu:latest as scanner
RUN apt-get update && apt-get install -y curl
RUN curl -L https://github.com/sethtjf/devenv-scanner/releases/latest/download/devenv-linux-x64.tar.gz | tar xz
RUN ./devenv-linux-x64 scan -f json -o /env.json

# Stage 2: Build from scan
FROM ubuntu:latest
COPY --from=scanner /env.json /env.json
RUN apt-get update
# ... install based on env.json
```

#### Development Container
```dockerfile
# .devcontainer/Dockerfile
FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu

# Copy your environment scan
COPY environment.json /tmp/

# Generate and run setup script
RUN devenv generate /tmp/environment.json -t bash -o /tmp/setup.sh && \
    chmod +x /tmp/setup.sh && \
    /tmp/setup.sh
```

### Shell Aliases

Add to your shell configuration (`.bashrc`, `.zshrc`):

```bash
# Quick scan
alias devscan='devenv scan'

# Backup current environment
alias devbackup='devenv scan -o ~/env-$(date +%Y%m%d-%H%M%S).json -f json'

# Check against team standard
alias devcheck='devenv validate ~/team-standard.json'

# Generate setup script
alias devsetup='devenv scan -f script -o ~/my-setup'
```

### Integration with Other Tools

#### Send to API
```bash
devenv scan -f json | curl -X POST https://api.example.com/environments \
  -H "Content-Type: application/json" \
  -d @-
```

#### Store in S3
```bash
devenv scan -f json | aws s3 cp - s3://my-bucket/env-$(date +%Y%m%d).json
```

#### Use with jq
```bash
# Get all installed Node packages
devenv scan -f json | jq '.packageManagers[] | select(.name=="npm") | .globalPackages[]'

# Find specific tools
devenv scan -f json | jq '.tools[] | select(.name | contains("docker"))'

# Extract versions
devenv scan -f json | jq '.runtimes | map({(.name): .version}) | add'
```

## Best Practices

### 1. Version Control Your Environment

```bash
# Add to your project
devenv scan -o .devenv.json -f json
git add .devenv.json
git commit -m "Update development environment"
```

### 2. Document Requirements

Create a `DEVELOPMENT.md`:
```markdown
# Development Setup

## Required Environment
Run `devenv validate .devenv.json` to check your environment.

## Setup Instructions
```bash
devenv generate .devenv.json -t bash -o setup.sh
./setup.sh
```
```

### 3. Regular Snapshots

```bash
# Weekly snapshots
mkdir -p ~/env-history
devenv scan -o ~/env-history/env-$(date +%Y-W%U).json -f json
```

### 4. Team Standardization

```bash
# Team lead creates standard
devenv scan -o team-standard.json -f json

# Team members validate
devenv validate team-standard.json

# Auto-fix differences
devenv generate team-standard.json -t bash | bash
```

## Troubleshooting

### Large Output

For systems with many tools:
```bash
# Pipe to less
devenv scan | less

# Save to file first
devenv scan -o env.json -f json
cat env.json | jq '.' | less
```

### Slow Scanning

Some scanners may be slow:
```bash
# Exclude slow scanners
devenv scan -e vscode docker

# Use verbose to see progress
devenv scan -v
```

### Permission Issues

Some commands may need elevated permissions:
```bash
# May need sudo for system-wide tools
sudo devenv scan
```

## Next Steps

- Explore [API Documentation](../api/scanners.md)
- Learn about [Creating Custom Scanners](../api/scanners.md)
- Read about [Distribution](./distribution.md)
- [Contribute](../../CONTRIBUTING.md) to the project