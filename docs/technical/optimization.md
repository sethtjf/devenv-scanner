# Binary Size Optimization Guide

## Current Status

The compiled Bun binaries are approximately **57MB** uncompressed, **21MB** compressed (tar.gz). This size is primarily due to the embedded Bun runtime.

## Bun Compile Options

### Available Flags for Size Optimization

1. **`--minify`** - Enables all minification (included with `--compile` by default)
   - `--minify-syntax` - Minify syntax and inline data
   - `--minify-whitespace` - Minify whitespace
   - `--minify-identifiers` - Minify identifiers
   - **Impact**: Minimal on binary size (saves ~200KB on source code)

2. **`--sourcemap=none`** - Disable sourcemaps
   - **Impact**: No significant size reduction for compiled binaries

3. **`--emit-dce-annotations`** - Dead code elimination
   - **Impact**: Minimal for compiled binaries

4. **`--external`** - Exclude packages from bundling
   - **Impact**: Not applicable for standalone binaries (breaks portability)

## Why Binaries Are Large

The 57MB size breakdown:
- **~50MB**: Bun runtime (JavaScript engine, native modules)
- **~7MB**: Your application code and dependencies

The Bun runtime includes:
- JavaScriptCore engine
- Node.js compatible APIs
- Native modules (fs, crypto, etc.)
- HTTP/WebSocket server
- SQLite driver
- All built-in Bun APIs

## Optimization Strategies

### 1. Post-Build Compression (Recommended)

```bash
# UPX compression (best compression, slower startup)
upx --best dist/devenv
# Result: ~20-25MB binary (60% reduction)

# Standard compression for distribution
tar -czf devenv.tar.gz dist/devenv
# Result: ~21MB (63% reduction)

# Brotli compression (better than gzip)
brotli -9 dist/devenv
# Result: ~19MB (66% reduction)
```

### 2. Alternative Approaches

#### A. Node.js + pkg (Smaller but slower)
```bash
# Using pkg for Node.js
npm install -g pkg
pkg src/index.js --targets node18-macos-arm64
# Result: ~30-40MB binary
```

#### B. Deno Compile (Similar size)
```bash
deno compile --allow-all src/index.ts
# Result: ~50-60MB binary
```

#### C. Go Rewrite (Smallest, most work)
```go
// Rewrite in Go for 5-10MB binaries
// Requires complete rewrite
```

### 3. Code-Level Optimizations

```typescript
// 1. Lazy load large dependencies
const getFiglet = async () => (await import('figlet')).default;

// 2. Remove unused dependencies
// Review package.json and remove unused packages

// 3. Use lightweight alternatives
// - Replace 'chalk' with simple ANSI codes
// - Replace 'ora' with simple console.log
// - Remove 'gradient-string' and 'figlet' for production

// 4. Tree-shake imports
import { specific } from 'package'; // Good
import * as package from 'package'; // Bad
```

### 4. Build Script for Minimal Binary

```bash
#!/bin/bash
# build-minimal.sh

# Remove non-essential features for smaller binary
cat > src/index-minimal.ts << 'EOF'
// Minimal version without fancy UI
import { Command } from "commander";
// ... core functionality only
EOF

bun build src/index-minimal.ts \
  --compile \
  --minify \
  --sourcemap=none \
  --outfile dist/devenv-minimal

# Apply UPX compression
upx --best dist/devenv-minimal
```

## Compression Tools Comparison

| Method | Size | Decompression | Notes |
|--------|------|---------------|-------|
| None | 57MB | N/A | Fast startup |
| tar.gz | 21MB | Required | Standard distribution |
| zip | 22MB | Required | Windows friendly |
| brotli | 19MB | Required | Best compression |
| UPX | 20-25MB | Built-in | Slower startup, self-extracting |
| 7z | 18MB | Required | Best ratio, less compatible |

## UPX Installation and Usage

```bash
# macOS
brew install upx

# Linux
apt-get install upx-ucl  # Debian/Ubuntu
dnf install upx          # Fedora
pacman -S upx            # Arch

# Usage
upx --best dist/devenv           # Best compression
upx -9 dist/devenv               # Maximum compression
upx --brute dist/devenv          # Try all methods (slow)
upx -d dist/devenv               # Decompress

# Check compression
upx -l dist/devenv               # List compression info
```

## Recommended Approach

For production distribution:

1. **Keep the standard 57MB binary** for development and power users
   - Fast startup
   - No decompression needed
   - Best debugging experience

2. **Provide compressed downloads** for distribution
   - tar.gz for Unix systems (21MB)
   - zip for Windows (22MB)

3. **Consider UPX** for space-constrained environments
   - Self-extracting 20-25MB binary
   - Slightly slower startup (100-200ms overhead)

4. **Document the tradeoffs** for users

## Future Optimizations

Bun team is working on:
- Selective runtime inclusion
- Module tree-shaking for compiled binaries
- Custom runtime builds
- Native module exclusion

Track progress: https://github.com/oven-sh/bun/issues

## Minimal Build Example

```typescript
// src/index-minimal.ts
// Remove UI dependencies for 5-10% size reduction

const scan = async () => {
  // Core scanning logic without ora/chalk/figlet
  console.log("Scanning...");
  // ... scanning code
  console.log("Complete!");
};

// This could reduce binary by 2-3MB
```

## Conclusion

Current options provide limited size reduction for Bun compiled binaries. The 57MB includes the entire Bun runtime, which is the primary contributor to size. Best practice is to:

1. Use compression for distribution (60-65% size reduction)
2. Consider UPX for self-extracting binaries if needed
3. Wait for Bun's roadmap improvements for smaller binaries
4. Accept the tradeoff: larger binary for excellent performance and zero dependencies