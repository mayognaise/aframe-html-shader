/**
 * A shader to render HTML DOM Element
 * Inspired by @scenevr's `htmltexture-component`
 * @see https://github.com/scenevr/htmltexture-component
 */


import html2canvas from './lib/html2canvas/core'

if (typeof AFRAME === 'undefined') {
  throw 'Component attempted to register before AFRAME was available.'
}

/* get util from AFRAME */
const { debug } = AFRAME.utils
debug.enable('shader:html:*')
// debug.enable('shader:html:warn')
const warn = debug('shader:html:warn')
const log = debug('shader:html:log')

/* create error message */
function createError (err, target) {
  return { status: 'error', target: target, message: err, timestamp: Date.now() }
}


AFRAME.registerShader('html', {

  /**
   * For material component:
   * @see https://github.com/aframevr/aframe/blob/60d198ef8e2bfbc57a13511ae5fca7b62e01691b/src/components/material.js
   * For example of `registerShader`:
   * @see https://github.com/aframevr/aframe/blob/41a50cd5ac65e462120ecc2e5091f5daefe3bd1e/src/shaders/flat.js
   * For MeshBasicMaterial
   * @see http://threejs.org/docs/#Reference/Materials/MeshBasicMaterial
   */
  
  schema: {

    /* For material */
    color: { type: 'color' },
    fog: { default: true },

    /* For texuture */
    src: { default: null },
    target: { default: null },
    debug: { default: null },
    ratio: { default: null },
    /* html2canvas */
    taintTest: { default: true },
    allowTaint: { default: false },
    letterRendering: { default: false },
    useCORS: { default: false },
    logging: { default: false },
    imageTimeout: { type: 'number', default: 0 },
    background: { default: undefined },
    proxy: { default: undefined },
    width: { default: null },
    height: { default: null },

  },

  /**
   * Initialize material. Called once.
   * @protected
   */
  init (data) {
    log('init', data)
    this.el.__html = this.el.__html || {} /* storing data individually */
    this.__cnv = document.createElement('canvas')
    this.__cnv.width = 2
    this.__cnv.height = 2
    this.__ctx = this.__cnv.getContext('2d')
    this.__texture = new THREE.Texture(this.__cnv)
    this.__reset()
    this.material = new THREE.MeshBasicMaterial({ map: this.__texture })
    this.__addEventListeners()
    this.__createObserver()
    this.el.sceneEl.addBehavior(this)
    return this.material
  },

  /**
   * Update or create material.
   * @param {object|null} oldData
   */
  update (oldData) {
    log('update', oldData)
    this.__updateMaterial(oldData)
    this.__updateTexture(oldData)
    return this.material
  },

  /**
   * Called on each scene tick.
   * @protected
   */
  tick (t) { },

  /*================================
  =            material            =
  ================================*/
  
  /**
   * Updating existing material.
   * @param {object} data - Material component data.
   */
  __updateMaterial (data) {
    const { material } = this
    const newData = this.__getMaterialData(data)
    Object.keys(newData).forEach(key => {
      material[key] = newData[key]
    })
  },


  /**
   * Builds and normalize material data, normalizing stuff along the way.
   * @param {Object} data - Material data.
   * @return {Object} data - Processed material data.
   */
  __getMaterialData (data) {
    return {
      fog: data.fog,
      color: new THREE.Color(data.color),
    }
  },


  /*==============================
  =            texure            =
  ==============================*/

  /**
   * set texure
   * @private
   * @param {Object} data
   * @property {string} status - success / error
   * @property {string} target - target url
   * @property {DOM Element} targetEl - target
   * @property {Date} timestamp - created at the texure
   */
  
  __setTexure (data) {
    log('__setTexure', data)
    if (data.status === 'error') {
      warn(`Error: ${data.message}\ntarget: ${data.target}`)
      this.__reset()
    }
    else if (data.status === 'success' && data.target !== this.__textureSrc) {
      /* Texture added or changed */
      this.__ready(data)
    }
  },

  /**
   * Update or create texure.
   * @param {Object} data - Material component data.
   */
  __updateTexture (data) {

    const { target, fps, width, height, ratio } = data
    this.__width = width || this.schema.width.default
    this.__height = height || this.schema.height.default
    
    /* debug */
    const resetDebug = () => {
      if (this.__debugEl) {
        this.__debugEl.innerHTML = ''
        this.__debugEl = this.schema.debug.default
      }
    }
    if (data.debug) {
      const el = this.__validateAndGetQuerySelector(data.debug)
      if (el && !el.error) { this.__debugEl = el }
      else resetDebug()
    }
    else resetDebug()
    
    /* ratio */
    if(ratio && ratio === 'width' || ratio === 'height') {
      this.__ratio = ratio
    }
    else {
      this.__ratio = this.schema.ratio.default
    }

    /* html2canvas */
    this.__taintTest = data.taintTest || this.schema.taintTest.default
    this.__allowTaint = data.allowTaint || this.schema.allowTaint.default
    this.__letterRendering = data.letterRendering || this.schema.letterRendering.default
    this.__useCORS = data.useCORS || this.schema.useCORS.default
    this.__logging = data.logging || this.schema.logging.default
    this.__imageTimeout = data.imageTimeout || this.schema.imageTimeout.default
    this.__background = data.background || this.schema.background.default
    this.__proxy = data.proxy || this.schema.proxy.default

    /* target */
    if (target) {
      if (target === this.__target) { return }
      /* disconnect observation */
      this.__disconnect()
      this.__target = target
      // return
      this.__validateSrc(target, this.__setTexure.bind(this))
    } else {
      /* Texture removed */
      this.__reset()
    }
  },

  /*=============================================
  =            varidation for texure            =
  =============================================*/

  /**
   * varidate src
   * @private
   * @param {string} target - dom selector
   * @param {Function} cb - callback
   */
  __validateSrc (target, cb) {

    let message

    /* check if target is a query selector */
    const el = this.__validateAndGetQuerySelector(target)
    if (!el || typeof el !== 'object') { return }
    if (el.error) {
      message = el.error
    }
    else {
      const tagName = el.tagName.toLowerCase()
      if (tagName === 'img' || tagName === 'video') {
        message = `For <${tagName}> element, please use \`shader:flat\``
      }
      else {
        cb({ status: 'success', target: target, targetEl: el, timestamp: Date.now() })
      }
    }

    /* if there is message, create error data */
    if (message) {
      const err = createError(message, target)
      cb(err)
    }

  },

  /**
   * Query and validate a query selector,
   *
   * @param  {string} selector - DOM selector.
   * @return {object} Selected DOM element | error message object.
   */
  __validateAndGetQuerySelector (selector) {
    try {
      var el = document.querySelector(selector)
      if (!el) {
        return { error: 'No element was found matching the selector' }
      }
      return el
    } catch (e) {  // Capture exception if it's not a valid selector.
      return { error: 'no valid selector' }
    }
  },
  

  /*==============================
   =            canvas            =
   ==============================*/

  /**
   * clear canvas
   * @private
   */
  __clearCanvas () {
    if (!this.__ctx || !this.__texture) { return }
    this.__ctx.clearRect(0, 0, this.__width, this.__height)
    this.__texture.needsUpdate = true
  },

  /**
   * draw
   * @private
   */
  __draw (canvas) {
    log('__draw')
    if (!this.__ctx || !this.__texture) { return }
    const ratio = canvas.width / canvas.height
    const cnvW = this.__cnv.width = THREE.Math.nearestPowerOfTwo(canvas.width)
    const cnvH = this.__cnv.height = THREE.Math.nearestPowerOfTwo(canvas.height)
    this.__ctx.drawImage(canvas, 0, 0, cnvW, cnvH)
    this.__texture.needsUpdate = true
    if (this.__ratio) {
      /* change size */
      const { width, height } = this.el.getObject3D('mesh').geometry.parameters
      this.el.setAttribute('geometry', Object.assign({}, this.el.getAttribute('geometry'), {
        width: (this.__ratio === 'width')? width : height * ratio,
        height: (this.__ratio === 'width')? width / ratio : height
      }))
    }

    /* append if debug element exists */
    if (this.__debugEl) {
      this.__debugEl.innerHTML = ''
      this.__debugEl.appendChild(canvas)
    }

    this.__isRendering = false

  },

  /**
   * render
   * @private
   */
  __render () {
    this.__nextTime = null
    if (!this.__targetEl || this.__isRendering) { return }
    const { width, height } = this.__targetEl.getBoundingClientRect()
    const options = {
      taintTest: this.__taintTest,
      allowTaint: this.__allowTaint,
      letterRendering: this.__letterRendering,
      useCORS: this.__useCORS,
      logging: this.__logging,
      imageTimeout: this.__imageTimeout,
      background: this.__background,
      proxy: this.__proxy,
      width: this.__width || width,
      height: this.__height || height,
      onrendered: this.__draw.bind(this)
    }
    html2canvas(this.__targetEl, options)
    this.__isRendering = true

  },
  

  /*============================
  =            ready           =
  ============================*/
  
  /**
   * setup html animation and play if autoplay is true
   * @private
   * @property {string} target - target url
   * @property {DOM Element} targetEl - target
   */  
  __ready ({ target, targetEl }) {
    log('__ready')
    this.__target = target
    this.__targetEl = targetEl
    this.__render()
    this.__observe()
  },


  /*=======================================
  =            event listeners            =
  =======================================*/

  __onComponentChanged (e) {

    if (!this.el.__html.listener) { return }

    const { newData, oldData } = e.detail
    if (newData.shader !== 'html' && oldData.shader === 'html') {
      this.__remove()
    }
  },
  
  __addEventListeners () {
    if (typeof this.el.__html.listener === 'undefined') {
      this.el.addEventListener('componentchanged', this.__onComponentChanged.bind(this))
    }
    this.el.__html.listener = true
  },

  __removeEventListeners () {
    this.el.__html.listener = false
    // this.el.removeEventListener('componentchanged', this.__onComponentChanged.bind(this))
  },


  /**
   * Remove when shader has changed from 'html' to others
   * @private
   */
  __remove () {
    log('__remove')
    this.__removeEventListeners()
    this.__reset()
  },



  /*================================
  =            observer            =
  ================================*/

  /**
   * stop observing
   * @private
   * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#disconnect()
   */
  
  __disconnect () {

    if (this.__targetEl) {
      this.el.__html.observer.disconnect()
    }

  },

  /**
   * start observing
   * @private
   * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#observe()
   */
  __observe () {

    log('__observe', this.__targetEl)

    /**
     * configuration of the observer
     * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#MutationObserverInit
     */
    
    const config = { attributes: true, childList: true, characterData: true, subtree: true, attributeOldValue: true, characterDataOldValue: true }
     
    /* pass in the target node, as well as the observer options */
    this.el.__html.observer.observe(this.__targetEl, config)


  },
  
  /**
   * create an observer instance
   * @private
   * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#MutationObserver()
   */
  __createObserver () {

    if (this.el.__html.observer) { return }

    log('__createObserver')

    this.el.__html.observer = new MutationObserver(this.__render.bind(this))

  },
  
  
  
  
  

  /*=============================
  =            reset            =
  =============================*/
  
  /**
   * @private
   */
  
  __reset () {
    this.__clearCanvas()
    this.__target = null
    this.__targetEl = null
    this.__debugEl = null
    this.__isRendering = false
  },



})

