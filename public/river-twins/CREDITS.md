# AquaLens geographic river reconstructions

These are static geographic reconstructions of three bounded river reaches, prepared2026-10-04. They do not contain live sensor measurements, hydraulic models, bathymetry, registered camera positions or surveyed facade detail.

## Source map geometry

© OpenStreetMap contributors, available under the Open Database Licence (ODbL).

https://www.openstreetmap.org/copyright
https://opendatacommons.org/licenses/odbl/1-0/

The retained JSON files contain coordinate-transformed extracts of building footprints, water shapes, waterways, roads, bridges and mapped tree points. These adapted map extracts are available under ODbL. Every mapped feature keeps its OSM identity and tags. Exact public Overpass request URLs, source snapshot time, retrieval time and SHA-256 digest are in the corresponding model JSON. Water relations retain outer and inner rings; islands are not intentionally filled.

The river-reach centers are project-selected geographic windows checked against named river geometry. They are not the photograph's camera position or official research stations. Existing city-overview coordinates are not substituted for the river, particularly Hoffselva in western Oslo.

## Surface imagery

© ESA WorldCover project2021 / Contains modified Copernicus Sentinel data(2021) processed by the ESA WorldCover consortium. Annual RGB composite served by Terrascope/VITO. CC BY4.0.

https://esa-worldcover.org/en/data-access
https://remotesensing.vito.be/news/simplify-your-processing-worldcover-annual-composites
https://creativecommons.org/licenses/by/4.0/

Original PNG tiles are retained in the preparation cache with URLs, dates and digests. Display images are cropped and resampled to1024×1024JPEG. Original source crops contain233×233pixels(Coimbra),246×246(Toulouse),292×292(Oslo); increasing display texture size does not increase source resolution. This is a historical annual composite, not a current aerial survey or photogrammetric reconstruction.

## Elevation

Mapzen / Tilezen Terrain Tiles, public AWS dataset, Terrarium encoding. Sources and their required attribution are documented at:

https://registry.opendata.aws/terrain-tiles/
https://github.com/tilezen/joerd/blob/master/docs/attribution.md
https://github.com/tilezen/joerd/blob/master/docs/data-sources.md

The worldwide source collection's provider attribution is reproduced here:

- ArcticDEM terrain data DEM(s) were created from DigitalGlobe, Inc., imagery and funded under National Science Foundation awards1043681,1559691,and1542736.
- Australia terrain data © Commonwealth of Australia(Geoscience Australia)2017.
- Austria terrain data © offene Daten Österreichs – Digitales Geländemodell(DGM) Österreich.
- Canada terrain data contains information licensed under the Open Government Licence – Canada.
- Europe terrain data produced using Copernicus data and information funded by the European Union – EU-DEM layers.
- Global ETOPO1 terrain data U.S. National Oceanic and Atmospheric Administration.
- Mexico terrain data source: INEGI, Continental relief,2016.
- New Zealand terrain data Copyright2011Crown copyright(c) Land Information New Zealand and the New Zealand Government(All rights reserved).
- Norway terrain data © Kartverket.
- United Kingdom terrain data © Environment Agency copyright and/or database right2015.All rights reserved.
- United States3DEP(formerly NED) and global GMTED2010and SRTM terrain data courtesy of the U.S.Geological Survey.

These credits describe the source collection. The exact contributing DEM at each local sample and acquisition date have not been independently established. Regional accuracy is not independently surveyed. RGB heights are decoded before bilinear resampling to a129×129mesh. Default vertical scale is1:1; the terrain block's lower plinth is presentation geometry, not a geological cross-section. Model-selected positions and elevation values are geographic context, not instrument observations.

## Illustrative rendering

Buildings use mapped footprints. Explicit OSM height tags are used where available; tags are not independently surveyed. Otherwise, mapped levels use an illustrative3.2metres/level, or unknown heights use8metres. Window patterns, roofs/material colors, tree dimensions, lighting and water shimmer are illustrative. Mapped tree points retain source positions but do not imply a surveyed tree shape or current tree presence. Line-only watercourses use a labelled narrow ribbon where width is missing. Bridge deck elevation and road width are display approximations. Culverted stream lines are not shown as open surface water.

Source maps and imagery have different dates. Combining them does not establish one synchronous surveyed scene. No source photograph is altered by creating these assets. Photo-specific credits are in `/images/references/CREDITS.md`.

Each model's source receipt and full JSON are downloadable in the interface. Local preparation scripts preserve retained source dates when repeated.
