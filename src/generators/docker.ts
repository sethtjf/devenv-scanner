import type { DeveloperEnvironment } from "../types/index.ts";

export class DockerfileGenerator {
  generate(env: DeveloperEnvironment): string {
    const lines: string[] = [];
    
    // Base image
    lines.push("# Developer Environment Dockerfile");
    lines.push(`# Generated on ${env.timestamp}`);
    lines.push("");
    lines.push("FROM ubuntu:22.04");
    lines.push("");
    
    // Prevent interactive prompts
    lines.push("# Prevent interactive prompts during package installation");
    lines.push("ENV DEBIAN_FRONTEND=noninteractive");
    lines.push("");
    
    // Update and install basic tools
    lines.push("# Update and install basic tools");
    lines.push("RUN apt-get update && apt-get install -y \\");
    lines.push("    curl \\");
    lines.push("    wget \\");
    lines.push("    git \\");
    lines.push("    sudo \\");
    lines.push("    build-essential \\");
    lines.push("    software-properties-common \\");
    lines.push("    ca-certificates \\");
    lines.push("    gnupg \\");
    lines.push("    lsb-release \\");
    lines.push("    && rm -rf /var/lib/apt/lists/*");
    lines.push("");
    
    // Install runtimes
    if (env.runtimes.length > 0) {
      lines.push("# Install Programming Runtimes");
      
      for (const runtime of env.runtimes) {
        switch (runtime.name) {
          case "node":
            lines.push("# Install Node.js");
            lines.push("RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \\");
            lines.push("    apt-get install -y nodejs");
            break;
          case "bun":
            lines.push("# Install Bun");
            lines.push("RUN curl -fsSL https://bun.sh/install | bash");
            lines.push("ENV PATH=\"/root/.bun/bin:$PATH\"");
            break;
          case "python":
          case "python3":
            lines.push("# Install Python");
            lines.push("RUN apt-get update && apt-get install -y python3 python3-pip");
            break;
          case "go":
            lines.push("# Install Go");
            lines.push("RUN wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz && \\");
            lines.push("    tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz && \\");
            lines.push("    rm go1.21.0.linux-amd64.tar.gz");
            lines.push("ENV PATH=\"/usr/local/go/bin:$PATH\"");
            break;
          case "rust":
          case "rustc":
            lines.push("# Install Rust");
            lines.push("RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y");
            lines.push("ENV PATH=\"/root/.cargo/bin:$PATH\"");
            break;
        }
        lines.push("");
      }
    }
    
    // Install tools
    if (env.tools.length > 0) {
      lines.push("# Install Development Tools");
      const aptTools = env.tools
        .filter(t => ["vim", "tmux", "make", "cmake", "curl", "wget", "jq"].includes(t.name))
        .map(t => t.name);
      
      if (aptTools.length > 0) {
        lines.push("RUN apt-get update && apt-get install -y \\");
        aptTools.forEach((tool, i) => {
          const isLast = i === aptTools.length - 1;
          lines.push(`    ${tool}${isLast ? "" : " \\"}`);
        });
        lines.push("    && rm -rf /var/lib/apt/lists/*");
        lines.push("");
      }
      
      // Docker
      if (env.tools.some(t => t.name === "docker")) {
        lines.push("# Install Docker");
        lines.push("RUN curl -fsSL https://get.docker.com | sh");
        lines.push("");
      }
    }
    
    // Configure Git
    if (env.git) {
      lines.push("# Configure Git");
      if (env.git.userName) {
        lines.push(`RUN git config --global user.name "${env.git.userName}"`);
      }
      if (env.git.userEmail) {
        lines.push(`RUN git config --global user.email "${env.git.userEmail}"`);
      }
      lines.push("");
    }
    
    // Set working directory
    lines.push("# Set working directory");
    lines.push("WORKDIR /workspace");
    lines.push("");
    
    // Default command
    lines.push("# Default command");
    lines.push("CMD [\"/bin/bash\"]");
    
    return lines.join("\n");
  }
}