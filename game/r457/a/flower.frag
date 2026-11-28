#version 300 es
precision highp float;
uniform sampler2D uBase;
uniform vec4 uPage;  // top-left of actual texture, including gutter; width, height
uniform vec4 uCover; // world left, top, right, bottom of non-overlapping page interior
in vec2 vWorld;
in vec2 vShift;
out vec4 color;
void main() {
    if (all(equal(vShift, vec2(0.0))) ||
        any(lessThan(vWorld, uCover.xy)) || any(greaterThanEqual(vWorld, uCover.zw))) discard;
    color = texture(uBase, (vWorld + vShift - uPage.xy) / uPage.zw);
}
