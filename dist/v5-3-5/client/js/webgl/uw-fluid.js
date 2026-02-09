"use strict"; const canvas = document.getElementById("bg-canvas"); if (!canvas) { console.error("Fluid Sim: Canvas #bg-canvas not found"); } else {
    resizeCanvas(); let config = { SIM_RESOLUTION: 128, DYE_RESOLUTION: 1024, CAPTURE_RESOLUTION: 512, DENSITY_DISSIPATION: 2, VELOCITY_DISSIPATION: .2, PRESSURE: .8, PRESSURE_ITERATIONS: 20, CURL: 30, SPLAT_RADIUS: .25, SPLAT_FORCE: 6e3, SHADING: !0, COLORFUL: !0, COLOR_UPDATE_SPEED: 10, PAUSED: !1, BACK_COLOR: { r: 0, g: 0, b: 0 }, TRANSPARENT: !1, BLOOM: !0, BLOOM_ITERATIONS: 8, BLOOM_RESOLUTION: 256, BLOOM_INTENSITY: .8, BLOOM_THRESHOLD: .6, BLOOM_SOFT_KNEE: .7, SUNRAYS: !1, SUNRAYS_RESOLUTION: 196, SUNRAYS_WEIGHT: 1 }; function pointerPrototype() { this.id = -1, this.texcoordX = 0, this.texcoordY = 0, this.prevTexcoordX = 0, this.prevTexcoordY = 0, this.deltaX = 0, this.deltaY = 0, this.down = !1, this.moved = !1, this.color = [30, 0, 300] } let pointers = [], splatStack = []; pointers.push(new pointerPrototype); const { gl: e, ext: r } = getWebGLContext(canvas); function getWebGLContext(e) { let r = { alpha: !0, depth: !1, stencil: !1, antialias: !1, preserveDrawingBuffer: !1 }, t = e.getContext("webgl2", r), i = !!t; i || (t = e.getContext("webgl", r) || e.getContext("experimental-webgl", r)); let a, o; i ? (t.getExtension("EXT_color_buffer_float"), o = t.getExtension("OES_texture_float_linear")) : (a = t.getExtension("OES_texture_half_float"), o = t.getExtension("OES_texture_half_float_linear")), t.clearColor(0, 0, 0, 0); let n = i ? t.HALF_FLOAT : a.HALF_FLOAT_OES, l, u, c; return i ? (l = getSupportedFormat(t, t.RGBA16F, t.RGBA, n), u = getSupportedFormat(t, t.RG16F, t.RG, n), c = getSupportedFormat(t, t.R16F, t.RED, n)) : (l = getSupportedFormat(t, t.RGBA, t.RGBA, n), u = getSupportedFormat(t, t.RGBA, t.RGBA, n), c = getSupportedFormat(t, t.RGBA, t.RGBA, n)), { gl: t, ext: { formatRGBA: l, formatRG: u, formatR: c, halfFloatTexType: n, supportLinearFiltering: o } } } function getSupportedFormat(e, r, t, i) { if (!supportRenderTextureFormat(e, r, t, i)) switch (r) { case e.R16F: return getSupportedFormat(e, e.RG16F, e.RG, i); case e.RG16F: return getSupportedFormat(e, e.RGBA16F, e.RGBA, i); default: return null }return { internalFormat: r, format: t } } function supportRenderTextureFormat(e, r, t, i) { let a = e.createTexture(); e.bindTexture(e.TEXTURE_2D, a), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texImage2D(e.TEXTURE_2D, 0, r, 4, 4, 0, t, i, null); let o = e.createFramebuffer(); return e.bindFramebuffer(e.FRAMEBUFFER, o), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, a, 0), e.checkFramebufferStatus(e.FRAMEBUFFER) == e.FRAMEBUFFER_COMPLETE } function startGUI() { var e = new dat.GUI({ width: 300 }); e.add(config, "DYE_RESOLUTION", { high: 1024, medium: 512, low: 256, "very low": 128 }).name("quality").onFinishChange(initFramebuffers), e.add(config, "SIM_RESOLUTION", { 32: 32, 64: 64, 128: 128, 256: 256 }).name("sim resolution").onFinishChange(initFramebuffers), e.add(config, "DENSITY_DISSIPATION", 0, 4).name("density diffusion"), e.add(config, "VELOCITY_DISSIPATION", 0, 4).name("velocity diffusion"), e.add(config, "PRESSURE", 0, 1).name("pressure"), e.add(config, "CURL", 0, 50).name("vorticity").step(1), e.add(config, "SPLAT_RADIUS", .01, 1).name("splat radius"), e.add(config, "SHADING").name("shading").onFinishChange(updateKeywords), e.add(config, "COLORFUL").name("colorful"), e.add(config, "PAUSED").name("paused").listen(), e.add({ fun() { splatStack.push(parseInt(20 * Math.random()) + 5) } }, "fun").name("Random splats"); let r = e.addFolder("Bloom"); r.add(config, "BLOOM").name("enabled").onFinishChange(updateKeywords), r.add(config, "BLOOM_INTENSITY", .1, 2).name("intensity"), r.add(config, "BLOOM_THRESHOLD", 0, 1).name("threshold"); let t = e.addFolder("Sunrays"); t.add(config, "SUNRAYS").name("enabled").onFinishChange(updateKeywords), t.add(config, "SUNRAYS_WEIGHT", .3, 1).name("weight"); let i = e.addFolder("Capture"); i.addColor(config, "BACK_COLOR").name("background color"), i.add(config, "TRANSPARENT").name("transparent"), i.add({ fun: captureScreenshot }, "fun").name("take screenshot"); let a = e.add({ fun() { window.open("https://github.com/PavelDoGreat/WebGL-Fluid-Simulation") } }, "fun").name("Github"); a.__li.className = "cr function bigFont", a.__li.style.borderLeft = "3px solid #8C8C8C"; let o = document.createElement("span"); a.domElement.parentElement.appendChild(o), o.className = "icon github"; let n = e.add({ fun() { window.open("https://twitter.com/PavelDoGreat") } }, "fun").name("Twitter"); n.__li.className = "cr function bigFont", n.__li.style.borderLeft = "3px solid #8C8C8C"; let l = document.createElement("span"); n.domElement.parentElement.appendChild(l), l.className = "icon twitter"; let u = e.add({ fun() { window.open("https://discordapp.com/invite/CeqZDDE") } }, "fun").name("Discord"); u.__li.className = "cr function bigFont", u.__li.style.borderLeft = "3px solid #8C8C8C"; let c = document.createElement("span"); u.domElement.parentElement.appendChild(c), c.className = "icon discord"; let m = e.add({ fun() { window.open("http://onelink.to/5b58bn") } }, "fun").name("Check out mobile app"); m.__li.className = "cr function appBigFont", m.__li.style.borderLeft = "3px solid #00FF7F"; let s = document.createElement("span"); m.domElement.parentElement.appendChild(s), s.className = "icon app", isMobile() && e.close() } function isMobile() { return /Mobi|Android/i.test(navigator.userAgent) } function captureScreenshot() { let t = getResolution(config.CAPTURE_RESOLUTION), i = createFBO(t.width, t.height, r.formatRGBA.internalFormat, r.formatRGBA.format, r.halfFloatTexType, e.NEAREST); render(i); let a = framebufferToTexture(i); a = normalizeTexture(a, i.width, i.height); let o = textureToCanvas(a, i.width, i.height).toDataURL(); downloadURI("fluid.png", o), URL.revokeObjectURL(o) } function framebufferToTexture(r) { e.bindFramebuffer(e.FRAMEBUFFER, r.fbo); let t = r.width * r.height * 4, i = new Float32Array(t); return e.readPixels(0, 0, r.width, r.height, e.RGBA, e.FLOAT, i), i } function normalizeTexture(e, r, t) { let i = new Uint8Array(e.length), a = 0; for (let o = t - 1; o >= 0; o--)for (let n = 0; n < r; n++) { let l = o * r * 4 + 4 * n; i[l + 0] = 255 * clamp01(e[a + 0]), i[l + 1] = 255 * clamp01(e[a + 1]), i[l + 2] = 255 * clamp01(e[a + 2]), i[l + 3] = 255 * clamp01(e[a + 3]), a += 4 } return i } function clamp01(e) { return Math.min(Math.max(e, 0), 1) } function textureToCanvas(e, r, t) { let i = document.createElement("canvas"), a = i.getContext("2d"); i.width = r, i.height = t; let o = a.createImageData(r, t); return o.data.set(e), a.putImageData(o, 0, 0), i } function downloadURI(e, r) { let t = document.createElement("a"); t.download = e, t.href = r, document.body.appendChild(t), t.click(), document.body.removeChild(t) } isMobile() && (config.DYE_RESOLUTION = 512), r.supportLinearFiltering || (config.DYE_RESOLUTION = 512, config.SHADING = !1, config.BLOOM = !1, config.SUNRAYS = !1); class Material { constructor(e, r) { this.vertexShader = e, this.fragmentShaderSource = r, this.programs = [], this.activeProgram = null, this.uniforms = [] } setKeywords(r) { let t = 0; for (let i = 0; i < r.length; i++)t += hashCode(r[i]); let a = this.programs[t]; if (null == a) { let o = compileShader(e.FRAGMENT_SHADER, this.fragmentShaderSource, r); a = createProgram(this.vertexShader, o), this.programs[t] = a } a != this.activeProgram && (this.uniforms = getUniforms(a), this.activeProgram = a) } bind() { e.useProgram(this.activeProgram) } } class Program { constructor(e, r) { this.uniforms = {}, this.program = createProgram(e, r), this.uniforms = getUniforms(this.program) } bind() { e.useProgram(this.program) } } function createProgram(r, t) { let i = e.createProgram(); return e.attachShader(i, r), e.attachShader(i, t), e.linkProgram(i), e.getProgramParameter(i, e.LINK_STATUS) || console.trace(e.getProgramInfoLog(i)), i } function getUniforms(r) { let t = [], i = e.getProgramParameter(r, e.ACTIVE_UNIFORMS); for (let a = 0; a < i; a++) { let o = e.getActiveUniform(r, a).name; t[o] = e.getUniformLocation(r, o) } return t } function compileShader(r, t, i) { t = addKeywords(t, i); let a = e.createShader(r); return e.shaderSource(a, t), e.compileShader(a), e.getShaderParameter(a, e.COMPILE_STATUS) || console.trace(e.getShaderInfoLog(a)), a } function addKeywords(e, r) { if (null == r) return e; let t = ""; return r.forEach(e => { t += "#define " + e + "\n" }), t + e } const baseVertexShader = compileShader(e.VERTEX_SHADER, `
    precision highp float;

    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;

    void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`), blurVertexShader = compileShader(e.VERTEX_SHADER, `
    precision highp float;

    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform vec2 texelSize;

    void main () {
        vUv = aPosition * 0.5 + 0.5;
        float offset = 1.33333333;
        vL = vUv - texelSize * offset;
        vR = vUv + texelSize * offset;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`), blurShader = compileShader(e.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform sampler2D uTexture;

    void main () {
        vec4 sum = texture2D(uTexture, vUv) * 0.29411764;
        sum += texture2D(uTexture, vL) * 0.35294117;
        sum += texture2D(uTexture, vR) * 0.35294117;
        gl_FragColor = sum;
    }
`), copyShader = compileShader(e.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    uniform sampler2D uTexture;

    void main () {
        gl_FragColor = texture2D(uTexture, vUv);
    }
`), clearShader = compileShader(e.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;

    void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
    }
`), colorShader = compileShader(e.FRAGMENT_SHADER, `
    precision mediump float;

    uniform vec4 color;

    void main () {
        gl_FragColor = color;
    }
`), checkerboardShader = compileShader(e.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float aspectRatio;

    #define SCALE 25.0

    void main () {
        vec2 uv = floor(vUv * SCALE * vec2(aspectRatio, 1.0));
        float v = mod(uv.x + uv.y, 2.0);
        v = v * 0.1 + 0.8;
        gl_FragColor = vec4(vec3(v), 1.0);
    }
`), displayShaderSource = `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform sampler2D uBloom;
    uniform sampler2D uSunrays;
    uniform sampler2D uDithering;
    uniform vec2 ditherScale;
    uniform vec2 texelSize;

    vec3 linearToGamma (vec3 color) {
        color = max(color, vec3(0));
        return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
    }

    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;

    #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;

        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);

        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        vec3 l = vec3(0.0, 0.0, 1.0);

        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
        c *= diffuse;
    #endif

    #ifdef BLOOM
        vec3 bloom = texture2D(uBloom, vUv).rgb;
    #endif

    #ifdef SUNRAYS
        float sunrays = texture2D(uSunrays, vUv).r;
        c *= sunrays;
    #ifdef BLOOM
        bloom *= sunrays;
    #endif
    #endif

    #ifdef BLOOM
        float noise = texture2D(uDithering, vUv * ditherScale).r;
        noise = noise * 2.0 - 1.0;
        bloom += noise / 255.0;
        bloom = linearToGamma(bloom);
        c += bloom;
    #endif

        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
    }
`, bloomPrefilterShader = compileShader(e.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec3 curve;
    uniform float threshold;

    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        float br = max(c.r, max(c.g, c.b));
        float rq = clamp(br - curve.x, 0.0, curve.y);
        rq = curve.z * rq * rq;
        c *= max(rq, br - threshold) / max(br, 0.0001);
        gl_FragColor = vec4(c, 0.0);
    }
`), bloomBlurShader = compileShader(e.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;

    void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        sum *= 0.25;
        gl_FragColor = sum;
    }
`), bloomFinalShader = compileShader(e.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform float intensity;

    void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        sum *= 0.25;
        gl_FragColor = sum * intensity;
    }
`), sunraysMaskShader = compileShader(e.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;

    void main () {
        vec4 c = texture2D(uTexture, vUv);
        float br = max(c.r, max(c.g, c.b));
        c.a = 1.0 - min(max(br * 20.0, 0.0), 0.8);
        gl_FragColor = c;
    }
`), sunraysShader = compileShader(e.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float weight;

    #define ITERATIONS 16

    void main () {
        float Density = 0.3;
        float Decay = 0.95;
        float Exposure = 0.7;

        vec2 coord = vUv;
        vec2 dir = vUv - 0.5;

        dir *= 1.0 / float(ITERATIONS) * Density;
        float illuminationDecay = 1.0;

        float color = texture2D(uTexture, vUv).a;

        for (int i = 0; i < ITERATIONS; i++)
        {
            coord -= dir;
            float col = texture2D(uTexture, coord).a;
            color += col * illuminationDecay * weight;
            illuminationDecay *= Decay;
        }

        gl_FragColor = vec4(color * Exposure, 0.0, 0.0, 1.0);
    }
`), splatShader = compileShader(e.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;

    void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
    }
`), advectionShader = compileShader(e.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform vec2 dyeTexelSize;
    uniform float dt;
    uniform float dissipation;

    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;

        vec2 iuv = floor(st);
        vec2 fuv = fract(st);

        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }

    void main () {
    #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
    #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
    #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
    }`, r.supportLinearFiltering ? null : ["MANUAL_FILTERING"]), divergenceShader = compileShader(e.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;

        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }

        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
`), curlShader = compileShader(e.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
`), vorticityShader = compileShader(e.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;

    void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;

        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;

        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`), pressureShader = compileShader(e.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;

    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
`), gradientSubtractShader = compileShader(e.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`), blit = (e.bindBuffer(e.ARRAY_BUFFER, e.createBuffer()), e.bufferData(e.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), e.STATIC_DRAW), e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, e.createBuffer()), e.bufferData(e.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), e.STATIC_DRAW), e.vertexAttribPointer(0, 2, e.FLOAT, !1, 0, 0), e.enableVertexAttribArray(0), (r, t = !1) => { null == r ? (e.viewport(0, 0, e.drawingBufferWidth, e.drawingBufferHeight), e.bindFramebuffer(e.FRAMEBUFFER, null)) : (e.viewport(0, 0, r.width, r.height), e.bindFramebuffer(e.FRAMEBUFFER, r.fbo)), t && (e.clearColor(0, 0, 0, 0), e.clear(e.COLOR_BUFFER_BIT)), e.drawElements(e.TRIANGLES, 6, e.UNSIGNED_SHORT, 0) }); function CHECK_FRAMEBUFFER_STATUS() { let r = e.checkFramebufferStatus(e.FRAMEBUFFER); r != e.FRAMEBUFFER_COMPLETE && console.trace("Framebuffer error: " + r) } let dye, velocity, divergence, curl, pressure, bloom, bloomFramebuffers = [], sunrays, sunraysTemp, ditheringTexture = createTextureAsync("/v5-3-5/client/images/LDR_LLL1_0.png"); const blurProgram = new Program(blurVertexShader, blurShader), copyProgram = new Program(baseVertexShader, copyShader), clearProgram = new Program(baseVertexShader, clearShader), colorProgram = new Program(baseVertexShader, colorShader), checkerboardProgram = new Program(baseVertexShader, checkerboardShader), bloomPrefilterProgram = new Program(baseVertexShader, bloomPrefilterShader), bloomBlurProgram = new Program(baseVertexShader, bloomBlurShader), bloomFinalProgram = new Program(baseVertexShader, bloomFinalShader), sunraysMaskProgram = new Program(baseVertexShader, sunraysMaskShader), sunraysProgram = new Program(baseVertexShader, sunraysShader), splatProgram = new Program(baseVertexShader, splatShader), advectionProgram = new Program(baseVertexShader, advectionShader), divergenceProgram = new Program(baseVertexShader, divergenceShader), curlProgram = new Program(baseVertexShader, curlShader), vorticityProgram = new Program(baseVertexShader, vorticityShader), pressureProgram = new Program(baseVertexShader, pressureShader), gradienSubtractProgram = new Program(baseVertexShader, gradientSubtractShader), displayMaterial = new Material(baseVertexShader, displayShaderSource); function initFramebuffers() { let t = getResolution(config.SIM_RESOLUTION), i = getResolution(config.DYE_RESOLUTION), a = r.halfFloatTexType, o = r.formatRGBA, n = r.formatRG, l = r.formatR, u = r.supportLinearFiltering ? e.LINEAR : e.NEAREST; e.disable(e.BLEND), dye = null == dye ? createDoubleFBO(i.width, i.height, o.internalFormat, o.format, a, u) : resizeDoubleFBO(dye, i.width, i.height, o.internalFormat, o.format, a, u), velocity = null == velocity ? createDoubleFBO(t.width, t.height, n.internalFormat, n.format, a, u) : resizeDoubleFBO(velocity, t.width, t.height, n.internalFormat, n.format, a, u), divergence = createFBO(t.width, t.height, l.internalFormat, l.format, a, e.NEAREST), curl = createFBO(t.width, t.height, l.internalFormat, l.format, a, e.NEAREST), pressure = createDoubleFBO(t.width, t.height, l.internalFormat, l.format, a, e.NEAREST), initBloomFramebuffers(), initSunraysFramebuffers() } function initBloomFramebuffers() { let t = getResolution(config.BLOOM_RESOLUTION), i = r.halfFloatTexType, a = r.formatRGBA, o = r.supportLinearFiltering ? e.LINEAR : e.NEAREST; bloom = createFBO(t.width, t.height, a.internalFormat, a.format, i, o), bloomFramebuffers.length = 0; for (let n = 0; n < config.BLOOM_ITERATIONS; n++) { let l = t.width >> n + 1, u = t.height >> n + 1; if (l < 2 || u < 2) break; let c = createFBO(l, u, a.internalFormat, a.format, i, o); bloomFramebuffers.push(c) } } function initSunraysFramebuffers() { let t = getResolution(config.SUNRAYS_RESOLUTION), i = r.halfFloatTexType, a = r.formatR, o = r.supportLinearFiltering ? e.LINEAR : e.NEAREST; sunrays = createFBO(t.width, t.height, a.internalFormat, a.format, i, o), sunraysTemp = createFBO(t.width, t.height, a.internalFormat, a.format, i, o) } function createFBO(r, t, i, a, o, n) { e.activeTexture(e.TEXTURE0); let l = e.createTexture(); e.bindTexture(e.TEXTURE_2D, l), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, n), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, n), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texImage2D(e.TEXTURE_2D, 0, i, r, t, 0, a, o, null); let u = e.createFramebuffer(); return e.bindFramebuffer(e.FRAMEBUFFER, u), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, l, 0), e.viewport(0, 0, r, t), e.clear(e.COLOR_BUFFER_BIT), { texture: l, fbo: u, width: r, height: t, texelSizeX: 1 / r, texelSizeY: 1 / t, attach: r => (e.activeTexture(e.TEXTURE0 + r), e.bindTexture(e.TEXTURE_2D, l), r) } } function createDoubleFBO(e, r, t, i, a, o) { let n = createFBO(e, r, t, i, a, o), l = createFBO(e, r, t, i, a, o); return { width: e, height: r, texelSizeX: n.texelSizeX, texelSizeY: n.texelSizeY, get read() { return n }, set read(value) { n = value }, get write() { return l }, set write(value) { l = value }, swap() { let e = n; n = l, l = e } } } function resizeFBO(r, t, i, a, o, n, l) { let u = createFBO(t, i, a, o, n, l); return copyProgram.bind(), e.uniform1i(copyProgram.uniforms.uTexture, r.attach(0)), blit(u), u } function resizeDoubleFBO(e, r, t, i, a, o, n) { return e.width == r && e.height == t || (e.read = resizeFBO(e.read, r, t, i, a, o, n), e.write = createFBO(r, t, i, a, o, n), e.width = r, e.height = t, e.texelSizeX = 1 / r, e.texelSizeY = 1 / t), e } function createTextureAsync(r) { let t = e.createTexture(); e.bindTexture(e.TEXTURE_2D, t), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.REPEAT), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.REPEAT), e.texImage2D(e.TEXTURE_2D, 0, e.RGB, 1, 1, 0, e.RGB, e.UNSIGNED_BYTE, new Uint8Array([255, 255, 255])); let i = { texture: t, width: 1, height: 1, attach: r => (e.activeTexture(e.TEXTURE0 + r), e.bindTexture(e.TEXTURE_2D, t), r) }, a = new Image; return a.onload = () => { i.width = a.width, i.height = a.height, e.bindTexture(e.TEXTURE_2D, t), e.texImage2D(e.TEXTURE_2D, 0, e.RGB, e.RGB, e.UNSIGNED_BYTE, a) }, a.src = r, i } function updateKeywords() { let e = []; config.SHADING && e.push("SHADING"), config.BLOOM && e.push("BLOOM"), config.SUNRAYS && e.push("SUNRAYS"), displayMaterial.setKeywords(e) } updateKeywords(), initFramebuffers(); let lastUpdateTime = Date.now(), colorUpdateTimer = 0; function update() { let e = calcDeltaTime(); resizeCanvas() && initFramebuffers(), updateColors(e), applyInputs(), config.PAUSED || step(e), render(null), requestAnimationFrame(update) } function calcDeltaTime() { let e = Date.now(), r = (e - lastUpdateTime) / 1e3; return r = Math.min(r, .016666), lastUpdateTime = e, r } function resizeCanvas() { let e = scaleByPixelRatio(canvas.clientWidth), r = scaleByPixelRatio(canvas.clientHeight); return (canvas.width != e || canvas.height != r) && (canvas.width = e, canvas.height = r, !0) } function updateColors(e) { config.COLORFUL && (colorUpdateTimer += e * config.COLOR_UPDATE_SPEED) >= 1 && (colorUpdateTimer = wrap(colorUpdateTimer, 0, 1), pointers.forEach(e => { e.color = generateColor() })) } function applyInputs() { splatStack.length > 0 && multipleSplats(splatStack.pop()), pointers.forEach(e => { e.moved && (e.moved = !1, splatPointer(e)) }) } function step(t) { e.disable(e.BLEND), curlProgram.bind(), e.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY), e.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0)), blit(curl), vorticityProgram.bind(), e.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY), e.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0)), e.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1)), e.uniform1f(vorticityProgram.uniforms.curl, config.CURL), e.uniform1f(vorticityProgram.uniforms.dt, t), blit(velocity.write), velocity.swap(), divergenceProgram.bind(), e.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY), e.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0)), blit(divergence), clearProgram.bind(), e.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0)), e.uniform1f(clearProgram.uniforms.value, config.PRESSURE), blit(pressure.write), pressure.swap(), pressureProgram.bind(), e.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY), e.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0)); for (let i = 0; i < config.PRESSURE_ITERATIONS; i++)e.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1)), blit(pressure.write), pressure.swap(); gradienSubtractProgram.bind(), e.uniform2f(gradienSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY), e.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0)), e.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1)), blit(velocity.write), velocity.swap(), advectionProgram.bind(), e.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY), r.supportLinearFiltering || e.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY); let a = velocity.read.attach(0); e.uniform1i(advectionProgram.uniforms.uVelocity, a), e.uniform1i(advectionProgram.uniforms.uSource, a), e.uniform1f(advectionProgram.uniforms.dt, t), e.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION), blit(velocity.write), velocity.swap(), r.supportLinearFiltering || e.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY), e.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0)), e.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1)), e.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION), blit(dye.write), dye.swap() } function render(r) { config.BLOOM && applyBloom(dye.read, bloom), config.SUNRAYS && (applySunrays(dye.read, dye.write, sunrays), blur(sunrays, sunraysTemp, 1)), null != r && config.TRANSPARENT ? e.disable(e.BLEND) : (e.blendFunc(e.ONE, e.ONE_MINUS_SRC_ALPHA), e.enable(e.BLEND)), config.TRANSPARENT || drawColor(r, normalizeColor(config.BACK_COLOR)), null == r && config.TRANSPARENT && drawCheckerboard(r), drawDisplay(r) } function drawColor(r, t) { colorProgram.bind(), e.uniform4f(colorProgram.uniforms.color, t.r, t.g, t.b, 1), blit(r) } function drawCheckerboard(r) { checkerboardProgram.bind(), e.uniform1f(checkerboardProgram.uniforms.aspectRatio, canvas.width / canvas.height), blit(r) } function drawDisplay(r) { let t = null == r ? e.drawingBufferWidth : r.width, i = null == r ? e.drawingBufferHeight : r.height; if (displayMaterial.bind(), config.SHADING && e.uniform2f(displayMaterial.uniforms.texelSize, 1 / t, 1 / i), e.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0)), config.BLOOM) { e.uniform1i(displayMaterial.uniforms.uBloom, bloom.attach(1)), e.uniform1i(displayMaterial.uniforms.uDithering, ditheringTexture.attach(2)); let a = getTextureScale(ditheringTexture, t, i); e.uniform2f(displayMaterial.uniforms.ditherScale, a.x, a.y) } config.SUNRAYS && e.uniform1i(displayMaterial.uniforms.uSunrays, sunrays.attach(3)), blit(r) } function applyBloom(r, t) { if (bloomFramebuffers.length < 2) return; let i = t; e.disable(e.BLEND), bloomPrefilterProgram.bind(); let a = config.BLOOM_THRESHOLD * config.BLOOM_SOFT_KNEE + 1e-4, o = config.BLOOM_THRESHOLD - a; e.uniform3f(bloomPrefilterProgram.uniforms.curve, o, 2 * a, .25 / a), e.uniform1f(bloomPrefilterProgram.uniforms.threshold, config.BLOOM_THRESHOLD), e.uniform1i(bloomPrefilterProgram.uniforms.uTexture, r.attach(0)), blit(i), bloomBlurProgram.bind(); for (let n = 0; n < bloomFramebuffers.length; n++) { let l = bloomFramebuffers[n]; e.uniform2f(bloomBlurProgram.uniforms.texelSize, i.texelSizeX, i.texelSizeY), e.uniform1i(bloomBlurProgram.uniforms.uTexture, i.attach(0)), blit(l), i = l } e.blendFunc(e.ONE, e.ONE), e.enable(e.BLEND); for (let u = bloomFramebuffers.length - 2; u >= 0; u--) { let c = bloomFramebuffers[u]; e.uniform2f(bloomBlurProgram.uniforms.texelSize, i.texelSizeX, i.texelSizeY), e.uniform1i(bloomBlurProgram.uniforms.uTexture, i.attach(0)), e.viewport(0, 0, c.width, c.height), blit(c), i = c } e.disable(e.BLEND), bloomFinalProgram.bind(), e.uniform2f(bloomFinalProgram.uniforms.texelSize, i.texelSizeX, i.texelSizeY), e.uniform1i(bloomFinalProgram.uniforms.uTexture, i.attach(0)), e.uniform1f(bloomFinalProgram.uniforms.intensity, config.BLOOM_INTENSITY), blit(t) } function applySunrays(r, t, i) { e.disable(e.BLEND), sunraysMaskProgram.bind(), e.uniform1i(sunraysMaskProgram.uniforms.uTexture, r.attach(0)), blit(t), sunraysProgram.bind(), e.uniform1f(sunraysProgram.uniforms.weight, config.SUNRAYS_WEIGHT), e.uniform1i(sunraysProgram.uniforms.uTexture, t.attach(0)), blit(i) } function blur(r, t, i) { blurProgram.bind(); for (let a = 0; a < i; a++)e.uniform2f(blurProgram.uniforms.texelSize, r.texelSizeX, 0), e.uniform1i(blurProgram.uniforms.uTexture, r.attach(0)), blit(t), e.uniform2f(blurProgram.uniforms.texelSize, 0, r.texelSizeY), e.uniform1i(blurProgram.uniforms.uTexture, t.attach(0)), blit(r) } function splatPointer(e) { let r = e.deltaX * config.SPLAT_FORCE, t = e.deltaY * config.SPLAT_FORCE; splat(e.texcoordX, e.texcoordY, r, t, e.color) } function multipleSplats(e) { for (let r = 0; r < e; r++) { let t = generateColor(); t.r *= 10, t.g *= 10, t.b *= 10; let i = Math.random(), a = Math.random(), o = 1e3 * (Math.random() - .5), n = 1e3 * (Math.random() - .5); splat(i, a, o, n, t) } } function splat(r, t, i, a, o) { splatProgram.bind(), e.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0)), e.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height), e.uniform2f(splatProgram.uniforms.point, r, t), e.uniform3f(splatProgram.uniforms.color, i, a, 0), e.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100)), blit(velocity.write), velocity.swap(), e.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0)), e.uniform3f(splatProgram.uniforms.color, o.r, o.g, o.b), blit(dye.write), dye.swap() } function correctRadius(e) { let r = canvas.width / canvas.height; return r > 1 && (e *= r), e } function updatePointerDownData(e, r, t, i) { e.id = r, e.down = !0, e.moved = !1, e.texcoordX = t / canvas.width, e.texcoordY = 1 - i / canvas.height, e.prevTexcoordX = e.texcoordX, e.prevTexcoordY = e.texcoordY, e.deltaX = 0, e.deltaY = 0, e.color = generateColor() } function updatePointerMoveData(e, r, t) { e.prevTexcoordX = e.texcoordX, e.prevTexcoordY = e.texcoordY, e.texcoordX = r / canvas.width, e.texcoordY = 1 - t / canvas.height, e.deltaX = correctDeltaX(e.texcoordX - e.prevTexcoordX), e.deltaY = correctDeltaY(e.texcoordY - e.prevTexcoordY), e.moved = Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0 } function updatePointerUpData(e) { e.down = !1 } function correctDeltaX(e) { let r = canvas.width / canvas.height; return r < 1 && (e *= r), e } function correctDeltaY(e) { let r = canvas.width / canvas.height; return r > 1 && (e /= r), e } function generateColor() { let e = HSVtoRGB(Math.random(), 1, 1); return e.r *= .15, e.g *= .15, e.b *= .15, e } function HSVtoRGB(e, r, t) { let i, a, o, n, l, u, c, m; switch (n = Math.floor(6 * e), l = 6 * e - n, u = t * (1 - r), c = t * (1 - l * r), m = t * (1 - (1 - l) * r), n % 6) { case 0: i = t, a = m, o = u; break; case 1: i = c, a = t, o = u; break; case 2: i = u, a = t, o = m; break; case 3: i = u, a = c, o = t; break; case 4: i = m, a = u, o = t; break; case 5: i = t, a = u, o = c }return { r: i, g: a, b: o } } function normalizeColor(e) { return { r: e.r / 255, g: e.g / 255, b: e.b / 255 } } function wrap(e, r, t) { let i = t - r; return 0 == i ? r : (e - r) % i + r } function getResolution(r) { let t = e.drawingBufferWidth / e.drawingBufferHeight; t < 1 && (t = 1 / t); let i = Math.round(r), a = Math.round(r * t); return e.drawingBufferWidth > e.drawingBufferHeight ? { width: a, height: i } : { width: i, height: a } } function getTextureScale(e, r, t) { return { x: r / e.width, y: t / e.height } } function scaleByPixelRatio(e) { return Math.floor(e * (window.devicePixelRatio || 1)) } function hashCode(e) { if (0 == e.length) return 0; let r = 0; for (let t = 0; t < e.length; t++)r = (r << 5) - r + e.charCodeAt(t), r |= 0; return r } update(), window.addEventListener("mousedown", e => { let r = scaleByPixelRatio(e.x), t = scaleByPixelRatio(e.y), i = pointers.find(e => -1 == e.id); null == i && (i = new pointerPrototype), updatePointerDownData(i, -1, r, t), splatStack.push(1) }), window.addEventListener("mousemove", e => { let r = pointers[0]; if (!r.down) return; let t = scaleByPixelRatio(e.x), i = scaleByPixelRatio(e.y); updatePointerMoveData(r, t, i) }), window.addEventListener("mouseup", () => { updatePointerUpData(pointers[0]) }), canvas.addEventListener("touchstart", e => { e.preventDefault(); let r = e.targetTouches; for (; r.length >= pointers.length;)pointers.push(new pointerPrototype); for (let t = 0; t < r.length; t++) { let i = scaleByPixelRatio(r[t].pageX), a = scaleByPixelRatio(r[t].pageY); updatePointerDownData(pointers[t + 1], r[t].identifier, i, a) } splatStack.push(1) }), canvas.addEventListener("touchmove", e => { e.preventDefault(); let r = e.targetTouches; for (let t = 0; t < r.length; t++) { let i = pointers[t + 1]; if (!i.down) continue; let a = scaleByPixelRatio(r[t].pageX), o = scaleByPixelRatio(r[t].pageY); updatePointerMoveData(i, a, o) } }, !1), window.addEventListener("touchend", e => { let r = e.changedTouches; for (let t = 0; t < r.length; t++) { let i = pointers.find(e => e.id == r[t].identifier); null != i && updatePointerUpData(i) } });
}
