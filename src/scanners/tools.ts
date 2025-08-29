import { commandExists, getCommandVersion, getCommandPath } from "../utils/exec.ts";
import type { Tool, Scanner } from "../types/index.ts";

export class ToolScanner implements Scanner {
  name = "Development Tools";

  private tools = [
    { name: "git", versionFlag: "--version" },
    { name: "docker", versionFlag: "--version" },
    { name: "docker-compose", versionFlag: "--version" },
    { name: "kubectl", versionFlag: "version --client" },
    { name: "terraform", versionFlag: "version" },
    { name: "ansible", versionFlag: "--version" },
    { name: "vagrant", versionFlag: "--version" },
    { name: "vim", versionFlag: "--version" },
    { name: "nvim", versionFlag: "--version" },
    { name: "emacs", versionFlag: "--version" },
    { name: "code", versionFlag: "--version" },
    { name: "subl", versionFlag: "--version" },
    { name: "atom", versionFlag: "--version" },
    { name: "tmux", versionFlag: "-V" },
    { name: "screen", versionFlag: "--version" },
    { name: "zsh", versionFlag: "--version" },
    { name: "bash", versionFlag: "--version" },
    { name: "fish", versionFlag: "--version" },
    { name: "make", versionFlag: "--version" },
    { name: "cmake", versionFlag: "--version" },
    { name: "gradle", versionFlag: "--version" },
    { name: "maven", versionFlag: "--version" },
    { name: "mvn", versionFlag: "--version" },
    { name: "bazel", versionFlag: "--version" },
    { name: "aws", versionFlag: "--version" },
    { name: "gcloud", versionFlag: "--version" },
    { name: "az", versionFlag: "--version" },
    { name: "heroku", versionFlag: "--version" },
    { name: "netlify", versionFlag: "--version" },
    { name: "vercel", versionFlag: "--version" },
    { name: "gh", versionFlag: "--version" },
    { name: "hub", versionFlag: "--version" },
    { name: "jq", versionFlag: "--version" },
    { name: "yq", versionFlag: "--version" },
    { name: "curl", versionFlag: "--version" },
    { name: "wget", versionFlag: "--version" },
    { name: "httpie", versionFlag: "--version" },
    { name: "postman", versionFlag: "--version" },
    { name: "insomnia", versionFlag: "--version" },
    { name: "ngrok", versionFlag: "version" },
    { name: "redis-cli", versionFlag: "--version" },
    { name: "mongo", versionFlag: "--version" },
    { name: "mongosh", versionFlag: "--version" },
    { name: "psql", versionFlag: "--version" },
    { name: "mysql", versionFlag: "--version" },
    { name: "sqlite3", versionFlag: "--version" },
  ];

  async scan(): Promise<Tool[]> {
    const results: Tool[] = [];

    for (const tool of this.tools) {
      if (await commandExists(tool.name)) {
        const version = await getCommandVersion(tool.name, tool.versionFlag);
        const path = await getCommandPath(tool.name);
        
        results.push({
          name: tool.name,
          version,
          path,
        });
      }
    }

    return results;
  }
}