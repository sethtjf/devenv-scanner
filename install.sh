#!/bin/bash

# DevEnv Scanner Install Script
set -e

VERSION="1.0.0"
REPO="yourusername/devenv-scanner"

# Detect platform and architecture
PLATFORM=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Map architecture names
case "$ARCH" in
  x86_64)
    ARCH="x64"
    ;;
  aarch64|arm64)
    ARCH="arm64"
    ;;
  *)
    echo "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

# Map platform names
case "$PLATFORM" in
  darwin)
    PLATFORM="macos"
    ;;
  linux)
    PLATFORM="linux"
    ;;
  *)
    echo "Unsupported platform: $PLATFORM"
    exit 1
    ;;
esac

BINARY_NAME="devenv-${PLATFORM}-${ARCH}"
DOWNLOAD_URL="https://github.com/${REPO}/releases/download/v${VERSION}/${BINARY_NAME}.tar.gz"

echo "🚀 Installing DevEnv Scanner v${VERSION}"
echo "Platform: ${PLATFORM}-${ARCH}"
echo ""

# Create temp directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# Download binary
echo "📦 Downloading from ${DOWNLOAD_URL}..."
if command -v curl >/dev/null 2>&1; then
  curl -L -o "${BINARY_NAME}.tar.gz" "$DOWNLOAD_URL"
elif command -v wget >/dev/null 2>&1; then
  wget -O "${BINARY_NAME}.tar.gz" "$DOWNLOAD_URL"
else
  echo "Error: curl or wget is required"
  exit 1
fi

# Extract
echo "📂 Extracting..."
tar -xzf "${BINARY_NAME}.tar.gz"

# Install
echo "📁 Installing to /usr/local/bin/devenv..."
sudo mv "$BINARY_NAME" /usr/local/bin/devenv
sudo chmod +x /usr/local/bin/devenv

# Cleanup
cd - >/dev/null
rm -rf "$TEMP_DIR"

# Verify installation
if command -v devenv >/dev/null 2>&1; then
  echo ""
  echo "✅ DevEnv Scanner installed successfully!"
  echo ""
  devenv --version
  echo ""
  echo "Run 'devenv --help' to get started"
else
  echo "❌ Installation failed"
  exit 1
fi