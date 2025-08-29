# Contributing to DevEnv Scanner

Thank you for your interest in contributing to DevEnv Scanner! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept feedback gracefully

## How to Contribute

### Reporting Issues

1. Check if the issue already exists in [GitHub Issues](https://github.com/sethtjf/devenv-scanner/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - System information (OS, architecture)
   - DevEnv Scanner version

### Suggesting Features

1. Check [existing issues](https://github.com/sethtjf/devenv-scanner/issues?q=is%3Aissue+label%3Aenhancement) for similar requests
2. Open a new issue with `enhancement` label
3. Describe the feature and use case
4. Provide examples if possible

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Ensure tests pass (`bun test`)
6. Commit with descriptive message
7. Push to your fork
8. Open a Pull Request

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) v1.0 or later
- Git
- Code editor (VS Code recommended)

### Local Development

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/devenv-scanner.git
cd devenv-scanner

# Install dependencies
bun install

# Run in development mode
bun run dev scan

# Run tests
bun test

# Type checking
bun run typecheck

# Build binary
bun run build
```

### Project Structure

```
src/
├── index.ts           # Entry point
├── commands/          # CLI commands
├── scanners/          # Scanner modules
├── generators/        # Output generators
├── types/            # TypeScript types
└── utils/            # Utilities
```

## Development Guidelines

### Code Style

We use TypeScript with strict mode enabled. Follow these conventions:

```typescript
// ✅ Good: Clear, typed, documented
/**
 * Scans for installed Node.js packages
 * @returns Array of package information
 */
export async function scanPackages(): Promise<Package[]> {
  const packages: Package[] = [];
  // Implementation
  return packages;
}

// ❌ Bad: Unclear, untyped
export async function scan() {
  const stuff = [];
  // Implementation
  return stuff;
}
```

### Naming Conventions

- **Files**: kebab-case (`package-manager.ts`)
- **Classes**: PascalCase (`PackageManagerScanner`)
- **Functions**: camelCase (`scanPackages`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_TIMEOUT`)
- **Interfaces**: PascalCase with 'I' prefix optional (`Scanner` or `IScanner`)

### Testing

Write tests for new features:

```typescript
// src/scanners/custom.test.ts
import { test, expect } from "bun:test";
import { CustomScanner } from "./custom.ts";

test("CustomScanner detects tools", async () => {
  const scanner = new CustomScanner();
  const result = await scanner.scan();
  
  expect(result).toBeDefined();
  expect(Array.isArray(result)).toBe(true);
});
```

Run tests:
```bash
bun test                 # Run all tests
bun test scanner        # Run tests matching "scanner"
bun test --watch        # Watch mode
```

### Documentation

- Add JSDoc comments for public APIs
- Update README for new features
- Add usage examples
- Document breaking changes

### Commit Messages

Follow conventional commits:

```
feat: add Docker scanner
fix: handle missing git config
docs: update installation guide
test: add scanner unit tests
refactor: simplify exec utility
chore: update dependencies
```

## Adding New Features

### Adding a Scanner

1. Create scanner file:
```typescript
// src/scanners/mynew.ts
import type { Scanner } from "../types/index.ts";

export class MyNewScanner implements Scanner {
  name = "My New Scanner";
  
  async scan(): Promise<MyData[]> {
    // Implementation
  }
}
```

2. Register scanner:
```typescript
// src/scanners/index.ts
import { MyNewScanner } from "./mynew.ts";

const scanners = [
  // ... existing scanners
  new MyNewScanner(),
];
```

3. Add types:
```typescript
// src/types/index.ts
export interface DeveloperEnvironment {
  // ... existing fields
  myNewData?: MyData[];
}
```

4. Add tests:
```typescript
// src/scanners/mynew.test.ts
test("MyNewScanner works", async () => {
  // Test implementation
});
```

### Adding a Generator

1. Create generator:
```typescript
// src/generators/mynew.ts
export class MyNewGenerator {
  generate(env: DeveloperEnvironment): string {
    // Implementation
  }
}
```

2. Add to generate command:
```typescript
// src/commands/generate.ts
case "mynew":
  const generator = new MyNewGenerator();
  content = generator.generate(environment);
  break;
```

### Adding a Command

1. Create command file:
```typescript
// src/commands/mynew.ts
export async function myNewCommand(options: any): Promise<void> {
  // Implementation
}
```

2. Register in CLI:
```typescript
// src/index.ts
program
  .command("mynew")
  .description("My new command")
  .action(myNewCommand);
```

## Testing Checklist

Before submitting a PR, ensure:

- [ ] All tests pass (`bun test`)
- [ ] TypeScript compiles (`bun run typecheck`)
- [ ] Binary builds (`bun run build`)
- [ ] Binary works (`./dist/devenv --version`)
- [ ] Documentation updated
- [ ] Changelog updated (if applicable)

## Performance Guidelines

### Do's
- Use parallel operations (`Promise.all`)
- Cache expensive operations
- Handle errors gracefully
- Test on multiple platforms

### Don'ts
- Block the event loop
- Make synchronous file operations
- Ignore error cases
- Assume tool availability

## Release Process

Maintainers follow this process:

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Commit changes
4. Create git tag: `git tag -a v1.0.0 -m "Release v1.0.0"`
5. Push tag: `git push origin v1.0.0`
6. GitHub Actions builds and releases

## Getting Help

- 💬 [GitHub Discussions](https://github.com/sethtjf/devenv-scanner/discussions)
- 🐛 [Issue Tracker](https://github.com/sethtjf/devenv-scanner/issues)
- 📖 [Documentation](./docs/README.md)

## Recognition

Contributors are recognized in:
- CONTRIBUTORS.md file
- GitHub contributors page
- Release notes

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You!

Your contributions make DevEnv Scanner better for everyone. We appreciate your time and effort!