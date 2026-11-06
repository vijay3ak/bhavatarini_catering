import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ARTIFACT_DIR = "C:/Users/VIJAY/.gemini/antigravity/brain/f7fa78bb-62de-4863-a373-8e54b26c8e8d";
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 3010;
const CDP_PORT = 9230;
const USER_DATA_DIR = path.resolve("./scratch/chrome-profile-verify");

const PNG_FILE = path.resolve("./scratch/sample_canteen_slip.png");
const PDF_FILE = path.resolve("./scratch/sample_canteen_register.pdf");
const TXT_FILE = path.resolve("./scratch/invalid_notes.txt");

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
    this.eventListeners = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && this.callbacks.has(data.id)) {
        const cb = this.callbacks.get(data.id);
        this.callbacks.delete(data.id);
        if (data.error) cb.reject(new Error(data.error.message));
        else cb.resolve(data.result);
      } else if (data.method && this.eventListeners.has(data.method)) {
        this.eventListeners.get(data.method)(data.params);
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

  on(method, callback) {
    this.eventListeners.set(method, callback);
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
  console.log("=== STARTING 5 OUTSTANDING UPLOAD INTERACTION TESTS ===");

  // 1. Start Next.js server on port 3010
  console.log(`Starting Next.js server on port ${PORT}...`);
  const nextServer = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)], {
    stdio: "pipe",
  });

  try {
    await waitForServer(`http://localhost:${PORT}/admin/billing/upload`);
    console.log("Server ready on port " + PORT);

    // 2. Launch Chrome
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
        "--window-size=1280,900",
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
    await cdp.send("DOM.enable");
    await cdp.send("Runtime.enable");

    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 860,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // Instrument window to track object URL creation and revocation
    await cdp.eval(`
      window.__createdUrls = [];
      window.__revokedUrls = [];
      const origCreate = URL.createObjectURL;
      const origRevoke = URL.revokeObjectURL;
      URL.createObjectURL = function(blob) {
        const u = origCreate.call(URL, blob);
        window.__createdUrls.push(u);
        return u;
      };
      URL.revokeObjectURL = function(url) {
        window.__revokedUrls.push(url);
        origRevoke.call(URL, url);
      };
    `);

    // Listen for alert dialogs
    let lastDialogMessage = null;
    cdp.on("Page.javascriptDialogOpening", async (params) => {
      console.log("  [CDP Dialog Event] Browser alert opened:", params.message);
      lastDialogMessage = params.message;
      await cdp.send("Page.handleJavaScriptDialog", { accept: true });
    });

    const results = {};

    // Helper to get input node id
    async function getFileInputNodeId() {
      const doc = await cdp.send("DOM.getDocument");
      const node = await cdp.send("DOM.querySelector", {
        nodeId: doc.root.nodeId,
        selector: 'input[type="file"]',
      });
      return node.nodeId;
    }

    // -------------------------------------------------------------
    // TEST 1: Actual PNG File Upload
    // -------------------------------------------------------------
    console.log("\n--- TEST 1: Uploading Real PNG Image ---");
    const inputNodeId1 = await getFileInputNodeId();
    await cdp.send("DOM.setFileInputFiles", {
      nodeId: inputNodeId1,
      files: [PNG_FILE],
    });
    await sleep(800);

    const test1Data = await cdp.eval(`
      (() => {
        const fileSpan = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('sample_canteen_slip.png'));
        const badgeEl = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('IMAGE SCAN'));
        const imgEl = document.querySelector('img[alt="sample_canteen_slip.png"]');
        return {
          fileName: fileSpan ? fileSpan.textContent.trim() : null,
          hasBadge: Boolean(badgeEl),
          imgSrc: imgEl ? imgEl.src : null,
          isBlob: imgEl ? imgEl.src.startsWith('blob:') : false,
          createdUrlsCount: window.__createdUrls.length
        };
      })()
    `);
    console.log("Test 1 DOM Data:", test1Data);

    if (
      test1Data.fileName &&
      test1Data.fileName.includes("sample_canteen_slip.png") &&
      test1Data.hasBadge &&
      test1Data.isBlob
    ) {
      results.test1 = "PASS";
      console.log("TEST 1: PASS - Real PNG uploaded and previewed correctly!");
      await cdp.screenshot(path.join(ARTIFACT_DIR, "upload_verify1_image_upload.png"));
    } else {
      results.test1 = "FAIL";
      console.log("TEST 1: FAIL -", test1Data);
    }

    // -------------------------------------------------------------
    // TEST 2: Actual PDF Document Upload
    // -------------------------------------------------------------
    console.log("\n--- TEST 2: Uploading Real PDF Document ---");
    const inputNodeId2 = await getFileInputNodeId();
    await cdp.send("DOM.setFileInputFiles", {
      nodeId: inputNodeId2,
      files: [PDF_FILE],
    });
    await sleep(800);

    const test2Data = await cdp.eval(`
      (() => {
        const fileSpan = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('sample_canteen_register.pdf'));
        const badgeEl = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('PDF DOCUMENT'));
        const iframeEl = document.querySelector('iframe[title="sample_canteen_register.pdf"]');
        return {
          fileName: fileSpan ? fileSpan.textContent.trim() : null,
          hasBadge: Boolean(badgeEl),
          iframeSrc: iframeEl ? iframeEl.src : null,
          isBlob: iframeEl ? iframeEl.src.startsWith('blob:') : false,
          revokedUrlsCount: window.__revokedUrls.length
        };
      })()
    `);
    console.log("Test 2 DOM Data:", test2Data);

    if (
      test2Data.fileName &&
      test2Data.fileName.includes("sample_canteen_register.pdf") &&
      test2Data.hasBadge &&
      test2Data.isBlob
    ) {
      results.test2 = "PASS";
      console.log("TEST 2: PASS - Real PDF uploaded and rendered in iframe!");
      await cdp.screenshot(path.join(ARTIFACT_DIR, "upload_verify2_pdf_upload.png"));
    } else {
      results.test2 = "FAIL";
      console.log("TEST 2: FAIL -", test2Data);
    }

    // -------------------------------------------------------------
    // TEST 3: Invalid TXT File Rejection
    // -------------------------------------------------------------
    console.log("\n--- TEST 3: Attempting to upload invalid TXT file ---");
    lastDialogMessage = null;
    const inputNodeId3 = await getFileInputNodeId();
    await cdp.send("DOM.setFileInputFiles", {
      nodeId: inputNodeId3,
      files: [TXT_FILE],
    });
    await sleep(600);

    const test3Data = await cdp.eval(`
      (() => {
        const fileSpan = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('sample_canteen_register.pdf'));
        const invalidSpan = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('invalid_notes.txt'));
        return {
          previousFileRemains: Boolean(fileSpan),
          invalidFileLoaded: Boolean(invalidSpan)
        };
      })()
    `);
    console.log("Test 3 Dialog Message Caught:", lastDialogMessage);
    console.log("Test 3 Rejection State:", test3Data);

    if (
      lastDialogMessage &&
      lastDialogMessage.includes("Unsupported file type") &&
      !test3Data.invalidFileLoaded
    ) {
      results.test3 = "PASS";
      console.log("TEST 3: PASS - Invalid TXT rejected with visible browser error and not accepted!");
      await cdp.screenshot(path.join(ARTIFACT_DIR, "upload_verify3_invalid_file_rejected.png"));
    } else {
      results.test3 = "FAIL";
      console.log("TEST 3: FAIL -", { lastDialogMessage, test3Data });
    }

    // -------------------------------------------------------------
    // TEST 4: Replace Document
    // -------------------------------------------------------------
    console.log("\n--- TEST 4: Replacing document with PNG slip ---");
    const prevRevokedCount = await cdp.eval("window.__revokedUrls.length");
    const inputNodeId4 = await getFileInputNodeId();
    await cdp.send("DOM.setFileInputFiles", {
      nodeId: inputNodeId4,
      files: [PNG_FILE],
    });
    await sleep(800);

    const test4Data = await cdp.eval(`
      (() => {
        const fileSpan = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('sample_canteen_slip.png'));
        const badgeEl = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('IMAGE SCAN'));
        const imgEl = document.querySelector('img[alt="sample_canteen_slip.png"]');
        return {
          fileName: fileSpan ? fileSpan.textContent.trim() : null,
          hasBadge: Boolean(badgeEl),
          imgSrc: imgEl ? imgEl.src : null,
          revokedCountNow: window.__revokedUrls.length
        };
      })()
    `);
    console.log("Test 4 DOM Data:", test4Data);
    console.log(`  -> Object URLs revoked before: ${prevRevokedCount}, now: ${test4Data.revokedCountNow}`);

    if (
      test4Data.fileName &&
      test4Data.fileName.includes("sample_canteen_slip.png") &&
      test4Data.hasBadge &&
      test4Data.revokedCountNow > prevRevokedCount
    ) {
      results.test4 = "PASS";
      console.log("TEST 4: PASS - Document replaced cleanly and old object URL revoked!");
      await cdp.screenshot(path.join(ARTIFACT_DIR, "upload_verify4_replace_document.png"));
    } else {
      results.test4 = "FAIL";
      console.log("TEST 4: FAIL -", test4Data);
    }

    // -------------------------------------------------------------
    // TEST 5: Remove Document & Return to Empty State
    // -------------------------------------------------------------
    console.log("\n--- TEST 5: Clicking Remove button ---");
    const prevRevokedCount5 = await cdp.eval("window.__revokedUrls.length");
    await cdp.eval(`
      (() => {
        const removeBtn = document.querySelector('button[title="Remove document"]');
        if (removeBtn) {
          removeBtn.click();
          return true;
        }
        return false;
      })()
    `);
    await sleep(600);

    const test5Data = await cdp.eval(`
      (() => {
        const dropzonePrompt = Array.from(document.querySelectorAll('h4')).find(h => h.textContent.includes('Click to Upload or Drag & Drop'));
        const emptyStateTitle = Array.from(document.querySelectorAll('h4')).find(h => h.textContent.includes('No Document Selected'));
        const hasRemoveBtn = Boolean(document.querySelector('button[title="Remove document"]'));
        return {
          hasDropzonePrompt: Boolean(dropzonePrompt),
          hasEmptyStateTitle: Boolean(emptyStateTitle),
          hasRemoveBtn: hasRemoveBtn,
          revokedCountNow: window.__revokedUrls.length
        };
      })()
    `);
    console.log("Test 5 DOM Data:", test5Data);
    console.log(`  -> Object URLs revoked before: ${prevRevokedCount5}, now: ${test5Data.revokedCountNow}`);

    if (
      test5Data.hasDropzonePrompt &&
      test5Data.hasEmptyStateTitle &&
      !test5Data.hasRemoveBtn &&
      test5Data.revokedCountNow > prevRevokedCount5
    ) {
      results.test5 = "PASS";
      console.log("TEST 5: PASS - Document removed cleanly, object URL revoked, returned to empty state!");
      await cdp.screenshot(path.join(ARTIFACT_DIR, "upload_verify5_empty_state_after_removal.png"));
    } else {
      results.test5 = "FAIL";
      console.log("TEST 5: FAIL -", test5Data);
    }

    // Cleanup Chrome
    ws.close();
    chromeProc.kill();
    console.log("Chrome session closed.");

    console.log("\n==================================================");
    console.log("TEST RESULTS SUMMARY:");
    console.log("1. Real PNG Upload: " + results.test1);
    console.log("2. Real PDF Upload: " + results.test2);
    console.log("3. Invalid TXT Rejection: " + results.test3);
    console.log("4. Replace Document: " + results.test4);
    console.log("5. Remove Document: " + results.test5);
    console.log("==================================================");
  } finally {
    nextServer.kill();
    console.log("Next.js server stopped.");
  }
}

main().catch((err) => {
  console.error("FATAL ERROR in test script:", err);
  process.exit(1);
});
