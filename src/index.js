
import {Display} from "./Display"
import {UIBase, TextButton} from "./UIElements"
import {Drawing} from "./Drawing";
import {Color} from "rot-js"

import {DrawArea} from "./components/DrawArea"
import {FillArea} from "./components/FillArea"
import {LineDrawArea} from "./components/LineDrawArea"
import {CopyHandler, PasteHandler} from "./components/CopyPasteArea"
import {TextInputArea} from "./components/TextInputArea"
import {ModeButton} from "./components/ModeButton"
import {ColorButton} from "./components/ColorButton"
import {CharButton} from "./components/CharButton"

import * as DrawUtilities from "./DrawUtilities"
const codePage437 = require('./codePage437.json');
const baseColors = require('./baseColors.json').colors;

var imgReady = false;
//var tileSet = "https://cdn.glitch.com/8d36bd76-da56-4143-81e6-fc4606765fd0%2Fc64_petscii.png?1545184518628";
var tileSet = "https://cdn.glitch.com/3a552aa6-77c2-462f-b211-c1e0fca2d303%2Foie_transparent.png?1544837688896"
var tilemap = {};

for (let x = 0; x < 16; x++)
{
  for(let y = 0; y < 16; y++)
  {
    let charVal = codePage437.characters[x+y*16];
    tilemap[charVal] = [x*10, y*16];
  }
}

var o = {
  layout: "tile",
  bg: "black",
  tileWidth: 10,
  tileHeight: 16,
  tileColorize: true,
	width: 80,
	height: 40,
  tileSet: tileSet,
  tileMap: tilemap
}
//https://cdn.glitch.com/3a552aa6-77c2-462f-b211-c1e0fca2d303%2Fcp437_10x16_terminal.png?1543891565805
var d = new Display(o);
Display.display = d;

for(var x=0;x<o.width;x++)
{
  for(var y=0;y<o.height;y++)
  {
    d.draw(x,y," ",0x00,0x00);
  }
}
document.body.appendChild(d.getContainer());

var drawing = new Drawing(80-16,40);
Drawing.currentDrawing = drawing;
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
        drawing.setData(data);
        // do the initial draw
        drawing.redrawAll();
      });

        // Your code for handling the data you get from the API
    })
    .catch(function() {
        // This is where you run code if the server returns any errors
    });
  }
}

var storageContents = window.localStorage.getItem("currentBuffer");

if(foundServerData)
{
}
else if(storageContents == undefined || storageContents == "undefined")
{
  Drawing.currentDrawing.clear();
}
else
{
  drawing.deserialize(storageContents);
}

// do the initial draw
Drawing.currentDrawing.redrawAll();


window.onbeforeunload = function (e) {
  window.localStorage.setItem("currentBuffer", drawing.serialize());
};

/// SETUP UI COMPONENTS ///
var rootUI = new UIBase(0,0,80,40);
var drawArea = new DrawArea(16,0,64,40);
var lineDrawArea = new LineDrawArea(16,0,64,40);
var copyArea = new CopyHandler(16,0,64,40);
var pasteArea = new PasteHandler(16,0,64,40);
var textInputArea = new TextInputArea(16,0,64,40);
var fillArea = new FillArea(16,0,64,40);

var currentMode = drawArea;
rootUI.addChild(drawArea);

var changeMode = function(newMode)
{
  if(currentMode.cleanupOnExit != undefined)
  {
    currentMode.cleanupOnExit();
  }
  rootUI.removeChild(currentMode);
  rootUI.addChild(newMode);
  currentMode = newMode;
}
var setupModeButton = function(text, mode)
{
  let mb = new ModeButton(1, inputYPosition++, text,mode,changeMode);
  rootUI.addChild(mb);
  if(text == "Draw")
  {
    mb.press();
  }
}
var modeButtons = [
  ["Draw", drawArea],
  ["Line", lineDrawArea],
  ["Text", textInputArea],
  ["Copy", copyArea],
  ["Paste", pasteArea],
  ["Fill", fillArea],
];

let inputYPosition = 30;
modeButtons.forEach((mb)=>{
  setupModeButton(mb[0],mb[1]);
});

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
  var data = drawing.serialize();
  xhr.send(data);
};
rootUI.addChild(saveButton);

inputYPosition++;

var clearCanvasButton = new TextButton(1,inputYPosition++,"Clear Canvas");
clearCanvasButton.press = function(){drawing.clear();};
rootUI.addChild(clearCanvasButton);

var colorButtons = [];
for (let x = 0; x < 16; x++)
{
  for(let y = 0; y < 12; y++)
  {
    let bColor = baseColors[x+y*16];
    let c = (bColor[0]&0xff)
        | (bColor[1]&0xff)<<8
        | (bColor[2]&0xff)<<16
        | 0xff < 24;
    let cb = new ColorButton(x,y,1,1, bColor);
    colorButtons.push(cb);
    rootUI.addChild(cb);
  }
}

// add character buttons
var charButtons = [];
for (let x = 0; x < 16; x++)
{
  for(let y = 0; y < 16; y++)
  {
    let charVal = codePage437.characters[x+y*16];
    let cb = new CharButton(x,y+12,charVal);
    charButtons.push(cb);
    rootUI.addChild(cb);
  }
}  
 
var mousePressed = false;
var currentFgColor = 0xffffff;
var currentBgColor = 0x000000;
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
  // draw the ui
  // now that everything needs to mark itself as dirty first,
  // we can call this every frame
  rootUI.renderLoop();
  requestAnimationFrame(()=>{updateDisplay()});

}
updateDisplay();