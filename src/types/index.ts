export interface SystemInfo {
  os: string;
  arch: string;
  hostname: string;
  username: string;
  shell: string;
  homeDir: string;
}

export interface PackageManager {
  name: string;
  version: string;
  globalPackages?: string[];
}

export interface Runtime {
  name: string;
  version: string;
  path: string;
}

export interface Tool {
  name: string;
  version: string;
  path: string;
  config?: Record<string, unknown>;
}

export interface GitConfig {
  userName?: string;
  userEmail?: string;
  defaultBranch?: string;
  aliases?: Record<string, string>;
}

export interface ShellConfig {
  shell: string;
  configFiles: string[];
  aliases?: Record<string, string>;
  exports?: Record<string, string>;
  pathAdditions?: string[];
}

export interface VSCodeExtension {
  id: string;
  name: string;
  publisher: string;
  version?: string;
}

export interface DeveloperEnvironment {
  timestamp: string;
  system: SystemInfo;
  packageManagers: PackageManager[];
  runtimes: Runtime[];
  tools: Tool[];
  git?: GitConfig;
  shell?: ShellConfig;
  vscode?: {
    extensions: VSCodeExtension[];
    settings?: Record<string, unknown>;
  };
  docker?: {
    installed: boolean;
    version?: string;
    images?: string[];
    containers?: string[];
  };
  databases?: Tool[];
  customTools?: Tool[];
}

export interface ScanOptions {
  verbose?: boolean;
  output?: string;
  format?: 'json' | 'yaml' | 'script';
  include?: string[];
  exclude?: string[];
}

export interface Scanner {
  name: string;
  scan(): Promise<unknown>;
}