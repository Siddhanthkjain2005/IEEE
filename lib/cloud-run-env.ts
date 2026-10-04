// Server-only replacement for Worker bindings in the Google Cloud build.
// Cloud Run injects secrets at runtime; no secret is baked into build output.
export const env = process.env;
