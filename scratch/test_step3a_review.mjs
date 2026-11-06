import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/VIJAY/.gemini/antigravity/brain/f7fa78bb-62de-4863-a373-8e54b26c8e8d";
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 3011;
const CDP_PORT = 9231;
const USER_DATA_DIR = path.resolve("./scratch/chrome-profile-step3a");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 20000) {
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
  console.log("=== STARTING PHASE 3C STEP 3A VERIFICATION & SCREENSHOT CAPTURE ===");

  // 1. Start Next.js server on port 3011
  console.log(`Starting Next.js server on port ${PORT}...`);
  const nextServer = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)], {
    stdio: "pipe",
  });

  try {
    await waitForServer(`http://localhost:${PORT}/admin/billing/upload`);
    console.log("Next.js server ready at /admin/billing/upload");

    // 2. Launch Headless Chrome
    if (!fs.existsSync(USER_DATA_DIR)) {
      fs.mkdirSync(USER_DATA_DIR, { recursive: true });
    }

    const chromeProc = spawn(
      CHROME_PATH,
      [
        "--headless=new",
        `--remote-debugging-port=${CDP_PORT}`,
        `--user-data-dir=${USER_DATA_DIR}`,
        "--disable-gpu",
        "--no-first-run",
        "--window-size=1280,1050",
        `http://localhost:${PORT}/admin/billing/upload`,
      ],
      { stdio: "ignore" }
    );

    await sleep(1500);

    const listRes = await fetch(`http://localhost:${CDP_PORT}/json/list`);
    const pages = await listRes.json();
    const targetPage = pages.find((p) => p.type === "page" && p.url.includes("upload")) || pages[0];

    const ws = new WebSocket(targetPage.webSocketDebuggerUrl);
    await new Promise((resolve) => (ws.onopen = resolve));

    const cdp = new CdpClient(ws);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 1050,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await sleep(800);

    // 3. Click "Load Demo Sheet"
    console.log("Loading demo sheet...");
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Load Demo Sheet'));
        if (btn) btn.click();
      })()
    `);
    await sleep(600);

    // 4. Click "Start AI Extraction"
    console.log("Triggering extraction...");
    await cdp.eval(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Start AI Extraction'));
        if (btn) btn.click();
      })()
    `);

    // Wait for extraction to complete (950ms delay + buffer)
    await sleep(1800);

    // Verify Review Table has rendered
    const hasReviewSection = await cdp.eval(`
      Boolean(document.querySelector('h2') && document.querySelector('h2').textContent.includes('Extraction Review'))
    `);
    console.log("Review section rendered:", hasReviewSection);

    // Scroll down so review table is in view
    await cdp.eval(`
      const h2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Extraction Review'));
      if (h2) h2.scrollIntoView({ behavior: 'instant', block: 'start' });
    `);
    await sleep(400);

    // --- SCREENSHOT 1: Full Extraction Review Table & Metric Cards ---
    console.log("\n1. Capturing Screenshot 1: Extraction Review Table...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "review_step1_table.png"));

    // --- SCREENSHOT 2: Filter to Unclear Record (06/11) ---
    console.log("\n2. Filtering by Status: UNCLEAR...");
    await cdp.eval(`
      (() => {
        const select = Array.from(document.querySelectorAll('select')).find(s => Array.from(s.options).some(o => o.value === 'UNCLEAR'));
        if (select) {
          select.value = 'UNCLEAR';
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await sleep(500);
    console.log("Capturing Screenshot 2: Unclear Record View...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "review_step2_unclear_record.png"));

    // --- SCREENSHOT 3: Filter to Combined Notation Record (04/11) ---
    console.log("\n3. Filtering by Status: COMBINED...");
    await cdp.eval(`
      (() => {
        const select = Array.from(document.querySelectorAll('select')).find(s => Array.from(s.options).some(o => o.value === 'COMBINED'));
        if (select) {
          select.value = 'COMBINED';
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await sleep(500);
    console.log("Capturing Screenshot 3: Combined Notation Record View...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "review_step3_combined_notation.png"));

    // --- SCREENSHOT 4: Open Manual Correction Modal on Unclear Record ---
    console.log("\n4. Resetting filters and opening Manual Correction Modal for 06/11...");
    await cdp.eval(`
      (() => {
        // Reset filter
        const select = Array.from(document.querySelectorAll('select')).find(s => Array.from(s.options).some(o => o.value === 'ALL'));
        if (select) {
          select.value = 'ALL';
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await sleep(400);

    // Click edit on 06/11 row
    await cdp.eval(`
      (() => {
        const rows = Array.from(document.querySelectorAll('tbody tr'));
        const row06 = rows.find(r => r.textContent.includes('06-11-2026') || r.textContent.includes('06-11'));
        if (row06) {
          const editBtn = row06.querySelector('button');
          if (editBtn) editBtn.click();
        }
      })()
    `);
    await sleep(600);

    console.log("Capturing Screenshot 4: Manual Correction Modal / Drawer...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "review_step4_manual_correction_modal.png"));

    // Test editing: change dinner count to 36 and add note
    console.log("Simulating edit: entering dinner = 36 and saving...");
    await cdp.eval(`
      (() => {
        const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        // 3rd input in shift meals is dinner (breakfast, lunch, dinner)
        if (inputs.length >= 3) {
          nativeSetter.call(inputs[2], "36");
          inputs[2].dispatchEvent(new Event('input', { bubbles: true }));
          inputs[2].dispatchEvent(new Event('change', { bubbles: true }));
        }
        const textarea = document.querySelector('textarea');
        if (textarea) {
          const nativeTextareaSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
          nativeTextareaSetter.call(textarea, "Confirmed 36 dinners with plant supervisor");
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await sleep(400);

    // Click Save Correction
    await cdp.eval(`
      (() => {
        const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Save Correction'));
        if (saveBtn) saveBtn.click();
      })()
    `);
    await sleep(600);

    // Verify row 06 is now marked as Corrected, dinner=36, billQty=70
    const row06Updated = await cdp.eval(`
      (() => {
        const rows = Array.from(document.querySelectorAll('tbody tr'));
        const row06 = rows.find(r => r.textContent.includes('06-11-2026') || r.textContent.includes('06-11'));
        return {
          rowText: row06 ? row06.innerText : null,
          hasCorrectedBadge: row06 ? row06.innerText.includes('Corrected') : false
        };
      })()
    `);
    console.log("Updated Row 06 Data:", row06Updated);

    // --- SCREENSHOT 5: Mobile Review Layout (390 x 844) ---
    console.log("\n5. Emulating Mobile Viewport (390 x 844)...");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(600);

    await cdp.eval(`
      const h2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Extraction Review'));
      if (h2) h2.scrollIntoView({ behavior: 'instant', block: 'start' });
    `);
    await sleep(400);

    console.log("Capturing Screenshot 5: Mobile Review Layout...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "review_step5_mobile_layout.png"));

    // Cleanup Chrome
    ws.close();
    chromeProc.kill();
    console.log("Chrome closed.");
  } finally {
    nextServer.kill();
    console.log("Next.js server stopped.");
  }

  console.log("\n==================================================");
  console.log("STEP 3A VERIFICATION & SCREENSHOTS COMPLETED!");
  console.log("==================================================");
}

main().catch((err) => {
  console.error("FATAL ERROR in test script:", err);
  process.exit(1);
});
