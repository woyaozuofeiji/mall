import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const EXECUTABLE_ENV_KEYS = ["PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH", "CHROMIUM_EXECUTABLE_PATH"] as const;
const EXECUTABLE_CANDIDATES = [
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
];

function resolveExecutablePath() {
  for (const envKey of EXECUTABLE_ENV_KEYS) {
    const value = process.env[envKey]?.trim();
    if (value) {
      return {
        executablePath: value,
        source: `env:${envKey}`,
      };
    }
  }

  for (const candidate of EXECUTABLE_CANDIDATES) {
    if (existsSync(candidate)) {
      return {
        executablePath: candidate,
        source: "auto-detected",
      };
    }
  }

  throw new Error(
    [
      "未找到可用的 Chromium/Chrome 可执行文件。",
      `可通过环境变量 ${EXECUTABLE_ENV_KEYS.join(" 或 ")} 显式指定浏览器路径。`,
    ].join(" "),
  );
}

async function main() {
  const targetUrl = process.argv[2]?.trim() || "https://example.com";
  const { executablePath, source } = resolveExecutablePath();
  const startedAt = Date.now();

  console.log(`[verify:playwright] browser=${executablePath} source=${source}`);
  console.log(`[verify:playwright] target=${targetUrl}`);

  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const context = await browser.newContext({
      viewport: {
        width: 1440,
        height: 900,
      },
      locale: "zh-CN",
    });

    const page = await context.newPage();
    const response = await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });

    await page.waitForTimeout(1_000);

    const screenshotDirectory = path.join(process.cwd(), "test-results");
    mkdirSync(screenshotDirectory, { recursive: true });
    const screenshotPath = path.join(screenshotDirectory, "playwright-smoke.png");
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    const result = {
      ok: true,
      executablePath,
      executableSource: source,
      browserVersion: browser.version(),
      targetUrl,
      finalUrl: page.url(),
      status: response?.status() ?? null,
      title: await page.title(),
      userAgent: await page.evaluate(() => navigator.userAgent),
      screenshotPath,
      elapsedMs: Date.now() - startedAt,
    };

    console.log(JSON.stringify(result, null, 2));
    await context.close();
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(`[verify:playwright] failed\n${message}`);
  process.exitCode = 1;
});
