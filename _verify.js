// Kontrollerar att varje krypterad sida går att dekryptera tillbaka till exakt
// klartexten i _src/ — utan att skriva ut lösenordet.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const KEYFILE = path.join(process.env.USERPROFILE, '.nordicta-portal-key');
const pw = fs.readFileSync(KEYFILE, 'utf8').trim();

const PAGES = ['index.html','Städföretag/stadforetag.html','jourschema/jourschema.html',
 'Inventarielista/inventarielista.html','Riktprisdatabas/riktprisdatabas.html',
 'Bostadskalkylator/bostadskalkylator.html','Stadkalkylator/stadkalkylator.html',
 'Forslag/forslag.html','Forslag/forslag-viewer.html','Nordicta_Protocol/nordicta-protocol.html',
 'Inflytt_Utflytt/inflytt-utflytt-guide.html','SOP/sop.html','annonsimport/annonsimport.html',
 'Anvandbar_information/anvandbar-information.html'];

// Innehållsord som ALDRIG får synas i den krypterade filen
const HEMLIGT = ['Stormtrivs','sb_publishable','supabase.co','Hemfrid','jourschema','Bettys'];

let ok = 0, fel = 0;
PAGES.forEach(p => {
  const enc = fs.readFileSync(p, 'utf8');
  const m = enc.match(/<script id="np-payload" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) { console.log('FEL: ingen payload i', p); fel++; return; }
  const P = JSON.parse(m[1]);

  const key = crypto.pbkdf2Sync(pw, Buffer.from(P.salt,'base64'), P.it, 32, 'sha256');
  const buf = Buffer.from(P.ct, 'base64');
  const d = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(P.iv,'base64'));
  d.setAuthTag(buf.subarray(buf.length-16));
  let klartext;
  try { klartext = Buffer.concat([d.update(buf.subarray(0, buf.length-16)), d.final()]).toString('utf8'); }
  catch (e) { console.log('FEL: gick inte att dekryptera', p); fel++; return; }

  const original = fs.readFileSync(path.join('_src', p), 'utf8');
  const identisk = klartext === original;
  const lackage = HEMLIGT.filter(h => enc.includes(h));
  if (!identisk || lackage.length) {
    console.log('FEL:', p, 'identisk:', identisk, 'läckage:', lackage.join(','));
    fel++;
  } else { ok++; }
});

// fel lösenord ska misslyckas
const enc = JSON.parse(fs.readFileSync('index.html','utf8')
  .match(/<script id="np-payload" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const badKey = crypto.pbkdf2Sync('fel-losenord', Buffer.from(enc.salt,'base64'), enc.it, 32, 'sha256');
const b = Buffer.from(enc.ct,'base64');
const dd = crypto.createDecipheriv('aes-256-gcm', badKey, Buffer.from(enc.iv,'base64'));
dd.setAuthTag(b.subarray(b.length-16));
let felLosenStoppat = false;
try { dd.update(b.subarray(0,b.length-16)); dd.final(); } catch (e) { felLosenStoppat = true; }

console.log('\nSidor som dekrypterar till exakt originalet:', ok + '/' + PAGES.length);
console.log('Fel:', fel);
console.log('Fel lösenord avvisas:', felLosenStoppat);
