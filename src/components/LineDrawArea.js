import {UIBase} from "../UIElements";
import {Drawing} from "../Drawing";
import * as DrawUtilities from "../DrawUtilities"

export class LineDrawArea extends UIBase
{
  press(buttonId, x,y)
  {
    x-=this.x;
    this.pressDown |= (1<<buttonId);
    if((1<<buttonId) == 2)
    {
      Drawing.drawing.eyeDrop(x,y);
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
      let drawPoints = DrawUtilities.calculateLine(this.startX, this.startY, this.endX, this.endY);
      drawPoints.forEach(function(p){
        Drawing.currentDrawing.drawWithCurrentSettings(p[0],p[1]);
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
      let drawPoints = DrawUtilities.calculateLine(this.startX, this.startY, this.endX, this.endY);
      let e = this;
      drawPoints.forEach(function(p){
        Drawing.currentDrawing.drawTempWithCurrentSettings(p[0], p[1]);
        e.lastPointSet.push(p);
      });
    }
  }
}
