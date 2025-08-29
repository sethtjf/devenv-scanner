import { homedir } from "os";
import { join } from "path";
import { execCommand, commandExists } from "../utils/exec.ts";
import type { VSCodeExtension, Scanner } from "../types/index.ts";

export class VSCodeScanner implements Scanner {
  name = "VS Code Configuration";

  async scan(): Promise<{ extensions: VSCodeExtension[]; settings?: Record<string, unknown> } | null> {
    if (!await commandExists("code")) {
      return null;
    }

    const extensions = await this.getExtensions();
    const settings = await this.getSettings();

    if (extensions.length === 0 && !settings) {
      return null;
    }

    return {
      extensions,
      settings: settings || undefined,
    };
  }

  private async getExtensions(): Promise<VSCodeExtension[]> {
    try {
      const output = await execCommand("code --list-extensions --show-versions");
      if (!output) return [];

      const lines = output.split('\n').filter(line => line.trim());
      return lines.map(line => {
        const match = line.match(/^(.+?)\.(.+?)@(.+)$/);
        if (match) {
          return {
            publisher: match[1],
            name: match[2],
            id: `${match[1]}.${match[2]}`,
            version: match[3],
          };
        }
        
        const simpleMatch = line.match(/^(.+?)\.(.+)$/);
        if (simpleMatch) {
          return {
            publisher: simpleMatch[1],
            name: simpleMatch[2],
            id: line,
          };
        }

        return {
          id: line,
          name: line,
          publisher: "unknown",
        };
      });
    } catch {
      return [];
    }
  }

  private async getSettings(): Promise<Record<string, unknown> | null> {
    try {
      const home = homedir();
      const settingsPath = join(home, ".config", "Code", "User", "settings.json");
      
      const file = Bun.file(settingsPath);
      if (await file.exists()) {
        const content = await file.text();
        return JSON.parse(content);
      }
    } catch {
      // Unable to read settings
    }

    return null;
  }
}