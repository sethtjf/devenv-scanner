#!/usr/bin/env bun

import { Command } from "commander";
import figlet from "figlet";
import gradient from "gradient-string";
import chalk from "chalk";
import { scanCommand } from "./commands/scan.ts";
import type { ScanOptions } from "./types/index.ts";

const program = new Command();

// Only display banner for interactive commands (not JSON/YAML output)
const args = process.argv.slice(2);
const isJsonOutput = args.includes('-f') && (args[args.indexOf('-f') + 1] === 'json' || args[args.indexOf('-f') + 1] === 'yaml');
const isFormatOutput = args.includes('--format') && (args[args.indexOf('--format') + 1] === 'json' || args[args.indexOf('--format') + 1] === 'yaml');

if (!isJsonOutput && !isFormatOutput) {
  console.log(
    gradient.pastel.multiline(
      figlet.textSync("DevEnv Scanner", {
        font: "Standard",
        horizontalLayout: "default",
        verticalLayout: "default",
      })
    )
  );
}

program
  .name("devenv")
  .description("Scan and recreate your developer environment")
  .version("1.0.0");

program
  .command("scan")
  .description("Scan the current system for developer tools and configuration")
  .option("-v, --verbose", "Enable verbose output")
  .option("-o, --output <file>", "Output file path")
  .option("-f, --format <format>", "Output format (json, yaml, script)", "summary")
  .option("-i, --include <items...>", "Include specific scanners")
  .option("-e, --exclude <items...>", "Exclude specific scanners")
  .action(async (options: ScanOptions) => {
    await scanCommand(options);
  });

program
  .command("generate")
  .description("Generate setup scripts from a previous scan")
  .argument("<input>", "Path to the JSON scan file")
  .option("-o, --output <file>", "Output file path")
  .option("-t, --type <type>", "Script type (bash, docker, ansible)", "bash")
  .action(async (input: string, options: any) => {
    const { generateCommand } = await import("./commands/generate.ts");
    await generateCommand(input, options);
  });

program
  .command("compare")
  .description("Compare two environment scans")
  .argument("<file1>", "First scan file")
  .argument("<file2>", "Second scan file")
  .option("-v, --verbose", "Show detailed differences")
  .action(async (file1: string, file2: string, options: any) => {
    const { compareCommand } = await import("./commands/compare.ts");
    await compareCommand(file1, file2, options);
  });

program
  .command("validate")
  .description("Validate that the current environment matches a scan")
  .argument("<file>", "Scan file to validate against")
  .option("-v, --verbose", "Show detailed validation results")
  .action(async (file: string, options: any) => {
    const { validateCommand } = await import("./commands/validate.ts");
    await validateCommand(file, options);
  });

// Help text
program.addHelpText("after", `
${chalk.bold("Examples:")}
  $ devenv scan                              # Scan current environment
  $ devenv scan -o config.json -f json       # Save scan as JSON
  $ devenv scan -f script -o setup           # Generate setup scripts
  $ devenv generate config.json -t docker    # Generate Dockerfile from scan
  $ devenv compare old.json new.json         # Compare two scans
  $ devenv validate config.json              # Validate against saved config

${chalk.bold("Supported Formats:")}
  json    - JSON configuration file
  yaml    - YAML configuration file
  script  - Bash setup script and Dockerfile
  summary - Human-readable summary (default)

${chalk.bold("For more information:")}
  https://github.com/yourusername/devenv-scanner
`);

program.parse();