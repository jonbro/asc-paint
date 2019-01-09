import {Display} from "./Display"

let d = ()=>{
  return Display.display;
}

// draws a ui outline square
export function drawSquare(x,y,width,height)
{
  let dirtyCells = [];
  for(let _x=x+1;_x<width+x;_x++)
  {
    dirtyCells.push([_x,y]);
    dirtyCells.push([_x,y+height]);
    d().draw(_x,y,"─","white","black");
    d().draw(_x,y+height,"─","white","black");
  }
  
  for(let _y=y+1;_y<height+y;_y++)
  {
    dirtyCells.push([x,_y]);
    dirtyCells.push([x+width,_y]);
    d().draw(x,_y,"│","white","black");
    d().draw(x+width,_y,"│","white","black");
  }
  dirtyCells.push([x,y]);
  dirtyCells.push([x,y+height]);
  dirtyCells.push([x+width,y]);
  dirtyCells.push([x+width,y+height]);
  d().draw(x,y,"┌","white","black");
  d().draw(x,y+height,"└","white","black");
  d().draw(x+width,y,"┐","white","black");
  d().draw(x+width,y+height,"┘","white","black");
  return dirtyCells;
}

export function getSquareCells(x,y,width,height,outline)
{
  let dirtyCells = [];
  if(!outline)
  {
    for(let _x=x;_x<x+width;_x++)
    {    
      for(let _y=y;_y<y+height;_y++)
      {
        dirtyCells.push([_x,_y]);
      }
    }
  }
  else
  {
    for(let _x=x+1;_x<width+x;_x++)
    {
      dirtyCells.push([_x,y]);
      dirtyCells.push([_x,y+height]);
    }

    for(let _y=y+1;_y<height+y;_y++)
    {
      dirtyCells.push([x,_y]);
      dirtyCells.push([x+width,_y]);
    }
    dirtyCells.push([x,y]);
    dirtyCells.push([x,y+height]);
    dirtyCells.push([x+width,y]);
    dirtyCells.push([x+width,y+height]);
  }
  return dirtyCells;
}

// from here: https://stackoverflow.com/questions/4672279/bresenham-algorithm-in-javascript
export function calculateLine (x1,y1, x2,y2) {
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