#!/usr/bin/env node
/**
 * Sprawdza, czy w stagingu (git add) nie ma plików .env z sekretami.
 * Uruchom przed commitem: npm run security-check
 */
const { execSync } = require("child_process");
let staged;
try {
  staged = execSync("git diff --cached --name-only", { encoding: "utf8" });
} catch {
  process.exit(0);
  return;
}
const files = staged.trim().split(/\n/).filter(Boolean);
const sensitive = /^\.env$|\.env\.local$|\.env\.production|\.env\.development\.local|\.env\.test\.local/;
const bad = files.filter((f) => sensitive.test(f));
if (bad.length) {
  console.error("BŁĄD: Nie commituj plików z sekretami:", bad.join(", "));
  process.exit(1);
}
console.log("OK: brak .env w stagingu.");
