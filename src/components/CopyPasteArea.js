import {Drawing} from "../Drawing"
import {UIBase} from "../UIElements"
import {Display} from "../Display"
import {drawSquare} from "../DrawUtilities"

var clipboard = {};
export class PasteHandler extends UIBase
{
  pointerOver(x,y)
  {
    this.offsetX = x;
    this.offsetY = y;
    this.setDirty();
  }
  press(buttonId)
  {
    if((buttonId+1) & 1 > 0)
    {
      // copy the clipboard cells into the layer
        for(let k in clipboard)
        {
          var c = Object.assign({},clipboard[k]);
          // extract x,y components
          let components = k.split(",");
          let x = parseInt(components[0]);
          let y = parseInt(components[1]);
          x += this.offsetX;
          y += this.offsetY;
          if(x > this.x+this.width-1 || y>this.y+this.height-1)
            continue;
          Drawing.currentDrawing.set(x,y,c);
        }
     
      this.setDirty();
    }else
    {
     // changeMode(drawArea);
      this.setDirty();
    }
  }
  render()
  {
    // this could do some kind of diffing? Dunno.
    let newDirtyCells = [];
    let dirtyKeys = {};
    // copy the clipboard into the display
    for(let k in clipboard)
    {
      var c = Object.assign({},clipboard[k]);
      // extract x,y components
      let components = k.split(",");
      let x = parseInt(components[0]);
      let y = parseInt(components[1]);
      x += this.offsetX;
      y += this.offsetY;
      if(x > this.x+this.width-1 || y>this.y+this.height-1)
        continue;
      dirtyKeys[x+","+y] = true;
      newDirtyCells.push([x,y]);
      Drawing.currentDrawing.drawCellTemp(c,x,y);
    }
    // clear out the unupdated cells
    if(this.lastCells!=undefined)
    {
      this.lastCells.forEach(function(p){
        if(dirtyKeys[p[0]+","+p[1]] == undefined)
          Drawing.currentDrawing.redrawCell(p[0], p[1]);
      });
    }
    this.lastCells = newDirtyCells;
  }
  cleanupOnExit()
  {
    if(this.lastCells!=undefined)
    {
      this.lastCells.forEach(function(p){
          Drawing.currentDrawing.redrawCell(p[0], p[1]);
      });
    }
  }
}

export class CopyHandler extends UIBase
{
  press(buttonId, x,y)
  {
    this.pressDown |= (1<<buttonId);
    this.startX = x;
    this.startY = y;
  }
  release(buttonId, x,y)
  {
    this.pressDown = this.pressDown & ~(1<<buttonId);
    // if the button that was released was the left click, capture the buffer
    clipboard = {};
    let bounds = this.getBounds();
    for(let x=bounds[0]; x < bounds[0]+bounds[2];x++)
    {
      for(let y=bounds[1];y<bounds[1]+bounds[3];y++)
      {
        let k = x+","+y;
        let v = Object.assign({}, Drawing.currentDrawing.get(x-this.x,y));
        clipboard[(x-bounds[0]-this.x)+","+(y-bounds[1])] = v;
      }
    }
    console.log(clipboard);
    this.endX = this.endY = this.startY = this.startX = 0;
    this.setDirty();
  }
  pointerOver(x,y)
  {
    if(this.pressDown & 1)
    {
      this.endX = x;
      this.endY = y;
      this.setDirty();
    }
  }
  render()
  {
    if(this.lastBound != undefined)
    {
      let t = this;
      this.lastBound.forEach(function(p){
        Drawing.currentDrawing.redrawCell(p[0]-t.x, p[1]);
      });
    }
    this.lastBound = [];
    if(this.pressDown & 1)
    {
      let bounds = this.getBounds();
      this.lastBound = drawSquare(bounds[0]-1,bounds[1]-1,bounds[2]+1,bounds[3]+1);
    }
  }
  getBounds()
  {
      let x = Math.min(this.startX, this.endX);
      let y = Math.min(this.startY, this.endY);
      let w = Math.abs(this.endX - this.startX);
      let h = Math.abs(this.endY - this.startY);
      return [x,y,w,h];
  }
}