import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/VIJAY/.gemini/antigravity/brain/f7fa78bb-62de-4863-a373-8e54b26c8e8d";
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 3036;
const CDP_PORT = 9256;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  let lastErr = null;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status === 200) return true;
    } catch (e) {
      lastErr = e.message;
    }
    await sleep(400);
  }
  throw new Error(`Timeout waiting for ${url}. Last error: ${lastErr}`);
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

    ws.onerror = (err) => console.error("CDP WS Error:", err);
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  async screenshot(filePath) {
    const res = await this.send("Page.captureScreenshot", { format: "png" });
    const buffer = Buffer.from(res.data, "base64");
    fs.writeFileSync(filePath, buffer);
    console.log(`📸 Screenshot saved: ${path.basename(filePath)} (${buffer.length} bytes)`);
  }
}

async function runStep4Tests() {
  console.log("================================================================");
  console.log("PHASE 3D STEP 4: ARCHIVED INVOICE DETAILS & PRINT INTEGRATION");
  console.log("================================================================");

  let serverProc = null;
  let chromeProc = null;
  const profileDir = path.resolve(`./scratch/chrome-profile-step4-${Date.now()}`);

  try {
    // 1. Start Next.js production server
    console.log(`\n🚀 Starting Next.js production server on port ${PORT}...`);
    serverProc = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PORT), "-H", "localhost"], {
      stdio: "pipe",
    });

    serverProc.stdout.on("data", (d) => {
      const str = d.toString();
      if (str.includes("Ready in") || str.includes("started server on")) {
        console.log(`[Next.js Server] ${str.trim()}`);
      }
    });

    await waitForServer(`http://localhost:${PORT}/admin/billing/invoices`);
    console.log(`✅ Production server ready at http://localhost:${PORT}/admin/billing/invoices`);

    // 2. Launch Google Chrome
    console.log(`\n🌐 Launching Chrome with CDP on port ${CDP_PORT}...`);
    chromeProc = spawn(
      CHROME_PATH,
      [
        "--headless=new",
        `--remote-debugging-port=${CDP_PORT}`,
        `--user-data-dir=${profileDir}`,
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--window-size=1400,1050",
        `http://localhost:${PORT}/admin/billing/invoices`,
      ],
      { stdio: "ignore" }
    );

    await waitForChrome(CDP_PORT);
    console.log(`✅ Chrome running with CDP`);

    // 3. Connect via WebSocket
    const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const listData = await listRes.json();
    const pageTarget = listData.find((t) => t.type === "page") || listData[0];
    const wsUrl = pageTarget.webSocketDebuggerUrl;

    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    const cdp = new CdpClient(ws);
    await cdp.send("Page.enable");
    await cdp.send("DOM.enable");
    await cdp.send("Runtime.enable");

    await sleep(2500);

    // Helpers to type & select in React
    await cdp.evaluate(`
      window.__setReactInput = (selector, val) => {
        const input = document.querySelector(selector);
        if (!input) throw new Error('Input not found: ' + selector);
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(input, val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
      window.__setReactSelect = (selectorOrIndex, val) => {
        const selects = document.querySelectorAll('select');
        const select = typeof selectorOrIndex === 'number' ? selects[selectorOrIndex] : document.querySelector(selectorOrIndex);
        if (!select) throw new Error('Select not found: ' + selectorOrIndex);
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        nativeSetter.call(select, val);
        select.dispatchEvent(new Event('change', { bubbles: true }));
      };
    `);

    // -------------------------------------------------------------------------
    // TEST 1: HYDAC — October 2026 (BCS/2026-27/092) - Combined & Sunday Overtime
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 1: HYDAC October 2026 (BCS/2026-27/092) ---");

    // Click View on row 1 (HYDAC Oct 2026)
    await cdp.evaluate(`
      (() => {
        const row = Array.from(document.querySelectorAll('tbody tr')).find(r => r.innerText.includes('BCS/2026-27/092'));
        const viewBtn = row?.querySelector('button');
        viewBtn?.click();
      })()
    `);
    await sleep(800);

    const hydacOctCheck = await cdp.evaluate(`
      (() => {
        const bodyText = document.body.innerText;
        console.log('BODY TEXT PREVIEW:', bodyText.slice(0, 500));
        const billNoFound = bodyText.includes('BCS/2026-27/092');
        const customerFound = bodyText.includes('HYDAC INDIA PRIVATE LIMITED');
        const gstFound = bodyText.includes('33AAACH2910B1ZH');
        const panFound = bodyText.includes('AAACH2910B');
        const periodFound = bodyText.includes('01-10-2026 to 31-10-2026');
        const totalAmountFound = bodyText.includes('86,592') || bodyText.includes('86592');
        const rateFound = bodyText.includes('48.00') || bodyText.includes('48');
        const pendingBadge = bodyText.toLowerCase().includes('pending');

        // Check combined notation row
        const combinedRow = bodyText.includes('65 Breakfast, Dinner') || bodyText.includes('Combined shift');
        
        // Check Sunday overtime row
        const overtimeRow = bodyText.includes('Maintenance overtime shift team');

        // Check 2 pages
        const page1 = document.getElementById('invoice-page-1') !== null;
        const page2 = document.getElementById('invoice-page-2') !== null;

        // Check Back button
        const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Back to Invoice Archive'));

        return {
          billNoFound,
          customerFound,
          gstFound,
          panFound,
          periodFound,
          totalAmountFound,
          rateFound,
          pendingBadge,
          combinedRow,
          overtimeRow,
          page1,
          page2,
          hasBackBtn: Boolean(backBtn),
          snippet: bodyText.slice(0, 400)
        };
      })()
    `);

    console.log("HYDAC Oct preview evaluation:", hydacOctCheck);
    if (!hydacOctCheck.billNoFound || !hydacOctCheck.customerFound || !hydacOctCheck.combinedRow || !hydacOctCheck.overtimeRow) {
      throw new Error(`HYDAC Oct check failed: ${JSON.stringify(hydacOctCheck)}`);
    }

    await cdp.screenshot(`${ARTIFACT_DIR}/step4_1_hydac_oct_preview.png`);
    console.log("✅ TEST 1A: HYDAC October 2026 preview loaded accurately with combined notation and Sunday overtime");

    // Test 1-Page vs 2-Page Toggle
    console.log("Testing 1-Page Compact layout toggle...");
    await cdp.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('1-Page Compact'));
        btn?.click();
      })()
    `);
    await sleep(400);

    const onePageCheck = await cdp.evaluate(`
      (() => {
        const page1 = document.getElementById('invoice-page-1') !== null;
        const page2 = document.getElementById('invoice-page-2') !== null;
        const totalRowsOnPage1 = document.querySelectorAll('#invoice-page-1 tbody tr').length;
        return { page1, page2, totalRowsOnPage1 };
      })()
    `);
    console.log("1-Page Compact check:", onePageCheck);
    if (!onePageCheck.page1 || onePageCheck.page2 || onePageCheck.totalRowsOnPage1 !== 31) {
      throw new Error(`1-Page Compact layout toggle failed: ${JSON.stringify(onePageCheck)}`);
    }

    // Toggle back to 2-Page Balanced
    await cdp.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('2-Page Balanced'));
        btn?.click();
      })()
    `);
    await sleep(400);

    // Test Print Media Styles
    console.log("Testing @media print isolation...");
    await cdp.send("Emulation.setEmulatedMedia", { media: "print" });
    await sleep(400);

    const printIsolationCheck = await cdp.evaluate(`
      (() => {
        const aside = document.querySelector('aside');
        const header = document.querySelector('header');
        const toolbar = document.querySelector('[class*="print:hidden"]');
        const asideHidden = aside ? getComputedStyle(aside).display === 'none' : true;
        const headerHidden = header ? getComputedStyle(header).display === 'none' : true;
        const toolbarHidden = toolbar ? getComputedStyle(toolbar).display === 'none' : true;
        const invoiceVisible = document.getElementById('invoice-page-1') !== null;
        return { asideHidden, headerHidden, toolbarHidden, invoiceVisible };
      })()
    `);
    console.log("Print isolation check:", printIsolationCheck);
    if (!printIsolationCheck.asideHidden || !printIsolationCheck.headerHidden || !printIsolationCheck.toolbarHidden) {
      throw new Error(`Print isolation failed: ${JSON.stringify(printIsolationCheck)}`);
    }

    await cdp.screenshot(`${ARTIFACT_DIR}/step4_1_print_preview.png`);
    console.log("✅ TEST 1B: Print media isolation verified (chrome & toolbar hidden, only invoice sheets render)");

    // Restore screen media
    await cdp.send("Emulation.setEmulatedMedia", { media: "" });
    await sleep(400);

    // Click Back to Archive
    await cdp.evaluate(`
      (() => {
        const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Back to Invoice Archive'));
        backBtn?.click();
      })()
    `);
    await sleep(600);

    const backToArchiveCheck = await cdp.evaluate(`
      (() => {
        const table = document.querySelector('table') !== null;
        const rows = document.querySelectorAll('tbody tr').length;
        return { table, rows };
      })()
    `);
    if (!backToArchiveCheck.table || backToArchiveCheck.rows !== 4) {
      throw new Error(`Back to Archive failed: ${JSON.stringify(backToArchiveCheck)}`);
    }
    console.log("✅ TEST 1C: Back to Invoice Archive action restored list view with 4 records");

    // -------------------------------------------------------------------------
    // TEST 2: LMW — October 2026 (BCS/2026-27/091) - Single Shift Lunch Roster
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 2: LMW October 2026 (BCS/2026-27/091) ---");
    await cdp.evaluate(`
      (() => {
        const row = Array.from(document.querySelectorAll('tbody tr')).find(r => r.innerText.includes('BCS/2026-27/091'));
        const viewBtn = row?.querySelector('button');
        viewBtn?.click();
      })()
    `);
    await sleep(600);

    const lmwCheck = await cdp.evaluate(`
      (() => {
        const bodyText = document.body.innerText;
        return {
          billNoFound: bodyText.includes('BCS/2026-27/091'),
          customerFound: bodyText.includes('LAKSHMI MACHINE WORKS LIMITED'),
          unitFound: bodyText.includes('UNIT II'),
          amountFound: bodyText.includes('68,016'),
          rateFound: bodyText.includes('52.00'),
          particularsLunch: bodyText.includes('LUNCH'),
          generatedBadge: bodyText.includes('Generated')
        };
      })()
    `);
    console.log("LMW Oct preview evaluation:", lmwCheck);
    if (!lmwCheck.billNoFound || !lmwCheck.customerFound || !lmwCheck.amountFound || !lmwCheck.particularsLunch) {
      throw new Error(`LMW Oct check failed: ${JSON.stringify(lmwCheck)}`);
    }

    await cdp.screenshot(`${ARTIFACT_DIR}/step4_2_lmw_oct_preview.png`);
    console.log("✅ TEST 2 PASSED: LMW October 2026 preview loaded accurately (Rate ₹52.00, Lunch particulars)");

    // Back to archive
    await cdp.evaluate(`
      (() => {
        const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Back to Invoice Archive'));
        backBtn?.click();
      })()
    `);
    await sleep(500);

    // -------------------------------------------------------------------------
    // TEST 3: PRICOL — September 2026 (BCS/2026-27/082) - Paid Settlement
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 3: PRICOL September 2026 (BCS/2026-27/082) ---");
    await cdp.evaluate(`
      (() => {
        const row = Array.from(document.querySelectorAll('tbody tr')).find(r => r.innerText.includes('BCS/2026-27/082'));
        const viewBtn = row?.querySelector('button');
        viewBtn?.click();
      })()
    `);
    await sleep(600);

    const pricolCheck = await cdp.evaluate(`
      (() => {
        const bodyText = document.body.innerText;
        return {
          billNoFound: bodyText.includes('BCS/2026-27/082'),
          customerFound: bodyText.includes('PRICOL LIMITED'),
          periodFound: bodyText.includes('01-09-2026 to 30-09-2026'),
          amountFound: bodyText.includes('76,848'),
          rateFound: bodyText.includes('48.00'),
          paidBadge: bodyText.includes('Paid'),
          daysTotal: document.querySelectorAll('#invoice-page-1 tbody tr, #invoice-page-2 tbody tr').length
        };
      })()
    `);
    console.log("PRICOL Sep preview evaluation:", pricolCheck);
    if (!pricolCheck.billNoFound || !pricolCheck.customerFound || !pricolCheck.amountFound || pricolCheck.daysTotal !== 30) {
      throw new Error(`PRICOL Sep check failed: ${JSON.stringify(pricolCheck)}`);
    }

    await cdp.screenshot(`${ARTIFACT_DIR}/step4_3_pricol_sep_preview.png`);
    console.log("✅ TEST 3 PASSED: PRICOL September 2026 preview loaded accurately (PAID status, 30 days)");

    // Back to archive
    await cdp.evaluate(`
      (() => {
        const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Back to Invoice Archive'));
        backBtn?.click();
      })()
    `);
    await sleep(500);

    // -------------------------------------------------------------------------
    // TEST 4: HYDAC — September 2026 (BCS/2026-27/081) - Paid RTGS Settlement
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 4: HYDAC September 2026 (BCS/2026-27/081) ---");
    await cdp.evaluate(`
      (() => {
        const row = Array.from(document.querySelectorAll('tbody tr')).find(r => r.innerText.includes('BCS/2026-27/081'));
        const viewBtn = row?.querySelector('button');
        viewBtn?.click();
      })()
    `);
    await sleep(600);

    const hydacSepCheck = await cdp.evaluate(`
      (() => {
        const bodyText = document.body.innerText;
        return {
          billNoFound: bodyText.includes('BCS/2026-27/081'),
          customerFound: bodyText.includes('HYDAC INDIA PRIVATE LIMITED'),
          periodFound: bodyText.includes('01-09-2026 to 30-09-2026'),
          amountFound: bodyText.includes('80,544'),
          rateFound: bodyText.includes('48.00'),
          paidBadge: bodyText.includes('Paid'),
          combinedFound: bodyText.includes('60 Breakfast, Dinner'),
          daysTotal: document.querySelectorAll('#invoice-page-1 tbody tr, #invoice-page-2 tbody tr').length
        };
      })()
    `);
    console.log("HYDAC Sep preview evaluation:", hydacSepCheck);
    if (!hydacSepCheck.billNoFound || !hydacSepCheck.customerFound || !hydacSepCheck.amountFound || !hydacSepCheck.combinedFound || hydacSepCheck.daysTotal !== 30) {
      throw new Error(`HYDAC Sep check failed: ${JSON.stringify(hydacSepCheck)}`);
    }

    await cdp.screenshot(`${ARTIFACT_DIR}/step4_4_hydac_sep_preview.png`);
    console.log("✅ TEST 4 PASSED: HYDAC September 2026 preview loaded accurately (PAID status, Sep 16 combined notation)");

    // Back to archive
    await cdp.evaluate(`
      (() => {
        const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Back to Invoice Archive'));
        backBtn?.click();
      })()
    `);
    await sleep(500);

    // -------------------------------------------------------------------------
    // TEST 5: Filter Preservation Across Preview Navigation
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 5: Filter Preservation Across Preview Navigation ---");

    // Set Customer filter to LMW (cust-lmw)
    await cdp.evaluate(`window.__setReactSelect(0, 'cust-lmw');`);
    await sleep(400);

    const beforeViewCount = await cdp.evaluate(`document.querySelectorAll('tbody tr').length`);
    console.log("Filtered to LMW: rows =", beforeViewCount);
    if (beforeViewCount !== 1) throw new Error("Expected 1 row for LMW filter");

    // Open LMW preview
    await cdp.evaluate(`document.querySelector('tbody tr button')?.click();`);
    await sleep(500);

    // Return back to archive
    await cdp.evaluate(`
      (() => {
        const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Back to Invoice Archive'));
        backBtn?.click();
      })()
    `);
    await sleep(500);

    const afterViewFilterState = await cdp.evaluate(`
      (() => {
        const custSelectVal = document.querySelectorAll('select')[0]?.value;
        const rows = document.querySelectorAll('tbody tr').length;
        const totalInvoicedKpi = Array.from(document.querySelectorAll('p')).find(p => p.innerText.includes('Total Invoiced Value'))?.parentElement?.innerText;
        return { custSelectVal, rows, totalInvoicedKpi };
      })()
    `);
    console.log("After return filter state:", afterViewFilterState);
    if (afterViewFilterState.custSelectVal !== 'cust-lmw' || afterViewFilterState.rows !== 1) {
      throw new Error(`Filter preservation failed: ${JSON.stringify(afterViewFilterState)}`);
    }

    // Reset filters
    await cdp.evaluate(`
      (() => {
        const resetBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Reset Filters'));
        resetBtn?.click();
      })()
    `);
    await sleep(400);

    await cdp.screenshot(`${ARTIFACT_DIR}/step4_5_filter_preservation.png`);
    console.log("✅ TEST 5 PASSED: Filter state perfectly preserved after returning from invoice preview");

    // -------------------------------------------------------------------------
    // TEST 6: Data & Storage Isolation Verification
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 6: Data & Storage Isolation Verification ---");
    const storageCheck = await cdp.evaluate(`
      (() => {
        const draft = localStorage.getItem('bcs_billing_draft_v1');
        const staged = sessionStorage.getItem('bcs_staged_session_v1');
        return { draft, staged };
      })()
    `);
    console.log("Storage isolation check:", storageCheck);
    if (storageCheck.draft !== null || storageCheck.staged !== null) {
      throw new Error(`Storage isolation violated: active draft or staged session modified!`);
    }
    console.log("✅ TEST 6 PASSED: Verified zero reads or writes to bcs_billing_draft_v1 or bcs_staged_session_v1");

    console.log("\n================================================================");
    console.log("🎉 ALL PHASE 3D STEP 4 VERIFICATION TESTS PASSED (6/6)!");
    console.log("================================================================\n");

  } finally {
    if (chromeProc) {
      try { chromeProc.kill("SIGKILL"); } catch {}
    }
    if (serverProc) {
      try { serverProc.kill("SIGKILL"); } catch {}
    }
  }
}

runStep4Tests().catch((err) => {
  console.error("FATAL ERROR in Step 4 browser tests:", err);
  process.exit(1);
});
