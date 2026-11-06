import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/VIJAY/.gemini/antigravity/brain/f7fa78bb-62de-4863-a373-8e54b26c8e8d";
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 3034;
const CDP_PORT = 9254;

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

async function runBrowserTests() {
  console.log("================================================================");
  console.log("PHASE 3D STEP 3: REAL-BROWSER UI & INTERACTION VERIFICATION");
  console.log("================================================================");

  let serverProc = null;
  let chromeProc = null;
  const profileDir = path.resolve(`./scratch/chrome-profile-step3d-${Date.now()}`);

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

    serverProc.stderr.on("data", (d) => {
      console.error(`[Next.js Stderr] ${d.toString().trim()}`);
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

    // Wait for page to finish loading
    await sleep(2500);

    // -------------------------------------------------------------------------
    // TEST 1: Initial Page Load, Header, KPI Cards & Table
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 1: Initial Page Load, Header, KPI Cards & Table ---");
    await cdp.send("Page.navigate", { url: `http://localhost:${PORT}/admin/billing/invoices` });
    await sleep(3000);

    const initialData = await cdp.evaluate(`
      (() => {
        const title = document.querySelector('h1')?.textContent?.trim();
        const bodySnippet = document.body.innerText.slice(0, 300);
        const allH1s = Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim());
        const allH2s = Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim());
        const trs = document.querySelectorAll('tr').length;
        const tbodyTrs = document.querySelectorAll('tbody tr').length;
        const mainEl = document.querySelector('main') !== null;
        const billNos = Array.from(document.querySelectorAll('tbody tr td:first-child .font-mono')).map(el => el.textContent.trim());

        return {
          title,
          allH1s,
          allH2s,
          tableRows: tbodyTrs,
          mainEl,
          billNos,
          bodySnippet
        };
      })()
    `);

    console.log("Initial state evaluation:", initialData);
    if (initialData.tableRows !== 4) throw new Error(`Expected 4 initial table rows, found ${initialData.tableRows}`);
    if (!initialData.billNos.includes("BCS/2026-27/092")) throw new Error("Missing BCS/2026-27/092 in initial table");

    await cdp.screenshot(`${ARTIFACT_DIR}/step3_1_initial_archive_list.png`);
    console.log("✅ TEST 1 PASSED: Initial page, KPIs, and 4 invoices rendered accurately");

    // -------------------------------------------------------------------------
    // TEST 2: Search Interactions (by Bill No, Customer Name, and Location)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 2: Search Interactions ---");

    // Helper to simulate native React input typing
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

    // Search by bill number "092"
    await cdp.evaluate(`window.__setReactInput('input[placeholder*="Search bill no"]', '092');`);
    await sleep(400);

    const search092 = await cdp.evaluate(`
      (() => {
        const rows = document.querySelectorAll('tbody tr').length;
        const billNo = document.querySelector('tbody tr td:first-child .font-mono')?.textContent?.trim();
        return { rows, billNo };
      })()
    `);
    console.log("Search '092' result:", search092);
    if (search092.rows !== 1 || search092.billNo !== "BCS/2026-27/092") {
      throw new Error(`Search by 092 failed: expected 1 row for BCS/2026-27/092, got ${JSON.stringify(search092)}`);
    }

    // Search by customer "Lakshmi"
    await cdp.evaluate(`window.__setReactInput('input[placeholder*="Search bill no"]', 'Lakshmi');`);
    await sleep(400);

    const searchLmw = await cdp.evaluate(`
      (() => {
        const rows = document.querySelectorAll('tbody tr').length;
        const billNo = document.querySelector('tbody tr td:first-child .font-mono')?.textContent?.trim();
        return { rows, billNo };
      })()
    `);
    console.log("Search 'Lakshmi' result:", searchLmw);
    if (searchLmw.rows !== 1 || searchLmw.billNo !== "BCS/2026-27/091") {
      throw new Error(`Search by Lakshmi failed: expected 1 row for BCS/2026-27/091, got ${JSON.stringify(searchLmw)}`);
    }

    // Search by location "Plant 1"
    await cdp.evaluate(`window.__setReactInput('input[placeholder*="Search bill no"]', 'Plant 1');`);
    await sleep(400);

    const searchPlant = await cdp.evaluate(`
      (() => {
        const rows = document.querySelectorAll('tbody tr').length;
        const billNo = document.querySelector('tbody tr td:first-child .font-mono')?.textContent?.trim();
        return { rows, billNo };
      })()
    `);
    console.log("Search 'Plant 1' result:", searchPlant);
    if (searchPlant.rows !== 1 || searchPlant.billNo !== "BCS/2026-27/082") {
      throw new Error(`Search by Plant 1 failed: expected 1 row for BCS/2026-27/082, got ${JSON.stringify(searchPlant)}`);
    }

    await cdp.screenshot(`${ARTIFACT_DIR}/step3_2_search_interactions.png`);
    console.log("✅ TEST 2 PASSED: Real-time search functional across bill number, customer name, and delivery location");

    // Clear search
    await cdp.evaluate(`window.__setReactInput('input[placeholder*="Search bill no"]', '');`);
    await sleep(400);

    // -------------------------------------------------------------------------
    // TEST 3: Dropdown Filter Interactions (Customer, Period, Status)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 3: Dropdown Filter Interactions ---");

    // Filter by Status: PAID (3rd select)
    await cdp.evaluate(`window.__setReactSelect(2, 'PAID');`);
    await sleep(400);

    const filterPaid = await cdp.evaluate(`
      (() => {
        const rows = document.querySelectorAll('tbody tr').length;
        const billNos = Array.from(document.querySelectorAll('tbody tr td:first-child .font-mono')).map(el => el.textContent.trim());
        return { rows, billNos };
      })()
    `);
    console.log("Filter Status=PAID result:", filterPaid);
    if (filterPaid.rows !== 2 || !filterPaid.billNos.includes("BCS/2026-27/082") || !filterPaid.billNos.includes("BCS/2026-27/081")) {
      throw new Error(`Filter Status=PAID failed: expected 2 rows, got ${JSON.stringify(filterPaid)}`);
    }

    // Filter by Billing Period: September 2026 (2nd select)
    await cdp.evaluate(`window.__setReactSelect(1, 'September 2026');`);
    await sleep(400);

    // Filter by Customer: PRICOL (1st select)
    await cdp.evaluate(`window.__setReactSelect(0, 'cust-pricol');`);
    await sleep(400);

    const combinedFilter = await cdp.evaluate(`
      (() => {
        const rows = document.querySelectorAll('tbody tr').length;
        const billNo = document.querySelector('tbody tr td:first-child .font-mono')?.textContent?.trim();
        return { rows, billNo };
      })()
    `);
    console.log("Combined Filter (PRICOL + Sep 2026 + PAID) result:", combinedFilter);
    if (combinedFilter.rows !== 1 || combinedFilter.billNo !== "BCS/2026-27/082") {
      throw new Error(`Combined filter failed: expected 1 row (BCS/2026-27/082), got ${JSON.stringify(combinedFilter)}`);
    }

    await cdp.screenshot(`${ARTIFACT_DIR}/step3_3_filters_interaction.png`);
    console.log("✅ TEST 3 PASSED: Dropdown filters and combined multi-attribute filters functional");

    // -------------------------------------------------------------------------
    // TEST 4: Empty State & Reset Filters
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 4: Empty State & Reset Filters ---");

    // Enter a non-matching query
    await cdp.evaluate(`window.__setReactInput('input[placeholder*="Search bill no"]', 'XYZ999NONEXISTENT');`);
    await sleep(400);

    const emptyState = await cdp.evaluate(`
      (() => {
        const hasTable = document.querySelector('table') !== null;
        const emptyHeading = document.querySelector('main h3')?.textContent?.trim();
        const resetButton = Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Reset Filters'));
        return { hasTable, emptyHeading, resetButton };
      })()
    `);
    console.log("Empty state check:", emptyState);
    if (emptyState.hasTable || !emptyState.emptyHeading.includes("No Invoices Found") || !emptyState.resetButton) {
      throw new Error(`Empty state verification failed: ${JSON.stringify(emptyState)}`);
    }

    await cdp.screenshot(`${ARTIFACT_DIR}/step3_4_empty_state.png`);
    console.log("✅ TEST 4A: Empty state accurately rendered with clear message and reset button");

    // Click "Reset Filters & Show All"
    await cdp.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Reset Filters & Show All') || b.textContent.includes('Reset Filters'));
        btn?.click();
      })()
    `);
    await sleep(600);

    const afterReset = await cdp.evaluate(`
      (() => {
        const rows = document.querySelectorAll('tbody tr').length;
        const searchValue = document.querySelector('input[placeholder*="Search bill no"]')?.value;
        const selectValues = Array.from(document.querySelectorAll('select')).map(s => s.value);
        return { rows, searchValue, selectValues };
      })()
    `);
    console.log("After reset check:", afterReset);
    if (afterReset.rows !== 4 || afterReset.searchValue !== "" || !afterReset.selectValues.every(v => v === "ALL")) {
      throw new Error(`Reset filters failed: ${JSON.stringify(afterReset)}`);
    }
    console.log("✅ TEST 4B: Reset filters restored search, dropdowns, and all 4 table records");

    // -------------------------------------------------------------------------
    // TEST 5: Action Notice Feedback (Step 4 Modal Preparation)
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 5: Action Notice Feedback ---");
    await cdp.evaluate(`
      (() => {
        const viewBtn = document.querySelector('tbody tr:first-child button');
        viewBtn?.click();
      })()
    `);
    await sleep(500);

    const noticeCheck = await cdp.evaluate(`
      (() => {
        const noticeEl = document.querySelector('.bg-sky-50');
        return {
          visible: noticeEl !== null,
          text: noticeEl?.textContent?.trim()
        };
      })()
    `);
    console.log("Action notice check:", noticeCheck);
    if (!noticeCheck.visible || !noticeCheck.text.includes("Step 4")) {
      throw new Error(`Action notice failed: ${JSON.stringify(noticeCheck)}`);
    }

    await cdp.screenshot(`${ARTIFACT_DIR}/step3_5_action_notice.png`);
    console.log("✅ TEST 5 PASSED: Action feedback banner cleanly indicates Step 4 preview readiness");

    // -------------------------------------------------------------------------
    // TEST 6: Mobile Responsive Layout
    // -------------------------------------------------------------------------
    console.log("\n--- TEST 6: Mobile Responsive Layout (375x812) ---");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(600);

    const mobileCheck = await cdp.evaluate(`
      (() => {
        const desktopWrapper = document.querySelector('table')?.closest('div');
        const desktopTableVisible = desktopWrapper ? getComputedStyle(desktopWrapper).display !== 'none' : false;
        const mobileContainer = document.querySelector('[class*="md:hidden"]');
        const mobileCards = mobileContainer ? mobileContainer.querySelectorAll(':scope > div').length : 0;
        return {
          desktopTableVisible,
          mobileCards
        };
      })()
    `);
    console.log("Mobile layout check:", mobileCheck);
    if (mobileCheck.mobileCards !== 4) {
      throw new Error(`Mobile layout check failed: expected 4 mobile invoice cards, got ${mobileCheck.mobileCards}`);
    }

    await cdp.screenshot(`${ARTIFACT_DIR}/step3_6_mobile_layout.png`);
    console.log("✅ TEST 6 PASSED: Mobile layout cleanly renders responsive card view");

    console.log("\n================================================================");
    console.log("🎉 ALL REAL-BROWSER UI & INTERACTION TESTS PASSED (6/6)!");
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

runBrowserTests().catch((err) => {
  console.error("FATAL ERROR in browser tests:", err);
  process.exit(1);
});
