# Getting Started with DevEnv Scanner

This guide will help you get up and running with DevEnv Scanner in minutes.

## Installation

### Option 1: Download Pre-built Binary (Recommended)

Download the latest release for your platform:

```bash
# macOS (Apple Silicon)
curl -L https://github.com/sethtjf/devenv-scanner/releases/latest/download/devenv-macos-arm64.tar.gz | tar xz
sudo mv devenv-macos-arm64 /usr/local/bin/devenv

# macOS (Intel)
curl -L https://github.com/sethtjf/devenv-scanner/releases/latest/download/devenv-macos-x64.tar.gz | tar xz
sudo mv devenv-macos-x64 /usr/local/bin/devenv

# Linux
curl -L https://github.com/sethtjf/devenv-scanner/releases/latest/download/devenv-linux-x64.tar.gz | tar xz
sudo mv devenv-linux-x64 /usr/local/bin/devenv

# Make executable
chmod +x /usr/local/bin/devenv
```

### Option 2: Build from Source

Requirements:
- [Bun](https://bun.sh) v1.0 or later

```bash
# Clone the repository
git clone https://github.com/sethtjf/devenv-scanner.git
cd devenv-scanner

# Install dependencies
bun install

# Build the binary
bun run build

# Install globally
sudo cp dist/devenv /usr/local/bin/
```

### Option 3: Use without Installation

```bash
# Run directly with Bun
git clone https://github.com/sethtjf/devenv-scanner.git
cd devenv-scanner
bun install
bun run dev scan
```

## Basic Usage

### 1. Scan Your Environment

```bash
# Basic scan with summary output
devenv scan

# Save to JSON
devenv scan -o myenv.json -f json

# Save to YAML
devenv scan -o myenv.yaml -f yaml

# Generate setup scripts
devenv scan -f script -o setup
```

### 2. Generate Setup Scripts

```bash
# From a saved scan
devenv generate myenv.json -t bash -o setup.sh
devenv generate myenv.json -t docker -o Dockerfile
```

### 3. Compare Environments

```bash
# Compare two scans
devenv compare old-env.json new-env.json

# Verbose comparison
devenv compare old-env.json new-env.json -v
```

### 4. Validate Environment

```bash
# Check if current environment matches expected
devenv validate expected-env.json
```

## Your First Workflow

### Step 1: Scan Your Current Setup

```bash
devenv scan -o my-setup.json -f json
```

This creates a complete snapshot of your development environment.

### Step 2: Review What Was Found

```bash
cat my-setup.json | jq '.system'     # System info
cat my-setup.json | jq '.tools[]'    # Installed tools
cat my-setup.json | jq '.runtimes[]' # Programming languages
```

### Step 3: Generate a Setup Script

```bash
devenv scan -f script -o my-setup
```

This creates:
- `my-setup.sh` - Bash script to recreate your environment
- `my-setup.Dockerfile` - Dockerfile for containerization

### Step 4: Use on a New Machine

On your new machine:

```bash
# Option A: Run the setup script
./my-setup.sh

# Option B: Build a Docker container
docker build -f my-setup.Dockerfile -t mydev .
docker run -it mydev
```

## Common Use Cases

### Team Environment Standardization

1. Create a standard environment:
```bash
devenv scan -o team-standard.json -f json
```

2. Share with team via git:
```bash
git add team-standard.json
git commit -m "Add team environment standard"
git push
```

3. Team members validate:
```bash
devenv validate team-standard.json
```

### Regular Environment Snapshots

Create a cron job to track changes:

```bash
# Add to crontab
0 0 * * 1 devenv scan -o ~/env-backups/env-$(date +%Y%m%d).json -f json
```

### CI/CD Integration

Use in GitHub Actions:

```yaml
- name: Validate Development Environment
  run: |
    devenv validate expected-env.json
```

## Output Formats

### JSON Format
Best for:
- Version control
- Automation
- API integration

```bash
devenv scan -f json -o config.json
```

### YAML Format
Best for:
- Human readability
- Configuration files
- Ansible integration

```bash
devenv scan -f yaml -o config.yaml
```

### Script Format
Best for:
- Environment recreation
- Docker builds
- Automation scripts

```bash
devenv scan -f script -o setup
```

### Summary Format (Default)
Best for:
- Quick overview
- Terminal display
- Debugging

```bash
devenv scan
```

## Tips and Tricks

### 1. Verbose Output
Use `-v` flag for detailed logging:
```bash
devenv scan -v
```

### 2. Filter Specific Tools
Focus on specific aspects:
```bash
devenv scan -o config.json -f json
cat config.json | jq '.tools[] | select(.name | contains("docker"))'
```

### 3. Create Aliases
Add to your shell config:
```bash
alias devscan='devenv scan'
alias devbackup='devenv scan -o ~/env-$(date +%Y%m%d).json -f json'
```

### 4. Combine with Other Tools
```bash
# Send to a monitoring service
devenv scan -f json | curl -X POST https://api.example.com/env -d @-

# Store in S3
devenv scan -f json | aws s3 cp - s3://mybucket/env.json
```

## Troubleshooting

### Permission Denied
```bash
chmod +x /usr/local/bin/devenv
```

### Command Not Found
Add to PATH:
```bash
export PATH="/usr/local/bin:$PATH"
```

### macOS Security Warning
```bash
xattr -c /usr/local/bin/devenv
```

## Next Steps

- Read the [Usage Guide](./usage.md) for advanced features
- Learn about [Distribution](./distribution.md) options
- Explore the [API Documentation](../api/scanners.md)
- [Contribute](../../CONTRIBUTING.md) to the project

## Getting Help

- 📖 [Full Documentation](../README.md)
- 🐛 [Report Issues](https://github.com/sethtjf/devenv-scanner/issues)
- 💬 [Discussions](https://github.com/sethtjf/devenv-scanner/discussions)
- 📧 [Contact](mailto:seth@example.com)