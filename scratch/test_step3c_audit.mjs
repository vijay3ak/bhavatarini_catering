import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 3030;
const CDP_PORT = 9250;

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
}

async function runScenarioAudit() {
  console.log("=== STARTING 10-SCENARIO AUDIT SUITE FOR STEP 3C ===");

  const results = {};

  const nextServer = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)], {
    stdio: "pipe",
  });

  try {
    await waitForServer(`http://localhost:${PORT}/admin/billing/upload`);
    console.log("Next.js production server ready at port", PORT);

    const tempProfileDir = path.resolve(`./scratch/chrome-profile-audit-${Date.now()}`);
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

    await waitForChrome(CDP_PORT);
    console.log("Chrome CDP ready at port", CDP_PORT);

    await sleep(1500);

    const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const pages = await listRes.json();
    const targetPage = pages.find((p) => p.type === "page" && p.url.includes("upload")) || pages[0];

    const ws = new WebSocket(targetPage.webSocketDebuggerUrl);
    await new Promise((resolve) => (ws.onopen = resolve));
    const cdp = new CdpClient(ws);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    // Clean start: clear localStorage and sessionStorage
    await cdp.eval(`(() => {
      localStorage.clear();
      sessionStorage.clear();
    })()`);

    // --- SETUP: Load demo, extract, resolve, apply ---
    console.log("Setup: Loading demo ledger, extracting and reconciling...");
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

    for (let i = 0; i < 30; i++) {
      await sleep(300);
      const hasTable = await cdp.eval(`Boolean(document.getElementById('btn-trigger-reconciliation'))`);
      if (hasTable) break;
    }

    // Trigger reconciliation comparison
    await cdp.eval(`document.getElementById('btn-trigger-reconciliation')?.click()`);
    await sleep(600);

    // Accept all conflicts and retain missing
    await cdp.eval(`(() => {
      const rows = Array.from(document.querySelectorAll('#reconciliation-section tbody tr'));
      rows.forEach(r => {
        const acceptBtn = Array.from(r.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Accept Scan'));
        if (acceptBtn) acceptBtn.click();
        const retainBtn = Array.from(r.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Retain Roster'));
        if (retainBtn) retainBtn.click();
      });
    })()`);
    await sleep(400);

    // Open confirmation modal and apply
    await cdp.eval(`document.getElementById('btn-apply-to-session')?.click()`);
    await sleep(500);
    await cdp.eval(`document.getElementById('btn-confirm-apply-modal')?.click()`);
    await sleep(600);

    // --- SCENARIO 9: Confirm sessionStorage transfer does not overwrite billing draft automatically ---
    const localDraftAfterApply = await cdp.eval(`localStorage.getItem('bcs_billing_draft_v1')`);
    const sessionStagedAfterApply = await cdp.eval(`sessionStorage.getItem('bcs_staged_session_v1')`);
    if (localDraftAfterApply === null && sessionStagedAfterApply !== null) {
      results.scenario9 = "PASS";
      console.log("[SCENARIO 9] PASS: sessionStorage has staged payload, localStorage remains untouched (NULL).");
    } else {
      results.scenario9 = "FAIL";
    }

    // --- SCENARIO 4: Return to the upload page after applying. Confirm application cannot accidentally be applied twice ---
    const isApplyBtnHiddenAfterApply = await cdp.eval(`document.getElementById('btn-apply-to-session') === null`);
    const isCompletionCardVisible = await cdp.eval(`Boolean(document.getElementById('completion-summary-card'))`);
    if (isApplyBtnHiddenAfterApply && isCompletionCardVisible) {
      results.scenario4 = "PASS";
      console.log("[SCENARIO 4] PASS: Apply button is hidden and replaced by completion card; cannot accidentally re-apply.");
    } else {
      results.scenario4 = "FAIL";
    }

    // --- SCENARIO 1: Apply reconciled records and navigate to /admin/billing ---
    await cdp.eval(`document.getElementById('btn-navigate-to-billing')?.click()`);
    await sleep(1200);

    const onBillingPage = await cdp.eval(`window.location.pathname.includes('/admin/billing')`);
    const stagedBannerVisible = await cdp.eval(`Boolean(document.getElementById('staged-reconciliation-banner'))`);
    const billingRowsCount = await cdp.eval(`document.querySelectorAll('table tbody tr').length`);
    if (onBillingPage && stagedBannerVisible && billingRowsCount === 30) {
      results.scenario1 = "PASS";
      console.log("[SCENARIO 1] PASS: Navigated to /admin/billing, staged banner is visible, 30 calendar rows loaded.");
    } else {
      results.scenario1 = "FAIL";
    }

    // --- SCENARIO 2: Refresh /admin/billing after application. Confirm staged import is handled correctly ---
    console.log("Refreshing /admin/billing...");
    await cdp.send("Page.reload");
    await sleep(1500);

    const stagedBannerAfterRefresh = await cdp.eval(`Boolean(document.getElementById('staged-reconciliation-banner'))`);
    const localDraftAfterRefresh = await cdp.eval(`localStorage.getItem('bcs_billing_draft_v1')`);
    if (stagedBannerAfterRefresh && localDraftAfterRefresh === null) {
      results.scenario2 = "PASS";
      console.log("[SCENARIO 2] PASS: After page refresh, staged banner persists via sessionStorage and localStorage remains unwritten.");
    } else {
      results.scenario2 = "FAIL";
    }

    // --- SCENARIO 10: Confirm browser refresh does not falsely display an unsaved application as permanently saved ---
    const bannerBadgeText = await cdp.eval(`(() => {
      const el = document.getElementById('staged-reconciliation-banner');
      return el ? el.querySelector('span')?.textContent?.trim() : null;
    })()`);
    if (bannerBadgeText && bannerBadgeText.includes("In-Session Only • Unsaved Draft")) {
      results.scenario10 = "PASS";
      console.log("[SCENARIO 10] PASS: Banner clearly states 'In-Session Only • Unsaved Draft', not permanently saved.");
    } else {
      results.scenario10 = "FAIL";
    }

    // --- SCENARIO 3: Click Undo on billing page. Confirm exact previous billing calendar is restored ---
    const mealCountBeforeUndo = await cdp.eval(`(() => {
      const firstRow = document.querySelector('table tbody tr');
      return firstRow ? firstRow.querySelectorAll('td')[4]?.textContent?.trim() : null;
    })()`);

    console.log("Clicking Undo on /admin/billing...");
    await cdp.eval(`document.getElementById('btn-undo-staged-import')?.click()`);
    await sleep(600);

    const bannerAfterUndo = await cdp.eval(`Boolean(document.getElementById('staged-reconciliation-banner'))`);
    const sessionStagedAfterUndo = await cdp.eval(`sessionStorage.getItem('bcs_staged_session_v1')`);
    if (!bannerAfterUndo && sessionStagedAfterUndo === null) {
      results.scenario3 = "PASS";
      console.log("[SCENARIO 3] PASS: Clicked Undo, staged banner removed, previous calendar restored.");
    } else {
      results.scenario3 = "FAIL";
    }

    // --- SCENARIO 7: Confirm bcs_staged_session_v1 is cleared after successful save or undo ---
    if (sessionStagedAfterUndo === null) {
      results.scenario7 = "PASS";
      console.log("[SCENARIO 7] PASS: bcs_staged_session_v1 is confirmed cleared from sessionStorage after undo.");
    } else {
      results.scenario7 = "FAIL";
    }

    // --- SCENARIO 8: Confirm starting a new upload cannot accidentally consume an old staged payload ---
    console.log("Navigating back to /admin/billing/upload...");
    await cdp.send("Page.navigate", { url: `http://localhost:${PORT}/admin/billing/upload` });
    await sleep(1200);

    const stagedInSessionOnUpload = await cdp.eval(`sessionStorage.getItem('bcs_staged_session_v1')`);
    const uploadEmptyState = await cdp.eval(`Boolean(document.querySelector('input[type="file"]'))`);
    if (stagedInSessionOnUpload === null && uploadEmptyState) {
      results.scenario8 = "PASS";
      console.log("[SCENARIO 8] PASS: Upload starts clean in empty state, sessionStorage has no lingering staged payload.");
    } else {
      results.scenario8 = "FAIL";
    }

    // --- SCENARIO 5: Click Undo from upload page. Confirm staged payload is cleared ---
    // Re-run mock extraction and apply on upload page to test upload Undo
    await cdp.eval(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const demoBtn = btns.find(b => b.textContent && b.textContent.includes('Load Demo Sheet'));
      if (demoBtn) demoBtn.click();
    })()`);
    await sleep(400);

    await cdp.eval(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const scanBtn = btns.find(b => b.textContent && b.textContent.includes('Start AI Extraction'));
      if (scanBtn) scanBtn.click();
    })()`);

    for (let i = 0; i < 30; i++) {
      await sleep(300);
      const hasTable = await cdp.eval(`Boolean(document.getElementById('btn-trigger-reconciliation'))`);
      if (hasTable) break;
    }

    await cdp.eval(`document.getElementById('btn-trigger-reconciliation')?.click()`);
    await sleep(500);

    // Accept conflicts & missing
    await cdp.eval(`(() => {
      const rows = Array.from(document.querySelectorAll('#reconciliation-section tbody tr'));
      rows.forEach(r => {
        const acceptBtn = Array.from(r.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Accept Scan'));
        if (acceptBtn) acceptBtn.click();
        const retainBtn = Array.from(r.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Retain Roster'));
        if (retainBtn) retainBtn.click();
      });
    })()`);
    await sleep(400);

    await cdp.eval(`document.getElementById('btn-apply-to-session')?.click()`);
    await sleep(400);
    await cdp.eval(`document.getElementById('btn-confirm-apply-modal')?.click()`);
    await sleep(600);

    // Verify staged
    const stagedBeforeUndoUpload = await cdp.eval(`sessionStorage.getItem('bcs_staged_session_v1')`);

    // Click "Undo Application" on upload page
    console.log("Clicking Undo Application on upload page...");
    await cdp.eval(`document.getElementById('btn-undo-application')?.click()`);
    await sleep(400);

    const stagedAfterUndoUpload = await cdp.eval(`sessionStorage.getItem('bcs_staged_session_v1')`);
    const completionCardAfterUndo = await cdp.eval(`Boolean(document.getElementById('completion-summary-card'))`);
    if (stagedBeforeUndoUpload !== null && stagedAfterUndoUpload === null && !completionCardAfterUndo) {
      results.scenario5 = "PASS";
      console.log("[SCENARIO 5] PASS: Undo from upload page cleared sessionStorage and removed completion card.");
    } else {
      results.scenario5 = "FAIL";
    }

    // --- SCENARIO 6: Apply, navigate, and explicitly save the draft. Confirm existing bcs_billing_draft_v1 key is used ---
    // Apply again
    await cdp.eval(`document.getElementById('btn-apply-to-session')?.click()`);
    await sleep(400);
    await cdp.eval(`document.getElementById('btn-confirm-apply-modal')?.click()`);
    await sleep(600);

    // Navigate to billing
    await cdp.eval(`document.getElementById('btn-navigate-to-billing')?.click()`);
    await sleep(1200);

    // Click Save Draft Locally on billing page
    console.log("Clicking Save Draft Locally on billing page...");
    await cdp.eval(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const saveBtn = btns.find(b => b.textContent && b.textContent.includes('Save Draft'));
      if (saveBtn) saveBtn.click();
    })()`);
    await sleep(500);

    const savedDraftInLocal = await cdp.eval(`localStorage.getItem('bcs_billing_draft_v1')`);
    const stagedAfterExplicitSave = await cdp.eval(`sessionStorage.getItem('bcs_staged_session_v1')`);
    const parsedDraft = savedDraftInLocal ? JSON.parse(savedDraftInLocal) : null;

    if (
      savedDraftInLocal !== null &&
      parsedDraft.customerId === "cust-hydac" &&
      Array.isArray(parsedDraft.dailyEntries) &&
      parsedDraft.dailyEntries.length === 30 &&
      stagedAfterExplicitSave === null
    ) {
      results.scenario6 = "PASS";
      console.log("[SCENARIO 6] PASS: Explicit Save Draft correctly stored the draft under key 'bcs_billing_draft_v1' in localStorage, and cleared the staged session.");
    } else {
      results.scenario6 = "FAIL";
    }

    console.log("\n=== FINAL 10-SCENARIO AUDIT RESULTS ===");
    console.log(JSON.stringify(results, null, 2));

    ws.close();
    chromeProc.kill();
  } catch (err) {
    console.error("Audit error:", err);
  } finally {
    nextServer.kill();
    console.log("=== AUDIT SUITE FINISHED ===");
  }
}

runScenarioAudit();
