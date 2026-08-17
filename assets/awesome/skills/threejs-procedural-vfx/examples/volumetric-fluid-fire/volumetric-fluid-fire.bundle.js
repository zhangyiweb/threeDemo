// source/VolumetricFluidFire.ts
import {
  AdditiveBlending,
  AxesHelper,
  BoxGeometry,
  Color,
  DoubleSide,
  Layers,
  Mesh,
  MeshBasicMaterial,
  Object3D as Object3D4,
  Vector2,
  Vector3 as Vector34,
  Vector4 as Vector42
} from "three";
import {
  abs as abs4,
  color,
  float as float11,
  Fn as Fn7,
  fract,
  frameId,
  globalId as globalId3,
  If as If11,
  interleavedGradientNoise,
  ivec3 as ivec33,
  mix as mix3,
  pass,
  pow,
  Return as Return5,
  screenCoordinate,
  screenUV,
  select as select2,
  smoothstep as smoothstep4,
  uniform as uniform4,
  uniformArray as uniformArray4,
  vec3 as vec313
} from "three/tsl";
import {
  VolumeNodeMaterial
} from "three/webgpu";

// source/EmitterManager.ts
import { Fn, If, instanceIndex, Return, storage, vec4 } from "three/tsl";
import * as THREE from "three/webgpu";
var EmitterManager = class {
  constructor(emitterBuffer) {
    this.emitters = [];
    this.defPools = /* @__PURE__ */ new Map();
    this.maxObjects = emitterBuffer.reduce((acc, obj) => acc + obj.maxCount, 0);
    this.emitters = [];
    this.objectMap = /* @__PURE__ */ new WeakMap();
    this.matrixData = new Float32Array(this.maxObjects * 16);
    this.propData = new Float32Array(this.maxObjects * 4);
    this.velData = new Float32Array(this.maxObjects * 4);
    const vertexInstanceData = [];
    this.matrixAttr = new THREE.StorageBufferAttribute(this.matrixData, 16);
    this.propAttr = new THREE.StorageBufferAttribute(this.propData, 4);
    this.velAttr = new THREE.StorageBufferAttribute(this.velData, 4);
    this.matricesStorageNode = storage(this.matrixAttr, "mat4", this.maxObjects);
    this.propsStorageNode = storage(this.propAttr, "vec4", this.maxObjects);
    this.velocitiesStorageNode = storage(this.velAttr, "vec4", this.maxObjects).toReadOnly();
    let globalId4 = 0;
    let vertexOffset = 0;
    const allVertices = [];
    for (const def of emitterBuffer) {
      const pool = { instances: [] };
      this.defPools.set(def.id, pool);
      def.geometriesInsideOf.updateWorldMatrix(true, true);
      const rootInverse = new THREE.Matrix4().copy(def.geometriesInsideOf.matrixWorld).invert();
      const localMatrix = new THREE.Matrix4();
      const basePositions = [];
      const vec314 = new THREE.Vector3();
      def.geometriesInsideOf.traverse((child) => {
        if (child.isMesh) {
          const mesh = child;
          const geometry = mesh.geometry;
          if (!geometry || !geometry.attributes.position) return;
          localMatrix.multiplyMatrices(rootInverse, mesh.matrixWorld);
          const posAttr = geometry.attributes.position;
          for (let i = 0; i < posAttr.count; i++) {
            vec314.fromBufferAttribute(posAttr, i);
            vec314.applyMatrix4(localMatrix);
            basePositions.push(vec314.x, vec314.y, vec314.z);
          }
        }
      });
      const defVertexCount = basePositions.length / 3;
      for (let v2 = 0; v2 < basePositions.length; v2 += 3) {
        allVertices.push(basePositions[v2], basePositions[v2 + 1], basePositions[v2 + 2], 0);
      }
      for (let i = 0; i < def.maxCount; i++) {
        const id = globalId4++;
        const proxyObj = new THREE.Object3D();
        proxyObj.name = `${def.id}_proxy_${i}`;
        for (let j = 0; j < defVertexCount; j++) {
          vertexInstanceData.push(vertexOffset + j, id, 0, 0);
        }
        const emitterData = {
          object: proxyObj,
          options: {
            tintFactor: 0,
            emitMultiplier: 0
          },
          id,
          prevPosition: new THREE.Vector3(),
          currentPosition: new THREE.Vector3(),
          velocity: new THREE.Vector3(),
          active: false
        };
        pool.instances.push(emitterData);
        this.emitters.push(emitterData);
        this.objectMap.set(proxyObj, emitterData);
      }
      vertexOffset += defVertexCount * def.maxCount;
    }
    this.instanceInfoData = new Uint32Array(vertexInstanceData);
    this.totalUniqueVertexCount = allVertices.length / 4;
    this.instanceInfoAttr = new THREE.StorageBufferAttribute(this.instanceInfoData, 4);
    this.totalInstancesVertices = vertexOffset;
    this.instanceInfoStorageNode = storage(
      this.instanceInfoAttr,
      "uvec4",
      this.totalInstancesVertices
    ).toReadOnly();
    const vertexData = new Float32Array(allVertices);
    this.combinedVertexAttr = new THREE.StorageBufferAttribute(vertexData, 4);
    this.verticesStorageNode = storage(this.combinedVertexAttr, "vec4", this.totalUniqueVertexCount).toReadOnly();
    this.uploadAllThreshold = Math.floor(this.maxObjects * 0.25);
  }
  getFireFor(defId, options = {}) {
    const pool = this.defPools.get(defId);
    if (!pool) {
      console.warn(`EmitterManager: Definition ID '${defId}' not found.`);
      return null;
    }
    const inactiveInstance = pool.instances.find((inst) => !inst.active);
    if (!inactiveInstance) {
      console.warn(`EmitterManager: Max emitters reached for definition '${defId}'.`);
      return null;
    }
    inactiveInstance.active = true;
    inactiveInstance.options.tintFactor = options.tintFactor ?? 0;
    inactiveInstance.options.emitMultiplier = options.emitMultiplier ?? 1;
    inactiveInstance.object.getWorldPosition(inactiveInstance.prevPosition);
    return inactiveInstance.object;
  }
  releaseFire(proxy) {
    const emitterData = this.objectMap.get(proxy);
    if (!emitterData) {
      console.warn("EmitterManager: Object not found in registry.");
      return;
    }
    emitterData.active = false;
    emitterData.options.emitMultiplier = 0;
    const { id } = emitterData;
    this.matrixData.fill(0, id * 16, id * 16 + 16);
    this.propData.fill(0, id * 4, id * 4 + 4);
    this.velData.fill(0, id * 4, id * 4 + 4);
    this.matrixAttr.addUpdateRange(id * 16, 16);
    this.propAttr.addUpdateRange(id * 4, 4);
    this.velAttr.addUpdateRange(id * 4, 4);
    this.matrixAttr.needsUpdate = true;
    this.propAttr.needsUpdate = true;
    this.velAttr.needsUpdate = true;
  }
  /**
   * extract the data from the proxy object and pass it to the GPU
   * @param deltaTime
   */
  update(deltaTime) {
    const dt = Math.max(deltaTime, 1e-3);
    this.matrixAttr.clearUpdateRanges();
    this.propAttr.clearUpdateRanges();
    this.velAttr.clearUpdateRanges();
    let matrixBufferChanged = 0;
    let propBufferChanged = 0;
    let velBufferChanged = 0;
    for (const emitter of this.emitters) {
      const { object, options, id, prevPosition, currentPosition, velocity, active } = emitter;
      const propOffset = id * 4;
      const currentActive = this.propData[propOffset];
      const activeChanged = Number(active) !== currentActive;
      if (activeChanged) {
        if (!active) {
          this.propData[propOffset] = 0;
          this.propAttr.addUpdateRange(propOffset, 1);
          propBufferChanged++;
          continue;
        }
      }
      object.updateMatrixWorld();
      let matrixChanged = false;
      const matrixOffset = id * 16;
      const elements = object.matrixWorld.elements;
      for (let i = 0; i < 16; i++) {
        if (this.matrixData[matrixOffset + i] !== elements[i]) {
          this.matrixData[matrixOffset + i] = elements[i];
          matrixChanged = true;
        }
      }
      if (matrixChanged) {
        this.matrixAttr.addUpdateRange(matrixOffset, 16);
        matrixBufferChanged++;
      }
      object.getWorldPosition(currentPosition);
      velocity.subVectors(currentPosition, prevPosition).divideScalar(dt);
      const speed = velocity.length();
      prevPosition.copy(currentPosition);
      if (activeChanged || this.propData[propOffset + 1] !== options.emitMultiplier || this.propData[propOffset + 2] !== options.tintFactor) {
        this.propData[propOffset] = Number(active);
        this.propData[propOffset + 1] = options.emitMultiplier;
        this.propData[propOffset + 2] = options.tintFactor;
        this.propAttr.addUpdateRange(propOffset, 4);
        propBufferChanged++;
      }
      const velOffset = id * 4;
      if (this.velData[velOffset + 0] !== velocity.x || this.velData[velOffset + 1] !== velocity.y || this.velData[velOffset + 2] !== velocity.z || this.velData[velOffset + 3] !== speed) {
        this.velData[velOffset + 0] = velocity.x;
        this.velData[velOffset + 1] = velocity.y;
        this.velData[velOffset + 2] = velocity.z;
        this.velData[velOffset + 3] = speed;
        this.velAttr.addUpdateRange(velOffset, 4);
        velBufferChanged++;
      }
    }
    if (matrixBufferChanged > this.uploadAllThreshold) {
      this.matrixAttr.clearUpdateRanges();
    }
    if (propBufferChanged > this.uploadAllThreshold) {
      this.propAttr.clearUpdateRanges();
    }
    if (velBufferChanged > this.uploadAllThreshold) {
      this.velAttr.clearUpdateRanges();
    }
    if (matrixBufferChanged) this.matrixAttr.needsUpdate = true;
    if (propBufferChanged) this.propAttr.needsUpdate = true;
    if (velBufferChanged) this.velAttr.needsUpdate = true;
  }
  /**
   * Returns a node that will dispatch a compute shader for each vertex of each active emitter.
   * @param forEachInstanceVertex A function that will be called for each vertex of each active emitter.
   * @returns A node that will dispatch a compute shader for each vertex of each active emitter.
   */
  computeNodePerVertex(forEachInstanceVertex) {
    return Fn(() => {
      If(instanceIndex.greaterThanEqual(this.totalInstancesVertices), () => {
        Return();
      });
      const pointer = this.instanceInfoStorageNode.element(instanceIndex);
      const vertexOffset = pointer.x;
      const instanceId = pointer.y;
      const localPos = this.verticesStorageNode.element(vertexOffset).xyz;
      const props = this.propsStorageNode.element(instanceId);
      const active = props.r.greaterThan(0);
      const emitMultiplier = props.g;
      const tintFactor = props.b;
      If(active.and(emitMultiplier.greaterThan(0)), () => {
        const transformMat = this.matricesStorageNode.element(instanceId);
        const worldPos = transformMat.mul(vec4(localPos, 1)).xyz;
        forEachInstanceVertex(
          localPos,
          worldPos,
          emitMultiplier,
          transformMat,
          this.velocitiesStorageNode.element(instanceId),
          tintFactor
        );
      });
    })().compute(this.totalInstancesVertices);
  }
};

// source/FluidFireShaderContext.ts
import {
  RedFormat as RedFormat2,
  RepeatWrapping,
  Vector3 as Vector32,
  Vector4
} from "three";
import {
  globalId,
  If as If2,
  min,
  smoothstep,
  storageTexture,
  texture3D,
  textureStore,
  uniform,
  uniformArray,
  uvec3,
  vec3 as vec32
} from "three/tsl";

// source/util/createStorage3D.ts
import * as THREE2 from "three/webgpu";
function createStorage3D(name, sizeX, sizeY, sizeZ, format = THREE2.RGBAFormat, dataType = THREE2.HalfFloatType) {
  const texture2 = new THREE2.Storage3DTexture(sizeX, sizeY, sizeZ);
  texture2.name = name;
  texture2.format = format;
  texture2.type = format === THREE2.RedFormat ? THREE2.FloatType : dataType;
  texture2.minFilter = THREE2.LinearFilter;
  texture2.magFilter = THREE2.LinearFilter;
  texture2.wrapS = THREE2.ClampToEdgeWrapping;
  texture2.wrapT = THREE2.ClampToEdgeWrapping;
  texture2.wrapR = THREE2.ClampToEdgeWrapping;
  texture2.generateMipmaps = false;
  return texture2;
}

// source/FluidFireShaderContext.ts
import { snoise } from "three/addons/tsl/math/curlNoise.js";
var gridCoordToUVW = (coord, grid) => vec32(coord).add(0.5).div(vec32(grid.x, grid.y, grid.z));
function makeDataTexture(name, size, config) {
  const texture2 = createStorage3D(name, size.x, size.y, size.z, config?.format, config?.dataType);
  const readOnlyNode = texture3D(texture2);
  const writeOnlyNode = storageTexture(texture2).toWriteOnly();
  if (config?.wrap) {
    texture2.wrapR = config.wrap;
    texture2.wrapS = config.wrap;
    texture2.wrapT = config.wrap;
  }
  return {
    getTexture() {
      return readOnlyNode.value;
    },
    setTexture(newTexture) {
      readOnlyNode.value = newTexture;
      writeOnlyNode.value = newTexture;
    },
    write(coord, value) {
      textureStore(writeOnlyNode, coord, value);
    },
    sample(uvw) {
      return readOnlyNode.sample(uvw);
    },
    loadPixel(iuvw) {
      return readOnlyNode.load(iuvw);
    }
  };
}
var FluidFireShaderContext = class {
  constructor(config) {
    // /**
    //  *  Radius in integer voxel count (CPU calculation)
    //  */
    // readonly emitKernelRadius: number;
    this.uTime = uniform(0);
    this.uCurlNoiseMultiplier = uniform(5);
    /**
     * noise force frequency
     */
    this.uTurbFrequency = uniform(4);
    /**
     *  turbulence decay rate over age
     */
    this.uTurbulenceDecay = uniform(0.51);
    /**
     * noise force strength
     */
    this.uTurbulence = uniform(0.9);
    /**
     * smoke dissipation /s (default for 2.5s lifespan)
     */
    this.uDissipation = uniform(0.2);
    /**
     * temperature cooling /s (default for 1.0s lifespan)
     */
    this.uCooling = uniform(0.21);
    this.uEmitDensity = uniform(20);
    this.uEmitTemperature = uniform(15.5);
    /**
     * velocity dissipation /s
     */
    this.uVelDamping = uniform(0.25);
    /**
     * Simulation's delta time
     */
    this.uDt = uniform(0.016);
    /**
     * hot air rises
     */
    this.uBuoyancy = uniform(6.1);
    this.uVorticityConfinementStrength = uniform(0.1);
    /**
     * smoke weight (pulls down)
     */
    this.uWeight = uniform(0.15);
    this.noiseTextureConfig = config.noiseTextureConfig;
    this.collisions = config.collisions;
    this.worldMatrix = uniform(config.world.matrixWorld);
    this.invWorldMatrix = uniform(config.world.matrixWorld.invert());
    const phyCoord = globalId;
    const dyeCoord = globalId;
    this.dyeVoxelSizeWorld = new Vector32().copy(config.grid.world).divide(config.grid.dye);
    this.uVertexSplatBrushOffsets = uniformArray([new Vector4()]);
    this.uVertexSplatBrushOffsetsCount = uniform(0, "uint");
    this.uEmitRadiusWorld = uniform(0, "float");
    this.grid = {
      phy: {
        size: config.grid.phy,
        coord: phyCoord,
        uvw: gridCoordToUVW(phyCoord, config.grid.phy),
        texel: {
          x: 1 / config.grid.phy.x,
          y: 1 / config.grid.phy.y,
          z: 1 / config.grid.phy.z
        },
        count: config.grid.phy.x * config.grid.phy.y * config.grid.phy.z
      },
      dye: {
        size: config.grid.dye,
        coord: dyeCoord,
        uvw: gridCoordToUVW(dyeCoord, config.grid.dye),
        texel: {
          x: 1 / config.grid.dye.x,
          y: 1 / config.grid.dye.y,
          z: 1 / config.grid.dye.z
        },
        count: config.grid.dye.x * config.grid.dye.y * config.grid.dye.z
      },
      world: {
        size: config.grid.world
      }
    };
    this.uVolumeWorldSize = uniform(new Vector32(config.grid.world.x, config.grid.world.y, config.grid.world.z));
    this.texture = {
      curlNoise: makeDataTexture(
        "curlNoise",
        {
          x: config.noiseTextureConfig.size,
          y: config.noiseTextureConfig.size,
          z: config.noiseTextureConfig.size
        },
        {
          wrap: RepeatWrapping
        }
      ),
      vel: {
        A: makeDataTexture("velA", config.grid.phy),
        B: makeDataTexture("velB", config.grid.phy)
      },
      dye: {
        A: makeDataTexture("dyeA", config.grid.dye),
        B: makeDataTexture("dyeB", config.grid.dye),
        swap() {
          const tmp = this.A.getTexture();
          this.A.setTexture(this.B.getTexture());
          this.B.setTexture(tmp);
        }
      },
      divergence: makeDataTexture("divergence", config.grid.phy, { format: RedFormat2 }),
      press: {
        A: makeDataTexture("pressA", config.grid.phy, { format: RedFormat2 }),
        B: makeDataTexture("pressB", config.grid.phy, { format: RedFormat2 })
      },
      vorticity: makeDataTexture("vorticity", config.grid.phy)
      // detailNoise: makeDataTexture(
      // 	"detailNoise",
      // 	{
      // 		x: config.noiseTextureConfig.size,
      // 		y: config.noiseTextureConfig.size,
      // 		z: config.noiseTextureConfig.size,
      // 	},
      // 	{ wrap: RepeatWrapping, format: RedFormat },
      // ),
    };
    this.collisions.setBakeTexture(
      // normal + dist
      makeDataTexture("sdf", config.grid.phy),
      //
      makeDataTexture("sdfVelocity", config.grid.phy)
    );
  }
  insideBoundingVolume(worldPos, callMe) {
    const bboxPosition = this.invWorldMatrix.mul(worldPos).xyz;
    const uvw = bboxPosition.div(this.uVolumeWorldSize).add(0.5);
    If2(
      uvw.x.greaterThanEqual(0).and(uvw.x.lessThanEqual(1)).and(uvw.y.greaterThanEqual(0)).and(uvw.y.lessThanEqual(1)).and(uvw.z.greaterThanEqual(0)).and(uvw.z.lessThanEqual(1)),
      () => {
        callMe(uvw);
      }
    );
  }
  sampleVolumeAt(worldPos) {
    const bboxPosition = this.invWorldMatrix.mul(worldPos).xyz;
    const uvw = bboxPosition.div(this.uVolumeWorldSize).add(0.5).toVar();
    const noiseDistortion = this.texture.vel.A.sample(uvw).xyz.div(this.uVolumeWorldSize).mul(0.35).mul(this.uTurbulence);
    const distortedUVW = uvw.add(noiseDistortion).clamp(0, 1).toVar();
    const sample = this.texture.dye.A.sample(uvw);
    const density = sample.r.toVar();
    const age = sample.b;
    const temperature = sample.g;
    const colorMass = sample.a;
    const detailNoise = snoise(bboxPosition.mul(5.5).add(vec32(0, age.mul(0.8).negate(), 0))).mul(this.uTurbulence);
    density.mulAssign(detailNoise.mul(0.35).add(0.85));
    const edge = min(distortedUVW, vec32(1).sub(distortedUVW));
    density.mulAssign(smoothstep(0, 0.03, min(edge.x, min(edge.y, edge.z))));
    return { density, temperature, age, distortedUVW, bboxPosition, uvw, colorMass };
  }
};

// source/pass/curlNoisePass.ts
import { float as float2, globalId as globalId2, If as If3, ivec3, Return as Return2, vec3 as vec33, vec4 as vec43 } from "three/tsl";
import { snoiseVec3 } from "three/addons/tsl/math/curlNoise.js";
var curlNoisePass = (context) => () => {
  const coord = globalId2;
  const noiseSize = context.noiseTextureConfig.size;
  const gridRes = ivec3(noiseSize, noiseSize, noiseSize);
  If3(
    coord.x.lessThan(0).or(coord.x.greaterThanEqual(gridRes.x)).or(coord.y.lessThan(0).or(coord.y.greaterThanEqual(gridRes.y))).or(coord.z.lessThan(0).or(coord.z.greaterThanEqual(gridRes.z))),
    () => {
      Return2();
    }
  );
  const worldSizeRatio = vec33(
    context.grid.world.size.x / context.grid.world.size.y,
    1,
    context.grid.world.size.z / context.grid.world.size.y
  );
  const p = vec33(coord).div(vec33(gridRes)).mul(worldSizeRatio);
  const freq = context.uTurbFrequency;
  const e = float2(0.1).div(freq);
  const dx = vec33(e, 0, 0);
  const dy = vec33(0, e, 0);
  const dz = vec33(0, 0, e);
  const p_x0 = snoiseVec3(p.sub(dx).mul(freq));
  const p_x1 = snoiseVec3(p.add(dx).mul(freq));
  const p_y0 = snoiseVec3(p.sub(dy).mul(freq));
  const p_y1 = snoiseVec3(p.add(dy).mul(freq));
  const p_z0 = snoiseVec3(p.sub(dz).mul(freq));
  const p_z1 = snoiseVec3(p.add(dz).mul(freq));
  const x = p_y1.z.sub(p_y0.z).sub(p_z1.y).add(p_z0.y);
  const y = p_z1.x.sub(p_z0.x).sub(p_x1.z).add(p_x0.z);
  const z = p_x1.y.sub(p_x0.y).sub(p_y1.x).add(p_y0.x);
  const noiseVal = vec33(x, y, z).mul(context.uCurlNoiseMultiplier);
  context.texture.curlNoise.write(coord, vec43(noiseVal, 0));
};

// source/pass/advectVelocityPass.ts
import { float as float4, max, min as min2, smoothstep as smoothstep2, vec3 as vec35, vec4 as vec45 } from "three/tsl";

// source/pass/vorticityPass.ts
import { cross, length as length2, vec3 as vec34, vec4 as vec44 } from "three/tsl";
var vorticityPass = (context) => () => {
  const grid = context.grid.phy;
  const coord = grid.coord;
  const uvw = grid.uvw;
  const texel = grid.texel;
  const velR = context.texture.vel.A.sample(uvw.add(vec34(texel.x, 0, 0))).xyz;
  const velL = context.texture.vel.A.sample(uvw.sub(vec34(texel.x, 0, 0))).xyz;
  const velU = context.texture.vel.A.sample(uvw.add(vec34(0, texel.y, 0))).xyz;
  const velD = context.texture.vel.A.sample(uvw.sub(vec34(0, texel.y, 0))).xyz;
  const velF = context.texture.vel.A.sample(uvw.add(vec34(0, 0, texel.z))).xyz;
  const velB = context.texture.vel.A.sample(uvw.sub(vec34(0, 0, texel.z))).xyz;
  const wx = velU.z.sub(velD.z).sub(velF.y.sub(velB.y)).mul(0.5);
  const wy = velF.x.sub(velB.x).sub(velR.z.sub(velL.z)).mul(0.5);
  const wz = velR.y.sub(velL.y).sub(velU.x.sub(velD.x)).mul(0.5);
  const vorticity = vec34(wx, wy, wz);
  const magnitude = length2(vorticity);
  context.texture.vorticity.write(coord, vec44(vorticity, magnitude));
};
var applyVorticity = (context, uvw, texel, vel) => {
  const vortData = context.texture.vorticity.sample(uvw);
  const omega = vortData.xyz;
  const vortR = context.texture.vorticity.sample(uvw.add(vec34(texel.x, 0, 0))).w;
  const vortL = context.texture.vorticity.sample(uvw.sub(vec34(texel.x, 0, 0))).w;
  const vortU = context.texture.vorticity.sample(uvw.add(vec34(0, texel.y, 0))).w;
  const vortD = context.texture.vorticity.sample(uvw.sub(vec34(0, texel.y, 0))).w;
  const vortF = context.texture.vorticity.sample(uvw.add(vec34(0, 0, texel.z))).w;
  const vortB = context.texture.vorticity.sample(uvw.sub(vec34(0, 0, texel.z))).w;
  const eta = vec34(vortR.sub(vortL), vortU.sub(vortD), vortF.sub(vortB)).mul(0.5);
  const N = eta.div(length2(eta).add(1e-5));
  const confinementForce = cross(N, omega).mul(context.uVorticityConfinementStrength);
  vel.addAssign(confinementForce.mul(context.uDt));
};

// source/pass/advectVelocityPass.ts
var advectVelocityPass = (context) => () => {
  const coord = context.grid.phy.coord;
  const uvw = context.grid.phy.uvw;
  const vel = context.texture.vel.A.sample(uvw).xyz;
  const velUVW = vel.div(context.uVolumeWorldSize);
  const prevPos = uvw.sub(velUVW.mul(context.uDt));
  const newVel = context.texture.vel.A.sample(prevPos).xyz.toVar();
  const dye = context.texture.dye.A.sample(prevPos).toVar();
  const density = dye.r;
  const temperature = dye.g;
  const age = dye.b;
  const buoyancyForce = temperature.mul(context.uBuoyancy).sub(density.mul(context.uWeight));
  newVel.addAssign(vec35(0, buoyancyForce, 0).mul(context.uDt));
  const thermalNoisePos = uvw.add(vec35(0, age.negate().mul(0.6), age.mul(0.13)).div(context.uTurbFrequency));
  const decay = age.mul(context.uTurbulenceDecay.negate()).exp();
  const thermalTurbulence = context.texture.curlNoise.sample(thermalNoisePos).xyz.mul(context.uTurbulence).mul(temperature).mul(decay);
  const ambientNoisePos = uvw.add(
    vec35(0, context.uTime.mul(0.15), context.uTime.mul(0.01)).div(context.uTurbFrequency)
  );
  const ambientTurbulence = context.texture.curlNoise.sample(ambientNoisePos).xyz.mul(context.uTurbulence).mul(density);
  const turbulence = thermalTurbulence.add(ambientTurbulence).mul(context.uTurbulence).mul(0.1);
  newVel.addAssign(turbulence.mul(context.uDt));
  newVel.mulAssign(max(float4(1).sub(context.uVelDamping.mul(context.uDt)), 0));
  const edge = min2(uvw, vec35(1).sub(uvw));
  const boundary = smoothstep2(0, 0.02, min2(edge.x, min2(edge.y, edge.z)));
  newVel.mulAssign(boundary);
  applyVorticity(context, uvw, context.grid.phy.texel, newVel);
  context.texture.vel.B.write(coord, vec45(newVel, 0));
};

// source/pass/divergencePass.ts
import { dot, select, vec3 as vec36, vec4 as vec46 } from "three/tsl";
var divergencePass = (context) => () => {
  const grid = context.grid.phy;
  const coord = grid.coord;
  const uvw = grid.uvw;
  const currVel = context.texture.vel.B.sample(uvw).xyz;
  const voxelLocalPos = uvw.sub(0.5).mul(context.uVolumeWorldSize);
  const localPos = uvw.sub(0.5).mul(context.uVolumeWorldSize);
  const speedOf = (u, v2, w) => {
    const vel = vec36(0, 0, 0).toVar();
    context.collisions.checkCollisionAt(
      grid,
      context.uVolumeWorldSize,
      context.worldMatrix,
      voxelLocalPos,
      uvw,
      vec36(u, v2, w),
      true,
      // hit
      (otherUvw, hitDistance, normal) => {
        const velDotN = dot(currVel, normal);
        vel.assign(select(velDotN.lessThan(0), currVel.sub(normal.mul(velDotN).mul(2)), currVel));
      },
      //miss
      (otherUvw) => vel.assign(context.texture.vel.B.sample(otherUvw).xyz)
    );
    return vel;
  };
  const vR = speedOf(1, 0, 0).x;
  const vL = speedOf(-1, 0, 0).x;
  const vU = speedOf(0, 1, 0).y;
  const vD = speedOf(0, -1, 0).y;
  const vF = speedOf(0, 0, 1).z;
  const vB = speedOf(0, 0, -1).z;
  const divergence = vR.sub(vL).add(vU.sub(vD)).add(vF.sub(vB)).mul(0.5);
  context.texture.divergence.write(coord, vec46(divergence, 0, 0, 0));
};

// source/pass/jacobiPass.ts
import { float as float6, If as If6, vec3 as vec37, vec4 as vec47 } from "three/tsl";
var jacobiPass = (context, readFrom, writeTo) => () => {
  const coord = context.grid.phy.coord;
  const uvw = context.grid.phy.uvw;
  const grid = context.grid.phy;
  const voxelLocalPos = uvw.sub(0.5).mul(context.uVolumeWorldSize);
  const currentDist = context.collisions.distanceAtPoint(uvw);
  If6(currentDist.lessThanEqual(0), () => {
    writeTo.write(coord, vec47(0));
  }).Else(() => {
    const sumPressure = float6(0).toVar();
    const fluidCount = float6(0).toVar();
    const checkNeighbor = (u, v2, w) => {
      context.collisions.checkCollisionAt(
        grid,
        context.uVolumeWorldSize,
        context.worldMatrix,
        voxelLocalPos,
        uvw,
        vec37(u, v2, w),
        // Step direction (ensure checkCollisionAt scales by texelSize!)
        false,
        // HIT (Solid obstacle): Do NOT add to sum or fluid count
        (otherUvw, hitDistance, normal) => {
        },
        // MISS (Open fluid): Accumulate pressure & increment fluid neighbor count
        (otherUvw) => {
          sumPressure.addAssign(readFrom.sample(otherUvw).x);
          fluidCount.addAssign(1);
        }
      );
    };
    checkNeighbor(1, 0, 0);
    checkNeighbor(-1, 0, 0);
    checkNeighbor(0, 1, 0);
    checkNeighbor(0, -1, 0);
    checkNeighbor(0, 0, 1);
    checkNeighbor(0, 0, -1);
    const divergence = context.texture.divergence.sample(uvw).x;
    const finalPressure = float6(0).toVar();
    If6(fluidCount.greaterThan(0), () => {
      finalPressure.assign(sumPressure.sub(divergence).div(fluidCount));
    });
    writeTo.write(coord, vec47(finalPressure, 0, 0, 0));
  });
};

// source/pass/projectPass.ts
import { float as float7, If as If7, vec3 as vec38, vec4 as vec48 } from "three/tsl";
var projectPass = (context) => () => {
  const coord = context.grid.phy.coord;
  const uvw = context.grid.phy.uvw;
  const grid = context.grid.phy;
  const readFrom = context.texture.press.A;
  const voxelLocalPos = uvw.sub(0.5).mul(context.uVolumeWorldSize);
  const currentDist = context.collisions.distanceAtPoint(uvw);
  If7(currentDist.lessThanEqual(0), () => {
    context.texture.vel.A.write(coord, vec48(0));
  }).Else(() => {
    const currentPressure = readFrom.sample(uvw).x;
    const pressureOf = (u, v2, w) => {
      const pressure = float7(0).toVar();
      context.collisions.checkCollisionAt(
        grid,
        context.uVolumeWorldSize,
        context.worldMatrix,
        voxelLocalPos,
        uvw,
        vec38(u, v2, w),
        false,
        // HIT (Solid): Set neighbor pressure equal to current pressure
        // This forces the gradient to 0 at the wall!
        (otherUvw, hitDistance, normal) => {
          pressure.assign(currentPressure);
        },
        // MISS (Fluid): Sample actual pressure
        (otherUvw) => {
          pressure.assign(readFrom.sample(otherUvw).x);
        }
      );
      return pressure;
    };
    const pR = pressureOf(1, 0, 0);
    const pL = pressureOf(-1, 0, 0);
    const pU = pressureOf(0, 1, 0);
    const pD = pressureOf(0, -1, 0);
    const pF = pressureOf(0, 0, 1);
    const pB = pressureOf(0, 0, -1);
    const gradient = vec38(pR.sub(pL), pU.sub(pD), pF.sub(pB)).mul(0.5);
    const vel = context.texture.vel.B.sample(uvw).xyz.sub(gradient).toVar();
    context.collisions.makeVelocityAvoidColliders(vel, uvw);
    context.texture.vel.A.write(coord, vec48(vel, 0));
  });
};

// source/pass/advectDyePass.ts
import { float as float8, floor, If as If8, max as max3, vec3 as vec39, vec4 as vec49 } from "three/tsl";
var advectDyePass = (context) => () => {
  const coord = context.grid.dye.coord;
  const uvw = context.grid.dye.uvw;
  const grid = context.grid.dye;
  const vel = context.texture.vel.A.sample(uvw).xyz;
  const velUVW = vel.div(context.uVolumeWorldSize);
  const prevPos = uvw.sub(velUVW.mul(context.uDt)).toVar();
  const localPos = uvw.sub(0.5).mul(context.uVolumeWorldSize);
  const worldPos = context.worldMatrix.mul(localPos).xyz;
  const prevDist = context.collisions.distanceAtPoint(uvw).toVar();
  If8(prevDist.lessThan(0), () => {
    const normal = context.collisions.normalAtPoint(uvw);
    worldPos.addAssign(normal.mul(prevDist.abs()));
    const correctedLocalPos = context.invWorldMatrix.mul(vec49(worldPos, 1)).xyz;
    prevPos.assign(correctedLocalPos.div(context.uVolumeWorldSize).add(0.5));
  });
  const dye = context.texture.dye.A.sample(prevPos);
  const dissipationFactor = max3(float8(1).sub(context.uDissipation.mul(context.uDt)), 0);
  const density = dye.r.mul(dissipationFactor).toVar();
  const temperature = dye.g.mul(max3(float8(1).sub(context.uCooling.mul(context.uDt)), 0)).toVar();
  const tintFactor = dye.a;
  const colorMass = tintFactor.mul(dissipationFactor).toVar();
  const gridDims = vec39(grid.size.x, grid.size.y, grid.size.z);
  const nearestUVW = floor(prevPos.mul(gridDims)).add(0.5).div(gridDims);
  const age = context.texture.dye.A.sample(nearestUVW).b.add(context.uDt).toVar();
  If8(density.lessThanEqual(0.01), () => {
    age.assign(0);
  });
  context.texture.dye.B.write(coord, vec49(density, temperature, age, colorMass));
};

// source/pass/emitObjectPass.ts
import {
  float as float9,
  If as If9,
  max as max4,
  mix,
  uvec3 as uvec32,
  vec3 as vec310,
  vec4 as vec410
} from "three/tsl";
var emitObjectPassFragment = (context) => (vertexPos, worldPos, emitMultiplier, worldMatrix, objVelData, tintFactor) => {
  context.insideBoundingVolume(worldPos, (uvw) => {
    const grid = context.grid.dye;
    const gridDims = uvec32(grid.size.x, grid.size.y, grid.size.z);
    const centerCoord = uvec32(uvw.mul(gridDims));
    const voxelSizeWorld = context.uVolumeWorldSize.div(gridDims);
    const invGridDims = vec310(1).div(gridDims);
    const baseEmission = context.uEmitTemperature.greaterThan(0).select(float9(1), float9(0));
    const emissionFactor = baseEmission.mul(emitMultiplier);
    const objVelocity = objVelData.xyz;
    const motionVec = objVelocity.mul(context.uDt);
    const densityBaseVal = context.uEmitDensity.mul(float9(1 / 20)).mul(emissionFactor);
    const tempBaseVal = context.uEmitTemperature.mul(0.05);
    If9(densityBaseVal.greaterThan(0), () => {
      const currentDye = context.texture.dye.A.sample(uvw);
      const addedDensity = densityBaseVal.mul(1);
      const addedTemp = tempBaseVal.mul(1);
      const newDensity = currentDye.r.add(addedDensity).clamp(0, 1);
      const newTemp = currentDye.g.add(addedTemp);
      const addedColorMass = addedDensity.mul(tintFactor);
      const newColorMass = currentDye.a.add(addedColorMass);
      const ageMixWeight = densityBaseVal.div(max4(newDensity, 1e-3)).clamp(0, 1);
      const newAge = mix(currentDye.b, float9(0), ageMixWeight);
      context.texture.dye.B.write(centerCoord, vec410(newDensity, newTemp, newAge, newColorMass));
    });
  });
};
var emitObjectsVelocityAndDyePassFragment = (context) => (vertexPos, worldPos, emitMultiplier, worldMatrix, objVelData) => {
  context.insideBoundingVolume(worldPos, (uvw) => {
    const grid = context.grid.phy;
    const coord = uvec32(uvw.mul(vec310(grid.size.x, grid.size.y, grid.size.z)));
    const objVelocity = objVelData.xyz;
    const objSpeed = objVelData.w;
    If9(objSpeed.greaterThan(1e-3), () => {
      const currentVel = context.texture.vel.B.sample(uvw).xyz;
      const velocityImpulse = objVelocity.mul(-0.1).mul(objSpeed);
      const newVel = currentVel.add(velocityImpulse);
    });
  });
};

// source/VolumetricFluidFire.ts
import { gaussianBlur } from "three/addons/tsl/display/GaussianBlurNode.js";

// source/sdf/CollisionHandler.ts
import { Matrix4 as Matrix43, Quaternion, Vector3 as Vector33 } from "three/webgpu";
import { cross as cross2, dot as dot3, float as float10, If as If10, Loop as Loop3, mat4, uint, uniform as uniform3, uniformArray as uniformArray3, vec3 as vec312, vec4 as vec411, normalize, mix as mix2 } from "three/tsl";

// source/sdf/sdfSampler.ts
import { Fn as Fn6, vec3 as vec311 } from "three/tsl";
var sdfSampler = (fn) => {
  const sampler = Fn6((params) => fn.apply(null, params));
  return (worldPos, outVel, outNormal) => {
    const tempOutVel = outVel ?? vec311(0);
    const tempOutNormal = outNormal ?? vec311(0);
    return sampler(worldPos, tempOutVel, tempOutNormal);
  };
};

// source/sdf/shape/SDFShape.ts
import { uniformArray as uniformArray2 } from "three/tsl";
var ShapeIndex = 0;
var SDFShape = class {
  //protected readonly uCount: UniformNode<"uint", number>;
  constructor(maxCount, name) {
    this.maxCount = maxCount;
    this.name = name;
    this.shapeTypeIndex = ++ShapeIndex;
    this.uDataIndex = uniformArray2(
      Array.from({ length: maxCount }, () => 0),
      "uint"
    );
  }
  /**
   * creates a collider on the given object. You can override this (but you must call this too super.createColliderOn ) to configure
   * custom uniforms that your implementation may require. This must be called since it provides basic function.
   *
   * @param proxy object to add collider on. The user will be able to move, rotate, and scale this object, and the collider will follow.
   * @param dataIndex index of the buffer data array where this collider will pull it's data from
   * @param customColliderConfig Configuration for this specific collider.
   * @returns true if successful
   */
  createColliderOn(proxy, dataIndex, customColliderConfig) {
    const slots = this.uDataIndex.array;
    const freeIndex = slots.findIndex((slot) => slot === 0);
    if (freeIndex === -1) {
      throw new Error("No free index found for shape collider");
    }
    slots[freeIndex] = dataIndex;
    return true;
  }
  destroyColliderFrom(proxy, oldDataIndex, oldConfig) {
    const slots = this.uDataIndex.array;
    const index = slots.findIndex((slot) => slot === oldDataIndex);
    if (index !== -1) {
      slots[index] = 0;
    }
  }
  /**
   * This is called once per frame, before running anything. THis is where you update your uniforms.
   * @param proxy
   * @param dataIndex
   * @param delta
   */
  update(proxy, dataIndex, delta) {
  }
  /**
   * @param localPos Position of the query in local space (center of the sdf)
   * @param halfExtents Half extents of the sdf's world. The SDF is thought of as being contained in a box defined by these limits.
   * @see https://en.wikipedia.org/wiki/Signed_distance_function
   */
  sdf(localPos, halfExtents) {
    throw new Error("Not implemented");
  }
};

// source/sdf/shape/SDFBox.ts
import { abs as abs2, length as length4, max as max5, min as min4 } from "three/tsl";
var SDFBox = class extends SDFShape {
  sdf(localPos, halfExtents) {
    const q2 = abs2(localPos).sub(halfExtents);
    return length4(max5(q2, 0)).add(min4(max5(q2.x, max5(q2.y, q2.z)), 0));
  }
};

// source/sdf/shape/SDFEllipsoid.ts
import { length as length5 } from "three/tsl";
var SDFEllipsoid = class extends SDFShape {
  sdf(position, radii) {
    const k0 = length5(position.div(radii));
    const k1 = length5(position.div(radii.mul(radii)));
    return k0.mul(k0.sub(1)).div(k1);
  }
};

// source/sdf/CollisionHandler.ts
var v = new Vector33();
var q = new Quaternion();
var deltaQ = new Quaternion();
var invertedQ = new Quaternion();
var UNIFORM_SCALE = new Vector33(1, 1, 1);
var tempScale = new Vector33();
var CollisionHandler = class {
  // [ vec3(vx,vy,vz), --- ]
  constructor(config = {}) {
    // private uBoxes: UniformArrayNode<"uint">; // [ dataIndex]
    // private uBoxCount: UniformNode<"uint", number>;
    /**
     * Base Surface friction coefficient of surfaces
     */
    this.uFriction = uniform3(0.8, "float");
    /**
     * Inverse matrices
     */
    this.dataBindings = [];
    this.obj2Collider = /* @__PURE__ */ new WeakMap();
    this.removeCollider = /* @__PURE__ */ new Map();
    const customShapes = config.sdfShapes ?? [];
    delete config.sdfShapes;
    const cfg = {
      friction: 0.8,
      collisionMargin: 0,
      angularVelocityMultiplier: 1,
      maxCollisionShapes: {
        total: 64,
        boxes: 12,
        ellipsoids: 12
      },
      sdfShapes: [],
      ...config
    };
    cfg.sdfShapes = [
      new SDFBox(cfg.maxCollisionShapes.boxes, "box"),
      new SDFEllipsoid(cfg.maxCollisionShapes.boxes, "ellipsoid")
    ];
    customShapes.forEach((custom) => {
      const existingIndex = cfg.sdfShapes.findIndex((shape) => shape.name == custom.name);
      if (existingIndex > -1) {
        cfg.sdfShapes[existingIndex] = custom;
      } else {
        cfg.sdfShapes.push(custom);
      }
    });
    this.config = cfg;
    this.uCollisionMargin = uniform3(cfg.collisionMargin);
    this.uFriction.value = cfg.friction;
    const totalObjects = cfg.sdfShapes.reduce((total, shape) => total + shape.maxCount, 0);
    if (totalObjects > cfg.maxCollisionShapes.total) {
      throw new Error(
        `Too many collision shapes, max is set at ${cfg.maxCollisionShapes.total} but ${totalObjects} shapes are defined.`
      );
    }
    this.context = {
      //
      // create buffer data for all colliders...
      //
      uHalfExtents: uniformArray3(
        Array.from({ length: totalObjects }, () => new Vector33()),
        "vec3"
      ),
      uInverseMatrices: uniformArray3(
        Array.from({ length: totalObjects }, () => new Matrix43()),
        "mat4"
      ),
      uWorldPositions: uniformArray3(
        Array.from({ length: totalObjects }, () => new Vector33()),
        "vec3"
      ),
      uVelocities: uniformArray3(
        Array.from({ length: totalObjects }, () => new Vector33()),
        "vec3"
      ),
      uAngularVelocities: uniformArray3(
        Array.from({ length: totalObjects }, () => new Vector33()),
        "vec3"
      ),
      uIsActive: uniformArray3(
        Array.from({ length: totalObjects }, () => false),
        "uint"
      )
    };
    this.dataBindings = Array.from({ length: totalObjects }, (_, i) => ({
      index: i,
      object: void 0,
      previousRotation: new Quaternion(),
      initialized: false
    }));
    this.mapSDF = sdfSampler((worldPos, outVelocity, outNormal) => {
      const closestVelocity = vec312(0).toVar();
      const closestNormal = vec312(0).toVar();
      const winningInvMatrix = mat4().toVar();
      const winningHalfExtents = vec312().toVar();
      const foundCollider = float10(0).toVar();
      const shapeType = uint(0).toVar();
      const margin = this.uCollisionMargin;
      const minDistance = float10(999.9).toVar();
      this.config.sdfShapes.forEach((shape) => {
        Loop3({ start: 0, end: shape.maxCount }, ({ i }) => {
          const shapeDataIndex = shape.uDataIndex.element(i);
          const realDataIndex = shapeDataIndex.sub(1).setName("realIndex");
          const isActive = this.context.uIsActive.element(realDataIndex).greaterThan(0);
          If10(shapeDataIndex.greaterThan(0).and(isActive), () => {
            const invMatrix = this.context.uInverseMatrices.element(realDataIndex);
            const hExtents = this.context.uHalfExtents.element(realDataIndex);
            const sdf = shape.sdf(invMatrix.mul(vec411(worldPos, 1)).xyz, hExtents).mul(margin.oneMinus());
            If10(sdf.lessThan(minDistance), () => {
              minDistance.assign(sdf);
              winningInvMatrix.assign(invMatrix);
              winningHalfExtents.assign(hExtents);
              foundCollider.assign(1);
              const center = this.context.uWorldPositions.element(realDataIndex);
              const linVel = this.context.uVelocities.element(realDataIndex);
              const angVel = this.context.uAngularVelocities.element(realDataIndex);
              const rotVel = cross2(angVel, worldPos.sub(center));
              closestVelocity.assign(linVel.add(rotVel));
              shapeType.assign(uint(shape.shapeTypeIndex));
            });
          });
        });
      });
      If10(foundCollider.greaterThan(0).and(minDistance.lessThan(margin)), () => {
        const e = float10(0.1);
        const eX = vec312(e, 0, 0);
        const eY = vec312(0, e, 0);
        const eZ = vec312(0, 0, e);
        const pRight = winningInvMatrix.mul(vec411(worldPos.add(eX), 1)).xyz;
        const pLeft = winningInvMatrix.mul(vec411(worldPos.sub(eX), 1)).xyz;
        const pUp = winningInvMatrix.mul(vec411(worldPos.add(eY), 1)).xyz;
        const pDown = winningInvMatrix.mul(vec411(worldPos.sub(eY), 1)).xyz;
        const pForward = winningInvMatrix.mul(vec411(worldPos.add(eZ), 1)).xyz;
        const pBack = winningInvMatrix.mul(vec411(worldPos.sub(eZ), 1)).xyz;
        const dx = float10(0).toVar();
        const dy = float10(0).toVar();
        const dz = float10(0).toVar();
        const extents = winningHalfExtents;
        this.config.sdfShapes.forEach((shape) => {
          If10(shapeType.equal(uint(shape.shapeTypeIndex)), () => {
            dx.assign(shape.sdf(pRight, extents).sub(shape.sdf(pLeft, extents)));
            dy.assign(shape.sdf(pUp, extents).sub(shape.sdf(pDown, extents)));
            dz.assign(shape.sdf(pForward, extents).sub(shape.sdf(pBack, extents)));
          });
        });
        closestNormal.assign(normalize(vec312(dx, dy, dz)));
      });
      outVelocity.assign(closestVelocity);
      outNormal.assign(closestNormal);
      return minDistance;
    });
  }
  get collisionMargin() {
    return this.uCollisionMargin.value;
  }
  set collisionMargin(v2) {
    this.uCollisionMargin.value = v2;
  }
  /**
   * Use the object as a proxy to control a collider in the simulation.
   *
   * @param obj This object will be used to position and transform the collider in the simulation. You can movie it around and the simulation will sync.
   * @param colliderType
   */
  makeObjectCollidable(obj, type, colliderConfig = {}) {
    const shape = this.config.sdfShapes.find((shapeDef) => shapeDef.name == type);
    if (!shape) {
      throw new Error(
        `Collider type "${type}" not found on: ${this.config.sdfShapes.map((shape2) => shape2.name)}`
      );
    }
    const dataIndex = this.bindMatrix(obj) + 1;
    shape.createColliderOn(obj, dataIndex, colliderConfig);
    const removeFn = () => {
      shape.destroyColliderFrom(obj, dataIndex, colliderConfig);
      this.unbindMatrix(obj);
      this.removeCollider.delete(obj);
      this.obj2Collider.delete(obj);
    };
    this.obj2Collider.set(obj, shape);
    this.removeCollider.set(obj, removeFn);
  }
  /**
   * Finds an "empty data slot" to assotiate that index with the data that this collider will use.
   * @param target
   * @returns
   */
  bindMatrix(target) {
    const freeBinding = this.dataBindings.find((b) => !b.object);
    if (!freeBinding) {
      throw new RangeError(`Too many colliders, only ${this.config.maxCollisionShapes} supported.`);
    }
    freeBinding.object = target;
    freeBinding.initialized = false;
    this.context.uIsActive.array[freeBinding.index] = 1;
    return freeBinding.index;
  }
  unbindMatrix(from) {
    for (const binding of this.dataBindings) {
      if (binding.object === from) {
        binding.object = void 0;
        this.context.uIsActive.array[binding.index] = 0;
      }
    }
  }
  // private createBoxCollider(obj: Object3D, halfExtents: Vector3Like = { x: 0.5, y: 0.5, z: 0.5 }) {
  // 	const boxes = this.uBoxes.array as Vector2[];
  // 	const freeBoxIndex = boxes.findIndex((slot) => slot.x === 0);
  // 	if (freeBoxIndex === -1) {
  // 		throw new RangeError(`Too many colliders of type box, only ${this.config.maxBoxes} supported`);
  // 	}
  // 	const matrixIndex = this.bindMatrix(obj);
  // 	boxes[freeBoxIndex].set(1, matrixIndex);
  // 	const removeFn = () => {
  // 		boxes[freeBoxIndex].set(0, 0);
  // 		this.unbindMatrix(obj);
  // 		this.removeCollider.delete(obj);
  // 	};
  // 	this.removeCollider.set(obj, removeFn);
  // }
  clearObjectAsCollidable(obj) {
    const removeFn = this.removeCollider.get(obj);
    if (removeFn) {
      this.removeCollider.delete(obj);
      removeFn();
    }
  }
  update(delta) {
    if (this.config.disabled) return;
    for (const binding of this.dataBindings) {
      if (binding.object) {
        const dataIndex = binding.index;
        binding.object.updateWorldMatrix(true, false);
        binding.object.getWorldPosition(v);
        binding.object.getWorldQuaternion(q);
        binding.object.getWorldScale(tempScale);
        const matrix = this.context.uInverseMatrices.array[dataIndex];
        matrix.compose(v, q, UNIFORM_SCALE).invert();
        const worldPos = this.context.uWorldPositions.array[dataIndex];
        const velocity = this.context.uVelocities.array[dataIndex];
        const angularVel = this.context.uAngularVelocities.array[dataIndex];
        const halfExtents = this.context.uHalfExtents.array[dataIndex];
        if (binding.initialized) {
          velocity.subVectors(v, worldPos).divideScalar(delta);
          if (q.dot(binding.previousRotation) < 0) {
            q.set(-q.x, -q.y, -q.z, -q.w);
          }
          invertedQ.copy(binding.previousRotation).invert();
          deltaQ.copy(q).multiply(invertedQ);
          const angle = 2 * Math.acos(Math.max(-1, Math.min(1, deltaQ.w)));
          const s = Math.sqrt(1 - deltaQ.w * deltaQ.w);
          if (s > 1e-3) {
            angularVel.set(deltaQ.x, deltaQ.y, deltaQ.z).divideScalar(s).multiplyScalar(angle / delta).multiplyScalar(this.config.angularVelocityMultiplier);
          } else {
            angularVel.set(0, 0, 0);
          }
        } else {
          velocity.set(0, 0, 0);
          angularVel.set(0, 0, 0);
          binding.initialized = true;
        }
        worldPos.copy(v);
        halfExtents.copy(tempScale);
        binding.previousRotation.copy(q);
        this.obj2Collider.get(binding.object)?.update(binding.object, dataIndex, delta);
      }
    }
  }
  drawDebugShapes(out, uvw) {
    const d = this.distanceAtPoint(uvw);
    If10(d.lessThan(0), () => {
      out.assign(vec312(111, 0, 0));
    });
  }
  distanceAtPoint(uvw) {
    return this.bakeTexture.sample(uvw).w;
  }
  normalAtPoint(uvw) {
    return this.bakeTexture.sample(uvw).xyz;
  }
  /**
   * use this texture to store baked colliders
   */
  setBakeTexture(sdfTexture, sdfVelocityTexture) {
    this.bakeTexture = sdfTexture;
    this.bakeVelocityTexture = sdfVelocityTexture;
  }
  /**
   * This is the compute that will bake the colliders into the `sdfTexture` you set on `setBakeTexture`.
   */
  bakeCollidersPass(context) {
    return () => {
      const coord = context.grid.phy.coord;
      const uvw = context.grid.phy.uvw;
      const localPos = uvw.sub(0.5).mul(context.uVolumeWorldSize);
      const worldPos = context.worldMatrix.mul(vec411(localPos, 1)).xyz;
      const closestNormal = vec312(0).toVar();
      const closestVelocity = vec312(0).toVar();
      const minDistance = this.mapSDF(worldPos, closestVelocity, closestNormal);
      this.bakeTexture.write(coord, vec411(closestNormal, minDistance));
      this.bakeVelocityTexture.write(coord, vec411(closestVelocity, 0));
    };
  }
  makeVelocityAvoidColliders(vel, uvw) {
    if (this.config.disabled) return;
    const sdfData = this.bakeTexture.sample(uvw);
    const minDistance = sdfData.w;
    const normal = sdfData.xyz;
    const objVel = this.bakeVelocityTexture.sample(uvw).xyz;
    const margin = float10(0.1);
    If10(minDistance.lessThanEqual(margin), () => {
      If10(minDistance.lessThan(0), () => {
        const ejectionSpeed = minDistance.abs().mul(20);
        vel.assign(objVel.add(normal.mul(ejectionSpeed)));
      }).Else(() => {
        const proximity = margin.sub(minDistance).div(margin);
        const friction = this.uFriction;
        const dragFactor = proximity.mul(friction);
        vel.assign(mix2(vel, objVel, dragFactor));
        const relativeVel = vel.sub(objVel);
        const relDotN = dot3(relativeVel, normal);
        If10(relDotN.lessThan(0), () => {
          vel.subAssign(normal.mul(relDotN));
        });
      });
    });
  }
  /**
   * Call this when you want to sample a voxel from the perspective of `uvw` to know if that sampled point landed on a solid object and if so what normal direction does it have
   * relative to us...
   *
   * @param grid the size of the 3d texture we are sampling
   * @param worldSize the size of the simulation space in world units
   * @param worldMatrix the world matrix to use to convert world units to the local space of the simulation box
   * @param fromWorldPos world position from where we are sampling
   * @param uvw uvw coordinate of the voxel doing the sampling
   * @param texelOffset offset relative to uvw from which to do the actual sampling
   * @param calculateNormal if you want to get the normal vector of the SDF surface
   * @param onHit called if there's a hit
   * @param onMiss called if nothing was hit
   */
  checkCollisionAt(grid, worldSize, worldMatrix, voxelLocalPos, uvw, texelOffset, calculateNormal, onHit, onMiss) {
    const offset = vec312(grid.texel.x, grid.texel.y, grid.texel.z).mul(texelOffset);
    const otherUVW = uvw.add(offset);
    const sdfData = this.bakeTexture.sample(otherUVW);
    const hitDistance = sdfData.w;
    const normal = sdfData.xyz;
    If10(hitDistance.lessThanEqual(0), () => {
      onHit(otherUVW, hitDistance, normal);
    }).Else(() => {
      onMiss(otherUVW);
    });
  }
};

// source/VolumetricFluidFire.ts
var DEBUG_MODE_IDS = {
  final: 0,
  density: 1,
  temperature: 2,
  velocity: 3,
  colliders: 4
};
var VolumetricFluidFire = class extends Object3D4 {
  constructor(renderer, config = {}) {
    super();
    this.simulate = true;
    this.simulationSpeed = 2;
    this._curlNoiseUpdated = false;
    this._keyLightPosition = new Vector34();
    this.uKeyLightPosition = uniform4(this._keyLightPosition);
    this.uTemperatureAtMaxColor = uniform4(0);
    //set in the constructor
    // --- New Aesthetic Control Uniforms ---
    this.uRadianceMultiplier = uniform4(15);
    // Controls bloom/core intensity
    this.uSpecialColorMultiplier = uniform4(8);
    // Overall volumetric opacity scale
    this.uShadowAbsorption = uniform4(2);
    // Controls how fast light is blocked by smoke
    this.uTintBlendRange = uniform4(new Vector2(0.01, 0.1));
    // Smooth transition range for colorMass/special tints
    this.uDebugMode = uniform4(0, "int");
    const cfg = {
      debug: { renderColliders: false, renderVolumeBox: false, noise: false },
      renderLayer: 10,
      size: {
        boundingBox: new Vector34(10, 10, 10),
        renderResolution: new Vector34(100, 100, 100),
        physicsResolution: new Vector34(64, 64, 64)
      },
      steps: 12,
      burnableMeshes: [],
      noise: {
        size: 64,
        frecuency: 122
      },
      pressureIterations: 4,
      vertexEmissionWorldRadius: 0.02,
      blurStrength: 0,
      colors: {
        baseColor: new Color(0, 0, 0),
        temperatureAtMaxColor: 1,
        //set below...
        byTemperature: {
          tier1: {
            //"smoke"
            color: new Color(1.2, 0.1, 0),
            transition: {
              from: 0.01,
              to: 0.1
            }
          },
          tier2: {
            color: new Color(4, 1.2, 0.05).multiplyScalar(3),
            transition: {
              from: 0.3,
              to: 0.5
            }
          },
          tier3: {
            color: new Color(12, 9, 2).multiplyScalar(3),
            transition: {
              from: 0.7,
              to: 0.8
            }
          }
        },
        specialColor: new Color(65535)
        //debug
      },
      collisions: {
        disabled: false,
        friction: 0.8,
        angularVelocityMultiplier: 1,
        collisionMargin: 0.1,
        maxCollisionShapes: {
          boxes: 32,
          ellipsoids: 32,
          total: 64
        },
        sdfShapes: []
      },
      ...config
    };
    this.config = cfg;
    this.uTemperatureColors = uniformArray4(
      [
        cfg.colors.baseColor,
        cfg.colors.byTemperature.tier1.color,
        cfg.colors.byTemperature.tier2.color,
        cfg.colors.byTemperature.tier3.color,
        cfg.colors.specialColor
      ],
      "color"
    );
    this.uTemperatureColorStops = uniformArray4(
      [
        new Vector2(
          cfg.colors.byTemperature.tier1.transition.from,
          cfg.colors.byTemperature.tier1.transition.to
        ),
        new Vector2(
          cfg.colors.byTemperature.tier2.transition.from,
          cfg.colors.byTemperature.tier2.transition.to
        ),
        new Vector2(
          cfg.colors.byTemperature.tier3.transition.from,
          cfg.colors.byTemperature.tier3.transition.to
        )
      ],
      "vec2"
    );
    this.temperatureAtMaxColor = cfg.colors.temperatureAtMaxColor;
    if (cfg.debug.renderVolumeBox) {
      this.add(new AxesHelper(0.1));
      this.add(
        new Mesh(
          new BoxGeometry(cfg.size.boundingBox.x, cfg.size.boundingBox.y, cfg.size.boundingBox.z),
          new MeshBasicMaterial({ wireframe: true })
        )
      );
    }
    this.objectsManager = new EmitterManager(cfg.burnableMeshes);
    this.collisions = new CollisionHandler(cfg.collisions);
    this.shaderContext = new FluidFireShaderContext({
      world: this,
      grid: {
        phy: cfg.size.physicsResolution,
        dye: cfg.size.renderResolution,
        world: cfg.size.boundingBox
      },
      noiseTextureConfig: cfg.noise,
      collisions: this.collisions
    });
    this.vertexEmissionRadius = cfg.vertexEmissionWorldRadius;
    const WORKGROUP_3D = [4, 4, 4];
    const PHYS_DISPATCH = [
      Math.ceil(cfg.size.physicsResolution.x / WORKGROUP_3D[0]),
      // 64 / 4 = 16
      Math.ceil(cfg.size.physicsResolution.y / WORKGROUP_3D[1]),
      // 64 / 4 = 16
      Math.ceil(cfg.size.physicsResolution.z / WORKGROUP_3D[2])
      // 64 / 4 = 16
    ];
    const DYE_DISPATCH = [
      Math.ceil(cfg.size.renderResolution.x / WORKGROUP_3D[0]),
      // 100 / 4 = 25
      Math.ceil(cfg.size.renderResolution.y / WORKGROUP_3D[1]),
      // 100 / 4 = 25
      Math.ceil(cfg.size.renderResolution.z / WORKGROUP_3D[2])
      // 100 / 4 = 25
    ];
    const NOISE_DISPATCH = [
      Math.ceil(cfg.noise.size / WORKGROUP_3D[0]),
      Math.ceil(cfg.noise.size / WORKGROUP_3D[1]),
      Math.ceil(cfg.noise.size / WORKGROUP_3D[2])
    ];
    const phyGridRes = cfg.size.physicsResolution;
    const dyeGridRes = cfg.size.renderResolution;
    const inBoundsRun = (name, grid, DISPATCH, execPass) => {
      return Fn7(() => {
        const coord = globalId3;
        const gridResolution = ivec33(grid.x, grid.y, grid.z);
        If11(
          coord.x.lessThan(0).or(coord.x.greaterThanEqual(gridResolution.x)).or(coord.y.lessThan(0).or(coord.y.greaterThanEqual(gridResolution.y))).or(coord.z.lessThan(0).or(coord.z.greaterThanEqual(gridResolution.z))),
          () => {
            Return5();
          }
        );
        execPass();
      })().compute(DISPATCH, WORKGROUP_3D).setName(name);
    };
    const pressTexture = this.shaderContext.texture.press;
    const computeShaders = {
      vorticityPass: inBoundsRun("Vorticity", phyGridRes, PHYS_DISPATCH, vorticityPass(this.shaderContext)),
      bakeColliders: inBoundsRun(
        "Bake Colliders",
        phyGridRes,
        PHYS_DISPATCH,
        this.collisions.bakeCollidersPass(this.shaderContext)
      ),
      curlPassCompute: inBoundsRun(
        "Curl Noise",
        { x: cfg.noise.size, y: cfg.noise.size, z: cfg.noise.size },
        NOISE_DISPATCH,
        curlNoisePass(this.shaderContext)
      ),
      advectPassCompute: inBoundsRun(
        "Advect Velocity",
        phyGridRes,
        PHYS_DISPATCH,
        advectVelocityPass(this.shaderContext)
      ),
      divPassCompute: inBoundsRun("Divergence", phyGridRes, PHYS_DISPATCH, divergencePass(this.shaderContext)),
      jacobiPassABCompute: inBoundsRun(
        "jacobiABCompute",
        phyGridRes,
        PHYS_DISPATCH,
        jacobiPass(this.shaderContext, pressTexture.A, pressTexture.B)
      ),
      jacobiPassBACompute: inBoundsRun(
        "jacobiBACompute",
        phyGridRes,
        PHYS_DISPATCH,
        jacobiPass(this.shaderContext, pressTexture.B, pressTexture.A)
      ),
      projectCompute: inBoundsRun("Project", phyGridRes, PHYS_DISPATCH, projectPass(this.shaderContext)),
      advectDyeCompute: inBoundsRun("Advect Dye", dyeGridRes, DYE_DISPATCH, advectDyePass(this.shaderContext)),
      objectsPassCompute: this.objectsManager.computeNodePerVertex(emitObjectPassFragment(this.shaderContext)).setName("emit Ojects"),
      emitObjectsVelocityAndDyePass: this.objectsManager.computeNodePerVertex(emitObjectsVelocityAndDyePassFragment(this.shaderContext)).setName("emitVelocityAndDye")
    };
    const calculateScattering = Fn7(([posRay]) => {
      const { density, temperature, colorMass, bboxPosition, uvw } = this.shaderContext.sampleVolumeAt(posRay);
      const crispDensity = pow(density, float11(1.5));
      const t = temperature;
      const radiance = t.pow(3).mul(this.uRadianceMultiplier).add(1);
      const uShadowAbsorption = this.uShadowAbsorption;
      const selfAbsorption = crispDensity.mul(uShadowAbsorption).negate().exp();
      const fireAbsorption = mix3(float11(1), selfAbsorption, smoothstep4(0.2, 0, t));
      const finalTemperature = t.div(this.uTemperatureAtMaxColor);
      const palette = this.uTemperatureColors;
      const temp0Color = palette.element(0);
      const temp1Color = palette.element(1);
      const temp2Color = palette.element(2);
      const temp3Color = palette.element(3);
      const specialColor = palette.element(4);
      const tintMask = mix3(color("black"), specialColor, colorMass);
      const colorStops = this.uTemperatureColorStops;
      const temp1Stop = colorStops.element(0);
      const temp2Stop = colorStops.element(1);
      const temp3Stop = colorStops.element(2);
      const fireColor = mix3(
        temp0Color,
        mix3(
          temp1Color,
          mix3(temp2Color, temp3Color, smoothstep4(temp3Stop.x, temp3Stop.y, finalTemperature)),
          smoothstep4(temp2Stop.x, temp2Stop.y, finalTemperature)
        ),
        smoothstep4(temp1Stop.x, temp1Stop.y, finalTemperature)
      );
      const normalColor = fireColor.mul(radiance).mul(crispDensity).mul(fireAbsorption);
      const outColor = normalColor.toVar();
      If11(colorMass.greaterThan(0.1), () => {
        outColor.assign(vec313(normalColor.length()).mul(specialColor));
      });
      If11(this.uDebugMode.equal(1), () => {
        outColor.assign(vec313(density));
      });
      If11(this.uDebugMode.equal(2), () => {
        outColor.assign(vec313(finalTemperature));
      });
      If11(this.uDebugMode.equal(3), () => {
        outColor.assign(abs4(this.shaderContext.texture.vel.A.sample(uvw).xyz).div(5));
      });
      If11(this.uDebugMode.equal(4), () => {
        outColor.assign(vec313(0));
        this.shaderContext.collisions.drawDebugShapes(outColor, uvw);
      });
      if (this.config.debug.renderColliders) this.shaderContext.collisions.drawDebugShapes(outColor, uvw);
      return outColor;
    });
    const renderNoiseTexture = Fn7(([posRay]) => {
      const bboxPosition = this.shaderContext.invWorldMatrix.mul(posRay).xyz;
      const uvw = bboxPosition.div(this.shaderContext.uVolumeWorldSize).add(0.5).toVar();
      return this.shaderContext.texture.curlNoise.sample(uvw);
    });
    const volumetricMaterial = new VolumeNodeMaterial({
      transparent: true,
      blending: AdditiveBlending,
      side: DoubleSide,
      // ADD THIS so you can see it while the camera is inside
      steps: cfg.steps,
      depthWrite: false,
      //
      //offsetNode: bayer16(screenCoordinate).mul(0.42),
      offsetNode: fract(interleavedGradientNoise(screenCoordinate).add(float11(frameId).mul(0.118033988749895))),
      //offsetNode: interleavedGradientNoise(screenCoordinate),
      //offsetNode,
      scatteringNode: ({ positionRay }) => {
        return this.config.debug.noise ? renderNoiseTexture(positionRay) : calculateScattering(positionRay);
      }
    });
    this.volumetricMaterial = volumetricMaterial;
    const volumetricMesh = new Mesh(
      new BoxGeometry(
        this.shaderContext.grid.world.size.x,
        this.shaderContext.grid.world.size.y,
        this.shaderContext.grid.world.size.z
      ),
      volumetricMaterial
    );
    volumetricMesh.receiveShadow = true;
    volumetricMesh.layers.disableAll();
    volumetricMesh.layers.enable(cfg.renderLayer);
    volumetricMesh.frustumCulled = false;
    this.add(volumetricMesh);
    this.getRenderPass = (scene, camera, sceneDepthTextureNode) => {
      volumetricMaterial.depthNode = sceneDepthTextureNode.sample(screenUV);
      const volumetricLayer = new Layers();
      volumetricLayer.disableAll();
      volumetricLayer.enable(cfg.renderLayer);
      const volumetricPass = pass(scene, camera, { depthBuffer: false }).toInspector("Fire Pass");
      volumetricPass.name = "Volumetric Lighting";
      volumetricPass.setLayers(volumetricLayer);
      volumetricPass.setResolutionScale(0.75);
      const uBlurStrength = uniform4(this.blurStrength);
      uBlurStrength.onObjectUpdate(({ object }) => this.blurStrength);
      const blurredVolumetricPass = gaussianBlur(volumetricPass, uBlurStrength, 0.1);
      this.volumetricPass = volumetricPass;
      const uBlurEnabled = uniform4(this.config.blurStrength);
      uBlurEnabled.onObjectUpdate(({ object }) => {
        uBlurEnabled.value = this.config.blurStrength;
      });
      return Fn7(() => {
        const useBlur = uBlurEnabled.greaterThan(0);
        return select2(useBlur, blurredVolumetricPass, volumetricPass);
      })();
    };
    this.getFireFor = (id, options) => {
      return this.objectsManager.getFireFor(id, options);
    };
    this.initialize = async () => {
      if (this.update) {
        console.warn("This fire object was already initialized");
        return;
      }
      await renderer.computeAsync(computeShaders.curlPassCompute);
      let frame = 0;
      let simulationTime = 0;
      let lastTime = performance.now();
      let simAccumulator = 0;
      let simDelta = 0;
      const stepTime = 1 / 30;
      let inv = this.matrixWorld.clone();
      this.update = (dt) => {
        this.updateWorldMatrix(true, true);
        dt = Math.min(dt, 1 / 60);
        if (this._curlNoiseUpdated) {
          renderer.compute(computeShaders.curlPassCompute);
          this._curlNoiseUpdated = false;
        }
        if (this.config.debug.noise) return;
        this.shaderContext.worldMatrix.value = this.matrixWorld;
        inv.copy(this.matrixWorld).invert();
        this.shaderContext.invWorldMatrix.value = inv;
        this.objectsManager.update(dt);
        this.collisions.update(dt);
        const currentTime = performance.now();
        const delta = Math.min((currentTime - lastTime) * 1e-3, 1 / 30);
        lastTime = currentTime;
        if (this.simulate && this.simulationSpeed > 0) {
          simDelta = delta * this.simulationSpeed;
          simAccumulator += simDelta;
          const simStep = stepTime * this.simulationSpeed;
          const maxAccumulator = simStep * 2;
          if (simAccumulator > maxAccumulator) {
            simAccumulator = maxAccumulator;
          }
          this.shaderContext.uDt.value = simStep;
          renderer.compute(computeShaders.bakeColliders);
          while (simAccumulator >= simStep) {
            simulationTime += simStep;
            this.shaderContext.uTime.value = simulationTime;
            renderer.compute(computeShaders.vorticityPass);
            renderer.compute(computeShaders.advectPassCompute);
            renderer.compute(computeShaders.divPassCompute);
            for (let i = 0; i < cfg.pressureIterations; i++) {
              renderer.compute(
                i % 2 === 0 ? computeShaders.jacobiPassABCompute : computeShaders.jacobiPassBACompute
                // read pressureB(R) + divergence(R) -> write pressureA(R)
              );
            }
            renderer.compute(computeShaders.projectCompute);
            renderer.compute(computeShaders.advectDyeCompute);
            renderer.compute(computeShaders.objectsPassCompute);
            this.shaderContext.texture.dye.swap();
            simAccumulator -= simStep;
          }
        }
      };
    };
  }
  get vorticityConfinementStrength() {
    return this.shaderContext.uVorticityConfinementStrength.value;
  }
  set vorticityConfinementStrength(value) {
    this.shaderContext.uVorticityConfinementStrength.value = value;
  }
  get temperature() {
    return this.shaderContext.uEmitTemperature.value;
  }
  set temperature(value) {
    this.shaderContext.uEmitTemperature.value = value;
  }
  get fireDensity() {
    return this.shaderContext.uEmitDensity.value;
  }
  set fireDensity(value) {
    this.shaderContext.uEmitDensity.value = value;
  }
  get turbulenceFrecuency() {
    return this.shaderContext.uTurbFrequency.value;
  }
  set turbulenceFrecuency(value) {
    this.shaderContext.uTurbFrequency.value = value;
    this._curlNoiseUpdated = true;
  }
  get turbulenceDecay() {
    return this.shaderContext.uTurbulenceDecay.value;
  }
  set turbulenceDecay(value) {
    this.shaderContext.uTurbulenceDecay.value = value;
  }
  get turbulence() {
    return this.shaderContext.uTurbulence.value;
  }
  set turbulence(value) {
    this.shaderContext.uTurbulence.value = value;
    this._curlNoiseUpdated = true;
  }
  get densityDissipation() {
    return this.shaderContext.uDissipation.value;
  }
  set densityDissipation(value) {
    this.shaderContext.uDissipation.value = value;
  }
  get cooling() {
    return this.shaderContext.uCooling.value;
  }
  set cooling(value) {
    this.shaderContext.uCooling.value = value;
  }
  get velocityDamping() {
    return this.shaderContext.uVelDamping.value;
  }
  set velocityDamping(value) {
    this.shaderContext.uVelDamping.value = value;
  }
  get buoyancy() {
    return this.shaderContext.uBuoyancy.value;
  }
  set buoyancy(value) {
    this.shaderContext.uBuoyancy.value = value;
  }
  get smokeWeight() {
    return this.shaderContext.uWeight.value;
  }
  set smokeWeight(value) {
    this.shaderContext.uWeight.value = value;
  }
  get pressureIterations() {
    return this.config.pressureIterations;
  }
  set pressureIterations(value) {
    this.config.pressureIterations = value;
  }
  get curlNoiseMultiplier() {
    return this.shaderContext.uCurlNoiseMultiplier.value;
  }
  set curlNoiseMultiplier(value) {
    this.shaderContext.uCurlNoiseMultiplier.value = value;
    this._curlNoiseUpdated = true;
  }
  get keyLightPosition() {
    return this._keyLightPosition;
  }
  set keyLightPosition(value) {
    this._keyLightPosition.copy(value);
    this.uKeyLightPosition.value = this._keyLightPosition;
  }
  get blurStrength() {
    return this.config.blurStrength;
  }
  set blurStrength(value) {
    this.config.blurStrength = value;
  }
  get temperatureAtMaxColor() {
    return this.config.colors.temperatureAtMaxColor;
  }
  set temperatureAtMaxColor(value) {
    this.config.colors.temperatureAtMaxColor = value;
    this.uTemperatureAtMaxColor.value = value;
  }
  get vertexEmissionRadius() {
    return this.config.vertexEmissionWorldRadius;
  }
  set vertexEmissionRadius(value) {
    this.config.vertexEmissionWorldRadius = value;
    const k = new Vector34(13, 13, 13);
    const radiusSq = k.lengthSq();
    const offsets = [];
    for (let dx = -k.x; dx <= k.x; dx++)
      for (let dy = -k.y; dy <= k.y; dy++)
        for (let dz = -k.z; dz <= k.z; dz++) {
          const _radiussq = dx * dx + dy * dy + dz * dz;
          offsets.push([dx, dy, dz, 1 - _radiussq / radiusSq]);
        }
    this.shaderContext.uEmitRadiusWorld.value = value;
    this.shaderContext.uVertexSplatBrushOffsetsCount.value = offsets.length;
    this.shaderContext.uVertexSplatBrushOffsets.array = offsets.map(([x, y, z, w]) => new Vector42(x, y, z, w));
  }
  get friction() {
    return this.collisions.uFriction.value;
  }
  set friction(value) {
    this.collisions.uFriction.value = value;
  }
  get angularVelocityMultiplier() {
    return this.collisions.config.angularVelocityMultiplier;
  }
  set angularVelocityMultiplier(value) {
    this.collisions.config.angularVelocityMultiplier = value;
  }
  get collisionMargin() {
    return this.collisions.collisionMargin;
  }
  set collisionMargin(v2) {
    this.collisions.collisionMargin = v2;
  }
  get colorRadianceMultiplier() {
    return this.uRadianceMultiplier.value;
  }
  set colorRadianceMultiplier(v2) {
    this.uRadianceMultiplier.value = v2;
  }
  getColor(type) {
    switch (type) {
      case "base":
        return this.config.colors.baseColor;
      case "tier1":
        return this.config.colors.byTemperature.tier1.color;
      case "tier2":
        return this.config.colors.byTemperature.tier2.color;
      case "tier3":
        return this.config.colors.byTemperature.tier3.color;
      case "special":
        return this.config.colors.specialColor;
    }
  }
  setColor(type, value) {
    const colors = this.uTemperatureColors.array;
    switch (type) {
      case "base":
        this.config.colors.baseColor = value;
        colors[0] = value;
        break;
      case "tier1":
        this.config.colors.byTemperature.tier1.color = value;
        colors[1] = value;
        break;
      case "tier2":
        this.config.colors.byTemperature.tier2.color = value;
        colors[2] = value;
        break;
      case "tier3":
        this.config.colors.byTemperature.tier3.color = value;
        colors[3] = value;
        break;
      case "special":
        this.config.colors.specialColor = value;
        colors[4] = value;
        break;
    }
  }
  getColorStop(tier) {
    switch (tier) {
      case "tier1":
        return this.config.colors.byTemperature.tier1.transition;
      case "tier2":
        return this.config.colors.byTemperature.tier2.transition;
      case "tier3":
        return this.config.colors.byTemperature.tier3.transition;
    }
  }
  setColorStop(tier, transition) {
    const stops = this.uTemperatureColorStops.array;
    const palette = this.config.colors.byTemperature;
    switch (tier) {
      case "tier1":
        palette.tier1.transition = transition;
        stops[0].x = transition.from;
        stops[0].y = transition.to;
        break;
      case "tier2":
        palette.tier2.transition = transition;
        stops[1].x = transition.from;
        stops[1].y = transition.to;
        break;
      case "tier3":
        palette.tier3.transition = transition;
        stops[2].x = transition.from;
        stops[2].y = transition.to;
        break;
    }
  }
  // private _blurIterations = 1;
  // get blurIterations() {
  // 	return this._blurIterations;
  // }
  // set blurIterations(value: number) {
  // 	this._blurIterations = value;
  // }
  /**
   * Get the current settings of the fire simulation as a snapshot
   */
  getSettingsSnapshot() {
    return {
      resolution: this.volumetricPass.getResolutionScale(),
      vorticityConfinementStrength: this.vorticityConfinementStrength,
      vertexEmissionRadius: this.vertexEmissionRadius,
      blurStrength: this.blurStrength,
      steps: this.config.steps,
      simulationSpeed: this.simulationSpeed,
      temperature: this.temperature,
      fireDensity: this.fireDensity,
      turbulenceFrecuency: this.turbulenceFrecuency,
      turbulenceDecay: this.turbulenceDecay,
      turbulence: this.turbulence,
      friction: this.friction,
      angularVelocityMultiplier: this.angularVelocityMultiplier,
      collisionMargin: this.collisionMargin,
      densityDissipation: this.densityDissipation,
      cooling: this.cooling,
      velocityDamping: this.velocityDamping,
      buoyancy: this.buoyancy,
      smokeWeight: this.smokeWeight,
      pressureIterations: this.pressureIterations,
      curlNoiseMultiplier: this.curlNoiseMultiplier,
      colorBase: this.getColor("base").toJSON(),
      colorTier1: this.getColor("tier1").toJSON(),
      colorTier2: this.getColor("tier2").toJSON(),
      colorTier3: this.getColor("tier3").toJSON(),
      colorSpecial: this.getColor("special").toJSON(),
      colorRadianceMultiplier: this.colorRadianceMultiplier,
      tier1Stop: this.getColorStop("tier1"),
      tier2Stop: this.getColorStop("tier2"),
      tier3Stop: this.getColorStop("tier3"),
      temperatureAtMaxColor: this.temperatureAtMaxColor,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Apply a settings snapshot to the fire simulation
   */
  applySettingsSnapshot(snapshot) {
    this.vorticityConfinementStrength = snapshot.vorticityConfinementStrength;
    this.volumetricPass.setResolutionScale(snapshot.resolution);
    this.vertexEmissionRadius = snapshot.vertexEmissionRadius;
    this.config.steps = snapshot.steps;
    this.volumetricMaterial.steps = snapshot.steps;
    this.simulationSpeed = snapshot.simulationSpeed;
    this.temperature = snapshot.temperature;
    this.fireDensity = snapshot.fireDensity;
    this.turbulenceFrecuency = snapshot.turbulenceFrecuency;
    this.turbulenceDecay = snapshot.turbulenceDecay;
    this.turbulence = snapshot.turbulence;
    this.collisionMargin = snapshot.collisionMargin;
    this.friction = snapshot.friction;
    this.densityDissipation = snapshot.densityDissipation;
    this.cooling = snapshot.cooling;
    this.velocityDamping = snapshot.velocityDamping;
    this.buoyancy = snapshot.buoyancy;
    this.smokeWeight = snapshot.smokeWeight;
    this.pressureIterations = snapshot.pressureIterations;
    this.curlNoiseMultiplier = snapshot.curlNoiseMultiplier;
    this.blurStrength = snapshot.blurStrength;
    this.angularVelocityMultiplier = snapshot.angularVelocityMultiplier;
    this.setColor("base", new Color().setHex(snapshot.colorBase));
    this.setColor("tier1", new Color().setHex(snapshot.colorTier1));
    this.setColor("tier2", new Color().setHex(snapshot.colorTier2));
    this.setColor("tier3", new Color().setHex(snapshot.colorTier3));
    this.setColor("special", new Color().setHex(snapshot.colorSpecial));
    this.setColorStop("tier1", snapshot.tier1Stop);
    this.setColorStop("tier2", snapshot.tier2Stop);
    this.setColorStop("tier3", snapshot.tier3Stop);
    this.colorRadianceMultiplier = snapshot.colorRadianceMultiplier;
    this.temperatureAtMaxColor = snapshot.temperatureAtMaxColor;
  }
  setDebugMode(mode) {
    this.uDebugMode.value = DEBUG_MODE_IDS[mode] ?? DEBUG_MODE_IDS.final;
  }
  /**
   * Use the object as a proxy to control a collider in the simulation.
   *
   * @param obj This object will be used to position and transform the collider in the simulation. You can movie it around and the simulation will sync.
   * @param colliderType
   */
  makeObjectCollidable(obj, colliderType) {
    this.collisions.makeObjectCollidable(obj, colliderType);
  }
};

// volumetric-fluid-fire.entry.js
var VOLUMETRIC_FLUID_FIRE_PRESET = Object.freeze({
  resolution: 0.75,
  vorticityConfinementStrength: 7.01,
  vertexEmissionRadius: 0,
  blurStrength: 0,
  steps: 22,
  simulationSpeed: 1.5,
  temperature: 8.5,
  fireDensity: 0.644,
  turbulenceFrecuency: 6.81,
  turbulenceDecay: 0.76,
  turbulence: 0.2,
  friction: 0.9,
  angularVelocityMultiplier: 1.36,
  collisionMargin: 0.034,
  densityDissipation: 1.02,
  cooling: 0.4831,
  velocityDamping: 0.25,
  buoyancy: 2.3729,
  smokeWeight: 0.15,
  pressureIterations: 4,
  curlNoiseMultiplier: 5.82,
  colorBase: 0,
  colorTier1: 16734464,
  colorTier2: 16777068,
  colorTier3: 16777215,
  colorSpecial: 65535,
  colorRadianceMultiplier: 14.78,
  tier1Stop: { from: 0.01, to: 0.1 },
  tier2Stop: { from: 0.3, to: 0.5 },
  tier3Stop: { from: 0.7, to: 0.8 },
  temperatureAtMaxColor: 10,
  timestamp: "2026-07-30T16:35:28.278Z"
});
export {
  SDFBox,
  SDFEllipsoid,
  SDFShape,
  VOLUMETRIC_FLUID_FIRE_PRESET,
  VolumetricFluidFire
};
