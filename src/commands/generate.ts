import { readFileSync, writeFileSync } from "fs";
import type { DeveloperEnvironment } from "../types/index.ts";
import { BashScriptGenerator } from "../generators/bash-script.ts";
import { DockerfileGenerator } from "../generators/docker.ts";
import { Logger } from "../utils/logger.ts";

export async function generateCommand(input: string, options: any): Promise<void> {
  const logger = new Logger(options.verbose);
  
  try {
    logger.info(`Reading scan file: ${input}`);
    const data = readFileSync(input, "utf-8");
    const environment: DeveloperEnvironment = JSON.parse(data);
    
    let content = "";
    let filename = options.output || "setup";
    
    switch (options.type) {
      case "bash":
        const bashGenerator = new BashScriptGenerator();
        content = bashGenerator.generate(environment);
        if (!filename.endsWith(".sh")) filename += ".sh";
        break;
        
      case "docker":
        const dockerGenerator = new DockerfileGenerator();
        content = dockerGenerator.generate(environment);
        if (!filename.endsWith(".Dockerfile")) filename += ".Dockerfile";
        break;
        
      case "ansible":
        logger.warn("Ansible playbook generation not yet implemented");
        process.exit(1);
        break;
        
      default:
        logger.error(`Unknown script type: ${options.type}`);
        process.exit(1);
    }
    
    writeFileSync(filename, content);
    logger.success(`Generated ${options.type} script: ${filename}`);
    
    if (options.type === "bash") {
      // Make the script executable
      const { $ } = await import("bun");
      await $`chmod +x ${filename}`.quiet();
      logger.info(`Made ${filename} executable`);
    }
  } catch (error) {
    logger.error(`Failed to generate script: ${error}`);
    process.exit(1);
  }
}