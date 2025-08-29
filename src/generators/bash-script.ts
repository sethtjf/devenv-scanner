import type { DeveloperEnvironment } from "../types/index.ts";

export class BashScriptGenerator {
  generate(env: DeveloperEnvironment): string {
    const lines: string[] = [
      "#!/bin/bash",
      "",
      "# Developer Environment Setup Script",
      `# Generated on ${env.timestamp}`,
      "# This script will install and configure your development environment",
      "",
      "set -e",
      "",
      "echo '🚀 Starting environment setup...'",
      "",
    ];

    // System information
    lines.push("# System Information");
    lines.push(`# OS: ${env.system.os}`);
    lines.push(`# Architecture: ${env.system.arch}`);
    lines.push(`# Shell: ${env.system.shell}`);
    lines.push("");

    // Detect OS
    lines.push("# Detect Operating System");
    lines.push("OS=$(uname -s)");
    lines.push("ARCH=$(uname -m)");
    lines.push("");

    // Install package managers
    if (env.packageManagers.length > 0) {
      lines.push("# Install Package Managers");
      lines.push("echo '📦 Installing package managers...'");
      lines.push("");

      if (env.packageManagers.some(pm => pm.name === "brew")) {
        lines.push("# Install Homebrew (if not installed)");
        lines.push('if ! command -v brew &> /dev/null; then');
        lines.push('  echo "Installing Homebrew..."');
        lines.push('  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
        lines.push('fi');
        lines.push("");
      }

      if (env.packageManagers.some(pm => pm.name === "bun")) {
        lines.push("# Install Bun (if not installed)");
        lines.push('if ! command -v bun &> /dev/null; then');
        lines.push('  echo "Installing Bun..."');
        lines.push('  curl -fsSL https://bun.sh/install | bash');
        lines.push('fi');
        lines.push("");
      }
    }

    // Install runtimes
    if (env.runtimes.length > 0) {
      lines.push("# Install Programming Runtimes");
      lines.push("echo '🔧 Installing runtimes...'");
      lines.push("");

      for (const runtime of env.runtimes) {
        lines.push(`# ${runtime.name} (${runtime.version})`);
        lines.push(`if ! command -v ${runtime.name} &> /dev/null; then`);
        lines.push(`  echo "Installing ${runtime.name}..."`);
        
        if (env.packageManagers.some(pm => pm.name === "brew")) {
          lines.push(`  brew install ${this.getBrewPackageName(runtime.name)}`);
        } else {
          lines.push(`  echo "Please install ${runtime.name} manually"`);
        }
        
        lines.push("fi");
        lines.push("");
      }
    }

    // Install tools
    if (env.tools.length > 0) {
      lines.push("# Install Development Tools");
      lines.push("echo '🛠️  Installing development tools...'");
      lines.push("");

      for (const tool of env.tools) {
        lines.push(`# ${tool.name} (${tool.version})`);
        lines.push(`if ! command -v ${tool.name} &> /dev/null; then`);
        lines.push(`  echo "Installing ${tool.name}..."`);
        
        if (env.packageManagers.some(pm => pm.name === "brew")) {
          lines.push(`  brew install ${this.getBrewPackageName(tool.name)}`);
        } else {
          lines.push(`  echo "Please install ${tool.name} manually"`);
        }
        
        lines.push("fi");
        lines.push("");
      }
    }

    // Configure Git
    if (env.git) {
      lines.push("# Configure Git");
      lines.push("echo '📝 Configuring Git...'");
      
      if (env.git.userName) {
        lines.push(`git config --global user.name "${env.git.userName}"`);
      }
      if (env.git.userEmail) {
        lines.push(`git config --global user.email "${env.git.userEmail}"`);
      }
      if (env.git.defaultBranch) {
        lines.push(`git config --global init.defaultBranch "${env.git.defaultBranch}"`);
      }
      if (env.git.aliases) {
        for (const [alias, command] of Object.entries(env.git.aliases)) {
          lines.push(`git config --global alias.${alias} "${command}"`);
        }
      }
      lines.push("");
    }

    // Install VS Code extensions
    if (env.vscode?.extensions && env.vscode.extensions.length > 0) {
      lines.push("# Install VS Code Extensions");
      lines.push("echo '🎨 Installing VS Code extensions...'");
      lines.push("");
      lines.push('if command -v code &> /dev/null; then');
      
      for (const ext of env.vscode.extensions) {
        lines.push(`  code --install-extension ${ext.id}`);
      }
      
      lines.push("else");
      lines.push('  echo "VS Code CLI not found. Please install extensions manually."');
      lines.push("fi");
      lines.push("");
    }

    // Install global packages
    for (const pm of env.packageManagers) {
      if (pm.globalPackages && pm.globalPackages.length > 0) {
        lines.push(`# Install ${pm.name} global packages`);
        lines.push(`echo '📚 Installing ${pm.name} global packages...'`);
        lines.push("");

        for (const pkg of pm.globalPackages) {
          switch (pm.name) {
            case "npm":
              lines.push(`npm install -g ${pkg}`);
              break;
            case "yarn":
              lines.push(`yarn global add ${pkg}`);
              break;
            case "pnpm":
              lines.push(`pnpm add -g ${pkg}`);
              break;
            case "bun":
              lines.push(`bun add -g ${pkg}`);
              break;
          }
        }
        lines.push("");
      }
    }

    lines.push("echo '✨ Environment setup complete!'");
    lines.push("");

    return lines.join("\n");
  }

  private getBrewPackageName(toolName: string): string {
    const mapping: Record<string, string> = {
      "nvim": "neovim",
      "docker-compose": "docker-compose",
      "kubectl": "kubernetes-cli",
      "aws": "awscli",
      "gcloud": "google-cloud-sdk",
      "az": "azure-cli",
      "mongo": "mongodb-community",
      "mongosh": "mongosh",
      "psql": "postgresql",
      "mysql": "mysql",
      "sqlite3": "sqlite",
    };

    return mapping[toolName] || toolName;
  }
}