import { commandExists, getCommandVersion, getCommandPath } from "../utils/exec.ts";
import type { Runtime, Scanner } from "../types/index.ts";

export class RuntimeScanner implements Scanner {
  name = "Programming Runtimes";

  private runtimes = [
    { name: "node", versionFlag: "--version" },
    { name: "bun", versionFlag: "--version" },
    { name: "deno", versionFlag: "--version" },
    { name: "python", versionFlag: "--version" },
    { name: "python3", versionFlag: "--version" },
    { name: "ruby", versionFlag: "--version" },
    { name: "java", versionFlag: "-version" },
    { name: "go", versionFlag: "version" },
    { name: "rust", versionFlag: "--version" },
    { name: "rustc", versionFlag: "--version" },
    { name: "php", versionFlag: "--version" },
    { name: "perl", versionFlag: "--version" },
    { name: "dotnet", versionFlag: "--version" },
    { name: "swift", versionFlag: "--version" },
    { name: "kotlin", versionFlag: "-version" },
    { name: "scala", versionFlag: "-version" },
    { name: "clang", versionFlag: "--version" },
    { name: "gcc", versionFlag: "--version" },
    { name: "g++", versionFlag: "--version" },
    { name: "zig", versionFlag: "version" },
  ];

  async scan(): Promise<Runtime[]> {
    const results: Runtime[] = [];

    for (const runtime of this.runtimes) {
      if (await commandExists(runtime.name)) {
        const version = await getCommandVersion(runtime.name, runtime.versionFlag);
        const path = await getCommandPath(runtime.name);
        
        results.push({
          name: runtime.name,
          version,
          path,
        });
      }
    }

    return results;
  }
}