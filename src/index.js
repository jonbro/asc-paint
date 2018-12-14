import * as ROT from "rot-js"
import {UIBase} from "./UIElements"

const codePage437 = require('./codePage437.json');
const baseColors = require('./baseColors.json').colors;

var o = {
	width: 80,
	height: 40,
  fontSize: 18
}

var d = new ROT.Display(o);
document.body.appendChild(d.getContainer());

var layer = {};
var foundServerData = false;
var path = window.location.pathname.split('/');
if(path.length == 2)
{
  var n = parseInt(path[1]);
  if(n.toString() == path[1])
  {
    foundServerData = true;
        const url='/load/'+n;

    fetch(url) // Call the fetch function passing the url of the API as a parameter
    .then(function(resp) {
      resp.json().then(function(data) {
        layer = data;
        updateDisplay();
      });

        // Your code for handling the data you get from the API
    })
    .catch(function() {
        // This is where you run code if the server returns any errors
    });
  }
}

var storageContents = window.localStorage.getItem("currentBuffer");
var clearCanvas = function()
{
  // clear the canvas
  for(let x=0;x<80;x++)
  {
    for(let y=0;y<40;y++)
    {
      drawToLayer(x,y," ","black","black");
    }
  }
}
if(foundServerData)
{
}
else if(storageContents == undefined)
{
  clearCanvas();
}
else
{
  layer = JSON.parse(storageContents);
  console.log(layer);
}

/// Utility functions ///
// sets a pixel on the current layer
function drawToLayer(x,y,c,fc,bc)
{
    layer[x+","+y] = {
      "char":c,
      "x":x,
      "y":y,
      "fgColor":fc,
      "bgColor":bc
    }
  // update the data in local storage
}

window.onbeforeunload = function (e) {
  window.localStorage.setItem("currentBuffer", JSON.stringify(layer));
};
function drawToLayerWithCurrentSettings(x,y)
{
  drawToLayer(x,y,currentChar, currentFgColor, currentBgColor);
}
function drawCellWithCurrentSettings(x,y)
{
  d.draw(x,y,currentChar, currentFgColor, currentBgColor);
}
function drawCell(cellData)
{
  let v = cellData;
  d.draw(v.x, v.y, v.char, v.fgColor, v.bgColor);
}

// draws a ui outline square
function drawSquare(x,y,width,height)
{
  for(let _x=x+1;_x<width+x;_x++)
  {
    d.draw(_x,y,"─","white","black");
    d.draw(_x,y+height,"─","white","black");
  }
  
  for(let _y=y+1;_y<height+y;_y++)
  {
    d.draw(x,_y,"│","white","black");
    d.draw(x+width,_y,"│","white","black");
  }
  d.draw(x,y,"┌","white","black");
  d.draw(x,y+height,"└","white","black");
  d.draw(x+width,y,"┐","white","black");
  d.draw(x+width,y+height,"┘","white","black");
}
function eyeDrop(x,y)
{
  let v = layer[x+","+y];
  currentChar = v.char;
  currentFgColor = v.fgColor;
  currentBgColor = v.bgColor;
}

// from here: https://stackoverflow.com/questions/4672279/bresenham-algorithm-in-javascript
function calculateLine (x1,y1, x2,y2) {
  var coordinatesArray = new Array();
  // Define differences and error check
  var dx = Math.abs(x2 - x1);
  var dy = Math.abs(y2 - y1);
  var sx = (x1 < x2) ? 1 : -1;
  var sy = (y1 < y2) ? 1 : -1;
  var err = dx - dy;
  // Set first coordinates
  coordinatesArray.push([x1, y1]);
  // Main loop
  while (!((x1 == x2) && (y1 == y2))) {
    var e2 = err << 1;
    if (e2 > -dy) {
      err -= dy;
      x1 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y1 += sy;
    }
    // Set coordinates
    coordinatesArray.push([x1, y1]);
  }
  // Return the result
  return coordinatesArray;
}

/// UI COMPONENTS ///
class DrawArea extends UIBase
{
  constructor(x,y,w,h)
  {
    super(x,y,w,h);
    this.buttonDown = 0;
  }
  draw(x,y)
  {  
    drawToLayer(x,y,currentChar,currentFgColor,currentBgColor);
    updateDisplay();
  }
  performButtonOps(x,y)
  {
    if(this.pressDown & 1)
    {
      this.draw(x,y);
    }
    if(this.pressDown & 1 << 1)
    {
      eyeDrop(x,y);
    }
  }
  press(buttonId, x,y)
  {
    this.pressDown |= (1<<buttonId);
    this.performButtonOps(x,y);
    updateDisplay();
  }
  release(buttonId)
  {
    this.pressDown = this.pressDown & ~(1<<buttonId);
  }
  pointerOver(x,y)
  {
    this.performButtonOps(x,y);
  }
}
class LineDrawArea extends UIBase
{
  press(buttonId, x,y)
  {
    this.pressDown |= (1<<buttonId);
    if((1<<buttonId) == 2)
    {
      eyeDrop(x,y);
      updateDisplay();
      return;
    }
    this.endX = this.startX = x;
    this.endY = this.startY = y;
    updateDisplay();
  }
  release(buttonId)
  {
    if((1<<buttonId) == 1)
    {
      let drawPoints = calculateLine(this.startX, this.startY, this.endX, this.endY);
      drawPoints.forEach(function(p){
        drawToLayerWithCurrentSettings(p[0],p[1]);
      });
      updateDisplay();
    }
    this.pressDown = this.pressDown & ~(1<<buttonId);
  }
  pointerOver(x,y)
  {
    if(this.pressDown & 1<<0)
    {
      this.endX = x;
      this.endY = y;
      updateDisplay();
    }
  }
  render()
  {
    if(this.pressDown & 1<<0)
    {
      let drawPoints = calculateLine(this.startX, this.startY, this.endX, this.endY);
      drawPoints.forEach(function(p){
        drawCellWithCurrentSettings(p[0], p[1]);
      });
    }
  }
}
class TextInputArea extends UIBase
{
  press(buttonId, x,y)
  {
    if((1<<buttonId) == 2)
    {
      eyeDrop(x,y);
    }
    else
    {
      this.insertX = x;
      this.initialX = x;
      this.insertY = y;
    }
    updateDisplay();
  }
  keypress(keyCode, e)
  {
    if(this.insertX == undefined)
      return;
    // don't insert nonsense
    if(keyCode == 17 || keyCode == 18)
    {
      return;
    }
    // if we are moving with the arrows
    let dir = keyCode - 37;
    if(dir >= 0 && dir < 4)
    {
      switch(dir)
      {
        case 0:
          this.insertX--;
          break;
        case 1:
          this.insertY--;
          break;
        case 2:
          this.insertX++;
          break;
        default:
          this.insertY++;
          break;
      }
      updateDisplay();
      return;
    }
    // handle backspace
    if(keyCode == 8)
    {
      drawToLayer(--this.insertX,this.insertY,' ',"black","black");
      updateDisplay();
      return;
    }
    // return
    if(keyCode == 13)
    {
      this.insertX = this.initialX;
      this.insertY++;
      updateDisplay();
      return;
    }
    let char = e.key;
    drawToLayer(this.insertX++,this.insertY,char,currentFgColor,currentBgColor);
    updateDisplay();
  }
  render()
  {
    if(this.insertX == undefined)
      return;
    // render a cursor
    d.draw(this.insertX, this.insertY, '|', currentFgColor, currentBgColor); 
  }
}
var clipboard = {};
class PasteHandler extends UIBase
{
  pointerOver(x,y)
  {
    this.offsetX = x;
    this.offsetY = y;
    updateDisplay();
  }
  press(buttonId)
  {
    if((buttonId+1) & 1 > 0)
    {
      // copy the clipboard cells into the layer
      for(let k in clipboard)
      {
        var c = Object.assign({},clipboard[k]);
        c.x += this.offsetX;
        c.y += this.offsetY;
        layer[c.x+","+c.y] = c;
      }
      updateDisplay();
    }else
    {
      changeMode(drawArea);
      updateDisplay();
    }
  }
  render()
  {
    // copy the clipboard into the display
    for(let k in clipboard)
    {
      var c = Object.assign({},clipboard[k]);
      c.x += this.offsetX;
      c.y += this.offsetY;
      drawCell(c);
    }
  }
}

class CopyHandler extends UIBase
{
  press(buttonId, x,y)
  {
    this.pressDown |= (1<<buttonId);
    this.startX = x;
    this.startY = y;
  }
  release(buttonId, x,y)
  {
    this.pressDown = this.pressDown & ~(1<<buttonId);
    // if the button that was released was the left click, capture the buffer
    clipboard = {};
    let bounds = this.getBounds();
    for(let x=bounds[0]; x < bounds[0]+bounds[2];x++)
    {
      for(let y=bounds[1];y<bounds[1]+bounds[3];y++)
      {
        let k = x+","+y;
        let v = Object.assign({}, layer[k]);
        v.x = x-bounds[0];
        v.y = y-bounds[1];
        clipboard[v.x+","+v.y] = v;
      }
    }
    this.endX = this.endY = this.startY = this.startX = 0;
    updateDisplay();
  }
  pointerOver(x,y)
  {
    if(this.pressDown & 1)
    {
      this.endX = x;
      this.endY = y;
      updateDisplay();
    }
  }
  render()
  {
    if(this.pressDown & 1)
    {
      let bounds = this.getBounds();
      drawSquare(bounds[0]-1,bounds[1]-1,bounds[2]+1,bounds[3]+1);
    }
  }
  getBounds()
  {
      let x = Math.min(this.startX, this.endX);
      let y = Math.min(this.startY, this.endY);
      let w = Math.abs(this.endX - this.startX);
      let h = Math.abs(this.endY - this.startY);
      return [x,y,w,h];
  }
}

class TextButton extends UIBase
{
  constructor(x,y,text)
  {
    super(x,y,text.length,1);
    this.text = text;
    this.textColor = "white";
  }
  render()
  {
    d.drawText(this.x,this.y,"%c{"+this.textColor+"}"+this.text);
  }
}

class ModeButton extends TextButton
{
  constructor(x,y,text,mode)
  {
    super(x,y,text);
    this.mode = mode;
  }
  press()
  {
    changeMode(this.mode);
    updateDisplay();
  }
  render()
  {
    if(this.mode == currentMode)
    {
      this.textColor = "orange";
    }
    else
    {
      this.textColor = "white";
    }
    d.drawText(this.x,this.y,"%c{"+this.textColor+"}"+this.text);
  }
}

class CharButton extends UIBase
{
  constructor(x,y,c)
  {
    super(x,y,1,1);
    this.c = c;
  }
  press(buttonId)
  {
    currentChar = this.c;
    updateDisplay();
  }
  render()
  {
    let current = this.c == currentChar;
    d.draw(this.x,this.y,this.c,current?"black":"white",current?"white":"black"); 
  }
}

class ColorButton extends UIBase
{
  constructor(x,y,w,h,color)
  {
    super(x,y,w,h);
    this.color = color;
    let colorArray = ROT.Color.fromString(this.color);
    let avgColor = (colorArray[0]+colorArray[1]+colorArray[2])/3;
    this.textColor = avgColor<128?"white":"black";
  }
  pointerOver(x,y)
  {
    this.over = true;
    updateDisplay();
  }
  pointerOut()
  {
    this.over = false;
    updateDisplay();
  }

  press(buttonId)
  {
    if(buttonId == 0)
    {
      currentFgColor = this.color;

    }
    else if(buttonId == 1)
    {
      currentBgColor = this.color;
    }
    updateDisplay();
  }
  render()
  {
    //°
    let t = " ";
    if(this.over) t = "°";
    if(currentFgColor == this.color) t = "f";
    if(currentBgColor == this.color) t = "b";
    if(currentFgColor == this.color && currentBgColor == this.color) t = "x";
    d.draw(this.x, this.y,t,this.textColor, this.color);
  }
}

/// SETUP UI COMPONENTS ///
var rootUI = new UIBase(0,0,80,40);
var drawArea = new DrawArea(16,0,64,40);
var lineDrawArea = new LineDrawArea(16,0,64,40);
var copyArea = new CopyHandler(16,0,64,40);
var pasteArea = new PasteHandler(16,0,64,40);
var textInputArea = new TextInputArea(16,0,64,40);

var currentMode = drawArea;
rootUI.addChild(drawArea);

var changeMode = function(newMode)
{
  rootUI.removeChild(currentMode);
  rootUI.addChild(newMode);
  currentMode = newMode;
}
let inputYPosition = 30;
var drawModeButton = new ModeButton(1, inputYPosition++, "Draw", drawArea);
rootUI.addChild(drawModeButton);

var lineDrawModeButton = new ModeButton(1, inputYPosition++, "Line", lineDrawArea);
rootUI.addChild(lineDrawModeButton);

var textModeButton = new ModeButton(1, inputYPosition++, "Text", textInputArea);
rootUI.addChild(textModeButton);

var copyModeButton = new ModeButton(1,inputYPosition++,"Copy", copyArea);
rootUI.addChild(copyModeButton);

var pasteModeButton = new ModeButton(1,inputYPosition++,"Paste", pasteArea);
rootUI.addChild(pasteModeButton);

inputYPosition++;

var saveButton = new TextButton(1,inputYPosition++,"Save");
saveButton.press = function(){
  
  var xhr = new XMLHttpRequest();
  var url = "/save";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type","text/plain;charset=UTF-8");
  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        window.location.href = "/" + xhr.responseText;
      }
  };
  var data = JSON.stringify(layer);
  xhr.send(data);
};
rootUI.addChild(saveButton);


var clearCanvasButton = new TextButton(1,36,"Clear Canvas");
clearCanvasButton.press = function(){clearCanvas();updateDisplay();};
rootUI.addChild(clearCanvasButton);

for (let x = 0; x < 16; x++)
{
  for(let y = 0; y < 12; y++)
  {
    rootUI.addChild(new ColorButton(x,y,1,1, ROT.Color.toRGB(baseColors[x+y*16])));
  }
}
// add character buttons
for (let x = 0; x < 16; x++)
{
  for(let y = 0; y < 16; y++)
  {
    let charVal = codePage437.characters[x+y*16];
    rootUI.addChild(new CharButton(x,y+12,charVal));
  }
}  
 
var mousePressed = false;
var currentFgColor = "white";
var currentBgColor = "black";
var currentChar = "-";

/// INPUT HANDLING ///
var lastButtonState = 0;
d.getContainer().oncontextmenu = function(e){return false;};
d.getContainer().onmousemove = function(e)
{
  let p = d.eventToPosition(e);
  rootUI.processMove(p[0], p[1]);
}
d.getContainer().onmousedown = function(e)
{
  let p = d.eventToPosition(e);
  lastButtonState = e.buttons;
  rootUI.processPress(p[0], p[1],e.buttons==1?0:1);
}
d.getContainer().onmouseup = function(e)
{
  let p = d.eventToPosition(e);
  let buttonUp = lastButtonState & (~e.buttons);
  rootUI.processRelease(p[0], p[1],buttonUp==1?0:1);
  lastButtonState = e.buttons;
}
var shiftDown = false;
document.onkeydown = function(e)
{
  if(e.keyCode == 16)
  {
    shiftDown = true;
    return;
  }
  if(e.keyCode >= 37 && e.keyCode < 41)
  {
    e.preventDefault();
  }
  rootUI.processKeyPress(e.keyCode, e);
}
document.onkeyup = function(e)
{
  if(e.keyCode == 16)
  {
    shiftDown = false;
  }
}

var updateDisplay = function()
{
  // draw the layers
  for(let k in layer)
  {
    drawCell(layer[k]);
  }
  // draw the ui
  rootUI.renderLoop();
}
updateDisplay();