/*
#-----xp format version (32)
A-----number of layers (32)
 /----image width (32)
 |    image height (32)
 |  /-ASCII code (32) (little-endian!)
B|  | foreground color red (8)
 |  | foreground color green (8)
 |  | foreground color blue (8)
 | C| background color red (8)
 |  | background color green (8)
 \--\-background color blue (8)
 The file begins with the internal .xp format version number, You can ignore this value, as it is only used by REXPaint itself (in case future changes to the format are required). Note that because pre-R9 versions of REXPaint did not include an .xp version number, it's actually stored as a negative value to differentiate old image files (which begin with a positive layer count) in order to detect and automatically update them.
	The actual image data begins with A, the number of image layers (always a number from 1 to 9 in the current version), followed by a section B for each layer (the image width/height is stored for every layer due to the method of serialization used, but will always be the same values for every layer). Section C is then repeated for each cell in the image, storing the image's 2D matrix in 1D array format. I.e., the length of that matrix would equal width*height, and if you need them you can get the x-value with "index/height", and y-value with "index%height" (my own matrix class stores its data in a 1D array so I just read all the cells straight in). Note that this means the image data happens to be stored in column-major order!
	One thing to remember about directly reading .xp files is that undrawn (empty) cells on any layer (even the base layer) are considered transparent, which is identified by the background color 255,0,255. Thus to rebuild the image as seen in REXPaint, always first test a cell's background color and skip drawing those cells which are transparent, while converting any visible (i.e., non-covered) transparent cells on the lowest layer to black.
*/
const codePage437 = require('./codePage437.json');
// reverse the encoding
let decodeTable = {};
let count = 0;
codePage437.characters.forEach((e)=>{
  decodeTable[e] = count++;
});
import * as zlib from "zlib"

export class RexPaintCodec
{
  constructor()
  {
    this.layers = [];
    // currently these are stored for the total drawing, rather than per layer
    // but they need to be stored in each layer.
    this.width = 0;
    this.height = 0;
  }
  encode()
  {
    // calculate the length of the buffer we need
    // these are all in bytes, where above they are given in bits
    // 4+4+(4+4+4*width*height+24*width*height+24*width*height)*nLayers
    let numLayers = this.layers.length;
    let layerLength = this.width*this.height;
    let buffer = new ArrayBuffer(4+4+(4+4 + 4 * layerLength + 24*layerLength + 24*layerLength)*numLayers);
    let Uint8View = new Uint8Array(buffer);
    var Uint32View = new Uint32Array(buffer, 0, 4);
    let offset = 0;
    // store the preamble
    // need to look up the actual number here
    Uint32View[offset/4] = 9;
    offset += 4;
    Uint32View[offset/4] = numLayers;
    offset += 4;
    for(let l = 0;l<numLayers;l++)
    {
      // store the layer preamble
      Uint8View[offset] = this.width;
      offset += 4;
      Uint8View[offset] = this.height;
      offset += 4;
      // start storing the actual layer data
      for(let x=0;x<this.width;x++)
      {
        for(let y=0;y<this.height;y++)
        {
          // might need to force the endian ness of this data at some point
          // my system stores in row major, this gets converted to column major for rexpaint
          
          // need to fix the character encoding here
          // if there are every more than 0xff characters, then this is gonna blow up :(
          let c = decodeTable[this.layers[l][x+y*this.width].char];
          Uint8View[offset] = c;
          
          let correctOffset = offset/4;
          offset+=4;
          // store the foreground and background colors
          // fg, r, g, b
          // this makes sure that we aren't trying to push a 32 bit number into a 24 bit space
          Uint8View[offset++] = this.layers[l][x+y*this.width].fgColor >>> 0 & 0xFF;
          Uint8View[offset++] = this.layers[l][x+y*this.width].fgColor >>> 8 & 0xFF;
          Uint8View[offset++] = this.layers[l][x+y*this.width].fgColor >>> 16 & 0xFF;
          // bg, r, g, b
          Uint8View[offset++] = this.layers[l][x+y*this.width].bgColor >>> 0 & 0xFF;
          Uint8View[offset++] = this.layers[l][x+y*this.width].bgColor >>> 8 & 0xFF;
          Uint8View[offset++] = this.layers[l][x+y*this.width].bgColor >>> 16 & 0xFF;
        }
      }
    }
    // smush it with zlib
    // if I move this routine to the server, we would get much much smaller client side js file size.
    // worth doing at some point.
    let compressed = zlib.gzipSync(Buffer.from(Uint8View));
    // it might be valuable for quicker testing to return just a buffer view.
    // return Buffer.from(Uint8View);
    // send it down to the client
    return compressed;
  }
  
  decode(compressedBuffer)
  {
    let buffer = zlib.gunzipSync(Buffer.from(compressedBuffer));
    // this is a unint8array now
    console.log(buffer);
    let offset = 0;
    // store the preamble
    // need to look up the actual number here
    let version = buffer[offset];
    offset += 4;
    let nLayers = buffer[offset];
    offset += 4;
    for(let l = 0;l<nLayers;l++)
    {
      this.width = buffer[offset];
      offset += 4;
      this.height = buffer[offset];
      offset += 4;
      let currentLayer = new Array(this.width*this.height);
      // read in the layer data
      for(let x=0;x<this.width;x++)
      {
        for(let y=0;y<this.height;y++)
        {
          let cell = {};
          cell.char = codePage437.characters[buffer[offset]];
          offset += 4;
          // construct fg
          let r = buffer[offset++];
          let g = buffer[offset++];
          let b = buffer[offset++];
          cell.fgColor = r << 0
            | g << 8
            | b << 16;
          
          r = buffer[offset++];
          g = buffer[offset++];
          b = buffer[offset++];
          cell.bgColor = r << 0
            | g << 8
            | b << 16;
          currentLayer[x+y*this.width] = cell;
        }
      }
      this.layers.push(currentLayer);
    }
  }
}