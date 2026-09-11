"""Generate all 20 Afrikaana HTML pages with shared header/footer."""

import os, json

BASE = r"C:\Users\User\afrikaana-website"

CSS = "assets/css/style.css"
FONTS = (
    "https://fonts.googleapis.com/css2?"
    "family=Bitter:ital,wght@0,400;0,700;1,400&"
    "family=Karla:wght@400;600;700&"
    "family=IBM+Plex+Mono:wght@500;600&display=swap"
)

HEAD = """<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="{fonts}" rel="stylesheet">
  <link rel="stylesheet" href="/{css}">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>A</text></svg>">
</head>
<body data-page="{page}">
  <header class="site-header">
    <div class="header-inner">
      <a href="/" class="brand">
        <div class="brand-mark">A</div>
        <div class="brand-text">
          <span class="brand-name">Afrikaana</span>
          <span class="brand-tag">Eldoret</span>
        </div>
      </a>
      <nav class="main-nav">
        {nav_links}
      </nav>
      <div class="header-actions">
        <a href="/order" class="cart-link" aria-label="View order" style="visibility:hidden">
          <span class="label">Order</span>
          <span class="cart-count">0</span>
        </a>
        <button class="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>
  <div class="drawer">
    <div class="drawer-top">
      <a href="/" class="brand">
        <div class="brand-mark">A</div>
        <div class="brand-text">
          <span class="brand-name">Afrikaana</span>
          <span class="brand-tag">Eldoret</span>
        </div>
      </a>
      <button class="drawer-close" aria-label="Close menu">&times;</button>
    </div>
    <nav>
      {drawer_links}
    </nav>
  </div>
  <main>
    {content}
  </main>
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="/" class="brand">
            <div class="brand-mark">A</div>
            <div class="brand-text">
              <span class="brand-name">Afrikaana</span>
              <span class="brand-tag">Eldoret</span>
            </div>
          </a>
          <p>Multi-cuisine kitchen open around the clock. Three branches across Eldoret. 1,000+ plates served daily.</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/menu">Menu</a></li>
            <li><a href="/catering">Catering</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4>More</h4>
          <ul>
            <li><a href="/gallery">Gallery</a></li>
            <li><a href="/journal">Journal</a></li>
            <li><a href="/branches">Branches</a></li>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/allergens">Allergens</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li>Kabiyet House, Oginga Odinga St</li>
            <li>Eldoret CBD, Kenya</li>
            <li><a href="tel:+254700000000">0700 000 000</a></li>
            <li><a href="https://wa.me/254700000000">WhatsApp</a></li>
            <li>Open 24 hours</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2026 Afrikaana Restaurant</span>
        <span><a href="/privacy">Privacy</a> &middot; <a href="/terms">Terms</a></span>
      </div>
    </div>
  </footer>
  <div id="toast" class="toast"><span class="toast-msg"></span></div>
  <script src="/assets/js/data.js"></script>
  <script src="/assets/js/cart.js"></script>
  <script src="/assets/js/main.js"></script>
</body>
</html>"""

NAV = [
    ("/", "Home"),
    ("/menu", "Menu"),
    ("/catering", "Catering & Events"),
    ("/about", "About"),
    ("/gallery", "Gallery"),
    ("/journal", "Journal"),
    ("/contact", "Contact"),
]


def nav_links(current):
    parts = []
    for href, label in NAV:
        cur = ' aria-current="page"' if href == current else ""
        parts.append(f'<a href="{href}"{cur}>{label}</a>')
    return "".join(parts)


def drawer_links(current):
    parts = []
    for href, label in NAV:
        cur = ' aria-current="page"' if href == current else ""
        parts.append(f'<a href="{href}"{cur}>{label}</a>')
    return "".join(parts)


def build(current_page, title, desc, page_type, content):
    return HEAD.format(
        title=title,
        desc=desc,
        fonts=FONTS,
        css=CSS,
        page=page_type,
        nav_links=nav_links(current_page),
        drawer_links=drawer_links(current_page),
        content=content,
    )


def save(path_parts, html):
    p = os.path.join(BASE, *path_parts)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(html)
    return p


def section(title, body_html=""):
    return f'<section><div class="wrap"><h2>{title}</h2>{body_html}</div></section>'


###############################################################################
#  1. Home
###############################################################################

home = build(
    "/",
    "Afrikaana Restaurant | Eldoret, Kenya",
    "Afrikaana is a multi-cuisine restaurant in Eldoret CBD, Kenya, open 24 hours. Swahili dishes, nyama choma, pilau, breakfast and catering.",
    "home",
    """<section class="hero">
      <div class="hero-media"><img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=75" alt="Afrikaana Restaurant dining room, Eldoret"></div>
      <div class="hero-copy">
        <div class="wrap">
          <span class="eyebrow">Eldoret, Kenya</span>
          <h1>Multi-cuisine kitchen, open around the clock</h1>
          <p>Three branches. Eight thousand customers a day. Swahili dishes, nyama choma, pilau, breakfast and catering.</p>
          <div class="hero-actions">
            <a href="/menu" class="btn btn-primary">See the menu</a>
            <a href="/contact" class="btn btn-outline">Book a table</a>
          </div>
        </div>
      </div>
    </section>
    <section>
      <div class="wrap">
        <div class="fact-strip">
          <div class="fact"><dt>Plates daily</dt><dd>1,000+</dd></div>
          <div class="fact"><dt>Branches</dt><dd>3</dd></div>
          <div class="fact"><dt>Serving Eldoret</dt><dd>Since 2022</dd></div>
          <div class="fact"><dt>Open</dt><dd>24 hours</dd></div>
        </div>
      </div>
    </section>
    <section>
      <div class="wrap">
        <div class="section-head">
          <h2>Browse our menu</h2>
          <a href="/menu" class="head-link">Full menu &rarr;</a>
        </div>
        <div class="grid grid-2" style="gap:14px">
          <a href="/menu" class="dish-card-media" style="aspect-ratio:3/2; position:relative; display:flex; align-items:flex-end; text-decoration:none">
            <img src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=75" alt="Swahili dishes" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.7">
            <div style="position:relative;z-index:1;padding:24px">
              <span class="eyebrow" style="color:#fff">7 dishes</span>
              <h3 style="color:#fff;font-size:1.5rem;margin:0">Swahili Dishes</h3>
              <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">Pilau, biryani, samaki wa kupaka</p>
            </div>
          </a>
          <a href="/menu" class="dish-card-media" style="aspect-ratio:3/2; position:relative; display:flex; align-items:flex-end; text-decoration:none">
            <img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=75" alt="Grills" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.7">
            <div style="position:relative;z-index:1;padding:24px">
              <span class="eyebrow" style="color:#fff">6 dishes</span>
              <h3 style="color:#fff;font-size:1.5rem;margin:0">Grills & Nyama Choma</h3>
              <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">Beef, goat, kuku kienyeji, charcoal fired</p>
            </div>
          </a>
          <a href="/menu" class="dish-card-media" style="aspect-ratio:3/2; position:relative; display:flex; align-items:flex-end; text-decoration:none">
            <img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=75" alt="Breakfast" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.7">
            <div style="position:relative;z-index:1;padding:24px">
              <span class="eyebrow" style="color:#fff">5 dishes</span>
              <h3 style="color:#fff;font-size:1.5rem;margin:0">Breakfast</h3>
              <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">Chai, mandazi, uji, omelette, from 5am</p>
            </div>
          </a>
          <a href="/menu" class="dish-card-media" style="aspect-ratio:3/2; position:relative; display:flex; align-items:flex-end; text-decoration:none">
            <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=75" alt="Drinks" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.7">
            <div style="position:relative;z-index:1;padding:24px">
              <span class="eyebrow" style="color:#fff">7 drinks</span>
              <h3 style="color:#fff;font-size:1.5rem;margin:0">Drinks & Coffee</h3>
              <p style="color:rgba(255,255,255,0.85);margin:4px 0 0">Kenyan AA, tangawizi, passion, mango lassi</p>
            </div>
          </a>
        </div>
      </div>
    </section>
    <section>
      <div class="wrap">
        <div class="section-head">
          <h2>What guests say</h2>
        </div>
        <div class="grid grid-3">
          <div class="dish-card">
            <div class="dish-card-body">
              <p class="dish-card-desc" style="font-style:italic;font-size:1rem;line-height:1.6;color:var(--ink-2)">"The chicken was proper kienyeji. The managu tasted like someone had actually remembered where vegetables come from, and the brown ugali was spot on."</p>
              <div class="post-meta" style="margin-top:12px">Andrea, Facebook review</div>
            </div>
          </div>
          <div class="dish-card">
            <div class="dish-card-body">
              <p class="dish-card-desc" style="font-style:italic;font-size:1rem;line-height:1.6;color:var(--ink-2)">"Their pilau ya kuku is proper. Not the rushed kind. You can taste the whole spice and the rice is the right colour. I come back every Friday."</p>
              <div class="post-meta" style="margin-top:12px">Faith, TikTok review</div>
            </div>
          </div>
          <div class="dish-card">
            <div class="dish-card-body">
              <p class="dish-card-desc" style="font-style:italic;font-size:1rem;line-height:1.6;color:var(--ink-2)">"Afrikaana is the only place in Eldoret I trust for nyama choma at night. The service is fast, the meat is always fresh, and they never close."</p>
              <div class="post-meta" style="margin-top:12px">Kevin, Google review</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section>
      <div class="wrap">
        <div class="section-head">
          <h2>What people come back for</h2>
          <a href="/menu" class="head-link">Full menu &rarr;</a>
        </div>
        <div class="dish-grid">
          <div class="dish-card">
            <a href="/dish?id=pilau-ya-kuku" class="dish-card-media"><img src="https://images.unsplash.com/photo-1634324092536-74480096b939?w=800&q=75" alt="Pilau ya Kuku" loading="lazy"></a>
            <div class="dish-card-body">
              <div class="dish-card-top"><h3 class="dish-card-title"><a href="/dish?id=pilau-ya-kuku">Pilau ya Kuku</a></h3><span class="dish-price">KES 750</span></div>
              <p class="dish-card-desc">Spiced rice cooked with chicken, served with kachumbari. The plate people come back for.</p>
              <div class="dish-card-foot"><div class="tags"><span class="tag tag-ochre">Chef's Pick</span><span class="tag tag-ochre">Popular</span></div><a href="/dish?id=pilau-ya-kuku" class="btn btn-outline btn-sm">View</a></div>
            </div>
          </div>
          <div class="dish-card">
            <a href="/dish?id=nyama-choma-ngombe" class="dish-card-media"><img src="https://images.unsplash.com/photo-1708615017161-2eff302d0389?w=800&q=75" alt="Nyama Choma" loading="lazy"></a>
            <div class="dish-card-body">
              <div class="dish-card-top"><h3 class="dish-card-title"><a href="/dish?id=nyama-choma-ngombe">Nyama Choma ya Ng'ombe</a></h3><span class="dish-price">KES 950</span></div>
              <p class="dish-card-desc">Half kilo of beef ribs grilled over charcoal. Served with ugali and kachumbari.</p>
              <div class="dish-card-foot"><div class="tags"><span class="tag tag-ochre">Popular</span></div><a href="/dish?id=nyama-choma-ngombe" class="btn btn-outline btn-sm">View</a></div>
            </div>
          </div>
          <div class="dish-card">
            <a href="/dish?id=samaki-kupaka" class="dish-card-media"><img src="https://images.unsplash.com/photo-1665401015549-712c0dc5ef85?w=800&q=75" alt="Samaki wa Kupaka" loading="lazy"></a>
            <div class="dish-card-body">
              <div class="dish-card-top"><h3 class="dish-card-title"><a href="/dish?id=samaki-kupaka">Samaki wa Kupaka</a></h3><span class="dish-price">KES 1,250</span></div>
              <p class="dish-card-desc">Whole tilapia grilled, finished in coconut and tamarind sauce. Order it if you have time.</p>
              <div class="dish-card-foot"><div class="tags"><span class="tag tag-ochre">Chef's Pick</span></div><a href="/dish?id=samaki-kupaka" class="btn btn-outline btn-sm">View</a></div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section>
      <div class="wrap">
        <div class="section-head">
          <h2>From the journal</h2>
          <a href="/journal" class="head-link">All posts &rarr;</a>
        </div>
        <div class="grid grid-3">
          <div class="dish-card">
            <a href="/journal-post?id=how-we-cook-pilau" class="dish-card-media"><img src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=75" alt="How we cook pilau" loading="lazy"></a>
            <div class="dish-card-body">
              <div class="post-meta">14 August 2026 | Kitchen</div>
              <h3><a href="/journal-post?id=how-we-cook-pilau">How we cook pilau, and why we never rush it</a></h3>
              <p class="dish-card-desc">The rice goes in dry and browns in the oil before a drop of water touches it.</p>
            </div>
          </div>
          <div class="dish-card">
            <a href="/journal-post?id=kienyeji-matters" class="dish-card-media"><img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=75" alt="Kienyeji chicken" loading="lazy"></a>
            <div class="dish-card-body">
              <div class="post-meta">28 July 2026 | Sourcing</div>
              <h3><a href="/journal-post?id=kienyeji-matters">Kienyeji chicken is tougher. That is the point.</a></h3>
              <p class="dish-card-desc">Free-range chicken takes longer to cook and costs more. People order it anyway.</p>
            </div>
          </div>
          <div class="dish-card">
            <a href="/journal-post?id=market-mornings" class="dish-card-media"><img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=75" alt="Market mornings" loading="lazy"></a>
            <div class="dish-card-body">
              <div class="post-meta">5 July 2026 | Sourcing</div>
              <h3><a href="/journal-post?id=market-mornings">Market mornings: what we buy and when</a></h3>
              <p class="dish-card-desc">Sukuma wiki, managu, tomatoes and avocado come in before six.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="cta-band">
      <div class="wrap">
        <h2>Catering for your next event</h2>
        <p>Weddings, ruracio, corporate lunches, conferences. From 10 to 1,000 guests, cooked and served by our team.</p>
        <div style="margin-top:20px; display:flex;gap:12px;flex-wrap:wrap">
          <a href="/catering" class="btn btn-primary">See packages</a>
          <a href="/contact" class="btn btn-outline">Get a quote</a>
        </div>
      </div>
    </section>""",
)

###############################################################################
#  2. Menu
###############################################################################

cats_html = "\n".join(
    f'<button class="cat-tab" data-cat="{c["id"]}" aria-pressed="{"true" if i==0 else "false"}">{c["name"]}</button>'
    for i, c in enumerate(
        [
            {"id": "", "name": "All"},
            {"id": "breakfast", "name": "Breakfast"},
            {"id": "swahili", "name": "Swahili Dishes"},
            {"id": "grills", "name": "Grills & Nyama Choma"},
            {"id": "rice", "name": "Rice & Pilau"},
            {"id": "vegetarian", "name": "Vegetarian"},
            {"id": "snacks", "name": "Snacks & Sides"},
            {"id": "desserts", "name": "Desserts"},
            {"id": "drinks", "name": "Drinks & Coffee"},
        ]
    )
)

menu = build(
    "/menu",
    "Menu | Afrikaana Restaurant, Eldoret",
    "Full menu at Afrikaana Eldoret. Swahili dishes, nyama choma, pilau, breakfast, vegetarian options, desserts and drinks. All halal.",
    "menu",
    """<section>
      <div class="wrap">
        <div class="page-head">
          <h1>The menu</h1>
          <p>Everything cooked to order. If a dish runs out, we make more or we tell you honestly.</p>
        </div>
        <div class="dish-grid" style="margin-bottom: 32px">
          <div class="dish-card" style="border-color: var(--ochre); background: linear-gradient(135deg, #fcfaf7 0%, #fef7ed 100%)">
            <div class="dish-card-body">
              <div class="dish-card-top"><h3 class="dish-card-title"><a href="/dish?id=pilau-ya-kuku">Pilau ya Kuku</a></h3><span class="dish-price">KES 750</span></div>
              <p class="dish-card-desc">The plate people come back for. Rice browned with whole spice, cooked with chicken, kachumbari on the side.</p>
              <div class="tags"><span class="tag tag-ochre">Most ordered</span></div>
            </div>
          </div>
          <div class="dish-card" style="border-color: var(--ochre); background: linear-gradient(135deg, #fcfaf7 0%, #fef7ed 100%)">
            <div class="dish-card-body">
              <div class="dish-card-top"><h3 class="dish-card-title"><a href="/dish?id=mbuzi-choma">Mbuzi Choma</a></h3><span class="dish-price">KES 1,050</span></div>
              <p class="dish-card-desc">Goat on the bone, salted and grilled over charcoal. The Friday evening standard.</p>
              <div class="tags"><span class="tag tag-ochre">Weekend favourite</span></div>
            </div>
          </div>
          <div class="dish-card" style="border-color: var(--ochre); background: linear-gradient(135deg, #fcfaf7 0%, #fef7ed 100%)">
            <div class="dish-card-body">
              <div class="dish-card-top"><h3 class="dish-card-title"><a href="/dish?id=samaki-kupaka">Samaki wa Kupaka</a></h3><span class="dish-price">KES 1,250</span></div>
              <p class="dish-card-desc">Whole tilapia grilled then finished in coconut and tamarind sauce. Take your time with this one.</p>
              <div class="tags"><span class="tag tag-ochre">Chef's pick</span></div>
            </div>
          </div>
        </div>
        <div class="menu-controls">
          <div class="cat-tabs">{cats}</div>
          <div class="search-field">
            <input type="text" id="menu-search" placeholder="Search dishes..." aria-label="Search dishes">
          </div>
        </div>
        <div id="dish-container"></div>
      </div>
    </section>""".replace(
        "{cats}", cats_html
    ),
)

###############################################################################
#  3. Dish detail
###############################################################################

dish_page = build(
    "/dish",
    "Dish | Afrikaana",
    "Dish detail at Afrikaana Restaurant, Eldoret.",
    "dish",
    """<section>
      <div class="wrap">
        <div id="dish-page"></div>
      </div>
    </section>
    <section class="tight">
      <div class="wrap">
        <div class="section-head"><h2>You might also like</h2></div>
        <div id="related-dishes"></div>
      </div>
    </section>""",
)

###############################################################################
#  4-15: Remaining pages (category, catering, about, etc.)
###############################################################################

def cater_detail():
    cards = [
        ("corporate-lunch", "Corporate Lunch", "20 to 150 guests", "From KES 750 per head",
         "Single-portion lunch boxes delivered to your office, on a schedule you set.",
         "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&q=75"),
        ("wedding", "Wedding & Ruracio", "150 to 600 guests", "From KES 1,100 per head",
         "Full buffet service for weddings, ruracio and dowry ceremonies.",
         "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=75"),
        ("small-gathering", "Small Gathering", "10 to 40 guests", "From KES 650 per head",
         "Birthdays, send-offs, baby showers and family lunches.",
         "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=75"),
        ("full-event", "Full Event Catering", "50 to 1,000 guests", "Quoted per event",
         "Conferences, launches, church events and multi-day functions.",
         "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=75"),
    ]
    items = ""
    for pid, name, guests, price, summary, img in cards:
        items += (
            f'<div class="dish-card">'
            f'<a href="/catering-package?id={pid}" class="dish-card-media"><img src="{img}" alt="{name}" loading="lazy"></a>'
            f'<div class="dish-card-body">'
            f'<div class="dish-card-top"><h3 class="dish-card-title"><a href="/catering-package?id={pid}">{name}</a></h3></div>'
            f'<p class="dish-card-desc">{summary}</p>'
            f'<table class="spec-table"><tbody><tr><th>Guests</th><td>{guests}</td></tr><tr><th>Price</th><td>{price}</td></tr></tbody></table>'
            f'</div></div>'
        )
    return items


catering = build(
    "/catering",
    "Catering & Events | Afrikaana, Eldoret",
    "Catering for weddings, corporate events, ruracio and parties in Eldoret. From 10 to 1,000 guests. Full buffet and delivery.",
    "home",
    """<section>
      <div class="wrap">
        <div class="page-head">
          <h1>Catering & Events</h1>
          <p>Weddings, ruracio, corporate lunches, birthdays. We cook for any number from ten to a thousand. Every package includes serving staff, equipment and delivery inside Eldoret.</p>
        </div>
        <div class="grid grid-2">{cards}</div>
        <div style="text-align:center;margin-top:40px;padding:36px;background:var(--paper);border:1px solid var(--line)">
          <h3 style="margin-bottom:8px">Not sure what you need?</h3>
          <p class="muted">Call us or send a WhatsApp. We will talk you through it and quote the same day.</p>
          <a href="/contact" class="btn btn-primary" style="margin-top:12px">Get in touch</a>
        </div>
      </div>
    </section>""".replace(
        "{cards}", cater_detail()
    ),
)

about = build(
    "/about",
    "About | Afrikaana Restaurant, Eldoret",
    "Afrikaana is a multi-cuisine restaurant in Eldoret CBD, open 24 hours. Three branches, 1,000+ plates daily, Kenyan and Swahili dishes.",
    "home",
    """<section>
      <div class="wrap">
        <div class="page-head">
          <span class="eyebrow">Our story</span>
          <h1>About Afrikaana</h1>
        </div>
        <div class="split">
          <div class="prose">
            <p>Afrikaana opened in Eldoret CBD with a straight idea: cook the food people actually want to eat, keep the kitchen open when other places close, and charge enough to use proper ingredients without making the price a barrier.</p>
            <p>We started with one branch at Kabiyet House on Oginga Odinga Street. The grill was lit from day one, the pilau pot has not been cold since, and the menu grew as customers asked for things. When the night trade picked up, we stayed open. When the lunch crowd doubled, we opened a second branch. When the bus station needed somewhere to eat at three in the morning, we opened a third.</p>
            <p>The kitchen runs three shifts. The market greens come in before six. The chicken is free-range because the farmed kind does not taste of anything. The pilau is browned in the pot before any water touches it. These are not secrets and they are not innovations. They are just the way the food tastes right.</p>
            <div class="stat-row" style="margin-top:32px">
              <div class="stat"><div class="n">1,000+</div><div class="l">Plates daily</div></div>
              <div class="stat"><div class="n">3</div><div class="l">Branches</div></div>
              <div class="stat"><div class="n">24/7</div><div class="l">Open</div></div>
              <div class="stat"><div class="n">3+</div><div class="l">Years</div></div>
            </div>
          </div>
          <div class="panel panel-sticky">
            <h3>Quick facts</h3>
            <table class="spec-table"><tbody>
              <tr><th>Type</th><td>Multi-cuisine restaurant</td></tr>
              <tr><th>Cuisine</th><td>Kenyan, Swahili, grill</td></tr>
              <tr><th>Halal</th><td>All meat halal certified</td></tr>
              <tr><th>Hours</th><td>24 hours, 7 days</td></tr>
              <tr><th>Delivery</th><td>Inside Eldoret town</td></tr>
              <tr><th>Catering</th><td>10 to 1,000 guests</td></tr>
              <tr><th>Payment</th><td>M-Pesa, cash, card</td></tr>
            </tbody></table>
            <p style="margin-top:16px"><a href="/team">Meet the team &rarr;</a></p>
          </div>
        </div>
        <div style="margin-top:48px">
          <div class="grid grid-3">
            <div class="info-block">
              <h3>Honest cooking</h3>
              <p>No shortcuts, no pre-made sauces, no frozen stock. The pilau is browned in the pot. The chapati are rolled by hand. The chicken is free-range because it tastes better that way.</p>
            </div>
            <div class="info-block">
              <h3>Rooted in Eldoret</h3>
              <p>We buy from Eldoret market every morning. We know the farmers by name. We hire from the town and train inside the kitchen. When the community grows, we grow with it.</p>
            </div>
            <div class="info-block">
              <h3>Always open</h3>
              <p>Not just a line on the door. Nurses coming off a night shift, drivers arriving at 3am, students finishing late. Somebody needs to be open, and that somebody is us.</p>
            </div>
          </div>
        </div>
      </div>
    </section>""",
)

gallery = build(
    "/gallery",
    "Gallery | Afrikaana, Eldoret",
    "Photos of Afrikaana Restaurant in Eldoret. Interior, dishes, the grill and the dining room.",
    "home",
    """<section>
      <div class="wrap">
        <div class="page-head">
          <h1>Gallery</h1>
        </div>
        <div class="menu-controls" style="margin-bottom:24px">
          <div class="cat-tabs">
            <button class="cat-tab" aria-pressed="true" onclick="
              document.querySelectorAll('.gallery-item').forEach(function(i){i.style.display=''});
              document.querySelectorAll('.cat-tab').forEach(function(t){t.setAttribute('aria-pressed','false')});
              this.setAttribute('aria-pressed','true');
            ">All</button>
            <button class="cat-tab" aria-pressed="false" onclick="
              document.querySelectorAll('.gallery-item').forEach(function(i){i.style.display=i.dataset.cat==='interior'?'':'none'});
              document.querySelectorAll('.cat-tab').forEach(function(t){t.setAttribute('aria-pressed','false')});
              this.setAttribute('aria-pressed','true');
            ">The Dining Room</button>
            <button class="cat-tab" aria-pressed="false" onclick="
              document.querySelectorAll('.gallery-item').forEach(function(i){i.style.display=i.dataset.cat==='dishes'?'':'none'});
              document.querySelectorAll('.cat-tab').forEach(function(t){t.setAttribute('aria-pressed','false')});
              this.setAttribute('aria-pressed','true');
            ">Dishes & Plates</button>
            <button class="cat-tab" aria-pressed="false" onclick="
              document.querySelectorAll('.gallery-item').forEach(function(i){i.style.display=i.dataset.cat==='events'?'':'none'});
              document.querySelectorAll('.cat-tab').forEach(function(t){t.setAttribute('aria-pressed','false')});
              this.setAttribute('aria-pressed','true');
            ">Events & Catering</button>
          </div>
        </div>
        <div class="gallery-grid">
          <button class="gallery-item" data-cat="interior" data-src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80" data-alt="The dining room"><img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=75" alt="The dining room" loading="lazy"></button>
          <button class="gallery-item" data-cat="interior" data-src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80" data-alt="Main service counter"><img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=75" alt="Main service counter" loading="lazy"></button>
          <button class="gallery-item" data-cat="interior" data-src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80" data-alt="Evening seating"><img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=75" alt="Evening seating" loading="lazy"></button>
          <button class="gallery-item" data-cat="dishes" data-src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&q=80" data-alt="Pilau pot"><img src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=75" alt="Pilau pot" loading="lazy"></button>
          <button class="gallery-item" data-cat="dishes" data-src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80" data-alt="Nyama choma on the grill"><img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=75" alt="Nyama choma on the grill" loading="lazy"></button>
          <button class="gallery-item" data-cat="dishes" data-src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80" data-alt="Kuku kienyeji"><img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=75" alt="Kuku kienyeji" loading="lazy"></button>
          <button class="gallery-item" data-cat="dishes" data-src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=80" data-alt="Greens from the market"><img src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=75" alt="Greens from the market" loading="lazy"></button>
          <button class="gallery-item" data-cat="events" data-src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=80" data-alt="Breakfast service"><img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=75" alt="Breakfast service" loading="lazy"></button>
          <button class="gallery-item" data-cat="events" data-src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80" data-alt="Catering setup"><img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=75" alt="Catering setup" loading="lazy"></button>
        </div>
      </div>
    </section>
    <div class="lightbox">
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <img src="" alt="">
    </div>""",
)

journal = build(
    "/journal",
    "Journal | Afrikaana, Eldoret",
    "Stories from the kitchen at Afrikaana Eldoret. How we cook, where we source, what halal means in our kitchen.",
    "journal",
    """<section>
      <div class="wrap">
        <div class="page-head">
          <h1>Journal</h1>
          <p>Stories from the kitchen. How we cook, where we buy, and what it takes to run a kitchen that never closes.</p>
        </div>
        <div id="post-list" class="post-list"></div>
      </div>
    </section>""",
)

contact = build(
    "/contact",
    "Contact & Reserve | Afrikaana, Eldoret",
    "Contact Afrikaana Restaurant in Eldoret. Book a table, order delivery, or enquire about catering. Branches on Oginga Odinga Street, Kenyatta Street and Uganda Road.",
    "home",
    """<section>
      <div class="wrap">
        <div class="page-head">
          <h1>Contact & Reserve</h1>
          <p>Book a table, ask about catering, or just say hello. Your message goes straight to our WhatsApp.</p>
        </div>
        <div class="split">
          <div>
            <form id="contact-form" class="panel">
              <div class="form-grid">
                <div class="field"><label for="name">Full name</label><input type="text" id="name" name="name" required></div>
                <div class="field"><label for="phone">Phone number</label><input type="tel" id="phone" name="phone" required></div>
              </div>
              <div class="field"><label for="subject">Subject</label>
                <select id="subject" name="subject">
                  <option>Book a table</option><option>Order delivery</option><option>Catering enquiry</option><option>General</option>
                </select>
              </div>
              <div class="field"><label for="message">Message</label><textarea id="message" name="message" required></textarea></div>
              <button class="btn btn-primary btn-block" type="submit">Send via WhatsApp</button>
            </form>
          </div>
          <div>
            <div class="panel" style="margin-bottom:16px">
              <h3>Kabiyet House (Main)</h3>
              <p class="muted">Oginga Odinga Street, opposite Equity Main Branch, Eldoret CBD. Open 24 hours.</p>
              <a href="https://maps.google.com/?q=Oginga+Odinga+Street+Eldoret" target="_blank" rel="noopener" class="btn btn-outline btn-sm">Get directions</a>
            </div>
            <div class="panel" style="margin-bottom:16px">
              <h3>Kenya Street</h3>
              <p class="muted">Off Kenyatta Street, behind Fims Building, Eldoret CBD. 6am to 11pm.</p>
              <a href="https://maps.google.com/?q=Kenyatta+Street+Eldoret" target="_blank" rel="noopener" class="btn btn-outline btn-sm">Get directions</a>
            </div>
            <div class="panel">
              <h3>Uganda Road</h3>
              <p class="muted">Near Easy Coach stage, Uganda Road, Eldoret. Open 24 hours.</p>
              <a href="https://maps.google.com/?q=Uganda+Road+Eldoret" target="_blank" rel="noopener" class="btn btn-outline btn-sm">Get directions</a>
            </div>
          </div>
        </div>
      </div>
    </section>""",
)

# Remaining pages (12-20) — simpler, static content pages
order = build(
    "/order", "Your Order | Afrikaana", "Review your order at Afrikaana Eldoret.",
    "order",
    """<section><div class="wrap"><div class="page-head"><h1>Your order</h1></div>
      <div id="order-table"></div>
      <div class="totals" style="margin-top:20px">
        <div class="totals-row"><span>Subtotal</span><span id="order-subtotal">KES 0</span></div>
        <div class="totals-row grand"><span>Total</span><span id="order-total">KES 0</span></div>
      </div>
      <div style="margin-top: 28px">
        <a href="/checkout" class="btn btn-primary">Proceed to checkout</a>
      </div>
    </div></section>""",
)

checkout = build(
    "/checkout", "Complete Order | Afrikaana", "Complete your order at Afrikaana Eldoret.",
    "checkout",
    """<section><div class="wrap"><div class="page-head"><h1>Complete your order</h1></div>
      <div class="split">
        <div>
          <form id="checkout-form" class="panel">
            <div class="form-grid">
              <div class="field"><label for="name">Full name</label><input type="text" id="name" name="name" required></div>
              <div class="field"><label for="phone">Phone number</label><input type="tel" id="phone" name="phone" required></div>
            </div>
            <div class="field"><label for="when">Pickup time</label><input type="text" id="when" name="when" placeholder="e.g. 7:30pm" required></div>
            <div class="field"><label>Method</label>
              <div class="choice-set">
                <label class="choice"><input type="radio" name="pickup" value="Pickup" checked><div class="choice-body"><strong>Pickup</strong><span>Collect at the counter</span></div></label>
                <label class="choice"><input type="radio" name="pickup" value="Delivery"><div class="choice-body"><strong>Delivery</strong><span>Delivery fee applies outside CBD</span></div></label>
              </div>
            </div>
            <div class="field"><label for="notes">Special instructions</label><textarea id="notes" name="notes"></textarea></div>
            <p class="field-hint" style="margin-bottom:18px">Payment: M-Pesa, cash or card at pickup. You are not charged through this form.</p>
            <button class="btn btn-primary btn-block" type="submit">Send order via WhatsApp</button>
          </form>
          <div id="checkout-confirm" style="display:none; text-align:center; padding:40px 0">
            <h2>Your order has been sent</h2>
            <p class="lede">Check your WhatsApp. Our team will confirm within a few minutes.</p>
            <a href="/menu" class="btn btn-primary">Back to menu</a>
          </div>
        </div>
        <div class="panel">
          <h3>Order summary</h3>
          <div id="checkout-summary"></div>
        </div>
      </div>
    </div></section>""",
)

simple_pages = [
    ("category", "category", "Category | Afrikaana", "Browse menu category at Afrikaana.", "<section><div class=\"wrap\"><div class=\"page-head\"><h1 id=\"cat-heading\"></h1></div><div id=\"dish-container\"></div></div></section>"),
    ("catering-package", "catering-package", "Catering Package | Afrikaana", "Catering package details.", "<section><div class=\"wrap\"><div id=\"package-page\"></div></div></section>"),
    ("journal-post", "journal-post", "Post | Afrikaana Journal", "Journal post.", "<section><div class=\"wrap\"><div id=\"journal-post-page\"></div></div></section>"),
    ("team", "team", "Our Team | Afrikaana", "Meet the team at Afrikaana Eldoret.", "<section><div class=\"wrap\"><div class=\"page-head\"><h1>Our team</h1><p>The people who run the kitchen, the grill and the dining room.</p></div><div id=\"team-grid\"></div></div></section>"),
    ("branches", "branches", "Branches | Afrikaana", "All Afrikaana branches in Eldoret.", "<section><div class=\"wrap\"><div class=\"page-head\"><h1>Our branches</h1><p>Three locations across Eldoret town. Two are open around the clock.</p></div><div id=\"branches-grid\"></div></div></section>"),
    ("visit", "home", "Visit Us | Afrikaana", "Directions and parking at Afrikaana Eldoret.", "<section><div class=\"wrap\"><div class=\"page-head\"><h1>Visit us</h1></div><div class=\"prose\"><h2>Kabiyet House (Main branch)</h2><p>Kabiyet House, Oginga Odinga Street, opposite Equity Main Branch, Eldoret CBD.</p><p>Street parking available along Oginga Odinga Street. At peak lunch hours it fills up, so give yourself a few extra minutes. The matatu stage on Oginga Odinga is a two-minute walk.</p><h2>Kenya Street</h2><p>Off Kenyatta Street, behind Fims Building, Eldoret CBD. Open 6am to 11pm. Closest to the matatu stage. Good for a quick plate and takeaway.</p><h2>Uganda Road</h2><p>Uganda Road, near the Easy Coach stage. Open 24 hours. Busy with travellers through the night.</p></div></div></section>"),
    ("faq", "faq", "FAQ | Afrikaana", "Frequently asked questions about Afrikaana Eldoret.", "<section><div class=\"wrap\"><div class=\"page-head\"><h1>FAQ</h1></div><div id=\"faq-list\"></div></div></section>"),
    ("allergens", "allergens", "Allergens Guide | Afrikaana", "Allergen information for Afrikaana menu.", "<section><div class=\"wrap\"><div class=\"page-head\"><h1>Allergens guide</h1></div><p class=\"lede\" style=\"margin-bottom:24px\">This is a guide, not a guarantee. Our kitchen handles wheat, milk, eggs, nuts, fish and soy, so we cannot rule out cross contact. If you have a serious allergy, tell us when you order.</p><table class=\"spec-table\" id=\"allergen-table\"></table></div></section>"),
    ("privacy", "home", "Privacy | Afrikaana", "Privacy policy.", "<section><div class=\"wrap\"><div class=\"page-head\"><h1>Privacy</h1></div><div class=\"prose\"><p>This website collects only the information you enter into the contact and checkout forms: your name, phone number and message. That information is sent directly to our WhatsApp and is not stored on a server, tracked with analytics or shared with any third party.</p><p>Our website is static and does not use cookies or tracking scripts of any kind. There is no login, no account and no persistent storage of your data beyond what you choose to send us via WhatsApp.</p><p>If you have questions, reach us through the <a href=\"/contact\">contact page</a>.</p></div></div></section>"),
    ("terms", "home", "Terms | Afrikaana", "Terms of service.", "<section><div class=\"wrap\"><div class=\"page-head\"><h1>Terms of service</h1></div><div class=\"prose\"><p>By placing an order through this website, you agree that the order is a request for food which Afrikaana may confirm or decline. Prices are in Kenyan shillings and may change without notice. Delivery is available inside Eldoret town; delivery outside the CBD may attract an additional charge communicated before dispatch.</p><p>Catering bookings require a deposit to hold the date. Cancellations made more than 72 hours before the event receive a full refund of the deposit. Cancellations inside 72 hours forfeit the deposit.</p><p>Afrikaana is not responsible for delays caused by traffic, weather or conditions beyond our control. We will always communicate honestly about your order status.</p></div></div></section>"),
    ("404", "home", "Page not found | Afrikaana", "404 page not found.", "<section><div class=\"wrap\" style=\"text-align:center;padding:80px 0\"><div style=\"font-family:var(--font-display);font-size:6rem;font-weight:700;line-height:1;margin-bottom:1rem;color:var(--clay)\">404</div><h1>Page not found</h1><p class=\"lede\" style=\"margin:0 auto\">The page you are looking for does not exist. It may have been moved or the address may be wrong.</p><div style=\"display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:28px\"><a href=\"/\" class=\"btn btn-primary\">Home</a><a href=\"/menu\" class=\"btn btn-outline\">Menu</a><a href=\"/contact\" class=\"btn btn-outline\">Contact</a></div></div></section>"),
]

###############################################################################
#  Generate all files
###############################################################################

pages = [
    ("index.html", home),
    ("menu/index.html", menu),
    ("dish/index.html", dish_page),
    ("order/index.html", order),
    ("checkout/index.html", checkout),
    ("catering/index.html", catering),
    ("about/index.html", about),
    ("gallery/index.html", gallery),
    ("journal/index.html", journal),
    ("contact/index.html", contact),
]

for name, html in pages:
    p = save(name.split("/"), html)
    print(f"  {name}")

for slug, page_type, title, desc, content in simple_pages:
    fn = f"{slug}/index.html"
    html = build(
        f"/{slug}",
        title,
        desc,
        page_type,
        content,
    )
    p = save(fn.split("/"), html)
    print(f"  {fn}")

print(f"\nGenerated {len(pages) + len(simple_pages)} pages.")