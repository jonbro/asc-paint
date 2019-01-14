var forceNew = false;

import {Display} from "./Display"
import {UIBase, TextButton} from "./UIElements"
import {Drawing} from "./Drawing";
import {Color} from "rot-js"

import {DrawArea} from "./components/DrawArea"
import {FillArea} from "./components/FillArea"
import {LineDrawArea} from "./components/LineDrawArea"
import {CopyHandler, PasteHandler} from "./components/CopyPasteArea"
import {TextInputArea} from "./components/TextInputArea"
import {RectDrawArea} from "./components/RectDrawArea"

import {ToolsPanel} from "./components/ToolsPanel"
import {FilePanel} from "./components/FilePanel"
import {ColorPanel, ColorButton} from "./components/ColorButton"
import {Panel} from "./components/Panel"
import {CharButton, CharPanel} from "./components/CharButton"
import {LayerPanel} from "./components/LayerPanel"
import {HelpLine} from "./components/HelpLine";
//import * as CharSets from "charsets";

import * as DrawUtilities from "./DrawUtilities"
const codePage437 = require('./codePage437.json');
const baseColors = require('./baseColors.json').colors;

var imgReady = false;
//var tileSet = "https://cdn.glitch.com/8d36bd76-da56-4143-81e6-fc4606765fd0%2Fc64_petscii.png?1545184518628";
var tileSet = "https://cdn.glitch.com/3a552aa6-77c2-462f-b211-c1e0fca2d303%2Foie_transparent.png?1544837688896"
var tilemap = {};

var leftPanelWidth = 18;

for (let x = 0; x < 16; x++)
{
  for(let y = 0; y < 16; y++)
  {
    let charVal = codePage437.characters[x+y*16];
    tilemap[charVal] = [x*10, y*16];
  }
}
// need a way to post facto get the tile size stuff in
// maybe it is fine to just overwrite it after load though?
var o = {
  layout: "tile",
  bg: "black",
  tileWidth: 10,
  tileHeight: 16,
  tileColorize: true,
	width: 82,
	height: 42,
  tileSet: "/charset/img/dos40",
  tileMap: tilemap
}
//https://cdn.glitch.com/3a552aa6-77c2-462f-b211-c1e0fca2d303%2Fcp437_10x16_terminal.png?1543891565805
var d = new Display(o);
Display.display = d;
// load the info from the charset and set up the display
fetch("/charset/info/dos40") // Call the fetch function passing the url of the API as a parameter
.then(function(resp) {
  resp.json().then(function(data) {
    console.log(data);
    d.setInfo(data);
  });
});
  
for(var x=0;x<o.width;x++)
{
  for(var y=0;y<o.height;y++)
  {
    d.draw(x,y," ",0x00,0x00);
  }
}
for(var x=0;x<o.width;x++)
{
  d.draw(x,40," ", 0x00, 0x222222);
}
document.body.appendChild(d.getContainer());

var drawing = new Drawing(80-16,40);
Drawing.currentDrawing = drawing;
Drawing.currentDrawing.drawCallback = function(cellData,x,y)
{
  let v = cellData;
  Display.display.draw(x+leftPanelWidth, y, v.char, v.fgColor, v.bgColor);
}


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
      resp.text().then(function(data) {
        console.log(data);
        drawing.importFromRexpaint(new Buffer(data, 'base64'));
        //drawing.setData(data);
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
else if( forceNew || storageContents == undefined || storageContents == "undefined")
{
  Drawing.currentDrawing.clear();
}
else
{
  try {
    JSON.parse(storageContents);
    drawing.deserializeFromJson(storageContents);
  } catch (e) {
    // falling back to rexpaint format
    drawing.importFromRexpaint(new Buffer(storageContents, 'base64'));
  }
}

// do the initial draw
Drawing.currentDrawing.redrawAll();


window.onbeforeunload = function (e) {
  window.localStorage.setItem("currentBuffer", drawing.serialize());
};

/// SETUP UI COMPONENTS ///
var rootUI = new UIBase(0,0,80,40);
rootUI.addChild(new HelpLine(0,41,80,1));

// setup all the different draw panel modes
var drawArea = new DrawArea(leftPanelWidth,0,64,40);
var lineDrawArea = new LineDrawArea(leftPanelWidth,0,64,40);
var rectDrawArea = new RectDrawArea(leftPanelWidth,0,64,40);
var copyArea = new CopyHandler(leftPanelWidth,0,64,40);
var pasteArea = new PasteHandler(leftPanelWidth,0,64,40);
var textInputArea = new TextInputArea(leftPanelWidth,0,64,40);
var fillArea = new FillArea(leftPanelWidth,0,64,40);

var currentMode = drawArea;
rootUI.addChild(drawArea);

var modeButtons = [
  ["Draw", drawArea, "draw characters"],
  ["Line", lineDrawArea, "draw lines"],
  ["Rect", rectDrawArea, "create filled rectangles"],
  ["Text", textInputArea, "write text"],
  ["Fill", fillArea, "fill area / paint bucket"],
  ["Copy", copyArea, "copy from canvas"],
  ["Paste", pasteArea, "paste to canvas"],
];

rootUI.addChild(new ToolsPanel(0,14+18,modeButtons,rootUI));
rootUI.addChild(new FilePanel(9, 14+18));
//var layerPanel = new LayerPanel(79,0,16,10);

let inputYPosition = 60;
inputYPosition++;
const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};


inputYPosition++;


// add character buttons
rootUI.addChild(new CharPanel(0,0,16,16));

// add color buttons
rootUI.addChild(new ColorPanel(0,18,16,16));

var mousePressed = false;
var currentFgColor = 0xffffff;
var currentBgColor = 0x000000;
var currentChar = "-";

/// INPUT HANDLING ///
var lastButtonState = 0;
d.getContainer().oncontextmenu = function(e){return false;};
if ('ontouchstart' in window) {
  d.getContainer().addEventListener('touchstart',function(e)
  {
    if(e.changedTouches.length == 1)
      e.preventDefault();
    let p = d.eventToPosition(e);
    rootUI.processPress(p[0], p[1],0);
  });
  d.getContainer().addEventListener('touchmove',function(e)
  {
    if(e.changedTouches.length == 1)
      e.preventDefault();
    let p = d.eventToPosition(e);
    rootUI.processMove(p[0], p[1]);
  });
  d.getContainer().addEventListener('touchend',function(e)
  {
    let p = d.eventToPosition(e);
    rootUI.processRelease(p[0], p[1],0);
    lastButtonState = e.buttons;
  });
}else
{
d.getContainer().onmousemove = function(e)
{
  e.preventDefault();
  let p = d.eventToPosition(e);
  rootUI.processMove(p[0], p[1]);
}
d.getContainer().onmousedown = function(e)
{
  e.preventDefault();
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
 document.addEventListener("drop", function(e) {
  // prevent default action (open as link for some elements)
  e.preventDefault();
  let ev = e;
  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (ev.dataTransfer.items[i].kind === 'file') {
        var file = ev.dataTransfer.items[i].getAsFile();
        console.log('items', file);
        var reader = new FileReader();
        reader.addEventListener("loadend", function() {
           // reader.result contains the contents of blob as a typed array
          console.log(reader.result);
          // we are just gonna load into the current drawing for now
          Drawing.currentDrawing.importFromRexpaint(reader.result);
        });
        reader.readAsArrayBuffer(file);
        //console.log('... file[' + i + '].name = ' + file.name);
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
      console.log(ev.dataTransfer.files[i]);
      //console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
    }
  } 
  console.log("got drop", e);    
}, false);
document.ondragover = function(e)
{
    e.preventDefault(); 
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