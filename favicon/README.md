# Nordicta Internportal — Favicon

Black **N** on light blue (`#d6eaf6`).

## Files
- `favicon.ico` — 16/32/48 multi-size (classic tab icon)
- `favicon-16.png`, `favicon-32.png`, `favicon-48.png`
- `favicon-180.png` — Apple touch icon
- `favicon-192.png`, `favicon-512.png` — PWA / manifest

## Add to `<head>`
Place the files in the site root (or a `/favicon/` folder — adjust `href` accordingly).

```html
<link rel="icon" href="/favicon/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon/favicon-180.png">
```

## Optional — PWA manifest (`site.webmanifest`)
```json
{
  "icons": [
    { "src": "/favicon/favicon-192.png", "type": "image/png", "sizes": "192x192" },
    { "src": "/favicon/favicon-512.png", "type": "image/png", "sizes": "512x512" }
  ]
}
```
