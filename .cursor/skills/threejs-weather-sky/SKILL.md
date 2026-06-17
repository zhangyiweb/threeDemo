---
name: threejs-weather-sky
description: >-
  Build a Three.js procedural sky with switchable weather presets (sunny / sunset
  / overcast / rain / thunderstorm) using a custom shader sky dome, FBM clouds,
  FogExp2, HemisphereLight + DirectionalLight, rain particles, and lightning.
  Use when adding, editing, or explaining weather/sky/cloud/fog/rain/lightning
  effects in Three.js scenes, or when the user mentions
  天气/天空/云/雾/晚霞/阴天/下雨/雷电.
---

# Three.js 多天气动态天空（自包含文档）

照本文从零即可搭出：渐变天空 + FBM 飘云 + 雾 + 阴影 + 雨 + 闪电，GUI 切换
晴天 / 晚霞 / 阴天 / 下雨 / 雷电。无需参考其它文件。

## 1. 引入依赖

Three.js 0.184，用 importmap 引 CDN，无需打包。`<head>` 之后、`<body>` 之内放 `#container`。

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.184.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.184.0/examples/jsm/"
  }
}
</script>

<script type="module">
  import * as THREE from 'three';
  import Stats from 'three/addons/libs/stats.module.js';
  import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  // ...下面的代码全部写在这个 module 里
</script>
```

HTML 骨架：

```html
<body>
  <div id="hint">当前天空：<b id="hud-sky">晴天</b></div>
  <div id="container"></div>
</body>
```

## 2. 场景 / 相机 / 渲染器 / 雾

雾用 `FogExp2`（指数雾），它是天气"朦胧氛围"的核心。渲染器开 `ACES`/sRGB 不是必须，但必须开 `shadowMap`。

```js
const container = document.getElementById('container');
const clock = new THREE.Clock();
const hudSky = document.getElementById('hud-sky');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xbfe6ff, 0.0004); // 颜色+浓度，切换天气时改写

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 6000);
camera.position.set(0, 60, 180);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;              // 放开阴影
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2 - 0.02;    // 不让镜头钻到地面下
controls.target.set(0, 30, 0);
```

## 3. 天空着色器（穹顶）

一个超大球（半径 3000）用 `BackSide` 包住相机，`depthWrite:false`。
所有外观参数都做成 uniform，切换天气时改 uniform。

### uniforms

```js
const skyUniforms = {
  uTime:      { value: 0 },
  uSpeed:     { value: 0.8 },   // 云飘速度
  uCoverage:  { value: 0.55 },  // 云量 0~1
  uScale:     { value: 2.0 },   // 云尺度
  uSoftness:  { value: 0.4 },   // 云边缘柔和
  uBrightness:{ value: 1.0 },   // 整体亮度
  uSkyTop:    { value: new THREE.Color('#2b7de9') }, // 天顶
  uSkyBottom: { value: new THREE.Color('#bfe6ff') }, // 地平线
  uCloudColor:{ value: new THREE.Color('#ffffff') },
  uSunGlow:   { value: new THREE.Color('#fff6d6') }, // 太阳辉光色
  uSunDir:    { value: new THREE.Vector3(0.4, 0.45, 0.5).normalize() },
  uFlash:     { value: 0 },     // 闪电闪光强度
};
```

### 顶点着色器

把视线方向（世界空间）传给片元，用于按方向画天空和云。

```glsl
varying vec3 vDir;
void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vDir = normalize(worldPos.xyz - cameraPosition);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

### 片元着色器

要点：① 天空按 `dir.y` 渐变；② 太阳辉光用 `dot`；③ 云把视线投影到头顶水平面
`dir.xz/dir.y`，加 `uTime` 实现水平飘动，两层 3D fbm 叠加；④ 地平线宽幅淡出隐藏拉伸；
⑤ 闪电整体提亮。**云只水平飘**：时间偏移只加在水平 uv，不会"往地下跑"。

```glsl
precision highp float;
varying vec3 vDir;
uniform float uTime, uSpeed, uCoverage, uScale, uSoftness, uBrightness, uFlash;
uniform vec3 uSkyTop, uSkyBottom, uCloudColor, uSunGlow, uSunDir;

// 3D 值噪声：对方向向量采样，球面连续、无接缝
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)), f.x),
        mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
        mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++) { v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}

void main() {
  vec3 dir = normalize(vDir);
  float h = clamp(dir.y, 0.0, 1.0);

  // ① 天空渐变
  vec3 sky = mix(uSkyBottom, uSkyTop, pow(h, 0.55));

  // ② 太阳辉光
  float sun = pow(max(dot(dir, normalize(uSunDir)), 0.0), 8.0);
  sky += uSunGlow * sun * 0.6;

  // ③ 头顶水平云层投影 + 水平风 + 两层 fbm
  float t = uTime * uSpeed;
  float y = max(dir.y, 0.06);
  vec2 uv = dir.xz / y;
  uv *= uScale * 0.2;
  uv += vec2(t * 0.02, t * 0.015);
  float base   = fbm(vec3(uv, t * 0.01));
  float detail = fbm(vec3(uv * 2.5, t * 0.02));
  float clouds = base * 0.6 + detail * 0.4;

  // 云量阈值 + 柔和边缘
  float lo = 1.0 - uCoverage;
  float density = smoothstep(lo, lo + uSoftness, clouds);
  // ④ 地平线宽幅淡出
  density *= smoothstep(0.02, 0.32, dir.y);

  float shade = mix(0.7, 1.0, smoothstep(lo, 1.0, clouds));
  vec3 cloudCol = uCloudColor * shade + uSunGlow * sun * 0.3;

  vec3 color = mix(sky, cloudCol, density);
  color *= uBrightness;

  // ⑤ 闪电瞬间提亮（云层更明显）
  color += vec3(0.6, 0.65, 0.8) * uFlash * (0.4 + density * 0.8);

  gl_FragColor = vec4(color, 1.0);
}
```

### 创建天空网格

```js
const skyMaterial = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, uniforms: skyUniforms,
  vertexShader: /* 上面的顶点着色器字符串 */,
  fragmentShader: /* 上面的片元着色器字符串 */,
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(3000, 32, 16), skyMaterial);
scene.add(sky);
```

## 4. 灯光

```js
const hemiLight = new THREE.HemisphereLight(0xcfe8ff, 0x4a5a3a, 0.7);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfff4e0, 2.2);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 900;
sunLight.shadow.camera.left = -250;
sunLight.shadow.camera.right = 250;
sunLight.shadow.camera.top = 250;
sunLight.shadow.camera.bottom = -250;
sunLight.shadow.bias = -0.0003;
scene.add(sunLight, sunLight.target);

// 闪电补光：平时熄灭，闪电时瞬间照亮模型
const flashLight = new THREE.DirectionalLight(0xaecbff, 0);
flashLight.position.set(0, 400, 0);
scene.add(flashLight);
```

## 5. 地面与模型

```js
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(2000, 2000),
  new THREE.MeshStandardMaterial({ color: 0x6f8f55, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

function addBox(x, z, size, color) {
  const h = size * 1.6;
  const m = new THREE.Mesh(new THREE.BoxGeometry(size, h, size),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7 }));
  m.position.set(x, h / 2, z);
  m.castShadow = m.receiveShadow = true;
  scene.add(m);
}
function addTree(x, z) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.6, 16, 8),
    new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 1 }));
  trunk.position.y = 8; trunk.castShadow = true;
  const crown = new THREE.Mesh(new THREE.SphereGeometry(12, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x4f9d4a, roughness: 1 }));
  crown.position.y = 26; crown.castShadow = true;
  g.add(trunk, crown); g.position.set(x, 0, z); scene.add(g);
}
addBox(-60, -30, 40, 0xe07a5f); addBox(50, -50, 30, 0xf2cc8f); addBox(20, 60, 26, 0x81b29a);
addTree(-90, 40); addTree(100, 30); addTree(-30, 90); addTree(80, -100);
```

## 6. 雨粒子

`Points` + `BufferGeometry`，每帧 y 下落、落地回顶循环，整体跟随相机形成雨幕。
仅在 `rain.visible=true`（下雨/雷电）时更新与显示。

```js
const RAIN_COUNT = 12000, RAIN_AREA = 400, RAIN_HEIGHT = 400;
const rainPositions = new Float32Array(RAIN_COUNT * 3);
const rainSpeeds = new Float32Array(RAIN_COUNT);
for (let i = 0; i < RAIN_COUNT; i++) {
  rainPositions[i*3]   = (Math.random() - 0.5) * RAIN_AREA * 2;
  rainPositions[i*3+1] = Math.random() * RAIN_HEIGHT;
  rainPositions[i*3+2] = (Math.random() - 0.5) * RAIN_AREA * 2;
  rainSpeeds[i] = 0.7 + Math.random() * 0.6;
}
const rainGeo = new THREE.BufferGeometry();
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({
  color: 0x9fb1c4, size: 1.6, transparent: true, opacity: 0.6, depthWrite: false,
}));
rain.visible = false;
scene.add(rain);

function updateRain(delta) {
  if (!rain.visible) return;
  const arr = rainGeo.attributes.position.array;
  for (let i = 0; i < RAIN_COUNT; i++) {
    const iy = i * 3 + 1;
    arr[iy] -= 700 * rainSpeeds[i] * delta;
    if (arr[iy] < 0) {
      arr[iy] = RAIN_HEIGHT;
      arr[i*3]   = (Math.random() - 0.5) * RAIN_AREA * 2;
      arr[i*3+2] = (Math.random() - 0.5) * RAIN_AREA * 2;
    }
  }
  rainGeo.attributes.position.needsUpdate = true;
  rain.position.set(camera.position.x, 0, camera.position.z);
}
```

## 7. 天气预设

每项是一组完整参数。规律：**天气越差 → 越灰暗、云量越大、亮度越低、雾色越接近云色且越浓**。
颜色：着色器/雾用字符串 `'#rrggbb'`，灯光用数字 `0xrrggbb`。

```js
const presets = {
  晴天: {
    skyTop:'#2b7de9', skyBottom:'#bfe6ff', cloudColor:'#ffffff', sunGlow:'#fff6d6',
    coverage:0.55, speed:0.8, scale:2.0, brightness:1.0,
    sunDir:[0.4,0.45,0.5], sunColor:0xfff4e0, sunInt:2.2,
    hemiSky:0xcfe8ff, hemiGround:0x4a5a3a, hemiInt:0.7,
    fog:'#bfe6ff', fogDensity:0.0004, rain:false, lightning:false,
  },
  晚霞: {
    skyTop:'#1d2f5c', skyBottom:'#ff9e54', cloudColor:'#ffcf9a', sunGlow:'#ff6a2c',
    coverage:0.62, speed:0.45, scale:1.8, brightness:1.05,
    sunDir:[0.55,0.08,-0.55], sunColor:0xff7a33, sunInt:1.8,  // y 很小=太阳近地平线
    hemiSky:0xffb38a, hemiGround:0x3a2f3a, hemiInt:0.5,
    fog:'#ff8c54', fogDensity:0.0007, rain:false, lightning:false, // 橙雾=黄昏朦胧
  },
  阴天: {
    skyTop:'#8a98a4', skyBottom:'#c4ccd2', cloudColor:'#9aa3ab', sunGlow:'#b9c2c9',
    coverage:0.95, speed:0.55, scale:1.6, brightness:0.82,
    sunDir:[0.3,0.6,0.3], sunColor:0xc8d0d6, sunInt:0.45,
    hemiSky:0xb8c2cc, hemiGround:0x555b52, hemiInt:0.65,
    fog:'#b3bcc4', fogDensity:0.0012, rain:false, lightning:false,
  },
  下雨: {
    skyTop:'#4a545e', skyBottom:'#79828b', cloudColor:'#5c656d', sunGlow:'#828b92',
    coverage:0.99, speed:1.2, scale:1.5, brightness:0.68,
    sunDir:[0.3,0.6,0.3], sunColor:0x99a1a8, sunInt:0.3,
    hemiSky:0x8c949c, hemiGround:0x44483f, hemiInt:0.5,
    fog:'#6c757d', fogDensity:0.0022, rain:true, lightning:false,
  },
  雷电: {
    skyTop:'#2d333b', skyBottom:'#525a63', cloudColor:'#3d444c', sunGlow:'#5a626a',
    coverage:1.0, speed:1.6, scale:1.4, brightness:0.5,
    sunDir:[0.3,0.6,0.3], sunColor:0x808890, sunInt:0.2,
    hemiSky:0x6b7079, hemiGround:0x33362f, hemiInt:0.4,
    fog:'#4a525a', fogDensity:0.0028, rain:true, lightning:true,
  },
};
```

字段含义：

| 字段 | 含义 |
|------|------|
| `skyTop`/`skyBottom` | 天顶色 / 地平线色（按 `dir.y` 渐变） |
| `cloudColor` / `sunGlow` | 云色 / 太阳辉光色（辉光也染云边缘） |
| `coverage`/`speed`/`scale` | 云量 / 飘速 / 尺度 |
| `brightness` | 天空亮度乘子 |
| `sunDir`/`sunColor`/`sunInt` | 太阳方向(y 越小越低) / 光色 / 强度 |
| `hemiSky`/`hemiGround`/`hemiInt` | 半球光天空色 / 地面色 / 强度 |
| `fog`/`fogDensity` | 雾色 / 浓度（越大越朦胧） |
| `rain`/`lightning` | 是否下雨 / 是否闪电 |

## 8. 应用预设

一次性把预设写入所有 uniform、灯光、雾、雨、闪电开关。`baseBrightness`/`baseHemi`
是闪电叠加的基准，必须在这里更新。

```js
let baseBrightness = 1.0;
let baseHemi = hemiLight.intensity;
let lightningOn = false;

function applyPreset(name) {
  const p = presets[name];
  if (!p) return;

  Object.assign(params, {
    skyTop:p.skyTop, skyBottom:p.skyBottom, cloudColor:p.cloudColor, sunGlow:p.sunGlow,
    coverage:p.coverage, cloudSpeed:p.speed, cloudScale:p.scale, brightness:p.brightness,
  });

  skyUniforms.uSkyTop.value.set(p.skyTop);
  skyUniforms.uSkyBottom.value.set(p.skyBottom);
  skyUniforms.uCloudColor.value.set(p.cloudColor);
  skyUniforms.uSunGlow.value.set(p.sunGlow);
  skyUniforms.uCoverage.value = p.coverage;
  skyUniforms.uSpeed.value = p.speed;
  skyUniforms.uScale.value = p.scale;
  skyUniforms.uBrightness.value = p.brightness;
  skyUniforms.uSunDir.value.set(p.sunDir[0], p.sunDir[1], p.sunDir[2]).normalize();

  sunLight.color.setHex(p.sunColor);
  sunLight.intensity = p.sunInt;
  sunLight.position.copy(skyUniforms.uSunDir.value).multiplyScalar(300);

  hemiLight.color.setHex(p.hemiSky);
  hemiLight.groundColor.setHex(p.hemiGround);
  hemiLight.intensity = p.hemiInt;

  scene.fog.color.set(p.fog);
  scene.fog.density = p.fogDensity;

  rain.visible = p.rain;
  lightningOn = p.lightning;
  if (!lightningOn) { skyUniforms.uFlash.value = 0; flashLight.intensity = 0; }

  baseBrightness = p.brightness;
  baseHemi = p.hemiInt;

  hudSky.textContent = name;
  gui.controllersRecursive().forEach((c) => c.updateDisplay());
}
```

## 9. 闪电

状态机：随机间隔触发 1~3 次连闪，每次 `flash` 瞬间拉高再快速衰减；
每帧把 `flash` 写入天空 uniform、补光灯，并叠加在基准亮度/环境光之上。

```js
let flash = 0, nextStrike = 3, burstLeft = 0;

function updateLightning(delta) {
  if (!lightningOn) return;
  nextStrike -= delta;
  if (nextStrike <= 0 && burstLeft <= 0) {
    burstLeft = 1 + Math.floor(Math.random() * 3);  // 1~3 连闪
    nextStrike = 3 + Math.random() * 6;             // 下次间隔（调小=更频繁）
  }
  if (burstLeft > 0 && flash < 0.05) {
    flash = 0.8 + Math.random() * 0.6;
    burstLeft -= 1;
  }
  flash = Math.max(0, flash - delta * 6);           // 快速衰减
  skyUniforms.uFlash.value = flash;
  flashLight.intensity = flash * 4;
  skyUniforms.uBrightness.value = baseBrightness + flash * 0.5;
  hemiLight.intensity = baseHemi + flash * 1.2;
}
```

## 10. GUI

下拉用 `Object.keys(presets)` 自动生成，新增预设无需改 GUI。

```js
const params = {
  preset:'晴天', cloudSpeed:0.8, coverage:0.55, cloudScale:2.0, softness:0.4,
  brightness:1.0, skyTop:'#2b7de9', skyBottom:'#bfe6ff', cloudColor:'#ffffff', sunGlow:'#fff6d6',
};

const gui = new GUI();
gui.add(params, 'preset', Object.keys(presets)).name('天气').onChange(applyPreset);

const fCloud = gui.addFolder('云');
fCloud.add(params, 'cloudSpeed', 0, 3, 0.01).name('移动速度').onChange(v => skyUniforms.uSpeed.value = v);
fCloud.add(params, 'coverage', 0, 1, 0.01).name('云量').onChange(v => skyUniforms.uCoverage.value = v);
fCloud.add(params, 'cloudScale', 0.3, 3, 0.01).name('云尺度').onChange(v => skyUniforms.uScale.value = v);
fCloud.add(params, 'softness', 0.02, 0.8, 0.01).name('边缘柔和').onChange(v => skyUniforms.uSoftness.value = v);
fCloud.addColor(params, 'cloudColor').name('云颜色').onChange(v => skyUniforms.uCloudColor.value.set(v));

const fSky = gui.addFolder('天空');
fSky.add(params, 'brightness', 0.3, 1.6, 0.01).name('亮度')
  .onChange(v => { skyUniforms.uBrightness.value = v; baseBrightness = v; });
fSky.addColor(params, 'skyTop').name('天顶色').onChange(v => skyUniforms.uSkyTop.value.set(v));
fSky.addColor(params, 'skyBottom').name('地平线色').onChange(v => skyUniforms.uSkyBottom.value.set(v));
fSky.addColor(params, 'sunGlow').name('太阳辉光').onChange(v => skyUniforms.uSunGlow.value.set(v));

applyPreset('晴天'); // 初始化
```

## 11. 主循环与自适应

```js
function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  skyUniforms.uTime.value = clock.getElapsedTime();
  sky.position.copy(camera.position);   // 穹顶跟随相机，天空无限远
  updateRain(delta);
  updateLightning(delta);
  controls.update();
  renderer.render(scene, camera);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
```

## 12. 微调速查

| 想要的效果 | 改哪里 |
|------------|--------|
| 更通透 / 更朦胧 | `fogDensity` 小/大；`fog` 雾色调淡/加深 |
| 云更多 / 更少 | `coverage` 大 / 小 |
| 云飘更快 / 更慢 | `speed` 大 / 小 |
| 云更碎 / 更大块 | `scale` 大 / 小 |
| 云边更软 / 更硬 | `softness` 大 / 小 |
| 黄昏太阳更低 | `sunDir` 的 y 调小（接近 0） |
| 整体更暗 | `brightness` + `sunInt` + `hemiInt` 一起调小 |
| 闪电更频繁 | `updateLightning` 里 `nextStrike` 随机范围调小 |
| 雨更大 | `RAIN_COUNT` 调大、下落系数 `700` 调大 |
| 云"往地下跑" | 时间偏移只能加在水平 `uv`，勿加到 `dir.y` |
| 地平线出现盒子接缝 | 保留 `density *= smoothstep(0.02, 0.32, dir.y)` 淡出 |

## 13. 新增一种天气

1. 在 `presets` 加一项，按字段表填全。
2. GUI 下拉自动出现，无需改其它代码。
3. 配色守"越差越灰暗、雾色贴近云色"；要降水/打雷把 `rain`/`lightning` 置 `true`。
