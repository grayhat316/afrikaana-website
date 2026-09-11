/* Afrikaana Cart
   localStorage-backed order management.
*/

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

  function updateBadge() {
    var c = count();
    var el = document.querySelector(".cart-count");
    if (!el) return;
    el.textContent = c;

    var wrapper = document.querySelector(".cart-link");
    if (!wrapper) return;
    wrapper.style.visibility = c > 0 ? "" : "hidden";
    wrapper.setAttribute("aria-label", c > 0 ? "Cart, " + c + " items" : "Cart is empty");
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
    }, 3600);
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

  /* Render the order table on /order */
  function renderOrderTable() {
    var el = document.getElementById("order-table");
    if (!el) return;
    var cart = get();

    if (cart.length === 0) {
      el.closest(".section").innerHTML =
        '<div class="empty"><h3>Your order is empty</h3><p>Browse the menu and add some dishes first.</p><a href="/menu" class="btn btn-primary">See the menu</a></div>';
      var chosen = document.getElementById("pickup-choice");
      if (chosen) chosen.style.display = "none";
      return;
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
      '<thead><tr><th>Item</th><th>Quantity</th><th>Line total</th><th></th></tr></thead><tbody>' +
      rows +
      "</tbody>";

    var tot = total();
    document.getElementById("order-subtotal").textContent = AFRIKAANA.money(tot);
    document.getElementById("order-total").textContent = AFRIKAANA.money(tot);
  }

  /* Render checkout summary */
  function renderCheckoutSummary() {
    var el = document.getElementById("checkout-summary");
    if (!el) return;
    var cart = get();
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
    showToast: showToast,
    sendWhatsApp: sendWhatsApp,
    renderOrderTable: renderOrderTable,
    renderCheckoutSummary: renderCheckoutSummary,
  };
})();