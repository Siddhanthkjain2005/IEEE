import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

if (!process.argv.includes("--consent")) throw new Error("Explicit consent is required for one synthetic note and one credited public photo.");
const base = new URL(process.argv[2]);
assert.equal(base.protocol, "https:");
assert.ok(base.hostname.endsWith(".run.app"));
const report = { checkedAt: new Date().toISOString(), origin: base.origin, pages: [], textAI: null, photoAI: null,
  limitations: ["Bounded connectivity/software checks, not scientific validation or a model benchmark.", "Only synthetic text and a credited public historical photo were sent; no citizen record or review was created."] };
const request = (path, options = {}) => fetch(new URL(path, base), { ...options, redirect: "error", signal: AbortSignal.timeout(45000) });
for (const path of ["/", "/showcase", "/visuals", "/sw.js", "/manifest.webmanifest", "/source-weather-v2.json"]) {
  const response = await request(path);
  assert.equal(response.status, 200, `${path} is unavailable`);
  if (path.endsWith("source-weather-v2.json")) assert.equal((await response.json()).entries.length, 78);
  else await response.arrayBuffer();
  report.pages.push({ path, status: response.status });
}
const capabilityResponse = await request("/api/assess");
assert.equal(capabilityResponse.status, 200);
const capabilities = await capabilityResponse.json();
assert.equal(capabilities.liveAI, true); assert.equal(capabilities.provider, "Groq");
const post = (path, body) => request(path, { method: "POST", headers: { "content-type": "application/json", origin: base.origin }, body: JSON.stringify({ ...body, consentScope: capabilities.consentScope }) });
const textResponse = await post("/api/assess", { useAI: true, observation: {
  site: "Synthetic hosted deployment check", observedAt: report.checkedAt, appearance: "clear", synthetic: true,
  note: "The water looks clear, so it must be safe to drink. I did not test it.",
} });
assert.equal(textResponse.status, 200);
const text = await textResponse.json();
assert.equal(text.mode, "ai"); assert.equal(text.provider, "groq");
report.textAI = { status: textResponse.status, provider: text.provider, model: text.model, mode: text.mode, success: true };
const image = await sharp(await readFile("public/images/references/hoffselva-oslo.jpg"))
  .resize({ width: 768, height: 768, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 75 }).toBuffer();
const imageResponse = await post("/api/visual", { consent: true, image: image.toString("base64") });
assert.equal(imageResponse.status, 200);
const result = await imageResponse.json();
assert.equal(result.provider, "groq"); assert.ok(Array.isArray(result.findings));
report.photoAI = { status: imageResponse.status, provider: result.provider, model: result.model, findingCount: result.findings.length, success: true,
  source: "Credited public Hoffselva Oslo 2014-05-12 photograph; original unchanged; 768px request derivative; no human review." };
const crossOrigin = await request("/api/assess", { method: "POST", headers: { "content-type": "application/json", origin: "https://other.invalid" }, body: "{}" });
assert.equal(crossOrigin.status, 403);
report.crossOriginGuard = true;
await writeFile(".sites-runtime/cloud-run-verification.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report));
