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

# Engineering Concerns

You would only use AutonCanvas if you are deploying to IE6-8, so you may benefit from my observations of these browser versions:

JavaScript object creation is very costly in both time and memory (I assume because of a poorly-made garbage collector). Extending arrays is fairly cheap though. If you are working with large amounts of data, I **don't** recommend this pattern:

```javascript
var data = [{"x": 1, "y": 2}, {"x": 3, "y": 4}, ...];
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

Normally, an AutonCanvas works just like an HTML5 canvas, with a fixed width and height. However with `Canvas.autoBounds()`, you can make the canvas automatically resize to its contents. Just set:

```javascript
canvas.autoBounds(true);
```

### Path Bounds

Due to some complexity with VML local coordinate systems (read the code comments for more), AutonCanvas must know the minimum and maximum coordinates used in a path. This must be recalculated every time the path data changes.

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

AutonCanvas does not immediately commit changes to the DOM. Instead it keeps a list of what was changed, and only commits them when `Canvas.draw()` is called. This is to keep synchronous processing to an absolute minimum.

By default, an asynchronous call to `Canvas.draw()` is made (via `setTimeout()`) whenever any changes are made, so you don't need to call it yourself. You might call it synchronously if you are measuring the processing speed of `Canvas.draw()`. You might also call it in an event callback to try to get the screen to update faster (see [Engineering Concerns](#engineering-concerns). You will have to experiment with this.

# API

(TODO STILL!)
