/* Functional test for Afrikaana cart behaviour.
   Stubs the small DOM surface cart.js touches, then asserts real behaviour. */

const fs = require("fs");
const vm = require("vm");

const DIR = "C:/Users/User/afrikaana-website/assets/js/";

function makeEl(tag) {
  const classes = new Set();
  const el = {
    tagName: tag || "DIV",
    style: {},
    attrs: {},
    children: [],
    innerHTML: "",
    textContent: "",
    offsetWidth: 100,
    _listeners: {},
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c),
      toggle: (c) => (classes.has(c) ? classes.delete(c) : classes.add(c)),
      get value() {
        return [...classes].join(" ");
      },
    },
    _classes: classes,
    setAttribute(k, v) {
      el.attrs[k] = v;
    },
    removeAttribute(k) {
      delete el.attrs[k];
    },
    getAttribute(k) {
      return k in el.attrs ? el.attrs[k] : null;
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    addEventListener() {},
    appendChild(c) {
      el.children.push(c);
      return c;
    },
  };
  return el;
}

/* ---- build the fake page ---- */
function buildPage(opts) {
  opts = opts || {};

  const cartCount = makeEl("SPAN");
  const cartLink = makeEl("A");

  const orderTable = makeEl("DIV");
  const totals = makeEl("DIV");
  const col = makeEl("DIV");
  col.querySelector = (sel) => (sel === ".totals" ? totals : null);
  col.appendChild(orderTable);
  orderTable.parentElement = opts.orderParentIsColumn === false ? null : col;

  const subtotal = makeEl("SPAN");
  const totalEl = makeEl("SPAN");
  const toast = makeEl("DIV");
  const toastMsg = makeEl("SPAN");
  toast.querySelector = (sel) => (sel === ".toast-msg" ? toastMsg : null);

  const proceed = makeEl("A");

  const checkoutSummary = makeEl("DIV");
  const checkoutForm = makeEl("FORM");
  const formCol = makeEl("DIV");
  formCol.appendChild(checkoutForm);
  checkoutForm.parentElement = formCol;

  const fab = makeEl("A");
  const fabCount = makeEl("SPAN");
  fab.querySelector = (sel) => (sel === ".cart-fab-count" ? fabCount : null);

  const byId = {
    "cart-fab": fab,
    "order-table": orderTable,
    toast: toast,
    "order-subtotal": subtotal,
    "order-total": totalEl,
    "checkout-summary": checkoutSummary,
    "checkout-form": checkoutForm,
  };

  const document = {
    getElementById: (id) => byId[id] || null,
    querySelector: (sel) => {
      if (sel === ".cart-count") return cartCount;
      if (sel === ".cart-link") return cartLink;
      if (sel === 'a[href="/checkout"]') return proceed;
      return null;
    },
    querySelectorAll: () => [],
    addEventListener: () => {},
  };

  return { document, cartCount, cartLink, fab, fabCount, orderTable, totals, subtotal, totalEl, toast, toastMsg, proceed, checkoutSummary, checkoutForm, formCol };
}

function run(page, scriptNames) {
  const store = {};
  const sandbox = {
    document: page.document,
    window: {},
    console,
    setTimeout: () => 0,
    clearTimeout: () => {},
    localStorage: {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => {
        store[k] = String(v);
      },
      removeItem: (k) => {
        delete store[k];
      },
    },
    _store: store,
  };
  sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);
  for (const name of scriptNames) {
    vm.runInContext(fs.readFileSync(DIR + name, "utf8"), ctx, { filename: name });
  }
  /* data.js declares AFRIKAANA with `const`, so it lives in the context's
     lexical scope rather than as an own property of the sandbox object.
     Read it back through the context. */
  sandbox.get = (expr) => vm.runInContext(expr, ctx);
  return sandbox;
}

let failures = 0;
function check(label, cond, extra) {
  if (cond) {
    console.log("  PASS  " + label);
  } else {
    failures++;
    console.log("  FAIL  " + label + (extra ? "  -> " + extra : ""));
  }
}

/* ================= TEST 1: empty cart on /order ================= */
console.log("\n[1] /order with an empty cart");
{
  const page = buildPage();
  const sb = run(page, ["data.js", "cart.js"]);
  sb.Cart.renderOrderTable();

  check("shows the empty state", /Your order is empty/.test(page.orderTable.innerHTML));
  check("hides the totals block", page.totals.style.display === "none", page.totals.style.display);
  check("marks proceed to checkout disabled", page.proceed._classes.has("disabled"));
  check("sets aria-disabled on proceed", page.proceed.getAttribute("aria-disabled") === "true");
  check("blocks pointer events on proceed", page.proceed.style.pointerEvents === "none");
  check("does not crash on .section lookup", page.orderTable.innerHTML.length > 0);
}

/* ================= TEST 2: add an item, then render ================= */
console.log("\n[2] adding a dish");
{
  const page = buildPage();
  const sb = run(page, ["data.js", "cart.js"]);

  /* simulate page load: main.js calls this on DOMContentLoaded */
  sb.Cart.updateBadge();
  check("badge reads 0 on load", String(page.cartCount.textContent) === "0", page.cartCount.textContent);

  sb.Cart.add("pilau-ya-kuku", 2);

  check("cart count is 2", sb.Cart.count() === 2, sb.Cart.count());
  check("badge text updated to 2", String(page.cartCount.textContent) === "2", page.cartCount.textContent);
  check("header order link gets .has-items", page.cartLink._classes.has("has-items"));
  check("header order link pulses (.bump)", page.cartLink._classes.has("bump"));

  /* toast */
  sb.Cart.showToast("Pilau ya Kuku", "pilau-ya-kuku");
  check("toast becomes visible", page.toast._classes.has("show"));
  check("toast links to /order", /\/order/.test(page.toastMsg.innerHTML), page.toastMsg.innerHTML);
  check("toast names the dish", /Pilau ya Kuku added to order/.test(page.toastMsg.innerHTML), page.toastMsg.innerHTML);
}

/* ================= TEST 3: order table with items ================= */
console.log("\n[3] /order with items");
{
  const page = buildPage();
  const sb = run(page, ["data.js", "cart.js"]);
  sb.Cart.add("pilau-ya-kuku", 2);
  sb.Cart.add("chapati", 1);
  sb.Cart.renderOrderTable();

  const html = page.orderTable.innerHTML;
  check("renders a real <table class=order-table>", /<table class="order-table">/.test(html));
  check("closes the table tag", /<\/table>/.test(html));
  check("has an item row", /Pilau ya Kuku/.test(html));
  check("has a Remove button", /class="link-remove"/.test(html));
  check("remove button is labelled", />Remove</.test(html));
  check("shows the quantity stepper", /class="stepper"/.test(html));
  check("totals block is visible again", page.totals.style.display === "", JSON.stringify(page.totals.style.display));
  check("proceed is re-enabled", !page.proceed._classes.has("disabled"));
  check("aria-disabled removed", page.proceed.getAttribute("aria-disabled") === null);
  check("subtotal formatted", /KES/.test(page.subtotal.textContent), page.subtotal.textContent);
  check("total formatted", /KES/.test(page.totalEl.textContent), page.totalEl.textContent);

  const expected =
    2 * sb.get('AFRIKAANA.getDish("pilau-ya-kuku").price') +
    1 * sb.get('AFRIKAANA.getDish("chapati").price');
  check("total equals 2x pilau + 1x chapati", sb.Cart.total() === expected, sb.Cart.total() + " vs " + expected);
}

/* ================= TEST 4: quantity + remove ================= */
console.log("\n[4] quantity stepper and remove");
{
  const page = buildPage();
  const sb = run(page, ["data.js", "cart.js"]);
  sb.Cart.add("pilau-ya-kuku", 1);
  check("count starts at 1", sb.Cart.count() === 1, sb.Cart.count());

  sb.Cart.setQty(0, 3);
  check("setQty raises to 3", sb.Cart.count() === 3, sb.Cart.count());

  sb.Cart.setQty(0, 0);
  check("setQty 0 removes the line", sb.Cart.count() === 0, sb.Cart.count());
  check("badge returns to 0", String(page.cartCount.textContent) === "0", page.cartCount.textContent);
  check("header link loses .has-items", !page.cartLink._classes.has("has-items"));

  sb.Cart.add("chapati", 2);
  sb.Cart.remove(0);
  check("remove() empties the cart", sb.Cart.count() === 0, sb.Cart.count());
}

/* ================= TEST 5: checkout with empty cart ================= */
console.log("\n[5] /checkout with an empty cart");
{
  const page = buildPage();
  const sb = run(page, ["data.js", "cart.js"]);
  sb.Cart.renderCheckoutSummary();

  check("shows the nothing-to-check-out state", /Nothing to check out/.test(page.checkoutSummary.innerHTML));
  check("hides the form column", page.formCol.style.display === "none", page.formCol.style.display);
}

/* ================= TEST 6: checkout with items ================= */
console.log("\n[6] /checkout with items");
{
  const page = buildPage();
  const sb = run(page, ["data.js", "cart.js"]);
  sb.Cart.add("pilau-ya-kuku", 1);
  sb.Cart.renderCheckoutSummary();

  check("form column is visible", page.formCol.style.display === "", JSON.stringify(page.formCol.style.display));
  check("summary lists the item", /Pilau ya Kuku/.test(page.checkoutSummary.innerHTML));
  check("summary shows a total", /Total/.test(page.checkoutSummary.innerHTML));
}


/* ================= TEST 8: mobile floating order button ================= */
console.log("\n[8] floating order button (mobile)");
{
  const page = buildPage();
  const sb = run(page, ["data.js", "cart.js"]);

  /* nothing in the cart yet */
  sb.Cart.updateBadge();
  check("hidden while the cart is empty", !page.fab._classes.has("show"));
  check("marked aria-hidden while empty", page.fab.getAttribute("aria-hidden") === "true");
  check("badge count starts at 0", String(page.fabCount.textContent) === "0", page.fabCount.textContent);

  /* first item: the button animates itself in, so the chip stays still */
  sb.Cart.add("pilau-ya-kuku", 1);
  check("appears once an item is added", page.fab._classes.has("show"));
  check("no longer aria-hidden", page.fab.getAttribute("aria-hidden") === null);
  check("badge count matches the cart", String(page.fabCount.textContent) === "1", page.fabCount.textContent);
  check("entry animation not doubled up on the chip", !page.fabCount._classes.has("bump"));

  /* further items: now the count chip pulses */
  sb.Cart.add("chapati", 2);
  check("badge follows further adds", String(page.fabCount.textContent) === "3", page.fabCount.textContent);
  check("count chip pulses on later adds", page.fabCount._classes.has("bump"));

  /* removing everything hides it again */
  sb.Cart.setQty(0, 0);
  sb.Cart.setQty(0, 0);
  check("cart emptied", sb.Cart.count() === 0, sb.Cart.count());
  check("hides again when the cart empties", !page.fab._classes.has("show"));
  check("aria-hidden restored", page.fab.getAttribute("aria-hidden") === "true");
  check("badge back to 0", String(page.fabCount.textContent) === "0", page.fabCount.textContent);
  check("chip pulse cleared when hidden", !page.fabCount._classes.has("bump"));

  /* the header link keeps working alongside it (desktop) */
  sb.Cart.add("pilau-ya-kuku", 1);
  check("desktop header link still tracks the cart", page.cartLink._classes.has("has-items"));
}

/* ================= TEST 7: data integrity ================= */
console.log("\n[7] menu data");
{
  const page = buildPage();
  const sb = run(page, ["data.js"]);
  const ids = sb.get("AFRIKAANA.dishes.map(function (d) { return d.id; })");

  check("halwa is gone", !ids.includes("halwa"), ids.join(","));
  check("sambusa is gone", !ids.includes("sambusa"), ids.join(","));
  check("kaimati is gone", !ids.includes("kaimati"), ids.join(","));
  check("samosa survives", ids.includes("samosa"));
  check("no duplicate dish ids", new Set(ids).size === ids.length, ids.join(","));

  const all = sb.get("AFRIKAANA.dishes");
  const withImg = all.filter((d) => d.img && d.img.trim());
  check("every dish has an image", withImg.length === all.length, withImg.length + "/" + all.length);

  const team = sb.get("AFRIKAANA.team || []");
  if (team.length) {
    const placeholder =
      /^(https:\/\/api\.dicebear\.com|https:\/\/ui-avatars\.com)/;
    const faceless = team.filter((m) => placeholder.test(m.img));
    check(
      "every team member uses a placeholder avatar (no real faces)",
      faceless.length === team.length,
      faceless.length + "/" + team.length
    );
    const stockPhoto = team.filter((m) => /images\.unsplash\.com/.test(m.img));
    check("no team member uses a stock photo of a person", stockPhoto.length === 0, stockPhoto.map((m) => m.name).join(","));
    const named = team.every((m) => m.name && m.role && m.img);
    check("every team member has name, role and img", named);
  } else {
    console.log("  NOTE  no team array exported");
  }
}

console.log("\n" + (failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"));
process.exit(failures === 0 ? 0 : 1);
