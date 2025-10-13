/**
 * Test Helpers for PVLib Integration
 * Provides fake timers and timeout injection for fast tests
 */

let testSleepFn: ((ms: number) => Promise<void>) | null = null;

export function __setTestSleepFn(fn: (ms: number) => Promise<void>) {
  testSleepFn = fn;
}

export function __resetSleepFn() {
  testSleepFn = null;
}

export async function sleep(ms: number): Promise<void> {
  if (testSleepFn) {
    return testSleepFn(ms);
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}
