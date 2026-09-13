/* Real-browser check of the mobile floating order button, driven over CDP.
   Launches headless Chrome, sets a committed viewport, exercises localStorage,
   and reads back computed styles. */

const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9333;
const PROFILE = path.join(os.tmpdir(), "afr-cdp-" + Date.now());
const BASE = "http://localhost:8099";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      "--remote-debugging-port=" + PORT,
      "--user-data-dir=" + PROFILE,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--window-size=390,844",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  /* wait for the devtools endpoint */
  let version = null;
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      version = await r.json();
      break;
    } catch (e) {
      await sleep(300);
    }
  }
  if (!version) throw new Error("Chrome devtools endpoint never came up");
  console.log("browser:", version.Browser);

  const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let id = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
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
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  const evaluate = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " :: " + expr.slice(0, 80));
    return r.result.value;
  };

  const goto = async (url) => {
    await send("Page.navigate", { url });
    /* readyState alone is not enough: the previous document can still report
       "complete" before the new navigation commits. Wait for a marker that
       only exists on a fully-parsed Afrikaana page. */
    for (let i = 0; i < 80; i++) {
      await sleep(150);
      let ok = false;
      try {
        ok = await evaluate(
          "document.readyState === 'complete' && typeof Cart === 'object' && !!document.getElementById('cart-fab')"
        );
      } catch (e) {
        ok = false;
      }
      if (ok) break;
    }
    await sleep(400);
  };

  let pass = 0,
    fail = 0;
  const check = (label, cond, extra) => {
    if (cond) {
      pass++;
      console.log("  PASS  " + label);
    } else {
      fail++;
      console.log("  FAIL  " + label + (extra !== undefined ? "  -> " + JSON.stringify(extra) : ""));
    }
  };

  /* ---------------- MOBILE ---------------- */
  console.log("\n[MOBILE 390x844] homepage");
  await evaluate("try { localStorage.clear() } catch (e) {}");
  await goto(BASE + "/");

  check("viewport really is 390px wide", (await evaluate("window.innerWidth")) === 390, await evaluate("window.innerWidth"));

  const fabEmpty = await evaluate(`(() => {
    const fab = document.getElementById('cart-fab');
    const s = getComputedStyle(fab);
    return { display: s.display, opacity: s.opacity, transform: s.transform, visibility: s.visibility, pointerEvents: s.pointerEvents };
  })()`);
  check("FAB is hidden when the cart is empty", parseFloat(fabEmpty.opacity) === 0, fabEmpty);
  check("FAB is off-screen when empty (translated down)", fabEmpty.transform !== "none", fabEmpty.transform);
  check("FAB not clickable when empty", fabEmpty.pointerEvents === "none", fabEmpty.pointerEvents);
  check("FAB is rendered (display not none) on mobile", fabEmpty.display !== "none", fabEmpty.display);

  const linkMobile = await evaluate(
    "getComputedStyle(document.querySelector('.cart-link')).display"
  );
  check("header order link is hidden on mobile", linkMobile === "none", linkMobile);

  /* add an item through the real code path */
  await evaluate(`Cart.add('pilau-ya-kuku', 2); Cart.updateBadge();`);
  await sleep(300);

  const fabFilled = await evaluate(`(() => {
    const fab = document.getElementById('cart-fab');
    const s = getComputedStyle(fab);
    const r = fab.getBoundingClientRect();
    return { opacity: s.opacity, pointerEvents: s.pointerEvents, position: s.position,
             display: s.display, right: window.innerWidth - r.right, bottom: window.innerHeight - r.bottom,
             w: Math.round(r.width), h: Math.round(r.height),
             bg: s.backgroundColor, radius: s.borderRadius,
             onScreen: r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth,
             count: fab.querySelector('.cart-fab-count').textContent };
  })()`);

  check("FAB becomes visible once items are added", parseFloat(fabFilled.opacity) === 1, fabFilled.opacity);
  check("FAB is clickable when filled", fabFilled.pointerEvents === "auto", fabFilled.pointerEvents);
  check("FAB is fixed to the viewport", fabFilled.position === "fixed", fabFilled.position);
  check("FAB sits fully on screen", fabFilled.onScreen === true, fabFilled);
  check("FAB is round", fabFilled.radius === "50%", fabFilled.radius);
  check("FAB uses the brand clay colour", fabFilled.bg === "rgb(163, 74, 42)", fabFilled.bg);
  check("FAB count shows 2", String(fabFilled.count) === "2", fabFilled.count);
  check("FAB is bottom-right (right gap < 30px)", fabFilled.right < 30, fabFilled.right);
  check("FAB is bottom-right (bottom gap < 30px)", fabFilled.bottom < 30, fabFilled.bottom);
  check("FAB is a comfortable tap size (>=48px)", fabFilled.w >= 48 && fabFilled.h >= 48, fabFilled.w + "x" + fabFilled.h);

  /* toast must not collide with the FAB */
  const toastPos = await evaluate(`(() => {
    const t = document.getElementById('toast');
    Cart.showToast('Pilau ya Kuku');
    const s = getComputedStyle(t);
    const r = t.getBoundingClientRect();
    return { bottom: s.bottom, toastTop: r.top };
  })()`);
  await sleep(350);
  const overlap = await evaluate(`(() => {
    const t = document.getElementById('toast').getBoundingClientRect();
    const f = document.getElementById('cart-fab').getBoundingClientRect();
    const overlaps = !(t.right < f.left || t.left > f.right || t.bottom < f.top || t.top > f.bottom);
    return { overlaps, toastBottom: Math.round(t.bottom), fabTop: Math.round(f.top), toastVisible: getComputedStyle(document.getElementById('toast')).transform };
  })()`);
  check("toast sits above the FAB, no overlap", overlap.overlaps === false, overlap);

  /* tapping the FAB goes to /order */
  await evaluate("document.getElementById('cart-fab').click()");
  await sleep(900);
  const url = await evaluate("location.pathname");
  check("tapping the FAB opens /order", /^\/order\/?$/.test(url), url);

  const orderState = await evaluate(`(() => {
    const f = document.getElementById('checkout-summary');
    return { table: !!document.querySelector('.order-table'), rows: document.querySelectorAll('.order-table tbody tr').length,
             removeBtn: !!document.querySelector('.link-remove') };
  })()`);
  check("order page renders the cart table", orderState.table === true, orderState);
  check("order page shows the line", orderState.rows >= 1, orderState.rows);
  check("order page has the remove button", orderState.removeBtn === true, orderState);

  /* ---------------- DESKTOP ---------------- */
  console.log("\n[DESKTOP 1280x900] same page");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await sleep(400);

  const desktop = await evaluate(`(() => {
    const fab = getComputedStyle(document.getElementById('cart-fab'));
    const link = document.querySelector('.cart-link');
    const ls = getComputedStyle(link);
    return { fabDisplay: fab.display, linkDisplay: ls.display,
             linkText: link.textContent.trim().replace(/\\s+/g, ' '),
             linkVisible: ls.opacity !== '0' && ls.visibility !== 'hidden' };
  })()`);
  check("FAB is gone on desktop", desktop.fabDisplay === "none", desktop.fabDisplay);
  check("header order link is back on desktop", desktop.linkDisplay !== "none", desktop.linkDisplay);
  check("header order link is visible on desktop", desktop.linkVisible === true, desktop);
  check("header link keeps its label and count", /Order/.test(desktop.linkText), desktop.linkText);

  console.log("\n" + (fail === 0 ? `ALL ${pass} BROWSER CHECKS PASSED` : `${fail} BROWSER CHECK(S) FAILED (${pass} passed)`));

  ws.close();
  chrome.kill();
  await sleep(300);
  try {
    fs.rmSync(PROFILE, { recursive: true, force: true });
  } catch (e) {}
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(2);
});
