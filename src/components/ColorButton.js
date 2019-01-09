import {UIBase} from "../UIElements"
import {Drawing} from "../Drawing"
import {Display} from "../Display"
import {HelpLine} from "./HelpLine"
import {Panel} from "./Panel"
const baseColors = require('../baseColors.json').colors;

var lastBGButton;
var lastFGButton;

var colorButtons = [];
export class ColorPanel extends Panel
{
  constructor(x,y)
  {
    // currently this is hardcoded
    // eventually will switch to a width + height defined by the character set file
    super("Color", x,y,17,13);
    for (let x = 0; x < 16; x++)
    {
      for(let y = 0; y < 12; y++)
      {
        let bColor = baseColors[x+y*16];
        let c = (bColor[0]&0xff)
            | (bColor[1]&0xff)<<8
            | (bColor[2]&0xff)<<16
            | 0xff < 24;
        let cb = new ColorButton(this.x+x+1,this.y+y+1,1,1, bColor);
        colorButtons.push(cb);
        this.addChild(cb);
      }
    }
  }
}
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