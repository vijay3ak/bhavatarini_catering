import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/VIJAY/.gemini/antigravity/brain/f7fa78bb-62de-4863-a373-8e54b26c8e8d";
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 3009;
const CDP_PORT = 9229;
const USER_DATA_DIR = path.resolve("./scratch/chrome-profile");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status === 200) return true;
    } catch {
      // Server not ready yet
    }
    await sleep(400);
  }
  throw new Error(`Timeout waiting for ${url}`);
}

class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.id = 1;
    this.callbacks = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.callbacks.has(data.id)) {
        const cb = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) cb.reject(new Error(data.error.message));
        else cb.resolve(data.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  async screenshot(filePath) {
    const res = await this.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(filePath, Buffer.from(res.data, "base64"));
    console.log(`  -> Saved artifact: ${path.basename(filePath)} (${(res.data.length * 0.75 / 1024).toFixed(1)} KB)`);
  }
}

async function main() {
  console.log("=== STARTING PHASE 3C STEP 2 AUTOMATION & VERIFICATION ===");

  // 1. Start Next.js production server
  console.log(`Starting Next.js server on port ${PORT}...`);
  const nextServer = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)], {
    stdio: "pipe",
  });

  nextServer.stdout.on("data", (d) => {
    const msg = d.toString().trim();
    if (msg) console.log("[Next]", msg);
  });

  nextServer.stderr.on("data", (d) => {
    const msg = d.toString();
    if (!msg.includes("ExperimentalWarning")) {
      console.error("[Next stderr]", msg);
    }
  });

  try {
    await waitForServer(`http://localhost:${PORT}/admin/billing/upload`);
    console.log("Next.js server is ready and responding at /admin/billing/upload!");

    // 2. Launch Chrome with CDP
    if (!fs.existsSync(USER_DATA_DIR)) {
      fs.mkdirSync(USER_DATA_DIR, { recursive: true });
    }

    console.log("Launching Headless Chrome with remote debugging on port " + CDP_PORT + "...");
    const chromeProc = spawn(
      CHROME_PATH,
      [
        "--headless=new",
        `--remote-debugging-port=${CDP_PORT}`,
        `--user-data-dir=${USER_DATA_DIR}`,
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--window-size=1280,900",
        `http://localhost:${PORT}/admin/billing/upload`,
      ],
      { stdio: "ignore" }
    );

    await sleep(1500);

    // 3. Connect to CDP WebSocket
    const versionRes = await fetch(`http://localhost:${CDP_PORT}/json/version`);
    const versionData = await versionRes.json();
    console.log("Chrome CDP Version:", versionData["Browser"]);

    const listRes = await fetch(`http://localhost:${CDP_PORT}/json/list`);
    const pages = await listRes.json();
    const targetPage = pages.find((p) => p.type === "page" && p.url.includes("upload")) || pages[0];
    if (!targetPage) throw new Error("Could not find Chrome page target");

    console.log("Connecting to WebSocket:", targetPage.webSocketDebuggerUrl);
    const ws = new WebSocket(targetPage.webSocketDebuggerUrl);
    await new Promise((resolve) => (ws.onopen = resolve));

    const cdp = new CdpClient(ws);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    // Configure viewport (1280 x 860)
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 860,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await sleep(1000);

    // --- SCREENSHOT 1: Empty State ---
    console.log("1. Capturing Initial Empty State...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "upload_step1_empty_state.png"));

    // --- ACTION 2: Load Demo Sheet ---
    console.log("2. Clicking 'Load Demo Sheet' button...");
    const clickDemoResult = await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Load Demo Sheet'));
        if (btn) { btn.click(); return true; }
        return false;
      })()
    `);
    console.log("  -> Clicked demo button:", clickDemoResult);
    await sleep(800);

    // --- SCREENSHOT 2: Demo Sheet Loaded ---
    console.log("3. Capturing Loaded Demo Sheet & Preview...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "upload_step2_demo_loaded.png"));

    // --- ACTION 3: Test Zoom Controls ---
    console.log("4. Testing Zoom In (+) twice...");
    await cdp.eval(`
      (() => {
        const zoomInBtn = document.querySelector('button[title="Zoom In"]');
        if (zoomInBtn) {
          zoomInBtn.click();
          zoomInBtn.click();
          return true;
        }
        return false;
      })()
    `);
    await sleep(400);

    // --- SCREENSHOT 3: Zoomed Preview ---
    console.log("5. Capturing Zoomed Document Preview (150%)...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "upload_step3_zoomed_preview.png"));

    // --- ACTION 4: Reset Zoom and Click 'Start AI Extraction' ---
    console.log("6. Resetting zoom and triggering 'Start AI Extraction'...");
    await cdp.eval(`
      (() => {
        const resetBtn = document.querySelector('button[title="Reset Zoom"]');
        if (resetBtn) resetBtn.click();
        
        const extractBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Start AI Extraction'));
        if (extractBtn) {
          extractBtn.click();
          return true;
        }
        return false;
      })()
    `);
    await sleep(400);

    // --- SCREENSHOT 4: Scanning Laser / Progress State ---
    console.log("7. Capturing Optical Laser Scanning in-flight...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "upload_step4_scanning_active.png"));

    // Wait for mock extraction to finish (950ms delay + buffer)
    await sleep(1500);

    // --- SCREENSHOT 5: Extraction Completed with Stats Card ---
    console.log("8. Capturing Extraction Completed with KPI Summary Badges...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "upload_step5_extraction_completed.png"));

    // --- ACTION 5: Responsive Mobile Layout Test ---
    console.log("9. Testing Mobile Viewport (390 x 844, iPhone scale)...");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(600);

    // --- SCREENSHOT 6: Mobile Layout ---
    console.log("10. Capturing Mobile Responsive Layout...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "upload_step6_mobile_responsive.png"));

    // Cleanup Chrome
    ws.close();
    chromeProc.kill();
    console.log("Chrome session closed.");

  } finally {
    // Kill next server
    nextServer.kill();
    console.log("Next.js server stopped.");
  }

  console.log("==================================================");
  console.log("ALL STEP 2 AUTOMATION & ARTIFACTS CAPTURED CLEANLY!");
  console.log("==================================================");
}

main().catch((err) => {
  console.error("FATAL ERROR in test script:", err);
  process.exit(1);
});
