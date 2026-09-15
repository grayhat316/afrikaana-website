/* real browser check of the floating buttons, driven over CDP */

const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
/* random port, consecutive runs collide on a fixed one */
const PORT = 9300 + Math.floor(Math.random() * 600);
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

  /* wait for devtools */
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

  const waitFor = async (expr, tries) => {
    for (let i = 0; i < (tries || 80); i++) {
      await sleep(200);
      let ok = false;
      try {
        ok = await evaluate(expr);
      } catch (e) {
        ok = false;
      }
      if (ok) return true;
    }
    return false;
  };

  const goto = async (url) => {
    await send("Page.navigate", { url });
    /* readyState alone is not enough, the old page still reports complete */
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

  /* mobile */
  console.log("\n[MOBILE 390x844] homepage");
  await evaluate("try { localStorage.clear() } catch (e) {}");
  await goto(BASE + "/");

  check("viewport really is 390px wide", (await evaluate("window.innerWidth")) === 390, await evaluate("window.innerWidth"));

  /* toast */
  const toastHidden = await evaluate(`(() => {
    const t = document.getElementById('toast');
    const s = getComputedStyle(t);
    const r = t.getBoundingClientRect();
    return { visibility: s.visibility, opacity: s.opacity, height: Math.round(r.height),
             top: Math.round(r.top), bottom: Math.round(r.bottom),
             intrudes: r.height > 0 && r.bottom > 0 && r.top < window.innerHeight };
  })()`);
  check(
    "hidden toast is fully invisible",
    toastHidden.visibility === "hidden" && parseFloat(toastHidden.opacity) === 0,
    toastHidden
  );
  const toastHit = await evaluate(`(() => {
    const t = document.getElementById('toast');
    const r = t.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const inside = cx >= 0 && cy >= 0 && cx < window.innerWidth && cy < window.innerHeight;
    const hit = inside ? document.elementFromPoint(cx, cy) : null;
    return { hit: hit ? (hit.id || hit.tagName) : null, hitsToast: hit ? (hit === t || t.contains(hit)) : false };
  })()`);
  check("hidden toast does not paint or capture clicks", toastHit.hitsToast === false, toastHit);

  /* stack */
  const stack = await evaluate(`(() => {
    const st = document.querySelector('.float-stack');
    const s = getComputedStyle(st);
    const r = st.getBoundingClientRect();
    return { display: s.display, position: s.position, dir: s.flexDirection,
             right: window.innerWidth - r.right, bottom: window.innerHeight - r.bottom,
             onScreen: r.left >= 0 && r.right <= window.innerWidth && r.top >= 0 && r.bottom <= window.innerHeight };
  })()`);
  check("float stack is shown on mobile", stack.display === "flex", stack.display);
  check("float stack is fixed to the viewport", stack.position === "fixed", stack.position);
  check("float stack is a vertical column", stack.dir === "column", stack.dir);
  check("float stack hugs the right edge", stack.right < 24, stack.right);
  check("float stack hugs the bottom edge", stack.bottom < 24, stack.bottom);
  check("whole stack sits on screen", stack.onScreen === true, stack);

  /* call and whatsapp */
  const others = await evaluate(`(() => {
    const wa = document.querySelector('.float-btn-wa');
    const tel = document.querySelector('.float-btn-tel');
    const info = (el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { visible: s.display !== 'none' && parseFloat(s.opacity) !== 0,
               href: el.getAttribute('href'), text: el.textContent.trim(),
               h: Math.round(r.height), w: Math.round(r.width), bg: s.backgroundColor };
    };
    return { wa: info(wa), tel: info(tel) };
  })()`);
  check("WhatsApp button is visible", others.wa.visible === true, others.wa);
  check("WhatsApp button links to wa.me with the number", /^https:\/\/wa\.me\/254700000000$/.test(others.wa.href), others.wa.href);
  check("WhatsApp button is labelled and opens a new tab", /WhatsApp/.test(others.wa.text), others.wa.text);
  check("WhatsApp button uses WhatsApp green", others.wa.bg === "rgb(31, 170, 83)", others.wa.bg);
  check("Call button is visible", others.tel.visible === true, others.tel);
  check("Call button is a tel: link", /^tel:\+254700000000$/.test(others.tel.href), others.tel.href);
  check("Call button is labelled", /Call/.test(others.tel.text), others.tel.text);
  check("Call button meets the 44px tap minimum", others.tel.h >= 44, others.tel.h);

  /* order button */
  const fabEmpty = await evaluate(`(() => {
    const fab = document.getElementById('cart-fab');
    const s = getComputedStyle(fab);
    return { display: s.display, ariaHidden: fab.getAttribute('aria-hidden'),
             text: fab.textContent.replace(/\\s+/g, ' ').trim() };
  })()`);
  check("order button hidden while the cart is empty", fabEmpty.display === "none", fabEmpty.display);
  check("order button marked aria-hidden while empty", fabEmpty.ariaHidden === "true", fabEmpty.ariaHidden);
  check("order button carries a readable label", /View order/.test(fabEmpty.text), fabEmpty.text);

  const linkMobile = await evaluate("getComputedStyle(document.querySelector('.cart-link')).display");
  check("header order link is hidden on mobile", linkMobile === "none", linkMobile);

  /* add an item */
  await evaluate("Cart.add('pilau-ya-kuku', 2); Cart.updateBadge();");
  await sleep(450);

  const fabFilled = await evaluate(`(() => {
    const fab = document.getElementById('cart-fab');
    const st = document.querySelector('.float-stack');
    const f = fab.getBoundingClientRect();
    const s = st.getBoundingClientRect();
    const cs = getComputedStyle(fab);
    return { display: cs.display, position: cs.position, bg: cs.backgroundColor, radius: cs.borderRadius,
             w: Math.round(f.width), h: Math.round(f.height),
             inside: f.top >= s.top - 1 && f.bottom <= s.bottom + 1,
             aboveOthers: f.bottom <= document.querySelector('.float-btn-wa').getBoundingClientRect().top + 1,
             right: window.innerWidth - f.right,
             onScreen: f.left >= 0 && f.right <= window.innerWidth && f.top >= 0,
             count: fab.querySelector('.cart-fab-count').textContent,
             label: fab.querySelector('.cart-fab-text').textContent.trim(),
             svg: !!fab.querySelector('svg') };
  })()`);
  check(
    "order button appears once items are added",
    fabFilled.display === "flex" || fabFilled.display === "inline-flex",
    fabFilled.display
  );
  check("order button is inside the float stack", fabFilled.inside === true, fabFilled);
  check("order button sits above the call/whatsapp buttons", fabFilled.aboveOthers === true, fabFilled);
  check("order button is on screen", fabFilled.onScreen === true, fabFilled);
  check("order button uses the brand clay colour", fabFilled.bg === "rgb(163, 74, 42)", fabFilled.bg);
  check("order button is a pill, not a tiny circle", parseInt(fabFilled.radius, 10) >= 20, fabFilled.radius);
  check("order button is a wide, obvious target", fabFilled.w >= 120, fabFilled.w);
  check("order button is tall enough to tap", fabFilled.h >= 44, fabFilled.h);
  check("order button shows its count", String(fabFilled.count) === "2", fabFilled.count);
  check("order button keeps its 'View order' text", fabFilled.label === "View order", fabFilled.label);
  check("order button has an icon", fabFilled.svg === true, fabFilled.svg);
  const sharesBase = await evaluate(
    "document.getElementById('cart-fab').classList.contains('float-btn')"
  );
  check("order button shares the float-btn base styling", sharesBase === true, sharesBase);
  const sameHeight = await evaluate(`(() => {
    const a = document.getElementById('cart-fab').getBoundingClientRect().height;
    const b = document.querySelector('.float-btn-wa').getBoundingClientRect().height;
    return Math.abs(a - b) < 1;
  })()`);
  check("order button matches the other buttons in height", sameHeight === true, sameHeight);

  /* toast position */
  await evaluate("Cart.showToast('Pilau ya Kuku')");
  await sleep(500);
  const toastBox = await evaluate(`(() => {
    const t = document.getElementById('toast').getBoundingClientRect();
    const st = document.querySelector('.float-stack').getBoundingClientRect();
    const header = document.querySelector('.site-header').getBoundingClientRect();
    const clamp = (n) => Math.round(n);
    return { overlapsStack: !(t.right < st.left || t.left > st.right || t.bottom < st.top || t.top > st.bottom),
             overlapsHeader: !(t.right < header.left || t.left > header.right || t.bottom < header.top || t.top > header.bottom),
             toastTop: clamp(t.top), headerBottom: clamp(header.bottom), visible: getComputedStyle(document.getElementById('toast')).transform };
  })()`);
  check("toast does not overlap the floating buttons", toastBox.overlapsStack === false, toastBox);
  check("toast does not cover the header", toastBox.overlapsHeader === false, toastBox);
  check("toast sits below the sticky header", toastBox.toastTop >= toastBox.headerBottom, toastBox);

  /* tap through to /order */
  await evaluate("document.getElementById('cart-fab').click()");
  await waitFor(
    "location.pathname.indexOf('/order') === 0 && document.readyState === 'complete' && !!document.querySelector('.order-table')"
  );
  await sleep(300);
  const url = await evaluate("location.pathname");
  check("tapping the order button opens /order", /^\/order\/?$/.test(url), url);

  const orderState = await evaluate(`(() => ({
    table: !!document.querySelector('.order-table'),
    rows: document.querySelectorAll('.order-table tbody tr').length,
    removeBtn: !!document.querySelector('.link-remove')
  }))()`);
  check("order page renders the cart table", orderState.table === true, orderState);
  check("order page shows the line", orderState.rows >= 1, orderState.rows);
  check("order page has the remove button", orderState.removeBtn === true, orderState);

  const stackOnOrder = await evaluate("getComputedStyle(document.querySelector('.float-stack')).display");
  check("float stack still present on the order page", stackOnOrder === "flex", stackOnOrder);

  /* desktop */
  console.log("\n[DESKTOP 1280x900] same page");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await sleep(400);

  const desktop = await evaluate(`(() => {
    const stack = getComputedStyle(document.querySelector('.float-stack'));
    const link = document.querySelector('.cart-link');
    const ls = getComputedStyle(link);
    return { stackDisplay: stack.display, linkDisplay: ls.display,
             linkText: link.textContent.trim().replace(/\\s+/g, ' '),
             linkVisible: ls.opacity !== '0' && ls.visibility !== 'hidden' };
  })()`);
  check("float stack (and its buttons) is gone on desktop", desktop.stackDisplay === "none", desktop.stackDisplay);
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
