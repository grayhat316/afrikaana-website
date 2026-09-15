/* capture mobile and desktop screenshots */

const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9300 + Math.floor(Math.random() * 600);
const PROFILE = path.join(os.tmpdir(), "afr-shot-" + Date.now());
const BASE = "http://localhost:8099";
const OUT = "C:/Users/User/afrikaana-website/tests/screenshots";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      "--remote-debugging-port=" + PORT,
      "--user-data-dir=" + PROFILE,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  let version = null;
  for (let i = 0; i < 40; i++) {
    try {
      version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
      break;
    } catch (e) {
      await sleep(300);
    }
  }
  if (!version) throw new Error("devtools never came up");

  const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let id = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
    }
  };
  const send = (method, params) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      pending.set(mid, { resolve, reject });
      ws.send(JSON.stringify({ id: mid, method, params: params || {} }));
    });

  await send("Page.enable");
  await send("Runtime.enable");

  const evaluate = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };

  const goto = async (url) => {
    await send("Page.navigate", { url });
    for (let i = 0; i < 80; i++) {
      await sleep(150);
      let ok = false;
      try {
        ok = await evaluate("document.readyState === 'complete' && typeof Cart === 'object'");
      } catch (e) {
        ok = false;
      }
      if (ok) break;
    }
    await sleep(600);
  };

  const shot = async (name) => {
    const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    const file = path.join(OUT, name);
    fs.writeFileSync(file, Buffer.from(r.data, "base64"));
    const kb = Math.round(fs.statSync(file).size / 1024);
    console.log(`  saved ${file} (${kb} KB)`);
  };

  /* mobile */
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await evaluate("try { localStorage.clear() } catch (e) {}");
  await goto(BASE + "/");
  await sleep(500);
  await shot("mobile-1-empty-cart.png");

  await evaluate("Cart.add('pilau-ya-kuku', 2); Cart.add('nyama-choma-ngombe', 1); Cart.updateBadge();");
  await sleep(700);
  await shot("mobile-2-cart-filled.png");

  /* close-up of the buttons */
  await evaluate("document.documentElement.style.overflow='hidden'");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 300,
    height: 260,
    deviceScaleFactor: 3,
    mobile: true,
  });
  await sleep(500);
  await evaluate(`(() => {
    const st = document.querySelector('.float-stack');
    st.style.position = 'absolute';
    st.style.right = '16px';
    st.style.bottom = '16px';
    window.scrollTo(0, 0);
    document.body.style.margin = '0';
  })()`);
  await sleep(400);
  const overlay = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: 300, height: 260, scale: 3 } });
  fs.writeFileSync(path.join(OUT, "mobile-3-buttons-closeup.png"), Buffer.from(overlay.data, "base64"));
  console.log("  saved mobile-3-buttons-closeup.png");

  /* desktop */
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await goto(BASE + "/");
  await sleep(600);
  await shot("desktop-1-homepage.png");

  ws.close();
  chrome.kill();
  await sleep(300);
  try {
    fs.rmSync(PROFILE, { recursive: true, force: true });
  } catch (e) {}
  console.log("done");
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
