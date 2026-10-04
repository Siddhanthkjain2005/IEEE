# AquaLens frontend rebuild — Field Editions

Initial rebuild completed 2026-10-03 in `/Users/swetha/Downloads/ieee_hackathon`; latest follow-ups verified2026-10-04 India time. This is a frontend rebuild of the existing application, not a new backend or a scientific validation exercise.

## Design and implemented experience

The product now reads as a river field journal: warm paper, forest ink, a restrained ochre accent, Instrument Serif display typography and Manrope controls. Evidence photographs sit on deep forest viewing surfaces; operational forms, records, charts and source metadata use paper surfaces. Counts come from retained records and source metadata.

- **Workspace:** a persistent desktop sidebar, compact scrolling navigation on tablet/phone, collection switching, working archive links at every size, a clear current section and a real new-observation action. Radix tab behavior and responsive keyboard orientation are retained.
- **Opening:** a purpose-built Three.js river section with layered terrain, contour lines, restrained moving water and three selectable workflow stages. The illustration is visibly conceptual. It supplies no measurements or location claims. It loads near the viewport, caps pixel ratio, throttles drawing, pauses offscreen/in a hidden tab, honors reduced motion and has a vector fallback. Resources are released on teardown and graphics failure.
- **Notebook:** original note and capture tools are side by side on desktop; capture comes before the form on phones. Inputs, consent, adaptive clarification, explicit confirmation and error feedback retain their existing behavior. Mobile text inputs use 16px type and important touch controls have at least 44px height. Form widths and review search/filter controls are explicitly bounded at 320px.
- **Review:** a searchable ledger with actual review states, retained excerpts and clear receipt access. Empty views offer a next action. The drawer retains original evidence, human reasons, history and exports.
- **Lab:** a readable source column beside the decision brief, checks, media/readings and decisions. The empty-record replay crash was fixed. The empty lab can start a real notebook draft.
- **Insights and field kit:** count summaries precede the source portfolio; paper charts, readable coverage labels, a contained scrolling matrix, photographic contact sheets, city filters, guidance and transfer tools preserve their functions.
- **Visual archive:** editorial source chronology, source-year counts and gaps, credits, full-frame viewing, comparison, geographic context and evidence constellation. All 39 existing source photographs remain available. Historical modeled weather uses the same paper reader and exact-value table.
- **Presentation:** source, assessment, human judgment and receipt chapters use the shared visual language. The source image, original words, example disclosures, retained uncertainty and export controls remain visible.

Presentation styling is organized in `app/journal.css` (tokens/shell), `app/journal-workspace.css` (evidence/context readers), `app/journal-tools.css` (operational views), `app/river-hero.css` (opening) and the scoped `app/observatory.css` (archive). Existing layout primitives remain available. The former global dark skin and two old atmosphere imports no longer govern the app.

## Preserved product boundaries

No API route, provider adapter, assessment schema, storage namespace, calculation, scientific asset or source photograph was changed. Capture/upload, explicit optional-AI consent, local image checks, supplied measurements, uncertainty, citizen confirmation, reviewer decisions/disagreement, history, rules replay, maps, comparison, receipt and JSON/CSV/GeoJSON/field-pack paths remain implemented. Personal and presentation collections stay separate. The nine authored examples and eight recorded AI responses retain their existing labels.

The dependency lock was repaired by adding two missing nested optional build-runtime entries. No application dependency was added. Four generated fixture reports were refreshed by the actual test run.

## Verification

- TypeScript and lint pass. All 20 loaded stylesheets parse. The Git diff has no whitespace errors.
- **423/423 authored software checks pass:** domain94, workspace43, mission34, mocked API56, capture/photo25, lab14, map27, presentation24, brief20, actions29, European context10, presentation workspace10, source weather24, 3D lifecycle7, source archive6.
- Lab contrast assertions now read the styles actually loaded by the root layout. They continue to require 4.5:1 for the inspected text pairs and a visible focus indicator. The missing-media text pair was strengthened rather than lowering its threshold.
- Clean-install dry run passed with the repaired lock. Initial production build and release asset/source-digest checks passed with79offline assets and no configured live AI credentials. Later Groq/source-context verification is recorded below.
- Isolated installed Chrome exercised all six primary sections and all four archive views at 1440, 768 and 390px. Deeper photo, atlas, comparison, lab, chart, graph and presentation views also fit 320px. No application exception was observed in the recorded journeys.
- An explicitly labelled test note completed local checking, uncertainty/confirmation, save, human review, JSON export, reload and rule replay; the original words and review reason remained in the export. The presentation namespace retained its nine independent examples.
- A credited historical photo completed image preparation, retention of source/digest, literal review, explicit historical-photo confirmation and receipt export on a phone. These test records were in disposable browser contexts, not the user's browser profile.
- The historical modeled-weather reader showed its retained seven-day chart, metric switch and exact-value table on desktop/phone, without a live refresh request.
- City/year filtering, catalogue exports, keyboard divider movement, side-by-side viewing, atlas chapters/city switching, source-matched graph cards and all four presentation chapters were exercised. Reduced-motion and forced-WebGL-failure views remained usable.
- A controlled offline production reload retained all 39 archive cards, the selected photograph and the saved example graph. That run produced no browser warnings, errors or application exceptions.

Logs and screenshots are in the ignored `outputs/frontend-rebuild/` directory. Useful final images: `final-1440-overview.png`, `final-390-overview.png`, `final-1440-presentation.png`, `final-390-presentation.png`, `final-390-map.png`, `mobile-historical-receipt.png`. Browser assertions are verification evidence, not environmental evidence or expert review.

## Limits and continuation

Follow-up globe fix (2026-10-04 India / 2026-10-03 UTC): the reported black strips were verified in the unmodified NASA Terra/MODIS 2026-10-02 z0 JPEG. Added the separately labelled NASA Blue Marble August 2004 reference mosaic as the public globe's default and complete-overview layer. Its verified static GIBS contract uses 256px JPEG, zoom0–8, with no requested-day dimension. Daily imagery retains its actual gaps and dates; a nearby explanation and overview action make this distinction visible. The date and original evidence survive switching. No imagery is painted over or merged across dates. Map checks now30/30 and full authored checks426/426; typecheck/lint pass. Actual in-app-browser checks covered intact globe output, zoom/rotation, production rendering and320px layout. `outputs/frontend-rebuild/globe-fixed-production.jpg` is the observed production result. New tile requests require internet and do not become citizen evidence.

Latest follow-up (2026-10-04 India / 2026-10-03 UTC): four user-supplied Groq keys are configured only in ignored server settings with0600permissions. Each key passed official model availability; the actual text/photo route check passed with two upstream200responses using synthetic text and a credited public photo. The production capability endpoint reports the selected Groq text/vision model; local rules and explicit consent remain default. No private observations, new saved AI results or invented reviews were added.

The river artwork now has a perspective camera, deeper raised banks, four substantial paper layers, directional shadows and water highlights. Pointer drag and a keyboard rotation slider work while paused; Perspective, From above, Illustrative layers and Reset change actual scene geometry/camera. The layer view is expressly conceptual, not geological. Resources, capped resolution, visibility/reduced-motion handling and fallback remain. Installed PCFShadowMap replaced a removed shadow constant found during browser QA.

User clarified missing-data scope as verified source context. All39photos now retain seven- and fifteen-day historical weather windows in a new `source-weather-v2.json`:78total,69new genuine public archive requests. Original nine windows and timestamps/v1 remain unchanged. Source-date/digest/request-coordinate/UTC/unit guards remain, and the photo chronicle now exposes the reader for every source. Real field readings, camera GPS/timezone, citizen visits and missing AI/human judgments remain unknown.

Latest verification: **430/430 checks**, TypeScript, lint, production build, whitespace and release validation pass;80offline assets. Source/build and local startup/verification logs contain zero matches for all four configured keys. Actual in-app-browser checks confirm desktop/320px3D controls, paused drag, keyboard rotation, three views and reset. Fresh production 3D/archive views have no browser warnings/errors. A newly covered source shows both retained weather windows, all15exact rows, correct calendar marker/retrieval time and attribution without refreshing. New weather offline inclusion passes release validation; no new offline browser run was made. Screenshots: `outputs/frontend-rebuild/river-3d-final.jpg`, `river-3d-320.jpg`, `source-context-filled-production.jpg`. Source details/limits are recorded in `docs/SOURCES.md`.

Existing large-chunk and framework route-classification build notices remain. Physical camera/video/microphone/GPS permissions, native touch, Safari/Firefox, screen readers, browser-mediated AI consent/submission and deployment were not newly verified. Existing local storage and unauthenticated reviewer limitations remain.

Development preview: `http://127.0.0.1:5173/`; use `/showcase` for the explicitly labelled presentation collection and `/visuals` for the archive. Changes are local and uncommitted. The next step is a user walkthrough of this rebuilt version and any specific visual refinements they request; hosting and submission remain separate work.
