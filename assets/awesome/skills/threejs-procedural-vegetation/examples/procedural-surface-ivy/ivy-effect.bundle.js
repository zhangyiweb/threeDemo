// source/ivy.ts
import * as THREE4 from "three";

// source/bvh.ts
import * as THREE from "three";
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from "three-mesh-bvh";
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;
function indexForRaycasts(root) {
  root.traverse((o) => {
    const mesh = o;
    if (mesh.isMesh && !mesh.geometry.boundsTree) {
      mesh.geometry.computeBoundsTree();
    }
  });
}
function disposeRaycastIndex(geometry) {
  geometry.disposeBoundsTree?.();
}
function firstHitOnly(raycaster) {
  raycaster.firstHitOnly = true;
  return raycaster;
}

// source/leafTexture.ts
import * as THREE2 from "three";
function createIvyLeafTexture(size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.scale(size / 512, size / 512);
  const right = [
    [256, 500],
    [318, 478],
    // toward basal lobe
    [396, 462],
    // basal lobe tip
    [362, 404],
    // notch
    [432, 318],
    // side lobe tip
    [468, 268],
    [366, 262],
    // notch below top lobe
    [330, 220],
    [352, 140],
    // upper edge of top lobe
    [312, 122],
    [282, 58]
  ];
  const tip = [256, 22];
  const left = right.map(([x, y]) => [512 - x, y]).reverse();
  const pts = [...right, tip, ...left];
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const [cx, cy] = pts[i];
    const mx = (cx + pts[i + 1][0]) / 2;
    const my = (cy + pts[i + 1][1]) / 2;
    ctx.quadraticCurveTo(cx, cy, mx, my);
  }
  ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, 512, 0, 0);
  grad.addColorStop(0, "#2a5426");
  grad.addColorStop(0.55, "#3a7030");
  grad.addColorStop(1, "#4a8a3a");
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "rgba(210, 235, 180, 0.35)";
  ctx.lineWidth = 3;
  ctx.stroke();
  const veinOrigin = [256, 468];
  const veinTips = [
    [256, 40],
    [420, 300],
    [92, 300],
    [382, 452],
    [130, 452]
  ];
  ctx.strokeStyle = "rgba(205, 230, 170, 0.5)";
  ctx.lineCap = "round";
  for (const [tx, ty] of veinTips) {
    ctx.lineWidth = tx === 256 ? 5 : 3;
    ctx.beginPath();
    ctx.moveTo(veinOrigin[0], veinOrigin[1]);
    ctx.quadraticCurveTo((veinOrigin[0] + tx) / 2 + (tx - 256) * 0.12, (veinOrigin[1] + ty) / 2, tx, ty);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    const midX = (veinOrigin[0] + tx) / 2;
    const midY = (veinOrigin[1] + ty) / 2;
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(midX + (tx - 256) * 0.25 + 18, midY - 30);
    ctx.stroke();
  }
  const tex = new THREE2.CanvasTexture(canvas);
  tex.colorSpace = THREE2.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// source/flowers.ts
import * as THREE3 from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
var highGeo = null;
var lowGeo = null;
var highBudGeo = null;
var lowBudGeo = null;
var highMat = null;
var lowMat = null;
function hash(i, k) {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function mergeParts(parts) {
  const flat = parts.map((p) => p.index ? p.toNonIndexed() : p);
  const merged = mergeGeometries(flat, false);
  for (const p of flat) p.dispose();
  for (const p of parts) p.dispose();
  return merged;
}
function colorize(geo, color) {
  const n = geo.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = color.r;
    arr[i * 3 + 1] = color.g;
    arr[i * 3 + 2] = color.b;
  }
  geo.setAttribute("color", new THREE3.BufferAttribute(arr, 3));
  return geo;
}
function buildUmbel(quality) {
  const high = quality === "high";
  const parts = [];
  const stalkColor = new THREE3.Color("#a9b58e");
  const pedicelColor = new THREE3.Color("#b9c69c");
  const budColor = new THREE3.Color("#ccd8a8");
  const tmpColor = new THREE3.Color();
  const stalk = new THREE3.CylinderGeometry(0.035, 0.06, 0.72, high ? 6 : 4, 1);
  stalk.translate(0, 0.36, 0);
  parts.push(colorize(stalk, stalkColor));
  const head = new THREE3.Vector3(0, 0.76, 0);
  const n = high ? 24 : 11;
  const up = new THREE3.Vector3(0, 1, 0);
  const q = new THREE3.Quaternion();
  const m = new THREE3.Matrix4();
  for (let i = 0; i < n; i++) {
    const y = THREE3.MathUtils.lerp(-0.35, 1, (i + 0.5) / n);
    const az = i * 2.39996;
    const hr = Math.sqrt(Math.max(0, 1 - y * y));
    const dir = new THREE3.Vector3(hr * Math.cos(az), y, hr * Math.sin(az)).normalize();
    const len = 0.26 + 0.15 * hash(i, 1);
    const pedicel = new THREE3.CylinderGeometry(0.011, 0.015, len, 3, 1);
    pedicel.translate(0, len / 2, 0);
    q.setFromUnitVectors(up, dir);
    m.makeRotationFromQuaternion(q).setPosition(head);
    pedicel.applyMatrix4(m);
    parts.push(colorize(pedicel, pedicelColor));
    const budR = 0.055 + 0.03 * hash(i, 2);
    const bud = high ? new THREE3.SphereGeometry(budR, 6, 5) : new THREE3.IcosahedronGeometry(budR, 0);
    bud.translate(
      head.x + dir.x * (len + budR * 0.45),
      head.y + dir.y * (len + budR * 0.45),
      head.z + dir.z * (len + budR * 0.45)
    );
    tmpColor.copy(budColor).offsetHSL(0, 0, (hash(i, 3) - 0.5) * 0.1);
    parts.push(colorize(bud, tmpColor));
  }
  return mergeParts(parts);
}
function buildBudBall(quality) {
  const high = quality === "high";
  const parts = [];
  const stalkColor = new THREE3.Color("#a9b58e");
  const budColor = new THREE3.Color("#c3d1a0");
  const tmpColor = new THREE3.Color();
  const stalk = new THREE3.CylinderGeometry(0.03, 0.05, 0.2, high ? 6 : 4, 1);
  stalk.translate(0, 0.1, 0);
  parts.push(colorize(stalk, stalkColor));
  const center = new THREE3.Vector3(0, 0.3, 0);
  const core = high ? new THREE3.SphereGeometry(0.1, 8, 6) : new THREE3.IcosahedronGeometry(0.1, 0);
  core.translate(center.x, center.y, center.z);
  parts.push(colorize(core, budColor));
  const n = high ? 19 : 9;
  for (let i = 0; i < n; i++) {
    const y = 1 - 2 * (i + 0.5) / n;
    const az = i * 2.39996;
    const hr = Math.sqrt(Math.max(0, 1 - y * y));
    const dir = new THREE3.Vector3(hr * Math.cos(az), y, hr * Math.sin(az));
    const budR = 0.05 + 0.018 * hash(i, 4);
    const bud = high ? new THREE3.SphereGeometry(budR, 6, 5) : new THREE3.IcosahedronGeometry(budR, 0);
    bud.translate(center.x + dir.x * 0.115, center.y + dir.y * 0.115, center.z + dir.z * 0.115);
    tmpColor.copy(budColor).offsetHSL(0, 0, (hash(i, 5) - 0.5) * 0.08);
    parts.push(colorize(bud, tmpColor));
  }
  return mergeParts(parts);
}
function getUmbelGeometry(quality) {
  if (quality === "high") return highGeo ??= buildUmbel("high");
  return lowGeo ??= buildUmbel("low");
}
function getBudBallGeometry(quality) {
  if (quality === "high") return highBudGeo ??= buildBudBall("high");
  return lowBudGeo ??= buildBudBall("low");
}
function getUmbelMaterial(quality) {
  if (quality === "high") {
    highMat ??= new THREE3.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
    return highMat;
  }
  lowMat ??= new THREE3.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, flatShading: true });
  return lowMat;
}

// source/wind.ts
var windSettings = {
  strength: 0.35,
  // 0 = still air, 1 = strong breeze
  speed: 1,
  // time scale for gusts and flutter
  directionDeg: 40
  // horizontal direction the wind blows toward
};

// source/ivy.ts
var defaultIvySettings = {
  quality: "high",
  growthSpeed: 0.8,
  stemRadius: 0.011,
  branchDensity: 6,
  branchLength: 0.55,
  wander: 0.5,
  extend: 0.9,
  leafDensity: 14,
  leafSize: 0.11,
  flowerDensity: 2.5,
  flowerSize: 0.14
};
var STEP = 0.03;
var LIFT = 0.09;
var LEAF_GROW_WINDOW = 0.35;
var _m = new THREE4.Matrix4();
var _q = new THREE4.Quaternion();
var _qFlap = new THREE4.Quaternion();
var _qTwist = new THREE4.Quaternion();
var _s = new THREE4.Vector3();
var _X = new THREE4.Vector3(1, 0, 0);
var _Y = new THREE4.Vector3(0, 1, 0);
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function randUnit(rnd, out) {
  do {
    out.set(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1);
  } while (out.lengthSq() < 1e-4 || out.lengthSq() > 1);
  return out.normalize();
}
var leafTexture = null;
var highLeafGeo = null;
var lowLeafGeo = null;
var highLeafMat = null;
var lowLeafMat = null;
var highStemMat = null;
var lowStemMat = null;
function getHighLeafGeometry() {
  if (highLeafGeo) return highLeafGeo;
  const g = new THREE4.PlaneGeometry(1, 1, 5, 7);
  g.translate(0, 0.5, 0);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, 0.09 * Math.sin(Math.PI * y) - 0.3 * x * x * (0.35 + 0.65 * y));
  }
  g.computeVertexNormals();
  highLeafGeo = g;
  return g;
}
function getLowLeafGeometry() {
  if (lowLeafGeo) return lowLeafGeo;
  const g = new THREE4.BufferGeometry();
  const verts = new Float32Array([
    0,
    0,
    0,
    0,
    0.55,
    -0.06,
    0,
    1,
    0.04,
    -0.38,
    0.5,
    0.1,
    0.38,
    0.5,
    0.1
  ]);
  g.setAttribute("position", new THREE4.BufferAttribute(verts, 3));
  g.setIndex([0, 4, 1, 0, 1, 3, 1, 2, 3, 1, 4, 2]);
  g.computeVertexNormals();
  lowLeafGeo = g;
  return g;
}
function getHighLeafMaterial() {
  highLeafMat ??= new THREE4.MeshStandardMaterial({
    map: leafTexture ??= createIvyLeafTexture(),
    alphaTest: 0.45,
    side: THREE4.DoubleSide,
    roughness: 0.65,
    metalness: 0
  });
  return highLeafMat;
}
function getLowLeafMaterial() {
  lowLeafMat ??= new THREE4.MeshStandardMaterial({
    side: THREE4.DoubleSide,
    flatShading: true,
    roughness: 0.9,
    metalness: 0
  });
  return lowLeafMat;
}
function getHighStemMaterial() {
  highStemMat ??= new THREE4.MeshStandardMaterial({ color: 6116920, roughness: 0.85 });
  return highStemMat;
}
function getLowStemMaterial() {
  lowStemMat ??= new THREE4.MeshStandardMaterial({ color: 6116920, roughness: 0.9, flatShading: true });
  return lowStemMat;
}
function buildStemGeometry(stem, radial) {
  const nodes = stem.nodes;
  const n = nodes.length;
  const positions = new Float32Array(n * radial * 3);
  const normals = new Float32Array(n * radial * 3);
  const indices = [];
  const t = new THREE4.Vector3();
  const b1 = new THREE4.Vector3();
  const b2 = new THREE4.Vector3();
  const dir = new THREE4.Vector3();
  t.copy(nodes[1].pos).sub(nodes[0].pos).normalize();
  b1.copy(nodes[0].normal).addScaledVector(t, -nodes[0].normal.dot(t));
  if (b1.lengthSq() < 1e-6) b1.set(0, 1, 0).addScaledVector(t, -t.y);
  if (b1.lengthSq() < 1e-6) b1.set(1, 0, 0).addScaledVector(t, -t.x);
  b1.normalize();
  for (let i = 0; i < n; i++) {
    const prev = nodes[Math.max(i - 1, 0)].pos;
    const next = nodes[Math.min(i + 1, n - 1)].pos;
    t.copy(next).sub(prev).normalize();
    b1.addScaledVector(t, -b1.dot(t));
    if (b1.lengthSq() < 1e-6) b1.set(0, 1, 0).addScaledVector(t, -t.y);
    b1.normalize();
    b2.crossVectors(t, b1);
    const u = i / (n - 1);
    let r = stem.baseRadius * (0.3 + 0.7 * (1 - u));
    if (i === n - 1) r *= 0.15;
    for (let j = 0; j < radial; j++) {
      const a = j / radial * Math.PI * 2;
      dir.copy(b1).multiplyScalar(Math.cos(a)).addScaledVector(b2, Math.sin(a));
      const k = (i * radial + j) * 3;
      positions[k] = nodes[i].pos.x + dir.x * r;
      positions[k + 1] = nodes[i].pos.y + dir.y * r;
      positions[k + 2] = nodes[i].pos.z + dir.z * r;
      normals[k] = dir.x;
      normals[k + 1] = dir.y;
      normals[k + 2] = dir.z;
    }
  }
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j;
      const b = i * radial + (j + 1) % radial;
      indices.push(a, b, a + radial, b, b + radial, a + radial);
    }
  }
  const geo = new THREE4.BufferGeometry();
  geo.setAttribute("position", new THREE4.BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE4.BufferAttribute(normals, 3));
  geo.setIndex(indices);
  return geo;
}
var IvyPlant = class {
  constructor(samples, seed, settings, targets) {
    this.settings = settings;
    this.targets = targets;
    this.group = new THREE4.Group();
    this.stems = [];
    this.leaves = [];
    this.leafMesh = null;
    this.leafCount = 0;
    // instances currently revealed
    this.restApplied = false;
    // matrices already written for still air + finished growth
    this.flowers = [];
    this.flowerMesh = null;
    // open umbels (bloom > 0)
    this.budMesh = null;
    // closed bud-balls (bloom < 1)
    this.bloomAnim = false;
    // any bloom spring currently moving
    this.flowersRested = false;
    this.progress = 0;
    this.total = 0;
    this.done = false;
    // Hundreds of surface-projection rays run per rebuild — BVH + first-hit keeps them cheap.
    this.raycaster = firstHitOnly(new THREE4.Raycaster());
    const rnd = mulberry32(seed);
    const stems = this.generateSkeleton(samples, rnd);
    this.buildMeshes(stems);
    this.group.name = "ivy";
  }
  get finished() {
    return this.done;
  }
  /** Advance the growth animation (stem reveal + leaf reveal; leaf poses are updateLeaves'). */
  update(dt) {
    if (!this.done) {
      this.progress += dt * this.settings.growthSpeed;
      const p = this.progress;
      for (const st of this.stems) {
        while (st.vis < st.births.length && st.births[st.vis] <= p) st.vis++;
        st.mesh.geometry.setDrawRange(0, Math.max(st.vis - 1, 0) * st.radial * 6);
      }
      if (this.leafMesh) {
        while (this.leafCount < this.leaves.length && this.leaves[this.leafCount].birth <= p) this.leafCount++;
        this.leafMesh.count = this.leafCount;
      }
      if (p >= this.total + LEAF_GROW_WINDOW) this.done = true;
    }
    if (this.bloomAnim) {
      let any = false;
      const step = Math.min(dt, 0.033);
      for (const f of this.flowers) {
        const d = f.target - f.bloom;
        if (Math.abs(d) < 1e-3 && Math.abs(f.vel) < 1e-3) {
          f.bloom = f.target;
          f.vel = 0;
          continue;
        }
        f.vel += (d * 30 - f.vel * 5.5) * step;
        f.bloom += f.vel * step;
        if (f.bloom < 0) {
          f.bloom = 0;
          f.vel = 0;
        }
        any = true;
      }
      this.bloomAnim = any;
      this.flowersRested = false;
    }
  }
  /**
   * Per-frame leaf poses: growth scale-in combined with wind, called every frame with the
   * elapsed time in seconds. Wind is a rigid rotation of each blade about its base — the
   * instance origin IS the stem attachment point, so leaves can never detach — with:
   *  - lean from wind pressure (dot of wind direction with the blade's rest normal),
   *  - a gust wave travelling along the wind direction (leaves ripple in sequence),
   *  - per-leaf detuned flutter,
   *  - an asymmetric flap clamp: blades swing freely away from the host surface (+z of the
   *    leaf frame) but barely toward it, so they never get pushed inside the mesh.
   */
  updateLeaves(t) {
    const w = windSettings;
    const windy = w.strength > 1e-3;
    const speed = w.speed;
    const rad = THREE4.MathUtils.degToRad(w.directionDeg);
    const dx = Math.cos(rad);
    const dz = Math.sin(rad);
    this.poseFlowers(t, windy, speed);
    if (!this.leafMesh || this.leafCount === 0) return;
    if (!windy && this.done && this.restApplied) return;
    for (let i = 0; i < this.leafCount; i++) {
      const leaf = this.leaves[i];
      let f = (this.progress - leaf.birth) / LEAF_GROW_WINDOW;
      if (f > 1) f = 1;
      else if (f < 0) f = 0;
      const e = f * f * (3 - 2 * f);
      const s = Math.max(leaf.scale * e, 1e-4);
      _q.copy(leaf.quat);
      if (windy) {
        const wave = Math.sin(t * 1.1 * speed - (leaf.pos.x * dx + leaf.pos.z * dz) * 1.6 + leaf.phase * 0.2);
        const gustFactor = 0.3 + 0.7 * (0.5 + 0.5 * wave) ** 2;
        const strength = w.strength * gustFactor;
        const press = dx * leaf.normal.x + dz * leaf.normal.z;
        const flutter = Math.sin(t * 4.6 * speed + leaf.phase) + 0.5 * Math.sin(t * 7.3 * speed + leaf.phase * 1.7);
        const flap = THREE4.MathUtils.clamp(press * strength * 0.9 + flutter * strength * 0.35, -0.18, 0.85);
        const twist = Math.sin(t * 3.1 * speed + leaf.phase * 2.3) * strength * 0.3;
        _q.multiply(_qFlap.setFromAxisAngle(_X, flap)).multiply(_qTwist.setFromAxisAngle(_Y, twist));
      }
      _m.compose(leaf.pos, _q, _s.set(s, s, s));
      this.leafMesh.setMatrixAt(i, _m);
    }
    this.leafMesh.instanceMatrix.needsUpdate = true;
    this.restApplied = !windy && this.done;
  }
  /**
   * Instance matrices for the flowers. Every site is VISIBLE from the moment that part of
   * the vine has grown — as a tight bud-ball. The F brush morphs it: the ball shrinks away
   * while the open umbel springs up in its place (with the pop overshoot).
   */
  poseFlowers(t, windy, speed) {
    if (!this.flowerMesh || !this.budMesh) return;
    if (!windy && !this.bloomAnim && this.flowersRested) return;
    const w = windSettings;
    for (let i = 0; i < this.flowers.length; i++) {
      const f = this.flowers[i];
      let a = (this.progress - f.birth) / LEAF_GROW_WINDOW;
      if (a > 1) a = 1;
      else if (a < 0) a = 0;
      const appear = a * a * (3 - 2 * a);
      _q.copy(f.quat);
      if (windy && appear > 0.05) {
        const sway = Math.sin(t * 2.3 * speed + f.phase) * w.strength * 0.1;
        const bob = Math.sin(t * 3.4 * speed + f.phase * 1.7) * w.strength * 0.06;
        _q.multiply(_qFlap.setFromAxisAngle(_X, sway)).multiply(_qTwist.setFromAxisAngle(_Y, bob));
      }
      const budScale = Math.max(f.scale * appear * Math.max(1 - f.bloom, 0), 1e-4);
      _m.compose(f.pos, _q, _s.set(budScale, budScale, budScale));
      this.budMesh.setMatrixAt(i, _m);
      const umbelScale = Math.max(f.scale * appear * f.bloom, 1e-4);
      _m.compose(f.pos, _q, _s.set(umbelScale, umbelScale, umbelScale));
      this.flowerMesh.setMatrixAt(i, _m);
    }
    this.budMesh.instanceMatrix.needsUpdate = true;
    this.flowerMesh.instanceMatrix.needsUpdate = true;
    this.flowersRested = !windy && !this.bloomAnim && this.done;
  }
  // ---------- blooming (the F brush) ----------
  /** Bloom every unopened bud within `radius` of `point` (only on already-grown vine). */
  bloomAt(point, radius) {
    const r2 = radius * radius;
    for (const f of this.flowers) {
      if (f.target === 0 && f.birth <= this.progress && f.pos.distanceToSquared(point) <= r2) {
        f.target = 1;
        this.bloomAnim = true;
      }
    }
  }
  bloomAll() {
    for (const f of this.flowers) {
      if (f.birth <= this.progress) f.target = 1;
    }
    this.bloomAnim = true;
  }
  resetBlooms() {
    for (const f of this.flowers) f.target = 0;
    this.bloomAnim = true;
  }
  // ---------- cheap live paths (rescale in place — no regeneration) ----------
  /** Rescale every leaf instance to a new leaf size without rebuilding the plant. */
  setLeafSize(v) {
    const r = v / this.settings.leafSize;
    if (!Number.isFinite(r) || r <= 0 || r === 1) return;
    this.settings.leafSize = v;
    for (const leaf of this.leaves) leaf.scale *= r;
    this.restApplied = false;
  }
  /** Rescale every flower/bud instance without rebuilding the plant. */
  setFlowerSize(v) {
    const r = v / this.settings.flowerSize;
    if (!Number.isFinite(r) || r <= 0 || r === 1) return;
    this.settings.flowerSize = v;
    for (const f of this.flowers) f.scale *= r;
    this.flowersRested = false;
  }
  /** Jump straight to the fully-grown state (used when tweaking settings live). */
  finishGrowth() {
    this.progress = this.total + LEAF_GROW_WINDOW + 1;
    this.done = false;
    this.update(0);
  }
  dispose() {
    for (const st of this.stems) st.mesh.geometry.dispose();
    this.leafMesh?.dispose();
    this.flowerMesh?.dispose();
    this.budMesh?.dispose();
    this.group.removeFromParent();
  }
  // ---------- skeleton generation ----------
  generateSkeleton(samples, rnd) {
    const s = this.settings;
    const stems = [];
    const curve = new THREE4.CatmullRomCurve3(samples.map((p) => p.position), false, "centripetal");
    const len = Math.max(curve.getLength(), STEP * 2);
    const n = Math.max(3, Math.ceil(len / STEP));
    const pts = curve.getSpacedPoints(n);
    const main = { nodes: [], baseRadius: s.stemRadius };
    let birth = 0;
    for (let i = 0; i <= n; i++) {
      const t = i / n * (samples.length - 1);
      const a = samples[Math.floor(t)];
      const b = samples[Math.min(Math.ceil(t), samples.length - 1)];
      const guess = a.normal.clone().lerp(b.normal, t % 1).normalize();
      const hit = this.project(pts[i], guess);
      const pos = hit ? hit.point.clone().addScaledVector(hit.normal, s.stemRadius * 0.6) : pts[i].clone();
      const normal = hit ? hit.normal : guess;
      if (i > 0) birth += pos.distanceTo(main.nodes[i - 1].pos);
      main.nodes.push({ pos, normal, birth });
    }
    if (s.extend > 0.01) {
      const last = main.nodes[main.nodes.length - 1];
      const prev = main.nodes[main.nodes.length - 2];
      const dir = last.pos.clone().sub(prev.pos).normalize();
      this.creep(main.nodes, last.pos, last.normal, dir, s.extend, last.birth, rnd);
    }
    stems.push(main);
    if (s.branchDensity > 0) this.spawnBranches(main, 0, rnd, stems);
    for (const stem of stems) this.sprinkleLeaves(stem, rnd);
    this.leaves.sort((a, b) => a.birth - b.birth);
    for (const stem of stems) this.sprinkleFlowers(stem, rnd);
    this.total = 0;
    for (const stem of stems) {
      this.total = Math.max(this.total, stem.nodes[stem.nodes.length - 1].birth);
    }
    if (this.leaves.length > 0) {
      this.total = Math.max(this.total, this.leaves[this.leaves.length - 1].birth);
    }
    return stems;
  }
  /**
   * Grow a stem tip forward step by step: wander randomly, cling to the surface when a
   * projection ray hits it, droop under gravity when it walks off an edge.
   */
  creep(out, startPos, startNormal, startDir, length, birth0, rnd) {
    const s = this.settings;
    const pos = startPos.clone();
    const normal = startNormal.clone();
    const dir = startDir.clone();
    const tmp = new THREE4.Vector3();
    let traveled = 0;
    let birth = birth0;
    let attached = true;
    while (traveled < length) {
      dir.addScaledVector(randUnit(rnd, tmp), s.wander * 0.55);
      if (attached) {
        dir.addScaledVector(normal, -dir.dot(normal));
      } else {
        dir.y -= 0.45;
      }
      if (dir.lengthSq() < 1e-8) randUnit(rnd, dir);
      dir.normalize();
      pos.addScaledVector(dir, STEP);
      const hit = this.project(pos, normal);
      if (hit) {
        pos.copy(hit.point).addScaledVector(hit.normal, s.stemRadius * 0.6);
        normal.copy(hit.normal);
        attached = true;
      } else {
        attached = false;
      }
      traveled += STEP;
      birth += STEP;
      out.push({ pos: pos.clone(), normal: normal.clone(), birth });
    }
  }
  spawnBranches(parent, depth, rnd, out) {
    const s = this.settings;
    const interval = 1 / s.branchDensity;
    let next = interval * (0.5 + rnd());
    let acc = 0;
    let side = rnd() < 0.5 ? 1 : -1;
    for (let i = 1; i < parent.nodes.length - 1; i++) {
      acc += parent.nodes[i].pos.distanceTo(parent.nodes[i - 1].pos);
      if (acc < next) continue;
      next = acc + interval * (0.6 + 0.8 * rnd());
      const node = parent.nodes[i];
      const dir = parent.nodes[i + 1].pos.clone().sub(parent.nodes[i - 1].pos).normalize().applyAxisAngle(node.normal, side * (0.65 + 0.85 * rnd()));
      side *= -1;
      const len = s.branchLength * (0.45 + 0.9 * rnd()) * (depth === 0 ? 1 : 0.5);
      const stem = {
        nodes: [{ pos: node.pos.clone(), normal: node.normal.clone(), birth: node.birth }],
        baseRadius: parent.baseRadius * 0.62
      };
      this.creep(stem.nodes, node.pos, node.normal, dir, len, node.birth + STEP, rnd);
      if (stem.nodes.length < 3) continue;
      out.push(stem);
      if (depth === 0 && rnd() < 0.45) this.spawnBranches(stem, 1, rnd, out);
    }
  }
  sprinkleLeaves(stem, rnd) {
    const s = this.settings;
    if (s.leafDensity <= 0) return;
    const interval = 1 / s.leafDensity;
    let next = interval * rnd();
    let acc = 0;
    let side = rnd() < 0.5 ? 1 : -1;
    const tmp = new THREE4.Vector3();
    for (let i = 1; i < stem.nodes.length - 1; i++) {
      acc += stem.nodes[i].pos.distanceTo(stem.nodes[i - 1].pos);
      if (acc < next) continue;
      next = acc + interval * (0.55 + 0.9 * rnd());
      const node = stem.nodes[i];
      const tangent = stem.nodes[i + 1].pos.clone().sub(stem.nodes[i - 1].pos).normalize();
      const y = tangent.applyAxisAngle(node.normal, side * (0.5 + 0.9 * rnd())).addScaledVector(node.normal, 0.2 + 0.5 * rnd()).normalize();
      side *= -1;
      const zGuess = node.normal.clone().addScaledVector(randUnit(rnd, tmp), 0.3).normalize();
      const x = new THREE4.Vector3().crossVectors(y, zGuess);
      if (x.lengthSq() < 1e-6) continue;
      x.normalize();
      const z = new THREE4.Vector3().crossVectors(x, y);
      const quat = new THREE4.Quaternion().setFromRotationMatrix(new THREE4.Matrix4().makeBasis(x, y, z));
      const color = new THREE4.Color();
      if (s.quality === "high") {
        color.setHSL(0.26 + rnd() * 0.08, 0.3 + rnd() * 0.2, 0.55 + rnd() * 0.35);
      } else {
        color.setHSL(0.27 + rnd() * 0.07, 0.45 + rnd() * 0.15, 0.28 + rnd() * 0.18);
      }
      this.leaves.push({
        pos: node.pos.clone().addScaledVector(node.normal, s.stemRadius * 0.4),
        quat,
        normal: z.clone(),
        phase: rnd() * Math.PI * 2,
        scale: s.leafSize * (0.55 + 0.75 * rnd()),
        birth: node.birth + 0.05,
        color
      });
    }
  }
  /** Scatter umbel bud sites along a stem: rising off the surface, waiting for the F brush. */
  sprinkleFlowers(stem, rnd) {
    const s = this.settings;
    if (s.flowerDensity <= 0) return;
    const interval = 1 / s.flowerDensity;
    let next = interval * (0.4 + rnd());
    let acc = 0;
    const tmp = new THREE4.Vector3();
    for (let i = 1; i < stem.nodes.length - 1; i++) {
      acc += stem.nodes[i].pos.distanceTo(stem.nodes[i - 1].pos);
      if (acc < next) continue;
      next = acc + interval * (0.6 + 0.8 * rnd());
      const node = stem.nodes[i];
      const y = node.normal.clone().addScaledVector(randUnit(rnd, tmp), 0.22).add(new THREE4.Vector3(0, 0.15, 0)).normalize();
      const x = new THREE4.Vector3().crossVectors(y, randUnit(rnd, tmp));
      if (x.lengthSq() < 1e-6) continue;
      x.normalize();
      const z = new THREE4.Vector3().crossVectors(x, y);
      const quat = new THREE4.Quaternion().setFromRotationMatrix(new THREE4.Matrix4().makeBasis(x, y, z));
      this.flowers.push({
        pos: node.pos.clone().addScaledVector(node.normal, s.stemRadius * 0.3),
        quat,
        phase: rnd() * Math.PI * 2,
        scale: s.flowerSize * (0.7 + 0.6 * rnd()),
        birth: node.birth + 0.1,
        tint: new THREE4.Color().setHSL(0.2 + rnd() * 0.08, 0.25, 0.82 + rnd() * 0.15),
        bloom: 0,
        vel: 0,
        target: 0
      });
    }
  }
  project(pos, normal) {
    const origin = pos.clone().addScaledVector(normal, LIFT);
    this.raycaster.set(origin, normal.clone().negate());
    this.raycaster.far = LIFT * 2.2;
    const hits = this.raycaster.intersectObjects(this.targets, true);
    for (const h of hits) {
      if (!h.face) continue;
      const n = h.face.normal.clone().transformDirection(h.object.matrixWorld);
      if (n.dot(normal) < 0) n.negate();
      return { point: h.point, normal: n };
    }
    return null;
  }
  // ---------- geometry ----------
  buildMeshes(stems) {
    const s = this.settings;
    const radial = s.quality === "high" ? 8 : 4;
    const stemMat = s.quality === "high" ? getHighStemMaterial() : getLowStemMaterial();
    for (const stem of stems) {
      if (stem.nodes.length < 2) continue;
      const mesh = new THREE4.Mesh(buildStemGeometry(stem, radial), stemMat);
      mesh.castShadow = true;
      mesh.geometry.setDrawRange(0, 0);
      this.group.add(mesh);
      this.stems.push({ mesh, births: stem.nodes.map((nd) => nd.birth), radial, vis: 0 });
    }
    if (this.leaves.length > 0) {
      const geo = s.quality === "high" ? getHighLeafGeometry() : getLowLeafGeometry();
      const mat = s.quality === "high" ? getHighLeafMaterial() : getLowLeafMaterial();
      const mesh = new THREE4.InstancedMesh(geo, mat, this.leaves.length);
      mesh.instanceMatrix.setUsage(THREE4.DynamicDrawUsage);
      mesh.castShadow = true;
      mesh.frustumCulled = false;
      const m = new THREE4.Matrix4();
      const sc = new THREE4.Vector3();
      this.leaves.forEach((leaf, i) => {
        m.compose(leaf.pos, leaf.quat, sc.set(leaf.scale, leaf.scale, leaf.scale));
        mesh.setMatrixAt(i, m);
        mesh.setColorAt(i, leaf.color);
      });
      mesh.count = 0;
      this.leafMesh = mesh;
      this.group.add(mesh);
    }
    if (this.flowers.length > 0) {
      const makeInstanced = (geo) => {
        const mesh = new THREE4.InstancedMesh(geo, getUmbelMaterial(s.quality), this.flowers.length);
        mesh.instanceMatrix.setUsage(THREE4.DynamicDrawUsage);
        mesh.castShadow = true;
        mesh.frustumCulled = false;
        const m = new THREE4.Matrix4();
        const sc = new THREE4.Vector3();
        this.flowers.forEach((f, i) => {
          m.compose(f.pos, f.quat, sc.set(1e-4, 1e-4, 1e-4));
          mesh.setMatrixAt(i, m);
          mesh.setColorAt(i, f.tint);
        });
        this.group.add(mesh);
        return mesh;
      };
      this.budMesh = makeInstanced(getBudBallGeometry(s.quality));
      this.flowerMesh = makeInstanced(getUmbelGeometry(s.quality));
    }
  }
};
export {
  IvyPlant,
  defaultIvySettings,
  disposeRaycastIndex,
  indexForRaycasts,
  windSettings
};
