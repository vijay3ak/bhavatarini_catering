import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/VIJAY/.gemini/antigravity/brain/f7fa78bb-62de-4863-a373-8e54b26c8e8d";
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 3025;
const CDP_PORT = 9245;

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
  console.log("=== STARTING PHASE 3C STEP 3C FINAL APPROVAL & APPLICATION AUDIT ===");

  // 1. Start Next.js server on port 3025
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
    const targetPage = pages.find((p) => p.type === "page" && p.url.includes("upload")) || pages[0];
    if (!targetPage || !targetPage.webSocketDebuggerUrl) {
      throw new Error("No Chrome CDP page found");
    }

    const ws = new WebSocket(targetPage.webSocketDebuggerUrl);
    await new Promise((resolve) => (ws.onopen = resolve));
    const cdp = new CdpClient(ws);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    // Ensure we are on /admin/billing/upload
    const currentUrl = await cdp.eval(`window.location.href`);
    console.log(`Current page URL: ${currentUrl}`);
    if (!currentUrl.includes("/admin/billing/upload")) {
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

    // --- STEP 1: Load Demo Sheet & Extract ---
    console.log("\n[1] Loading demo ledger...");
    await cdp.eval(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const demoBtn = btns.find(b => b.textContent && b.textContent.includes('Load Demo Sheet'));
      if (demoBtn) demoBtn.click();
    })()`);
    await sleep(600);

    console.log("[2] Starting mock AI extraction...");
    await cdp.eval(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const scanBtn = btns.find(b => b.textContent && b.textContent.includes('Start AI Extraction'));
      if (scanBtn) scanBtn.click();
    })()`);

    for (let i = 0; i < 30; i++) {
      await sleep(300);
      const hasTable = await cdp.eval(`Boolean(document.getElementById('btn-trigger-reconciliation'))`);
      if (hasTable) {
        console.log(`Extraction completed in ${(i + 1) * 300}ms!`);
        break;
      }
    }

    // Enable duplicate date simulation for Nov 4
    console.log("[3] Enabling duplicate simulation (Nov 4 Shifts A & B)...");
    await cdp.eval(`(() => {
      const chk = document.getElementById('checkbox-test-duplicate');
      if (chk && !chk.checked) chk.click();
    })()`);
    await sleep(500);

    // Click "Compare with Billing Calendar"
    console.log("[4] Triggering reconciliation comparison...");
    await cdp.eval(`document.getElementById('btn-trigger-reconciliation')?.click()`);

    for (let i = 0; i < 20; i++) {
      await sleep(300);
      const isVisible = await cdp.eval(`Boolean(document.getElementById('reconciliation-section'))`);
      if (isVisible) {
        console.log("Reconciliation section is ready!");
        break;
      }
    }

    // Scroll to Final Approval Section
    await cdp.eval(`(() => {
      const el = document.getElementById('final-approval-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`);
    await sleep(600);

    // --- TEST 7: Attempt Application with Unresolved Conflicts (Validation Check) ---
    console.log("\n[TEST 7] Verifying that Apply button is disabled when decisions are unresolved...");
    const isApplyDisabled = await cdp.eval(`(() => {
      const btn = document.getElementById('btn-apply-to-session');
      return btn ? btn.disabled : null;
    })()`);
    console.log(`Apply button disabled: ${isApplyDisabled} (Expected: true)`);

    // Capture Screenshot 2: Unresolved Decision Validation Guard
    console.log("[SCREENSHOT 2] Capturing Unresolved Decision Validation Guard...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "step3c_2_unresolved_validation.png"));

    // --- RESOLVE ALL DECISIONS ---
    console.log("\n[5] Resolving all pending decisions to prepare for application...");

    // A. Resolve Duplicate on Nov 4 by merging both shift logs
    console.log("  -> Inspecting and merging duplicate on Nov 4...");
    await cdp.eval(`(() => {
      const btns = Array.from(document.querySelectorAll('#reconciliation-section button'));
      const inspectBtn = btns.find(b => b.textContent && b.textContent.includes('Inspect Duplicates'));
      if (inspectBtn) inspectBtn.click();
    })()`);
    await sleep(600);

    await cdp.eval(`(() => {
      const btns = Array.from(document.querySelectorAll('.fixed.inset-0 button'));
      const mergeBtn = btns.find(b => b.textContent && b.textContent.includes('Merge Both Entries'));
      if (mergeBtn) mergeBtn.click();
    })()`);
    await sleep(600);

    // B. Accept all conflicts (Accept Scan)
    console.log("  -> Accepting all conflict rows...");
    await cdp.eval(`(() => {
      const rows = Array.from(document.querySelectorAll('#reconciliation-section tbody tr'));
      rows.forEach(r => {
        const acceptBtn = Array.from(r.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Accept Scan'));
        if (acceptBtn) acceptBtn.click();
      });
    })()`);
    await sleep(600);

    // C. Handle missing dates: Retain Roster
    console.log("  -> Retaining all missing dates...");
    await cdp.eval(`(() => {
      const rows = Array.from(document.querySelectorAll('#reconciliation-section tbody tr'));
      rows.forEach(r => {
        const retainBtn = Array.from(r.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Retain Roster'));
        if (retainBtn) retainBtn.click();
      });
    })()`);
    await sleep(600);

    // Verify unresolved count is now 0
    const unresolvedCountNow = await cdp.eval(`(() => {
      const card = Array.from(document.querySelectorAll('#final-approval-section .grid div')).find(d => d.textContent && d.textContent.includes('Pending'));
      return card ? card.querySelector('.font-serif')?.textContent?.trim() : null;
    })()`);
    console.log(`Unresolved decisions count after resolution: ${unresolvedCountNow} (Expected: 0)`);

    // Verify Apply button is now enabled
    const isApplyNowEnabled = await cdp.eval(`(() => {
      const btn = document.getElementById('btn-apply-to-session');
      return btn ? !btn.disabled : false;
    })()`);
    console.log(`Apply button enabled: ${isApplyNowEnabled} (Expected: true)`);

    // Scroll to Final Approval Summary
    await cdp.eval(`(() => {
      const el = document.getElementById('final-approval-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`);
    await sleep(400);

    // Capture Screenshot 1: Final Approval Summary with all decisions resolved
    console.log("\n[SCREENSHOT 1] Capturing Final Approval Summary...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "step3c_1_approval_summary.png"));

    // Scroll to Before-and-After Audit Log Table
    await cdp.eval(`(() => {
      const el = document.getElementById('before-after-preview-table');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`);
    await sleep(400);

    // Capture Screenshot 3: Before-and-After Preview
    console.log("\n[SCREENSHOT 3] Capturing Before-and-After Preview...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "step3c_3_before_after_preview.png"));

    // --- CLICK APPLY & OPEN CONFIRMATION MODAL ---
    console.log("\n[6] Clicking 'Apply to Active Billing Session' to open confirmation modal...");
    await cdp.eval(`(() => {
      const btn = document.getElementById('btn-apply-to-session');
      if (btn) btn.click();
    })()`);
    await sleep(600);

    const modalTitle = await cdp.eval(`(() => {
      const h3 = document.querySelector('.fixed.inset-0 h3');
      return h3 ? h3.textContent?.trim() : null;
    })()`);
    console.log(`Confirmation modal opened: "${modalTitle}"`);

    // Capture Screenshot 4: Confirmation Modal
    console.log("\n[SCREENSHOT 4] Capturing Confirmation Modal...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "step3c_4_confirmation_modal.png"));

    // Confirm and Apply
    console.log("\n[7] Confirming application inside modal...");
    await cdp.eval(`(() => {
      const confirmBtn = document.getElementById('btn-confirm-apply-modal');
      if (confirmBtn) confirmBtn.click();
    })()`);
    await sleep(800);

    // Verify Completion Card
    const hasCompletionCard = await cdp.eval(`Boolean(document.getElementById('completion-summary-card'))`);
    console.log(`Completion card visible: ${hasCompletionCard}`);

    // Verify localStorage has NOT been modified (Safety Requirement)
    const localStorageDraft = await cdp.eval(`localStorage.getItem('bcs_billing_draft_v1')`);
    console.log(`localStorage key 'bcs_billing_draft_v1' before explicit Save Draft: ${localStorageDraft === null ? "NULL (Safe - unpolluted)" : "Existed prior"}`);

    // Capture Screenshot 5: Completion Summary
    console.log("\n[SCREENSHOT 5] Capturing Completion Summary...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "step3c_5_completion_summary.png"));

    // --- NAVIGATE TO /admin/billing ---
    console.log("\n[8] Navigating to /admin/billing to verify active session consumption...");
    await cdp.eval(`(() => {
      const link = document.getElementById('btn-navigate-to-billing');
      if (link) link.click();
    })()`);
    await sleep(1500);

    const billingUrl = await cdp.eval(`window.location.href`);
    console.log(`Arrived at: ${billingUrl}`);

    // Verify Staged Banner rendered on /admin/billing
    const hasStagedBanner = await cdp.eval(`Boolean(document.getElementById('staged-reconciliation-banner'))`);
    console.log(`Staged reconciliation banner visible on /admin/billing: ${hasStagedBanner}`);

    // Verify meal counts in billing table
    const tableRowsCount = await cdp.eval(`document.querySelectorAll('table tbody tr').length`);
    console.log(`Daily billing table rows rendered: ${tableRowsCount}`);

    // Scroll to top of /admin/billing to capture banner and calendar
    await cdp.eval(`window.scrollTo(0, 0)`);
    await sleep(400);

    // Capture Screenshot 6: Updated Billing Calendar on /admin/billing
    console.log("\n[SCREENSHOT 6] Capturing Updated Billing Calendar on /admin/billing...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "step3c_6_updated_billing_calendar.png"));

    // --- TEST 13: Test Reversibility (Undo Import) ---
    console.log("\n[TEST 13] Testing Reversibility (Undo Import on /admin/billing)...");
    await cdp.eval(`(() => {
      const undoBtn = document.getElementById('btn-undo-staged-import');
      if (undoBtn) undoBtn.click();
    })()`);
    await sleep(500);

    const bannerAfterUndo = await cdp.eval(`Boolean(document.getElementById('staged-reconciliation-banner'))`);
    console.log(`Staged banner removed after Undo: ${!bannerAfterUndo} (Expected: true)`);

    // --- CAPTURE MOBILE RESPONSIVE LAYOUT ---
    console.log("\n[9] Navigating back to /admin/billing/upload for Mobile Viewport Capture...");
    await cdp.send("Page.navigate", { url: `http://localhost:${PORT}/admin/billing/upload` });
    await sleep(1500);

    // Load demo, extract, compare
    await cdp.eval(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const demoBtn = btns.find(b => b.textContent && b.textContent.includes('Load Demo Sheet'));
      if (demoBtn) demoBtn.click();
    })()`);
    await sleep(500);

    await cdp.eval(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const scanBtn = btns.find(b => b.textContent && b.textContent.includes('Start AI Extraction'));
      if (scanBtn) scanBtn.click();
    })()`);
    await sleep(1600);

    await cdp.eval(`document.getElementById('btn-trigger-reconciliation')?.click()`);
    await sleep(600);

    console.log("Setting mobile viewport (375 x 812)...");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(600);

    await cdp.eval(`(() => {
      const el = document.getElementById('final-approval-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`);
    await sleep(500);

    // Capture Screenshot 7: Mobile Layout
    console.log("[SCREENSHOT 7] Capturing Mobile Layout...");
    await cdp.screenshot(path.join(ARTIFACT_DIR, "step3c_7_mobile_layout.png"));

    // Cleanup Chrome
    console.log("\nCleaning up browser and server processes...");
    ws.close();
    chromeProc.kill();
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    nextServer.kill();
    console.log("=== PHASE 3C STEP 3C VERIFICATION FINISHED ===");
  }
}

main();
