# Element

An AutonCanvas object. All Elements (`Canvas`, `Group`, `Path`, etc) support these methods.

## Element.canvas()

Returns the root `Canvas` for this Element.

```javascript
var canvas = element.canvas();
```

## Element.parent()

Returns this `Element`'s parent Container.

## Element.toFront()

Move the `Element` to the foreground, within its parent `Container`.

## Element.toBack()

Move the `Element` to the background, within its parent `Container`.

## Element.remove()

Removes this `Element` from its parent `Container`.

## Element.visible(...)

Returns or sets the visibility of the `Element`.

```javascript
var visible = element.visible();
```
or
```javascript
element = element.visible(visible);
```

* `visible`: A boolean for the visibility of the `Element`.

## Element.show()

Equivalent to `element.visible(true)`.

## Element.hide()

Equivalent to `element.visible(false)`.

## Element.translate(...)

Get or set the translation of the contents of the `Element`.

```javascript
var x_y_array = element.translate();
var x = element.translateX();
var y = element.translateY();
```
or
```javascript
element = element.translate(x, y);
element = element.translateX(x);
element = element.translateY(y);
```

* `x`: The shift in the x axis.
* `y`: The shift in the y axis.

## Element.scale(...)

Get or set the scaling of the contents of the `Element`.

```javascript
var x_y_array = element.scale();
var x = element.scaleX();
var y = element.scaleY();
```
or
```javascript
element = element.scale(x, y);
element = element.scaleX(x);
element = element.scaleY(y);
```

* `x`: The scale along the x dimension.
* `y`: The scale along the y dimension.

## Element.transform(...)

Get or set both the scale and translation of the `Element`.

```javascript
var transform = element.transform();
// transform looks like { t: [tx, ty], s: [sx, sy] }
```
or
```javascript
element = element.transform(tx, ty, sx, sy);
```

* `tx`: The translation in the x axis.
* `ty`: The translation in the y axis.
* `sx`: The scale along the x axis.
* `sy`: The scale along the y axis.

# Container

A `Container` is an `Element` that contains other `Elements`. Any transformations applied to a `Container` are applied to its children.

`Canvas` and `Group` support these methods.

## Container.text(...)

Create a new `Text` and add it as a child of this `Container`.

```javascript
var textElement = container.text(text, font, align, valign);
```

* `text`: The text value.
* `font`: A CSS font name.
* `align`: `"left"`, `"center"` or `"right"`.
* `valign`: `"middle"` or `"baseline"`.

## Container.image(...)

Create a new `Image` and add it as a child of this `Container`.

```javascript
var imageElement = container.image(src);
```

* `src`: The URL of the image to load.

## Container.path(...)

Create a new `Path` and add it as a child of this `Container`.

```javascript
var path = container.path(data);
```

* `data`: A path data array (see `Path`).

## Container.group(...)

Create a new `Group` container and add it as a child of this `Container`.

```javascript
var group = container.group();
```

## Container.add(...)

Add a child `Element` to this `Container`.

```javascript
container = container.add(element);
```

* `element`: a child `Element`. 

## Container.insertBefore(...)

Add a child `Element`. It will be inserted in order before some existing child `Element`.

```javascript
container = container.insertBefore(element, beforeElement);
```

* `element`: An `Element` to add as a child.
* `beforeElement`: An existing child `Element` of this `Container`. If `undefined`, `element` will be inserted last in order.

## Contianer.remove(...)

Remove a child `Element`.

```javascript
container = container.remove(element);
```
or
```javascript
// Removes this Container from its parent, like Element.remove()
container = container.remove();
```

* `element`: An existing child `Element` of this `Container`.

## Container.clear()

Remove all child `Element`s.

# Canvas(...)

Constructs a `Canvas` anchored at a DOM element.

```javascript
var canvas = auton.canvas.Canvas(width, height, elementId);
```
or
```javascript
var canvas = auton.canvas.Canvas(width, height, element);
```

* `width`: The canvas width in pixels.
* `height`: The canvas height in pixels.
* `element`: The element where the canvas should be anchored.
* `elementId`: The string id of the element where the canvas should be anchored.

## Canvas.element()

Returns the DOM element anchor point for the `Canvas`.

## Canvas.width(...)

Sets or returns the `Canvas` width in pixels.

```javascript
var width = canvas.width();
```
or
```javascript
canvas = canvas.width(width);
```

* `width`: The `Canvas` width in pixels.

## Canvas.height(...)

Sets or returns the `Canvas` height in pixels.

```javascript
var height = canvas.height();
```
or
```javascript
canvas = canvas.height(height);
```

* `height`: The `Canvas` height in pixels.

## Canvas.draw()

Commits any changes in the `Canvas`' content and updates the DOM.

**NOTE**: Normally, you shouldn't need to call this. It gets called asynchronously via `setTimeout` whenever any changes are made. Only consider calling it if you're doing profiling, or playing with event handler timings.

# Group(...)

A group of `Element`s. Any transformations on the `Group` are applied to its children.

```javascript
var group = auton.canvas.Group();
```

# Text(...)

A piece of text to draw on the `Canvas`.

**Note**: Scaling text is currently not implemented in VML. Where possible, it's a much better idea to keep the `Text` at a scale of 1 and change the font size.

```javascript
var text = auton.canvas.Text(textValue, font, align, valign);
```

* `textValue`: The text value.
* `font`: A CSS font for the text. Defaults to `"10px sans-serif"`.
* `align`: Horizontal alignment of the `Text` relative to its origin. May be `"left"`, `"center"` or `"right"`. Defaults to `"left"`.
* `valign`: Vertical alignment of the `Text` relative to its origin. May be `"middle"` or `"baseline"`. Defaults to `"middle"`.

## Text.text(...)

Sets or returns the text value.

```javascript
var textValue = text.text();
```
or
```javascript
text = text.text(textValue);
```

* `textValue`: The text value.

## Text.font(...)

Sets or returns the CSS font string.

```javascript
var font = text.font();
```
or
```javascript
text = text.font(font);
```

* `font`: A CSS font string.

## Text.align(...)

Sets or returns the horizontal alignment of the `Text` relative to its origin.

```javascript
var align = text.align();
```
or
```javascript
text = text.align(align);
```

* `align`: The horizontal alignment. May be `"left"`, `"center"` or `"right"`.

## Text.valign(...)

Sets or returns the vertical alignment of the `Text` relative to its origin.

The `"baseline"` vertical alignment corresponds to the baseline of the font. The idea is taken from the HTML5 Canvas API, though it is implemented in VML as well. See the HTML5 Canvas documentation for a full explanation of this idea.

```javascript
var valign = text.valign();
```
or
```javascript
text = text.valign(valign);
```

* `valign`: The vertical alignment. May be `"middle"` or `"baseline"`.

## Text.stroke(...)

Set or return the color of the `Text`.

```javascript
var stroke = text.stroke();
```
or
```javascript
text = text.stroke(stroke);
```

* `stroke`: A CSS color string.

# Image(...)

Renders an external image on the `Canvas`.

```javascript
var image = auton.canvas.Image(src);
```

* `src`: The source URL.

## Image.src(...)

Sets or returns the source URL of the `Image`.

```javascript
var src = image.src();
```
or
```javascript
image = image.src(src);
```

* `src`: The source URL.

## Image.origin(...)

Sets or returns the offset origin of the `Image`. This is separate from `Element.translate()`, since it can be useful to set a "center" point for the `Image` and treat translations as relative to the center.

```javascript
var x_y_array = image.origin();
var x = image.originX();
var y = image.originY();
```
or
```javascript
image = image.origin(x, y);
image = image.originX(x);
image = image.originY(y);
```

* `x`: The origin x coordinate.
* `y`: The origin y coordinate.

# Path(...)

An arbitrary path on the `Canvas`.

Usage:

```javascript
var path = auton.canvas.Path(data);
```

* `data`: A path data array.

## Path.data(...)

Sets or returns the current path data array.

```javascript
var data = path.data();
```
or
```javascript
path = path.data(data);
```

* `data`: A path data array.

## Path.keep(...)

Sets or returns whether to trash the path data after drawing.

```javascript
var keep = path.keep();
```
or
```javascript
path = path.keep(keep);
```

* `keep`: A boolean for whether to keep the path data after drawing.

## Path.fill(...)

Sets or returns the fill color for the `Path`.

```javascript
var fill = path.fill();
```
or
```javascript
path = path.fill(fill);
```

* `fill`: A CSS color string for the `Path`'s fill.

## Path.stroke(...)

Sets or returns the stroke color for the `Path`.

```javascript
var stroke = path.stroke();
```
or
```javascript
path = path.stroke(stroke);
```

* `stroke`: A CSS color string for the `Path`'s stroke.

## Path.clear()

Clear all path data. Equivalent to `path.data(undefined)`.

## Path.bounds(...)

Sets or returns the coordinate bounds of the path data array.

```javascript
var minX_minY_maxX_maxY_array = path.bounds();
```
or
```javascript
path = path.bounds(minX, minY, maxX, maxY);
```

* `minX`: The minimum X coordinate used.
* `minY`: The minimum Y coordinate used.
* `maxX`: The maximum X coordinate used.
* `maxY`: The maximum Y coordinate used.
