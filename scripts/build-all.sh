#!/bin/bash

# Build script for creating binaries for all platforms
set -e

echo "🚀 Building DevEnv Scanner binaries for all platforms..."

# Clean dist directory
rm -rf dist
mkdir -p dist

# Build for each platform
echo "📦 Building macOS x64..."
bun build src/index.ts --compile --target=bun-darwin-x64 --outfile dist/devenv-macos-x64

echo "📦 Building macOS ARM64..."
bun build src/index.ts --compile --target=bun-darwin-arm64 --outfile dist/devenv-macos-arm64

echo "📦 Building Linux x64..."
bun build src/index.ts --compile --target=bun-linux-x64 --outfile dist/devenv-linux-x64

echo "📦 Building Linux ARM64..."
bun build src/index.ts --compile --target=bun-linux-arm64 --outfile dist/devenv-linux-arm64

echo "📦 Building Windows x64..."
bun build src/index.ts --compile --target=bun-windows-x64 --outfile dist/devenv-windows-x64.exe

# Create archives for each platform
echo "📁 Creating archives..."
cd dist

tar -czf devenv-macos-x64.tar.gz devenv-macos-x64
tar -czf devenv-macos-arm64.tar.gz devenv-macos-arm64
tar -czf devenv-linux-x64.tar.gz devenv-linux-x64
tar -czf devenv-linux-arm64.tar.gz devenv-linux-arm64
zip devenv-windows-x64.zip devenv-windows-x64.exe

cd ..

# Display file sizes
echo ""
echo "✅ Build complete! Binary sizes:"
ls -lh dist/*.tar.gz dist/*.zip 2>/dev/null || ls -lh dist/devenv-*

echo ""
echo "📋 Platform binaries created:"
echo "  • macOS x64:    dist/devenv-macos-x64"
echo "  • macOS ARM64:  dist/devenv-macos-arm64"
echo "  • Linux x64:    dist/devenv-linux-x64"
echo "  • Linux ARM64:  dist/devenv-linux-arm64"
echo "  • Windows x64:  dist/devenv-windows-x64.exe"