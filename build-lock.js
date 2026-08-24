/* ═══════════════════════════════════════════════════════════════════════════
   BYGG KRYPTERADE PORTALSIDOR

       node build-lock.js            kryptera alla sidor i _src/
       node build-lock.js --test     bygg testsidan med lösenordet "test1234"

   Klartexten ligger i _src/, de krypterade filerna skrivs till repot.
   Lösenordet läses ur en fil UTANFÖR repot (se KEYFILE nedan) och skrivs
   aldrig ut — varken i terminalen, i koden eller i git.

   Tekniken: PBKDF2-SHA256 (400 000 varv) → AES-GCM 256. Lösenordet lagras
   ingenstans; utan det är sidan obegriplig. Det är alltså inte en spärr som
   kan kringgås, utan riktig kryptering.
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const KEYFILE = path.join(process.env.USERPROFILE || process.env.HOME, '.nordicta-portal-key');
const SRC = '_src';
const ITER = 400000;

// Sidor som ska låsas: klartext i _src/<fil> → krypterad i <fil>
const PAGES = [
  'index.html',
  'Städföretag/stadforetag.html',
  'jourschema/jourschema.html',
  'Inventarielista/inventarielista.html',
  'Riktprisdatabas/riktprisdatabas.html',
  'Bostadskalkylator/bostadskalkylator.html',
  'Stadkalkylator/stadkalkylator.html',
  'Forslag/forslag.html',
  'Forslag/forslag-viewer.html',
  'Nordicta_Protocol/nordicta-protocol.html',
  'Inflytt_Utflytt/inflytt-utflytt-guide.html',
  'SOP/sop.html',
  'annonsimport/annonsimport.html',
  'Anvandbar_information/anvandbar-information.html',
];

function loader(payload, depth, title) {
  const fav = '../'.repeat(depth) + 'favicon/';
  return `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="${fav}favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="${fav}favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="${fav}favicon-180.png">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans','IBM Plex Sans',system-ui,-apple-system,sans-serif;background:#0f0f1c;
    color:#1a1a2e;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem}
  .card{background:#fff;border-radius:16px;max-width:400px;width:100%;padding:2rem;
    box-shadow:0 24px 60px rgba(0,0,0,.45)}
  .tag{font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#8888aa}
  h1{font-family:Georgia,serif;font-size:1.5rem;margin:.5rem 0 .35rem}
  p.sub{font-size:.85rem;color:#6B7280;line-height:1.5;margin-bottom:1.4rem}
  label{display:block;font-size:.7rem;font-weight:500;color:#6B7280;text-transform:uppercase;
    letter-spacing:.05em;margin-bottom:.3rem}
  input{width:100%;font-family:inherit;font-size:.95rem;color:#1a1a2e;background:#fff;
    border:1px solid #E0E3E8;border-radius:8px;padding:.6rem .7rem;outline:none}
  input:focus{border-color:#2E75B6}
  button{width:100%;font-family:inherit;font-size:.9rem;font-weight:500;padding:.7rem 1rem;
    border-radius:8px;border:1px solid #1a1a2e;background:#1a1a2e;color:#fff;cursor:pointer;margin-top:.9rem}
  button:hover:not(:disabled){background:#2b2b4d}
  button:disabled{opacity:.55;cursor:default}
  .msg{margin-top:.9rem;font-size:.8rem;line-height:1.45;padding:.6rem .75rem;border-radius:8px;
    background:#FEF2F2;border:1px solid #F3C4C4;color:#991B1B}
  .foot{margin-top:1.4rem;font-size:.72rem;color:#9CA3AF;line-height:1.5}
</style>
</head>
<body>
<div class="card">
  <div class="tag">Nordicta Corporate Housing</div>
  <h1>Internportalen</h1>
  <p class="sub">Sidan är krypterad. Skriv lösenordet för att låsa upp den.</p>
  <label for="pw">Lösenord</label>
  <input id="pw" type="password" autocomplete="current-password" autofocus>
  <button id="go">Lås upp</button>
  <div id="err"></div>
  <div class="foot">Upplåsningen gäller i 24 timmar i den här webbläsaren.</div>
</div>
<script id="np-payload" type="application/json">${payload}</script>
<script>
(function(){
  'use strict';
  var P   = JSON.parse(document.getElementById('np-payload').textContent);
  var LS  = 'nordicta_portal_unlock';
  var TTL = 24*3600*1000;
  var b2a = function(b){var s='',u=new Uint8Array(b);for(var i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);return btoa(s);};
  var a2b = function(s){var r=atob(s),u=new Uint8Array(r.length);for(var i=0;i<r.length;i++)u[i]=r.charCodeAt(i);return u;};

  function show(t){var e=document.getElementById('err');e.className='msg';e.textContent=t;}

  async function keyFromPassword(pw){
    var km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      {name:'PBKDF2', salt:a2b(P.salt), iterations:P.it, hash:'SHA-256'},
      km, {name:'AES-GCM', length:256}, true, ['decrypt']);
  }
  // document.open() rensar bara dokumentet om sidan HAR laddat klart. Körs den
  // medan sidan fortfarande tolkas (vilket den automatiska upplåsningen gör)
  // infogas innehållet i stället, och låsrutan blir kvar ovanpå.
  function readyToWrite(){
    return new Promise(function(r){
      if (document.readyState !== 'loading') return r();
      document.addEventListener('DOMContentLoaded', function(){ r(); });
    });
  }
  async function open(key){
    var buf = await crypto.subtle.decrypt({name:'AES-GCM', iv:a2b(P.iv)}, key, a2b(P.ct));
    var html = new TextDecoder().decode(buf);
    await readyToWrite();
    document.open(); document.write(html); document.close();
  }
  async function remember(key){
    var raw = await crypto.subtle.exportKey('raw', key);
    try{ localStorage.setItem(LS, JSON.stringify({k:b2a(raw), t:Date.now()})); }catch(e){}
  }
  async function tryStored(){
    var s; try{ s = JSON.parse(localStorage.getItem(LS)||'null'); }catch(e){ return false; }
    if(!s || Date.now()-s.t > TTL) return false;
    try{
      var key = await crypto.subtle.importKey('raw', a2b(s.k), {name:'AES-GCM'}, true, ['decrypt']);
      await open(key);
      return true;
    }catch(e){ try{localStorage.removeItem(LS);}catch(_){} return false; }
  }
  async function unlock(){
    var btn = document.getElementById('go'), pw = document.getElementById('pw').value;
    if(!pw) return;
    btn.disabled = true; btn.textContent = 'Låser upp…';
    try{
      var key = await keyFromPassword(pw);
      await open(key);          // kastar om lösenordet är fel (AES-GCM verifierar)
      await remember(key);
    }catch(e){
      show('Fel lösenord.');
      btn.disabled = false; btn.textContent = 'Lås upp';
    }
  }
  document.getElementById('go').addEventListener('click', unlock);
  document.getElementById('pw').addEventListener('keydown', function(e){ if(e.key==='Enter') unlock(); });
  tryStored();
})();
</script>
</body>
</html>
`;
}

// Saltet måste vara SAMMA för alla sidor, annars blir den härledda nyckeln
// olika per sida och den sparade upplåsningen fungerar bara på en sida i taget.
// Det härleds ur lösenordet så att det också överlever ombyggen — annars hade
// alla tvingats logga in på nytt vid varje deploy.
function saltFor(password) {
  return crypto.createHmac('sha256', password).update('nordicta-portal-salt-v1').digest().subarray(0, 16);
}

function encrypt(html, password) {
  const salt = saltFor(password);
  const iv   = crypto.randomBytes(12);   // unik per sida, som AES-GCM kräver
  const key  = crypto.pbkdf2Sync(password, salt, ITER, 32, 'sha256');
  const c    = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct   = Buffer.concat([c.update(html, 'utf8'), c.final(), c.getAuthTag()]);
  return JSON.stringify({v:1, it:ITER, salt:salt.toString('base64'), iv:iv.toString('base64'), ct:ct.toString('base64')});
}

function titleOf(html, fallback) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1] : fallback;
}

/* ── kör ─────────────────────────────────────────────────────────────────── */
const testMode = process.argv.includes('--test');

// node build-lock.js --nyckel  → slumpar en lösenfras och lägger den i KEYFILE.
// Frasen skrivs ALDRIG ut här; öppna filen själv för att läsa och dela den.
if (process.argv.includes('--nyckel')) {
  if (fs.existsSync(KEYFILE)) {
    console.error('Det finns redan en nyckelfil: ' + KEYFILE);
    console.error('Ta bort den manuellt om du vill slumpa ett nytt lösenord (alla sidor måste då byggas om).');
    process.exit(1);
  }
  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  // utan 0/O och 1/I/L
  const pick = n => Array.from(crypto.randomBytes(n)).map(b => ALPHABET[b % 32]).join('');
  const phrase = [pick(4), pick(4), pick(4), pick(4)].join('-');
  fs.writeFileSync(KEYFILE, phrase + '\n', {mode: 0o600});
  console.log('Lösenfras skapad och sparad i:');
  console.log('  ' + KEYFILE);
  console.log('Öppna filen för att läsa lösenordet. Den ligger utanför repot och hamnar aldrig i git.');
  process.exit(0);
}

if (testMode) {
  const html = '<!DOCTYPE html><html><head><title>Testsida</title></head><body>' +
               '<h1 id="hemlig">Hemligt innehåll</h1><script>window.LADDAD=true;<\/script></body></html>';
  fs.writeFileSync('_locktest.html', loader(encrypt(html, 'test1234'), 0, 'Testsida'));
  console.log('Skrev _locktest.html (lösenord: test1234)');
  process.exit(0);
}

if (!fs.existsSync(KEYFILE)) {
  console.error('Hittar ingen lösenordsfil: ' + KEYFILE);
  console.error('Kör:  node build-lock.js --nyckel   för att skapa en slumpad lösenfras.');
  process.exit(1);
}
const password = fs.readFileSync(KEYFILE, 'utf8').trim();
if (password.length < 12) { console.error('Lösenordet i nyckelfilen är för kort.'); process.exit(1); }

let n = 0, bytes = 0;
PAGES.forEach(p => {
  const src = path.join(SRC, p);
  if (!fs.existsSync(src)) { console.log('hoppar över (saknas i _src):', p); return; }
  const html = fs.readFileSync(src, 'utf8');
  const depth = p.includes('/') ? 1 : 0;
  const out = loader(encrypt(html, password), depth, titleOf(html, 'Nordicta internportal'));
  fs.writeFileSync(p, out);
  n++; bytes += out.length;
  console.log('krypterad:', p, (out.length/1024).toFixed(0) + 'KB');
});
console.log('\n' + n + ' sidor krypterade, totalt ' + (bytes/1024/1024).toFixed(1) + ' MB');
