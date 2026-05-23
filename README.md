# WGAI BPOS Site

This is a controlled static website for WadeGlobal AI built from the BrandPresenceOS / BPOS direction.

## Canonical Source

This folder is the only canonical WGAI BrandPresenceOS website renderer:

```text
/Users/wademoney/.openclaw/workspace/clients/WGAI/brandpresence-site
```

Do not create another WGAI BPOS / BrandPresenceOS website folder. New pages, resources, entity updates, AI-search files, and automation-facing website changes should be added here unless the project is formally migrated to a production framework.

Supporting docs such as `BPOS_DEPLOYMENT_REQUIREMENTS.md`, `WGAI_SITE_SOURCE_AUDIT_2026-05-22.md`, and the workspace-level `BRAND_PRESENCE_OS.md` are source and governance documents, not separate website implementations.

The site now positions WGAI as an operational infrastructure provider that installs governed AI operating systems for partner companies. It should not be treated as a generic AI agency, SaaS product, marketing shop, or chatbot-vendor site.

## Included

- Multi-page WGAI BPOS website
- WGAI tenant entity JSON
- SEO metadata
- sitemap.xml
- robots.txt
- llms.txt
- Organization schema on the homepage
- Company, markets, offers, sectors, deployment, governance, operating layers, AI tech, automation, AI-search, proof, intelligence scorecard, audit, resources, FAQ, and contact pages
- Proof claims policy JSON

## Local Preview

```bash
python3 -m http.server 4177
```

Open `http://localhost:4177`.

## Production Notes

Before cutover:

1. Wire the contact form to WGS/GHL.
2. Replace mailto fallback with the official assessment intake endpoint.
3. Add verified proof and case studies.
4. Connect analytics, conversion tracking, CRM health, automation health, and AI visibility monitoring to the scorecard.
5. Package WGAI Core proof first, then ACS and WADE proof grounds.
6. Confirm final social profile `sameAs` links.
7. Submit sitemap after deployment.
8. Confirm `https://wadeglobal.ai/llms.txt` returns 200.
