/* ═══════════════════════════════════════════════════════════════════════════
   NORDICTA INTERNPORTAL — INLOGGNING (portal-auth.js)

   Läggs in med EN rad i varje sida som pratar med Supabase, före sidans
   egen <script>:

       <script src="../portal-auth.js"></script>

   Vad den gör:
   1. Visar en inloggningsruta tills användaren är inloggad.
   2. Byter automatiskt ut den publika API-nyckeln mot användarens
      personliga token i alla anrop till Supabase (/rest/v1/…), genom att
      linda in window.fetch. Sidornas egen kod behöver INTE ändras.
   3. Loggar ut automatiskt efter MAX_SESSION_HOURS (= man loggar in på nytt
      varje dag).

   VIKTIGT: den här filen skyddar DATAN (databasen kräver en giltig
   inloggning via RLS-reglerna). Själva HTML-sidan ligger fortfarande
   publikt på GitHub Pages — sidlåset är steg 2 (Cloudflare Access).
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const SB_URL  = 'https://ruznxfmqarwlkyntxliq.supabase.co';
  const SB_KEY  = 'sb_publishable_-Z2tVftUeoal75gPYlGu6g_N-GLZ3pl';
  const DOMAIN  = 'nordicta.com';   // bara jobbadresser släpps in
  const MAX_SESSION_HOURS = 24;     // tvingar ny inloggning varje dygn
  const AZURE_ENABLED = false;      // sätts till true när Entra ID-appen är registrerad
  const LS = 'nordicta_portal_session';

  /* ── Session ─────────────────────────────────────────────────────────── */
  let session = null;

  function loadSession() {
    try {
      const s = JSON.parse(localStorage.getItem(LS) || 'null');
      if (!s || !s.refresh_token) return null;
      // Dygnsregeln: oavsett hur färsk token är måste man logga in på nytt.
      if (Date.now() - (s.login_at || 0) > MAX_SESSION_HOURS * 3600e3) return null;
      return s;
    } catch (e) { return null; }
  }
  function saveSession(tok, keepLoginTime) {
    session = {
      access_token:  tok.access_token,
      refresh_token: tok.refresh_token,
      expires_at:    Date.now() + (tok.expires_in || 3600) * 1000,
      login_at:      keepLoginTime && session ? session.login_at : Date.now(),
      email:         (tok.user && tok.user.email) || (session && session.email) || ''
    };
    try { localStorage.setItem(LS, JSON.stringify(session)); } catch (e) {}
  }
  function clearSession() {
    session = null;
    try { localStorage.removeItem(LS); } catch (e) {}
  }

  async function api(path, body, extraHeaders) {
    const r = await fetch(SB_URL + path, {
      method: 'POST',
      headers: Object.assign({apikey: SB_KEY, 'Content-Type': 'application/json'}, extraHeaders || {}),
      body: JSON.stringify(body)
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.msg || data.error_description || data.message || ('HTTP ' + r.status));
    return data;
  }

  let refreshing = null;
  async function ensureToken() {
    if (!session) return null;
    if (Date.now() - session.login_at > MAX_SESSION_HOURS * 3600e3) { signOut(); return null; }
    if (Date.now() < session.expires_at - 60000) return session.access_token;
    if (!refreshing) {
      refreshing = api('/auth/v1/token?grant_type=refresh_token', {refresh_token: session.refresh_token})
        .then(tok => { saveSession(tok, true); return session.access_token; })
        .catch(() => { signOut(); return null; })
        .finally(() => { refreshing = null; });
    }
    return refreshing;
  }

  function signOut() {
    const tok = session && session.access_token;
    clearSession();
    if (tok) {
      fetch(SB_URL + '/auth/v1/logout', {
        method: 'POST',
        headers: {apikey: SB_KEY, Authorization: 'Bearer ' + tok},
        keepalive: true
      }).catch(() => {});
    }
    location.reload();
  }

  /* ── fetch-lindning: skicka användarens token till Supabase ──────────── */
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url.indexOf(SB_URL + '/rest/v1/') !== 0) return nativeFetch(input, init);

    const token = await ensureToken();
    if (!token) { showLogin(); throw new Error('Inte inloggad'); }

    // Slå ihop befintliga headers (objekt, Headers eller Request) och byt ut nyckeln.
    const h = new Headers((init && init.headers) || (input instanceof Request ? input.headers : undefined));
    h.set('apikey', SB_KEY);
    h.set('Authorization', 'Bearer ' + token);

    if (input instanceof Request && !init) return nativeFetch(new Request(input, {headers: h}));
    return nativeFetch(input, Object.assign({}, init, {headers: h}));
  };

  /* ── Inloggnings-UI ──────────────────────────────────────────────────── */
  const CSS = `
  #np-auth{position:fixed;inset:0;z-index:99999;background:#0f0f1c;display:flex;align-items:center;
    justify-content:center;padding:1.5rem;font-family:'DM Sans','IBM Plex Sans',system-ui,sans-serif}
  #np-auth *{box-sizing:border-box}
  #np-auth .np-card{background:#fff;border-radius:16px;max-width:420px;width:100%;padding:2rem;
    box-shadow:0 24px 60px rgba(0,0,0,.45)}
  #np-auth .np-tag{font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#8888aa}
  #np-auth h1{font-family:Georgia,serif;font-size:1.5rem;color:#1a1a2e;margin:.5rem 0 .35rem}
  #np-auth p.np-sub{font-size:.85rem;color:#6B7280;line-height:1.5;margin-bottom:1.4rem}
  #np-auth label{display:block;font-size:.7rem;font-weight:500;color:#6B7280;text-transform:uppercase;
    letter-spacing:.05em;margin-bottom:.3rem}
  #np-auth input{width:100%;font-family:inherit;font-size:.95rem;color:#1a1a2e;background:#fff;
    border:1px solid #E0E3E8;border-radius:8px;padding:.6rem .7rem;outline:none}
  #np-auth input:focus{border-color:#2E75B6}
  #np-auth input.np-code{letter-spacing:.5em;text-align:center;font-size:1.3rem;font-weight:600}
  #np-auth button{width:100%;font-family:inherit;font-size:.9rem;font-weight:500;padding:.7rem 1rem;
    border-radius:8px;border:1px solid #1a1a2e;background:#1a1a2e;color:#fff;cursor:pointer;margin-top:.9rem}
  #np-auth button:hover:not(:disabled){background:#2b2b4d}
  #np-auth button:disabled{opacity:.55;cursor:default}
  #np-auth button.np-ms{background:#fff;color:#1a1a2e;border-color:#E0E3E8;display:flex;align-items:center;
    justify-content:center;gap:.6rem;margin-top:0}
  #np-auth button.np-ms:hover{background:#F7F8FA;border-color:#c9ced6}
  #np-auth button.np-link{background:none;border:none;color:#2E75B6;width:auto;padding:.4rem 0;
    font-size:.8rem;margin:.6rem 0 0;text-decoration:underline}
  #np-auth .np-or{display:flex;align-items:center;gap:.75rem;margin:1.1rem 0;color:#9CA3AF;font-size:.72rem;
    text-transform:uppercase;letter-spacing:.08em}
  #np-auth .np-or::before,#np-auth .np-or::after{content:'';flex:1;height:1px;background:#E0E3E8}
  #np-auth .np-msg{margin-top:.9rem;font-size:.8rem;line-height:1.45;padding:.6rem .75rem;border-radius:8px}
  #np-auth .np-msg.err{background:#FEF2F2;border:1px solid #F3C4C4;color:#991B1B}
  #np-auth .np-msg.ok{background:#F0FDF4;border:1px solid #BBF7D0;color:#14532d}
  #np-auth .np-foot{margin-top:1.4rem;font-size:.72rem;color:#9CA3AF;line-height:1.5}
  #np-user{position:fixed;right:14px;bottom:14px;z-index:9998;display:flex;align-items:center;gap:.5rem;
    background:rgba(26,26,46,.92);color:#fff;border-radius:20px;padding:.3rem .5rem .3rem .8rem;
    font-family:'DM Sans',system-ui,sans-serif;font-size:.72rem;box-shadow:0 4px 14px rgba(0,0,0,.2)}
  #np-user button{background:rgba(255,255,255,.14);border:none;color:#fff;border-radius:14px;
    padding:.25rem .6rem;font-family:inherit;font-size:.7rem;cursor:pointer}
  #np-user button:hover{background:rgba(255,255,255,.28)}
  @media print{#np-user{display:none}}
  `;

  let root = null, email = '', busy = false;

  function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }

  function showLogin() {
    if (root) return;
    if (!document.getElementById('np-auth-css')) {
      const st = document.createElement('style');
      st.id = 'np-auth-css'; st.textContent = CSS;
      document.head.appendChild(st);
    }
    root = el('<div id="np-auth"><div class="np-card"></div></div>');
    document.body.appendChild(root);
    document.documentElement.style.overflow = 'hidden';
    renderEmailStep();
  }
  function hideLogin() {
    if (root) { root.remove(); root = null; }
    document.documentElement.style.overflow = '';
  }
  function card() { return root.querySelector('.np-card'); }
  function msg(text, cls) {
    const old = card().querySelector('.np-msg');
    if (old) old.remove();
    if (!text) return;
    card().appendChild(el('<div class="np-msg ' + cls + '">' + text + '</div>'));
  }

  function renderEmailStep() {
    card().innerHTML =
      '<div class="np-tag">Nordicta Corporate Housing</div>' +
      '<h1>Internportalen</h1>' +
      '<p class="np-sub">Logga in med din jobbadress för att komma åt portalens uppgifter.</p>' +
      (AZURE_ENABLED
        ? '<button class="np-ms" id="np-ms">' +
          '<svg width="16" height="16" viewBox="0 0 23 23"><rect x="1" y="1" width="10" height="10" fill="#f25022"/>' +
          '<rect x="12" y="1" width="10" height="10" fill="#7fba00"/><rect x="1" y="12" width="10" height="10" fill="#00a4ef"/>' +
          '<rect x="12" y="12" width="10" height="10" fill="#ffb900"/></svg>Logga in med Microsoft</button>' +
          '<div class="np-or">eller</div>'
        : '') +
      '<label for="np-email">Jobbadress</label>' +
      '<input id="np-email" type="email" autocomplete="email" placeholder="fornamn@' + DOMAIN + '" value="' + email + '">' +
      '<button id="np-send">Skicka engångskod</button>' +
      '<div class="np-foot">Koden mejlas till din adress och gäller i 60 minuter. ' +
      'Du loggas ut automatiskt efter ' + MAX_SESSION_HOURS + ' timmar.</div>';

    const ms = card().querySelector('#np-ms');
    if (ms) ms.addEventListener('click', () => {
      location.href = SB_URL + '/auth/v1/authorize?provider=azure&redirect_to=' + encodeURIComponent(location.href.split('#')[0]);
    });
    const input = card().querySelector('#np-email');
    const send = card().querySelector('#np-send');
    input.addEventListener('keydown', e => { if (e.key === 'Enter') send.click(); });
    send.addEventListener('click', () => sendCode(input.value.trim().toLowerCase()));
    setTimeout(() => input.focus(), 50);
  }

  async function sendCode(addr) {
    if (busy) return;
    if (!/^[^@\s]+@[^@\s]+$/.test(addr)) { msg('Skriv en giltig e-postadress.', 'err'); return; }
    if (!addr.endsWith('@' + DOMAIN)) { msg('Bara adresser på @' + DOMAIN + ' har åtkomst.', 'err'); return; }
    email = addr;
    busy = true;
    const btn = card().querySelector('#np-send');
    btn.disabled = true; btn.textContent = 'Skickar…';
    try {
      await api('/auth/v1/otp', {email: addr, create_user: true});
      renderCodeStep();
    } catch (e) {
      msg('Kunde inte skicka koden: ' + e.message, 'err');
      btn.disabled = false; btn.textContent = 'Skicka engångskod';
    } finally { busy = false; }
  }

  function renderCodeStep() {
    card().innerHTML =
      '<div class="np-tag">Nordicta Corporate Housing</div>' +
      '<h1>Skriv in koden</h1>' +
      '<p class="np-sub">Vi har mejlat en engångskod till <b>' + email + '</b>.</p>' +
      '<label for="np-code">Engångskod</label>' +
      '<input id="np-code" class="np-code" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="000000">' +
      '<button id="np-verify">Logga in</button>' +
      '<button class="np-link" id="np-back">Byt adress eller skicka ny kod</button>';

    const input = card().querySelector('#np-code');
    const btn = card().querySelector('#np-verify');
    input.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });
    input.addEventListener('input', () => { if (input.value.replace(/\D/g,'').length === 6) btn.click(); });
    btn.addEventListener('click', () => verifyCode(input.value.replace(/\D/g, '')));
    card().querySelector('#np-back').addEventListener('click', renderEmailStep);
    setTimeout(() => input.focus(), 50);
  }

  async function verifyCode(code) {
    if (busy || !code) return;
    busy = true;
    const btn = card().querySelector('#np-verify');
    btn.disabled = true; btn.textContent = 'Loggar in…';
    // Första inloggningen för ett nytt konto är en "signup", senare gånger
    // "magiclink"/"email". Vi provar typerna i tur och ordning så att koden
    // fungerar oavsett vilken mall Supabase skickade.
    let lastErr = null;
    for (const type of ['email', 'signup', 'magiclink']) {
      try {
        const tok = await api('/auth/v1/verify', {email: email, token: code, type: type});
        saveSession(tok);
        onSignedIn();
        busy = false;
        return;
      } catch (e) { lastErr = e; }
    }
    busy = false;
    msg('Koden stämmer inte eller har gått ut. Försök igen.' +
        (lastErr ? '<br><span style="opacity:.7">(' + lastErr.message + ')</span>' : ''), 'err');
    btn.disabled = false; btn.textContent = 'Logga in';
  }

  function userPill() {
    if (document.getElementById('np-user')) return;
    const p = el('<div id="np-user"><span>' + (session.email || 'Inloggad') + '</span><button>Logga ut</button></div>');
    p.querySelector('button').addEventListener('click', signOut);
    document.body.appendChild(p);
  }

  function onSignedIn() {
    hideLogin();
    userPill();
    // Sidor som redan hunnit misslyckas med sina anrop laddas om en gång.
    if (window.__npReloadOnLogin) location.reload();
    else document.dispatchEvent(new CustomEvent('portal-auth-ready', {detail: {email: session.email}}));
  }

  /* ── Start ───────────────────────────────────────────────────────────── */
  // Tokens efter Microsoft-inloggning kommer tillbaka i adressens #-del.
  const urlCode = new URLSearchParams(location.search).get('code');
  if (urlCode) {
    // Länkinloggning (PKCE-flöde) — byt koden mot en session.
    api('/auth/v1/token?grant_type=pkce', {auth_code: urlCode})
      .then(tok => { saveSession(tok); history.replaceState(null,'',location.pathname); location.reload(); })
      .catch(() => {});
  }
  if (location.hash.indexOf('access_token=') > -1) {
    const p = new URLSearchParams(location.hash.slice(1));
    saveSession({
      access_token: p.get('access_token'),
      refresh_token: p.get('refresh_token'),
      expires_in: parseInt(p.get('expires_in') || '3600', 10)
    });
    history.replaceState(null, '', location.pathname + location.search);
    // Hämta e-postadressen till pillret.
    fetch(SB_URL + '/auth/v1/user', {headers: {apikey: SB_KEY, Authorization: 'Bearer ' + session.access_token}})
      .then(r => r.json()).then(u => { if (u && u.email) { session.email = u.email; localStorage.setItem(LS, JSON.stringify(session)); } })
      .catch(() => {});
  } else {
    session = loadSession();
  }

  window.PortalAuth = {
    get email() { return session && session.email; },
    get signedIn() { return !!session; },
    signOut: signOut,
    token: ensureToken
  };

  function boot() {
    if (session) { userPill(); document.dispatchEvent(new CustomEvent('portal-auth-ready', {detail:{email: session.email}})); }
    else { window.__npReloadOnLogin = true; showLogin(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
