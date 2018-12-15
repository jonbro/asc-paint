ANSI ART EDITOR FOR THE WEB :D
===============================

Make cool text mode drawings with 256 colors. Will save as you go! all the available tools are displayed, check out the todo list for the features I want to add.

CHANGE LOG
==========
*12/14/18*
- switched to a image tileset, paves the way for adding more character palettes
- this introduced a few character bugs, and also made the performance of the paste operation slightly worse, though everything else got better.

*12/13/18*
- text entry mode
- line drawing mode

*12/10/18*
- save / load - updates url with id ref pointing to saved file in DB
  - this kinda breaks the old simple saving, need to think about how to handle this

*12/8/18*
- copy / paste
- local cache saving / reloading

*12/7/18*
- make the drawing work again
- make the character selection work again
- added foreground background display on the palette

TODO
====
- figure out how to handle my short / wide screen
  - move some of the tool panels to the right?
- make saving lighter weight
- undo / redo
- crt effect
- export
- layers
- multiplayer
- hover effects on the text buttons
- different character palettes
- move the display / raw input handling stuff to a module
- draw modes
  - fill
  - rect
  - oval / circle
- have an animation loop that calls render on dirty ui elements
- look into browsersync for autorefresh (only matters for local dev)


Additional Notes
================
[to access fullscreen console](https://glitch.com/edit/console.html?asc-paint)