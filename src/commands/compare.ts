import { readFileSync } from "fs";
import chalk from "chalk";
import type { DeveloperEnvironment } from "../types/index.ts";
import { Logger } from "../utils/logger.ts";

export async function compareCommand(file1: string, file2: string, options: any): Promise<void> {
  const logger = new Logger(options.verbose);
  
  try {
    logger.info(`Comparing ${file1} and ${file2}`);
    
    const env1: DeveloperEnvironment = JSON.parse(readFileSync(file1, "utf-8"));
    const env2: DeveloperEnvironment = JSON.parse(readFileSync(file2, "utf-8"));
    
    const differences = {
      added: {
        packageManagers: [] as string[],
        runtimes: [] as string[],
        tools: [] as string[],
        vscodeExtensions: [] as string[],
      },
      removed: {
        packageManagers: [] as string[],
        runtimes: [] as string[],
        tools: [] as string[],
        vscodeExtensions: [] as string[],
      },
      changed: {
        packageManagers: [] as string[],
        runtimes: [] as string[],
        tools: [] as string[],
      },
    };
    
    // Compare package managers
    const pm1Names = new Set(env1.packageManagers.map(pm => pm.name));
    const pm2Names = new Set(env2.packageManagers.map(pm => pm.name));
    
    for (const pm of env2.packageManagers) {
      if (!pm1Names.has(pm.name)) {
        differences.added.packageManagers.push(`${pm.name} (${pm.version})`);
      } else {
        const pm1 = env1.packageManagers.find(p => p.name === pm.name);
        if (pm1 && pm1.version !== pm.version) {
          differences.changed.packageManagers.push(`${pm.name}: ${pm1.version} → ${pm.version}`);
        }
      }
    }
    
    for (const pm of env1.packageManagers) {
      if (!pm2Names.has(pm.name)) {
        differences.removed.packageManagers.push(`${pm.name} (${pm.version})`);
      }
    }
    
    // Compare runtimes
    const runtime1Names = new Set(env1.runtimes.map(r => r.name));
    const runtime2Names = new Set(env2.runtimes.map(r => r.name));
    
    for (const runtime of env2.runtimes) {
      if (!runtime1Names.has(runtime.name)) {
        differences.added.runtimes.push(`${runtime.name} (${runtime.version})`);
      } else {
        const runtime1 = env1.runtimes.find(r => r.name === runtime.name);
        if (runtime1 && runtime1.version !== runtime.version) {
          differences.changed.runtimes.push(`${runtime.name}: ${runtime1.version} → ${runtime.version}`);
        }
      }
    }
    
    for (const runtime of env1.runtimes) {
      if (!runtime2Names.has(runtime.name)) {
        differences.removed.runtimes.push(`${runtime.name} (${runtime.version})`);
      }
    }
    
    // Compare tools
    const tool1Names = new Set(env1.tools.map(t => t.name));
    const tool2Names = new Set(env2.tools.map(t => t.name));
    
    for (const tool of env2.tools) {
      if (!tool1Names.has(tool.name)) {
        differences.added.tools.push(`${tool.name} (${tool.version})`);
      } else {
        const tool1 = env1.tools.find(t => t.name === tool.name);
        if (tool1 && tool1.version !== tool.version) {
          differences.changed.tools.push(`${tool.name}: ${tool1.version} → ${tool.version}`);
        }
      }
    }
    
    for (const tool of env1.tools) {
      if (!tool2Names.has(tool.name)) {
        differences.removed.tools.push(`${tool.name} (${tool.version})`);
      }
    }
    
    // Compare VS Code extensions
    if (env1.vscode?.extensions && env2.vscode?.extensions) {
      const ext1Ids = new Set(env1.vscode.extensions.map(e => e.id));
      const ext2Ids = new Set(env2.vscode.extensions.map(e => e.id));
      
      for (const ext of env2.vscode.extensions) {
        if (!ext1Ids.has(ext.id)) {
          differences.added.vscodeExtensions.push(ext.id);
        }
      }
      
      for (const ext of env1.vscode.extensions) {
        if (!ext2Ids.has(ext.id)) {
          differences.removed.vscodeExtensions.push(ext.id);
        }
      }
    }
    
    // Display results
    console.log("");
    console.log(chalk.bold.cyan("📊 Environment Comparison"));
    console.log(chalk.dim(`  File 1: ${file1} (${env1.timestamp})`));
    console.log(chalk.dim(`  File 2: ${file2} (${env2.timestamp})`));
    console.log("");
    
    let hasChanges = false;
    
    // Display additions
    for (const [category, items] of Object.entries(differences.added)) {
      if (items.length > 0) {
        hasChanges = true;
        console.log(chalk.green(`✨ Added ${category}:`));
        for (const item of items) {
          console.log(chalk.green(`  + ${item}`));
        }
        console.log("");
      }
    }
    
    // Display removals
    for (const [category, items] of Object.entries(differences.removed)) {
      if (items.length > 0) {
        hasChanges = true;
        console.log(chalk.red(`❌ Removed ${category}:`));
        for (const item of items) {
          console.log(chalk.red(`  - ${item}`));
        }
        console.log("");
      }
    }
    
    // Display changes
    for (const [category, items] of Object.entries(differences.changed)) {
      if (items.length > 0) {
        hasChanges = true;
        console.log(chalk.yellow(`🔄 Changed ${category}:`));
        for (const item of items) {
          console.log(chalk.yellow(`  ~ ${item}`));
        }
        console.log("");
      }
    }
    
    if (!hasChanges) {
      logger.success("No differences found between the two environments");
    } else {
      logger.info("Comparison complete");
    }
  } catch (error) {
    logger.error(`Failed to compare files: ${error}`);
    process.exit(1);
  }
}