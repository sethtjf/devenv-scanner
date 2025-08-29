#\!/bin/bash
set -e

echo "🔬 Testing different build optimization strategies..."
mkdir -p dist/optimized

# 1. Standard compile
echo "📦 Building standard binary..."
bun build src/index.ts --compile --outfile dist/optimized/devenv-standard

# 2. With minification
echo "📦 Building with minification..."
bun build src/index.ts --compile --minify --outfile dist/optimized/devenv-minified

# 3. Without sourcemaps
echo "📦 Building without sourcemaps..."
bun build src/index.ts --compile --sourcemap=none --outfile dist/optimized/devenv-nosourcemap

# Compare sizes
echo ""
echo "📊 Binary size comparison:"
ls -lh dist/optimized/devenv-* | awk '{printf "%-30s %s\n", $9, $5}'
