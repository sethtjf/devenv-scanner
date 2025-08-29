import { readFileSync } from "fs";
import chalk from "chalk";
import type { DeveloperEnvironment } from "../types/index.ts";
import { EnvironmentScanner } from "../scanners/index.ts";
import { Logger } from "../utils/logger.ts";

export async function validateCommand(file: string, options: any): Promise<void> {
  const logger = new Logger(options.verbose);
  
  try {
    logger.info(`Validating against: ${file}`);
    
    const expected: DeveloperEnvironment = JSON.parse(readFileSync(file, "utf-8"));
    const scanner = new EnvironmentScanner({ verbose: options.verbose });
    const current = await scanner.scan();
    
    const issues = {
      missing: {
        packageManagers: [] as string[],
        runtimes: [] as string[],
        tools: [] as string[],
        vscodeExtensions: [] as string[],
      },
      version: {
        packageManagers: [] as string[],
        runtimes: [] as string[],
        tools: [] as string[],
      },
    };
    
    // Validate package managers
    const currentPmNames = new Set(current.packageManagers.map(pm => pm.name));
    for (const pm of expected.packageManagers) {
      if (!currentPmNames.has(pm.name)) {
        issues.missing.packageManagers.push(`${pm.name} (${pm.version})`);
      } else {
        const currentPm = current.packageManagers.find(p => p.name === pm.name);
        if (currentPm && currentPm.version !== pm.version) {
          issues.version.packageManagers.push(
            `${pm.name}: expected ${pm.version}, found ${currentPm.version}`
          );
        }
      }
    }
    
    // Validate runtimes
    const currentRuntimeNames = new Set(current.runtimes.map(r => r.name));
    for (const runtime of expected.runtimes) {
      if (!currentRuntimeNames.has(runtime.name)) {
        issues.missing.runtimes.push(`${runtime.name} (${runtime.version})`);
      } else {
        const currentRuntime = current.runtimes.find(r => r.name === runtime.name);
        if (currentRuntime && currentRuntime.version !== runtime.version) {
          issues.version.runtimes.push(
            `${runtime.name}: expected ${runtime.version}, found ${currentRuntime.version}`
          );
        }
      }
    }
    
    // Validate tools
    const currentToolNames = new Set(current.tools.map(t => t.name));
    for (const tool of expected.tools) {
      if (!currentToolNames.has(tool.name)) {
        issues.missing.tools.push(`${tool.name} (${tool.version})`);
      } else {
        const currentTool = current.tools.find(t => t.name === tool.name);
        if (currentTool && currentTool.version !== tool.version) {
          issues.version.tools.push(
            `${tool.name}: expected ${tool.version}, found ${currentTool.version}`
          );
        }
      }
    }
    
    // Validate VS Code extensions
    if (expected.vscode?.extensions) {
      const currentExtIds = new Set(current.vscode?.extensions?.map(e => e.id) || []);
      for (const ext of expected.vscode.extensions) {
        if (!currentExtIds.has(ext.id)) {
          issues.missing.vscodeExtensions.push(ext.id);
        }
      }
    }
    
    // Display results
    console.log("");
    console.log(chalk.bold.cyan("🔍 Environment Validation"));
    console.log(chalk.dim(`  Expected: ${file} (${expected.timestamp})`));
    console.log(chalk.dim(`  Current: Scanned at ${current.timestamp}`));
    console.log("");
    
    let hasIssues = false;
    
    // Display missing items
    for (const [category, items] of Object.entries(issues.missing)) {
      if (items.length > 0) {
        hasIssues = true;
        console.log(chalk.red(`❌ Missing ${category}:`));
        for (const item of items) {
          console.log(chalk.red(`  - ${item}`));
        }
        console.log("");
      }
    }
    
    // Display version mismatches
    for (const [category, items] of Object.entries(issues.version)) {
      if (items.length > 0) {
        hasIssues = true;
        console.log(chalk.yellow(`⚠️  Version mismatch in ${category}:`));
        for (const item of items) {
          console.log(chalk.yellow(`  ~ ${item}`));
        }
        console.log("");
      }
    }
    
    if (!hasIssues) {
      logger.success("✅ Environment matches the expected configuration!");
    } else {
      logger.warn("Environment does not match the expected configuration");
      logger.info("Run the generated setup script to install missing components");
      process.exit(1);
    }
  } catch (error) {
    logger.error(`Failed to validate environment: ${error}`);
    process.exit(1);
  }
}