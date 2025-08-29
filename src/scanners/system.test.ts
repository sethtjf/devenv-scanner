import { test, expect } from "bun:test";
import { SystemScanner } from "./system.ts";

test("SystemScanner should return system information", async () => {
  const scanner = new SystemScanner();
  const result = await scanner.scan();
  
  expect(result).toBeDefined();
  expect(result.os).toBeDefined();
  expect(result.arch).toBeDefined();
  expect(result.hostname).toBeDefined();
  expect(result.username).toBeDefined();
  expect(result.shell).toBeDefined();
  expect(result.homeDir).toBeDefined();
  
  expect(typeof result.os).toBe("string");
  expect(typeof result.arch).toBe("string");
  expect(typeof result.hostname).toBe("string");
  expect(typeof result.username).toBe("string");
  expect(typeof result.shell).toBe("string");
  expect(typeof result.homeDir).toBe("string");
});