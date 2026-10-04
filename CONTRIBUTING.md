# Contributing to AquaLens

Start with [README.md](README.md) for setup and the deployed walkthrough, then [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for the current implementation and remaining verification limits. [AGENTS.md](AGENTS.md) sets the evidence rules for work in this repository.

## Reproduce an issue

Include the route and selected collection, browser/version, screen size, steps, expected behavior and actual behavior. State whether the source was a bundled historical photo, a labelled showcase record or your own observation. Use a minimal synthetic example when possible.

Do not attach API keys, private field media, precise private locations, browser-storage dumps or unredacted logs to a public issue. Use the bug-report template for interface and workflow problems; see [SECURITY.md](SECURITY.md) for credential or privacy issues.

## Propose a change

Use a branch and pull request with the concrete problem, resulting behavior and checks performed. Keep original observations and unknown fields intact. New public datasets must carry source URLs, retrieval dates, licenses, attribution and limitations. Clearly label synthetic examples and recorded AI output. Appearance alone must never become a water-safety or ecological-health claim.

Do not replace retained source bundles as an incidental UI change. Deliberate source updates need versioned assets and integrity checks. Reviewer actions must remain explicit, and AI output must remain a suggestion until a human accepts it.

## Check the change

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build:cloud
```

For UI changes, inspect the affected route at desktop and phone widths, including empty/loading/error states and keyboard controls. A successful build does not substitute for browser verification. Report checks you did not perform. Live-provider calls are separate consented integration work; they are not part of CI.

Update the relevant documentation and replace stale status in `PROJECT_CONTEXT.md` when handing over substantial work. Do not commit local credentials, generated builds, runtime state or private observations. The original-code license remains undecided; do not assume this project or its media can be relicensed without permission from their rights holders.
