import os from "os";
import { execCommand } from "../utils/exec.ts";
import type { SystemInfo, Scanner } from "../types/index.ts";

export class SystemScanner implements Scanner {
  name = "System Information";

  async scan(): Promise<SystemInfo> {
    const shell = await this.detectShell();
    
    return {
      os: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      username: os.userInfo().username,
      shell,
      homeDir: os.homedir(),
    };
  }

  private async detectShell(): Promise<string> {
    const shellEnv = process.env["SHELL"] || "";
    if (shellEnv) {
      return shellEnv.split("/").pop() || "unknown";
    }
    
    const result = await execCommand("echo $0");
    return result || "unknown";
  }
}