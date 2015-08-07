# About
AutonCanvas
Copyright 2011 The Auton Lab (http://autonlab.org/)

AutonCanvas is a JavaScript library for cross-browser responsive graphics primitives. It uses HTML5 Canvas on modern browsers and VML on Internet Explorer 6-8.

As of August 2015, Internet Explorer 8 still holds a 13% browser market share. I suppose this project isn't obsolete just yet.

# Background and Rationale
AutonCanvas was created to fit this niche:
* Responsive (as-fast-as-possible updates) web graphics
* ...using modren methods on modern browsers
* ...using a plugin-free fallback on IE6-8 (not SVG, Java, or Flash)

On modern browsers, HTML5 Canvas is ideal for complex interactive web graphics. In my tests, SVG suffered from some performance issues in some cases.

VML was the only reasonable choice I found for plugin-free custom graphics on IE6-8.

So AutonCanvas was created as a common API between VML and Canvas.

# Known Alternatives
* [https://github.com/arv/explorercanvas](excanvas) provides a VML backend to the immediate-mode Canvas API. However this approach creates new VML DOM objects for every Canvas path, which is incredibly slow (several milliseconds) in IE 6-8. It is far faster to manipulate an existing object than to create a new one. AutonCanvas provides a retained-mode API for the same technologies, which is much faster on IE6-8.

# API
AutonCanvas provides a retained-mode graphics API.

**NOTE**: I have only implemented what I needed at the time, which was creating a couple shapes and moving them around for some simple 2D data visualization. Notably, I haven't implemented transform matricies.

(TODO)

# Tested on
* Chrome (Windows, Linux)
* Firefox (Windows, Linux)
* Internet Explorer 8 (Windows 7)
* Internet Explorer 7 (Windows 7)

I have not actually tested this with Internet Explorer 9+.
