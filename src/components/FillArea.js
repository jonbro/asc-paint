import * as DrawUtilities from "../DrawUtilities";
import {UIBase} from "../UIElements"
import {Drawing} from "../Drawing"
import {Display} from "../Display"

function floodFillScanline(x, y, width, height, diagonal, test, paint) {
    // xMin, xMax, y, down[true] / up[false], extendLeft, extendRight
    var ranges = [[x, x, y, null, true, true]];
    paint(x, y);

    while(ranges.length) {
        var r = ranges.pop();
        var down = r[3] === true;
        var up =   r[3] === false;

        // extendLeft
        var minX = r[0];
        var y = r[2];
        if(r[4]) {
            while(minX>0 && test(minX-1, y)) {
                minX--;
                paint(minX, y);
            }
        }
        var maxX = r[1];
        // extendRight
        if(r[5]) {
            while(maxX<width-1 && test(maxX+1, y)) {
                maxX++;
                paint(maxX, y);
            }
        }

        if(diagonal) {
            // extend range looked at for next lines
            if(minX>0) minX--;
            if(maxX<width-1) maxX++;
        }
        else {
            // extend range ignored from previous line
            r[0]--;
            r[1]++;
        }

        function addNextLine(newY, isNext, downwards) {
            var rMinX = minX;
            var inRange = false;
            for(var x=minX; x<=maxX; x++) {
                // skip testing, if testing previous line within previous range
                var empty = (isNext || (x<r[0] || x>r[1])) && test(x,newY);
                if(!inRange && empty) {
                    rMinX = x;
                    inRange = true;
                }
                else if(inRange && !empty) {
                    ranges.push([rMinX, x-1, newY, downwards, rMinX==minX, false]);
                    inRange = false;
                }
                if(inRange) {
                    paint(x, newY);
                }
                // skip
                if(!isNext && x==r[0]) {
                    x = r[1];
                }
            }
            if(inRange) {
                ranges.push([rMinX, x-1, newY, downwards, rMinX==minX, true]);
            }
        }

        if(y<height-1)
            addNextLine(y+1, !up, true);
        if(y>0)
            addNextLine(y-1, !down, false);
    }
}
// http://will.thimbleby.net/scanline-flood-fill/

export class FillArea extends UIBase
{
  press(buttonId, x,y)
  {
    this.pressDown |= (1<<buttonId);
    if((1<<buttonId) == 1)
    {
      if(this.tempBuffer != undefined)
      {
        this.tempBuffer.forEach((v)=>{
          Drawing.currentDrawing.drawWithCurrentSettings(v[0],v[1]);
        });
        this.lastBuffer = this.tempBuffer;
      }
    }
    this.setDirty();
  }
  release(buttonId)
  {
    this.pressDown = this.pressDown & ~(1<<buttonId);
  }
  pointerOut()
  {
    // need to clear whatever temp drawing we have
    this.tempBuffer = [];
    this.setDirty();
  }
  pointerOver(x,y)
  {
    x-=this.x;
    if(this.currentX == undefined || (this.currentX != x || this.currentY != y))
    {
      this.tempBuffer = [];
      this.currentX = x;
      this.currentY = y;
      var startVal = Drawing.currentDrawing.get(x,y);
      //Drawing.currentDrawing.drawWithCurrentSettings(x,y);
      this.tempBuffer = [];
      //console.log(Drawing.currentDrawing);
      //return;
      this.filled = {};
      floodFillScanline(x, y, Drawing.currentDrawing.width, Drawing.currentDrawing.height, false, (x,y)=>{
        let n = Drawing.currentDrawing.get(x,y);
        return this.filled[x+","+y] == undefined
          && (n.char == startVal.char
          && n.fgColor == startVal.fgColor
          && n.bgColor == startVal.bgColor);   
      }, (x,y)=>{
        // store in a temp buffer
        this.filled[x+","+y] = true;
        this.tempBuffer.push([x,y]);
      });
      this.setDirty();
    }
  }
  render()
  {
    //return;
    let cd = Drawing.currentDrawing;
    cd.redrawAll();
    if(this.tempBuffer != undefined)
    {
      this.tempBuffer.forEach((v)=>{
        Display.display.draw(v[0]+this.x,v[1],cd.currentChar, cd.currentFG, cd.currentBG);
      });
      this.lastBuffer = this.tempBuffer;
    }
  }
}

