import {UIBase} from "../UIElements";
import {Drawing} from "../Drawing";
import * as DrawUtilities from "../DrawUtilities"
import {Display} from "../Display"

export class Panel extends UIBase
{
  constructor(title, x,y,w,h)
  {
    super(x,y,w,h);
    this.title = title;
  }
  render()
  {
    DrawUtilities.drawSquare(this.x, this.y, this.width, this.height);
    Display.display.drawText(this.x+1, this.y, "%c{white}"+this.title);
  }

}