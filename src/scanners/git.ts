import { execCommand, commandExists } from "../utils/exec.ts";
import type { GitConfig, Scanner } from "../types/index.ts";

export class GitScanner implements Scanner {
  name = "Git Configuration";

  async scan(): Promise<GitConfig | null> {
    if (!await commandExists("git")) {
      return null;
    }

    const userName = await execCommand("git config --global user.name");
    const userEmail = await execCommand("git config --global user.email");
    const defaultBranch = await execCommand("git config --global init.defaultBranch");
    
    const aliasesOutput = await execCommand("git config --get-regexp ^alias\\.");
    const aliases = this.parseAliases(aliasesOutput);

    return {
      userName: userName || undefined,
      userEmail: userEmail || undefined,
      defaultBranch: defaultBranch || undefined,
      aliases: Object.keys(aliases).length > 0 ? aliases : undefined,
    };
  }

  private parseAliases(output: string): Record<string, string> {
    const aliases: Record<string, string> = {};
    
    if (!output) return aliases;

    const lines = output.split('\n').filter(line => line.trim());
    for (const line of lines) {
      const match = line.match(/^alias\.(\S+)\s+(.+)$/);
      if (match) {
        aliases[match[1]] = match[2];
      }
    }

    return aliases;
  }
}