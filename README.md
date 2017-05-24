# A-Frame HTML Shader

A shader to render 2D HTML and CSS to a texture for [A-Frame](https://aframe.io).

Inspired by:

- [@scenevr](https://github.com/scenevr)'s [htmltexture-component](https://github.com/scenevr/htmltexture-component)
- [@niklasvh](https://github.com/niklasvh)'s [html2canvas](https://github.com/niklasvh/html2canvas)

**[DEMO](https://mayognaise.github.io/aframe-html-shader/basic/index.html)**

![example](example.gif)

**The screenshot of the HTML element is done via [`html2canvas`](https://html2canvas.hertzen.com/). To learn more about the library, check out [`html2canvas`'s documentation](https://html2canvas.hertzen.com/documentation.html)**

## Properties

- A-Frame's basic material properties still supported (e.g., `side`, `transparent`).
- `width` and `height` are sizes to capture. For example, if the HTML element's dimensions are `640x480` and `width: 200; height: 100`, then the rendered HTML canvas will be cropped to 200px width and 100px height from the left-top position.
- `fps` is the framerate to render per second. If we only need to render once and be static, we can keep the value at `0`.
- `ratio` lets us use the HTML element's natural aspect ratio. If we keep the value as `null`, the generated canvas will scaled for fit to the entity's geometry. If we set `ratio: width`, the geometry's height will be changed to match the HTML element's ratio, and vice-versa for `ratio: height`.

| Property | Description                                                                                                                                                                       | Default Value   |
| -------- | -----------                                                                                                                                                                       | -------------   |
| target   | DOM element to render, given by a CSS selector (e.g., `#foo`).                                                                                                                    | null            |
| width    | Width to capture.                                                                                                                                                                 | Target's width  |
| height   | height to capture.                                                                                                                                                                | Target's height |
| fps      | FPS to render. For example, providing 10 will refresh the material against the HTML 10 times per second. By default, the material will be static.                                 | 0               |
| ratio    | Use target's ratio (i.e., `width`, `height`).                                                                                                                                     | height          |
| debug    | For debugging purposes, a DOM element which to append a rendered canvas to. Provided via a CSS selector (e.g., `#debug`). debug DOM to append generated canvas from `html2canvas` | null            |

For reference, check out the following links:

- [Material](https://aframe.io/docs/components/material.html)
- [Textures](https://aframe.io/docs/components/material.html#Textures)
- [Flat Shading Model](https://aframe.io/docs/core/shaders.html#Flat-Shading-Model)

[Available options](https://html2canvas.hertzen.com/documentation.html#available-options) by `html2canvas` will be ready for properties soon.

## Limitations

We will often see that the rendered looks different from how the source HTML in
2D. The process takes trial-and-error and can also depend on the device.

To check what is actually rendered by `html2canvas`, set the `debug` property
to append and view the generated canvas. More for limitations, see
[`html2canvas`'s documentation on
limitations](https://html2canvas.hertzen.com/documentation.html#limitations).

## Method

The following method is coming soon:

- render() (This is useful when you set `fps` as `0`)

## Events

The following events are coming soon:

- `html-ready` when `html2canvas` set and ready to render
- `html-draw` each time it renders

## Visibility

For the conversion to canvas to work, we need to make the target HTML element
technically visible and within the viewport, but we also don't want it to get
in the way of our scene. We usually want to give the HTML element a fixed
position and z-index it under everything:

```html
<div id="targetHTML" style="width: 100%; height: 100%; position: fixed; left: 0; top: 0; z-index: -1; overflow: hidden"></div>
```

## Usage

### Browser Installation

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.5.0/aframe.min.js"></script>
  <script src="https://unpkg.com/aframe-html-shader@0.5.0/dist/aframe-html-shader.min.js"></script>
</head>

<body>
  <a-scene>
    <a-entity geometry="primitive: box" material="shader: html; target: #htmlElement"></a-entity>
  </a-scene>

  <div style="width: 100%; height: 100%; position: fixed; left: 0; top: 0; z-index: -1; overflow: hidden">
    <div id="htmlElement" style="background: #F8F8F8; color: #333; font-size: 48px">Hello, HTML!</div>
  </div>
</body>
```

### NPM Installation

Install via NPM:

```bash
npm install --save aframe-html-shader
```

Then register and use.

```js
import 'aframe'
import 'aframe-html-shader'
```
