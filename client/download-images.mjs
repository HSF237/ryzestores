// One-time script: downloads all Meesho product images into public/products/
// so your store serves them from your OWN site (fast) instead of hotlinking
// Meesho (which throttles and hangs).
//
// HOW TO RUN:  open a terminal in the "client" folder and run:
//     node download-images.mjs
//
// Then hard-refresh your store. Re-run any time you add new Meesho images.

import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const SEEDER = new URL('./src/pages/Seeder.jsx', import.meta.url)
const OUT_DIR = new URL('./public/products/', import.meta.url)

const txt = await readFile(SEEDER, 'utf8')

// Find every Meesho product image URL referenced in the catalog.
const re = /images\.meesho\.com\/images\/products\/(\d+)\/([a-z0-9]+)_\d+\.webp/gi
const map = new Map()
let m
while ((m = re.exec(txt)) !== null) {
  const id = m[1], code = m[2]
  // request width=512 — Meesho only reliably serves resized (<=512) images
  map.set(`${id}_${code}`, `https://images.meesho.com/images/products/${id}/${code}_512.webp?width=512`)
}

await mkdir(OUT_DIR, { recursive: true })
console.log(`\nFound ${map.size} images. Downloading into public/products/ ...\n`)

let ok = 0, fail = 0
for (const [name, url] of map) {
  const dest = new URL(`${name}.webp`, OUT_DIR)
  if (existsSync(dest)) { console.log(`• skip ${name} (already downloaded)`); ok++; continue }

  let done = false
  for (let attempt = 1; attempt <= 4 && !done; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 500) throw new Error('file too small')
      await writeFile(dest, buf)
      console.log(`✓ ${name}  (${Math.round(buf.length / 1024)} KB)`)
      ok++; done = true
    } catch (e) {
      console.log(`  …retry ${name} (attempt ${attempt}): ${e.message}`)
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  if (!done) { console.log(`✗ FAILED ${name} — will fall back to Meesho`); fail++ }
  await new Promise(r => setTimeout(r, 500)) // be gentle so Meesho doesn't throttle
}

console.log(`\nDone! ${ok} downloaded, ${fail} failed.`)
console.log(`Saved to client/public/products/. Hard-refresh your store to see them.\n`)
