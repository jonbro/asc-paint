ANSI ART EDITOR FOR THE WEB :D
===============================

Make cool text mode drawings with 256 colors. Will save as you go! all the available tools are displayed, check out the todo list for the features I want to add.

CHANGE LOG
==========
*1/1/18*
- cleaned up the drawing data format
- drawing always produces continous points
- fixed issues with rect drawing
- made text drawing clamp to the draw area
- new panel art
- added import / export to rexpaint (drag & drop a .xp file to import)

*12/25/18*
- bunch of bug fixes
- added helpline
- cut a bunch of features from the 'alpha' release

*12/23/18*
- added rect mode

*12/21/18*
- added fill mode

*12/18/18*
- wrote a new display class, makes for much faster paste operations, paves the way for doing fills and other operations that require touching many cells

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

BUGS
====
- Rect draw can't fill the last line of the drawing.
  - issue here is that when the pointer goes out of a ui component, it stops recieving events, causes all sorts of other issues too. need some way to directly subscribe to events until the pointer goes up.

TODO
=========
- name file before export
- handle rexpaint transparency
- ascii mouse cursor in draw mode
- grid display
- layers
- import / export to playscii
- different character palettes
- oval / circle draw mode
- undo / redo
- crt effect
- hover effects on the text buttons
- export
- multiplayer
- look into browsersync for autorefresh (only matters for local dev)


Additional Notes
================
[to access fullscreen console](https://glitch.com/edit/console.html?asc-paint)