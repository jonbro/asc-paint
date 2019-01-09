import {UIBase, TextButton} from "../UIElements"
import {Drawing} from "../Drawing"
import {Display} from "../Display"
import {HelpLine} from "./HelpLine"
import {Panel} from "./Panel"
const baseColors = require('../baseColors.json').colors;

export class FilePanel extends Panel
{
  constructor(x,y)
  {
    // currently this is hardcoded
    // eventually will switch to a width + height defined by the character set file
    super("File", x,y,8,8);
    let buttonYPosition = 0;
    
    // add the buttons
    let saveButton = new TextButton(this.x+1,this.y+1+buttonYPosition++,"Share");
    HelpLine.help.assignHelpText(saveButton, "Stores to database, creates unique url for sharing");
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
      var data = Drawing.currentDrawing.serialize();
      xhr.send(data);
    };
    this.addChild(saveButton);
    
    let exportButton = new TextButton(this.x+1,this.y+1+buttonYPosition++,"Export");
    HelpLine.help.assignHelpText(exportButton, "returns the file in rexpaint format");
    exportButton.press = function(){
      Drawing.currentDrawing.exportToRexpaint();
    };
    this.addChild(exportButton);

    let clearCanvasButton = new TextButton(this.x+1,this.y+1+buttonYPosition++,"Clear");
    HelpLine.help.assignHelpText(clearCanvasButton, "Clears the current drawing, start fresh. There is no confirmation!!!");
    clearCanvasButton.press = function(){Drawing.currentDrawing.clear();};
    this.addChild(clearCanvasButton);

  }
}