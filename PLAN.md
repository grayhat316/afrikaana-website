# Afrikaana Restaurant — Site Architecture

## Brand truth (from research)

- **Name:** Afrikaana Restaurant (also seen as Afrikana)
- **What:** Multi-cuisine Kenyan/Swahili restaurant, 24-hour operation
- **Scale:** 8,000+ customers daily, 3 branches, does deliveries
- **Primary location:** Kabiyet House, opposite Equity Main branch, Oginga Odinga Street, Eldoret CBD
- **Food identity:** "Proper kienyeji chicken," managu, brown ugali, Swahili meals, breakfast
- **Photos:** Available on TikTok, Facebook, Instagram, Evendo (real restaurant shots)
- **Rating:** 4.2 (21 reviews on Evendo)

## Color palette

| Token | Hex | Role |
|---|---|---|
| White/Warm | #FCFAF7 | Page background |
| Ink/Black | #1A1714 | Primary text, footer |
| Gold | #BF8B2A | Accent, buttons, prices |
| Earth/Chocolate | #5C3A21 | Secondary accent, hover states |
| Clay | #8B4513 | Minor accent, badges |
| Stone | #6B6259 | Muted text |
| Line | #D9D0C1 | Borders, rules |

## Typography

- **Display:** Bitter (Google Fonts, slab serif) — warm, editorial, non-AI default
- **Body:** Karla (Google Fonts, humanist sans) — clean, readable, warm
- **Mono:** IBM Plex Mono (Google Fonts) — prices, metadata, labels

## Photo strategy

- **Download** real photos from Facebook posts, TikTok screenshots, Evendo listing, Instagram
- Rename to descriptive filenames: `hero-exterior.jpg`, `interior-dining.jpg`, `pilau-kuku.jpg`, etc.
- Optimize: max 1920px wide, webp conversion, fallback jpg
- Store in `assets/img/`
- Hero images: full-width, slight darken overlay
- Dish photos: 4:3 aspect ratio, object-fit cover

## Navigation (7 links)

Home, Menu, Catering & Events, About, Gallery, Journal, Contact

Clean URLs only: /menu, /about, /catering — no .html extensions

## Complete page map (20 pages)

### Tier 1: Main pages (in nav)

| # | URL | Title | Content |
|---|---|---|---|
| 1 | / | Home | Hero with exterior shot. Eyebrow: "Eldoret, Kenya." h1: tagline. 4 fact stats (customers, branches, years, dishes). 3 featured dishes (cards). About snippet. Journal tease (2 latest posts). CTA to menu. |
| 2 | /menu | Full Menu | Category tabs (Breakfast, Swahili, Grills, Rice & Pilau, Vegetarian, Snacks, Desserts, Drinks). Search bar. 3-column dish grid. Each card: photo, name, price, short desc, tags (halal, spicy, vegan, chef-pick). Click card → /dish?id=pilau-ya-kuku |
| 3 | /catering | Catering & Events | Intro paragraph. 3-4 catering packages (Corporate Lunch, Wedding, Small Gathering, Full Event). Each: image, guest range, price range, included items. CTA to /contact for inquiry. |
| 4 | /about | About Us | Our story (paragraphs). Stat row (branches, daily covers, team size, years). Link to /team. Info blocks: Location, Hours, Contact. Instagram embed or link. |
| 5 | /gallery | Gallery | 3-column masonry grid. Lightbox on click. Sections: Interior, Dishes, Events. Real photos from social media. |
| 6 | /journal | Journal | List of posts (title, date, excerpt, thumbnail). 6 posts seeded. Each links → /journal-post?id= |
| 7 | /contact | Contact & Reserve | Contact form (name, email, phone, subject, message). Branch info cards (3 branches: addresses, phone, hours, map link). WhatsApp button. Social links. |

### Tier 2: Detail / product pages

| # | URL | Title | Content |
|---|---|---|---|
| 8 | /dish?id= | Dish Detail | Photo, name, price, full description. Specs table (category, spice level, prep time, allergens, serves). Quantity stepper. Add to order button. Tags. Back to menu link. Related dishes (3 cards). |
| 9 | /category?cat= | Category Browse | Same layout as menu but filtered to one category. Used when clicking category header on menu page. |
| 10 | /catering-package?id= | Package Detail | Full package breakdown. Per-head pricing, menu items, setup details, timeline. CTA to inquire. |
| 11 | /journal-post?id= | Journal Post | Full article with hero image. Body copy. Back to journal link. Related posts (2). |
| 12 | /team | Our Team | 4-6 team member cards (photo placeholder, name, role, short bio). Real names from social media if available. |
| 13 | /branches | All Branches | 3 branch cards with address, phone, hours, embedded static map image (Google Maps screenshot), directions link. |

### Tier 3: Commerce flow

| # | URL | Title | Content |
|---|---|---|---|
| 14 | /order | Your Order | Table of cart items (image, name, qty stepper, line price, remove). Empty state if cart empty. Subtotal, delivery/pickup selector, total. "Proceed" button → /checkout |
| 15 | /checkout | Complete Order | Order summary (read-only). Form: name, phone (required), email, pickup time, special instructions. Payment note ("Pay at pickup"). Confirm button sends formatted WhatsApp message to restaurant. Confirmation state. |

### Tier 4: Utility / legal

| # | URL | Title | Content |
|---|---|---|---|
| 16 | /visit | Visit Us | Directions, public transport info, parking info, area landmarks. One branch or all. |
| 17 | /faq | FAQ | Accordion: 10 questions (hours, reservations, halal, delivery, payment, dietary restrictions, parking, large groups, catering minimum, cancellation). |
| 18 | /allergens | Allergens Guide | Table: common allergens per category. Disclaimer. Link to contact for specific inquiries. |
| 19 | /privacy | Privacy Policy | Simple privacy statement. Data collected (contact form only). No tracking. No third-party sharing. |
| 20 | /404 | Page Not Found | Simple 404 with links to Home, Menu, Contact. Matches site design. |

## Shared components (every page)

- **Header:** Sticky, brand mark + name, 7 nav links with aria-current, cart icon with count badge, mobile hamburger → slide-out drawer
- **Footer:** Brand, description, quick links (Home, Menu, Catering, About, Contact), hours, social links, bottom bar with copyright and legal links
- **Cart:** Persistent localStorage-backed cart. Add/remove/update quantity. Cart count badge in header.
- **Toast:** Slide-up notification on add-to-cart ("Pilau ya Kuku added - View order →")
- **WhatsApp button:** Fixed bottom-right floating button

## JS modules

| File | Purpose |
|---|---|
| `assets/js/data.js` | Menu data (dishes, categories, prices, descriptions, tags, allergens, images), catering packages, journal posts, team, faqs, branches — all the mock data |
| `assets/js/main.js` | DOM ready, mobile nav drawer, scroll effects, lightbox, accordion, contact form, journal rendering, category filter, search, related dishes |
| `assets/js/cart.js` | Cart CRUD, localStorage persistence, badge update, toast, order table rendering, checkout form, WhatsApp message formatting |

## CSS (one file)

`assets/css/style.css` — already written (25KB, complete design system). No AI tells: zero em dashes, zero emojis, zero gradients, Bitter + Karla + IBM Plex Mono fonts, square-almost edges (2px radius max), editorial rules and hairline borders, warm earth palette.

## Anti-AI rules (rigid)

- No em dashes (use commas or periods)
- No emojis in copy
- No gradients
- No glassmorphism
- No purple/blue AI gradient
- No "unlock," "elevate," "revolutionize," "supercharge," "next-generation"
- Human, specific copy: real dish names, real street names, real Kenyan references
- Square to 2px border radius only
- Warm palette from the restaurant's actual identity (white, gold, chocolate, black)