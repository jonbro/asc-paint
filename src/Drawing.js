import {UIBase} from "./UIElements"
import {Display} from "./Display"
import {CharButton} from "./components/CharButton";
import {ColorButton} from "./components/ColorButton";
import {RexPaintCodec} from "./RexPaintCodec"

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
    // just a blank redraw function incase we are running server side
    this.drawCallback = ()=>{};
    this.clear();
  }
  // TODO: implement this
  clear()
  {
    let char = this.currentChar;
    let bg = this.currentBG;
    let fg = this.currentFG;
    this.currentBG = 0xFF000000;
    this.currentFG = 0xFFFFFFFF;
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
      return {"char": " ", "fgColor":0xFFFFFFFF, "bgColor":0xFF00000};
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
      "fgColor":Display.convertColor(val.fgColor),
      "bgColor":Display.convertColor(val.bgColor)
    };
    this.layers[layer][x+y*this.width] = cData;
    this.redrawCell(x,y);
  }
  setData(data)
  {
    // if(data.version == undefined)
    // {
    //   return;
    // }
    this.layers = data.layers;
  }
  redrawCell(x,y)
  {
    let val = this.get(x,y);
    if(val != undefined)
    {
       this.drawCallback(val, x,y);
    }
    else
    {
      this.drawCallback({"char": " ", "fgColor":0xFFFFFFFF, "bgColor":0xFF00000}, x,y);
    }
  }
  redrawAll()
  {
    for(let x=0;x<this.width;x++)
    {
      for(let y=0;y<this.height;y++)
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
    this.drawCallback({"char": this.currentChar, "fgColor":this.currentFG, "bgColor":this.currentBG}, x,y);
  }
  drawCellTemp(val, x,y)
  {
    this.drawCallback(val,x,y);
  }
  draw(x,y,char,fg,bg)
  {
    let cData = {
      "char":char,
      "fgColor":Display.convertColor(fg),
      "bgColor":Display.convertColor(bg)
    };
    this.set(x,y,cData);
  }
  eyeDrop(x,y)
  {
    let v = this.get(x,y);
    this.currentChar = v.char;
    this.currentFG = v.fgColor;
    this.currentBG = v.bgColor;
    CharButton.updateAll();
    ColorButton.updateAll();
  }
  deserializeFromJson(jsonString)
  {
    let data = JSON.parse(jsonString);
    this.setData(data);
  }
  serialize()
  {
    // always gonna do stuff with rexpaint from here on :)
    let rp = new RexPaintCodec();
    // rebuild the graphics with the correct setup... this is actually handled already, yay
    rp.layers = this.layers;
    rp.width = this.width;
    rp.height = this.height;
    return rp.encode().toString('base64');
    //return 
    return JSON.stringify({layers:this.layers, version:2});
  }
  exportToRexpaint()
  {
    // need to fill out the rexpaint data structure with the data that we have currently
    let rp = new RexPaintCodec();
    // rebuild the graphics with the correct setup... this is actually handled already, yay
    rp.layers = this.layers;
    rp.width = this.width;
    rp.height = this.height;
    let data = rp.encode();
    //console.log(data);
    var saveByteArray = (function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return function (data, name) {
            var blob = new Blob(data, {type: "octet/stream"}),
                url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = name;
            a.click();
            window.URL.revokeObjectURL(url);
        };
    }());
    saveByteArray([data.buffer], 'export.xp');
  }
  importFromRexpaint(buffer)
  {
    let rp = new RexPaintCodec();
    rp.decode(buffer);
    this.layers = rp.layers;
    this.width = rp.width;
    this.height = rp.height;
    console.log(this);
    this.redrawAll();
  }
}
Drawing.currentDrawing = null;