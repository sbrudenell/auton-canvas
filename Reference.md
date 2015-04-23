# table of contents #



# reference #

## CanvasNode ##

**main article**: [CanvasNode](CanvasNode.md).

_**note**_: the [CanvasNode](#CanvasNode.md) is an "abstract" type. it is not exposed directly through the API, as it is not meant to be instantiated or extended directly.

| **method** | **return type** | **description** | **since** |
|:-----------|:----------------|:----------------|:----------|
| `canvas()` | [Canvas](#auton.canvas.Canvas.md) | returns the root [Canvas](#auton.canvas.Canvas.md) this node is directly or indirectly attached to, if any. | 1.0 |
| `parent()` | [Group](#auton.canvas.Group.md) | returns the [Group](#auton.canvas.Group.md) this node is directly attached to, if any. | 1.0 |
| `toBack()` | `this` | sends this node to the rear-most (lowest-index) position in its parent [Group](#auton.canvas.Group.md). | 1.0 |
| `toFront()` | `this` | sends this node to the rear-most (lowest-index) position in its parent [Group](#auton.canvas.Group.md). | 1.0 |
| `remove()` | `this` | removes this node from its parent [Group](#auton.canvas.Group.md). | 1.0 |
| `visible()` | `Boolean` | gets whether this node is visible. | 1.0 |
| `visible(visible:Boolean)` | `this` | sets whether this node is visible. | 1.0 |
| `show()` | `this` | sets this node to be visible. equivalent to `visible(true)`. | 1.0 |
| `hide()` | `this` | sets this node to be hidden. equivalent to `visible(false)`. | 1.0 |
| `transform()` | `Object` | gets the translation and scale, in the form `{"t": [tx, ty], "s": [sx, sy]}`. see [transformations](Basics#transformations.md). | 1.0 |
| `transform(tx:Number, ty:Number, sx:Number, sy:Number)` | `this` | sets the translation and scale. see [transformations](Basics#transformations.md). | 1.0 |
| `translate()` | `Array` | gets the translation, in the form `[tx, ty]`. see [transformations](Basics#transformations.md). | 1.0 |
| `translate(tx:Number, ty:Number)` | `this` | sets the translation. see [transformations](Basics#transformations.md). | 1.0 |
| `scale()` | `Array` | gets the scale, in the form `[sx, sy]`. see [transformations](Basics#transformations.md). | 1.0 |
| `scale(sx:Number, sy:Number)` | `this` | sets the scale. see [transformations](Basics#transformations.md). | 1.0 |
| `translateX()` | `Number` | gets the x-translation. see [transformations](Basics#transformations.md). | 1.0 |
| `translateX(tx:Number)` | `this` | sets the x-translation. see [transformations](Basics#transformations.md). | 1.0 |
| `translateY()` | `Number` | gets the y-translation. see [transformations](Basics#transformations.md). | 1.0 |
| `translateY(ty:Number)` | `this` | sets the y-translation. see [transformations](Basics#transformations.md). | 1.0 |
| `scaleX()` | `Number` | gets the x-scale. see [transformations](Basics#transformations.md). | 1.0 |
| `scaleX(sx:Number)` | `this` | sets the x-scale. see [transformations](Basics#transformations.md). | 1.0 |
| `scaleY()` | `Number` | gets the y-scale. see [transformations](Basics#transformations.md). | 1.0 |
| `scaleY(sy:Number)` | `this` | sets the y-scale. see [transformations](Basics#transformations.md). | 1.0 |

## auton.canvas.Canvas ##

extends [Group](#auton.canvas.Group.md).

**main article**: [Canvas](Canvas.md).

| **constructor** | **description** | **since** |
|:----------------|:----------------|:----------|
| `Canvas([width:Number, height:Number [,element:Node]])` | creates a new `Canvas` of `width` pixels by `height` pixels (defaults to 300x150), attached to `element`. | 1.0 |
| `Canvas([width:Number, height:Number [,elementId:String]])` | creates a new `Canvas` of `width` pixels by `height` pixels (defaults to 300x150), attached to the element with id `elementId`. this constructor calls `document.getElementById`, so you should only use it after the document has loaded. | 1.0 |

| **method** | **returns** | **description** | **since** |
|:-----------|:------------|:----------------|:----------|
| `element()` | `Node` | returns the root element of this `Canvas`. | 1.0 |
| `width()` | `Number` | gets the current width, in pixels. | 1.0 |
| `width(width:Number)` | `this` | sets the current width, in pixels. the width is not changed immediately; it is changed the next time the canvas is drawn. | 1.0 |
| `height()` | `Number` | gets the current height, in pixels. | 1.0 |
| `height(height:Number)` | `this` | sets the current height, in pixels. the height is not changed immediately; it is changed the next time the canvas is drawn. | 1.0 |
| `draw()` | `this` | forces all pending changes to be drawn immediately. | 1.0 |
| `onAttach()` | `this` | TODO | 1.2 |
| `onDetach()` | `this` | TODO | 1.2 |

## auton.canvas.Group ##

extends [CanvasNode](#CanvasNode.md).

**main article**: [Group](Group.md).

| **constructor** | **description** | **since** |
|:----------------|:----------------|:----------|
| `Group()` | creates a new `Group` | 1.0 |

| **method** | **return type** | **description** | **since** |
|:-----------|:----------------|:----------------|:----------|
| `text([text:String [,font:String [,align:String [,valign:String]]]])` | [Text](#auton.canvas.Text.md) | creates a new [Text](#auton.canvas.Text.md), adds it to this [Group](#auton.canvas.Group.md), and returns it. | 1.0 |
| `image([src:String])` | [Image](#auton.canvas.Image.md) | creates a new [Image](#auton.canvas.Image.md), adds it to this [Group](#auton.canvas.Group.md), and returns it. | 1.2 |
| `path([data:Array])` | [Path](#auton.canvas.Path.md) | creates a new [Path](#auton.canvas.Path.md), adds it to this [Group](#auton.canvas.Group.md), and returns it. | 1.0 |
| `group()` | [Group](#auton.canvas.Group.md) | creates a new [Group](#auton.canvas.Group.md), adds it to this one, and returns the new child [Group](#auton.canvas.Group.md). | 1.0 |
| `add(child:CanvasNode)` | `this` | adds an existing [CanvasNode](#CanvasNode.md) as a child at the end of this [Group](#auton.canvas.Group.md). equivalent to `insertBefore(child, undefined)`. | 1.0 |
| `insertBefore(child:CanvasNode, before?)` | `this` | inserts an existing [CanvasNode](#CanvasNode.md) as a child of this [Group](#auton.canvas.Group.md), such that it occurs before `before`. `before` may be a `Number` specifying an index, or another child [CanvasNode](#CanvasNode.md). if `before` is unspecified or doesn't refer to a known child, then `child` is inserted at the end of this [Group](#auton.canvas.Group.md) | 1.0 |
| `remove(child:CanvasNode)` | `this` | removes a child [CanvasNode](#CanvasNode.md). | 1.0 |
| `clear()` | `this` | removes all child [CanvasNode](#CanvasNode.md)s. | 1.0 |

## auton.canvas.Path ##

extends [CanvasNode](#CanvasNode.md).

**main article**: [Path](Path.md).

| **constructor** | **description** | **since** |
|:----------------|:----------------|:----------|
| `Path([data:Array])` | creates a new [Path](#auton.canvas.Path.md), with the given `data`. | 1.0 |

| **method** | **return type** | **description** | **since** |
|:-----------|:----------------|:----------------|:----------|
| `data()` | `Array` | gets the path data. see [path data](Path#data.md). | 1.0 |
| `data(data:Array)` | `this` | sets the path data. see [path data](Path#data.md). | 1.0 |
| `clear()` | `this` | clears the path data. equivalent to `data(undefined)`. see [path data](Path#data.md). | 1.0 |
| `fill()` | `Array` or `String` | gets the fill. see [path fills](Path#fills.md). | 1.0 |
| `fill(fill:String)` | `this` | sets a simple fill. see [path fills](Path#fills.md). | 1.0 |
| `fill(fill:Array [,angle:Number])` | `this` | sets a linear gradient fill. see [path fills](Path#fills.md). | 1.0 |
| `fill(fill:undefined)` | `this` | unsets the fill. | 1.0 |
| `stroke()` | `String` | gets the stroke color. see [path colors](Path#colors.md). | 1.0 |
| `stroke(stroke:String)` | `this` | sets the stroke color. see [path colors](Path#colors.md). | 1.0 |
| `stroke(stroke:undefined)` | `this` | unsets the stroke. | 1.0 |
| `strokeWidth()` | `Number` | gets the stroke width, in pixels. see [path transformations](Path#transformations.md). | 1.0 |
| `strokeWidth(strokeWidth:Number)` | `this` | sets the stroke width, in pixels. see [path transformations](Path#transformations.md). | 1.0 |
| `bounds()` | `Array` | gets the coordinate bounds of the path data, in the form `[minX, minY, maxX, maxY]`. see [path data coordinate bounds](Path#data_coordinate_bounds.md). | 1.0 |
| `bounds(minX:Number, minY:Number, maxX:Number, maxY:Number)` | `this` | sets the coordinate bounds of the path data. see [path data coordinate bounds](Path#data_coordinate_bounds.md). | 1.0 |
| `keep()` | `Boolean` | gets whether the [Path](#auton.canvas.Path.md) should retain its `data` array after drawing. see [path data array retention](Path#data_array_retention.md). | 1.2 |
| `keep(keep:Boolean)` | `this` | sets whether the [Path](#auton.canvas.Path.md) should retain its `data` array after drawing. see [path data array retention](Path#data_array_retention.md). | 1.2 |

### path instructions ###

| **instruction** | **name** | **arguments** | **description** | **since** |
|:----------------|:---------|:--------------|:----------------|:----------|
| **`M`** | moveto | `x`, `y` | begins a new sub-path at `x,y`. | 1.0 |
| **`L`** | lineto | `x`, `y` | draws a line from the current point to `x,y`. | 1.0 |
| **`R`**, **`r`** | circleat, cwcircleat | `x`, `y`, `radius` | begins a new sub-path, and draws a circle centered at `x,y` with radius `radius`. **`R`** and **`r`** draw anticlockwise and clockwise circles, respectively. | 1.0 |
| **`E`** | delimit | _none_ | fills the current set of sub-paths with the path's fill, and begins a new set of sub-paths. | 1.0 |

## auton.canvas.Text ##

extends [CanvasNode](#CanvasNode.md).

**main article**: [Text](Text.md).

| **constructor** | **description** | **since** |
|:----------------|:----------------|:----------|
| `Text([text:String [,font:String [,align:String [,valign:String]]]])` | creates a new [Text](#auton.canvas.Text.md), with the given `text`, `font`, `align` and `valign`. see `text(text:String)`, `font(font:String)`, `align(align:String)` and `valign(align:String)` for meanings and requirements on these fields. | 1.0 |

| **method** | **return type** | **description** | **since** |
|:-----------|:----------------|:----------------|:----------|
| `text()` | `String` | gets the displayed text value. | 1.0 |
| `text(text:String)` | `this` | sets the displayed text value. | 1.0 |
| `font()` | `String` | gets the font string. | 1.0 |
| `font(font:String)` | `this` | sets the font string. the format is the same as [the css shorthand "font" property](http://www.w3.org/TR/CSS2/fonts.html#font-shorthand). | 1.0 |
| `align()` | `String` | gets the horizontal alignment. | 1.0 |
| `align(align:String)` | `this` | sets the horizontal alignment. must be one of the horizontal alignment constants, explained below. | 1.0 |
| `valign()` | `String` | gets the vertical alignment. | 1.0 |
| `valign(valign:String)` | `this` | sets the vertical alignment. must be one of the vertical alignment constants, explained below. | 1.0 |
| `stroke()` | `String` | gets the text color. | 1.0 |
| `stroke(stroke:String)` | `this` | sets the text color. | 1.0 |

### horizontal alignment constants ###

| **value** | **description** | **since** |
|:----------|:----------------|:----------|
| `"left"` | left horizontal alignment. the x-origin of the text will be at the leftmost edge. see [transformations](Basics#transformations.md). | 1.0 |
| `"right"` | right horizontal alignment. the x-origin of the text will be at the rightmost edge. see [transformations](Basics#transformations.md). | 1.0 |
| `"center"` | center horizontal alignment. the x-origin of the text will be in the middle of the text. see [transformations](Basics#transformations.md). | 1.0 |

### vertical alignment constants ###

| **value** | **description** | **since** |
|:----------|:----------------|:----------|
| `"middle"` | middle vertical alignment. the y-origin of the text will be in the middle of the text. see [transformations](Basics#transformations.md). | 1.0 |
> | `"baseline"` | baseline vertical alignment. the y-origin of the text will be at the alphabetic baseline of the text. see [transformations](Basics#transformations.md). | 1.2 |

## auton.canvas.Image ##

extends [CanvasNode](#CanvasNode.md).

**main article**: [Image](Image.md).

| **constructor** | **description** | **since** |
|:----------------|:----------------|:----------|
| `Image([src:String])` | creates a new [Image](#auton.canvas.Image.md), with source URL `src`. | 1.2 |

| **method** | **return type** | **description** | **since** |
|:-----------|:----------------|:----------------|:----------|
| `src()` | `String` | gets the source URL. | 1.2 |
| `src(src:String)` | `this` | sets the source URL. | 1.2 |
| `origin()` | `Array` | gets a user-specified origin, in the form `[ox, oy]`. see [transformations](Basics#transformations.md). | 1.2 |
| `origin(x:Number, y:Number)` | `this` | sets a user-specified origin. see [transformations](Basics#transformations.md). | 1.2 |
| `originX()` | `Number` | gets the user-specified x-origin. see [transformations](Basics#transformations.md). | 1.2 |
| `originX(ox:Number)` | `this` | sets the user-specified x-origin. see [transformations](Basics#transformations.md). | 1.2 |
| `originY()` | `Number` | gets the user-specified y-origin. see [transformations](Basics#transformations.md). | 1.2 |
| `originY(oy:Number)` | `this` | sets the user-specified y-origin. see [transformations](Basics#transformations.md). | 1.2 |