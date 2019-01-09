import {UIBase} from "../UIElements"
import {Drawing} from "../Drawing"
import {Display} from "../Display"
import {HelpLine} from "./HelpLine"
import {Panel} from "./Panel"
import {ModeButton} from "./ModeButton"

let currentMode = undefined;

export class ToolsPanel extends Panel
{
  constructor(x,y,toolTypeArray,rootUI)
  {
    super("Tools", x,y,8,toolTypeArray.length+1);
    this.rootUI = rootUI;
    this.modeButtons = [];
    currentMode = toolTypeArray[0][1];
    toolTypeArray.forEach((mb)=>{
      this.setupModeButton(mb[0],mb[1],mb[2]);
    });
  }

  setupModeButton(text, mode, help)
  {
    let tp = this;
    let mb = new ModeButton(1, this.y + this.modeButtons.length + 1, text,mode, (mode)=>{tp.changeMode(mode)});
    this.modeButtons.push(mb);
    this.addChild(mb);
    if(text == "Draw")
    {
      mb.press();
    }
    HelpLine.help.assignHelpText(mb, help);
  }
  changeMode(newMode)
  {
    if(currentMode.cleanupOnExit != undefined)
    {
      currentMode.cleanupOnExit();
    }
    this.rootUI.removeChild(currentMode);
    this.rootUI.addChild(newMode);
    currentMode = newMode;
  }
}
