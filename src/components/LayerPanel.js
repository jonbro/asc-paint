import {UIBase,TextButton} from "../UIElements";
import {Drawing} from "../Drawing";
import {Display} from "../Display";
import * as DrawUtilities from "../DrawUtilities"

// what needs to happen:
// display buttons that let you do the following:
// add new layer button
// rename layer
// change layer order

class LayerLine extends UIBase
{
  constructor(x,y,width,height)
  {
    super(x,y,width,height);
    let renameButton = new TextButton(this.x+1,this.y,"H");
    this.addChild(renameButton);

    let deleteButton = new TextButton(this.x+this.width-1,this.y,"X");
    this.addChild(deleteButton);
    
  }
  render()
  {
    Display.display.drawText(this.x+3, this.y, "%c{white}Placeholder");
  }
}
export class LayerPanel extends UIBase
{
  constructor(x,y,width,height)
  {
    super(x,y,width,height)
    this.layerLines = [];
    let firstLayer = new LayerLine(this.x,this.y+this.height-1,this.width, 1);
    this.addChild(firstLayer);
    this.layerLines.push(firstLayer);
  }
  render()
  {
    DrawUtilities.drawSquare(this.x, this.y, this.width, this.height);
    Display.display.drawText(this.x+1, this.y, "%c{white}Layers");
  }
}