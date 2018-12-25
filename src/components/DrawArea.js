import {UIBase} from "../UIElements";
import {Drawing} from "../Drawing";
import {HelpLine} from "./HelpLine";

export class DrawArea extends UIBase
{
  constructor(x,y,w,h)
  {
    super(x,y,w,h);
    this.buttonDown = 0;
    HelpLine.help.assignHelpText(this, "left click to draw / right click to pick up color + char");
  }
  draw(x,y)
  {
    Drawing.currentDrawing.drawWithCurrentSettings(x,y);
  }
  performButtonOps(x,y)
  {
    x-=this.x;
    if(this.pressDown & 1)
    {
      this.draw(x,y);
    }
    if(this.pressDown & 1 << 1)
    {
      Drawing.currentDrawing.eyeDrop(x,y);
    }
  }
  press(buttonId, x,y)
  {
    this.pressDown |= (1<<buttonId);
    this.performButtonOps(x,y);
  }
  release(buttonId)
  {
    this.pressDown = this.pressDown & ~(1<<buttonId);
  }
  pointerOver(x,y)
  {
    this.performButtonOps(x,y);
  }
}