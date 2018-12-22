import {UIBase} from "./UIElements"
import {Display} from "./Display"
function drawCell(cellData)
{
  let v = cellData;
  Display.display.draw(v.x+16, v.y, v.char, v.fgColor, v.bgColor);
}

export class Drawing
{
  constructor(width, height)
  {
    this.layers = [[]];
    this.currentLayer = 0;
    this.currentBG = 0x000000;
    this.currentFG = 0xFFFFFF;
    this.currentChar = "-";
    this.width = width;
    this.height = height;
    this.clear();
  }
  // TODO: implement this
  clear()
  {
    let char = this.currentChar;
    let bg = this.currentBG;
    let fg = this.currentFG;
    this.currentBG = 0x000000;
    this.currentFG = 0xFFFFFF;
    this.currentChar = " ";

    for(let x=0;x<this.width;x++)
    {
      for(let y=0;y<this.height;y++)
      {
        this.drawWithCurrentSettings(x,y);
      }
    }
    this.currentChar = char;
    this.currentBG = bg;
    this.currentFG = fg;

  }
  get(x,y,layer)
  {
    if(layer == undefined)
    {
      layer = this.currentLayer;
    }
    //console.log(x+y*this.width);
    let res = this.layers[layer][x+y*this.width];
    //console.log(x,y, res);
    if(this.layers[layer] == undefined || x+y*this.width == NaN || res == undefined)
    {
      return {"char": " ", "fgColor":0xFFFFFF, "bgColor":0x00000};
    }
    return res;
  }
  set(x,y,val,layer)
  {
    if(layer == undefined)
    {
      layer = this.currentLayer;
    }
    let cData = {
      "char":val.char,
      "x":x,
      "y":y,
      "fgColor":val.fgColor,
      "bgColor":val.bgColor
    };
    this.layers[layer][x+y*this.width] = cData;
    this.redrawCell(x,y);
  }
  setData(data)
  {
    this.layers = data;
  }
  redrawCell(x,y)
  {
    let val = this.get(x,y);
    if(val != undefined)
    {
       drawCell(val);
    }
    else
    {
      drawCell({"x":x,"y":y,"char": " ", "fgColor":0xFFFFFF, "bgColor":0x00000});
    }
  }
  redrawAll()
  {
    for(let x=0;x<80-16;x++)
    {
      for(let y=0;y<40;y++)
      {
        this.redrawCell(x,y);
      }
    }
  }
  drawWithCurrentSettings(x,y)
  {
    this.draw(x,y,this.currentChar,this.currentFG,this.currentBG);
  }
  drawTempWithCurrentSettings(x,y)
  {
    drawCell({"x":x,"y":y,"char": this.currentChar, "fgColor":this.currentFG, "bgColor":this.currentBG});
  }
  drawCellTemp(val)
  {
    drawCell(val);
  }
  draw(x,y,char,fg,bg)
  {
    let cData = {
      "char":char,
      "x":x,
      "y":y,
      "fgColor":fg,
      "bgColor":bg
    };
    this.set(x,y,cData);
  }
  eyeDrop(x,y)
  {
    let v = this.get(x,y);
    this.currentChar = v.char;
    this.currentFG = v.fgColor;
    this.currentBG = v.bgColor;
  }
  deserialize(jsonString)
  {
    console.log(jsonString);
    this.layers = JSON.parse(jsonString);
  }
  serialize()
  {
    return JSON.stringify(this.layers);
  }
}
Drawing.currentDrawing = null;