import {UIBase} from "../UIElements";
import {Drawing} from "../Drawing";
import * as DrawUtilities from "../DrawUtilities"

export class RectDrawArea extends UIBase
{
  press(buttonId, x,y)
  {
    x-=this.x;
    this.pressDown |= (1<<buttonId);
    if((1<<buttonId) == 2)
    {
      Drawing.currentDrawing.eyeDrop(x,y);
      return;
    }
    this.endX = this.startX = x;
    this.endY = this.startY = y;
    this.setDirty();
  }
  release(buttonId)
  {
    if((1<<buttonId) == 1)
    {
      let e = this;
      let drawPoints = DrawUtilities.getSquareCells(...this.correctPositions());
      drawPoints.forEach(function(p){
        Drawing.currentDrawing.drawWithCurrentSettings(p[0], p[1]);
        e.lastPointSet.push(p);
      });
    }
    this.pressDown = this.pressDown & ~(1<<buttonId);
  }
  pointerOver(x,y)
  {
    if(this.pressDown & 1<<0)
    {
      x-=this.x;
      this.endX = x;
      this.endY = y;
      this.setDirty();
    }
  }
  correctPositions()
  {
    // flip around the points such that you can drag in either direction
    // from your starting position
    let sx = this.startX;
    let ex = this.endX;
    let sy = this.startY;
    let ey = this.endY;
    if(this.startX>this.endX)
    {
      sx=this.endX;
      ex=this.startX;
    }
    if(this.startY>this.endY)
    {
      sy=this.endY;
      ey=this.startY;
    }
    return [sx, sy, ex-sx, ey-sy];    
  }
  render()
  {
    if(this.pressDown & 1<<0)
    {
      if(this.lastPointSet != undefined)
      {
        this.lastPointSet.forEach(function(p){
          // set back to the layer color
          Drawing.currentDrawing.redrawCell(p[0], p[1]);
        });
      }
      this.lastPointSet = [];
      let drawPoints = DrawUtilities.getSquareCells(...this.correctPositions());
      let e = this;
      drawPoints.forEach(function(p){
        Drawing.currentDrawing.drawTempWithCurrentSettings(p[0], p[1]);
        e.lastPointSet.push(p);
      });
    }
  }
}
