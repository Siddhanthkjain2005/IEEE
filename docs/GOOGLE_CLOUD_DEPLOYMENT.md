# AquaLens Google Cloud deployment

## Build and deploy your own instance

The existing public showcase is linked below. These commands are a reproducible setup guide; they do not imply that reading the guide deploys another service. Use your own authorized Google Cloud project and authenticated account.

```bash
npm ci
npm run build:cloud
PORT=8080 HOST=127.0.0.1 npm run start:cloud
```

The standalone preview opens at `http://127.0.0.1:8080/showcase`. Local rules and the retained public datasets work without provider keys. For a consented live-AI preview, use the ignored environment file with `PORT=8080 HOST=127.0.0.1 node --env-file=.dev.vars dist/standalone/server.js`.

Cloud Run can build the included multi-stage Dockerfile from source:

```bash
gcloud run deploy aqualens \
  --source . \
  --project=YOUR_PROJECT_ID \
  --region=asia-south1 \
  --allow-unauthenticated \
  --port=8080 \
  --memory=512Mi \
  --cpu=1 \
  --concurrency=16 \
  --timeout=60
```

This command publishes a public service. Google Cloud may require the relevant APIs, billing and build/runtime permissions in your project. Configure instance scaling and provider usage for your own needs; the prototype does not implement a monetary spending cap. The Docker runtime runs as the non-root `node` user. `.dockerignore` and `.gcloudignore` exclude local credentials, generated outputs and the unrelated local configuration archive.

### Attach optional Groq AI securely

Create your Groq key as a Secret Manager secret in the same project. Use a dedicated `aqualens-runtime` service account and grant `roles/secretmanager.secretAccessor` on that specific secret. Attach a pinned secret version to the server environment:

```bash
gcloud run services update aqualens \
  --project=YOUR_PROJECT_ID \
  --region=asia-south1 \
  --service-account=aqualens-runtime@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --update-secrets=GROQ_API_KEY=aqualens-groq-1:1 \
  --update-env-vars=AI_PROVIDER=groq,GROQ_MODEL=qwen/qwen3.8-27b,GROQ_VISUAL_MODEL=qwen/qwen3.8-27b
```

The identity, secret and version above must exist first. This command contains a secret reference, not a secret value. Confirm that your provider account supports the configured model and capabilities. Website use still requires explicit AI consent for each relevant assessment.

For the existing four-key configuration, `scripts/provision-cloud-run-secrets.mjs` reads four keys from ignored `.dev.vars` and creates secret versions plus per-secret runtime access. It requires an explicit project (`--project=YOUR_PROJECT_ID` or `GCP_PROJECT`); an optional `--account=ACCOUNT` chooses an authenticated account, otherwise the active gcloud account is used. Run `node scripts/provision-cloud-run-secrets.mjs --help` before intentional provisioning. The script changes cloud resources and should not run in CI. No personal account address or credential value is hardcoded.

After deployment, verify `/showcase`, `/twins?collection=showcase`, `/visuals?collection=showcase`, `/sw.js` and the source assets. A real provider request is separate from mocked tests and requires deliberate consent and suitable public/synthetic evidence. Storage is still browser-local; deploying does not create authenticated shared accounts or a shared observation database.

## Existing deployment record

Recorded 2026-10-04 Asia/Kolkata. This describes the completed deployment, not a new deployment request.

## Public entry points

- Preferred presentation link: https://aqualens-ruvn5g3vna-el.a.run.app/showcase
- Primary origin: https://aqualens-916960484603.asia-south1.run.app
- Personal collection: `/`; presentation collection: `/showcase`; source archive: `/visuals`; geographic explorer: `/twins?collection=showcase`.
- No custom domain is configured. Hosting does not synchronize browser-local observations.

## Approved and deployed

The user explicitly approved storing four Groq credentials in Secret Manager with dedicated runtime access, then approved public website access and optional AI use. Both actions completed. Earlier automatic approval rejections were resolved by those approvals.

- Project: `fanm-amazonml-2026-01`.
- Cloud Run service: `aqualens`; region: `asia-south1`.
- Ready revision: `aqualens-00002-7l8`, with all service traffic when deployed.
- Successful Cloud Build: `a06ffcc6-629a-416f-98e4-41f682d6fc47`.
- Image digest: `sha256:4eba68cc3092618ee4d07408f7666db162695914f6c7474139e58be467198297`.
- Runtime identity: `aqualens-runtime@fanm-amazonml-2026-01.iam.gserviceaccount.com`.
- Secret resources: `aqualens-groq-1` through `aqualens-groq-4`, pinned to version1; per-secret access granted to the runtime identity. Values must never enter documentation or client assets.
- Provider: Groq; text/photo model: `qwen/qwen3.8-27b`; no alternate provider configured in this deployment.
- One CPU,512Mi memory, concurrency16, request timeout60seconds. Deployed revision min0/max1. Service-level maximum was12 when inspected; no global one-instance limit or monetary cap is claimed.

## Implementation

`Dockerfile` uses separate Node22 build/runtime stages, a lockfile-based install, standalone output and the non-root `node` runtime user. The server listens on `0.0.0.0:8080`.

`scripts/build-cloud-run.mjs` selects the Google Cloud target. `vite.config.ts`, `next.config.ts`, and `lib/cloud-run-env.ts` provide conditional standalone packaging and server-only environment access while preserving the default build path. Proxy-origin handling is enabled for the hosted runtime; unrelated origins were rejected in verification.

The build registers the service-worker public path before compilation, then replaces it with the generated Workbox worker in the standalone public/client copies. The temporary source placeholder is removed. The hosted worker returned200.

`.dockerignore` and `.gcloudignore` exclude local secrets and unnecessary files. The required `.openai/hosting.json` build configuration remains included. The latest geographic-section update uploaded325files/22.4MiB; source and2,898standalone files were scanned against configured credential values with zero matches. Relevant deployment/provisioning/verification logs also had zero matches. These checks are scoped evidence, not a general security audit.

## Verification

Latest proofs: `.sites-runtime/river-twin-hosted-verification.json`, checked2026-10-04T06:13:19.678Z, and `.sites-runtime/cloud-run-verification.json`, live AI checked2026-10-04T06:14:53.398Z. Logs: `outputs/river-twin-hosted-verification.log` and `outputs/river-twin-hosted-ai-verification.log`. Original deployment proof is preserved separately in `.sites-runtime/cloud-run-verification-before-twins.json` and the earlier frontend log.

- HTTP200: `/`, `/showcase`, `/visuals`, `/visuals?collection=showcase`, `/twins?collection=showcase`, `/sw.js`, `/manifest.webmanifest`, `/source-weather-v2.json`, and all seven geographic assets. The geographic JSON/textures/credits were byte-identical to the validated local assets.
- Weather bundle contained78retained windows.
- Text AI: HTTP200, mode`ai`, provider`groq`, model`qwen/qwen3.8-27b`.
- Photo AI: HTTP200, provider`groq`, same model, one returned candidate.
- Unrelated-origin POST:403.
- Shorter service alias returned200 in a separate bounded check.

Only labelled synthetic text and a credited public Hoffselva photograph were sent. The original image was unchanged; a768px derivative was used for the request. No citizen observation or human review was created. An earlier text attempt fell back to local rules; subsequent checks succeeded. This is connectivity and software evidence, not scientific validation or guaranteed future availability.

Current `dist` is the Node standalone build. Default-target release scripts may assume a different output shape; select the intended target before rebuilding or interpreting those checks. The latest deployment adds the user-requested geographic river section. It preserves existing runtime/AI settings, public access and secret attachments; no new credential provisioning or IAM changes were made.

## Primary references

- [Cloud Run container contract](https://docs.cloud.google.com/run/docs/container-contract): runtime conventions; checked2026-10-04.
- [Cloud Run secret configuration](https://docs.cloud.google.com/run/docs/configuring/services/secrets): secret attachment and runtime access; checked2026-10-04.
- [Custom domain options](https://docs.cloud.google.com/run/docs/mapping-custom-domains): consulted during the URL discussion; no DNS change performed.

The source repository is https://github.com/Siddhanthkjain2005/IEEE. Recording, a custom domain, authenticated collaboration, and competition submission remain separate future actions. Follow README.md and PROJECT_CONTEXT.md for current publication and verification status.
