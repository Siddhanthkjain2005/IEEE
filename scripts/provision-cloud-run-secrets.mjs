import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log("Usage: node scripts/provision-cloud-run-secrets.mjs --project=PROJECT_ID [--account=ACCOUNT]\nReads four Groq keys from ignored .dev.vars; creates secret versions and runtime access. Account defaults to the active gcloud account.");
  process.exit(0);
}
if (args.some(arg => !/^--(?:project|account)=.+$/.test(arg))) throw new Error("Unsupported argument. Use --help for usage.");
const project = args.find(arg => arg.startsWith("--project="))?.slice(10) || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
const account = args.find(arg => arg.startsWith("--account="))?.slice(10) || process.env.CLOUDSDK_CORE_ACCOUNT;
if (!project || !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(project)) throw new Error("Provide a valid Google Cloud project with --project=PROJECT_ID or GCP_PROJECT.");
const serviceAccount = `aqualens-runtime@${project}.iam.gserviceaccount.com`;
const config = await readFile(".dev.vars", "utf8");
const keys = [...config.matchAll(/^GROQ_API_KEY(?:_([2-4]))?\s*=\s*(.*)$/gm)]
  .map(match => ({ slot: match[1] || "1", value: match[2].trim().replace(/^(["'])(.*)\1$/, "$2") })).filter(key => key.value);
if (keys.length !== 4) throw new Error("Expected four configured Groq keys.");
function call(args, input) {
  const result = spawnSync("gcloud", [...args, `--project=${project}`, ...(account ? [`--account=${account}`] : []), "--quiet"], { input, encoding: "utf8" });
  if (result.error) throw result.error;
  return result;
}
function requireSuccess(result) {
  if (result.status !== 0) {
    let error = result.stderr || "Google Cloud operation failed.";
    for (const key of keys) error = error.replaceAll(key.value, "[REDACTED]");
    throw new Error(error);
  }
}
const identity = call(["iam", "service-accounts", "describe", serviceAccount]);
if (identity.status !== 0) {
  if (!identity.stderr.includes("NOT_FOUND")) requireSuccess(identity);
  requireSuccess(call(["iam", "service-accounts", "create", "aqualens-runtime", "--display-name=AquaLens runtime"]));
}
for (const key of keys) {
  const secret = `aqualens-groq-${key.slot}`;
  const existing = call(["secrets", "describe", secret]);
  if (existing.status !== 0) {
    if (!existing.stderr.includes("NOT_FOUND")) requireSuccess(existing);
    requireSuccess(call(["secrets", "create", secret, "--replication-policy=automatic"]));
  }
  requireSuccess(call(["secrets", "versions", "add", secret, "--data-file=-"], key.value));
  requireSuccess(call(["secrets", "add-iam-policy-binding", secret, `--member=serviceAccount:${serviceAccount}`, "--role=roles/secretmanager.secretAccessor"]));
  console.log(JSON.stringify({ secret, uploaded: true, accessor: serviceAccount }));
}
