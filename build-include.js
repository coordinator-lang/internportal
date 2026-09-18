/* ═══════════════════════════════════════════════════════════════════════════
   @include — delade källfiler i portalsidorna

   En sida som behöver delad kod skriver, utanför sina egna <script>-taggar:

       <!-- @include _shared/leverantorer.core.js -->

   Vid bygget byts raden mot filens innehåll inbakat i en <script>-tagg.
   Poängen: EN källa till leverantörsdata och prismotor, inga kopior i de
   enskilda sidorna — och inget separat .js-anrop i webbläsaren, eftersom en
   fristående .js-fil i repot skulle ligga OKRYPTERAD på GitHub Pages och
   därmed läcka precis det som låset ska skydda.

   Används av build-lock.js (före kryptering) och av _verify.js (som jämför
   den dekrypterade sidan mot samma expanderade källa).
   ═══════════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

const RE = /^([ \t]*)<!--\s*@include\s+([^\s>]+)\s*-->[ \t]*$/gm;

function expand(html, srcDir, seen) {
  seen = seen || [];
  return html.replace(RE, (line, indent, rel) => {
    const file = path.join(srcDir, rel);
    if (!fs.existsSync(file)) throw new Error('@include: hittar inte ' + file);
    if (seen.indexOf(file) !== -1) throw new Error('@include: cirkulär inkludering av ' + rel);
    const body = expand(fs.readFileSync(file, 'utf8'), srcDir, seen.concat([file]));
    return indent + '<script>\n/* @include ' + rel + ' */\n' + body.replace(/\s*$/, '') + '\n' + indent + '</script>';
  });
}

function includesOf(html) {
  const out = [];
  String(html).replace(RE, (l, i, rel) => { out.push(rel); return l; });
  return out;
}

module.exports = {expand, includesOf};
