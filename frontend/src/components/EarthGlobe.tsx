import { useEffect, useRef, useState } from "react";
import { img } from "../assets";
import useReducedMotion from "../hooks/useReducedMotion";

/**
 * Experimental: a real WebGL 3-D globe that stands in for the flat Earth cutout
 * on the orbital map. Hand-rolled WebGL (no 3-D library) so it stays tiny.
 * Falls back to the flat artwork when WebGL is unavailable.
 */

const VERTEX_SHADER = `
attribute vec3 position;
attribute vec2 uv;
uniform float uRotation;
uniform float uFit;
varying vec2 vUv;
varying vec3 vNormal;

vec3 spinY(vec3 point, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return vec3(c * point.x + s * point.z, point.y, -s * point.x + c * point.z);
}

void main() {
  vec3 n = spinY(position, uRotation);
  // Simple perspective (camera distance 3) fitted so the silhouette
  // exactly fills this square canvas.
  vec3 projected = n * uFit * (3.0 / (3.0 - n.z));
  vNormal = n;
  vUv = uv;
  gl_Position = vec4(projected.xy, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform sampler2D uTexture;
uniform float uHasTexture;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 light = normalize(vec3(-0.55, 0.42, 0.8));
  float lambert = max(dot(normal, light), 0.0);
  vec3 surface = vec3(0.16, 0.36, 0.62);
  if (uHasTexture > 0.5) {
    surface = texture2D(uTexture, vUv).rgb;
  }
  vec3 rim = vec3(0.4, 0.65, 0.95) * pow(1.0 - max(normal.z, 0.0), 3.0) * 0.5;
  // Even illumination: the whole ball stays visible, no hard day/night divider.
  vec3 color = surface * (0.62 + 0.55 * pow(lambert, 0.55)) + rim * (0.4 + 0.6 * lambert);
  gl_FragColor = vec4(color, 1.0);
}
`;

const CAMERA_DISTANCE = 3;
// Perspective fit factor for a unit sphere with camera at z = CAMERA_DISTANCE:
// silhouette radius is d / sqrt(d^2 - 1), inverted to fill the canvas.
const FIT = Math.sqrt(CAMERA_DISTANCE * CAMERA_DISTANCE - 1) / CAMERA_DISTANCE;

function buildShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const SEGMENTS = 36;
const STACKS = 24;

function buildSphereGeometry() {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= STACKS; i += 1) {
    const v = i / STACKS;
    const phi = v * Math.PI;
    for (let j = 0; j <= SEGMENTS; j += 1) {
      const u = j / SEGMENTS;
      const theta = u * Math.PI * 2;
      positions.push(
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.cos(theta),
      );
      uvs.push(u, 1 - v);
    }
  }
  for (let i = 0; i < STACKS; i += 1) {
    for (let j = 0; j < SEGMENTS; j += 1) {
      const a = i * (SEGMENTS + 1) + j;
      indices.push(a, a + SEGMENTS + 1, a + 1, a + 1, a + SEGMENTS + 1, a + SEGMENTS + 2);
    }
  }
  return { positions, uvs, indices };
}

type EarthGlobeProps = {
  size: number;
};

export default function EarthGlobe({ size }: EarthGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const reducedMotion = useReducedMotion();
  const reducedRef = useRef(reducedMotion);

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    });
    if (!gl) {
      setFailed(true);
      return undefined;
    }

    const vertexShader = buildShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = buildShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vertexShader || !fragmentShader || !program) {
      setFailed(true);
      return undefined;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFailed(true);
      return undefined;
    }
    gl.useProgram(program);

    const { positions, uvs, indices } = buildSphereGeometry();

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    const uvLocation = gl.getAttribLocation(program, "uv");
    gl.enableVertexAttribArray(uvLocation);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const rotationLocation = gl.getUniformLocation(program, "uRotation");
    const fitLocation = gl.getUniformLocation(program, "uFit");
    const hasTextureLocation = gl.getUniformLocation(program, "uHasTexture");
    gl.uniform1f(rotationLocation, 0.4);
    gl.uniform1f(fitLocation, FIT);
    gl.uniform1f(hasTextureLocation, 0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0, 0, 0, 0);

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const texture = gl.createTexture();
    const image = new Image();
    image.onload = () => {
      if (!texture) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      const aniso =
        gl.getExtension("EXT_texture_filter_anisotropic") ||
        gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
      if (aniso) {
        const max = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, max);
      }
      gl.uniform1f(hasTextureLocation, 1);
    };
    image.src = img.earthMap;

    let angle = 0.4;
    let last = performance.now();
    let raf = 0;
    let running = true;

    const render = (now: number) => {
      if (!running) return;
      const delta = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      if (!reducedRef.current && !document.hidden) {
        angle += delta * 0.3;
      }
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniform1f(rotationLocation, angle);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(uvBuffer);
      gl.deleteBuffer(indexBuffer);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [size]);

  if (failed) {
    return <img className="planet-img" src={img.earth} alt="" draggable={false} />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="planet-globe"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
