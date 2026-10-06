/**
 * Made with 💛 by Karim Saif
 * Created and customized for Framer by Karim Saif
 *
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 800
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
import {
    addPropertyControls,
    ControlType,
    useIsStaticRenderer,
    useReducedMotion,
} from "framer"

const COMPONENT_AUTHOR = "Karim Saif"
const MAX_DPR = 2
const MAX_PIXELS = 4_000_000

const PUFF_UP = 0.34
const PUFF_DOWN = 0.19
const ERODE = 0.7
const SHADOW_STEP = 0.085
const NEAR_CELL = 1.05
const FAR_CELL = 2.15
const FAR_MIX = 0.55
const NEAR_DRIFT = 0.055
const FAR_DRIFT = 0.026
const CIRRUS_DRIFT = 0.014
const PUFF_WMAX = 2.15
const SHADE_BLEND = 12.0

const VERT_SRC = `
attribute vec2 a_pos;

void main() {
    gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG_SRC = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uNearX;
uniform float uFarX;
uniform float uCirrusX;
uniform float uCoverage;
uniform float uSize;
uniform float uSoftness;
uniform float uShadow;
uniform float uCirrus;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uCloud;
uniform vec4 uGlow;
uniform vec2 uSun;
uniform vec2 uParallax;

vec2 hash22(vec2 p) {
    vec3 q = fract(
        vec3(p.xyx) *
        vec3(0.1031, 0.1030, 0.0973)
    );

    q += dot(q, q.yzx + 33.33);

    return fract(
        (q.xx + q.yz) * q.zy
    );
}

float hash12(vec2 p) {
    vec3 q = fract(
        vec3(p.xyx) * 0.1031
    );

    q += dot(q, q.yzx + 33.33);

    return fract(
        (q.x + q.y) * q.z
    );
}

float vnoise(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);

    f = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(
            hash12(i),
            hash12(i + vec2(1.0, 0.0)),
            f.x
        ),
        mix(
            hash12(i + vec2(0.0, 1.0)),
            hash12(i + vec2(1.0, 1.0)),
            f.x
        ),
        f.y
    );
}

float fbm(vec2 p) {
    float a = 0.5;
    float s = 0.0;

    for (int i = 0; i < 4; i++) {
        s += a * vnoise(p);
        p *= 2.03;
        a *= 0.5;
    }

    return s;
}

vec2 blobs(vec2 uv, float seed) {
    vec2 id = floor(uv);
    vec2 f = fract(uv);

    float best = -1e4;
    float wsum = 0.0;
    float ysum = 0.0;

    float wMax = min(
        ${PUFF_WMAX.toFixed(3)},
        0.72 * uSize
    );

    float reach = min(
        2.0,
        ceil(wMax + 0.85) - 1.0
    );

    for (int j = -2; j <= 2; j++) {
        for (int i = -2; i <= 2; i++) {
            vec2 o = vec2(
                float(i),
                float(j)
            );

            if (
                max(abs(o.x), abs(o.y)) >
                reach
            ) {
                continue;
            }

            vec2 h = hash22(
                id + o + seed
            );

            if (
                fract(h.x * 37.1) >
                uCoverage
            ) {
                continue;
            }

            vec2 c =
                o +
                0.15 +
                h * 0.7;

            float w = min(
                ${PUFF_WMAX.toFixed(3)},
                (
                    0.30 +
                    0.42 *
                    fract(h.y * 19.7)
                ) *
                uSize
            );

            vec2 d = f - c;

            float ry =
                (
                    d.y > 0.0
                        ? ${PUFF_UP.toFixed(3)}
                        : ${PUFF_DOWN.toFixed(3)}
                ) *
                uSize *
                (
                    0.8 +
                    0.5 *
                    fract(h.y * 7.3)
                );

            float e = length(
                vec2(
                    d.x / max(w, 1e-3),
                    d.y / max(ry, 1e-3)
                )
            );

            float val = 1.0 - e;
            float yN =
                d.y /
                max(ry, 1e-3);

            if (val > best) {
                float k = exp(
                    ${SHADE_BLEND.toFixed(1)} *
                    (best - val)
                );

                wsum =
                    wsum * k + 1.0;

                ysum =
                    ysum * k + yN;

                best = val;
            } else {
                float g = exp(
                    ${SHADE_BLEND.toFixed(1)} *
                    (val - best)
                );

                wsum += g;
                ysum += g * yN;
            }
        }
    }

    return vec2(
        best,
        ysum / max(wsum, 1e-4)
    );
}

vec2 cloudField(
    vec2 uv,
    float seed,
    float detailScale
) {
    vec2 b = blobs(
        uv,
        seed
    );

    float n =
        fbm(
            uv * detailScale +
            seed * 3.1
        ) * 0.72 +

        fbm(
            uv *
            detailScale *
            3.3 +
            seed * 7.7
        ) * 0.28;

    return vec2(
        b.x -
        (1.0 - n) *
        ${ERODE.toFixed(3)},
        b.y
    );
}

vec3 shadeCloud(
    float dyNorm,
    vec3 sky
) {
    float t = smoothstep(
        -0.95,
        0.25,
        dyNorm
    );

    vec3 base = mix(
        uCloud * 0.52,
        sky,
        0.34
    );

    return mix(
        mix(
            uCloud,
            base,
            uShadow
        ),
        uCloud,
        t
    );
}

void main() {
    vec2 frag =
        gl_FragCoord.xy /
        max(uRes.y, 1.0);

    float aspect =
        uRes.x /
        max(uRes.y, 1.0);

    vec2 p = vec2(
        frag.x,
        frag.y
    );

    vec3 sky = mix(
        uHorizon,
        uZenith,
        smoothstep(
            -0.15,
            1.05,
            p.y
        )
    );

    vec2 sunP = vec2(
        uSun.x * aspect,
        uSun.y
    );

    float sd = length(
        p - sunP
    );

    sky +=
        uGlow.rgb *
        uGlow.a *
        exp(-sd * 3.4) *
        0.30;

    vec3 col = sky;

    if (uCirrus > 0.0) {
        vec2 cuv = vec2(
            p.x * 1.4 + uCirrusX,
            p.y * 5.5
        );

        float veil =
            fbm(cuv) *
            fbm(
                cuv * 2.3 + 9.0
            );

        veil =
            smoothstep(
                0.24,
                0.55,
                veil
            ) *
            smoothstep(
                0.15,
                0.7,
                p.y
            );

        col = mix(
            col,
            uCloud,
            veil *
            uCirrus *
            0.5
        );
    }

    vec2 fuv =
        vec2(
            p.x + uFarX,
            p.y
        ) *
        ${FAR_CELL.toFixed(3)} +
        uParallax * 0.4;

    vec2 fd = cloudField(
        fuv,
        17.0,
        11.0
    );

    float fa = clamp(
        fd.x * uSoftness,
        0.0,
        1.0
    );

    if (fa > 0.0) {
        vec3 lit = shadeCloud(
            fd.y,
            sky
        );

        col = mix(
            col,
            mix(
                lit,
                sky,
                ${FAR_MIX.toFixed(3)}
            ),
            fa
        );
    }

    vec2 nuv =
        vec2(
            p.x + uNearX,
            p.y
        ) *
        ${NEAR_CELL.toFixed(3)} +
        uParallax;

    vec2 nd = cloudField(
        nuv,
        3.0,
        8.5
    );

    float na = clamp(
        nd.x * uSoftness,
        0.0,
        1.0
    );

    if (na > 0.0) {
        vec3 lit = shadeCloud(
            nd.y,
            sky
        );

        float above = clamp(
            cloudField(
                nuv +
                vec2(
                    0.0,
                    ${SHADOW_STEP.toFixed(3)}
                ),
                3.0,
                8.5
            ).x *
            uSoftness,
            0.0,
            1.0
        );

        lit *=
            1.0 -
            0.18 *
            uShadow *
            above;

        lit +=
            uGlow.rgb *
            uGlow.a *
            0.22 *
            exp(
                -length(
                    p - sunP
                ) * 1.6
            );

        col = mix(
            col,
            lit,
            na
        );
    }

    gl_FragColor = vec4(
        col,
        1.0
    );
}
`

type RGBA = [
    number,
    number,
    number,
    number,
]

interface Clouds {
    softness?: number
    shadow?: number
    cirrus?: number
}

interface Sun {
    x?: number
    y?: number
    glow?: string
}

interface Pointer {
    parallax?: number
    wind?: number
    damping?: number
}

interface Props {
    style?: React.CSSProperties
    background?: string
    baseColor?: string
    accentColor?: string
    density?: number
    speed?: number
    size?: number
    clouds?: Clouds
    sun?: Sun
    pointer?: Pointer
}

interface RenderValues {
    zenith: RGBA
    horizon: RGBA
    cloud: RGBA
    glow: RGBA
    coverage: number
    speed: number
    size: number
    softness: number
    shadow: number
    cirrus: number
    sunX: number
    sunY: number
    parallax: number
    wind: number
    damping: number
}

interface GPUResources {
    program: WebGLProgram
    vertexShader: WebGLShader
    fragmentShader: WebGLShader
    buffer: WebGLBuffer
    position: number
    uniforms: {
        res: WebGLUniformLocation | null
        nearX: WebGLUniformLocation | null
        farX: WebGLUniformLocation | null
        cirrusX: WebGLUniformLocation | null
        coverage: WebGLUniformLocation | null
        size: WebGLUniformLocation | null
        softness: WebGLUniformLocation | null
        shadow: WebGLUniformLocation | null
        cirrus: WebGLUniformLocation | null
        zenith: WebGLUniformLocation | null
        horizon: WebGLUniformLocation | null
        cloud: WebGLUniformLocation | null
        glow: WebGLUniformLocation | null
        sun: WebGLUniformLocation | null
        parallax: WebGLUniformLocation | null
    }
}

const CLOUD_DEFAULTS: Required<Clouds> = {
    softness: 100,
    shadow: 100,
    cirrus: 45,
}

const SUN_DEFAULTS: Required<Sun> = {
    x: 78,
    y: 92,
    glow: "rgba(232, 243, 255, 0.9)",
}

const POINTER_DEFAULTS: Required<Pointer> = {
    parallax: 100,
    wind: 100,
    damping: 20,
}

const COLOR_CACHE =
    new Map<string, RGBA>()

function clampN(
    value: number,
    min: number,
    max: number
) {
    return Math.min(
        max,
        Math.max(min, value)
    )
}

function num(
    value: unknown,
    fallback: number
) {
    return (
        typeof value === "number" &&
        Number.isFinite(value)
    )
        ? value
        : fallback
}

function parseColor(
    input: string | undefined,
    fallback: RGBA
): RGBA {
    if (
        typeof input !== "string" ||
        !input.trim()
    ) {
        return fallback
    }

    const key = input.trim()

    const cached =
        COLOR_CACHE.get(key)

    if (cached) {
        return cached
    }

    let result: RGBA | null =
        null

    if (key.startsWith("#")) {
        let hex = key.slice(1)

        if (
            hex.length === 3 ||
            hex.length === 4
        ) {
            hex =
                hex[0] +
                hex[0] +
                hex[1] +
                hex[1] +
                hex[2] +
                hex[2] +
                (
                    hex.length === 4
                        ? hex[3] +
                          hex[3]
                        : ""
                )
        }

        if (
            hex.length === 6 ||
            hex.length === 8
        ) {
            const r =
                parseInt(
                    hex.slice(0, 2),
                    16
                )

            const g =
                parseInt(
                    hex.slice(2, 4),
                    16
                )

            const b =
                parseInt(
                    hex.slice(4, 6),
                    16
                )

            const a =
                hex.length === 8
                    ? parseInt(
                          hex.slice(
                              6,
                              8
                          ),
                          16
                      ) / 255
                    : 1

            if (
                Number.isFinite(r) &&
                Number.isFinite(g) &&
                Number.isFinite(b) &&
                Number.isFinite(a)
            ) {
                result = [
                    r / 255,
                    g / 255,
                    b / 255,
                    a,
                ]
            }
        }
    } else {
        const match =
            key.match(
                /[\d.]+/g
            )

        if (
            match &&
            match.length >= 3
        ) {
            result = [
                clampN(
                    Number(match[0]),
                    0,
                    255
                ) / 255,

                clampN(
                    Number(match[1]),
                    0,
                    255
                ) / 255,

                clampN(
                    Number(match[2]),
                    0,
                    255
                ) / 255,

                match.length >= 4
                    ? clampN(
                          Number(
                              match[3]
                          ),
                          0,
                          1
                      )
                    : 1,
            ]
        }
    }

    const output =
        result ?? fallback

    COLOR_CACHE.set(
        key,
        output
    )

    return output
}

function compileShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string
) {
    const shader =
        gl.createShader(type)

    if (!shader) {
        return null
    }

    gl.shaderSource(
        shader,
        source
    )

    gl.compileShader(shader)

    if (
        !gl.getShaderParameter(
            shader,
            gl.COMPILE_STATUS
        )
    ) {
        console.error(
            `${COMPONENT_AUTHOR} Cloud Sky shader:`,
            gl.getShaderInfoLog(
                shader
            )
        )

        gl.deleteShader(shader)

        return null
    }

    return shader
}

function createResources(
    gl: WebGLRenderingContext
): GPUResources | null {
    const vertexShader =
        compileShader(
            gl,
            gl.VERTEX_SHADER,
            VERT_SRC
        )

    if (!vertexShader) {
        return null
    }

    const fragmentShader =
        compileShader(
            gl,
            gl.FRAGMENT_SHADER,
            FRAG_SRC
        )

    if (!fragmentShader) {
        gl.deleteShader(
            vertexShader
        )

        return null
    }

    const program =
        gl.createProgram()

    if (!program) {
        gl.deleteShader(
            vertexShader
        )

        gl.deleteShader(
            fragmentShader
        )

        return null
    }

    gl.attachShader(
        program,
        vertexShader
    )

    gl.attachShader(
        program,
        fragmentShader
    )

    gl.linkProgram(program)

    if (
        !gl.getProgramParameter(
            program,
            gl.LINK_STATUS
        )
    ) {
        console.error(
            `${COMPONENT_AUTHOR} Cloud Sky link:`,
            gl.getProgramInfoLog(
                program
            )
        )

        gl.deleteProgram(
            program
        )

        gl.deleteShader(
            vertexShader
        )

        gl.deleteShader(
            fragmentShader
        )

        return null
    }

    const buffer =
        gl.createBuffer()

    if (!buffer) {
        gl.deleteProgram(
            program
        )

        gl.deleteShader(
            vertexShader
        )

        gl.deleteShader(
            fragmentShader
        )

        return null
    }

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        buffer
    )

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -1,
            -1,
            3,
            -1,
            -1,
            3,
        ]),
        gl.STATIC_DRAW
    )

    const position =
        gl.getAttribLocation(
            program,
            "a_pos"
        )

    if (position < 0) {
        gl.deleteBuffer(buffer)

        gl.deleteProgram(
            program
        )

        gl.deleteShader(
            vertexShader
        )

        gl.deleteShader(
            fragmentShader
        )

        return null
    }

    return {
        program,
        vertexShader,
        fragmentShader,
        buffer,
        position,

        uniforms: {
            res:
                gl.getUniformLocation(
                    program,
                    "uRes"
                ),

            nearX:
                gl.getUniformLocation(
                    program,
                    "uNearX"
                ),

            farX:
                gl.getUniformLocation(
                    program,
                    "uFarX"
                ),

            cirrusX:
                gl.getUniformLocation(
                    program,
                    "uCirrusX"
                ),

            coverage:
                gl.getUniformLocation(
                    program,
                    "uCoverage"
                ),

            size:
                gl.getUniformLocation(
                    program,
                    "uSize"
                ),

            softness:
                gl.getUniformLocation(
                    program,
                    "uSoftness"
                ),

            shadow:
                gl.getUniformLocation(
                    program,
                    "uShadow"
                ),

            cirrus:
                gl.getUniformLocation(
                    program,
                    "uCirrus"
                ),