import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/VIJAY/.gemini/antigravity/brain/f7fa78bb-62de-4863-a373-8e54b26c8e8d";
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 3020;
const CDP_PORT = 9240;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status === 200) return true;
    } catch {}
    await sleep(400);
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function waitForChrome(port, timeoutMs = 12000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.status === 200) return true;
    } catch {}
    await sleep(300);
  }
  throw new Error(`Timeout waiting for Chrome on port ${port}`);
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
  console.log("=== STARTING PHASE 3C STEP 3B ROBUST VERIFICATION ===");

  // 1. Start Next.js server on port 3015
  console.log(`Starting Next.js server on port ${PORT}...`);
  const nextServer = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)], {
    stdio: "pipe",
  });

  try {
    await waitForServer(`http://localhost:${PORT}/admin/billing/upload`);
    console.log("Next.js server ready at /admin/billing/upload");

    // 2. Launch Headless Chrome
    const tempProfileDir = path.resolve(`./scratch/chrome-profile-${Date.now()}`);
    fs.mkdirSync(tempProfileDir, { recursive: true });

    const chromeProc = spawn(
      CHROME_PATH,
      [
        "--headless=new",
        `--remote-debugging-port=${CDP_PORT}`,
        `--user-data-dir=${tempProfileDir}`,
        "--disable-gpu",
        "--no-first-run",
        "--window-size=1280,1100",
        `http://localhost:${PORT}/admin/billing/upload`,
      ],
      { stdio: "ignore" }
    );

    console.log(`Waiting for Chrome remote debugging on port ${CDP_PORT}...`);
    await waitForChrome(CDP_PORT);
    console.log("Chrome remote debugging port ready.");

    await sleep(1500);

    // 3. Connect to Chrome CDP WebSocket
    console.log("Connecting to Chrome CDP WebSocket...");
    const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const pages = await listRes.json();
    const targetPage = pages.find((p) => p.type === "page" && p.url.includes("upload")) || pages.find(p => p.type === "page") || pages[0];
    if (!targetPage || !targetPage.webSocketDebuggerUrl) {
      throw new Error("No Chrome CDP page found");
    }

    const ws = new WebSocket(targetPage.webSocketDebuggerUrl);
    await new Promise((resolve) => {
      ws.onopen = resolve;
    });
    const cdp = new CdpClient(ws);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    // Ensure we are on /admin/billing/upload
    const currentUrl = await cdp.eval(`window.location.href`);
    console.log(`Current page URL: ${currentUrl}`);
    if (!currentUrl.includes("/admin/billing/upload")) {
      console.log(`Navigating to http://localhost:${PORT}/admin/billing/upload...`);
      await cdp.send("Page.navigate", { url: `http://localhost:${PORT}/admin/billing/upload` });
      await sleep(2000);
    }

    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 1100,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(600);

    console.log("CDP session established and page ready.");

    // --- TEST 1: Load Demo Ledger & Run Mock Extraction ---
    console.log("\n[TEST 1] Loading demo ledger...");
    await cdp.eval(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const demoBtn = btns.find(b => b.textContent && b.textContent.includes('Load Demo Sheet'));
      if (demoBtn) demoBtn.click();
    })()`);
    await sleep(600);

    console.log("Starting mock AI extraction...");
    await cdp.eval(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const scanBtn = btns.find(b => b.textContent && b.textContent.includes('Start AI Extraction'));
      if (scanBtn) scanBtn.click();
    })()`);

    // Poll until extraction review table is rendered
    console.log("Waiting for extraction to complete...");
    let extractionCompleted = false;
    for (let i = 0; i < 30; i++) {
      await sleep(300);
      const hasTable = await cdp.eval(`Boolean(document.getElementById('btn-trigger-reconciliation'))`);
      if (hasTable) {
        extractionCompleted = true;
        console.log(`Extraction finished in ${(i + 1) * 300}ms!`);
        break;
      }
    }

    if (!extractionCompleted) {
      throw new Error("Extraction table did not render in time");
    }

    // Toggle duplicate simulation checkbox via real click
    console.log("Enabling duplicate simulation (Nov 4 Shifts A & B) via click()...");
    await cdp.eval(`(() => {
      const chk = document.getElementById('checkbox-test-duplicate');
      if (chk && !chk.checked) {
        chk.click();
      }
    })()`);
    await sleep(600);

    // Click "Compare with Billing Calendar"
    console.log("Clicking 'Compare with Billing Calendar'...");
    await cdp.eval(`(() => {
      const cmpBtn = document.getElementById('btn-trigger-reconciliation');
      if (cmpBtn) cmpBtn.click();
    })()`);

    // Poll for reconciliation section
    let reconReady = false;
    for (let i = 0; i < 20; i++) {
      await sleep(300);
      const isVisible = await cdp.eval(`Boolean(document.getElementById('reconciliation-section'))`);
      if (isVisible) {
        reconReady = true;
        console.log("Reconciliation section is ready!");
        break;
      }
    }

    if (!reconReady) {
      throw new Error("Reconciliation section did not appear");
    }

    // Read KPI card counts
    const kpis = await cdp.eval(`(() => {
      const sec = document.getElementById('reconciliation-section');
      if (!sec) return null;
      const cards = Array.from(sec.querySelectorAll('.grid button'));
      return cards.map(c => ({
        label: c.querySelector('span')?.textContent?.trim(),
        value: c.querySelector('.font-serif')?.textContent?.trim()
      }));
    })()`);
    console.log("Reconciliation KPIs:", JSON.stringify(kpis));

    // Scroll reconciliation section into full view
    await cdp.eval(`(() => {
      const el = document.getElementById('reconciliation-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`);
    await sleep(500);

    // --- SCREENSHOT 1: Reconciliation Overview & Summary Cards ---
    console.log("\n[SCREENSHOT 1] Capturing reconciliation overview and summary cards...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "recon_step1_overview_and_cards.png"));

    // --- TEST 2: Switch to Blank Calendar to demonstrate NEW Dates ---
    console.log("\n[TEST 2] Switching comparison target to Blank Calendar (100% New Dates)...");
    await cdp.eval(`(() => {
      const select = document.getElementById('select-comparison-target');
      if (select) {
        select.value = 'EMPTY';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`);
    await sleep(400);

    // Re-run comparison with blank roster
    await cdp.eval(`document.getElementById('btn-recompare')?.click()`);
    await sleep(600);

    const newKpis = await cdp.eval(`(() => {
      const sec = document.getElementById('reconciliation-section');
      const cards = Array.from(sec.querySelectorAll('.grid button'));
      return cards.map(c => ({
        label: c.querySelector('span')?.textContent?.trim(),
        value: c.querySelector('.font-serif')?.textContent?.trim()
      }));
    })()`);
    console.log("Blank Calendar KPIs (New entries):", JSON.stringify(newKpis));

    console.log("[SCREENSHOT 2] Capturing New entries view...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "recon_step2_new_and_matching.png"));

    // Switch back to Sample Manufacturing Roster (November 2026)
    console.log("Switching back to Sample Manufacturing Roster (Nov 2026)...");
    await cdp.eval(`(() => {
      const select = document.getElementById('select-comparison-target');
      if (select) {
        select.value = 'SAMPLE_ROSTER';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`);
    await sleep(400);
    await cdp.eval(`document.getElementById('btn-recompare')?.click()`);
    await sleep(600);

    // --- TEST 3: Conflict Comparison & Resolution Decision ---
    console.log("\n[TEST 3] Filtering by Conflicts...");
    await cdp.eval(`(() => {
      const select = document.querySelector('#reconciliation-section select');
      if (select) {
        select.value = 'CONFLICT';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`);
    await sleep(500);

    const conflictRowCount = await cdp.eval(`document.querySelectorAll('#reconciliation-section tbody tr').length`);
    console.log(`Conflict rows visible: ${conflictRowCount}`);

    // Click "Accept Scan" on first conflict row
    console.log("Clicking 'Accept Scan' on first conflict row...");
    await cdp.eval(`(() => {
      const firstRow = document.querySelector('#reconciliation-section tbody tr');
      if (firstRow) {
        const acceptBtn = Array.from(firstRow.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Accept Scan'));
        if (acceptBtn) acceptBtn.click();
      }
    })()`);
    await sleep(400);

    console.log("[SCREENSHOT 3] Capturing conflict comparison & resolution...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "recon_step3_conflict_comparison.png"));

    // --- TEST 4: Duplicate Date Review & Modal ---
    console.log("\n[TEST 4] Filtering by Duplicates and inspecting duplicate modal...");
    await cdp.eval(`(() => {
      const select = document.querySelector('#reconciliation-section select');
      if (select) {
        select.value = 'DUPLICATE';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`);
    await sleep(500);

    // Click "Inspect Duplicates"
    await cdp.eval(`(() => {
      const btns = Array.from(document.querySelectorAll('#reconciliation-section button'));
      const inspectBtn = btns.find(b => b.textContent && b.textContent.includes('Inspect Duplicates'));
      if (inspectBtn) inspectBtn.click();
    })()`);
    await sleep(600);

    const modalTitle = await cdp.eval(`(() => {
      const h3 = document.querySelector('.fixed.inset-0 h3');
      return h3 ? h3.textContent : null;
    })()`);
    console.log(`Duplicate modal opened with title: "${modalTitle}"`);

    console.log("[SCREENSHOT 4] Capturing duplicate date inspection modal...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "recon_step4_duplicate_date_review.png"));

    // Click "Merge Both Entries" inside modal
    console.log("Clicking 'Merge Both Entries' inside modal...");
    await cdp.eval(`(() => {
      const btns = Array.from(document.querySelectorAll('.fixed.inset-0 button'));
      const mergeBtn = btns.find(b => b.textContent && b.textContent.includes('Merge Both Entries'));
      if (mergeBtn) mergeBtn.click();
    })()`);
    await sleep(600);

    // --- TEST 5: Missing in Scan Dates ---
    console.log("\n[TEST 5] Filtering by Missing in Scan dates...");
    await cdp.eval(`(() => {
      const select = document.querySelector('#reconciliation-section select');
      if (select) {
        select.value = 'MISSING';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`);
    await sleep(500);

    const missingRowsCount = await cdp.eval(`document.querySelectorAll('#reconciliation-section tbody tr').length`);
    console.log(`Missing in scan dates visible: ${missingRowsCount}`);

    console.log("[SCREENSHOT 5] Capturing missing in scan dates...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "recon_step5_missing_date_view.png"));

    // --- TEST 6: Mobile Responsive Layout ---
    console.log("\n[TEST 6] Testing mobile responsive viewport (375 x 812)...");
    await cdp.eval(`(() => {
      const select = document.querySelector('#reconciliation-section select');
      if (select) {
        select.value = 'ALL';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`);
    await sleep(300);

    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(600);

    await cdp.eval(`(() => {
      const el = document.getElementById('reconciliation-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`);
    await sleep(500);

    console.log("[SCREENSHOT 6] Capturing mobile layout...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "recon_step6_mobile_layout.png"));

    // Cleanup Chrome
    console.log("\nCleaning up browser and server processes...");
    ws.close();
    chromeProc.kill();
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    nextServer.kill();
    console.log("=== PHASE 3C STEP 3B VERIFICATION FINISHED ===");
  }
}

main();
