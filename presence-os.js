/*!
 * ============================================================================
 * presence-os.js — Conversion Presence OS (Level 2 "the numbers"), portable.
 * ============================================================================
 * Framework-free measurement layer for STATIC sites. One <script> include gives
 * any HTML site the same level-2 spec the Next.js template ships in React:
 *
 *   • Cloudflare Web Analytics       — ungated (cookie-less, privacy-first)
 *   • GHL / LeadConnector chat       — ungated (support tool, not tracking)
 *   • GA4 / GTM / Clarity / FB / LI  — CONSENT-GATED (off until "Accept")
 *   • First-touch UTM capture        — sessionStorage, for attribution
 *   • Conversion events              — window.presenceOS.fireConversion(...)
 *   • Auto listeners (zero wiring)   — phone_click (tel:), book_consultation
 *                                      (booking links / [data-cta=book]),
 *                                      lead_submit (any <form> submit),
 *                                      form_start (first form-field focus)
 *   • Consent banner                 — injected, equal-weight Accept/Decline
 *
 * CONFIG: edit the CONFIG object below, OR set window.PRESENCE_OS_CONFIG = {...}
 * BEFORE this script loads to override per-deploy without editing the file.
 * Every id is OPTIONAL — each tag no-ops until its id is set, so this ships safe
 * with everything blank. Matches the template's namespacing so the spec is
 * identical across static + Next.js sites ("built once").
 * ============================================================================
 */
(function () {
  "use strict";

  var DEFAULTS = {
    ga4Id: "", // "G-XXXXXXXXXX"        — analytics.google.com → Data Streams
    gtmId: "", // "GTM-XXXXXX"          — tagmanager.google.com
    cfToken: "", // Cloudflare Web Analytics beacon token (ungated)
    clarityId: "", // clarity.microsoft.com project id
    fbPixelId: "", // Meta pixel id
    linkedinPartnerId: "", // LinkedIn Insight partner id
    chatWidgetId: "", // GHL/LeadConnector public chat-widget embed id
    showChatWidget: false,
    showCookieBanner: true,
    leadWebhookUrl: "", // Level 3 conversion pipe: real lead-intake endpoint (n8n/GHL). Blank = mailto fallback.
  };

  var CFG = Object.assign({}, DEFAULTS, window.PRESENCE_OS_CONFIG || {});

  var CONSENT_KEY = "presenceos-cookie-consent";
  var CONSENT_EVENT = "presenceos:cookie-consent";
  var UTM_KEY = "presenceos-utm";
  var UTM_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

  // ── helpers ────────────────────────────────────────────────────────────────
  function injectScript(attrs, inline) {
    var s = document.createElement("script");
    if (attrs) Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    if (inline) s.text = inline;
    document.head.appendChild(s);
    return s;
  }
  function getConsent() {
    try { return window.localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  // ── first-touch UTM capture ─────────────────────────────────────────────────
  function captureUtm() {
    try {
      if (window.sessionStorage.getItem(UTM_KEY)) return; // first-touch wins
      var params = new URLSearchParams(window.location.search);
      var found = {};
      UTM_FIELDS.forEach(function (f) { var v = params.get(f); if (v) found[f] = v; });
      if (Object.keys(found).length) window.sessionStorage.setItem(UTM_KEY, JSON.stringify(found));
    } catch (e) { /* never throw */ }
  }
  function getUtm() {
    try { return JSON.parse(window.sessionStorage.getItem(UTM_KEY) || "{}"); } catch (e) { return {}; }
  }

  // ── fireConversion ──────────────────────────────────────────────────────────
  function fireConversion(eventName, params) {
    params = params || {};
    try {
      if (typeof window.gtag === "function") window.gtag("event", eventName, params);
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: eventName }, params));
      if (typeof window.fbq === "function" &&
          (eventName === "lead_submit" || eventName === "book_consultation")) {
        window.fbq("track", "Lead", params);
      }
    } catch (e) { /* never break UX on a missing tag */ }
  }

  // ── ungated tags ────────────────────────────────────────────────────────────
  function loadUngated() {
    if (CFG.cfToken) {
      var cf = injectScript({
        src: "https://static.cloudflareinsights.com/beacon.min.js",
        defer: "defer",
        "data-cf-beacon": JSON.stringify({ token: CFG.cfToken }),
      });
      cf.async = true;
    }
    if (CFG.showChatWidget && CFG.chatWidgetId) {
      injectScript({
        src: "https://beta.leadconnectorhq.com/loader.js",
        "data-resources-url": "https://beta.leadconnectorhq.com/chat-widget/loader.js",
        "data-widget-id": CFG.chatWidgetId,
      });
    }
  }

  // ── consent-gated tags (load once, on accept) ───────────────────────────────
  var gatedLoaded = false;
  function loadGated() {
    if (gatedLoaded) return;
    gatedLoaded = true;

    if (CFG.ga4Id) {
      var g = injectScript({ src: "https://www.googletagmanager.com/gtag/js?id=" + CFG.ga4Id });
      g.async = true;
      injectScript(null,
        "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}" +
        "gtag('js',new Date());gtag('config','" + CFG.ga4Id + "',{anonymize_ip:true});");
    }
    if (CFG.gtmId) {
      injectScript(null,
        "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime()," +
        "event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s)," +
        "dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=" +
        "'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);" +
        "})(window,document,'script','dataLayer','" + CFG.gtmId + "');");
    }
    if (CFG.clarityId) {
      injectScript(null,
        "(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};" +
        "t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;" +
        "y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);" +
        "})(window,document,'clarity','script','" + CFG.clarityId + "');");
    }
    if (CFG.fbPixelId) {
      injectScript(null,
        "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?" +
        "n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;" +
        "n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;" +
        "t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}" +
        "(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');" +
        "fbq('init','" + CFG.fbPixelId + "');fbq('track','PageView');");
    }
    if (CFG.linkedinPartnerId) {
      injectScript(null,
        "_linkedin_partner_id='" + CFG.linkedinPartnerId + "';" +
        "window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];" +
        "window._linkedin_data_partner_ids.push(_linkedin_partner_id);(function(l){" +
        "if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}" +
        "var s=document.getElementsByTagName('script')[0];var b=document.createElement('script');" +
        "b.type='text/javascript';b.async=true;" +
        "b.src='https://snap.licdn.com/li.lms-analytics/insight.min.js';" +
        "s.parentNode.insertBefore(b,s);})(window.lintrk);");
    }
  }

  // ── consent banner ──────────────────────────────────────────────────────────
  function record(choice) {
    try { window.localStorage.setItem(CONSENT_KEY, choice); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice })); } catch (e) {}
    if (choice === "accepted") loadGated();
    var b = document.getElementById("presenceos-consent");
    if (b) b.parentNode.removeChild(b);
  }
  function showBanner() {
    if (!CFG.showCookieBanner || getConsent()) return;
    var wrap = document.createElement("div");
    wrap.id = "presenceos-consent";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Cookie consent");
    wrap.style.cssText =
      "position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:760px;" +
      "margin:0 auto;background:rgba(20,28,46,.97);color:#fff;border:1px solid rgba(200,162,75,.35);" +
      "border-radius:14px;padding:16px 20px;box-shadow:0 18px 50px rgba(0,0,0,.4);" +
      "font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;" +
      "display:flex;flex-wrap:wrap;align-items:center;gap:14px;";
    var p = document.createElement("p");
    p.style.cssText = "margin:0;flex:1 1 320px;color:rgba(255,255,255,.9);";
    p.textContent = "We use privacy-first analytics to understand what helps people take action. " +
      "Optional cookies (analytics & retargeting) only load if you accept.";
    var btns = document.createElement("div");
    btns.style.cssText = "display:flex;gap:10px;flex:0 0 auto;";
    function mk(label, primary, choice) {
      var el = document.createElement("button");
      el.type = "button";
      el.textContent = label;
      el.style.cssText = "cursor:pointer;border-radius:999px;padding:9px 20px;font-weight:700;" +
        "font-size:11px;letter-spacing:.08em;text-transform:uppercase;" +
        (primary
          ? "background:#C8A24B;color:#141c2e;border:0;"
          : "background:transparent;color:rgba(255,255,255,.85);border:1px solid rgba(200,162,75,.4);");
      el.addEventListener("click", function () { record(choice); });
      return el;
    }
    btns.appendChild(mk("Decline", false, "declined"));
    btns.appendChild(mk("Accept", true, "accepted"));
    wrap.appendChild(p);
    wrap.appendChild(btns);
    document.body.appendChild(wrap);
  }

  // ── global conversion listeners (zero per-page wiring) ──────────────────────
  function wireListeners() {
    document.addEventListener("click", function (e) {
      var t = e.target;
      var tel = t.closest && t.closest("a[href^='tel:']");
      if (tel) {
        fireConversion("phone_click", {
          phone: (tel.getAttribute("href") || "").replace("tel:", ""),
          page_url: window.location.href,
        });
        return;
      }
      var book = t.closest && t.closest("a[href*='widget/bookings/'],a[href*='calendar'],a[data-cta='book']");
      if (book) fireConversion("book_consultation", { page_url: window.location.href });
    }, true);

    // form_start on first focus into any form field
    var started = false;
    document.addEventListener("focusin", function (e) {
      if (started) return;
      if (e.target.closest && e.target.closest("form")) {
        started = true;
        fireConversion("form_start", { page_url: window.location.href });
      }
    }, true);

    // lead_submit on any form submit (mailto or real endpoint)
    document.addEventListener("submit", function (e) {
      var form = e.target;
      if (!form || form.tagName !== "FORM") return;
      var data = Object.assign(
        { form: form.getAttribute("name") || form.className || "form", page_url: window.location.href },
        getUtm()
      );
      fireConversion("lead_submit", data);
    }, true);
  }

  // ── Level 3 conversion pipe: route lead forms to a real endpoint ────────────
  // Any <form data-lead-form> (or form.contact-form) POSTs its fields + first-
  // touch UTM as JSON to CFG.leadWebhookUrl. Blank endpoint = no-op (the form
  // keeps its native mailto fallback). lead_submit still fires via wireListeners
  // so the conversion is counted either way. Honeypot: any input whose name
  // starts with "_" (e.g. _gotcha) is treated as a spam trap and excluded.
  function wireLeadForms() {
    if (!CFG.leadWebhookUrl) return; // no endpoint configured → native behavior
    document.addEventListener("submit", function (e) {
      var form = e.target;
      if (!form || form.tagName !== "FORM") return;
      if (!(form.matches("[data-lead-form]") || (form.className || "").indexOf("contact-form") > -1)) return;

      var hp = form.querySelector("input[name^='_']");
      if (hp && hp.value) { e.preventDefault(); return; } // silent spam drop

      e.preventDefault();

      var payload = {};
      try {
        new window.FormData(form).forEach(function (v, k) { if (k.charAt(0) !== "_") payload[k] = v; });
      } catch (err) { /* keep going with whatever we have */ }
      payload.page_url = window.location.href;
      payload.submitted_at = new Date().toISOString();
      payload.utm = getUtm();

      var btn = form.querySelector("[type='submit'], button");
      var label = btn ? btn.textContent : "";
      if (btn) btn.disabled = true;

      function status(msg, ok) {
        var el = form.querySelector("[data-form-status]");
        if (!el) {
          el = document.createElement("p");
          el.setAttribute("data-form-status", "");
          el.style.cssText = "margin-top:12px;font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;";
          form.appendChild(el);
        }
        el.textContent = msg;
        el.style.color = ok ? "#1c7c43" : "#b4452f";
      }

      window.fetch(CFG.leadWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(function (r) {
        if (!r.ok) throw new Error("bad status " + r.status);
        form.reset();
        status("Thanks — your request is in. We'll be in touch shortly.", true);
      }).catch(function () {
        status("Couldn't send that just now. Please email us directly and we'll jump on it.", false);
      }).then(function () {
        if (btn) { btn.disabled = false; if (label) btn.textContent = label; }
      });
    }, false);
  }

  // ── boot ────────────────────────────────────────────────────────────────────
  function boot() {
    captureUtm();
    loadUngated();
    if (getConsent() === "accepted") loadGated();
    wireListeners();
    wireLeadForms();
    showBanner();
    window.addEventListener(CONSENT_EVENT, function (e) {
      if (e && e.detail === "accepted") loadGated();
    });
  }

  // public API
  window.presenceOS = { fireConversion: fireConversion, getUtm: getUtm, config: CFG };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
