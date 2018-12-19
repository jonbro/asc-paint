//
class UIBase
{
  constructor(x, y, width, height)
  {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.children = [];
    this.dirty = true;
  }
  addChild(child)
  {
    this.children.push(child);
  }
  removeChild(child)
  {
    this.children.splice(this.children.indexOf(child), 1);
  }
  pointerOver()
  {
  }
  pointerOut()
  {
  }
  press()
  {
  }
  release()
  {
  }
  keypress(keyCode)
  {
  }
  setDirty()
  {
    this.dirty = true;
  }
  renderLoop()
  {
    this.children.forEach(function(c){
      c.renderLoop();
    });
    if(this.dirty)
      this.render();
    this.dirty = false;
  }
  render(){}
  // not going to support bubbling right now
  // this function tries to find the lowest possible child
  // which will consume its events, then passes it to the
  // next object up the chain if it can't
  processMove(x, y)
  {
    this.processInternal(x,y,(x,y,e)=>{
      if(UIBase.lastOver != null
         && UIBase.lastOver != e
         && UIBase.lastOver.pointerOut)
      {
        UIBase.lastOver.pointerOut();
      }
      e.pointerOver(x,y);
      UIBase.lastOver = e;
    })
  }

  processPress(x, y, buttonId)
  {
    this.processInternal(x,y,(x,y,e)=>{
      e.press(buttonId, x,y);
    });
  }
  processRelease(x,y,buttonId)
  {
    this.processInternal(x,y,(x,y,e)=>{
      e.release(buttonId, x,y);
    });
  }
  processInternal(x,y,callback)
  {
    // check to see if any children consume the event
    // do this in reverse so it process most recently added children first
    for(let i=this.children.length-1;i>=0;i--)
    {
      let c = this.children[i];
      if(c.processInternal(x,y,callback))
        return true;
    }
    if(this.pointOver(x,y))
    {
      callback(x,y, this);
      return true;
    }
    return false;
  }
  // key presses just get sent out to everyone
  processKeyPress(keyCode,e)
  {
    for(let i=this.children.length-1;i>=0;i--)
    {
      let c = this.children[i];
      c.processKeyPress(keyCode,e);
    }
    this.keypress(keyCode, e);
  }
  pointOver(x,y)
  {
    let res = x >= this.x
      && x < this.x + this.width
      & y >= this.y
      && y < this.y + this.height;

    return res;
  }
}


UIBase.lastOver = null;exports.UIBase = UIBase;
