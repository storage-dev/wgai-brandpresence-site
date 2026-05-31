/*
 * presence-os.config.js — per-site measurement IDs for WadeGlobal AI.
 *
 * This is the ONLY file you edit to switch the numbers on. presence-os.js stays
 * byte-identical across every static site so the layer is "built once." Each id
 * is optional — its tag no-ops until set, so the site ships safe with blanks.
 *
 *   ga4Id              "G-XXXXXXXXXX"  analytics.google.com → Admin → Data Streams → Web
 *   gtmId              "GTM-XXXXXX"    tagmanager.google.com (optional)
 *   cfToken            beacon token    dash.cloudflare.com → Web Analytics (ungated)
 *   clarityId          project id      clarity.microsoft.com (heatmaps + recording)
 *   fbPixelId          pixel id        business.facebook.com → Events Manager
 *   linkedinPartnerId  partner id      linkedin.com/campaignmanager → Insight Tag
 *   chatWidgetId       embed id        GHL/LeadConnector chat widget (set showChatWidget true)
 */
window.PRESENCE_OS_CONFIG = {
  ga4Id: "",
  gtmId: "",
  cfToken: "",
  clarityId: "",
  fbPixelId: "",
  linkedinPartnerId: "",
  chatWidgetId: "",
  showChatWidget: false,
  showCookieBanner: true,
};
