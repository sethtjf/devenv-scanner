# Architecture Overview

## System Design

DevEnv Scanner follows a modular, extensible architecture designed for maintainability and scalability.

```
┌─────────────────────────────────────────────┐
│                CLI Interface                 │
│            (Commander.js + UI)               │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│              Command Layer                   │
│     (scan, generate, compare, validate)      │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│            Scanner Orchestrator              │
│         (EnvironmentScanner class)           │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│             Scanner Modules                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │  System  │ │ Package  │ │ Runtime  │    │
│  │ Scanner  │ │ Manager  │ │ Scanner  │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │   Tool   │ │   Git    │ │  Shell   │    │
│  │ Scanner  │ │ Scanner  │ │ Scanner  │    │
│  └──────────┘ └──────────┘ └──────────┘    │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│            Generator Modules                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │   Bash   │ │  Docker  │ │ Ansible  │    │
│  │Generator │ │Generator │ │Generator │    │
│  └──────────┘ └──────────┘ └──────────┘    │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│              Utility Layer                   │
│        (exec, logger, file operations)       │
└─────────────────────────────────────────────┘
```

## Directory Structure

```
devenv-scanner/
├── src/
│   ├── index.ts              # Entry point & CLI setup
│   ├── commands/             # Command implementations
│   │   ├── scan.ts          # Scan command logic
│   │   ├── generate.ts      # Generate command logic
│   │   ├── compare.ts       # Compare command logic
│   │   └── validate.ts      # Validate command logic
│   ├── scanners/            # Scanner modules
│   │   ├── index.ts         # Scanner orchestrator
│   │   ├── system.ts        # System info scanner
│   │   ├── package-managers.ts
│   │   ├── runtimes.ts
│   │   ├── tools.ts
│   │   ├── git.ts
│   │   ├── shell.ts
│   │   └── vscode.ts
│   ├── generators/          # Output generators
│   │   ├── bash-script.ts   # Bash script generator
│   │   └── docker.ts        # Dockerfile generator
│   ├── types/               # TypeScript definitions
│   │   └── index.ts         # All type definitions
│   └── utils/               # Utility functions
│       ├── exec.ts          # Command execution
│       └── logger.ts        # Logging utilities
├── tests/                   # Test files
├── docs/                    # Documentation
├── scripts/                 # Build & utility scripts
└── dist/                    # Compiled output
```

## Core Components

### 1. CLI Layer

**Technology**: Commander.js
**Responsibilities**:
- Parse command-line arguments
- Route to appropriate commands
- Display help and version info
- Handle global options

**Key Files**:
- `src/index.ts` - CLI setup and routing

### 2. Command Layer

**Pattern**: Command Pattern
**Responsibilities**:
- Implement business logic for each command
- Coordinate scanners and generators
- Format and output results

**Commands**:
- `scan` - Orchestrate scanning process
- `generate` - Create scripts from scan data
- `compare` - Diff two environments
- `validate` - Check environment compliance

### 3. Scanner Layer

**Pattern**: Strategy Pattern
**Responsibilities**:
- Detect specific tools/configurations
- Return structured data
- Handle platform differences

**Interface**:
```typescript
interface Scanner {
  name: string;
  scan(): Promise<unknown>;
}
```

### 4. Generator Layer

**Pattern**: Template Method Pattern
**Responsibilities**:
- Transform scan data into scripts
- Generate platform-specific code
- Handle different output formats

**Interface**:
```typescript
interface Generator {
  generate(env: DeveloperEnvironment): string;
}
```

### 5. Utility Layer

**Responsibilities**:
- Execute shell commands safely
- Provide consistent logging
- Handle file operations
- Cross-platform compatibility

## Data Flow

### Scan Process

```
User Input → CLI Parser → Scan Command
    ↓
Scanner Orchestrator
    ↓
Parallel Execution of Scanners
    ↓
Aggregate Results into DeveloperEnvironment
    ↓
Format Output (JSON/YAML/Script/Summary)
    ↓
Write to File or stdout
```

### Generate Process

```
User Input → CLI Parser → Generate Command
    ↓
Read Scan File (JSON)
    ↓
Parse into DeveloperEnvironment
    ↓
Select Generator (Bash/Docker/Ansible)
    ↓
Transform Data to Script
    ↓
Write Output File
```

## Type System

### Core Types

```typescript
interface DeveloperEnvironment {
  timestamp: string;
  system: SystemInfo;
  packageManagers: PackageManager[];
  runtimes: Runtime[];
  tools: Tool[];
  git?: GitConfig;
  shell?: ShellConfig;
  vscode?: VSCodeConfig;
  docker?: DockerConfig;
  databases?: Tool[];
  customTools?: Tool[];
}
```

### Design Principles

1. **Extensibility**: Easy to add new scanners/generators
2. **Modularity**: Each component has single responsibility
3. **Type Safety**: Full TypeScript coverage
4. **Cross-Platform**: Works on macOS, Linux, Windows
5. **Zero Dependencies**: Standalone binary with Bun

## Performance Considerations

### Parallel Scanning

Scanners run concurrently for optimal performance:

```typescript
const results = await Promise.all(
  scanners.map(scanner => scanner.scan())
);
```

### Caching Strategy

- Command results cached during single scan
- No persistent cache between runs
- Trade-off: Freshness vs Performance

### Binary Size

- Compiled with Bun's `--compile` flag
- Includes full JavaScript runtime (~57MB)
- Minification has minimal impact
- Compressed distribution (~21MB)

## Error Handling

### Graceful Degradation

- Individual scanner failures don't stop scan
- Missing tools reported as "not installed"
- Partial results still useful

### Error Categories

1. **User Errors**: Invalid input, missing files
2. **System Errors**: Permission denied, command not found
3. **Network Errors**: Download failures (future)
4. **Internal Errors**: Bugs, unexpected states

### Error Reporting

```typescript
try {
  const result = await scanner.scan();
  // Process result
} catch (error) {
  logger.failSpinner(`Failed to scan ${scanner.name}`);
  logger.debug(`Error: ${error}`);
  // Continue with next scanner
}
```

## Security Considerations

### Command Execution

- Use Bun's safe command execution
- Avoid shell injection vulnerabilities
- Sanitize user input

### File Operations

- Validate file paths
- Check permissions before writing
- Don't overwrite without confirmation

### Sensitive Data

- Don't capture passwords or secrets
- Exclude sensitive environment variables
- Allow users to review before sharing

## Testing Strategy

### Unit Tests

- Test individual scanners
- Mock external commands
- Verify data structures

### Integration Tests

- Test full scan process
- Verify file generation
- Check command integration

### E2E Tests

- Test binary compilation
- Verify cross-platform compatibility
- Check real-world scenarios

## Build System

### Development Build

```bash
bun run dev  # Run from source
```

### Production Build

```bash
bun build --compile --minify
```

### Cross-Platform Builds

```bash
bun build --target=bun-darwin-arm64  # macOS ARM
bun build --target=bun-linux-x64     # Linux x64
bun build --target=bun-windows-x64   # Windows
```

## Deployment

### Distribution Methods

1. **GitHub Releases**: Automated binary builds
2. **Direct Download**: Compressed binaries
3. **Package Managers**: npm, Homebrew (planned)
4. **Container Images**: Docker Hub (planned)

### Version Management

- Semantic versioning (MAJOR.MINOR.PATCH)
- Git tags trigger releases
- Changelog maintenance

## Future Architecture Considerations

### Plugin System

```typescript
interface Plugin {
  name: string;
  version: string;
  scanner?: Scanner;
  generator?: Generator;
  command?: Command;
}
```

### Remote Scanning

- SSH into remote machines
- Docker container scanning
- Cloud environment scanning

### Configuration Management

```yaml
# .devenv.config.yml
scanners:
  include: [system, tools, runtimes]
  exclude: [vscode]
output:
  format: json
  file: environment.json
```

### API Server Mode

```typescript
// Future: REST API mode
app.get('/scan', async (req, res) => {
  const env = await scanner.scan();
  res.json(env);
});
```

## Contributing

### Adding a Scanner

1. Create scanner class in `src/scanners/`
2. Implement Scanner interface
3. Add to scanner registry
4. Update types
5. Add tests

### Adding a Generator

1. Create generator class in `src/generators/`
2. Implement generation logic
3. Add to generate command
4. Add tests

### Code Style

- TypeScript strict mode
- Functional programming where appropriate
- Async/await over callbacks
- Comprehensive error handling

## Performance Metrics

Typical scan times on modern hardware:

| Operation | Time |
|-----------|------|
| Full scan | ~2-3s |
| Binary startup | <100ms |
| JSON parsing | <10ms |
| Script generation | <50ms |

## Dependencies

### Runtime Dependencies
- commander: CLI framework
- chalk: Terminal colors
- ora: Spinner/progress
- inquirer: Interactive prompts
- figlet: ASCII art
- gradient-string: Gradient text

### Build Dependencies
- Bun: Runtime and bundler
- TypeScript: Type checking

### Why These Choices?

- **Commander**: Industry standard for CLIs
- **Chalk**: Reliable cross-platform colors
- **Ora**: Clean progress indication
- **Bun**: Fast, all-in-one toolchain

## Conclusion

DevEnv Scanner's architecture prioritizes:
- **Extensibility**: Easy to add features
- **Reliability**: Graceful error handling
- **Performance**: Parallel operations
- **Portability**: Single binary distribution
- **Maintainability**: Clean separation of concerns