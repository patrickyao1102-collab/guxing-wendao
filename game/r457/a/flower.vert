#version 300 es
precision highp float;
precision highp int;
uniform highp sampler2D uWeights;
uniform ivec4 uBlock; // top-left world x, y; vertex columns; first byte
uniform vec4 uCamera; // top-left world x, y; view width, height
uniform float uPhase; // 2*pi * ((worldSeconds mod 8) / 8)
out vec2 vWorld;
out vec2 vShift;

float gust(float angle) {
    float k = 0.5 + 0.5 * cos(angle);
    k *= k;
    k *= k;
    return k * k;
}

void main() {
    int col = gl_VertexID / 2;
    int row = gl_InstanceID + (gl_VertexID & 1);
    int addr = uBlock.w + row * uBlock.z + col;
    float flex = texelFetch(uWeights, ivec2(addr & 255, addr >> 8), 0).r;
    vec2 p = vec2(uBlock.xy + 10 * ivec2(col, row));
    vWorld = p;
    vShift = vec2(0.0);
    if (flex > 0.0 && uPhase != 0.0) {
        float a = -0.0038 * p.x + 0.0041 * p.y + 0.42 * sin(0.009 * p.y - 0.005 * p.x);
        float b =  0.0062 * p.y - 0.0080 * p.x;
        float f = -0.0340 * p.x + 0.0260 * p.y;
        float g = -0.0017 * p.x - 0.00038 * p.y + 0.7;
        float pulse = gust(uPhase + g) - gust(g);
        float sway = sin(3.0 * uPhase + a) - sin(a);
        float drift = sin(2.0 * uPhase + b) - sin(b);
        float tremble = sin(8.0 * uPhase + f) - sin(f);
        vShift.x = flex * (3.65 * sway + 1.25 * drift + 3.15 * pulse + 0.62 * tremble);
        vShift.y = flex * (0.86 * (cos(3.0 * uPhase + a) - cos(a)) + 0.34 * tremble - 0.32 * pulse);
    }
    vec2 screen = (p - uCamera.xy) / uCamera.zw;
    gl_Position = vec4(screen.x * 2.0 - 1.0, 1.0 - screen.y * 2.0, 0.0, 1.0);
}
