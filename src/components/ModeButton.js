import {TextButton} from "../UIElements"
import {Display} from "../Display"

var lastModeButton;

var allButtons = [];
export class ModeButton extends TextButton
{
  constructor(x,y,text,mode,changeMode)
  {
    super(x,y,text);
    this.mode = mode;
    this.changeMode = changeMode;
    allButtons.push(this);
  }
  pointerOut()
  {
  }
  press()
  {
    if(lastModeButton != undefined)
      lastModeButton.setDirty();
    lastModeButton = this;
    this.setDirty();
    allButtons.forEach((b)=>{
      b.activeMode = false;
      b.setDirty();
    });
    this.changeMode(this.mode);
    this.activeMode = true;
  }
  render()
  {    
    if(this.activeMode)
    {
      this.textColor = "orange";
    }
    else
    {
      this.textColor = "white";
    }
    Display.display.drawText(this.x,this.y,"%c{"+this.textColor+"}"+this.text);
  }
}
