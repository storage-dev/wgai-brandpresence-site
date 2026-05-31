# Presence OS — Level 2 (the numbers) on this static site

This static site carries the same Conversion Presence OS layer the Next.js
template ships in React — delivered here as one portable, framework-free script
so a static HTML site gets identical measurement without a build step.

## Files

- **`presence-os.js`** — the layer. Byte-identical across every static site
  (do not edit per-site). Loads Cloudflare Web Analytics (ungated) + GHL chat
  (ungated), consent-gates GA4/GTM/Clarity/FB/LinkedIn, captures first-touch
  UTM, exposes `window.presenceOS.fireConversion()`, injects an equal-weight
  Accept/Decline consent banner, and auto-fires conversions with zero per-page
  wiring.
- **`presence-os.config.js`** — the ONLY file you edit to switch the numbers on.
  Per-site measurement IDs. Each id is optional; its tag no-ops until set.

Both are injected before `</head>` on every page as:

```html
<script src="/presence-os.config.js"></script>
<script defer src="/presence-os.js"></script>
```

## Conversion events (taxonomy — matches the template)

Auto-fired (no wiring needed):
- `phone_click` — any `tel:` link
- `book_consultation` — booking links / `calendar` links / `[data-cta="book"]`
- `form_start` — first focus into any `<form>`
- `lead_submit` — any `<form>` submit (also fires Meta Pixel `Lead`)

Manual (call anywhere): `window.presenceOS.fireConversion("cta_click", {…})`

First-touch UTM is stored in `sessionStorage` and attached to `lead_submit`.

## To switch the numbers on

Edit `presence-os.config.js` with the brand's GA4 / Clarity / Cloudflare /
pixel IDs. Nothing else changes. Everything left blank stays a safe no-op.

## Privacy

Only cookie-less Cloudflare analytics + the support chat load before consent.
GA4, Clarity, and retargeting pixels stay off until a visitor clicks **Accept**.
Decline is a first-class, equal-weight choice.

> Note: the contact form currently posts to a placeholder `mailto:` (marked
> `data-production-endpoint-needed`). `lead_submit` still fires on submit, so the
> conversion is counted now; wiring the form to the real GHL/n8n endpoint is the
> Level 3 (conversion-pipe) task.
