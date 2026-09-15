/* Afrikaana Restaurant, Eldoret */

var Cart = (function () {
  "use strict";

  var KEY = "afrikaana_cart";

  function get() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function save(cart) {
    localStorage.setItem(KEY, JSON.stringify(cart));
  }

  function count() {
    return get().reduce(function (n, line) {
      return n + line.qty;
    }, 0);
  }

  function total() {
    return get().reduce(function (sum, line) {
      return sum + line.price * line.qty;
    }, 0);
  }

  function add(dishId, qty) {
    var cart = get();
    var dish = AFRIKAANA.getDish(dishId);
    if (!dish) return;

    var existing = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === dishId) {
        existing = i;
        break;
      }
    }

    if (existing !== null) {
      cart[existing].qty += qty;
    } else {
      cart.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        img: dish.img,
        qty: qty,
      });
    }

    save(cart);
    updateBadge();
    return cart;
  }

  function remove(idx) {
    var cart = get();
    cart.splice(idx, 1);
    save(cart);
    updateBadge();
    return cart;
  }

  function setQty(idx, qty) {
    var cart = get();
    if (qty < 1) {
      cart.splice(idx, 1);
    } else {
      cart[idx].qty = qty;
    }
    save(cart);
    updateBadge();
    return cart;
  }

  var _primed = false;
  var _lastCount = 0;

  function bump(el) {
    el.classList.remove("bump");
    void el.offsetWidth; // restart the animation
    el.classList.add("bump");
    clearTimeout(el._bumpTimer);
    el._bumpTimer = setTimeout(function () {
      el.classList.remove("bump");
    }, 700);
  }

  function updateBadge() {
    var c = count();
    var grew = _primed && c > _lastCount;
    _lastCount = c;

    var el = document.querySelector(".cart-count");
    if (el) el.textContent = c;

    // header order link
    var wrapper = document.querySelector(".cart-link");
    if (wrapper) {
      if (c > 0) wrapper.classList.add("has-items");
      else wrapper.classList.remove("has-items");
      if (grew) bump(wrapper);
    }

    // floating order button
    var fab = document.getElementById("cart-fab");
    if (fab) {
      var fabCount = fab.querySelector(".cart-fab-count");
      if (fabCount) fabCount.textContent = c;

      if (c > 0) {
        var justAppeared = !fab.classList.contains("show");
        fab.classList.add("show");
        fab.removeAttribute("aria-hidden");
        // skip the pulse on first show
        if (fabCount && !justAppeared && grew) bump(fabCount);
      } else {
        fab.classList.remove("show");
        fab.setAttribute("aria-hidden", "true");
        if (fabCount) fabCount.classList.remove("bump");
      }
    }

    _primed = true;
  }

  function showToast(name, dishId) {
    var t = document.getElementById("toast");
    if (!t) return;
    var msg = t.querySelector(".toast-msg");
    if (!msg) return;
    msg.innerHTML =
      name + " added to order. <a href=\"/order\">View order &rarr;</a>";
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(function () {
      t.classList.remove("show");
    }, 5000);
  }

  function buildWhatsAppMsg(form) {
    var cart = get();
    var pieces = [];

    pieces.push("*Order for Afrikaana Restaurant*");
    pieces.push("");

    for (var i = 0; i < cart.length; i++) {
      var line = cart[i];
      pieces.push(
        line.qty + "x " + line.name + " - KES " + (line.price * line.qty).toLocaleString("en-KE")
      );
    }

    pieces.push("");
    pieces.push("*Total: KES " + total().toLocaleString("en-KE") + "*");

    if (form) {
      var name = (form.querySelector("[name=name]") || {}).value || "";
      var phone = (form.querySelector("[name=phone]") || {}).value || "";
      var when = (form.querySelector("[name=when]") || {}).value || "";
      var pickup = (form.querySelector("[name=pickup]") || {}).value || "";
      var notes = (form.querySelector("[name=notes]") || {}).value || "";

      pieces.push("");
      pieces.push("*Customer:* " + name);
      pieces.push("*Phone:* " + phone);
      if (when) pieces.push("*Pickup time:* " + when);
      pieces.push("*Method:* " + (pickup || "not specified"));
      if (notes) pieces.push("*Notes:* " + notes);
    }

    return encodeURIComponent(pieces.join("\n"));
  }

  function sendWhatsApp(formEl) {
    var msg = buildWhatsAppMsg(formEl);
    window.open("https://wa.me/" + AFRIKAANA.brand.whatsapp + "?text=" + msg, "_blank");
  }

  // order table
  function renderOrderTable() {
    var el = document.getElementById("order-table");
    if (!el) return;
    var cart = get();

    var proceedBtn = document.querySelector('a[href="/checkout"]');
    var totals = el.parentElement
      ? el.parentElement.querySelector(".totals")
      : null;

    if (cart.length === 0) {
      el.innerHTML =
        '<div class="empty"><h3>Your order is empty</h3><p>Browse the menu and add some dishes first.</p><a href="/menu" class="btn btn-primary">See the menu</a></div>';
      if (totals) totals.style.display = "none";
      if (proceedBtn) {
        proceedBtn.classList.add("disabled");
        proceedBtn.setAttribute("aria-disabled", "true");
        proceedBtn.style.pointerEvents = "none";
        proceedBtn.style.opacity = "0.5";
      }
      return;
    }

    if (totals) totals.style.display = "";
    if (proceedBtn) {
      proceedBtn.classList.remove("disabled");
      proceedBtn.removeAttribute("aria-disabled");
      proceedBtn.style.pointerEvents = "";
      proceedBtn.style.opacity = "";
    }

    var rows = "";
    for (var i = 0; i < cart.length; i++) {
      var line = cart[i];
      rows +=
        '<tr>' +
        '<td>' +
        '<div class="order-item">' +
        '<img src="' +
        line.img +
        '" alt="' +
        line.name +
        '">' +
        '<div><div class="order-item-name">' +
        line.name +
        '</div><div class="order-item-meta">' +
        AFRIKAANA.money(line.price) +
        " each</div></div>" +
        "</div>" +
        "</td>" +
        '<td><div class="stepper"><button onclick="Cart.setQty(' +
        i +
        "," +
        (line.qty - 1) +
        '); render()" aria-label="Decrease">\u2212</button><input type="text" value="' +
        line.qty +
        '" readonly aria-label="Quantity"><button onclick="Cart.setQty(' +
        i +
        "," +
        (line.qty + 1) +
        '); render()" aria-label="Increase">+</button></div></td>' +
        '<td class="mono">' +
        AFRIKAANA.money(line.price * line.qty) +
        "</td>" +
        '<td><button class="link-remove" onclick="Cart.remove(' +
        i +
        '); render()">Remove</button></td>' +
        "</tr>";
    }

    el.innerHTML =
      '<table class="order-table"><thead><tr><th>Item</th><th>Quantity</th><th>Line total</th><th></th></tr></thead><tbody>' +
      rows +
      "</tbody></table>";

    var tot = total();
    document.getElementById("order-subtotal").textContent = AFRIKAANA.money(tot);
    document.getElementById("order-total").textContent = AFRIKAANA.money(tot);
  }

  // checkout summary
  function renderCheckoutSummary() {
    var el = document.getElementById("checkout-summary");
    if (!el) return;
    var cart = get();

    var form = document.getElementById("checkout-form");
    var formCol = form ? form.parentElement : null;

    if (cart.length === 0) {
      el.innerHTML =
        '<div class="empty"><h3>Nothing to check out</h3><p>Your order is empty. Add a dish and come back.</p><a href="/menu" class="btn btn-primary">See the menu</a></div>';
      if (formCol) formCol.style.display = "none";
      else if (form) form.style.display = "none";
      return;
    }

    if (formCol) formCol.style.display = "";
    if (form) form.style.display = "";

    var items = "";
    for (var i = 0; i < cart.length; i++) {
      var line = cart[i];
      items +=
        '<div class="order-item" style="margin-bottom:10px">' +
        '<img src="' +
        line.img +
        '" alt="' +
        line.name +
        '">' +
        '<div><div class="order-item-name">' +
        line.qty +
        "x " +
        line.name +
        '</div><div class="order-item-meta">KES ' +
        (line.price * line.qty).toLocaleString("en-KE") +
        "</div></div>" +
        "</div>";
    }
    el.innerHTML =
      items +
      '<hr class="rule" style="margin:18px 0"><div class="totals-row grand"><span>Total</span><span>' +
      AFRIKAANA.money(total()) +
      "</span></div>";
  }

  return {
    add: add,
    remove: remove,
    setQty: setQty,
    get: get,
    count: count,
    total: total,
    updateBadge: updateBadge,
    showToast: showToast,
    sendWhatsApp: sendWhatsApp,
    renderOrderTable: renderOrderTable,
    renderCheckoutSummary: renderCheckoutSummary,
  };
})();