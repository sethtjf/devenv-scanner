import { test, expect } from "bun:test";
import { execCommand, commandExists, getCommandVersion, getCommandPath } from "./exec.ts";

test("execCommand should execute commands", async () => {
  const result = await execCommand("echo hello");
  expect(result).toBe("hello");
});

test("commandExists should detect existing commands", async () => {
  const exists = await commandExists("echo");
  expect(exists).toBe(true);
  
  const notExists = await commandExists("nonexistentcommand123");
  expect(notExists).toBe(false);
});

test("getCommandPath should return command path", async () => {
  const path = await getCommandPath("echo");
  expect(path).toContain("echo");
});

test("getCommandVersion should extract version", async () => {
  const version = await getCommandVersion("bun");
  expect(version).toMatch(/\d+\.\d+\.\d+/);
});