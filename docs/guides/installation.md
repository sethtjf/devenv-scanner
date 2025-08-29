# Installation Guide

## System Requirements

- **Operating System**: macOS, Linux, or Windows
- **Architecture**: x64 or ARM64
- **Disk Space**: ~60MB for binary, ~25MB for compressed download
- **Memory**: Minimal (< 50MB RAM)

## Installation Methods

### 1. Pre-built Binaries (Recommended)

#### Automatic Installation Script

```bash
curl -fsSL https://raw.githubusercontent.com/sethtjf/devenv-scanner/main/install.sh | bash
```

This script:
- Detects your platform automatically
- Downloads the correct binary
- Installs to `/usr/local/bin`
- Makes it executable

#### Manual Download

Visit the [releases page](https://github.com/sethtjf/devenv-scanner/releases) and download the appropriate binary:

| Platform | Architecture | File |
|----------|-------------|------|
| macOS | Apple Silicon (M1/M2) | `devenv-macos-arm64.tar.gz` |
| macOS | Intel | `devenv-macos-x64.tar.gz` |
| Linux | x64 | `devenv-linux-x64.tar.gz` |
| Linux | ARM64 | `devenv-linux-arm64.tar.gz` |
| Windows | x64 | `devenv-windows-x64.zip` |

##### macOS Installation

```bash
# Download (choose your architecture)
curl -L -o devenv.tar.gz https://github.com/sethtjf/devenv-scanner/releases/latest/download/devenv-macos-arm64.tar.gz

# Extract
tar -xzf devenv.tar.gz

# Install
sudo mv devenv-macos-arm64 /usr/local/bin/devenv
chmod +x /usr/local/bin/devenv

# Verify
devenv --version
```

##### Linux Installation

```bash
# Download
wget https://github.com/sethtjf/devenv-scanner/releases/latest/download/devenv-linux-x64.tar.gz

# Extract
tar -xzf devenv-linux-x64.tar.gz

# Install
sudo mv devenv-linux-x64 /usr/local/bin/devenv
chmod +x /usr/local/bin/devenv

# Verify
devenv --version
```

##### Windows Installation

1. Download `devenv-windows-x64.zip` from releases
2. Extract the zip file
3. Add the directory to your PATH:
   - Open System Properties → Environment Variables
   - Add the directory containing `devenv.exe` to PATH
4. Open a new terminal and verify:
   ```cmd
   devenv --version
   ```

### 2. Build from Source

#### Prerequisites

- [Bun](https://bun.sh) v1.0 or later
- Git

#### Build Steps

```bash
# Clone repository
git clone https://github.com/sethtjf/devenv-scanner.git
cd devenv-scanner

# Install dependencies
bun install

# Build for your platform
bun run build

# Or build for specific platform
bun run build:macos-arm  # macOS Apple Silicon
bun run build:macos      # macOS Intel
bun run build:linux      # Linux x64
bun run build:windows    # Windows

# Install globally
sudo cp dist/devenv /usr/local/bin/
chmod +x /usr/local/bin/devenv
```

### 3. Run without Installation

If you have Bun installed, you can run directly from source:

```bash
# Clone and run
git clone https://github.com/sethtjf/devenv-scanner.git
cd devenv-scanner
bun install

# Run directly
bun run src/index.ts scan

# Or use the dev script
bun run dev scan
```

### 4. Package Managers

#### Homebrew (Coming Soon)

```bash
brew tap sethtjf/devenv-scanner
brew install devenv-scanner
```

#### npm/yarn (Node.js wrapper - Coming Soon)

```bash
npm install -g devenv-scanner
# or
yarn global add devenv-scanner
```

## Platform-Specific Notes

### macOS

#### Security Warning

On first run, macOS may show "cannot be opened because the developer cannot be verified".

**Solution 1**: Clear quarantine flag
```bash
xattr -c /usr/local/bin/devenv
```

**Solution 2**: Allow in System Preferences
1. Open System Preferences → Security & Privacy
2. Click "Allow Anyway" for devenv
3. Run again and click "Open"

#### Permissions

If you get permission denied:
```bash
chmod +x /usr/local/bin/devenv
```

### Linux

#### Different Distributions

**Ubuntu/Debian:**
```bash
# May need to create /usr/local/bin
sudo mkdir -p /usr/local/bin
```

**Fedora/RHEL:**
```bash
# SELinux may require additional context
sudo chcon -t bin_t /usr/local/bin/devenv
```

**Alpine:**
```bash
# Smaller systems may need glibc compatibility
apk add gcompat
```

### Windows

#### Execution Policy

If you get execution policy errors:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Antivirus

Some antivirus software may flag the binary. This is a false positive due to the embedded runtime. Add an exception for `devenv.exe`.

## Verification

After installation, verify it works:

```bash
# Check version
devenv --version

# Run help
devenv --help

# Do a test scan
devenv scan
```

## Updating

### Manual Update

1. Download the new version
2. Replace the old binary
3. Verify with `devenv --version`

### Automated Update (Coming Soon)

```bash
devenv self-update
```

## Uninstallation

### Binary Installation

```bash
# Remove binary
sudo rm /usr/local/bin/devenv

# Remove any config files (optional)
rm -rf ~/.config/devenv
```

### Source Installation

```bash
# Remove cloned repository
rm -rf /path/to/devenv-scanner

# Remove binary
sudo rm /usr/local/bin/devenv
```

## Troubleshooting

### Command Not Found

The binary is not in your PATH. Either:

1. Add to PATH:
```bash
export PATH="/usr/local/bin:$PATH"
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bashrc
```

2. Use full path:
```bash
/usr/local/bin/devenv scan
```

3. Create alias:
```bash
alias devenv='/usr/local/bin/devenv'
```

### Permission Denied

```bash
# Make executable
chmod +x /usr/local/bin/devenv

# Check ownership
ls -l /usr/local/bin/devenv

# Fix if needed
sudo chown $(whoami) /usr/local/bin/devenv
```

### Wrong Architecture

If you get "cannot execute binary file":
- Verify you downloaded the correct architecture
- Check with: `uname -m`
- Download the matching binary

### Port Already in Use

This tool doesn't use network ports. If you see this error, another process may be interfering.

## Support

- 📖 [Documentation](../README.md)
- 🐛 [Report Issues](https://github.com/sethtjf/devenv-scanner/issues)
- 💬 [Discussions](https://github.com/sethtjf/devenv-scanner/discussions)

## Next Steps

- Read [Getting Started](./getting-started.md)
- Explore [Usage Examples](./usage.md)
- Learn about [Distribution](./distribution.md)