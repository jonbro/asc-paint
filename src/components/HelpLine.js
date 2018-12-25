import {UIBase} from "../UIElements"
import {Drawing} from "../Drawing"
import {Display} from "../Display"

export class HelpLine extends UIBase
{
  constructor(x,y,w,h)
  {
    super(x,y,w,h);
    HelpLine.help = this;
    this.helpElements = {};
    this.currentText = "";
    let t = this;
    UIBase.hoverCallback = (e)=>{
      this.updateCurrentHoveredElement(e);
    }
  }
  assignHelpText(element, text)
  {
    this.helpElements[element.uid] = text;
  }
  updateCurrentHoveredElement(element)
  {
    if(this.helpElements[element.uid] != undefined)
    {
      this.currentText = this.helpElements[element.uid];
    }
    else
    {
      this.currentText = "";
    }
    this.setDirty();
  }
  render()
  {
    // clear then rerender text
    for(let x = this.x; x < this.x+this.width;x++)
    {
      Display.display.draw(x, this.y, " ", 0x000000, 0x000000);
    }
    Display.display.drawText(this.x, this.y, "%c{white}"+this.currentText);
  }
}