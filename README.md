# About
AutonCanvas
Copyright 2011 The Auton Lab (http://autonlab.org/)

AutonCanvas is a JavaScript library for cross-browser responsive graphics primitives. It uses HTML5 Canvas on modern browsers and VML on Internet Explorer 6-8.

As of August 2015, Internet Explorer 8 still holds a 13% browser market share. I suppose this project isn't obsolete just yet.

I'm not actively maintaining this right now. I hope it provides a useful reference if it fits your constraints.

# Background and Rationale
AutonCanvas was created to fit this niche:
* Responsive (as-fast-as-possible updates) web graphics
* ...using modren methods on modern browsers
* ...using a plugin-free fallback on IE6-8 (not SVG, Java, or Flash)

On modern browsers, HTML5 Canvas is ideal for complex interactive web graphics. In my tests, SVG suffered from some performance issues in some cases.

VML was the only reasonable choice I found for plugin-free dynamic graphics on IE6-8.

So I made AutonCanvas as a common API between VML and Canvas.

Most of the engineering effort went into optimizing the use of JavaScript in the IE6-8 case. The general lesson is that creating JavaScript objects is expensive, function calls are expensive, creating DOM objects is REALLY expensive, and updating DOM object properties is more expensive than you would expect. We keep a lot of state in JavaScript and only touch the DOM when necessary.

# Known Alternatives
* [excanvas](https://github.com/arv/explorercanvas) provides a VML backend to the immediate-mode Canvas API. However this approach creates new VML DOM objects for every Canvas path, which is incredibly slow (several milliseconds) in IE 6-8. It is far faster to manipulate an existing object than to create a new one. AutonCanvas provides a retained-mode API for the same technologies, which is much faster on IE6-8.

# Demo
I wrote a couple of tests to show off the performance of plotting large amounts of data. Each example plots 1000 data points.

Try:
* The [chart line test](https://rawgit.com/sbrudenell/auton-canvas/master/test/chart-line.html) shows the performance of an interactive line chart.
* The [bubble test](https://rawgit.com/sbrudenell/auton-canvas/master/test/bubble.html) shows the performance of for example plotting data on a map.

# Tested on
* Chrome (Windows, Linux)
* Firefox (Windows, Linux)
* Internet Explorer 8 (Windows 7)
* Internet Explorer 7 (Windows 7)

I have not actually tested this with Internet Explorer 9+.

# Engineering Concerns

You would only use AutonCanvas if you are deploying to IE6-8, so you may benefit from my observations of these browser versions:

JavaScript object creation is very costly in both time and memory (I assume because of a poorly-made garbage collector). Extending arrays is fairly cheap though. If you are working with large amounts of data, I **don't** recommend this pattern:

```javascript
var data = [{x: 1, y: 2}, {x: 3, y: 4}, ...];
```

This is the object-oriented way you were probably taught in school. Instantiating `data` will create N JavaScript objects. When N = 10,000 or so, that single line of code (or likely a call to `JSON.parse()`) may take seconds.

Instead, do this:

```javascript
var x = [1, 3, ...];
var y = [2, 4, ...];
```

This creates just two JavaScript objects, which does not choke IE's JavaScript engine nearly as much. Even building an array with `Array.append()` is much faster than the object-oriented way.

Another concern is screen rendering. The rendering thread in IE6-8 seems to only run after event processing has been idle for a bit. So when mousemove events have heavy processing and also cause graphical updates (e.g. dragging a slider to update a visualization), rendering can appear to "freeze" entirely until the user stops moving the mouse. The only approach seems to be to minimize event processing.

**However**, in VML, some event processing seems to happen independent of JavaScript: if there is a complex VML path on a page, moving the mouse over the path will cause heavy processing, even if there is no event handler on the VML path object. This can be seen both in CPU usage by the browser, and rendering freezes as described above. You can see this effect with the line chart demo in IE8. The browser seems to be calculating whether a mousemove event should be fired. Unfortunately this seems to always happen, even when there is no event handler on the VML object, or even if there is some overlying DOM element that would capture the event anyway. The **only** recourse I found is to design your visualization such that the user doesn't need to move the mouse over a complex path while it's updating (e.g. put update sliders to the side of a chart; avoid making the line itself "draggable").

# Usage

AutonCanvas provides a retained-mode graphics API.

## Simple example

```javascript
// The canvas will be 900 pixels wide by 450 pixels tall, anchored to the DOM element with id "canvas".
var canvas = new auton.canvas.Canvas(900, 450, "canvas");
// Creates circle at x = 50, y = 40, with radius 10
var circle = canvas.path().data(["R", 50, 40, 10]);
// Sets the fill attribute of the circle to red (#f00)
circle.fill("#f00");
// Sets the stroke attribute of the circle to white
circle.stroke("#fff");
```

## Concepts

### Accessors

AutonCanvas uses JQuery-style accessors, which are either getter or setter depending on whether they are called with an argument.

The setter form always returns the object, so that multiple setters can be chained together.

```javascript
// Here's the getter form:
var value = thing.value();
// Here's the setter form:
thing.value("foo");
// Here are multiple setters chained together:
thing.value("foo").color("black").width("1px");
```

### CSS Colors

AutonCanvas uses CSS color strings. In general, the CSS color strings supported are browser-specific (e.g. `"hsl(...)"` is not supported in Internet Explorer).

The one exception is that we add explicit support for `"rgba(...)"` color strings in Internet Explorer. We will parse the string in JavaScript to apply alpha to VML elements.

### Canvas and the DOM

An AutonCanvas instance is tied to a fixed drawing surface. It's intended to be tied to a DOM `<div/>`.

Normally, an AutonCanvas works just like an HTML5 canvas, with a fixed width and height. However with `Canvas.autoBounds()`, you can make the canvas automatically resize to its contents. Just set:

```javascript
canvas.autoBounds(true);
```

Sub-`Element`s of AutonCanvas, like `Path`, are not necessarily DOM elements. In VML they are, but in HTML5 they are only JavaScript objects.

### Element order

Sub-`Element`s of AutonCanvas belong to a `Container`. Like DOM elements, they are drawn in the order they appear in the `Container`'s list of children. You can put `Element`s in a particular order by using `Container.insertBefore`.

### Event handling

There is no formal event handling in AutonCanvas. Internally we prevent some default event handling like text selection in the VML case, to prevent the user becoming confused.

### Transformations

AutonCanvas doesn't implement an arbitrary affine transform matrix like many other graphics frameworks. This is mainly because I couldn't figure out how to do them in VML at the time of writing.

In the VML case we apply some simple transforms using CSS `left`, `top`, `width` and `height`. This proves to be very fast.

(It might be possible to implement a transform matrix using `<vml:skew/>`. I would need time to investigate whether this is as responsive as adjusting CSS properties, and whether it would cause strange things with VML local coordinates.)

AutonCanvas provides separate scaling and translation. We don't provide rotation.

```javascript
path.scale(sx, sy);
path.translate(tx, ty);
```

AutonCanvas applies transformations to the points on the path as follows:

```
x' = x * sx + tx
y' = y * sy * ty
```

For `Container`s, transformations are applied recursively to the children.

```
x' = (x * sx + tx) * parent_sx + parent_tx
y' = (y * sy + ty) * parent_sy + parent_ty
```

### Path data

`Path`s are the most powerful sub-`Element`s in AutonCanvas. They function in a similar way to paths in VML, SVG, or HTML5 Canvas. We use the standard turtle-style drawing paradigm, and support the usual "moveto" and "lineto" commands.

The notions of sub-paths, sets of sub-paths, sub-path winding, and the implications of these on path filling are mapped in from HTML5 and VML. These have implications on filled paths. Read the documentation of those frameworks for more details.

In AutonCanvas, path commands are represented as a JavaScript array of commands and associated parameters.

```javascript
// An example path command array to draw a 100x100 rectangle.
var data = [
  "M", 0, 0,      // move to 0, 0
  "L", 100, 0,    // line to 100, 0
  "L", 100, 100,  // line to 100, 100
  "L", 0, 100,    // line to 0, 100
  "L", 0, 0,      // line to 0, 0
];
```

The full list of `Path` commands and associated parameters:

* `"M", x, y`: Move the cursor to `x, y` without drawing a line.
* `"L", x, y`: Draw a line from the cursor to `x, y`.
* `"Z"`: Delimit the current set of subpaths.
* `"R", x, y, r`: Draw a **counterclockwise** circle of radius `r` at `x, y`.
* `"r", x, y, r`: Draw a **clockwise** circle of radius `r` at `x, y`.

### Path Bounds

Due to some complexity with VML local coordinate systems*, AutonCanvas must know the minimum and maximum coordinates used in a path. This must be recalculated every time the path data changes.

(* = VML only allows integer coordinates [!], so we scale user-supplied coordinates to the largest allowed integer values. This provides maximum resolution when the path is scaled up with `Path.scale()`.)

For large paths, this calculation is wasteful. The caller will already have iterated over some large dataset to compute the path, so the caller can keep track of the min and max coordinates in the same loop. You can manually supply the bounds you know to the path element with `Path.bounds()`. A typical caller loop will look like:

```javascript
var pathData = [];
var minX = Infinity;
var minY = Infinity;
var maxX = -Infinity;
var maxY = -Infinity;
for (var i = 0; i < data.length; i++) {
  var x = data[i].x;
  var y = data[i].y;
  pathData.append("L");
  pathData.append(x);
  pathData.append(y);
  x < minX && minX = x;
  x > maxX && maxX = x;
  y < minY && minY = y;
  y > maxY && maxY = y;
}
path.data(pathData);
path.bounds(minX, minY, maxX, maxY);
```

It is fine to set the `bounds()` to be slightly larger than the actual path coordinates, but **not smaller**. If `bounds()` is set to be smaller than the path coordinates, random graphical errors will occur.

### Drawing Immediacy

AutonCanvas does not immediately commit changes to the DOM. Instead it keeps a list of what was changed, and only commits them when `Canvas.draw()` is called. This is to keep synchronous processing to an absolute minimum.

By default, an asynchronous call to `Canvas.draw()` is made (via `setTimeout()`) whenever any changes are made, so you don't need to call it yourself. You might call it synchronously if you are measuring the processing speed of `Canvas.draw()`. You might also call it in an event callback to try to get the screen to update faster (see [Engineering Concerns](#engineering-concerns). You will have to experiment with this.

### Garbage Collection

In the VML case, when a `Path` contains thousands of data points, it can consume quite a lot of browser memory. This bogs down the garbage collector and makes everything run measurably slower.

However, once the canvas is committed to the DOM with `Canvas.draw()`, AutonCanvas no longer needs the path data array at all. And in most cases, the client won't need access to the path data array either. Most paths will get redrawn from scratch when they need to be changed.

So by default, AutonCanvas removes all references to the path data array during `Canvas.draw()` and allows it to be garbage collected. `Path.data()` will return `undefined`. If want to keep the path data after drawing, call `Path.keep(true)`.

# API

## Element

An AutonCanvas object. All Elements (`Canvas`, `Group`, `Path`, etc) support these methods.

### Element.canvas()

Returns the root `Canvas` for this Element.

```javascript
var canvas = element.canvas();
```

### Element.parent()

Returns this `Element`'s parent Container.

### Element.toFront()

Move the `Element` to the foreground, within its parent `Container`.

### Element.toBack()

Move the `Element` to the background, within its parent `Container`.

### Element.remove()

Removes this `Element` from its parent `Container`.

### Element.visible(...)

Returns or sets the visibility of the `Element`.

```javascript
var visible = element.visible();
```
or
```javascript
element = element.visible(visible);
```

* `visible`: A boolean for the visibility of the `Element`.

### Element.show()

Equivalent to `element.visible(true)`.

### Element.hide()

Equivalent to `element.visible(false)`.

### Element.translate(...)

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

### Element.scale(...)

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

### Element.transform(...)

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

## Container

A `Container` is an `Element` that contains other `Elements`. Any transformations applied to a `Container` are applied to its children.

`Canvas` and `Group` support these methods.

### Container.text(...)

Create a new `Text` and add it as a child of this `Container`.

```javascript
var textElement = container.text(text, font, align, valign);
```

* `text`: The text value.
* `font`: A CSS font name.
* `align`: `"left"`, `"center"` or `"right"`.
* `valign`: `"middle"` or `"baseline"`.

### Container.image(...)

Create a new `Image` and add it as a child of this `Container`.

```javascript
var imageElement = container.image(src);
```

* `src`: The URL of the image to load.

### Container.path(...)

Create a new `Path` and add it as a child of this `Container`.

```javascript
var path = container.path(data);
```

* `data`: A path data array (see `Path`).

### Container.group(...)

Create a new `Group` container and add it as a child of this `Container`.

```javascript
var group = container.group();
```

### Container.add(...)

Add a child `Element` to this `Container`.

```javascript
container = container.add(element);
```

* `element`: a child `Element`. 

### Container.insertBefore(...)

Add a child `Element`. It will be inserted in order before some existing child `Element`.

```javascript
container = container.insertBefore(element, beforeElement);
```

* `element`: An `Element` to add as a child.
* `beforeElement`: An existing child `Element` of this `Container`. If `undefined`, `element` will be inserted last in order.

### Contianer.remove(...)

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

### Container.clear()

Remove all child `Element`s.

## Canvas(...)

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

### Canvas.element()

Returns the DOM element anchor point for the `Canvas`.

### Canvas.width(...)

Sets or returns the `Canvas` width in pixels.

```javascript
var width = canvas.width();
```
or
```javascript
canvas = canvas.width(width);
```

* `width`: The `Canvas` width in pixels.

### Canvas.height(...)

Sets or returns the `Canvas` height in pixels.

```javascript
var height = canvas.height();
```
or
```javascript
canvas = canvas.height(height);
```

* `height`: The `Canvas` height in pixels.

### Canvas.draw()

Commits any changes in the `Canvas`' content and updates the DOM.

**NOTE**: Normally, you shouldn't need to call this. It gets called asynchronously via `setTimeout` whenever any changes are made. Only consider calling it if you're doing profiling, or playing with event handler timings.

## Group(...)

A group of `Element`s. Any transformations on the `Group` are applied to its children.

```javascript
var group = auton.canvas.Group();
```

## Text(...)

A piece of text to draw on the `Canvas`.

**Note**: Scaling text is currently not implemented in VML. Where possible, it's a much better idea to keep the `Text` at a scale of 1 and change the font size.

```javascript
var text = auton.canvas.Text(textValue, font, align, valign);
```

* `textValue`: The text value.
* `font`: A CSS font for the text. Defaults to `"10px sans-serif"`.
* `align`: Horizontal alignment of the `Text` relative to its origin. May be `"left"`, `"center"` or `"right"`. Defaults to `"left"`.
* `valign`: Vertical alignment of the `Text` relative to its origin. May be `"middle"` or `"baseline"`. Defaults to `"middle"`.

### Text.text(...)

Sets or returns the text value.

```javascript
var textValue = text.text();
```
or
```javascript
text = text.text(textValue);
```

* `textValue`: The text value.

### Text.font(...)

Sets or returns the CSS font string.

```javascript
var font = text.font();
```
or
```javascript
text = text.font(font);
```

* `font`: A CSS font string.

### Text.align(...)

Sets or returns the horizontal alignment of the `Text` relative to its origin.

```javascript
var align = text.align();
```
or
```javascript
text = text.align(align);
```

* `align`: The horizontal alignment. May be `"left"`, `"center"` or `"right"`.

### Text.valign(...)

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

### Text.stroke(...)

Set or return the color of the `Text`.

```javascript
var stroke = text.stroke();
```
or
```javascript
text = text.stroke(stroke);
```

* `stroke`: A CSS color string.

## Image(...)

Renders an external image on the `Canvas`.

```javascript
var image = auton.canvas.Image(src);
```

* `src`: The source URL.

### Image.src(...)

Sets or returns the source URL of the `Image`.

```javascript
var src = image.src();
```
or
```javascript
image = image.src(src);
```

* `src`: The source URL.

### Image.origin(...)

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

## Path(...)

An arbitrary path on the `Canvas`.

Usage:

```javascript
var path = auton.canvas.Path(data);
```

* `data`: A path data array.

### Path.data(...)

Sets or returns the current path data array.

```javascript
var data = path.data();
```
or
```javascript
path = path.data(data);
```

* `data`: A path data array.

### Path.keep(...)

Sets or returns whether to trash the path data after drawing.

```javascript
var keep = path.keep();
```
or
```javascript
path = path.keep(keep);
```

* `keep`: A boolean for whether to keep the path data after drawing.

### Path.fill(...)

Sets or returns the fill color for the `Path`.

```javascript
var fill = path.fill();
```
or
```javascript
path = path.fill(fill);
```

* `fill`: A CSS color string for the `Path`'s fill.

### Path.stroke(...)

Sets or returns the stroke color for the `Path`.

```javascript
var stroke = path.stroke();
```
or
```javascript
path = path.stroke(stroke);
```

* `stroke`: A CSS color string for the `Path`'s stroke.

### Path.clear()

Clear all path data. Equivalent to `path.data(undefined)`.

### Path.bounds(...)

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
