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
function createDataLoaderClass(Texture, parser, parameters) {
  return class extends DataLoader {
    constructor() {
      super(...arguments);
      this.Texture = Texture;
      this.TypedArrayLoader = createTypedArrayLoaderClass(parser);
      this.parameters = {
        ...defaultDataTextureParameter,
        ...parameters
      };
    }
  };
}
function createData3DTextureLoaderClass(parser, parameters) {
  return createDataLoaderClass(Data3DTexture, parser, parameters);
}
function createDataTextureLoaderClass(parser, parameters) {
  return createDataLoaderClass(DataTexture, parser, parameters);
}
function createData3DTextureLoader(parser, parameters) {
  return new (createData3DTextureLoaderClass(parser, parameters))();
}
function createDataTextureLoader(parser, parameters) {
  return new (createDataTextureLoaderClass(parser, parameters))();
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

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\geospatial\shaders\cascadedShadowMaps.glsl
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

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\geospatial\shaders\depth.glsl
var depth_default = "// cSpell:words logdepthbuf\r\n\r\nfloat reverseLogDepth(const float depth, const float near, const float far) {\r\n  #ifdef USE_LOGDEPTHBUF\r\n  float d = pow(2.0, depth * log2(far + 1.0)) - 1.0;\r\n  float a = far / (far - near);\r\n  float b = far * near / (near - far);\r\n  return a + b / d;\r\n  #else // USE_LOGDEPTHBUF\r\n  return depth;\r\n  #endif // USE_LOGDEPTHBUF\r\n}\r\n\r\nfloat linearizeDepth(const float depth, const float near, const float far) {\r\n  float ndc = depth * 2.0 - 1.0;\r\n  return 2.0 * near * far / (far + near - ndc * (far - near));\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\geospatial\shaders\interleavedGradientNoise.glsl
var interleavedGradientNoise_default = "// Reference: https://advances.realtimerendering.com/s2014/index.html#_NEXT_GENERATION_POST\r\n\r\nfloat interleavedGradientNoise(const vec2 coord) {\r\n  const vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);\r\n  return fract(magic.z * fract(dot(coord, magic.xy)));\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\geospatial\shaders\math.glsl
var math_default = "#if !defined(saturate)\r\n#define saturate(a) clamp(a, 0.0, 1.0)\r\n#endif // !defined(saturate)\r\n\r\nfloat remap(const float x, const float min1, const float max1, const float min2, const float max2) {\r\n  return min2 + (x - min1) / (max1 - min1) * (max2 - min2);\r\n}\r\n\r\nvec2 remap(const vec2 x, const vec2 min1, const vec2 max1, const vec2 min2, const vec2 max2) {\r\n  return min2 + (x - min1) / (max1 - min1) * (max2 - min2);\r\n}\r\n\r\nvec3 remap(const vec3 x, const vec3 min1, const vec3 max1, const vec3 min2, const vec3 max2) {\r\n  return min2 + (x - min1) / (max1 - min1) * (max2 - min2);\r\n}\r\n\r\nvec4 remap(const vec4 x, const vec4 min1, const vec4 max1, const vec4 min2, const vec4 max2) {\r\n  return min2 + (x - min1) / (max1 - min1) * (max2 - min2);\r\n}\r\n\r\nfloat remapClamped(\r\n  const float x,\r\n  const float min1,\r\n  const float max1,\r\n  const float min2,\r\n  const float max2\r\n) {\r\n  return clamp(min2 + (x - min1) / (max1 - min1) * (max2 - min2), min2, max2);\r\n}\r\n\r\nvec2 remapClamped(\r\n  const vec2 x,\r\n  const vec2 min1,\r\n  const vec2 max1,\r\n  const vec2 min2,\r\n  const vec2 max2\r\n) {\r\n  return clamp(min2 + (x - min1) / (max1 - min1) * (max2 - min2), min2, max2);\r\n}\r\n\r\nvec3 remapClamped(\r\n  const vec3 x,\r\n  const vec3 min1,\r\n  const vec3 max1,\r\n  const vec3 min2,\r\n  const vec3 max2\r\n) {\r\n  return clamp(min2 + (x - min1) / (max1 - min1) * (max2 - min2), min2, max2);\r\n}\r\n\r\nvec4 remapClamped(\r\n  const vec4 x,\r\n  const vec4 min1,\r\n  const vec4 max1,\r\n  const vec4 min2,\r\n  const vec4 max2\r\n) {\r\n  return clamp(min2 + (x - min1) / (max1 - min1) * (max2 - min2), min2, max2);\r\n}\r\n\r\n// Implicitly remap to 0 and 1\r\nfloat remap(const float x, const float min1, const float max1) {\r\n  return (x - min1) / (max1 - min1);\r\n}\r\n\r\nvec2 remap(const vec2 x, const vec2 min1, const vec2 max1) {\r\n  return (x - min1) / (max1 - min1);\r\n}\r\n\r\nvec3 remap(const vec3 x, const vec3 min1, const vec3 max1) {\r\n  return (x - min1) / (max1 - min1);\r\n}\r\n\r\nvec4 remap(const vec4 x, const vec4 min1, const vec4 max1) {\r\n  return (x - min1) / (max1 - min1);\r\n}\r\n\r\nfloat remapClamped(const float x, const float min1, const float max1) {\r\n  return saturate((x - min1) / (max1 - min1));\r\n}\r\n\r\nvec2 remapClamped(const vec2 x, const vec2 min1, const vec2 max1) {\r\n  return saturate((x - min1) / (max1 - min1));\r\n}\r\n\r\nvec3 remapClamped(const vec3 x, const vec3 min1, const vec3 max1) {\r\n  return saturate((x - min1) / (max1 - min1));\r\n}\r\n\r\nvec4 remapClamped(const vec4 x, const vec4 min1, const vec4 max1) {\r\n  return saturate((x - min1) / (max1 - min1));\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\geospatial\shaders\packing.glsl
var packing_default = "// Reference: https://jcgt.org/published/0003/02/01/paper.pdf\r\n\r\nvec2 signNotZero(vec2 v) {\r\n  return vec2(v.x >= 0.0 ? 1.0 : -1.0, v.y >= 0.0 ? 1.0 : -1.0);\r\n}\r\n\r\nvec2 packNormalToVec2(vec3 v) {\r\n  vec2 p = v.xy * (1.0 / (abs(v.x) + abs(v.y) + abs(v.z)));\r\n  return v.z <= 0.0\r\n    ? (1.0 - abs(p.yx)) * signNotZero(p)\r\n    : p;\r\n}\r\n\r\nvec3 unpackVec2ToNormal(vec2 e) {\r\n  vec3 v = vec3(e.xy, 1.0 - abs(e.x) - abs(e.y));\r\n  if (v.z < 0.0) {\r\n    v.xy = (1.0 - abs(v.yx)) * signNotZero(v.xy);\r\n  }\r\n  return normalize(v);\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\geospatial\shaders\raySphereIntersection.glsl
var raySphereIntersection_default = "float raySphereFirstIntersection(\r\n  const vec3 origin,\r\n  const vec3 direction,\r\n  const vec3 center,\r\n  const float radius\r\n) {\r\n  vec3 a = origin - center;\r\n  float b = 2.0 * dot(direction, a);\r\n  float c = dot(a, a) - radius * radius;\r\n  float discriminant = b * b - 4.0 * c;\r\n  return discriminant < 0.0\r\n    ? -1.0\r\n    : (-b - sqrt(discriminant)) * 0.5;\r\n}\r\n\r\nfloat raySphereFirstIntersection(const vec3 origin, const vec3 direction, const float radius) {\r\n  return raySphereFirstIntersection(origin, direction, vec3(0.0), radius);\r\n}\r\n\r\nvec4 raySphereFirstIntersection(\r\n  const vec3 origin,\r\n  const vec3 direction,\r\n  const vec3 center,\r\n  const vec4 radius\r\n) {\r\n  vec3 a = origin - center;\r\n  float b = 2.0 * dot(direction, a);\r\n  vec4 c = dot(a, a) - radius * radius;\r\n  vec4 discriminant = b * b - 4.0 * c;\r\n  vec4 mask = step(discriminant, vec4(0.0));\r\n  return mix((-b - sqrt(max(vec4(0.0), discriminant))) * 0.5, vec4(-1.0), mask);\r\n}\r\n\r\nvec4 raySphereFirstIntersection(const vec3 origin, const vec3 direction, const vec4 radius) {\r\n  return raySphereFirstIntersection(origin, direction, vec3(0.0), radius);\r\n}\r\n\r\nfloat raySphereSecondIntersection(\r\n  const vec3 origin,\r\n  const vec3 direction,\r\n  const vec3 center,\r\n  const float radius\r\n) {\r\n  vec3 a = origin - center;\r\n  float b = 2.0 * dot(direction, a);\r\n  float c = dot(a, a) - radius * radius;\r\n  float discriminant = b * b - 4.0 * c;\r\n  return discriminant < 0.0\r\n    ? -1.0\r\n    : (-b + sqrt(discriminant)) * 0.5;\r\n}\r\n\r\nfloat raySphereSecondIntersection(const vec3 origin, const vec3 direction, const float radius) {\r\n  return raySphereSecondIntersection(origin, direction, vec3(0.0), radius);\r\n}\r\n\r\nvec4 raySphereSecondIntersection(\r\n  const vec3 origin,\r\n  const vec3 direction,\r\n  const vec3 center,\r\n  const vec4 radius\r\n) {\r\n  vec3 a = origin - center;\r\n  float b = 2.0 * dot(direction, a);\r\n  vec4 c = dot(a, a) - radius * radius;\r\n  vec4 discriminant = b * b - 4.0 * c;\r\n  vec4 mask = step(discriminant, vec4(0.0));\r\n  return mix((-b + sqrt(max(vec4(0.0), discriminant))) * 0.5, vec4(-1.0), mask);\r\n}\r\n\r\nvec4 raySphereSecondIntersection(const vec3 origin, const vec3 direction, const vec4 radius) {\r\n  return raySphereSecondIntersection(origin, direction, vec3(0.0), radius);\r\n}\r\n\r\nvoid raySphereIntersections(\r\n  const vec3 origin,\r\n  const vec3 direction,\r\n  const vec3 center,\r\n  const float radius,\r\n  out float intersection1,\r\n  out float intersection2\r\n) {\r\n  vec3 a = origin - center;\r\n  float b = 2.0 * dot(direction, a);\r\n  float c = dot(a, a) - radius * radius;\r\n  float discriminant = b * b - 4.0 * c;\r\n  if (discriminant < 0.0) {\r\n    intersection1 = -1.0;\r\n    intersection2 = -1.0;\r\n    return;\r\n  } else {\r\n    float Q = sqrt(discriminant);\r\n    intersection1 = (-b - Q) * 0.5;\r\n    intersection2 = (-b + Q) * 0.5;\r\n  }\r\n}\r\n\r\nvoid raySphereIntersections(\r\n  const vec3 origin,\r\n  const vec3 direction,\r\n  const float radius,\r\n  out float intersection1,\r\n  out float intersection2\r\n) {\r\n  raySphereIntersections(origin, direction, vec3(0.0), radius, intersection1, intersection2);\r\n}\r\n\r\nvoid raySphereIntersections(\r\n  const vec3 origin,\r\n  const vec3 direction,\r\n  const vec3 center,\r\n  const vec4 radius,\r\n  out vec4 intersection1,\r\n  out vec4 intersection2\r\n) {\r\n  vec3 a = origin - center;\r\n  float b = 2.0 * dot(direction, a);\r\n  vec4 c = dot(a, a) - radius * radius;\r\n  vec4 discriminant = b * b - 4.0 * c;\r\n  vec4 mask = step(discriminant, vec4(0.0));\r\n  vec4 Q = sqrt(max(vec4(0.0), discriminant));\r\n  intersection1 = mix((-b - Q) * 0.5, vec4(-1.0), mask);\r\n  intersection2 = mix((-b + Q) * 0.5, vec4(-1.0), mask);\r\n}\r\n\r\nvoid raySphereIntersections(\r\n  const vec3 origin,\r\n  const vec3 direction,\r\n  const vec4 radius,\r\n  out vec4 intersection1,\r\n  out vec4 intersection2\r\n) {\r\n  raySphereIntersections(origin, direction, vec3(0.0), radius, intersection1, intersection2);\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\geospatial\shaders\transform.glsl
var transform_default = "vec3 screenToView(\r\n  const vec2 uv,\r\n  const float depth,\r\n  const float viewZ,\r\n  const mat4 projectionMatrix,\r\n  const mat4 inverseProjectionMatrix\r\n) {\r\n  vec4 clip = vec4(vec3(uv, depth) * 2.0 - 1.0, 1.0);\r\n  float clipW = projectionMatrix[2][3] * viewZ + projectionMatrix[3][3];\r\n  clip *= clipW;\r\n  return (inverseProjectionMatrix * clip).xyz;\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\geospatial\shaders\vogelDisk.glsl
var vogelDisk_default = "// Reference: https://www.gamedev.net/tutorials/programming/graphics/contact-hardening-soft-shadows-made-fast-r4906/\r\n\r\nvec2 vogelDisk(const int index, const int sampleCount, const float phi) {\r\n  const float goldenAngle = 2.39996322972865332;\r\n  float r = sqrt(float(index) + 0.5) / sqrt(float(sampleCount));\r\n  float theta = float(index) * goldenAngle + phi;\r\n  return r * vec2(cos(theta), sin(theta));\r\n}\r\n";

// source/geospatial/shaders/index.ts
var cascadedShadowMaps = cascadedShadowMaps_default;
var depth = depth_default;
var interleavedGradientNoise = interleavedGradientNoise_default;
var math = math_default;
var packing = packing_default;
var raySphereIntersection = raySphereIntersection_default;
var transform = transform_default;
var vogelDisk = vogelDisk_default;

// source/atmosphere/AtmosphereParameters.ts
import { Vector3 as Vector37 } from "three";
var paramKeys = [
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
function applyOptions(target, params) {
  if (params == null) {
    return;
  }
  for (const key of paramKeys) {
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
    applyOptions(this, options);
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

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\atmosphere\shaders\aerialPerspectiveEffect.frag
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

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\atmosphere\shaders\aerialPerspectiveEffect.vert
var aerialPerspectiveEffect_default2 = "uniform mat4 inverseViewMatrix;\r\nuniform mat4 inverseProjectionMatrix;\r\nuniform vec3 cameraPosition;\r\nuniform vec3 ellipsoidCenter;\r\nuniform mat4 inverseEllipsoidMatrix;\r\nuniform vec3 altitudeCorrection;\r\nuniform vec3 ellipsoidRadii;\r\nuniform float idealSphereAlpha;\r\n\r\nvarying vec3 vCameraPosition;\r\nvarying vec3 vRayDirection;\r\nvarying vec3 vEllipsoidCenter;\r\nvarying vec3 vGeometryEllipsoidCenter;\r\nvarying vec3 vEllipsoidRadiiSquared;\r\n\r\nvoid getCameraRay(out vec3 origin, out vec3 direction) {\r\n  bool isPerspective = inverseProjectionMatrix[2][3] != 0.0; // 4th entry in the 3rd column\r\n\r\n  if (isPerspective) {\r\n    // Calculate the camera ray for a perspective camera.\r\n    vec4 viewPosition = inverseProjectionMatrix * vec4(position, 1.0);\r\n    vec4 worldDirection = inverseViewMatrix * vec4(viewPosition.xyz, 0.0);\r\n    origin = cameraPosition;\r\n    direction = worldDirection.xyz;\r\n  } else {\r\n    // Unprojected points to calculate direction.\r\n    vec4 nearPoint = inverseProjectionMatrix * vec4(position.xy, -1.0, 1.0);\r\n    vec4 farPoint = inverseProjectionMatrix * vec4(position.xy, -0.9, 1.0);\r\n    nearPoint /= nearPoint.w;\r\n    farPoint /= farPoint.w;\r\n\r\n    // Calculate world values.\r\n    vec4 worldDirection = inverseViewMatrix * vec4(farPoint.xyz - nearPoint.xyz, 0.0);\r\n    vec4 worldOrigin = inverseViewMatrix * nearPoint;\r\n\r\n    // Outputs\r\n    direction = worldDirection.xyz;\r\n    origin = worldOrigin.xyz;\r\n  }\r\n}\r\n\r\nvoid mainSupport() {\r\n  vec3 direction, origin;\r\n  getCameraRay(origin, direction);\r\n\r\n  mat3 rotation = mat3(inverseEllipsoidMatrix);\r\n  vCameraPosition = rotation * origin.xyz * METER_TO_LENGTH_UNIT;\r\n  vRayDirection = rotation * direction.xyz;\r\n\r\n  vEllipsoidCenter = (ellipsoidCenter + altitudeCorrection) * METER_TO_LENGTH_UNIT;\r\n  #ifdef CORRECT_GEOMETRIC_ERROR\r\n  // Gradually turn off altitude correction for aerial perspective as geometric\r\n  // error correction takes effect.\r\n  // See: https://github.com/takram-design-engineering/three-geospatial/pull/23#issuecomment-2542914656\r\n  vGeometryEllipsoidCenter =\r\n    (ellipsoidCenter + mix(altitudeCorrection, vec3(0.0), idealSphereAlpha)) * METER_TO_LENGTH_UNIT;\r\n  #else\r\n  vGeometryEllipsoidCenter = vEllipsoidCenter;\r\n  #endif // CORRECT_GEOMETRIC_ERROR\r\n\r\n  vec3 radii = ellipsoidRadii * METER_TO_LENGTH_UNIT;\r\n  vEllipsoidRadiiSquared = radii * radii;\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\atmosphere\shaders\functions.glsl
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

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\atmosphere\shaders\parameters.glsl
var parameters_default = "uniform vec3 u_solar_irradiance;\r\nuniform float u_sun_angular_radius;\r\nuniform float u_bottom_radius;\r\nuniform float u_top_radius;\r\nuniform vec3 u_rayleigh_scattering;\r\nuniform vec3 u_mie_scattering;\r\nuniform float u_mie_phase_function_g;\r\nuniform float u_mu_s_min;\r\nuniform float u_max_rayleigh_shadow_length;\r\n\r\nuniform sampler2D u_transmittance_texture;\r\nuniform sampler3D u_scattering_texture;\r\nuniform sampler3D u_single_mie_scattering_texture;\r\nuniform sampler2D u_irradiance_texture;\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\atmosphere\shaders\sky.glsl
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
  onBeforeCompile(parameters, renderer) {
    parameters.fragmentShader = includeRenderTargets(
      parameters.fragmentShader,
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

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\atmosphere\shaders\irradianceMask.frag
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

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\atmosphere\shaders\sky.frag
var sky_default2 = 'precision highp float;\r\nprecision highp sampler3D;\r\n\r\n#define RECIPROCAL_PI (0.3183098861837907)\r\n\r\n#include "core/raySphereIntersection"\r\n#include "parameters"\r\n#include "functions"\r\n#include "sky"\r\n\r\nuniform vec3 sunDirection;\r\nuniform vec3 moonDirection;\r\nuniform float moonAngularRadius;\r\nuniform float lunarRadianceScale;\r\nuniform vec3 groundAlbedo;\r\n\r\n#ifdef HAS_SHADOW_LENGTH\r\nuniform sampler2D shadowLengthBuffer;\r\n#endif // HAS_SHADOW_LENGTH\r\n\r\nin vec2 vUv;\r\nin vec3 vCameraPosition;\r\nin vec3 vRayDirection;\r\nin vec3 vEllipsoidCenter;\r\n\r\nlayout(location = 0) out vec4 outputColor;\r\n\r\n#include <mrt_layout>\r\n\r\nbool rayIntersectsGround(const vec3 cameraPosition, const vec3 rayDirection) {\r\n  float r = length(cameraPosition);\r\n  float mu = dot(cameraPosition, rayDirection) / r;\r\n  return mu < 0.0 && r * r * (mu * mu - 1.0) + u_bottom_radius * u_bottom_radius >= 0.0;\r\n}\r\n\r\nvoid main() {\r\n  float shadowLength = 0.0;\r\n  #ifdef HAS_SHADOW_LENGTH\r\n  shadowLength = texture(shadowLengthBuffer, vUv).r;\r\n  #endif // HAS_SHADOW_LENGTH\r\n\r\n  vec3 cameraPosition = vCameraPosition - vEllipsoidCenter;\r\n  vec3 rayDirection = normalize(vRayDirection);\r\n\r\n  #ifdef GROUND_ALBEDO\r\n\r\n  bool intersectsGround = rayIntersectsGround(cameraPosition, rayDirection);\r\n  if (intersectsGround) {\r\n    float distanceToGround = raySphereFirstIntersection(\r\n      cameraPosition,\r\n      rayDirection,\r\n      u_bottom_radius\r\n    );\r\n    vec3 groundPosition = rayDirection * distanceToGround + cameraPosition;\r\n    vec3 surfaceNormal = normalize(groundPosition);\r\n    vec3 skyIrradiance;\r\n    vec3 sunIrradiance = GetSunAndSkyIrradiance(\r\n      cameraPosition,\r\n      surfaceNormal,\r\n      sunDirection,\r\n      skyIrradiance\r\n    );\r\n    vec3 transmittance;\r\n    vec3 inscatter = GetSkyRadianceToPoint(\r\n      cameraPosition,\r\n      u_bottom_radius * surfaceNormal,\r\n      shadowLength,\r\n      sunDirection,\r\n      transmittance\r\n    );\r\n    vec3 radiance = groundAlbedo * RECIPROCAL_PI * (sunIrradiance + skyIrradiance);\r\n    outputColor.rgb = radiance * transmittance + inscatter;\r\n  } else {\r\n    outputColor.rgb = getSkyRadiance(\r\n      cameraPosition,\r\n      rayDirection,\r\n      shadowLength,\r\n      sunDirection,\r\n      moonDirection,\r\n      moonAngularRadius,\r\n      lunarRadianceScale\r\n    );\r\n  }\r\n\r\n  #else // GROUND_ALBEDO\r\n\r\n  outputColor.rgb = getSkyRadiance(\r\n    cameraPosition,\r\n    rayDirection,\r\n    shadowLength,\r\n    sunDirection,\r\n    moonDirection,\r\n    moonAngularRadius,\r\n    lunarRadianceScale\r\n  );\r\n\r\n  #endif // GROUND_ALBEDO\r\n\r\n  outputColor.a = 1.0;\r\n\r\n  #include <mrt_output>\r\n}\r\n';

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\atmosphere\shaders\sky.vert
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

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\atmosphere\shaders\stars.frag
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

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\atmosphere\shaders\stars.vert
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

// source/effects/DitheringEffect.ts
import { BlendFunction as BlendFunction2, Effect as Effect2 } from "postprocessing";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\effects\shaders\ditheringEffect.frag
var ditheringEffect_default = "#define DITHERING\r\n\r\n#include <dithering_pars_fragment>\r\n\r\nvoid mainImage(const vec4 inputColor, const vec2 uv, out vec4 outputColor) {\r\n  outputColor = vec4(saturate(dithering(inputColor.rgb)), inputColor.a);\r\n}\r\n";

// source/effects/DitheringEffect.ts
var ditheringOptionsDefaults = {
  blendFunction: BlendFunction2.NORMAL
};
var DitheringEffect = class extends Effect2 {
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
  Effect as Effect3,
  EffectAttribute as EffectAttribute2,
  KawaseBlurPass,
  KernelSize,
  MipmapBlurPass,
  Resolution,
  ShaderPass as ShaderPass2
} from "postprocessing";
import {
  HalfFloatType as HalfFloatType4,
  Uniform as Uniform8,
  WebGLRenderTarget as WebGLRenderTarget2
} from "three";

// source/effects/DownsampleThresholdMaterial.ts
import {
  NoBlending,
  ShaderMaterial,
  Uniform as Uniform6,
  Vector2 as Vector26
} from "three";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\effects\shaders\downsampleThreshold.frag
var downsampleThreshold_default = "#include <common>\r\n\r\nuniform sampler2D inputBuffer;\r\n\r\nuniform float thresholdLevel;\r\nuniform float thresholdRange;\r\n\r\nin vec2 vCenterUv1;\r\nin vec2 vCenterUv2;\r\nin vec2 vCenterUv3;\r\nin vec2 vCenterUv4;\r\nin vec2 vRowUv1;\r\nin vec2 vRowUv2;\r\nin vec2 vRowUv3;\r\nin vec2 vRowUv4;\r\nin vec2 vRowUv5;\r\nin vec2 vRowUv6;\r\nin vec2 vRowUv7;\r\nin vec2 vRowUv8;\r\nin vec2 vRowUv9;\r\n\r\nfloat clampToBorder(const vec2 uv) {\r\n  return float(uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0);\r\n}\r\n\r\n// Reference: https://learnopengl.com/Guest-Articles/2022/Phys.-Based-Bloom\r\nvoid main() {\r\n  vec3 color = 0.125 * texture(inputBuffer, vec2(vRowUv5)).rgb;\r\n  vec4 weight =\r\n    0.03125 *\r\n    vec4(\r\n      clampToBorder(vRowUv1),\r\n      clampToBorder(vRowUv3),\r\n      clampToBorder(vRowUv7),\r\n      clampToBorder(vRowUv9)\r\n    );\r\n  color += weight.x * texture(inputBuffer, vec2(vRowUv1)).rgb;\r\n  color += weight.y * texture(inputBuffer, vec2(vRowUv3)).rgb;\r\n  color += weight.z * texture(inputBuffer, vec2(vRowUv7)).rgb;\r\n  color += weight.w * texture(inputBuffer, vec2(vRowUv9)).rgb;\r\n\r\n  weight =\r\n    0.0625 *\r\n    vec4(\r\n      clampToBorder(vRowUv2),\r\n      clampToBorder(vRowUv4),\r\n      clampToBorder(vRowUv6),\r\n      clampToBorder(vRowUv8)\r\n    );\r\n  color += weight.x * texture(inputBuffer, vec2(vRowUv2)).rgb;\r\n  color += weight.y * texture(inputBuffer, vec2(vRowUv4)).rgb;\r\n  color += weight.z * texture(inputBuffer, vec2(vRowUv6)).rgb;\r\n  color += weight.w * texture(inputBuffer, vec2(vRowUv8)).rgb;\r\n\r\n  weight =\r\n    0.125 *\r\n    vec4(\r\n      clampToBorder(vRowUv2),\r\n      clampToBorder(vRowUv4),\r\n      clampToBorder(vRowUv6),\r\n      clampToBorder(vRowUv8)\r\n    );\r\n  color += weight.x * texture(inputBuffer, vec2(vCenterUv1)).rgb;\r\n  color += weight.y * texture(inputBuffer, vec2(vCenterUv2)).rgb;\r\n  color += weight.z * texture(inputBuffer, vec2(vCenterUv3)).rgb;\r\n  color += weight.w * texture(inputBuffer, vec2(vCenterUv4)).rgb;\r\n\r\n  // WORKAROUND: Avoid screen flashes if the input buffer contains NaN texels.\r\n  // See: https://github.com/takram-design-engineering/three-geospatial/issues/7\r\n  if (any(isnan(color))) {\r\n    gl_FragColor = vec4(vec3(0.0), 1.0);\r\n    return;\r\n  }\r\n\r\n  float l = luminance(color);\r\n  float scale = saturate(smoothstep(thresholdLevel, thresholdLevel + thresholdRange, l));\r\n  gl_FragColor = vec4(color * scale, 1.0);\r\n}\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\effects\shaders\downsampleThreshold.vert
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
        inputBuffer: new Uniform6(inputBuffer),
        texelSize: new Uniform6(new Vector26()),
        thresholdLevel: new Uniform6(thresholdLevel),
        thresholdRange: new Uniform6(thresholdRange),
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
  Uniform as Uniform7,
  Vector2 as Vector27
} from "three";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\effects\shaders\lensFlareFeatures.frag
var lensFlareFeatures_default = "#include <common>\r\n\r\n#define SQRT_2 (0.7071067811865476)\r\n\r\nuniform sampler2D inputBuffer;\r\n\r\nuniform vec2 texelSize;\r\nuniform float ghostAmount;\r\nuniform float haloAmount;\r\nuniform float chromaticAberration;\r\n\r\nin vec2 vUv;\r\nin vec2 vAspectRatio;\r\n\r\nvec3 sampleGhost(const vec2 direction, const vec3 color, const float offset) {\r\n  vec2 suv = clamp(1.0 - vUv + direction * offset, 0.0, 1.0);\r\n  vec3 result = texture(inputBuffer, suv).rgb * color;\r\n\r\n  // Falloff at the perimeter.\r\n  float d = clamp(length(0.5 - suv) / (0.5 * SQRT_2), 0.0, 1.0);\r\n  result *= pow(1.0 - d, 3.0);\r\n  return result;\r\n}\r\n\r\nvec4 sampleGhosts(float amount) {\r\n  vec3 color = vec3(0.0);\r\n  vec2 direction = vUv - 0.5;\r\n  color += sampleGhost(direction, vec3(0.8, 0.8, 1.0), -5.0);\r\n  color += sampleGhost(direction, vec3(1.0, 0.8, 0.4), -1.5);\r\n  color += sampleGhost(direction, vec3(0.9, 1.0, 0.8), -0.4);\r\n  color += sampleGhost(direction, vec3(1.0, 0.8, 0.4), -0.2);\r\n  color += sampleGhost(direction, vec3(0.9, 0.7, 0.7), -0.1);\r\n  color += sampleGhost(direction, vec3(0.5, 1.0, 0.4), 0.7);\r\n  color += sampleGhost(direction, vec3(0.5, 0.5, 0.5), 1.0);\r\n  color += sampleGhost(direction, vec3(1.0, 1.0, 0.6), 2.5);\r\n  color += sampleGhost(direction, vec3(0.5, 0.8, 1.0), 10.0);\r\n  return vec4(color * amount, 1.0);\r\n}\r\n\r\n// Reference: https://john-chapman.github.io/2017/11/05/pseudo-lens-flare.html\r\nfloat cubicRingMask(const float x, const float radius, const float thickness) {\r\n  float v = min(abs(x - radius) / thickness, 1.0);\r\n  return 1.0 - v * v * (3.0 - 2.0 * v);\r\n}\r\n\r\nvec3 sampleHalo(const float radius) {\r\n  vec2 direction = normalize((vUv - 0.5) / vAspectRatio) * vAspectRatio;\r\n  vec3 offset = vec3(texelSize.x * chromaticAberration) * vec3(-1.0, 0.0, 1.0);\r\n  vec2 suv = fract(1.0 - vUv + direction * radius);\r\n  vec3 result = vec3(\r\n    texture(inputBuffer, suv + direction * offset.r).r,\r\n    texture(inputBuffer, suv + direction * offset.g).g,\r\n    texture(inputBuffer, suv + direction * offset.b).b\r\n  );\r\n\r\n  // Falloff at the center and perimeter.\r\n  vec2 wuv = (vUv - vec2(0.5, 0.0)) / vAspectRatio + vec2(0.5, 0.0);\r\n  float d = saturate(distance(wuv, vec2(0.5)));\r\n  result *= cubicRingMask(d, 0.45, 0.25);\r\n  return result;\r\n}\r\n\r\nvec4 sampleHalos(const float amount) {\r\n  vec3 color = vec3(0.0);\r\n  color += sampleHalo(0.3);\r\n  return vec4(color, 1.0) * amount;\r\n}\r\n\r\nvoid main() {\r\n  gl_FragColor += sampleGhosts(ghostAmount);\r\n  gl_FragColor += sampleHalos(haloAmount);\r\n}\r\n\r\n";

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\effects\shaders\lensFlareFeatures.vert
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
        inputBuffer: new Uniform7(inputBuffer),
        texelSize: new Uniform7(new Vector27()),
        ghostAmount: new Uniform7(ghostAmount),
        haloAmount: new Uniform7(haloAmount),
        chromaticAberration: new Uniform7(chromaticAberration),
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

// raw-text:E:\夸克网盘备份\项目分类\threejs\threejs\three_v003\zhtml\_awesome-graphics\skills\threejs-atmosphere-aerial-perspective\examples\lut-aerial-perspective\source\effects\shaders\lensFlareEffect.frag
var lensFlareEffect_default = "uniform sampler2D bloomBuffer;\r\nuniform sampler2D featuresBuffer;\r\nuniform float intensity;\r\n\r\nvoid mainImage(const vec4 inputColor, const vec2 uv, out vec4 outputColor) {\r\n  vec3 bloom = texture(bloomBuffer, uv).rgb;\r\n  vec3 features = texture(featuresBuffer, uv).rgb;\r\n  outputColor = vec4(inputColor.rgb + (bloom + features) * intensity, inputColor.a);\r\n}\r\n";

// source/effects/LensFlareEffect.ts
var lensFlareEffectOptionsDefaults = {
  blendFunction: BlendFunction3.NORMAL,
  resolutionScale: 0.5,
  width: Resolution.AUTO_SIZE,
  height: Resolution.AUTO_SIZE,
  intensity: 5e-3
};
var LensFlareEffect = class extends Effect3 {
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
      attributes: EffectAttribute2.CONVOLUTION,
      uniforms: new Map(
        Object.entries({
          bloomBuffer: new Uniform8(null),
          featuresBuffer: new Uniform8(null),
          intensity: new Uniform8(1)
        })
      )
    });
    this.onResolutionChange = () => {
      this.setSize(this.resolution.baseWidth, this.resolution.baseHeight);
    };
    this.renderTarget1 = new WebGLRenderTarget2(1, 1, {
      depthBuffer: false,
      stencilBuffer: false,
      type: HalfFloatType4
    });
    this.renderTarget1.texture.name = "LensFlare.Target1";
    this.renderTarget2 = new WebGLRenderTarget2(1, 1, {
      depthBuffer: false,
      stencilBuffer: false,
      type: HalfFloatType4
    });
    this.renderTarget2.texture.name = "LensFlare.Target2";
    this.thresholdMaterial = new DownsampleThresholdMaterial();
    this.thresholdPass = new ShaderPass2(this.thresholdMaterial);
    this.blurPass = new MipmapBlurPass();
    this.blurPass.levels = 8;
    this.preBlurPass = new KawaseBlurPass({
      kernelSize: KernelSize.SMALL
    });
    this.featuresMaterial = new LensFlareFeaturesMaterial();
    this.featuresPass = new ShaderPass2(this.featuresMaterial);
    this.uniforms.get("bloomBuffer").value = this.blurPass.texture;
    this.uniforms.get("featuresBuffer").value = this.renderTarget1.texture;
    this.resolution = new Resolution(
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

// atmosphere-effect.entry.js
import {
  EffectComposer,
  EffectPass,
  RenderPass as RenderPass2,
  ToneMappingEffect,
  ToneMappingMode
} from "postprocessing";
export {
  AerialPerspectiveEffect,
  ArrayBufferLoader,
  AtmosphereMaterialBase,
  AtmosphereParameters,
  DEFAULT_PRECOMPUTED_TEXTURES_URL,
  DEFAULT_STARS_DATA_URL,
  DEFAULT_STBN_URL,
  DataLoader,
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
  METER_TO_LENGTH_UNIT,
  PointOfView,
  PrecomputedTexturesLoader,
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
  TypedArrayLoader,
  aerialPerspectiveEffectOptionsDefaults,
  assertType,
  atmosphereMaterialParametersBaseDefaults,
  ceilPowerOfTwo,
  clamp,
  closeTo,
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
