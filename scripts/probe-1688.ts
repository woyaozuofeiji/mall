import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { Browser, BrowserContext, BrowserContextOptions, Cookie, LaunchOptions, Page } from "playwright-core";
import { chromium } from "playwright-core";

const EXECUTABLE_ENV_KEYS = ["PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH", "CHROMIUM_EXECUTABLE_PATH"] as const;
const EXECUTABLE_CANDIDATES = [
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
];
const DEFAULT_BROWSER_ARGS = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"];
const REALISTIC_USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.7151.103 Safari/537.36";
const TARGETS = [
  {
    id: "home",
    url: "https://www.1688.com/",
  },
  {
    id: "search",
    url: "https://s.1688.com/selloffer/offer_search.htm?keywords=%E8%80%B3%E7%8E%AF",
  },
] as const;
const MANUAL_COOKIE_TARGET_URLS = [
  "https://www.1688.com/",
  "https://s.1688.com/",
  "https://login.1688.com/",
  "https://login.taobao.com/",
] as const;

type RuntimeProbeTarget = {
  id: string;
  url: string;
};
type SeedCookie = Parameters<BrowserContext["addCookies"]>[0][number];

type ProbeVariant = {
  id: string;
  description: string;
  headless: boolean;
  persistent: boolean;
  stealth: boolean;
  realisticUserAgent: boolean;
  reuseCookies: boolean;
  targets: readonly RuntimeProbeTarget[];
};

type NavigatorFingerprint = {
  userAgent: string;
  webdriver: boolean | null;
  languages: string[];
  platform: string;
  hardwareConcurrency: number | null;
  deviceMemory: number | null;
  pluginsLength: number | null;
};

type TargetProbeResult = {
  targetId: string;
  targetUrl: string;
  finalUrl: string | null;
  status: number | null;
  title: string | null;
  blocked: boolean;
  blockSignals: string[];
  htmlSnippet: string;
  bodyTextSnippet: string;
  screenshotPath: string | null;
  fingerprint: NavigatorFingerprint | null;
  error?: string;
};

type VariantProbeResult = {
  id: string;
  description: string;
  headless: boolean;
  persistent: boolean;
  stealth: boolean;
  realisticUserAgent: boolean;
  reuseCookies: boolean;
  cookiesCount: number;
  cookieNames: string[];
  userDataDir?: string | null;
  launchError?: string;
  targets: TargetProbeResult[];
};

type VariantRunOutput = {
  result: VariantProbeResult;
  cookies: Cookie[];
};

const VARIANTS: ProbeVariant[] = [
  {
    id: "baseline-headless",
    description: "默认 headless，仅使用系统 Chromium。",
    headless: true,
    persistent: false,
    stealth: false,
    realisticUserAgent: false,
    reuseCookies: false,
    targets: TARGETS,
  },
  {
    id: "stealth-headless",
    description: "headless + 更接近真实浏览器的 UA、语言、headers 和 webdriver 伪装。",
    headless: true,
    persistent: false,
    stealth: true,
    realisticUserAgent: true,
    reuseCookies: false,
    targets: TARGETS,
  },
  {
    id: "stealth-headless-with-cookies",
    description: "在 stealth 基础上复用前一个探测得到的 cookies。",
    headless: true,
    persistent: false,
    stealth: true,
    realisticUserAgent: true,
    reuseCookies: true,
    targets: TARGETS,
  },
  {
    id: "persistent-stealth-headless",
    description: "使用持久化 profile，模拟真实浏览器资料目录。",
    headless: true,
    persistent: true,
    stealth: true,
    realisticUserAgent: true,
    reuseCookies: true,
    targets: TARGETS,
  },
  {
    id: "headful-stealth-attempt",
    description: "尝试 headful 模式，验证当前服务器是否具备图形显示能力。",
    headless: false,
    persistent: false,
    stealth: true,
    realisticUserAgent: true,
    reuseCookies: true,
    targets: [TARGETS[0]],
  },
];

function parseCookieHeader(cookieHeader: string): SeedCookie[] {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const pairs = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separatorIndex = part.indexOf("=");
      if (separatorIndex <= 0) {
        return null;
      }

      const name = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      if (!name) {
        return null;
      }

      return { name, value };
    })
    .filter((pair): pair is { name: string; value: string } => Boolean(pair));

  const cookies: SeedCookie[] = [];
  for (const pair of pairs) {
    for (const url of MANUAL_COOKIE_TARGET_URLS) {
      cookies.push({
        name: pair.name,
        value: pair.value,
        url,
        expires: nowSeconds + 7 * 24 * 60 * 60,
      });
    }
  }

  return cookies;
}

function getManualSeedCookies() {
  const cookieHeader = process.env.PROBE_1688_COOKIE_HEADER?.trim();
  if (!cookieHeader) {
    return {
      cookies: [] as SeedCookie[],
      source: null,
    };
  }

  const cookies = parseCookieHeader(cookieHeader);
  return {
    cookies,
    source: "env:PROBE_1688_COOKIE_HEADER",
  };
}

function buildRuntimeTargets() {
  const raw = process.env.PROBE_1688_URLS?.trim();
  if (!raw) {
    return TARGETS as readonly RuntimeProbeTarget[];
  }

  const urls = raw
    .split(/\s+/)
    .map((value) => value.trim())
    .filter(Boolean);

  if (urls.length === 0) {
    return TARGETS as readonly RuntimeProbeTarget[];
  }

  return urls.map((url, index) => ({
    id: `custom-${index + 1}`,
    url,
  }));
}

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

function timestampLabel(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

function buildContextOptions(variant: ProbeVariant): BrowserContextOptions {
  return {
    viewport: {
      width: 1440,
      height: 900,
    },
    locale: "zh-CN",
    timezoneId: "Asia/Shanghai",
    colorScheme: "light",
    deviceScaleFactor: 1,
    extraHTTPHeaders: {
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "upgrade-insecure-requests": "1",
    },
    userAgent: variant.realisticUserAgent ? REALISTIC_USER_AGENT : undefined,
  };
}

function buildLaunchOptions(executablePath: string, variant: ProbeVariant): LaunchOptions {
  const args = variant.stealth
    ? [...DEFAULT_BROWSER_ARGS, "--disable-blink-features=AutomationControlled"]
    : [...DEFAULT_BROWSER_ARGS];

  return {
    headless: variant.headless,
    executablePath,
    args,
  };
}

async function applyStealthContext(context: BrowserContext) {
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => undefined,
    });

    Object.defineProperty(navigator, "languages", {
      get: () => ["zh-CN", "zh", "en-US", "en"],
    });

    Object.defineProperty(navigator, "plugins", {
      get: () => [
        { name: "Chrome PDF Plugin" },
        { name: "Chrome PDF Viewer" },
        { name: "Native Client" },
      ],
    });

    Object.defineProperty(navigator, "platform", {
      get: () => "Linux x86_64",
    });
  });

  await context.setExtraHTTPHeaders({
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "sec-ch-ua":
      '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Linux"',
  });
}

function detectBlock(title: string | null, finalUrl: string | null, html: string, bodyText: string) {
  const signals = new Set<string>();
  const haystack = `${title ?? ""}\n${finalUrl ?? ""}\n${html}\n${bodyText}`.toLowerCase();
  const patterns: Array<[string, RegExp]> = [
    ["title-captcha", /验证码拦截|验证|captcha/],
    ["punish-url", /_____tmd_____|\/punish|x5secdata|x5step/],
    ["awsc-script", /awsc\.js|nocaptcha|nctokenstr/],
    ["deny-copy", /访问受限|访问被拒绝|deny-title|access denied/],
  ];

  for (const [label, pattern] of patterns) {
    if (pattern.test(haystack)) {
      signals.add(label);
    }
  }

  return {
    blocked: signals.size > 0,
    signals: [...signals],
  };
}

function compactText(input: string, maxLength: number) {
  return input.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

async function captureFingerprint(page: Page): Promise<NavigatorFingerprint> {
  return page.evaluate(() => {
    const navigatorWithDeviceMemory = navigator as Navigator & { deviceMemory?: number };
    return {
      userAgent: navigator.userAgent,
      webdriver: typeof navigator.webdriver === "boolean" ? navigator.webdriver : null,
      languages: Array.isArray(navigator.languages) ? navigator.languages : [],
      platform: navigator.platform,
      hardwareConcurrency: typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : null,
      deviceMemory: typeof navigatorWithDeviceMemory.deviceMemory === "number" ? navigatorWithDeviceMemory.deviceMemory : null,
      pluginsLength: typeof navigator.plugins?.length === "number" ? navigator.plugins.length : null,
    };
  });
}

async function probeTarget(
  context: BrowserContext,
  target: RuntimeProbeTarget,
  screenshotDirectory: string,
  screenshotPrefix: string,
): Promise<TargetProbeResult> {
  const page = await context.newPage();

  try {
    const response = await page.goto(target.url, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });

    await page.waitForTimeout(2_000);

    const title = await page.title();
    const finalUrl = page.url();
    const html = await page.content();
    const bodyText = await page.locator("body").innerText().catch(() => "");
    const fingerprint = await captureFingerprint(page);
    const { blocked, signals } = detectBlock(title, finalUrl, html, bodyText);
    const screenshotPath = path.join(screenshotDirectory, `${screenshotPrefix}-${target.id}.png`);

    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    return {
      targetId: target.id,
      targetUrl: target.url,
      finalUrl,
      status: response?.status() ?? null,
      title,
      blocked,
      blockSignals: signals,
      htmlSnippet: compactText(html, 300),
      bodyTextSnippet: compactText(bodyText, 300),
      screenshotPath,
      fingerprint,
    };
  } catch (error) {
    return {
      targetId: target.id,
      targetUrl: target.url,
      finalUrl: null,
      status: null,
      title: null,
      blocked: true,
      blockSignals: ["probe-error"],
      htmlSnippet: "",
      bodyTextSnippet: "",
      screenshotPath: null,
      fingerprint: null,
      error: error instanceof Error ? error.stack ?? error.message : String(error),
    };
  } finally {
    await page.close().catch(() => undefined);
  }
}

async function runEphemeralVariant(
  variant: ProbeVariant,
  executablePath: string,
  screenshotDirectory: string,
  seedCookies: SeedCookie[],
): Promise<VariantRunOutput> {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;

  try {
    browser = await chromium.launch(buildLaunchOptions(executablePath, variant));
    context = await browser.newContext(buildContextOptions(variant));

    if (variant.stealth) {
      await applyStealthContext(context);
    }
    if (variant.reuseCookies && seedCookies.length > 0) {
      await context.addCookies(seedCookies);
    }

    const targets: TargetProbeResult[] = [];
    for (const target of variant.targets) {
      targets.push(await probeTarget(context, target, screenshotDirectory, variant.id));
    }

    const cookies = await context.cookies();
    return {
      result: {
        id: variant.id,
        description: variant.description,
        headless: variant.headless,
        persistent: false,
        stealth: variant.stealth,
        realisticUserAgent: variant.realisticUserAgent,
        reuseCookies: variant.reuseCookies,
        cookiesCount: cookies.length,
        cookieNames: [...new Set(cookies.map((cookie) => cookie.name))].sort(),
        targets,
      },
      cookies,
    };
  } catch (error) {
    return {
      result: {
        id: variant.id,
        description: variant.description,
        headless: variant.headless,
        persistent: false,
        stealth: variant.stealth,
        realisticUserAgent: variant.realisticUserAgent,
        reuseCookies: variant.reuseCookies,
        cookiesCount: 0,
        cookieNames: [],
        launchError: error instanceof Error ? error.stack ?? error.message : String(error),
        targets: [],
      },
      cookies: [],
    };
  } finally {
    await context?.close().catch(() => undefined);
    await browser?.close().catch(() => undefined);
  }
}

async function runPersistentVariant(
  variant: ProbeVariant,
  executablePath: string,
  screenshotDirectory: string,
  seedCookies: SeedCookie[],
  runRootDirectory: string,
): Promise<VariantRunOutput> {
  const userDataDir = path.join(runRootDirectory, "profiles", variant.id);
  mkdirSync(userDataDir, { recursive: true });

  let context: BrowserContext | null = null;

  try {
    context = await chromium.launchPersistentContext(userDataDir, {
      ...buildContextOptions(variant),
      ...buildLaunchOptions(executablePath, variant),
    });

    if (variant.stealth) {
      await applyStealthContext(context);
    }
    if (variant.reuseCookies && seedCookies.length > 0) {
      await context.addCookies(seedCookies);
    }

    const targets: TargetProbeResult[] = [];
    for (const target of variant.targets) {
      targets.push(await probeTarget(context, target, screenshotDirectory, variant.id));
    }

    const cookies = await context.cookies();
    return {
      result: {
        id: variant.id,
        description: variant.description,
        headless: variant.headless,
        persistent: true,
        stealth: variant.stealth,
        realisticUserAgent: variant.realisticUserAgent,
        reuseCookies: variant.reuseCookies,
        cookiesCount: cookies.length,
        cookieNames: [...new Set(cookies.map((cookie) => cookie.name))].sort(),
        userDataDir,
        targets,
      },
      cookies,
    };
  } catch (error) {
    return {
      result: {
        id: variant.id,
        description: variant.description,
        headless: variant.headless,
        persistent: true,
        stealth: variant.stealth,
        realisticUserAgent: variant.realisticUserAgent,
        reuseCookies: variant.reuseCookies,
        cookiesCount: 0,
        cookieNames: [],
        userDataDir,
        launchError: error instanceof Error ? error.stack ?? error.message : String(error),
        targets: [],
      },
      cookies: [],
    };
  } finally {
    await context?.close().catch(() => undefined);
  }
}

function summarizeVariant(result: VariantProbeResult) {
  if (result.launchError) {
    return {
      variant: result.id,
      launchError: result.launchError.split("\n")[0],
    };
  }

  return {
    variant: result.id,
    cookiesCount: result.cookiesCount,
    targets: result.targets.map((target) => ({
      id: target.targetId,
      status: target.status,
      title: target.title,
      finalUrl: target.finalUrl,
      blocked: target.blocked,
      signals: target.blockSignals,
    })),
  };
}

async function main() {
  const startedAt = Date.now();
  const { executablePath, source } = resolveExecutablePath();
  const runRootDirectory = path.join(process.cwd(), "test-results", "1688-probes", timestampLabel());
  const screenshotDirectory = path.join(runRootDirectory, "screenshots");
  mkdirSync(screenshotDirectory, { recursive: true });
  const manualSeed = getManualSeedCookies();
  const runtimeTargets = buildRuntimeTargets();

  console.log(`[probe:1688] browser=${executablePath} source=${source}`);
  console.log(`[probe:1688] runDir=${runRootDirectory}`);
  if (manualSeed.source) {
    console.log(`[probe:1688] manualCookies=${manualSeed.source} count=${manualSeed.cookies.length}`);
  }
  console.log(`[probe:1688] targets=${runtimeTargets.map((target) => target.url).join(", ")}`);

  const results: VariantProbeResult[] = [];
  let seedCookies: SeedCookie[] = manualSeed.cookies;

  for (const variant of VARIANTS) {
    const runtimeVariant: ProbeVariant = {
      ...variant,
      targets: runtimeTargets,
    };
    console.log(`[probe:1688] running=${variant.id} headless=${variant.headless} persistent=${variant.persistent}`);

    const output = runtimeVariant.persistent
      ? await runPersistentVariant(runtimeVariant, executablePath, screenshotDirectory, seedCookies, runRootDirectory)
      : await runEphemeralVariant(runtimeVariant, executablePath, screenshotDirectory, seedCookies);
    const { result, cookies } = output;

    if (result.cookiesCount > 0) {
      const cookieFilePath = path.join(runRootDirectory, `${variant.id}-cookies.json`);
      await writeFile(cookieFilePath, JSON.stringify(cookies, null, 2), "utf8");
    }

    if (cookies.length > 0) {
      seedCookies = cookies;
    }

    results.push(result);
    console.log(JSON.stringify(summarizeVariant(result), null, 2));
  }

  const summary = {
    ok: true,
    executablePath,
    executableSource: source,
    manualCookieSource: manualSeed.source,
    manualCookieCount: manualSeed.cookies.length,
    display: process.env.DISPLAY ?? null,
    elapsedMs: Date.now() - startedAt,
    results,
  };

  const summaryPath = path.join(runRootDirectory, "summary.json");
  await writeFile(summaryPath, JSON.stringify(summary, null, 2), "utf8");
  console.log(`[probe:1688] summary=${summaryPath}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(`[probe:1688] failed\n${message}`);
  process.exitCode = 1;
});
