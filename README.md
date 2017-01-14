# AFrame HTML Shader

A shader to render DOM Element for [A-Frame](https://aframe.io) VR. Inspired by [@scenevr](https://github.com/scenevr)'s [htmltexture-component](https://github.com/scenevr/htmltexture-component) with [@niklasvh](https://github.com/niklasvh)'s [html2canvas](https://github.com/niklasvh/html2canvas)


**[DEMO](https://mayognaise.github.io/aframe-html-shader/basic/index.html)**

![example](example.gif)

**The screenshot of DOM Element is by [`html2canvas`](https://html2canvas.hertzen.com/). To lean more about the library, please check the [documentation](https://html2canvas.hertzen.com/documentation.html)**


## Limitations

You will often see the render looks different from how the target looks.
You kinda have to learn what can be generated. Also it depends on devices.
To check what actually rendered by `html2canvas`, use `debug` property to select to append the generated canvas.
More for limitations, please check [here](https://html2canvas.hertzen.com/documentation.html#limitations)


## Properties

- Basic material's properties are supported.
- The property is pretty much same as `flat` shader besides `repeat`. Will update it soon.
- `target` is a `CSS selector` to render to `a-entity`.
- `width` and `height` is a size to capture. if the target element's size is `640x480` and `width|height` sets as `200|100` , it will only be cropped with 200px width and 100px height from left top position.
- `fps` is framerate to render per a second. if you only render once, set as `0`.
- `ratio` is for using target's ratio. if you keep null, the generated canvas will scaled for fit to `a-entity`. if you set as `width`, the geometry's width stays and height will be changed by the ratio, and conversely.

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
| target | CSS selectors (#foo). target DOM to render | null |
| width | width to capture | null (target's width) |
| height | height to capture | null (target's height) |
| fps | fps to render | 0 |
| ratio | use target's ratio (width|height|null) | null |
| debug | CSS selectors (#foo). debug DOM to append generated canvas from `html2canvas` | null |

For refference, please check the following links:
- [Material](https://aframe.io/docs/components/material.html)
- [Textures](https://aframe.io/docs/components/material.html#Textures)
- [Flat Shading Model](https://aframe.io/docs/core/shaders.html#Flat-Shading-Model)

[Available options](https://html2canvas.hertzen.com/documentation.html#available-options) by `html2canvas` will be ready for properties soon.

## Method

The following method is coming soon...

- render() (This is useful when you set `fps` as `0`)

## Events

The following events are coming soon...

- `html-ready` when `html2canvas` set and ready to render
- `html-draw` each time it renders


## Usage

### Browser Installation

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.2.0/aframe.min.js"></script>
  <script src="https://rawgit.com/mayognaise/aframe-html-shader/master/dist/aframe-html-shader.min.js"></script>
</head>

<body>
  <a-scene>
    <a-entity geometry="primitive:box;" material="shader:gif;src:url(nyancat.gif);color:green;opacity:.8"></a-entity>
  </a-scene>
</body>
```

### NPM Installation

Install via NPM:

```bash
npm i -D aframe-html-shader
```

Then register and use.

```js
import 'aframe'
import 'aframe-html-shader'
```



