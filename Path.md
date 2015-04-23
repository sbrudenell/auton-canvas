# Path #

Paths are the most versatile expressive objects in AutonCanvas. they can draw arbitrary shapes, described by a language modeled on [SVG's path language](http://www.w3.org/TR/SVG/paths.html#PathData).

a Path can be stroked (outlined), filled, or both. a single Path may only have one [stroke color](#colors.md) and one [fill style](#fills.md); if you want a multi-colored line or multi-colored area, you should use multiple Paths.

# data #

Path data is passed as an `Array` instead of a `String`, contrary to many graphics frameworks. in a data array, a path instruction is followed by a variable number of arguments. for example:

```
// a circle, overlapping a square

var data = [
  'M', 0, 0,
  'L', 0, 100,
  'L', 100, 100,
  'L', 100, 0,
  'L', 0, 0,
  'E',
  'R', 100, 100, 50
];

path.data(data);
```

the above data would draw a circle of radius `50` centered on `100,100`, overlapping a square from `0,0` to `100,100`. note how the `'R'` instruction takes 3 arguments, `'M'` and `'L'` take two, and `'E'` takes none.

_you must tell the Path if you change the data array after the fact._ the Path won't be able to tell this happened on its own.

```
// add a small circle at 50,50
// (in the middle of the square)

data = data.concat(['E', 'R', 50, 50, 25]);
path.data(data);
```

for complex paths with many instructions, it's good practice to set the minimum and maximum coordinate bounds (see [data coordinate bounds](#data_coordinate_bounds.md)). our example isn't very complex, but here are the bounds we would set:

```
// set the coordinate bounds, so the Path
// doesn't have to calculate them itself

path.bounds(0, 0, 150, 150);
```

# colors #

Path colors are passed as `String`s.

  * `"rgba(...)"` is specially supported in IE6-8.
  * `"transparent"` is specially supported in IE6-8.

in all other cases, color `String`s are passed directly to the browser. it's a good idea to use HTML color strings like `"#0a0"`, which work in all browsers.

as of version 1.2, AutonCanvas _does not_ specially handle `"hsl(...)"` or `"hsla(...)"` color strings.

# fills #

Paths support two styles of fill: simple (solid) fills, and two-tone linear gradient fills.

a simple fill is passed as just a [color string](#colors.md):

```
// transparent green fill

path.fill('rgba(0, 170, 0, 0.5)');
```

a linear gradient fill is passed as an `Array` of two [color strings](#colors.md), and an optional angle:

```
// fill fades from transparent to black, from left to right

path.fill(['transparent', 'black']);

// fill fades from transparent to black, from bottom to top

path.fill(['transparent', 'black'], Math.PI / 2);
```

# transformations #

unlike [SVG](http://www.w3.org/TR/SVG/) paths, _Path stroke lines never scale_. the default 1-pixel Path stroke will be 1 screen pixel wide even when the path is scaled by 10.

see [more on transformations](Basics#transformations.md).

# implementation #

in the VML implementation, Paths are implemented by `<v:shape>` elements. the HTML5 implementation re-reads the [data array](#data.md) each time the canvas is drawn, calling instructions like `ctx.moveTo()`, `ctx.lineTo()`, `ctx.stroke()` and `ctx.fill()`.

## data coordinate bounds ##

the VML and HTML5 implementations both need to know the minimum and maximum x and y coordinates of any Path.

the implementations can calculate these bounds on their own. however, for complex paths, _you can **greatly** speed things up by setting the approximate bounds yourself!_ in many cases, you may know the approximate bounds of your path beforehand.

it's easy to do:

```
// set the coordinate bounds, so the Path
// doesn't have to calculate them itself

path.bounds(minX, minY, maxX, maxY);
```

it's fine if you supply an _overestimate_ of the bounds, but _it must not be an underestimate_. no part of the Path should fall outside the bounds, including the edges of circles.

the tolerance of the bounds depends largely on the use of gradient [fills](#fills.md):

  * gradient [fills](#fills.md) appear inaccurate in the HTML5 implementation if the bounds are more than 10% larger than the true bounds.
  * Path coordinates will appear inaccurate in the VML implementation if your bounds are very large after scaling (~100 million units in magnitude). this is an uncommon case: if your scaled path is less than 10 million units in both dimensions, your bounds can be up to 1000% larger than the true bounds.

### data coordinate bounds example ###

the [bubble demo](Demos#bubbles.md) uses a single Path to draw many bubbles. they are randomly positioned in a rectangular area from `0,0` to `W,H`, and have a random radius from `0` to `R`. the code to construct the path looks like this:

```
// construct the data array
for (i = 0; i < n; i++) {
  var cx = Math.random() * W,
      cy = Math.random() * H,
      r = Math.random() * R;
  data.push("R", cx, cy, r, "E");
}

// set the data array
path.data(data);
// set the data coordinate bounds, overestimating slightly
path.bounds(-R, -R, W + R, H + R);
```

we extend the `W`-by-`H` area by `R` in both dimensions, to include the edges of the outermost circles. this provides a reasonable overestimate.

## data array retention ##

to save memory and memory management time, _the VML implementation will forget the [data array](#data.md)_ once the canvas has been drawn. `path.data()` will return `undefined`.

if you don't want this to happen, call `path.keep(true)`.

## known issues ##

TODO

# see also #

[code reference](Reference#auton.canvas.Path.md)