import {UIBase} from "../UIElements";
import {Drawing} from "../Drawing";
import {Display} from "../Display";
export class TextInputArea extends UIBase
{
  press(buttonId, x,y)
  {
    x -= this.x;
    if((1<<buttonId) == 2)
    {
      Drawing.currentDrawing.eyeDrop(x,y);
    }
    else
    {
      this.insertX = x;
      this.initialX = x;
      this.insertY = y;
    }
    this.setDirty();
  }
  keypress(keyCode, e)
  {
    if(this.insertX == undefined)
      return;
    // don't insert nonsense
    if(keyCode == 17 || keyCode == 18)
    {
      return;
    }
    // if we are moving with the arrows
    let dir = keyCode - 37;
    if(dir >= 0 && dir < 4)
    {
      switch(dir)
      {
        case 0:
          this.insertX--;
          break;
        case 1:
          this.insertY--;
          break;
        case 2:
          this.insertX++;
          break;
        default:
          this.insertY++;
          break;
      }
      // clamp to the correct size
      this.insertY = Math.max(this.y, Math.min(this.y+this.height-1, this.insertY));
      this.insertX = Math.max(0, Math.min(this.width-1,this.insertX));

      this.setDirty();
      return;
    }
    // handle backspace
    if(keyCode == 8)
    {
      this.insertX = Math.max(0, this.insertX-1);
      Drawing.currentDrawing.draw(this.insertX,this.insertY,' ',"black","black");

      this.setDirty();
      return;
    }
    // return
    if(keyCode == 13)
    {
      this.insertX = this.initialX;
      this.insertY++;
      this.setDirty();
      return;
    }
    let char = e.key;
    Drawing.currentDrawing.draw(this.insertX++,this.insertY,char,Drawing.currentDrawing.currentFG,Drawing.currentDrawing.currentBG);
    // if insertX went off the right side of the screen, wrap to the start position
    if(this.insertX > this.width-1)
    {
      this.insertX = this.initialX;
      this.insertY++;
      // check to make sure insert Y is still good too.
      this.insertY = Math.max(this.y, Math.min(this.y+this.height-1, this.insertY));

    }
    this.setDirty();
  }
  render()
  {
    if(this.insertX == undefined)
      return;
    if(this.lastCursor != undefined)
      Drawing.currentDrawing.redrawCell(this.lastCursor[0], this.lastCursor[1]);
    this.lastCursor = [this.insertX, this.insertY];
    // render a cursor
    Display.display.draw(this.insertX+this.x, this.insertY, '|', Drawing.currentDrawing.currentFG, Drawing.currentDrawing.currentBG); 
  }
}