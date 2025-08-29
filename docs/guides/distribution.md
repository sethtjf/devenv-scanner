# Distribution Guide

## Building Binaries

DevEnv Scanner can be compiled into standalone binaries that run without requiring Bun or Node.js installed on the target system.

### Quick Build

Build for your current platform:
```bash
bun run build
```

This creates a binary at `dist/devenv` optimized for your system.

### Cross-Platform Builds

Build for all platforms:
```bash
./scripts/build-all.sh
```

Or build individually:
```bash
# macOS Intel
bun run build:macos

# macOS Apple Silicon
bun run build:macos-arm

# Linux x64
bun run build:linux

# Linux ARM64
bun run build:linux-arm

# Windows x64
bun run build:windows
```

## Binary Sizes

Typical binary sizes (compressed):
- **Uncompressed**: ~57MB
- **tar.gz**: ~22MB
- **zip**: ~22MB

The binaries are self-contained and include:
- Bun runtime
- All dependencies
- Your application code

## Distribution Methods

### 1. Direct Download

Host the binaries on your server or CDN:

```bash
# macOS/Linux users can download and install:
curl -L https://your-domain.com/devenv-macos-arm64.tar.gz | tar xz
sudo mv devenv-macos-arm64 /usr/local/bin/devenv
chmod +x /usr/local/bin/devenv
```

### 2. GitHub Releases

1. Create a new release on GitHub
2. Upload the binary archives from `dist/`
3. Users can download directly from the releases page

### 3. Install Script

Create an install script for easy setup:

```bash
#!/bin/bash
# install.sh

PLATFORM=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

if [ "$PLATFORM" = "darwin" ]; then
  if [ "$ARCH" = "arm64" ]; then
    URL="https://github.com/you/devenv-scanner/releases/latest/download/devenv-macos-arm64.tar.gz"
  else
    URL="https://github.com/you/devenv-scanner/releases/latest/download/devenv-macos-x64.tar.gz"
  fi
elif [ "$PLATFORM" = "linux" ]; then
  if [ "$ARCH" = "aarch64" ]; then
    URL="https://github.com/you/devenv-scanner/releases/latest/download/devenv-linux-arm64.tar.gz"
  else
    URL="https://github.com/you/devenv-scanner/releases/latest/download/devenv-linux-x64.tar.gz"
  fi
else
  echo "Unsupported platform: $PLATFORM"
  exit 1
fi

echo "Downloading DevEnv Scanner..."
curl -L "$URL" | tar xz
sudo mv devenv-* /usr/local/bin/devenv
chmod +x /usr/local/bin/devenv
echo "✅ DevEnv Scanner installed successfully!"
```

### 4. Homebrew (macOS/Linux)

Create a Homebrew formula:

```ruby
class DevenvScanner < Formula
  desc "Scan and recreate developer environments"
  homepage "https://github.com/you/devenv-scanner"
  version "1.0.0"
  
  if OS.mac? && Hardware::CPU.arm?
    url "https://github.com/you/devenv-scanner/releases/download/v1.0.0/devenv-macos-arm64.tar.gz"
    sha256 "YOUR_SHA256_HERE"
  elsif OS.mac?
    url "https://github.com/you/devenv-scanner/releases/download/v1.0.0/devenv-macos-x64.tar.gz"
    sha256 "YOUR_SHA256_HERE"
  elsif OS.linux? && Hardware::CPU.arm?
    url "https://github.com/you/devenv-scanner/releases/download/v1.0.0/devenv-linux-arm64.tar.gz"
    sha256 "YOUR_SHA256_HERE"
  else
    url "https://github.com/you/devenv-scanner/releases/download/v1.0.0/devenv-linux-x64.tar.gz"
    sha256 "YOUR_SHA256_HERE"
  end

  def install
    bin.install "devenv"
  end

  test do
    system "#{bin}/devenv", "--version"
  end
end
```

### 5. NPM Distribution (Alternative)

Although the binary doesn't require Node.js, you can still distribute via npm for convenience:

```json
{
  "name": "@yourorg/devenv-scanner",
  "version": "1.0.0",
  "bin": {
    "devenv": "./bin/devenv"
  },
  "scripts": {
    "postinstall": "node install.js"
  }
}
```

## Platform-Specific Notes

### macOS
- Binaries may need to be signed for distribution
- Users might need to allow execution in System Preferences
- First run: `xattr -c devenv` to clear quarantine flag

### Linux
- No special requirements
- Works on most modern distributions
- Ensure executable permissions: `chmod +x devenv`

### Windows
- `.exe` extension is automatically added
- May trigger Windows Defender on first run
- Consider code signing for smoother experience

## Verifying Binaries

Generate checksums for verification:

```bash
# Generate SHA256 checksums
cd dist
shasum -a 256 *.tar.gz *.zip > checksums.txt
```

Users can verify:
```bash
shasum -c checksums.txt
```

## Testing Distribution

Test each binary before release:

```bash
# Test basic functionality
./dist/devenv --version
./dist/devenv --help
./dist/devenv scan --format json | jq .

# Test on different systems using Docker
docker run -it -v $(pwd)/dist:/dist ubuntu:latest /dist/devenv-linux-x64 --version
docker run -it -v $(pwd)/dist:/dist alpine:latest /dist/devenv-linux-x64 --version
```

## Updating

For updates, users can:
1. Download the new binary
2. Replace the old one
3. Or use a package manager if available

Consider implementing a self-update command:
```bash
devenv self-update
```

## Troubleshooting

Common issues and solutions:

1. **"Permission denied"**
   - Solution: `chmod +x devenv`

2. **"Cannot execute binary file"**
   - Wrong architecture, download correct version

3. **"Command not found"**
   - Add to PATH or move to `/usr/local/bin`

4. **macOS: "cannot be opened because the developer cannot be verified"**
   - Solution: `xattr -c devenv` or allow in System Preferences

## License Compliance

When distributing binaries:
- Include LICENSE file
- Ensure all dependencies' licenses are compatible
- Consider adding license text to `--version` output