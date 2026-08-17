# Graph Report - three_v003  (2026-08-17)

## Corpus Check
- 66 files · ~2,217,988 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1132 nodes · 2289 edges · 70 communities (64 shown, 6 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 131 edges (avg confidence: 0.72)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d39363d9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Weather Sky Shader
- GIS Laser Raymarch
- Day-Night PBR Lighting
- Volumetric Clouds Lava
- Park Night Online Refs
- Materials Bloom Gallery
- Laser Postprocessing
- GIS Loaders CSS2D
- Robot Character Control
- Lab Gallery Docs Site
- motorcycle-parts.js
- source/race-car-model.js
- selftest.js
- weather-volume-clouds/source/geospatial/index.ts
- cloud-effect.bundle.js
- stylized-above-below-ocean/scene.js
- CloudsEffect.ts
- lut-aerial-perspective/source/atmosphere/AerialPerspectiveEffect.ts
- ivy.ts
- weather-volume-clouds/source/atmosphere/AerialPerspectiveEffect.ts
- Ellipsoid
- weather-volume-clouds/source/geospatial/DataLoader.ts
- building-system.js
- LensFlareEffect
- atmosphere-effect.bundle.js
- resolveIncludes
- Rectangle
- ivy-effect.bundle.js
- CloudsEffect
- lut-aerial-perspective/source/atmosphere/getSunLightColor.ts
- lut-aerial-perspective/source/geospatial/DataLoader.ts
- Volumetric fluid fire
- source/submarine-model.js
- underwater-snell-ocean.bundle.js
- Ellipsoid
- VolumetricFluidFire.ts
- update
- .add
- VolumetricFluidFire
- finish
- AerialPerspectiveEffect
- CloudLayers.ts
- LensFlareEffect
- medium.ts
- water-volume-system.js
- volumetric-fluid-fire.bundle.js
- constructor
- CascadedShadowMaps.ts
- CloudsPass
- gpu-culled-flower-field.bundle.js
- interface-structure-layer.ts
- Structured Ash growth system
- wave-sim.ts
- CollisionHandler.ts
- underwater-snell-ocean.ts
- Refractive window rain
- model-moss-accumulation.js
- exr-loader.js
- 11. Real Lighting Time of Day Demo
- 6.灰尘雾气
- UnrealBloomPass
- 1. Robot Movement Demo
- 7. Energy Flow Power Plant Demo
- 6. Dust and Fog Particles Demo
- EffectComposer Full Pipeline

## God Nodes (most connected - your core abstractions)
1. `constructor()` - 35 edges
2. `buildBody()` - 34 edges
3. `V3()` - 33 edges
4. `V2()` - 30 edges
5. `update()` - 29 edges
6. `constructor()` - 26 edges
7. `buildFrontEnd()` - 24 edges
8. `buildEngine()` - 24 edges
9. `copy()` - 23 edges
10. `revolve()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `Three.js Multi-Weather Procedural Sky` --semantically_similar_to--> `5. Multi-Weather Sky Demo`  [INFERRED] [semantically similar]
  .cursor/skills/threejs-weather-sky/SKILL.md → docs/5.晴阴雷电晚霞天空.html
- `FBM Procedural Clouds` --semantically_similar_to--> `ShaderMaterial Gradient Sky FBM Clouds`  [INFERRED] [semantically similar]
  .cursor/skills/threejs-weather-sky/SKILL.md → docs/4.动态天空.html
- `README.en.md Gitee Template` --conceptually_related_to--> `threeDemo Three.js Experiment Collection`  [INFERRED]
  README.en.md → README.md
- `5. Multi-Weather Sky Demo` --shares_data_with--> `Weather Presets sunny/sunset/overcast/rain/thunderstorm`  [INFERRED]
  docs/5.晴阴雷电晚霞天空.html → .cursor/skills/threejs-weather-sky/SKILL.md
- `3. Day-Night Weather Scene Demo` --semantically_similar_to--> `5. Multi-Weather Sky Demo`  [INFERRED] [semantically similar]
  docs/3.昼夜天气场景.html → docs/5.晴阴雷电晚霞天空.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Procedural FBM Shader Sky Weather Pattern** — docs_4_dynamic_sky_demo, docs_5_weather_sky_demo, _cursor_skills_threejs_weather_sky_skill_weather_sky, docs_11_real_lighting_sky [INFERRED 0.85]
- **EffectComposer UnrealBloomPass Glow Stack** — docs_3_daynight_weather_effectcomposer, docs_7_energy_flow_bloom, docs_9_park_night_bloom, docs_12_laser_fx_trail_bloom, docs_13_postprocessing_effectcomposer [EXTRACTED 1.00]
- **Shader Points Atmospheric Particle Effects** — docs_6_dust_fog_demo, docs_8_wind_demo, docs_12_laser_fx_demo, docs_14_laser_tunnel_demo, _cursor_skills_threejs_weather_sky_skill_rain_particles [INFERRED 0.75]
- **UnrealBloomPass / EffectComposer Glow Demos** — zhtml_3_demo, zhtml_7_demo, zhtml_9_demo, zhtml_12_demo, zhtml_13_demo, zhtml_18_demo [INFERRED 0.85]
- **Procedural Sky Weather Atmosphere Demos** — zhtml_3_demo, zhtml_4_demo, zhtml_5_demo, zhtml_11_demo, zhtml_16_demo [INFERRED 0.85]
- **Particle-Based VFX Demos** — zhtml_6_demo, zhtml_8_demo, zhtml_12_demo, zhtml_14_demo [INFERRED 0.75]

## Communities (70 total, 6 thin omitted)

### Community 0 - "Weather Sky Shader"
Cohesion: 0.20
Nodes (12): FBM Procedural Clouds, FogExp2 Weather Atmosphere, Lightning Flash State Machine, OrbitControls, Rain Points Particles, Custom Shader Sky Dome, Weather Presets sunny/sunset/overcast/rain/thunderstorm, Three.js Multi-Weather Procedural Sky (+4 more)

### Community 1 - "GIS Laser Raymarch"
Cohesion: 0.24
Nodes (10): 10. Real GIS Terrain Hefei Demo, Esri Satellite Imagery Drape, AWS Terrarium DEM Tiles, 12. Laser Effects Demo, Laser Trail Particles AdditiveBlending Bloom, AdditiveBlending Glow without Bloom, 14. Laser Particle Tunnel Demo, 15. Lava Scorched Earth Demo (+2 more)

### Community 2 - "Day-Night PBR Lighting"
Cohesion: 0.11
Nodes (23): 24h Day-Night Cycle, 11.真实光照 · Time of Day, FBM Procedural Clouds, MeshPhysicalMaterial PBR, Physical Sky Atmospheric Scattering, PMREM Real-time IBL, 24h Day-Night Cycle, 3.昼夜天气场景 (+15 more)

### Community 3 - "Volumetric Clouds Lava"
Cohesion: 0.25
Nodes (8): 15.熔岩焦土, FBM Procedural Terrain, Tunable Ray Steps Performance, Raymarching Lava River, 16.体积云天空 · three-clouds, Cloud Raymarching, @takram/three-atmosphere, @takram/three-clouds Volumetric Clouds

### Community 4 - "Park Night Online Refs"
Cohesion: 0.12
Nodes (18): 9.园区夜景 · Tech Park Night, EffectComposer, Tech Park Night Scene, THREE.Water, Online Refs Catalog (refs), BigDataView, EZ-Tree, Laas · Fable5 World (+10 more)

### Community 5 - "Materials Bloom Gallery"
Cohesion: 0.29
Nodes (8): 18.材质特效集锦, Pipe Energy Flow Shader, 55 Material Gallery, MeshPhysicalMaterial PBR, CSS2DRenderer, 7.能量流动 · 电厂, EffectComposer, Pipe Energy Flow Shader

### Community 6 - "Laser Postprocessing"
Cohesion: 0.12
Nodes (20): AdditiveBlending Glow, 12.激光特效, EffectComposer, Laser Trail Particles, BokehPass Depth of Field, 13.后期处理特效 · Post Processing, EffectComposer, OutlinePass (+12 more)

### Community 7 - "GIS Loaders CSS2D"
Cohesion: 0.18
Nodes (11): CSS2DRenderer, 10.真实GIS地形 · 合肥, Esri Satellite Imagery, Real GIS Terrain Mesh, AWS Terrarium DEM Tiles, demo Online (sandbox), DRACOLoader, GLTFLoader (+3 more)

### Community 8 - "Robot Character Control"
Cohesion: 0.25
Nodes (9): AABB Obstacle Collision, 1.机器人移动 / 机器人漫游, GLTFLoader, Third-Person Follow Camera, WASD Character Movement, 2.机器人移动可移动视角, GLTFLoader, Movement Accel/Decel Transition (+1 more)

### Community 9 - "Lab Gallery Docs Site"
Cohesion: 0.29
Nodes (7): OrbitControls GLTFLoader RGBELoader Imports, demo Online ShaderMaterial Sandbox, THREE.JS LAB Project Gallery, README.en.md Gitee Template, GitHub Pages docs/ Static Site, raw.githubusercontent.com Asset Linking, threeDemo Three.js Experiment Collection

### Community 10 - "motorcycle-parts.js"
Cohesion: 0.09
Nodes (93): AX, D, forkPt(), PAL, QUALITY, seg(), setQualityScale(), steerPt() (+85 more)

### Community 11 - "source/race-car-model.js"
Cohesion: 0.03
Nodes (20): applyOptions(), createTypedArrayLoader(), createTypedArrayLoaderClass(), getRectangle(), getSize(), getTile(), includeRenderTargets(), onBeforeCompile() (+12 more)

### Community 12 - "selftest.js"
Cohesion: 0.07
Nodes (40): applyCaustics(), auditOceanSkirtGeometry(), bakeSkyEnvironment(), buildClear(), buildParticulates(), buildStep(), cascadeBands(), causticWorldSample() (+32 more)

### Community 13 - "weather-volume-clouds/source/geospatial/index.ts"
Cohesion: 0.04
Nodes (8): createTypedArrayLoader(), createTypedArrayLoaderClass(), getRectangle(), getSize(), getTile(), includeRenderTargets(), onBeforeCompile(), TODO: The error is pronounced at the edge of the ellipsoid due to the\r

### Community 14 - "cloud-effect.bundle.js"
Cohesion: 0.07
Nodes (32): POLAR_NIGHT_SETTINGS, buildGridGeometry(), createSnowDesert(), DETAIL_LEVELS, directionFromAngles(), LEVEL_SPACINGS, SNOW_DESERT_SETTINGS, define() (+24 more)

### Community 15 - "stylized-above-below-ocean/scene.js"
Cohesion: 0.09
Nodes (31): buildBudBall(), buildMeshes(), buildStemGeometry(), buildUmbel(), colorize(), constructor(), createIvyLeafTexture(), creep() (+23 more)

### Community 16 - "CloudsEffect.ts"
Cohesion: 0.06
Nodes (34): chromaticAberration(), clone(), constructor(), createAtmosphereUniforms(), createCloudLayerUniforms(), createCloudParameterUniforms(), createRenderTarget(), createRenderTarget2() (+26 more)

### Community 17 - "lut-aerial-perspective/source/atmosphere/AerialPerspectiveEffect.ts"
Cohesion: 0.09
Nodes (19): createPipelines(), draw(), encodeCompaction(), fail(), flowerStorageMetrics(), getMetrics(), init(), maximumFlowerGridSize() (+11 more)

### Community 19 - "ivy.ts"
Cohesion: 0.11
Nodes (20): createTarget(), FragmentIFFT, makeImpulseTexture(), maxErrorConstant(), maxErrorFrequency(), validateFragmentIFFT(), createComputeMaterial(), SpectralCascade (+12 more)

### Community 20 - "weather-volume-clouds/source/atmosphere/AerialPerspectiveEffect.ts"
Cohesion: 0.09
Nodes (32): applyMatrix4(), applyOptions2(), assertType(), copy(), copyCameraSettings(), copyReprojection(), copyShadow(), distance() (+24 more)

### Community 21 - "Ellipsoid"
Cohesion: 0.10
Nodes (12): createInteractiveWaterSurfaceMaterial(), createPassMaterial(), createPoolInteriorGeometry(), createPoolInteriorMaterial(), createPoolInteriorMesh(), createPoolOpticsUniforms(), createPoolSphereMaterial(), createSimulationTarget() (+4 more)

### Community 22 - "weather-volume-clouds/source/geospatial/DataLoader.ts"
Cohesion: 0.17
Nodes (26): createPorcelainBrassSubmarineScene(), createSportMotorcycleScene(), SUBMARINE_DIMENSIONS, SUBMARINE_PALETTE, arcPath(), createMesh(), finLoft(), gridGeometry() (+18 more)

### Community 23 - "building-system.js"
Cohesion: 0.23
Nodes (25): mulberry32(), buildMaterials(), canvas2d(), canvasTexture(), decalCanvas(), kawasakiDecal(), keep(), ledFace() (+17 more)

### Community 24 - "LensFlareEffect"
Cohesion: 0.18
Nodes (15): at(), decompose(), getEastNorthUpFrame(), getEastNorthUpVectors(), getIntersection(), getSurfaceNormal(), normalize(), projectOnEllipsoidSurface() (+7 more)

### Community 25 - "atmosphere-effect.bundle.js"
Cohesion: 0.14
Nodes (23): applyOptions(), at(), copy(), copyCameraSettings(), decompose(), ellipsoid(), getAltitudeCorrectionOffset(), getEastNorthUpFrame() (+15 more)

### Community 26 - "resolveIncludes"
Cohesion: 0.10
Nodes (20): chromaticAberration(), clone(), constructor(), ghostAmount(), haloAmount(), inputBuffer(), irradianceScale(), irradianceTexture() (+12 more)

### Community 27 - "Rectangle"
Cohesion: 0.17
Nodes (9): absorptionCoefficients(), cauchyCoefficients(), createEnvironmentSampler(), fresnelDielectric, projectToBufferUV, spectralWeight, geometricWorldNormal, GLASS_DEBUG_VIEWS (+1 more)

### Community 28 - "ivy-effect.bundle.js"
Cohesion: 0.13
Nodes (17): createData3DTextureLoader(), createData3DTextureLoaderClass(), createDataLoaderClass(), createDataTextureLoader(), createDataTextureLoaderClass(), getNormalAtHorizon(), getTextureDataType(), height() (+9 more)

### Community 29 - "CloudsEffect"
Cohesion: 0.15
Nodes (16): clampDistance(), distanceToTopAtmosphereBoundary(), getSunLightColor(), getTextureCoordFromUnitRange(), getUvFromRMu(), getUvFromRMuS(), isTypedArray(), rayIntersectsGround() (+8 more)

### Community 30 - "lut-aerial-perspective/source/atmosphere/getSunLightColor.ts"
Cohesion: 0.11
Nodes (21): createData3DTextureLoader(), createData3DTextureLoaderClass(), createDataLoaderClass(), createDataTextureLoader(), createDataTextureLoaderClass(), getNormalAtHorizon(), getTextureDataType(), height() (+13 more)

### Community 31 - "lut-aerial-perspective/source/geospatial/DataLoader.ts"
Cohesion: 0.24
Nodes (9): createRainDropMaterial(), createRainDrops(), createSeededRandom(), createSplashMaterial(), createSplashSystem(), rainPuddleDebugModes, randFloat(), randFloatSpread() (+1 more)

### Community 32 - "Volumetric fluid fire"
Cohesion: 0.24
Nodes (10): createFullscreenQuadScene(), createGpuComputedGrassSystem(), createGrassGeometry(), createPositionTexture(), gpuComputedGrassDebugModes, grassFragmentPrelude, grassVertexMainEnd, grassVertexMainStart (+2 more)

### Community 33 - "source/submarine-model.js"
Cohesion: 0.20
Nodes (8): createVegetationScene(), ashMedium, buildGeometry(), compileAshTree(), createBranchBuffers(), createLeafBuffers(), pushBranchVertex(), SeededRandom

### Community 34 - "underwater-snell-ocean.bundle.js"
Cohesion: 0.22
Nodes (4): applySnowToGroundMaterial(), createSnowUniforms(), createSnowyGroundMaterial(), snowDebugModes

### Community 35 - "Ellipsoid"
Cohesion: 0.29
Nodes (7): createStylizedGrassBladeGeometry(), createStylizedGrassField(), createStylizedGrassMaterial(), grassDebugModes, measureBladeHeight(), SeededRandom, stylizedMeadowGrassAssetPaths

### Community 36 - "VolumetricFluidFire.ts"
Cohesion: 0.33
Nodes (9): getDirectionECEF(), getDirectionECI(), getECIToECEFRotationMatrix(), getMoonDirectionECEF(), getMoonDirectionECI(), getSunDirectionECEF(), getSunDirectionECI(), makeTime() (+1 more)

### Community 37 - "update"
Cohesion: 0.22
Nodes (6): constructor(), createStorage3D(), distanceAtPoint(), drawDebugShapes(), makeDataTexture(), sdf()

### Community 38 - ".add"
Cohesion: 0.31
Nodes (6): createPass(), createRenderTarget(), createSchwarzschildGeodesicBlackHoleEffect(), SCHWARZSCHILD_BLACK_HOLE_PRESETS, SCHWARZSCHILD_BLACK_HOLE_QUALITIES, selectRenderTargetType()

### Community 39 - "VolumetricFluidFire"
Cohesion: 0.33
Nodes (9): getDirectionECEF(), getDirectionECI(), getECIToECEFRotationMatrix(), getMoonDirectionECEF(), getMoonDirectionECI(), getSunDirectionECEF(), getSunDirectionECI(), makeTime() (+1 more)

### Community 42 - "AerialPerspectiveEffect"
Cohesion: 0.29
Nodes (7): compareEntries(), fromArray(), packDensityProfiles(), packIntervalHeights(), packSums(), packValues(), updateCloudLayerUniforms()

### Community 43 - "CloudLayers.ts"
Cohesion: 0.40
Nodes (3): createPhysicalDiffractionGrating(), DIFFRACTION_GRATING_DEFAULTS, makeRoundedAlphaTexture()

### Community 44 - "LensFlareEffect"
Cohesion: 0.53
Nodes (5): createClosedWakeShellGeometry(), createReentryPlasma(), makeWakeMaterial(), shellConfigs, smootherstep()

### Community 45 - "medium.ts"
Cohesion: 0.60
Nodes (5): createOceanDetailTexture(), createRandomField(), periodicFbm(), samplePeriodic(), smooth()

### Community 46 - "water-volume-system.js"
Cohesion: 0.40
Nodes (6): clampDistance(), distanceToTopAtmosphereBoundary(), getTextureCoordFromUnitRange(), getUvFromRMu(), getUvFromRMuS(), safeSqrt()

### Community 47 - "volumetric-fluid-fire.bundle.js"
Cohesion: 0.50
Nodes (3): createDiamondMaterial(), diamondControlRanges, makeDiamond()

### Community 48 - "constructor"
Cohesion: 0.50
Nodes (4): AURORA_CURTAIN_PRESET, AURORA_PROBE_SIZE, createAuroraCurtains(), createUniforms()

### Community 49 - "CascadedShadowMaps.ts"
Cohesion: 0.40
Nodes (5): bindMatrix(), createColliderOn(), destroyColliderFrom(), makeObjectCollidable(), unbindMatrix()

### Community 52 - "CloudsPass"
Cohesion: 0.50
Nodes (4): convertBVIndexToLinearSRGBChromaticity(), convertBVIndexToTemperature(), convertTemperatureToLinearSRGBChromaticity(), saturate()

### Community 54 - "interface-structure-layer.ts"
Cohesion: 0.50
Nodes (4): convertBVIndexToLinearSRGBChromaticity(), convertBVIndexToTemperature(), convertTemperatureToLinearSRGBChromaticity(), saturate()

### Community 55 - "Structured Ash growth system"
Cohesion: 0.53
Nodes (4): createWaterOpticsScene(), createWaterMaterial(), oceanSurfaceHeightAt(), oceanWaves

### Community 56 - "wave-sim.ts"
Cohesion: 0.67
Nodes (3): applySettingsSnapshot(), setColor(), setColorStop()

### Community 57 - "CollisionHandler.ts"
Cohesion: 0.67
Nodes (3): getColor(), getColorStop(), getSettingsSnapshot()

### Community 147 - "11. Real Lighting Time of Day Demo"
Cohesion: 0.28
Nodes (9): 11. Real Lighting Time of Day Demo, PMREMGenerator Real-time IBL, Physical Sky plus FBM Clouds, updateSun Hour Unified Drive, 3. Day-Night Weather Scene Demo, EffectComposer UnrealBloomPass, Three.js Sky Atmospheric Scattering, Real Lighting Scene Build Guide (+1 more)

### Community 155 - "6.灰尘雾气"
Cohesion: 0.29
Nodes (8): 6.灰尘雾气, Dust and Fog Particles, THREE.Points Particles, Wind Turbulence Advection, 8.风 · 风扇喷射, Fan Conical Jet Particles, THREE.Points Particles, Wind Turbulence Advection

### Community 167 - "UnrealBloomPass"
Cohesion: 1.00
Nodes (6): UnrealBloomPass, UnrealBloomPass, UnrealBloomPass, UnrealBloomPass, UnrealBloomPass, UnrealBloomPass

### Community 172 - "1. Robot Movement Demo"
Cohesion: 0.40
Nodes (5): WASD Movement Collision Detection, 1. Robot Movement Demo, GLTFLoader Robot Model, 2. Robot Movement Free Camera Demo, OrbitControls Free Look

### Community 173 - "7. Energy Flow Power Plant Demo"
Cohesion: 0.40
Nodes (5): Pipeline Flow Shader AdditiveBlending Bloom, CSS2DRenderer Labels, 7. Energy Flow Power Plant Demo, Night Scene UnrealBloomPass, 9. Tech Park Night Scene Demo

### Community 181 - "6. Dust and Fog Particles Demo"
Cohesion: 0.67
Nodes (4): 6. Dust and Fog Particles Demo, ShaderMaterial Turbulent Dust Points, Cone Jet Mist Shader Points, 8. Fan Wind Mist Demo

### Community 184 - "EffectComposer Full Pipeline"
Cohesion: 0.67
Nodes (3): 13. Post-Processing Effects Demo, EffectComposer Full Pipeline, OutlinePass BokehPass Bloom LUT Film Halftone

## Ambiguous Edges - Review These
- `demo Online ShaderMaterial Sandbox` → `THREE.JS LAB Project Gallery`  [AMBIGUOUS]
  docs/demo Online.html · relation: conceptually_related_to
- `1.机器人移动 / 机器人漫游` → `demo Online (sandbox)`  [AMBIGUOUS]
  zhtml/demo Online.html · relation: conceptually_related_to

## Knowledge Gaps
- **112 isolated node(s):** `POLAR_NIGHT_SETTINGS`, `SNOW_DESERT_SETTINGS`, `DETAIL_LEVELS`, `snowDebugModes`, `rainPuddleDebugModes` (+107 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `demo Online ShaderMaterial Sandbox` and `THREE.JS LAB Project Gallery`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `1.机器人移动 / 机器人漫游` and `demo Online (sandbox)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `target()` connect `cloud-effect.bundle.js` to `LensFlareEffect`, `ivy.ts`, `selftest.js`?**
  _High betweenness centrality (0.187) - this node is a cross-community bridge._
- **Why does `constructor()` connect `selftest.js` to `motorcycle-parts.js`, `cloud-effect.bundle.js`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `constructor()` (e.g. with `.transform()` and `chromaticAberration()`) actually correct?**
  _`constructor()` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `update()` (e.g. with `distance()` and `height()`) actually correct?**
  _`update()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `POLAR_NIGHT_SETTINGS`, `SNOW_DESERT_SETTINGS`, `DETAIL_LEVELS` to the rest of the system?**
  _112 weakly-connected nodes found - possible documentation gaps or missing edges._