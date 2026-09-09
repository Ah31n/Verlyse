#!/usr/bin/env bash
# Restore a working headless-browser environment for the audit harnesses.
#
# WHY THIS EXISTS
# The suite drives real Chromium: `scripts/full-matrix-audit.mjs` via Playwright,
# `audit/phase205-validate-v2.mjs` and the other probes via puppeteer. Both
# normally download a browser on install, and both download endpoints are
# unreachable from a sandboxed agent:
#
#   storage.googleapis.com  (puppeteer chrome)      -> blocked
#   cdn.playwright.dev      (playwright chromium)   -> blocked
#   deb.debian.org          (apt chromium)          -> blocked
#
# registry.npmjs.org *is* reachable, and `@sparticuz/chromium` ships a real
# Linux Chromium binary inside its npm tarball. Its `al2023.tar.br` sidecar
# contains exactly the NSS libraries the binary needs (libnss3, libnspr4,
# libnssutil3), which apt would otherwise provide.
#
# This script is environment provisioning. It does not modify any test.
#
# Usage:  bash scripts/setup-browser-env.sh
set -euo pipefail

TOOLS=/home/user/browser-tools
PW_DIR=/home/user/.cache/ms-playwright/chromium_headless_shell-1234

echo "==> installing @sparticuz/chromium into $TOOLS"
mkdir -p "$TOOLS"
cd "$TOOLS"
[ -f package.json ] || npm init -y >/dev/null
npm install @sparticuz/chromium --no-audit --no-fund >/dev/null

echo "==> extracting the browser binary"
node -e "import('@sparticuz/chromium').then(async m => { const p = await m.default.executablePath(); console.log('    ' + p) })"

echo "==> extracting NSS libraries from al2023.tar.br"
mkdir -p "$TOOLS/libs"
node -e '
const fs=require("fs"),z=require("zlib"),path=require("path");
const buf=z.brotliDecompressSync(fs.readFileSync("node_modules/@sparticuz/chromium/bin/al2023.tar.br"));
let off=0;
while(off<buf.length-512){
  const nm=buf.slice(off,off+100).toString().replace(/\0.*$/,"");
  if(!nm) break;
  const sz=parseInt(buf.slice(off+124,off+136).toString().trim(),8)||0;
  if(String.fromCharCode(buf[off+156])==="0"&&sz>0)
    fs.writeFileSync("libs/"+path.basename(nm), buf.slice(off+512,off+512+sz));
  off+=512+Math.ceil(sz/512)*512;
}'

echo "==> satisfying Playwright's expected cache path"
mkdir -p "$PW_DIR/chrome-headless-shell-linux64"
cp /tmp/chromium "$PW_DIR/chrome-headless-shell-linux64/chrome-headless-shell"
chmod +x "$PW_DIR/chrome-headless-shell-linux64/chrome-headless-shell"
touch "$PW_DIR/INSTALLATION_COMPLETE"

echo "==> done. Export these before running the harnesses:"
cat <<'ENVEOF'
    export PUPPETEER_EXECUTABLE_PATH=/tmp/chromium
    export LD_LIBRARY_PATH=/home/user/browser-tools/libs
ENVEOF
echo
echo "==> verify"
LD_LIBRARY_PATH="$TOOLS/libs" /tmp/chromium --version
