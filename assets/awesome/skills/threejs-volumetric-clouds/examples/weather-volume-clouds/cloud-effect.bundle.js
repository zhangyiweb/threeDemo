var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// source/clouds/DensityProfile.ts
var DensityProfile = class _DensityProfile {
  constructor(expTerm = 0, exponent = 0, linearTerm = 0, constantTerm = 0) {
    this.expTerm = expTerm;
    this.exponent = exponent;
    this.linearTerm = linearTerm;
    this.constantTerm = constantTerm;
  }
  set(expTerm = 0, exponent = 0, linearTerm = 0, constantTerm = 0) {
    this.expTerm = expTerm;
    this.exponent = exponent;
    this.linearTerm = linearTerm;
    this.constantTerm = constantTerm;
    return this;
  }
  clone() {
    return new _DensityProfile(
      this.expTerm,
      this.exponent,
      this.linearTerm,
      this.constantTerm
    );
  }
  copy(other) {
    this.expTerm = other.expTerm;
    this.exponent = other.exponent;
    this.linearTerm = other.linearTerm;
    this.constantTerm = other.constantTerm;
    return this;
  }
};

// source/clouds/CloudLayer.ts
var paramKeys = [
  "channel",
  "altitude",
  "height",
  "densityScale",
  "shapeAmount",
  "shapeDetailAmount",
  "weatherExponent",
  "shapeAlteringBias",
  "coverageFilterWidth",
  "shadow",
  "densityProfile"
];
function applyOptions(target, params) {
  if (params == null) {
    return;
  }
  for (const key of paramKeys) {
    const value = params[key];
    if (value == null) {
      continue;
    }
    if (target[key] instanceof DensityProfile) {
      target[key].copy(value);
    } else {
      ;
      target[key] = value;
    }
  }
}
var CloudLayer = class _CloudLayer {
  constructor(options) {
    this.channel = "r";
    this.altitude = 0;
    this.height = 0;
    this.densityScale = 0.2;
    this.shapeAmount = 1;
    this.shapeDetailAmount = 1;
    this.weatherExponent = 1;
    this.shapeAlteringBias = 0.35;
    this.coverageFilterWidth = 0.6;
    this.densityProfile = new DensityProfile(0, 0, 0.75, 0.25);
    this.shadow = false;
    this.set(options);
  }
  static {
    this.DEFAULT = /* @__PURE__ */ new _CloudLayer();
  }
  set(options) {
    applyOptions(this, options);
    return this;
  }
  clone() {
    return new _CloudLayer(this);
  }
  copy(other) {
    this.channel = other.channel;
    this.altitude = other.altitude;
    this.height = other.height;
    this.densityScale = other.densityScale;
    this.shapeAmount = other.shapeAmount;
    this.shapeDetailAmount = other.shapeDetailAmount;
    this.weatherExponent = other.weatherExponent;
    this.shapeAlteringBias = other.shapeAlteringBias;
    this.coverageFilterWidth = other.coverageFilterWidth;
    this.densityProfile.copy(other.densityProfile);
    this.shadow = other.shadow;
    return this;
  }
};

// source/clouds/CloudLayers.ts
var entriesScratch = /* @__PURE__ */ Array.from(
  { length: 8 },
  () => ({ value: 0, flag: 0 })
);
var intervalsScratch = /* @__PURE__ */ Array.from(
  { length: 3 },
  () => ({ min: 0, max: 0 })
);
function compareEntries(a, b) {
  return a.value !== b.value ? a.value - b.value : a.flag - b.flag;
}
var CloudLayers = class _CloudLayers extends Array {
  static {
    this.DEFAULT = /* @__PURE__ */ new _CloudLayers([
      {
        channel: "r",
        altitude: 750,
        height: 650,
        densityScale: 0.2,
        shapeAmount: 1,
        shapeDetailAmount: 1,
        weatherExponent: 1,
        shapeAlteringBias: 0.35,
        coverageFilterWidth: 0.6,
        shadow: true
      },
      {
        channel: "g",
        altitude: 1e3,
        height: 1200,
        densityScale: 0.2,
        shapeAmount: 1,
        shapeDetailAmount: 1,
        weatherExponent: 1,
        shapeAlteringBias: 0.35,
        coverageFilterWidth: 0.6,
        shadow: true
      },
      {
        channel: "b",
        altitude: 7500,
        height: 500,
        densityScale: 3e-3,
        shapeAmount: 0.4,
        shapeDetailAmount: 0,
        weatherExponent: 1,
        shapeAlteringBias: 0.35,
        coverageFilterWidth: 0.5
      },
      { channel: "a" }
    ]);
  }
  constructor(options) {
    super(
      new CloudLayer(options?.[0]),
      new CloudLayer(options?.[1]),
      new CloudLayer(options?.[2]),
      new CloudLayer(options?.[3])
    );
  }
  set(options) {
    this[0].set(options?.[0]);
    this[1].set(options?.[1]);
    this[2].set(options?.[2]);
    this[3].set(options?.[3]);
    return this;
  }
  reset() {
    this[0].copy(CloudLayer.DEFAULT);
    this[1].copy(CloudLayer.DEFAULT);
    this[2].copy(CloudLayer.DEFAULT);
    this[3].copy(CloudLayer.DEFAULT);
    return this;
  }
  clone() {
    return new _CloudLayers(this);
  }
  copy(other) {
    this[0].copy(other[0]);
    this[1].copy(other[1]);
    this[2].copy(other[2]);
    this[3].copy(other[3]);
    return this;
  }
  get localWeatherChannels() {
    return this[0].channel + this[1].channel + this[2].channel + this[3].channel;
  }
  packValues(key, result) {
    return result.set(this[0][key], this[1][key], this[2][key], this[3][key]);
  }
  packSums(a, b, result) {
    return result.set(
      this[0][a] + this[0][b],
      this[1][a] + this[1][b],
      this[2][a] + this[2][b],
      this[3][a] + this[3][b]
    );
  }
  packDensityProfiles(key, result) {
    return result.set(
      this[0].densityProfile[key],
      this[1].densityProfile[key],
      this[2].densityProfile[key],
      this[3].densityProfile[key]
    );
  }
  // Redundant, but need to avoid creating garbage here as this runs every frame.
  packIntervalHeights(minIntervals, maxIntervals) {
    for (let i = 0; i < 4; ++i) {
      const layer = this[i];
      let entry = entriesScratch[i];
      entry.value = layer.altitude;
      entry.flag = 0;
      entry = entriesScratch[i + 4];
      entry.value = layer.altitude + layer.height;
      entry.flag = 1;
    }
    entriesScratch.sort(compareEntries);
    let intervalIndex = 0;
    let balance = 0;
    for (let entryIndex = 0; entryIndex < entriesScratch.length; ++entryIndex) {
      const { value, flag } = entriesScratch[entryIndex];
      if (balance === 0 && entryIndex > 0) {
        const interval2 = intervalsScratch[intervalIndex++];
        interval2.min = entriesScratch[entryIndex - 1].value;
        interval2.max = value;
      }
      balance += flag === 0 ? 1 : -1;
    }
    for (; intervalIndex < 3; ++intervalIndex) {
      const interval2 = intervalsScratch[intervalIndex];
      interval2.min = 0;
      interval2.max = 0;
    }
    let interval = intervalsScratch[0];
    minIntervals.x = interval.min;
    maxIntervals.x = interval.max;
    interval = intervalsScratch[1];
    minIntervals.y = interval.min;
    maxIntervals.y = interval.max;
    interval = intervalsScratch[2];
    minIntervals.z = interval.min;
    maxIntervals.z = interval.max;
  }
};

// source/clouds/CloudsEffect.ts
import { Effect as Effect2, EffectAttribute as EffectAttribute2, Resolution } from "postprocessing";
import {
  Camera as Camera3,
  Data3DTexture as Data3DTexture3,
  EventDispatcher,
  Matrix4 as Matrix413,
  Texture,
  Uniform as Uniform11,
  Vector2 as Vector213,
  Vector3 as Vector323
} from "three";

// source/atmosphere/AerialPerspectiveEffect.ts
import { BlendFunction, Effect, EffectAttribute } from "postprocessing";
import {
  Camera,
  Matrix4 as Matrix43,
  Uniform,
  Vector2 as Vector22,
  Vector3 as Vector39
} from "three";

// source/geospatial/ArrayBufferLoader.ts
import { FileLoader, Loader } from "three";

// source/vendor/tiny-invariant.ts
function invariant(condition, message) {
  if (condition) return;
  const provided = typeof message === "function" ? message() : message;
  throw new Error(provided != null ? `Invariant failed: ${provided}` : "Invariant failed");
}

// source/geospatial/ArrayBufferLoader.ts
var ArrayBufferLoader = class extends Loader {
  load(url, onLoad, onProgress, onError) {
    const loader = new FileLoader(this.manager);
    loader.setResponseType("arraybuffer");
    loader.setRequestHeader(this.requestHeader);
    loader.setPath(this.path);
    loader.setWithCredentials(this.withCredentials);
    loader.load(
      url,
      (arrayBuffer) => {
        invariant(arrayBuffer instanceof ArrayBuffer);
        try {
          onLoad(arrayBuffer);
        } catch (error) {
          if (onError != null) {
            onError(error);
          } else {
            console.error(error);
          }
          this.manager.itemError(url);
        }
      },
      onProgress,
      onError
    );
  }
};

// source/geospatial/assertions.ts
function assertType(value) {
}

// source/geospatial/bufferGeometry.ts
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Sphere,
  Vector3
} from "three";
function toBufferGeometryLike(geometry) {
  const { attributes, index, boundingBox, boundingSphere } = geometry;
  return [
    { attributes, index, boundingBox, boundingSphere },
    [
      ...Object.values(geometry.attributes).map(
        (attribute) => attribute.array.buffer
      ),
      geometry.index?.array.buffer
    ].filter((buffer) => buffer != null)
  ];
}
function fromBufferGeometryLike(input, result = new BufferGeometry()) {
  for (const [name, attribute] of Object.entries(input.attributes)) {
    result.setAttribute(
      name,
      new BufferAttribute(
        attribute.array,
        attribute.itemSize,
        attribute.normalized
      )
    );
  }
  result.index = input.index != null ? new BufferAttribute(
    input.index.array,
    input.index.itemSize,
    input.index.normalized
  ) : null;
  if (input.boundingBox != null) {
    const { min, max } = input.boundingBox;
    result.boundingBox = new Box3(
      new Vector3(min.x, min.y, min.z),
      new Vector3(max.x, max.y, max.z)
    );
  }
  if (input.boundingSphere != null) {
    const { center, radius } = input.boundingSphere;
    result.boundingSphere = new Sphere(
      new Vector3(center.x, center.y, center.z),
      radius
    );
  }
  return result;
}

// source/geospatial/constants.ts
var STBN_TEXTURE_WIDTH = 128;
var STBN_TEXTURE_HEIGHT = 128;
var STBN_TEXTURE_DEPTH = 64;
var ref = "9627216cc50057994c98a2118f3c4a23765d43b9";
var DEFAULT_STBN_URL = `https://media.githubusercontent.com/media/takram-design-engineering/three-geospatial/${ref}/packages/core/assets/stbn.bin`;

// source/geospatial/DataLoader.ts
import {
  ByteType,
  Data3DTexture,
  DataTexture,
  FloatType,
  HalfFloatType,
  IntType,
  LinearFilter,
  Loader as Loader3,
  RGBAFormat,
  ShortType,
  UnsignedByteType,
  UnsignedIntType,
  UnsignedShortType
} from "three";

// source/geospatial/typedArray.ts
import {
  Float16Array
} from "@petamoriken/float16";
function isTypedArray(value) {
  return value instanceof Int8Array || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int16Array || value instanceof Uint16Array || value instanceof Int32Array || value instanceof Uint32Array || value instanceof Float16Array || value instanceof Float32Array || value instanceof Float64Array;
}

// source/geospatial/TypedArrayLoader.ts
import { Loader as Loader2 } from "three";
var TypedArrayLoader = class extends Loader2 {
  load(url, onLoad, onProgress, onError) {
    const loader = new ArrayBufferLoader(this.manager);
    loader.setRequestHeader(this.requestHeader);
    loader.setPath(this.path);
    loader.setWithCredentials(this.withCredentials);
    loader.load(
      url,
      (arrayBuffer) => {
        try {
          onLoad(this.parseTypedArray(arrayBuffer));
        } catch (error) {
          if (onError != null) {
            onError(error);
          } else {
            console.error(error);
          }
          this.manager.itemError(url);
        }
      },
      onProgress,
      onError
    );
  }
};
function createTypedArrayLoaderClass(parser) {
  return class extends TypedArrayLoader {
    constructor() {
      super(...arguments);
      this.parseTypedArray = parser;
    }
  };
}
function createTypedArrayLoader(parser) {
  return new (createTypedArrayLoaderClass(parser))();
}

// source/geospatial/DataLoader.ts
function getTextureDataType(array) {
  const type = array instanceof Int8Array ? ByteType : array instanceof Uint8Array ? UnsignedByteType : array instanceof Uint8ClampedArray ? UnsignedByteType : array instanceof Int16Array ? ShortType : array instanceof Uint16Array ? UnsignedShortType : array instanceof Int32Array ? IntType : array instanceof Uint32Array ? UnsignedIntType : array instanceof Float16Array ? HalfFloatType : array instanceof Float32Array ? FloatType : array instanceof Float64Array ? FloatType : null;
  invariant(type != null);
  return type;
}
var defaultDataTextureParameter = {
  format: RGBAFormat,
  minFilter: LinearFilter,
  magFilter: LinearFilter
};
var DataLoader = class extends Loader3 {
  constructor() {
    super(...arguments);
    this.parameters = {};
  }
  load(url, onLoad, onProgress, onError) {
    const texture = new this.Texture();
    const loader = new this.TypedArrayLoader(this.manager);
    loader.setRequestHeader(this.requestHeader);
    loader.setPath(this.path);
    loader.setWithCredentials(this.withCredentials);
    loader.load(
      url,
      (array) => {
        texture.image.data = array instanceof Float16Array ? new Uint16Array(array.buffer) : array;
        const { width, height, depth: depth2, ...params } = this.parameters;
        if (width != null) {
          texture.image.width = width;
        }
        if (height != null) {
          texture.image.height = height;
        }
        if ("depth" in texture.image && depth2 != null) {
          texture.image.depth = depth2;
        }
        texture.type = getTextureDataType(array);
        Object.assign(texture, params);
        texture.needsUpdate = true;
        onLoad(texture);
      },
      onProgress,
      onError
    );
  }
};
function createDataLoaderClass(Texture2, parser, parameters2) {
  return class extends DataLoader {
    constructor() {
      super(...arguments);
      this.Texture = Texture2;
      this.TypedArrayLoader = createTypedArrayLoaderClass(parser);
      this.parameters = {
        ...defaultDataTextureParameter,
        ...parameters2
      };
    }
  };
}
function createData3DTextureLoaderClass(parser, parameters2) {
  return createDataLoaderClass(Data3DTexture, parser, parameters2);
}
function createDataTextureLoaderClass(parser, parameters2) {
  return createDataLoaderClass(DataTexture, parser, parameters2);
}
function createData3DTextureLoader(parser, parameters2) {
  return new (createData3DTextureLoaderClass(parser, parameters2))();
}
function createDataTextureLoader(parser, parameters2) {
  return new (createDataTextureLoaderClass(parser, parameters2))();
}

// source/geospatial/decorators.ts
import { Material } from "three";

// source/geospatial/math.ts
import { MathUtils } from "three";
var clamp = MathUtils.clamp;
var euclideanModulo = MathUtils.euclideanModulo;
var inverseLerp = MathUtils.inverseLerp;
var lerp = MathUtils.lerp;
var radians = MathUtils.degToRad;
var degrees = MathUtils.radToDeg;
var isPowerOfTwo = MathUtils.isPowerOfTwo;
var ceilPowerOfTwo = MathUtils.ceilPowerOfTwo;
var floorPowerOfTwo = MathUtils.floorPowerOfTwo;
var normalize = MathUtils.normalize;
function remap(x, min1, max1, min2 = 0, max2 = 1) {
  return MathUtils.mapLinear(x, min1, max1, min2, max2);
}
function remapClamped(x, min1, max1, min2 = 0, max2 = 1) {
  return clamp(MathUtils.mapLinear(x, min1, max1, min2, max2), min2, max2);
}
function smoothstep(min, max, x) {
  if (x <= min) {
    return 0;
  }
  if (x >= max) {
    return 1;
  }
  x = (x - min) / (max - min);
  return x * x * (3 - 2 * x);
}
function saturate(x) {
  return Math.min(Math.max(x, 0), 1);
}
function closeTo(a, b, relativeEpsilon, absoluteEpsilon = relativeEpsilon) {
  const diff = Math.abs(a - b);
  return diff <= absoluteEpsilon || diff <= relativeEpsilon * Math.max(Math.abs(a), Math.abs(b));
}

// source/geospatial/decorators.ts
function define(name) {
  return (target, propertyKey) => {
    if (target instanceof Material) {
      Object.defineProperty(target, propertyKey, {
        enumerable: true,
        get() {
          return this.defines?.[name] != null;
        },
        set(value) {
          if (value !== this[propertyKey]) {
            if (value) {
              this.defines ??= {};
              this.defines[name] = "1";
            } else {
              delete this.defines?.[name];
            }
            this.needsUpdate = true;
          }
        }
      });
    } else {
      Object.defineProperty(target, propertyKey, {
        enumerable: true,
        get() {
          return this.defines.has(name);
        },
        set(value) {
          if (value !== this[propertyKey]) {
            if (value) {
              this.defines.set(name, "1");
            } else {
              this.defines.delete(name);
            }
            ;
            this.setChanged();
          }
        }
      });
    }
  };
}
function defineInt(name, {
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER
} = {}) {
  return (target, propertyKey) => {
    if (target instanceof Material) {
      Object.defineProperty(target, propertyKey, {
        enumerable: true,
        get() {
          const value = this.defines?.[name];
          return value != null ? parseInt(value) : 0;
        },
        set(value) {
          const prevValue = this[propertyKey];
          if (value !== prevValue) {
            this.defines ??= {};
            this.defines[name] = clamp(value, min, max).toFixed(0);
            this.needsUpdate = true;
          }
        }
      });
    } else {
      Object.defineProperty(target, propertyKey, {
        enumerable: true,
        get() {
          const value = this.defines.get(name);
          return value != null ? parseInt(value) : 0;
        },
        set(value) {
          const prevValue = this[propertyKey];
          if (value !== prevValue) {
            this.defines.set(name, clamp(value, min, max).toFixed(0));
            this.setChanged();
          }
        }
      });
    }
  };
}
function defineFloat(name, {
  min = -Infinity,
  max = Infinity,
  precision = 7
} = {}) {
  return (target, propertyKey) => {
    if (target instanceof Material) {
      Object.defineProperty(target, propertyKey, {
        enumerable: true,
        get() {
          const value = this.defines?.[name];
          return value != null ? parseFloat(value) : 0;
        },
        set(value) {
          const prevValue = this[propertyKey];
          if (value !== prevValue) {
            this.defines ??= {};
            this.defines[name] = clamp(value, min, max).toFixed(precision);
            this.needsUpdate = true;
          }
        }
      });
    } else {
      Object.defineProperty(target, propertyKey, {
        enumerable: true,
        get() {
          const value = this.defines.get(name);
          return value != null ? parseFloat(value) : 0;
        },
        set(value) {
          const prevValue = this[propertyKey];
          if (value !== prevValue) {
            this.defines.set(name, clamp(value, min, max).toFixed(precision));
            this.setChanged();
          }
        }
      });
    }
  };
}
function defineExpression(name, { validate } = {}) {
  return (target, propertyKey) => {
    if (target instanceof Material) {
      Object.defineProperty(target, propertyKey, {
        enumerable: true,
        get() {
          return this.defines?.[name] ?? "";
        },
        set(value) {
          if (value !== this[propertyKey]) {
            if (validate?.(value) === false) {
              console.error(`Expression validation failed: ${value}`);
              return;
            }
            this.defines ??= {};
            this.defines[name] = value;
            this.needsUpdate = true;
          }
        }
      });
    } else {
      Object.defineProperty(target, propertyKey, {
        enumerable: true,
        get() {
          return this.defines.get(name) ?? "";
        },
        set(value) {
          if (value !== this[propertyKey]) {
            if (validate?.(value) === false) {
              console.error(`Expression validation failed: ${value}`);
              return;
            }
            this.defines.set(name, value);
            this.setChanged();
          }
        }
      });
    }
  };
}

// source/geospatial/defineShorthand.ts
function definePropertyShorthand(destination, ...sourceKeysArgs) {
  const descriptors = {};
  for (let i = 0; i < sourceKeysArgs.length; i += 2) {
    const source = sourceKeysArgs[i];
    const keys = sourceKeysArgs[i + 1];
    for (const key of keys) {
      descriptors[key] = {
        enumerable: true,
        get: () => source[key],
        set: (value) => {
          source[key] = value;
        }
      };
    }
  }
  Object.defineProperties(destination, descriptors);
  return destination;
}
function defineUniformShorthand(destination, source, keys) {
  const descriptors = {};
  for (const key of keys) {
    descriptors[key] = {
      enumerable: true,
      get: () => source.uniforms[key].value,
      set: (value) => {
        source.uniforms[key].value = value;
      }
    };
  }
  Object.defineProperties(destination, descriptors);
  return destination;
}

// source/geospatial/Ellipsoid.ts
import { Matrix4, Vector3 as Vector33 } from "three";

// source/geospatial/helpers/projectOnEllipsoidSurface.ts
import { Vector3 as Vector32 } from "three";
var vectorScratch = /* @__PURE__ */ new Vector32();
function projectOnEllipsoidSurface(position, reciprocalRadiiSquared, result = new Vector32(), options) {
  const { x, y, z } = position;
  const rx = reciprocalRadiiSquared.x;
  const ry = reciprocalRadiiSquared.y;
  const rz = reciprocalRadiiSquared.z;
  const x2 = x * x * rx;
  const y2 = y * y * ry;
  const z2 = z * z * rz;
  const normSquared = x2 + y2 + z2;
  const ratio = Math.sqrt(1 / normSquared);
  if (!Number.isFinite(ratio)) {
    return void 0;
  }
  const intersection = vectorScratch.copy(position).multiplyScalar(ratio);
  if (normSquared < (options?.centerTolerance ?? 0.1)) {
    return result.copy(intersection);
  }
  const gradient = intersection.multiply(reciprocalRadiiSquared).multiplyScalar(2);
  let lambda = (1 - ratio) * position.length() / (gradient.length() / 2);
  let correction = 0;
  let sx;
  let sy;
  let sz;
  let error;
  do {
    lambda -= correction;
    sx = 1 / (1 + lambda * rx);
    sy = 1 / (1 + lambda * ry);
    sz = 1 / (1 + lambda * rz);
    const sx2 = sx * sx;
    const sy2 = sy * sy;
    const sz2 = sz * sz;
    const sx3 = sx2 * sx;
    const sy3 = sy2 * sy;
    const sz3 = sz2 * sz;
    error = x2 * sx2 + y2 * sy2 + z2 * sz2 - 1;
    correction = error / ((x2 * sx3 * rx + y2 * sy3 * ry + z2 * sz3 * rz) * -2);
  } while (Math.abs(error) > 1e-12);
  return result.set(x * sx, y * sy, z * sz);
}

// source/geospatial/Ellipsoid.ts
var vectorScratch1 = /* @__PURE__ */ new Vector33();
var vectorScratch2 = /* @__PURE__ */ new Vector33();
var vectorScratch3 = /* @__PURE__ */ new Vector33();
var Ellipsoid = class _Ellipsoid {
  static {
    this.WGS84 = /* @__PURE__ */ new _Ellipsoid(
      6378137,
      6378137,
      6356752314245179e-9
    );
  }
  constructor(x, y, z) {
    this.radii = new Vector33(x, y, z);
  }
  get minimumRadius() {
    return Math.min(this.radii.x, this.radii.y, this.radii.z);
  }
  get maximumRadius() {
    return Math.max(this.radii.x, this.radii.y, this.radii.z);
  }
  reciprocalRadii(result = new Vector33()) {
    const { x, y, z } = this.radii;
    return result.set(1 / x, 1 / y, 1 / z);
  }
  reciprocalRadiiSquared(result = new Vector33()) {
    const { x, y, z } = this.radii;
    return result.set(1 / x ** 2, 1 / y ** 2, 1 / z ** 2);
  }
  projectOnSurface(position, result = new Vector33(), options) {
    return projectOnEllipsoidSurface(
      position,
      this.reciprocalRadiiSquared(),
      result,
      options
    );
  }
  getSurfaceNormal(position, result = new Vector33()) {
    return result.multiplyVectors(this.reciprocalRadiiSquared(vectorScratch1), position).normalize();
  }
  getEastNorthUpVectors(position, east = new Vector33(), north = new Vector33(), up = new Vector33()) {
    this.getSurfaceNormal(position, up);
    east.set(-position.y, position.x, 0).normalize();
    north.crossVectors(up, east).normalize();
  }
  getEastNorthUpFrame(position, result = new Matrix4()) {
    const east = vectorScratch1;
    const north = vectorScratch2;
    const up = vectorScratch3;
    this.getEastNorthUpVectors(position, east, north, up);
    return result.makeBasis(east, north, up).setPosition(position);
  }
  getIntersection(ray, result = new Vector33()) {
    const reciprocalRadii = this.reciprocalRadii(vectorScratch1);
    const p = vectorScratch2.copy(reciprocalRadii).multiply(ray.origin);
    const d = vectorScratch3.copy(reciprocalRadii).multiply(ray.direction);
    const p2 = p.lengthSq();
    const d2 = d.lengthSq();
    const pd = p.dot(d);
    const discriminant = pd ** 2 - d2 * (p2 - 1);
    if (p2 === 1) {
      return result.copy(ray.origin);
    }
    if (p2 > 1) {
      if (pd >= 0 || discriminant < 0) {
        return;
      }
      const Q = Math.sqrt(discriminant);
      const t1 = (-pd - Q) / d2;
      const t2 = (-pd + Q) / d2;
      return ray.at(Math.min(t1, t2), result);
    }
    if (p2 < 1) {
      const discriminant2 = pd ** 2 - d2 * (p2 - 1);
      const Q = Math.sqrt(discriminant2);
      const t = (-pd + Q) / d2;
      return ray.at(t, result);
    }
    if (pd < 0) {
      return ray.at(-pd / d2, result);
    }
  }
  getOsculatingSphereCenter(surfacePosition, radius, result = new Vector33()) {
    invariant(this.radii.x === this.radii.y);
    const a2 = this.radii.x ** 2;
    const b2 = this.radii.z ** 2;
    const normal = vectorScratch1.set(
      surfacePosition.x / a2,
      surfacePosition.y / a2,
      surfacePosition.z / b2
    ).normalize();
    return result.copy(normal.multiplyScalar(-radius).add(surfacePosition));
  }
  getNormalAtHorizon(position, direction, result = new Vector33()) {
    invariant(this.radii.x === this.radii.y);
    const a2 = this.radii.x ** 2;
    const b2 = this.radii.z ** 2;
    const p = position;
    const v = direction;
    let t = (p.x * v.x + p.y * v.y) / a2 + p.z * v.z / b2;
    t /= (p.x ** 2 + p.y ** 2) / a2 + p.z ** 2 / b2;
    const q = vectorScratch1.copy(v).multiplyScalar(-t).add(position);
    return result.set(q.x / a2, q.y / a2, q.z / b2).normalize();
  }
};

// source/geospatial/EllipsoidGeometry.ts
import { BufferAttribute as BufferAttribute2, BufferGeometry as BufferGeometry2, Vector3 as Vector34 } from "three";
var EllipsoidGeometry = class extends BufferGeometry2 {
  constructor(radii = new Vector34(1, 1, 1), longitudeSegments = 32, latitudeSegments = 16) {
    super();
    this.type = "EllipsoidGeometry";
    this.parameters = {
      radii,
      longitudeSegments,
      latitudeSegments
    };
    longitudeSegments = Math.max(3, Math.floor(longitudeSegments));
    latitudeSegments = Math.max(2, Math.floor(latitudeSegments));
    const elementCount = (longitudeSegments + 1) * (latitudeSegments + 1);
    const vertex = new Vector34();
    const normal = new Vector34();
    const vertices = new Float32Array(elementCount * 3);
    const normals = new Float32Array(elementCount * 3);
    const uvs = new Float32Array(elementCount * 2);
    const grid = [];
    const indices = [];
    for (let y = 0, vertexIndex = 0, uvIndex = 0, rowIndex = 0; y <= latitudeSegments; ++y) {
      const rowIndices = [];
      const v = y / latitudeSegments;
      const phi = v * Math.PI;
      let uOffset = 0;
      if (y === 0) {
        uOffset = 0.5 / longitudeSegments;
      } else if (y === latitudeSegments) {
        uOffset = -0.5 / longitudeSegments;
      }
      for (let x = 0; x <= longitudeSegments; ++x, vertexIndex += 3, uvIndex += 2, ++rowIndex) {
        const u = x / longitudeSegments;
        const theta = u * Math.PI * 2;
        vertex.x = radii.x * Math.cos(theta) * Math.sin(phi);
        vertex.y = radii.y * Math.sin(theta) * Math.sin(phi);
        vertex.z = radii.z * Math.cos(phi);
        vertices[vertexIndex] = vertex.x;
        vertices[vertexIndex + 1] = vertex.y;
        vertices[vertexIndex + 2] = vertex.z;
        normal.copy(vertex).normalize();
        normals[vertexIndex] = normal.x;
        normals[vertexIndex + 1] = normal.y;
        normals[vertexIndex + 2] = normal.z;
        uvs[uvIndex] = u + uOffset;
        uvs[uvIndex + 1] = 1 - v;
        rowIndices.push(rowIndex);
      }
      grid.push(rowIndices);
    }
    for (let y = 0; y < latitudeSegments; ++y) {
      for (let x = 0; x < longitudeSegments; ++x) {
        const a = grid[y][x + 1];
        const b = grid[y][x];
        const c = grid[y + 1][x];
        const d = grid[y + 1][x + 1];
        if (y !== 0) {
          indices.push(a, b, d);
        }
        if (y !== latitudeSegments - 1) {
          indices.push(b, c, d);
        }
      }
    }
    this.setIndex(indices);
    this.setAttribute("position", new BufferAttribute2(vertices, 3));
    this.setAttribute("normal", new BufferAttribute2(normals, 3));
    this.setAttribute("uv", new BufferAttribute2(uvs, 2));
  }
  copy(source) {
    super.copy(source);
    this.parameters = { ...source.parameters };
    return this;
  }
};

// source/geospatial/EXR3DLoader.ts
import { Data3DTexture as Data3DTexture2, Loader as Loader4 } from "three";
import { EXRLoader } from "three-stdlib";
var EXR3DLoader = class extends Loader4 {
  setDepth(value) {
    this.depth = value;
    return this;
  }
  load(url, onLoad, onProgress, onError) {
    const loader = new EXRLoader(this.manager);
    loader.setRequestHeader(this.requestHeader);
    loader.setPath(this.path);
    loader.setWithCredentials(this.withCredentials);
    loader.load(
      url,
      (exr) => {
        const { data, width, height } = exr.image;
        const depth2 = this.depth ?? Math.sqrt(height);
        const texture = new Data3DTexture2(data, width, height / depth2, depth2);
        texture.type = exr.type;
        texture.format = exr.format;
        texture.colorSpace = exr.colorSpace;
        texture.needsUpdate = true;
        try {
          onLoad(texture);
        } catch (error) {
          if (onError != null) {
            onError(error);
          } else {
            console.error(error);
          }
          this.manager.itemError(url);
        }
      },
      onProgress,
      onError
    );
  }
};

// source/geospatial/Geodetic.ts
import { Vector3 as Vector35 } from "three";
var vectorScratch12 = /* @__PURE__ */ new Vector35();
var vectorScratch22 = /* @__PURE__ */ new Vector35();
var Geodetic = class _Geodetic {
  constructor(longitude = 0, latitude = 0, height = 0) {
    this.longitude = longitude;
    this.latitude = latitude;
    this.height = height;
  }
  static {
    this.MIN_LONGITUDE = -Math.PI;
  }
  static {
    this.MAX_LONGITUDE = Math.PI;
  }
  static {
    this.MIN_LATITUDE = -Math.PI / 2;
  }
  static {
    this.MAX_LATITUDE = Math.PI / 2;
  }
  set(longitude, latitude, height) {
    this.longitude = longitude;
    this.latitude = latitude;
    if (height != null) {
      this.height = height;
    }
    return this;
  }
  clone() {
    return new _Geodetic(this.longitude, this.latitude, this.height);
  }
  copy(other) {
    this.longitude = other.longitude;
    this.latitude = other.latitude;
    this.height = other.height;
    return this;
  }
  equals(other) {
    return other.longitude === this.longitude && other.latitude === this.latitude && other.height === this.height;
  }
  setLongitude(value) {
    this.longitude = value;
    return this;
  }
  setLatitude(value) {
    this.latitude = value;
    return this;
  }
  setHeight(value) {
    this.height = value;
    return this;
  }
  normalize() {
    if (this.longitude < _Geodetic.MIN_LONGITUDE) {
      this.longitude += Math.PI * 2;
    }
    return this;
  }
  // See: https://en.wikipedia.org/wiki/Geographic_coordinate_conversion
  // Reference: https://github.com/CesiumGS/cesium/blob/1.122/packages/engine/Source/Core/Geodetic.js#L119
  setFromECEF(position, options) {
    const ellipsoid = options?.ellipsoid ?? Ellipsoid.WGS84;
    const reciprocalRadiiSquared = ellipsoid.reciprocalRadiiSquared(vectorScratch12);
    const projection = projectOnEllipsoidSurface(
      position,
      reciprocalRadiiSquared,
      vectorScratch22,
      options
    );
    if (projection == null) {
      throw new Error(
        `Could not project position to ellipsoid surface: ${position.toArray()}`
      );
    }
    const normal = vectorScratch12.multiplyVectors(projection, reciprocalRadiiSquared).normalize();
    this.longitude = Math.atan2(normal.y, normal.x);
    this.latitude = Math.asin(normal.z);
    const height = vectorScratch12.subVectors(position, projection);
    this.height = Math.sign(height.dot(position)) * height.length();
    return this;
  }
  // See: https://en.wikipedia.org/wiki/Geographic_coordinate_conversion
  // Reference: https://github.com/CesiumGS/cesium/blob/1.122/packages/engine/Source/Core/Cartesian3.js#L916
  toECEF(result = new Vector35(), options) {
    const ellipsoid = options?.ellipsoid ?? Ellipsoid.WGS84;
    const radiiSquared = vectorScratch12.multiplyVectors(
      ellipsoid.radii,
      ellipsoid.radii
    );
    const cosLatitude = Math.cos(this.latitude);
    const normal = vectorScratch22.set(
      cosLatitude * Math.cos(this.longitude),
      cosLatitude * Math.sin(this.longitude),
      Math.sin(this.latitude)
    ).normalize();
    result.multiplyVectors(radiiSquared, normal);
    return result.divideScalar(Math.sqrt(normal.dot(result))).add(normal.multiplyScalar(this.height));
  }
  fromArray(array, offset = 0) {
    this.longitude = array[offset];
    this.latitude = array[offset + 1];
    this.height = array[offset + 2];
    return this;
  }
  toArray(array = [], offset = 0) {
    array[offset] = this.longitude;
    array[offset + 1] = this.latitude;
    array[offset + 2] = this.height;
    return array;
  }
  *[Symbol.iterator]() {
    yield this.longitude;
    yield this.latitude;
    yield this.height;
  }
};

// source/geospatial/PointOfView.ts
import { Matrix4 as Matrix42, Quaternion, Ray, Vector3 as Vector36 } from "three";
var EPSILON = 1e-6;
var eastScratch = /* @__PURE__ */ new Vector36();
var northScratch = /* @__PURE__ */ new Vector36();
var upScratch = /* @__PURE__ */ new Vector36();
var vectorScratch13 = /* @__PURE__ */ new Vector36();
var vectorScratch23 = /* @__PURE__ */ new Vector36();
var vectorScratch32 = /* @__PURE__ */ new Vector36();
var matrixScratch = /* @__PURE__ */ new Matrix42();
var quaternionScratch = /* @__PURE__ */ new Quaternion();
var rayScratch = /* @__PURE__ */ new Ray();
var PointOfView = class _PointOfView {
  constructor(distance = 0, heading = 0, pitch = 0, roll = 0) {
    this.distance = distance;
    this.heading = heading;
    this.pitch = pitch;
    this.roll = roll;
  }
  get distance() {
    return this._distance;
  }
  set distance(value) {
    this._distance = Math.max(value, EPSILON);
  }
  get pitch() {
    return this._pitch;
  }
  set pitch(value) {
    this._pitch = clamp(value, -Math.PI / 2 + EPSILON, Math.PI / 2 - EPSILON);
  }
  set(distance, heading, pitch, roll) {
    this.distance = distance;
    this.heading = heading;
    this.pitch = pitch;
    if (roll != null) {
      this.roll = roll;
    }
    return this;
  }
  clone() {
    return new _PointOfView(this.distance, this.heading, this.pitch, this.roll);
  }
  copy(other) {
    this.distance = other.distance;
    this.heading = other.heading;
    this.pitch = other.pitch;
    this.roll = other.roll;
    return this;
  }
  equals(other) {
    return other.distance === this.distance && other.heading === this.heading && other.pitch === this.pitch && other.roll === this.roll;
  }
  decompose(target, eye, quaternion, up, ellipsoid = Ellipsoid.WGS84) {
    ellipsoid.getEastNorthUpVectors(
      target,
      eastScratch,
      northScratch,
      upScratch
    );
    up?.copy(upScratch);
    const offset = vectorScratch13.copy(eastScratch).multiplyScalar(Math.cos(this.heading)).add(
      vectorScratch23.copy(northScratch).multiplyScalar(Math.sin(this.heading))
    ).multiplyScalar(Math.cos(this.pitch)).add(vectorScratch23.copy(upScratch).multiplyScalar(Math.sin(this.pitch))).normalize().multiplyScalar(this.distance);
    eye.copy(target).sub(offset);
    if (this.roll !== 0) {
      const rollAxis = vectorScratch13.copy(target).sub(eye).normalize();
      upScratch.applyQuaternion(
        quaternionScratch.setFromAxisAngle(rollAxis, this.roll)
      );
    }
    quaternion.setFromRotationMatrix(
      matrixScratch.lookAt(eye, target, upScratch)
    );
  }
  setFromCamera(camera, ellipsoid = Ellipsoid.WGS84) {
    const eye = vectorScratch13.setFromMatrixPosition(camera.matrixWorld);
    const direction = vectorScratch23.set(0, 0, 0.5).unproject(camera).sub(eye).normalize();
    const target = ellipsoid.getIntersection(rayScratch.set(eye, direction));
    if (target == null) {
      return;
    }
    this.distance = eye.distanceTo(target);
    ellipsoid.getEastNorthUpVectors(
      target,
      eastScratch,
      northScratch,
      upScratch
    );
    this.heading = Math.atan2(
      northScratch.dot(direction),
      eastScratch.dot(direction)
    );
    this.pitch = Math.asin(upScratch.dot(direction));
    const up = vectorScratch13.copy(camera.up).applyQuaternion(camera.quaternion);
    const s = vectorScratch32.copy(direction).multiplyScalar(-up.dot(direction)).add(up).normalize();
    const t = vectorScratch13.copy(direction).multiplyScalar(-upScratch.dot(direction)).add(upScratch).normalize();
    const x = t.dot(s);
    const y = direction.dot(t.cross(s));
    this.roll = Math.atan2(y, x);
    return this;
  }
};

// source/geospatial/Rectangle.ts
var Rectangle = class _Rectangle {
  constructor(west = 0, south = 0, east = 0, north = 0) {
    this.west = west;
    this.south = south;
    this.east = east;
    this.north = north;
  }
  static {
    this.MAX = /* @__PURE__ */ new _Rectangle(
      Geodetic.MIN_LONGITUDE,
      Geodetic.MIN_LATITUDE,
      Geodetic.MAX_LONGITUDE,
      Geodetic.MAX_LATITUDE
    );
  }
  get width() {
    let east = this.east;
    if (east < this.west) {
      east += Math.PI * 2;
    }
    return east - this.west;
  }
  get height() {
    return this.north - this.south;
  }
  set(west, south, east, north) {
    this.west = west;
    this.south = south;
    this.east = east;
    this.north = north;
    return this;
  }
  clone() {
    return new _Rectangle(this.west, this.south, this.east, this.north);
  }
  copy(other) {
    this.west = other.west;
    this.south = other.south;
    this.east = other.east;
    this.north = other.north;
    return this;
  }
  equals(other) {
    return other.west === this.west && other.south === this.south && other.east === this.east && other.north === this.north;
  }
  at(x, y, result = new Geodetic()) {
    return result.set(
      this.west + (this.east - this.west) * x,
      this.north + (this.south - this.north) * y
    );
  }
  fromArray(array, offset = 0) {
    this.west = array[offset];
    this.south = array[offset + 1];
    this.east = array[offset + 2];
    this.north = array[offset + 3];
    return this;
  }
  toArray(array = [], offset = 0) {
    array[offset] = this.west;
    array[offset + 1] = this.south;
    array[offset + 2] = this.east;
    array[offset + 3] = this.north;
    return array;
  }
  *[Symbol.iterator]() {
    yield this.west;
    yield this.south;
    yield this.east;
    yield this.north;
  }
};

// source/geospatial/resolveIncludes.ts
var includePattern = /^[ \t]*#include +"([\w\d./]+)"/gm;
function resolveIncludes(source, includes) {
  return source.replace(includePattern, (match, path) => {
    const components = path.split("/");
    const include = components.reduce(
      (parent, component) => typeof parent !== "string" && parent != null ? parent[component] : void 0,
      includes
    );
    if (typeof include !== "string") {
      throw new Error(`Could not find include for ${path}.`);
    }
    return resolveIncludes(include, includes);
  });
}

// source/geospatial/STBNLoader.ts
import { NearestFilter, RedFormat, RepeatWrapping } from "three";

// source/geospatial/typedArrayParsers.ts
import { Float16Array as Float16Array2, getFloat16 } from "@petamoriken/float16";
var hostLittleEndian;
function isHostLittleEndian() {
  if (hostLittleEndian != null) {
    return hostLittleEndian;
  }
  const a = new Uint32Array([268435456]);
  const b = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
  hostLittleEndian = b[0] === 0;
  return hostLittleEndian;
}
function parseTypedArray(buffer, TypedArray, getValue, littleEndian = true) {
  if (littleEndian === isHostLittleEndian()) {
    return new TypedArray(buffer);
  }
  const data = Object.assign(new DataView(buffer), {
    getFloat16(byteOffset, littleEndian2) {
      return getFloat16(this, byteOffset, littleEndian2);
    }
  });
  const array = new TypedArray(data.byteLength / TypedArray.BYTES_PER_ELEMENT);
  for (let index = 0, byteIndex = 0; index < array.length; ++index, byteIndex += TypedArray.BYTES_PER_ELEMENT) {
    array[index] = data[getValue](byteIndex, littleEndian);
  }
  return array;
}
var parseUint8Array = (buffer) => new Uint8Array(buffer);
var parseInt8Array = (buffer) => new Int8Array(buffer);
var parseUint16Array = (buffer, littleEndian) => parseTypedArray(buffer, Uint16Array, "getUint16", littleEndian);
var parseInt16Array = (buffer, littleEndian) => parseTypedArray(buffer, Int16Array, "getInt16", littleEndian);
var parseInt32Array = (buffer, littleEndian) => parseTypedArray(buffer, Int32Array, "getInt32", littleEndian);
var parseUint32Array = (buffer, littleEndian) => parseTypedArray(buffer, Uint32Array, "getUint32", littleEndian);
var parseFloat16Array = (buffer, littleEndian) => parseTypedArray(buffer, Float16Array2, "getFloat16", littleEndian);
var parseFloat32Array = (buffer, littleEndian) => parseTypedArray(buffer, Float32Array, "getFloat32", littleEndian);
var parseFloat64Array = (buffer, littleEndian) => parseTypedArray(buffer, Float64Array, "getFloat64", littleEndian);

// source/geospatial/STBNLoader.ts
var STBNLoader = createData3DTextureLoaderClass(parseUint8Array, {
  format: RedFormat,
  minFilter: NearestFilter,
  magFilter: NearestFilter,
  wrapS: RepeatWrapping,
  wrapT: RepeatWrapping,
  wrapR: RepeatWrapping,
  width: STBN_TEXTURE_WIDTH,
  height: STBN_TEXTURE_HEIGHT,
  depth: STBN_TEXTURE_DEPTH
});

// source/geospatial/TileCoordinate.ts
function* traverseChildren(x, y, z, maxZ, result) {
  if (z >= maxZ) {
    return;
  }
  const divisor = 2 ** z;
  const nextZ = z + 1;
  const scale = 2 ** nextZ;
  const nextX = Math.floor(x / divisor * scale);
  const nextY = Math.floor(y / divisor * scale);
  const children = [
    [nextX, nextY, nextZ],
    [nextX + 1, nextY, nextZ],
    [nextX, nextY + 1, nextZ],
    [nextX + 1, nextY + 1, nextZ]
  ];
  if (nextZ < maxZ) {
    for (const child of children) {
      for (const coord of traverseChildren(...child, maxZ, result)) {
        yield coord;
      }
    }
  } else {
    for (const child of children) {
      yield (result ?? new TileCoordinate()).set(...child);
    }
  }
}
var TileCoordinate = class _TileCoordinate {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  set(x, y, z) {
    this.x = x;
    this.y = y;
    if (z != null) {
      this.z = z;
    }
    return this;
  }
  clone() {
    return new _TileCoordinate(this.x, this.y, this.z);
  }
  copy(other) {
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
    return this;
  }
  equals(other) {
    return other.x === this.x && other.y === this.y && other.z === this.z;
  }
  getParent(result = new _TileCoordinate()) {
    const divisor = 2 ** this.z;
    const x = this.x / divisor;
    const y = this.y / divisor;
    const z = this.z - 1;
    const scale = 2 ** z;
    return result.set(Math.floor(x * scale), Math.floor(y * scale), z);
  }
  *traverseChildren(depth2, result) {
    const { x, y, z } = this;
    for (const coord of traverseChildren(x, y, z, z + depth2, result)) {
      yield coord;
    }
  }
  fromArray(array, offset = 0) {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    return this;
  }
  toArray(array = [], offset = 0) {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    return array;
  }
  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
    yield this.z;
  }
};

// source/geospatial/TilingScheme.ts
import { Vector2 } from "three";
var vectorScratch4 = /* @__PURE__ */ new Vector2();
var TilingScheme = class _TilingScheme {
  constructor(width = 2, height = 1, rectangle = Rectangle.MAX) {
    this.width = width;
    this.height = height;
    this.rectangle = rectangle;
  }
  clone() {
    return new _TilingScheme(this.width, this.height, this.rectangle.clone());
  }
  copy(other) {
    this.width = other.width;
    this.height = other.height;
    this.rectangle.copy(other.rectangle);
    return this;
  }
  getSize(z, result = new Vector2()) {
    return result.set(this.width << z, this.height << z);
  }
  // Reference: https://github.com/CesiumGS/cesium/blob/1.122/packages/engine/Source/Core/GeographicTilingScheme.js#L210
  getTile(geodetic, z, result = new TileCoordinate()) {
    const size = this.getSize(z, vectorScratch4);
    const { rectangle } = this;
    const width = rectangle.width / size.x;
    const height = rectangle.height / size.y;
    const { west, south, east } = rectangle;
    let longitude = geodetic.longitude;
    if (east < west) {
      longitude += Math.PI * 2;
    }
    let x = Math.floor((longitude - west) / width);
    if (x >= size.x) {
      x = size.x - 1;
    }
    let y = Math.floor((geodetic.latitude - south) / height);
    if (y >= size.y) {
      y = size.y - 1;
    }
    result.x = x;
    result.y = y;
    result.z = z;
    return result;
  }
  // Reference: https://github.com/CesiumGS/cesium/blob/1.122/packages/engine/Source/Core/GeographicTilingScheme.js#L169
  getRectangle(tile, result = new Rectangle()) {
    const size = this.getSize(tile.z, vectorScratch4);
    const { rectangle } = this;
    const width = rectangle.width / size.x;
    const height = rectangle.height / size.y;
    const { west, north } = rectangle;
    result.west = tile.x * width + west;
    result.east = (tile.x + 1) * width + west;
    result.north = north - (size.y - tile.y - 1) * height;
    result.south = north - (size.y - tile.y) * height;
    return result;
  }
};

// source/geospatial/unrollLoops.ts
var unrollLoopPattern = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*(?:i\s*\+\+|\+\+\s*i)\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function loopReplacer(match, start, end, snippet) {
  let string = "";
  for (let i = parseInt(start); i < parseInt(end); ++i) {
    string += snippet.replace(/\[\s*i\s*\]/g, "[" + i + "]").replace(/UNROLLED_LOOP_INDEX/g, `${i}`);
  }
  return string;
}
function unrollLoops(string) {
  return string.replace(unrollLoopPattern, loopReplacer);
}

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\geospatial\shaders\cascadedShadowMaps.glsl
var cascadedShadowMaps_default = `// Reference: https://github.com/mrdoob/three.js/blob/r171/examples/jsm/csm/CSMShader.js\r
\r
#ifndef SHADOW_CASCADE_COUNT\r
#error "SHADOW_CASCADE_COUNT macro must be defined."\r
#endif // SHADOW_CASCADE_COUNT\r
\r
int getCascadeIndex(\r
  const mat4 viewMatrix,\r
  const vec3 worldPosition,\r
  const vec2 intervals[SHADOW_CASCADE_COUNT],\r
  const float near,\r
  const float far\r
) {\r
  vec4 viewPosition = viewMatrix * vec4(worldPosition, 1.0);\r
  float depth = viewZToOrthographicDepth(viewPosition.z, near, far);\r
  vec2 interval;\r
  #pragma unroll_loop_start\r
  for (int i = 0; i < 4; ++i) {\r
    #if UNROLLED_LOOP_INDEX < SHADOW_CASCADE_COUNT\r
    interval = intervals[i];\r
    if (depth >= interval.x && depth < interval.y) {\r
      return UNROLLED_LOOP_INDEX;\r
    }\r
    #endif // UNROLLED_LOOP_INDEX < SHADOW_CASCADE_COUNT\r
  }\r
  #pragma unroll_loop_end\r
  return SHADOW_CASCADE_COUNT - 1;\r
}\r
\r
int getFadedCascadeIndex(\r
  const mat4 viewMatrix,\r
  const vec3 worldPosition,\r
  const vec2 intervals[SHADOW_CASCADE_COUNT],\r
  const float near,\r
  const float far,\r
  const float jitter\r
) {\r
  vec4 viewPosition = viewMatrix * vec4(worldPosition, 1.0);\r
  float depth = viewZToOrthographicDepth(viewPosition.z, near, far);\r
\r
  vec2 interval;\r
  float intervalCenter;\r
  float closestEdge;\r
  float margin;\r
  int nextIndex = -1;\r
  int prevIndex = -1;\r
  float alpha;\r
\r
  #pragma unroll_loop_start\r
  for (int i = 0; i < 4; ++i) {\r
    #if UNROLLED_LOOP_INDEX < SHADOW_CASCADE_COUNT\r
    interval = intervals[i];\r
    intervalCenter = (interval.x + interval.y) * 0.5;\r
    closestEdge = depth < intervalCenter ? interval.x : interval.y;\r
    margin = closestEdge * closestEdge * 0.5;\r
    interval += margin * vec2(-0.5, 0.5);\r
\r
    #if UNROLLED_LOOP_INDEX < SHADOW_CASCADE_COUNT - 1\r
    if (depth >= interval.x && depth < interval.y) {\r
      prevIndex = nextIndex;\r
      nextIndex = UNROLLED_LOOP_INDEX;\r
      alpha = saturate(min(depth - interval.x, interval.y - depth) / margin);\r
    }\r
    #else // UNROLLED_LOOP_INDEX < SHADOW_CASCADE_COUNT - 1\r
    // Don't fade out the last cascade.\r
    if (depth >= interval.x) {\r
      prevIndex = nextIndex;\r
      nextIndex = UNROLLED_LOOP_INDEX;\r
      alpha = saturate((depth - interval.x) / margin);\r
    }\r
    #endif // UNROLLED_LOOP_INDEX < SHADOW_CASCADE_COUNT - 1\r
    #endif // UNROLLED_LOOP_INDEX < SHADOW_CASCADE_COUNT\r
  }\r
  #pragma unroll_loop_end\r
\r
  return jitter <= alpha\r
    ? nextIndex\r
    : prevIndex;\r
}\r
`;

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\geospatial\shaders\depth.glsl
var depth_default = "// cSpell:words logdepthbuf\r\n\r\nfloat reverseLogDepth(const float depth, const float near, const float far) {\r\n  #ifdef USE_LOGDEPTHBUF\r\n  float d = pow(2.0, depth * log2(far + 1.0)) - 1.0;\r\n  float a = far / (far - near);\r\n  float b = far * near / (near - far);\r\n  return a + b / d;\r\n  #else // USE_LOGDEPTHBUF\r\n  return depth;\r\n  #endif // USE_LOGDEPTHBUF\r\n}\r\n\r\nfloat linearizeDepth(const float depth, const float near, const float far) {\r\n  float ndc = depth * 2.0 - 1.0;\r\n  return 2.0 * near * far / (far + near - ndc * (far - near));\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\geospatial\shaders\generators.glsl
var generators_default = "float checker(const vec2 uv, const vec2 repeats) {\r\n  vec2 c = floor(repeats * uv);\r\n  float result = mod(c.x + c.y, 2.0);\r\n  return sign(result);\r\n}\r\n\r\nfloat checker(const vec2 uv, const float repeats) {\r\n  return checker(uv, vec2(repeats));\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\geospatial\shaders\interleavedGradientNoise.glsl
var interleavedGradientNoise_default = "// Reference: https://advances.realtimerendering.com/s2014/index.html#_NEXT_GENERATION_POST\r\n\r\nfloat interleavedGradientNoise(const vec2 coord) {\r\n  const vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);\r\n  return fract(magic.z * fract(dot(coord, magic.xy)));\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\geospatial\shaders\math.glsl
var math_default = "#if !defined(saturate)\r\n#define saturate(a) clamp(a, 0.0, 1.0)\r\n#endif // !defined(saturate)\r\n\r\nfloat remap(const float x, const float min1, const float max1, const float min2, const float max2) {\r\n  return min2 + (x - min1) / (max1 - min1) * (max2 - min2);\r\n}\r\n\r\nvec2 remap(const vec2 x, const vec2 min1, const vec2 max1, const vec2 min2, const vec2 max2) {\r\n  return min2 + (x - min1) / (max1 - min1) * (max2 - min2);\r\n}\r\n\r\nvec3 remap(const vec3 x, const vec3 min1, const vec3 max1, const vec3 min2, const vec3 max2) {\r\n  return min2 + (x - min1) / (max1 - min1) * (max2 - min2);\r\n}\r\n\r\nvec4 remap(const vec4 x, const vec4 min1, const vec4 max1, const vec4 min2, const vec4 max2) {\r\n  return min2 + (x - min1) / (max1 - min1) * (max2 - min2);\r\n}\r\n\r\nfloat remapClamped(\r\n  const float x,\r\n  const float min1,\r\n  const float max1,\r\n  const float min2,\r\n  const float max2\r\n) {\r\n  return clamp(min2 + (x - min1) / (max1 - min1) * (max2 - min2), min2, max2);\r\n}\r\n\r\nvec2 remapClamped(\r\n  const vec2 x,\r\n  const vec2 min1,\r\n  const vec2 max1,\r\n  const vec2 min2,\r\n  const vec2 max2\r\n) {\r\n  return clamp(min2 + (x - min1) / (max1 - min1) * (max2 - min2), min2, max2);\r\n}\r\n\r\nvec3 remapClamped(\r\n  const vec3 x,\r\n  const vec3 min1,\r\n  const vec3 max1,\r\n  const vec3 min2,\r\n  const vec3 max2\r\n) {\r\n  return clamp(min2 + (x - min1) / (max1 - min1) * (max2 - min2), min2, max2);\r\n}\r\n\r\nvec4 remapClamped(\r\n  const vec4 x,\r\n  const vec4 min1,\r\n  const vec4 max1,\r\n  const vec4 min2,\r\n  const vec4 max2\r\n) {\r\n  return clamp(min2 + (x - min1) / (max1 - min1) * (max2 - min2), min2, max2);\r\n}\r\n\r\n// Implicitly remap to 0 and 1\r\nfloat remap(const float x, const float min1, const float max1) {\r\n  return (x - min1) / (max1 - min1);\r\n}\r\n\r\nvec2 remap(const vec2 x, const vec2 min1, const vec2 max1) {\r\n  return (x - min1) / (max1 - min1);\r\n}\r\n\r\nvec3 remap(const vec3 x, const vec3 min1, const vec3 max1) {\r\n  return (x - min1) / (max1 - min1);\r\n}\r\n\r\nvec4 remap(const vec4 x, const vec4 min1, const vec4 max1) {\r\n  return (x - min1) / (max1 - min1);\r\n}\r\n\r\nfloat remapClamped(const float x, const float min1, const float max1) {\r\n  return saturate((x - min1) / (max1 - min1));\r\n}\r\n\r\nvec2 remapClamped(const vec2 x, const vec2 min1, const vec2 max1) {\r\n  return saturate((x - min1) / (max1 - min1));\r\n}\r\n\r\nvec3 remapClamped(const vec3 x, const vec3 min1, const vec3 max1) {\r\n  return saturate((x - min1) / (max1 - min1));\r\n}\r\n\r\nvec4 remapClamped(const vec4 x, const vec4 min1, const vec4 max1) {\r\n  return saturate((x - min1) / (max1 - min1));\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\geospatial\shaders\packing.glsl
var packing_default = "// Reference: https://jcgt.org/published/0003/02/01/paper.pdf\r\n\r\nvec2 signNotZero(vec2 v) {\r\n  return vec2(v.x >= 0.0 ? 1.0 : -1.0, v.y >= 0.0 ? 1.0 : -1.0);\r\n}\r\n\r\nvec2 packNormalToVec2(vec3 v) {\r\n  vec2 p = v.xy * (1.0 / (abs(v.x) + abs(v.y) + abs(v.z)));\r\n  return v.z <= 0.0\r\n    ? (1.0 - abs(p.yx)) * signNotZero(p)\r\n    : p;\r\n}\r\n\r\nvec3 unpackVec2ToNormal(vec2 e) {\r\n  vec3 v = vec3(e.xy, 1.0 - abs(e.x) - abs(e.y));\r\n  if (v.z < 0.0) {\r\n    v.xy = (1.0 - abs(v.yx)) * signNotZero(v.xy);\r\n  }\r\n  return normalize(v);\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\geospatial\shaders\raySphereIntersection.glsl
var raySphereIntersection_default = "float raySphereFirstIntersection(\r\n  const vec3 origin,\r\n  const vec3 direction,\r\n  const vec3 center,\r\n  const float radius\r\n) {\r\n  vec3 a = origin - center;\r\n  float b = 2.0 * dot(direction, a);\r\n  float c = dot(a, a) - radius * radius;\r\n  float discriminant = b * b - 4.0 * c;\r\n  return discriminant < 0.0\r\n    ? -1.0\r\n    : (-b - sqrt(discriminant)) * 0.5;\r\n}\r\n\r\nfloat raySphereFirstIntersection(const vec3 origin, const vec3 direction, const float radius) {\r\n  return raySphereFirstIntersection(origin, direction, vec3(0.0), radius);\r\n}\r\n\r\nvec4 raySphereFirstIntersection(\r\n  const vec3 origin,\r\n  const vec3 direction,\r\n  const vec3 center,\r\n  const vec4 radius\r\n) {\r\n  vec3 a = origin - center;\r\n  float b = 2.0 * dot(direction, a);\r\n  vec4 c = dot(a, a) - radius * radius;\r\n  vec4 discriminant = b * b - 4.0 * c;\r\n  vec4 mask = step(discriminant, vec4(0.0));\r\n  return mix((-b - sqrt(max(vec4(0.0), discriminant))) * 0.5, vec4(-1.0), mask);\r\n}\r\n\r\nvec4 raySphereFirstIntersection(const vec3 origin, const vec3 direction, const vec4 radius) {\r\n  return raySphereFirstIntersection(origin, direction, vec3(0.0), radius);\r\n}\r\n\r\nfloat raySphereSecondIntersection(\r\n  const vec3 origin,\r\n  const vec3 direction,\r\n  const vec3 center,\r\n  const float radius\r\n) {\r\n  vec3 a = origin - center;\r\n  float b = 2.0 * dot(direction, a);\r\n  float c = dot(a, a) - radius * radius;\r\n  float discriminant = b * b - 4.0 * c;\r\n  return discriminant < 0.0\r\n    ? -1.0\r\n    : (-b + sqrt(discriminant)) * 0.5;\r\n}\r\n\r\nfloat raySphereSecondIntersection(const vec3 origin, const vec3 direction, const float radius) {\r\n  return raySphereSecondIntersection(origin, direction, vec3(0.0), radius);\r\n}\r\n\r\nvec4 raySphereSecondIntersection(\r\n  const vec3 origin,\r\n  const vec3 direction,\r\n  const vec3 center,\r\n  const vec4 radius\r\n) {\r\n  vec3 a = origin - center;\r\n  float b = 2.0 * dot(direction, a);\r\n  vec4 c = dot(a, a) - radius * radius;\r\n  vec4 discriminant = b * b - 4.0 * c;\r\n  vec4 mask = step(discriminant, vec4(0.0));\r\n  return mix((-b + sqrt(max(vec4(0.0), discriminant))) * 0.5, vec4(-1.0), mask);\r\n}\r\n\r\nvec4 raySphereSecondIntersection(const vec3 origin, const vec3 direction, const vec4 radius) {\r\n  return raySphereSecondIntersection(origin, direction, vec3(0.0), radius);\r\n}\r\n\r\nvoid raySphereIntersections(\r\n  const vec3 origin,\r\n  const vec3 direction,\r\n  const vec3 center,\r\n  const float radius,\r\n  out float intersection1,\r\n  out float intersection2\r\n) {\r\n  vec3 a = origin - center;\r\n  float b = 2.0 * dot(direction, a);\r\n  float c = dot(a, a) - radius * radius;\r\n  float discriminant = b * b - 4.0 * c;\r\n  if (discriminant < 0.0) {\r\n    intersection1 = -1.0;\r\n    intersection2 = -1.0;\r\n    return;\r\n  } else {\r\n    float Q = sqrt(discriminant);\r\n    intersection1 = (-b - Q) * 0.5;\r\n    intersection2 = (-b + Q) * 0.5;\r\n  }\r\n}\r\n\r\nvoid raySphereIntersections(\r\n  const vec3 origin,\r\n  const vec3 direction,\r\n  const float radius,\r\n  out float intersection1,\r\n  out float intersection2\r\n) {\r\n  raySphereIntersections(origin, direction, vec3(0.0), radius, intersection1, intersection2);\r\n}\r\n\r\nvoid raySphereIntersections(\r\n  const vec3 origin,\r\n  const vec3 direction,\r\n  const vec3 center,\r\n  const vec4 radius,\r\n  out vec4 intersection1,\r\n  out vec4 intersection2\r\n) {\r\n  vec3 a = origin - center;\r\n  float b = 2.0 * dot(direction, a);\r\n  vec4 c = dot(a, a) - radius * radius;\r\n  vec4 discriminant = b * b - 4.0 * c;\r\n  vec4 mask = step(discriminant, vec4(0.0));\r\n  vec4 Q = sqrt(max(vec4(0.0), discriminant));\r\n  intersection1 = mix((-b - Q) * 0.5, vec4(-1.0), mask);\r\n  intersection2 = mix((-b + Q) * 0.5, vec4(-1.0), mask);\r\n}\r\n\r\nvoid raySphereIntersections(\r\n  const vec3 origin,\r\n  const vec3 direction,\r\n  const vec4 radius,\r\n  out vec4 intersection1,\r\n  out vec4 intersection2\r\n) {\r\n  raySphereIntersections(origin, direction, vec3(0.0), radius, intersection1, intersection2);\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\geospatial\shaders\transform.glsl
var transform_default = "vec3 screenToView(\r\n  const vec2 uv,\r\n  const float depth,\r\n  const float viewZ,\r\n  const mat4 projectionMatrix,\r\n  const mat4 inverseProjectionMatrix\r\n) {\r\n  vec4 clip = vec4(vec3(uv, depth) * 2.0 - 1.0, 1.0);\r\n  float clipW = projectionMatrix[2][3] * viewZ + projectionMatrix[3][3];\r\n  clip *= clipW;\r\n  return (inverseProjectionMatrix * clip).xyz;\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\geospatial\shaders\turbo.glsl
var turbo_default = "// A fifth-order polynomial approximation of Turbo color map.\r\n// See: https://observablehq.com/@mbostock/turbo\r\n// prettier-ignore\r\nvec3 turbo(const float x) {\r\n  float r = 0.1357 + x * (4.5974 - x * (42.3277 - x * (130.5887 - x * (150.5666 - x * 58.1375))));\r\n  float g = 0.0914 + x * (2.1856 + x * (4.8052 - x * (14.0195 - x * (4.2109 + x * 2.7747))));\r\n  float b = 0.1067 + x * (12.5925 - x * (60.1097 - x * (109.0745 - x * (88.5066 - x * 26.8183))));\r\n  return vec3(r, g, b);\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\geospatial\shaders\vogelDisk.glsl
var vogelDisk_default = "// Reference: https://www.gamedev.net/tutorials/programming/graphics/contact-hardening-soft-shadows-made-fast-r4906/\r\n\r\nvec2 vogelDisk(const int index, const int sampleCount, const float phi) {\r\n  const float goldenAngle = 2.39996322972865332;\r\n  float r = sqrt(float(index) + 0.5) / sqrt(float(sampleCount));\r\n  float theta = float(index) * goldenAngle + phi;\r\n  return r * vec2(cos(theta), sin(theta));\r\n}\r\n";

// source/geospatial/shaders/index.ts
var cascadedShadowMaps = cascadedShadowMaps_default;
var depth = depth_default;
var generators = generators_default;
var interleavedGradientNoise = interleavedGradientNoise_default;
var math = math_default;
var packing = packing_default;
var raySphereIntersection = raySphereIntersection_default;
var transform = transform_default;
var turbo = turbo_default;
var vogelDisk = vogelDisk_default;

// source/atmosphere/AtmosphereParameters.ts
import { Vector3 as Vector37 } from "three";
var paramKeys2 = [
  "solarIrradiance",
  "sunAngularRadius",
  "bottomRadius",
  "topRadius",
  "rayleighScattering",
  "mieScattering",
  "miePhaseFunctionG",
  "muSMin",
  "skyRadianceToLuminance",
  "sunRadianceToLuminance",
  "luminousEfficiency"
];
function applyOptions2(target, params) {
  if (params == null) {
    return;
  }
  for (const key of paramKeys2) {
    const value = params[key];
    if (value == null) {
      continue;
    }
    if (target[key] instanceof Vector37) {
      target[key].copy(value);
    } else {
      ;
      target[key] = value;
    }
  }
}
var AtmosphereParameters = class _AtmosphereParameters {
  constructor(options) {
    this.solarIrradiance = new Vector37(1.474, 1.8504, 1.91198);
    this.sunAngularRadius = 4675e-6;
    this.bottomRadius = 636e4;
    this.topRadius = 642e4;
    this.rayleighScattering = new Vector37(5802e-6, 0.013558, 0.0331);
    this.mieScattering = new Vector37(3996e-6, 3996e-6, 3996e-6);
    this.miePhaseFunctionG = 0.8;
    this.muSMin = Math.cos(radians(120));
    // Radiance to luminance conversion
    // prettier-ignore
    this.skyRadianceToLuminance = new Vector37(114974.916437, 71305.954816, 65310.548555);
    this.sunRadianceToLuminance = new Vector37(98242.786222, 69954.398112, 66475.012354);
    this.luminousEfficiency = new Vector37(0.2126, 0.7152, 0.0722);
    this.skyRadianceToRelativeLuminance = new Vector37();
    this.sunRadianceToRelativeLuminance = new Vector37();
    applyOptions2(this, options);
    const luminance = this.luminousEfficiency.dot(this.skyRadianceToLuminance);
    this.skyRadianceToRelativeLuminance.copy(this.skyRadianceToLuminance).divideScalar(luminance);
    this.sunRadianceToRelativeLuminance.copy(this.sunRadianceToLuminance).divideScalar(luminance);
  }
  static {
    this.DEFAULT = /* @__PURE__ */ new _AtmosphereParameters();
  }
};

// source/atmosphere/constants.ts
var IRRADIANCE_TEXTURE_WIDTH = 64;
var IRRADIANCE_TEXTURE_HEIGHT = 16;
var SCATTERING_TEXTURE_R_SIZE = 32;
var SCATTERING_TEXTURE_MU_SIZE = 128;
var SCATTERING_TEXTURE_MU_S_SIZE = 32;
var SCATTERING_TEXTURE_NU_SIZE = 8;
var SCATTERING_TEXTURE_WIDTH = SCATTERING_TEXTURE_NU_SIZE * SCATTERING_TEXTURE_MU_S_SIZE;
var SCATTERING_TEXTURE_HEIGHT = SCATTERING_TEXTURE_MU_SIZE;
var SCATTERING_TEXTURE_DEPTH = SCATTERING_TEXTURE_R_SIZE;
var TRANSMITTANCE_TEXTURE_WIDTH = 256;
var TRANSMITTANCE_TEXTURE_HEIGHT = 64;
var METER_TO_LENGTH_UNIT = 1 / 1e3;
var SKY_RENDER_ORDER = 100;
var ref2 = "82e00c5222d6cbc222af69abdf6d3f4fc9f63030";
var DEFAULT_PRECOMPUTED_TEXTURES_URL = `https://media.githubusercontent.com/media/takram-design-engineering/three-geospatial/${ref2}/packages/atmosphere/assets`;
var DEFAULT_STARS_DATA_URL = `https://media.githubusercontent.com/media/takram-design-engineering/three-geospatial/${ref2}/packages/atmosphere/assets/stars.bin`;

// source/atmosphere/getAltitudeCorrectionOffset.ts
import { Vector3 as Vector38 } from "three";
var vectorScratch5 = /* @__PURE__ */ new Vector38();
function getAltitudeCorrectionOffset(cameraPosition, bottomRadius, ellipsoid, result, clipToSurface = true) {
  const surfacePosition = ellipsoid.projectOnSurface(
    cameraPosition,
    vectorScratch5
  );
  return surfacePosition != null ? ellipsoid.getOsculatingSphereCenter(
    // Move the center of the atmosphere's inner sphere down to intersect
    // the viewpoint when it's located underground.
    !clipToSurface || surfacePosition.lengthSq() < cameraPosition.lengthSq() ? surfacePosition : cameraPosition,
    bottomRadius,
    result
  ) : result.setScalar(0);
}

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\atmosphere\shaders\aerialPerspectiveEffect.frag
var aerialPerspectiveEffect_default = `precision highp sampler2DArray;\r
\r
#include "core/depth"\r
#include "core/math"\r
#include "core/packing"\r
#include "core/transform"\r
#ifdef HAS_SHADOW\r
#include "core/raySphereIntersection"\r
#include "core/cascadedShadowMaps"\r
#include "core/interleavedGradientNoise"\r
#include "core/vogelDisk"\r
#endif // HAS_SHADOW\r
#include "parameters"\r
#include "functions"\r
#include "sky"\r
\r
uniform sampler2D normalBuffer;\r
\r
uniform mat4 projectionMatrix;\r
uniform mat4 viewMatrix;\r
uniform mat4 inverseProjectionMatrix;\r
uniform mat4 inverseViewMatrix;\r
uniform float bottomRadius;\r
uniform vec3 ellipsoidCenter;\r
uniform mat4 inverseEllipsoidMatrix;\r
uniform vec3 sunDirection;\r
uniform vec3 moonDirection;\r
uniform float moonAngularRadius;\r
uniform float lunarRadianceScale;\r
uniform float irradianceScale;\r
uniform float idealSphereAlpha;\r
\r
#ifdef HAS_IRRADIANCE_MASK\r
uniform sampler2D irradianceMaskBuffer;\r
#endif // HAS_IRRADIANCE_MASK\r
\r
// prettier-ignore\r
#define IRRADIANCE_MASK_CHANNEL_ IRRADIANCE_MASK_CHANNEL\r
\r
#ifdef HAS_OVERLAY\r
uniform sampler2D overlayBuffer;\r
#endif // HAS_OVERLAY\r
\r
#ifdef HAS_SHADOW\r
uniform sampler2DArray shadowBuffer;\r
uniform vec2 shadowIntervals[SHADOW_CASCADE_COUNT];\r
uniform mat4 shadowMatrices[SHADOW_CASCADE_COUNT];\r
uniform mat4 inverseShadowMatrices[SHADOW_CASCADE_COUNT];\r
uniform float shadowFar;\r
uniform float shadowTopHeight;\r
uniform float shadowRadius;\r
uniform sampler3D stbnTexture;\r
uniform int frame;\r
#endif // HAS_SHADOW\r
\r
#ifdef HAS_SHADOW_LENGTH\r
uniform sampler2D shadowLengthBuffer;\r
#endif // HAS_SHADOW_LENGTH\r
\r
varying vec3 vCameraPosition;\r
varying vec3 vRayDirection;\r
varying vec3 vEllipsoidCenter;\r
varying vec3 vGeometryEllipsoidCenter;\r
varying vec3 vEllipsoidRadiiSquared;\r
\r
vec3 readNormal(const vec2 uv) {\r
  #ifdef OCT_ENCODED_NORMAL\r
  return unpackVec2ToNormal(texture(normalBuffer, uv).xy);\r
  #else // OCT_ENCODED_NORMAL\r
  return 2.0 * texture(normalBuffer, uv).xyz - 1.0;\r
  #endif // OCT_ENCODED_NORMAL\r
}\r
\r
void correctGeometricError(inout vec3 positionECEF, inout vec3 normalECEF) {\r
  // TODO: The error is pronounced at the edge of the ellipsoid due to the\r
  // large difference between the sphere position and the unprojected position\r
  // at the current fragment. Calculating the sphere position from the fragment\r
  // UV may resolve this.\r
\r
  // Correct way is slerp, but this will be small-angle interpolation anyways.\r
  vec3 sphereNormal = normalize(positionECEF / vEllipsoidRadiiSquared);\r
  vec3 spherePosition = u_bottom_radius * sphereNormal;\r
  normalECEF = mix(normalECEF, sphereNormal, idealSphereAlpha);\r
  positionECEF = mix(positionECEF, spherePosition, idealSphereAlpha);\r
}\r
\r
#if defined(SUN_IRRADIANCE) || defined(SKY_IRRADIANCE)\r
\r
vec3 getSunSkyIrradiance(\r
  const vec3 positionECEF,\r
  const vec3 normal,\r
  const vec3 inputColor,\r
  const float sunTransmittance\r
) {\r
  // Assume lambertian BRDF. If both SUN_IRRADIANCE and SKY_IRRADIANCE are not\r
  // defined, regard the inputColor as radiance at the texel.\r
  vec3 albedo = inputColor * irradianceScale * RECIPROCAL_PI;\r
  vec3 skyIrradiance;\r
  vec3 sunIrradiance = GetSunAndSkyIrradiance(positionECEF, normal, sunDirection, skyIrradiance);\r
\r
  #ifdef HAS_SHADOW\r
  sunIrradiance *= sunTransmittance;\r
  #endif // HAS_SHADOW\r
\r
  #if defined(SUN_IRRADIANCE) && defined(SKY_IRRADIANCE)\r
  return albedo * (sunIrradiance + skyIrradiance);\r
  #elif defined(SUN_IRRADIANCE)\r
  return albedo * sunIrradiance;\r
  #elif defined(SKY_IRRADIANCE)\r
  return albedo * skyIrradiance;\r
  #endif // defined(SUN_IRRADIANCE) && defined(SKY_IRRADIANCE)\r
}\r
\r
#endif // defined(SUN_IRRADIANCE) || defined(SKY_IRRADIANCE)\r
\r
#if defined(TRANSMITTANCE) || defined(INSCATTER)\r
\r
void applyTransmittanceInscatter(const vec3 positionECEF, float shadowLength, inout vec3 radiance) {\r
  vec3 transmittance;\r
  vec3 inscatter = GetSkyRadianceToPoint(\r
    vCameraPosition - vGeometryEllipsoidCenter,\r
    positionECEF,\r
    shadowLength,\r
    sunDirection,\r
    transmittance\r
  );\r
  #ifdef TRANSMITTANCE\r
  radiance = radiance * transmittance;\r
  #endif // TRANSMITTANCE\r
  #ifdef INSCATTER\r
  radiance = radiance + inscatter;\r
  #endif // INSCATTER\r
}\r
\r
#endif // defined(TRANSMITTANCE) || defined(INSCATTER)\r
\r
#ifdef HAS_SHADOW\r
\r
float getSTBN() {\r
  ivec3 size = textureSize(stbnTexture, 0);\r
  vec3 scale = 1.0 / vec3(size);\r
  return texture(stbnTexture, vec3(gl_FragCoord.xy, float(frame % size.z)) * scale).r;\r
}\r
\r
vec2 getShadowUv(const vec3 worldPosition, const int cascadeIndex) {\r
  vec4 clip = shadowMatrices[cascadeIndex] * vec4(worldPosition, 1.0);\r
  clip /= clip.w;\r
  return clip.xy * 0.5 + 0.5;\r
}\r
\r
float getDistanceToShadowTop(const vec3 positionECEF) {\r
  // Distance to the top of the shadows along the sun direction, which matches\r
  // the ray origin of BSM.\r
  return raySphereSecondIntersection(\r
    positionECEF / METER_TO_LENGTH_UNIT, // TODO: Make units consistent\r
    sunDirection,\r
    vec3(0.0),\r
    bottomRadius + shadowTopHeight\r
  );\r
}\r
\r
float readShadowOpticalDepth(const vec2 uv, const float distanceToTop, const int cascadeIndex) {\r
  // r: frontDepth, g: meanExtinction, b: maxOpticalDepth, a: maxOpticalDepthTail\r
  vec4 shadow = texture(shadowBuffer, vec3(uv, float(cascadeIndex)));\r
  // Omit adding maxOpticalDepthTail to avoid pronounced aliasing. Ground\r
  // shadow will be attenuated by inscatter anyways.\r
  return min(shadow.b, shadow.g * max(0.0, distanceToTop - shadow.r));\r
}\r
\r
float sampleShadowOpticalDepthPCF(\r
  const vec3 worldPosition,\r
  const float distanceToTop,\r
  const float radius,\r
  const int cascadeIndex\r
) {\r
  vec2 uv = getShadowUv(worldPosition, cascadeIndex);\r
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {\r
    return 0.0;\r
  }\r
\r
  vec2 texelSize = vec2(1.0) / vec2(textureSize(shadowBuffer, 0).xy);\r
  float sum = 0.0;\r
  vec2 offset;\r
  #pragma unroll_loop_start\r
  for (int i = 0; i < 16; ++i) {\r
    #if UNROLLED_LOOP_INDEX < SHADOW_SAMPLE_COUNT\r
    offset = vogelDisk(\r
      UNROLLED_LOOP_INDEX,\r
      SHADOW_SAMPLE_COUNT,\r
      interleavedGradientNoise(gl_FragCoord.xy) * PI2\r
    );\r
    sum += readShadowOpticalDepth(uv + offset * radius * texelSize, distanceToTop, cascadeIndex);\r
    #endif // UNROLLED_LOOP_INDEX < SHADOW_SAMPLE_COUNT\r
  }\r
  #pragma unroll_loop_end\r
  return sum / float(SHADOW_SAMPLE_COUNT);\r
}\r
\r
float sampleShadowOpticalDepth(\r
  const vec3 worldPosition,\r
  const vec3 positionECEF,\r
  const float radius,\r
  const float jitter\r
) {\r
  float distanceToTop = getDistanceToShadowTop(positionECEF);\r
  if (distanceToTop <= 0.0) {\r
    return 0.0;\r
  }\r
  int cascadeIndex = getFadedCascadeIndex(\r
    viewMatrix,\r
    worldPosition,\r
    shadowIntervals,\r
    cameraNear,\r
    shadowFar,\r
    jitter\r
  );\r
  return cascadeIndex >= 0\r
    ? sampleShadowOpticalDepthPCF(worldPosition, distanceToTop, radius, cascadeIndex)\r
    : 0.0;\r
}\r
\r
float getShadowRadius(const vec3 worldPosition) {\r
  vec4 clip = shadowMatrices[0] * vec4(worldPosition, 1.0);\r
  clip /= clip.w;\r
\r
  // Offset by 1px in each direction in shadow's clip coordinates.\r
  vec2 shadowSize = vec2(textureSize(shadowBuffer, 0));\r
  vec3 offset = vec3(2.0 / shadowSize, 0.0);\r
  vec4 clipX = clip + offset.xzzz;\r
  vec4 clipY = clip + offset.zyzz;\r
\r
  // Convert back to world space.\r
  vec4 worldX = inverseShadowMatrices[0] * clipX;\r
  vec4 worldY = inverseShadowMatrices[0] * clipY;\r
\r
  // Project into the main camera's clip space.\r
  mat4 viewProjectionMatrix = projectionMatrix * viewMatrix;\r
  vec4 projected = viewProjectionMatrix * vec4(worldPosition, 1.0);\r
  vec4 projectedX = viewProjectionMatrix * worldX;\r
  vec4 projectedY = viewProjectionMatrix * worldY;\r
  projected /= projected.w;\r
  projectedX /= projectedX.w;\r
  projectedY /= projectedY.w;\r
\r
  // Take the mean of pixel sizes.\r
  vec2 center = (projected.xy * 0.5 + 0.5) * resolution;\r
  vec2 offsetX = (projectedX.xy * 0.5 + 0.5) * resolution;\r
  vec2 offsetY = (projectedY.xy * 0.5 + 0.5) * resolution;\r
  float size = max(length(offsetX - center), length(offsetY - center));\r
\r
  return remapClamped(size, 10.0, 50.0, 0.0, shadowRadius);\r
}\r
\r
#endif // HAS_SHADOW\r
\r
void mainImage(const vec4 inputColor, const vec2 uv, out vec4 outputColor) {\r
  #if defined(HAS_IRRADIANCE_MASK) && defined(DEBUG_SHOW_IRRADIANCE_MASK)\r
  outputColor.rgb = vec3(texture(irradianceMaskBuffer, uv).IRRADIANCE_MASK_CHANNEL_);\r
  outputColor.a = 1.0;\r
  return;\r
  #endif // defined(HAS_IRRADIANCE_MASK) && defined(DEBUG_SHOW_IRRADIANCE_MASK)\r
\r
  float shadowLength = 0.0;\r
  #ifdef HAS_SHADOW_LENGTH\r
  shadowLength = texture(shadowLengthBuffer, uv).r;\r
  #endif // HAS_SHADOW_LENGTH\r
\r
  #ifdef HAS_OVERLAY\r
  vec4 overlay = texture(overlayBuffer, uv);\r
  if (overlay.a == 1.0) {\r
    outputColor = overlay;\r
    return;\r
  }\r
  #endif // HAS_OVERLAY\r
\r
  float depth = readDepth(uv);\r
  if (depth >= 1.0 - 1e-7) {\r
    #ifdef SKY\r
    vec3 rayDirection = normalize(vRayDirection);\r
    outputColor.rgb = getSkyRadiance(\r
      vCameraPosition - vEllipsoidCenter,\r
      rayDirection,\r
      shadowLength,\r
      sunDirection,\r
      moonDirection,\r
      moonAngularRadius,\r
      lunarRadianceScale\r
    );\r
    outputColor.a = 1.0;\r
    #else // SKY\r
    outputColor = inputColor;\r
    #endif // SKY\r
\r
    #ifdef HAS_OVERLAY\r
    outputColor.rgb = outputColor.rgb * (1.0 - overlay.a) + overlay.rgb;\r
    #endif // HAS_OVERLAY\r
    return;\r
  }\r
  depth = reverseLogDepth(depth, cameraNear, cameraFar);\r
\r
  // Reconstruct position and normal in world space.\r
  vec3 viewPosition = screenToView(\r
    uv,\r
    depth,\r
    getViewZ(depth),\r
    projectionMatrix,\r
    inverseProjectionMatrix\r
  );\r
  vec3 viewNormal;\r
  #ifdef RECONSTRUCT_NORMAL\r
  vec3 dx = dFdx(viewPosition);\r
  vec3 dy = dFdy(viewPosition);\r
  viewNormal = normalize(cross(dx, dy));\r
  #else // RECONSTRUCT_NORMAL\r
  viewNormal = readNormal(uv);\r
  #endif // RECONSTRUCT_NORMAL\r
\r
  vec3 worldPosition = (inverseViewMatrix * vec4(viewPosition, 1.0)).xyz;\r
  vec3 worldNormal = normalize(mat3(inverseViewMatrix) * viewNormal);\r
  mat3 rotation = mat3(inverseEllipsoidMatrix);\r
  vec3 positionECEF = rotation * worldPosition * METER_TO_LENGTH_UNIT - vGeometryEllipsoidCenter;\r
  vec3 normalECEF = rotation * worldNormal;\r
\r
  #ifdef CORRECT_GEOMETRIC_ERROR\r
  correctGeometricError(positionECEF, normalECEF);\r
  #endif // CORRECT_GEOMETRIC_ERROR\r
\r
  #ifdef HAS_SHADOW\r
  float stbn = getSTBN();\r
  float radius = getShadowRadius(worldPosition);\r
  float opticalDepth = sampleShadowOpticalDepth(worldPosition, positionECEF, radius, stbn);\r
  float sunTransmittance = exp(-opticalDepth);\r
  #else // HAS_SHADOW\r
  float sunTransmittance = 1.0;\r
  #endif // HAS_SHADOW\r
\r
  vec3 radiance;\r
  #if defined(SUN_IRRADIANCE) || defined(SKY_IRRADIANCE)\r
  radiance = getSunSkyIrradiance(positionECEF, normalECEF, inputColor.rgb, sunTransmittance);\r
  #ifdef HAS_IRRADIANCE_MASK\r
  float irradianceMask = texture(irradianceMaskBuffer, uv).IRRADIANCE_MASK_CHANNEL_;\r
  radiance = mix(inputColor.rgb, radiance, irradianceMask);\r
  #endif // HAS_IRRADIANCE_MASK\r
  #else // defined(SUN_IRRADIANCE) || defined(SKY_IRRADIANCE)\r
  radiance = inputColor.rgb;\r
  #endif // defined(SUN_IRRADIANCE) || defined(SKY_IRRADIANCE)\r
\r
  #if defined(TRANSMITTANCE) || defined(INSCATTER)\r
  applyTransmittanceInscatter(positionECEF, shadowLength, radiance);\r
  #endif // defined(TRANSMITTANCE) || defined(INSCATTER)\r
\r
  outputColor = vec4(radiance, inputColor.a);\r
\r
  #ifdef HAS_OVERLAY\r
  outputColor.rgb = outputColor.rgb * (1.0 - overlay.a) + overlay.rgb;\r
  #endif // HAS_OVERLAY\r
}\r
`;

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\atmosphere\shaders\aerialPerspectiveEffect.vert
var aerialPerspectiveEffect_default2 = "uniform mat4 inverseViewMatrix;\r\nuniform mat4 inverseProjectionMatrix;\r\nuniform vec3 cameraPosition;\r\nuniform vec3 ellipsoidCenter;\r\nuniform mat4 inverseEllipsoidMatrix;\r\nuniform vec3 altitudeCorrection;\r\nuniform vec3 ellipsoidRadii;\r\nuniform float idealSphereAlpha;\r\n\r\nvarying vec3 vCameraPosition;\r\nvarying vec3 vRayDirection;\r\nvarying vec3 vEllipsoidCenter;\r\nvarying vec3 vGeometryEllipsoidCenter;\r\nvarying vec3 vEllipsoidRadiiSquared;\r\n\r\nvoid getCameraRay(out vec3 origin, out vec3 direction) {\r\n  bool isPerspective = inverseProjectionMatrix[2][3] != 0.0; // 4th entry in the 3rd column\r\n\r\n  if (isPerspective) {\r\n    // Calculate the camera ray for a perspective camera.\r\n    vec4 viewPosition = inverseProjectionMatrix * vec4(position, 1.0);\r\n    vec4 worldDirection = inverseViewMatrix * vec4(viewPosition.xyz, 0.0);\r\n    origin = cameraPosition;\r\n    direction = worldDirection.xyz;\r\n  } else {\r\n    // Unprojected points to calculate direction.\r\n    vec4 nearPoint = inverseProjectionMatrix * vec4(position.xy, -1.0, 1.0);\r\n    vec4 farPoint = inverseProjectionMatrix * vec4(position.xy, -0.9, 1.0);\r\n    nearPoint /= nearPoint.w;\r\n    farPoint /= farPoint.w;\r\n\r\n    // Calculate world values.\r\n    vec4 worldDirection = inverseViewMatrix * vec4(farPoint.xyz - nearPoint.xyz, 0.0);\r\n    vec4 worldOrigin = inverseViewMatrix * nearPoint;\r\n\r\n    // Outputs\r\n    direction = worldDirection.xyz;\r\n    origin = worldOrigin.xyz;\r\n  }\r\n}\r\n\r\nvoid mainSupport() {\r\n  vec3 direction, origin;\r\n  getCameraRay(origin, direction);\r\n\r\n  mat3 rotation = mat3(inverseEllipsoidMatrix);\r\n  vCameraPosition = rotation * origin.xyz * METER_TO_LENGTH_UNIT;\r\n  vRayDirection = rotation * direction.xyz;\r\n\r\n  vEllipsoidCenter = (ellipsoidCenter + altitudeCorrection) * METER_TO_LENGTH_UNIT;\r\n  #ifdef CORRECT_GEOMETRIC_ERROR\r\n  // Gradually turn off altitude correction for aerial perspective as geometric\r\n  // error correction takes effect.\r\n  // See: https://github.com/takram-design-engineering/three-geospatial/pull/23#issuecomment-2542914656\r\n  vGeometryEllipsoidCenter =\r\n    (ellipsoidCenter + mix(altitudeCorrection, vec3(0.0), idealSphereAlpha)) * METER_TO_LENGTH_UNIT;\r\n  #else\r\n  vGeometryEllipsoidCenter = vEllipsoidCenter;\r\n  #endif // CORRECT_GEOMETRIC_ERROR\r\n\r\n  vec3 radii = ellipsoidRadii * METER_TO_LENGTH_UNIT;\r\n  vEllipsoidRadiiSquared = radii * radii;\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\atmosphere\shaders\functions.glsl
var functions_default = `// Based on the following work and adapted to Three.js.\r
// This file includes runtime functions only. Please refer to Bruneton's source\r
// code for the whole picture. It has detailed comments.\r
// https://github.com/ebruneton/precomputed_atmospheric_scattering/blob/master/atmosphere/functions.glsl\r
\r
/**\r
 * Copyright (c) 2017 Eric Bruneton\r
 * All rights reserved.\r
 *\r
 * Redistribution and use in source and binary forms, with or without\r
 * modification, are permitted provided that the following conditions\r
 * are met:\r
 * 1. Redistributions of source code must retain the above copyright\r
 *    notice, this list of conditions and the following disclaimer.\r
 * 2. Redistributions in binary form must reproduce the above copyright\r
 *    notice, this list of conditions and the following disclaimer in the\r
 *    documentation and/or other materials provided with the distribution.\r
 * 3. Neither the name of the copyright holders nor the names of its\r
 *    contributors may be used to endorse or promote products derived from\r
 *    this software without specific prior written permission.\r
 *\r
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"\r
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\r
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\r
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE\r
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR\r
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF\r
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS\r
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN\r
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)\r
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF\r
 * THE POSSIBILITY OF SUCH DAMAGE.\r
 *\r
 * Precomputed Atmospheric Scattering\r
 * Copyright (c) 2008 INRIA\r
 * All rights reserved.\r
 *\r
 * Redistribution and use in source and binary forms, with or without\r
 * modification, are permitted provided that the following conditions\r
 * are met:\r
 * 1. Redistributions of source code must retain the above copyright\r
 *    notice, this list of conditions and the following disclaimer.\r
 * 2. Redistributions in binary form must reproduce the above copyright\r
 *    notice, this list of conditions and the following disclaimer in the\r
 *    documentation and/or other materials provided with the distribution.\r
 * 3. Neither the name of the copyright holders nor the names of its\r
 *    contributors may be used to endorse or promote products derived from\r
 *    this software without specific prior written permission.\r
 *\r
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"\r
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\r
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\r
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE\r
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR\r
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF\r
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS\r
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN\r
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)\r
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF\r
 * THE POSSIBILITY OF SUCH DAMAGE.\r
 */\r
\r
float ClampCosine(const float mu) {\r
  return clamp(mu, -1.0, 1.0);\r
}\r
\r
float ClampDistance(const float d) {\r
  return max(d, 0.0);\r
}\r
\r
float ClampRadius(const float r) {\r
  return clamp(r, u_bottom_radius, u_top_radius);\r
}\r
\r
float SafeSqrt(const float a) {\r
  return sqrt(max(a, 0.0));\r
}\r
\r
float DistanceToTopAtmosphereBoundary(const float r, const float mu) {\r
  float discriminant = r * r * (mu * mu - 1.0) + u_top_radius * u_top_radius;\r
  return ClampDistance(-r * mu + SafeSqrt(discriminant));\r
}\r
\r
float DistanceToBottomAtmosphereBoundary(const float r, const float mu) {\r
  float discriminant = r * r * (mu * mu - 1.0) + u_bottom_radius * u_bottom_radius;\r
  return ClampDistance(-r * mu - SafeSqrt(discriminant));\r
}\r
\r
bool RayIntersectsGround(const float r, const float mu) {\r
  return mu < 0.0 && r * r * (mu * mu - 1.0) + u_bottom_radius * u_bottom_radius >= 0.0;\r
}\r
\r
float GetTextureCoordFromUnitRange(const float x, const int texture_size) {\r
  return 0.5 / float(texture_size) + x * (1.0 - 1.0 / float(texture_size));\r
}\r
\r
vec2 GetTransmittanceTextureUvFromRMu(const float r, const float mu) {\r
  float H = sqrt(u_top_radius * u_top_radius - u_bottom_radius * u_bottom_radius);\r
  float rho = SafeSqrt(r * r - u_bottom_radius * u_bottom_radius);\r
  float d = DistanceToTopAtmosphereBoundary(r, mu);\r
  float d_min = u_top_radius - r;\r
  float d_max = rho + H;\r
  float x_mu = (d - d_min) / (d_max - d_min);\r
  float x_r = rho / H;\r
  return vec2(\r
    GetTextureCoordFromUnitRange(x_mu, TRANSMITTANCE_TEXTURE_WIDTH),\r
    GetTextureCoordFromUnitRange(x_r, TRANSMITTANCE_TEXTURE_HEIGHT)\r
  );\r
}\r
\r
vec3 GetTransmittanceToTopAtmosphereBoundary(\r
  const sampler2D transmittance_texture,\r
  const float r,\r
  const float mu\r
) {\r
  vec2 uv = GetTransmittanceTextureUvFromRMu(r, mu);\r
  return vec3(texture(transmittance_texture, uv));\r
}\r
\r
vec3 GetTransmittance(\r
  const sampler2D transmittance_texture,\r
  const float r,\r
  const float mu,\r
  const float d,\r
  const bool ray_r_mu_intersects_ground\r
) {\r
  float r_d = ClampRadius(sqrt(d * d + 2.0 * r * mu * d + r * r));\r
  float mu_d = ClampCosine((r * mu + d) / r_d);\r
  if (ray_r_mu_intersects_ground) {\r
    return min(\r
      GetTransmittanceToTopAtmosphereBoundary(transmittance_texture, r_d, -mu_d) /\r
        GetTransmittanceToTopAtmosphereBoundary(transmittance_texture, r, -mu),\r
      vec3(1.0)\r
    );\r
  } else {\r
    return min(\r
      GetTransmittanceToTopAtmosphereBoundary(transmittance_texture, r, mu) /\r
        GetTransmittanceToTopAtmosphereBoundary(transmittance_texture, r_d, mu_d),\r
      vec3(1.0)\r
    );\r
  }\r
}\r
\r
vec3 GetTransmittanceToSun(const sampler2D transmittance_texture, const float r, const float mu_s) {\r
  float sin_theta_h = u_bottom_radius / r;\r
  float cos_theta_h = -sqrt(max(1.0 - sin_theta_h * sin_theta_h, 0.0));\r
  return GetTransmittanceToTopAtmosphereBoundary(transmittance_texture, r, mu_s) *\r
  smoothstep(\r
    -sin_theta_h * u_sun_angular_radius,\r
    sin_theta_h * u_sun_angular_radius,\r
    mu_s - cos_theta_h\r
  );\r
}\r
\r
float RayleighPhaseFunction(const float nu) {\r
  float k = 3.0 / (16.0 * PI);\r
  return k * (1.0 + nu * nu);\r
}\r
\r
float MiePhaseFunction(const float g, const float nu) {\r
  float k = 3.0 / (8.0 * PI) * (1.0 - g * g) / (2.0 + g * g);\r
  return k * (1.0 + nu * nu) / pow(1.0 + g * g - 2.0 * g * nu, 1.5);\r
}\r
\r
vec4 GetScatteringTextureUvwzFromRMuMuSNu(\r
  const float r,\r
  const float mu,\r
  const float mu_s,\r
  const float nu,\r
  const bool ray_r_mu_intersects_ground\r
) {\r
  float H = sqrt(u_top_radius * u_top_radius - u_bottom_radius * u_bottom_radius);\r
  float rho = SafeSqrt(r * r - u_bottom_radius * u_bottom_radius);\r
  float u_r = GetTextureCoordFromUnitRange(rho / H, SCATTERING_TEXTURE_R_SIZE);\r
  float r_mu = r * mu;\r
  float discriminant = r_mu * r_mu - r * r + u_bottom_radius * u_bottom_radius;\r
  float u_mu;\r
  if (ray_r_mu_intersects_ground) {\r
    float d = -r_mu - SafeSqrt(discriminant);\r
    float d_min = r - u_bottom_radius;\r
    float d_max = rho;\r
    u_mu =\r
      0.5 -\r
      0.5 *\r
        GetTextureCoordFromUnitRange(\r
          d_max == d_min\r
            ? 0.0\r
            : (d - d_min) / (d_max - d_min),\r
          SCATTERING_TEXTURE_MU_SIZE / 2\r
        );\r
  } else {\r
    float d = -r_mu + SafeSqrt(discriminant + H * H);\r
    float d_min = u_top_radius - r;\r
    float d_max = rho + H;\r
    u_mu =\r
      0.5 +\r
      0.5 *\r
        GetTextureCoordFromUnitRange((d - d_min) / (d_max - d_min), SCATTERING_TEXTURE_MU_SIZE / 2);\r
  }\r
  float d = DistanceToTopAtmosphereBoundary(u_bottom_radius, mu_s);\r
  float d_min = u_top_radius - u_bottom_radius;\r
  float d_max = H;\r
  float a = (d - d_min) / (d_max - d_min);\r
  float D = DistanceToTopAtmosphereBoundary(u_bottom_radius, u_mu_s_min);\r
  float A = (D - d_min) / (d_max - d_min);\r
  float u_mu_s = GetTextureCoordFromUnitRange(\r
    max(1.0 - a / A, 0.0) / (1.0 + a),\r
    SCATTERING_TEXTURE_MU_S_SIZE\r
  );\r
  float u_nu = (nu + 1.0) / 2.0;\r
  return vec4(u_nu, u_mu_s, u_mu, u_r);\r
}\r
\r
vec2 GetIrradianceTextureUvFromRMuS(const float r, const float mu_s) {\r
  float x_r = (r - u_bottom_radius) / (u_top_radius - u_bottom_radius);\r
  float x_mu_s = mu_s * 0.5 + 0.5;\r
  return vec2(\r
    GetTextureCoordFromUnitRange(x_mu_s, IRRADIANCE_TEXTURE_WIDTH),\r
    GetTextureCoordFromUnitRange(x_r, IRRADIANCE_TEXTURE_HEIGHT)\r
  );\r
}\r
\r
vec3 GetIrradiance(const sampler2D irradiance_texture, const float r, const float mu_s) {\r
  vec2 uv = GetIrradianceTextureUvFromRMuS(r, mu_s);\r
  return vec3(texture(irradiance_texture, uv));\r
}\r
\r
vec3 GetExtrapolatedSingleMieScattering(const vec4 scattering) {\r
  if (scattering.r < 1e-5) {\r
    return vec3(0.0);\r
  }\r
  return scattering.rgb *\r
  scattering.a /\r
  scattering.r *\r
  (u_rayleigh_scattering.r / u_mie_scattering.r) *\r
  (u_mie_scattering / u_rayleigh_scattering);\r
}\r
\r
vec3 GetCombinedScattering(\r
  const sampler3D scattering_texture,\r
  const sampler3D single_mie_scattering_texture,\r
  const float r,\r
  const float mu,\r
  const float mu_s,\r
  const float nu,\r
  const bool ray_r_mu_intersects_ground,\r
  out vec3 single_mie_scattering\r
) {\r
  vec4 uvwz = GetScatteringTextureUvwzFromRMuMuSNu(r, mu, mu_s, nu, ray_r_mu_intersects_ground);\r
  float tex_coord_x = uvwz.x * float(SCATTERING_TEXTURE_NU_SIZE - 1);\r
  float tex_x = floor(tex_coord_x);\r
  float lerp = tex_coord_x - tex_x;\r
  vec3 uvw0 = vec3((tex_x + uvwz.y) / float(SCATTERING_TEXTURE_NU_SIZE), uvwz.z, uvwz.w);\r
  vec3 uvw1 = vec3((tex_x + 1.0 + uvwz.y) / float(SCATTERING_TEXTURE_NU_SIZE), uvwz.z, uvwz.w);\r
  vec4 combined_scattering =\r
    texture(scattering_texture, uvw0) * (1.0 - lerp) + texture(scattering_texture, uvw1) * lerp;\r
  vec3 scattering = vec3(combined_scattering);\r
  single_mie_scattering = GetExtrapolatedSingleMieScattering(combined_scattering);\r
  return scattering;\r
}\r
\r
vec3 GetSkyRadiance(\r
  const sampler2D transmittance_texture,\r
  const sampler3D scattering_texture,\r
  const sampler3D single_mie_scattering_texture,\r
  vec3 camera,\r
  const vec3 view_ray,\r
  const float shadow_length,\r
  const vec3 sun_direction,\r
  out vec3 transmittance\r
) {\r
  float r = length(camera);\r
  float rmu = dot(camera, view_ray);\r
  float distance_to_top_atmosphere_boundary =\r
    -rmu - SafeSqrt(rmu * rmu - r * r + u_top_radius * u_top_radius);\r
  if (distance_to_top_atmosphere_boundary > 0.0) {\r
    camera = camera + view_ray * distance_to_top_atmosphere_boundary;\r
    r = u_top_radius;\r
    rmu += distance_to_top_atmosphere_boundary;\r
  } else if (r > u_top_radius) {\r
    transmittance = vec3(1.0);\r
    return vec3(0.0);\r
  }\r
  float mu = rmu / r;\r
  float mu_s = dot(camera, sun_direction) / r;\r
  float nu = dot(view_ray, sun_direction);\r
  bool ray_r_mu_intersects_ground = RayIntersectsGround(r, mu);\r
  transmittance = ray_r_mu_intersects_ground\r
    ? vec3(0.0)\r
    : GetTransmittanceToTopAtmosphereBoundary(transmittance_texture, r, mu);\r
\r
  vec3 single_mie_scattering;\r
  vec3 scattering;\r
  if (shadow_length == 0.0) {\r
    scattering = GetCombinedScattering(\r
      u_scattering_texture,\r
      u_single_mie_scattering_texture,\r
      r,\r
      mu,\r
      mu_s,\r
      nu,\r
      ray_r_mu_intersects_ground,\r
      single_mie_scattering\r
    );\r
  } else {\r
    // Use different points for Rayleigh and Mie scattering since a large shadow\r
    // length for Rayleigh scattering leads to an overly orange tint, which\r
    // doesn't work well with the clouds seemingly because their in-scattering\r
    // is an approximation for terrain.\r
    float rayleigh_shadow_length = min(shadow_length, u_max_rayleigh_shadow_length);\r
    float d = rayleigh_shadow_length;\r
    float r_p = ClampRadius(sqrt(d * d + 2.0 * r * mu * d + r * r));\r
    float mu_p = (r * mu + d) / r_p;\r
    float mu_s_p = (r * mu_s + d * nu) / r_p;\r
    scattering = GetCombinedScattering(\r
      scattering_texture,\r
      single_mie_scattering_texture,\r
      r_p,\r
      mu_p,\r
      mu_s_p,\r
      nu,\r
      ray_r_mu_intersects_ground,\r
      single_mie_scattering\r
    );\r
    vec3 rayleigh_transmittance = GetTransmittance(\r
      transmittance_texture,\r
      r,\r
      mu,\r
      rayleigh_shadow_length,\r
      ray_r_mu_intersects_ground\r
    );\r
\r
    d = shadow_length;\r
    r_p = ClampRadius(sqrt(d * d + 2.0 * r * mu * d + r * r));\r
    mu_p = (r * mu + d) / r_p;\r
    mu_s_p = (r * mu_s + d * nu) / r_p;\r
    GetCombinedScattering(\r
      scattering_texture,\r
      single_mie_scattering_texture,\r
      r_p,\r
      mu_p,\r
      mu_s_p,\r
      nu,\r
      ray_r_mu_intersects_ground,\r
      single_mie_scattering\r
    );\r
    vec3 mie_transmittance = GetTransmittance(\r
      transmittance_texture,\r
      r,\r
      mu,\r
      shadow_length,\r
      ray_r_mu_intersects_ground\r
    );\r
\r
    scattering = scattering * rayleigh_transmittance;\r
    single_mie_scattering = single_mie_scattering * mie_transmittance;\r
  }\r
  return scattering * RayleighPhaseFunction(nu) +\r
  single_mie_scattering * MiePhaseFunction(u_mie_phase_function_g, nu);\r
}\r
\r
bool RayOutsideTopAtmosphereBoundary(const vec3 camera, const vec3 point, const float r) {\r
  if (r < u_top_radius || length(point) < u_top_radius) {\r
    return false;\r
  }\r
  vec3 ray = point - camera;\r
  float t = -clamp(dot(camera, ray) / dot(ray, ray), 0.0, 1.0);\r
  return length(camera + t * ray) > u_top_radius;\r
}\r
\r
vec3 GetSkyRadianceToPoint(\r
  const sampler2D transmittance_texture,\r
  const sampler3D scattering_texture,\r
  const sampler3D single_mie_scattering_texture,\r
  vec3 camera,\r
  const vec3 point,\r
  const float shadow_length,\r
  const vec3 sun_direction,\r
  out vec3 transmittance\r
) {\r
  float r = length(camera);\r
  if (RayOutsideTopAtmosphereBoundary(camera, point, r)) {\r
    transmittance = vec3(1.0);\r
    return vec3(0.0); // Avoid artifacts\r
  }\r
  vec3 view_ray = normalize(point - camera);\r
  float rmu = dot(camera, view_ray);\r
  float distance_to_top_atmosphere_boundary =\r
    -rmu - sqrt(rmu * rmu - r * r + u_top_radius * u_top_radius);\r
  if (distance_to_top_atmosphere_boundary > 0.0) {\r
    camera = camera + view_ray * distance_to_top_atmosphere_boundary;\r
    r = u_top_radius;\r
    rmu += distance_to_top_atmosphere_boundary;\r
  }\r
  float mu = rmu / r;\r
  float mu_s = dot(camera, sun_direction) / r;\r
  float nu = dot(view_ray, sun_direction);\r
  float d = length(point - camera);\r
  bool ray_r_mu_intersects_ground = RayIntersectsGround(r, mu);\r
\r
  // Hack to avoid rendering artifacts near the horizon, due to finite\r
  // atmosphere texture resolution and finite floating point precision.\r
  // See: https://github.com/ebruneton/precomputed_atmospheric_scattering/pull/32\r
  if (!ray_r_mu_intersects_ground) {\r
    float mu_horiz = -SafeSqrt(1.0 - u_bottom_radius / r * (u_bottom_radius / r));\r
    mu = max(mu, mu_horiz + 0.004);\r
  }\r
\r
  transmittance = GetTransmittance(transmittance_texture, r, mu, d, ray_r_mu_intersects_ground);\r
  vec3 single_mie_scattering;\r
  vec3 scattering = GetCombinedScattering(\r
    scattering_texture,\r
    single_mie_scattering_texture,\r
    r,\r
    mu,\r
    mu_s,\r
    nu,\r
    ray_r_mu_intersects_ground,\r
    single_mie_scattering\r
  );\r
  d = max(d - shadow_length, 0.0);\r
  float r_p = ClampRadius(sqrt(d * d + 2.0 * r * mu * d + r * r));\r
  float mu_p = (r * mu + d) / r_p;\r
  float mu_s_p = (r * mu_s + d * nu) / r_p;\r
  vec3 single_mie_scattering_p;\r
  vec3 scattering_p = GetCombinedScattering(\r
    scattering_texture,\r
    single_mie_scattering_texture,\r
    r_p,\r
    mu_p,\r
    mu_s_p,\r
    nu,\r
    ray_r_mu_intersects_ground,\r
    single_mie_scattering_p\r
  );\r
  vec3 shadow_transmittance = transmittance;\r
  if (shadow_length > 0.0) {\r
    shadow_transmittance = GetTransmittance(\r
      transmittance_texture,\r
      r,\r
      mu,\r
      d,\r
      ray_r_mu_intersects_ground\r
    );\r
  }\r
  scattering = scattering - shadow_transmittance * scattering_p;\r
  single_mie_scattering = single_mie_scattering - shadow_transmittance * single_mie_scattering_p;\r
  single_mie_scattering = GetExtrapolatedSingleMieScattering(\r
    vec4(scattering, single_mie_scattering.r)\r
  );\r
  single_mie_scattering = single_mie_scattering * smoothstep(0.0, 0.01, mu_s);\r
  return scattering * RayleighPhaseFunction(nu) +\r
  single_mie_scattering * MiePhaseFunction(u_mie_phase_function_g, nu);\r
}\r
\r
vec3 GetSunAndSkyIrradianceForParticle(\r
  const sampler2D transmittance_texture,\r
  const sampler2D irradiance_texture,\r
  const vec3 point,\r
  const vec3 sun_direction,\r
  out vec3 sky_irradiance\r
) {\r
  float r = length(point);\r
  float mu_s = dot(point, sun_direction) / r;\r
  // Integral of (1+dot(n,p))/2 over sphere yields 2\u03C0.\r
  sky_irradiance = GetIrradiance(irradiance_texture, r, mu_s) * 2.0 * PI;\r
  // Sunlight is directional. Just omit the cosine term.\r
  return u_solar_irradiance * GetTransmittanceToSun(transmittance_texture, r, mu_s);\r
}\r
\r
vec3 GetSunAndSkyIrradiance(\r
  const sampler2D transmittance_texture,\r
  const sampler2D irradiance_texture,\r
  const vec3 point,\r
  const vec3 normal,\r
  const vec3 sun_direction,\r
  out vec3 sky_irradiance\r
) {\r
  float r = length(point);\r
  float mu_s = dot(point, sun_direction) / r;\r
  sky_irradiance =\r
    GetIrradiance(irradiance_texture, r, mu_s) * (1.0 + dot(normal, point) / r) * 0.5;\r
  return u_solar_irradiance *\r
  GetTransmittanceToSun(transmittance_texture, r, mu_s) *\r
  max(dot(normal, sun_direction), 0.0);\r
}\r
\r
vec3 GetSolarRadiance() {\r
  vec3 radiance = u_solar_irradiance / (PI * u_sun_angular_radius * u_sun_angular_radius);\r
  #ifdef PHOTOMETRIC\r
  radiance *= SUN_SPECTRAL_RADIANCE_TO_LUMINANCE;\r
  #endif // PHOTOMETRIC\r
  return radiance;\r
}\r
\r
vec3 GetSkyRadiance(\r
  const vec3 camera,\r
  const vec3 view_ray,\r
  const float shadow_length,\r
  const vec3 sun_direction,\r
  out vec3 transmittance\r
) {\r
  vec3 radiance = GetSkyRadiance(\r
    u_transmittance_texture,\r
    u_scattering_texture,\r
    u_single_mie_scattering_texture,\r
    camera,\r
    view_ray,\r
    shadow_length,\r
    sun_direction,\r
    transmittance\r
  );\r
  #ifdef PHOTOMETRIC\r
  radiance *= SKY_SPECTRAL_RADIANCE_TO_LUMINANCE;\r
  #endif // PHOTOMETRIC\r
  return radiance;\r
}\r
\r
vec3 GetSkyRadianceToPoint(\r
  const vec3 camera,\r
  const vec3 point,\r
  const float shadow_length,\r
  const vec3 sun_direction,\r
  out vec3 transmittance\r
) {\r
  vec3 inscatter = GetSkyRadianceToPoint(\r
    u_transmittance_texture,\r
    u_scattering_texture,\r
    u_single_mie_scattering_texture,\r
    camera,\r
    point,\r
    shadow_length,\r
    sun_direction,\r
    transmittance\r
  );\r
  #ifdef PHOTOMETRIC\r
  inscatter *= SKY_SPECTRAL_RADIANCE_TO_LUMINANCE;\r
  #endif // PHOTOMETRIC\r
  return inscatter;\r
}\r
\r
vec3 GetSunAndSkyIrradianceForParticle(\r
  const vec3 point,\r
  const vec3 sun_direction,\r
  out vec3 sky_irradiance\r
) {\r
  vec3 sun_irradiance = GetSunAndSkyIrradianceForParticle(\r
    u_transmittance_texture,\r
    u_irradiance_texture,\r
    point,\r
    sun_direction,\r
    sky_irradiance\r
  );\r
  #ifdef PHOTOMETRIC\r
  sun_irradiance *= SUN_SPECTRAL_RADIANCE_TO_LUMINANCE;\r
  sky_irradiance *= SKY_SPECTRAL_RADIANCE_TO_LUMINANCE;\r
  #endif // PHOTOMETRIC\r
  return sun_irradiance;\r
}\r
\r
vec3 GetSunAndSkyIrradiance(\r
  const vec3 point,\r
  const vec3 normal,\r
  const vec3 sun_direction,\r
  out vec3 sky_irradiance\r
) {\r
  vec3 sun_irradiance = GetSunAndSkyIrradiance(\r
    u_transmittance_texture,\r
    u_irradiance_texture,\r
    point,\r
    normal,\r
    sun_direction,\r
    sky_irradiance\r
  );\r
  #ifdef PHOTOMETRIC\r
  sun_irradiance *= SUN_SPECTRAL_RADIANCE_TO_LUMINANCE;\r
  sky_irradiance *= SKY_SPECTRAL_RADIANCE_TO_LUMINANCE;\r
  #endif // PHOTOMETRIC\r
  return sun_irradiance;\r
}\r
`;

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\atmosphere\shaders\parameters.glsl
var parameters_default = "uniform vec3 u_solar_irradiance;\r\nuniform float u_sun_angular_radius;\r\nuniform float u_bottom_radius;\r\nuniform float u_top_radius;\r\nuniform vec3 u_rayleigh_scattering;\r\nuniform vec3 u_mie_scattering;\r\nuniform float u_mie_phase_function_g;\r\nuniform float u_mu_s_min;\r\nuniform float u_max_rayleigh_shadow_length;\r\n\r\nuniform sampler2D u_transmittance_texture;\r\nuniform sampler3D u_scattering_texture;\r\nuniform sampler3D u_single_mie_scattering_texture;\r\nuniform sampler2D u_irradiance_texture;\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\atmosphere\shaders\sky.glsl
var sky_default = "vec3 getLunarRadiance(const float moonAngularRadius) {\r\n  // Not a physical number but the order of 10^-6 relative to the sun may fit.\r\n  vec3 radiance = u_solar_irradiance * 0.000002 / (PI * moonAngularRadius * moonAngularRadius);\r\n  #ifdef PHOTOMETRIC\r\n  radiance *= SUN_SPECTRAL_RADIANCE_TO_LUMINANCE;\r\n  #endif // PHOTOMETRIC\r\n  return radiance;\r\n}\r\n\r\nfloat intersectSphere(const vec3 ray, const vec3 point, const float radius) {\r\n  vec3 P = -point;\r\n  float PoR = dot(P, ray);\r\n  float D = dot(P, P) - radius * radius;\r\n  return -PoR - sqrt(PoR * PoR - D);\r\n}\r\n\r\nfloat orenNayarDiffuse(const vec3 L, const vec3 V, const vec3 N) {\r\n  float NoL = dot(N, L);\r\n  float NoV = dot(N, V);\r\n  float s = dot(L, V) - NoL * NoV;\r\n  float t = mix(1.0, max(NoL, NoV), step(0.0, s));\r\n  return max(0.0, NoL) * (0.62406015 + 0.41284404 * s / t);\r\n}\r\n\r\nvec3 getSkyRadiance(\r\n  const vec3 cameraPosition,\r\n  const vec3 rayDirection,\r\n  const float shadowLength,\r\n  const vec3 sunDirection,\r\n  const vec3 moonDirection,\r\n  const float moonAngularRadius,\r\n  const float lunarRadianceScale\r\n) {\r\n  vec3 transmittance;\r\n  vec3 radiance = GetSkyRadiance(\r\n    cameraPosition,\r\n    rayDirection,\r\n    shadowLength,\r\n    sunDirection,\r\n    transmittance\r\n  );\r\n\r\n  // Rendering celestial objects without perspective doesn't make sense.\r\n  #ifdef PERSPECTIVE_CAMERA\r\n\r\n  #if defined(SUN) || defined(MOON)\r\n  vec3 ddx = dFdx(rayDirection);\r\n  vec3 ddy = dFdy(rayDirection);\r\n  float fragmentAngle = length(ddx + ddy) / length(rayDirection);\r\n  #endif // defined(SUN) || defined(MOON)\r\n\r\n  #ifdef SUN\r\n  float viewDotSun = dot(rayDirection, sunDirection);\r\n  if (viewDotSun > cos(u_sun_angular_radius)) {\r\n    float angle = acos(clamp(viewDotSun, -1.0, 1.0));\r\n    float antialias = smoothstep(u_sun_angular_radius, u_sun_angular_radius - fragmentAngle, angle);\r\n    radiance += transmittance * GetSolarRadiance() * antialias;\r\n  }\r\n  #endif // SUN\r\n\r\n  #ifdef MOON\r\n  float intersection = intersectSphere(rayDirection, moonDirection, moonAngularRadius);\r\n  if (intersection > 0.0) {\r\n    vec3 normal = normalize(moonDirection - rayDirection * intersection);\r\n    float diffuse = orenNayarDiffuse(-sunDirection, rayDirection, normal);\r\n    float viewDotMoon = dot(rayDirection, moonDirection);\r\n    float angle = acos(clamp(viewDotMoon, -1.0, 1.0));\r\n    float antialias = smoothstep(moonAngularRadius, moonAngularRadius - fragmentAngle, angle);\r\n    radiance +=\r\n      transmittance *\r\n      getLunarRadiance(moonAngularRadius) *\r\n      lunarRadianceScale *\r\n      diffuse *\r\n      antialias;\r\n  }\r\n  #endif // MOON\r\n\r\n  #endif // PERSPECTIVE_CAMERA\r\n\r\n  return radiance;\r\n}\r\n";

// source/atmosphere/AerialPerspectiveEffect.ts
var vectorScratch14 = /* @__PURE__ */ new Vector39();
var vectorScratch24 = /* @__PURE__ */ new Vector39();
var geodeticScratch = /* @__PURE__ */ new Geodetic();
var aerialPerspectiveEffectOptionsDefaults = {
  blendFunction: BlendFunction.NORMAL,
  octEncodedNormal: false,
  reconstructNormal: false,
  ellipsoid: Ellipsoid.WGS84,
  correctAltitude: true,
  correctGeometricError: true,
  photometric: true,
  sunIrradiance: false,
  skyIrradiance: false,
  transmittance: true,
  inscatter: true,
  irradianceScale: 1,
  sky: false,
  sun: true,
  moon: true,
  moonAngularRadius: 45e-4,
  // ≈ 15.5 arcminutes
  lunarRadianceScale: 1
};
var AerialPerspectiveEffect = class extends Effect {
  constructor(camera = new Camera(), options, atmosphere = AtmosphereParameters.DEFAULT) {
    const {
      blendFunction,
      normalBuffer = null,
      octEncodedNormal,
      reconstructNormal,
      irradianceTexture = null,
      scatteringTexture = null,
      transmittanceTexture = null,
      ellipsoid,
      correctAltitude,
      correctGeometricError,
      photometric,
      sunDirection,
      sunIrradiance,
      skyIrradiance,
      transmittance,
      inscatter,
      irradianceScale,
      sky,
      sun,
      moon,
      moonDirection,
      moonAngularRadius,
      lunarRadianceScale
    } = { ...aerialPerspectiveEffectOptionsDefaults, ...options };
    super(
      "AerialPerspectiveEffect",
      unrollLoops(
        resolveIncludes(aerialPerspectiveEffect_default, {
          core: {
            depth,
            packing,
            math,
            transform,
            raySphereIntersection,
            cascadedShadowMaps,
            interleavedGradientNoise,
            vogelDisk
          },
          parameters: parameters_default,
          functions: functions_default,
          sky: sky_default
        })
      ),
      {
        blendFunction,
        vertexShader: resolveIncludes(aerialPerspectiveEffect_default2, {
          parameters: parameters_default
        }),
        attributes: EffectAttribute.DEPTH,
        // prettier-ignore
        uniforms: new Map(
          Object.entries({
            normalBuffer: new Uniform(normalBuffer),
            projectionMatrix: new Uniform(new Matrix43()),
            viewMatrix: new Uniform(new Matrix43()),
            inverseProjectionMatrix: new Uniform(new Matrix43()),
            inverseViewMatrix: new Uniform(new Matrix43()),
            cameraPosition: new Uniform(new Vector39()),
            bottomRadius: new Uniform(atmosphere.bottomRadius),
            ellipsoidRadii: new Uniform(new Vector39()),
            ellipsoidCenter: new Uniform(new Vector39()),
            inverseEllipsoidMatrix: new Uniform(new Matrix43()),
            altitudeCorrection: new Uniform(new Vector39()),
            sunDirection: new Uniform(sunDirection?.clone() ?? new Vector39()),
            irradianceScale: new Uniform(irradianceScale),
            idealSphereAlpha: new Uniform(0),
            moonDirection: new Uniform(moonDirection?.clone() ?? new Vector39()),
            moonAngularRadius: new Uniform(moonAngularRadius),
            lunarRadianceScale: new Uniform(lunarRadianceScale),
            // Composition and shadow
            overlayBuffer: new Uniform(null),
            shadowBuffer: new Uniform(null),
            shadowMapSize: new Uniform(new Vector22()),
            shadowIntervals: new Uniform([]),
            shadowMatrices: new Uniform([]),
            inverseShadowMatrices: new Uniform([]),
            shadowFar: new Uniform(0),
            shadowTopHeight: new Uniform(0),
            shadowRadius: new Uniform(3),
            stbnTexture: new Uniform(null),
            frame: new Uniform(0),
            shadowLengthBuffer: new Uniform(null),
            // Irradiance mask
            irradianceMaskBuffer: new Uniform(null),
            // Uniforms for atmosphere functions
            u_solar_irradiance: new Uniform(atmosphere.solarIrradiance),
            u_sun_angular_radius: new Uniform(atmosphere.sunAngularRadius),
            u_bottom_radius: new Uniform(atmosphere.bottomRadius * METER_TO_LENGTH_UNIT),
            u_top_radius: new Uniform(atmosphere.topRadius * METER_TO_LENGTH_UNIT),
            u_rayleigh_scattering: new Uniform(atmosphere.rayleighScattering),
            u_mie_scattering: new Uniform(atmosphere.mieScattering),
            u_mie_phase_function_g: new Uniform(atmosphere.miePhaseFunctionG),
            u_mu_s_min: new Uniform(atmosphere.muSMin),
            u_max_rayleigh_shadow_length: new Uniform(1e4 * METER_TO_LENGTH_UNIT),
            u_irradiance_texture: new Uniform(irradianceTexture),
            u_scattering_texture: new Uniform(scatteringTexture),
            u_single_mie_scattering_texture: new Uniform(scatteringTexture),
            u_transmittance_texture: new Uniform(transmittanceTexture)
          })
        ),
        // prettier-ignore
        defines: /* @__PURE__ */ new Map([
          ["TRANSMITTANCE_TEXTURE_WIDTH", TRANSMITTANCE_TEXTURE_WIDTH.toFixed(0)],
          ["TRANSMITTANCE_TEXTURE_HEIGHT", TRANSMITTANCE_TEXTURE_HEIGHT.toFixed(0)],
          ["SCATTERING_TEXTURE_R_SIZE", SCATTERING_TEXTURE_R_SIZE.toFixed(0)],
          ["SCATTERING_TEXTURE_MU_SIZE", SCATTERING_TEXTURE_MU_SIZE.toFixed(0)],
          ["SCATTERING_TEXTURE_MU_S_SIZE", SCATTERING_TEXTURE_MU_S_SIZE.toFixed(0)],
          ["SCATTERING_TEXTURE_NU_SIZE", SCATTERING_TEXTURE_NU_SIZE.toFixed(0)],
          ["IRRADIANCE_TEXTURE_WIDTH", IRRADIANCE_TEXTURE_WIDTH.toFixed(0)],
          ["IRRADIANCE_TEXTURE_HEIGHT", IRRADIANCE_TEXTURE_HEIGHT.toFixed(0)],
          ["METER_TO_LENGTH_UNIT", METER_TO_LENGTH_UNIT.toFixed(7)],
          ["SUN_SPECTRAL_RADIANCE_TO_LUMINANCE", `vec3(${atmosphere.sunRadianceToRelativeLuminance.toArray().map((v) => v.toFixed(12)).join(",")})`],
          ["SKY_SPECTRAL_RADIANCE_TO_LUMINANCE", `vec3(${atmosphere.skyRadianceToRelativeLuminance.toArray().map((v) => v.toFixed(12)).join(",")})`]
        ])
      }
    );
    this.camera = camera;
    this.atmosphere = atmosphere;
    this.ellipsoidMatrix = new Matrix43();
    this.overlay = null;
    this.shadow = null;
    this.shadowLength = null;
    this.irradianceMask = null;
    this.shadowSampleCount = 8;
    this.octEncodedNormal = octEncodedNormal;
    this.reconstructNormal = reconstructNormal;
    this.ellipsoid = ellipsoid;
    this.correctAltitude = correctAltitude;
    this.correctGeometricError = correctGeometricError;
    this.photometric = photometric;
    this.sunIrradiance = sunIrradiance;
    this.skyIrradiance = skyIrradiance;
    this.transmittance = transmittance;
    this.inscatter = inscatter;
    this.sky = sky;
    this.sun = sun;
    this.moon = moon;
  }
  get mainCamera() {
    return this.camera;
  }
  set mainCamera(value) {
    this.camera = value;
  }
  copyCameraSettings(camera) {
    const {
      projectionMatrix,
      matrixWorldInverse,
      projectionMatrixInverse,
      matrixWorld
    } = camera;
    const uniforms = this.uniforms;
    uniforms.get("projectionMatrix").value.copy(projectionMatrix);
    uniforms.get("viewMatrix").value.copy(matrixWorldInverse);
    uniforms.get("inverseProjectionMatrix").value.copy(projectionMatrixInverse);
    uniforms.get("inverseViewMatrix").value.copy(matrixWorld);
    const cameraPosition = camera.getWorldPosition(
      uniforms.get("cameraPosition").value
    );
    const inverseEllipsoidMatrix = uniforms.get("inverseEllipsoidMatrix").value.copy(this.ellipsoidMatrix).invert();
    const cameraPositionECEF = vectorScratch14.copy(cameraPosition).applyMatrix4(inverseEllipsoidMatrix).sub(uniforms.get("ellipsoidCenter").value);
    try {
      const cameraHeight = geodeticScratch.setFromECEF(cameraPositionECEF).height;
      const projectedScale = vectorScratch24.set(0, this.ellipsoid.maximumRadius, -cameraHeight).applyMatrix4(projectionMatrix);
      uniforms.get("idealSphereAlpha").value = saturate(
        remap(projectedScale.y, 41.5, 13.8, 0, 1)
      );
    } catch (error) {
      return;
    }
    const altitudeCorrection = uniforms.get("altitudeCorrection");
    if (this.correctAltitude) {
      getAltitudeCorrectionOffset(
        cameraPositionECEF,
        this.atmosphere.bottomRadius,
        this.ellipsoid,
        altitudeCorrection.value
      );
    } else {
      altitudeCorrection.value.setScalar(0);
    }
  }
  updateOverlay() {
    let needsUpdate = false;
    const { uniforms, defines, overlay } = this;
    const prevValue = defines.has("HAS_OVERLAY");
    const nextValue = overlay != null;
    if (nextValue !== prevValue) {
      if (nextValue) {
        defines.set("HAS_OVERLAY", "1");
      } else {
        defines.delete("HAS_OVERLAY");
        uniforms.get("overlayBuffer").value = null;
      }
      needsUpdate = true;
    }
    if (nextValue) {
      uniforms.get("overlayBuffer").value = overlay.map;
    }
    return needsUpdate;
  }
  updateShadow() {
    let needsUpdate = false;
    const { uniforms, defines, shadow } = this;
    const prevValue = defines.has("HAS_SHADOW");
    const nextValue = shadow != null;
    if (nextValue !== prevValue) {
      if (nextValue) {
        defines.set("HAS_SHADOW", "1");
      } else {
        defines.delete("HAS_SHADOW");
        uniforms.get("shadowBuffer").value = null;
      }
      needsUpdate = true;
    }
    if (nextValue) {
      const prevCascadeCount = defines.get("SHADOW_CASCADE_COUNT");
      const nextCascadeCount = `${shadow.cascadeCount}`;
      if (prevCascadeCount !== nextCascadeCount) {
        defines.set("SHADOW_CASCADE_COUNT", shadow.cascadeCount.toFixed(0));
        needsUpdate = true;
      }
      uniforms.get("shadowBuffer").value = shadow.map;
      uniforms.get("shadowMapSize").value = shadow.mapSize;
      uniforms.get("shadowIntervals").value = shadow.intervals;
      uniforms.get("shadowMatrices").value = shadow.matrices;
      uniforms.get("inverseShadowMatrices").value = shadow.inverseMatrices;
      uniforms.get("shadowFar").value = shadow.far;
      uniforms.get("shadowTopHeight").value = shadow.topHeight;
    }
    return needsUpdate;
  }
  updateShadowLength() {
    let needsUpdate = false;
    const { uniforms, defines, shadowLength } = this;
    const prevValue = defines.has("HAS_SHADOW_LENGTH");
    const nextValue = shadowLength != null;
    if (nextValue !== prevValue) {
      if (nextValue) {
        defines.set("HAS_SHADOW_LENGTH", "1");
      } else {
        defines.delete("HAS_SHADOW_LENGTH");
        uniforms.get("shadowLengthBuffer").value = null;
      }
      needsUpdate = true;
    }
    if (nextValue) {
      uniforms.get("shadowLengthBuffer").value = shadowLength.map;
    }
    return needsUpdate;
  }
  updateIrradianceMask() {
    let needsUpdate = false;
    const { uniforms, defines, irradianceMask } = this;
    const prevValue = defines.has("HAS_IRRADIANCE_MASK");
    const nextValue = irradianceMask != null;
    if (nextValue !== prevValue) {
      if (nextValue) {
        defines.set("HAS_IRRADIANCE_MASK", "1");
      } else {
        defines.delete("HAS_IRRADIANCE_MASK");
        uniforms.get("irradianceMaskBuffer").value = null;
      }
      needsUpdate = true;
    }
    if (nextValue) {
      uniforms.get("irradianceMaskBuffer").value = irradianceMask.map;
      const prevChannel = defines.get("IRRADIANCE_MASK_CHANNEL");
      const nextChannel = irradianceMask.channel;
      if (nextChannel !== prevChannel) {
        if (!/^[rgba]$/.test(nextChannel)) {
          console.error(`Expression validation failed: ${nextChannel}`);
        } else {
          defines.set("IRRADIANCE_MASK_CHANNEL", nextChannel);
          needsUpdate = true;
        }
      }
    }
    return needsUpdate;
  }
  update(renderer, inputBuffer, deltaTime) {
    this.copyCameraSettings(this.camera);
    let needsUpdate = false;
    needsUpdate ||= this.updateOverlay();
    needsUpdate ||= this.updateShadow();
    needsUpdate ||= this.updateShadowLength();
    needsUpdate ||= this.updateIrradianceMask();
    if (needsUpdate) {
      this.setChanged();
    }
    ++this.uniforms.get("frame").value;
  }
  get normalBuffer() {
    return this.uniforms.get("normalBuffer").value;
  }
  set normalBuffer(value) {
    this.uniforms.get("normalBuffer").value = value;
  }
  get irradianceTexture() {
    return this.uniforms.get("u_irradiance_texture").value;
  }
  set irradianceTexture(value) {
    this.uniforms.get("u_irradiance_texture").value = value;
  }
  get scatteringTexture() {
    return this.uniforms.get("u_scattering_texture").value;
  }
  set scatteringTexture(value) {
    this.uniforms.get("u_scattering_texture").value = value;
    this.uniforms.get("u_single_mie_scattering_texture").value = value;
  }
  get transmittanceTexture() {
    return this.uniforms.get("u_transmittance_texture").value;
  }
  set transmittanceTexture(value) {
    this.uniforms.get("u_transmittance_texture").value = value;
  }
  get ellipsoid() {
    return this._ellipsoid;
  }
  set ellipsoid(value) {
    this._ellipsoid = value;
    this.uniforms.get("ellipsoidRadii").value.copy(value.radii);
  }
  get ellipsoidCenter() {
    return this.uniforms.get("ellipsoidCenter").value;
  }
  get sunDirection() {
    return this.uniforms.get("sunDirection").value;
  }
  get irradianceScale() {
    return this.uniforms.get("irradianceScale").value;
  }
  set irradianceScale(value) {
    this.uniforms.get("irradianceScale").value = value;
  }
  get moonDirection() {
    return this.uniforms.get("moonDirection").value;
  }
  get moonAngularRadius() {
    return this.uniforms.get("moonAngularRadius").value;
  }
  set moonAngularRadius(value) {
    this.uniforms.get("moonAngularRadius").value = value;
  }
  get lunarRadianceScale() {
    return this.uniforms.get("lunarRadianceScale").value;
  }
  set lunarRadianceScale(value) {
    this.uniforms.get("lunarRadianceScale").value = value;
  }
  get stbnTexture() {
    return this.uniforms.get("stbnTexture").value;
  }
  set stbnTexture(value) {
    this.uniforms.get("stbnTexture").value = value;
  }
  get shadowRadius() {
    return this.uniforms.get("shadowRadius").value;
  }
  set shadowRadius(value) {
    this.uniforms.get("shadowRadius").value = value;
  }
};
__decorateClass([
  define("OCT_ENCODED_NORMAL")
], AerialPerspectiveEffect.prototype, "octEncodedNormal", 2);
__decorateClass([
  define("RECONSTRUCT_NORMAL")
], AerialPerspectiveEffect.prototype, "reconstructNormal", 2);
__decorateClass([
  define("CORRECT_GEOMETRIC_ERROR")
], AerialPerspectiveEffect.prototype, "correctGeometricError", 2);
__decorateClass([
  define("PHOTOMETRIC")
], AerialPerspectiveEffect.prototype, "photometric", 2);
__decorateClass([
  define("SUN_IRRADIANCE")
], AerialPerspectiveEffect.prototype, "sunIrradiance", 2);
__decorateClass([
  define("SKY_IRRADIANCE")
], AerialPerspectiveEffect.prototype, "skyIrradiance", 2);
__decorateClass([
  define("TRANSMITTANCE")
], AerialPerspectiveEffect.prototype, "transmittance", 2);
__decorateClass([
  define("INSCATTER")
], AerialPerspectiveEffect.prototype, "inscatter", 2);
__decorateClass([
  define("SKY")
], AerialPerspectiveEffect.prototype, "sky", 2);
__decorateClass([
  define("SUN")
], AerialPerspectiveEffect.prototype, "sun", 2);
__decorateClass([
  define("MOON")
], AerialPerspectiveEffect.prototype, "moon", 2);
__decorateClass([
  defineInt("SHADOW_SAMPLE_COUNT", { min: 1, max: 16 })
], AerialPerspectiveEffect.prototype, "shadowSampleCount", 2);

// source/atmosphere/AtmosphereMaterialBase.ts
import {
  Matrix4 as Matrix44,
  RawShaderMaterial,
  Uniform as Uniform2,
  Vector3 as Vector310
} from "three";
var vectorScratch6 = /* @__PURE__ */ new Vector310();
function includeRenderTargets(fragmentShader, count) {
  let layout = "";
  let output = "";
  for (let index = 1; index < count; ++index) {
    layout += `layout(location = ${index}) out float renderTarget${index};
`;
    output += `renderTarget${index} = 0.0;
`;
  }
  return fragmentShader.replace("#include <mrt_layout>", layout).replace("#include <mrt_output>", output);
}
var atmosphereMaterialParametersBaseDefaults = {
  ellipsoid: Ellipsoid.WGS84,
  correctAltitude: true,
  photometric: true,
  renderTargetCount: 1
};
var AtmosphereMaterialBase = class extends RawShaderMaterial {
  constructor(params, atmosphere = AtmosphereParameters.DEFAULT) {
    const {
      irradianceTexture = null,
      scatteringTexture = null,
      transmittanceTexture = null,
      ellipsoid,
      correctAltitude,
      photometric,
      sunDirection,
      sunAngularRadius,
      renderTargetCount,
      ...others
    } = { ...atmosphereMaterialParametersBaseDefaults, ...params };
    super({
      toneMapped: false,
      depthWrite: false,
      depthTest: false,
      ...others,
      // prettier-ignore
      uniforms: {
        cameraPosition: new Uniform2(new Vector310()),
        ellipsoidCenter: new Uniform2(new Vector310()),
        inverseEllipsoidMatrix: new Uniform2(new Matrix44()),
        altitudeCorrection: new Uniform2(new Vector310()),
        sunDirection: new Uniform2(sunDirection?.clone() ?? new Vector310()),
        // Uniforms for atmosphere functions
        u_solar_irradiance: new Uniform2(atmosphere.solarIrradiance),
        u_sun_angular_radius: new Uniform2(sunAngularRadius ?? atmosphere.sunAngularRadius),
        u_bottom_radius: new Uniform2(atmosphere.bottomRadius * METER_TO_LENGTH_UNIT),
        u_top_radius: new Uniform2(atmosphere.topRadius * METER_TO_LENGTH_UNIT),
        u_rayleigh_scattering: new Uniform2(atmosphere.rayleighScattering),
        u_mie_scattering: new Uniform2(atmosphere.mieScattering),
        u_mie_phase_function_g: new Uniform2(atmosphere.miePhaseFunctionG),
        u_mu_s_min: new Uniform2(atmosphere.muSMin),
        u_max_rayleigh_shadow_length: new Uniform2(1e4 * METER_TO_LENGTH_UNIT),
        u_irradiance_texture: new Uniform2(irradianceTexture),
        u_scattering_texture: new Uniform2(scatteringTexture),
        u_single_mie_scattering_texture: new Uniform2(scatteringTexture),
        u_transmittance_texture: new Uniform2(transmittanceTexture),
        ...others.uniforms
      },
      // prettier-ignore
      defines: {
        PI: `${Math.PI}`,
        TRANSMITTANCE_TEXTURE_WIDTH: TRANSMITTANCE_TEXTURE_WIDTH.toFixed(0),
        TRANSMITTANCE_TEXTURE_HEIGHT: TRANSMITTANCE_TEXTURE_HEIGHT.toFixed(0),
        SCATTERING_TEXTURE_R_SIZE: SCATTERING_TEXTURE_R_SIZE.toFixed(0),
        SCATTERING_TEXTURE_MU_SIZE: SCATTERING_TEXTURE_MU_SIZE.toFixed(0),
        SCATTERING_TEXTURE_MU_S_SIZE: SCATTERING_TEXTURE_MU_S_SIZE.toFixed(0),
        SCATTERING_TEXTURE_NU_SIZE: SCATTERING_TEXTURE_NU_SIZE.toFixed(0),
        IRRADIANCE_TEXTURE_WIDTH: IRRADIANCE_TEXTURE_WIDTH.toFixed(0),
        IRRADIANCE_TEXTURE_HEIGHT: IRRADIANCE_TEXTURE_HEIGHT.toFixed(0),
        METER_TO_LENGTH_UNIT: METER_TO_LENGTH_UNIT.toFixed(7),
        SUN_SPECTRAL_RADIANCE_TO_LUMINANCE: `vec3(${atmosphere.sunRadianceToRelativeLuminance.toArray().map((v) => v.toFixed(12)).join(",")})`,
        SKY_SPECTRAL_RADIANCE_TO_LUMINANCE: `vec3(${atmosphere.skyRadianceToRelativeLuminance.toArray().map((v) => v.toFixed(12)).join(",")})`,
        ...others.defines
      }
    });
    this.atmosphere = atmosphere;
    this.ellipsoidMatrix = new Matrix44();
    this.atmosphere = atmosphere;
    this.ellipsoid = ellipsoid;
    this.correctAltitude = correctAltitude;
    this.photometric = photometric;
    this.renderTargetCount = renderTargetCount;
  }
  copyCameraSettings(camera) {
    const uniforms = this.uniforms;
    const cameraPosition = camera.getWorldPosition(
      uniforms.cameraPosition.value
    );
    const inverseEllipsoidMatrix = uniforms.inverseEllipsoidMatrix.value.copy(this.ellipsoidMatrix).invert();
    const cameraPositionECEF = vectorScratch6.copy(cameraPosition).applyMatrix4(inverseEllipsoidMatrix).sub(uniforms.ellipsoidCenter.value);
    const altitudeCorrection = uniforms.altitudeCorrection.value;
    if (this.correctAltitude) {
      getAltitudeCorrectionOffset(
        cameraPositionECEF,
        this.atmosphere.bottomRadius,
        this.ellipsoid,
        altitudeCorrection
      );
    } else {
      altitudeCorrection.setScalar(0);
    }
  }
  onBeforeCompile(parameters2, renderer) {
    parameters2.fragmentShader = includeRenderTargets(
      parameters2.fragmentShader,
      this.renderTargetCount
    );
  }
  onBeforeRender(renderer, scene, camera, geometry, object, group) {
    this.copyCameraSettings(camera);
  }
  get irradianceTexture() {
    return this.uniforms.u_irradiance_texture.value;
  }
  set irradianceTexture(value) {
    this.uniforms.u_irradiance_texture.value = value;
  }
  get scatteringTexture() {
    return this.uniforms.u_scattering_texture.value;
  }
  set scatteringTexture(value) {
    this.uniforms.u_scattering_texture.value = value;
    this.uniforms.u_single_mie_scattering_texture.value = value;
  }
  get transmittanceTexture() {
    return this.uniforms.u_transmittance_texture.value;
  }
  set transmittanceTexture(value) {
    this.uniforms.u_transmittance_texture.value = value;
  }
  get ellipsoidCenter() {
    return this.uniforms.ellipsoidCenter.value;
  }
  get sunDirection() {
    return this.uniforms.sunDirection.value;
  }
  get sunAngularRadius() {
    return this.uniforms.u_sun_angular_radius.value;
  }
  set sunAngularRadius(value) {
    this.uniforms.u_sun_angular_radius.value = value;
  }
  /** @package */
  get renderTargetCount() {
    return this._renderTargetCount;
  }
  /** @package */
  set renderTargetCount(value) {
    if (value !== this.renderTargetCount) {
      this._renderTargetCount = value;
      this.needsUpdate = true;
    }
  }
};
__decorateClass([
  define("PHOTOMETRIC")
], AtmosphereMaterialBase.prototype, "photometric", 2);

// source/atmosphere/blackBodyChromaticity.ts
import { Color, Matrix3, Vector3 as Vector311 } from "three";
var vectorScratch7 = /* @__PURE__ */ new Vector311();
var XYZToLinearRGB = /* @__PURE__ */ new Matrix3(
  3.2404542,
  -1.5371385,
  -0.4985314,
  -0.969266,
  1.8760108,
  0.041556,
  0.0556434,
  -0.2040259,
  1.0572252
);
function convertTemperatureToLinearSRGBChromaticity(temperature, result = new Color()) {
  const T = temperature;
  const T2 = T ** 2;
  const u = (0.860117757 + 154118254e-12 * T + 128641212e-15 * T2) / (1 + 842420235e-12 * T + 708145163e-15 * T2);
  const v = (0.317398726 + 422806245e-13 * T + 420481691e-16 * T2) / (1 - 289741816e-13 * T + 161456053e-15 * T2);
  const x = 3 * u / (2 * u - 8 * v + 4);
  const y = 2 * v / (2 * u - 8 * v + 4);
  const Y = 1;
  const X = y > 0 ? x * Y / y : 0;
  const Z = y > 0 ? (1 - x - y) * Y / y : 0;
  const color = vectorScratch7.set(X, Y, Z).applyMatrix3(XYZToLinearRGB);
  color.x = saturate(color.x);
  color.y = saturate(color.y);
  color.z = saturate(color.z);
  return result.setFromVector3(color.normalize());
}
function convertBVIndexToTemperature(bvIndex) {
  const bv = clamp(bvIndex, -0.4, 2);
  return 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bvIndex + 0.62));
}
function convertBVIndexToLinearSRGBChromaticity(bvIndex, result = new Color()) {
  return convertTemperatureToLinearSRGBChromaticity(
    convertBVIndexToTemperature(bvIndex),
    result
  );
}

// source/atmosphere/celestialDirections.ts
import {
  AstroTime,
  Body,
  CombineRotation,
  GeoVector,
  Rotation_EQJ_EQD,
  RotationMatrix,
  SiderealTime
} from "astronomy-engine";
import { Matrix4 as Matrix45, Vector3 as Vector312 } from "three";
var matrixScratch2 = /* @__PURE__ */ new Matrix45();
function RotationZ(angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return new RotationMatrix([
    [cos, -sin, 0],
    [sin, cos, 0],
    [0, 0, 1]
  ]);
}
function makeTime(value) {
  return value instanceof AstroTime ? value : new AstroTime(value instanceof Date ? value : new Date(value));
}
function getECIToECEFRotationMatrix(date, result = new Matrix45()) {
  const time = makeTime(date);
  const rotationEQJtoEQD = Rotation_EQJ_EQD(time);
  const rotationEQDtoECEF = RotationZ(SiderealTime(time) * (-Math.PI / 12));
  const { rot } = CombineRotation(rotationEQJtoEQD, rotationEQDtoECEF);
  return result.set(
    rot[0][0],
    rot[0][1],
    rot[0][2],
    0,
    rot[1][0],
    rot[1][1],
    rot[1][2],
    0,
    rot[2][0],
    rot[2][1],
    rot[2][2],
    0,
    0,
    0,
    0,
    1
  );
}
function getDirectionECI(body, time, result) {
  const { x, y, z } = GeoVector(body, time, false);
  return result.set(x, y, z).normalize();
}
function getDirectionECEF(body, time, result) {
  const matrix = getECIToECEFRotationMatrix(time, matrixScratch2);
  return getDirectionECI(body, time, result).applyMatrix4(matrix);
}
function getSunDirectionECI(date, result = new Vector312()) {
  return getDirectionECI(Body.Sun, makeTime(date), result);
}
function getMoonDirectionECI(date, result = new Vector312()) {
  return getDirectionECI(Body.Moon, makeTime(date), result);
}
function getSunDirectionECEF(date, result = new Vector312()) {
  return getDirectionECEF(Body.Sun, makeTime(date), result);
}
function getMoonDirectionECEF(date, result = new Vector312()) {
  return getDirectionECEF(Body.Moon, makeTime(date), result);
}

// source/atmosphere/getSunLightColor.ts
import { Color as Color2, Vector2 as Vector23, Vector3 as Vector314 } from "three";

// source/atmosphere/helpers/functions.ts
function safeSqrt(a) {
  return Math.sqrt(Math.max(a, 0));
}
function clampDistance(d) {
  return Math.max(d, 0);
}
function rayIntersectsGround(atmosphere, r, mu) {
  const { bottomRadius } = atmosphere;
  return mu < 0 && r ** 2 * (mu ** 2 - 1) + bottomRadius ** 2 >= 0;
}
function distanceToTopAtmosphereBoundary(atmosphere, r, mu) {
  const { topRadius } = atmosphere;
  const discriminant = r ** 2 * (mu ** 2 - 1) + topRadius ** 2;
  return clampDistance(-r * mu + safeSqrt(discriminant));
}
function getTextureCoordFromUnitRange(x, textureSize) {
  return 0.5 / textureSize + x * (1 - 1 / textureSize);
}

// source/atmosphere/helpers/sampleTexture.ts
import { HalfFloatType as HalfFloatType2, Vector3 as Vector313 } from "three";
var vectorScratch15 = /* @__PURE__ */ new Vector313();
var vectorScratch25 = /* @__PURE__ */ new Vector313();
var vectorScratch33 = /* @__PURE__ */ new Vector313();
function samplePixel(data, index, result) {
  const dataIndex = index * 4;
  return result.set(data[dataIndex], data[dataIndex + 1], data[dataIndex + 2]);
}
function sampleTexture(texture, uv, result) {
  const { width, height } = texture.image;
  invariant(isTypedArray(texture.image.data));
  let data = texture.image.data;
  if (texture.type === HalfFloatType2 && data instanceof Uint16Array) {
    data = new Float16Array(data.buffer);
  }
  const x = clamp(uv.x, 0, 1) * (width - 1);
  const y = clamp(uv.y, 0, 1) * (height - 1);
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const tx = x - xi;
  const ty = y - yi;
  const sx = tx;
  const sy = ty;
  const rx0 = xi % width;
  const rx1 = (rx0 + 1) % width;
  const ry0 = yi % height;
  const ry1 = (ry0 + 1) % height;
  const v00 = samplePixel(data, ry0 * width + rx0, vectorScratch15);
  const v10 = samplePixel(data, ry0 * width + rx1, vectorScratch25);
  const nx0 = v00.lerp(v10, sx);
  const v01 = samplePixel(data, ry1 * width + rx0, vectorScratch25);
  const v11 = samplePixel(data, ry1 * width + rx1, vectorScratch33);
  const nx1 = v01.lerp(v11, sx);
  return result.copy(nx0.lerp(nx1, sy));
}

// source/atmosphere/getSunLightColor.ts
function getUvFromRMu(atmosphere, r, mu, result) {
  const { topRadius, bottomRadius } = atmosphere;
  const H = Math.sqrt(topRadius ** 2 - bottomRadius ** 2);
  const rho = safeSqrt(r ** 2 - bottomRadius ** 2);
  const d = distanceToTopAtmosphereBoundary(atmosphere, r, mu);
  const dMin = topRadius - r;
  const dMax = rho + H;
  const xmu = (d - dMin) / (dMax - dMin);
  const xr = rho / H;
  return result.set(
    getTextureCoordFromUnitRange(xmu, TRANSMITTANCE_TEXTURE_WIDTH),
    getTextureCoordFromUnitRange(xr, TRANSMITTANCE_TEXTURE_HEIGHT)
  );
}
var vectorScratch16 = /* @__PURE__ */ new Vector314();
var vectorScratch26 = /* @__PURE__ */ new Vector314();
var uvScratch = /* @__PURE__ */ new Vector23();
function getSunLightColor(transmittanceTexture, worldPosition, sunDirection, result = new Color2(), {
  ellipsoid = Ellipsoid.WGS84,
  correctAltitude = true,
  photometric = true
} = {}, atmosphere = AtmosphereParameters.DEFAULT) {
  const camera = vectorScratch16.copy(worldPosition);
  if (correctAltitude) {
    const surfacePosition = ellipsoid.projectOnSurface(
      worldPosition,
      vectorScratch26
    );
    if (surfacePosition != null) {
      camera.sub(
        ellipsoid.getOsculatingSphereCenter(
          surfacePosition,
          atmosphere.bottomRadius,
          vectorScratch26
        )
      );
    }
  }
  const transmittance = vectorScratch26;
  let r = camera.length();
  let rmu = camera.dot(sunDirection);
  const { topRadius } = atmosphere;
  const distanceToTopAtmosphereBoundary2 = -rmu - Math.sqrt(rmu ** 2 - r ** 2 + topRadius ** 2);
  if (distanceToTopAtmosphereBoundary2 > 0) {
    r = topRadius;
    rmu += distanceToTopAtmosphereBoundary2;
  }
  if (r > topRadius) {
    transmittance.set(1, 1, 1);
  } else {
    const mu = rmu / r;
    const rayRMuIntersectsGround = rayIntersectsGround(atmosphere, r, mu);
    if (rayRMuIntersectsGround) {
      transmittance.setScalar(0);
    } else {
      const uv = getUvFromRMu(atmosphere, r, mu, uvScratch);
      sampleTexture(transmittanceTexture, uv, transmittance);
    }
  }
  const radiance = transmittance.multiply(atmosphere.solarIrradiance);
  if (photometric) {
    radiance.multiply(atmosphere.sunRadianceToRelativeLuminance);
  }
  return result.setFromVector3(radiance);
}

// source/atmosphere/IrradianceMaskPass.ts
import {
  ClearPass,
  DepthCopyPass,
  DepthMaskMaterial,
  DepthTestStrategy,
  Pass,
  RenderPass,
  Selection,
  ShaderPass
} from "postprocessing";
import {
  BasicDepthPacking,
  Color as Color3,
  DepthTexture,
  LessEqualDepth,
  MeshBasicMaterial,
  RedFormat as RedFormat2,
  RGBADepthPacking,
  Uniform as Uniform3,
  UnsignedIntType as UnsignedIntType2,
  WebGLRenderTarget
} from "three";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\atmosphere\shaders\irradianceMask.frag
var irradianceMask_default = '// Based on: https://github.com/pmndrs/postprocessing/blob/v6.37.4/src/materials/glsl/depth-mask.frag\r\n\r\n#include <common>\r\n#include <packing>\r\n\r\n#include "core/depth"\r\n\r\n#ifdef GL_FRAGMENT_PRECISION_HIGH\r\nuniform highp sampler2D depthBuffer0;\r\nuniform highp sampler2D depthBuffer1;\r\n#else // GL_FRAGMENT_PRECISION_HIGH\r\nuniform mediump sampler2D depthBuffer0;\r\nuniform mediump sampler2D depthBuffer1;\r\n#endif // GL_FRAGMENT_PRECISION_HIGH\r\n\r\nuniform sampler2D inputBuffer;\r\nuniform vec2 cameraNearFar;\r\nuniform bool inverted;\r\n\r\nfloat getViewZ(const float depth) {\r\n  #ifdef PERSPECTIVE_CAMERA\r\n  return perspectiveDepthToViewZ(depth, cameraNearFar.x, cameraNearFar.y);\r\n  #else // PERSPECTIVE_CAMERA\r\n  return orthographicDepthToViewZ(depth, cameraNearFar.x, cameraNearFar.y);\r\n  #endif // PERSPECTIVE_CAMERA\r\n}\r\n\r\nvarying vec2 vUv;\r\n\r\nvoid main() {\r\n  vec2 depth;\r\n\r\n  #if DEPTH_PACKING_0 == 3201\r\n  depth.x = unpackRGBAToDepth(texture2D(depthBuffer0, vUv));\r\n  #else // DEPTH_PACKING_0 == 3201\r\n  depth.x = reverseLogDepth(texture2D(depthBuffer0, vUv).r, cameraNearFar.x, cameraNearFar.y);\r\n  #endif // DEPTH_PACKING_0 == 3201\r\n\r\n  #if DEPTH_PACKING_1 == 3201\r\n  depth.y = unpackRGBAToDepth(texture2D(depthBuffer1, vUv));\r\n  #else // DEPTH_PACKING_1 == 3201\r\n  depth.y = reverseLogDepth(texture2D(depthBuffer1, vUv).r, cameraNearFar.x, cameraNearFar.y);\r\n  #endif // DEPTH_PACKING_1 == 3201\r\n\r\n  bool isMaxDepth = depth.x == 1.0;\r\n\r\n  #ifdef PERSPECTIVE_CAMERA\r\n  depth.x = viewZToOrthographicDepth(getViewZ(depth.x), cameraNearFar.x, cameraNearFar.y);\r\n  depth.y = viewZToOrthographicDepth(getViewZ(depth.y), cameraNearFar.x, cameraNearFar.y);\r\n  #endif // PERSPECTIVE_CAMERA\r\n\r\n  #if DEPTH_TEST_STRATEGY == 0\r\n  // Decide based on depth test.\r\n  bool keep = depthTest(depth.x, depth.y);\r\n\r\n  #elif DEPTH_TEST_STRATEGY == 1\r\n  // Always keep max depth.\r\n  bool keep = isMaxDepth || depthTest(depth.x, depth.y);\r\n\r\n  #else // DEPTH_TEST_STRATEGY\r\n  // Always discard max depth.\r\n  bool keep = !isMaxDepth && depthTest(depth.x, depth.y);\r\n\r\n  #endif // DEPTH_TEST_STRATEGY\r\n\r\n  if (inverted) {\r\n    keep = !keep;\r\n  }\r\n  if (keep) {\r\n    gl_FragColor = texture2D(inputBuffer, vUv);\r\n  } else {\r\n    discard;\r\n  }\r\n}\r\n';

// source/atmosphere/IrradianceMaskPass.ts
var IrradianceMaskPass = class extends Pass {
  constructor(scene, camera) {
    super("IrradianceMaskPass");
    this.selection = new Selection();
    this.needsSwap = false;
    this.needsDepthTexture = true;
    this.renderPass = new RenderPass(scene, camera, new MeshBasicMaterial());
    this.renderPass.ignoreBackground = true;
    this.renderPass.skipShadowMapUpdate = true;
    this.renderPass.selection = this.selection;
    this.depthTexture = new DepthTexture(1, 1, UnsignedIntType2);
    this.renderTarget = new WebGLRenderTarget(1, 1, {
      format: RedFormat2,
      depthTexture: this.depthTexture
    });
    this.depthCopyPass0 = new DepthCopyPass({ depthPacking: RGBADepthPacking });
    this.depthCopyPass1 = new DepthCopyPass({ depthPacking: RGBADepthPacking });
    this.clearPass = new ClearPass(true, false, false);
    this.clearPass.overrideClearColor = new Color3(16777215);
    this.clearPass.overrideClearAlpha = 1;
    const depthMaskMaterial = new DepthMaskMaterial();
    depthMaskMaterial.fragmentShader = resolveIncludes(irradianceMask_default, {
      core: { depth }
    });
    depthMaskMaterial.uniforms.inverted = new Uniform3(false);
    depthMaskMaterial.copyCameraSettings(camera);
    depthMaskMaterial.depthBuffer0 = this.depthCopyPass0.texture;
    depthMaskMaterial.depthPacking0 = RGBADepthPacking;
    depthMaskMaterial.depthBuffer1 = this.depthCopyPass1.texture;
    depthMaskMaterial.depthPacking1 = RGBADepthPacking;
    depthMaskMaterial.depthMode = LessEqualDepth;
    depthMaskMaterial.maxDepthStrategy = DepthTestStrategy.DISCARD_MAX_DEPTH;
    this.depthMaskMaterial = depthMaskMaterial;
    this.depthMaskPass = new ShaderPass(depthMaskMaterial);
  }
  // eslint-disable-next-line accessor-pairs
  set mainScene(value) {
    this.renderPass.mainScene = value;
  }
  // eslint-disable-next-line accessor-pairs
  set mainCamera(value) {
    this.renderPass.mainCamera = value;
    this.depthMaskMaterial.copyCameraSettings(value);
  }
  initialize(renderer, alpha, frameBufferType) {
    this.renderPass.initialize(renderer, alpha, frameBufferType);
    this.clearPass.initialize(renderer, alpha, frameBufferType);
    this.depthMaskPass.initialize(renderer, alpha, frameBufferType);
  }
  setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {
    this.depthCopyPass0.setDepthTexture(depthTexture, depthPacking);
    this.depthCopyPass1.setDepthTexture(this.depthTexture, depthPacking);
  }
  render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
    const autoClear = renderer.autoClear;
    renderer.autoClear = false;
    this.depthCopyPass0.render(renderer, null, null);
    this.renderPass.render(renderer, this.renderTarget, null);
    this.depthCopyPass1.render(renderer, null, null);
    this.clearPass.render(renderer, this.renderTarget, null);
    this.depthMaskPass.render(renderer, null, this.renderTarget);
    renderer.autoClear = autoClear;
  }
  setSize(width, height) {
    this.renderTarget.setSize(width, height);
    this.depthCopyPass0.setSize(width, height);
    this.depthCopyPass1.setSize(width, height);
  }
  get texture() {
    return this.renderTarget.texture;
  }
  get selectionLayer() {
    return this.selection.layer;
  }
  set selectionLayer(value) {
    this.selection.layer = value;
  }
  get inverted() {
    return this.depthMaskMaterial.uniforms.inverted.value;
  }
  set inverted(value) {
    this.depthMaskMaterial.uniforms.inverted.value = value;
  }
};

// source/atmosphere/PrecomputedTexturesLoader.ts
import {
  FloatType as FloatType2,
  HalfFloatType as HalfFloatType3,
  LinearFilter as LinearFilter2,
  Loader as Loader5
} from "three";
import { EXRLoader as EXRLoader2 } from "three-stdlib";

// source/vendor/url-join.ts
function normalize2(parts) {
  if (parts.length === 0) return "";
  const result = [];
  for (let index = 0; index < parts.length; index += 1) {
    let part = parts[index];
    if (typeof part !== "string") {
      throw new TypeError(`Url must be a string. Received ${part}`);
    }
    if (part === "") continue;
    if (index > 0) part = part.replace(/^[\/]+/, "");
    if (index < parts.length - 1) {
      part = part.replace(/[\/]+$/, "");
    } else {
      part = part.replace(/[\/]+$/, "/");
    }
    result.push(part);
  }
  return result.join("/").replace(/\/(\?|&|#[^!])/g, "$1");
}
function urlJoin(...parts) {
  return normalize2(parts);
}

// source/atmosphere/PrecomputedTexturesLoader.ts
var PrecomputedTexturesLoader = class extends Loader5 {
  constructor() {
    super(...arguments);
    this.format = "exr";
    this.type = HalfFloatType3;
  }
  setTypeFromRenderer(renderer) {
    this.type = renderer.getContext().getExtension("OES_texture_float_linear") == null ? HalfFloatType3 : FloatType2;
    return this;
  }
  load(url, onLoad, onProgress, onError) {
    const result = {};
    const loadTexture = (name, { loader, extension }) => {
      loader.setRequestHeader(this.requestHeader);
      loader.setPath(this.path);
      loader.setWithCredentials(this.withCredentials);
      loader.load(
        urlJoin(url, `${name}${extension}`),
        (texture) => {
          texture.minFilter = LinearFilter2;
          texture.magFilter = LinearFilter2;
          texture.type = this.type;
          if (this.type === FloatType2) {
            texture.image.data = new Float32Array(
              new Float16Array(texture.image.data.buffer)
            );
          }
          result[`${name}Texture`] = texture;
          if (result.irradianceTexture != null && result.scatteringTexture != null && result.transmittanceTexture != null) {
            onLoad(result);
          }
        },
        onProgress,
        onError
      );
    };
    if (this.format === "exr") {
      loadTexture("irradiance", {
        loader: new EXRLoader2(this.manager),
        extension: ".exr"
      });
      loadTexture("scattering", {
        loader: new EXR3DLoader(this.manager).setDepth(
          SCATTERING_TEXTURE_DEPTH
        ),
        extension: ".exr"
      });
      loadTexture("transmittance", {
        loader: new EXRLoader2(this.manager),
        extension: ".exr"
      });
    } else {
      loadTexture("irradiance", {
        loader: createDataTextureLoader(parseFloat16Array, {
          width: IRRADIANCE_TEXTURE_WIDTH,
          height: IRRADIANCE_TEXTURE_HEIGHT
        }),
        extension: ".bin"
      });
      loadTexture("scattering", {
        loader: createData3DTextureLoader(parseFloat16Array, {
          width: SCATTERING_TEXTURE_WIDTH,
          height: SCATTERING_TEXTURE_HEIGHT,
          depth: SCATTERING_TEXTURE_DEPTH
        }),
        extension: ".bin"
      });
      loadTexture("transmittance", {
        loader: createDataTextureLoader(parseFloat16Array, {
          width: TRANSMITTANCE_TEXTURE_WIDTH,
          height: TRANSMITTANCE_TEXTURE_HEIGHT
        }),
        extension: ".bin"
      });
    }
  }
};

// source/atmosphere/SkyLightProbe.ts
import { LightProbe, Matrix4 as Matrix46, Vector2 as Vector24, Vector3 as Vector315 } from "three";
function getUvFromRMuS({ topRadius, bottomRadius }, r, muS, result) {
  const xR = (r - bottomRadius) / (topRadius - bottomRadius);
  const xMuS = muS * 0.5 + 0.5;
  return result.set(
    getTextureCoordFromUnitRange(xMuS, IRRADIANCE_TEXTURE_WIDTH),
    getTextureCoordFromUnitRange(xR, IRRADIANCE_TEXTURE_HEIGHT)
  );
}
var L0_COEFF = 1 / Math.sqrt(Math.PI);
var L1_COEFF = Math.sqrt(3) / (2 * Math.sqrt(Math.PI));
var vectorScratch17 = /* @__PURE__ */ new Vector315();
var vectorScratch27 = /* @__PURE__ */ new Vector315();
var uvScratch2 = /* @__PURE__ */ new Vector24();
var matrixScratch3 = /* @__PURE__ */ new Matrix46();
var skyLightProbeParametersDefaults = {
  ellipsoid: Ellipsoid.WGS84,
  correctAltitude: true,
  photometric: true
};
var SkyLightProbe = class extends LightProbe {
  constructor(params, atmosphere = AtmosphereParameters.DEFAULT) {
    super();
    this.atmosphere = atmosphere;
    this.ellipsoidCenter = new Vector315();
    this.ellipsoidMatrix = new Matrix46();
    const {
      irradianceTexture = null,
      ellipsoid,
      correctAltitude,
      photometric,
      sunDirection
    } = { ...skyLightProbeParametersDefaults, ...params };
    this.irradianceTexture = irradianceTexture;
    this.ellipsoid = ellipsoid;
    this.correctAltitude = correctAltitude;
    this.photometric = photometric;
    this.sunDirection = sunDirection?.clone() ?? new Vector315();
  }
  update() {
    if (this.irradianceTexture == null) {
      return;
    }
    const inverseEllipsoidMatrix = matrixScratch3.copy(this.ellipsoidMatrix).invert();
    const cameraPosition = this.getWorldPosition(vectorScratch17);
    const cameraPositionECEF = cameraPosition.applyMatrix4(inverseEllipsoidMatrix).sub(this.ellipsoidCenter);
    if (this.correctAltitude) {
      const surfacePosition = this.ellipsoid.projectOnSurface(
        cameraPositionECEF,
        vectorScratch27
      );
      if (surfacePosition != null) {
        cameraPositionECEF.sub(
          getAltitudeCorrectionOffset(
            surfacePosition,
            this.atmosphere.bottomRadius,
            this.ellipsoid,
            vectorScratch27
          )
        );
      }
    }
    const r = cameraPositionECEF.length();
    const muS = cameraPositionECEF.dot(this.sunDirection) / r;
    const uv = getUvFromRMuS(this.atmosphere, r, muS, uvScratch2);
    const irradiance = sampleTexture(this.irradianceTexture, uv, vectorScratch27);
    if (this.photometric) {
      irradiance.multiply(this.atmosphere.skyRadianceToRelativeLuminance);
    }
    const normal = this.ellipsoid.getSurfaceNormal(cameraPositionECEF).applyMatrix4(this.ellipsoidMatrix);
    const coefficients = this.sh.coefficients;
    coefficients[0].copy(irradiance).multiplyScalar(L0_COEFF);
    coefficients[1].copy(irradiance).multiplyScalar(L1_COEFF * normal.y);
    coefficients[2].copy(irradiance).multiplyScalar(L1_COEFF * normal.z);
    coefficients[3].copy(irradiance).multiplyScalar(L1_COEFF * normal.x);
  }
};

// source/atmosphere/SkyMaterial.ts
import {
  Color as Color4,
  GLSL3,
  Matrix4 as Matrix47,
  Uniform as Uniform4,
  Vector3 as Vector316
} from "three";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\atmosphere\shaders\sky.frag
var sky_default2 = 'precision highp float;\r\nprecision highp sampler3D;\r\n\r\n#define RECIPROCAL_PI (0.3183098861837907)\r\n\r\n#include "core/raySphereIntersection"\r\n#include "parameters"\r\n#include "functions"\r\n#include "sky"\r\n\r\nuniform vec3 sunDirection;\r\nuniform vec3 moonDirection;\r\nuniform float moonAngularRadius;\r\nuniform float lunarRadianceScale;\r\nuniform vec3 groundAlbedo;\r\n\r\n#ifdef HAS_SHADOW_LENGTH\r\nuniform sampler2D shadowLengthBuffer;\r\n#endif // HAS_SHADOW_LENGTH\r\n\r\nin vec2 vUv;\r\nin vec3 vCameraPosition;\r\nin vec3 vRayDirection;\r\nin vec3 vEllipsoidCenter;\r\n\r\nlayout(location = 0) out vec4 outputColor;\r\n\r\n#include <mrt_layout>\r\n\r\nbool rayIntersectsGround(const vec3 cameraPosition, const vec3 rayDirection) {\r\n  float r = length(cameraPosition);\r\n  float mu = dot(cameraPosition, rayDirection) / r;\r\n  return mu < 0.0 && r * r * (mu * mu - 1.0) + u_bottom_radius * u_bottom_radius >= 0.0;\r\n}\r\n\r\nvoid main() {\r\n  float shadowLength = 0.0;\r\n  #ifdef HAS_SHADOW_LENGTH\r\n  shadowLength = texture(shadowLengthBuffer, vUv).r;\r\n  #endif // HAS_SHADOW_LENGTH\r\n\r\n  vec3 cameraPosition = vCameraPosition - vEllipsoidCenter;\r\n  vec3 rayDirection = normalize(vRayDirection);\r\n\r\n  #ifdef GROUND_ALBEDO\r\n\r\n  bool intersectsGround = rayIntersectsGround(cameraPosition, rayDirection);\r\n  if (intersectsGround) {\r\n    float distanceToGround = raySphereFirstIntersection(\r\n      cameraPosition,\r\n      rayDirection,\r\n      u_bottom_radius\r\n    );\r\n    vec3 groundPosition = rayDirection * distanceToGround + cameraPosition;\r\n    vec3 surfaceNormal = normalize(groundPosition);\r\n    vec3 skyIrradiance;\r\n    vec3 sunIrradiance = GetSunAndSkyIrradiance(\r\n      cameraPosition,\r\n      surfaceNormal,\r\n      sunDirection,\r\n      skyIrradiance\r\n    );\r\n    vec3 transmittance;\r\n    vec3 inscatter = GetSkyRadianceToPoint(\r\n      cameraPosition,\r\n      u_bottom_radius * surfaceNormal,\r\n      shadowLength,\r\n      sunDirection,\r\n      transmittance\r\n    );\r\n    vec3 radiance = groundAlbedo * RECIPROCAL_PI * (sunIrradiance + skyIrradiance);\r\n    outputColor.rgb = radiance * transmittance + inscatter;\r\n  } else {\r\n    outputColor.rgb = getSkyRadiance(\r\n      cameraPosition,\r\n      rayDirection,\r\n      shadowLength,\r\n      sunDirection,\r\n      moonDirection,\r\n      moonAngularRadius,\r\n      lunarRadianceScale\r\n    );\r\n  }\r\n\r\n  #else // GROUND_ALBEDO\r\n\r\n  outputColor.rgb = getSkyRadiance(\r\n    cameraPosition,\r\n    rayDirection,\r\n    shadowLength,\r\n    sunDirection,\r\n    moonDirection,\r\n    moonAngularRadius,\r\n    lunarRadianceScale\r\n  );\r\n\r\n  #endif // GROUND_ALBEDO\r\n\r\n  outputColor.a = 1.0;\r\n\r\n  #include <mrt_output>\r\n}\r\n';

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\atmosphere\shaders\sky.vert
var sky_default3 = 'precision highp float;\r\nprecision highp sampler3D;\r\n\r\n#include "parameters"\r\n\r\nuniform mat4 inverseProjectionMatrix;\r\nuniform mat4 inverseViewMatrix;\r\nuniform vec3 cameraPosition;\r\nuniform vec3 ellipsoidCenter;\r\nuniform mat4 inverseEllipsoidMatrix;\r\nuniform vec3 altitudeCorrection;\r\n\r\nlayout(location = 0) in vec3 position;\r\n\r\nout vec2 vUv;\r\nout vec3 vCameraPosition;\r\nout vec3 vRayDirection;\r\nout vec3 vEllipsoidCenter;\r\n\r\nvoid getCameraRay(out vec3 origin, out vec3 direction) {\r\n  bool isPerspective = inverseProjectionMatrix[2][3] != 0.0; // 4th entry in the 3rd column\r\n\r\n  if (isPerspective) {\r\n    // Calculate the camera ray for a perspective camera.\r\n    vec4 viewPosition = inverseProjectionMatrix * vec4(position, 1.0);\r\n    vec4 worldDirection = inverseViewMatrix * vec4(viewPosition.xyz, 0.0);\r\n    origin = cameraPosition;\r\n    direction = worldDirection.xyz;\r\n  } else {\r\n    // Unprojected points to calculate direction.\r\n    vec4 nearPoint = inverseProjectionMatrix * vec4(position.xy, -1.0, 1.0);\r\n    vec4 farPoint = inverseProjectionMatrix * vec4(position.xy, -0.9, 1.0);\r\n    nearPoint /= nearPoint.w;\r\n    farPoint /= farPoint.w;\r\n\r\n    // Calculate world values\r\n    vec4 worldDirection = inverseViewMatrix * vec4(farPoint.xyz - nearPoint.xyz, 0.0);\r\n    vec4 worldOrigin = inverseViewMatrix * nearPoint;\r\n\r\n    // Outputs\r\n    direction = worldDirection.xyz;\r\n    origin = worldOrigin.xyz;\r\n  }\r\n}\r\n\r\nvoid main() {\r\n  vUv = position.xy * 0.5 + 0.5;\r\n\r\n  vec3 direction, origin;\r\n  getCameraRay(origin, direction);\r\n\r\n  mat3 rotation = mat3(inverseEllipsoidMatrix);\r\n  vCameraPosition = rotation * origin.xyz * METER_TO_LENGTH_UNIT;\r\n  vRayDirection = rotation * direction.xyz;\r\n  vEllipsoidCenter = (ellipsoidCenter + altitudeCorrection) * METER_TO_LENGTH_UNIT;\r\n\r\n  gl_Position = vec4(position.xy, 1.0, 1.0);\r\n}\r\n';

// source/atmosphere/SkyMaterial.ts
var skyMaterialParametersDefaults = {
  ...atmosphereMaterialParametersBaseDefaults,
  sun: true,
  moon: true,
  moonAngularRadius: 45e-4,
  // ≈ 15.5 arcminutes
  lunarRadianceScale: 1,
  groundAlbedo: new Color4(0)
};
var SkyMaterial = class extends AtmosphereMaterialBase {
  constructor(params) {
    const {
      sun,
      moon,
      moonDirection,
      moonAngularRadius,
      lunarRadianceScale,
      groundAlbedo,
      ...others
    } = { ...skyMaterialParametersDefaults, ...params };
    super({
      name: "SkyMaterial",
      glslVersion: GLSL3,
      vertexShader: resolveIncludes(sky_default3, {
        parameters: parameters_default
      }),
      fragmentShader: resolveIncludes(sky_default2, {
        core: { raySphereIntersection },
        parameters: parameters_default,
        functions: functions_default,
        sky: sky_default
      }),
      ...others,
      uniforms: {
        inverseProjectionMatrix: new Uniform4(new Matrix47()),
        inverseViewMatrix: new Uniform4(new Matrix47()),
        moonDirection: new Uniform4(moonDirection?.clone() ?? new Vector316()),
        moonAngularRadius: new Uniform4(moonAngularRadius),
        lunarRadianceScale: new Uniform4(lunarRadianceScale),
        groundAlbedo: new Uniform4(groundAlbedo?.clone() ?? new Color4(0)),
        shadowLengthBuffer: new Uniform4(null),
        ...others.uniforms
      },
      defines: {
        PERSPECTIVE_CAMERA: "1"
      },
      depthTest: true
    });
    this.shadowLength = null;
    this.sun = sun;
    this.moon = moon;
  }
  onBeforeRender(renderer, scene, camera, geometry, object, group) {
    super.onBeforeRender(renderer, scene, camera, geometry, object, group);
    const { uniforms, defines } = this;
    uniforms.inverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);
    uniforms.inverseViewMatrix.value.copy(camera.matrixWorld);
    const prevPerspectiveCamera = defines.PERSPECTIVE_CAMERA != null;
    const nextPerspectiveCamera = camera.isPerspectiveCamera === true;
    if (nextPerspectiveCamera !== prevPerspectiveCamera) {
      if (nextPerspectiveCamera) {
        defines.PERSPECTIVE_CAMERA = "1";
      } else {
        delete defines.PERSPECTIVE_CAMERA;
      }
      this.needsUpdate = true;
    }
    const color = this.groundAlbedo;
    const prevGroundAlbedo = defines.GROUND_ALBEDO != null;
    const nextGroundAlbedo = color.r !== 0 || color.g !== 0 || color.b !== 0;
    if (nextGroundAlbedo !== prevGroundAlbedo) {
      if (nextGroundAlbedo) {
        this.defines.GROUND_ALBEDO = "1";
      } else {
        delete this.defines.GROUND_ALBEDO;
      }
      this.needsUpdate = true;
    }
    const shadowLength = this.shadowLength;
    const prevShadowLength = defines.HAS_SHADOW_LENGTH != null;
    const nextShadowLength = shadowLength != null;
    if (nextShadowLength !== prevShadowLength) {
      if (nextShadowLength) {
        defines.HAS_SHADOW_LENGTH = "1";
      } else {
        delete defines.HAS_SHADOW_LENGTH;
        uniforms.shadowLengthBuffer.value = null;
      }
      this.needsUpdate = true;
    }
    if (nextShadowLength) {
      uniforms.shadowLengthBuffer.value = shadowLength.map;
    }
  }
  get moonDirection() {
    return this.uniforms.moonDirection.value;
  }
  get moonAngularRadius() {
    return this.uniforms.moonAngularRadius.value;
  }
  set moonAngularRadius(value) {
    this.uniforms.moonAngularRadius.value = value;
  }
  get lunarRadianceScale() {
    return this.uniforms.lunarRadianceScale.value;
  }
  set lunarRadianceScale(value) {
    this.uniforms.lunarRadianceScale.value = value;
  }
  get groundAlbedo() {
    return this.uniforms.groundAlbedo.value;
  }
};
__decorateClass([
  define("SUN")
], SkyMaterial.prototype, "sun", 2);
__decorateClass([
  define("MOON")
], SkyMaterial.prototype, "moon", 2);

// source/atmosphere/StarsGeometry.ts
import {
  BufferGeometry as BufferGeometry3,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  Sphere as Sphere2,
  Vector3 as Vector317
} from "three";
var StarsGeometry = class extends BufferGeometry3 {
  constructor(data) {
    super();
    const int16Array = new Int16Array(data);
    const uint8Array = new Uint8Array(data);
    const int16Buffer = new InterleavedBuffer(int16Array, 5);
    const uint8Buffer = new InterleavedBuffer(uint8Array, 10);
    this.setAttribute(
      "position",
      new InterleavedBufferAttribute(int16Buffer, 3, 0, true)
    );
    this.setAttribute(
      "magnitude",
      new InterleavedBufferAttribute(uint8Buffer, 1, 6, true)
    );
    this.setAttribute(
      "color",
      new InterleavedBufferAttribute(uint8Buffer, 3, 7, true)
    );
    this.boundingSphere = new Sphere2(new Vector317(), 1);
  }
};

// source/atmosphere/StarsMaterial.ts
import {
  GLSL3 as GLSL32,
  Matrix4 as Matrix48,
  Uniform as Uniform5,
  Vector2 as Vector25
} from "three";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\atmosphere\shaders\stars.frag
var stars_default = `precision highp float;\r
precision highp sampler3D;\r
\r
#include "parameters"\r
#include "functions"\r
\r
uniform vec3 sunDirection;\r
\r
in vec3 vCameraPosition;\r
in vec3 vRayDirection;\r
in vec3 vEllipsoidCenter;\r
\r
layout(location = 0) out vec4 outputColor;\r
\r
#include <mrt_layout>\r
\r
in vec3 vColor;\r
\r
void main() {\r
  #if !defined(PERSPECTIVE_CAMERA)\r
  outputColor = vec4(0.0);\r
  discard; // Rendering celestial objects without perspective doesn't make sense.\r
  #endif // !defined(PERSPECTIVE_CAMERA)\r
\r
  #ifdef BACKGROUND\r
  vec3 cameraPosition = vCameraPosition - vEllipsoidCenter;\r
  vec3 rayDirection = normalize(vRayDirection);\r
  float r = length(cameraPosition);\r
  float mu = dot(cameraPosition, rayDirection) / r;\r
\r
  if (RayIntersectsGround(r, mu)) {\r
    discard;\r
  }\r
\r
  vec3 transmittance;\r
  vec3 radiance = GetSkyRadiance(\r
    vCameraPosition - vEllipsoidCenter,\r
    normalize(vRayDirection),\r
    0.0,\r
    sunDirection,\r
    transmittance\r
  );\r
  radiance += transmittance * vColor;\r
  outputColor = vec4(radiance, 1.0);\r
  #else // BACKGROUND\r
  outputColor = vec4(vColor, 1.0);\r
  #endif // BACKGROUND\r
\r
  #include <mrt_output>\r
}\r
`;

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\atmosphere\shaders\stars.vert
var stars_default2 = 'precision highp float;\r\nprecision highp sampler3D;\r\n\r\n#include "parameters"\r\n\r\n#define saturate(x) clamp(x, 0.0, 1.0)\r\n\r\nuniform mat4 projectionMatrix;\r\nuniform mat4 modelViewMatrix;\r\nuniform mat4 viewMatrix;\r\nuniform mat4 matrixWorld;\r\nuniform vec3 cameraPosition;\r\nuniform float cameraFar;\r\nuniform vec3 ellipsoidCenter;\r\nuniform mat4 inverseEllipsoidMatrix;\r\nuniform vec3 altitudeCorrection;\r\nuniform float pointSize;\r\nuniform vec2 magnitudeRange;\r\nuniform float radianceScale;\r\n\r\nlayout(location = 0) in vec3 position;\r\nlayout(location = 1) in float magnitude;\r\nlayout(location = 2) in vec3 color;\r\n\r\nout vec3 vCameraPosition;\r\nout vec3 vRayDirection;\r\nout vec3 vEllipsoidCenter;\r\nout vec3 vColor;\r\n\r\nvoid main() {\r\n  // Magnitude is stored between 0 to 1 within the given range.\r\n  float m = mix(magnitudeRange.x, magnitudeRange.y, magnitude);\r\n  vec3 v = pow(vec3(10.0), -vec3(magnitudeRange, m) / 2.5);\r\n  vColor = vec3(radianceScale * color);\r\n  vColor *= saturate((v.z - v.y) / (v.x - v.y));\r\n\r\n  #ifdef BACKGROUND\r\n  vec3 worldDirection = normalize(matrixWorld * vec4(position, 1.0)).xyz;\r\n  mat3 rotation = mat3(inverseEllipsoidMatrix);\r\n  vCameraPosition = rotation * cameraPosition * METER_TO_LENGTH_UNIT;\r\n  vRayDirection = rotation * worldDirection;\r\n  vEllipsoidCenter = (ellipsoidCenter + altitudeCorrection) * METER_TO_LENGTH_UNIT;\r\n  gl_Position =\r\n    projectionMatrix * viewMatrix * vec4(cameraPosition + worldDirection * cameraFar, 1.0);\r\n  #else // BACKGROUND\r\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\r\n  #endif // BACKGROUND\r\n\r\n  gl_PointSize = pointSize;\r\n}\r\n';

// source/atmosphere/StarsMaterial.ts
var starsMaterialParametersDefaults = {
  ...atmosphereMaterialParametersBaseDefaults,
  pointSize: 1,
  radianceScale: 1,
  background: true
};
var StarsMaterial = class extends AtmosphereMaterialBase {
  constructor(params) {
    const { pointSize, radianceScale, background, ...others } = {
      ...starsMaterialParametersDefaults,
      ...params
    };
    super({
      name: "StarsMaterial",
      glslVersion: GLSL32,
      vertexShader: resolveIncludes(stars_default2, {
        parameters: parameters_default
      }),
      fragmentShader: resolveIncludes(stars_default, {
        parameters: parameters_default,
        functions: functions_default
      }),
      ...others,
      uniforms: {
        projectionMatrix: new Uniform5(new Matrix48()),
        modelViewMatrix: new Uniform5(new Matrix48()),
        viewMatrix: new Uniform5(new Matrix48()),
        matrixWorld: new Uniform5(new Matrix48()),
        cameraFar: new Uniform5(0),
        pointSize: new Uniform5(0),
        magnitudeRange: new Uniform5(new Vector25(-2, 8)),
        radianceScale: new Uniform5(radianceScale),
        ...others.uniforms
      },
      defines: {
        PERSPECTIVE_CAMERA: "1"
      }
    });
    this.pointSize = pointSize;
    this.background = background;
  }
  onBeforeRender(renderer, scene, camera, geometry, object, group) {
    super.onBeforeRender(renderer, scene, camera, geometry, object, group);
    const uniforms = this.uniforms;
    uniforms.projectionMatrix.value.copy(camera.projectionMatrix);
    uniforms.modelViewMatrix.value.copy(camera.modelViewMatrix);
    uniforms.viewMatrix.value.copy(camera.matrixWorldInverse);
    uniforms.matrixWorld.value.copy(object.matrixWorld);
    uniforms.cameraFar.value = camera.far;
    uniforms.pointSize.value = this.pointSize * renderer.getPixelRatio();
    const isPerspectiveCamera = camera.isPerspectiveCamera === true;
    if (this.defines.PERSPECTIVE_CAMERA != null !== isPerspectiveCamera) {
      if (isPerspectiveCamera) {
        this.defines.PERSPECTIVE_CAMERA = "1";
      } else {
        delete this.defines.PERSPECTIVE_CAMERA;
      }
      this.needsUpdate = true;
    }
  }
  get magnitudeRange() {
    return this.uniforms.magnitudeRange.value;
  }
  get radianceScale() {
    return this.uniforms.radianceScale.value;
  }
  set radianceScale(value) {
    this.uniforms.radianceScale.value = value;
  }
};
__decorateClass([
  define("BACKGROUND")
], StarsMaterial.prototype, "background", 2);

// source/atmosphere/SunDirectionalLight.ts
import { DirectionalLight, Matrix4 as Matrix49, Vector3 as Vector318 } from "three";
var vectorScratch8 = /* @__PURE__ */ new Vector318();
var matrixScratch4 = /* @__PURE__ */ new Matrix49();
var sunDirectionalLightParametersDefaults = {
  ellipsoid: Ellipsoid.WGS84,
  correctAltitude: true,
  photometric: true,
  distance: 1
};
var SunDirectionalLight = class extends DirectionalLight {
  constructor(params, atmosphere = AtmosphereParameters.DEFAULT) {
    super();
    this.atmosphere = atmosphere;
    this.ellipsoidCenter = new Vector318();
    this.ellipsoidMatrix = new Matrix49();
    const {
      irradianceTexture = null,
      ellipsoid,
      correctAltitude,
      photometric,
      sunDirection,
      distance
    } = { ...sunDirectionalLightParametersDefaults, ...params };
    this.transmittanceTexture = irradianceTexture;
    this.ellipsoid = ellipsoid;
    this.correctAltitude = correctAltitude;
    this.photometric = photometric;
    this.sunDirection = sunDirection?.clone() ?? new Vector318();
    this.distance = distance;
  }
  update() {
    this.position.copy(this.sunDirection).applyMatrix4(this.ellipsoidMatrix).normalize().multiplyScalar(this.distance).add(this.target.position);
    if (this.transmittanceTexture == null) {
      return;
    }
    const inverseEllipsoidMatrix = matrixScratch4.copy(this.ellipsoidMatrix).invert();
    const cameraPositionECEF = this.target.getWorldPosition(vectorScratch8).applyMatrix4(inverseEllipsoidMatrix).sub(this.ellipsoidCenter);
    getSunLightColor(
      this.transmittanceTexture,
      cameraPositionECEF,
      this.sunDirection,
      this.color,
      {
        ellipsoid: this.ellipsoid,
        correctAltitude: this.correctAltitude,
        photometric: this.photometric
      },
      this.atmosphere
    );
  }
};

// source/clouds/CascadedShadowMaps.ts
import {
  Box3 as Box32,
  Matrix4 as Matrix410,
  Object3D,
  Vector2 as Vector26,
  Vector3 as Vector320
} from "three";

// source/clouds/helpers/FrustumCorners.ts
import { Vector3 as Vector319 } from "three";
var FrustumCorners = class _FrustumCorners {
  constructor(camera, far) {
    this.near = [new Vector319(), new Vector319(), new Vector319(), new Vector319()];
    this.far = [new Vector319(), new Vector319(), new Vector319(), new Vector319()];
    if (camera != null && far != null) {
      this.setFromCamera(camera, far);
    }
  }
  clone() {
    return new _FrustumCorners().copy(this);
  }
  copy(other) {
    for (let i = 0; i < 4; ++i) {
      this.near[i].copy(other.near[i]);
      this.far[i].copy(other.far[i]);
    }
    return this;
  }
  setFromCamera(camera, far) {
    const isOrthographic = camera.isOrthographicCamera === true;
    const inverseProjectionMatrix = camera.projectionMatrixInverse;
    this.near[0].set(1, 1, -1);
    this.near[1].set(1, -1, -1);
    this.near[2].set(-1, -1, -1);
    this.near[3].set(-1, 1, -1);
    for (let i = 0; i < 4; ++i) {
      this.near[i].applyMatrix4(inverseProjectionMatrix);
    }
    this.far[0].set(1, 1, 1);
    this.far[1].set(1, -1, 1);
    this.far[2].set(-1, -1, 1);
    this.far[3].set(-1, 1, 1);
    for (let i = 0; i < 4; ++i) {
      const corner = this.far[i];
      corner.applyMatrix4(inverseProjectionMatrix);
      const absZ = Math.abs(corner.z);
      if (isOrthographic) {
        corner.z *= Math.min(far / absZ, 1);
      } else {
        corner.multiplyScalar(Math.min(far / absZ, 1));
      }
    }
    return this;
  }
  split(clipDepths, result = []) {
    for (let index = 0; index < clipDepths.length; ++index) {
      const frustum = result[index] ??= new _FrustumCorners();
      if (index === 0) {
        for (let i = 0; i < 4; ++i) {
          frustum.near[i].copy(this.near[i]);
        }
      } else {
        for (let i = 0; i < 4; ++i) {
          frustum.near[i].lerpVectors(
            this.near[i],
            this.far[i],
            clipDepths[index - 1]
          );
        }
      }
      if (index === clipDepths.length - 1) {
        for (let i = 0; i < 4; ++i) {
          frustum.far[i].copy(this.far[i]);
        }
      } else {
        for (let i = 0; i < 4; ++i) {
          frustum.far[i].lerpVectors(
            this.near[i],
            this.far[i],
            clipDepths[index]
          );
        }
      }
    }
    result.length = clipDepths.length;
    return result;
  }
  applyMatrix4(matrix) {
    for (let i = 0; i < 4; ++i) {
      this.near[i].applyMatrix4(matrix);
      this.far[i].applyMatrix4(matrix);
    }
    return this;
  }
};

// source/clouds/helpers/splitFrustum.ts
var modes = {
  uniform: (count, near, far, _, result = []) => {
    for (let i = 0; i < count; ++i) {
      result[i] = (near + (far - near) * (i + 1) / count) / far;
    }
    result.length = count;
    return result;
  },
  logarithmic: (count, near, far, _, result = []) => {
    for (let i = 0; i < count; ++i) {
      result[i] = near * (far / near) ** ((i + 1) / count) / far;
    }
    result.length = count;
    return result;
  },
  practical: (count, near, far, lambda = 0.5, result = []) => {
    for (let i = 0; i < count; ++i) {
      const uniform = (near + (far - near) * (i + 1) / count) / far;
      const logarithmic = near * (far / near) ** ((i + 1) / count) / far;
      result[i] = lerp(uniform, logarithmic, lambda);
    }
    result.length = count;
    return result;
  }
};
function splitFrustum(mode, count, near, far, lambda, result = []) {
  return modes[mode](count, near, far, lambda, result);
}

// source/clouds/CascadedShadowMaps.ts
var vectorScratch18 = /* @__PURE__ */ new Vector320();
var vectorScratch28 = /* @__PURE__ */ new Vector320();
var matrixScratch1 = /* @__PURE__ */ new Matrix410();
var matrixScratch22 = /* @__PURE__ */ new Matrix410();
var frustumScratch = /* @__PURE__ */ new FrustumCorners();
var boxScratch = /* @__PURE__ */ new Box32();
var cascadedShadowMapsDefaults = {
  maxFar: null,
  farScale: 1,
  splitMode: "practical",
  splitLambda: 0.5,
  margin: 0,
  fade: true
};
var CascadedShadowMaps = class {
  constructor(options) {
    this.cascades = [];
    this.mapSize = new Vector26();
    this.cameraFrustum = new FrustumCorners();
    this.frusta = [];
    this.splits = [];
    this._far = 0;
    const {
      cascadeCount,
      mapSize,
      maxFar,
      farScale,
      splitMode,
      splitLambda,
      margin,
      fade
    } = {
      ...cascadedShadowMapsDefaults,
      ...options
    };
    this.cascadeCount = cascadeCount;
    this.mapSize.copy(mapSize);
    this.maxFar = maxFar;
    this.farScale = farScale;
    this.splitMode = splitMode;
    this.splitLambda = splitLambda;
    this.margin = margin;
    this.fade = fade;
  }
  get cascadeCount() {
    return this.cascades.length;
  }
  set cascadeCount(value) {
    if (value !== this.cascadeCount) {
      for (let i = 0; i < value; ++i) {
        this.cascades[i] ??= {
          interval: new Vector26(),
          matrix: new Matrix410(),
          inverseMatrix: new Matrix410(),
          projectionMatrix: new Matrix410(),
          inverseProjectionMatrix: new Matrix410(),
          viewMatrix: new Matrix410(),
          inverseViewMatrix: new Matrix410()
        };
      }
      this.cascades.length = value;
    }
  }
  get far() {
    return this._far;
  }
  updateIntervals(camera) {
    const cascadeCount = this.cascadeCount;
    const splits = this.splits;
    const far = this.far;
    splitFrustum(
      this.splitMode,
      cascadeCount,
      camera.near,
      far,
      this.splitLambda,
      splits
    );
    this.cameraFrustum.setFromCamera(camera, far);
    this.cameraFrustum.split(splits, this.frusta);
    const cascades = this.cascades;
    for (let i = 0; i < cascadeCount; ++i) {
      cascades[i].interval.set(splits[i - 1] ?? 0, splits[i] ?? 0);
    }
  }
  getFrustumRadius(camera, frustum) {
    const nearCorners = frustum.near;
    const farCorners = frustum.far;
    let diagonalLength = Math.max(
      farCorners[0].distanceTo(farCorners[2]),
      farCorners[0].distanceTo(nearCorners[2])
    );
    if (this.fade) {
      const near = camera.near;
      const far = this.far;
      const distance = farCorners[0].z / (far - near);
      diagonalLength += 0.25 * distance ** 2 * (far - near);
    }
    return diagonalLength * 0.5;
  }
  updateMatrices(camera, sunDirection, distance = 1) {
    const lightOrientationMatrix = matrixScratch1.lookAt(
      vectorScratch18.setScalar(0),
      vectorScratch28.copy(sunDirection).multiplyScalar(-1),
      Object3D.DEFAULT_UP
    );
    const cameraToLightMatrix = matrixScratch22.multiplyMatrices(
      matrixScratch22.copy(lightOrientationMatrix).invert(),
      camera.matrixWorld
    );
    const frusta = this.frusta;
    const cascades = this.cascades;
    invariant(frusta.length === cascades.length);
    const margin = this.margin;
    const mapSize = this.mapSize;
    for (let i = 0; i < frusta.length; ++i) {
      const frustum = frusta[i];
      const cascade = cascades[i];
      const radius = this.getFrustumRadius(camera, frusta[i]);
      const left = -radius;
      const right = radius;
      const top = radius;
      const bottom = -radius;
      cascade.projectionMatrix.makeOrthographic(
        left,
        right,
        top,
        bottom,
        -this.margin,
        // near
        radius * 2 + this.margin
        // far
      );
      const { near, far } = frustumScratch.copy(frustum).applyMatrix4(cameraToLightMatrix);
      const bbox = boxScratch.makeEmpty();
      for (let j = 0; j < 4; j++) {
        bbox.expandByPoint(near[j]);
        bbox.expandByPoint(far[j]);
      }
      const center = bbox.getCenter(vectorScratch18);
      center.z = bbox.max.z + margin;
      const texelWidth = (right - left) / mapSize.width;
      const texelHeight = (top - bottom) / mapSize.height;
      center.x = Math.round(center.x / texelWidth) * texelWidth;
      center.y = Math.round(center.y / texelHeight) * texelHeight;
      center.applyMatrix4(lightOrientationMatrix);
      const position = vectorScratch28.copy(sunDirection).multiplyScalar(distance).add(center);
      cascade.inverseViewMatrix.lookAt(center, position, Object3D.DEFAULT_UP).setPosition(position);
    }
  }
  update(camera, sunDirection, distance) {
    this._far = this.maxFar != null ? Math.min(this.maxFar, camera.far * this.farScale) : camera.far * this.farScale;
    this.updateIntervals(camera);
    this.updateMatrices(camera, sunDirection, distance);
    const cascades = this.cascades;
    const cascadeCount = this.cascadeCount;
    for (let i = 0; i < cascadeCount; ++i) {
      const {
        matrix,
        inverseMatrix,
        projectionMatrix,
        inverseProjectionMatrix,
        viewMatrix,
        inverseViewMatrix
      } = cascades[i];
      inverseProjectionMatrix.copy(projectionMatrix).invert();
      viewMatrix.copy(inverseViewMatrix).invert();
      matrix.copy(projectionMatrix).multiply(viewMatrix);
      inverseMatrix.copy(inverseViewMatrix).multiply(inverseProjectionMatrix);
    }
  }
};

// source/clouds/CloudsPass.ts
import { ShaderPass as ShaderPass2 } from "postprocessing";
import {
  HalfFloatType as HalfFloatType4,
  LinearFilter as LinearFilter3,
  RedFormat as RedFormat3,
  WebGLRenderTarget as WebGLRenderTarget2
} from "three";

// source/clouds/CloudsMaterial.ts
import {
  GLSL3 as GLSL33,
  Matrix4 as Matrix411,
  Uniform as Uniform6,
  Vector2 as Vector29,
  Vector3 as Vector321,
  Vector4
} from "three";

// source/atmosphere/shaders/index.ts
var functions = functions_default;
var parameters = parameters_default;

// source/clouds/bayer.ts
import { Vector2 as Vector27 } from "three";
var bayerIndices = [
  0,
  8,
  2,
  10,
  12,
  4,
  14,
  6,
  3,
  11,
  1,
  9,
  15,
  7,
  13,
  5
];
var bayerOffsets = /* @__PURE__ */ bayerIndices.reduce(
  (result, _, index) => {
    const offset = new Vector27();
    for (let i = 0; i < 16; ++i) {
      if (bayerIndices[i] === index) {
        offset.set((i % 4 + 0.5) / 4, (Math.floor(i / 4) + 0.5) / 4);
        break;
      }
    }
    return [...result, offset];
  },
  []
);

// source/clouds/qualityPresets.ts
import { Vector2 as Vector28 } from "three";
var values = {
  resolutionScale: 1,
  lightShafts: true,
  shapeDetail: true,
  turbulence: true,
  haze: true,
  clouds: {
    multiScatteringOctaves: 8,
    accurateSunSkyIrradiance: true,
    accuratePhaseFunction: false,
    // Primary raymarch
    maxIterationCount: 500,
    minStepSize: 50,
    maxStepSize: 1e3,
    maxRayDistance: 2e5,
    perspectiveStepScale: 1.01,
    minDensity: 1e-5,
    minExtinction: 1e-5,
    minTransmittance: 0.01,
    // Secondary raymarch
    maxIterationCountToGround: 3,
    maxIterationCountToSun: 2,
    minSecondaryStepSize: 100,
    secondaryStepScale: 2,
    // Shadow length
    maxShadowLengthIterationCount: 500,
    minShadowLengthStepSize: 50,
    maxShadowLengthRayDistance: 2e5
  },
  shadow: {
    cascadeCount: 3,
    mapSize: /* @__PURE__ */ new Vector28(512, 512),
    // Primary raymarch
    maxIterationCount: 50,
    minStepSize: 100,
    maxStepSize: 1e3,
    minDensity: 1e-5,
    minExtinction: 1e-5,
    minTransmittance: 1e-4
  }
};
var defaults = values;
var qualityPresets = {
  // TODO: We cloud decrease multi-scattering octaves for lower quality presets,
  // but it leads to a loss of higher frequency scattering, making it darker
  // overall, which suggests the need for a fudge factor to scale the radiance.
  low: {
    ...defaults,
    lightShafts: false,
    // Expensive
    shapeDetail: false,
    // Expensive
    turbulence: false,
    // Expensive
    clouds: {
      ...defaults.clouds,
      accurateSunSkyIrradiance: false,
      // Greatly reduces texel reads.
      maxIterationCount: 200,
      minStepSize: 100,
      maxRayDistance: 1e5,
      minDensity: 1e-4,
      minExtinction: 1e-4,
      minTransmittance: 0.1,
      // Makes the primary march terminate earlier.
      maxIterationCountToGround: 0,
      // Expensive
      maxIterationCountToSun: 1
      // Only 1 march makes big difference
    },
    shadow: {
      ...defaults.shadow,
      maxIterationCount: 25,
      minDensity: 1e-4,
      minExtinction: 1e-4,
      minTransmittance: 0.01,
      // Makes the primary march terminate earlier.
      cascadeCount: 2,
      // Obvious
      mapSize: /* @__PURE__ */ new Vector28(256, 256)
      // Obvious
    }
  },
  medium: {
    ...defaults,
    lightShafts: false,
    // Expensive
    turbulence: false,
    // Expensive
    clouds: {
      ...defaults.clouds,
      minDensity: 1e-4,
      minExtinction: 1e-4,
      accurateSunSkyIrradiance: false,
      maxIterationCountToSun: 2,
      maxIterationCountToGround: 1
    },
    shadow: {
      ...defaults.shadow,
      minDensity: 1e-4,
      minExtinction: 1e-4,
      mapSize: /* @__PURE__ */ new Vector28(256, 256)
    }
  },
  high: defaults,
  // Consider high quality preset as default.
  ultra: {
    ...defaults,
    clouds: {
      ...defaults.clouds,
      minStepSize: 10
    },
    shadow: {
      ...defaults.shadow,
      mapSize: /* @__PURE__ */ new Vector28(1024, 1024)
    }
  }
};

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\clouds.frag
var clouds_default = `precision highp float;\r
precision highp sampler3D;\r
precision highp sampler2DArray;\r
\r
#include <common>\r
#include <packing>\r
\r
#include "core/depth"\r
#include "core/math"\r
#include "core/turbo"\r
#include "core/generators"\r
#include "core/raySphereIntersection"\r
#include "core/cascadedShadowMaps"\r
#include "core/interleavedGradientNoise"\r
#include "core/vogelDisk"\r
#include "atmosphere/parameters"\r
#include "atmosphere/functions"\r
#include "types"\r
#include "parameters"\r
#include "clouds"\r
\r
#if !defined(RECIPROCAL_PI4)\r
#define RECIPROCAL_PI4 (0.07957747154594767)\r
#endif // !defined(RECIPROCAL_PI4)\r
\r
uniform sampler2D depthBuffer;\r
uniform mat4 viewMatrix;\r
uniform mat4 reprojectionMatrix;\r
uniform float cameraNear;\r
uniform float cameraFar;\r
uniform float cameraHeight;\r
uniform vec2 temporalJitter;\r
uniform vec2 targetUvScale;\r
uniform float mipLevelScale;\r
\r
// Scattering\r
const vec2 scatterAnisotropy = vec2(SCATTER_ANISOTROPY_1, SCATTER_ANISOTROPY_2);\r
const float scatterAnisotropyMix = SCATTER_ANISOTROPY_MIX;\r
uniform float skyIrradianceScale;\r
uniform float groundIrradianceScale;\r
uniform float powderScale;\r
uniform float powderExponent;\r
\r
// Primary raymarch\r
uniform int maxIterationCount;\r
uniform float minStepSize;\r
uniform float maxStepSize;\r
uniform float maxRayDistance;\r
uniform float perspectiveStepScale;\r
\r
// Secondary raymarch\r
uniform int maxIterationCountToSun;\r
uniform int maxIterationCountToGround;\r
uniform float minSecondaryStepSize;\r
uniform float secondaryStepScale;\r
\r
// Beer shadow map\r
uniform sampler2DArray shadowBuffer;\r
uniform vec2 shadowTexelSize;\r
uniform vec2 shadowIntervals[SHADOW_CASCADE_COUNT];\r
uniform mat4 shadowMatrices[SHADOW_CASCADE_COUNT];\r
uniform float shadowFar;\r
uniform float maxShadowFilterRadius;\r
\r
// Shadow length\r
#ifdef SHADOW_LENGTH\r
uniform int maxShadowLengthIterationCount;\r
uniform float minShadowLengthStepSize;\r
uniform float maxShadowLengthRayDistance;\r
#endif // SHADOW_LENGTH\r
\r
in vec2 vUv;\r
in vec3 vCameraPosition;\r
in vec3 vCameraDirection; // Direction to the center of screen\r
in vec3 vRayDirection; // Direction to the texel\r
in vec3 vEllipsoidCenter;\r
in GroundIrradiance vGroundIrradiance;\r
in CloudsIrradiance vCloudsIrradiance;\r
\r
layout(location = 0) out vec4 outputColor;\r
layout(location = 1) out vec3 outputDepthVelocity;\r
#ifdef SHADOW_LENGTH\r
layout(location = 2) out float outputShadowLength;\r
#endif // SHADOW_LENGTH\r
\r
float readDepth(const vec2 uv) {\r
  #if DEPTH_PACKING == 3201\r
  return unpackRGBAToDepth(texture(depthBuffer, uv));\r
  #else // DEPTH_PACKING == 3201\r
  return texture(depthBuffer, uv).r;\r
  #endif // DEPTH_PACKING == 3201\r
}\r
\r
float getViewZ(const float depth) {\r
  #ifdef PERSPECTIVE_CAMERA\r
  return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);\r
  #else // PERSPECTIVE_CAMERA\r
  return orthographicDepthToViewZ(depth, cameraNear, cameraFar);\r
  #endif // PERSPECTIVE_CAMERA\r
}\r
\r
vec3 ECEFToWorld(const vec3 positionECEF) {\r
  return mat3(ellipsoidMatrix) * (positionECEF + vEllipsoidCenter);\r
}\r
\r
vec2 getShadowUv(const vec3 worldPosition, const int cascadeIndex) {\r
  vec4 clip = shadowMatrices[cascadeIndex] * vec4(worldPosition, 1.0);\r
  clip /= clip.w;\r
  return clip.xy * 0.5 + 0.5;\r
}\r
\r
float getDistanceToShadowTop(const vec3 rayPosition) {\r
  // Distance to the top of the shadows along the sun direction, which matches\r
  // the ray origin of BSM.\r
  return raySphereSecondIntersection(\r
    rayPosition,\r
    sunDirection,\r
    vec3(0.0),\r
    bottomRadius + shadowTopHeight\r
  );\r
}\r
\r
#ifdef DEBUG_SHOW_CASCADES\r
\r
const vec3 cascadeColors[4] = vec3[4](\r
  vec3(1.0, 0.0, 0.0),\r
  vec3(0.0, 1.0, 0.0),\r
  vec3(0.0, 0.0, 1.0),\r
  vec3(1.0, 1.0, 0.0)\r
);\r
\r
vec3 getCascadeColor(const vec3 rayPosition) {\r
  vec3 worldPosition = ECEFToWorld(rayPosition);\r
  int cascadeIndex = getCascadeIndex(\r
    viewMatrix,\r
    worldPosition,\r
    shadowIntervals,\r
    cameraNear,\r
    shadowFar\r
  );\r
  vec2 uv = getShadowUv(worldPosition, cascadeIndex);\r
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {\r
    return vec3(1.0);\r
  }\r
  return cascadeColors[cascadeIndex];\r
}\r
\r
vec3 getFadedCascadeColor(const vec3 rayPosition, const float jitter) {\r
  vec3 worldPosition = ECEFToWorld(rayPosition);\r
  int cascadeIndex = getFadedCascadeIndex(\r
    viewMatrix,\r
    worldPosition,\r
    shadowIntervals,\r
    cameraNear,\r
    shadowFar,\r
    jitter\r
  );\r
  return cascadeIndex >= 0\r
    ? cascadeColors[cascadeIndex]\r
    : vec3(1.0);\r
}\r
\r
#endif // DEBUG_SHOW_CASCADES\r
\r
float readShadowOpticalDepth(\r
  const vec2 uv,\r
  const float distanceToTop,\r
  const float distanceOffset,\r
  const int cascadeIndex\r
) {\r
  // r: frontDepth, g: meanExtinction, b: maxOpticalDepth, a: maxOpticalDepthTail\r
  // Also see the discussion here: https://x.com/shotamatsuda/status/1885322308908442106\r
  vec4 shadow = texture(shadowBuffer, vec3(uv, float(cascadeIndex)));\r
  float distanceToFront = max(0.0, distanceToTop - distanceOffset - shadow.r);\r
  return min(shadow.b + shadow.a, shadow.g * distanceToFront);\r
}\r
\r
float sampleShadowOpticalDepthPCF(\r
  const vec3 worldPosition,\r
  const float distanceToTop,\r
  const float distanceOffset,\r
  const float radius,\r
  const int cascadeIndex\r
) {\r
  vec2 uv = getShadowUv(worldPosition, cascadeIndex);\r
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {\r
    return 0.0;\r
  }\r
  if (radius < 0.1) {\r
    return readShadowOpticalDepth(uv, distanceToTop, distanceOffset, cascadeIndex);\r
  }\r
  float sum = 0.0;\r
  vec2 offset;\r
  #pragma unroll_loop_start\r
  for (int i = 0; i < 16; ++i) {\r
    #if UNROLLED_LOOP_INDEX < SHADOW_SAMPLE_COUNT\r
    offset = vogelDisk(\r
      UNROLLED_LOOP_INDEX,\r
      SHADOW_SAMPLE_COUNT,\r
      interleavedGradientNoise(gl_FragCoord.xy + temporalJitter * resolution) * PI2\r
    );\r
    sum += readShadowOpticalDepth(\r
      uv + offset * radius * shadowTexelSize,\r
      distanceToTop,\r
      distanceOffset,\r
      cascadeIndex\r
    );\r
    #endif // UNROLLED_LOOP_INDEX < SHADOW_SAMPLE_COUNT\r
  }\r
  #pragma unroll_loop_end\r
  return sum / float(SHADOW_SAMPLE_COUNT);\r
}\r
\r
float sampleShadowOpticalDepth(\r
  const vec3 rayPosition,\r
  const float distanceOffset,\r
  const float radius,\r
  const float jitter\r
) {\r
  float distanceToTop = getDistanceToShadowTop(rayPosition);\r
  if (distanceToTop <= 0.0) {\r
    return 0.0;\r
  }\r
  vec3 worldPosition = ECEFToWorld(rayPosition);\r
  int cascadeIndex = getFadedCascadeIndex(\r
    viewMatrix,\r
    worldPosition,\r
    shadowIntervals,\r
    cameraNear,\r
    shadowFar,\r
    jitter\r
  );\r
  return cascadeIndex >= 0\r
    ? sampleShadowOpticalDepthPCF(\r
      worldPosition,\r
      distanceToTop,\r
      distanceOffset,\r
      radius,\r
      cascadeIndex\r
    )\r
    : 0.0;\r
}\r
\r
#ifdef DEBUG_SHOW_SHADOW_MAP\r
vec4 getCascadedShadowMaps(vec2 uv) {\r
  vec4 coord = vec4(vUv, vUv - 0.5) * 2.0;\r
  vec4 shadow = vec4(0.0);\r
  if (uv.y > 0.5) {\r
    if (uv.x < 0.5) {\r
      shadow = texture(shadowBuffer, vec3(coord.xw, 0.0));\r
    } else {\r
      #if SHADOW_CASCADE_COUNT > 1\r
      shadow = texture(shadowBuffer, vec3(coord.zw, 1.0));\r
      #endif // SHADOW_CASCADE_COUNT > 1\r
    }\r
  } else {\r
    if (uv.x < 0.5) {\r
      #if SHADOW_CASCADE_COUNT > 2\r
      shadow = texture(shadowBuffer, vec3(coord.xy, 2.0));\r
      #endif // SHADOW_CASCADE_COUNT > 2\r
    } else {\r
      #if SHADOW_CASCADE_COUNT > 3\r
      shadow = texture(shadowBuffer, vec3(coord.zy, 3.0));\r
      #endif // SHADOW_CASCADE_COUNT > 3\r
    }\r
  }\r
\r
  #if !defined(DEBUG_SHOW_SHADOW_MAP_TYPE)\r
  #define DEBUG_SHOW_SHADOW_MAP_TYPE (0)\r
  #endif // !defined(DEBUG_SHOW_SHADOW_MAP_TYPE\r
\r
  const float frontDepthScale = 1e-5;\r
  const float meanExtinctionScale = 10.0;\r
  const float maxOpticalDepthScale = 0.01;\r
  vec3 color;\r
  #if DEBUG_SHOW_SHADOW_MAP_TYPE == 1\r
  color = vec3(shadow.r * frontDepthScale);\r
  #elif DEBUG_SHOW_SHADOW_MAP_TYPE == 2\r
  color = vec3(shadow.g * meanExtinctionScale);\r
  #elif DEBUG_SHOW_SHADOW_MAP_TYPE == 3\r
  color = vec3((shadow.b + shadow.a) * maxOpticalDepthScale);\r
  #else // DEBUG_SHOW_SHADOW_MAP_TYPE\r
  color =\r
    (shadow.rgb + vec3(0.0, 0.0, shadow.a)) *\r
    vec3(frontDepthScale, meanExtinctionScale, maxOpticalDepthScale);\r
  #endif // DEBUG_SHOW_SHADOW_MAP_TYPE\r
  return vec4(color, 1.0);\r
}\r
#endif // DEBUG_SHOW_SHADOW_MAP\r
\r
vec2 henyeyGreenstein(const vec2 g, const float cosTheta) {\r
  vec2 g2 = g * g;\r
  // prettier-ignore\r
  return RECIPROCAL_PI4 *\r
    ((1.0 - g2) / max(vec2(1e-7), pow(1.0 + g2 - 2.0 * g * cosTheta, vec2(1.5))));\r
}\r
\r
#ifdef ACCURATE_PHASE_FUNCTION\r
\r
float draine(float u, float g, float a) {\r
  float g2 = g * g;\r
  // prettier-ignore\r
  return (1.0 - g2) *\r
    (1.0 + a * u * u) /\r
    (4.0 * (1.0 + a * (1.0 + 2.0 * g2) / 3.0) * PI * pow(1.0 + g2 - 2.0 * g * u, 1.5));\r
}\r
\r
// Numerically-fitted large particles (d=10) phase function It won't be\r
// plausible without a more precise multiple scattering.\r
// Reference: https://research.nvidia.com/labs/rtr/approximate-mie/\r
float phaseFunction(const float cosTheta, const float attenuation) {\r
  const float gHG = 0.988176691700256; // exp(-0.0990567/(d-1.67154))\r
  const float gD = 0.5556712547839497; // exp(-2.20679/(d+3.91029) - 0.428934)\r
  const float alpha = 21.995520856274638; // exp(3.62489 - 8.29288/(d+5.52825))\r
  const float weight = 0.4819554318404214; // exp(-0.599085/(d-0.641583)-0.665888)\r
  return mix(\r
    henyeyGreenstein(vec2(gHG) * attenuation, cosTheta).x,\r
    draine(cosTheta, gD * attenuation, alpha),\r
    weight\r
  );\r
}\r
\r
#else // ACCURATE_PHASE_FUNCTION\r
\r
float phaseFunction(const float cosTheta, const float attenuation) {\r
  const vec2 g = scatterAnisotropy;\r
  const vec2 weights = vec2(1.0 - scatterAnisotropyMix, scatterAnisotropyMix);\r
  // A similar approximation is described in the Frostbite's paper, where phase\r
  // angle is attenuated instead of anisotropy.\r
  return dot(henyeyGreenstein(g * attenuation, cosTheta), weights);\r
}\r
\r
#endif // ACCURATE_PHASE_FUNCTION\r
\r
float phaseFunction(const float cosTheta) {\r
  return phaseFunction(cosTheta, 1.0);\r
}\r
\r
float marchOpticalDepth(\r
  const vec3 rayOrigin,\r
  const vec3 rayDirection,\r
  const int maxIterationCount,\r
  const float mipLevel,\r
  const float jitter,\r
  out float rayDistance\r
) {\r
  int iterationCount = int(\r
    max(0.0, remap(mipLevel, 0.0, 1.0, float(maxIterationCount + 1), 1.0) - jitter)\r
  );\r
  if (iterationCount == 0) {\r
    // Fudge factor to approximate the mean optical depth.\r
    // TODO: Remove it.\r
    return 0.5;\r
  }\r
  float stepSize = minSecondaryStepSize / float(iterationCount);\r
  float nextDistance = stepSize * jitter;\r
  float opticalDepth = 0.0;\r
  for (int i = 0; i < iterationCount; ++i) {\r
    rayDistance = nextDistance;\r
    vec3 position = rayDistance * rayDirection + rayOrigin;\r
    vec2 uv = getGlobeUv(position);\r
    float height = length(position) - bottomRadius;\r
    WeatherSample weather = sampleWeather(uv, height, mipLevel);\r
    MediaSample media = sampleMedia(weather, position, uv, mipLevel, jitter);\r
    opticalDepth += media.extinction * stepSize;\r
    nextDistance += stepSize;\r
    stepSize *= secondaryStepScale;\r
  }\r
  return opticalDepth;\r
}\r
\r
float marchOpticalDepth(\r
  const vec3 rayOrigin,\r
  const vec3 rayDirection,\r
  const int maxIterationCount,\r
  const float mipLevel,\r
  const float jitter\r
) {\r
  float rayDistance;\r
  return marchOpticalDepth(\r
    rayOrigin,\r
    rayDirection,\r
    maxIterationCount,\r
    mipLevel,\r
    jitter,\r
    rayDistance\r
  );\r
}\r
\r
float approximateMultipleScattering(const float opticalDepth, const float cosTheta) {\r
  // Multiple scattering approximation\r
  // See: https://fpsunflower.github.io/ckulla/data/oz_volumes.pdf\r
  // a: attenuation, b: contribution, c: phase attenuation\r
  vec3 coeffs = vec3(1.0); // [a, b, c]\r
  const vec3 attenuation = vec3(0.5, 0.5, 0.5); // Should satisfy a <= b\r
  float scattering = 0.0;\r
  float beerLambert;\r
  #pragma unroll_loop_start\r
  for (int i = 0; i < 12; ++i) {\r
    #if UNROLLED_LOOP_INDEX < MULTI_SCATTERING_OCTAVES\r
    beerLambert = exp(-opticalDepth * coeffs.y);\r
    scattering += coeffs.x * beerLambert * phaseFunction(cosTheta, coeffs.z);\r
    coeffs *= attenuation;\r
    #endif // UNROLLED_LOOP_INDEX < MULTI_SCATTERING_OCTAVES\r
  }\r
  #pragma unroll_loop_end\r
  return scattering;\r
}\r
\r
// TODO: Construct spherical harmonics of degree 2 using 2 sample points\r
// positioned near the horizon occlusion points on the sun direction plane.\r
vec3 getGroundSunSkyIrradiance(\r
  const vec3 position,\r
  const vec3 surfaceNormal,\r
  const float height,\r
  out vec3 skyIrradiance\r
) {\r
  #ifdef ACCURATE_SUN_SKY_IRRADIANCE\r
  return GetSunAndSkyIrradiance(\r
    (position - surfaceNormal * height) * METER_TO_LENGTH_UNIT,\r
    surfaceNormal,\r
    sunDirection,\r
    skyIrradiance\r
  );\r
  #else // ACCURATE_SUN_SKY_IRRADIANCE\r
  skyIrradiance = vGroundIrradiance.sky;\r
  return vGroundIrradiance.sun;\r
  #endif // ACCURATE_SUN_SKY_IRRADIANCE\r
}\r
\r
vec3 getCloudsSunSkyIrradiance(const vec3 position, const float height, out vec3 skyIrradiance) {\r
  #ifdef ACCURATE_SUN_SKY_IRRADIANCE\r
  return GetSunAndSkyIrradianceForParticle(\r
    position * METER_TO_LENGTH_UNIT,\r
    sunDirection,\r
    skyIrradiance\r
  );\r
  #else // ACCURATE_SUN_SKY_IRRADIANCE\r
  float alpha = remapClamped(height, minHeight, maxHeight);\r
  skyIrradiance = mix(vCloudsIrradiance.minSky, vCloudsIrradiance.maxSky, alpha);\r
  return mix(vCloudsIrradiance.minSun, vCloudsIrradiance.maxSun, alpha);\r
  #endif // ACCURATE_SUN_SKY_IRRADIANCE\r
}\r
\r
#ifdef GROUND_IRRADIANCE\r
vec3 approximateIrradianceFromGround(\r
  const vec3 position,\r
  const vec3 surfaceNormal,\r
  const float height,\r
  const float mipLevel,\r
  const float jitter\r
) {\r
  float opticalDepthToGround = marchOpticalDepth(\r
    position,\r
    -surfaceNormal,\r
    maxIterationCountToGround,\r
    mipLevel,\r
    jitter\r
  );\r
  vec3 skyIrradiance;\r
  vec3 sunIrradiance = getGroundSunSkyIrradiance(position, surfaceNormal, height, skyIrradiance);\r
  const float groundAlbedo = 0.3;\r
  vec3 groundIrradiance = skyIrradiance + (1.0 - coverage) * sunIrradiance;\r
  vec3 bouncedRadiance = groundAlbedo * RECIPROCAL_PI * groundIrradiance;\r
  return bouncedRadiance * exp(-opticalDepthToGround);\r
}\r
#endif // GROUND_IRRADIANCE\r
\r
vec4 marchClouds(\r
  const vec3 rayOrigin,\r
  const vec3 rayDirection,\r
  const vec2 rayNearFar,\r
  const float cosTheta,\r
  const float jitter,\r
  const float rayStartTexelsPerPixel,\r
  out float frontDepth,\r
  out ivec3 sampleCount\r
) {\r
  vec3 radianceIntegral = vec3(0.0);\r
  float transmittanceIntegral = 1.0;\r
  float weightedDistanceSum = 0.0;\r
  float transmittanceSum = 0.0;\r
\r
  float maxRayDistance = rayNearFar.y - rayNearFar.x;\r
  float stepSize = minStepSize + (perspectiveStepScale - 1.0) * rayNearFar.x;\r
  // I don't understand why spatial aliasing remains unless doubling the jitter.\r
  float rayDistance = stepSize * jitter * 2.0;\r
\r
  for (int i = 0; i < maxIterationCount; ++i) {\r
    if (rayDistance > maxRayDistance) {\r
      break; // Termination\r
    }\r
\r
    vec3 position = rayDistance * rayDirection + rayOrigin;\r
    float height = length(position) - bottomRadius;\r
    float mipLevel = log2(max(1.0, rayStartTexelsPerPixel + rayDistance * 1e-5));\r
\r
    #if !defined(DEBUG_MARCH_INTERVALS)\r
    if (insideLayerIntervals(height)) {\r
      stepSize *= perspectiveStepScale;\r
      rayDistance += mix(stepSize, maxStepSize, min(1.0, mipLevel));\r
      continue;\r
    }\r
    #endif // !defined(DEBUG_MARCH_INTERVALS)\r
\r
    // Sample rough weather.\r
    vec2 uv = getGlobeUv(position);\r
    WeatherSample weather = sampleWeather(uv, height, mipLevel);\r
\r
    #ifdef DEBUG_SHOW_SAMPLE_COUNT\r
    ++sampleCount.x;\r
    #endif // DEBUG_SHOW_SAMPLE_COUNT\r
\r
    if (!any(greaterThan(weather.density, vec4(minDensity)))) {\r
      // Step longer in empty space.\r
      // TODO: This produces banding artifacts.\r
      // Possible improvement: Binary search refinement\r
      stepSize *= perspectiveStepScale;\r
      rayDistance += mix(stepSize, maxStepSize, min(1.0, mipLevel));\r
      continue;\r
    }\r
\r
    // Sample detailed participating media.\r
    MediaSample media = sampleMedia(weather, position, uv, mipLevel, jitter, sampleCount);\r
\r
    if (media.extinction > minExtinction) {\r
      vec3 skyIrradiance;\r
      vec3 sunIrradiance = getCloudsSunSkyIrradiance(position, height, skyIrradiance);\r
      vec3 surfaceNormal = normalize(position);\r
\r
      // March optical depth to the sun for finer details, which BSM lacks.\r
      float sunRayDistance = 0.0;\r
      float opticalDepth = marchOpticalDepth(\r
        position,\r
        sunDirection,\r
        maxIterationCountToSun,\r
        mipLevel,\r
        jitter,\r
        sunRayDistance\r
      );\r
\r
      if (height < shadowTopHeight) {\r
        // Obtain the optical depth from BSM at the ray position.\r
        opticalDepth += sampleShadowOpticalDepth(\r
          position,\r
          // Take account of only positions further than the marched ray\r
          // distance.\r
          sunRayDistance,\r
          // Apply PCF only when the sun is close to the horizon.\r
          maxShadowFilterRadius * remapClamped(dot(sunDirection, surfaceNormal), 0.1, 0.0),\r
          jitter\r
        );\r
      }\r
\r
      vec3 radiance = sunIrradiance * approximateMultipleScattering(opticalDepth, cosTheta);\r
\r
      #ifdef GROUND_IRRADIANCE\r
      // Fudge factor for the irradiance from ground.\r
      if (height < shadowTopHeight && mipLevel < 0.5) {\r
        vec3 groundIrradiance = approximateIrradianceFromGround(\r
          position,\r
          surfaceNormal,\r
          height,\r
          mipLevel,\r
          jitter\r
        );\r
        radiance += groundIrradiance * RECIPROCAL_PI4 * groundIrradianceScale;\r
      }\r
      #endif // GROUND_IRRADIANCE\r
\r
      // Crude approximation of sky gradient. Better than none in the shadows.\r
      float skyGradient = dot(weather.heightFraction * 0.5 + 0.5, media.weight);\r
      radiance += skyIrradiance * RECIPROCAL_PI4 * skyGradient * skyIrradianceScale;\r
\r
      // Finally multiply by scattering.\r
      radiance *= media.scattering;\r
\r
      #ifdef POWDER\r
      radiance *= 1.0 - powderScale * exp(-media.extinction * powderExponent);\r
      #endif // POWDER\r
\r
      #ifdef DEBUG_SHOW_CASCADES\r
      if (height < shadowTopHeight) {\r
        radiance = 1e-3 * getFadedCascadeColor(position, jitter);\r
      }\r
      #endif // DEBUG_SHOW_CASCADES\r
\r
      // Energy-conserving analytical integration of scattered light\r
      // See 5.6.3 in https://media.contentapi.ea.com/content/dam/eacom/frostbite/files/s2016-pbs-frostbite-sky-clouds-new.pdf\r
      float transmittance = exp(-media.extinction * stepSize);\r
      float clampedExtinction = max(media.extinction, 1e-7);\r
      vec3 scatteringIntegral = (radiance - radiance * transmittance) / clampedExtinction;\r
      radianceIntegral += transmittanceIntegral * scatteringIntegral;\r
      transmittanceIntegral *= transmittance;\r
\r
      // Aerial perspective affecting clouds\r
      // See 5.9.1 in https://media.contentapi.ea.com/content/dam/eacom/frostbite/files/s2016-pbs-frostbite-sky-clouds-new.pdf\r
      weightedDistanceSum += rayDistance * transmittanceIntegral;\r
      transmittanceSum += transmittanceIntegral;\r
    }\r
\r
    if (transmittanceIntegral <= minTransmittance) {\r
      break; // Early termination\r
    }\r
\r
    // Take a shorter step because we've already hit the clouds.\r
    stepSize *= perspectiveStepScale;\r
    rayDistance += stepSize;\r
  }\r
\r
  // The final product of 5.9.1 and we'll evaluate this in aerial perspective.\r
  frontDepth = transmittanceSum > 0.0 ? weightedDistanceSum / transmittanceSum : -1.0;\r
\r
  return vec4(radianceIntegral, remapClamped(transmittanceIntegral, 1.0, minTransmittance));\r
}\r
\r
#ifdef SHADOW_LENGTH\r
\r
float marchShadowLength(\r
  const vec3 rayOrigin,\r
  const vec3 rayDirection,\r
  const vec2 rayNearFar,\r
  const float jitter\r
) {\r
  float shadowLength = 0.0;\r
  float maxRayDistance = rayNearFar.y - rayNearFar.x;\r
  float stepSize = minShadowLengthStepSize;\r
  float rayDistance = stepSize * jitter;\r
  const float attenuationFactor = 1.0 - 5e-4;\r
  float attenuation = 1.0;\r
\r
  // TODO: This march is closed, and sample resolution can be much lower.\r
  // Refining the termination by binary search will make it much more efficient.\r
  for (int i = 0; i < maxShadowLengthIterationCount; ++i) {\r
    if (rayDistance > maxRayDistance) {\r
      break; // Termination\r
    }\r
    vec3 position = rayDistance * rayDirection + rayOrigin;\r
    float opticalDepth = sampleShadowOpticalDepth(position, 0.0, 0.0, jitter);\r
    shadowLength += (1.0 - exp(-opticalDepth)) * stepSize * attenuation;\r
\r
    // Hack to prevent over-integration of shadow length. The shadow should be\r
    // attenuated by the inscatter as the ray travels further.\r
    attenuation *= attenuationFactor;\r
    if (attenuation < 1e-5) {\r
      break;\r
    }\r
\r
    stepSize *= perspectiveStepScale;\r
    rayDistance += stepSize;\r
  }\r
  return shadowLength;\r
}\r
\r
#endif // SHADOW_LENGTH\r
\r
#ifdef HAZE\r
\r
vec4 approximateHaze(\r
  const vec3 rayOrigin,\r
  const vec3 rayDirection,\r
  const float maxRayDistance,\r
  const float cosTheta,\r
  const float shadowLength\r
) {\r
  float modulation = remapClamped(coverage, 0.2, 0.4);\r
  if (cameraHeight * modulation < 0.0) {\r
    return vec4(0.0);\r
  }\r
  float density = modulation * hazeDensityScale * exp(-cameraHeight * hazeExponent);\r
  if (density < 1e-7) {\r
    return vec4(0.0); // Prevent artifact in views from space\r
  }\r
\r
  // Blend two normals by the difference in angle so that normal near the\r
  // ground becomes that of the origin, and in the sky that of the horizon.\r
  vec3 normalAtOrigin = normalize(rayOrigin);\r
  vec3 normalAtHorizon = (rayOrigin - dot(rayOrigin, rayDirection) * rayDirection) / bottomRadius;\r
  float alpha = remapClamped(dot(normalAtOrigin, normalAtHorizon), 0.9, 1.0);\r
  vec3 normal = mix(normalAtOrigin, normalAtHorizon, alpha);\r
\r
  // Analytical optical depth where density exponentially decreases with height.\r
  // Based on: https://iquilezles.org/articles/fog/\r
  float angle = max(dot(normal, rayDirection), 1e-5);\r
  float exponent = angle * hazeExponent;\r
  float linearTerm = density / hazeExponent / angle;\r
\r
  // Derive the optical depths separately for with and without shadow length.\r
  float expTerm = 1.0 - exp(-maxRayDistance * exponent);\r
  float shadowExpTerm = 1.0 - exp(-min(maxRayDistance, shadowLength) * exponent);\r
  float opticalDepth = expTerm * linearTerm;\r
  float shadowOpticalDepth = max((expTerm - shadowExpTerm) * linearTerm, 0.0);\r
  float transmittance = saturate(1.0 - exp(-opticalDepth));\r
  float shadowTransmittance = saturate(1.0 - exp(-shadowOpticalDepth));\r
\r
  vec3 skyIrradiance = vGroundIrradiance.sky;\r
  vec3 sunIrradiance = vGroundIrradiance.sun;\r
  vec3 inscatter = sunIrradiance * phaseFunction(cosTheta) * shadowTransmittance;\r
  inscatter += skyIrradiance * RECIPROCAL_PI4 * skyIrradianceScale * transmittance;\r
  inscatter *= hazeScatteringCoefficient / (hazeAbsorptionCoefficient + hazeScatteringCoefficient);\r
  return vec4(inscatter, transmittance);\r
}\r
\r
#endif // HAZE\r
\r
void applyAerialPerspective(\r
  const vec3 cameraPosition,\r
  const vec3 frontPosition,\r
  const float shadowLength,\r
  inout vec4 color\r
) {\r
  vec3 transmittance;\r
  vec3 inscatter = GetSkyRadianceToPoint(\r
    cameraPosition * METER_TO_LENGTH_UNIT,\r
    frontPosition * METER_TO_LENGTH_UNIT,\r
    shadowLength * METER_TO_LENGTH_UNIT,\r
    sunDirection,\r
    transmittance\r
  );\r
  color.rgb = color.rgb * transmittance + inscatter * color.a;\r
}\r
\r
bool rayIntersectsGround(const vec3 cameraPosition, const vec3 rayDirection) {\r
  float r = length(cameraPosition);\r
  float mu = dot(cameraPosition, rayDirection) / r;\r
  return mu < 0.0 && r * r * (mu * mu - 1.0) + bottomRadius * bottomRadius >= 0.0;\r
}\r
\r
struct IntersectionResult {\r
  bool ground;\r
  vec4 first;\r
  vec4 second;\r
};\r
\r
IntersectionResult getIntersections(const vec3 cameraPosition, const vec3 rayDirection) {\r
  IntersectionResult intersections;\r
  intersections.ground = rayIntersectsGround(cameraPosition, rayDirection);\r
  raySphereIntersections(\r
    cameraPosition,\r
    rayDirection,\r
    bottomRadius + vec4(0.0, minHeight, maxHeight, shadowTopHeight),\r
    intersections.first,\r
    intersections.second\r
  );\r
  return intersections;\r
}\r
\r
vec2 getRayNearFar(const IntersectionResult intersections) {\r
  vec2 nearFar;\r
  if (cameraHeight < minHeight) {\r
    // View below the clouds\r
    if (intersections.ground) {\r
      nearFar = vec2(-1.0); // No clouds to the ground\r
    } else {\r
      nearFar = vec2(intersections.second.y, intersections.second.z);\r
      nearFar.y = min(nearFar.y, maxRayDistance);\r
    }\r
  } else if (cameraHeight < maxHeight) {\r
    // View inside the total cloud layer\r
    if (intersections.ground) {\r
      nearFar = vec2(cameraNear, intersections.first.y);\r
    } else {\r
      nearFar = vec2(cameraNear, intersections.second.z);\r
    }\r
  } else {\r
    // View above the clouds\r
    nearFar = vec2(intersections.first.z, intersections.second.z);\r
    if (intersections.ground) {\r
      // Clamp the ray at the min height.\r
      nearFar.y = intersections.first.y;\r
    }\r
  }\r
  return nearFar;\r
}\r
\r
#ifdef SHADOW_LENGTH\r
vec2 getShadowRayNearFar(const IntersectionResult intersections) {\r
  vec2 nearFar;\r
  if (cameraHeight < shadowTopHeight) {\r
    if (intersections.ground) {\r
      nearFar = vec2(cameraNear, intersections.first.x);\r
    } else {\r
      nearFar = vec2(cameraNear, intersections.second.w);\r
    }\r
  } else {\r
    nearFar = vec2(intersections.first.w, intersections.second.w);\r
    if (intersections.ground) {\r
      // Clamp the ray at the ground.\r
      nearFar.y = intersections.first.x;\r
    }\r
  }\r
  nearFar.y = min(nearFar.y, maxShadowLengthRayDistance);\r
  return nearFar;\r
}\r
#endif // SHADOW_LENGTH\r
\r
#ifdef HAZE\r
vec2 getHazeRayNearFar(const IntersectionResult intersections) {\r
  vec2 nearFar;\r
  if (cameraHeight < maxHeight) {\r
    if (intersections.ground) {\r
      nearFar = vec2(cameraNear, intersections.first.x);\r
    } else {\r
      nearFar = vec2(cameraNear, intersections.second.z);\r
    }\r
  } else {\r
    nearFar = vec2(cameraNear, intersections.second.z);\r
    if (intersections.ground) {\r
      // Clamp the ray at the ground.\r
      nearFar.y = intersections.first.x;\r
    }\r
  }\r
  return nearFar;\r
}\r
#endif // HAZE\r
\r
float getRayDistanceToScene(const vec3 rayDirection) {\r
  float depth = readDepth(vUv * targetUvScale + temporalJitter);\r
  if (depth < 1.0 - 1e-7) {\r
    depth = reverseLogDepth(depth, cameraNear, cameraFar);\r
    float viewZ = getViewZ(depth);\r
    return -viewZ / dot(rayDirection, vCameraDirection);\r
  }\r
  return -1.0;\r
}\r
\r
void main() {\r
  #ifdef DEBUG_SHOW_SHADOW_MAP\r
  outputColor = getCascadedShadowMaps(vUv);\r
  outputDepthVelocity = vec3(0.0);\r
  #ifdef SHADOW_LENGTH\r
  outputShadowLength = 0.0;\r
  #endif // SHADOW_LENGTH\r
  return;\r
  #endif // DEBUG_SHOW_SHADOW_MAP\r
\r
  vec3 cameraPosition = vCameraPosition - vEllipsoidCenter;\r
  vec3 rayDirection = normalize(vRayDirection);\r
  float cosTheta = dot(sunDirection, rayDirection);\r
\r
  IntersectionResult intersections = getIntersections(cameraPosition, rayDirection);\r
  vec2 rayNearFar = getRayNearFar(intersections);\r
  #ifdef SHADOW_LENGTH\r
  vec2 shadowRayNearFar = getShadowRayNearFar(intersections);\r
  #endif // SHADOW_LENGTH\r
  #ifdef HAZE\r
  vec2 hazeRayNearFar = getHazeRayNearFar(intersections);\r
  #endif // HAZE\r
\r
  float rayDistanceToScene = getRayDistanceToScene(rayDirection);\r
  if (rayDistanceToScene >= 0.0) {\r
    rayNearFar.y = min(rayNearFar.y, rayDistanceToScene);\r
    #ifdef SHADOW_LENGTH\r
    shadowRayNearFar.y = min(shadowRayNearFar.y, rayDistanceToScene);\r
    #endif // SHADOW_LENGTH\r
    #ifdef HAZE\r
    hazeRayNearFar.y = min(hazeRayNearFar.y, rayDistanceToScene);\r
    #endif // HAZE\r
  }\r
\r
  bool intersectsGround = any(lessThan(rayNearFar, vec2(0.0)));\r
  bool intersectsScene = rayNearFar.y < rayNearFar.x;\r
\r
  float stbn = getSTBN();\r
\r
  vec4 color = vec4(0.0);\r
  float frontDepth = rayNearFar.y;\r
  vec3 depthVelocity = vec3(0.0);\r
  float shadowLength = 0.0;\r
\r
  if (!intersectsGround && !intersectsScene) {\r
    vec3 rayOrigin = rayNearFar.x * rayDirection + cameraPosition;\r
\r
    vec2 globeUv = getGlobeUv(rayOrigin);\r
    #ifdef DEBUG_SHOW_UV\r
    outputColor = vec4(vec3(checker(globeUv, localWeatherRepeat + localWeatherOffset)), 1.0);\r
    outputDepthVelocity = vec3(0.0);\r
    #ifdef SHADOW_LENGTH\r
    outputShadowLength = 0.0;\r
    #endif // SHADOW_LENGTH\r
    return;\r
    #endif // DEBUG_SHOW_UV\r
\r
    float mipLevel = getMipLevel(globeUv * localWeatherRepeat) * mipLevelScale;\r
    mipLevel = mix(0.0, mipLevel, min(1.0, 0.2 * cameraHeight / maxHeight));\r
\r
    float marchedFrontDepth;\r
    ivec3 sampleCount = ivec3(0);\r
    color = marchClouds(\r
      rayOrigin,\r
      rayDirection,\r
      rayNearFar,\r
      cosTheta,\r
      stbn,\r
      pow(2.0, mipLevel),\r
      marchedFrontDepth,\r
      sampleCount\r
    );\r
\r
    #ifdef DEBUG_SHOW_SAMPLE_COUNT\r
    outputColor = vec4(vec3(sampleCount) / vec3(500.0, 5.0, 5.0), 1.0);\r
    outputDepthVelocity = vec3(0.0);\r
    #ifdef SHADOW_LENGTH\r
    outputShadowLength = 0.0;\r
    #endif // SHADOW_LENGTH\r
    return;\r
    #endif // DEBUG_SHOW_SAMPLE_COUNT\r
\r
    // Front depth will be -1.0 when no samples are accumulated.\r
    if (marchedFrontDepth >= 0.0) {\r
      frontDepth = rayNearFar.x + marchedFrontDepth;\r
\r
      #ifdef SHADOW_LENGTH\r
      // Clamp the shadow length ray at the clouds.\r
      shadowRayNearFar.y = mix(\r
        shadowRayNearFar.y,\r
        min(frontDepth, shadowRayNearFar.y),\r
        color.a // Interpolate by the alpha for smoother edges.\r
      );\r
      #endif // SHADOW_LENGTH\r
\r
      #ifdef HAZE\r
      // Clamp the haze ray at the clouds.\r
      hazeRayNearFar.y = mix(\r
        hazeRayNearFar.y,\r
        min(frontDepth, hazeRayNearFar.y),\r
        color.a // Interpolate by the alpha for smoother edges.\r
      );\r
      #endif // HAZE\r
    }\r
\r
    #ifdef SHADOW_LENGTH\r
    if (all(greaterThanEqual(shadowRayNearFar, vec2(0.0)))) {\r
      shadowLength = marchShadowLength(\r
        shadowRayNearFar.x * rayDirection + cameraPosition,\r
        rayDirection,\r
        shadowRayNearFar,\r
        stbn\r
      );\r
    }\r
    #endif // SHADOW_LENGTH\r
\r
    // Apply aerial perspective.\r
    vec3 frontPosition = cameraPosition + frontDepth * rayDirection;\r
    applyAerialPerspective(cameraPosition, frontPosition, shadowLength, color);\r
\r
    // Velocity for temporal resolution.\r
    vec3 frontPositionWorld = ECEFToWorld(frontPosition);\r
    vec4 prevClip = reprojectionMatrix * vec4(frontPositionWorld, 1.0);\r
    prevClip /= prevClip.w;\r
    vec2 prevUv = prevClip.xy * 0.5 + 0.5;\r
    vec2 velocity = (vUv - prevUv) * resolution;\r
    depthVelocity = vec3(frontDepth, velocity);\r
\r
  } else {\r
    #ifdef SHADOW_LENGTH\r
    if (all(greaterThanEqual(shadowRayNearFar, vec2(0.0)))) {\r
      shadowLength = marchShadowLength(\r
        shadowRayNearFar.x * rayDirection + cameraPosition,\r
        rayDirection,\r
        shadowRayNearFar,\r
        stbn\r
      );\r
    }\r
    #endif // SHADOW_LENGTH\r
\r
    // TODO: We can calculate velocity to reduce occlusion errors at the edges,\r
    // but suffers from floating-point precision errors on near objects.\r
\r
    // if (intersectsScene) {\r
    //   vec3 frontPosition = cameraPosition + rayNearFar.y * rayDirection;\r
    //   vec3 frontPositionWorld = ECEFToWorld(frontPosition);\r
    //   vec4 prevClip = reprojectionMatrix * vec4(frontPositionWorld, 1.0);\r
    //   prevClip /= prevClip.w;\r
    //   vec2 prevUv = prevClip.xy * 0.5 + 0.5;\r
    //   vec2 velocity = (vUv - prevUv) * resolution;\r
    //   depthVelocity = vec3(rayNearFar.y, velocity);\r
    // }\r
\r
  }\r
\r
  #ifdef DEBUG_SHOW_FRONT_DEPTH\r
  outputColor = vec4(turbo(frontDepth / maxRayDistance), 1.0);\r
  outputDepthVelocity = vec3(0.0);\r
  #ifdef SHADOW_LENGTH\r
  outputShadowLength = 0.0;\r
  #endif // SHADOW_LENGTH\r
  return;\r
  #endif // DEBUG_SHOW_FRONT_DEPTH\r
\r
  #ifdef HAZE\r
  vec4 haze = approximateHaze(\r
    cameraNear * rayDirection + cameraPosition,\r
    rayDirection,\r
    hazeRayNearFar.y - hazeRayNearFar.x,\r
    cosTheta,\r
    shadowLength\r
  );\r
  color.rgb = mix(color.rgb, haze.rgb, haze.a);\r
  color.a = color.a * (1.0 - haze.a) + haze.a;\r
  #endif // HAZE\r
\r
  outputColor = color;\r
  outputDepthVelocity = depthVelocity;\r
  #ifdef SHADOW_LENGTH\r
  outputShadowLength = shadowLength * METER_TO_LENGTH_UNIT;\r
  #endif // SHADOW_LENGTH\r
}\r
`;

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\clouds.glsl
var clouds_default2 = "float getSTBN() {\r\n  ivec3 size = textureSize(stbnTexture, 0);\r\n  vec3 scale = 1.0 / vec3(size);\r\n  return texture(stbnTexture, vec3(gl_FragCoord.xy, float(frame % size.z)) * scale).r;\r\n}\r\n\r\n// Straightforward spherical mapping\r\nvec2 getSphericalUv(const vec3 position) {\r\n  vec2 st = normalize(position.yx);\r\n  float phi = atan(st.x, st.y);\r\n  float theta = asin(normalize(position).z);\r\n  return vec2(phi * RECIPROCAL_PI2 + 0.5, theta * RECIPROCAL_PI + 0.5);\r\n}\r\n\r\nvec2 getCubeSphereUv(const vec3 position) {\r\n  // Cube-sphere relaxation by: http://mathproofs.blogspot.com/2005/07/mapping-cube-to-sphere.html\r\n  // TODO: Tile and fix seams.\r\n  // Possible improvements:\r\n  // https://iquilezles.org/articles/texturerepetition/\r\n  // https://gamedev.stackexchange.com/questions/184388/fragment-shader-map-dot-texture-repeatedly-over-the-sphere\r\n  // https://github.com/mmikk/hextile-demo\r\n\r\n  vec3 n = normalize(position);\r\n  vec3 f = abs(n);\r\n  vec3 c = n / max(f.x, max(f.y, f.z));\r\n  vec2 m;\r\n  if (all(greaterThan(f.yy, f.xz))) {\r\n    m = c.y > 0.0 ? vec2(-n.x, n.z) : n.xz;\r\n  } else if (all(greaterThan(f.xx, f.yz))) {\r\n    m = c.x > 0.0 ? n.yz : vec2(-n.y, n.z);\r\n  } else {\r\n    m = c.z > 0.0 ? n.xy : vec2(n.x, -n.y);\r\n  }\r\n\r\n  vec2 m2 = m * m;\r\n  float q = dot(m2.xy, vec2(-2.0, 2.0)) - 3.0;\r\n  float q2 = q * q;\r\n  vec2 uv;\r\n  uv.x = sqrt(1.5 + m2.x - m2.y - 0.5 * sqrt(-24.0 * m2.x + q2)) * (m.x > 0.0 ? 1.0 : -1.0);\r\n  uv.y = sqrt(6.0 / (3.0 - uv.x * uv.x)) * m.y;\r\n  return uv * 0.5 + 0.5;\r\n}\r\n\r\nvec2 getGlobeUv(const vec3 position) {\r\n  return getCubeSphereUv(position);\r\n}\r\n\r\nfloat getMipLevel(const vec2 uv) {\r\n  const float mipLevelScale = 0.1;\r\n  vec2 coord = uv * resolution;\r\n  vec2 ddx = dFdx(coord);\r\n  vec2 ddy = dFdy(coord);\r\n  float deltaMaxSqr = max(dot(ddx, ddx), dot(ddy, ddy)) * mipLevelScale;\r\n  return max(0.0, 0.5 * log2(max(1.0, deltaMaxSqr)));\r\n}\r\n\r\nbool insideLayerIntervals(const float height) {\r\n  bvec3 gt = greaterThan(vec3(height), minIntervalHeights);\r\n  bvec3 lt = lessThan(vec3(height), maxIntervalHeights);\r\n  return any(bvec3(gt.x && lt.x, gt.y && lt.y, gt.z && lt.z));\r\n}\r\n\r\nstruct WeatherSample {\r\n  vec4 heightFraction; // Normalized height of each layer\r\n  vec4 density;\r\n};\r\n\r\nvec4 shapeAlteringFunction(const vec4 heightFraction, const vec4 bias) {\r\n  // Apply a semi-circle transform to round the clouds towards the top.\r\n  vec4 biased = pow(heightFraction, bias);\r\n  vec4 x = clamp(biased * 2.0 - 1.0, -1.0, 1.0);\r\n  return 1.0 - x * x;\r\n}\r\n\r\nWeatherSample sampleWeather(const vec2 uv, const float height, const float mipLevel) {\r\n  WeatherSample weather;\r\n  weather.heightFraction = remapClamped(vec4(height), minLayerHeights, maxLayerHeights);\r\n\r\n  vec4 localWeather = pow(\r\n    textureLod(\r\n      localWeatherTexture,\r\n      uv * localWeatherRepeat + localWeatherOffset,\r\n      mipLevel\r\n    ).LOCAL_WEATHER_CHANNELS,\r\n    weatherExponents\r\n  );\r\n  #ifdef SHADOW\r\n  localWeather *= shadowLayerMask;\r\n  #endif // SHADOW\r\n\r\n  vec4 heightScale = shapeAlteringFunction(weather.heightFraction, shapeAlteringBiases);\r\n\r\n  // Modulation to control weather by coverage parameter.\r\n  // Reference: https://github.com/Prograda/Skybolt/blob/master/Assets/Core/Shaders/Clouds.h#L63\r\n  vec4 factor = 1.0 - coverage * heightScale;\r\n  weather.density = remapClamped(\r\n    mix(localWeather, vec4(1.0), coverageFilterWidths),\r\n    factor,\r\n    factor + coverageFilterWidths\r\n  );\r\n\r\n  return weather;\r\n}\r\n\r\nvec4 getLayerDensity(const vec4 heightFraction) {\r\n  // prettier-ignore\r\n  return densityProfile.expTerms * exp(densityProfile.exponents * heightFraction) +\r\n    densityProfile.linearTerms * heightFraction +\r\n    densityProfile.constantTerms;\r\n}\r\n\r\nstruct MediaSample {\r\n  float density;\r\n  vec4 weight;\r\n  float scattering;\r\n  float extinction;\r\n};\r\n\r\nMediaSample sampleMedia(\r\n  const WeatherSample weather,\r\n  const vec3 position,\r\n  const vec2 uv,\r\n  const float mipLevel,\r\n  const float jitter,\r\n  out ivec3 sampleCount\r\n) {\r\n  vec4 density = weather.density;\r\n\r\n  // TODO: Define in physical length.\r\n  vec3 surfaceNormal = normalize(position);\r\n  float localWeatherSpeed = length(localWeatherOffset);\r\n  vec3 evolution = -surfaceNormal * localWeatherSpeed * 2e4;\r\n\r\n  vec3 turbulence = vec3(0.0);\r\n  #ifdef TURBULENCE\r\n  vec2 turbulenceUv = uv * localWeatherRepeat * turbulenceRepeat;\r\n  turbulence =\r\n    turbulenceDisplacement *\r\n    (texture(turbulenceTexture, turbulenceUv).rgb * 2.0 - 1.0) *\r\n    dot(density, remapClamped(weather.heightFraction, vec4(0.3), vec4(0.0)));\r\n  #endif // TURBULENCE\r\n\r\n  vec3 shapePosition = (position + evolution + turbulence) * shapeRepeat + shapeOffset;\r\n  float shape = texture(shapeTexture, shapePosition).r;\r\n  density = remapClamped(density, vec4(1.0 - shape) * shapeAmounts, vec4(1.0));\r\n\r\n  #ifdef DEBUG_SHOW_SAMPLE_COUNT\r\n  ++sampleCount.y;\r\n  #endif // DEBUG_SHOW_SAMPLE_COUNT\r\n\r\n  #ifdef SHAPE_DETAIL\r\n  if (mipLevel * 0.5 + (jitter - 0.5) * 0.5 < 0.5) {\r\n    vec3 detailPosition = (position + turbulence) * shapeDetailRepeat + shapeDetailOffset;\r\n    float detail = texture(shapeDetailTexture, detailPosition).r;\r\n    // Fluffy at the top and whippy at the bottom.\r\n    vec4 modifier = mix(\r\n      vec4(pow(detail, 6.0)),\r\n      vec4(1.0 - detail),\r\n      remapClamped(weather.heightFraction, vec4(0.2), vec4(0.4))\r\n    );\r\n    modifier = mix(vec4(0.0), modifier, shapeDetailAmounts);\r\n    density = remapClamped(density * 2.0, vec4(modifier * 0.5), vec4(1.0));\r\n\r\n    #ifdef DEBUG_SHOW_SAMPLE_COUNT\r\n    ++sampleCount.z;\r\n    #endif // DEBUG_SHOW_SAMPLE_COUNT\r\n  }\r\n  #endif // SHAPE_DETAIL\r\n\r\n  // Apply the density profiles.\r\n  density = saturate(density * densityScales * getLayerDensity(weather.heightFraction));\r\n\r\n  MediaSample media;\r\n  float densitySum = density.x + density.y + density.z + density.w;\r\n  media.weight = density / densitySum;\r\n  media.scattering = densitySum * scatteringCoefficient;\r\n  media.extinction = densitySum * absorptionCoefficient + media.scattering;\r\n  return media;\r\n}\r\n\r\nMediaSample sampleMedia(\r\n  const WeatherSample weather,\r\n  const vec3 position,\r\n  const vec2 uv,\r\n  const float mipLevel,\r\n  const float jitter\r\n) {\r\n  ivec3 sampleCount;\r\n  return sampleMedia(weather, position, uv, mipLevel, jitter, sampleCount);\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\clouds.vert
var clouds_default3 = 'precision highp float;\r\nprecision highp sampler3D;\r\n\r\n#include "atmosphere/parameters"\r\n#include "atmosphere/functions"\r\n#include "types"\r\n\r\nuniform mat4 inverseProjectionMatrix;\r\nuniform mat4 inverseViewMatrix;\r\nuniform vec3 cameraPosition;\r\nuniform vec3 ellipsoidCenter;\r\nuniform mat4 inverseEllipsoidMatrix;\r\nuniform vec3 altitudeCorrection;\r\n\r\n// Atmosphere\r\nuniform float bottomRadius;\r\nuniform vec3 sunDirection;\r\n\r\n// Cloud layers\r\nuniform float minHeight;\r\nuniform float maxHeight;\r\n\r\nlayout(location = 0) in vec3 position;\r\n\r\nout vec2 vUv;\r\nout vec3 vCameraPosition;\r\nout vec3 vCameraDirection; // Direction to the center of screen\r\nout vec3 vRayDirection; // Direction to the texel\r\nout vec3 vEllipsoidCenter;\r\n\r\nout GroundIrradiance vGroundIrradiance;\r\nout CloudsIrradiance vCloudsIrradiance;\r\n\r\nvoid sampleSunSkyIrradiance(const vec3 positionECEF) {\r\n  vGroundIrradiance.sun = GetSunAndSkyIrradianceForParticle(\r\n    positionECEF * METER_TO_LENGTH_UNIT,\r\n    sunDirection,\r\n    vGroundIrradiance.sky\r\n  );\r\n\r\n  vec3 surfaceNormal = normalize(positionECEF);\r\n  vec2 radii = (bottomRadius + vec2(minHeight, maxHeight)) * METER_TO_LENGTH_UNIT;\r\n  vCloudsIrradiance.minSun = GetSunAndSkyIrradianceForParticle(\r\n    surfaceNormal * radii.x,\r\n    sunDirection,\r\n    vCloudsIrradiance.minSky\r\n  );\r\n  vCloudsIrradiance.maxSun = GetSunAndSkyIrradianceForParticle(\r\n    surfaceNormal * radii.y,\r\n    sunDirection,\r\n    vCloudsIrradiance.maxSky\r\n  );\r\n}\r\n\r\nvoid main() {\r\n  vUv = position.xy * 0.5 + 0.5;\r\n\r\n  vec4 viewPosition = inverseProjectionMatrix * vec4(position, 1.0);\r\n  vec4 worldDirection = inverseViewMatrix * vec4(viewPosition.xyz, 0.0);\r\n  mat3 rotation = mat3(inverseEllipsoidMatrix);\r\n  vCameraPosition = rotation * cameraPosition;\r\n  vCameraDirection = rotation * normalize((inverseViewMatrix * vec4(0.0, 0.0, -1.0, 0.0)).xyz);\r\n  vRayDirection = rotation * worldDirection.xyz;\r\n  vEllipsoidCenter = ellipsoidCenter + altitudeCorrection;\r\n\r\n  sampleSunSkyIrradiance(vCameraPosition - vEllipsoidCenter);\r\n\r\n  gl_Position = vec4(position.xy, 1.0, 1.0);\r\n}\r\n';

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\parameters.glsl
var parameters_default2 = "uniform vec2 resolution;\r\nuniform int frame;\r\nuniform sampler3D stbnTexture;\r\n\r\n// Atmosphere\r\nuniform float bottomRadius;\r\nuniform mat4 ellipsoidMatrix;\r\nuniform mat4 inverseEllipsoidMatrix;\r\nuniform vec3 sunDirection;\r\n\r\n// Participating medium\r\nuniform float scatteringCoefficient;\r\nuniform float absorptionCoefficient;\r\n\r\n// Primary raymarch\r\nuniform float minDensity;\r\nuniform float minExtinction;\r\nuniform float minTransmittance;\r\n\r\n// Shape and weather\r\nuniform sampler2D localWeatherTexture;\r\nuniform vec2 localWeatherRepeat;\r\nuniform vec2 localWeatherOffset;\r\nuniform float coverage;\r\nuniform sampler3D shapeTexture;\r\nuniform vec3 shapeRepeat;\r\nuniform vec3 shapeOffset;\r\n\r\n#ifdef SHAPE_DETAIL\r\nuniform sampler3D shapeDetailTexture;\r\nuniform vec3 shapeDetailRepeat;\r\nuniform vec3 shapeDetailOffset;\r\n#endif // SHAPE_DETAIL\r\n\r\n#ifdef TURBULENCE\r\nuniform sampler2D turbulenceTexture;\r\nuniform vec2 turbulenceRepeat;\r\nuniform float turbulenceDisplacement;\r\n#endif // TURBULENCE\r\n\r\n// Haze\r\n#ifdef HAZE\r\nuniform float hazeDensityScale;\r\nuniform float hazeExponent;\r\nuniform float hazeScatteringCoefficient;\r\nuniform float hazeAbsorptionCoefficient;\r\n#endif // HAZE\r\n\r\n// Cloud layers\r\nuniform vec4 minLayerHeights;\r\nuniform vec4 maxLayerHeights;\r\nuniform vec3 minIntervalHeights;\r\nuniform vec3 maxIntervalHeights;\r\nuniform vec4 densityScales;\r\nuniform vec4 shapeAmounts;\r\nuniform vec4 shapeDetailAmounts;\r\nuniform vec4 weatherExponents;\r\nuniform vec4 shapeAlteringBiases;\r\nuniform vec4 coverageFilterWidths;\r\nuniform float minHeight;\r\nuniform float maxHeight;\r\nuniform float shadowTopHeight;\r\nuniform float shadowBottomHeight;\r\nuniform vec4 shadowLayerMask;\r\nuniform DensityProfile densityProfile;\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\types.glsl
var types_default = "struct GroundIrradiance {\r\n  vec3 sun;\r\n  vec3 sky;\r\n};\r\n\r\nstruct CloudsIrradiance {\r\n  vec3 minSun;\r\n  vec3 minSky;\r\n  vec3 maxSun;\r\n  vec3 maxSky;\r\n};\r\n\r\nstruct DensityProfile {\r\n  vec4 expTerms;\r\n  vec4 exponents;\r\n  vec4 linearTerms;\r\n  vec4 constantTerms;\r\n};\r\n";

// source/clouds/CloudsMaterial.ts
var vectorScratch9 = /* @__PURE__ */ new Vector321();
var geodeticScratch2 = /* @__PURE__ */ new Geodetic();
var CloudsMaterial = class extends AtmosphereMaterialBase {
  constructor({
    parameterUniforms,
    layerUniforms,
    atmosphereUniforms
  }, atmosphere = AtmosphereParameters.DEFAULT) {
    super(
      {
        name: "CloudsMaterial",
        glslVersion: GLSL33,
        vertexShader: resolveIncludes(clouds_default3, {
          atmosphere: {
            parameters,
            functions
          },
          types: types_default
        }),
        fragmentShader: unrollLoops(
          resolveIncludes(clouds_default, {
            core: {
              depth,
              math,
              turbo,
              generators,
              raySphereIntersection,
              cascadedShadowMaps,
              interleavedGradientNoise,
              vogelDisk
            },
            atmosphere: {
              parameters,
              functions
            },
            types: types_default,
            parameters: parameters_default2,
            clouds: clouds_default2
          })
        ),
        // prettier-ignore
        uniforms: {
          ...parameterUniforms,
          ...layerUniforms,
          ...atmosphereUniforms,
          depthBuffer: new Uniform6(null),
          viewMatrix: new Uniform6(new Matrix411()),
          inverseProjectionMatrix: new Uniform6(new Matrix411()),
          inverseViewMatrix: new Uniform6(new Matrix411()),
          reprojectionMatrix: new Uniform6(new Matrix411()),
          resolution: new Uniform6(new Vector29()),
          cameraNear: new Uniform6(0),
          cameraFar: new Uniform6(0),
          cameraHeight: new Uniform6(0),
          frame: new Uniform6(0),
          temporalJitter: new Uniform6(new Vector29()),
          targetUvScale: new Uniform6(new Vector29()),
          mipLevelScale: new Uniform6(1),
          stbnTexture: new Uniform6(null),
          // Scattering
          skyIrradianceScale: new Uniform6(1),
          groundIrradianceScale: new Uniform6(1),
          powderScale: new Uniform6(0.8),
          powderExponent: new Uniform6(150),
          // Primary raymarch
          maxIterationCount: new Uniform6(defaults.clouds.maxIterationCount),
          minStepSize: new Uniform6(defaults.clouds.minStepSize),
          maxStepSize: new Uniform6(defaults.clouds.maxStepSize),
          maxRayDistance: new Uniform6(defaults.clouds.maxRayDistance),
          perspectiveStepScale: new Uniform6(defaults.clouds.perspectiveStepScale),
          minDensity: new Uniform6(defaults.clouds.minDensity),
          minExtinction: new Uniform6(defaults.clouds.minExtinction),
          minTransmittance: new Uniform6(defaults.clouds.minTransmittance),
          // Secondary raymarch
          maxIterationCountToSun: new Uniform6(defaults.clouds.maxIterationCountToSun),
          maxIterationCountToGround: new Uniform6(defaults.clouds.maxIterationCountToGround),
          minSecondaryStepSize: new Uniform6(defaults.clouds.minSecondaryStepSize),
          secondaryStepScale: new Uniform6(defaults.clouds.secondaryStepScale),
          // Beer shadow map
          shadowBuffer: new Uniform6(null),
          shadowTexelSize: new Uniform6(new Vector29()),
          shadowIntervals: new Uniform6(
            Array.from({ length: 4 }, () => new Vector29())
            // Populate the max number of elements
          ),
          shadowMatrices: new Uniform6(
            Array.from({ length: 4 }, () => new Matrix411())
            // Populate the max number of elements
          ),
          shadowFar: new Uniform6(0),
          maxShadowFilterRadius: new Uniform6(6),
          shadowLayerMask: new Uniform6(new Vector4().setScalar(1)),
          // Disable mask
          // Shadow length
          maxShadowLengthIterationCount: new Uniform6(defaults.clouds.maxShadowLengthIterationCount),
          minShadowLengthStepSize: new Uniform6(defaults.clouds.minShadowLengthStepSize),
          maxShadowLengthRayDistance: new Uniform6(defaults.clouds.maxShadowLengthRayDistance),
          // Haze
          hazeDensityScale: new Uniform6(3e-5),
          hazeExponent: new Uniform6(1e-3),
          hazeScatteringCoefficient: new Uniform6(0.9),
          hazeAbsorptionCoefficient: new Uniform6(0.5)
        }
      },
      atmosphere
    );
    this.temporalUpscale = true;
    this.depthPacking = 0;
    this.localWeatherChannels = "rgba";
    this.shapeDetail = defaults.shapeDetail;
    this.turbulence = defaults.turbulence;
    this.shadowLength = defaults.lightShafts;
    this.haze = defaults.haze;
    this.multiScatteringOctaves = defaults.clouds.multiScatteringOctaves;
    this.accurateSunSkyIrradiance = defaults.clouds.accurateSunSkyIrradiance;
    this.accuratePhaseFunction = defaults.clouds.accuratePhaseFunction;
    this.shadowCascadeCount = defaults.shadow.cascadeCount;
    this.shadowSampleCount = 8;
    this.scatterAnisotropy1 = 0.7;
    this.scatterAnisotropy2 = -0.2;
    this.scatterAnisotropyMix = 0.5;
  }
  onBeforeRender(renderer, scene, camera, geometry, object, group) {
    const prevLogarithmicDepthBuffer = this.defines.USE_LOGDEPTHBUF != null;
    const nextLogarithmicDepthBuffer = renderer.capabilities.logarithmicDepthBuffer;
    if (nextLogarithmicDepthBuffer !== prevLogarithmicDepthBuffer) {
      if (nextLogarithmicDepthBuffer) {
        this.defines.USE_LOGDEPTHBUF = "1";
      } else {
        delete this.defines.USE_LOGDEPTHBUF;
      }
    }
    const prevPowder = this.defines.POWDER != null;
    const nextPowder = this.uniforms.powderScale.value > 0;
    if (nextPowder !== prevPowder) {
      if (nextPowder) {
        this.defines.POWDER = "1";
      } else {
        delete this.defines.POWDER;
      }
      this.needsUpdate = true;
    }
    const prevGroundIrradiance = this.defines.GROUND_IRRADIANCE != null;
    const nextGroundIrradiance = this.uniforms.groundIrradianceScale.value > 0 && this.uniforms.maxIterationCountToGround.value > 0;
    if (nextGroundIrradiance !== prevGroundIrradiance) {
      if (nextPowder) {
        this.defines.GROUND_IRRADIANCE = "1";
      } else {
        delete this.defines.GROUND_IRRADIANCE;
      }
      this.needsUpdate = true;
    }
  }
  copyCameraSettings(camera) {
    if (camera.isPerspectiveCamera === true) {
      if (this.defines.PERSPECTIVE_CAMERA !== "1") {
        this.defines.PERSPECTIVE_CAMERA = "1";
        this.needsUpdate = true;
      }
    } else {
      if (this.defines.PERSPECTIVE_CAMERA != null) {
        delete this.defines.PERSPECTIVE_CAMERA;
        this.needsUpdate = true;
      }
    }
    const uniforms = this.uniforms;
    uniforms.viewMatrix.value.copy(camera.matrixWorldInverse);
    uniforms.inverseViewMatrix.value.copy(camera.matrixWorld);
    const previousProjectionMatrix = this.previousProjectionMatrix ?? camera.projectionMatrix;
    const previousViewMatrix = this.previousViewMatrix ?? camera.matrixWorldInverse;
    const inverseProjectionMatrix = uniforms.inverseProjectionMatrix.value;
    const reprojectionMatrix = uniforms.reprojectionMatrix.value;
    if (this.temporalUpscale) {
      const frame = uniforms.frame.value % 16;
      const resolution = uniforms.resolution.value;
      const offset = bayerOffsets[frame];
      const dx = (offset.x - 0.5) / resolution.x * 4;
      const dy = (offset.y - 0.5) / resolution.y * 4;
      uniforms.temporalJitter.value.set(dx, dy);
      uniforms.mipLevelScale.value = 0.25;
      inverseProjectionMatrix.copy(camera.projectionMatrix);
      inverseProjectionMatrix.elements[8] += dx * 2;
      inverseProjectionMatrix.elements[9] += dy * 2;
      inverseProjectionMatrix.invert();
      reprojectionMatrix.copy(previousProjectionMatrix);
      reprojectionMatrix.elements[8] += dx * 2;
      reprojectionMatrix.elements[9] += dy * 2;
      reprojectionMatrix.multiply(previousViewMatrix);
    } else {
      uniforms.temporalJitter.value.setScalar(0);
      uniforms.mipLevelScale.value = 1;
      inverseProjectionMatrix.copy(camera.projectionMatrixInverse);
      reprojectionMatrix.copy(previousProjectionMatrix).multiply(previousViewMatrix);
    }
    assertType(camera);
    uniforms.cameraNear.value = camera.near;
    uniforms.cameraFar.value = camera.far;
    const cameraPosition = camera.getWorldPosition(
      uniforms.cameraPosition.value
    );
    const cameraPositionECEF = vectorScratch9.copy(cameraPosition).applyMatrix4(uniforms.inverseEllipsoidMatrix.value).sub(uniforms.ellipsoidCenter.value);
    try {
      uniforms.cameraHeight.value = geodeticScratch2.setFromECEF(cameraPositionECEF).height;
    } catch (error) {
    }
  }
  // copyCameraSettings can be called multiple times within a frame. Only
  // reliable way is to explicitly store the matrices.
  copyReprojectionMatrix(camera) {
    this.previousProjectionMatrix ??= new Matrix411();
    this.previousViewMatrix ??= new Matrix411();
    this.previousProjectionMatrix.copy(camera.projectionMatrix);
    this.previousViewMatrix.copy(camera.matrixWorldInverse);
  }
  setSize(width, height, targetWidth, targetHeight) {
    this.uniforms.resolution.value.set(width, height);
    if (targetWidth != null && targetHeight != null) {
      this.uniforms.targetUvScale.value.set(
        width / targetWidth,
        height / targetHeight
      );
    } else {
      this.uniforms.targetUvScale.value.setScalar(1);
    }
    this.previousProjectionMatrix = void 0;
    this.previousViewMatrix = void 0;
  }
  setShadowSize(width, height) {
    this.uniforms.shadowTexelSize.value.set(1 / width, 1 / height);
  }
  get depthBuffer() {
    return this.uniforms.depthBuffer.value;
  }
  set depthBuffer(value) {
    this.uniforms.depthBuffer.value = value;
  }
};
__decorateClass([
  defineInt("DEPTH_PACKING")
], CloudsMaterial.prototype, "depthPacking", 2);
__decorateClass([
  defineExpression("LOCAL_WEATHER_CHANNELS", {
    validate: (value) => /^[rgba]{4}$/.test(value)
  })
], CloudsMaterial.prototype, "localWeatherChannels", 2);
__decorateClass([
  define("SHAPE_DETAIL")
], CloudsMaterial.prototype, "shapeDetail", 2);
__decorateClass([
  define("TURBULENCE")
], CloudsMaterial.prototype, "turbulence", 2);
__decorateClass([
  define("SHADOW_LENGTH")
], CloudsMaterial.prototype, "shadowLength", 2);
__decorateClass([
  define("HAZE")
], CloudsMaterial.prototype, "haze", 2);
__decorateClass([
  defineInt("MULTI_SCATTERING_OCTAVES", { min: 1, max: 12 })
], CloudsMaterial.prototype, "multiScatteringOctaves", 2);
__decorateClass([
  define("ACCURATE_SUN_SKY_IRRADIANCE")
], CloudsMaterial.prototype, "accurateSunSkyIrradiance", 2);
__decorateClass([
  define("ACCURATE_PHASE_FUNCTION")
], CloudsMaterial.prototype, "accuratePhaseFunction", 2);
__decorateClass([
  defineInt("SHADOW_CASCADE_COUNT", { min: 1, max: 4 })
], CloudsMaterial.prototype, "shadowCascadeCount", 2);
__decorateClass([
  defineInt("SHADOW_SAMPLE_COUNT", { min: 1, max: 16 })
], CloudsMaterial.prototype, "shadowSampleCount", 2);
__decorateClass([
  defineFloat("SCATTER_ANISOTROPY_1")
], CloudsMaterial.prototype, "scatterAnisotropy1", 2);
__decorateClass([
  defineFloat("SCATTER_ANISOTROPY_2")
], CloudsMaterial.prototype, "scatterAnisotropy2", 2);
__decorateClass([
  defineFloat("SCATTER_ANISOTROPY_MIX")
], CloudsMaterial.prototype, "scatterAnisotropyMix", 2);

// source/clouds/CloudsResolveMaterial.ts
import {
  GLSL3 as GLSL34,
  RawShaderMaterial as RawShaderMaterial2,
  Uniform as Uniform7,
  Vector2 as Vector210
} from "three";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\catmullRomSampling.glsl
var catmullRomSampling_default = `// Taken from https://gist.github.com/TheRealMJP/c83b8c0f46b63f3a88a5986f4fa982b1\r
// TODO: Use 5-taps version: https://www.shadertoy.com/view/MtVGWz\r
// Or even 4 taps (requires preprocessing in the input buffer):\r
// https://www.shadertoy.com/view/4tyGDD\r
\r
/**\r
 * MIT License\r
 *\r
 * Copyright (c) 2019 MJP\r
 *\r
 * Permission is hereby granted, free of charge, to any person obtaining a copy\r
 * of this software and associated documentation files (the "Software"), to deal\r
 * in the Software without restriction, including without limitation the rights\r
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\r
 * copies of the Software, and to permit persons to whom the Software is\r
 * furnished to do so, subject to the following conditions:\r
 *\r
 * The above copyright notice and this permission notice shall be included in all\r
 * copies or substantial portions of the Software.\r
 *\r
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\r
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\r
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\r
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\r
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\r
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\r
 * SOFTWARE.\r
 */\r
\r
vec4 textureCatmullRom(sampler2D tex, vec2 uv) {\r
  vec2 texSize = vec2(textureSize(tex, 0));\r
\r
  // We're going to sample a a 4x4 grid of texels surrounding the target UV\r
  // coordinate. We'll do this by rounding down the sample location to get the\r
  // exact center of our "starting" texel. The starting texel will be at\r
  // location [1, 1] in the grid, where [0, 0] is the top left corner.\r
  vec2 samplePos = uv * texSize;\r
  vec2 texPos1 = floor(samplePos - 0.5) + 0.5;\r
\r
  // Compute the fractional offset from our starting texel to our original\r
  // sample location, which we'll feed into the Catmull-Rom spline function to\r
  // get our filter weights.\r
  vec2 f = samplePos - texPos1;\r
\r
  // Compute the Catmull-Rom weights using the fractional offset that we\r
  // calculated earlier. These equations are pre-expanded based on our knowledge\r
  // of where the texels will be located, which lets us avoid having to evaluate\r
  // a piece-wise function.\r
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));\r
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);\r
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));\r
  vec2 w3 = f * f * (-0.5 + 0.5 * f);\r
\r
  // Work out weighting factors and sampling offsets that will let us use\r
  // bilinear filtering to simultaneously evaluate the middle 2 samples from the\r
  // 4x4 grid.\r
  vec2 w12 = w1 + w2;\r
  vec2 offset12 = w2 / (w1 + w2);\r
\r
  // Compute the final UV coordinates we'll use for sampling the texture\r
  vec2 texPos0 = texPos1 - 1.0;\r
  vec2 texPos3 = texPos1 + 2.0;\r
  vec2 texPos12 = texPos1 + offset12;\r
\r
  texPos0 /= texSize;\r
  texPos3 /= texSize;\r
  texPos12 /= texSize;\r
\r
  vec4 result = vec4(0.0);\r
  result += texture(tex, vec2(texPos0.x, texPos0.y)) * w0.x * w0.y;\r
  result += texture(tex, vec2(texPos12.x, texPos0.y)) * w12.x * w0.y;\r
  result += texture(tex, vec2(texPos3.x, texPos0.y)) * w3.x * w0.y;\r
\r
  result += texture(tex, vec2(texPos0.x, texPos12.y)) * w0.x * w12.y;\r
  result += texture(tex, vec2(texPos12.x, texPos12.y)) * w12.x * w12.y;\r
  result += texture(tex, vec2(texPos3.x, texPos12.y)) * w3.x * w12.y;\r
\r
  result += texture(tex, vec2(texPos0.x, texPos3.y)) * w0.x * w3.y;\r
  result += texture(tex, vec2(texPos12.x, texPos3.y)) * w12.x * w3.y;\r
  result += texture(tex, vec2(texPos3.x, texPos3.y)) * w3.x * w3.y;\r
\r
  return result;\r
}\r
\r
vec4 textureCatmullRom(sampler2DArray tex, vec3 uv) {\r
  vec2 texSize = vec2(textureSize(tex, 0));\r
  vec2 samplePos = uv.xy * texSize;\r
  vec2 texPos1 = floor(samplePos - 0.5) + 0.5;\r
  vec2 f = samplePos - texPos1;\r
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));\r
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);\r
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));\r
  vec2 w3 = f * f * (-0.5 + 0.5 * f);\r
  vec2 w12 = w1 + w2;\r
  vec2 offset12 = w2 / (w1 + w2);\r
  vec2 texPos0 = texPos1 - 1.0;\r
  vec2 texPos3 = texPos1 + 2.0;\r
  vec2 texPos12 = texPos1 + offset12;\r
  texPos0 /= texSize;\r
  texPos3 /= texSize;\r
  texPos12 /= texSize;\r
  vec4 result = vec4(0.0);\r
  result += texture(tex, vec3(texPos0.x, texPos0.y, uv.z)) * w0.x * w0.y;\r
  result += texture(tex, vec3(texPos12.x, texPos0.y, uv.z)) * w12.x * w0.y;\r
  result += texture(tex, vec3(texPos3.x, texPos0.y, uv.z)) * w3.x * w0.y;\r
  result += texture(tex, vec3(texPos0.x, texPos12.y, uv.z)) * w0.x * w12.y;\r
  result += texture(tex, vec3(texPos12.x, texPos12.y, uv.z)) * w12.x * w12.y;\r
  result += texture(tex, vec3(texPos3.x, texPos12.y, uv.z)) * w3.x * w12.y;\r
  result += texture(tex, vec3(texPos0.x, texPos3.y, uv.z)) * w0.x * w3.y;\r
  result += texture(tex, vec3(texPos12.x, texPos3.y, uv.z)) * w12.x * w3.y;\r
  result += texture(tex, vec3(texPos3.x, texPos3.y, uv.z)) * w3.x * w3.y;\r
  return result;\r
}\r
`;

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\cloudsResolve.frag
var cloudsResolve_default = `precision highp float;\r
precision highp sampler2DArray;\r
\r
#include "core/turbo"\r
#include "catmullRomSampling"\r
#include "varianceClipping"\r
\r
uniform sampler2D colorBuffer;\r
uniform sampler2D depthVelocityBuffer;\r
uniform sampler2D colorHistoryBuffer;\r
\r
#ifdef SHADOW_LENGTH\r
uniform sampler2D shadowLengthBuffer;\r
uniform sampler2D shadowLengthHistoryBuffer;\r
#endif // SHADOW_LENGTH\r
\r
uniform vec2 texelSize;\r
uniform int frame;\r
uniform float varianceGamma;\r
uniform float temporalAlpha;\r
uniform vec2 jitterOffset;\r
\r
in vec2 vUv;\r
\r
layout(location = 0) out vec4 outputColor;\r
#ifdef SHADOW_LENGTH\r
layout(location = 1) out float outputShadowLength;\r
#endif // SHADOW_LENGTH\r
\r
const ivec2 neighborOffsets[9] = ivec2[9](\r
  ivec2(-1, -1),\r
  ivec2(-1, 0),\r
  ivec2(-1, 1),\r
  ivec2(0, -1),\r
  ivec2(0, 0),\r
  ivec2(0, 1),\r
  ivec2(1, -1),\r
  ivec2(1, 0),\r
  ivec2(1, 1)\r
);\r
\r
const ivec4[4] bayerIndices = ivec4[4](\r
  ivec4(0, 12, 3, 15),\r
  ivec4(8, 4, 11, 7),\r
  ivec4(2, 14, 1, 13),\r
  ivec4(10, 6, 9, 5)\r
);\r
\r
vec2 getUnjitteredUv(ivec2 coord) {\r
  return (vec2(coord) + 0.5 - jitterOffset) * texelSize;\r
}\r
\r
vec4 getClosestFragment(const vec2 uv) {\r
  vec4 result = vec4(1e7, 0.0, 0.0, 0.0);\r
  vec4 neighbor;\r
  #pragma unroll_loop_start\r
  for (int i = 0; i < 9; ++i) {\r
    neighbor = textureOffset(depthVelocityBuffer, uv, neighborOffsets[i]);\r
    if (neighbor.r < result.r) {\r
      result = neighbor;\r
    }\r
  }\r
  #pragma unroll_loop_end\r
  return result;\r
}\r
\r
vec4 getClosestFragment(const ivec2 coord) {\r
  vec4 result = vec4(1e7, 0.0, 0.0, 0.0);\r
  vec4 neighbor;\r
  #pragma unroll_loop_start\r
  for (int i = 0; i < 9; ++i) {\r
    neighbor = texelFetchOffset(depthVelocityBuffer, coord, 0, neighborOffsets[i]);\r
    if (neighbor.r < result.r) {\r
      result = neighbor;\r
    }\r
  }\r
  #pragma unroll_loop_end\r
  return result;\r
}\r
\r
void temporalUpscale(\r
  const ivec2 coord,\r
  const ivec2 lowResCoord,\r
  const bool currentFrame,\r
  out vec4 outputColor,\r
  out float outputShadowLength\r
) {\r
  #if !defined(DEBUG_SHOW_VELOCITY)\r
  if (currentFrame) {\r
    // Use the texel just rendered without any accumulation.\r
    outputColor = texelFetch(colorBuffer, lowResCoord, 0);\r
    #ifdef SHADOW_LENGTH\r
    outputShadowLength = texelFetch(shadowLengthBuffer, lowResCoord, 0).r;\r
    #endif // SHADOW_LENGTH\r
    return;\r
  }\r
  #endif // !defined(DEBUG_SHOW_VELOCITY)\r
\r
  vec2 unjitteredUv = getUnjitteredUv(coord);\r
  vec4 currentColor = texture(colorBuffer, unjitteredUv);\r
  #ifdef SHADOW_LENGTH\r
  vec4 currentShadowLength = vec4(texture(shadowLengthBuffer, unjitteredUv).rgb, 1.0);\r
  #endif // SHADOW_LENGTH\r
\r
  vec4 depthVelocity = getClosestFragment(unjitteredUv);\r
  vec2 velocity = depthVelocity.gb * texelSize;\r
  vec2 prevUv = vUv - velocity;\r
  if (prevUv.x < 0.0 || prevUv.x > 1.0 || prevUv.y < 0.0 || prevUv.y > 1.0) {\r
    outputColor = currentColor;\r
    #ifdef SHADOW_LENGTH\r
    outputShadowLength = currentShadowLength.r;\r
    #endif // SHADOW_LENGTH\r
    return; // Rejection\r
  }\r
\r
  // Variance clipping with a large variance gamma seems to work fine for\r
  // upsampling. This increases ghosting, of course, but it's hard to notice on\r
  // clouds.\r
  // vec4 historyColor = textureCatmullRom(colorHistoryBuffer, prevUv);\r
  vec4 historyColor = texture(colorHistoryBuffer, prevUv);\r
  vec4 clippedColor = varianceClipping(colorBuffer, vUv, currentColor, historyColor, varianceGamma);\r
  outputColor = clippedColor;\r
\r
  #ifdef DEBUG_SHOW_VELOCITY\r
  outputColor.rgb = outputColor.rgb + vec3(abs(velocity), 0.0);\r
  #endif // DEBUG_SHOW_VELOCITY\r
\r
  #ifdef SHADOW_LENGTH\r
  // Sampling the shadow length history using scene depth doesn't make much\r
  // sense, but it's too hard to derive it properly. At least this approach\r
  // resolves the edges of scene objects.\r
  // vec4 historyShadowLength = vec4(textureCatmullRom(shadowLengthHistoryBuffer, prevUv).rgb, 1.0);\r
  vec4 historyShadowLength = vec4(texture(shadowLengthHistoryBuffer, prevUv).rgb, 1.0);\r
  vec4 clippedShadowLength = varianceClipping(\r
    shadowLengthBuffer,\r
    vUv,\r
    currentShadowLength,\r
    historyShadowLength,\r
    varianceGamma\r
  );\r
  outputShadowLength = clippedShadowLength.r;\r
  #endif // SHADOW_LENGTH\r
}\r
\r
void temporalAntialiasing(const ivec2 coord, out vec4 outputColor, out float outputShadowLength) {\r
  vec4 currentColor = texelFetch(colorBuffer, coord, 0);\r
  #ifdef SHADOW_LENGTH\r
  vec4 currentShadowLength = vec4(texelFetch(shadowLengthBuffer, coord, 0).rgb, 1.0);\r
  #endif // SHADOW_LENGTH\r
\r
  vec4 depthVelocity = getClosestFragment(coord);\r
  vec2 velocity = depthVelocity.gb * texelSize;\r
\r
  vec2 prevUv = vUv - velocity;\r
  if (prevUv.x < 0.0 || prevUv.x > 1.0 || prevUv.y < 0.0 || prevUv.y > 1.0) {\r
    outputColor = currentColor;\r
    #ifdef SHADOW_LENGTH\r
    outputShadowLength = currentShadowLength.r;\r
    #endif // SHADOW_LENGTH\r
    return; // Rejection\r
  }\r
\r
  vec4 historyColor = texture(colorHistoryBuffer, prevUv);\r
  vec4 clippedColor = varianceClipping(colorBuffer, coord, currentColor, historyColor);\r
  outputColor = mix(clippedColor, currentColor, temporalAlpha);\r
\r
  #ifdef DEBUG_SHOW_VELOCITY\r
  outputColor.rgb = outputColor.rgb + vec3(abs(velocity), 0.0);\r
  #endif // DEBUG_SHOW_VELOCITY\r
\r
  #ifdef SHADOW_LENGTH\r
  vec4 historyShadowLength = vec4(texture(shadowLengthHistoryBuffer, prevUv).rgb, 1.0);\r
  vec4 clippedShadowLength = varianceClipping(\r
    shadowLengthBuffer,\r
    coord,\r
    currentShadowLength,\r
    historyShadowLength\r
  );\r
  outputShadowLength = mix(clippedShadowLength.r, currentShadowLength.r, temporalAlpha);\r
  #endif // SHADOW_LENGTH\r
}\r
\r
void main() {\r
  ivec2 coord = ivec2(gl_FragCoord.xy);\r
\r
  #if !defined(SHADOW_LENGTH)\r
  float outputShadowLength;\r
  #endif // !defined(SHADOW_LENGTH)\r
\r
  #ifdef TEMPORAL_UPSCALE\r
  ivec2 lowResCoord = coord / 4;\r
  int bayerValue = bayerIndices[coord.x % 4][coord.y % 4];\r
  bool currentFrame = bayerValue == frame % 16;\r
  temporalUpscale(coord, lowResCoord, currentFrame, outputColor, outputShadowLength);\r
  #else // TEMPORAL_UPSCALE\r
  temporalAntialiasing(coord, outputColor, outputShadowLength);\r
  #endif // TEMPORAL_UPSCALE\r
\r
  #if defined(SHADOW_LENGTH) && defined(DEBUG_SHOW_SHADOW_LENGTH)\r
  outputColor = vec4(turbo(outputShadowLength * 0.05), 1.0);\r
  #endif // defined(SHADOW_LENGTH) && defined(DEBUG_SHOW_SHADOW_LENGTH)\r
}\r
`;

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\cloudsResolve.vert
var cloudsResolve_default2 = "precision highp float;\r\n\r\nlayout(location = 0) in vec3 position;\r\n\r\nout vec2 vUv;\r\n\r\nvoid main() {\r\n  vUv = position.xy * 0.5 + 0.5;\r\n  gl_Position = vec4(position.xy, 1.0, 1.0);\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\varianceClipping.glsl
var varianceClipping_default = "#ifdef VARIANCE_9_SAMPLES\r\n#define VARIANCE_OFFSET_COUNT (8)\r\nconst ivec2 varianceOffsets[8] = ivec2[8](\r\n  ivec2(-1, -1),\r\n  ivec2(-1, 1),\r\n  ivec2(1, -1),\r\n  ivec2(1, 1),\r\n  ivec2(1, 0),\r\n  ivec2(0, -1),\r\n  ivec2(0, 1),\r\n  ivec2(-1, 0)\r\n);\r\n#else // VARIANCE_9_SAMPLES\r\n#define VARIANCE_OFFSET_COUNT (4)\r\nconst ivec2 varianceOffsets[4] = ivec2[4](ivec2(1, 0), ivec2(0, -1), ivec2(0, 1), ivec2(-1, 0));\r\n#endif // VARIANCE_9_SAMPLES\r\n\r\n// Reference: https://github.com/playdeadgames/temporal\r\nvec4 clipAABB(const vec4 current, const vec4 history, const vec4 minColor, const vec4 maxColor) {\r\n  vec3 pClip = 0.5 * (maxColor.rgb + minColor.rgb);\r\n  vec3 eClip = 0.5 * (maxColor.rgb - minColor.rgb) + 1e-7;\r\n  vec4 vClip = history - vec4(pClip, current.a);\r\n  vec3 vUnit = vClip.xyz / eClip;\r\n  vec3 aUnit = abs(vUnit);\r\n  float maUnit = max(aUnit.x, max(aUnit.y, aUnit.z));\r\n  if (maUnit > 1.0) {\r\n    return vec4(pClip, current.a) + vClip / maUnit;\r\n  }\r\n  return history;\r\n}\r\n\r\n#ifdef VARIANCE_SAMPLER_ARRAY\r\n#define VARIANCE_SAMPLER sampler2DArray\r\n#define VARIANCE_SAMPLER_COORD ivec3\r\n#else // VARIANCE_SAMPLER_ARRAY\r\n#define VARIANCE_SAMPLER sampler2D\r\n#define VARIANCE_SAMPLER_COORD ivec2\r\n#endif // VARIANCE_SAMPLER_ARRAY\r\n\r\n// Variance clipping\r\n// Reference: https://developer.download.nvidia.com/gameworks/events/GDC2016/msalvi_temporal_supersampling.pdf\r\nvec4 varianceClipping(\r\n  const VARIANCE_SAMPLER inputBuffer,\r\n  const VARIANCE_SAMPLER_COORD coord,\r\n  const vec4 current,\r\n  const vec4 history,\r\n  const float gamma\r\n) {\r\n  vec4 moment1 = current;\r\n  vec4 moment2 = current * current;\r\n  vec4 neighbor;\r\n  #pragma unroll_loop_start\r\n  for (int i = 0; i < 8; ++i) {\r\n    #if UNROLLED_LOOP_INDEX < VARIANCE_OFFSET_COUNT\r\n    neighbor = texelFetchOffset(inputBuffer, coord, 0, varianceOffsets[i]);\r\n    moment1 += neighbor;\r\n    moment2 += neighbor * neighbor;\r\n    #endif // UNROLLED_LOOP_INDEX < VARIANCE_OFFSET_COUNT\r\n  }\r\n  #pragma unroll_loop_end\r\n\r\n  const float N = float(VARIANCE_OFFSET_COUNT + 1);\r\n  vec4 mean = moment1 / N;\r\n  vec4 varianceGamma = sqrt(max(moment2 / N - mean * mean, 0.0)) * gamma;\r\n  vec4 minColor = mean - varianceGamma;\r\n  vec4 maxColor = mean + varianceGamma;\r\n  return clipAABB(clamp(mean, minColor, maxColor), history, minColor, maxColor);\r\n}\r\n\r\nvec4 varianceClipping(\r\n  const VARIANCE_SAMPLER inputBuffer,\r\n  const VARIANCE_SAMPLER_COORD coord,\r\n  const vec4 current,\r\n  const vec4 history\r\n) {\r\n  return varianceClipping(inputBuffer, coord, current, history, 1.0);\r\n}\r\n\r\nvec4 varianceClipping(\r\n  const sampler2D inputBuffer,\r\n  const vec2 coord,\r\n  const vec4 current,\r\n  const vec4 history,\r\n  const float gamma\r\n) {\r\n  vec4 moment1 = current;\r\n  vec4 moment2 = current * current;\r\n  vec4 neighbor;\r\n  #pragma unroll_loop_start\r\n  for (int i = 0; i < 8; ++i) {\r\n    #if UNROLLED_LOOP_INDEX < VARIANCE_OFFSET_COUNT\r\n    neighbor = textureOffset(inputBuffer, coord, varianceOffsets[i]);\r\n    moment1 += neighbor;\r\n    moment2 += neighbor * neighbor;\r\n    #endif // UNROLLED_LOOP_INDEX < VARIANCE_OFFSET_COUNT\r\n  }\r\n  #pragma unroll_loop_end\r\n\r\n  const float N = float(VARIANCE_OFFSET_COUNT + 1);\r\n  vec4 mean = moment1 / N;\r\n  vec4 varianceGamma = sqrt(max(moment2 / N - mean * mean, 0.0)) * gamma;\r\n  vec4 minColor = mean - varianceGamma;\r\n  vec4 maxColor = mean + varianceGamma;\r\n  return clipAABB(clamp(mean, minColor, maxColor), history, minColor, maxColor);\r\n}\r\n\r\nvec4 varianceClipping(\r\n  const sampler2D inputBuffer,\r\n  const vec2 coord,\r\n  const vec4 current,\r\n  const vec4 history\r\n) {\r\n  return varianceClipping(inputBuffer, coord, current, history, 1.0);\r\n}\r\n";

// source/clouds/CloudsResolveMaterial.ts
var CloudsResolveMaterial = class extends RawShaderMaterial2 {
  constructor({
    colorBuffer = null,
    depthVelocityBuffer = null,
    shadowLengthBuffer = null,
    colorHistoryBuffer = null,
    shadowLengthHistoryBuffer = null
  } = {}) {
    super({
      name: "CloudsResolveMaterial",
      glslVersion: GLSL34,
      vertexShader: cloudsResolve_default2,
      fragmentShader: unrollLoops(
        resolveIncludes(cloudsResolve_default, {
          core: { turbo },
          catmullRomSampling: catmullRomSampling_default,
          varianceClipping: varianceClipping_default
        })
      ),
      uniforms: {
        colorBuffer: new Uniform7(colorBuffer),
        depthVelocityBuffer: new Uniform7(depthVelocityBuffer),
        shadowLengthBuffer: new Uniform7(shadowLengthBuffer),
        colorHistoryBuffer: new Uniform7(colorHistoryBuffer),
        shadowLengthHistoryBuffer: new Uniform7(shadowLengthHistoryBuffer),
        texelSize: new Uniform7(new Vector210()),
        frame: new Uniform7(0),
        jitterOffset: new Uniform7(new Vector210()),
        varianceGamma: new Uniform7(2),
        temporalAlpha: new Uniform7(0.1)
      }
    });
    this.temporalUpscale = true;
    this.shadowLength = true;
  }
  setSize(width, height) {
    this.uniforms.texelSize.value.set(1 / width, 1 / height);
  }
  onBeforeRender(renderer, scene, camera, geometry, object, group) {
    const uniforms = this.uniforms;
    const frame = uniforms.frame.value % 16;
    const offset = bayerOffsets[frame];
    const dx = (offset.x - 0.5) * 4;
    const dy = (offset.y - 0.5) * 4;
    this.uniforms.jitterOffset.value.set(dx, dy);
  }
};
__decorateClass([
  define("TEMPORAL_UPSCALE")
], CloudsResolveMaterial.prototype, "temporalUpscale", 2);
__decorateClass([
  define("SHADOW_LENGTH")
], CloudsResolveMaterial.prototype, "shadowLength", 2);

// source/clouds/PassBase.ts
import { Pass as Pass2 } from "postprocessing";
import { Camera as Camera2 } from "three";
var PassBase = class extends Pass2 {
  constructor(name, options) {
    super(name);
    this._mainCamera = new Camera2();
    const { shadow } = options;
    this.shadow = shadow;
  }
  get mainCamera() {
    return this._mainCamera;
  }
  set mainCamera(value) {
    this._mainCamera = value;
  }
};

// source/clouds/CloudsPass.ts
function createRenderTarget(name, { depthVelocity, shadowLength }) {
  const renderTarget = new WebGLRenderTarget2(1, 1, {
    depthBuffer: false,
    stencilBuffer: false,
    type: HalfFloatType4
  });
  renderTarget.texture.minFilter = LinearFilter3;
  renderTarget.texture.magFilter = LinearFilter3;
  renderTarget.texture.name = name;
  let depthVelocityBuffer;
  if (depthVelocity) {
    depthVelocityBuffer = renderTarget.texture.clone();
    depthVelocityBuffer.isRenderTargetTexture = true;
    renderTarget.depthVelocity = depthVelocityBuffer;
    renderTarget.textures.push(depthVelocityBuffer);
  }
  let shadowLengthBuffer;
  if (shadowLength) {
    shadowLengthBuffer = renderTarget.texture.clone();
    shadowLengthBuffer.isRenderTargetTexture = true;
    shadowLengthBuffer.format = RedFormat3;
    renderTarget.shadowLength = shadowLengthBuffer;
    renderTarget.textures.push(shadowLengthBuffer);
  }
  return Object.assign(renderTarget, {
    depthVelocity: depthVelocityBuffer ?? null,
    shadowLength: shadowLengthBuffer ?? null
  });
}
var CloudsPass = class extends PassBase {
  constructor({
    parameterUniforms,
    layerUniforms,
    atmosphereUniforms,
    ...options
  }, atmosphere) {
    super("CloudsPass", options);
    this.atmosphere = atmosphere;
    this.width = 0;
    this.height = 0;
    this.currentMaterial = new CloudsMaterial(
      {
        parameterUniforms,
        layerUniforms,
        atmosphereUniforms
      },
      atmosphere
    );
    this.currentPass = new ShaderPass2(this.currentMaterial);
    this.resolveMaterial = new CloudsResolveMaterial();
    this.resolvePass = new ShaderPass2(this.resolveMaterial);
    this.initRenderTargets({
      depthVelocity: true,
      shadowLength: defaults.lightShafts
    });
  }
  copyCameraSettings(camera) {
    this.currentMaterial.copyCameraSettings(camera);
  }
  initialize(renderer, alpha, frameBufferType) {
    this.currentPass.initialize(renderer, alpha, frameBufferType);
    this.resolvePass.initialize(renderer, alpha, frameBufferType);
  }
  initRenderTargets(options) {
    this.currentRenderTarget?.dispose();
    this.resolveRenderTarget?.dispose();
    this.historyRenderTarget?.dispose();
    const current = createRenderTarget("Clouds", options);
    const resolve = createRenderTarget("Clouds.A", {
      ...options,
      depthVelocity: false
    });
    const history = createRenderTarget("Clouds.B", {
      ...options,
      depthVelocity: false
    });
    this.currentRenderTarget = current;
    this.resolveRenderTarget = resolve;
    this.historyRenderTarget = history;
    const resolveUniforms = this.resolveMaterial.uniforms;
    resolveUniforms.colorBuffer.value = current.texture;
    resolveUniforms.depthVelocityBuffer.value = current.depthVelocity;
    resolveUniforms.shadowLengthBuffer.value = current.shadowLength;
    resolveUniforms.colorHistoryBuffer.value = history.texture;
    resolveUniforms.shadowLengthHistoryBuffer.value = history.shadowLength;
  }
  copyShadow() {
    const shadow = this.shadow;
    const currentUniforms = this.currentMaterial.uniforms;
    for (let i = 0; i < shadow.cascadeCount; ++i) {
      const cascade = shadow.cascades[i];
      currentUniforms.shadowIntervals.value[i].copy(cascade.interval);
      currentUniforms.shadowMatrices.value[i].copy(cascade.matrix);
    }
    currentUniforms.shadowFar.value = shadow.far;
  }
  copyReprojection() {
    this.currentMaterial.copyReprojectionMatrix(this.mainCamera);
  }
  swapBuffers() {
    const nextResolve = this.historyRenderTarget;
    const nextHistory = this.resolveRenderTarget;
    this.resolveRenderTarget = nextResolve;
    this.historyRenderTarget = nextHistory;
    const resolveUniforms = this.resolveMaterial.uniforms;
    resolveUniforms.colorHistoryBuffer.value = nextHistory.texture;
    resolveUniforms.shadowLengthHistoryBuffer.value = nextHistory.shadowLength;
  }
  update(renderer, frame, deltaTime) {
    this.currentMaterial.uniforms.frame.value = frame;
    this.resolveMaterial.uniforms.frame.value = frame;
    this.copyCameraSettings(this.mainCamera);
    this.copyShadow();
    this.currentPass.render(renderer, null, this.currentRenderTarget);
    this.resolvePass.render(renderer, null, this.resolveRenderTarget);
    this.copyReprojection();
    this.swapBuffers();
  }
  setSize(width, height) {
    this.width = width;
    this.height = height;
    if (this.temporalUpscale) {
      const lowResWidth = Math.ceil(width / 4);
      const lowResHeight = Math.ceil(height / 4);
      this.currentRenderTarget.setSize(lowResWidth, lowResHeight);
      this.currentMaterial.setSize(
        lowResWidth * 4,
        lowResHeight * 4,
        width,
        height
      );
    } else {
      this.currentRenderTarget.setSize(width, height);
      this.currentMaterial.setSize(width, height);
    }
    this.resolveRenderTarget.setSize(width, height);
    this.resolveMaterial.setSize(width, height);
    this.historyRenderTarget.setSize(width, height);
  }
  setShadowSize(width, height, depth2) {
    this.currentMaterial.shadowCascadeCount = depth2;
    this.currentMaterial.setShadowSize(width, height);
  }
  setDepthTexture(depthTexture, depthPacking) {
    this.currentMaterial.depthBuffer = depthTexture;
    this.currentMaterial.depthPacking = depthPacking ?? 0;
  }
  get outputBuffer() {
    return this.historyRenderTarget.texture;
  }
  get shadowBuffer() {
    return this.currentMaterial.uniforms.shadowBuffer.value;
  }
  set shadowBuffer(value) {
    this.currentMaterial.uniforms.shadowBuffer.value = value;
  }
  get shadowLengthBuffer() {
    return this.historyRenderTarget.shadowLength;
  }
  get temporalUpscale() {
    return this.currentMaterial.temporalUpscale;
  }
  set temporalUpscale(value) {
    if (value !== this.temporalUpscale) {
      this.currentMaterial.temporalUpscale = value;
      this.resolveMaterial.temporalUpscale = value;
      this.setSize(this.width, this.height);
    }
  }
  get lightShafts() {
    return this.currentMaterial.shadowLength;
  }
  set lightShafts(value) {
    if (value !== this.lightShafts) {
      this.currentMaterial.shadowLength = value;
      this.resolveMaterial.shadowLength = value;
      this.initRenderTargets({
        depthVelocity: true,
        shadowLength: value
      });
      this.setSize(this.width, this.height);
    }
  }
};

// source/clouds/ShadowPass.ts
import {
  HalfFloatType as HalfFloatType5,
  LinearFilter as LinearFilter4,
  WebGLArrayRenderTarget
} from "three";

// source/clouds/ShaderArrayPass.ts
import { ShaderPass as ShaderPass3 } from "postprocessing";

// source/clouds/helpers/setArrayRenderTargetLayers.ts
function setArrayRenderTargetLayers(renderer, outputBuffer) {
  const glTexture = renderer.properties.get(outputBuffer.texture).__webglTexture;
  const gl = renderer.getContext();
  invariant(gl instanceof WebGL2RenderingContext);
  renderer.setRenderTarget(outputBuffer);
  const drawBuffers = [];
  if (glTexture != null) {
    for (let layer = 0; layer < outputBuffer.depth; ++layer) {
      gl.framebufferTextureLayer(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0 + layer,
        glTexture,
        0,
        layer
      );
      drawBuffers.push(gl.COLOR_ATTACHMENT0 + layer);
    }
  }
  gl.drawBuffers(drawBuffers);
}

// source/clouds/ShaderArrayPass.ts
var ShaderArrayPass = class extends ShaderPass3 {
  render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {
    const uniforms = this.fullscreenMaterial.uniforms;
    if (inputBuffer !== null && uniforms?.[this.input] != null) {
      uniforms[this.input].value = inputBuffer.texture;
    }
    setArrayRenderTargetLayers(renderer, outputBuffer);
    renderer.render(this.scene, this.camera);
  }
};

// source/clouds/ShadowMaterial.ts
import {
  GLSL3 as GLSL35,
  Matrix4 as Matrix412,
  RawShaderMaterial as RawShaderMaterial3,
  Uniform as Uniform8,
  Vector2 as Vector211
} from "three";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\shadow.frag
var shadow_default = `precision highp float;\r
precision highp sampler3D;\r
\r
#include <common>\r
\r
#include "core/math"\r
#include "core/raySphereIntersection"\r
#include "types"\r
#include "parameters"\r
#include "structuredSampling"\r
#include "clouds"\r
\r
uniform mat4 inverseShadowMatrices[CASCADE_COUNT];\r
uniform mat4 reprojectionMatrices[CASCADE_COUNT];\r
\r
// Primary raymarch\r
uniform int maxIterationCount;\r
uniform float minStepSize;\r
uniform float maxStepSize;\r
uniform float opticalDepthTailScale;\r
\r
in vec2 vUv;\r
in vec3 vEllipsoidCenter;\r
\r
layout(location = 0) out vec4 outputColor[CASCADE_COUNT];\r
\r
// Redundant notation for prettier.\r
#if CASCADE_COUNT == 1\r
layout(location = 1) out vec3 outputDepthVelocity[CASCADE_COUNT];\r
#elif CASCADE_COUNT == 2\r
layout(location = 2) out vec3 outputDepthVelocity[CASCADE_COUNT];\r
#elif CASCADE_COUNT == 3\r
layout(location = 3) out vec3 outputDepthVelocity[CASCADE_COUNT];\r
#elif CASCADE_COUNT == 4\r
layout(location = 4) out vec3 outputDepthVelocity[CASCADE_COUNT];\r
#endif // CASCADE_COUNT\r
\r
vec4 marchClouds(\r
  const vec3 rayOrigin,\r
  const vec3 rayDirection,\r
  const float maxRayDistance,\r
  const float jitter,\r
  const float mipLevel\r
) {\r
  // Setup structured volume sampling (SVS).\r
  // While SVS introduces spatial aliasing, it is indeed temporally stable,\r
  // which is important for lower-resolution shadow maps where a flickering\r
  // single pixel can be highly noticeable.\r
  vec3 normal = getStructureNormal(rayDirection, jitter);\r
  float rayDistance;\r
  float stepSize;\r
  intersectStructuredPlanes(\r
    normal,\r
    rayOrigin,\r
    rayDirection,\r
    clamp(maxRayDistance / float(maxIterationCount), minStepSize, maxStepSize),\r
    rayDistance,\r
    stepSize\r
  );\r
\r
  #ifdef TEMPORAL_JITTER\r
  rayDistance -= stepSize * jitter;\r
  #endif // TEMPORAL_JITTER\r
\r
  float extinctionSum = 0.0;\r
  float maxOpticalDepth = 0.0;\r
  float maxOpticalDepthTail = 0.0;\r
  float transmittanceIntegral = 1.0;\r
  float weightedDistanceSum = 0.0;\r
  float transmittanceSum = 0.0;\r
\r
  int sampleCount = 0;\r
  for (int i = 0; i < maxIterationCount; ++i) {\r
    if (rayDistance > maxRayDistance) {\r
      break; // Termination\r
    }\r
\r
    vec3 position = rayDistance * rayDirection + rayOrigin;\r
    float height = length(position) - bottomRadius;\r
\r
    #if !defined(DEBUG_MARCH_INTERVALS)\r
    if (insideLayerIntervals(height)) {\r
      rayDistance += stepSize;\r
      continue;\r
    }\r
    #endif // !defined(DEBUG_MARCH_INTERVALS)\r
\r
    // Sample rough weather.\r
    vec2 uv = getGlobeUv(position);\r
    WeatherSample weather = sampleWeather(uv, height, mipLevel);\r
\r
    if (any(greaterThan(weather.density, vec4(minDensity)))) {\r
      // Sample detailed participating media.\r
      // Note this assumes an homogeneous medium.\r
      MediaSample media = sampleMedia(weather, position, uv, mipLevel, jitter);\r
      if (media.extinction > minExtinction) {\r
        extinctionSum += media.extinction;\r
        maxOpticalDepth += media.extinction * stepSize;\r
        transmittanceIntegral *= exp(-media.extinction * stepSize);\r
        weightedDistanceSum += rayDistance * transmittanceIntegral;\r
        transmittanceSum += transmittanceIntegral;\r
        ++sampleCount;\r
      }\r
    }\r
\r
    if (transmittanceIntegral <= minTransmittance) {\r
      // A large amount of optical depth accumulates in the tail, beyond the\r
      // point of minimum transmittance. The expected optical depth seems to\r
      // decrease exponentially with the number of samples taken before reaching\r
      // the minimum transmittance.\r
      // See the discussion here: https://x.com/shotamatsuda/status/1886259549931520437\r
      maxOpticalDepthTail = min(\r
        opticalDepthTailScale * stepSize * exp(float(1 - sampleCount)),\r
        stepSize * 0.5 // Excessive optical depth only introduces aliasing.\r
      );\r
      break; // Early termination\r
    }\r
    rayDistance += stepSize;\r
  }\r
\r
  if (sampleCount == 0) {\r
    return vec4(maxRayDistance, 0.0, 0.0, 0.0);\r
  }\r
  float frontDepth = min(weightedDistanceSum / transmittanceSum, maxRayDistance);\r
  float meanExtinction = extinctionSum / float(sampleCount);\r
  return vec4(frontDepth, meanExtinction, maxOpticalDepth, maxOpticalDepthTail);\r
}\r
\r
void getRayNearFar(\r
  const vec3 sunPosition,\r
  const vec3 rayDirection,\r
  out float rayNear,\r
  out float rayFar\r
) {\r
  vec4 firstIntersections = raySphereFirstIntersection(\r
    sunPosition,\r
    rayDirection,\r
    vec3(0.0),\r
    bottomRadius + vec4(shadowTopHeight, shadowBottomHeight, 0.0, 0.0)\r
  );\r
  rayNear = max(0.0, firstIntersections.x);\r
  rayFar = firstIntersections.y;\r
  if (rayFar < 0.0) {\r
    rayFar = 1e6;\r
  }\r
}\r
\r
void cascade(\r
  const int cascadeIndex,\r
  const float mipLevel,\r
  out vec4 outputColor,\r
  out vec3 outputDepthVelocity\r
) {\r
  vec2 clip = vUv * 2.0 - 1.0;\r
  vec4 point = inverseShadowMatrices[cascadeIndex] * vec4(clip.xy, -1.0, 1.0);\r
  point /= point.w;\r
  vec3 sunPosition = mat3(inverseEllipsoidMatrix) * point.xyz - vEllipsoidCenter;\r
\r
  // The sun direction is in ECEF. Since the view matrix is constructed with the\r
  // ellipsoid matrix already applied, there's no need to apply the inverse\r
  // matrix here.\r
  vec3 rayDirection = normalize(-sunDirection);\r
  float rayNear;\r
  float rayFar;\r
  getRayNearFar(sunPosition, rayDirection, rayNear, rayFar);\r
\r
  vec3 rayOrigin = rayNear * rayDirection + sunPosition;\r
  float stbn = getSTBN();\r
  vec4 color = marchClouds(rayOrigin, rayDirection, rayFar - rayNear, stbn, mipLevel);\r
  outputColor = color;\r
\r
  // Velocity for temporal resolution.\r
  #ifdef TEMPORAL_PASS\r
  vec3 frontPosition = color.x * rayDirection + rayOrigin;\r
  vec3 frontPositionWorld = mat3(ellipsoidMatrix) * (frontPosition + vEllipsoidCenter);\r
  vec4 prevClip = reprojectionMatrices[cascadeIndex] * vec4(frontPositionWorld, 1.0);\r
  prevClip /= prevClip.w;\r
  vec2 prevUv = prevClip.xy * 0.5 + 0.5;\r
  vec2 velocity = (vUv - prevUv) * resolution;\r
  outputDepthVelocity = vec3(color.x, velocity);\r
  #else // TEMPORAL_PASS\r
  outputDepthVelocity = vec3(0.0);\r
  #endif // TEMPORAL_PASS\r
}\r
\r
// TODO: Calculate from the main camera frustum perhaps?\r
const float mipLevels[4] = float[4](0.0, 0.5, 1.0, 2.0);\r
\r
void main() {\r
  #pragma unroll_loop_start\r
  for (int i = 0; i < 4; ++i) {\r
    #if UNROLLED_LOOP_INDEX < CASCADE_COUNT\r
    cascade(UNROLLED_LOOP_INDEX, mipLevels[i], outputColor[i], outputDepthVelocity[i]);\r
    #endif // UNROLLED_LOOP_INDEX < CASCADE_COUNT\r
  }\r
  #pragma unroll_loop_end\r
}\r
`;

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\shadow.vert
var shadow_default2 = "precision highp float;\r\n\r\nuniform vec3 ellipsoidCenter;\r\nuniform vec3 altitudeCorrection;\r\n\r\nlayout(location = 0) in vec3 position;\r\n\r\nout vec2 vUv;\r\nout vec3 vEllipsoidCenter;\r\n\r\nvoid main() {\r\n  vUv = position.xy * 0.5 + 0.5;\r\n  vEllipsoidCenter = ellipsoidCenter + altitudeCorrection;\r\n\r\n  gl_Position = vec4(position.xy, 1.0, 1.0);\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\structuredSampling.glsl
var structuredSampling_default = "// Implements Structured Volume Sampling in fragment shader:\r\n// https://github.com/huwb/volsample\r\n// Implementation reference:\r\n// https://www.shadertoy.com/view/ttVfDc\r\n\r\nvoid getIcosahedralVertices(const vec3 direction, out vec3 v1, out vec3 v2, out vec3 v3) {\r\n  // Normalization scalers to fit dodecahedron to unit sphere.\r\n  const float a = 0.85065080835204; // phi / sqrt(2 + phi)\r\n  const float b = 0.5257311121191336; // 1 / sqrt(2 + phi)\r\n\r\n  // Derive the vertices of icosahedron where triangle intersects the direction.\r\n  // See: https://www.ppsloan.org/publications/AmbientDice.pdf\r\n  const float kT = 0.6180339887498948; // 1 / phi\r\n  const float kT2 = 0.38196601125010515; // 1 / phi^2\r\n  vec3 absD = abs(direction);\r\n  float selector1 = dot(absD, vec3(1.0, kT2, -kT));\r\n  float selector2 = dot(absD, vec3(-kT, 1.0, kT2));\r\n  float selector3 = dot(absD, vec3(kT2, -kT, 1.0));\r\n  v1 = selector1 > 0.0 ? vec3(a, b, 0.0) : vec3(-b, 0.0, a);\r\n  v2 = selector2 > 0.0 ? vec3(0.0, a, b) : vec3(a, -b, 0.0);\r\n  v3 = selector3 > 0.0 ? vec3(b, 0.0, a) : vec3(0.0, a, -b);\r\n  vec3 octantSign = sign(direction);\r\n  v1 *= octantSign;\r\n  v2 *= octantSign;\r\n  v3 *= octantSign;\r\n}\r\n\r\nvoid swapIfBigger(inout vec4 a, inout vec4 b) {\r\n  if (a.w > b.w) {\r\n    vec4 t = a;\r\n    a = b;\r\n    b = t;\r\n  }\r\n}\r\n\r\nvoid sortVertices(inout vec3 a, inout vec3 b, inout vec3 c) {\r\n  const vec3 base = vec3(0.5, 0.5, 1.0);\r\n  vec4 aw = vec4(a, dot(a, base));\r\n  vec4 bw = vec4(b, dot(b, base));\r\n  vec4 cw = vec4(c, dot(c, base));\r\n  swapIfBigger(aw, bw);\r\n  swapIfBigger(bw, cw);\r\n  swapIfBigger(aw, bw);\r\n  a = aw.xyz;\r\n  b = bw.xyz;\r\n  c = cw.xyz;\r\n}\r\n\r\nvec3 getPentagonalWeights(const vec3 direction, const vec3 v1, const vec3 v2, const vec3 v3) {\r\n  float d1 = dot(v1, direction);\r\n  float d2 = dot(v2, direction);\r\n  float d3 = dot(v3, direction);\r\n  vec3 w = exp(vec3(d1, d2, d3) * 40.0);\r\n  return w / (w.x + w.y + w.z);\r\n}\r\n\r\nvec3 getStructureNormal(\r\n  const vec3 direction,\r\n  const float jitter,\r\n  out vec3 a,\r\n  out vec3 b,\r\n  out vec3 c,\r\n  out vec3 weights\r\n) {\r\n  getIcosahedralVertices(direction, a, b, c);\r\n  sortVertices(a, b, c);\r\n  weights = getPentagonalWeights(direction, a, b, c);\r\n  return jitter < weights.x\r\n    ? a\r\n    : jitter < weights.x + weights.y\r\n      ? b\r\n      : c;\r\n}\r\n\r\nvec3 getStructureNormal(const vec3 direction, const float jitter) {\r\n  vec3 a, b, c, weights;\r\n  return getStructureNormal(direction, jitter, a, b, c, weights);\r\n}\r\n\r\n// Reference: https://github.com/huwb/volsample/blob/master/src/unity/Assets/Shaders/RayMarchCore.cginc\r\nvoid intersectStructuredPlanes(\r\n  const vec3 normal,\r\n  const vec3 rayOrigin,\r\n  const vec3 rayDirection,\r\n  const float samplePeriod,\r\n  out float stepOffset,\r\n  out float stepSize\r\n) {\r\n  float NoD = dot(rayDirection, normal);\r\n  stepSize = samplePeriod / abs(NoD);\r\n\r\n  // Skips leftover bit to get from rayOrigin to first strata plane.\r\n  stepOffset = -mod(dot(rayOrigin, normal), samplePeriod) / NoD;\r\n\r\n  // mod() gives different results depending on if the arg is negative or\r\n  // positive. This line makes it consistent, and ensures the first sample is in\r\n  // front of the viewer.\r\n  if (stepOffset < 0.0) {\r\n    stepOffset += stepSize;\r\n  }\r\n}\r\n";

// source/clouds/ShadowMaterial.ts
var ShadowMaterial = class extends RawShaderMaterial3 {
  constructor({
    parameterUniforms,
    layerUniforms,
    atmosphereUniforms
  }) {
    super({
      name: "ShadowMaterial",
      glslVersion: GLSL35,
      vertexShader: shadow_default2,
      fragmentShader: unrollLoops(
        resolveIncludes(shadow_default, {
          core: {
            math,
            raySphereIntersection
          },
          types: types_default,
          parameters: parameters_default2,
          structuredSampling: structuredSampling_default,
          clouds: clouds_default2
        })
      ),
      uniforms: {
        ...parameterUniforms,
        ...layerUniforms,
        ...atmosphereUniforms,
        inverseShadowMatrices: new Uniform8(
          Array.from({ length: 4 }, () => new Matrix412())
          // Populate the max number of elements
        ),
        reprojectionMatrices: new Uniform8(
          Array.from({ length: 4 }, () => new Matrix412())
          // Populate the max number of elements
        ),
        resolution: new Uniform8(new Vector211()),
        frame: new Uniform8(0),
        stbnTexture: new Uniform8(null),
        // Primary raymarch
        maxIterationCount: new Uniform8(defaults.shadow.maxIterationCount),
        minStepSize: new Uniform8(defaults.shadow.minStepSize),
        maxStepSize: new Uniform8(defaults.shadow.maxStepSize),
        minDensity: new Uniform8(defaults.shadow.minDensity),
        minExtinction: new Uniform8(defaults.shadow.minExtinction),
        minTransmittance: new Uniform8(defaults.shadow.minTransmittance),
        opticalDepthTailScale: new Uniform8(2)
      },
      defines: {
        SHADOW: "1",
        TEMPORAL_PASS: "1",
        TEMPORAL_JITTER: "1"
      }
    });
    this.localWeatherChannels = "rgba";
    this.cascadeCount = defaults.shadow.cascadeCount;
    this.temporalPass = true;
    this.temporalJitter = true;
    this.shapeDetail = defaults.shapeDetail;
    this.turbulence = defaults.turbulence;
    this.cascadeCount = defaults.shadow.cascadeCount;
  }
  setSize(width, height) {
    this.uniforms.resolution.value.set(width, height);
  }
};
__decorateClass([
  defineExpression("LOCAL_WEATHER_CHANNELS", {
    validate: (value) => /^[rgba]{4}$/.test(value)
  })
], ShadowMaterial.prototype, "localWeatherChannels", 2);
__decorateClass([
  defineInt("CASCADE_COUNT", { min: 1, max: 4 })
], ShadowMaterial.prototype, "cascadeCount", 2);
__decorateClass([
  define("TEMPORAL_PASS")
], ShadowMaterial.prototype, "temporalPass", 2);
__decorateClass([
  define("TEMPORAL_JITTER")
], ShadowMaterial.prototype, "temporalJitter", 2);
__decorateClass([
  define("SHAPE_DETAIL")
], ShadowMaterial.prototype, "shapeDetail", 2);
__decorateClass([
  define("TURBULENCE")
], ShadowMaterial.prototype, "turbulence", 2);

// source/clouds/ShadowResolveMaterial.ts
import {
  GLSL3 as GLSL36,
  RawShaderMaterial as RawShaderMaterial4,
  Uniform as Uniform9,
  Vector2 as Vector212
} from "three";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\shadowResolve.frag
var shadowResolve_default = 'precision highp float;\r\nprecision highp sampler2DArray;\r\n\r\n#define VARIANCE_9_SAMPLES (1)\r\n#define VARIANCE_SAMPLER_ARRAY (1)\r\n\r\n#include "varianceClipping"\r\n\r\nuniform sampler2DArray inputBuffer;\r\nuniform sampler2DArray historyBuffer;\r\n\r\nuniform vec2 texelSize;\r\nuniform float varianceGamma;\r\nuniform float temporalAlpha;\r\n\r\nin vec2 vUv;\r\n\r\nlayout(location = 0) out vec4 outputColor[CASCADE_COUNT];\r\n\r\nconst ivec2 neighborOffsets[9] = ivec2[9](\r\n  ivec2(-1, -1),\r\n  ivec2(-1, 0),\r\n  ivec2(-1, 1),\r\n  ivec2(0, -1),\r\n  ivec2(0, 0),\r\n  ivec2(0, 1),\r\n  ivec2(1, -1),\r\n  ivec2(1, 0),\r\n  ivec2(1, 1)\r\n);\r\n\r\nvec4 getClosestFragment(const ivec3 coord) {\r\n  vec4 result = vec4(1e7, 0.0, 0.0, 0.0);\r\n  vec4 neighbor;\r\n  #pragma unroll_loop_start\r\n  for (int i = 0; i < 9; ++i) {\r\n    neighbor = texelFetchOffset(\r\n      inputBuffer,\r\n      coord + ivec3(0, 0, CASCADE_COUNT),\r\n      0,\r\n      neighborOffsets[i]\r\n    );\r\n    if (neighbor.r < result.r) {\r\n      result = neighbor;\r\n    }\r\n  }\r\n  #pragma unroll_loop_end\r\n  return result;\r\n}\r\n\r\nvoid cascade(const int cascadeIndex, out vec4 outputColor) {\r\n  ivec3 coord = ivec3(gl_FragCoord.xy, cascadeIndex);\r\n  vec4 current = texelFetch(inputBuffer, coord, 0);\r\n\r\n  vec4 depthVelocity = getClosestFragment(coord);\r\n  vec2 velocity = depthVelocity.gb * texelSize;\r\n  vec2 prevUv = vUv - velocity;\r\n  if (prevUv.x < 0.0 || prevUv.x > 1.0 || prevUv.y < 0.0 || prevUv.y > 1.0) {\r\n    outputColor = current;\r\n    return; // Rejection\r\n  }\r\n\r\n  vec4 history = texture(historyBuffer, vec3(prevUv, float(cascadeIndex)));\r\n  vec4 clippedHistory = varianceClipping(inputBuffer, coord, current, history, varianceGamma);\r\n  outputColor = mix(clippedHistory, current, temporalAlpha);\r\n}\r\n\r\nvoid main() {\r\n  #pragma unroll_loop_start\r\n  for (int i = 0; i < 4; ++i) {\r\n    #if UNROLLED_LOOP_INDEX < CASCADE_COUNT\r\n    cascade(UNROLLED_LOOP_INDEX, outputColor[i]);\r\n    #endif // UNROLLED_LOOP_INDEX < CASCADE_COUNT\r\n  }\r\n  #pragma unroll_loop_end\r\n}\r\n';

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\shadowResolve.vert
var shadowResolve_default2 = "precision highp float;\r\n\r\nlayout(location = 0) in vec3 position;\r\n\r\nout vec2 vUv;\r\n\r\nvoid main() {\r\n  vUv = position.xy * 0.5 + 0.5;\r\n  gl_Position = vec4(position.xy, 1.0, 1.0);\r\n}\r\n";

// source/clouds/ShadowResolveMaterial.ts
var ShadowResolveMaterial = class extends RawShaderMaterial4 {
  constructor({
    inputBuffer = null,
    historyBuffer = null
  } = {}) {
    super({
      name: "ShadowResolveMaterial",
      glslVersion: GLSL36,
      vertexShader: shadowResolve_default2,
      fragmentShader: unrollLoops(
        resolveIncludes(shadowResolve_default, {
          varianceClipping: varianceClipping_default
        })
      ),
      uniforms: {
        inputBuffer: new Uniform9(inputBuffer),
        historyBuffer: new Uniform9(historyBuffer),
        texelSize: new Uniform9(new Vector212()),
        varianceGamma: new Uniform9(1),
        // Use a very slow alpha because a single flickering pixel can be highly
        // noticeable in shadow maps. This value can be increased if temporal
        // jitter is turned off in the shadows rendering, but it will suffer
        // from spatial aliasing.
        temporalAlpha: new Uniform9(0.01)
      },
      defines: {}
    });
    this.cascadeCount = defaults.shadow.cascadeCount;
  }
  setSize(width, height) {
    this.uniforms.texelSize.value.set(1 / width, 1 / height);
  }
};
__decorateClass([
  defineInt("CASCADE_COUNT", { min: 1, max: 4 })
], ShadowResolveMaterial.prototype, "cascadeCount", 2);

// source/clouds/ShadowPass.ts
function createRenderTarget2(name) {
  const renderTarget = new WebGLArrayRenderTarget(1, 1, 1, {
    depthBuffer: false,
    stencilBuffer: false
  });
  renderTarget.texture.type = HalfFloatType5;
  renderTarget.texture.minFilter = LinearFilter4;
  renderTarget.texture.magFilter = LinearFilter4;
  renderTarget.texture.name = name;
  return renderTarget;
}
var ShadowPass = class extends PassBase {
  constructor({
    parameterUniforms,
    layerUniforms,
    atmosphereUniforms,
    ...options
  }) {
    super("ShadowPass", options);
    this.width = 0;
    this.height = 0;
    this.currentMaterial = new ShadowMaterial({
      parameterUniforms,
      layerUniforms,
      atmosphereUniforms
    });
    this.currentPass = new ShaderArrayPass(this.currentMaterial);
    this.resolveMaterial = new ShadowResolveMaterial();
    this.resolvePass = new ShaderArrayPass(this.resolveMaterial);
    this.initRenderTargets();
  }
  initialize(renderer, alpha, frameBufferType) {
    this.currentPass.initialize(renderer, alpha, frameBufferType);
    this.resolvePass.initialize(renderer, alpha, frameBufferType);
  }
  initRenderTargets() {
    this.currentRenderTarget?.dispose();
    this.resolveRenderTarget?.dispose();
    this.historyRenderTarget?.dispose();
    const current = createRenderTarget2("Shadow");
    const resolve = this.temporalPass ? createRenderTarget2("Shadow.A") : null;
    const history = this.temporalPass ? createRenderTarget2("Shadow.B") : null;
    this.currentRenderTarget = current;
    this.resolveRenderTarget = resolve;
    this.historyRenderTarget = history;
    const resolveUniforms = this.resolveMaterial.uniforms;
    resolveUniforms.inputBuffer.value = current.texture;
    resolveUniforms.historyBuffer.value = history?.texture ?? null;
  }
  copyShadow() {
    const shadow = this.shadow;
    const currentUniforms = this.currentMaterial.uniforms;
    for (let i = 0; i < shadow.cascadeCount; ++i) {
      const cascade = shadow.cascades[i];
      currentUniforms.inverseShadowMatrices.value[i].copy(cascade.inverseMatrix);
    }
  }
  copyReprojection() {
    const shadow = this.shadow;
    const uniforms = this.currentMaterial.uniforms;
    for (let i = 0; i < shadow.cascadeCount; ++i) {
      const cascade = shadow.cascades[i];
      uniforms.reprojectionMatrices.value[i].copy(cascade.matrix);
    }
  }
  swapBuffers() {
    invariant(this.historyRenderTarget != null);
    invariant(this.resolveRenderTarget != null);
    const nextResolve = this.historyRenderTarget;
    const nextHistory = this.resolveRenderTarget;
    this.resolveRenderTarget = nextResolve;
    this.historyRenderTarget = nextHistory;
    this.resolveMaterial.uniforms.historyBuffer.value = nextHistory.texture;
  }
  update(renderer, frame, deltaTime) {
    this.currentMaterial.uniforms.frame.value = frame;
    this.copyShadow();
    this.currentPass.render(renderer, null, this.currentRenderTarget);
    if (this.temporalPass) {
      invariant(this.resolveRenderTarget != null);
      this.resolvePass.render(renderer, null, this.resolveRenderTarget);
      this.copyReprojection();
      this.swapBuffers();
    }
  }
  setSize(width, height, depth2 = this.shadow.cascadeCount) {
    this.width = width;
    this.height = height;
    this.currentMaterial.cascadeCount = depth2;
    this.resolveMaterial.cascadeCount = depth2;
    this.currentMaterial.setSize(width, height);
    this.resolveMaterial.setSize(width, height);
    this.currentRenderTarget.setSize(
      width,
      height,
      this.temporalPass ? depth2 * 2 : depth2
      // For depth velocity
    );
    this.resolveRenderTarget?.setSize(width, height, depth2);
    this.historyRenderTarget?.setSize(width, height, depth2);
  }
  get outputBuffer() {
    if (this.temporalPass) {
      invariant(this.historyRenderTarget != null);
      return this.historyRenderTarget.texture;
    }
    return this.currentRenderTarget.texture;
  }
  get temporalPass() {
    return this.currentMaterial.temporalPass;
  }
  set temporalPass(value) {
    if (value !== this.temporalPass) {
      this.currentMaterial.temporalPass = value;
      this.initRenderTargets();
      this.setSize(this.width, this.height);
    }
  }
};

// source/clouds/uniforms.ts
import {
  Uniform as Uniform10,
  Vector3 as Vector322,
  Vector4 as Vector42
} from "three";
function createCloudParameterUniforms(instances) {
  return {
    // Participating medium
    scatteringCoefficient: new Uniform10(1),
    absorptionCoefficient: new Uniform10(0),
    // Weather and shape
    coverage: new Uniform10(0.3),
    localWeatherTexture: new Uniform10(instances.localWeatherTexture),
    localWeatherRepeat: new Uniform10(instances.localWeatherRepeat),
    localWeatherOffset: new Uniform10(instances.localWeatherOffset),
    shapeTexture: new Uniform10(instances.shapeTexture),
    shapeRepeat: new Uniform10(instances.shapeRepeat),
    shapeOffset: new Uniform10(instances.shapeOffset),
    shapeDetailTexture: new Uniform10(instances.shapeDetailTexture),
    shapeDetailRepeat: new Uniform10(instances.shapeDetailRepeat),
    shapeDetailOffset: new Uniform10(instances.shapeDetailOffset),
    turbulenceTexture: new Uniform10(instances.turbulenceTexture),
    turbulenceRepeat: new Uniform10(instances.turbulenceRepeat),
    turbulenceDisplacement: new Uniform10(350)
  };
}
function createCloudLayerUniforms() {
  return {
    minLayerHeights: new Uniform10(new Vector42()),
    maxLayerHeights: new Uniform10(new Vector42()),
    minIntervalHeights: new Uniform10(new Vector322()),
    maxIntervalHeights: new Uniform10(new Vector322()),
    densityScales: new Uniform10(new Vector42()),
    shapeAmounts: new Uniform10(new Vector42()),
    shapeDetailAmounts: new Uniform10(new Vector42()),
    weatherExponents: new Uniform10(new Vector42()),
    shapeAlteringBiases: new Uniform10(new Vector42()),
    coverageFilterWidths: new Uniform10(new Vector42()),
    minHeight: new Uniform10(0),
    maxHeight: new Uniform10(0),
    shadowTopHeight: new Uniform10(0),
    shadowBottomHeight: new Uniform10(0),
    shadowLayerMask: new Uniform10(new Vector42()),
    densityProfile: new Uniform10({
      expTerms: new Vector42(),
      exponents: new Vector42(),
      linearTerms: new Vector42(),
      constantTerms: new Vector42()
    })
  };
}
var shadowLayerMask = [0, 0, 0, 0];
function updateCloudLayerUniforms(uniforms, layers) {
  layers.packValues("altitude", uniforms.minLayerHeights.value);
  layers.packSums("altitude", "height", uniforms.maxLayerHeights.value);
  layers.packIntervalHeights(
    uniforms.minIntervalHeights.value,
    uniforms.maxIntervalHeights.value
  );
  layers.packValues("densityScale", uniforms.densityScales.value);
  layers.packValues("shapeAmount", uniforms.shapeAmounts.value);
  layers.packValues("shapeDetailAmount", uniforms.shapeDetailAmounts.value);
  layers.packValues("weatherExponent", uniforms.weatherExponents.value);
  layers.packValues("shapeAlteringBias", uniforms.shapeAlteringBiases.value);
  layers.packValues("coverageFilterWidth", uniforms.coverageFilterWidths.value);
  const densityProfile = uniforms.densityProfile.value;
  layers.packDensityProfiles("expTerm", densityProfile.expTerms);
  layers.packDensityProfiles("exponent", densityProfile.exponents);
  layers.packDensityProfiles("linearTerm", densityProfile.linearTerms);
  layers.packDensityProfiles("constantTerm", densityProfile.constantTerms);
  let totalMinHeight = Infinity;
  let totalMaxHeight = 0;
  let shadowBottomHeight = Infinity;
  let shadowTopHeight = 0;
  shadowLayerMask.fill(0);
  for (let i = 0; i < layers.length; ++i) {
    const { altitude, height, shadow } = layers[i];
    const maxHeight = altitude + height;
    if (height > 0) {
      if (altitude < totalMinHeight) {
        totalMinHeight = altitude;
      }
      if (shadow && altitude < shadowBottomHeight) {
        shadowBottomHeight = altitude;
      }
      if (maxHeight > totalMaxHeight) {
        totalMaxHeight = maxHeight;
      }
      if (shadow && maxHeight > shadowTopHeight) {
        shadowTopHeight = maxHeight;
      }
    }
    shadowLayerMask[i] = shadow ? 1 : 0;
  }
  if (totalMinHeight !== Infinity) {
    uniforms.minHeight.value = totalMinHeight;
    uniforms.maxHeight.value = totalMaxHeight;
  } else {
    invariant(totalMaxHeight === 0);
    uniforms.minHeight.value = 0;
  }
  if (shadowBottomHeight !== Infinity) {
    uniforms.shadowBottomHeight.value = shadowBottomHeight;
    uniforms.shadowTopHeight.value = shadowTopHeight;
  } else {
    invariant(shadowTopHeight === 0);
    uniforms.shadowBottomHeight.value = 0;
  }
  uniforms.shadowLayerMask.value.fromArray(shadowLayerMask);
}
function createAtmosphereUniforms(atmosphere, instances) {
  return {
    bottomRadius: new Uniform10(atmosphere.bottomRadius),
    topRadius: new Uniform10(atmosphere.topRadius),
    ellipsoidCenter: new Uniform10(instances.ellipsoidCenter),
    ellipsoidMatrix: new Uniform10(instances.ellipsoidMatrix),
    inverseEllipsoidMatrix: new Uniform10(instances.inverseEllipsoidMatrix),
    altitudeCorrection: new Uniform10(instances.altitudeCorrection),
    sunDirection: new Uniform10(instances.sunDirection)
  };
}

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\cloudsEffect.frag
var cloudsEffect_default = "uniform sampler2D cloudsBuffer;\r\n\r\nvoid mainImage(const vec4 inputColor, const vec2 uv, out vec4 outputColor) {\r\n  #ifdef SKIP_RENDERING\r\n  outputColor = inputColor;\r\n  #else // SKIP_RENDERING\r\n  vec4 clouds = texture(cloudsBuffer, uv);\r\n  outputColor.rgb = inputColor.rgb * (1.0 - clouds.a) + clouds.rgb;\r\n  outputColor.a = inputColor.a * (1.0 - clouds.a) + clouds.a;\r\n  #endif // SKIP_RENDERING\r\n}\r\n";

// source/clouds/CloudsEffect.ts
var vector3Scratch = /* @__PURE__ */ new Vector323();
var vector2Scratch = /* @__PURE__ */ new Vector213();
var cloudsUniformKeys = [
  "maxIterationCount",
  "minStepSize",
  "maxStepSize",
  "maxRayDistance",
  "perspectiveStepScale",
  "minDensity",
  "minExtinction",
  "minTransmittance",
  "maxIterationCountToSun",
  "maxIterationCountToGround",
  "minSecondaryStepSize",
  "secondaryStepScale",
  "maxShadowFilterRadius",
  "maxShadowLengthIterationCount",
  "minShadowLengthStepSize",
  "maxShadowLengthRayDistance",
  "hazeDensityScale",
  "hazeExponent",
  "hazeScatteringCoefficient",
  "hazeAbsorptionCoefficient"
];
var cloudsMaterialParameterKeys = [
  "multiScatteringOctaves",
  "accurateSunSkyIrradiance",
  "accuratePhaseFunction"
];
var shadowUniformKeys = [
  "maxIterationCount",
  "minStepSize",
  "maxStepSize",
  "minDensity",
  "minExtinction",
  "minTransmittance",
  "opticalDepthTailScale"
];
var shadowMaterialParameterKeys = [
  "temporalJitter"
];
var shadowPassParameterKeys = [
  "temporalPass"
];
var shadowMapsParameterKeys = [
  "cascadeCount",
  "mapSize",
  "maxFar",
  "farScale",
  "splitMode",
  "splitLambda"
];
var changeEvent = {
  type: "change"
};
var cloudsPassOptionsDefaults = {
  resolutionScale: defaults.resolutionScale,
  width: Resolution.AUTO_SIZE,
  height: Resolution.AUTO_SIZE
};
var CloudsEffect = class extends Effect2 {
  constructor(camera = new Camera3(), options, atmosphere = AtmosphereParameters.DEFAULT) {
    super("CloudsEffect", cloudsEffect_default, {
      attributes: EffectAttribute2.DEPTH,
      uniforms: /* @__PURE__ */ new Map([["cloudsBuffer", new Uniform11(null)]])
    });
    this.camera = camera;
    this.atmosphere = atmosphere;
    this.cloudLayers = CloudLayers.DEFAULT.clone();
    this.correctAltitude = true;
    // Mutable instances of cloud parameter uniforms
    this.localWeatherRepeat = new Vector213().setScalar(100);
    this.localWeatherOffset = new Vector213();
    this.shapeRepeat = new Vector323().setScalar(3e-4);
    this.shapeOffset = new Vector323();
    this.shapeDetailRepeat = new Vector323().setScalar(6e-3);
    this.shapeDetailOffset = new Vector323();
    this.turbulenceRepeat = new Vector213().setScalar(20);
    // Mutable instances of atmosphere parameter uniforms
    this.ellipsoidCenter = new Vector323();
    this.ellipsoidMatrix = new Matrix413();
    this.inverseEllipsoidMatrix = new Matrix413();
    this.altitudeCorrection = new Vector323();
    this.sunDirection = new Vector323();
    this.localWeatherVelocity = new Vector213();
    this.shapeVelocity = new Vector323();
    this.shapeDetailVelocity = new Vector323();
    this._atmosphereOverlay = null;
    this._atmosphereShadow = null;
    this._atmosphereShadowLength = null;
    this.events = new EventDispatcher();
    this.frame = 0;
    this.shadowCascadeCount = 0;
    this.shadowMapSize = new Vector213();
    this.onResolutionChange = () => {
      this.setSize(this.resolution.baseWidth, this.resolution.baseHeight);
    };
    this.skipRendering = true;
    const {
      resolutionScale,
      width,
      height,
      resolutionX = width,
      resolutionY = height
    } = {
      ...cloudsPassOptionsDefaults,
      ...options
    };
    this.shadowMaps = new CascadedShadowMaps({
      cascadeCount: defaults.shadow.cascadeCount,
      mapSize: defaults.shadow.mapSize,
      splitLambda: 0.6
    });
    this.parameterUniforms = createCloudParameterUniforms({
      localWeatherTexture: this.proceduralLocalWeather?.texture ?? null,
      localWeatherRepeat: this.localWeatherRepeat,
      localWeatherOffset: this.localWeatherOffset,
      shapeTexture: this.proceduralShape?.texture ?? null,
      shapeRepeat: this.shapeRepeat,
      shapeOffset: this.shapeOffset,
      shapeDetailTexture: this.proceduralShapeDetail?.texture ?? null,
      shapeDetailRepeat: this.shapeDetailRepeat,
      shapeDetailOffset: this.shapeDetailOffset,
      turbulenceTexture: this.proceduralTurbulence?.texture ?? null,
      turbulenceRepeat: this.turbulenceRepeat
    });
    this.layerUniforms = createCloudLayerUniforms();
    this.atmosphereUniforms = createAtmosphereUniforms(atmosphere, {
      ellipsoidCenter: this.ellipsoidCenter,
      ellipsoidMatrix: this.ellipsoidMatrix,
      inverseEllipsoidMatrix: this.inverseEllipsoidMatrix,
      altitudeCorrection: this.altitudeCorrection,
      sunDirection: this.sunDirection
    });
    const passOptions = {
      shadow: this.shadowMaps,
      parameterUniforms: this.parameterUniforms,
      layerUniforms: this.layerUniforms,
      atmosphereUniforms: this.atmosphereUniforms
    };
    this.shadowPass = new ShadowPass(passOptions);
    this.shadowPass.mainCamera = camera;
    this.cloudsPass = new CloudsPass(passOptions, atmosphere);
    this.cloudsPass.mainCamera = camera;
    this.clouds = definePropertyShorthand(
      defineUniformShorthand(
        {},
        this.cloudsPass.currentMaterial,
        cloudsUniformKeys
      ),
      this.cloudsPass.currentMaterial,
      cloudsMaterialParameterKeys
    );
    this.shadow = definePropertyShorthand(
      defineUniformShorthand(
        {},
        this.shadowPass.currentMaterial,
        shadowUniformKeys
      ),
      this.shadowPass.currentMaterial,
      shadowMaterialParameterKeys,
      this.shadowPass,
      shadowPassParameterKeys,
      this.shadowMaps,
      shadowMapsParameterKeys
    );
    this.resolution = new Resolution(
      this,
      resolutionX,
      resolutionY,
      resolutionScale
    );
    this.resolution.addEventListener("change", this.onResolutionChange);
  }
  get mainCamera() {
    return this.camera;
  }
  set mainCamera(value) {
    this.camera = value;
    this.shadowPass.mainCamera = value;
    this.cloudsPass.mainCamera = value;
  }
  initialize(renderer, alpha, frameBufferType) {
    this.shadowPass.initialize(renderer, alpha, frameBufferType);
    this.cloudsPass.initialize(renderer, alpha, frameBufferType);
  }
  updateSharedUniforms(deltaTime) {
    updateCloudLayerUniforms(this.layerUniforms, this.cloudLayers);
    const { parameterUniforms } = this;
    parameterUniforms.localWeatherOffset.value.add(
      vector2Scratch.copy(this.localWeatherVelocity).multiplyScalar(deltaTime)
    );
    parameterUniforms.shapeOffset.value.add(
      vector3Scratch.copy(this.shapeVelocity).multiplyScalar(deltaTime)
    );
    parameterUniforms.shapeDetailOffset.value.add(
      vector3Scratch.copy(this.shapeDetailVelocity).multiplyScalar(deltaTime)
    );
    const inverseEllipsoidMatrix = this.inverseEllipsoidMatrix.copy(this.ellipsoidMatrix).invert();
    const cameraPositionECEF = this.camera.getWorldPosition(vector3Scratch).applyMatrix4(inverseEllipsoidMatrix).sub(this.ellipsoidCenter);
    const altitudeCorrection = this.altitudeCorrection;
    if (this.correctAltitude) {
      getAltitudeCorrectionOffset(
        cameraPositionECEF,
        this.atmosphere.bottomRadius,
        this.ellipsoid,
        altitudeCorrection,
        false
      );
    } else {
      altitudeCorrection.setScalar(0);
    }
    const surfaceNormal = this.ellipsoid.getSurfaceNormal(
      cameraPositionECEF,
      vector3Scratch
    );
    const zenithAngle = this.sunDirection.dot(surfaceNormal);
    const distance = lerp(1e6, 1e3, zenithAngle);
    this.shadowMaps.update(
      this.camera,
      // The sun direction must be rotated with the ellipsoid to ensure the
      // frusta are constructed correctly. Note this affects the transformation
      // in the shadow shader.
      vector3Scratch.copy(this.sunDirection).applyMatrix4(this.ellipsoidMatrix),
      distance
    );
  }
  updateWeatherTextureChannels() {
    const value = this.cloudLayers.localWeatherChannels;
    this.cloudsPass.currentMaterial.localWeatherChannels = value;
    this.shadowPass.currentMaterial.localWeatherChannels = value;
  }
  updateAtmosphereComposition() {
    const { shadowMaps, shadowPass, cloudsPass } = this;
    const shadowUniforms = shadowPass.currentMaterial.uniforms;
    const cloudsUniforms = cloudsPass.currentMaterial.uniforms;
    const prevOverlay = this._atmosphereOverlay;
    const nextOverlay = Object.assign(this._atmosphereOverlay ?? {}, {
      map: cloudsPass.outputBuffer
    });
    if (prevOverlay !== nextOverlay) {
      this._atmosphereOverlay = nextOverlay;
      changeEvent.target = this;
      changeEvent.property = "atmosphereOverlay";
      this.events.dispatchEvent(changeEvent);
    }
    const prevShadow = this._atmosphereShadow;
    const nextShadow = Object.assign(this._atmosphereShadow ?? {}, {
      map: shadowPass.outputBuffer,
      mapSize: shadowMaps.mapSize,
      cascadeCount: shadowMaps.cascadeCount,
      intervals: cloudsUniforms.shadowIntervals.value,
      matrices: cloudsUniforms.shadowMatrices.value,
      inverseMatrices: shadowUniforms.inverseShadowMatrices.value,
      far: shadowMaps.far,
      topHeight: cloudsUniforms.shadowTopHeight.value
    });
    if (prevShadow !== nextShadow) {
      this._atmosphereShadow = nextShadow;
      changeEvent.target = this;
      changeEvent.property = "atmosphereShadow";
      this.events.dispatchEvent(changeEvent);
    }
    const prevShadowLength = this._atmosphereShadowLength;
    const nextShadowLength = cloudsPass.shadowLengthBuffer != null ? Object.assign(this._atmosphereShadowLength ?? {}, {
      map: cloudsPass.shadowLengthBuffer
    }) : null;
    if (prevShadowLength !== nextShadowLength) {
      this._atmosphereShadowLength = nextShadowLength;
      changeEvent.target = this;
      changeEvent.property = "atmosphereShadowLength";
      this.events.dispatchEvent(changeEvent);
    }
  }
  update(renderer, inputBuffer, deltaTime = 0) {
    const { shadowMaps, shadowPass, cloudsPass } = this;
    if (shadowMaps.cascadeCount !== this.shadowCascadeCount || !shadowMaps.mapSize.equals(this.shadowMapSize)) {
      const { width, height } = shadowMaps.mapSize;
      const depth2 = shadowMaps.cascadeCount;
      this.shadowMapSize.set(width, height);
      this.shadowCascadeCount = depth2;
      shadowPass.setSize(width, height, depth2);
      cloudsPass.setShadowSize(width, height, depth2);
    }
    this.proceduralLocalWeather?.render(renderer, deltaTime);
    this.proceduralShape?.render(renderer, deltaTime);
    this.proceduralShapeDetail?.render(renderer, deltaTime);
    this.proceduralTurbulence?.render(renderer, deltaTime);
    ++this.frame;
    this.updateSharedUniforms(deltaTime);
    this.updateWeatherTextureChannels();
    shadowPass.update(renderer, this.frame, deltaTime);
    cloudsPass.shadowBuffer = shadowPass.outputBuffer;
    cloudsPass.update(renderer, this.frame, deltaTime);
    this.updateAtmosphereComposition();
    this.uniforms.get("cloudsBuffer").value = this.cloudsPass.outputBuffer;
  }
  setSize(baseWidth, baseHeight) {
    const { resolution } = this;
    resolution.setBaseSize(baseWidth, baseHeight);
    const { width, height } = resolution;
    this.cloudsPass.setSize(width, height);
  }
  setDepthTexture(depthTexture, depthPacking) {
    this.shadowPass.setDepthTexture(depthTexture, depthPacking);
    this.cloudsPass.setDepthTexture(depthTexture, depthPacking);
  }
  // eslint-disable-next-line accessor-pairs
  set qualityPreset(value) {
    const { clouds, shadow, ...props } = qualityPresets[value];
    Object.assign(this, props);
    Object.assign(this.clouds, clouds);
    Object.assign(this.shadow, shadow);
  }
  // Textures
  get localWeatherTexture() {
    return this.proceduralLocalWeather ?? this.parameterUniforms.localWeatherTexture.value;
  }
  set localWeatherTexture(value) {
    if (value instanceof Texture || value == null) {
      this.proceduralLocalWeather = void 0;
      this.parameterUniforms.localWeatherTexture.value = value;
    } else {
      this.proceduralLocalWeather = value;
      this.parameterUniforms.localWeatherTexture.value = value.texture;
    }
  }
  get shapeTexture() {
    return this.proceduralShape ?? this.parameterUniforms.shapeTexture.value;
  }
  set shapeTexture(value) {
    if (value instanceof Data3DTexture3 || value == null) {
      this.proceduralShape = void 0;
      this.parameterUniforms.shapeTexture.value = value;
    } else {
      this.proceduralShape = value;
      this.parameterUniforms.shapeTexture.value = value.texture;
    }
  }
  get shapeDetailTexture() {
    return this.proceduralShapeDetail ?? this.parameterUniforms.shapeDetailTexture.value;
  }
  set shapeDetailTexture(value) {
    if (value instanceof Data3DTexture3 || value == null) {
      this.proceduralShapeDetail = void 0;
      this.parameterUniforms.shapeDetailTexture.value = value;
    } else {
      this.proceduralShapeDetail = value;
      this.parameterUniforms.shapeDetailTexture.value = value.texture;
    }
  }
  get turbulenceTexture() {
    return this.proceduralTurbulence ?? this.parameterUniforms.turbulenceTexture.value;
  }
  set turbulenceTexture(value) {
    if (value instanceof Texture || value == null) {
      this.proceduralTurbulence = void 0;
      this.parameterUniforms.turbulenceTexture.value = value;
    } else {
      this.proceduralTurbulence = value;
      this.parameterUniforms.turbulenceTexture.value = value.texture;
    }
  }
  get stbnTexture() {
    return this.cloudsPass.currentMaterial.uniforms.stbnTexture.value;
  }
  set stbnTexture(value) {
    this.cloudsPass.currentMaterial.uniforms.stbnTexture.value = value;
    this.shadowPass.currentMaterial.uniforms.stbnTexture.value = value;
  }
  // Rendering controls
  get resolutionScale() {
    return this.resolution.scale;
  }
  set resolutionScale(value) {
    this.resolution.scale = value;
  }
  get temporalUpscale() {
    return this.cloudsPass.temporalUpscale;
  }
  set temporalUpscale(value) {
    this.cloudsPass.temporalUpscale = value;
  }
  get lightShafts() {
    return this.cloudsPass.lightShafts;
  }
  set lightShafts(value) {
    this.cloudsPass.lightShafts = value;
  }
  get shapeDetail() {
    return this.cloudsPass.currentMaterial.shapeDetail;
  }
  set shapeDetail(value) {
    this.cloudsPass.currentMaterial.shapeDetail = value;
    this.shadowPass.currentMaterial.shapeDetail = value;
  }
  get turbulence() {
    return this.cloudsPass.currentMaterial.turbulence;
  }
  set turbulence(value) {
    this.cloudsPass.currentMaterial.turbulence = value;
    this.shadowPass.currentMaterial.turbulence = value;
  }
  get haze() {
    return this.cloudsPass.currentMaterial.haze;
  }
  set haze(value) {
    this.cloudsPass.currentMaterial.haze = value;
  }
  // Cloud parameter primitives
  get scatteringCoefficient() {
    return this.parameterUniforms.scatteringCoefficient.value;
  }
  set scatteringCoefficient(value) {
    this.parameterUniforms.scatteringCoefficient.value = value;
  }
  get absorptionCoefficient() {
    return this.parameterUniforms.absorptionCoefficient.value;
  }
  set absorptionCoefficient(value) {
    this.parameterUniforms.absorptionCoefficient.value = value;
  }
  get coverage() {
    return this.parameterUniforms.coverage.value;
  }
  set coverage(value) {
    this.parameterUniforms.coverage.value = value;
  }
  get turbulenceDisplacement() {
    return this.parameterUniforms.turbulenceDisplacement.value;
  }
  set turbulenceDisplacement(value) {
    this.parameterUniforms.turbulenceDisplacement.value = value;
  }
  // Scattering parameters
  get scatterAnisotropy1() {
    return this.cloudsPass.currentMaterial.scatterAnisotropy1;
  }
  set scatterAnisotropy1(value) {
    this.cloudsPass.currentMaterial.scatterAnisotropy1 = value;
  }
  get scatterAnisotropy2() {
    return this.cloudsPass.currentMaterial.scatterAnisotropy2;
  }
  set scatterAnisotropy2(value) {
    this.cloudsPass.currentMaterial.scatterAnisotropy2 = value;
  }
  get scatterAnisotropyMix() {
    return this.cloudsPass.currentMaterial.scatterAnisotropyMix;
  }
  set scatterAnisotropyMix(value) {
    this.cloudsPass.currentMaterial.scatterAnisotropyMix = value;
  }
  get skyIrradianceScale() {
    return this.cloudsPass.currentMaterial.uniforms.skyIrradianceScale.value;
  }
  set skyIrradianceScale(value) {
    this.cloudsPass.currentMaterial.uniforms.skyIrradianceScale.value = value;
  }
  get groundIrradianceScale() {
    return this.cloudsPass.currentMaterial.uniforms.groundIrradianceScale.value;
  }
  set groundIrradianceScale(value) {
    this.cloudsPass.currentMaterial.uniforms.groundIrradianceScale.value = value;
  }
  get powderScale() {
    return this.cloudsPass.currentMaterial.uniforms.powderScale.value;
  }
  set powderScale(value) {
    this.cloudsPass.currentMaterial.uniforms.powderScale.value = value;
  }
  get powderExponent() {
    return this.cloudsPass.currentMaterial.uniforms.powderExponent.value;
  }
  set powderExponent(value) {
    this.cloudsPass.currentMaterial.uniforms.powderExponent.value = value;
  }
  // Atmosphere composition
  get atmosphereOverlay() {
    return this._atmosphereOverlay;
  }
  get atmosphereShadow() {
    return this._atmosphereShadow;
  }
  get atmosphereShadowLength() {
    return this._atmosphereShadowLength;
  }
  // Atmosphere parameters
  get irradianceTexture() {
    return this.cloudsPass.currentMaterial.irradianceTexture;
  }
  set irradianceTexture(value) {
    this.cloudsPass.currentMaterial.irradianceTexture = value;
  }
  get scatteringTexture() {
    return this.cloudsPass.currentMaterial.scatteringTexture;
  }
  set scatteringTexture(value) {
    this.cloudsPass.currentMaterial.scatteringTexture = value;
  }
  get transmittanceTexture() {
    return this.cloudsPass.currentMaterial.transmittanceTexture;
  }
  set transmittanceTexture(value) {
    this.cloudsPass.currentMaterial.transmittanceTexture = value;
  }
  get ellipsoid() {
    return this.cloudsPass.currentMaterial.ellipsoid;
  }
  set ellipsoid(value) {
    this.cloudsPass.currentMaterial.ellipsoid = value;
  }
  get photometric() {
    return this.cloudsPass.currentMaterial.photometric;
  }
  set photometric(value) {
    this.cloudsPass.currentMaterial.photometric = value;
  }
  get sunAngularRadius() {
    return this.cloudsPass.currentMaterial.sunAngularRadius;
  }
  set sunAngularRadius(value) {
    this.cloudsPass.currentMaterial.sunAngularRadius = value;
  }
};
__decorateClass([
  define("SKIP_RENDERING")
], CloudsEffect.prototype, "skipRendering", 2);

// source/clouds/constants.ts
var CLOUD_SHAPE_TEXTURE_SIZE = 128;
var CLOUD_SHAPE_DETAIL_TEXTURE_SIZE = 32;
var ref3 = "45a1c6c1bb9fd38b3680fd120795ff4c32df68ff";
var DEFAULT_LOCAL_WEATHER_URL = `https://media.githubusercontent.com/media/takram-design-engineering/three-geospatial/${ref3}/packages/clouds/assets/local_weather.png`;
var DEFAULT_SHAPE_URL = `https://media.githubusercontent.com/media/takram-design-engineering/three-geospatial/${ref3}/packages/clouds/assets/shape.bin`;
var DEFAULT_SHAPE_DETAIL_URL = `https://media.githubusercontent.com/media/takram-design-engineering/three-geospatial/${ref3}/packages/clouds/assets/shape_detail.bin`;
var DEFAULT_TURBULENCE_URL = `https://media.githubusercontent.com/media/takram-design-engineering/three-geospatial/${ref3}/packages/clouds/assets/turbulence.png`;

// source/clouds/Procedural3DTexture.ts
import {
  Camera as Camera4,
  GLSL3 as GLSL37,
  LinearFilter as LinearFilter5,
  Mesh,
  NoColorSpace,
  PlaneGeometry,
  RawShaderMaterial as RawShaderMaterial5,
  RedFormat as RedFormat4,
  RepeatWrapping as RepeatWrapping2,
  Uniform as Uniform12,
  WebGL3DRenderTarget
} from "three";
var Procedural3DTextureBase = class {
  constructor({ size, fragmentShader }) {
    this.needsRender = true;
    this.camera = new Camera4();
    this.size = size;
    this.material = new RawShaderMaterial5({
      glslVersion: GLSL37,
      vertexShader: (
        /* glsl */
        `
        in vec3 position;
        out vec2 vUv;
        void main() {
          vUv = position.xy * 0.5 + 0.5;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `
      ),
      fragmentShader,
      uniforms: {
        layer: new Uniform12(0)
      }
    });
    this.mesh = new Mesh(new PlaneGeometry(2, 2), this.material);
    this.renderTarget = new WebGL3DRenderTarget(size, size, size, {
      depthBuffer: false,
      stencilBuffer: false,
      format: RedFormat4
    });
    const texture = this.renderTarget.texture;
    texture.minFilter = LinearFilter5;
    texture.magFilter = LinearFilter5;
    texture.wrapS = RepeatWrapping2;
    texture.wrapT = RepeatWrapping2;
    texture.wrapR = RepeatWrapping2;
    texture.colorSpace = NoColorSpace;
    texture.needsUpdate = true;
  }
  dispose() {
    this.renderTarget.dispose();
    this.material.dispose();
  }
  render(renderer, deltaTime) {
    if (!this.needsRender) {
      return;
    }
    this.needsRender = false;
    const renderTarget = renderer.getRenderTarget();
    for (let layer = 0; layer < this.size; ++layer) {
      this.material.uniforms.layer.value = layer / this.size;
      renderer.setRenderTarget(this.renderTarget, layer);
      renderer.render(this.mesh, this.camera);
    }
    renderer.setRenderTarget(renderTarget);
  }
  get texture() {
    return this.renderTarget.texture;
  }
};

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\cloudShape.frag
var cloudShape_default = '// Based on the following work with slight modifications.\r\n// https://github.com/sebh/TileableVolumeNoise\r\n\r\n/**\r\n * The MIT License (MIT)\r\n *\r\n * Copyright(c) 2017 S\xE9bastien Hillaire\r\n *\r\n * Permission is hereby granted, free of charge, to any person obtaining a copy\r\n * of this software and associated documentation files (the "Software"), to deal\r\n * in the Software without restriction, including without limitation the rights\r\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\r\n * copies of the Software, and to permit persons to whom the Software is\r\n * furnished to do so, subject to the following conditions:\r\n *\r\n * The above copyright notice and this permission notice shall be included in\r\n * all copies or substantial portions of the Software.\r\n *\r\n * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\r\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\r\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\r\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\r\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\r\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\r\n * SOFTWARE.\r\n */\r\n\r\nprecision highp float;\r\nprecision highp int;\r\n\r\n#include "core/math"\r\n#include "perlin"\r\n#include "tileableNoise"\r\n\r\nuniform float layer;\r\n\r\nin vec2 vUv;\r\n\r\nlayout(location = 0) out float outputColor;\r\n\r\nfloat getPerlinWorley(const vec3 point) {\r\n  int octaveCount = 3;\r\n  float frequency = 8.0;\r\n  float perlin = getPerlinNoise(point, frequency, octaveCount);\r\n  perlin = clamp(perlin, 0.0, 1.0);\r\n\r\n  float cellCount = 4.0;\r\n  vec3 noise = vec3(\r\n    1.0 - getWorleyNoise(point, cellCount * 2.0),\r\n    1.0 - getWorleyNoise(point, cellCount * 8.0),\r\n    1.0 - getWorleyNoise(point, cellCount * 14.0)\r\n  );\r\n  float fbm = dot(noise, vec3(0.625, 0.25, 0.125));\r\n  return remap(perlin, 0.0, 1.0, fbm, 1.0);\r\n}\r\n\r\nfloat getWorleyFbm(const vec3 point) {\r\n  float cellCount = 4.0;\r\n  vec4 noise = vec4(\r\n    1.0 - getWorleyNoise(point, cellCount * 2.0),\r\n    1.0 - getWorleyNoise(point, cellCount * 4.0),\r\n    1.0 - getWorleyNoise(point, cellCount * 8.0),\r\n    1.0 - getWorleyNoise(point, cellCount * 16.0)\r\n  );\r\n  vec3 fbm = vec3(\r\n    dot(noise.xyz, vec3(0.625, 0.25, 0.125)),\r\n    dot(noise.yzw, vec3(0.625, 0.25, 0.125)),\r\n    dot(noise.zw, vec2(0.75, 0.25))\r\n  );\r\n  return dot(fbm, vec3(0.625, 0.25, 0.125));\r\n}\r\n\r\nvoid main() {\r\n  vec3 point = vec3(vUv.x, vUv.y, layer);\r\n  float perlinWorley = getPerlinWorley(point);\r\n  float worleyFbm = getWorleyFbm(point);\r\n  outputColor = remap(perlinWorley, worleyFbm - 1.0, 1.0);\r\n}\r\n';

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\perlin.glsl
var perlin_default = '// Ported from GLM: https://github.com/g-truc/glm/blob/master/glm/gtc/noise.inl\r\n\r\n/**\r\n * OpenGL Mathematics (GLM)\r\n *\r\n * GLM is licensed under The Happy Bunny License or MIT License\r\n *\r\n * The Happy Bunny License (Modified MIT License)\r\n *\r\n * Copyright (c) 2005 - G-Truc Creation\r\n *\r\n * Permission is hereby granted, free of charge, to any person obtaining a copy\r\n * of this software and associated documentation files (the "Software"), to deal\r\n * in the Software without restriction, including without limitation the rights\r\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\r\n * copies of the Software, and to permit persons to whom the Software is\r\n * furnished to do so, subject to the following conditions:\r\n *\r\n * The above copyright notice and this permission notice shall be included in\r\n * all copies or substantial portions of the Software.\r\n *\r\n * Restrictions:\r\n *  By making use of the Software for military purposes, you choose to make a\r\n *  Bunny unhappy.\r\n *\r\n * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\r\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\r\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\r\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\r\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\r\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\r\n * THE SOFTWARE.\r\n *\r\n * The MIT License\r\n *\r\n * Copyright (c) 2005 - G-Truc Creation\r\n *\r\n * Permission is hereby granted, free of charge, to any person obtaining a copy\r\n * of this software and associated documentation files (the "Software"), to deal\r\n * in the Software without restriction, including without limitation the rights\r\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\r\n * copies of the Software, and to permit persons to whom the Software is\r\n * furnished to do so, subject to the following conditions:\r\n *\r\n * The above copyright notice and this permission notice shall be included in\r\n * all copies or substantial portions of the Software.\r\n *\r\n * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\r\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\r\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\r\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\r\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\r\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\r\n * THE SOFTWARE.\r\n */\r\n\r\nvec4 mod289(const vec4 x) {\r\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\r\n}\r\n\r\nvec4 permute(const vec4 v) {\r\n  return mod289((v * 34.0 + 1.0) * v);\r\n}\r\n\r\nvec4 taylorInvSqrt(const vec4 r) {\r\n  return 1.79284291400159 - 0.85373472095314 * r;\r\n}\r\n\r\nvec4 fade(const vec4 v) {\r\n  return v * v * v * (v * (v * 6.0 - 15.0) + 10.0);\r\n}\r\n\r\n// Classic Perlin noise, periodic version\r\nfloat perlin(const vec4 position, const vec4 rep) {\r\n  vec4 Pi0 = mod(floor(position), rep); // Integer part modulo rep\r\n  vec4 Pi1 = mod(Pi0 + 1.0, rep); // Integer part + 1 mod rep\r\n  vec4 Pf0 = fract(position); // Fractional part for interpolation\r\n  vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0\r\n  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\r\n  vec4 iy = vec4(Pi0.y, Pi0.y, Pi1.y, Pi1.y);\r\n  vec4 iz0 = vec4(Pi0.z);\r\n  vec4 iz1 = vec4(Pi1.z);\r\n  vec4 iw0 = vec4(Pi0.w);\r\n  vec4 iw1 = vec4(Pi1.w);\r\n\r\n  vec4 ixy = permute(permute(ix) + iy);\r\n  vec4 ixy0 = permute(ixy + iz0);\r\n  vec4 ixy1 = permute(ixy + iz1);\r\n  vec4 ixy00 = permute(ixy0 + iw0);\r\n  vec4 ixy01 = permute(ixy0 + iw1);\r\n  vec4 ixy10 = permute(ixy1 + iw0);\r\n  vec4 ixy11 = permute(ixy1 + iw1);\r\n\r\n  vec4 gx00 = ixy00 / 7.0;\r\n  vec4 gy00 = floor(gx00) / 7.0;\r\n  vec4 gz00 = floor(gy00) / 6.0;\r\n  gx00 = fract(gx00) - 0.5;\r\n  gy00 = fract(gy00) - 0.5;\r\n  gz00 = fract(gz00) - 0.5;\r\n  vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);\r\n  vec4 sw00 = step(gw00, vec4(0));\r\n  gx00 -= sw00 * (step(0.0, gx00) - 0.5);\r\n  gy00 -= sw00 * (step(0.0, gy00) - 0.5);\r\n\r\n  vec4 gx01 = ixy01 / 7.0;\r\n  vec4 gy01 = floor(gx01) / 7.0;\r\n  vec4 gz01 = floor(gy01) / 6.0;\r\n  gx01 = fract(gx01) - 0.5;\r\n  gy01 = fract(gy01) - 0.5;\r\n  gz01 = fract(gz01) - 0.5;\r\n  vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);\r\n  vec4 sw01 = step(gw01, vec4(0.0));\r\n  gx01 -= sw01 * (step(0.0, gx01) - 0.5);\r\n  gy01 -= sw01 * (step(0.0, gy01) - 0.5);\r\n\r\n  vec4 gx10 = ixy10 / 7.0;\r\n  vec4 gy10 = floor(gx10) / 7.0;\r\n  vec4 gz10 = floor(gy10) / 6.0;\r\n  gx10 = fract(gx10) - 0.5;\r\n  gy10 = fract(gy10) - 0.5;\r\n  gz10 = fract(gz10) - 0.5;\r\n  vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);\r\n  vec4 sw10 = step(gw10, vec4(0.0));\r\n  gx10 -= sw10 * (step(0.0, gx10) - 0.5);\r\n  gy10 -= sw10 * (step(0.0, gy10) - 0.5);\r\n\r\n  vec4 gx11 = ixy11 / 7.0;\r\n  vec4 gy11 = floor(gx11) / 7.0;\r\n  vec4 gz11 = floor(gy11) / 6.0;\r\n  gx11 = fract(gx11) - 0.5;\r\n  gy11 = fract(gy11) - 0.5;\r\n  gz11 = fract(gz11) - 0.5;\r\n  vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);\r\n  vec4 sw11 = step(gw11, vec4(0.0));\r\n  gx11 -= sw11 * (step(0.0, gx11) - 0.5);\r\n  gy11 -= sw11 * (step(0.0, gy11) - 0.5);\r\n\r\n  vec4 g0000 = vec4(gx00.x, gy00.x, gz00.x, gw00.x);\r\n  vec4 g1000 = vec4(gx00.y, gy00.y, gz00.y, gw00.y);\r\n  vec4 g0100 = vec4(gx00.z, gy00.z, gz00.z, gw00.z);\r\n  vec4 g1100 = vec4(gx00.w, gy00.w, gz00.w, gw00.w);\r\n  vec4 g0010 = vec4(gx10.x, gy10.x, gz10.x, gw10.x);\r\n  vec4 g1010 = vec4(gx10.y, gy10.y, gz10.y, gw10.y);\r\n  vec4 g0110 = vec4(gx10.z, gy10.z, gz10.z, gw10.z);\r\n  vec4 g1110 = vec4(gx10.w, gy10.w, gz10.w, gw10.w);\r\n  vec4 g0001 = vec4(gx01.x, gy01.x, gz01.x, gw01.x);\r\n  vec4 g1001 = vec4(gx01.y, gy01.y, gz01.y, gw01.y);\r\n  vec4 g0101 = vec4(gx01.z, gy01.z, gz01.z, gw01.z);\r\n  vec4 g1101 = vec4(gx01.w, gy01.w, gz01.w, gw01.w);\r\n  vec4 g0011 = vec4(gx11.x, gy11.x, gz11.x, gw11.x);\r\n  vec4 g1011 = vec4(gx11.y, gy11.y, gz11.y, gw11.y);\r\n  vec4 g0111 = vec4(gx11.z, gy11.z, gz11.z, gw11.z);\r\n  vec4 g1111 = vec4(gx11.w, gy11.w, gz11.w, gw11.w);\r\n\r\n  vec4 norm00 = taylorInvSqrt(\r\n    vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100))\r\n  );\r\n  g0000 *= norm00.x;\r\n  g0100 *= norm00.y;\r\n  g1000 *= norm00.z;\r\n  g1100 *= norm00.w;\r\n\r\n  vec4 norm01 = taylorInvSqrt(\r\n    vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101))\r\n  );\r\n  g0001 *= norm01.x;\r\n  g0101 *= norm01.y;\r\n  g1001 *= norm01.z;\r\n  g1101 *= norm01.w;\r\n\r\n  vec4 norm10 = taylorInvSqrt(\r\n    vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110))\r\n  );\r\n  g0010 *= norm10.x;\r\n  g0110 *= norm10.y;\r\n  g1010 *= norm10.z;\r\n  g1110 *= norm10.w;\r\n\r\n  vec4 norm11 = taylorInvSqrt(\r\n    vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111))\r\n  );\r\n  g0011 *= norm11.x;\r\n  g0111 *= norm11.y;\r\n  g1011 *= norm11.z;\r\n  g1111 *= norm11.w;\r\n\r\n  float n0000 = dot(g0000, Pf0);\r\n  float n1000 = dot(g1000, vec4(Pf1.x, Pf0.y, Pf0.z, Pf0.w));\r\n  float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.z, Pf0.w));\r\n  float n1100 = dot(g1100, vec4(Pf1.x, Pf1.y, Pf0.z, Pf0.w));\r\n  float n0010 = dot(g0010, vec4(Pf0.x, Pf0.y, Pf1.z, Pf0.w));\r\n  float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));\r\n  float n0110 = dot(g0110, vec4(Pf0.x, Pf1.y, Pf1.z, Pf0.w));\r\n  float n1110 = dot(g1110, vec4(Pf1.x, Pf1.y, Pf1.z, Pf0.w));\r\n  float n0001 = dot(g0001, vec4(Pf0.x, Pf0.y, Pf0.z, Pf1.w));\r\n  float n1001 = dot(g1001, vec4(Pf1.x, Pf0.y, Pf0.z, Pf1.w));\r\n  float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));\r\n  float n1101 = dot(g1101, vec4(Pf1.x, Pf1.y, Pf0.z, Pf1.w));\r\n  float n0011 = dot(g0011, vec4(Pf0.x, Pf0.y, Pf1.z, Pf1.w));\r\n  float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.z, Pf1.w));\r\n  float n0111 = dot(g0111, vec4(Pf0.x, Pf1.y, Pf1.z, Pf1.w));\r\n  float n1111 = dot(g1111, Pf1);\r\n\r\n  vec4 fade_xyzw = fade(Pf0);\r\n  vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);\r\n  vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);\r\n  vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);\r\n  vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);\r\n  float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);\r\n  return 2.2 * n_xyzw;\r\n}\r\n';

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\tileableNoise.glsl
var tileableNoise_default = '// Based on the following work with slight modifications.\r\n// https://github.com/sebh/TileableVolumeNoise\r\n\r\n/**\r\n * The MIT License (MIT)\r\n *\r\n * Copyright(c) 2017 S\xE9bastien Hillaire\r\n *\r\n * Permission is hereby granted, free of charge, to any person obtaining a copy\r\n * of this software and associated documentation files (the "Software"), to deal\r\n * in the Software without restriction, including without limitation the rights\r\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\r\n * copies of the Software, and to permit persons to whom the Software is\r\n * furnished to do so, subject to the following conditions:\r\n *\r\n * The above copyright notice and this permission notice shall be included in\r\n * all copies or substantial portions of the Software.\r\n *\r\n * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\r\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\r\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\r\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\r\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\r\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\r\n * SOFTWARE.\r\n */\r\n\r\nfloat hash(const float n) {\r\n  return fract(sin(n + 1.951) * 43758.5453);\r\n}\r\n\r\nfloat noise(const vec3 x) {\r\n  vec3 p = floor(x);\r\n  vec3 f = fract(x);\r\n\r\n  f = f * f * (3.0 - 2.0 * f);\r\n  float n = p.x + p.y * 57.0 + 113.0 * p.z;\r\n  return mix(\r\n    mix(mix(hash(n + 0.0), hash(n + 1.0), f.x), mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),\r\n    mix(\r\n      mix(hash(n + 113.0), hash(n + 114.0), f.x),\r\n      mix(hash(n + 170.0), hash(n + 171.0), f.x),\r\n      f.y\r\n    ),\r\n    f.z\r\n  );\r\n}\r\n\r\nfloat getWorleyNoise(const vec3 p, const float cellCount) {\r\n  vec3 cell = p * cellCount;\r\n  float d = 1.0e10;\r\n  for (int x = -1; x <= 1; ++x) {\r\n    for (int y = -1; y <= 1; ++y) {\r\n      for (int z = -1; z <= 1; ++z) {\r\n        vec3 tp = floor(cell) + vec3(x, y, z);\r\n        tp = cell - tp - noise(mod(tp, cellCount / 1.0));\r\n        d = min(d, dot(tp, tp));\r\n      }\r\n    }\r\n  }\r\n  return clamp(d, 0.0, 1.0);\r\n}\r\n\r\nfloat getPerlinNoise(const vec3 point, const vec3 frequency, const int octaveCount) {\r\n  // Noise frequency factor between octave, forced to 2.\r\n  const float octaveFrequencyFactor = 2.0;\r\n\r\n  // Compute the sum for each octave.\r\n  float sum = 0.0;\r\n  float roughness = 0.5;\r\n  float weightSum = 0.0;\r\n  float weight = 1.0;\r\n  vec3 nextFrequency = frequency;\r\n  for (int i = 0; i < octaveCount; ++i) {\r\n    vec4 p = vec4(point.x, point.y, point.z, 0.0) * vec4(nextFrequency, 1.0);\r\n    float value = perlin(p, vec4(nextFrequency, 1.0));\r\n    sum += value * weight;\r\n    weightSum += weight;\r\n    weight *= roughness;\r\n    nextFrequency *= octaveFrequencyFactor;\r\n  }\r\n\r\n  return sum / weightSum; // Intentionally skip clamping.\r\n}\r\n\r\nfloat getPerlinNoise(const vec3 point, const float frequency, const int octaveCount) {\r\n  return getPerlinNoise(point, vec3(frequency), octaveCount);\r\n}\r\n';

// source/clouds/CloudShape.ts
var CloudShape = class extends Procedural3DTextureBase {
  constructor() {
    super({
      size: CLOUD_SHAPE_TEXTURE_SIZE,
      fragmentShader: resolveIncludes(cloudShape_default, {
        core: { math },
        perlin: perlin_default,
        tileableNoise: tileableNoise_default
      })
    });
  }
};

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\cloudShapeDetail.frag
var cloudShapeDetail_default = '// Based on the following work with slight modifications.\r\n// https://github.com/sebh/TileableVolumeNoise\r\n\r\n/**\r\n * The MIT License (MIT)\r\n *\r\n * Copyright(c) 2017 S\xE9bastien Hillaire\r\n *\r\n * Permission is hereby granted, free of charge, to any person obtaining a copy\r\n * of this software and associated documentation files (the "Software"), to deal\r\n * in the Software without restriction, including without limitation the rights\r\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\r\n * copies of the Software, and to permit persons to whom the Software is\r\n * furnished to do so, subject to the following conditions:\r\n *\r\n * The above copyright notice and this permission notice shall be included in\r\n * all copies or substantial portions of the Software.\r\n *\r\n * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\r\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\r\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\r\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\r\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\r\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\r\n * SOFTWARE.\r\n */\r\n\r\nprecision highp float;\r\nprecision highp int;\r\n\r\n#include "core/math"\r\n#include "perlin"\r\n#include "tileableNoise"\r\n\r\nuniform float layer;\r\n\r\nin vec2 vUv;\r\n\r\nlayout(location = 0) out float outputColor;\r\n\r\nvoid main() {\r\n  vec3 point = vec3(vUv.x, vUv.y, layer);\r\n  float cellCount = 2.0;\r\n  vec4 noise = vec4(\r\n    1.0 - getWorleyNoise(point, cellCount * 1.0),\r\n    1.0 - getWorleyNoise(point, cellCount * 2.0),\r\n    1.0 - getWorleyNoise(point, cellCount * 4.0),\r\n    1.0 - getWorleyNoise(point, cellCount * 8.0)\r\n  );\r\n  vec3 fbm = vec3(\r\n    dot(noise.xyz, vec3(0.625, 0.25, 0.125)),\r\n    dot(noise.yzw, vec3(0.625, 0.25, 0.125)),\r\n    dot(noise.zw, vec2(0.75, 0.25))\r\n  );\r\n  outputColor = dot(fbm, vec3(0.625, 0.25, 0.125));\r\n}\r\n';

// source/clouds/CloudShapeDetail.ts
var CloudShapeDetail = class extends Procedural3DTextureBase {
  constructor() {
    super({
      size: CLOUD_SHAPE_DETAIL_TEXTURE_SIZE,
      fragmentShader: resolveIncludes(cloudShapeDetail_default, {
        core: { math },
        perlin: perlin_default,
        tileableNoise: tileableNoise_default
      })
    });
  }
};

// source/clouds/ProceduralTexture.ts
import {
  Camera as Camera5,
  GLSL3 as GLSL38,
  LinearFilter as LinearFilter6,
  LinearMipMapLinearFilter,
  Mesh as Mesh2,
  NoColorSpace as NoColorSpace2,
  PlaneGeometry as PlaneGeometry2,
  RawShaderMaterial as RawShaderMaterial6,
  RepeatWrapping as RepeatWrapping3,
  RGBAFormat as RGBAFormat2,
  Uniform as Uniform13,
  WebGLRenderTarget as WebGLRenderTarget3
} from "three";
var ProceduralTextureBase = class {
  constructor({ size, fragmentShader }) {
    this.needsRender = true;
    this.camera = new Camera5();
    this.size = size;
    this.material = new RawShaderMaterial6({
      glslVersion: GLSL38,
      vertexShader: (
        /* glsl */
        `
        in vec3 position;
        out vec2 vUv;
        void main() {
          vUv = position.xy * 0.5 + 0.5;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `
      ),
      fragmentShader,
      uniforms: {
        layer: new Uniform13(0)
      }
    });
    this.mesh = new Mesh2(new PlaneGeometry2(2, 2), this.material);
    this.renderTarget = new WebGLRenderTarget3(size, size, {
      depthBuffer: false,
      stencilBuffer: false,
      format: RGBAFormat2
    });
    const texture = this.renderTarget.texture;
    texture.generateMipmaps = true;
    texture.minFilter = LinearMipMapLinearFilter;
    texture.magFilter = LinearFilter6;
    texture.wrapS = RepeatWrapping3;
    texture.wrapT = RepeatWrapping3;
    texture.colorSpace = NoColorSpace2;
    texture.needsUpdate = true;
  }
  dispose() {
    this.renderTarget.dispose();
    this.material.dispose();
  }
  render(renderer, deltaTime) {
    if (!this.needsRender) {
      return;
    }
    this.needsRender = false;
    const renderTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(this.renderTarget);
    renderer.render(this.mesh, this.camera);
    renderer.setRenderTarget(renderTarget);
  }
  get texture() {
    return this.renderTarget.texture;
  }
};

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\localWeather.frag
var localWeather_default = 'precision highp float;\r\nprecision highp int;\r\n\r\n#include "core/math"\r\n#include "perlin"\r\n#include "tileableNoise"\r\n\r\nin vec2 vUv;\r\n\r\nlayout(location = 0) out vec4 outputColor;\r\n\r\nfloat getWorleyFbm(\r\n  const vec3 point,\r\n  float frequency,\r\n  float amplitude,\r\n  const float lacunarity,\r\n  const float gain,\r\n  const int octaveCount\r\n) {\r\n  float noise = 0.0;\r\n  for (int i = 0; i < octaveCount; ++i) {\r\n    noise += amplitude * (1.0 - getWorleyNoise(point, frequency));\r\n    frequency *= lacunarity;\r\n    amplitude *= gain;\r\n  }\r\n  return noise;\r\n}\r\n\r\nvoid main() {\r\n  vec3 point = vec3(vUv.x, vUv.y, 0.0);\r\n\r\n  // Mid clouds\r\n  {\r\n    float worley = getWorleyFbm(\r\n      point + vec3(0.5),\r\n      8.0, // frequency\r\n      0.4, // amplitude\r\n      2.0, // lacunarity\r\n      0.95, // gain\r\n      4 // octaveCount\r\n    );\r\n    worley = smoothstep(1.0, 1.4, worley);\r\n    outputColor.g = worley;\r\n  }\r\n\r\n  // Low clouds\r\n  {\r\n    float worley = getWorleyFbm(\r\n      point,\r\n      16.0, // frequency\r\n      0.4, // amplitude\r\n      2.0, // lacunarity\r\n      0.95, // gain\r\n      4 // octaveCount\r\n    );\r\n    worley = smoothstep(0.8, 1.4, worley);\r\n    outputColor.r = saturate(worley - outputColor.g);\r\n  }\r\n\r\n  // High clouds\r\n  {\r\n    float perlin = getPerlinNoise(\r\n      point,\r\n      vec3(6.0, 12.0, 1.0), // frequency\r\n      8 // octaveCount\r\n    );\r\n    perlin = smoothstep(-0.5, 0.5, perlin);\r\n    outputColor.b = perlin;\r\n  }\r\n\r\n  // Extra\r\n  {\r\n    float perlin = getPerlinNoise(\r\n      point + vec3(-19.1, 33.4, 47.2),\r\n      32.0, // frequency\r\n      4 // octaveCount\r\n    );\r\n    perlin = smoothstep(-0.5, 0.5, perlin);\r\n    outputColor.a = perlin;\r\n  }\r\n\r\n  outputColor.a = 1.0;\r\n}\r\n';

// source/clouds/LocalWeather.ts
var LocalWeather = class extends ProceduralTextureBase {
  constructor() {
    super({
      size: 512,
      fragmentShader: resolveIncludes(localWeather_default, {
        core: { math },
        perlin: perlin_default,
        tileableNoise: tileableNoise_default
      })
    });
  }
};

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\clouds\shaders\turbulence.frag
var turbulence_default = 'precision highp float;\r\nprecision highp int;\r\n\r\n#include "core/math"\r\n#include "perlin"\r\n#include "tileableNoise"\r\n\r\nin vec2 vUv;\r\n\r\nlayout(location = 0) out vec4 outputColor;\r\n\r\nconst vec3 frequency = vec3(12.0);\r\nconst int octaveCount = 3;\r\n\r\nfloat perlin(const vec3 point) {\r\n  return getPerlinNoise(point, frequency, octaveCount);\r\n}\r\n\r\nvec3 perlin3d(const vec3 point) {\r\n  float perlin1 = perlin(point);\r\n  float perlin2 = perlin(point.yzx + vec3(-19.1, 33.4, 47.2));\r\n  float perlin3 = perlin(point.zxy + vec3(74.2, -124.5, 99.4));\r\n  return vec3(perlin1, perlin2, perlin3);\r\n}\r\n\r\nvec3 curl(vec3 point) {\r\n  const float delta = 0.1;\r\n  vec3 dx = vec3(delta, 0.0, 0.0);\r\n  vec3 dy = vec3(0.0, delta, 0.0);\r\n  vec3 dz = vec3(0.0, 0.0, delta);\r\n\r\n  vec3 px0 = perlin3d(point - dx);\r\n  vec3 px1 = perlin3d(point + dx);\r\n  vec3 py0 = perlin3d(point - dy);\r\n  vec3 py1 = perlin3d(point + dy);\r\n  vec3 pz0 = perlin3d(point - dz);\r\n  vec3 pz1 = perlin3d(point + dz);\r\n\r\n  float x = py1.z - py0.z - pz1.y + pz0.y;\r\n  float y = pz1.x - pz0.x - px1.z + px0.z;\r\n  float z = px1.y - px0.y - py1.x + py0.x;\r\n\r\n  const float divisor = 1.0 / (2.0 * delta);\r\n  return normalize(vec3(x, y, z) * divisor);\r\n}\r\n\r\nvoid main() {\r\n  vec3 point = vec3(vUv.x, vUv.y, 0.0);\r\n  outputColor.rgb = 0.5 * curl(point) + 0.5;\r\n  outputColor.a = 1.0;\r\n}\r\n';

// source/clouds/Turbulence.ts
var Turbulence = class extends ProceduralTextureBase {
  constructor() {
    super({
      size: 128,
      fragmentShader: resolveIncludes(turbulence_default, {
        core: { math },
        perlin: perlin_default,
        tileableNoise: tileableNoise_default
      })
    });
  }
};

// source/effects/DitheringEffect.ts
import { BlendFunction as BlendFunction2, Effect as Effect3 } from "postprocessing";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\effects\shaders\ditheringEffect.frag
var ditheringEffect_default = "#define DITHERING\r\n\r\n#include <dithering_pars_fragment>\r\n\r\nvoid mainImage(const vec4 inputColor, const vec2 uv, out vec4 outputColor) {\r\n  outputColor = vec4(saturate(dithering(inputColor.rgb)), inputColor.a);\r\n}\r\n";

// source/effects/DitheringEffect.ts
var ditheringOptionsDefaults = {
  blendFunction: BlendFunction2.NORMAL
};
var DitheringEffect = class extends Effect3 {
  constructor(options) {
    const { blendFunction } = {
      ...ditheringOptionsDefaults,
      ...options
    };
    super("DitheringEffect", ditheringEffect_default, {
      blendFunction
    });
  }
};

// source/effects/LensFlareEffect.ts
import {
  BlendFunction as BlendFunction3,
  Effect as Effect4,
  EffectAttribute as EffectAttribute3,
  KawaseBlurPass,
  KernelSize,
  MipmapBlurPass,
  Resolution as Resolution2,
  ShaderPass as ShaderPass4
} from "postprocessing";
import {
  HalfFloatType as HalfFloatType6,
  Uniform as Uniform16,
  WebGLRenderTarget as WebGLRenderTarget4
} from "three";

// source/effects/DownsampleThresholdMaterial.ts
import {
  NoBlending,
  ShaderMaterial,
  Uniform as Uniform14,
  Vector2 as Vector214
} from "three";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\effects\shaders\downsampleThreshold.frag
var downsampleThreshold_default = "#include <common>\r\n\r\nuniform sampler2D inputBuffer;\r\n\r\nuniform float thresholdLevel;\r\nuniform float thresholdRange;\r\n\r\nin vec2 vCenterUv1;\r\nin vec2 vCenterUv2;\r\nin vec2 vCenterUv3;\r\nin vec2 vCenterUv4;\r\nin vec2 vRowUv1;\r\nin vec2 vRowUv2;\r\nin vec2 vRowUv3;\r\nin vec2 vRowUv4;\r\nin vec2 vRowUv5;\r\nin vec2 vRowUv6;\r\nin vec2 vRowUv7;\r\nin vec2 vRowUv8;\r\nin vec2 vRowUv9;\r\n\r\nfloat clampToBorder(const vec2 uv) {\r\n  return float(uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0);\r\n}\r\n\r\n// Reference: https://learnopengl.com/Guest-Articles/2022/Phys.-Based-Bloom\r\nvoid main() {\r\n  vec3 color = 0.125 * texture(inputBuffer, vec2(vRowUv5)).rgb;\r\n  vec4 weight =\r\n    0.03125 *\r\n    vec4(\r\n      clampToBorder(vRowUv1),\r\n      clampToBorder(vRowUv3),\r\n      clampToBorder(vRowUv7),\r\n      clampToBorder(vRowUv9)\r\n    );\r\n  color += weight.x * texture(inputBuffer, vec2(vRowUv1)).rgb;\r\n  color += weight.y * texture(inputBuffer, vec2(vRowUv3)).rgb;\r\n  color += weight.z * texture(inputBuffer, vec2(vRowUv7)).rgb;\r\n  color += weight.w * texture(inputBuffer, vec2(vRowUv9)).rgb;\r\n\r\n  weight =\r\n    0.0625 *\r\n    vec4(\r\n      clampToBorder(vRowUv2),\r\n      clampToBorder(vRowUv4),\r\n      clampToBorder(vRowUv6),\r\n      clampToBorder(vRowUv8)\r\n    );\r\n  color += weight.x * texture(inputBuffer, vec2(vRowUv2)).rgb;\r\n  color += weight.y * texture(inputBuffer, vec2(vRowUv4)).rgb;\r\n  color += weight.z * texture(inputBuffer, vec2(vRowUv6)).rgb;\r\n  color += weight.w * texture(inputBuffer, vec2(vRowUv8)).rgb;\r\n\r\n  weight =\r\n    0.125 *\r\n    vec4(\r\n      clampToBorder(vRowUv2),\r\n      clampToBorder(vRowUv4),\r\n      clampToBorder(vRowUv6),\r\n      clampToBorder(vRowUv8)\r\n    );\r\n  color += weight.x * texture(inputBuffer, vec2(vCenterUv1)).rgb;\r\n  color += weight.y * texture(inputBuffer, vec2(vCenterUv2)).rgb;\r\n  color += weight.z * texture(inputBuffer, vec2(vCenterUv3)).rgb;\r\n  color += weight.w * texture(inputBuffer, vec2(vCenterUv4)).rgb;\r\n\r\n  // WORKAROUND: Avoid screen flashes if the input buffer contains NaN texels.\r\n  // See: https://github.com/takram-design-engineering/three-geospatial/issues/7\r\n  if (any(isnan(color))) {\r\n    gl_FragColor = vec4(vec3(0.0), 1.0);\r\n    return;\r\n  }\r\n\r\n  float l = luminance(color);\r\n  float scale = saturate(smoothstep(thresholdLevel, thresholdLevel + thresholdRange, l));\r\n  gl_FragColor = vec4(color * scale, 1.0);\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\effects\shaders\downsampleThreshold.vert
var downsampleThreshold_default2 = "uniform vec2 texelSize;\r\n\r\nout vec2 vCenterUv1;\r\nout vec2 vCenterUv2;\r\nout vec2 vCenterUv3;\r\nout vec2 vCenterUv4;\r\nout vec2 vRowUv1;\r\nout vec2 vRowUv2;\r\nout vec2 vRowUv3;\r\nout vec2 vRowUv4;\r\nout vec2 vRowUv5;\r\nout vec2 vRowUv6;\r\nout vec2 vRowUv7;\r\nout vec2 vRowUv8;\r\nout vec2 vRowUv9;\r\n\r\nvoid main() {\r\n  vec2 uv = position.xy * 0.5 + 0.5;\r\n  vCenterUv1 = uv + texelSize * vec2(-1.0, 1.0);\r\n  vCenterUv2 = uv + texelSize * vec2(1.0, 1.0);\r\n  vCenterUv3 = uv + texelSize * vec2(-1.0, -1.0);\r\n  vCenterUv4 = uv + texelSize * vec2(1.0, -1.0);\r\n  vRowUv1 = uv + texelSize * vec2(-2.0, 2.0);\r\n  vRowUv2 = uv + texelSize * vec2(0.0, 2.0);\r\n  vRowUv3 = uv + texelSize * vec2(2.0, 2.0);\r\n  vRowUv4 = uv + texelSize * vec2(-2.0, 0.0);\r\n  vRowUv5 = uv + texelSize;\r\n  vRowUv6 = uv + texelSize * vec2(2.0, 0.0);\r\n  vRowUv7 = uv + texelSize * vec2(-2.0, -2.0);\r\n  vRowUv8 = uv + texelSize * vec2(0.0, -2.0);\r\n  vRowUv9 = uv + texelSize * vec2(2.0, -2.0);\r\n\r\n  gl_Position = vec4(position.xy, 1.0, 1.0);\r\n}\r\n";

// source/effects/DownsampleThresholdMaterial.ts
var downsampleThresholdMaterialParametersDefaults = {
  thresholdLevel: 10,
  thresholdRange: 1
};
var DownsampleThresholdMaterial = class extends ShaderMaterial {
  constructor(params) {
    const {
      inputBuffer = null,
      thresholdLevel,
      thresholdRange,
      ...others
    } = {
      ...downsampleThresholdMaterialParametersDefaults,
      ...params
    };
    super({
      name: "DownsampleThresholdMaterial",
      fragmentShader: downsampleThreshold_default,
      vertexShader: downsampleThreshold_default2,
      blending: NoBlending,
      toneMapped: false,
      depthWrite: false,
      depthTest: false,
      ...others,
      uniforms: {
        inputBuffer: new Uniform14(inputBuffer),
        texelSize: new Uniform14(new Vector214()),
        thresholdLevel: new Uniform14(thresholdLevel),
        thresholdRange: new Uniform14(thresholdRange),
        ...others.uniforms
      }
    });
  }
  setSize(width, height) {
    this.uniforms.texelSize.value.set(1 / width, 1 / height);
  }
  get inputBuffer() {
    return this.uniforms.inputBuffer.value;
  }
  set inputBuffer(value) {
    this.uniforms.inputBuffer.value = value;
  }
  get thresholdLevel() {
    return this.uniforms.thresholdLevel.value;
  }
  set thresholdLevel(value) {
    this.uniforms.thresholdLevel.value = value;
  }
  get thresholdRange() {
    return this.uniforms.thresholdRange.value;
  }
  set thresholdRange(value) {
    this.uniforms.thresholdRange.value = value;
  }
};

// source/effects/LensFlareFeaturesMaterial.ts
import {
  NoBlending as NoBlending2,
  ShaderMaterial as ShaderMaterial2,
  Uniform as Uniform15,
  Vector2 as Vector215
} from "three";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\effects\shaders\lensFlareFeatures.frag
var lensFlareFeatures_default = "#include <common>\r\n\r\n#define SQRT_2 (0.7071067811865476)\r\n\r\nuniform sampler2D inputBuffer;\r\n\r\nuniform vec2 texelSize;\r\nuniform float ghostAmount;\r\nuniform float haloAmount;\r\nuniform float chromaticAberration;\r\n\r\nin vec2 vUv;\r\nin vec2 vAspectRatio;\r\n\r\nvec3 sampleGhost(const vec2 direction, const vec3 color, const float offset) {\r\n  vec2 suv = clamp(1.0 - vUv + direction * offset, 0.0, 1.0);\r\n  vec3 result = texture(inputBuffer, suv).rgb * color;\r\n\r\n  // Falloff at the perimeter.\r\n  float d = clamp(length(0.5 - suv) / (0.5 * SQRT_2), 0.0, 1.0);\r\n  result *= pow(1.0 - d, 3.0);\r\n  return result;\r\n}\r\n\r\nvec4 sampleGhosts(float amount) {\r\n  vec3 color = vec3(0.0);\r\n  vec2 direction = vUv - 0.5;\r\n  color += sampleGhost(direction, vec3(0.8, 0.8, 1.0), -5.0);\r\n  color += sampleGhost(direction, vec3(1.0, 0.8, 0.4), -1.5);\r\n  color += sampleGhost(direction, vec3(0.9, 1.0, 0.8), -0.4);\r\n  color += sampleGhost(direction, vec3(1.0, 0.8, 0.4), -0.2);\r\n  color += sampleGhost(direction, vec3(0.9, 0.7, 0.7), -0.1);\r\n  color += sampleGhost(direction, vec3(0.5, 1.0, 0.4), 0.7);\r\n  color += sampleGhost(direction, vec3(0.5, 0.5, 0.5), 1.0);\r\n  color += sampleGhost(direction, vec3(1.0, 1.0, 0.6), 2.5);\r\n  color += sampleGhost(direction, vec3(0.5, 0.8, 1.0), 10.0);\r\n  return vec4(color * amount, 1.0);\r\n}\r\n\r\n// Reference: https://john-chapman.github.io/2017/11/05/pseudo-lens-flare.html\r\nfloat cubicRingMask(const float x, const float radius, const float thickness) {\r\n  float v = min(abs(x - radius) / thickness, 1.0);\r\n  return 1.0 - v * v * (3.0 - 2.0 * v);\r\n}\r\n\r\nvec3 sampleHalo(const float radius) {\r\n  vec2 direction = normalize((vUv - 0.5) / vAspectRatio) * vAspectRatio;\r\n  vec3 offset = vec3(texelSize.x * chromaticAberration) * vec3(-1.0, 0.0, 1.0);\r\n  vec2 suv = fract(1.0 - vUv + direction * radius);\r\n  vec3 result = vec3(\r\n    texture(inputBuffer, suv + direction * offset.r).r,\r\n    texture(inputBuffer, suv + direction * offset.g).g,\r\n    texture(inputBuffer, suv + direction * offset.b).b\r\n  );\r\n\r\n  // Falloff at the center and perimeter.\r\n  vec2 wuv = (vUv - vec2(0.5, 0.0)) / vAspectRatio + vec2(0.5, 0.0);\r\n  float d = saturate(distance(wuv, vec2(0.5)));\r\n  result *= cubicRingMask(d, 0.45, 0.25);\r\n  return result;\r\n}\r\n\r\nvec4 sampleHalos(const float amount) {\r\n  vec3 color = vec3(0.0);\r\n  color += sampleHalo(0.3);\r\n  return vec4(color, 1.0) * amount;\r\n}\r\n\r\nvoid main() {\r\n  gl_FragColor += sampleGhosts(ghostAmount);\r\n  gl_FragColor += sampleHalos(haloAmount);\r\n}\r\n\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\effects\shaders\lensFlareFeatures.vert
var lensFlareFeatures_default2 = "uniform vec2 texelSize;\r\n\r\nout vec2 vUv;\r\nout vec2 vAspectRatio;\r\n\r\nvoid main() {\r\n  vUv = position.xy * 0.5 + 0.5;\r\n  vAspectRatio = vec2(texelSize.x / texelSize.y, 1.0);\r\n  gl_Position = vec4(position.xy, 1.0, 1.0);\r\n}\r\n";

// source/effects/LensFlareFeaturesMaterial.ts
var lensFlareFeaturesMaterialParametersDefaults = {
  ghostAmount: 1e-3,
  haloAmount: 1e-3,
  chromaticAberration: 10
};
var LensFlareFeaturesMaterial = class extends ShaderMaterial2 {
  constructor(params) {
    const {
      inputBuffer = null,
      ghostAmount,
      haloAmount,
      chromaticAberration,
      ...others
    } = {
      ...lensFlareFeaturesMaterialParametersDefaults,
      ...params
    };
    super({
      name: "LensFlareFeaturesMaterial",
      fragmentShader: lensFlareFeatures_default,
      vertexShader: lensFlareFeatures_default2,
      blending: NoBlending2,
      toneMapped: false,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        inputBuffer: new Uniform15(inputBuffer),
        texelSize: new Uniform15(new Vector215()),
        ghostAmount: new Uniform15(ghostAmount),
        haloAmount: new Uniform15(haloAmount),
        chromaticAberration: new Uniform15(chromaticAberration),
        ...others.uniforms
      }
    });
  }
  setSize(width, height) {
    this.uniforms.texelSize.value.set(1 / width, 1 / height);
  }
  get inputBuffer() {
    return this.uniforms.inputBuffer.value;
  }
  set inputBuffer(value) {
    this.uniforms.inputBuffer.value = value;
  }
  get ghostAmount() {
    return this.uniforms.ghostAmount.value;
  }
  set ghostAmount(value) {
    this.uniforms.ghostAmount.value = value;
  }
  get haloAmount() {
    return this.uniforms.haloAmount.value;
  }
  set haloAmount(value) {
    this.uniforms.haloAmount.value = value;
  }
  get chromaticAberration() {
    return this.uniforms.chromaticAberration.value;
  }
  set chromaticAberration(value) {
    this.uniforms.chromaticAberration.value = value;
  }
};

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-volumetric-clouds\examples\weather-volume-clouds\source\effects\shaders\lensFlareEffect.frag
var lensFlareEffect_default = "uniform sampler2D bloomBuffer;\r\nuniform sampler2D featuresBuffer;\r\nuniform float intensity;\r\n\r\nvoid mainImage(const vec4 inputColor, const vec2 uv, out vec4 outputColor) {\r\n  vec3 bloom = texture(bloomBuffer, uv).rgb;\r\n  vec3 features = texture(featuresBuffer, uv).rgb;\r\n  outputColor = vec4(inputColor.rgb + (bloom + features) * intensity, inputColor.a);\r\n}\r\n";

// source/effects/LensFlareEffect.ts
var lensFlareEffectOptionsDefaults = {
  blendFunction: BlendFunction3.NORMAL,
  resolutionScale: 0.5,
  width: Resolution2.AUTO_SIZE,
  height: Resolution2.AUTO_SIZE,
  intensity: 5e-3
};
var LensFlareEffect = class extends Effect4 {
  constructor(options) {
    const {
      blendFunction,
      resolutionScale,
      width,
      height,
      resolutionX = width,
      resolutionY = height,
      intensity
    } = {
      ...lensFlareEffectOptionsDefaults,
      ...options
    };
    super("LensFlareEffect", lensFlareEffect_default, {
      blendFunction,
      attributes: EffectAttribute3.CONVOLUTION,
      uniforms: new Map(
        Object.entries({
          bloomBuffer: new Uniform16(null),
          featuresBuffer: new Uniform16(null),
          intensity: new Uniform16(1)
        })
      )
    });
    this.onResolutionChange = () => {
      this.setSize(this.resolution.baseWidth, this.resolution.baseHeight);
    };
    this.renderTarget1 = new WebGLRenderTarget4(1, 1, {
      depthBuffer: false,
      stencilBuffer: false,
      type: HalfFloatType6
    });
    this.renderTarget1.texture.name = "LensFlare.Target1";
    this.renderTarget2 = new WebGLRenderTarget4(1, 1, {
      depthBuffer: false,
      stencilBuffer: false,
      type: HalfFloatType6
    });
    this.renderTarget2.texture.name = "LensFlare.Target2";
    this.thresholdMaterial = new DownsampleThresholdMaterial();
    this.thresholdPass = new ShaderPass4(this.thresholdMaterial);
    this.blurPass = new MipmapBlurPass();
    this.blurPass.levels = 8;
    this.preBlurPass = new KawaseBlurPass({
      kernelSize: KernelSize.SMALL
    });
    this.featuresMaterial = new LensFlareFeaturesMaterial();
    this.featuresPass = new ShaderPass4(this.featuresMaterial);
    this.uniforms.get("bloomBuffer").value = this.blurPass.texture;
    this.uniforms.get("featuresBuffer").value = this.renderTarget1.texture;
    this.resolution = new Resolution2(
      this,
      resolutionX,
      resolutionY,
      resolutionScale
    );
    this.resolution.addEventListener("change", this.onResolutionChange);
    this.intensity = intensity;
  }
  initialize(renderer, alpha, frameBufferType) {
    this.thresholdPass.initialize(renderer, alpha, frameBufferType);
    this.blurPass.initialize(renderer, alpha, frameBufferType);
    this.preBlurPass.initialize(renderer, alpha, frameBufferType);
    this.featuresPass.initialize(renderer, alpha, frameBufferType);
  }
  update(renderer, inputBuffer, deltaTime) {
    this.thresholdPass.render(renderer, inputBuffer, this.renderTarget1);
    this.blurPass.render(renderer, this.renderTarget1, null);
    this.preBlurPass.render(renderer, this.renderTarget1, this.renderTarget2);
    this.featuresPass.render(renderer, this.renderTarget2, this.renderTarget1);
  }
  setSize(baseWidth, baseHeight) {
    const resolution = this.resolution;
    resolution.setBaseSize(baseWidth, baseHeight);
    const { width, height } = resolution;
    this.renderTarget1.setSize(width, height);
    this.renderTarget2.setSize(width, height);
    this.thresholdMaterial.setSize(width, height);
    this.blurPass.setSize(width, height);
    this.preBlurPass.setSize(width, height);
    this.featuresMaterial.setSize(width, height);
  }
  get intensity() {
    return this.uniforms.get("intensity").value;
  }
  set intensity(value) {
    this.uniforms.get("intensity").value = value;
  }
  get thresholdLevel() {
    return this.thresholdMaterial.thresholdLevel;
  }
  set thresholdLevel(value) {
    this.thresholdMaterial.thresholdLevel = value;
  }
  get thresholdRange() {
    return this.thresholdMaterial.thresholdRange;
  }
  set thresholdRange(value) {
    this.thresholdMaterial.thresholdRange = value;
  }
};

// cloud-effect.entry.js
import {
  EffectComposer,
  EffectPass,
  NormalPass,
  RenderPass as RenderPass2,
  ToneMappingEffect,
  ToneMappingMode
} from "postprocessing";
export {
  AerialPerspectiveEffect,
  ArrayBufferLoader,
  AtmosphereMaterialBase,
  AtmosphereParameters,
  CLOUD_SHAPE_DETAIL_TEXTURE_SIZE,
  CLOUD_SHAPE_TEXTURE_SIZE,
  CloudLayer,
  CloudLayers,
  CloudShape,
  CloudShapeDetail,
  CloudsEffect,
  DEFAULT_LOCAL_WEATHER_URL,
  DEFAULT_PRECOMPUTED_TEXTURES_URL,
  DEFAULT_SHAPE_DETAIL_URL,
  DEFAULT_SHAPE_URL,
  DEFAULT_STARS_DATA_URL,
  DEFAULT_STBN_URL,
  DEFAULT_TURBULENCE_URL,
  DataLoader,
  DensityProfile,
  DitheringEffect,
  EXR3DLoader,
  EffectComposer,
  EffectPass,
  Ellipsoid,
  EllipsoidGeometry,
  Float16Array,
  Geodetic,
  IRRADIANCE_TEXTURE_HEIGHT,
  IRRADIANCE_TEXTURE_WIDTH,
  IrradianceMaskPass,
  LensFlareEffect,
  LocalWeather,
  METER_TO_LENGTH_UNIT,
  NormalPass,
  PointOfView,
  PrecomputedTexturesLoader,
  Procedural3DTextureBase,
  ProceduralTextureBase,
  Rectangle,
  RenderPass2 as RenderPass,
  SCATTERING_TEXTURE_DEPTH,
  SCATTERING_TEXTURE_HEIGHT,
  SCATTERING_TEXTURE_MU_SIZE,
  SCATTERING_TEXTURE_MU_S_SIZE,
  SCATTERING_TEXTURE_NU_SIZE,
  SCATTERING_TEXTURE_R_SIZE,
  SCATTERING_TEXTURE_WIDTH,
  SKY_RENDER_ORDER,
  STBNLoader,
  STBN_TEXTURE_DEPTH,
  STBN_TEXTURE_HEIGHT,
  STBN_TEXTURE_WIDTH,
  SkyLightProbe,
  SkyMaterial,
  StarsGeometry,
  StarsMaterial,
  SunDirectionalLight,
  TRANSMITTANCE_TEXTURE_HEIGHT,
  TRANSMITTANCE_TEXTURE_WIDTH,
  TileCoordinate,
  TilingScheme,
  ToneMappingEffect,
  ToneMappingMode,
  Turbulence,
  TypedArrayLoader,
  aerialPerspectiveEffectOptionsDefaults,
  assertType,
  atmosphereMaterialParametersBaseDefaults,
  ceilPowerOfTwo,
  clamp,
  closeTo,
  cloudsPassOptionsDefaults,
  convertBVIndexToLinearSRGBChromaticity,
  convertTemperatureToLinearSRGBChromaticity,
  createData3DTextureLoader,
  createData3DTextureLoaderClass,
  createDataTextureLoader,
  createDataTextureLoaderClass,
  createTypedArrayLoader,
  createTypedArrayLoaderClass,
  define,
  defineExpression,
  defineFloat,
  defineInt,
  definePropertyShorthand,
  defineUniformShorthand,
  degrees,
  euclideanModulo,
  floorPowerOfTwo,
  fromBufferGeometryLike,
  getAltitudeCorrectionOffset,
  getECIToECEFRotationMatrix,
  getMoonDirectionECEF,
  getMoonDirectionECI,
  getSunDirectionECEF,
  getSunDirectionECI,
  getSunLightColor,
  inverseLerp,
  isPowerOfTwo,
  isTypedArray,
  lerp,
  normalize,
  parseFloat16Array,
  parseFloat32Array,
  parseFloat64Array,
  parseInt16Array,
  parseInt32Array,
  parseInt8Array,
  parseUint16Array,
  parseUint32Array,
  parseUint8Array,
  radians,
  remap,
  remapClamped,
  resolveIncludes,
  saturate,
  skyLightProbeParametersDefaults,
  skyMaterialParametersDefaults,
  smoothstep,
  starsMaterialParametersDefaults,
  sunDirectionalLightParametersDefaults,
  toBufferGeometryLike,
  unrollLoops
};
