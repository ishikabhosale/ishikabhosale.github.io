import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

const localChrome =
  "/Users/ishikabhosale/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";

export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "retain-on-failure",
    launchOptions: existsSync(localChrome)
      ? { executablePath: localChrome }
      : undefined,
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: true,
  },
});
