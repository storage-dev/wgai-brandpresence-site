# WadeGlobal AI — Operator Layer (Level 4)

Level 3 (the pipe) captures the lead. **Level 4 (the operator) follows it up** —
instant on-brand reply, team notification, hot/cold routing, and the handoff into
WGS/GHL. This folder holds the deployable scaffold; nothing is live until you wire
the endpoint, credentials, and activate it.

## How WGAI's lead flows (once activated)

The contact form (`contact/index.html`) is marked `data-lead-form`. The portable
Presence OS layer (`presence-os.js`) watches for its submit and, **when
`leadWebhookUrl` is set in `presence-os.config.js`**, POSTs the fields + first-touch
UTM as JSON straight to that endpoint. Until it's set, the form safely falls back
to its `mailto:` so nothing breaks. `lead_submit` fires either way (GA4 + dataLayer).

So the live flow is: **site form → n8n webhook → operator follow-up.** Direct, no
iframe in between.

## Data contract (what the site POSTs)

```json
{
  "name": "", "email": "", "phone": "", "company": "",
  "industry": "", "market_lane": "", "current_tools": "", "ai_usage": "",
  "need": "", "preferred_next_step": "", "bottleneck": "", "desired_result": "",
  "source": "wgai-bpos-site", "routing_lane": "assessment-intake",
  "page_url": "https://wadeglobal.ai/contact/",
  "submitted_at": "ISO-8601",
  "utm": { "utm_source": "", "utm_medium": "", "utm_campaign": "" }
}
```

Fields whose name starts with `_` (e.g. the `_company_hp` honeypot) are stripped
client-side and never sent.

## The scaffold: `wgai-lead-intake.n8n.json`

Webhook → Normalize + Score → spam gate → (Auto-reply to lead ∥ Notify team) →
WGS/GHL upsert/route TODO → Respond 200. All Gmail nodes keep
`options.appendAttribution = false` — **never** the "Sent with n8n" footer.

## Activate (when ready)

1. **Import** `wgai-lead-intake.n8n.json` into n8n at `n8n.wadeglobal.ai`.
2. Copy the production webhook URL (e.g. `https://n8n.wadeglobal.ai/webhook/wgai-lead-intake`).
3. Put it in **`presence-os.config.js → leadWebhookUrl`** and redeploy the site.
   The form now POSTs live to the operator.
4. **Set the Gmail credential** on both Gmail nodes (replace `TODO_GMAIL_CRED_ID`)
   — send from `admin@wadeglobal.ai` (branded sender per the inbox rule).
5. **Wire the WGS/GHL upsert** node: HTTP Request to the GHL contacts API; apply
   tags `source`, `routing_lane`, `market_lane`, `need`, `lead_temp`. Hot → sales
   pipeline + alert; cold → education nurture.
6. **Activate** and submit a real test lead end-to-end (check: auto-reply received,
   team notified, contact created, GA4 `lead_submit` fired).

## Notes

- CORS: the webhook must allow POST from `https://wadeglobal.ai`. n8n webhooks
  accept cross-origin POST by default; if you add a proxy, preserve that.
- Keep the auto-reply value-first (diagnose, don't pitch) per CPOS doctrine.
