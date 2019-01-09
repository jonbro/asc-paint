import {UIBase} from "../UIElements"
import {Drawing} from "../Drawing"
import {Display} from "../Display"
import {HelpLine} from "./HelpLine"
import {Panel} from "./Panel"
const codePage437 = require('../codePage437.json');

var lastCharButton;
var charButtons = [];

export class CharPanel extends Panel
{
  constructor(x,y)
  {
    // currently this is hardcoded
    // eventually will switch to a width + height defined by the character set file
    super("Char", x,y,17,17);
    for (let x = 0; x < 16; x++)
    {
      for(let y = 0; y < 16; y++)
      {
        let charVal = codePage437.characters[x+y*16];
        let cb = new CharButton(this.x+x+1,this.y+y+1,charVal);
        this.addChild(cb);
      }
    }  
  }
}

export class CharButton extends UIBase
{
  constructor(x,y,c)
  {
    super(x,y,1,1);
    this.c = c;
    charButtons.push(this);
    HelpLine.help.assignHelpText(this, "left click to set char");
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

CharButton.updateAll = () => {
  charButtons.forEach(b=>{
    b.setDirty();
  });
}