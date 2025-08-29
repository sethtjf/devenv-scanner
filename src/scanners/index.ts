import type { DeveloperEnvironment, ScanOptions } from "../types/index.ts";
import { Logger } from "../utils/logger.ts";
import { SystemScanner } from "./system.ts";
import { PackageManagerScanner } from "./package-managers.ts";
import { RuntimeScanner } from "./runtimes.ts";
import { ToolScanner } from "./tools.ts";
import { GitScanner } from "./git.ts";
import { ShellScanner } from "./shell.ts";
import { VSCodeScanner } from "./vscode.ts";

export class EnvironmentScanner {
  private logger: Logger;
  private options: ScanOptions;

  constructor(options: ScanOptions = {}) {
    this.options = options;
    this.logger = new Logger(options.verbose);
  }

  async scan(): Promise<DeveloperEnvironment> {
    // Only show progress for non-JSON/YAML output
    const showProgress = this.options.format !== 'json' && this.options.format !== 'yaml';
    
    if (showProgress) {
      this.logger.info("Starting environment scan...");
    }
    
    const scanners = [
      new SystemScanner(),
      new PackageManagerScanner(),
      new RuntimeScanner(),
      new ToolScanner(),
      new GitScanner(),
      new ShellScanner(),
      new VSCodeScanner(),
    ];

    const environment: DeveloperEnvironment = {
      timestamp: new Date().toISOString(),
      system: {} as any,
      packageManagers: [],
      runtimes: [],
      tools: [],
    };

    for (const scanner of scanners) {
      if (showProgress) {
        this.logger.startSpinner(`Scanning ${scanner.name}...`);
      }
      
      try {
        const result = await scanner.scan();
        
        switch (scanner.name) {
          case "System Information":
            environment.system = result as any;
            break;
          case "Package Managers":
            environment.packageManagers = result as any;
            break;
          case "Programming Runtimes":
            environment.runtimes = result as any;
            break;
          case "Development Tools":
            environment.tools = result as any;
            break;
          case "Git Configuration":
            if (result) environment.git = result as any;
            break;
          case "Shell Configuration":
            environment.shell = result as any;
            break;
          case "VS Code Configuration":
            if (result) environment.vscode = result as any;
            break;
        }
        
        if (showProgress) {
          this.logger.succeedSpinner(`${scanner.name} scanned`);
        }
      } catch (error) {
        if (showProgress) {
          this.logger.failSpinner(`Failed to scan ${scanner.name}`);
        }
        this.logger.debug(`Error: ${error}`);
      }
    }

    if (showProgress) {
      this.logger.success("Environment scan complete!");
    }
    return environment;
  }
}