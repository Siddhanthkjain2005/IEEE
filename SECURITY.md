# Security and privacy

AquaLens is a prototype with browser-local records and unauthenticated local roles. It is not an authenticated shared review service. File hashes identify retained bytes; they are not signatures or evidence of scene authenticity.

## Credentials and AI

- Keep provider keys in ignored local environment files during development and Google Cloud Secret Manager for hosted use.
- Never place keys in client/public environment variables, committed files, screenshots, reports or browser storage.
- Assessment routes disclose the configured provider and require explicit AI consent. CI uses mocked responses and needs no AI credentials.
- Only the runtime identity should receive access to the specific secrets it needs. Keys must not be baked into images or published with build artifacts.
- Backup keys recover invalid credentials; they do not bypass quotas or organization limits.

## Reporting a security concern

Please do not publish credentials, private observations or a working exploit containing sensitive data in a public issue. Use GitHub's **Report a vulnerability** option on the repository's Security tab if available. If private reporting is unavailable, request a private contact channel with a short public message that contains no sensitive details.

For an exposed credential, revoke or rotate it with its provider before sharing an incident description. Include affected behavior, minimal reproduction steps and redacted evidence. A credential-pattern scan and the authored tests are scoped checks, not a comprehensive security audit.

## Local records

Observations and original media remain in the browser's localStorage/IndexedDB and are separate for different site origins. Clearing browser data, storage eviction or changing devices can make them unavailable. Portable field packs can contain original media and locations; share them deliberately. Geographic showcase assets and bundled historical photos are public source material and remain labelled separately from citizen evidence.
