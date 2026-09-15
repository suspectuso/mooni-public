export const vertexShader = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

export const fragmentShader = `
precision highp float;

uniform float u_time;
uniform vec3 u_color;
uniform vec2 u_resolution;
uniform float u_opacity;

//
// Simplex 3D noise — Ashima Arts (MIT)
//
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// fBm — 3 octaves
float fbm(vec3 p) {
  float val = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 3; i++) {
    val += amp * snoise(p * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return val;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 centered = uv - 0.5;

  float aspect = u_resolution.x / u_resolution.y;
  centered.x *= aspect;

  // Outer fade mask — CSS mask handles final edges, this is extra safety
  float ox = centered.x / (0.809 * aspect);
  float oy = centered.y / 0.676;
  float outerMask = 1.0 - smoothstep(0.4, 1.0, ox * ox + oy * oy);

  float t = u_time;

  // Pendulum drifts (slow global motion matching SVG animate durations)
  vec2 drift1 = vec2(sin(t * 6.283 / 62.0) * 0.10, sin(t * 6.283 / 50.0) * 0.12);
  vec2 drift2 = vec2(sin(t * 6.283 / 52.0) * 0.12, sin(t * 6.283 / 40.0) * 0.16);
  vec2 drift3 = vec2(sin(t * 6.283 / 46.0 + 3.14) * 0.10, sin(t * 6.283 / 34.0 + 3.14) * 0.14);

  vec2 bgNoiseUV = (centered + drift1) * 5.0;
  float bgDispX = fbm(vec3(bgNoiseUV, t * 0.02));
  float bgDispY = fbm(vec3(bgNoiseUV + 127.0, t * 0.02));

  // Warp this pixel's coords — creates organic torn edges
  vec2 bgWarped = centered + vec2(bgDispX, bgDispY) * 0.18;

  float bgEx = bgWarped.x / (0.639 * aspect);
  float bgEy = bgWarped.y / 0.588;
  float bgDist = bgEx * bgEx + bgEy * bgEy;
  float bgEllipse = 1.0 - smoothstep(0.25, 0.9, bgDist);
  float bgLayer = bgEllipse * 0.2;

  vec2 n1UV = (centered + drift2) * 3.0;
  float n1X = fbm(vec3(n1UV, t * 0.025));
  float n1Y = fbm(vec3(n1UV + 93.0, t * 0.025));

  // Layer 2: counter-moving, different seed
  vec2 n2UV = (centered + drift3) * 3.5;
  float n2X = fbm(vec3(n2UV + 200.0, t * 0.03));
  float n2Y = fbm(vec3(n2UV + 317.0, t * 0.03));

  // Combine (like SVG feComposite over)
  float combX = (n1X + n2X) * 0.5;
  float combY = (n1Y + n2Y) * 0.5;

  // Warp this pixel's coords
  vec2 mainWarped = centered + vec2(combX, combY) * 0.2;

  float mEx = mainWarped.x / (0.537 * aspect);
  float mEy = mainWarped.y / 0.5;
  float mDist = mEx * mEx + mEy * mEy;
  float mainEllipse = 1.0 - smoothstep(0.2, 0.8, mDist);

  // Composite
  float combined = max(bgLayer, mainEllipse);
  combined *= outerMask;

  gl_FragColor = vec4(u_color, combined * u_opacity);
}
`
