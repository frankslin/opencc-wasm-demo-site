#!/usr/bin/env node
/**
 * Bundle demo assets into ./dist for static hosting.
 * Steps:
 * 1) Ensure opencc-wasm is installed (file:../wasm-lib or published).
 * 2) Copy wasm package dist into dist/vendor/opencc-wasm
 * 3) Copy demo index.html and testcases.json into dist/
 */
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const demoRoot = path.resolve(__dirname);
const pkgRoot = path.join(demoRoot, "node_modules", "opencc-wasm", "dist");
const outRoot = path.join(demoRoot, "dist");
const vendorOut = path.join(outRoot, "vendor", "opencc-wasm");
const vendorJsOut = path.join(outRoot, "vendor", "opencc-js");

// Get current date in YYYY-MM-DD format
function getBuildDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWasmVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(demoRoot, "node_modules", "opencc-wasm", "package.json"), "utf8"));
    return pkg.version || "dev";
  } catch {
    return "dev";
  }
}

if (!fs.existsSync(pkgRoot)) {
  console.error("opencc-wasm not found. Run `npm install` in wasm-demo first.");
  process.exit(1);
}

fs.rmSync(outRoot, { recursive: true, force: true });
fs.mkdirSync(vendorOut, { recursive: true });

// copy wasm package dist (js/cjs/wasm + data) into vendor
fs.cpSync(pkgRoot, vendorOut, { recursive: true });

// optionally copy opencc-js browser build if installed
const ocjsSrc = path.join(demoRoot, "node_modules", "opencc-js", "dist");
if (fs.existsSync(ocjsSrc)) {
  fs.mkdirSync(vendorJsOut, { recursive: true });
  fs.cpSync(ocjsSrc, vendorJsOut, { recursive: true });
}

// copy demo assets with build date + version injection
const buildDate = getBuildDate();
const wasmVersion = getWasmVersion();
const filesToCopy = ["index.html", "classic.html", "benchmark.html", "wasm.html", "cdn.html", "cngov.html", "compare.html", "testcases.json"];

// copy css directory
const cssSrc = path.join(demoRoot, "css");
const cssDst = path.join(outRoot, "css");
if (fs.existsSync(cssSrc)) {
  fs.cpSync(cssSrc, cssDst, { recursive: true });
}

for (const file of filesToCopy) {
  const src = path.join(demoRoot, file);
  if (fs.existsSync(src)) {
    const dst = path.join(outRoot, path.basename(file));

    // For HTML files, replace __BUILD_DATE__ placeholder
    if (file.endsWith('.html')) {
      let content = fs.readFileSync(src, 'utf8');
      content = content.replace(/__BUILD_DATE__/g, buildDate);
      content = content.replace(/__OPENCC_WASM_VERSION__/g, wasmVersion);
      fs.writeFileSync(dst, content, 'utf8');
    } else {
      fs.copyFileSync(src, dst);
    }
  }
}

console.log(`Demo bundle ready in wasm-demo/dist/ (build date: ${buildDate})`);
