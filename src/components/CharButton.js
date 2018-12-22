import {UIBase} from "../UIElements"
import {Drawing} from "../Drawing"
import {Display} from "../Display"

var lastCharButton;
var charButtons = [];

export class CharButton extends UIBase
{
  constructor(x,y,c)
  {
    super(x,y,1,1);
    this.c = c;
  }
  press(buttonId)
  {
    charButtons.forEach((b)=>{b.setDirty();});
    Drawing.currentDrawing.currentChar = this.c;
    if(lastCharButton != undefined)
      lastCharButton.setDirty();
    lastCharButton = this;
    this.setDirty();
  }
  render()
  {
    let current = this.c == Drawing.currentDrawing.currentChar;
    if(current)
      lastCharButton = this;
    Display.display.draw(this.x,this.y,this.c,current?"black":"white",current?"white":"black"); 
  }
}