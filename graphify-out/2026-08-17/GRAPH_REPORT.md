# Graph Report - three_v003  (2026-08-17)

## Corpus Check
- 7 files · ~140,167 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 186 nodes · 269 edges · 10 communities
- Extraction: 76% EXTRACTED · 23% INFERRED · 1% AMBIGUOUS · INFERRED: 62 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cbdd1037`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Weather Sky Shader
- GIS Laser Raymarch
- Day-Night PBR Lighting
- Park Night Online Refs
- Materials Bloom Gallery
- Laser Postprocessing
- GIS Loaders CSS2D
- Lab Gallery Docs Site
- loading-overlay.js
- 6.灰尘雾气

## God Nodes (most connected - your core abstractions)
1. `Local Demo Catalog (list)` - 19 edges
2. `Online Refs Catalog (refs)` - 17 edges
3. `Vue2 Project Card Catalog` - 16 edges
4. `3.昼夜天气场景` - 9 edges
5. `5.晴阴雷电晚霞天空` - 9 edges
6. `11.真实光照 · Time of Day` - 9 edges
7. `4.动态天空` - 8 edges
8. `9.园区夜景 · Tech Park Night` - 8 edges
9. `render()` - 7 edges
10. `maybeHide()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Three.js Multi-Weather Procedural Sky` --semantically_similar_to--> `5. Multi-Weather Sky Demo`  [INFERRED] [semantically similar]
  .cursor/skills/threejs-weather-sky/SKILL.md → docs/5.晴阴雷电晚霞天空.html
- `FBM Procedural Clouds` --semantically_similar_to--> `ShaderMaterial Gradient Sky FBM Clouds`  [INFERRED] [semantically similar]
  .cursor/skills/threejs-weather-sky/SKILL.md → docs/4.动态天空.html
- `README.en.md Gitee Template` --conceptually_related_to--> `threeDemo Three.js Experiment Collection`  [INFERRED]
  README.en.md → README.md
- `5. Multi-Weather Sky Demo` --shares_data_with--> `Weather Presets sunny/sunset/overcast/rain/thunderstorm`  [INFERRED]
  docs/5.晴阴雷电晚霞天空.html → .cursor/skills/threejs-weather-sky/SKILL.md
- `4.动态天空` --semantically_similar_to--> `16.体积云天空 · three-clouds`  [INFERRED] [semantically similar]
  zhtml/4.动态天空.html → zhtml/16.体积云天空.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Procedural FBM Shader Sky Weather Pattern** — docs_4_dynamic_sky_demo, docs_5_weather_sky_demo, _cursor_skills_threejs_weather_sky_skill_weather_sky, docs_11_real_lighting_sky [INFERRED 0.85]
- **EffectComposer UnrealBloomPass Glow Stack** — docs_3_daynight_weather_effectcomposer, docs_7_energy_flow_bloom, docs_9_park_night_bloom, docs_12_laser_fx_trail_bloom, docs_13_postprocessing_effectcomposer [EXTRACTED 1.00]
- **Shader Points Atmospheric Particle Effects** — docs_6_dust_fog_demo, docs_8_wind_demo, docs_12_laser_fx_demo, docs_14_laser_tunnel_demo, _cursor_skills_threejs_weather_sky_skill_rain_particles [INFERRED 0.75]
- **UnrealBloomPass / EffectComposer Glow Demos** — zhtml_3_demo, zhtml_7_demo, zhtml_9_demo, zhtml_12_demo, zhtml_13_demo, zhtml_18_demo [INFERRED 0.85]
- **Procedural Sky Weather Atmosphere Demos** — zhtml_3_demo, zhtml_4_demo, zhtml_5_demo, zhtml_11_demo, zhtml_16_demo [INFERRED 0.85]
- **Particle-Based VFX Demos** — zhtml_6_demo, zhtml_8_demo, zhtml_12_demo, zhtml_14_demo [INFERRED 0.75]

## Communities (10 total, 0 thin omitted)

### Community 0 - "Weather Sky Shader"
Cohesion: 0.13
Nodes (20): FBM Procedural Clouds, FogExp2 Weather Atmosphere, Lightning Flash State Machine, OrbitControls, Rain Points Particles, Custom Shader Sky Dome, Weather Presets sunny/sunset/overcast/rain/thunderstorm, Three.js Multi-Weather Procedural Sky (+12 more)

### Community 1 - "GIS Laser Raymarch"
Cohesion: 0.09
Nodes (28): 10. Real GIS Terrain Hefei Demo, Esri Satellite Imagery Drape, AWS Terrarium DEM Tiles, 12. Laser Effects Demo, Laser Trail Particles AdditiveBlending Bloom, 13. Post-Processing Effects Demo, EffectComposer Full Pipeline, OutlinePass BokehPass Bloom LUT Film Halftone (+20 more)

### Community 2 - "Day-Night PBR Lighting"
Cohesion: 0.11
Nodes (23): 24h Day-Night Cycle, 11.真实光照 · Time of Day, FBM Procedural Clouds, MeshPhysicalMaterial PBR, Physical Sky Atmospheric Scattering, PMREM Real-time IBL, 24h Day-Night Cycle, 3.昼夜天气场景 (+15 more)

### Community 4 - "Park Night Online Refs"
Cohesion: 0.12
Nodes (18): 9.园区夜景 · Tech Park Night, EffectComposer, Tech Park Night Scene, THREE.Water, Online Refs Catalog (refs), BigDataView, EZ-Tree, Laas · Fable5 World (+10 more)

### Community 5 - "Materials Bloom Gallery"
Cohesion: 0.27
Nodes (14): UnrealBloomPass, UnrealBloomPass, 18.材质特效集锦, Pipe Energy Flow Shader, 55 Material Gallery, MeshPhysicalMaterial PBR, UnrealBloomPass, UnrealBloomPass (+6 more)

### Community 6 - "Laser Postprocessing"
Cohesion: 0.08
Nodes (28): AdditiveBlending Glow, 12.激光特效, EffectComposer, Laser Trail Particles, BokehPass Depth of Field, 13.后期处理特效 · Post Processing, EffectComposer, OutlinePass (+20 more)

### Community 7 - "GIS Loaders CSS2D"
Cohesion: 0.11
Nodes (20): CSS2DRenderer, 10.真实GIS地形 · 合肥, Esri Satellite Imagery, Real GIS Terrain Mesh, AWS Terrarium DEM Tiles, AABB Obstacle Collision, 1.机器人移动 / 机器人漫游, GLTFLoader (+12 more)

### Community 9 - "Lab Gallery Docs Site"
Cohesion: 0.29
Nodes (7): OrbitControls GLTFLoader RGBELoader Imports, demo Online ShaderMaterial Sandbox, THREE.JS LAB Project Gallery, README.en.md Gitee Template, GitHub Pages docs/ Static Site, raw.githubusercontent.com Asset Linking, threeDemo Three.js Experiment Collection

### Community 40 - "loading-overlay.js"
Cohesion: 0.24
Nodes (18): bumpJob(), cancel(), constructor(), done(), endJob(), fileLabel(), formatBytes(), formatEta() (+10 more)

### Community 155 - "6.灰尘雾气"
Cohesion: 0.29
Nodes (8): 6.灰尘雾气, Dust and Fog Particles, THREE.Points Particles, Wind Turbulence Advection, 8.风 · 风扇喷射, Fan Conical Jet Particles, THREE.Points Particles, Wind Turbulence Advection

## Ambiguous Edges - Review These
- `demo Online ShaderMaterial Sandbox` → `THREE.JS LAB Project Gallery`  [AMBIGUOUS]
  docs/demo Online.html · relation: conceptually_related_to
- `1.机器人移动 / 机器人漫游` → `demo Online (sandbox)`  [AMBIGUOUS]
  zhtml/demo Online.html · relation: conceptually_related_to

## Knowledge Gaps
- **76 isolated node(s):** `GitHub Pages docs/ Static Site`, `README.en.md Gitee Template`, `FogExp2 Weather Atmosphere`, `Rain Points Particles`, `Lightning Flash State Machine` (+71 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `demo Online ShaderMaterial Sandbox` and `THREE.JS LAB Project Gallery`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `1.机器人移动 / 机器人漫游` and `demo Online (sandbox)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Local Demo Catalog (list)` connect `Laser Postprocessing` to `Day-Night PBR Lighting`, `Park Night Online Refs`, `Materials Bloom Gallery`, `GIS Loaders CSS2D`, `6.灰尘雾气`?**
  _High betweenness centrality (0.255) - this node is a cross-community bridge._
- **Why does `Online Refs Catalog (refs)` connect `Park Night Online Refs` to `Day-Night PBR Lighting`, `Laser Postprocessing`, `GIS Loaders CSS2D`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `Vue2 Project Card Catalog` connect `GIS Laser Raymarch` to `Weather Sky Shader`, `Lab Gallery Docs Site`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `3.昼夜天气场景` (e.g. with `11.真实光照 · Time of Day` and `5.晴阴雷电晚霞天空`) actually correct?**
  _`3.昼夜天气场景` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `5.晴阴雷电晚霞天空` (e.g. with `4.动态天空` and `3.昼夜天气场景`) actually correct?**
  _`5.晴阴雷电晚霞天空` has 3 INFERRED edges - model-reasoned connections that need verification._