# Graph Report - three_v003  (2026-08-18)

## Corpus Check
- 7 files · ~142,453 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 147 nodes · 214 edges · 11 communities
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `22b7b92f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Weather Sky Shader
- GIS Laser Raymarch
- Day-Night PBR Lighting
- 1.机器人移动 / 机器人漫游
- Park Night Online Refs
- Materials Bloom Gallery
- Laser Postprocessing
- GIS Loaders CSS2D
- Lab Gallery Docs Site
- loading-overlay.js

## God Nodes (most connected - your core abstractions)
1. `Local Demo Catalog (list)` - 19 edges
2. `Online Refs Catalog (refs)` - 17 edges
3. `3.昼夜天气场景` - 9 edges
4. `5.晴阴雷电晚霞天空` - 9 edges
5. `11.真实光照 · Time of Day` - 9 edges
6. `4.动态天空` - 8 edges
7. `9.园区夜景 · Tech Park Night` - 8 edges
8. `render()` - 7 edges
9. `maybeHide()` - 7 edges
10. `1.机器人移动 / 机器人漫游` - 7 edges

## Surprising Connections (you probably didn't know these)
- `README.en.md Gitee Template` --conceptually_related_to--> `threeDemo Three.js Experiment Collection`  [INFERRED]
  README.en.md → README.md
- `demo Online (sandbox)` --conceptually_related_to--> `1.机器人移动 / 机器人漫游`  [AMBIGUOUS]
  zhtml/demo Online.html → zhtml/1.机器人移动.html
- `4.动态天空` --semantically_similar_to--> `16.体积云天空 · three-clouds`  [INFERRED] [semantically similar]
  zhtml/4.动态天空.html → zhtml/16.体积云天空.html
- `9.园区夜景 · Tech Park Night` --semantically_similar_to--> `7.能量流动 · 电厂`  [INFERRED] [semantically similar]
  zhtml/9.园区夜景.html → zhtml/7.能量流动.html
- `1.机器人移动 / 机器人漫游` --semantically_similar_to--> `2.机器人移动可移动视角`  [INFERRED] [semantically similar]
  zhtml/1.机器人移动.html → zhtml/2.机器人移动可移动视角.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **UnrealBloomPass / EffectComposer Glow Demos** — zhtml_3_demo, zhtml_7_demo, zhtml_9_demo, zhtml_12_demo, zhtml_13_demo, zhtml_18_demo [INFERRED 0.85]
- **Procedural Sky Weather Atmosphere Demos** — zhtml_3_demo, zhtml_4_demo, zhtml_5_demo, zhtml_11_demo, zhtml_16_demo [INFERRED 0.85]
- **Particle-Based VFX Demos** — zhtml_6_demo, zhtml_8_demo, zhtml_12_demo, zhtml_14_demo [INFERRED 0.75]

## Communities (11 total, 0 thin omitted)

### Community 0 - "Weather Sky Shader"
Cohesion: 0.25
Nodes (8): FBM Procedural Clouds, FogExp2 Weather Atmosphere, Lightning Flash State Machine, OrbitControls, Rain Points Particles, Custom Shader Sky Dome, Weather Presets sunny/sunset/overcast/rain/thunderstorm, Three.js Multi-Weather Procedural Sky

### Community 1 - "GIS Laser Raymarch"
Cohesion: 0.17
Nodes (13): AdditiveBlending Glow, 12.激光特效, EffectComposer, Laser Trail Particles, BokehPass Depth of Field, 13.后期处理特效 · Post Processing, EffectComposer, OutlinePass (+5 more)

### Community 2 - "Day-Night PBR Lighting"
Cohesion: 0.11
Nodes (23): 24h Day-Night Cycle, 11.真实光照 · Time of Day, FBM Procedural Clouds, MeshPhysicalMaterial PBR, Physical Sky Atmospheric Scattering, PMREM Real-time IBL, 24h Day-Night Cycle, 3.昼夜天气场景 (+15 more)

### Community 3 - "1.机器人移动 / 机器人漫游"
Cohesion: 0.25
Nodes (9): AABB Obstacle Collision, 1.机器人移动 / 机器人漫游, GLTFLoader, Third-Person Follow Camera, WASD Character Movement, 2.机器人移动可移动视角, GLTFLoader, Movement Accel/Decel Transition (+1 more)

### Community 4 - "Park Night Online Refs"
Cohesion: 0.12
Nodes (18): 9.园区夜景 · Tech Park Night, EffectComposer, Tech Park Night Scene, THREE.Water, Online Refs Catalog (refs), BigDataView, EZ-Tree, Laas · Fable5 World (+10 more)

### Community 5 - "Materials Bloom Gallery"
Cohesion: 0.27
Nodes (14): UnrealBloomPass, UnrealBloomPass, 18.材质特效集锦, Pipe Energy Flow Shader, 55 Material Gallery, MeshPhysicalMaterial PBR, UnrealBloomPass, UnrealBloomPass (+6 more)

### Community 6 - "Laser Postprocessing"
Cohesion: 0.10
Nodes (23): 15.熔岩焦土, FBM Procedural Terrain, Tunable Ray Steps Performance, Raymarching Lava River, 16.体积云天空 · three-clouds, Cloud Raymarching, @takram/three-atmosphere, @takram/three-clouds Volumetric Clouds (+15 more)

### Community 7 - "GIS Loaders CSS2D"
Cohesion: 0.18
Nodes (11): CSS2DRenderer, 10.真实GIS地形 · 合肥, Esri Satellite Imagery, Real GIS Terrain Mesh, AWS Terrarium DEM Tiles, demo Online (sandbox), DRACOLoader, GLTFLoader (+3 more)

### Community 9 - "Lab Gallery Docs Site"
Cohesion: 0.50
Nodes (4): README.en.md Gitee Template, GitHub Pages docs/ Static Site, raw.githubusercontent.com Asset Linking, threeDemo Three.js Experiment Collection

### Community 40 - "loading-overlay.js"
Cohesion: 0.20
Nodes (20): bumpJob(), cancel(), constructor(), done(), endJob(), fileLabel(), formatBytes(), formatEta() (+12 more)

## Ambiguous Edges - Review These
- `1.机器人移动 / 机器人漫游` → `demo Online (sandbox)`  [AMBIGUOUS]
  zhtml/demo Online.html · relation: conceptually_related_to

## Knowledge Gaps
- **67 isolated node(s):** `GitHub Pages docs/ Static Site`, `README.en.md Gitee Template`, `FBM Procedural Clouds`, `FogExp2 Weather Atmosphere`, `Rain Points Particles` (+62 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `1.机器人移动 / 机器人漫游` and `demo Online (sandbox)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Local Demo Catalog (list)` connect `Laser Postprocessing` to `GIS Laser Raymarch`, `Day-Night PBR Lighting`, `1.机器人移动 / 机器人漫游`, `Park Night Online Refs`, `Materials Bloom Gallery`, `GIS Loaders CSS2D`?**
  _High betweenness centrality (0.410) - this node is a cross-community bridge._
- **Why does `Online Refs Catalog (refs)` connect `Park Night Online Refs` to `Day-Night PBR Lighting`, `Laser Postprocessing`, `GIS Loaders CSS2D`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Why does `10.真实GIS地形 · 合肥` connect `GIS Loaders CSS2D` to `Laser Postprocessing`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `3.昼夜天气场景` (e.g. with `11.真实光照 · Time of Day` and `5.晴阴雷电晚霞天空`) actually correct?**
  _`3.昼夜天气场景` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `5.晴阴雷电晚霞天空` (e.g. with `4.动态天空` and `3.昼夜天气场景`) actually correct?**
  _`5.晴阴雷电晚霞天空` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `11.真实光照 · Time of Day` (e.g. with `3.昼夜天气场景` and `4.动态天空`) actually correct?**
  _`11.真实光照 · Time of Day` has 3 INFERRED edges - model-reasoned connections that need verification._