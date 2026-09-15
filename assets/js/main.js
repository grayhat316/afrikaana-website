/* Afrikaana Restaurant, Eldoret */

(function () {
  "use strict";

  var PAGE = document.body.dataset.page || "";

  function $(sel) {
    return document.querySelector(sel);
  }

  function $$(sel) {
    return Array.from(document.querySelectorAll(sel));
  }

  // mobile drawer

  function initDrawer() {
    var burger = $(".burger");
    var drawer = $(".drawer");
    var closeBtn = $(".drawer-close");
    var links = $$(".drawer a");

    if (!burger || !drawer) return;

    burger.addEventListener("click", function () {
      drawer.classList.add("open");
      burger.setAttribute("aria-expanded", "true");
    });

    function close() {
      drawer.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }

    if (closeBtn) closeBtn.addEventListener("click", close);
    links.forEach(function (a) {
      a.addEventListener("click", close);
    });
  }

  // header scroll

  function initHeaderScroll() {
    var header = $(".site-header");
    if (!header) return;
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          if (window.scrollY > 40) {
            header.classList.add("scrolled");
          } else {
            header.classList.remove("scrolled");
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // cart badge on load

  function updateCartBadge() {
    // badge state comes from cart.js
    if (window.Cart && window.Cart.updateBadge) {
      window.Cart.updateBadge();
    }
  }

  // menu tabs

  function initMenuTabs() {
    var container = $("#dish-container");
    if (!container) return;

    var tabs = $$(".cat-tab");
    var activeCat = null;

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.setAttribute("aria-pressed", "false");
        });
        tab.setAttribute("aria-pressed", "true");
        activeCat = tab.dataset.cat;
        renderDishes(activeCat, $("#menu-search") ? $("#menu-search").value : "");
      });
    });

    // search
    var search = $("#menu-search");
    if (search) {
      search.addEventListener("input", function () {
        renderDishes(activeCat || "", search.value);
      });
    }

    // render all categories on load
    var first = $(".cat-tab[aria-pressed='true']");
    activeCat = first ? first.dataset.cat : "";
    renderDishes(activeCat, "");
  }

  function renderDishes(cat, query) {
    var container = $("#dish-container");
    if (!container) return;

    var dishes = AFRIKAANA.dishes;
    if (cat) {
      dishes = dishes.filter(function (d) {
        return d.category === cat;
      });
    }
    if (query) {
      var q = query.toLowerCase();
      dishes = dishes.filter(function (d) {
        return d.name.toLowerCase().indexOf(q) > -1 || d.short.toLowerCase().indexOf(q) > -1 ||
          (d.tags && d.tags.join(" ").toLowerCase().indexOf(q) > -1);
      });
    }

    if (dishes.length === 0) {
      container.innerHTML =
        '<div class="empty"><h3>Nothing found</h3><p>Try a different search or reset the category filter.</p></div>';
      return;
    }

    var html = '<div class="dish-grid">';
    dishes.forEach(function (d) {
      var tags = (d.tags || [])
        .map(function (t) {
          var cls =
            t === "Vegetarian"
              ? "tag tag-forest"
              : t === "Spicy"
                ? "tag tag-clay"
                : t === "Chef's Pick" || t === "Popular"
                  ? "tag tag-ochre"
                  : "tag";
          return '<span class="' + cls + '">' + t + "</span>";
        })
        .join("");

      html +=
        '<div class="dish-card">' +
        '<a href="/dish?id=' +
        d.id +
        '" class="dish-card-media"><img src="' +
        d.img +
        '" alt="' +
        d.name +
        '" loading="lazy"></a>' +
        '<div class="dish-card-body">' +
        '<div class="dish-card-top"><h3 class="dish-card-title"><a href="/dish?id=' +
        d.id +
        '">' +
        d.name +
        "</a></h3>" +
        '<span class="dish-price">' +
        AFRIKAANA.money(d.price) +
        "</span></div>" +
        '<p class="dish-card-desc">' +
        d.short +
        "</p>" +
        '<div class="dish-card-foot">' +
        '<div class="tags">' +
        tags +
        "</div>" +
        '<a href="/dish?id=' +
        d.id +
        '" class="btn btn-outline btn-sm">View</a>' +
        "</div>" +
        "</div>" +
        "</div>";
    });
    html += "</div>";
    container.innerHTML = html;
  }

  // dish detail

  function initDishDetail() {
    var el = $("#dish-page");
    if (!el) return;
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    var dish = AFRIKAANA.getDish(id);
    if (!dish) {
      el.innerHTML =
        '<div class="empty"><h3>Dish not found</h3><p>Try browsing the <a href="/menu">menu</a>.</p></div>';
      return;
    }

    document.title = dish.name + " | Afrikaana";

    var tags = (dish.tags || [])
      .map(function (t) {
        var cls =
          t === "Vegetarian"
            ? "tag tag-forest"
            : t === "Spicy"
              ? "tag tag-clay"
              : "tag tag-ochre";
        return '<span class="' + cls + '">' + t + "</span>";
      })
      .join("");

    el.innerHTML =
      '<div class="dish-detail">' +
      '<div class="dish-detail-media"><img src="' +
      dish.img +
      '" alt="' +
      dish.name +
      '"></div>' +
      '<div>' +
      '<nav class="breadcrumb"><a href="/menu">Menu</a><span>/</span></nav>' +
      "<h1>" +
      dish.name +
      "</h1>" +
      '<div class="price-line"><span class="price">' +
      AFRIKAANA.money(dish.price) +
      "</span></div>" +
      '<p class="lede">' +
      dish.long +
      "</p>" +
      '<div class="tags" style="margin-bottom:18px">' +
      tags +
      "</div>" +
      '<table class="spec-table"><tbody>' +
      (dish.spice
        ? "<tr><th>Spice</th><td>" +
          dish.spice +
          "</td></tr>"
        : "") +
      (dish.prep
        ? "<tr><th>Prep time</th><td>" +
          dish.prep +
          "</td></tr>"
        : "") +
      (dish.serves
        ? "<tr><th>Serves</th><td>" +
          dish.serves +
          "</td></tr>"
        : "") +
      (dish.allergens.length
        ? "<tr><th>Allergens</th><td>" +
          dish.allergens.join(", ") +
          '</td></tr><tr><th></th><td><a href="/allergens">Allergen guide</a></td></tr>'
        : "") +
      "</tbody></table>" +
      '<div class="qty-row">' +
            '<div class="stepper">' +
            '<button onclick="var v=parseInt(this.nextElementSibling.value,10)||1;this.nextElementSibling.value=Math.max(1,v-1)" aria-label="Decrease">\u2212</button>' +
            '<input type="text" class="dish-qty-input" value="1" readonly aria-label="Quantity">' +
            '<button onclick="var v=parseInt(this.previousElementSibling.value,10)||1;this.previousElementSibling.value=v+1" aria-label="Increase">+</button>' +
            '</div>' +
            '<button class="btn btn-primary" onclick="var v=parseInt(this.parentElement.querySelector(\'.dish-qty-input\').value,10)||1; Cart.add(\'' +
            dish.id +
            "', v); Cart.showToast('" +
            dish.name.replace(/'/g, "\\'") +
            "');\">Add to order</button>" +
      "</div>" +
      "</div>" +
      "</div>";

    // related dishes
    var rel = $("#related-dishes");
    if (!rel) return;
    var same = AFRIKAANA.dishesInCategory(dish.category).filter(function (d) {
      return d.id !== dish.id;
    });
    var related = same.slice(0, 3);
    if (related.length === 0) {
      rel.style.display = "none";
      return;
    }
    var relHTML = '<div class="dish-grid">';
    related.forEach(function (rd) {
      relHTML +=
        '<div class="dish-card">' +
        '<a href="/dish?id=' +
        rd.id +
        '" class="dish-card-media"><img src="' +
        rd.img +
        '" alt="' +
        rd.name +
        '" loading="lazy"></a>' +
        '<div class="dish-card-body">' +
        '<div class="dish-card-top"><h3 class="dish-card-title"><a href="/dish?id=' +
        rd.id +
        '">' +
        rd.name +
        "</a></h3>" +
        '<span class="dish-price">' +
        AFRIKAANA.money(rd.price) +
        "</span></div>" +
        '<p class="dish-card-desc">' +
        rd.short +
        "</p>" +
        "</div>" +
        "</div>";
    });
    relHTML += "</div>";
    rel.innerHTML = relHTML;
  }

  // category page

  function initCategoryPage() {
    var params = new URLSearchParams(window.location.search);
    var catId = params.get("cat");
    if (!catId) return;
    var cat = AFRIKAANA.getCategory(catId);
    var head = $("#cat-heading");
    if (head && cat) {
      head.textContent = cat.name;
    }
    renderDishes(catId, "");
  }

  // catering package

  function initPackageDetail() {
    var el = $("#package-page");
    if (!el) return;
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    var pkg = AFRIKAANA.getPackage(id);
    if (!pkg) {
      el.innerHTML =
        '<div class="empty"><h3>Package not found</h3><p><a href="/catering">See catering packages</a>.</p></div>';
      return;
    }
    document.title = pkg.name + " | Afrikaana Catering";
    var items = pkg.includes
      .map(function (i) {
        return "<li>" + i + "</li>";
      })
      .join("");
    el.innerHTML =
      '<div class="dish-detail">' +
      '<div class="dish-detail-media"><img src="' +
      pkg.img +
      '" alt="' +
      pkg.name +
      '"></div>' +
      '<div>' +
      '<nav class="breadcrumb"><a href="/catering">Catering</a><span>/</span></nav>' +
      "<h1>" +
      pkg.name +
      "</h1>" +
      '<p class="lede">' +
      pkg.summary +
      "</p>" +
      '<table class="spec-table"><tbody>' +
      "<tr><th>Guests</th><td>" +
      pkg.guests +
      "</td></tr>" +
      "<tr><th>Price</th><td>" +
      pkg.price +
      "</td></tr>" +
      "<tr><th>Lead time</th><td>" +
      pkg.lead +
      "</td></tr>" +
      "</tbody></table>" +
      "<h3>What is included</h3>" +
      '<ul class="includes">' +
      items +
      "</ul>" +
      '<p style="margin-top: 18px; color: var(--stone)">' +
      pkg.detail +
      "</p>" +
      '<a href="/contact" class="btn btn-primary" style="margin-top: 14px">Enquire about this package</a>' +
      "</div>" +
      "</div>";
  }

  // journal

  function initJournal() {
    var list = $("#post-list");
    if (!list) return;
    var html = "";
    AFRIKAANA.posts.forEach(function (p) {
      html +=
        '<article class="post-row">' +
        '<a href="/journal-post?id=' +
        p.id +
        '" class="post-row-media"><img src="' +
        p.img +
        '" alt="' +
        p.title +
        '" loading="lazy"></a>' +
        '<div>' +
        '<div class="post-meta">' +
        AFRIKAANA.formatDate(p.date) +
        " | " +
        p.tag +
        "</div>" +
        '<h3><a href="/journal-post?id=' +
        p.id +
        '">' +
        p.title +
        "</a></h3>" +
        '<p class="muted">' +
        p.excerpt +
        "</p>" +
        "</div>" +
        "</article>";
    });
    list.innerHTML = html;
  }

  function initJournalPost() {
    var el = $("#journal-post-page");
    if (!el) return;
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    var post = AFRIKAANA.getPost(id);
    if (!post) {
      el.innerHTML =
        '<div class="empty"><h3>Post not found</h3><p><a href="/journal">Back to journal</a>.</p></div>';
      return;
    }
    document.title = post.title + " | Afrikaana Journal";
    var bodyHtml = post.body
      .map(function (p) {
        return "<p>" + p + "</p>";
      })
      .join("");
    el.innerHTML =
      '<div class="page-head" style="padding-bottom:20px"><nav class="breadcrumb"><a href="/journal">Journal</a><span>/</span></nav></div>' +
      '<div class="prose" style="max-width: 740px; margin: 0 auto">' +
      '<div class="post-meta">' +
      AFRIKAANA.formatDate(post.date) +
      " | " +
      post.tag +
      "</div>" +
      "<h1>" +
      post.title +
      "</h1>" +
      '<p class="lede">' +
      post.excerpt +
      "</p>" +
      '<img src="' +
      post.img +
      '" alt="' +
      post.title +
      '" style="margin: 28px 0 32px; width:100%">' +
      bodyHtml +
      '<hr class="rule" style="margin:32px 0">' +
      '<a href="/journal">Back to all posts</a>' +
      "</div>";
  }

  // team

  function initTeam() {
    var el = $("#team-grid");
    if (!el) return;
    var html = '<div class="grid grid-4">';
    AFRIKAANA.team.forEach(function (m) {
      html +=
        '<div class="dish-card" style="text-align:center">' +
        '<div class="dish-card-media"><img src="' +
        m.img +
        '" alt="' +
        m.role +
        '" loading="lazy"></div>' +
        '<div class="dish-card-body">' +
        '<h3 style="font-size:1.05rem">' +
        m.name +
        "</h3>" +
        '<p class="dish-card-desc">' +
        m.role +
        "</p>" +
        "</div>" +
        "</div>";
    });
    html += "</div>";
    el.innerHTML = html;
  }

  // branches

  function initBranches() {
    var el = $("#branches-grid");
    if (!el) return;
    var html = '<div class="grid grid-3">';
    AFRIKAANA.branches.forEach(function (b) {
      html +=
        '<div class="branch">' +
        '<img src="' +
        b.img +
        '" alt="' +
        b.name +
        '" style="margin-bottom:16px; aspect-ratio:16/9; object-fit:cover">' +
        "<h3>" +
        b.name +
        '</h3><p class="dish-card-desc">' +
        b.label +
        "</p>" +
        "<dl>" +
        "<dt>Address</dt><dd>" +
        b.address +
        "<br>" +
        b.street +
        "</dd>" +
        "<dt>Phone</dt><dd>" +
        b.phone +
        "</dd>" +
        "<dt>Hours</dt><dd>" +
        b.hours +
        "</dd>" +
        (b.note ? "<dt>Note</dt><dd>" + b.note + "</dd>" : "") +
        "</dl>" +
        '<a href="' +
        b.map +
        '" target="_blank" rel="noopener" class="btn btn-outline btn-sm" style="margin-top:14px">Get directions</a>' +
        "</div>";
    });
    html += "</div>";
    el.innerHTML = html;
  }

  // faq

  function initFAQ() {
    var el = $("#faq-list");
    if (!el) return;
    var html = '<div class="accordion">';
    AFRIKAANA.faqs.forEach(function (f) {
      html +=
        "<details>" +
        "<summary>" +
        f.q +
        "</summary>" +
        '<div class="acc-body"><p>' +
        f.a +
        "</p></div>" +
        "</details>";
    });
    html += "</div>";
    el.innerHTML = html;
  }

  // allergens

  function initAllergens() {
    var el = $("#allergen-table");
    if (!el) return;
    var rows = "";
    AFRIKAANA.allergens.rows.forEach(function (r) {
      rows +=
        "<tr><td>" +
        r.cat +
        "</td><td>" +
        r.contains +
        "</td><td>" +
        r.risk +
        "</td></tr>";
    });
    el.innerHTML =
      '<thead><tr><th>Category</th><th>Contains</th><th>Risk</th></tr></thead><tbody>' +
      rows +
      "</tbody>";
  }

  // lightbox

  function initLightbox() {
    var items = $$(".gallery-item");
    if (!items.length) return;
    var lb = $(".lightbox");
    var lbImg = $(".lightbox img");
    if (!lb || !lbImg) return;

    items.forEach(function (btn) {
      btn.addEventListener("click", function () {
        lbImg.src = btn.dataset.src || btn.querySelector("img").src;
        lbImg.alt = btn.dataset.alt || btn.querySelector("img").alt;
        lb.classList.add("open");
        document.body.style.overflow = "hidden";
      });
    });

    var close = $(".lightbox-close");
    if (close) {
      close.addEventListener("click", function () {
        lb.classList.remove("open");
        document.body.style.overflow = "";
      });
    }

    lb.addEventListener("click", function (e) {
      if (e.target === lb) {
        lb.classList.remove("open");
        document.body.style.overflow = "";
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lb.classList.contains("open")) {
        lb.classList.remove("open");
        document.body.style.overflow = "";
      }
    });
  }

  // contact form

  function initContactForm() {
    var form = $("#contact-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (form.querySelector("[name=name]") || {}).value || "";
      var phone = (form.querySelector("[name=phone]") || {}).value || "";
      var msg = (form.querySelector("[name=message]") || {}).value || "";
      var text =
        "Hello, my name is " +
        name +
        ". Phone: " +
        phone +
        ". " +
        msg +
        " (sent from the Afrikaana website)";
      window.open(
        "https://wa.me/" + AFRIKAANA.brand.whatsapp + "?text=" + encodeURIComponent(text),
        "_blank"
      );
      form.reset();
    });
  }

  // checkout form

  function initCheckoutForm() {
    var form = $("#checkout-form");
    if (!form) return;
    Cart.renderCheckoutSummary();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      Cart.sendWhatsApp(form);
      localStorage.removeItem("afrikaana_cart");
      updateCartBadge();
      form.reset();
      var el = $("#checkout-confirm");
      if (el) {
        el.style.display = "block";
        form.style.display = "none";
      }
    });
  }

  // order page

  function initOrderPage() {
    Cart.renderOrderTable();
  }

  // init

  function init() {
    initDrawer();
    initHeaderScroll();
    updateCartBadge();

    switch (PAGE) {
      case "menu":
        initMenuTabs();
        break;
      case "dish":
        initDishDetail();
        break;
      case "category":
        initCategoryPage();
        break;
      case "catering-package":
        initPackageDetail();
        break;
      case "journal":
        initJournal();
        break;
      case "journal-post":
        initJournalPost();
        break;
      case "team":
        initTeam();
        break;
      case "branches":
        initBranches();
        break;
      case "faq":
        initFAQ();
        break;
      case "allergens":
        initAllergens();
        break;
      case "order":
        initOrderPage();
        break;
      case "checkout":
        initCheckoutForm();
        break;
      default:
        initLightbox();
        initContactForm();
        break;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // needed by the inline onclick handlers
  window.render = function () {
    if (PAGE === "order") {
      Cart.renderOrderTable();
    } else if (PAGE === "checkout") {
      Cart.renderCheckoutSummary();
    }
    updateCartBadge();
  };
})();