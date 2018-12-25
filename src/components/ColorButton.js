import {UIBase} from "../UIElements"
import {Drawing} from "../Drawing"
import {Display} from "../Display"
import {HelpLine} from "./HelpLine"

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
    colorButtons.push(this);
    HelpLine.help.assignHelpText(this, "left click to set foreground / right click to set background");
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
    let t = " ";
    if(this.over) t = "°";
    let c = Display.convertColor(this.color);
    let cfg = Display.convertColor(Drawing.currentDrawing.currentFG);
    let cbg = Display.convertColor(Drawing.currentDrawing.currentBG);
    if(cfg == c) t = "f";
    if(cbg == c) t = "b";
    if(cfg == c && cbg == c) t = "x";
    Display.display.draw(this.x, this.y,t,this.textColor, this.color);
  }
}
ColorButton.updateAll = () => {
  colorButtons.forEach(b=>{
    b.setDirty();
  });
}