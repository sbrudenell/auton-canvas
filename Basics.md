# basics #

an AutonCanvas lives on a webpage as a rectangular drawing canvas. you can only draw within the canvas, but you can always resize it with `canvas.width()` and `canvas.height()`.

AutonCanvas uses a retained drawing model -- you create child [CanvasNodes](CanvasNode.md) ([Paths](Path.md), [Images](Image.md), [Text](Text.md), or [Groups](Group.md) of other [CanvasNodes](CanvasNode.md)), then set and update their properties. these objects live in a hierarchy, with a [Canvas](Canvas.md) instance at the root.

[CanvasNodes](CanvasNode.md) _are not DOM elements_; you cannot attach them to your page arbitrarily.

# transformations #

[CanvasNodes](CanvasNode.md) can be scaled or moved around, but _not rotated_.

unlike [SVG](http://www.w3.org/TR/SVG/) elements, [CanvasNodes](CanvasNode.md) _don't have a full transformation matrix_. they just have a stored scale and translation.

# batch drawing #

for efficiency and visual consistency, any changes to the canvas are automatically batched together using a javascript timer. you can also force any pending canvas changes using `canvas.draw()`.

you normally never need to call `canvas.draw()`. it's most useful when dealing with timing issues in different browsers, when timer events don't fire in a timely manner.

# jQuery code conventions #

like [jQuery](http://jquery.com/), most methods in AutonCanvas double as both setters and getters, depending on whether an argument is passed ("`canvas.width(300)`" versus "`var w = canvas.width()`").

similar to [jQuery](http://jquery.com/), all methods with no return value return `this`. you can use shorthand like `canvas.width(300).draw()`.