import {UIBase} from "../UIElements";
import {Drawing} from "../Drawing";

class Panel extends UIBase
{
  constructor(title, x,y)
  {
    super(x,y,0,0);
    this.title = title;
  }
  addChild(child)
  {
    super.addChild(child);
  }
  removeChild(child)
  {
    super.removeChild(child);
  }
}