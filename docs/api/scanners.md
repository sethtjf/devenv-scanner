# Scanner API Documentation

## Overview

Scanners are the core components that detect and collect information about different aspects of the development environment. Each scanner implements the `Scanner` interface and focuses on a specific area.

## Scanner Interface

```typescript
interface Scanner {
  name: string;
  scan(): Promise<unknown>;
}
```

## Built-in Scanners

### SystemScanner
Collects system information including OS, architecture, hostname, and shell.

```typescript
class SystemScanner implements Scanner {
  name = "System Information";
  async scan(): Promise<SystemInfo> {
    // Returns OS, arch, hostname, username, shell, homeDir
  }
}
```

### PackageManagerScanner
Detects installed package managers and their global packages.

```typescript
class PackageManagerScanner implements Scanner {
  name = "Package Managers";
  async scan(): Promise<PackageManager[]> {
    // Returns npm, yarn, pnpm, bun, brew, apt, etc.
  }
}
```

### RuntimeScanner
Identifies programming language runtimes and their versions.

```typescript
class RuntimeScanner implements Scanner {
  name = "Programming Runtimes";
  async scan(): Promise<Runtime[]> {
    // Returns node, python, ruby, go, rust, java, etc.
  }
}
```

### ToolScanner
Discovers development tools and utilities.

```typescript
class ToolScanner implements Scanner {
  name = "Development Tools";
  async scan(): Promise<Tool[]> {
    // Returns git, docker, vim, vscode, databases, etc.
  }
}
```

### GitScanner
Extracts Git global configuration.

```typescript
class GitScanner implements Scanner {
  name = "Git Configuration";
  async scan(): Promise<GitConfig | null> {
    // Returns user name, email, aliases, default branch
  }
}
```

### ShellScanner
Analyzes shell configuration files and environment.

```typescript
class ShellScanner implements Scanner {
  name = "Shell Configuration";
  async scan(): Promise<ShellConfig> {
    // Returns shell type, config files, aliases, exports
  }
}
```

### VSCodeScanner
Detects VS Code extensions and settings.

```typescript
class VSCodeScanner implements Scanner {
  name = "VS Code Configuration";
  async scan(): Promise<VSCodeConfig | null> {
    // Returns extensions list and settings
  }
}
```

## Creating Custom Scanners

### Step 1: Implement the Scanner Interface

Create a new file in `src/scanners/`:

```typescript
// src/scanners/custom.ts
import type { Scanner } from "../types/index.ts";

export interface CustomData {
  name: string;
  version: string;
  config?: any;
}

export class CustomScanner implements Scanner {
  name = "Custom Scanner";

  async scan(): Promise<CustomData[]> {
    const results: CustomData[] = [];
    
    // Your scanning logic here
    // Example: Check for specific files, run commands, etc.
    
    return results;
  }
}
```

### Step 2: Add to Scanner Registry

Update `src/scanners/index.ts`:

```typescript
import { CustomScanner } from "./custom.ts";

// In the EnvironmentScanner class
const scanners = [
  new SystemScanner(),
  new PackageManagerScanner(),
  // ... other scanners
  new CustomScanner(), // Add your scanner
];
```

### Step 3: Update Types

Add your data type to `src/types/index.ts`:

```typescript
export interface DeveloperEnvironment {
  // ... existing fields
  custom?: CustomData[]; // Add your field
}
```

### Step 4: Handle Results

Update the scanner result handling:

```typescript
// In src/scanners/index.ts
switch (scanner.name) {
  // ... existing cases
  case "Custom Scanner":
    environment.custom = result as CustomData[];
    break;
}
```

## Example: Database Scanner

Here's a complete example of adding a database scanner:

```typescript
// src/scanners/databases.ts
import { commandExists, getCommandVersion } from "../utils/exec.ts";
import type { Scanner } from "../types/index.ts";

export interface Database {
  name: string;
  version: string;
  running: boolean;
  port?: number;
}

export class DatabaseScanner implements Scanner {
  name = "Databases";

  private databases = [
    { name: "postgresql", command: "psql", versionFlag: "--version", defaultPort: 5432 },
    { name: "mysql", command: "mysql", versionFlag: "--version", defaultPort: 3306 },
    { name: "mongodb", command: "mongosh", versionFlag: "--version", defaultPort: 27017 },
    { name: "redis", command: "redis-cli", versionFlag: "--version", defaultPort: 6379 },
  ];

  async scan(): Promise<Database[]> {
    const results: Database[] = [];

    for (const db of this.databases) {
      if (await commandExists(db.command)) {
        const version = await getCommandVersion(db.command, db.versionFlag);
        const running = await this.checkIfRunning(db.defaultPort);
        
        results.push({
          name: db.name,
          version,
          running,
          port: running ? db.defaultPort : undefined,
        });
      }
    }

    return results;
  }

  private async checkIfRunning(port: number): Promise<boolean> {
    try {
      const result = await execCommand(`lsof -i :${port}`);
      return result.length > 0;
    } catch {
      return false;
    }
  }
}
```

## Scanner Best Practices

### 1. Error Handling

Always handle errors gracefully:

```typescript
async scan(): Promise<Data | null> {
  try {
    // Scanning logic
    return data;
  } catch (error) {
    // Log error if verbose mode
    this.logger?.debug(`Failed to scan: ${error}`);
    return null;
  }
}
```

### 2. Performance

Make scanners efficient:

```typescript
// Bad: Sequential checks
for (const tool of tools) {
  await checkTool(tool);
}

// Good: Parallel checks
await Promise.all(tools.map(tool => checkTool(tool)));
```

### 3. Cross-Platform Compatibility

Consider different operating systems:

```typescript
private getConfigPath(): string {
  const home = os.homedir();
  
  if (process.platform === "win32") {
    return path.join(home, "AppData", "Roaming", "MyApp");
  } else if (process.platform === "darwin") {
    return path.join(home, "Library", "Application Support", "MyApp");
  } else {
    return path.join(home, ".config", "myapp");
  }
}
```

### 4. Caching

Cache expensive operations:

```typescript
export class CachedScanner implements Scanner {
  private cache?: Data;
  private cacheTime?: number;
  private readonly CACHE_DURATION = 60000; // 1 minute

  async scan(): Promise<Data> {
    const now = Date.now();
    
    if (this.cache && this.cacheTime && (now - this.cacheTime) < this.CACHE_DURATION) {
      return this.cache;
    }

    const data = await this.performScan();
    this.cache = data;
    this.cacheTime = now;
    
    return data;
  }
}
```

### 5. Logging

Use the logger for debugging:

```typescript
export class VerboseScanner implements Scanner {
  constructor(private logger?: Logger) {}

  async scan(): Promise<Data> {
    this.logger?.debug("Starting scan...");
    
    const data = await this.performScan();
    
    this.logger?.debug(`Found ${data.length} items`);
    
    return data;
  }
}
```

## Testing Scanners

Create tests for your scanners:

```typescript
// src/scanners/custom.test.ts
import { test, expect } from "bun:test";
import { CustomScanner } from "./custom.ts";

test("CustomScanner should detect tools", async () => {
  const scanner = new CustomScanner();
  const result = await scanner.scan();
  
  expect(result).toBeDefined();
  expect(Array.isArray(result)).toBe(true);
});

test("CustomScanner should handle missing tools", async () => {
  const scanner = new CustomScanner();
  // Mock missing tool scenario
  const result = await scanner.scan();
  
  expect(result).toEqual([]);
});
```

## Utility Functions

Available utility functions in `src/utils/exec.ts`:

```typescript
// Execute a shell command
execCommand(command: string): Promise<string>

// Check if a command exists
commandExists(command: string): Promise<boolean>

// Get version of a command
getCommandVersion(command: string, versionFlag?: string): Promise<string>

// Get path to a command
getCommandPath(command: string): Promise<string>
```

## Contributing

When contributing a new scanner:

1. Follow the existing code style
2. Add comprehensive tests
3. Update documentation
4. Ensure cross-platform compatibility
5. Submit a pull request with description

## Advanced Topics

### Dynamic Scanner Loading

For plugin-based scanners:

```typescript
export class ScannerRegistry {
  private scanners: Map<string, Scanner> = new Map();

  register(scanner: Scanner): void {
    this.scanners.set(scanner.name, scanner);
  }

  async scanAll(): Promise<Map<string, unknown>> {
    const results = new Map<string, unknown>();
    
    for (const [name, scanner] of this.scanners) {
      results.set(name, await scanner.scan());
    }
    
    return results;
  }
}
```

### Conditional Scanning

Skip scanners based on conditions:

```typescript
export class ConditionalScanner implements Scanner {
  async shouldRun(): Promise<boolean> {
    // Check if this scanner should run
    return await commandExists("docker");
  }

  async scan(): Promise<Data | null> {
    if (!await this.shouldRun()) {
      return null;
    }
    
    // Perform scan
    return data;
  }
}
```

## API Reference

See the [TypeScript definitions](../../src/types/index.ts) for complete type information.