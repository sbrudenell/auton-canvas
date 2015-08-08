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

VML was the only reasonable choice I found for plugin-free custom graphics on IE6-8.

So I made AutonCanvas as a common API between VML and Canvas.

Most of the engineering effort went into optimizing the use of JavaScript in the IE6-8 case. The general lesson is that creating JavaScript objects is expensive, creating DOM objects is REALLY expensive, and updating DOM object properties is more expensive than you would expect. We keep a lot of state in JavaScript and only touch the DOM when necessary.

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

# API
AutonCanvas provides a retained-mode graphics API.

**NOTE**: I have only implemented what I needed at the time, which was creating a couple shapes and moving them around for some simple 2D data visualization. Notably, I haven't implemented transform matricies.

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

### Canvas

An AutonCanvas instance is tied to a fixed drawing surface. It's intended to be tied to a DOM `<div/>`.

Normally, an AutonCanvas works just like an HTML5 canvas, with a fixed width and height. However with `autoBounds`, you can make the canvas automatically resize to its contents. Just set:

```javascript
canvas.autoBounds(true);
```

### Path Bounds

Due to some complexity with VML local coordinate systems (read the code comments for more), AutonCanvas must find the minimum and maximum coordinates used in a path. This must be updated every time the path data changes.

For large paths, this is wasteful. The caller will already have iterated over some large dataset to compute the path; it's easy to keep track of the min and max coordinates within the same loop. You can manually supply the bounds you know to the path element with `Path.bounds()`. A typical caller loop will look like:

```javascript
var pathData = [];
var minX = Infinity;
var minY = Infinity;
var maxX = -Infinity;
var maxY = -Infinity;
for (var i = 0; i < data.length; i++) {
  var x = data[i].x;
  var y = data[i].y;
  pathData += "L";
  pathData += x;
  pathData += y;
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

AutonCanvas does not immediately commit changes to the DOM. Instead it keeps a list of what was changed, and only commits them when `Canvas.draw()` is called. This is to keep JavaScript processing to an absolute minimum, especially in response to user events.

By default, an asynchronous call to `Canvas.draw()` is made (via `setTimeout()`) whenever any changes are made, so you don't need to call it yourself. You might call it synchronously if you are measuring the processing speed of `Canvas.draw()`. You might also call it in an event callback to try to get the screen to update faster. You will have to experiment with this.
