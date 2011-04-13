/*
 * Copyright 2011 The Auton Lab.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function(window, undefined) {
  var document = window.document,
      navigator = window.navigator,
      autonspace = (window.auton = (window.auton || {})),
      canvasspace = (autonspace.canvas = (autonspace.canvas || {})),
      CMD_MOVETO = canvasspace.CMD_MOVETO = "M",
      CMD_LINETO = canvasspace.CMD_LINETO = "L",
      CMD_DELIMIT = canvasspace.CMD_DELIMIT = "Z",
      CMD_CIRCLEAT = canvasspace.CMD_CIRCLEAT = "R",
      CMD_CWCIRCLEAT = canvasspace.CMD_CWCIRCLEAT = "r",
      TXT_ALIGN_LEFT = canvasspace.TXT_ALIGN_LEFT = "left",
      TXT_ALIGN_CENTER = canvasspace.TXT_ALIGN_CENTER = "center",
      TXT_ALIGN_RIGHT = canvasspace.TXT_ALIGN_RIGHT = "right",
      TXT_VALIGN_MIDDLE = canvasspace.TXT_VALIGN_MIDDLE = "middle",
      TXT_VALIGN_BASELINE = canvasspace.TXT_VALIGN_BASELINE = "baseline",
      array = Array,
      number = Number,
      string = String,
      math = Math,
      round = math.round,
      ceil = math.ceil,
      floor = math.floor,
      tan = math.tan,
      PI = math.PI,
      POSITIVE_INFINITY = Infinity,
      NEGATIVE_INFINITY = -POSITIVE_INFINITY,
      EMPTY_PATH, EMPTY_STROKE,
      MOD_VISIBLE = 1,
      MOD_TRANSLATE = 2,
      MOD_SCALE = 4,
      MOD_MINS = 8,
      MOD_MAXS = 16,
      MOD_NEEDS_BOUND_RECALC = 32,
      MOD_BOUND_IS_HINT = 64,
      MOD_FILL = 128,
      MOD_STROKE = 256,
      MOD_STROKE_WIDTH = 512,
      MOD_PATH_DATA = 1024,
      MOD_FONT = 512,
      MOD_TEXT = 1024,
      MOD_ALIGN = 2048,
      MOD_VALIGN = 4096,
      MOD_DEFAULT = -1 & ~MOD_BOUND_IS_HINT,
      dummyElement,
      D, O,
      nodeobj, nodeprot,
      parentobj, parentprot,
      canvasobj, canvasprot,
      plotterobj, plotterprot,
      plotregionobj, plotregionprot,
      groupobj,
      leafobj, leafprot,
      textobj, textprot,
      pathobj, pathprot,
      extendAndDelete,
      appendToContainer,
      nodeSetBounds,
      setVisible,
      getFirstElementInSubtree,
      getNextElement,
      childInsertBeforeElement,
      childRemove,
      baselineOffsetCache,
      getBaselineOffset,
      parentArrayInsertBefore,
      parentArrayRemove,
      canvasBaseConstruct,
      pathBaseConstruct,
      countListeners,
      nodeArrayAddListener,
      nodeArrayRemoveListener,
      nodeDeltaListener,
      USE_EVENT_TYPE,
      canvasDeltaListeners,
      dispatchEvent,
      createFakeMouseEvent,
      fillEvent;

  if (canvasspace.version) {
    return;
  }

  canvasspace.version = "1.0";

  nodeSetBounds = function(node, minX, minY, maxX, maxY, hint) {
    var mod = hint ? MOD_BOUND_IS_HINT : 0;

    if ((minX !== node._minX) || (minY !== node._minY)) {
      node._minX = minX;
      node._minY = minY;
      mod |= MOD_MINS;
    }

    if ((maxX !== node._maxX) || (maxY !== node._maxY)) {
      node._maxX = maxX;
      node._maxY = maxY;
      mod |= MOD_MAXS;
    }

    if (mod) {
      node._mod |= mod;
    }
  };
  parentArrayInsertBefore = function(parentThis, target, before) {
    var p = target._p,
        i, children, n, child,
        childIndex, beforeIndex;

    if (p && (p !== parentThis)) {
      p.remove(target);
      p = undefined;
    }

    if (!p || (target !== before)) {
      children = parentThis._c;
      n = children.length;
      childIndex = -1;
      beforeIndex = (before >= 0 ? before : before ? -1 : n);

      for (i = 0; i < n && ((p && childIndex < 0) || beforeIndex < 0); i++) {
        child = children[i];

        if (child === target) {
          childIndex = i;
        } else if (child === before) {
          beforeIndex = i;
        }
      }

      if (beforeIndex < 0) {
        beforeIndex = n;
      }

      if ((childIndex >= 0) && (childIndex === beforeIndex - 1)) {
        beforeIndex = -1;
      } else {
        if (childIndex >= 0) {
          children.splice(childIndex, 1);
        }
        if (beforeIndex === n) {
          children[n] = target;
        } else {
          children.splice(beforeIndex, 0, target);
        }

        target._p = parentThis;
      }
    } else {
      beforeIndex = -1;
    }

    return beforeIndex;
  };
  parentArrayRemove = function(parentThis, target) {
    var i = -1, children, n;

    if (target._p === parentThis) {
      children = parentThis._c;
      for (i = 0, n = children.length; i < n; i++) {
        if (children[i] === target) {
          children.splice(i, 1);
          break;
        }
      }

      if (i < n) {
        target._p = undefined;
      } else {
        i = -1;
      }
    }

    return i;
  };
  extendAndDelete = function(target, props) {
    var k, v;
    for (k in props) {
      if (props.hasOwnProperty(k)) {
        v = props[k];
        if (target[k] !== v) {
          target[k] = v;
        }
        delete props[k];
      }
    }
  };
  appendToContainer = function(node, element) {
    if (typeof element === "string") {
      element = document.getElementById(element);
    }
    if (element && (element.nodeType === 1)) {
      element.appendChild(node._elt);
    }
  };
  nodeArrayAddListener = function(node, type, listener) {
    var i, n, listeners = node._l[type];

    if (!listeners) {
      listeners = node._l[type] = [];
    }

    for (i = 0, n = listeners.length; i < n; i++) {
      if (listener === listeners[i]) {
        i = -1;
        break;
      }
    }
    if (i === n) {
      listeners[n] = listener;
    }

    return i;
  };
  nodeArrayRemoveListener = function(node, type, listener) {
    var listenersByType = node._l,
        listeners = listenersByType[type],
        i = -1, n;

    if (listeners) {
      for (i = 0, n = listeners.length; i < n; i++) {
        if (listener === listeners[i]) {
          break;
        }
      }
      if (i < n) {
        if (n === 1) {
          delete listenersByType[type];
        } else {
          listeners.splice(i, 1);
        }
      } else {
        i = -1;
      }
    }

    return i;
  };
  fillEvent = function(e, elt) {
    var ax, ay, cur;

    if (e.clientX !== undefined && e.clientY !== undefined) {
      // voodoo from GWT to get absolute left/top

      ax = 0;
      ay = 0;

      cur = elt;
      while (cur.offsetParent) {
        ax -= cur.scrollLeft;
        ay -= cur.scrollTop;
        cur = cur.parentNode;
      }
      cur = elt;
      while (cur) {
        ax += cur.offsetLeft;
        ay += cur.offsetTop;
        cur = cur.offsetParent;
      }

      // voodoo from GWT's MouseEvent to get relative left/top

      e.canvasRelativeX = e.clientX - ax + (elt.scrollLeft || 0) +
        (document.scrollLeft || 0);
      e.canvasRelativeY = e.clientY - ay + (elt.scrollTop || 0) +
        (document.scrollTop || 0);
    }
  };

  // ELEMENT

  nodeobj = function() {
  };
  nodeprot = nodeobj.prototype;
  nodeprot._p = undefined;
  nodeprot._tx = 0;
  nodeprot._ty = 0;
  nodeprot._sx = 1;
  nodeprot._sy = 1;
  nodeprot._minX = 0;
  nodeprot._minY = 0;
  nodeprot._maxX = 0;
  nodeprot._maxY = 0;
  nodeprot._v = true;
  nodeprot._mod = MOD_DEFAULT;
  nodeprot._construct = function() {
  };
  nodeprot.canvas = function() {
    var canvas;
    canvas = this;
    while (canvas && !canvas.draw) {
      canvas = canvas._p;
    }
    return canvas;
  };
  nodeprot.parent = function() {
    return this._p;
  };
  nodeprot.toBack = function() {
    var p = this._p;
    if (p) {
      p.insertBefore(this, undefined);
    }
    return this;
  };
  nodeprot.toFront = function() {
    var p = this._p;
    if (p) {
      p.insertBefore(this, 0);
    }
    return this;
  };
  nodeprot.remove = function() {
    var p = this._p;
    if (p) {
      p.remove(this);
    }
    return this;
  };
  nodeprot.visible = function(visible) {
    if (visible === undefined) {
      return this._v;
    } else {
      if (this._v !== visible) {
        this._v = !!visible;
        this._mod |= MOD_VISIBLE;
      }

      return this;
    }
  };
  nodeprot.show = function() {
    return this.visible(true);
  };
  nodeprot.hide = function() {
    return this.visible(false);
  };
  nodeprot.translateX = function(tx) {
    if (tx === undefined) {
      return this._tx;
    } else {
      if (this._tx !== tx) {
        this._tx = tx;
        this._mod |= MOD_TRANSLATE;
      }

      return this;
    }
  };
  nodeprot.translateY = function(ty) {
    if (ty === undefined) {
      return this._ty;
    } else {
      if (this._ty !== ty) {
        this._ty = ty;
        this._mod |= MOD_TRANSLATE;
      }

      return this;
    }
  };
  nodeprot.scaleX = function(sx) {
    if (sx === undefined) {
      return this._sx;
    } else {
      if (this._sx !== sx) {
        this._sx = sx;
        this._mod |= MOD_SCALE;
      }

      return this;
    }
  };
  nodeprot.scaleY = function(sy) {
    if (sy === undefined) {
      return this._sy;
    } else {
      if (this._sy !== sy) {
        this._sy = sy;
        this._mod |= MOD_SCALE;
      }

      return this;
    }
  };
  nodeprot.translate = function(tx, ty) {
    if (tx === undefined) {
      return [ this._tx, this._ty ];
    } else {
      if ((this._tx !== tx) || (this._ty !== ty)) {
        this._tx = tx;
        this._ty = ty;
        this._mod |= MOD_TRANSLATE;
      }

      return this;
    }
  };
  nodeprot.scale = function(sx, sy) {
    if (sx === undefined) {
      return [ this._sx, this._sy ];
    } else {
      if ((this._sx !== sx) || (this._sy !== sy)) {
        this._sx = sx;
        this._sy = sy;
        this._mod |= MOD_SCALE;
      }

      return this;
    }
  };
  nodeprot.transform = function(tx, ty, sx, sy) {
    var mod = 0;

    if (tx === undefined) {
      return {
        t: [ this._tx, this._ty ],
        s: [ this._sx, this._sy ]
      };
    } else {
      if ((this._tx !== tx) || (this._ty !== ty)) {
        this._tx = tx;
        this._ty = ty;
        mod = MOD_TRANSLATE;
      }
      if ((this._sx !== sx) || (this._sy !== sy)) {
        this._sx = sx;
        this._sy = sy;
        mod |= MOD_SCALE;
      }

      if (mod) {
        this._mod |= mod;
      }

      return this;
    }
  };

  // PARENT

  parentobj = function() {
  };
  parentprot = parentobj.prototype = new nodeobj();
  parentprot._construct = function() {
    nodeprot._construct.apply(this);
    this._c = [];
  };
  parentprot.text = function(text, font, align, valign) {
    var r = new textobj(text, font, align, valign);
    this.add(r);
    return r;
  };
  parentprot.path = function(data) {
    var r = new pathobj(data);
    this.add(r);
    return r;
  };
  parentprot.group = function() {
    var r = new groupobj();
    this.add(r);
    return r;
  };
  parentprot.add = function(child) {
    return this.insertBefore(child, undefined);
  };
  parentprot.clear = function() {
    var i, children, n;

    children = this._c;
    for (i = 0, n = children.length; i < n; i++) {
      children[i]._p = undefined;
    }

    children.length = 0;
    return this;
  };
  parentprot._recalc = function() {
    var pminX = POSITIVE_INFINITY,  pminY = POSITIVE_INFINITY,
        pmaxX = NEGATIVE_INFINITY,  pmaxY = NEGATIVE_INFINITY,
        updatedToIndex = -1,
        updatingLocalBounds = false,
        i, children, n, child,
        tx, ty, sx, sy,
        minX, minY, maxX, maxY;

    // this loop contains two passes:

    // pass 1: call _recalc on all our visible children. if any
    // actually updated their bounds, stop pass 1 and start pass 2.

    // pass 2: update our own bounds with the current bounds of *all* our
    // visible children, calling _recalc on any children who didn't
    // get updated in pass 1.

    children = this._c;
    for (i = 0, n = children.length; i < n; i++) {
      child = children[i];

      // invisible children do not affect the bound calculation. note that this
      // means that if a child goes invisible, all else being equal, our bounds
      // will not change.
      if (child._v) {
        // optimization: make sure we only call _recalc once per child.
        if (i > updatedToIndex) {
          child._recalc();
          updatedToIndex = i;
        }

        // if we are still in pass 1, check if this child actually had any bounds
        // changes
        if (!updatingLocalBounds) {
          // any of these modifications could affect our overall bounds
          if (child._mod & (MOD_VISIBLE | MOD_TRANSLATE | MOD_SCALE |
              MOD_MINS | MOD_MAXS | MOD_NEEDS_BOUND_RECALC)) {
            updatingLocalBounds = true;
            i = -1;
          }
        } else {
          // expand our own bounds to include this child's bounds.

          tx = child._tx;
          ty = child._ty;
          sx = child._sx;
          sy = child._sy;
          minX = child._minX * sx + tx;
          minY = child._minY * sy + ty;
          maxX = child._maxX * sx + tx;
          maxY = child._maxY * sy + ty;

          if (minX < pminX) { pminX = minX; }
          if (minY < pminY) { pminY = minY; }
          if (maxX > pmaxX) { pmaxX = maxX; }
          if (maxY > pmaxY) { pmaxY = maxY; }
        }
      }
    }

    if (pminX <= pmaxX) {
      nodeSetBounds(this, pminX, pminY, pmaxX, pmaxY);
    }
  };

  // CANVAS

  canvasobj = canvasspace.Canvas = function(width, height, element) {
    this._construct();

    if (this.width) {
      this.width(width);
    }
    if (this.height) {
      this.height(height);
    }

    appendToContainer(this, element);
  };
  canvasprot = canvasobj.prototype = new parentobj();
  canvasprot._width = 300;
  canvasprot._height = 150;
  canvasprot._autoBounds = false;
  canvasprot._btx = 0;
  canvasprot._bty = 0;
  canvasprot._construct = canvasBaseConstruct = function() {
    parentprot._construct.apply(this, arguments);
    this._style = {};
    this._attr = {};
  };
  canvasprot.element = function() {
    return this._elt;
  };
  canvasprot.width = function(width) {
    if (width === undefined) {
      return this._width;
    } else {
      width = ~~number(width);
      if (width > 0) {
        this._width = width;
        this._setWidth(width);
      }
      return this;
    }
  };
  canvasprot.height = function(height) {
    if (height === undefined) {
      return this._height;
    } else {
      height = ~~number(height);
      if (height > 0) {
        this._height = height;
        this._setHeight(height);
      }
      return this;
    }
  };
  canvasprot.draw = function() {
    var styleChanges = this._style,
        attrChanges = this._attr,
        element = this._elt,
        minX, minY,
        l, t, w, h;

    if (this._autoBounds) {
      this._recalc();

      if (this._mod & (MOD_MINS | MOD_MAXS)) {
        minX = this._minX;
        minY = this._minY;
        l = floor(minX);
        t = floor(minY);
        w = ceil(this._maxX - minX);
        h = ceil(this._maxY - minY);

        styleChanges.left = l + "px";
        styleChanges.top  = t + "px";

        this.width(w);
        this.height(h);

        if ((-l !== this._btx) ||
            (-t !== this._bty)) {
          this._btx = -l;
          this._bty = -t;
          this._mod |= MOD_TRANSLATE;
        }
      }
    }

    extendAndDelete(element.style, styleChanges);
    extendAndDelete(element, attrChanges);

    this._baseDraw();
    this._mod = 0;

    return this;
  };
  canvasprot.toFront = canvasprot.toBack = undefined;
  canvasprot.visible = function(visible) {
    if (visible === undefined) {
      return this._elt.style.visible !== "none";
    } else {
      this._elt.style.visible = (visible ? "" : "none");
      return this;
    }
  };

  // PLOTTER

  plotterobj = canvasspace.Plotter = function(element) {
    this._construct();
    appendToContainer(this, element);
  };
  plotregionobj = canvasspace.PlotRegion = function() {
    this._construct();
  };

  // GROUP

  groupobj = canvasspace.Group = function() {
    this._construct();
  };
  groupobj.prototype = new parentobj();

  leafobj = function() {
  };
  leafprot = leafobj.prototype = new nodeobj();
  leafprot._width = 1;
  leafprot._stroke = "black";
  leafprot.stroke = function(color) {
    if (color === undefined) {
      return this._stroke;
    } else {
      if (typeof color !== "string") {
        color = undefined;
      }

      if (color !== this._stroke) {
        this._stroke = color;
        this._mod |= MOD_STROKE;
      }

      return this;
    }
  };
  leafprot.strokeWidth = function(width) {
    if (width === undefined) {
      return this._width;
    } else {
      if ((width > 0) && width !== this._width) {
        this._width = width;
        this._mod |= MOD_FILL;
      }

      return this;
    }
  };

  // TEXT

  textobj = canvasspace.Text = function(text, font, align, valign) {
    this._construct();
    this.text(text);
    this.font(font);
    this.align(align);
    this.valign(valign);
  };
  textprot = textobj.prototype = new leafobj();
  textprot._text = "";
  textprot._font = "10px sans-serif";
  textprot._align = TXT_ALIGN_LEFT;
  textprot._valign = TXT_VALIGN_MIDDLE;
  textprot.text = function(text) {
    if (text === undefined) {
      return this._text;
    } else {
      if (text !== this._text) {
        this._text = text;
        this._mod |= MOD_TEXT;
      }

      return this;
    }
  };
  textprot.font = function(font) {
    if (font === undefined) {
      return this._font;
    } else {
      if (font !== this._font) {
        this._font = font;
        this._mod |= MOD_FONT;
      }

      return this;
    }
  };
  textprot.align = function(align) {
    if (align === undefined) {
      return this._align;
    } else {
      if (align !== this._align) {
        this._align = align;
        this._mod |= MOD_ALIGN;
      }

      return this;
    }
  };
  textprot.valign = function(valign) {
    if (valign === undefined) {
      return this._valign;
    } else {
      if (valign !== this._valign) {
        this._valign = valign;
        this._mod |= MOD_VALIGN;
      }

      return this;
    }
  };

  // PATH

  pathobj = canvasspace.Path = function(data) {
    this._construct();
    if (data) {
      this.data(data);
    }
  };
  pathprot = pathobj.prototype = new leafobj();
  pathprot._fill = undefined;
  pathprot._construct = pathBaseConstruct = function() {
    leafprot._construct.apply(this);
    this._data = [];
    this._l = {};
  };
  pathprot.fill = function(fill, angle) {
    var type, mod = 0, cur = this._fill;

    if (fill === undefined) {
      return cur;
    } else {
      type = typeof fill;

      if (type instanceof array) {
        if (fill.length !== 2 ||
            typeof fill[0] !== "string" ||
            typeof fill[1] !== "string") {
          type = fill = undefined;
        } else if (fill[0] === fill[1]) {
          fill = fill[0];
          type = "string";
        }
      }

      if (type === "string") {
        if (typeof cur !== "string" || fill !== cur) {
          mod = MOD_FILL;
        }
      } else if (fill) {
        if (!cur || typeof cur === "string" ||
            fill[0] !== cur[0] || fill[1] !== cur[1] ||
            angle !== this._angle) {
          fill = [ fill[0], fill[1] ];
          angle = angle || 0;
          mod = MOD_FILL;
        }
      }

      if (mod) {
        this._fill = fill;
        this._angle = angle;
        this._fillp = undefined;
        this._mod |= mod;
      }

      return this;
    }
  };
  pathprot.data = function(data) {
    if (data === undefined) {
      return this._data;
    } else {
      if (data instanceof array) {
        this._data = data;
        this._mod = (this._mod & ~MOD_BOUND_IS_HINT) |
          MOD_PATH_DATA | MOD_NEEDS_BOUND_RECALC;
      }

      return this;
    }
  };
  pathprot.keep = function(keep) {
    if (keep === undefined) {
      return this._keep;
    } else {
      this._keep = keep = !!keep;

      if (!keep) {
        this._gc();
      }

      return this;
    }
  };
  pathprot._gc = function() {
  };
  pathprot.clear = function() {
    this.data([]);
    return this;
  };
  pathprot.bounds = function(minX, minY, maxX, maxY) {
    if (minX === undefined) {
      return [
        this._minX,
        this._minY,
        this._maxX,
        this._maxY
      ];
    } else {
      nodeSetBounds(this, minX, minY, maxX, maxY, true);
      return this;
    }
  };
  pathprot._recalc = function() {
    var mod = this._mod,
        minX, minY, maxX, maxY,
        i, data, n, cmd,
        x, y, r;

    if ((mod & (MOD_NEEDS_BOUND_RECALC | MOD_BOUND_IS_HINT)) ===
        MOD_NEEDS_BOUND_RECALC) {
      minX = POSITIVE_INFINITY;
      minY = POSITIVE_INFINITY;
      maxX = NEGATIVE_INFINITY;
      maxY = NEGATIVE_INFINITY;

      data = this._data;
      for (i = 0, n = data.length; i < n; ) {
        cmd = data[i++];

        if (cmd === CMD_MOVETO || cmd === CMD_LINETO) {
          x = data[i++];
          y = data[i++];
          if (x < minX) { minX = x; }
          if (y < minY) { minY = y; }
          if (x > maxX) { maxX = x; }
          if (y > maxY) { maxY = y; }
        } else if (cmd === CMD_CIRCLEAT || cmd === CMD_CWCIRCLEAT) {
          x = data[i++];
          y = data[i++];
          r = data[i++];
          if (x - r < minX) { minX = x - r; }
          if (y - r < minY) { minY = y - r; }
          if (x + r > maxX) { maxX = x + r; }
          if (y + r > maxY) { maxY = y + r; }
        }
      }

      this._mod = (mod & ~MOD_NEEDS_BOUND_RECALC);
      nodeSetBounds(this, minX, minY, maxX, maxY);
    }
  };

  // HTML5 IMPLEMENTATION

  dummyElement = document.createElement("canvas");

  if (dummyElement && dummyElement.getContext &&
      dummyElement.getContext("2d")) {

    MOUSE_EVENT_MAP = {
      mouseover: "mousemove",
      mouseout: "mousemove",
      click: undefined,
      mousedown: undefined,
      mouseup: undefined,
      mousemove: undefined
    };
    canvasDeltaListeners = function(canvas, newCountsByType, add) {
      var countsByType = canvas._lc, type, count, newCount;

      for (type in newCountsByType) {
        if (newCountsByType.hasOwnProperty(type)) {
          newCount = newCountsByType[type];
          type = MOUSE_EVENT_MAP[type] || type;
          if (newCount > 0) {
            count = countsByType[type] || 0;
            if (add) {
              if (count === 0) {
                canvas._elt.addEventListener(type, canvas);
              }
              count += newCount;
            } else {
              count -= newCount;
              if (count <= 0) {
                count = 0;
                canvas._elt.removeEventListener(type, canvas);
              }
            }
            countsByType[type] = count;
          }
        }
      }
    };
    countListeners = function(node, countsByType) {
      var listenersByType = node._l, listeners, type,
          children = node._c, i, n;

      if (listenersByType) {
        for (type in listenersByType) {
          if (listenersByType.hasOwnProperty(type)) {
            listeners = listenersByType[type];
            n = (listeners ? listeners.length : 0);
            if (n) {
              countsByType[type] = (countsByType[type] || 0) + n;
            }
          }
        }
      }

      if (children) {
        for (i = 0, n = children.length; i < n; i++) {
          countListeners(children[i], countsByType);
        }
      }
    };
    nodeDeltaListener = function(node, type, listener, add) {
      var p, deltas, index = add ?
            nodeArrayAddListener(node, type, listener) :
            nodeArrayRemoveListener(node, type, listener);

      if (index >= 0) {
        p = node._p;
        while (p && !p.draw) {
          p = p._p;
        }
        if (p && p.draw) {
          deltas = {};
          deltas[type] = 1;
          canvasDeltaListeners(p, deltas, add);
        }
      }
    };
    dispatchEvent = function(node, e) {
      var i, n, listeners = node._l[e.type];

      e.canvasTarget = node;

      if (listeners) {
        for (i = 0, n = listeners.length; i < n; i++) {
          listeners[i].handleEvent(e);
        }
      }
    };
    createFakeMouseEvent = function(e, type) {
      var o = document.createEvent("MouseEvents");
      o.initMouseEvent(type, true, true, null, e.detail, e.screenX, e.screenY,
        e.clientX, e.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
        e.button, e.relatedTarget);
      o.canvasRelativeX = e.canvasRelativeX;
      o.canvasRelativeY = e.canvasRelativeY;
      return o;
    };

    // HTML5 PARENT

    parentprot.insertBefore = function(target, before) {
      var p, counts, index = parentArrayInsertBefore(this, target, before);

      if (index >= 0) {
        p = this._p;
        while (p && !p.draw) {
          p = p._p;
        }
        if (p && p.draw) {
          countListeners(this, counts = {});
          canvasDeltaListeners(p, counts, true);
        }
      }

      return this;
    };
    parentprot.remove = function(child) {
      var p, counts, removedIndex = parentArrayRemove(this, child);

      if (removedIndex >= 0) {
        p = this._p;
        while (p && !p.draw) {
          p = p._p;
        }
        if (p && p.draw) {
          countListeners(this, counts = {});
          canvasDeltaListeners(p, counts, false);
        }
      }

      return this;
    };
    parentprot._draw = function(ctx, htx, hty, hsx, hsy, testx, testy) {
      var i, children, n, child, testr, childr,
          tx, ty, sx, sy;

      children = this._c;
      for (i = 0, n = children.length; i < n; i++) {
        child = children[i];

        sx = child._sx * hsx;
        sy = child._sy * hsy;
        tx = child._tx * hsx + htx;
        ty = child._ty * hsy + hty;

        if (child._v) {
          childr = child._draw(ctx, tx, ty, sx, sy, testx, testy);
          child._mod = 0;
          if (childr) {
            testr = childr;
          }
        }
      }

      return testr;
    };

    // HTML5 CANVAS

    canvasprot._construct = function() {
      var element, style;

      canvasBaseConstruct.apply(this, arguments);

      element = this._elt = document.createElement("canvas");
      style = element.style;
      // IE9 bug makes "auto" dimensions equivalent to width 300 height 150.
      // uncomment when fixed.
      // style.width = style.height = "auto";

      if (this._autonBounds) {
        style.position = "absolute";
      }

      element.addEventListener("mouseout", this);
      this._lc = {};

      this._ctx = this._elt.getContext("2d");
    };
    canvasprot._setWidth = function(width) {
      this._attr.width = width;
    };
    canvasprot._setHeight = function(height) {
      this._attr.height = height;
    };
    canvasprot._baseDraw = function(testx, testy) {
      var ctx = this._ctx;

      if (testx === undefined || testy === undefined) {
        // clears canvas
        ctx.canvas.width = this._width;
      }

      return this._draw(ctx,
        this._tx + this._btx,
        this._ty + this._bty,
        this._sx, this._sy,
        testx, testy);
    };
    canvasprot.handleEvent = function(e) {
      var type, node, lastmousenode, fake;

      type = e.type;
      lastmousenode = this._lmnode;
      fillEvent(e, this._elt);

      // if the mouse left the canvas, make sure the last node to get a mouse
      // event gets a mouseout.
      if (type === "mouseout") {
        node = lastmousenode;
        this._lmnode = undefined;
      } else {
        node = this._baseDraw(e.canvasRelativeX, e.canvasRelativeY);

        if (type === "mousemove" && node !== lastmousenode) {
          if (lastmousenode) {
            dispatchEvent(lastmousenode, createFakeMouseEvent(e, "mouseout"));
          }
          if (node) {
            dispatchEvent(node, createFakeMouseEvent(e, "mouseover"));
          }
        }

        if (type in MOUSE_EVENT_MAP) {
          this._lmnode = node;
        }
      }

      if (node) {
        dispatchEvent(node, e);
      }
    };

    // HTML5 PLOTTER

    plotterprot = plotterobj.prototype;
    plotterprot._construct = function() {
      var element = this._elt = document.createElement("div"),
          style = element.style;

      style.position = "relative";
      style.margin = style.padding = "0px";

      this._c = [];
    };
    plotterprot.element = canvasprot.element;
    plotterprot.add = parentprot.add;
    plotterprot.insertBefore = function(target, before) {
      var index, children;

      if (!(target instanceof plotregionobj)) {
        throw "insertBefore: i don't recognize " + target +
          " as a child i should have";
      }

      index = parentArrayInsertBefore(this, target, before);

      if (index >= 0) {
        children = this._c;
        before = (index < children.length - 1 ? children[index + 1] : null);
        this._elt.insertBefore(target._elt, before);
      }

      return this;
    };
    plotterprot.remove = function(child) {
      var removedIndex = parentArrayRemove(this, child);

      if (removedIndex >= 0) {
        this._elt.removeChild(child._elt);
      }

      return this;
    };
    plotterprot.clear = function() {
      var element = this._elt,
          i, children, n, child;

      children = this._c;
      for (i = 0, n = children.length; i < n; i++) {
        child = children[i];
        element.removeChild(child._elt);
        child._p = undefined;
      }

      children.length = 0;

      return this;
    };

    plotregionprot = plotregionobj.prototype = new canvasobj();
    plotregionprot._autoBounds = true;

    // HTML5 TEXT

    textprot._draw = function(ctx, tx, ty, sx, sy, testx, testy) {
      if (testx === undefined || testy === undefined) {
        ctx.textAlign = this._align;
        ctx.textBaseline = (this._valign === TXT_VALIGN_BASELINE ?
          "alphabetic" : "middle");
        ctx.font = this._font;
        ctx.fillStyle = this._stroke;
        ctx.fillText(this._text, tx, ty);
      }
    };

    // HTML5 PATH

    pathprot.addEventListener = function(type, listener) {
      nodeDeltaListener(this, type, listener, true);
      return this;
    };
    pathprot.removeEventListener = function(type, listener) {
      nodeDeltaListener(this, type, listener, false);
      return this;
    };
    pathprot._draw = function(ctx, origtx, origty, origsx, origsy, testx,
        testy) {
      var stroke = this._stroke,
          width = this._width,
          fill = this._fill, fillType = typeof fill, pfill,
          tx = origtx, ty = origty, sx = origsx, sy = origsy,
          transformed = false, needUntransformed = false,
          angle, tanangle,
          i, data, n, cmd,
          cx, cy, r,
          bx, by, dx, dy,
          test;

      test = !(testx === undefined || testy === undefined);

      if (fill && fillType !== "string") {
        pfill = this._fillp;

        if (this._mod & (MOD_TRANSLATE | MOD_SCALE | MOD_MINS | MOD_MAXS |
            MOD_NEEDS_BOUND_RECALC)) {
          pfill = undefined;
        }

        if (!pfill) {
          this._recalc();

          bx = sx * (this._maxX - this._minX) / 2;
          by = sy * (this._maxY - this._minY) / 2;

          // wrap angle to [-PI, PI)
          angle = (this._angle + PI) % (2 * PI);
          if (angle < 0) {
            angle += 2 * PI;
          }
          angle -= PI;

          tanangle = tan(angle);

          // right edge
          if ((angle >= -PI / 4) && (angle < PI / 4)) {
            dx = bx;
            dy = tanangle * by;
          }
          // bottom edge
          else if ((angle >= PI / 4) && (angle < 3 * PI / 4)) {
            dy = by;
            dx = bx / tanangle;
          }
          // top edge
          else if ((angle >= -3 * PI / 4) && (angle < -PI / 4)) {
            dy = -by;
            dx = -bx / tanangle;
          }
          // left edge
          else /* if ((angle >= 3 * PI / 4) || (angle < -3 * PI / 4)) */{
            dx = -bx;
            dy = -tanangle * by;
          }

          cx = (this._minX + bx) * sx + tx;
          cy = (this._minY + by) * sy + ty;

          pfill = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);

          pfill.addColorStop(0, fill[0]);
          pfill.addColorStop(1, fill[1]);

          this._fillp = pfill;
        }

        fill = pfill;
        needUntransformed = true;
      }

      if (fill && !test) {
        ctx.fillStyle = fill;
      }

      if (width <= 0 || (test && !fill)) {
        stroke = undefined;
      }

      if (stroke) {
        ctx.lineWidth = width;
        if (!test) {
          ctx.strokeStyle = stroke;
        }
        needUntransformed = true;
      } else {
        stroke = undefined;
      }

      if (stroke || fill) {
        ctx.beginPath();

        data = this._data;
        for (i = 0, n = data.length; i < n; ) {
          cmd = data[i++];

          if (cmd === CMD_DELIMIT) {
            if (transformed && needUntransformed) {
              ctx.restore();
              transformed = false;
              tx = origtx;
              ty = origty;
              sx = origsx;
              sy = origsy;
            }

            if (!test) {
              if (fill) {
                ctx.fill();
              }
              if (stroke) {
                ctx.stroke();
              }
            } else {
              if (ctx.isPointInPath(testx, testy)) {
                if (transformed) {
                  ctx.restore();
                }
                return this;
              }
            }

            ctx.beginPath();
          } else if (cmd === CMD_LINETO) {
            ctx.lineTo(data[i++] * sx + tx, data[i++] * sy + ty);
          } else if (cmd === CMD_MOVETO) {
            ctx.moveTo(data[i++] * sx + tx, data[i++] * sy + ty);
          } else if (cmd === CMD_CIRCLEAT || cmd === CMD_CWCIRCLEAT) {
            // canvas can only draw a nonuniform circle (ellipse) with a scale
            // applied to the context
            if ((sx !== sy) && !transformed) {
              ctx.save();
              ctx.translate(tx, ty);
              ctx.scale(sx, sy);
              tx = ty = 0;
              sx = sy = 1;
              transformed = true;
            }

            cx = data[i++] * sx + tx;
            cy = data[i++] * sy + ty;
            r = data[i++] * sx;
            ctx.moveTo(cx + r, cy);
            if (cmd === CMD_CIRCLEAT) {
              ctx.arc(cx, cy, r, 2 * PI, PI, true);
              ctx.arc(cx, cy, r, PI, 0, true);
            } else {
              ctx.arc(cx, cy, r, 0, 2 * PI, false);
            }
          }
        }

        if (transformed) {
          ctx.restore();
        }

        if (!test) {
          if (fill) {
            ctx.fill();
          }
          if (stroke) {
            ctx.stroke();
          }
        } else {
          if (ctx.isPointInPath(testx, testy)) {
            return this;
          }
        }
      }
    };
  }

  // VML IMPLEMENTATION

  else if (/MSIE/.test(navigator.userAgent)) {
    // ensure the page knows about the VML namespaces.
    if (!document.namespaces.v) {
      document.namespaces.add("v", "urn:schemas-microsoft-com:vml");
    }
    if (!document.namespaces.o) {
      document.namespaces.add("o", "urn:schemas-microsoft-com:office:office");
    }

    if (!document.styleSheets._acanvas_vml) {
      document.createStyleSheet().owningElement.id = "_acanvas_vml";
      // IE8 in standards mode doesn't like v\:*, so we must enumerate all the
      // elements we'll use.
      document.styleSheets._acanvas_vml.cssText = 
        "v\\:shape,v\\:fill,v\\:stroke{behavior:url(#default#VML);}";
    }

    // VML UTILITY

    dummyElement = document.createElement("div");

    // VML local coordinate spaces have some restrictions: if coordsize is
    // larger than 2^31-1, or any single coordinate is larger than 2^31-9,
    // random madness occurs (image flips, invisible elements, all subsequent
    // coords wildly transformed, etc). we try to stay centered around the
    // origin to avoid unexpected madness.
    //
    // TODO: if a circle in a path is sufficiently small (combination of
    // coordsize, circle size and css dimension), it corrupts a gradient fill on
    // the path. could shrink D to compensate. would need to be ~1000000 i
    // think.
    D = 2147483647;
    O = ~~(-D/2);

    // if we set a shape's path to the empty string, getAttribute("path")
    // returns an evil non-string which causes equality tests to throw an
    // exception. instead of always stringifying the result of getAttribute,
    // we use the following "empty path" instead of an empty string. a path
    // command of "m0,0" is serialized to this.
    EMPTY_PATH = " m0,0 l e";
    EMPTY_STROKE = "<v:stroke/>";

    // set some node as visible. if the node actually has an element, this is
    // a simple CSS change. otherwise (if this node is a group with no
    // group element), we must recurse over the children.
    setVisible = function(node, visible) {
      var element = node._elt, s,
          i, children, n;

      if (element) {
        s = element.style;

        if (s.display !== "none" ^ visible) {
          s.display = (visible ? "" : "none");
        }
      } else {
        children = node._c;
        for (i = 0, n = children.length; i < n; i++) {
          setVisible(children[i], visible);
        }
      }
    };
    getFirstElementInSubtree = function(node) {
      var i, children, n, element = node._elt;

      if (element) {
        return element;
      }

      children = node._c;
      for (i = 0, n = children.length; i < n; i++) {
        element = getFirstElementInSubtree(children[i]);

        if (element) {
          return element;
        }
      }

      return undefined;
    };
    // returns the first DOM element that would be found in a depth-first
    // traversal of the entire tree, immediately after a given child has been
    // visited. the purpose of this is to correctly insert elements into the
    // DOM, when the DOM tree of our whole canvas might be flat due to
    // group elements being optimized away. we need the correct element to
    // pass to insertElementBefore.
    getNextElement = function(p, after) {
      var i, children, n, c,
          element, next;

      while (true) {
        children = p._c;
        n = children.length;

        if (after === undefined) {
          after = n;
        } else if (typeof after !== "number") {
          for (i = 0; i < n; i++) {
            if (children[i] === after) {
              break;
            }
          }

          after = i;
        }

        for (i = after + 1; i < n; i++) {
          c = children[i];
          element = getFirstElementInSubtree(c);

          if (element) {
            return element;
          }
        }

        next = p._p;

        if (!next || p.draw) {
          break;
        }

        after = p;
        p = next;
      }

      return undefined;
    };
    // insert a child node's element (or if it has none, those of its
    // children) at a particular position in the DOM.
    childInsertBeforeElement = function(child, parentElement, beforeElement) {
      var element = child._elt, i, children, n;

      if (element) {
        parentElement.insertBefore(element, beforeElement || null);
      } else {
        children = child._c;
        for (i = 0, n = children.length; i < n; i++) {
          childInsertBeforeElement(children[i], parentElement, beforeElement);
        }
      }
    };
    childRemove = function(p, child) {
      var element = child._elt, parentElement, i, children, n;

      if (element) {
        parentElement = element.parentNode;

        if (parentElement) {
          parentElement.removeChild(element);
        }
      } else {
        children = child._c;
        for (i = 0, n = children.length; i < n; i++) {
          childRemove(child, children[i]);
        }
      }
    };
    baselineOffsetCache = {};
    getBaselineOffset = function(font) {
      var test = document.createElement('span'),
          ref = document.createElement('img'),
          refOffset,
          reset = 'margin:0;padding:0;border:0;vertical-align:baseline;text-decoration:none;';

      dummyElement.style.cssText = reset + 'position:absolute;top:0;left:0;visibility:hidden;';
      test.style.cssText = reset + 'font:' + font + ';line-height:normal;';
      ref.style.cssText = reset;
      ref.height = 1;
      ref.width = 1;

      test.appendChild(document.createTextNode('x'));

      document.body.appendChild(dummyElement);
      dummyElement.appendChild(test);
      dummyElement.appendChild(ref);

      refOffset = ref.offsetTop;

      document.body.removeChild(dummyElement);
      dummyElement.removeChild(test);
      dummyElement.removeChild(ref);

      return -refOffset;
    };

    // VML PARENT

    parentprot.insertBefore = function(child, before) {
      var index = parentArrayInsertBefore(this, child, before), canvas;

      if ((index >= 0) && (child._elt || child._c.length)) {
        canvas = this;
        while (canvas && !canvas.draw) {
          canvas = canvas._p;
        }

        if (canvas) {
          childInsertBeforeElement(child, canvas._elt,
            getNextElement(this, index));
        }
      }

      return this;
    };
    parentprot.remove = function(child) {
      var removedIndex = parentArrayRemove(this, child);

      if (removedIndex >= 0) {
        childRemove(this, child);
        child._p = undefined;
      }

      return this;
    };
    parentprot.clear = function() {
      var i, children, n;

      children = this._c;
      for (i = 0, n = children.length; i < n; i++) {
        childRemove(this, children[i]);
      }

      children.length = 0;

      return this;
    };
    parentprot._draw = function(htx, hty, hsx, hsy) {
      var pmod = this._mod, ptmod = pmod & (MOD_SCALE | MOD_TRANSLATE),
          i, children, n, child, cmod,
          ctx, cty,
          tx, ty, sx, sy;

      children = this._c;
      for (i = 0, n = children.length; i < n; i++) {
        child = children[i];
        cmod = child._mod;

        if (cmod & MOD_VISIBLE) {
          setVisible(child, child._v);
          cmod &= ~MOD_VISIBLE;
          child._mod = cmod;
        }

        // invisible children don't get processed further until they become
        // visible again.

        if (child._v) {
          ctx = child._tx;
          cty = child._ty;

          // if the parent's transforms are modified, the child's effective
          // transforms also will be
          if (ptmod) {
            cmod |= ptmod;

            // if the parent's scale is modified and the child's translation is
            // nontrivial, the child's effective translation will also be
            // changed.
            if ((pmod & MOD_SCALE) && (ctx || cty)) {
              cmod |= MOD_TRANSLATE;
            }

            child._mod = cmod;
          }

          sx = child._sx * hsx;
          sy = child._sy * hsy;
          tx = ctx * hsx + htx;
          ty = cty * hsy + hty;

          child._draw(tx, ty, sx, sy);
          child._mod = 0;
        }
      }
    };

    // VML NODE

    nodeprot._alpha2 = 1;

    // VML CANVAS

    canvasprot._construct = function() {
      var elt, s;

      canvasBaseConstruct.apply(this, arguments);

      elt = this._elt = document.createElement("div");
      s = elt.style;

      s.margin = s.padding = "0px";
      s.overflow = this._overflow ? "visible" : "hidden";
      s.position = "relative";
    };
    canvasprot._setWidth = function(width) {
      this._style.width = width + "px";
    };
    canvasprot._setHeight = function(height) {
      this._style.height = height + "px";
    };
    canvasprot._baseDraw = function() {
      // VML coordinates appear to refer to the center of a screen pixel, as
      // opposed to the edge. fix this here.
      this._draw(this._tx + this._btx - 0.5,
                 this._ty + this._bty - 0.5,
                 this._sx, this._sy);
    };

    // VML PLOTTER

    plotterprot = plotterobj.prototype = new canvasobj();
    plotterprot._overflow = true;
    plotterprot.width = plotterprot.height =
      plotterprot.path = plotterprot.group = undefined;

    plotregionprot = plotregionobj.prototype = new groupobj();

    // VML TEXT

    textprot._construct = function() {
      var elt = this._elt = document.createElement("div"),
          s = elt.style;

      elt.unselectable = "on";
      s.whiteSpace = "nowrap";
      s.cursor = "default";
      s.position = "absolute";
      s.margin = s.padding = "0px";
    };
    textprot._draw = function(tx, ty, sx, sy) {
      var mod = this._mod,
          elt, style,
          text, font, stroke, align, valign,
          minX, minY, l, t;

      if (mod) {
        elt = this._elt;
        style = elt.style;
      }

      if ((mod & MOD_TEXT) && elt.innerText !== (text = this._text)) {
        elt.innerText = text;
      }
      if ((mod & MOD_STROKE) && style.color !== (stroke = this._stroke)) {
        style.color = stroke;
      }

      // vertical change
      if (mod & (MOD_FONT | MOD_VALIGN | MOD_TRANSLATE)) {
        valign = this._valign;
        font = this._font;

        if (mod & MOD_FONT && style.font !== font) {
          style.font = font;
          style.lineHeight = "normal";
        }

        if (valign === TXT_VALIGN_BASELINE) {
          if ((minY = baselineOffsetCache[font]) === undefined) {
            minY = baselineOffsetCache[font] = getBaselineOffset(font);
          }
        } else {
          minY = -elt.offsetHeight / 2;
        }

        if (style.top !== (t = ~~(minY + ty) + 'px')) {
          style.top = t;
        }
      }

      // horizontal change
      if (mod & (MOD_TEXT | MOD_FONT | MOD_ALIGN | MOD_TRANSLATE)) {
        align = this._align;

        if (align === TXT_ALIGN_CENTER) {
          minX = -elt.offsetWidth / 2;
        } else if (align === TXT_ALIGN_RIGHT) {
          minX = -elt.offsetWidth;
        } else {
          minX = 0;
        }

        if (style.left !== (l = ~~(minX + tx) + 'px')) {
          style.left = l;
        }
      }
    };

    // VML PATH

    pathprot._keep = false;
    pathprot._construct = function() {
      pathBaseConstruct.apply(this, arguments);

      // in IE, we must construct namespace-prefixed elements using innerHTML.
      // otherwise semi-brokenness occurs: for shapes, it seems that all shapes
      // attached to the document after the first one ignore CSS positioning.

      dummyElement.innerHTML = '<v:shape coordsize="' + D + "," + D +
          '" coordorigin="' + O + ',' + O +
          '" path="' + EMPTY_PATH + 
          '" style="position:absolute;margin:0px;padding:0px;"/>';
      var elt = this._elt = dummyElement.firstChild;
      dummyElement.removeChild(elt);

      this._lf = {};
    };
    pathprot.addEventListener = function(type, listener) {
      var index = nodeArrayAddListener(this, type, listener), funcs, f,
          me = this;

      if (index >= 0) {
        f = function() {
          var p = me, e = window.event;
          while (p && !p.draw) {
            p = p._p;
          }
          if (p && p.draw) {
            fillEvent(e, p._elt);
          }
          e.canvasTarget = me;
          listener.handleEvent(e);
        };
        if (!(funcs = this._lf[type])) {
          funcs = this._lf[type] = [];
        }
        funcs[index] = f;
        this._elt.attachEvent("on" + type, f);
      }

      return this;
    };
    pathprot.removeEventListener = function(type, listener) {
      var removedIndex = nodeArrayRemoveListener(this, type, listener),
          funcs, f;

      if (removedIndex >= 0) {
        funcs = this._lf[type];
        f = funcs[removedIndex];
        funcs.splice(removedIndex, 1);
        this._elt.detachEvent("on" + type, f);
      }

      return this;
    };
    pathprot._gc = function() {
      if (!this._keep && !(this._mod & MOD_PATH_DATA)) {
        this._data = undefined;
      }
    };
    pathprot._draw = function(htx, hty, hsx, hsy) {
      var mod = this._mod,
          minX, minY, maxX, maxY,
          sx, sy, tx, ty,
          element, style,
          i, n,
          data, cmd, path, l,
          cx, cy, r,
          bminx, bminy, bmaxx, bmaxy,
          stroked, filled,
          color, ci, cl, alpha, width, strokeelt,
          fill, type, color2, alpha2, angle,
          fillelt, fillhtml,
          scolor, salpha,
          w, h, t,
          cssl, csst, cssr, cssb, cssw, cssh,
          cox, coy, csx, csy,
          wstr, hstr, lstr, tstr, csstr, costr, flip;

      if ((mod & (MOD_NEEDS_BOUND_RECALC | MOD_BOUND_IS_HINT)) === 
          MOD_NEEDS_BOUND_RECALC) {
        this._recalc();
        mod = this._mod;
      }

      if (mod & (MOD_PATH_DATA | MOD_STROKE_WIDTH | MOD_STROKE | MOD_FILL |
                 MOD_MINS | MOD_MAXS | MOD_TRANSLATE | MOD_SCALE)) {
        element = this._elt;
      }

      if (mod & (MOD_PATH_DATA |
          MOD_MINS | MOD_MAXS | MOD_TRANSLATE | MOD_SCALE)) {
        minX = this._minX;
        minY = this._minY;
        maxX = this._maxX;
        maxY = this._maxY;
      }

      // STROKE / LINEWIDTH

      if (mod & MOD_STROKE_WIDTH) {
        width = this._width + "px";
        if (element.strokeweight !== width) {
          element.strokeweight = width;
        }
      }

      if (mod & MOD_STROKE) {
        color = this._stroke || "transparent";
        cl = color.length;

        if (color === "transparent") {
          alpha = 0;
        } else if (cl > 12 &&
            color.charAt(0) === "r" && color.charAt(1) === "g" &&
            color.charAt(2) === "b" && color.charAt(3) === "a" &&
            color.charAt(4) === "(" && color.charAt(cl - 1) === ")") {
          ci = color.lastIndexOf(",");

          if (ci > 0) {
            alpha = number(color.substring(ci + 1, cl - 1)) || 0;
            color = "rgb(" + color.substring(5, ci);
            color += ")";
          } else {
            alpha = 0;
          }
        } else {
          alpha = 1;
        }

        stroked = (alpha > 0 ? "true" : "false");
        if (element.stroked !== stroked) {
          element.stroked = stroked;
        }

        if (stroked === "true") {
          if (element.strokecolor !== color) {
            element.strokecolor = color;
          }

          strokeelt = this._strokeelt;

          if (alpha < 1 && !strokeelt) {
            // we must use innerHTML or equivalent to create the <v:stroke>
            // element as a child of our shape. innerHTML on a dummy div and
            // detaching / reattaching a stroke element does not work.

            element.insertAdjacentHTML("afterBegin", EMPTY_STROKE);
            strokeelt = this._strokeelt = element.firstChild;
          }

          if (strokeelt) {
            alpha = string(alpha > 1 ? 1 : alpha > 0 ? alpha : 0);

            if (strokeelt.opacity !== alpha) {
              strokeelt.opacity = alpha;
            }
          }
        }
      }

      // FILL

      if (mod & MOD_FILL) {
        fill = this._fill;
        type = typeof fill;
        color = color2 = undefined;
        alpha = alpha2 = 0;

        if (type === "string") {
          color = fill;
        } else if (fill) {
          color = fill[0];
          color2 = fill[1];

          angle = ((this._angle - PI / 2) % (2 * PI));
          if (angle < 0) {
            angle += 2 * PI;
          }
          angle = round(angle * 180 / PI);
        }

        for (i = 0; i < 2; i++) {
          scolor = (i ? color : color2);

          if (scolor) {
            if (scolor === "transparent") {
              salpha = 0;
            } else if ((cl = scolor.length) > 12 &&
                scolor.charAt(0) === "r" && scolor.charAt(1) === "g" &&
                scolor.charAt(2) === "b" && scolor.charAt(3) === "a" &&
                scolor.charAt(4) === "(" && scolor.charAt(cl - 1) === ")") {
              ci = scolor.lastIndexOf(",");

              if (ci > 0) {
                salpha = number(scolor.substring(ci + 1, cl - 1)) || 0;
                scolor = "rgb(" + scolor.substring(5, ci);
                scolor += ")";
              } else {
                salpha = 0;
              }
            } else {
              salpha = 1;
            }

            if (i) {
              color = scolor;
              alpha = salpha;
            } else {
              color2 = scolor;
              alpha2 = salpha;
            }
          }
        }

        // we can disable / enable fills with a single parameter. if all alphas
        // are zero (or we have no fill at all), we can just use that and skip
        // further processing.

        filled = ((alpha > 0 || alpha2 > 0) ? "true" : "false");

        if (element.filled !== filled) {
          element.filled = filled;
        }

        if (filled === "true") {
          if (element.fillcolor !== color) {
            element.fillcolor = color;
          }

          type = (type === "string" ? "solid" : "gradient");

          fillelt = this._fillelt;

          // i could find no way at all to access or update o:opacity2 using
          // DHTML. tried so far:
          //
          // element.[sg]etAttribute("o:opacity2")
          // element.[sg]etAttribute("{urn:...}opacity2")
          // element.[sg]etAttribute("opacity2")
          // element.[sg]etAttributeNS("urn:...", "opacity2")
          // x = element.attributes[i].nodeValue
          // element.attributes[i].nodeValue = x
          // x = element["o:opacity2"]
          // element["o:opacity2"] = x
          // x = element["{urn:...}opacity2"]
          // element["{urn:...}opacity2"] = x
          // x = element["opacity2"]
          // element["opacity2"] = x
          // for (k in element) { ... }
          //
          // opacity2 doesn't seem to exist as a normal attribute/property.
          // tracking it in our own object and replacing the HTML seems to be
          // the only supported mechanism.

          // note that if we also need a fill element if our fill is not solid
          // opaque; since it is a namespaced element, we must create it with
          // innerHTML or equivalent anyway.

          // further, note that we must create the fill as a child of our
          // element. innerHTML on a dummy div and detach / reattach does not
          // work.

          if (fillelt ? (type !== "solid" && alpha2 !== this._alpha2) :
                        (type !== "solid" || alpha < 1)) {
            // method "none" seems closest to canvas linear gradients, which are
            // linear but color corrected. TODO: figure out what the different
            // "method" values actually do, and what combinations do.
            fillhtml = '<v:fill method="none" type="';
            fillhtml += type;
            fillhtml += '" opacity="';
            fillhtml += alpha;

            if (type !== "solid") {
              fillhtml += '" color2="';
              fillhtml += color2;
              fillhtml += '" o:opacity2="';
              fillhtml += alpha2;
              fillhtml += '" angle="';
              fillhtml += angle;

              this._alpha2 = alpha2;
            }

            fillhtml += '"/>';

            if (fillelt) {
              fillelt.outerHTML = fillhtml;
            } else {
              element.insertAdjacentHTML("afterBegin", fillhtml);
              fillelt = this._fillelt = element.firstChild;
            }
          }
          // if we can get away with just updating the fill element via DHTML,
          // do that.
          else if (fillelt) {
            if (fillelt.type !== type) {
              fillelt.type = type;
            }
            if (fillelt.opacity !== alpha) {
              fillelt.opacity = alpha;
            }

            // color2, angle and o:opacity2 are only relevant for gradient
            // fills.
            if (type !== "solid") {
              if (fillelt.color2 !== color2) {
                fillelt.color2 = color2;
              }
              if (fillelt.angle !== angle) {
                fillelt.angle = angle;
              }
            }
          }
        }
      }

      if (mod & (MOD_MINS | MOD_MAXS | MOD_TRANSLATE | MOD_SCALE)) {
        style = element.style;

        if ((minX > maxX) || (minY > maxY)) {
          if (style.display !== "none") {
            style.display = "none";
          }
        } else {
          w = (hsx < 0 ? -hsx : hsx) * (maxX - minX);
          h = (hsy < 0 ? -hsy : hsy) * (maxY - minY);
          l = (hsx < 0 ? maxX : minX) * hsx + htx;
          t = (hsy < 0 ? maxY : minY) * hsy + hty;

          // we can only set integer CSS coordinates (width, height, left, top).
          // when moving or resizing a complex element, rounding changes to the
          // nearest pixel can look clunky or jittery. for elements which have a
          // local coordinate system, we can change coordsize and coordorigin to
          // achieve subpixel alignment.

          // since we always scale our local coordinates to the maximum allowed
          // value (D) for best resolution, we cannot make our image appear
          // smaller than our CSS boundaries, so we must always undersize the CSS
          // boundaries and make our image appear slightly outside them.

          // because of the above constraint, we can only have subpixel precision
          // when the scaled element size is at least one pixel.

          // get our undersized integer CSS coordinates.
          cssl = ceil(l);
          csst = ceil(t);
          cssr = floor(l + w);
          cssb = floor(t + h);

          // if a dimension is completely within one pixel, ensure our left/top is
          // such that we are on the given pixel.
          if (cssr < l) { cssl = cssr; }
          if (cssb < t) { csst = cssb; }

          cssw = cssr - cssl;
          cssh = cssb - csst;

          // minimum width and height of 1.
          if (cssw <= 0) { cssw = 1; }
          if (cssh <= 0) { cssh = 1; }

          flip = hsx < 0 ? (hsy < 0 ? "xy" : "x") : (hsy < 0 ? "y" : "");

          // find the coordsize that fits within our undersized CSS bounds. note
          // here that cssw <= w and cssh <= h.
          csx = ~~((w < 1 ? 1 : cssw / w) * D);
          csy = ~~((h < 1 ? 1 : cssh / h) * D);
          // find the coordorigin correct for our undersized CSS left / top. CSS
          // left/top may be less than actual left/top.
          cox = O + (w < 1 || cssl < l ? 0 : ~~((cssl - l) / cssw * D));
          coy = O + (h < 1 || csst < t ? 0 : ~~((csst - t) / cssh * D));

          lstr = cssl + "px";
          tstr = csst + "px";
          wstr = cssw + "px";
          hstr = cssh + "px";

          csstr = csx + "," + csy;
          costr = cox + "," + coy;

          if (element.coordsize   !== csstr) { element.coordsize   = csstr; }
          if (element.coordorigin !== costr) { element.coordorigin = costr; }

          if (style.flip   !== flip) { style.flip   = flip; }

          if (style.left   !== lstr) { style.left   = lstr; }
          if (style.top    !== tstr) { style.top    = tstr; }
          if (style.width  !== wstr) { style.width  = wstr; }
          if (style.height !== hstr) { style.height = hstr; }
        }
      }

      // PATH DATA

      if (mod & MOD_PATH_DATA) {
        l = 0;
        path = ["m0,0"];

        sx = (minX >= maxX) ? 0 : D / (maxX - minX);
        sy = (minY >= maxY) ? 0 : D / (maxY - minY);
        tx = -((minX + maxX) / 2) * sx;
        ty = -((minY + maxY) / 2) * sy;

        data = this._data;
        for (i = 0, n = data.length; i < n; ) {
          cmd = data[i++];

          if (cmd === CMD_DELIMIT) {
            path[l++] = " e";
          } else if (cmd === CMD_LINETO) {
            path[l++] = " l";
            path[l++] = round(data[i++] * sx + tx);
            path[l++] = ",";
            path[l++] = round(data[i++] * sy + ty);
          } else if (cmd === CMD_MOVETO) {
            path[l++] = " m";
            path[l++] = round(data[i++] * sx + tx);
            path[l++] = ",";
            path[l++] = round(data[i++] * sy + ty);
          } else if (cmd === CMD_CIRCLEAT || cmd === CMD_CWCIRCLEAT) {
            cx = data[i++] * sx + tx;
            cy = data[i++] * sy + ty;
            r = data[i++];
            // zero-size circles can cause corruption in gradient fills. avoid.
            if (r > 0) {
              bminx = round(cx - r * sx);
              bminy = round(cy - r * sy);
              bmaxx = round(cx + r * sx);
              bmaxy = round(cy + r * sy);
              path[l++] = " ar";
              path[l++] = bminx;
              path[l++] = ",";
              path[l++] = bminy;
              path[l++] = " ";
              path[l++] = bmaxx;
              path[l++] = ",";
              path[l++] = bmaxy;
              path[l++] = " ";
              path[l++] = bmaxx;
              path[l++] = ",";
              path[l++] = cy = round(cy);
              path[l++] = " ";
              path[l++] = bmaxx;
              path[l++] = ",";
              path[l++] = cy;
            }
          }
        }

        path = (l ? path.join("") : EMPTY_PATH);
        element.path = path;

        if (!this._keep) {
          this._data = undefined;
        }
      }
    };
  } else {
    throw "AutonCanvas doesn't support your browser!";
  }

  plotterprot.region = function() {
    var r = new plotregionobj();
    this.add(r);
    return r;
  };
}(window));
