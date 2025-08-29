import { $ } from "bun";

export async function execCommand(command: string): Promise<string> {
  try {
    const proc = Bun.spawn(["sh", "-c", command], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const output = await new Response(proc.stdout).text();
    return output.trim();
  } catch {
    return "";
  }
}

export async function commandExists(command: string): Promise<boolean> {
  try {
    await $`which ${command}`.quiet();
    return true;
  } catch {
    return false;
  }
}

export async function getCommandVersion(command: string, versionFlag = "--version"): Promise<string> {
  try {
    const result = await $`${command} ${versionFlag}`.quiet().text();
    const versionMatch = result.match(/(\d+\.\d+\.\d+(?:\.\d+)?)/);
    return versionMatch ? versionMatch[1] : result.split('\n')[0];
  } catch {
    return "unknown";
  }
}

export async function getCommandPath(command: string): Promise<string> {
  try {
    const result = await $`which ${command}`.quiet().text();
    return result.trim();
  } catch {
    return "";
  }
}