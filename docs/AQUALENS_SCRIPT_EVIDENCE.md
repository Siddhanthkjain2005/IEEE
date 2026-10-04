# Master script evidence and recording notes

Prepared 2026-10-04 against the local implementation, retained verification artifacts and completed Google Cloud deployment.

The deliverable is [AQUALENS_FULL_VIDEO_SCRIPT.txt](AQUALENS_FULL_VIDEO_SCRIPT.txt): 22,041 words of continuous spoken prose, without timecodes, outline headings or bullet instructions. At120–150spoken words/minute, the reading alone takes approximately147–184minutes. Clicks, loading and inspection pauses add time. This is a master rehearsal/deep-dive script; no claim is made about the competition's allowed submission-video length.

The script's first-person actions tell the presenter what to show. Read the actual selected source and live result; do not narrate a candidate, object or review state that is absent. Example records can change after edits. Display no credentials, private cloud console information or personal observations while recording. The script contains no provider key values, cloud account email, project identifier or numeric primary-URL identifier.

## Coverage

| Website area | Script coverage |
| --- | --- |
| Opening and navigation | Brand, fonts, colors, collection isolation, seven sections, counters, mobile navigation, hero actions |
| Interactive river | Drag, pause, keyboard rotation, reset, three views, markers, geometry, shadows, rendering limits, lifecycle and fallback |
| Overview | Search, filters, progressive source cards, photo inspector, zoom, grid, annotations, AI overlays, comparison, evidence flow |
| Field notebook | Original note, site/time/appearance, historical source distinction, capture/upload, media limits, guide overlay, local heuristics, coordinates, readings, context, follow-ups |
| AI and confirmation | Separate consent, live Groq, recorded Gemini, constrained schemas, exact quotes, uncertainty/dismissal, candidate provenance, confirmation and save |
| Review desk | Search/status filters, receipt, original evidence, media identity, support/disagree/uncertain with reason, review actions, local-role limitation, history and linked visits |
| Evidence lab | Record selector, original column, four tabs, replay, reference time, media methods, readings, decisions, generated test reports and empty states |
| Receipt layers | All five layers, stack/separate, actual retained contents, no implied scientific approval |
| Insights and actions | Scope/city/status/day filters, cards, workflow distribution, coverage denominators, source activity, saving activity, matrix, diagnostics, reasoned review/follow-up actions |
| Field kit and transfer | Preparation, source guidance, credited gallery, field packs, media inclusion, import preview/conflicts/rollback, CSV, GeoJSON, schematic river and timelines |
| Archive | Chronicle, source years/gaps, formats, full frames, filmstrip, source credits, catalogue export, comparison, graph/list and four presentation chapters |
| Historical weather | All78windows, seven/fifteen days, metrics/table, UTC, source-date marker, city/grid distinction, retrieval provenance, refresh, nulls and contextual limits |
| Explore Earth | Globe/flat, exact versus city locations, NASA reference/daily coverage, streets, annual2021composite, date controls, location index, current weather, research links and fallback |
| River Atlas | Three river groups, Look/Question/Decide, full frame/crop, exact-source AI association, dispositions, saved receipt/start review, dialog behavior |
| Geographic river twins | Three retained river reaches, sourced DEM and annual imagery, OSM footprints/river geometry, camera and layer controls, feature inspector, source receipts and explicitly estimated visual details |
| Architecture | React/TypeScript/Vinext/Vite, routes, data model, Zod, storage, digests, graphics/chart libraries, responsive layout, offline asset scope |
| AI implementation | Capability/consent scope, server routes, schemas, fixed questions, untrusted input, bounded attempts, failures,401-only credential backup, no quota bypass |
| Deployment | Container, non-root server, Cloud Run, Secret Manager, runtime access, service worker packaging, public alias, successful bounded hosted text/photo proof |
| Validation and defense |455authored checks, browser proof, physical-device gaps, live connectivity limits, pilot/evaluation proposals, detailed judging Q&A and closing |

## Implementation and proof sources

The code establishes what is implemented. `PROJECT_CONTEXT.md`, `docs/FRONTEND_REBUILD_2026-10-03.md`, and `docs/GOOGLE_CLOUD_DEPLOYMENT.md` summarize dated verification. `.sites-runtime/cloud-run-verification.json` records successful hosted requests. The older demo guide contains stale provider/deployment/weather wording and was not treated as current implementation evidence.

Key inspected implementation files include `components/streamcheck.tsx`, `components/field-studio.tsx`, `components/evidence-lab.tsx`, `components/evidence-insights.tsx`, `components/receipt-layers.tsx`, `components/collection-tools.tsx`, `components/field-guide.tsx`, `components/river-observatory.tsx`, `components/visual-observatory.tsx`, `lib/field.ts`, `lib/ai-provider.ts`, `package.json`, `components/river-twins.tsx`, `lib/river-twins.ts`, `lib/river-twin-scene.ts`, and `Dockerfile`.

## External references

External source claims and limitations are maintained in `docs/SOURCES.md`. Primary references relevant to the script include:

- [NASA Blue Marble](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/) and [NASA GIBS access](https://nasa-gibs.github.io/gibs-api-docs/access-basics/): historical reference imagery versus dated source tiles; the actual coverage diagnosis is recorded separately from the general documentation.
- [Open-Meteo historical weather](https://open-meteo.com/en/docs/historical-weather-api): contextual model data, units and source requests; retained bundle counts come from this repository.
- [ESA WorldCover data access](https://esa-worldcover.org/en/data-access): the historical annual composite; not a current scene or implemented water-index calculation.
- [Groq model documentation](https://console.groq.com/docs/model/qwen/qwen3.8-27b), [structured outputs](https://console.groq.com/docs/structured-outputs), and [rate limits](https://console.groq.com/docs/rate-limits): provider contracts; actual success comes from bounded route verification.
- [Cloud Run runtime contract](https://docs.cloud.google.com/run/docs/container-contract) and [secret configuration](https://docs.cloud.google.com/run/docs/configuring/services/secrets): hosting conventions; deployed settings come from the completed deployment record.
- Image-specific authors, licences and source pages: `public/images/references/CREDITS.md`.

NASA, Cloud Run runtime, and Cloud Run secret documentation were reopened during script preparation on2026-10-04. Other source checks are dated in `docs/SOURCES.md`; no new research claim or model benchmark was inferred.

## Claim boundaries

The script never guarantees a competition result. It distinguishes implemented capabilities, successful bounded checks, untested devices, proposed evaluations and future roadmap work. No pilot outcomes, scientific accuracy, authenticated reviewer roles, shared cloud database, custom training, sensor-synchronized or hydraulically validated river twin, disease detection or water-safety certification are claimed. Cloud revision scaling is not described as a monetary cap. Source metadata is not presented as independently verified camera time or GPS.

The original script required no production changes or AI calls. The later user-requested geographic river section was implemented and published separately; its spoken explanation is now included. Deployment and verification are recorded in RIVER_TWINS_2026-10-04.md. No competition submission was performed.
