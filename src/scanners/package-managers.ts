import { commandExists, getCommandVersion, execCommand } from "../utils/exec.ts";
import type { PackageManager, Scanner } from "../types/index.ts";

export class PackageManagerScanner implements Scanner {
  name = "Package Managers";

  private managers = [
    { name: "npm", globalListCmd: "npm list -g --depth=0" },
    { name: "yarn", globalListCmd: "yarn global list --depth=0" },
    { name: "pnpm", globalListCmd: "pnpm list -g --depth=0" },
    { name: "bun", globalListCmd: "bun pm ls -g" },
    { name: "brew", globalListCmd: "brew list" },
    { name: "apt", globalListCmd: "apt list --installed" },
    { name: "dnf", globalListCmd: "dnf list installed" },
    { name: "pacman", globalListCmd: "pacman -Q" },
    { name: "cargo", globalListCmd: "cargo install --list" },
    { name: "pip", globalListCmd: "pip list" },
    { name: "pip3", globalListCmd: "pip3 list" },
    { name: "gem", globalListCmd: "gem list" },
    { name: "composer", globalListCmd: "composer global show" },
  ];

  async scan(): Promise<PackageManager[]> {
    const results: PackageManager[] = [];

    for (const manager of this.managers) {
      if (await commandExists(manager.name)) {
        const version = await getCommandVersion(manager.name);
        const packageManager: PackageManager = {
          name: manager.name,
          version,
        };

        if (manager.name === "brew" || manager.name === "npm" || manager.name === "yarn" || manager.name === "pnpm" || manager.name === "bun") {
          const packages = await this.getGlobalPackages(manager.name, manager.globalListCmd);
          if (packages.length > 0) {
            packageManager.globalPackages = packages;
          }
        }

        results.push(packageManager);
      }
    }

    return results;
  }

  private async getGlobalPackages(managerName: string, listCmd: string): Promise<string[]> {
    try {
      const output = await execCommand(listCmd);
      if (!output) return [];

      const lines = output.split('\n').filter(line => line.trim());
      
      switch (managerName) {
        case "npm":
        case "pnpm":
          return lines
            .slice(1)
            .map(line => {
              const match = line.match(/[├└]── (.+@[\d.]+)/);
              return match ? match[1] : null;
            })
            .filter((pkg): pkg is string => pkg !== null);

        case "yarn":
          return lines
            .filter(line => line.includes('@'))
            .map(line => line.trim());

        case "bun":
          return lines
            .filter(line => line.includes('@'))
            .map(line => line.split(' ')[0]);

        case "brew":
          return lines.slice(0, 20);

        default:
          return [];
      }
    } catch {
      return [];
    }
  }
}