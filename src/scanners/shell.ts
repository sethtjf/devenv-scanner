import { homedir } from "os";
import { join } from "path";
import { execCommand } from "../utils/exec.ts";
import type { ShellConfig, Scanner } from "../types/index.ts";

export class ShellScanner implements Scanner {
  name = "Shell Configuration";

  async scan(): Promise<ShellConfig> {
    const shell = process.env["SHELL"]?.split("/").pop() || "unknown";
    const configFiles = await this.findConfigFiles(shell);
    const aliases = await this.findAliases(shell);
    const exports = await this.findExports();
    const pathAdditions = await this.findPathAdditions();

    return {
      shell,
      configFiles,
      aliases: Object.keys(aliases).length > 0 ? aliases : undefined,
      exports: Object.keys(exports).length > 0 ? exports : undefined,
      pathAdditions: pathAdditions.length > 0 ? pathAdditions : undefined,
    };
  }

  private async findConfigFiles(shell: string): Promise<string[]> {
    const home = homedir();
    const files: string[] = [];
    
    const possibleFiles = {
      bash: [".bashrc", ".bash_profile", ".profile"],
      zsh: [".zshrc", ".zprofile", ".zshenv"],
      fish: [".config/fish/config.fish"],
      sh: [".profile"],
    };

    const checkFiles = possibleFiles[shell as keyof typeof possibleFiles] || possibleFiles.sh;
    
    for (const file of checkFiles) {
      const path = join(home, file);
      try {
        const exists = await Bun.file(path).exists();
        if (exists) {
          files.push(file);
        }
      } catch {
        // File doesn't exist
      }
    }

    return files;
  }

  private async findAliases(shell: string): Promise<Record<string, string>> {
    const aliases: Record<string, string> = {};
    
    try {
      let output = "";
      if (shell === "bash" || shell === "zsh") {
        output = await execCommand("alias");
      } else if (shell === "fish") {
        output = await execCommand("alias");
      }

      if (output) {
        const lines = output.split('\n').filter(line => line.trim());
        for (const line of lines) {
          const match = line.match(/^alias\s+(\S+)='(.+)'$/) || line.match(/^(\S+)='(.+)'$/);
          if (match) {
            aliases[match[1]] = match[2];
          }
        }
      }
    } catch {
      // Unable to get aliases
    }

    return aliases;
  }

  private async findExports(): Promise<Record<string, string>> {
    const exports: Record<string, string> = {};
    
    try {
      const output = await execCommand("env");
      if (output) {
        const lines = output.split('\n').filter(line => line.trim());
        const important = ["NODE_ENV", "EDITOR", "VISUAL", "PAGER", "LANG", "LC_ALL"];
        
        for (const line of lines) {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=');
          if (key && important.includes(key)) {
            exports[key] = value;
          }
        }
      }
    } catch {
      // Unable to get environment variables
    }

    return exports;
  }

  private async findPathAdditions(): Promise<string[]> {
    try {
      const pathVar = process.env["PATH"] || "";
      const paths = pathVar.split(':').filter(path => path.trim());
      const home = homedir();
      
      return paths.filter(path => 
        path.startsWith(home) || 
        path.includes('/usr/local') ||
        path.includes('/opt')
      );
    } catch {
      return [];
    }
  }
}