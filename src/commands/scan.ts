import { writeFileSync } from "fs";
import chalk from "chalk";
import type { ScanOptions, DeveloperEnvironment } from "../types/index.ts";
import { EnvironmentScanner } from "../scanners/index.ts";
import { BashScriptGenerator } from "../generators/bash-script.ts";
import { DockerfileGenerator } from "../generators/docker.ts";
import { Logger } from "../utils/logger.ts";

export async function scanCommand(options: ScanOptions): Promise<void> {
  const logger = new Logger(options.verbose);
  
  try {
    const scanner = new EnvironmentScanner(options);
    const environment = await scanner.scan();
    
    // Output results based on format
    switch (options.format) {
      case "json":
        await outputJson(environment, options.output, logger);
        break;
      case "yaml":
        await outputYaml(environment, options.output, logger);
        break;
      case "script":
        await outputScript(environment, options.output, logger);
        break;
      default:
        await outputSummary(environment, logger);
    }
  } catch (error) {
    logger.error(`Scan failed: ${error}`);
    process.exit(1);
  }
}

async function outputJson(env: DeveloperEnvironment, output?: string, logger?: Logger): Promise<void> {
  const json = JSON.stringify(env, null, 2);
  
  if (output) {
    writeFileSync(output, json);
    logger?.success(`Environment data saved to ${output}`);
  } else {
    console.log(json);
  }
}

async function outputYaml(env: DeveloperEnvironment, output?: string, logger?: Logger): Promise<void> {
  // Simple YAML serialization (you might want to use a library for complex cases)
  const yaml = toYaml(env);
  
  if (output) {
    writeFileSync(output, yaml);
    logger?.success(`Environment data saved to ${output}`);
  } else {
    console.log(yaml);
  }
}

async function outputScript(env: DeveloperEnvironment, output?: string, logger?: Logger): Promise<void> {
  const generator = new BashScriptGenerator();
  const script = generator.generate(env);
  
  const dockerGenerator = new DockerfileGenerator();
  const dockerfile = dockerGenerator.generate(env);
  
  if (output) {
    const baseDir = output.endsWith('.sh') ? output.slice(0, -3) : output;
    writeFileSync(`${baseDir}.sh`, script);
    writeFileSync(`${baseDir}.Dockerfile`, dockerfile);
    logger?.success(`Setup script saved to ${baseDir}.sh`);
    logger?.success(`Dockerfile saved to ${baseDir}.Dockerfile`);
  } else {
    console.log(script);
  }
}

async function outputSummary(env: DeveloperEnvironment, logger: Logger): Promise<void> {
  console.log("");
  console.log(chalk.bold.cyan("🖥️  System Information"));
  console.log(`  OS: ${env.system.os}`);
  console.log(`  Architecture: ${env.system.arch}`);
  console.log(`  Shell: ${env.system.shell}`);
  console.log(`  User: ${env.system.username}`);
  
  if (env.packageManagers.length > 0) {
    console.log("");
    console.log(chalk.bold.cyan("📦 Package Managers"));
    for (const pm of env.packageManagers) {
      console.log(`  ${pm.name}: ${pm.version}`);
      if (pm.globalPackages && pm.globalPackages.length > 0) {
        console.log(`    Global packages: ${pm.globalPackages.length} installed`);
      }
    }
  }
  
  if (env.runtimes.length > 0) {
    console.log("");
    console.log(chalk.bold.cyan("🔧 Programming Runtimes"));
    for (const runtime of env.runtimes) {
      console.log(`  ${runtime.name}: ${runtime.version}`);
    }
  }
  
  if (env.tools.length > 0) {
    console.log("");
    console.log(chalk.bold.cyan("🛠️  Development Tools"));
    const toolGroups = {
      editors: ["vim", "nvim", "emacs", "code", "subl", "atom"],
      containers: ["docker", "docker-compose", "kubectl", "podman"],
      cloud: ["aws", "gcloud", "az", "terraform", "ansible"],
      databases: ["redis-cli", "mongo", "mongosh", "psql", "mysql", "sqlite3"],
      shells: ["bash", "zsh", "fish", "tmux", "screen"],
      other: [] as string[],
    };
    
    for (const tool of env.tools) {
      let grouped = false;
      for (const [group, members] of Object.entries(toolGroups)) {
        if (group !== "other" && members.includes(tool.name)) {
          grouped = true;
          break;
        }
      }
      if (!grouped) {
        toolGroups.other.push(tool.name);
      }
    }
    
    for (const [group, members] of Object.entries(toolGroups)) {
      const tools = env.tools.filter(t => members.includes(t.name));
      if (tools.length > 0) {
        console.log(`  ${chalk.dim(group)}:`);
        for (const tool of tools) {
          console.log(`    ${tool.name}: ${tool.version}`);
        }
      }
    }
  }
  
  if (env.git) {
    console.log("");
    console.log(chalk.bold.cyan("📝 Git Configuration"));
    if (env.git.userName) console.log(`  User: ${env.git.userName}`);
    if (env.git.userEmail) console.log(`  Email: ${env.git.userEmail}`);
    if (env.git.defaultBranch) console.log(`  Default branch: ${env.git.defaultBranch}`);
    if (env.git.aliases) {
      console.log(`  Aliases: ${Object.keys(env.git.aliases).length} configured`);
    }
  }
  
  if (env.vscode) {
    console.log("");
    console.log(chalk.bold.cyan("🎨 VS Code"));
    console.log(`  Extensions: ${env.vscode.extensions.length} installed`);
  }
  
  console.log("");
  logger.info(`Scan completed at ${env.timestamp}`);
  logger.info("Use --format=json or --format=script to export the configuration");
}

function toYaml(obj: any, indent = 0): string {
  const spaces = "  ".repeat(indent);
  let yaml = "";
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    
    if (Array.isArray(value)) {
      yaml += `${spaces}${key}:\n`;
      for (const item of value) {
        if (typeof item === "object") {
          yaml += `${spaces}  -\n`;
          yaml += toYaml(item, indent + 2);
        } else {
          yaml += `${spaces}  - ${item}\n`;
        }
      }
    } else if (typeof value === "object") {
      yaml += `${spaces}${key}:\n`;
      yaml += toYaml(value, indent + 1);
    } else {
      yaml += `${spaces}${key}: ${value}\n`;
    }
  }
  
  return yaml;
}