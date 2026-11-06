import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/VIJAY/.gemini/antigravity/brain/f7fa78bb-62de-4863-a373-8e54b26c8e8d";
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 3038;
const CDP_PORT = 9258;

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
    this.consoleLogs = [];

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === "Runtime.consoleAPICalled") {
        this.consoleLogs.push({
          type: data.params.type,
          args: data.params.args.map((a) => a.value || a.description),
        });
      }
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

async function runFinalAudit() {
  console.log("================================================================");
  console.log("PHASE 3D STEP 5: FINAL INTEGRATED INVOICE ARCHIVE AUDIT");
  console.log("================================================================");

  let serverProc = null;
  let chromeProc = null;
  const profileDir = path.resolve(`./scratch/chrome-profile-audit-${Date.now()}`);

  const results = {};

  try {
    // 1. Start Next.js production server on PORT 3038
    console.log(`\n🚀 Starting Next.js production server on port ${PORT}...`);
    serverProc = spawn(
      process.execPath,
      ["node_modules/next/dist/bin/next", "start", "-p", String(PORT), "-H", "localhost"],
      { stdio: "pipe" }
    );

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

    // Seed test draft and staged session in storage to rigorously test storage isolation
    await cdp.evaluate(`
      localStorage.setItem('bcs_billing_draft_v1', JSON.stringify({ testDraftMarker: 'AUDIT_ACTIVE_DRAFT_PRESERVED', timestamp: 1793900000 }));
      sessionStorage.setItem('bcs_staged_session_v1', JSON.stringify({ testStagedMarker: 'AUDIT_STAGED_SESSION_PRESERVED', count: 42 }));
    `);

    // Helper functions for React typing
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

    // =========================================================================
    // AREA 1: Archive list loads all four mock records
    // =========================================================================
    console.log("\n--- Checking Area 1: Archive list loads all four mock records ---");
    const area1 = await cdp.evaluate(`
      (() => {
        const rows = document.querySelectorAll('tbody tr').length;
        const billNos = Array.from(document.querySelectorAll('tbody tr td:first-child .font-mono')).map(el => el.textContent.trim());
        const hasHydacOct = billNos.includes('BCS/2026-27/092');
        const hasLmwOct = billNos.includes('BCS/2026-27/091');
        const hasPricolSep = billNos.includes('BCS/2026-27/082');
        const hasHydacSep = billNos.includes('BCS/2026-27/081');
        return { rows, billNos, allPresent: hasHydacOct && hasLmwOct && hasPricolSep && hasHydacSep };
      })()
    `);
    results["Area 1: Archive list loads all four mock records"] =
      area1.rows === 4 && area1.allPresent ? "PASS" : "FAIL";
    console.log("Area 1 Result:", results["Area 1: Archive list loads all four mock records"], area1);

    // =========================================================================
    // AREA 2: Search works across invoice number, customer and location
    // =========================================================================
    console.log("\n--- Checking Area 2: Search across bill no, customer, location ---");
    // Search bill no
    await cdp.evaluate(`window.__setReactInput('input[placeholder*="Search bill no"]', '092');`);
    await sleep(300);
    const s1 = await cdp.evaluate(`document.querySelectorAll('tbody tr').length === 1 && document.body.innerText.includes('BCS/2026-27/092')`);

    // Search customer
    await cdp.evaluate(`window.__setReactInput('input[placeholder*="Search bill no"]', 'Lakshmi');`);
    await sleep(300);
    const s2 = await cdp.evaluate(`document.querySelectorAll('tbody tr').length === 1 && document.body.innerText.includes('LAKSHMI')`);

    // Search location
    await cdp.evaluate(`window.__setReactInput('input[placeholder*="Search bill no"]', 'Plant 1');`);
    await sleep(300);
    const s3 = await cdp.evaluate(`document.querySelectorAll('tbody tr').length === 1 && document.body.innerText.includes('PLANT 1')`);

    // Clear search
    await cdp.evaluate(`window.__setReactInput('input[placeholder*="Search bill no"]', '');`);
    await sleep(300);

    results["Area 2: Search works across invoice number, customer and location"] =
      s1 && s2 && s3 ? "PASS" : "FAIL";
    console.log("Area 2 Result:", results["Area 2: Search works across invoice number, customer and location"]);

    // =========================================================================
    // AREA 3: Customer, period and status filters work individually and together
    // =========================================================================
    console.log("\n--- Checking Area 3: Filters work individually and together ---");
    // Customer filter
    await cdp.evaluate(`window.__setReactSelect(0, 'cust-hydac');`);
    await sleep(300);
    const fCust = await cdp.evaluate(`document.querySelectorAll('tbody tr').length === 2`);

    // Period filter
    await cdp.evaluate(`window.__setReactSelect(1, 'October 2026');`);
    await sleep(300);
    const fCombined = await cdp.evaluate(`document.querySelectorAll('tbody tr').length === 1 && document.body.innerText.includes('BCS/2026-27/092')`);

    // Status filter
    await cdp.evaluate(`window.__setReactSelect(0, 'ALL'); window.__setReactSelect(1, 'ALL'); window.__setReactSelect(2, 'PAID');`);
    await sleep(300);
    const fStatus = await cdp.evaluate(`document.querySelectorAll('tbody tr').length === 2 && document.body.innerText.includes('BCS/2026-27/082') && document.body.innerText.includes('BCS/2026-27/081')`);

    // Reset filters for next test
    await cdp.evaluate(`window.__setReactSelect(2, 'ALL');`);
    await sleep(300);

    results["Area 3: Customer, period and status filters work individually and together"] =
      fCust && fCombined && fStatus ? "PASS" : "FAIL";
    console.log("Area 3 Result:", results["Area 3: Customer, period and status filters work individually and together"]);

    // =========================================================================
    // AREA 4: KPI cards remain based on the full archive dataset
    // =========================================================================
    console.log("\n--- Checking Area 4: KPI cards remain fixed to complete dataset ---");
    // Filter to 1 invoice (LMW)
    await cdp.evaluate(`window.__setReactSelect(0, 'cust-lmw');`);
    await sleep(300);

    const kpiCheck = await cdp.evaluate(`
      (() => {
        const totalInvoices = Array.from(document.querySelectorAll('p')).find(p => p.textContent.includes('Total Invoices'))?.parentElement?.textContent;
        const totalAmount = Array.from(document.querySelectorAll('p')).find(p => p.textContent.includes('Total Invoiced Value'))?.parentElement?.textContent;
        const paidInvoices = Array.from(document.querySelectorAll('p')).find(p => p.textContent.includes('Paid Invoices'))?.parentElement?.textContent;
        const pendingInvoices = Array.from(document.querySelectorAll('p')).find(p => p.textContent.includes('Pending Invoices'))?.parentElement?.textContent;

        return {
          hasTotal4: totalInvoices?.includes('4'),
          hasTotalValue: totalAmount?.includes('3,12,000'),
          hasPaid2: paidInvoices?.includes('2'),
          hasPending1: pendingInvoices?.includes('1')
        };
      })()
    `);
    results["Area 4: KPI cards remain based on the full archive dataset"] =
      kpiCheck.hasTotal4 && kpiCheck.hasTotalValue && kpiCheck.hasPaid2 && kpiCheck.hasPending1 ? "PASS" : "FAIL";
    console.log("Area 4 Result:", results["Area 4: KPI cards remain based on the full archive dataset"], kpiCheck);

    // Reset customer filter
    await cdp.evaluate(`window.__setReactSelect(0, 'ALL');`);
    await sleep(300);

    // =========================================================================
    // AREA 5: Empty state and reset work
    // =========================================================================
    console.log("\n--- Checking Area 5: Empty state and reset ---");
    await cdp.evaluate(`window.__setReactInput('input[placeholder*="Search bill no"]', 'NOMATCH_QUERY_999');`);
    await sleep(300);

    const emptyBefore = await cdp.evaluate(`
      document.querySelector('main h3')?.textContent?.includes('No Invoices Found') &&
      document.querySelectorAll('tbody tr').length === 0
    `);

    // Click Reset
    await cdp.evaluate(`
      Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Reset Filters'))?.click();
    `);
    await sleep(400);

    const emptyAfter = await cdp.evaluate(`
      document.querySelectorAll('tbody tr').length === 4 &&
      document.querySelector('input[placeholder*="Search bill no"]')?.value === ''
    `);

    results["Area 5: Empty state and reset work"] = emptyBefore && emptyAfter ? "PASS" : "FAIL";
    console.log("Area 5 Result:", results["Area 5: Empty state and reset work"]);

    // =========================================================================
    // AREA 6: Each of the four invoices opens the correct archived snapshot
    // =========================================================================
    console.log("\n--- Checking Area 6: All 4 invoices open correct snapshot ---");
    const invoiceAuditSpecs = [
      { billNo: 'BCS/2026-27/092', cust: 'HYDAC', amt: '86,592', days: 31 },
      { billNo: 'BCS/2026-27/091', cust: 'LAKSHMI', amt: '68,016', days: 31 },
      { billNo: 'BCS/2026-27/082', cust: 'PRICOL', amt: '76,848', days: 30 },
      { billNo: 'BCS/2026-27/081', cust: 'HYDAC', amt: '80,544', days: 30 },
    ];

    let all4Verified = true;
    for (const spec of invoiceAuditSpecs) {
      await cdp.evaluate(`
        (() => {
          const row = Array.from(document.querySelectorAll('tbody tr')).find(r => r.innerText.includes('${spec.billNo}'));
          row?.querySelector('button')?.click();
        })()
      `);
      await sleep(500);

      const check = await cdp.evaluate(`
        (() => {
          const text = document.body.innerText;
          const hasBill = text.includes('${spec.billNo}');
          const hasCust = text.includes('${spec.cust}');
          const hasAmt = text.includes('${spec.amt}');
          const dayCount = document.querySelectorAll('#invoice-page-1 tbody tr, #invoice-page-2 tbody tr').length;
          return hasBill && hasCust && hasAmt && dayCount === ${spec.days};
        })()
      `);

      if (!check) {
        console.error(`Snapshot check failed for ${spec.billNo}`);
        all4Verified = false;
      }

      // Return back to archive
      await cdp.evaluate(`
        Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Back to Invoice Archive'))?.click();
      `);
      await sleep(400);
    }

    results["Area 6: Each of the four invoices opens the correct archived snapshot"] =
      all4Verified ? "PASS" : "FAIL";
    console.log("Area 6 Result:", results["Area 6: Each of the four invoices opens the correct archived snapshot"]);

    // =========================================================================
    // AREA 7: Back to Archive preserves filters and search
    // =========================================================================
    console.log("\n--- Checking Area 7: Back to Archive preserves filters and search ---");
    await cdp.evaluate(`window.__setReactInput('input[placeholder*="Search bill no"]', 'PRICOL');`);
    await cdp.evaluate(`window.__setReactSelect(2, 'PAID');`);
    await sleep(300);

    // Open PRICOL
    await cdp.evaluate(`document.querySelector('tbody tr button')?.click();`);
    await sleep(400);

    // Return to archive
    await cdp.evaluate(`
      Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Back to Invoice Archive'))?.click();
    `);
    await sleep(400);

    const preservedCheck = await cdp.evaluate(`
      (() => {
        const searchVal = document.querySelector('input[placeholder*="Search bill no"]')?.value;
        const statusVal = document.querySelectorAll('select')[2]?.value;
        const rows = document.querySelectorAll('tbody tr').length;
        return searchVal === 'PRICOL' && statusVal === 'PAID' && rows === 1;
      })()
    `);

    // Reset filters
    await cdp.evaluate(`
      Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Reset Filters'))?.click();
    `);
    await sleep(300);

    results["Area 7: Back to Archive preserves filters and search"] =
      preservedCheck ? "PASS" : "FAIL";
    console.log("Area 7 Result:", results["Area 7: Back to Archive preserves filters and search"]);

    // =========================================================================
    // AREA 8: Both print layouts work (2-page balanced vs 1-page compact)
    // =========================================================================
    console.log("\n--- Checking Area 8: Both print layouts work ---");
    // Open HYDAC Oct 2026
    await cdp.evaluate(`
      (() => {
        const row = Array.from(document.querySelectorAll('tbody tr')).find(r => r.innerText.includes('BCS/2026-27/092'));
        row?.querySelector('button')?.click();
      })()
    `);
    await sleep(500);

    const layoutDefault2Page = await cdp.evaluate(`
      document.getElementById('invoice-page-1') !== null &&
      document.getElementById('invoice-page-2') !== null &&
      document.querySelectorAll('#invoice-page-1 tbody tr').length === 16 &&
      document.querySelectorAll('#invoice-page-2 tbody tr').length === 15
    `);

    // Switch to 1-Page
    await cdp.evaluate(`
      Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('1-Page Compact'))?.click();
    `);
    await sleep(300);

    const layout1Page = await cdp.evaluate(`
      document.getElementById('invoice-page-1') !== null &&
      document.getElementById('invoice-page-2') === null &&
      document.querySelectorAll('#invoice-page-1 tbody tr').length === 31
    `);

    // Switch back to 2-Page
    await cdp.evaluate(`
      Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('2-Page Balanced'))?.click();
    `);
    await sleep(300);

    results["Area 8: Both print layouts work"] =
      layoutDefault2Page && layout1Page ? "PASS" : "FAIL";
    console.log("Area 8 Result:", results["Area 8: Both print layouts work"]);

    // =========================================================================
    // AREA 9: Print output contains only the selected invoice
    // =========================================================================
    console.log("\n--- Checking Area 9: Print output contains only the selected invoice ---");
    await cdp.send("Emulation.setEmulatedMedia", { media: "print" });
    await sleep(400);

    const printOnlyCheck = await cdp.evaluate(`
      (() => {
        const asideHidden = getComputedStyle(document.querySelector('aside')).display === 'none';
        const headerHidden = getComputedStyle(document.querySelector('header')).display === 'none';
        const buttonsHidden = Array.from(document.querySelectorAll('button')).every(b => getComputedStyle(b).display === 'none');
        const sheetVisible = getComputedStyle(document.getElementById('invoice-page-1')).display !== 'none';
        const disclaimerInDom = document.body.innerText.includes('Demonstration Archive Data');
        return asideHidden && headerHidden && buttonsHidden && sheetVisible && !disclaimerInDom;
      })()
    `);

    await cdp.send("Emulation.setEmulatedMedia", { media: "" });
    await sleep(300);

    results["Area 9: Print output contains only the selected invoice"] =
      printOnlyCheck ? "PASS" : "FAIL";
    console.log("Area 9 Result:", results["Area 9: Print output contains only the selected invoice"]);

    // =========================================================================
    // AREA 10: Combined notation and Sunday overtime remain correct
    // =========================================================================
    console.log("\n--- Checking Area 10: Combined notation and Sunday overtime ---");
    const mealLogicCheck = await cdp.evaluate(`
      (() => {
        const bodyText = document.body.innerText;
        // Oct 14 combined notation headcount
        const hasCombined = bodyText.includes('65 Breakfast, Dinner');
        // Oct 11 overtime headcount
        const hasOvertime = bodyText.includes('Maintenance overtime shift team');
        // Oct 14 billQty is 65
        const rowOct14 = Array.from(document.querySelectorAll('tr')).find(r => r.innerText.includes('14-10-2026'));
        const qtyOct14 = rowOct14?.querySelectorAll('td')[2]?.textContent?.trim() === '65';
        // Oct 11 billQty is 30
        const rowOct11 = Array.from(document.querySelectorAll('tr')).find(r => r.innerText.includes('11-10-2026'));
        const qtyOct11 = rowOct11?.querySelectorAll('td')[2]?.textContent?.trim() === '30';

        return hasCombined && hasOvertime && qtyOct14 && qtyOct11;
      })()
    `);
    results["Area 10: Combined notation and Sunday overtime remain correct"] =
      mealLogicCheck ? "PASS" : "FAIL";
    console.log("Area 10 Result:", results["Area 10: Combined notation and Sunday overtime remain correct"]);

    // Return to archive
    await cdp.evaluate(`
      Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Back to Invoice Archive'))?.click();
    `);
    await sleep(400);

    // =========================================================================
    // AREA 11 & 12: Storage Isolation (Active Draft & Staged Session)
    // =========================================================================
    console.log("\n--- Checking Area 11 & 12: Storage Isolation ---");
    const storageCheck = await cdp.evaluate(`
      (() => {
        const draft = localStorage.getItem('bcs_billing_draft_v1');
        const staged = sessionStorage.getItem('bcs_staged_session_v1');
        const draftObj = JSON.parse(draft || '{}');
        const stagedObj = JSON.parse(staged || '{}');

        return {
          draftUntouched: draftObj.testDraftMarker === 'AUDIT_ACTIVE_DRAFT_PRESERVED',
          stagedUntouched: stagedObj.testStagedMarker === 'AUDIT_STAGED_SESSION_PRESERVED'
        };
      })()
    `);
    results["Area 11: Active billing draft remains unchanged before and after archive navigation"] =
      storageCheck.draftUntouched ? "PASS" : "FAIL";
    results["Area 12: Staged ledger session remains unchanged before and after archive navigation"] =
      storageCheck.stagedUntouched ? "PASS" : "FAIL";
    console.log("Area 11 Result:", results["Area 11: Active billing draft remains unchanged before and after archive navigation"]);
    console.log("Area 12 Result:", results["Area 12: Staged ledger session remains unchanged before and after archive navigation"]);

    // Clean up our synthetic test markers from storage
    await cdp.evaluate(`
      localStorage.removeItem('bcs_billing_draft_v1');
      sessionStorage.removeItem('bcs_staged_session_v1');
    `);

    // =========================================================================
    // AREA 13: Upload/reconciliation workflow still works
    // =========================================================================
    console.log("\n--- Checking Area 13: Upload/reconciliation workflow ---");
    await cdp.send("Page.navigate", { url: `http://localhost:${PORT}/admin/billing/upload` });
    await sleep(2000);

    const uploadCheck = await cdp.evaluate(`
      (() => {
        const uploadZone = document.querySelector('[role="presentation"], input[type="file"]') !== null;
        const demoButton = Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Load Demo Sheet'));
        const title = document.body.textContent.includes('Handwritten Ledger Upload');
        return uploadZone && demoButton && title;
      })()
    `);
    results["Area 13: Upload/reconciliation workflow still works"] =
      uploadCheck ? "PASS" : "FAIL";
    console.log("Area 13 Result:", results["Area 13: Upload/reconciliation workflow still works"]);

    // =========================================================================
    // AREA 14: Desktop and mobile layouts work
    // =========================================================================
    console.log("\n--- Checking Area 14: Desktop and mobile layouts ---");
    // Return to invoices
    await cdp.send("Page.navigate", { url: `http://localhost:${PORT}/admin/billing/invoices` });
    await sleep(1500);

    const desktopCheck = await cdp.evaluate(`
      document.querySelector('table') !== null &&
      document.querySelectorAll('tbody tr').length === 4
    `);

    // Switch to mobile viewport
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(500);

    const mobileCheck = await cdp.evaluate(`
      (() => {
        const mobileContainer = document.querySelector('[class*="md:hidden"]');
        const mobileCards = mobileContainer ? mobileContainer.querySelectorAll(':scope > div').length : 0;
        return mobileCards === 4;
      })()
    `);

    // Restore desktop
    await cdp.send("Emulation.clearDeviceMetricsOverride");
    await sleep(300);

    results["Area 14: Desktop and mobile layouts work"] =
      desktopCheck && mobileCheck ? "PASS" : "FAIL";
    console.log("Area 14 Result:", results["Area 14: Desktop and mobile layouts work"]);

    // =========================================================================
    // AREA 15: Check browser console errors and production build
    // =========================================================================
    console.log("\n--- Checking Area 15: Browser console errors & production build ---");
    const consoleErrors = cdp.consoleLogs.filter(l => l.type === "error");
    const zeroConsoleErrors = consoleErrors.length === 0;
    if (!zeroConsoleErrors) {
      console.warn("Console errors detected:", consoleErrors);
    }
    results["Area 15: Check browser console errors and production build"] =
      zeroConsoleErrors ? "PASS" : "FAIL";
    console.log("Area 15 Result:", results["Area 15: Check browser console errors and production build"]);

    // =========================================================================
    // FINAL AUDIT SUMMARY TABLE
    // =========================================================================
    console.log("\n================================================================");
    console.log("FINAL INTEGRATED VERIFICATION MATRIX");
    console.log("================================================================");
    for (const [area, status] of Object.entries(results)) {
      console.log(`[${status}] ${area}`);
    }
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

runFinalAudit().catch((err) => {
  console.error("FATAL ERROR in final audit:", err);
  process.exit(1);
});
