# Alternative Build Strategies for Smaller Binaries

## Current Situation
- **Your code**: ~100KB
- **Dependencies**: ~53MB (mostly UI libraries like figlet, chalk, ora)
- **Bun compiled binary**: 57MB (includes entire Bun runtime)

## Option 1: Regular Node.js Bundle (2-3MB)
Instead of a compiled binary, create a bundled JS file that requires Node.js:

```bash
# Bundle to single JS file
bun build src/index.ts --outfile=dist/devenv.js --target=node

# Create a wrapper script
echo '#!/usr/bin/env node' > dist/devenv
cat dist/devenv.js >> dist/devenv
chmod +x dist/devenv

# Result: ~2-3MB file (requires Node.js installed)
```

## Option 2: Minimal Version Without UI Libraries
Remove heavy dependencies for a tiny binary:

```typescript
// src/index-minimal.ts
// No figlet (1.5MB), no gradient-string (2MB), minimal chalk
import { execSync } from 'child_process';

const scan = () => {
  console.log('Scanning environment...');
  
  const result = {
    node: execSync('node --version').toString().trim(),
    npm: execSync('npm --version').toString().trim(),
    // ... minimal scanning
  };
  
  console.log(JSON.stringify(result, null, 2));
};

scan();
```

## Option 3: Use pkg for Smaller Binaries (30-40MB)
```bash
# Install pkg
npm install -g pkg

# Build with pkg (creates 30-40MB binaries)
pkg src/index.js --targets node18-macos-arm64 --compress GZip
```

## Option 4: Deno Compile (Similar issue, 50-60MB)
```bash
# Convert to Deno and compile
deno compile --allow-all src/index.ts
```

## Option 5: Shell Script Approach (< 100KB)
Rewrite core functionality as a shell script:

```bash
#!/bin/bash
# devenv-scanner.sh

scan_environment() {
  echo "{"
  echo "  \"node\": \"$(node --version 2>/dev/null || echo 'not installed')\","
  echo "  \"npm\": \"$(npm --version 2>/dev/null || echo 'not installed')\","
  echo "  \"git\": \"$(git --version 2>/dev/null || echo 'not installed')\""
  echo "}"
}

scan_environment
```

## Option 6: Go Rewrite (5-10MB binaries)
Rewrite in Go for truly small binaries:

```go
package main

import (
    "encoding/json"
    "fmt"
    "os/exec"
)

func getVersion(cmd string, args ...string) string {
    out, err := exec.Command(cmd, args...).Output()
    if err != nil {
        return "not installed"
    }
    return string(out)
}

func main() {
    env := map[string]string{
        "node": getVersion("node", "--version"),
        "npm":  getVersion("npm", "--version"),
        "git":  getVersion("git", "--version"),
    }
    
    json, _ := json.MarshalIndent(env, "", "  ")
    fmt.Println(string(json))
}

// Compile: go build -ldflags="-s -w" -o devenv main.go
// Result: 5-10MB binary
```

## The Reality of JavaScript Runtimes

| Runtime | Compiled Binary Size | Why So Large? |
|---------|---------------------|---------------|
| Bun | ~50-60MB | Includes JavaScriptCore, all APIs |
| Node.js (pkg) | ~30-40MB | Includes V8 engine |
| Deno | ~50-60MB | Includes V8 engine + Rust runtime |
| Electron | ~150MB+ | Includes Chromium |

## Recommended Solution

### For Your Use Case:

1. **Keep Bun for Development** (fast, convenient)
   ```bash
   bun run dev
   ```

2. **Ship as Node.js Script** (2-3MB, requires Node)
   ```bash
   bun build src/index.ts --target=node --outfile=dist/devenv.js
   ```

3. **Or Create Two Versions:**
   - **Full version**: 57MB standalone (current)
   - **Lite version**: 2-3MB Node.js script

### Create Lite Version:
```bash
# Build lite version (requires Node.js)
bun build src/index.ts \
  --target=node \
  --minify \
  --outfile=dist/devenv-lite.js

# Add shebang
echo '#!/usr/bin/env node' | cat - dist/devenv-lite.js > dist/devenv-lite
chmod +x dist/devenv-lite

# Now it's only 2-3MB but requires Node.js
```

## Why This Happens

The 57MB Bun binary includes:
- **JavaScriptCore Engine**: ~40MB
- **Node.js compatibility layer**: ~5MB  
- **Bun-specific APIs**: ~5MB
- **Your code + dependencies**: ~7MB

This is the price of "zero dependencies" - the runtime IS the dependency, embedded in the binary.

## Conclusion

If size is critical:
1. **Use Node.js + npm global install** (smallest, 2-3MB)
2. **Rewrite in Go/Rust** (5-10MB standalone)
3. **Accept the 57MB** (truly standalone, zero deps)

The 57MB is not your code's fault - it's the cost of embedding an entire JavaScript runtime.