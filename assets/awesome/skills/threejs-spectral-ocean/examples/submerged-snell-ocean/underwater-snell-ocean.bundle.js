// source/caustics.ts
import {
  AdditiveBlending,
  Color as Color2,
  HalfFloatType,
  InstancedMesh,
  LinearFilter,
  OrthographicCamera,
  PlaneGeometry,
  RenderTarget,
  RepeatWrapping,
  Scene
} from "three";
import { MeshBasicNodeMaterial } from "three/webgpu";
import {
  Fn,
  dFdx,
  dFdy,
  exp,
  float,
  instanceIndex,
  max,
  mix,
  normalize,
  positionGeometry,
  refract,
  smoothstep,
  texture,
  uniform as uniform2,
  varying,
  vec2,
  vec3,
  vec4
} from "three/tsl";

// source/sun.ts
import { Color, Vector3 } from "three";
import { uniform } from "three/tsl";
var SUN_ELEVATION = 42 * Math.PI / 180;
var SUN_AZIMUTH = 215 * Math.PI / 180;
var sunDirection = new Vector3(
  Math.cos(SUN_ELEVATION) * Math.sin(SUN_AZIMUTH),
  Math.sin(SUN_ELEVATION),
  Math.cos(SUN_ELEVATION) * Math.cos(SUN_AZIMUTH)
).normalize();
var sunColor = new Color(1, 0.925, 0.79);
var SUN_LIGHT_INTENSITY = 3.4;
var sunDirectionUniform = uniform(sunDirection);
var sunColorUniform = uniform(sunColor);

// source/caustics.ts
var CAUSTIC_TILE = 17;
var GRID = 256;
var PROJECT_DEPTH = 24;
var CausticsPass = class {
  constructor(sim, resolution) {
    this.scene = new Scene();
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.renderTarget = new RenderTarget(resolution, resolution, {
      type: HalfFloatType,
      depthBuffer: false
    });
    this.renderTarget.texture.wrapS = RepeatWrapping;
    this.renderTarget.texture.wrapT = RepeatWrapping;
    this.renderTarget.texture.minFilter = LinearFilter;
    this.renderTarget.texture.magFilter = LinearFilter;
    this.textureNode = texture(this.renderTarget.texture);
    const material = new MeshBasicNodeMaterial();
    material.blending = AdditiveBlending;
    material.depthTest = false;
    material.depthWrite = false;
    const tile = float(CAUSTIC_TILE);
    const uv01 = positionGeometry.xy.mul(0.5).add(0.5);
    const worldXZ = uv01.mul(tile);
    const patch1 = sim.patchLengths[1];
    const der = sim.derivativeNodes[1].sample(worldXZ.div(patch1));
    const disp = sim.displacementNodes[1].sample(worldXZ.div(patch1));
    const surfaceNormal = normalize(vec3(der.x.negate(), 1, der.y.negate()));
    const toSun = sunDirectionUniform;
    const eta = float(1 / 1.333);
    const flatRefract = refract(toSun.negate(), vec3(0, 1, 0), eta);
    const waveRefract = refract(toSun.negate(), surfaceNormal, eta);
    const depth = float(PROJECT_DEPTH);
    const oldPos = worldXZ.add(flatRefract.xz.mul(depth.div(flatRefract.y.abs())));
    const newPos = worldXZ.add(disp.xz).add(waveRefract.xz.mul(depth.add(disp.y).div(waveRefract.y.abs())));
    const centered = newPos.sub(flatRefract.xz.mul(depth.div(flatRefract.y.abs())));
    const vOld = varying(oldPos);
    const vNew = varying(newPos);
    const ix = float(instanceIndex.mod(3)).sub(1).mul(2);
    const iy = float(instanceIndex.div(3)).sub(1).mul(2);
    const ndc = centered.div(tile).mul(2).sub(1).add(vec2(ix, iy));
    material.vertexNode = vec4(ndc, 0, 1);
    material.colorNode = Fn(() => {
      const oldArea = dFdx(vOld).length().mul(dFdy(vOld).length());
      const newArea = max(dFdx(vNew).length().mul(dFdy(vNew).length()), 1e-6);
      const intensity = oldArea.div(newArea).mul(0.18);
      return vec4(vec3(intensity.min(6)), 1);
    })();
    const mesh = new InstancedMesh(new PlaneGeometry(2, 2, GRID, GRID), material, 9);
    mesh.frustumCulled = false;
    this.scene.add(mesh);
    this.scene.background = new Color2(0);
  }
  update(renderer) {
    renderer.setRenderTarget(this.renderTarget);
    void renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
  }
  dispose() {
    this.renderTarget.dispose();
  }
};
var CAUSTIC_FIELD_MEAN = 0.18;
var causticBakeNeutral = uniform2(0);
function causticWorldSample(causticsNode, options = {}) {
  return Fn(([worldPos]) => {
    const toSun = sunDirectionUniform;
    const up = toSun.y.max(0.2);
    const travel = worldPos.y.negate().div(up);
    const surfaceXZ = vec2(
      worldPos.x.add(toSun.x.mul(travel)),
      worldPos.z.add(toSun.z.mul(travel))
    );
    const uv = surfaceXZ.div(CAUSTIC_TILE);
    const spread = float(16e-4);
    const r = causticsNode.sample(uv).r;
    const g = causticsNode.sample(uv.add(vec2(spread, spread.negate()))).r;
    const b = causticsNode.sample(uv.add(vec2(spread.negate().mul(1.6), spread))).r;
    const depthFade = exp(worldPos.y.mul(0.055)).min(1);
    let field = mix(
      vec3(r, g, b),
      vec3(CAUSTIC_FIELD_MEAN),
      causticBakeNeutral
    );
    if (options.footprintFade) {
      const footprint = max(dFdx(surfaceXZ).length(), dFdy(surfaceXZ).length());
      const fade = smoothstep(0.06, 0.28, footprint);
      field = mix(field, vec3(CAUSTIC_FIELD_MEAN), fade);
    }
    return field.mul(depthFade);
  });
}

// source/current.ts
import { Fn as Fn2, cos, sin, vec3 as vec32 } from "three/tsl";
var currentFlow = /* @__PURE__ */ Fn2(([p, t]) => {
  const x = p.x.mul(0.05);
  const z = p.z.mul(0.05);
  const s1 = sin(x.add(t.mul(0.11))).mul(cos(z.mul(1.3).sub(t.mul(0.07))));
  const s2 = sin(z.mul(0.7).add(t.mul(0.05)).add(x.mul(0.4)));
  const s3 = cos(x.mul(1.7).sub(z.mul(0.6)).add(t.mul(0.09)));
  return vec32(
    s1.mul(0.5).add(s2.mul(0.2)),
    s3.mul(0.12),
    s2.mul(0.45).sub(s1.mul(0.15))
  );
});
function currentFlowCpu(px, pz, t) {
  const x = px * 0.05;
  const z = pz * 0.05;
  const s1 = Math.sin(x + t * 0.11) * Math.cos(z * 1.3 - t * 0.07);
  const s2 = Math.sin(z * 0.7 + t * 0.05 + x * 0.4);
  const s3 = Math.cos(x * 1.7 - z * 0.6 + t * 0.09);
  return { x: s1 * 0.5 + s2 * 0.2, y: s3 * 0.12, z: s2 * 0.45 - s1 * 0.15 };
}

// source/fft-compute.ts
import { DataTexture, FloatType, NearestFilter, RGBAFormat } from "three";
import { StorageBufferAttribute, StorageTexture } from "three/webgpu";
import {
  Fn as Fn3,
  float as float2,
  instanceIndex as instanceIndex2,
  int,
  ivec2,
  localId,
  select,
  storage,
  texture as texture2,
  textureLoad,
  textureStore,
  uint,
  vec2 as vec22,
  vec4 as vec42,
  workgroupArray,
  workgroupBarrier,
  workgroupId
} from "three/tsl";
function createFrequencyTexture(n) {
  const tex = new StorageTexture(n, n);
  tex.type = FloatType;
  tex.minFilter = NearestFilter;
  tex.magFilter = NearestFilter;
  tex.generateMipmaps = false;
  return tex;
}
var PackedIFFT = class {
  constructor(ping, pong, n) {
    this.stages = [];
    const logN = Math.log2(n);
    if (!Number.isInteger(logN) || n > 256) {
      throw new Error(`PackedIFFT requires a power-of-two workgroup size up to 256; received ${n}`);
    }
    const makeAxis = (source, dest, horizontal) => {
      const shared = workgroupArray("vec4", n);
      return Fn3(() => {
        const lane = localId.x.toVar();
        const line = int(workgroupId.x);
        const reversed = uint(0).toVar();
        const remaining = lane.toVar();
        for (let bit = 0; bit < logN; bit++) {
          reversed.assign(reversed.shiftLeft(1).bitOr(remaining.bitAnd(1)));
          remaining.assign(remaining.shiftRight(1));
        }
        const input = horizontal ? ivec2(int(reversed), line) : ivec2(line, int(reversed));
        shared.element(lane).assign(textureLoad(texture2(source), input));
        workgroupBarrier();
        for (let stage = 0; stage < logN; stage++) {
          const groupSize = uint(1 << stage + 1);
          const halfSize = uint(1 << stage);
          const local = lane.mod(groupSize);
          const top = local.lessThan(halfSize);
          const offset = local.mod(halfSize);
          const indexA = select(top, lane, lane.sub(halfSize));
          const indexB = indexA.add(halfSize);
          const a = shared.element(indexA).toVar();
          const b = shared.element(indexB).toVar();
          const angle = float2(offset).mul(Math.PI * 2 / (1 << stage + 1));
          const sign = select(top, float2(1), float2(-1));
          const w = vec22(angle.cos(), angle.sin()).mul(sign);
          const field1 = a.xy.add(
            vec22(b.x.mul(w.x).sub(b.y.mul(w.y)), b.x.mul(w.y).add(b.y.mul(w.x)))
          );
          const field2 = a.zw.add(
            vec22(b.z.mul(w.x).sub(b.w.mul(w.y)), b.z.mul(w.y).add(b.w.mul(w.x)))
          );
          workgroupBarrier();
          shared.element(lane).assign(vec42(field1, field2));
          workgroupBarrier();
        }
        const output3 = horizontal ? ivec2(int(lane), line) : ivec2(line, int(lane));
        textureStore(dest, output3, shared.element(lane));
      })().compute(n * n, [n]);
    };
    this.stages.push(makeAxis(ping, pong, true));
    this.stages.push(makeAxis(pong, ping, false));
    this.output = ping;
  }
};
async function runFftSelfTest(renderer, n = 64) {
  const ping = createFrequencyTexture(n);
  const pong = createFrequencyTexture(n);
  const ifft = new PackedIFFT(ping, pong, n);
  const readBuffer = new StorageBufferAttribute(new Float32Array(n * n * 4), 4);
  const runCase = async (impulseX, impulseY) => {
    const data = new Float32Array(n * n * 4);
    data[(impulseY * n + impulseX) * 4] = 1;
    const input = new DataTexture(data, n, n, RGBAFormat, FloatType);
    input.minFilter = NearestFilter;
    input.magFilter = NearestFilter;
    input.needsUpdate = true;
    const mask = uint(n - 1);
    const shift = uint(Math.log2(n));
    const upload = Fn3(() => {
      const x = int(instanceIndex2.bitAnd(mask));
      const y = int(instanceIndex2.shiftRight(shift));
      textureStore(ping, ivec2(x, y), textureLoad(texture2(input), ivec2(x, y)));
    })().compute(n * n);
    renderer.compute(upload);
    for (const stage of ifft.stages) renderer.compute(stage);
    const download = Fn3(() => {
      const x = int(instanceIndex2.bitAnd(mask));
      const y = int(instanceIndex2.shiftRight(shift));
      const value = textureLoad(texture2(ifft.output), ivec2(x, y));
      storage(readBuffer, "vec4", n * n).element(instanceIndex2).assign(value);
    })().compute(n * n);
    renderer.compute(download);
    const pixels = new Float32Array(await renderer.getArrayBufferAsync(readBuffer));
    input.dispose();
    return pixels;
  };
  const constant = await runCase(n / 2, n / 2);
  let maxErrorConstant = 0;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const sign = (x + y) % 2 === 0 ? 1 : -1;
      const re = constant[(y * n + x) * 4] * sign;
      const im = constant[(y * n + x) * 4 + 1] * sign;
      maxErrorConstant = Math.max(maxErrorConstant, Math.abs(re - 1), Math.abs(im));
    }
  }
  const wave = await runCase(n / 2 + 1, n / 2);
  let maxErrorWave = 0;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const sign = (x + y) % 2 === 0 ? 1 : -1;
      const re = wave[(y * n + x) * 4] * sign;
      const im = wave[(y * n + x) * 4 + 1] * sign;
      const phase = Math.PI * 2 * x / n;
      maxErrorWave = Math.max(
        maxErrorWave,
        Math.abs(re - Math.cos(phase)),
        Math.abs(im - Math.sin(phase))
      );
    }
  }
  return { maxErrorConstant, maxErrorWave };
}

// source/grade.ts
import {
  ClampToEdgeWrapping,
  Data3DTexture,
  LinearFilter as LinearFilter2,
  RGBAFormat as RGBAFormat2,
  UnsignedByteType
} from "three";
import { lut3D } from "three/addons/tsl/display/Lut3DNode.js";
import {
  clamp,
  float as float3,
  screenUV,
  smoothstep as smoothstep2,
  texture3D,
  uniform as uniform3,
  vec4 as vec43
} from "three/tsl";
var asColor = (node) => node;
var LUT_SIZE = 32;
var gradeParams = {
  exposureEV: uniform3(0),
  lutIntensity: uniform3(1),
  vignette: uniform3(0.115)
};
var dreamLutTexture = createDreamLutTexture();
function dreamGrade(inputColor) {
  const input = clamp(asColor(inputColor), 0, 1);
  const graded = lut3D(
    input,
    texture3D(dreamLutTexture),
    LUT_SIZE,
    gradeParams.lutIntensity
  );
  const centered = screenUV.sub(0.5);
  const falloff = smoothstep2(0.38, 0.94, centered.length().mul(1.34));
  const vignetted = graded.rgb.mul(float3(1).sub(falloff.mul(gradeParams.vignette)));
  return vec43(vignetted.clamp(0, 1), float3(1));
}
function createDreamLutTexture() {
  const data = new Uint8Array(LUT_SIZE ** 3 * 4);
  let offset = 0;
  for (let b = 0; b < LUT_SIZE; b++) {
    for (let g = 0; g < LUT_SIZE; g++) {
      for (let r = 0; r < LUT_SIZE; r++) {
        const source = [
          r / (LUT_SIZE - 1),
          g / (LUT_SIZE - 1),
          b / (LUT_SIZE - 1)
        ];
        const graded = gradeSample(source);
        data[offset++] = Math.round(graded[0] * 255);
        data[offset++] = Math.round(graded[1] * 255);
        data[offset++] = Math.round(graded[2] * 255);
        data[offset++] = 255;
      }
    }
  }
  const texture3D2 = new Data3DTexture(data, LUT_SIZE, LUT_SIZE, LUT_SIZE);
  texture3D2.format = RGBAFormat2;
  texture3D2.type = UnsignedByteType;
  texture3D2.minFilter = LinearFilter2;
  texture3D2.magFilter = LinearFilter2;
  texture3D2.wrapS = ClampToEdgeWrapping;
  texture3D2.wrapT = ClampToEdgeWrapping;
  texture3D2.wrapR = ClampToEdgeWrapping;
  texture3D2.generateMipmaps = false;
  texture3D2.needsUpdate = true;
  texture3D2.name = "dreamGrade32";
  return texture3D2;
}
function gradeSample(color) {
  const lift = [0.011, 0.026, 0.033];
  const gain = [1.042, 1.008, 0.972];
  const balanced = color.map((channel, index) => channel * gain[index] + lift[index] * (1 - channel));
  const luminance = balanced[0] * 0.2126 + balanced[1] * 0.7152 + balanced[2] * 0.0722;
  const saturation = Math.max(...balanced) - Math.min(...balanced);
  const vibrance = 1 + 0.17 * (1 - saturation);
  return balanced.map((channel) => clampCpu(luminance + (channel - luminance) * vibrance));
}
function clampCpu(value) {
  return Math.max(0, Math.min(1, value));
}

// source/interface-structure-layer.ts
import {
  BufferGeometry,
  Box3,
  Color as Color3,
  DepthTexture,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  HalfFloatType as HalfFloatType2,
  LinearFilter as LinearFilter3,
  LinearSRGBColorSpace,
  Matrix4,
  Mesh,
  NearestFilter as NearestFilter2,
  RenderTarget as RenderTarget2,
  Scene as Scene2,
  Sphere,
  Vector2
} from "three";
import { MeshStandardNodeMaterial } from "three/webgpu";
import {
  cameraPosition,
  cameraProjectionMatrix,
  cameraViewMatrix,
  dot,
  float as float4,
  Fn as Fn4,
  If,
  max as max2,
  mix as mix2,
  modelWorldMatrix,
  normalize as normalize2,
  positionLocal,
  positionWorld,
  select as select2,
  smoothstep as smoothstep3,
  step,
  texture as texture3,
  uniform as uniform4,
  vec2 as vec23,
  vec3 as vec33,
  vec4 as vec44
} from "three/tsl";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { TessellateModifier } from "three/addons/modifiers/TessellateModifier.js";

// source/optical-constants.ts
var AIR_IOR = 1;
var WATER_IOR = 1.333;
var AQUATIC_EXTINCTION = [0.026, 85e-4, 5e-3];
var AQUATIC_AMBIENT_DOWN = [0.01, 0.075, 0.14];
var AQUATIC_AMBIENT_UP = [0.1, 0.32, 0.37];

// source/interface-structure-layer.ts
var TARGET_SCALE = 0.5;
var TARGET_MAX_EDGE = 1024;
var ACTIVE_SURFACE_MARGIN = 1;
var ACTIVE_CAMERA_DISTANCE = 90;
var CRITICAL_TANGENT = Math.tan(Math.asin(AIR_IOR / WATER_IOR));
var INTERFACE_SOLVE_STEPS = 14;
function clipGeometryAboveY(source, minimumY) {
  const geometry = source.index ? source.toNonIndexed() : source;
  const attributes = Object.entries(geometry.attributes).filter(
    ([, attribute]) => attribute.itemSize >= 1 && attribute.itemSize <= 4
  );
  const output3 = new Map(attributes.map(([name]) => [name, []]));
  const position = geometry.getAttribute("position");
  if (!position) return new BufferGeometry();
  const componentAt = (attribute, index, component) => {
    switch (component) {
      case 0:
        return attribute.getX(index);
      case 1:
        return attribute.getY(index);
      case 2:
        return attribute.getZ(index);
      default:
        return attribute.getW(index);
    }
  };
  const readVertex = (index) => Object.fromEntries(
    attributes.map(([name, attribute]) => [
      name,
      Array.from(
        { length: attribute.itemSize },
        (_, component) => componentAt(attribute, index, component)
      )
    ])
  );
  const interpolate = (a, b) => {
    const ay = a.position[1];
    const by = b.position[1];
    const heightDelta = by - ay;
    const t = (minimumY - ay) / (Math.abs(heightDelta) > 1e-8 ? heightDelta : 1e-8);
    return Object.fromEntries(
      attributes.map(([name]) => [
        name,
        a[name].map((value, component) => value + (b[name][component] - value) * t)
      ])
    );
  };
  const emit = (vertex) => {
    for (const [name] of attributes) output3.get(name)?.push(...vertex[name]);
  };
  for (let triangle = 0; triangle < position.count; triangle += 3) {
    let polygon = [
      readVertex(triangle),
      readVertex(triangle + 1),
      readVertex(triangle + 2)
    ];
    const clipped = [];
    for (let i = 0; i < polygon.length; i++) {
      const previous = polygon[(i + polygon.length - 1) % polygon.length];
      const current = polygon[i];
      const previousInside = previous.position[1] >= minimumY;
      const currentInside = current.position[1] >= minimumY;
      if (currentInside) {
        if (!previousInside) clipped.push(interpolate(previous, current));
        clipped.push(current);
      } else if (previousInside) {
        clipped.push(interpolate(previous, current));
      }
    }
    polygon = clipped;
    for (let i = 1; i + 1 < polygon.length; i++) {
      emit(polygon[0]);
      emit(polygon[i]);
      emit(polygon[i + 1]);
    }
  }
  const result = new BufferGeometry();
  for (const [name, attribute] of attributes) {
    result.setAttribute(
      name,
      new Float32BufferAttribute(output3.get(name) ?? [], attribute.itemSize)
    );
  }
  result.computeBoundingBox();
  result.computeBoundingSphere();
  if (geometry !== source) geometry.dispose();
  return result;
}
var InterfaceStructureLayer = class {
  constructor(sim, submerged) {
    this.scene = new Scene2();
    this.activeUniform = uniform4(0);
    this.structures = [];
    this.size = new Vector2();
    this.clearColor = new Color3();
    this.rootInverse = new Matrix4();
    this.relativeMatrix = new Matrix4();
    this.warmed = false;
    this.active = false;
    this.sim = sim;
    this.submerged = submerged;
    const depthTexture = new DepthTexture(1, 1);
    depthTexture.minFilter = NearestFilter2;
    depthTexture.magFilter = NearestFilter2;
    this.target = new RenderTarget2(1, 1, {
      type: HalfFloatType2,
      depthBuffer: true,
      depthTexture
    });
    this.target.texture.colorSpace = LinearSRGBColorSpace;
    this.target.texture.minFilter = LinearFilter3;
    this.target.texture.magFilter = LinearFilter3;
    this.target.texture.generateMipmaps = false;
    this.nodes = {
      color: texture3(this.target.texture),
      depth: texture3(depthTexture),
      active: this.activeUniform
    };
    const sun = new DirectionalLight(sunColor, SUN_LIGHT_INTENSITY);
    sun.position.copy(sunDirection).multiplyScalar(100);
    sun.target.position.set(0, 0, 0);
    sun.castShadow = false;
    this.scene.add(sun, sun.target);
  }
  register({
    name = "Interface structure",
    root,
    meshes,
    maxEdgeLength,
    minimumLocalY,
    stableMeanSurface = false,
    liveInterfaceMotion = false,
    underwaterOnly = false,
    maxCameraDistance = ACTIVE_CAMERA_DISTANCE
  }) {
    if (meshes.length === 0) throw new Error("Interface structure requires at least one mesh");
    if (maxEdgeLength !== void 0 && !(maxEdgeLength > 0)) {
      throw new Error("Interface structure max edge length must be positive");
    }
    if (liveInterfaceMotion && !stableMeanSurface) {
      throw new Error("Live interface motion applies only to a stable mean surface");
    }
    if (liveInterfaceMotion && maxEdgeLength === void 0) {
      throw new Error("Live interface motion requires a source tessellation edge");
    }
    if (!(maxCameraDistance > 0)) {
      throw new Error("Interface structure camera distance must be positive");
    }
    root.updateWorldMatrix(true, true);
    this.rootInverse.copy(root.matrixWorld).invert();
    const materialGroups = /* @__PURE__ */ new Map();
    for (const source of meshes) {
      if (Array.isArray(source.material)) {
        throw new Error("Interface structure meshes must use one material");
      }
      if (!(source.material instanceof MeshStandardNodeMaterial)) {
        throw new Error("Interface structure requires MeshStandardNodeMaterial meshes");
      }
      const group = materialGroups.get(source.material);
      if (group) group.push(source);
      else materialGroups.set(source.material, [source]);
    }
    const mergedGroups = [];
    const localBounds = new Box3().makeEmpty();
    const tessellator = maxEdgeLength ? new TessellateModifier(maxEdgeLength, 8) : null;
    for (const [sourceMaterial, sources] of materialGroups) {
      const geometries = [];
      for (const source of sources) {
        this.relativeMatrix.multiplyMatrices(this.rootInverse, source.matrixWorld);
        let prepared = source.geometry.clone().applyMatrix4(this.relativeMatrix);
        if (minimumLocalY !== void 0) {
          const clipped = clipGeometryAboveY(prepared, minimumLocalY);
          prepared.dispose();
          prepared = clipped;
        }
        if ((prepared.getAttribute("position")?.count ?? 0) === 0) {
          prepared.dispose();
          continue;
        }
        if (tessellator) {
          const tessellated = tessellator.modify(prepared);
          prepared.dispose();
          prepared = tessellated;
        }
        geometries.push(prepared);
      }
      if (geometries.length === 0) continue;
      const merged = mergeGeometries(geometries, false);
      for (const geometry of geometries) geometry.dispose();
      if (!merged) {
        for (const group of mergedGroups) group.geometry.dispose();
        throw new Error("Unable to merge interface structure geometry");
      }
      merged.computeBoundingBox();
      merged.computeBoundingSphere();
      if (!merged.boundingBox) {
        merged.dispose();
        for (const group of mergedGroups) group.geometry.dispose();
        throw new Error("Interface structure geometry has no bounds");
      }
      localBounds.union(merged.boundingBox);
      mergedGroups.push({ geometry: merged, sourceMaterial });
    }
    const cascadeKeepsAt = (worldXZ) => {
      const baseWorld = vec33(worldXZ.x, 0, worldXZ.y);
      const distance = cameraPosition.sub(baseWorld).length();
      const heightGap = cameraPosition.y.abs().max(0.5);
      const pixelFootprint = distance.mul(distance).mul(1e-3).div(heightGap);
      return [
        float4(1).sub(smoothstep3(2.5, 5.5, pixelFootprint)),
        float4(1).sub(smoothstep3(0.35, 1.2, pixelFootprint)),
        float4(1).sub(smoothstep3(0.1, 0.4, pixelFootprint))
      ];
    };
    const surfaceHeightAt = (worldXZ) => {
      const keeps = cascadeKeepsAt(worldXZ);
      let height = this.sim.displacementNodes[0].sample(worldXZ.div(this.sim.patchLengths[0])).y.mul(keeps[0]);
      for (let i = 1; i < this.sim.displacementNodes.length; i++) {
        height = height.add(
          this.sim.displacementNodes[i].sample(worldXZ.div(this.sim.patchLengths[i])).y.mul(keeps[i])
        );
      }
      return height;
    };
    const surfaceNormalAt = (worldXZ) => {
      const baseWorld = vec33(worldXZ.x, 0, worldXZ.y);
      const distance = cameraPosition.sub(baseWorld).length();
      const heightGap = cameraPosition.y.abs().max(0.5);
      const pixelFootprint = distance.mul(distance).mul(1e-3).div(heightGap);
      const keeps = cascadeKeepsAt(worldXZ);
      const derivative0 = this.sim.derivativeNodes[0].sample(
        worldXZ.div(this.sim.patchLengths[0])
      );
      let belowDerivatives = derivative0;
      for (let i = 1; i < this.sim.derivativeNodes.length; i++) {
        belowDerivatives = belowDerivatives.add(
          this.sim.derivativeNodes[i].sample(
            worldXZ.div(this.sim.patchLengths[i])
          ).mul(keeps[i])
        );
      }
      const aboveDerivatives = belowDerivatives.sub(
        derivative0.mul(float4(1).sub(keeps[0]))
      );
      const derivatives = mix2(aboveDerivatives, belowDerivatives, this.submerged);
      const slopeX = derivatives.x.div(max2(0.18, derivatives.z.add(1)));
      const slopeZ = derivatives.y.div(max2(0.18, derivatives.w.add(1)));
      const resolved = normalize2(vec33(slopeX.negate(), 1, slopeZ.negate()));
      const belowDistanceFade = smoothstep3(5, 16, pixelFootprint).mul(
        this.submerged
      );
      return normalize2(mix2(resolved, vec33(0, 1, 0), belowDistanceFade));
    };
    const solveTangentInterface = (sourceWorld, planePoint, orientedNormal) => {
      const cameraPlaneDistance = max2(
        dot(planePoint.sub(cameraPosition), orientedNormal),
        1e-3
      );
      const sourcePlaneDistance = max2(
        dot(sourceWorld.sub(planePoint), orientedNormal),
        1e-3
      );
      const cameraProjection = cameraPosition.add(
        orientedNormal.mul(cameraPlaneDistance)
      );
      const sourceProjection = sourceWorld.sub(
        orientedNormal.mul(sourcePlaneDistance)
      );
      const tangentOffset = sourceProjection.sub(cameraProjection);
      const tangentLength = tangentOffset.length();
      const tangent = tangentOffset.div(max2(tangentLength, 1e-3));
      const cameraIor = mix2(AIR_IOR, WATER_IOR, this.submerged);
      const sourceIor = mix2(WATER_IOR, AIR_IOR, this.submerged);
      const inWater = this.submerged.greaterThan(0.5);
      const cameraReach = cameraPlaneDistance.mul(CRITICAL_TANGENT);
      const sourceReach = sourcePlaneDistance.mul(CRITICAL_TANGENT);
      const low = select2(
        inWater,
        float4(0),
        tangentLength.sub(sourceReach).max(0)
      ).toVar();
      const high = select2(
        inWater,
        tangentLength.min(cameraReach),
        tangentLength
      ).toVar();
      for (let i = 0; i < INTERFACE_SOLVE_STEPS; i++) {
        const middle = low.add(high).mul(0.5);
        const sourceTangentDistance = tangentLength.sub(middle);
        const cameraSine = middle.div(
          cameraPlaneDistance.mul(cameraPlaneDistance).add(middle.mul(middle)).sqrt()
        );
        const sourceSine = sourceTangentDistance.div(
          sourcePlaneDistance.mul(sourcePlaneDistance).add(sourceTangentDistance.mul(sourceTangentDistance)).sqrt()
        );
        const moveTowardSource = cameraIor.mul(cameraSine).lessThan(sourceIor.mul(sourceSine));
        low.assign(select2(moveTowardSource, middle, low));
        high.assign(select2(moveTowardSource, high, middle));
      }
      return cameraProjection.add(tangent.mul(low.add(high).mul(0.5)));
    };
    const applyInterfaceMotion = (direction, tilt, sourceDistance) => {
      const cameraIor = mix2(AIR_IOR, WATER_IOR, this.submerged);
      const sourceIor = mix2(WATER_IOR, AIR_IOR, this.submerged);
      const eta = cameraIor.div(sourceIor);
      const cosIncident = direction.y.abs().max(0.02);
      const sinTransmitted2 = eta.mul(eta).mul(float4(1).sub(cosIncident.mul(cosIncident)));
      const cosTransmitted = float4(1).sub(sinTransmitted2).max(0).sqrt().max(0.04);
      const stretch = eta.mul(cosIncident).div(cosTransmitted).max(0.04);
      const shift = tilt.sub(direction.mul(dot(tilt, direction))).mul(float4(1).sub(float4(1).div(stretch)).clamp(-1, 1));
      const foldLimit = float4(maxEdgeLength ?? 1).mul(0.5).div(sourceDistance.max(1).mul(stretch));
      const bounded = shift.mul(
        float4(1).min(foldLimit.div(shift.length().max(1e-5)))
      );
      return normalize2(direction.add(bounded));
    };
    const projectedPosition = Fn4(() => {
      const sourceWorld = modelWorldMatrix.mul(vec44(positionLocal, 1)).xyz;
      const directProjection = cameraProjectionMatrix.mul(cameraViewMatrix).mul(vec44(sourceWorld, 1));
      const result = directProjection.toVar();
      const sourceSurfaceHeight = stableMeanSurface ? float4(0) : surfaceHeightAt(sourceWorld.xz);
      const signedHeight = sourceWorld.y.sub(sourceSurfaceHeight);
      const aboveMask = step(0, signedHeight);
      const belowMask = step(signedHeight, 0);
      const oppositeMediumMask = mix2(belowMask, aboveMask, this.submerged);
      If(oppositeMediumMask.greaterThan(0.5), () => {
        const normalOrientation = this.submerged.mul(2).sub(1);
        const heightDelta = sourceWorld.y.sub(cameraPosition.y);
        const safeHeightDelta = mix2(
          heightDelta.min(-1e-3),
          heightDelta.max(1e-3),
          this.submerged
        );
        const crossingFraction = cameraPosition.y.negate().div(safeHeightDelta).clamp(0, 1).toVar();
        let apparentInterface;
        let interfaceTilt = null;
        if (stableMeanSurface) {
          const crossingXZ = mix2(
            cameraPosition.xz,
            sourceWorld.xz,
            crossingFraction
          );
          apparentInterface = solveTangentInterface(
            sourceWorld,
            vec33(crossingXZ.x, 0, crossingXZ.y),
            vec33(0, normalOrientation, 0)
          );
          if (liveInterfaceMotion) {
            const spacing = float4(maxEdgeLength);
            const point = apparentInterface.xz;
            const slope = vec23(
              surfaceHeightAt(point.add(vec23(maxEdgeLength, 0))).sub(
                surfaceHeightAt(point.sub(vec23(maxEdgeLength, 0)))
              ),
              surfaceHeightAt(point.add(vec23(0, maxEdgeLength))).sub(
                surfaceHeightAt(point.sub(vec23(0, maxEdgeLength)))
              )
            ).div(spacing.mul(2));
            interfaceTilt = vec33(slope.x.negate(), 0, slope.y.negate()).mul(
              normalOrientation
            );
          }
        } else {
          for (let i = 0; i < 3; i++) {
            const crossingXZ2 = mix2(
              cameraPosition.xz,
              sourceWorld.xz,
              crossingFraction
            );
            crossingFraction.assign(
              surfaceHeightAt(crossingXZ2).sub(cameraPosition.y).div(safeHeightDelta).clamp(0, 1)
            );
          }
          const crossingXZ = mix2(
            cameraPosition.xz,
            sourceWorld.xz,
            crossingFraction
          );
          const crossingPoint = vec33(
            crossingXZ.x,
            surfaceHeightAt(crossingXZ),
            crossingXZ.y
          );
          const firstNormal = surfaceNormalAt(crossingXZ).mul(normalOrientation);
          const firstInterface = solveTangentInterface(
            sourceWorld,
            crossingPoint,
            firstNormal
          );
          const refinedXZ = firstInterface.xz;
          const refinedPoint = vec33(
            refinedXZ.x,
            surfaceHeightAt(refinedXZ),
            refinedXZ.y
          );
          const refinedNormal = surfaceNormalAt(refinedXZ).mul(normalOrientation);
          apparentInterface = solveTangentInterface(
            sourceWorld,
            refinedPoint,
            refinedNormal
          );
        }
        const sourceDistance = sourceWorld.sub(cameraPosition).length();
        const meanDirection = normalize2(apparentInterface.sub(cameraPosition));
        const apparentDirection = interfaceTilt ? applyInterfaceMotion(meanDirection, interfaceTilt, sourceDistance) : meanDirection;
        const apparentWorld = cameraPosition.add(
          apparentDirection.mul(sourceDistance)
        );
        result.assign(
          cameraProjectionMatrix.mul(cameraViewMatrix).mul(vec44(apparentWorld, 1))
        );
      });
      return result;
    })();
    const fragmentSurfaceHeight = stableMeanSurface ? float4(0) : surfaceHeightAt(positionWorld.xz);
    const fragmentSignedHeight = positionWorld.y.sub(fragmentSurfaceHeight);
    const fragmentTransition = fragmentSignedHeight.fwidth().max(5e-3);
    const fragmentAboveMask = smoothstep3(
      fragmentTransition.negate(),
      fragmentTransition,
      fragmentSignedHeight
    );
    const fragmentBelowMask = float4(1).sub(fragmentAboveMask);
    const oppositeMediumOpacity = mix2(
      fragmentBelowMask,
      fragmentAboveMask,
      this.submerged
    );
    const distanceFade = float4(1).sub(
      smoothstep3(
        maxCameraDistance * 0.85,
        maxCameraDistance,
        cameraPosition.sub(positionWorld).length()
      )
    );
    const proxies = mergedGroups.map(({ geometry, sourceMaterial }, index) => {
      const material = sourceMaterial.clone();
      material.transparent = false;
      material.depthWrite = true;
      material.fog = false;
      material.side = DoubleSide;
      material.vertexNode = projectedPosition;
      material.opacityNode = oppositeMediumOpacity.mul(distanceFade);
      material.alphaTestNode = float4(1e-3);
      const proxy = new Mesh(geometry, material);
      proxy.name = `${name} water-interface proxy ${index + 1}`;
      proxy.matrixAutoUpdate = false;
      proxy.frustumCulled = false;
      this.scene.add(proxy);
      return proxy;
    });
    if (proxies.length === 0) {
      throw new Error("Interface structure produced no optical proxy draws");
    }
    const structure = {
      root,
      proxies,
      localBounds,
      worldBounds: new Box3(),
      worldSphere: new Sphere(),
      maxCameraDistance,
      underwaterOnly,
      disposed: false
    };
    this.structures.push(structure);
    return () => this.removeStructure(structure);
  }
  update(ctx) {
    let active = false;
    for (const structure of this.structures) {
      structure.root.updateWorldMatrix(true, false);
      structure.worldBounds.copy(structure.localBounds).applyMatrix4(structure.root.matrixWorld);
      structure.worldBounds.getBoundingSphere(structure.worldSphere);
      const crossesSurface = structure.worldBounds.min.y <= ACTIVE_SURFACE_MARGIN && structure.worldBounds.max.y >= -ACTIVE_SURFACE_MARGIN;
      const nearCamera = ctx.camera.position.distanceTo(structure.worldSphere.center) <= structure.maxCameraDistance + structure.worldSphere.radius;
      const visible = structure.root.visible && crossesSurface && nearCamera && (!structure.underwaterOnly || ctx.camera.position.y < 1);
      for (const proxy of structure.proxies) {
        proxy.matrix.copy(structure.root.matrixWorld);
        proxy.matrixWorldNeedsUpdate = true;
        proxy.visible = visible || !this.warmed;
      }
      active ||= visible;
    }
    this.active = active;
    this.activeUniform.value = active ? 1 : 0;
    if (!active && this.warmed) return;
    this.syncSize(ctx.renderer);
    this.scene.environment = ctx.scene.environment;
    this.scene.environmentIntensity = ctx.scene.environmentIntensity;
    this.scene.environmentRotation.copy(ctx.scene.environmentRotation);
    const renderer = ctx.renderer;
    const previousTarget = renderer.getRenderTarget();
    const previousMrt = renderer.getMRT();
    const previousAlpha = renderer.getClearAlpha();
    renderer.getClearColor(this.clearColor);
    renderer.setRenderTarget(this.target);
    renderer.setMRT(null);
    renderer.setClearColor(0, 0);
    renderer.clear();
    void renderer.render(this.scene, ctx.camera);
    renderer.setRenderTarget(previousTarget);
    renderer.setMRT(previousMrt);
    renderer.setClearColor(this.clearColor, previousAlpha);
    this.warmed = true;
  }
  debugSnapshot() {
    const visibleProxies = this.active ? this.structures.flatMap(
      (structure) => structure.proxies.filter((proxy) => proxy.visible)
    ) : [];
    return {
      active: this.active,
      draws: visibleProxies.length,
      vertices: visibleProxies.reduce(
        (vertices, proxy) => vertices + (proxy.geometry.getAttribute("position")?.count ?? 0),
        0
      ),
      triangles: visibleProxies.reduce((triangles, proxy) => {
        const positionCount = proxy.geometry.getAttribute("position")?.count ?? 0;
        return triangles + (proxy.geometry.index?.count ?? positionCount) / 3;
      }, 0),
      width: this.target.width,
      height: this.target.height,
      maxEdge: TARGET_MAX_EDGE
    };
  }
  dispose() {
    for (const structure of [...this.structures]) this.removeStructure(structure);
    this.target.dispose();
  }
  removeStructure(structure) {
    if (structure.disposed) return;
    structure.disposed = true;
    const index = this.structures.indexOf(structure);
    if (index >= 0) this.structures.splice(index, 1);
    for (const proxy of structure.proxies) {
      this.scene.remove(proxy);
      proxy.geometry.dispose();
      proxy.material.dispose();
    }
  }
  syncSize(renderer) {
    renderer.getSize(this.size);
    const scale = Math.min(
      TARGET_SCALE,
      TARGET_MAX_EDGE / Math.max(1, this.size.x, this.size.y)
    );
    const width = Math.max(1, Math.round(this.size.x * scale));
    const height = Math.max(1, Math.round(this.size.y * scale));
    if (this.target.width !== width || this.target.height !== height) {
      this.target.setSize(width, height);
    }
  }
};

// source/medium.ts
import {
  AdditiveBlending as AdditiveBlending2,
  AgXToneMapping,
  InstancedMesh as InstancedMesh2,
  NoToneMapping,
  SRGBColorSpace,
  TetrahedronGeometry
} from "three";
import {
  MeshBasicNodeMaterial as MeshBasicNodeMaterial2,
  RenderPipeline
} from "three/webgpu";
import {
  Fn as Fn5,
  If as If2,
  Loop,
  cameraPosition as cameraPosition2,
  cameraProjectionMatrixInverse,
  cameraWorldMatrix,
  exp as exp2,
  exp2 as exp22,
  float as float5,
  fract,
  hash,
  instanceIndex as instanceIndex3,
  max as max3,
  mix as mix3,
  mrt,
  normalView,
  output,
  pass,
  positionGeometry as positionGeometry2,
  positionWorld as positionWorld2,
  pow,
  renderOutput,
  screenUV as screenUV2,
  sin as sin2,
  smoothstep as smoothstep4,
  uniform as uniform5,
  vec2 as vec24,
  vec3 as vec34,
  vec4 as vec45
} from "three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
var SIGMA = vec34(...AQUATIC_EXTINCTION);
var AMBIENT_DOWN = vec34(...AQUATIC_AMBIENT_DOWN);
var AMBIENT_UP = vec34(...AQUATIC_AMBIENT_UP);
var seabedShadowCaptureKeep = uniform5(1);
var underwaterDebugModes = /* @__PURE__ */ new Map([
  ["final", 0],
  ["no-medium", 1],
  ["fog", 2],
  ["god-rays", 3],
  ["caustics", 4],
  ["depth", 5]
]);
var UnderwaterMediumPipeline = class {
  constructor(renderer, scene, camera, caustics, options = {}) {
    /** 0 = open sea, 1 = deep inside an enclosed interior: kills fog glow + rays. */
    this.interior = uniform5(0);
    this.debugMode = uniform5(0);
    this.timeUniform = uniform5(0);
    this.scene = scene;
    renderer.toneMapping = NoToneMapping;
    const godraySteps = options.godraySteps ?? 14;
    const submerged = options.submerged ?? uniform5(1);
    const raySampler = causticWorldSample(caustics.textureNode);
    this.causticSampler = causticWorldSample(caustics.textureNode, { footprintFade: true });
    const scenePass = pass(scene, camera, { samples: 4 });
    scenePass.setMRT(mrt({ output, normal: vec45(normalView, 1) }));
    this.scenePass = scenePass;
    const sceneColor = scenePass.getTextureNode("output");
    const viewZ = scenePass.getViewZNode();
    const foggedNode = Fn5(() => {
      const dist = viewZ.negate().min(3500).toVar();
      const ndc = vec24(screenUV2.x.mul(2).sub(1), float5(1).sub(screenUV2.y).mul(2).sub(1));
      const far4 = cameraProjectionMatrixInverse.mul(vec45(ndc, 1, 1));
      const farView = far4.xyz.div(far4.w);
      const viewPos = farView.mul(viewZ.div(farView.z));
      const worldPos = cameraWorldMatrix.mul(vec45(viewPos, 1)).xyz;
      const rayDir = worldPos.sub(cameraPosition2).div(max3(dist, 1e-4));
      const transmittance = exp2(SIGMA.mul(dist).negate());
      const upness = smoothstep4(-0.5, 0.75, rayDir.y);
      const cameraDim = exp2(cameraPosition2.y.min(0).mul(0.03));
      const sunward = pow(max3(rayDir.dot(sunDirectionUniform), 0), 6).mul(0.06);
      const interiorKeep = float5(1).sub(this.interior.mul(0.94));
      const inscatter = mix3(AMBIENT_DOWN, AMBIENT_UP, upness).mul(cameraDim).add(sunColorUniform.mul(sunward)).mul(interiorKeep);
      const fogged = sceneColor.rgb.mul(transmittance).add(inscatter.mul(float5(1).sub(transmittance.g)));
      return vec45(mix3(sceneColor.rgb, fogged, submerged), 1);
    })();
    const resolvedRays = Fn5(() => {
      const dist = viewZ.negate().min(3500).toVar();
      const ndc = vec24(screenUV2.x.mul(2).sub(1), float5(1).sub(screenUV2.y).mul(2).sub(1));
      const far4 = cameraProjectionMatrixInverse.mul(vec45(ndc, 1, 1));
      const farView = far4.xyz.div(far4.w);
      const viewPos = farView.mul(viewZ.div(farView.z));
      const worldPos = cameraWorldMatrix.mul(vec45(viewPos, 1)).xyz;
      const rayDir = worldPos.sub(cameraPosition2).div(max3(dist, 1e-4));
      const marchLength = dist.min(85);
      const stepLength = marchLength.div(godraySteps);
      const jitter = fract(
        sin2(screenUV2.x.mul(1741.37).add(screenUV2.y.mul(921.13))).mul(43758.55)
      );
      const shaft = float5(0).toVar();
      If2(submerged.greaterThan(1e-3), () => {
        Loop({ start: 0, end: godraySteps }, (loopVars) => {
          const i = loopVars.i;
          const t = stepLength.mul(float5(i).add(jitter));
          const samplePos = cameraPosition2.add(rayDir.mul(t));
          const light = raySampler(samplePos).g;
          shaft.addAssign(light.mul(exp2(t.mul(-0.03))));
        });
      });
      const interiorKeep = float5(1).sub(this.interior.mul(0.94));
      const rays = sunColorUniform.mul(shaft.mul(stepLength).mul(7e-3)).mul(interiorKeep).mul(submerged);
      return rays;
    })();
    const withMedium = vec45(foggedNode.rgb.add(resolvedRays), 1);
    const bloomNode = bloom(withMedium, 0.35, 0.55, 1);
    const hdr = withMedium.add(bloomNode);
    const exposed = hdr.mul(exp22(gradeParams.exposureEV));
    const mapped = renderOutput(exposed, AgXToneMapping, SRGBColorSpace);
    const graded = dreamGrade(mapped);
    const rawMapped = renderOutput(sceneColor, AgXToneMapping, SRGBColorSpace);
    const fogMapped = renderOutput(foggedNode, AgXToneMapping, SRGBColorSpace);
    const raysMapped = renderOutput(vec45(resolvedRays, 1), AgXToneMapping, SRGBColorSpace);
    const causticsMapped = renderOutput(
      vec45(caustics.textureNode.rgb, 1),
      AgXToneMapping,
      SRGBColorSpace
    );
    const depthMapped = vec45(vec34(scenePass.getLinearDepthNode()), 1);
    const selected = Fn5(() => {
      const result = graded.toVar();
      If2(this.debugMode.equal(1), () => result.assign(rawMapped));
      If2(this.debugMode.equal(2), () => result.assign(fogMapped));
      If2(this.debugMode.equal(3), () => result.assign(raysMapped));
      If2(this.debugMode.equal(4), () => result.assign(causticsMapped));
      If2(this.debugMode.equal(5), () => result.assign(depthMapped));
      return result;
    })();
    this.pipeline = new RenderPipeline(renderer, selected);
    this.pipeline.outputColorTransform = false;
    this.particulates = this.buildParticulates(
      options.particulateCount ?? 18e3,
      submerged
    );
    scene.add(this.particulates);
  }
  /**
   * Caustic light on any lit material: modulates the received sun shadow, so
   * caustics inherit occlusion for free and never glow in occluded interiors.
   * Every underwater lit material must opt in.
   */
  applyCaustics(material, strength = 1.4) {
    const sampler = this.causticSampler;
    material.receivedShadowNode = Fn5(([shadow]) => {
      const caustic = sampler(positionWorld2).g;
      return mix3(float5(1), shadow, seabedShadowCaptureKeep).mul(
        caustic.mul(strength).add(1)
      );
    });
  }
  /** Enclosed interiors fade the open-sea glow as the camera goes deep. */
  setInterior(value) {
    this.interior.value = Math.min(1, Math.max(0, value));
  }
  setDebugMode(mode) {
    this.debugMode.value = underwaterDebugModes.get(mode) ?? 0;
  }
  update(elapsed) {
    this.timeUniform.value = elapsed;
  }
  render() {
    void this.pipeline.render();
  }
  buildParticulates(count, submerged) {
    const material = new MeshBasicNodeMaterial2();
    material.blending = AdditiveBlending2;
    material.depthWrite = false;
    material.transparent = true;
    const boxSize = float5(60);
    const half = boxSize.div(2);
    const seed = vec34(
      hash(instanceIndex3.add(1)),
      hash(instanceIndex3.add(7919)),
      hash(instanceIndex3.add(104729))
    );
    const base = seed.mul(boxSize);
    const drift = currentFlow(base, this.timeUniform).mul(4).add(vec34(0, this.timeUniform.mul(0.06), 0));
    const wrapped = fract(base.add(drift).sub(cameraPosition2).div(boxSize)).mul(boxSize).sub(half);
    const center = cameraPosition2.add(wrapped);
    const size = hash(instanceIndex3.add(31)).mul(0.5).add(0.5).mul(0.02);
    material.positionNode = center.add(positionGeometry2.mul(size));
    const camDist = wrapped.length();
    const fade = smoothstep4(half.mul(0.95), half.mul(0.45), camDist);
    const depthGlow = exp2(center.y.mul(0.04)).min(1);
    material.colorNode = vec45(vec34(0.7, 0.82, 0.84).mul(0.5).mul(depthGlow), 1);
    material.opacityNode = fade.mul(submerged);
    const mesh = new InstancedMesh2(new TetrahedronGeometry(1, 0), material, count);
    mesh.frustumCulled = false;
    return mesh;
  }
  dispose() {
    this.scene.remove(this.particulates);
    this.particulates.geometry.dispose();
    if (Array.isArray(this.particulates.material)) {
      for (const material of this.particulates.material) material.dispose();
    } else {
      this.particulates.material.dispose();
    }
    this.pipeline.dispose();
  }
};

// source/noise.ts
import { Fn as Fn6, Loop as Loop2, float as float6, fract as fract2, dot as dot2, floor, mix as mix4, sin as sin3, vec2 as vec25, vec3 as vec35 } from "three/tsl";
var hash21 = /* @__PURE__ */ Fn6(([p]) => {
  const p3 = fract2(vec35(p.x, p.y, p.x).mul(0.1031)).toVar();
  p3.addAssign(dot2(p3, vec35(p3.y, p3.z, p3.x).add(33.33)));
  return fract2(p3.x.add(p3.y).mul(p3.z));
});
var valueNoise2 = /* @__PURE__ */ Fn6(([p]) => {
  const i = floor(p).toVar();
  const f = fract2(p).toVar();
  const u = f.mul(f).mul(f.mul(-2).add(3)).toVar();
  const a = hash21(i);
  const b = hash21(i.add(vec25(1, 0)));
  const c = hash21(i.add(vec25(0, 1)));
  const d = hash21(i.add(vec25(1, 1)));
  return mix4(mix4(a, b, u.x), mix4(c, d, u.x), u.y);
});
var fbm2 = /* @__PURE__ */ Fn6(([p]) => {
  const value = float6(0).toVar();
  const amplitude = float6(0.5).toVar();
  const q = p.toVar();
  Loop2({ start: 0, end: 5 }, () => {
    value.addAssign(valueNoise2(q).mul(amplitude));
    const rotated = vec25(
      q.x.mul(0.8).sub(q.y.mul(0.6)),
      q.x.mul(0.6).add(q.y.mul(0.8))
    );
    q.assign(rotated.mul(2.04));
    amplitude.mulAssign(0.5);
  });
  return value;
});

// source/ocean-foam.ts
import { dot as dot4, float as float9, max as max5, mix as mix7, normalize as normalize4, pow as pow3, smoothstep as smoothstep6, vec2 as vec26, vec3 as vec37 } from "three/tsl";

// source/sky-radiance.ts
import { Fn as Fn7, dot as dot3, float as float7, max as max4, mix as mix5, normalize as normalize3, pow as pow2, smoothstep as smoothstep5, vec3 as vec36 } from "three/tsl";
var SUN_COS_RADIUS = Math.cos(0.266 * Math.PI / 180);
var marineHazeTint = /* @__PURE__ */ vec36(0.65, 0.59, 0.69);
var skyRadiance = /* @__PURE__ */ Fn7(
  ([direction, discStrength]) => {
    const dir = normalize3(direction).toVar();
    const up = max4(dir.y, 0);
    const zenith = vec36(0.05, 0.2, 0.5);
    const horizon = vec36(0.4, 0.54, 0.68);
    const seaMist = vec36(0.32, 0.43, 0.52);
    const gradient = mix5(horizon, zenith, pow2(up, 0.48));
    const sky = mix5(seaMist, gradient, smoothstep5(-0.08, 0.02, dir.y)).toVar();
    const marineHazeAmount = smoothstep5(-0.18, 0, dir.y).mul(float7(1).sub(smoothstep5(0, 0.3, dir.y))).mul(0.16);
    sky.assign(mix5(sky, marineHazeTint, marineHazeAmount));
    const sunAmount = max4(dot3(dir, sunDirectionUniform), 0).toVar();
    const x2 = float7(1).sub(sunAmount).div(1 - SUN_COS_RADIUS).toVar();
    const inDisc = smoothstep5(1, 0.96, x2);
    const mu = float7(1).sub(x2).max(0).sqrt();
    const limb = float7(0.3).add(mu.mul(0.93)).sub(mu.mul(mu).mul(0.23));
    const disc = inDisc.mul(limb).mul(discStrength).mul(1500);
    const aureole = pow2(sunAmount, 3e3).mul(20).add(pow2(sunAmount, 260).mul(1.7)).add(pow2(sunAmount, 18).mul(0.16));
    return sky.mul(1.25).add(sunColorUniform.mul(aureole.add(disc)));
  }
);

// source/wake-foam-map.ts
import { HalfFloatType as HalfFloatType3, LinearFilter as LinearFilter4, Vector4 } from "three";
import { StorageTexture as StorageTexture2 } from "three/webgpu";
import {
  Fn as Fn8,
  exp as exp3,
  float as float8,
  instanceIndex as instanceIndex4,
  int as int2,
  ivec2 as ivec22,
  mix as mix6,
  texture as texture4,
  textureLoad as textureLoad2,
  textureStore as textureStore2,
  uint as uint2,
  uniform as uniform6,
  uniformArray,
  vec4 as vec46
} from "three/tsl";
var WAKE_FOAM_CENTER_X = 0;
var WAKE_FOAM_CENTER_Z = 10;
var WAKE_FOAM_SIZE = 820;
var RESOLUTION = 1024;
var BITS = 10;
var MAX_SPLATS = 8;
var FRESH_TAU = 2.4;
var RESIDUE_TAU = 8.5;
var DIFFUSE_RATE = 1.1;
var BLEED_RATE = 4e-3;
var QUIET_AFTER = 35;
var WakeFoamMap = class {
  constructor() {
    this.splatShapes = uniformArray(
      Array.from({ length: MAX_SPLATS }, () => new Vector4(0, 0, 1, 0))
    );
    this.splatPowers = uniformArray(
      Array.from({ length: MAX_SPLATS }, () => new Vector4(0, 0, 0, 0))
    );
    this.freshKeep = uniform6(1);
    this.residueKeep = uniform6(1);
    this.diffuse = uniform6(0);
    this.bleed = uniform6(0);
    this.pendingCount = 0;
    this.hasPending = false;
    this.activeUntil = -Infinity;
    this.current = 0;
    this.initialized = false;
    const make = () => {
      const map = new StorageTexture2(RESOLUTION, RESOLUTION);
      map.type = HalfFloatType3;
      map.minFilter = LinearFilter4;
      map.magFilter = LinearFilter4;
      map.generateMipmaps = false;
      return map;
    };
    this.maps = [make(), make()];
    this.steps = [
      this.buildStep(this.maps[0], this.maps[1]),
      this.buildStep(this.maps[1], this.maps[0])
    ];
    this.clears = [this.buildClear(this.maps[0]), this.buildClear(this.maps[1])];
    this.foamNode = texture4(this.maps[0]);
  }
  /**
   * Queue a gaussian foam deposit at world (x, z). `radius` is in metres;
   * `fresh`/`residue` are 0..1 peak coverages for the two channels. At most
   * MAX_SPLATS deposits are honoured per frame — the submarine's stamp set
   * is sized to exactly that budget.
   */
  splat(x, z, radius, fresh, residue) {
    if (this.pendingCount >= MAX_SPLATS) return;
    const u = (x - (WAKE_FOAM_CENTER_X - WAKE_FOAM_SIZE / 2)) / WAKE_FOAM_SIZE * RESOLUTION;
    const v = (z - (WAKE_FOAM_CENTER_Z - WAKE_FOAM_SIZE / 2)) / WAKE_FOAM_SIZE * RESOLUTION;
    const texels = Math.max(1, radius / WAKE_FOAM_SIZE * RESOLUTION);
    this.splatShapes.array[this.pendingCount].set(u, v, texels, 0);
    this.splatPowers.array[this.pendingCount].set(fresh, residue, 0, 0);
    this.pendingCount++;
    this.hasPending = true;
  }
  /** Advance decay/diffusion and apply queued splats. Costs nothing while
   * the field is known-zero (QUIET_AFTER outlives both channels + bleed). */
  update(renderer, dt, elapsed) {
    this.ensureInitialized(renderer);
    if (this.hasPending) {
      this.activeUntil = elapsed + QUIET_AFTER;
      this.hasPending = false;
    }
    if (elapsed > this.activeUntil) {
      this.pendingCount = 0;
      return;
    }
    for (let i = this.pendingCount; i < MAX_SPLATS; i++) {
      ;
      this.splatShapes.array[i].set(0, 0, 1, 0);
      this.splatPowers.array[i].set(0, 0, 0, 0);
    }
    this.pendingCount = 0;
    const step3 = Math.min(dt, 0.1);
    this.freshKeep.value = Math.exp(-step3 / FRESH_TAU);
    this.residueKeep.value = Math.exp(-step3 / RESIDUE_TAU);
    this.diffuse.value = 1 - Math.exp(-step3 * DIFFUSE_RATE);
    this.bleed.value = step3 * BLEED_RATE;
    renderer.compute(this.steps[this.current]);
    this.current = 1 - this.current;
    this.foamNode.value = this.maps[this.current];
  }
  ensureInitialized(renderer) {
    if (this.initialized) return;
    this.initialized = true;
    renderer.compute(this.clears[0]);
    renderer.compute(this.clears[1]);
  }
  buildClear(target) {
    return Fn8(() => {
      const x = int2(instanceIndex4.bitAnd(uint2(RESOLUTION - 1)));
      const y = int2(instanceIndex4.shiftRight(uint2(BITS)));
      textureStore2(target, ivec22(x, y), vec46(0));
    })().compute(RESOLUTION * RESOLUTION);
  }
  buildStep(read, write) {
    const shapes = this.splatShapes;
    const powers = this.splatPowers;
    return Fn8(() => {
      const mask = uint2(RESOLUTION - 1);
      const x = int2(instanceIndex4.bitAnd(mask));
      const y = int2(instanceIndex4.shiftRight(uint2(BITS)));
      const cell = ivec22(x, y);
      const previous = textureLoad2(texture4(read), cell);
      const xm = int2(uint2(x.add(RESOLUTION - 1)).bitAnd(mask));
      const xp = int2(uint2(x.add(1)).bitAnd(mask));
      const ym = int2(uint2(y.add(RESOLUTION - 1)).bitAnd(mask));
      const yp = int2(uint2(y.add(1)).bitAnd(mask));
      const around = textureLoad2(texture4(read), ivec22(xm, y)).g.add(textureLoad2(texture4(read), ivec22(xp, y)).g).add(textureLoad2(texture4(read), ivec22(x, ym)).g).add(textureLoad2(texture4(read), ivec22(x, yp)).g).mul(0.25);
      let fresh = previous.r.mul(this.freshKeep).sub(this.bleed).max(0);
      let residue = mix6(previous.g, around, this.diffuse).mul(this.residueKeep).sub(this.bleed).max(0);
      const px = float8(x).add(0.5);
      const py = float8(y).add(0.5);
      for (let k = 0; k < MAX_SPLATS; k++) {
        const shape = shapes.element(int2(k));
        const power = powers.element(int2(k));
        const dx = px.sub(shape.x);
        const dy = py.sub(shape.y);
        const falloff = exp3(dx.mul(dx).add(dy.mul(dy)).div(shape.z.mul(shape.z)).negate());
        fresh = fresh.max(falloff.mul(power.x));
        residue = residue.max(falloff.mul(power.y));
      }
      textureStore2(write, cell, vec46(fresh, residue, 0, 1));
    })().compute(RESOLUTION * RESOLUTION);
  }
  dispose() {
    this.maps[0].dispose();
    this.maps[1].dispose();
  }
};

// source/ocean-foam.ts
var WINDROW_SPACING = 12.5;
var WINDROW_LENGTH = 95;
var WINDROW_BREAKUP_SPACING = 3.8;
var WINDROW_BREAKUP_LENGTH = 24;
var DRIFT_FRACTION = 0.03;
var GUST_SCALE = 165;
var GUST_DETAIL_SCALE = 58;
var RELIEF_FREQUENCY = 3.1;
var RELIEF_STRENGTH = 0.35;
var WINDROW_LINE_THRESHOLD = [0.6, 0.88];
var GUST_THRESHOLD = [0.44, 0.8];
var WINDROW_COVERAGE = 0.85;
var RAFT_TAIL_BAND = [0.26, 0.66];
var RAFT_BASE_COVERAGE = 0.45;
var RAFT_LINE_COVERAGE = 0.55;
var CREST_TEAR_BAND = [0.55, 1.35];
var CREST_COVERAGE = 0.55;
function createOceanFoam(inputs) {
  const { sea, time, worldXZ, pixelFootprint, edgeKeep } = inputs;
  const sunDir = sunDirectionUniform;
  const alongAxis = vec26(Math.cos(sea.windAzimuth), Math.sin(sea.windAzimuth));
  const acrossAxis = vec26(-Math.sin(sea.windAzimuth), Math.cos(sea.windAzimuth));
  const drift = time.mul(sea.windSpeed * DRIFT_FRACTION);
  const along = dot4(worldXZ, alongAxis).sub(drift);
  const across = dot4(worldXZ, acrossAxis);
  const bandCoarse = valueNoise2(
    vec26(across.div(WINDROW_SPACING), along.div(WINDROW_LENGTH))
  );
  const bandFine = valueNoise2(
    vec26(
      across.div(WINDROW_BREAKUP_SPACING),
      along.div(WINDROW_BREAKUP_LENGTH)
    ).add(vec26(19.7, 4.3))
  );
  const bandKeep = float9(1).sub(smoothstep6(3, 7, pixelFootprint));
  const breakupKeep = float9(1).sub(smoothstep6(0.9, 2.2, pixelFootprint));
  const bandField = mix7(float9(0.5), bandCoarse, bandKeep).add(
    bandFine.sub(0.5).mul(0.5).mul(breakupKeep)
  );
  const convergenceLines = smoothstep6(
    WINDROW_LINE_THRESHOLD[0],
    WINDROW_LINE_THRESHOLD[1],
    bandField
  );
  const gustCoarse = valueNoise2(
    vec26(across.div(GUST_SCALE), along.div(GUST_SCALE * 1.7)).add(vec26(7.1, 2.9))
  );
  const gustFine = valueNoise2(
    vec26(across.div(GUST_DETAIL_SCALE), along.div(GUST_DETAIL_SCALE * 1.5)).add(
      vec26(31.4, 12.8)
    )
  );
  const gustKeep = float9(1).sub(smoothstep6(9, 20, pixelFootprint));
  const gustField = gustCoarse.add(gustFine.sub(0.5).mul(0.6).mul(gustKeep));
  const gustPatch = smoothstep6(GUST_THRESHOLD[0], GUST_THRESHOLD[1], gustField);
  const gather = smoothstep6(-0.25, 0.25, inputs.convergence).mul(0.7).add(0.35);
  const windrow = convergenceLines.mul(gustPatch).mul(gather).mul(WINDROW_COVERAGE);
  const raftTail = float9(1).sub(
    smoothstep6(RAFT_TAIL_BAND[0], RAFT_TAIL_BAND[1], inputs.jacobianHistory)
  );
  const raft = raftTail.mul(
    convergenceLines.mul(RAFT_LINE_COVERAGE).add(RAFT_BASE_COVERAGE)
  );
  const crestTear = smoothstep6(
    CREST_TEAR_BAND[0],
    CREST_TEAR_BAND[1],
    inputs.crestHeight
  ).mul(smoothstep6(0.1, 0.42, inputs.steepness).mul(0.65).add(0.35)).mul(gustPatch).mul(CREST_COVERAGE);
  let dense = float9(1).sub(
    smoothstep6(-0.05, 0.26, inputs.jacobianHistory)
  );
  let churn = float9(0);
  if (inputs.wakeFoam) {
    const wakeUv = worldXZ.sub(vec26(WAKE_FOAM_CENTER_X, WAKE_FOAM_CENTER_Z)).div(WAKE_FOAM_SIZE).add(0.5);
    const wake = inputs.wakeFoam.foamNode.sample(wakeUv);
    dense = max5(dense, smoothstep6(0.02, 0.6, wake.g));
    churn = smoothstep6(0.1, 0.75, wake.r);
  }
  const thin = max5(max5(windrow, raft), crestTear).mul(edgeKeep).clamp(0, 1);
  const bubbleA = fbm2(worldXZ.mul(0.9).add(vec26(0.13, 0.07).mul(time)));
  const bubbleB = fbm2(worldXZ.mul(1.7).sub(vec26(0.11, 0.05).mul(time)));
  const foamKeep = float9(1).sub(smoothstep6(0.25, 0.8, pixelFootprint));
  const thinLace = mix7(
    float9(0.46),
    smoothstep6(0.26, 0.7, bubbleA.mul(0.65).add(bubbleB.mul(0.35))),
    foamKeep
  );
  const denseMask = dense.mul(bubbleA.mul(bubbleB).mul(1.7).add(0.06)).add(churn.mul(bubbleA.mul(0.45).add(0.62))).mul(foamKeep).clamp(0, 1);
  const thinMask = thin.mul(thinLace);
  const mask = denseMask.add(thinMask).clamp(0, 1);
  const thickShare = denseMask.div(denseMask.add(thinMask).max(1e-4)).clamp(0, 1);
  const reliefUv = worldXZ.mul(RELIEF_FREQUENCY).add(vec26(0.05, -0.09).mul(time));
  const reliefCenter = valueNoise2(reliefUv);
  const reliefSlope = vec26(
    valueNoise2(reliefUv.add(vec26(0.14, 0))).sub(reliefCenter),
    valueNoise2(reliefUv.add(vec26(0, 0.14))).sub(reliefCenter)
  ).div(0.14);
  const reliefKeep = float9(1).sub(smoothstep6(0.06, 0.2, pixelFootprint));
  const foamNormal = normalize4(
    inputs.normal.add(
      vec37(reliefSlope.x, 0, reliefSlope.y).mul(reliefKeep.mul(RELIEF_STRENGTH))
    )
  );
  const foamNoL = max5(dot4(foamNormal, sunDir), 0);
  const foamAmbient = skyRadiance(foamNormal, float9(0)).mul(0.22);
  const denseShade = foamAmbient.add(
    sunColorUniform.mul(foamNoL.mul(0.9).add(0.3)).mul(0.9).mul(inputs.sunShadow)
  );
  const thinOpacity = thin.mul(0.45).add(0.42);
  const throughScatter = pow3(max5(dot4(inputs.viewDir, sunDir.negate()), 0), 3).mul(float9(1).sub(thinOpacity)).mul(0.4);
  const thinShade = mix7(inputs.waterRadiance, denseShade, thinOpacity).add(
    sunColorUniform.mul(throughScatter).mul(inputs.sunShadow)
  );
  return {
    mask,
    color: mix7(thinShade, denseShade, thickShare),
    debug: vec37(
      denseMask,
      max5(windrow, raft).mul(edgeKeep),
      crestTear.mul(edgeKeep)
    )
  };
}

// source/ocean-material.ts
import { DoubleSide as DoubleSide2 } from "three";
import { MeshBasicNodeMaterial as MeshBasicNodeMaterial3 } from "three/webgpu";
import {
  Fn as Fn9,
  If as If3,
  cameraProjectionMatrix as cameraProjectionMatrix2,
  cameraProjectionMatrixInverse as cameraProjectionMatrixInverse2,
  cameraPosition as cameraPosition3,
  cameraViewMatrix as cameraViewMatrix2,
  cameraWorldMatrix as cameraWorldMatrix2,
  dot as dot5,
  exp as exp4,
  float as float11,
  getViewPosition,
  log2,
  max as max6,
  min,
  mix as mix8,
  modelWorldMatrix as modelWorldMatrix2,
  mrt as mrt2,
  normalize as normalize5,
  normalView as normalView2,
  output as output2,
  positionLocal as positionLocal2,
  pow as pow4,
  reflect,
  refract as refract2,
  screenUV as screenUV3,
  smoothstep as smoothstep8,
  step as step2,
  varying as varying2,
  vec2 as vec28,
  vec3 as vec38,
  vec4 as vec47
} from "three/tsl";

// source/seabed-surface.ts
import { float as float10, sin as sin4, smoothstep as smoothstep7, uniform as uniform7, vec2 as vec27 } from "three/tsl";
var seabedRippleBakeFlat = uniform7(0);
function seabedRippleSlope(worldXZ, footprint) {
  const warp = fbm2(worldXZ.mul(0.09)).mul(7);
  const band = sin4(worldXZ.x.mul(1.9).add(worldXZ.y.mul(0.9)).add(warp));
  const band2 = sin4(worldXZ.x.mul(-1).add(worldXZ.y.mul(2.3)).add(warp.mul(1.4)));
  const micro = valueNoise2(worldXZ.mul(7)).sub(0.5).mul(0.24);
  const bandKeep = footprint ? float10(1).sub(smoothstep7(0.6, 2.2, footprint)) : float10(1);
  const microKeep = footprint ? float10(1).sub(smoothstep7(0.03, 0.12, footprint)) : float10(1);
  return vec27(band.mul(0.08), band2.mul(0.06)).mul(bandKeep).add(micro.mul(microKeep));
}

// source/ocean-skirt-geometry.ts
import { BufferAttribute, BufferGeometry as BufferGeometry2 } from "three";
var OCEAN_INNER_HALF_SIZE = 350;
var OCEAN_FLAT_EDGE_MARGIN = 15;
var OCEAN_SKIRT_HOLE_HALF_SIZE = OCEAN_INNER_HALF_SIZE - OCEAN_FLAT_EDGE_MARGIN;
var OCEAN_SKIRT_OUTER_HALF_SIZE = 3200;
function squareBoundaryPoint(halfSize, sample, segments) {
  const side = Math.floor(sample / segments);
  const offset = sample - side * segments;
  const segmentSize = halfSize * 2 / segments;
  const coordinate = offset * segmentSize - halfSize;
  switch (side) {
    case 0:
      return { x: -halfSize, z: coordinate };
    case 1:
      return { x: coordinate, z: halfSize };
    case 2:
      return { x: halfSize, z: -coordinate };
    default:
      return { x: -coordinate, z: -halfSize };
  }
}
function createOceanSkirtGeometry(segments = 384) {
  if (!Number.isInteger(segments) || segments < 1) {
    throw new Error(`Ocean skirt segments must be a positive integer: ${segments}`);
  }
  const boundarySamples = segments * 4;
  const positions = new Float32Array(boundarySamples * 2 * 3);
  const indices = [];
  for (let sample = 0; sample < boundarySamples; sample++) {
    const outer = squareBoundaryPoint(OCEAN_SKIRT_OUTER_HALF_SIZE, sample, segments);
    const inner = squareBoundaryPoint(OCEAN_SKIRT_HOLE_HALF_SIZE, sample, segments);
    const offset = sample * 6;
    positions[offset] = outer.x;
    positions[offset + 1] = 0;
    positions[offset + 2] = outer.z;
    positions[offset + 3] = inner.x;
    positions[offset + 4] = 0;
    positions[offset + 5] = inner.z;
  }
  for (let sample = 0; sample < boundarySamples; sample++) {
    const next = (sample + 1) % boundarySamples;
    const outer = sample * 2;
    const inner = outer + 1;
    const outerNext = next * 2;
    const innerNext = outerNext + 1;
    indices.push(outer, outerNext, innerNext, outer, innerNext, inner);
  }
  const geometry = new BufferGeometry2();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
function auditOceanSkirtGeometry(segments = 384) {
  const geometry = createOceanSkirtGeometry(segments);
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const boundarySamples = segments * 4;
  if (!index || position.count !== boundarySamples * 2) {
    throw new Error("Ocean skirt topology does not match its coverage boundary");
  }
  let minimumHoleHalfSize = Infinity;
  let maximumOuterHalfSize = 0;
  let maximumHoleBoundaryError = 0;
  let maximumBoundaryHeightError = 0;
  for (let sample = 0; sample < boundarySamples; sample++) {
    const outer = sample * 2;
    const inner = outer + 1;
    const outerHalfSize = Math.max(Math.abs(position.getX(outer)), Math.abs(position.getZ(outer)));
    const innerHalfSize = Math.max(Math.abs(position.getX(inner)), Math.abs(position.getZ(inner)));
    minimumHoleHalfSize = Math.min(minimumHoleHalfSize, innerHalfSize);
    maximumOuterHalfSize = Math.max(maximumOuterHalfSize, outerHalfSize);
    maximumHoleBoundaryError = Math.max(
      maximumHoleBoundaryError,
      Math.abs(innerHalfSize - OCEAN_SKIRT_HOLE_HALF_SIZE)
    );
    maximumBoundaryHeightError = Math.max(
      maximumBoundaryHeightError,
      Math.abs(position.getY(outer)),
      Math.abs(position.getY(inner))
    );
  }
  let minimumTriangleNormalY = Infinity;
  for (let offset = 0; offset < index.count; offset += 3) {
    const a = index.getX(offset);
    const b = index.getX(offset + 1);
    const c = index.getX(offset + 2);
    const ux = position.getX(b) - position.getX(a);
    const uz = position.getZ(b) - position.getZ(a);
    const vx = position.getX(c) - position.getX(a);
    const vz = position.getZ(c) - position.getZ(a);
    minimumTriangleNormalY = Math.min(minimumTriangleNormalY, uz * vx - ux * vz);
  }
  const coverageOverlapMeters = OCEAN_INNER_HALF_SIZE - minimumHoleHalfSize;
  if (maximumHoleBoundaryError !== 0 || coverageOverlapMeters !== OCEAN_FLAT_EDGE_MARGIN) {
    throw new Error(
      `Ocean skirt coverage apron is incorrect: ${coverageOverlapMeters} m`
    );
  }
  if (maximumOuterHalfSize !== OCEAN_SKIRT_OUTER_HALF_SIZE) {
    throw new Error(`Ocean skirt outer boundary is incorrect: ${maximumOuterHalfSize} m`);
  }
  if (maximumBoundaryHeightError !== 0) {
    throw new Error(`Ocean skirt boundary is not coplanar: ${maximumBoundaryHeightError} m`);
  }
  if (minimumTriangleNormalY <= 0) {
    throw new Error(`Ocean skirt has downward or degenerate triangles: ${minimumTriangleNormalY}`);
  }
  geometry.dispose();
  return {
    segments,
    quads: index.count / 6,
    triangles: index.count / 3,
    coverageOverlapMeters,
    minimumHoleHalfSize,
    maximumOuterHalfSize,
    coverageBoundaryVertices: boundarySamples,
    maximumHoleBoundaryError,
    maximumBoundaryHeightError,
    minimumTriangleNormalY
  };
}

// source/seabed-radiance.ts
var AMBIENT_AND_CAUSTIC_BOOST = 1.45;
var SEABED_DIRECT_SHARE = 1 / AMBIENT_AND_CAUSTIC_BOOST;

// source/ocean-material.ts
var PIXEL_ANGLE = 1e-3;
var DEEP = vec38(5e-3, 0.045, 0.09);
var SHALLOW = vec38(0.014, 0.13, 0.17);
var SSS_TINT = vec38(0.035, 0.2, 0.22);
function oceanOpticsDebugMode(pass2) {
  switch (pass2) {
    case "water-foam":
      return "foam";
    case "water-fresnel":
      return "fresnel";
    case "water-reflection":
      return "reflection";
    case "water-transmission":
      return "transmission";
    case "water-interface":
      return "interface";
    case "water-validity":
      return "validity";
    default:
      return "final";
  }
}
function createOceanSurfaceMaterial(sim, timeUniform, options) {
  const material = new MeshBasicNodeMaterial3();
  material.side = DoubleSide2;
  material.fog = false;
  material.transparent = true;
  material.depthWrite = true;
  material.forceSinglePass = true;
  material.mrtNode = mrt2({ output: output2, normal: vec47(normalView2, 0) });
  const patch = sim.patchLengths;
  const cascadeCount = options.detailed ? 3 : 1;
  const baseWorld = modelWorldMatrix2.mul(vec47(positionLocal2, 1)).xyz;
  const xz = baseWorld.xz;
  const edgeHalf = options.edgeFadeHalfSize ?? 0;
  const edgeKeep = edgeHalf > 0 ? float11(1).sub(
    smoothstep8(
      edgeHalf - 170,
      edgeHalf - OCEAN_FLAT_EDGE_MARGIN,
      max6(positionLocal2.x.abs(), positionLocal2.z.abs())
    )
  ) : float11(0);
  const vertexDistance = cameraPosition3.sub(baseWorld).length();
  const vertexGap = cameraPosition3.y.abs().max(0.5);
  const vertexFootprint = vertexDistance.mul(vertexDistance).mul(PIXEL_ANGLE).div(vertexGap);
  const vertexKeeps = [
    // Match the above-water cascade-0 normal cutoff. Keeping coarse vertex
    // displacement to 18 m/pixel left sub-pixel triangle rows even after the
    // fragment normal and height response had flattened, producing both the
    // dark comb and the faint gray band at the inner-mesh transition.
    float11(1).sub(smoothstep8(2.5, 5.5, vertexFootprint)),
    float11(1).sub(smoothstep8(0.35, 1.2, vertexFootprint)),
    float11(1).sub(smoothstep8(0.1, 0.4, vertexFootprint))
  ];
  let displacement = sim.displacementNodes[0].sample(xz.div(patch[0])).xyz.mul(edgeKeep).mul(vertexKeeps[0]);
  for (let i = 1; i < cascadeCount; i++) {
    displacement = displacement.add(
      sim.displacementNodes[i].sample(xz.div(patch[i])).xyz.mul(edgeKeep).mul(vertexKeeps[i])
    );
  }
  const foamHistory = options.detailed ? sim.displacementNodes[0].sample(xz.div(patch[0])).w.min(
    sim.displacementNodes[1].sample(xz.div(patch[1])).w
  ) : float11(1);
  material.positionNode = positionLocal2.add(displacement);
  const vWorldXZ = varying2(xz);
  const vHeight = varying2(displacement.y);
  const vFoam = varying2(foamHistory);
  const vWorld = varying2(baseWorld.add(displacement));
  const vEdgeKeep = varying2(edgeKeep);
  const vDistance = varying2(
    cameraPosition3.sub(baseWorld.add(displacement)).length()
  );
  const heightGap = cameraPosition3.y.sub(vWorld.y).abs().max(0.5);
  const pixelFootprint = vDistance.mul(vDistance).mul(PIXEL_ANGLE).div(heightGap);
  const keepCascade0Above = float11(1).sub(smoothstep8(2.5, 5.5, pixelFootprint));
  const keepCascade1 = float11(1).sub(smoothstep8(0.35, 1.2, pixelFootprint));
  const keepCascade2 = float11(1).sub(smoothstep8(0.1, 0.4, pixelFootprint));
  const cascadeKeeps = [float11(1), keepCascade1, keepCascade2];
  const derivativeSamples = [];
  for (let i = 0; i < cascadeCount; i++) {
    derivativeSamples.push(
      sim.derivativeNodes[i].sample(vWorldXZ.div(patch[i])).mul(vEdgeKeep).toVar()
    );
  }
  const derivative0 = derivativeSamples[0];
  let derivatives = derivative0;
  for (let i = 1; i < cascadeCount; i++) {
    derivatives = derivatives.add(
      derivativeSamples[i].mul(cascadeKeeps[i])
    );
  }
  const aboveDerivatives = derivatives.sub(
    derivative0.mul(float11(1).sub(keepCascade0Above))
  );
  const slopeX = derivatives.x.div(max6(0.18, derivatives.z.add(1)));
  const slopeZ = derivatives.y.div(max6(0.18, derivatives.w.add(1)));
  const upNormal = normalize5(vec38(slopeX.negate(), 1, slopeZ.negate()));
  const isAbove = float11(1).sub(options.submerged);
  const sideSign = isAbove.mul(2).sub(1);
  const rawNormal = upNormal.mul(sideSign);
  const toCamera = cameraPosition3.sub(vWorld);
  const viewDistance = toCamera.length();
  const viewDir = toCamera.div(viewDistance);
  const distanceFade = smoothstep8(5, 16, pixelFootprint);
  const normal = normalize5(mix8(rawNormal, vec38(0, sideSign, 0), distanceFade));
  const sunDir = sunDirectionUniform;
  const aboveSlopeX = aboveDerivatives.x.div(max6(0.18, aboveDerivatives.z.add(1)));
  const aboveSlopeZ = aboveDerivatives.y.div(max6(0.18, aboveDerivatives.w.add(1)));
  let aboveNormal = normalize5(
    vec38(aboveSlopeX.negate(), 1, aboveSlopeZ.negate())
  );
  if (options.detailed) {
    const detailUvA = vWorldXZ.mul(1.7).add(vec28(0.11, -0.07).mul(timeUniform));
    const detailUvB = vWorldXZ.mul(4.7).add(vec28(-0.19, 0.13).mul(timeUniform));
    const heightA = valueNoise2(detailUvA);
    const detailA = vec28(
      valueNoise2(detailUvA.add(vec28(0.12, 0))).sub(heightA),
      valueNoise2(detailUvA.add(vec28(0, 0.12))).sub(heightA)
    ).div(0.12);
    const heightB = valueNoise2(detailUvB);
    const detailB = vec28(
      valueNoise2(detailUvB.add(vec28(0.08, 0))).sub(heightB),
      valueNoise2(detailUvB.add(vec28(0, 0.08))).sub(heightB)
    ).div(0.08);
    const detailKeepA = float11(1).sub(smoothstep8(0.025, 0.12, pixelFootprint)).mul(vEdgeKeep);
    const detailKeepB = float11(1).sub(smoothstep8(8e-3, 0.035, pixelFootprint)).mul(vEdgeKeep);
    const capillarySlope = detailA.mul(detailKeepA).add(detailB.mul(detailKeepB).mul(0.35));
    aboveNormal = normalize5(
      normal.add(vec38(capillarySlope.x, 0, capillarySlope.y).mul(0.045))
    );
  }
  const dielectricFresnel = (cosIncident, incidentIor, transmittedIor) => {
    const etaI = float11(incidentIor);
    const etaT = float11(transmittedIor);
    const etaRatio = etaI.div(etaT);
    const sinTransmitted2 = etaRatio.mul(etaRatio).mul(float11(1).sub(cosIncident.mul(cosIncident)));
    const criticalWidth = sinTransmitted2.fwidth().mul(1.5).max(1e-3).min(0.05);
    const canTransmit = float11(1).sub(
      smoothstep8(
        float11(1).sub(criticalWidth),
        float11(1).add(criticalWidth),
        sinTransmitted2
      )
    );
    const cosTransmitted = float11(1).sub(sinTransmitted2).max(0).sqrt();
    const rs = etaI.mul(cosIncident).sub(etaT.mul(cosTransmitted)).div(etaI.mul(cosIncident).add(etaT.mul(cosTransmitted)).max(1e-4));
    const rp = etaT.mul(cosIncident).sub(etaI.mul(cosTransmitted)).div(etaT.mul(cosIncident).add(etaI.mul(cosTransmitted)).max(1e-4));
    return vec38(
      rs.mul(rs).add(rp.mul(rp)).mul(0.5),
      canTransmit,
      cosTransmitted
    );
  };
  const incident = viewDir.negate();
  const aboveNoV = max6(dot5(viewDir, aboveNormal), 1e-3);
  const aboveFresnelResult = dielectricFresnel(aboveNoV, AIR_IOR, WATER_IOR);
  const aboveFresnel = aboveFresnelResult.x;
  const belowNoV = max6(dot5(viewDir, normal), 1e-3);
  const belowFresnelResult = dielectricFresnel(belowNoV, WATER_IOR, AIR_IOR);
  const interfaceFresnel = belowFresnelResult.x;
  const insideWindow = belowFresnelResult.y;
  const projectDirection = (direction) => {
    const view = cameraViewMatrix2.mul(vec47(direction, 0)).xyz;
    const clip = cameraProjectionMatrix2.mul(vec47(view, 1));
    const ndc = clip.xy.div(max6(clip.w, 0.05));
    return vec28(ndc.x.mul(0.5).add(0.5), float11(0.5).sub(ndc.y.mul(0.5)));
  };
  const sampleInterfaceStructure = (enabled, reconstructPath = false) => {
    const structures = options.interfaceStructures;
    if (!structures) return { sample: vec47(0), path: float11(0) };
    const sample = Fn9(() => {
      const result = vec47(0).toVar();
      If3(enabled.greaterThan(1e-3), () => {
        const rawColor = structures.color.sample(screenUV3);
        const geometryValidity = rawColor.a.mul(structures.active);
        If3(geometryValidity.greaterThan(1e-3), () => {
          const sourceColor = rawColor.rgb.div(max6(rawColor.a, 1e-3));
          result.assign(vec47(sourceColor, geometryValidity));
        });
      });
      return result;
    })();
    const path = reconstructPath ? Fn9(() => {
      const result = float11(0).toVar();
      If3(enabled.greaterThan(1e-3), () => {
        const sourceDepth = structures.depth.sample(screenUV3).r;
        const sourceView = getViewPosition(
          screenUV3,
          sourceDepth,
          cameraProjectionMatrixInverse2
        );
        const sourceWorld = cameraWorldMatrix2.mul(vec47(sourceView, 1)).xyz;
        result.assign(sourceWorld.sub(vWorld).length().max(0.02));
      });
      return result;
    })() : float11(0);
    return {
      sample,
      path
    };
  };
  const belowRefracted = refract2(incident, normal, WATER_IOR / AIR_IOR);
  const belowSceneSample = vec47(0);
  const belowSceneValid = float11(0);
  const belowStructure = options.interfaceStructures ? sampleInterfaceStructure(
    options.interfaceStructures.active.mul(options.submerged).mul(insideWindow)
  ) : { sample: vec47(0), path: float11(0) };
  const belowStructureSample = belowStructure.sample;
  const belowStructureValid = max6(belowStructureSample.a, 0);
  const aboveRefracted = refract2(incident, aboveNormal, AIR_IOR / WATER_IOR);
  const aboveStructureEnabled = options.detailed ? isAbove.mul(step2(0.03, float11(1).sub(aboveFresnel))) : float11(0);
  const aboveStructure = options.interfaceStructures ? sampleInterfaceStructure(
    options.interfaceStructures.active.mul(aboveStructureEnabled),
    true
  ) : { sample: vec47(0), path: float11(0) };
  const aboveStructureSample = aboveStructure.sample;
  const aboveStructureContribution = max6(aboveStructureSample.a, 0).clamp(0, 1);
  const reflectedDirection = reflect(incident, aboveNormal);
  const aboveHeight = vHeight.mul(keepCascade0Above);
  const heightMask = smoothstep8(-1.7, 1.5, aboveHeight);
  const bodyBase = mix8(DEEP, SHALLOW, heightMask);
  const crestLight = normalize5(sunDir.negate().add(normal.mul(0.4)));
  const crestScatter = pow4(max6(dot5(viewDir, crestLight), 0), 4.5).mul(1).mul(smoothstep8(-0.1, 1.1, vHeight));
  const sunShadow = (options.sunShadow ? options.sunShadow(vWorld) : float11(1)).clamp(0, 1);
  const noL = max6(dot5(aboveNormal, sunDir), 0);
  const fresnelF0 = float11(((AIR_IOR - WATER_IOR) / (AIR_IOR + WATER_IOR)) ** 2);
  const aboveCrestLight = normalize5(sunDir.negate().add(aboveNormal.mul(0.4)));
  const aboveCrestScatter = pow4(max6(dot5(viewDir, aboveCrestLight), 0), 4.5).mul(smoothstep8(-0.1, 1.1, aboveHeight));
  const forwardScatter = pow4(max6(dot5(viewDir, sunDir.negate()), 0), 4).mul(smoothstep8(-0.15, 0.9, aboveHeight)).mul(float11(1).sub(aboveFresnel)).mul(0.32);
  const scatterLight = noL.mul(0.5).add(0.5);
  const surfaceScatter = SSS_TINT.mul(aboveCrestScatter.add(forwardScatter)).mul(scatterLight).mul(sunShadow);
  const body = bodyBase.add(surfaceScatter);
  const skyReflection = skyRadiance(reflectedDirection, float11(0));
  const reflection = options.reflection;
  const reflectedRadiance = reflection ? Fn9(() => {
    const result = skyReflection.toVar();
    If3(isAbove.mul(reflection.active).greaterThan(1e-3), () => {
      const flatReflected = reflect(incident, vec38(0, 1, 0));
      const waveOffset = projectDirection(reflectedDirection).sub(
        projectDirection(flatReflected)
      );
      const boundedOffset = waveOffset.mul(
        min(float11(1), float11(0.05).div(waveOffset.length().max(1e-5)))
      );
      const mirroredUv = vec28(
        screenUV3.x.oneMinus().sub(boundedOffset.x),
        screenUV3.y.add(boundedOffset.y)
      ).clamp(vec28(1e-3), vec28(0.999));
      const raw = reflection.color.sample(mirroredUv);
      const coverage = raw.a.clamp(0, 1);
      If3(coverage.greaterThan(1e-3), () => {
        result.assign(
          mix8(skyReflection, raw.rgb.div(max6(raw.a, 1e-3)), coverage)
        );
      });
    });
    return result;
  })() : skyReflection;
  const undersea = options.undersea;
  const seabedHeight = options.seabedHeight;
  const transmittedRadiance = undersea && seabedHeight ? Fn9(() => {
    const result = body.toVar();
    If3(isAbove.greaterThan(1e-3), () => {
      const downSlope = aboveRefracted.y.min(-0.3);
      const firstPath = undersea.canopyHeight(vWorldXZ).sub(vWorld.y).div(downSlope).clamp(0.5, 300);
      const midLandingXZ = vWorldXZ.add(aboveRefracted.xz.mul(firstPath));
      const canopyPath = undersea.canopyHeight(midLandingXZ).sub(vWorld.y).div(downSlope).clamp(0.5, 320).toVar();
      const landingXZ = vWorldXZ.add(aboveRefracted.xz.mul(canopyPath));
      const canopyY = undersea.canopyHeight(landingXZ).toVar();
      const landingFootprint = float11(PIXEL_ANGLE).mul(vDistance.add(canopyPath.mul(AIR_IOR / WATER_IOR))).div(downSlope.negate());
      const landingLod = log2(
        max6(landingFootprint.div(undersea.texelSize), 1)
      ).clamp(0, 11);
      const isSand = float11(1).sub(
        smoothstep8(0.4, 1.4, canopyY.sub(seabedHeight(landingXZ)))
      );
      const rippleSlope = seabedRippleSlope(landingXZ, landingFootprint);
      const rippleNormal = normalize5(vec38(rippleSlope.x, 1, rippleSlope.y));
      const rippleRatio = mix8(
        float11(1),
        max6(dot5(rippleNormal, sunDir), 0).div(max6(sunDir.y, 0.05)),
        isSand
      );
      const restoredDetail = mix8(float11(1), rippleRatio, SEABED_DIRECT_SHARE);
      const structureShare = aboveStructureContribution;
      const bottomColor = mix8(
        undersea.radiance(landingXZ, landingLod).mul(restoredDetail),
        aboveStructureSample.rgb,
        structureShare
      );
      const waterPath = mix8(
        canopyPath,
        aboveStructure.path.clamp(0.05, 3500),
        structureShare
      );
      const aquaticTransmittance = exp4(
        vec38(...AQUATIC_EXTINCTION).mul(waterPath).negate()
      );
      const sourceVerticalDepth = waterPath.mul(aboveRefracted.y.negate().max(0));
      const downwellingPath = sourceVerticalDepth.div(max6(sunDir.y, 0.15));
      const downwellingTransmittance = exp4(
        vec38(...AQUATIC_EXTINCTION).mul(downwellingPath).negate()
      );
      const sourceLightingFilter = mix8(vec38(1), downwellingTransmittance, 0.82);
      const transmittedMidpointY = vWorld.y.add(
        aboveRefracted.y.mul(waterPath.mul(0.5))
      );
      const transmittedDepthDim = exp4(transmittedMidpointY.min(0).mul(0.03));
      const transmittedUpness = smoothstep8(-0.5, 0.75, aboveRefracted.y);
      const transmittedSunward = pow4(
        max6(dot5(aboveRefracted, sunDir), 0),
        6
      ).mul(0.06).mul(sunShadow);
      const aquaticInscatter = mix8(
        vec38(...AQUATIC_AMBIENT_DOWN),
        vec38(...AQUATIC_AMBIENT_UP),
        transmittedUpness
      ).mul(transmittedDepthDim).mul(heightMask.mul(0.55).add(1)).add(sunColorUniform.mul(transmittedSunward));
      const foggedTransmission = bottomColor.mul(sourceLightingFilter).mul(aquaticTransmittance).add(aquaticInscatter.mul(float11(1).sub(aquaticTransmittance.g)));
      const transportKeep = float11(1).sub(distanceFade).mul(vEdgeKeep);
      result.assign(
        mix8(
          body,
          foggedTransmission.add(surfaceScatter.mul(0.45)),
          transportKeep
        )
      );
    });
    return result;
  })() : body;
  const halfVector = normalize5(sunDir.add(viewDir));
  const noH = max6(dot5(aboveNormal, halfVector), 0);
  const voH = max6(dot5(viewDir, halfVector), 0);
  const roughness = float11(0.075);
  const alpha2 = roughness.mul(roughness);
  const distributionDenominator = noH.mul(noH).mul(alpha2.sub(1)).add(1);
  const distribution = alpha2.div(
    distributionDenominator.mul(distributionDenominator).mul(Math.PI)
  );
  const smithK = roughness.add(1).mul(roughness.add(1)).div(8);
  const geometryV = aboveNoV.div(aboveNoV.mul(float11(1).sub(smithK)).add(smithK));
  const geometryL = noL.div(noL.mul(float11(1).sub(smithK)).add(smithK).max(1e-4));
  const microFresnel = fresnelF0.add(
    float11(1).sub(fresnelF0).mul(pow4(float11(1).sub(voH), 5))
  );
  const directSpecular = distribution.mul(geometryV).mul(geometryL).mul(microFresnel).mul(noL).div(max6(aboveNoV.mul(noL).mul(4), 0.02));
  const sunGlint = sunColorUniform.mul(directSpecular).mul(3.4).mul(sunShadow);
  let above = mix8(transmittedRadiance, reflectedRadiance, aboveFresnel).add(sunGlint);
  let foamDebug = vec38(0);
  if (options.detailed) {
    const foam = createOceanFoam({
      sea: sim.sea,
      time: timeUniform,
      worldXZ: vWorldXZ,
      jacobianHistory: vFoam,
      crestHeight: aboveHeight,
      steepness: vec28(aboveSlopeX, aboveSlopeZ).length(),
      convergence: aboveDerivatives.z.add(aboveDerivatives.w).negate(),
      pixelFootprint,
      edgeKeep: vEdgeKeep,
      normal: aboveNormal,
      viewDir,
      waterRadiance: above,
      sunShadow,
      wakeFoam: options.wakeFoam
    });
    foamDebug = foam.debug;
    above = mix8(above, foam.color, foam.mask);
  }
  const skyThrough = skyRadiance(belowRefracted, float11(0)).mul(0.9);
  const snellAngularStretch = float11(WATER_IOR / AIR_IOR).mul(belowNoV).div(belowFresnelResult.z.max(0.04)).max(1);
  const normalTiltPerPixel = max6(normal.dFdx().length(), normal.dFdy().length());
  const transmittedSpread = snellAngularStretch.sub(1).mul(normalTiltPerPixel).mul(0.5);
  const glintExponent = float11(1).div(
    float11(1 / 700).add(transmittedSpread.mul(transmittedSpread))
  );
  const windowGlint = pow4(max6(dot5(belowRefracted, sunDir), 0), glintExponent).mul(glintExponent.mul(24 / 700)).mul(sunColorUniform);
  const belowStructureContribution = belowStructureValid.clamp(0, 1);
  const aboveWaterStructure = max6(
    belowSceneValid,
    belowStructureContribution
  ).clamp(0, 1);
  const belowTransmissionSource = mix8(
    belowSceneSample.rgb,
    belowStructureSample.rgb,
    belowStructureContribution
  );
  const transmittedScene = mix8(
    skyThrough.add(windowGlint),
    belowTransmissionSource,
    aboveWaterStructure
  );
  const interfaceTransmission = insideWindow.mul(float11(1).sub(interfaceFresnel));
  const tirBody = vec38(0.035, 0.14, 0.19).add(SSS_TINT.mul(crestScatter).mul(0.5));
  const below = mix8(tirBody, transmittedScene, interfaceTransmission);
  const debugMode = options.debugMode ?? "final";
  let finalColor = mix8(below, above, isAbove);
  if (debugMode === "fresnel") {
    finalColor = vec38(mix8(interfaceFresnel, aboveFresnel, isAbove));
  } else if (debugMode === "reflection") {
    finalColor = mix8(tirBody, reflectedRadiance, isAbove);
  } else if (debugMode === "transmission") {
    finalColor = mix8(transmittedScene, transmittedRadiance, isAbove);
  } else if (debugMode === "interface") {
    const aboveInterface = aboveStructureSample.rgb.mul(aboveStructureContribution);
    const belowInterface = belowStructureSample.rgb.mul(belowStructureContribution);
    finalColor = mix8(belowInterface, aboveInterface, isAbove);
  } else if (debugMode === "foam") {
    finalColor = foamDebug.mul(isAbove);
  } else if (debugMode === "validity") {
    const aboveValidity = vec38(
      reflection ? reflection.active : float11(0),
      undersea ? float11(1) : float11(0),
      aboveStructureContribution
    );
    const belowValidity = vec38(
      belowSceneValid,
      belowStructureContribution,
      insideWindow
    );
    finalColor = mix8(belowValidity, aboveValidity, isAbove);
  }
  material.colorNode = vec47(finalColor, 1);
  return material;
}

// source/ocean-spectrum.ts
import { DataTexture as DataTexture2, FloatType as FloatType2, NearestFilter as NearestFilter3, RGBAFormat as RGBAFormat3 } from "three";
var DEFAULT_SEA_STATE = {
  gravity: 9.81,
  depth: 500,
  windSpeed: 8.5,
  windAzimuth: 205 * Math.PI / 180,
  fetch: 3e5,
  localScale: 1,
  swellScale: 0.45,
  swellAzimuth: 188 * Math.PI / 180,
  swellOmega: 0.62,
  shortWaveFade: 3e-3
};
function jonswapTma(omega, sea) {
  const { gravity: g, windSpeed, fetch, depth } = sea;
  if (omega <= 0) return 0;
  const alpha = 0.076 * Math.pow(g * fetch / (windSpeed * windSpeed), -0.22);
  const peakOmega = 22 * Math.pow(windSpeed * fetch / (g * g), -0.33);
  const sigma = omega <= peakOmega ? 0.07 : 0.09;
  const r = Math.exp(-((omega - peakOmega) ** 2) / (2 * sigma * sigma * peakOmega * peakOmega));
  const jonswap = alpha * g * g / omega ** 5 * Math.exp(-1.25 * Math.pow(peakOmega / omega, 4)) * Math.pow(3.3, r);
  const omegaH = omega * Math.sqrt(depth / g);
  let phi;
  if (omegaH <= 1) phi = 0.5 * omegaH * omegaH;
  else if (omegaH < 2) phi = 1 - 0.5 * (2 - omegaH) ** 2;
  else phi = 1;
  return jonswap * phi;
}
function wrapAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}
function spreading(delta, omegaOverPeak) {
  const cosHalf = Math.max(Math.cos(delta * 0.5), 0);
  const broad = cosHalf * cosHalf;
  const power = 4 + 24 * Math.min(1, Math.max(0, omegaOverPeak - 0.4));
  const lobe = Math.pow(cosHalf, power);
  return (broad * 0.35 + lobe * 0.65) * (1 / Math.PI);
}
function createSpectrumTexture(rng, band, sea, resolution) {
  const n = resolution;
  const deltaK = Math.PI * 2 / band.patchLength;
  const { gravity: g, depth } = sea;
  const peakOmega = 22 * Math.pow(sea.windSpeed * sea.fetch / (g * g), -0.33);
  const h0 = new Float32Array(n * n * 2);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const kx = (i - n / 2) * deltaK;
      const kz = (j - n / 2) * deltaK;
      const kLength = Math.hypot(kx, kz);
      const index = (j * n + i) * 2;
      const inBand = kLength >= band.cutoffLow && kLength <= band.cutoffHigh;
      if (!inBand || kLength < 1e-6) {
        h0[index] = 0;
        h0[index + 1] = 0;
        rng.next();
        rng.next();
        continue;
      }
      const kSafe = Math.max(kLength, band.cutoffLow > 0 ? band.cutoffLow : 1e-4);
      const tanhArg = Math.min(kSafe * depth, 20);
      const tanhKd = Math.tanh(tanhArg);
      const omega = Math.sqrt(g * kSafe * tanhKd);
      const sech2 = tanhArg >= 20 ? 0 : 1 / Math.cosh(tanhArg) ** 2;
      const dOmegaDk = Math.max((g * tanhKd + g * kSafe * depth * sech2) / (2 * omega), 1e-6);
      const theta = Math.atan2(kz, kx);
      const local = jonswapTma(omega, sea) * spreading(wrapAngle(theta - sea.windAzimuth), omega / peakOmega) * sea.localScale;
      const swellSigma = 0.12;
      const swell = sea.swellScale * Math.exp(-(((omega - sea.swellOmega) / swellSigma) ** 2)) * Math.pow(Math.max(Math.cos(wrapAngle(theta - sea.swellAzimuth) * 0.5), 0), 48) * 0.9;
      const energy = (local + swell) * Math.exp(-(sea.shortWaveFade * sea.shortWaveFade) * kLength * kLength);
      const amplitude = Math.sqrt(energy * 2 * dOmegaDk / kSafe * deltaK * deltaK);
      const u1 = Math.max(rng.next(), 1e-9);
      const u2 = rng.next();
      const mag = Math.sqrt(-2 * Math.log(u1));
      const g1 = mag * Math.cos(Math.PI * 2 * u2);
      const g2 = mag * Math.sin(Math.PI * 2 * u2);
      h0[index] = g1 * amplitude / Math.SQRT2;
      h0[index + 1] = g2 * amplitude / Math.SQRT2;
    }
  }
  const packed = new Float32Array(n * n * 4);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const im = (n - i) % n;
      const jm = (n - j) % n;
      const src = (j * n + i) * 2;
      const mirror = (jm * n + im) * 2;
      const dst = (j * n + i) * 4;
      packed[dst] = h0[src];
      packed[dst + 1] = h0[src + 1];
      packed[dst + 2] = h0[mirror];
      packed[dst + 3] = -h0[mirror + 1];
    }
  }
  const texture7 = new DataTexture2(packed, n, n, RGBAFormat3, FloatType2);
  texture7.minFilter = NearestFilter3;
  texture7.magFilter = NearestFilter3;
  texture7.generateMipmaps = false;
  texture7.needsUpdate = true;
  return texture7;
}
function cascadeBands(patchLengths, boundaryFactor) {
  const handoff = (index) => Math.PI * 2 / patchLengths[index] * boundaryFactor;
  return patchLengths.map((patchLength, index) => ({
    patchLength,
    cutoffLow: index === 0 ? 1e-4 : handoff(index),
    cutoffHigh: index === patchLengths.length - 1 ? 1e4 : handoff(index + 1)
  }));
}

// source/ocean-system.ts
import { Mesh as Mesh2, PlaneGeometry as PlaneGeometry2 } from "three";
import { uniform as uniform9 } from "three/tsl";

// source/wave-sim.ts
import { HalfFloatType as HalfFloatType4, LinearFilter as LinearFilter5, RepeatWrapping as RepeatWrapping2 } from "three";
import { StorageTexture as StorageTexture3 } from "three/webgpu";
import {
  Fn as Fn10,
  float as float12,
  instanceIndex as instanceIndex5,
  int as int3,
  ivec2 as ivec23,
  max as max7,
  min as min2,
  texture as texture6,
  textureLoad as textureLoad3,
  textureStore as textureStore3,
  uint as uint3,
  uniform as uniform8,
  vec2 as vec29,
  vec4 as vec48
} from "three/tsl";
var OCEAN_PRESET = {
  resolution: 256,
  patchLengths: [250, 17, 5],
  boundaryFactor: 6,
  choppiness: 1.3,
  foamRecovery: 0.35,
  /** Global art-direction scale on displacement (dream lever). 0.35 keeps a
   * living glassy swell (~0.5 m crests). A 0.9 sea reads as a storm: it dunks
   * sightlines at deck height and makes a surface crossing chaotic. */
  amplitude: 0.35
};
function createMapTexture(n) {
  const tex = new StorageTexture3(n, n);
  tex.type = HalfFloatType4;
  tex.wrapS = RepeatWrapping2;
  tex.wrapT = RepeatWrapping2;
  tex.minFilter = LinearFilter5;
  tex.magFilter = LinearFilter5;
  tex.generateMipmaps = false;
  return tex;
}
var WaveSim = class {
  constructor(rng, sea = DEFAULT_SEA_STATE) {
    this.timeUniform = uniform8(0);
    this.dtUniform = uniform8(1 / 60);
    this.current = 0;
    this.initialized = false;
    const { resolution: n, patchLengths, boundaryFactor, choppiness, foamRecovery, amplitude } = OCEAN_PRESET;
    this.patchLengths = patchLengths;
    this.sea = sea;
    const logN = Math.log2(n);
    const mask = uint3(n - 1);
    const shift = uint3(logN);
    const bands = cascadeBands(patchLengths, boundaryFactor);
    const cellOf = () => {
      const x = int3(instanceIndex5.bitAnd(mask));
      const y = int3(instanceIndex5.shiftRight(shift));
      return { x, y, cell: ivec23(x, y) };
    };
    this.cascades = bands.map((band, index) => {
      const spectrum = createSpectrumTexture(
        rng.fork(`ocean-cascade-${index}`),
        band,
        sea,
        n
      );
      const freqPing = createFrequencyTexture(n);
      const freqPong = createFrequencyTexture(n);
      const ifft = new PackedIFFT(freqPing, freqPong, n);
      const displacementMaps = [
        createMapTexture(n),
        createMapTexture(n)
      ];
      const derivativesMap = createMapTexture(n);
      const twoPiOverPatch = Math.PI * 2 / band.patchLength;
      const evolve = Fn10(() => {
        const { x, y, cell } = cellOf();
        const initial = textureLoad3(texture6(spectrum), cell);
        const centered = vec29(float12(x).sub(n / 2), float12(y).sub(n / 2));
        const k = centered.mul(twoPiOverPatch);
        const kLength = max7(k.length(), 1e-4);
        const omega = k.length().mul(float12(sea.gravity)).mul(min2(kLength.mul(sea.depth), 20).tanh()).sqrt();
        const phase = omega.mul(this.timeUniform);
        const pc = phase.cos();
        const ps = phase.sin();
        const h = vec29(
          initial.x.mul(pc).sub(initial.y.mul(ps)).add(initial.z.mul(pc).sub(initial.w.mul(ps.negate()))),
          initial.x.mul(ps).add(initial.y.mul(pc)).add(initial.z.mul(ps.negate()).add(initial.w.mul(pc)))
        ).mul(amplitude);
        const ih = vec29(h.y.negate(), h.x);
        const dx = ih.mul(k.x.div(kLength));
        const dz = ih.mul(k.y.div(kLength));
        const horizontal = vec29(dx.x.sub(dz.y), dx.y.add(dz.x));
        textureStore3(freqPing, cell, vec48(h, horizontal));
      })().compute(n * n);
      const spatial = ifft.output;
      const inverseSpacing = n / (2 * band.patchLength);
      const makeAssemble = (previous, next) => Fn10(() => {
        const { x, y, cell } = cellOf();
        const parity = float12(int3(instanceIndex5.bitAnd(mask)).add(int3(instanceIndex5.shiftRight(shift))).bitAnd(int3(1)));
        const sign = float12(1).sub(parity.mul(2));
        const nSign = sign.negate();
        const xp = int3(uint3(x.add(1)).bitAnd(mask));
        const xm = int3(uint3(x.add(n - 1)).bitAnd(mask));
        const yp = int3(uint3(y.add(1)).bitAnd(mask));
        const ym = int3(uint3(y.add(n - 1)).bitAnd(mask));
        const center = textureLoad3(texture6(spatial), cell);
        const right = textureLoad3(texture6(spatial), ivec23(xp, y)).mul(nSign);
        const left = textureLoad3(texture6(spatial), ivec23(xm, y)).mul(nSign);
        const up = textureLoad3(texture6(spatial), ivec23(x, yp)).mul(nSign);
        const down = textureLoad3(texture6(spatial), ivec23(x, ym)).mul(nSign);
        const height = center.x.mul(sign);
        const horizontal = center.zw.mul(sign);
        const slopeX = right.x.sub(left.x).mul(inverseSpacing);
        const slopeZ = up.x.sub(down.x).mul(inverseSpacing);
        const dDxDx = right.z.sub(left.z).mul(inverseSpacing);
        const dDzDz = up.w.sub(down.w).mul(inverseSpacing);
        const dDxDz = up.z.sub(down.z).mul(inverseSpacing);
        const dDzDx = right.w.sub(left.w).mul(inverseSpacing);
        const jxx = float12(1).add(dDxDx.mul(choppiness));
        const jzz = float12(1).add(dDzDz.mul(choppiness));
        const jxz = dDxDz.add(dDzDx).mul(0.5).mul(choppiness);
        const jacobian = jxx.mul(jzz).sub(jxz.mul(jxz));
        const previousHistory = textureLoad3(texture6(previous), cell).w;
        const recovered = previousHistory.add(
          this.dtUniform.mul(foamRecovery).div(max7(jacobian, 0.5))
        );
        const history = min2(min2(jacobian, recovered), 2);
        textureStore3(
          next,
          cell,
          vec48(horizontal.x.mul(choppiness), height, horizontal.y.mul(choppiness), history)
        );
        textureStore3(
          derivativesMap,
          cell,
          vec48(slopeX, slopeZ, dDxDx.mul(choppiness), dDzDz.mul(choppiness))
        );
      })().compute(n * n);
      const makeClear = (target) => Fn10(() => {
        const { cell } = cellOf();
        textureStore3(target, cell, vec48(0, 0, 0, 1));
      })().compute(n * n);
      return {
        patchLength: band.patchLength,
        ifft,
        evolve,
        assemble: [
          makeAssemble(displacementMaps[0], displacementMaps[1]),
          makeAssemble(displacementMaps[1], displacementMaps[0])
        ],
        clear: [makeClear(displacementMaps[0]), makeClear(displacementMaps[1])],
        displacementMaps,
        derivativesMap
      };
    });
    this.displacementNodes = this.cascades.map((c) => texture6(c.displacementMaps[0]));
    this.derivativeNodes = this.cascades.map((c) => texture6(c.derivativesMap));
  }
  /** Foam-history maps start at 1 (no foam). */
  ensureInitialized(renderer) {
    if (this.initialized) return;
    this.initialized = true;
    for (const cascade of this.cascades) {
      renderer.compute(cascade.clear[0]);
      renderer.compute(cascade.clear[1]);
    }
  }
  update(renderer, elapsed, dt) {
    this.ensureInitialized(renderer);
    this.timeUniform.value = elapsed;
    this.dtUniform.value = Math.min(dt, 0.1);
    renderer.compute(this.cascades.map((c) => c.evolve));
    const stageCount = this.cascades[0].ifft.stages.length;
    for (let stage = 0; stage < stageCount; stage++) {
      renderer.compute(this.cascades.map((c) => c.ifft.stages[stage]));
    }
    const parity = this.current;
    renderer.compute(this.cascades.map((c) => c.assemble[parity]));
    this.current = 1 - this.current;
    for (let i = 0; i < this.cascades.length; i++) {
      this.displacementNodes[i].value = this.cascades[i].displacementMaps[this.current === 0 ? 0 : 1];
    }
  }
};

// source/ocean-system.ts
var INNER_SIZE = OCEAN_INNER_HALF_SIZE * 2;
var SubmergedOcean = class {
  constructor(scene, rng, options = {}) {
    this.timeUniform = uniform9(0);
    const segments = options.segments ?? 384;
    this.followStep = INNER_SIZE / segments;
    this.simulation = new WaveSim(rng);
    this.submerged = uniform9(1);
    this.interfaceStructures = new InterfaceStructureLayer(this.simulation, this.submerged);
    const timeNode = this.timeUniform;
    const debugMode = oceanOpticsDebugMode(options.debugPass ?? "");
    const innerGeometry = new PlaneGeometry2(INNER_SIZE, INNER_SIZE, segments, segments);
    innerGeometry.rotateX(-Math.PI / 2);
    this.inner = new Mesh2(
      innerGeometry,
      createOceanSurfaceMaterial(this.simulation, timeNode, {
        detailed: true,
        edgeFadeHalfSize: INNER_SIZE / 2,
        interfaceStructures: this.interfaceStructures.nodes,
        submerged: this.submerged,
        wakeFoam: null,
        debugMode
      })
    );
    this.inner.frustumCulled = false;
    this.inner.renderOrder = -100;
    scene.add(this.inner);
    this.outer = new Mesh2(
      createOceanSkirtGeometry(segments),
      createOceanSurfaceMaterial(this.simulation, timeNode, {
        detailed: false,
        interfaceStructures: this.interfaceStructures.nodes,
        submerged: this.submerged,
        debugMode
      })
    );
    this.outer.frustumCulled = false;
    this.outer.renderOrder = -101;
    scene.add(this.outer);
  }
  /**
   * Register a bounded opaque assembly that straddles the interface, so its
   * forward-refracted image can be transported through the Snell window.
   */
  register(registration) {
    return this.interfaceStructures.register(registration);
  }
  update(renderer, camera, scene, elapsed, delta) {
    this.timeUniform.value = elapsed;
    this.simulation.update(renderer, elapsed, delta);
    const step3 = this.followStep;
    const qx = Math.round(camera.position.x / step3) * step3;
    const qz = Math.round(camera.position.z / step3) * step3;
    this.inner.position.set(qx, 0, qz);
    this.outer.position.set(qx, 0, qz);
    this.interfaceStructures.update({ camera, renderer, scene });
  }
  dispose(scene) {
    scene.remove(this.inner);
    scene.remove(this.outer);
    this.inner.geometry.dispose();
    this.outer.geometry.dispose();
    this.inner.material.dispose();
    this.outer.material.dispose();
    this.interfaceStructures.dispose();
    this.simulation.dispose();
  }
};

// source/random.ts
function hashLabel(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;
  }
  h = Math.imul(h ^ h >>> 16, 2246822507);
  h = Math.imul(h ^ h >>> 13, 3266489909);
  return (h ^ h >>> 16) >>> 0;
}
var Rng = class _Rng {
  constructor(seed) {
    this.seed = seed >>> 0;
    this.s = this.seed === 0 ? 2654435769 : this.seed;
  }
  /** Uniform in [0, 1). splitmix32. */
  next() {
    this.s = this.s + 2654435769 >>> 0;
    let z = this.s;
    z = Math.imul(z ^ z >>> 16, 569420461);
    z = Math.imul(z ^ z >>> 15, 1935289751);
    z ^= z >>> 15;
    return (z >>> 0) / 4294967296;
  }
  range(min3, max8) {
    return min3 + (max8 - min3) * this.next();
  }
  int(min3, maxInclusive) {
    return Math.min(maxInclusive, Math.floor(this.range(min3, maxInclusive + 1)));
  }
  pick(items) {
    return items[Math.min(items.length - 1, Math.floor(this.next() * items.length))];
  }
  chance(p) {
    return this.next() < p;
  }
  /** Gaussian-ish (sum of 3), mean 0, roughly unit spread. */
  spread() {
    return (this.next() + this.next() + this.next()) / 1.5 - 1;
  }
  /**
   * Independent deterministic stream. Forks derive from the root seed and the
   * label only — draw order elsewhere can never shift a fork's sequence.
   */
  fork(label) {
    return new _Rng((hashLabel(label) ^ this.seed) >>> 0);
  }
};

// source/seabed-material.ts
import { MeshStandardNodeMaterial as MeshStandardNodeMaterial3 } from "three/webgpu";
import {
  Fn as Fn11,
  float as float13,
  mix as mix9,
  normalGeometry,
  normalize as normalize6,
  positionWorld as positionWorld3,
  transformNormalToView,
  vec3 as vec39
} from "three/tsl";
function createSandMaterial(applyCaustics) {
  const material = new MeshStandardNodeMaterial3();
  material.roughness = 1;
  material.metalness = 0;
  const xz = positionWorld3.xz;
  const tone = fbm2(xz.mul(0.02));
  const patchTone = fbm2(xz.mul(45e-4));
  const base = mix9(vec39(0.48, 0.43, 0.33), vec39(0.58, 0.54, 0.43), tone);
  material.colorNode = mix9(base, vec39(0.33, 0.4, 0.3), patchTone.smoothstep(0.62, 0.85).mul(0.5));
  material.normalNode = Fn11(() => {
    const slope = seabedRippleSlope(xz).mul(float13(1).sub(seabedRippleBakeFlat));
    const localNormal = normalize6(normalGeometry.add(vec39(slope.x, 0, slope.y)));
    return transformNormalToView(localNormal);
  })();
  applyCaustics(material, 1.15);
  return material;
}

// source/sky-dome.ts
import { BackSide, DirectionalLight as DirectionalLight2, Mesh as Mesh3, Scene as Scene3, SphereGeometry } from "three";
import { MeshBasicNodeMaterial as MeshBasicNodeMaterial4, PMREMGenerator } from "three/webgpu";
import { float as float14, normalize as normalize7, positionLocal as positionLocal3 } from "three/tsl";
function createSkyDome() {
  const domeMaterial = new MeshBasicNodeMaterial4();
  domeMaterial.colorNode = skyRadiance(normalize7(positionLocal3), float14(1));
  domeMaterial.side = BackSide;
  domeMaterial.depthWrite = false;
  domeMaterial.fog = false;
  const dome = new Mesh3(new SphereGeometry(3400, 48, 24), domeMaterial);
  dome.frustumCulled = false;
  dome.renderOrder = -100;
  return dome;
}
function createSunLight(shadowMapSize = 2048) {
  const sun = new DirectionalLight2(sunColor, SUN_LIGHT_INTENSITY);
  sun.castShadow = true;
  sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);
  sun.shadow.bias = -4e-4;
  sun.shadow.normalBias = 0.02;
  sun.position.copy(sunDirection).multiplyScalar(700);
  sun.target.position.set(0, 0, 0);
  return sun;
}
function bakeSkyEnvironment(renderer, dome) {
  const envScene = new Scene3();
  const envDome = new Mesh3(new SphereGeometry(50, 32, 16), dome.material);
  envScene.add(envDome);
  const pmrem = new PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(envScene, 0.03, 1, 90);
  pmrem.dispose();
  return {
    texture: envTarget.texture,
    dispose: () => {
      envTarget.dispose();
      envDome.geometry.dispose();
    }
  };
}
var SKY_ENVIRONMENT_INTENSITY = 0.5;
export {
  AIR_IOR,
  AQUATIC_AMBIENT_DOWN,
  AQUATIC_AMBIENT_UP,
  AQUATIC_EXTINCTION,
  CAUSTIC_TILE,
  CausticsPass,
  DEFAULT_SEA_STATE,
  InterfaceStructureLayer,
  OCEAN_FLAT_EDGE_MARGIN,
  OCEAN_INNER_HALF_SIZE,
  OCEAN_PRESET,
  OCEAN_SKIRT_HOLE_HALF_SIZE,
  OCEAN_SKIRT_OUTER_HALF_SIZE,
  Rng,
  SEABED_DIRECT_SHARE,
  SKY_ENVIRONMENT_INTENSITY,
  SUN_LIGHT_INTENSITY,
  SubmergedOcean,
  UnderwaterMediumPipeline,
  WATER_IOR,
  WakeFoamMap,
  WaveSim,
  auditOceanSkirtGeometry,
  bakeSkyEnvironment,
  cascadeBands,
  causticBakeNeutral,
  causticWorldSample,
  createOceanFoam,
  createOceanSkirtGeometry,
  createOceanSurfaceMaterial,
  createSandMaterial,
  createSkyDome,
  createSpectrumTexture,
  createSunLight,
  currentFlow,
  currentFlowCpu,
  dreamGrade,
  fbm2,
  gradeParams,
  hash21,
  marineHazeTint,
  oceanOpticsDebugMode,
  runFftSelfTest,
  seabedRippleBakeFlat,
  seabedRippleSlope,
  seabedShadowCaptureKeep,
  skyRadiance,
  sunColor,
  sunColorUniform,
  sunDirection,
  sunDirectionUniform,
  underwaterDebugModes,
  valueNoise2
};
