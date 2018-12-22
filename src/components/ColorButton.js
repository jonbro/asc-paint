import {UIBase} from "../UIElements"
import {Drawing} from "../Drawing"
import {Display} from "../Display"

var lastBGButton;
var lastFGButton;

var colorButtons = [];

export class ColorButton extends UIBase
{
  constructor(x,y,w,h,color)
  {
    super(x,y,w,h);
    this.color = color;
    let colorArray = this.color;
    let avgColor = (colorArray[0]+colorArray[1]+colorArray[2])/3;
    this.textColor = avgColor<128?"white":"black";
  }
  pointerOver(x,y)
  {
    this.over = true;
    this.setDirty();
  }
  pointerOut()
  {
    this.over = false;
    this.setDirty();
  }

  press(buttonId)
  {
    colorButtons.forEach((b)=>{b.setDirty();});
    if(buttonId == 0)
    {
      if(lastFGButton != undefined)
      {
        lastFGButton.setDirty();
      }
      lastFGButton = this;
      Drawing.currentDrawing.currentFG = this.color;
    }
    else if(buttonId == 1)
    {
      if(lastBGButton != undefined)
      {
        lastBGButton.setDirty();
      }
      lastBGButton = this;
      Drawing.currentDrawing.currentBG = this.color;

    }
    this.setDirty();
  }
  render()
  {
    //°
    let t = " ";
    if(this.over) t = "°";
    if(Drawing.currentDrawing.currentFG == this.color) t = "f";
    if(Drawing.currentDrawing.currentBG == this.color) t = "b";
    if(Drawing.currentDrawing.currentFG == this.color && Drawing.currentDrawing.currentBG == this.color) t = "x";
    Display.display.draw(this.x, this.y,t,this.textColor, this.color);
  }
}