# Geographic river twins — completed implementation and release

Completed2026-10-04 in the existing AquaLens checkout. The user's request was an additional, realistic3Ddigital-twin section for the river locations. The shipped result is a **static geographic reconstruction**, with source data and illustrative detail clearly distinguished. No synchronized sensor system or hydraulically validated model is claimed.

## Published result

- [Dedicated geographic explorer](https://aqualens-ruvn5g3vna-el.a.run.app/twins?collection=showcase).
- [Presentation workspace](https://aqualens-ruvn5g3vna-el.a.run.app/showcase) → **3D River twins**, the sixth destination among seven sections.
- The photographic archive links to the explorer while preserving collection routing. Personal and presentation observations remain separate.
- Cloud Run revision `aqualens-00002-7l8`, serving100%traffic. Build `a06ffcc6-629a-416f-98e4-41f682d6fc47` succeeded; digest `sha256:4eba68cc3092618ee4d07408f7666db162695914f6c7474139e58be467198297`.

## Source-backed geography

| Model | Reach window | Retained map features | Building footprints | Tree points | Explicit height tags | Mapped levels |
| --- | --- | --- | --- | --- | --- | --- |
| Mondego / Coimbra |1700m|6026|2877|1094|2|1426|
| Garonne / Toulouse |1700m|12791|5192|4361|8|1220|
| Hoffselva / Oslo |1400m|3261|1728|498|1|415|

Counts describe retained map data. Buildings crossing the scene boundary are omitted from rendering; polygons are clipped to the terrain block. They are not counts of surveyed/current objects or exact rendered meshes.

The three project-selected reach centers are checked against returned named river geometry. Hoffselva uses its western-Oslo reach, rather than the earlier city-overview marker. No photograph camera positions or citizen visits are assigned.

Elevation comes from actual retained zoom13Mapzen/Tilezen Terrarium tiles. RGB heights are decoded before resampling into a129×129mesh, with1:1vertical scale. Cropped source samples are116×116,123×123and146×146pixels. The annual2021Sentinel-2RGB surface comes from retained ESA WorldCover/Terrascope zoom14tiles, with233×233,246×246and292×292source crops, resized to1024×1024display JPEGs. Resizing does not create survey resolution. Data acquisition dates/local accuracy are not independently established; imagery and maps represent different times.

Six bounded public Overpass requests supplied mapped geometry and water relations. The initial source snapshot timestamp is2026-10-04T05:26:02Z. Coimbra/Toulouse each retain one stitched closed river relation; Toulouse's inner island rings survive. Oslo supplied no closed river relation and its stream ribbon width is a disclosed display approximation. Culverted stream lines are not rendered as open water. Source JSON keeps original OSM IDs/tags and exact request URLs, fetch times and SHA-256 digests.

Adapted OSM extracts remain downloadable under ODbL. ESA/Copernicus and terrain-provider credits ship with the assets. Source links are visible inside the scene, including fullscreen; expanded provenance distinguishes elevation, annual imagery, mapped geometry and illustration. Full notices: `public/river-twins/CREDITS.md`; claim/source record: `docs/SOURCES.md`.

## Experience and implementation

`components/river-twins.tsx`, `app/river-twins.css`, `lib/river-twins.ts` and `lib/river-twin-scene.ts` implement the explorer. `/twins` is a server page containing a lazy client scene. Existing workspace/navigation/archive components integrate it without changing observation schemas or review logic.

Three.js supplies perspective rendering, sourced terrain texture, merged footprint buildings, procedural windows, mapped tree instances, river surfaces, mapped bridge routes, shadows and illustrative lighting. A water overlay follows the terrain tessellation within retained river boundaries to prevent DEM interpolation from appearing as false islands; this does not establish a measured water surface. Terrain block walls and the lower plinth are display geometry, not a geological section.

Controls provide Aerial/River focus/From above, manual orbit and zoom, keyboard rotation/zoom buttons, optional slow orbit, reset, four layer switches, light adjustment and fullscreen. Pointer picking returns the actual mapped identity or selected terrain point. Named structures can be inspected through a native dropdown. Height provenance remains visible: source tag, mapped levels×illustrative3.2m, or8mwith source height unknown. Source tags themselves are not independently surveyed. Downloaded source receipts include terrain, imagery, OSM and water-relation request metadata.

The renderer caps pixel ratio and drawing frequency, batches buildings/roads/water, instances trees, suspends offscreen/hidden rendering and disposes GPU resources/listeners. Reduced-motion preference suppresses automatic orbit and water shimmer. Source validation/loading errors or graphics-context loss expose fallback imagery/source details and retry. These mechanisms are implemented; untested failure/device cases are listed below.

Window patterns, roof/material colors, tree shapes/dimensions, unspecified building heights, road widths, bridge elevations, line-only stream widths, lighting and water shimmer are illustrative. Live water levels, flow, riverbed bathymetry, registered photo geometry and exact facades remain unavailable. No safety/pollutant/ecological conclusion is derived from the scene.

Preparation scripts: `scripts/prepare-river-twins.mjs` and `scripts/complete-river-water.mjs`, also available as `npm run prepare:twins`. They retain bounded source caches under ignored `.sites-runtime/river-twin-sources/`; published JSON/textures are in `public/river-twins/`. Repeating preparation preserves recorded retrieval dates rather than presenting cached data as newly fetched.

## Verification

- **455/455 authored checks passed:**430existing plus25new geographic-source/geometry checks. New checks cover real dataset schemas, surface digests, named river presence, coordinate round-trips, bounded terrain sampling, clipped water, source/estimated heights, rejected missing elevations and retained relation/island geometry. These are software checks, not surveying or a performance/scientific benchmark.
- TypeScript, full lint, standalone production build and Git whitespace passed. Later release/hosted verification scripts separately passed lint. Existing large-chunk and Vinext notices remain.
- Release inventory:325uploaded source files,2,898standalone files, four configured credentials checked, zero matches. All42retained photograph digests(including39European sources),78weather windows and three geographic models/textures/credits are intact. Worker inventory contains91assets/24,663,923bytes and `/twins` navigation support. Proof: `.sites-runtime/river-twin-release-check.json`.
- Actual local and hosted in-app browser rendered all three scenes without application warnings/errors. Camera presets, rotation/zoom, layer switches, orbit/reset and fullscreen were exercised. Clicking the Mondego surface returned mapped `relation/19605559`; the named-building inspector showed `Skøyen kirke`, its OSM identity, terrain estimate and unknown source height. Workspace and archive links preserve the showcase query. The archive/dedicated explorer fit320px without horizontal overflow and retained one active canvas.
- Browser source exports for Coimbra/Oslo downloaded successfully and matched the retained source metadata exactly, including water-relation requests. The browser automation's download-event waiter timed out, but the actual downloads were present and independently validated. Proof: `outputs/river-twins/source-export-verification.json`.
- Hosted route/asset checks at2026-10-04T06:13:19.678Z returned200for main pages, archive, dedicated explorer, manifest/worker and seven geographic assets. All seven assets were byte-identical to validated local files. Proof: `.sites-runtime/river-twin-hosted-verification.json`.
- Bounded live AI verification at2026-10-04T06:14:53.398Z returned200and validated Groq `qwen/qwen3.8-27b` responses for text and a credited public photo. Unrelated-origin POST403. Only the previously approved labelled synthetic note/public photograph derivative were sent; no citizen record or human review was created. Proof: `.sites-runtime/cloud-run-verification.json`, with earlier proof preserved in `.sites-runtime/cloud-run-verification-before-twins.json`.
- The new deployment preserves the runtime identity, four version1Secret Manager references, provider settings and public access. No new credential provisioning or IAM changes were made. Server-only keys remain absent from the release content. Scaling remains as described in `GOOGLE_CLOUD_DEPLOYMENT.md`; no cost cap is claimed.

Screenshots: `outputs/river-twins/mondego-hosted.png`, `garonne-hosted.png`, `hoffselva-hosted.png`, `workspace-hosted.png`. Logs: `outputs/river-twin-*.log`. Prepared test/verification scripts are retained in `scripts/`.

## Boundaries and continuity

This release does not change original observations, source photographs, recorded AI responses or weather bundles. It introduces retained geographic context and presentation approximations. Browser-local storage and unauthenticated reviewer roles remain.

A fresh offline browser reload, physical touch-device test, Safari/Firefox, screen readers, forced WebGL failure/context restoration and reduced-motion device run were not performed for this feature. Release inventory and code paths are not substitutes for those checks. The full browser AI consent/submission journey was not newly repeated; hosted text/photo routes were tested directly. Exact facade reconstruction would require suitable source surveys/photogrammetry; an operational twin would require real instrumentation, hydraulic data and validation.

The timestamp-free master video script now includes the geographic section and corrected check/navigation counts, totaling22,041words. Recording notes remain in `AQUALENS_SCRIPT_EVIDENCE.md`. No competition outcome, submission or scientific-validation result is claimed.

Requested implementation and publishing are complete. Remaining user decisions include recording, a commit/push, a custom domain and competition submission. Current local changes remain uncommitted.
