import { spawnSync } from "node:child_process";
import { copyFile, writeFile, unlink } from "node:fs/promises";
// Vinext's Node public-file allowlist is captured before Workbox emits the SW.
// Register the path during compilation, then replace only build copies with
// the real generated worker. Never leave a placeholder in source assets.
let placeholder = false;
try {
  try { await writeFile("public/sw.js", "// Build-time path registration only.\n", { flag: "wx" }); placeholder = true; }
  catch (error) { if (error.code !== "EEXIST") throw error; }
  for (const [script, args] of [["scripts/run-framework.mjs", ["build"]], ["scripts/build-offline.mjs", []]]) {
    const result = spawnSync(process.execPath, [script, ...args], {
      env: { ...process.env, AQUALENS_TARGET: "google-cloud" }, stdio: "inherit",
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Deployment build failed: ${script}`);
  }
  await copyFile("dist/client/sw.js", "dist/standalone/dist/client/sw.js");
  await copyFile("dist/client/sw.js", "dist/standalone/public/sw.js");
} finally {
  if (placeholder) await unlink("public/sw.js");
}
