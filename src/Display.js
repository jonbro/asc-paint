import {Color} from "rot-js"
import {Text} from "rot-js"
// welp, it happened. I am rewriting the rotjs display class to get more speed.
/*
var o = {
  layout: "tile",
  bg: "black",
  tileWidth: 10,
  tileHeight: 16,
  tileColorize: true,
	width: 120,
	height: 40,
  fontSize: 18,
  tileSet: tileSet,
  tileMap: tilemap
}
*/
// going to keep using rotjs for the color stuff
export class Display
{
  constructor(options)
  {
    this.randState = 13;
    this.options = options;
    this.canvas = document.createElement('canvas');
    
    // set the canvas size and cache these values
    // it seems like reading them back from the element is slower
    this.cw = this.canvas.width = this.options.tileWidth * this.options.width;
    this.ch = this.canvas.height = this.options.tileHeight * this.options.height;
    
    this.context = this.canvas.getContext("2d");
    
    this.context.fillStyle = "black";
    this.context.fillRect(0,0,this.cw,this.ch);

    // set up the buffer we are going to draw to
    this.drawBufferImage = this.context.getImageData(0, 0, this.cw, this.ch);
    var canvasbuf = new ArrayBuffer(this.drawBufferImage.data.length);
    this.canvasbuf8 = new Uint8ClampedArray(canvasbuf);
    this.canvasdata = new Uint32Array(canvasbuf);
    
    // start the tilesetLoad
    this.tileSetLoaded = false;
    this.tileSetImg = document.createElement("img");
    let d = this;
    this.tileSetImg.onload  = ()=>{d.spriteLoadComplete()};
    this.tileSetImg.crossOrigin = "Anonymous";
    this.tileSetImg.src = this.options.tileSet;
    this.dirty = false;
    // kick off the draw loop
    this.drawInternal();
  }
  getImageData(img)
  {
    var tmpCanvas = document.createElement('canvas');
    var tmpContext = tmpCanvas.getContext('2d');
    this.tilesheetWidth = img.width;
    this.tilesheetHeight = img.height;
    tmpCanvas.width = img.width;
    tmpCanvas.height = img.height;
    tmpContext.drawImage(img, 0, 0);
    var myData = tmpContext.getImageData(0, 0, img.width, img.height);
    return myData;
  }
  spriteLoadComplete()
  {

    // load the image data from the tiles
    this.tileogData = this.getImageData(this.tileSetImg).data;
    var tilebuf = new ArrayBuffer(this.tileogData.length);
    var tilebuf8 = new Uint8ClampedArray(tilebuf);
    this.tiledata = new Uint32Array(tilebuf);
    tilebuf8.set(this.tileogData);

    this.tileSetLoaded = true;
    // now that we have completed the load, redraw everything that was requested before the image was loaded
    if(this.preloadDraws !== undefined)
    {
      for(let i=0;i<this.preloadDraws.length;i++)
      {
        let e = this.preloadDraws[i];
        this.draw(e[0], e[1], e[2], e[3], e[4]);
      }
      this.preloadDraws = [];
    }
    
  }
  getContainer()
  {
    return this.canvas;
  }
  drawText(x, y, text, maxWidth) {
      let fg = null;
      let bg = null;
      let cx = x;
      let cy = y;
      let lines = 1;
      if (!maxWidth) {
          maxWidth = this.options.width - x;
      }
      let tokens = Text.tokenize(text, maxWidth);
      while (tokens.length) {
          let token = tokens.shift();
          switch (token.type) {
              case Text.TYPE_TEXT:
                  let isSpace = false, isPrevSpace = false, isFullWidth = false, isPrevFullWidth = false;
                  for (let i = 0; i < token.value.length; i++) {
                      let cc = token.value.charCodeAt(i);
                      let c = token.value.charAt(i);
                      isFullWidth = (cc > 0xff00 && cc < 0xff61) || (cc > 0xffdc && cc < 0xffe8) || cc > 0xffee;
                      isSpace = (c.charCodeAt(0) == 0x20 || c.charCodeAt(0) == 0x3000);
                      if (isPrevFullWidth && !isFullWidth && !isSpace) {
                          cx++;
                      }
                      if (isFullWidth && !isPrevSpace) {
                          cx++;
                      }
                      this.draw(cx++, cy, c, fg, bg);
                      isPrevSpace = isSpace;
                      isPrevFullWidth = isFullWidth;
                  }
                  break;
              case Text.TYPE_FG:
                  fg = token.value || null;
                  break;
              case Text.TYPE_BG:
                  bg = token.value || null;
                  break;
              case Text.TYPE_NEWLINE:
                  cx = x;
                  cy++;
                  lines++;
                  break;
          }
      }
      return lines;
  }
  rand()
  {
    /* Algorithm "xor" from p. 4 of Marsaglia, "Xorshift RNGs" */
    var x = this.randState;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    this.randState = x;
    return x;
  }

  eventToPosition(e)
  {
    let x, y;
    if ("touches" in e) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
    }
    else {
        x = e.clientX;
        y = e.clientY;
    }
    let canvas = this.context.canvas;
    let rect = canvas.getBoundingClientRect();
    x -= rect.left;
    y -= rect.top;
    x *= canvas.width / rect.width;
    y *= canvas.height / rect.height;
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
        return [-1, -1];
    }
    return [Math.floor(x / this.options.tileWidth), Math.floor(y / this.options.tileHeight)];
  }
  draw(x,y,char,fg,bg)
  {
    if(!this.tileSetLoaded)
    {
      if(this.preloadDraws == undefined)
      {
        this.preloadDraws = [];
      }
      this.preloadDraws.push([x,y,char,fg,bg]);
      return;
    }
    if(x < 0 || x >= this.options.width || y < 0 || y >= this.options.height)
      return;
    //should do some clamping to make sure we aren't drawing out of bounds stuff
    let tile = this.options.tileMap[char];
    if(tile != undefined)
    {
      /*
      fg = this.rand()|(0xff<<24);
      bg = this.rand()|(0xff<<24);
      */
      fg = Display.convertColor(fg);
      if(bg == undefined)
      {
        bg = 0x00;
      }
      bg = Display.convertColor(bg);
      this.drawTile(tile[0], tile[1], x*this.options.tileWidth, y*this.options.tileHeight, fg, bg);
    }
  }
  
  drawTile(sx, sy, dx, dy, fg, bg)
  {
    // not sure if storing these locals helps or not, but just in case
    let cw = this.cw;
    let tsw = this.tilesheetWidth;
    for(let x=0, lenX = this.options.tileWidth;x<lenX;x++)
    {
      // pre calc these values so we don't need to do them on
      // the inner loop
      let ddx = (dx+x);
      let dsx = (sx+x);
      for(let y=0, lenY = this.options.tileHeight;y<lenY;y++)
      {
        // only perform this lookup once
        let tdata = this.tiledata[(dsx+(sy+y)*tsw)];
        this.canvasdata[(ddx+(dy+y)*cw)] = 0xff<<24 | tdata&fg | ~tdata&bg;
      }
    }
    this.dirty = true;
  }
  drawInternal()
  {
    let d = this;
    // early out if we aren't ready to draw yet
    if(!this.tileSetLoaded || !this.dirty)
    {
      requestAnimationFrame(()=>{d.drawInternal()});
      return;
    }
    this.dirty = false;
    this.drawBufferImage.data.set(this.canvasbuf8);
    this.context.putImageData(this.drawBufferImage, 0, 0);
    requestAnimationFrame(()=>{d.drawInternal()});
  }
}

Display.convertColor = function(c)
{
  if(typeof(c) == "string")
  {
    c = Color.fromString(c);
  }
  if(typeof(c) == "object")
  {
    // convert to our good representation
    c = (c[0]&0xff)
    | (c[1]&0xff)<<8
    | (c[2]&0xff)<<16;
  }
  return c;
}