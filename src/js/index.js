import config from '../config';
import Line from '../common/Line';
import { lineIsValid } from '../common/validateLine';
import { requestPostLine, requestDeleteLine } from './lineRequest';
import fb from './firebase-client';
import colorOptions from '../config/colorOptions.js';

fb.ref('/grid/').on('value', function(snapshot) {
  let lines = [];
  snapshot.forEach((item) => {
    lines.push(item.val());
  });
  localLines = lines;
  resetArtboard();
});

/* ----------  CONSTANTS  ---------- */
var canvasWidth, canvasHeight;
var canvas0, canvas1, canvas2;
var ctx, artboard, base;

/* ----------  GLOBALS  ---------- */
var grid = [];
var localLines = [];
var colors = [];
var r = Math.round(Math.random() * colorOptions.length);
var c = Math.round(Math.random() * colorOptions[r].length);
var selectedColor = colorOptions[r][c];

var mousePos = { x: 0, y: 0 };
var isDragging = false;
var isSelectingColor = false;
var startingGridPoint = [0, 0];


function init() {
  canvas2 = document.getElementById('interactive');
  canvas1 = document.getElementById('artboard');
  canvas0 = document.getElementById('base');

  var wrapperWidth = document.getElementById('canvas_wrapper').offsetWidth;
  var wrapperHeight = document.getElementById('canvas_wrapper').offsetHeight;

  canvasWidth = wrapperWidth * 2;
  canvasHeight = wrapperHeight * 2;

  canvas0.width = canvas1.width = canvas2.width = canvasWidth;
  canvas0.height = canvas1.height = canvas2.height = canvasHeight;
  canvas0.style.width = canvas1.style.width = canvas2.style.width = canvasWidth / 2 + 'px';
  canvas0.style.height = canvas1.style.height = canvas2.style.height = canvasHeight / 2 + 'px';

  ctx = canvas2.getContext('2d');
  artboard = canvas1.getContext('2d');
  base = canvas0.getContext('2d');

  ctx.scale(2, 2);
  artboard.scale(2, 2);
  base.scale(2, 2);
}

/* ----------  INITIAL SETUP  ---------- */

if (typeof serverData !== 'undefined') {
  localLines = serverData;
};
init();
resetArtboard();

/* ----------  ARTBOARD & BASE  ---------- */
function resetArtboard() {
  clear(base);
  clear(artboard);

  if (isSelectingColor) {
    var cols = colorOptions.length;
    var rows = colorOptions[0].length;

    for (var r = 0; r < rows; r++) {
      colors[r] = [];
      for (var c = 0; c < cols; c++) {
        var xPos = canvasWidth / 2 * (c + .001) / cols;
        var yPos = canvasHeight / 2 * (r + .001) / rows;
        var width = canvasWidth / 2 / cols;
        var height = canvasHeight / 2 / rows;

        var cur = { x: xPos, y: yPos, width: width, height: height, color: colorOptions[c][r] };

        colors[r].push(cur);

        drawRectangle(artboard, cur);
      }
    }
  } else {
    // DRAW GRID
    for (var i = 0; i < config.GRID_NUMBER_COL; i++) {
      grid[i] = [];

      for (var j = 0; j < config.GRID_NUMBER_ROW; j++) {
        var xPos = canvasWidth / 2 * ((i + 0.5) / config.GRID_NUMBER_COL);
        var yPos = canvasHeight / 2 * ((j + 0.5) / config.GRID_NUMBER_ROW);

        grid[i].push({
          x: xPos,
          y: yPos,
          radius: config.GRID_DOT_SIZE,
          color: config.GRID_COLOR,
        });
      }
    }

    for (var i = 0; i < grid.length; i++) {
      for (var j = 0; j < grid[i].length; j++) {
        drawCircle(artboard, grid[i][j]);
      }
    }

    // DRAW LINES
    for (var i = 0; i < localLines.length; i++) {
      // look up positions in grid array
      var current = localLines[i];

      var start = grid[current.start[0]][current.start[1]];
      var end = grid[current.end[0]][current.end[1]];
      var currentColor = current.color;
      var id = current.id;

      drawLine(artboard, {
        x0: start.x,
        y0: start.y,
        x1: end.x,
        y1: end.y,
        color: currentColor,
      });

      // Draw localLines w/ id as color on hidden base layer
      drawLine(base, {
        x0: start.x,
        y0: start.y,
        x1: end.x,
        y1: end.y,
        color: id,
      });
    }
  }
}

///////////// MOUSE / TOUCH POSITION
function getMousePos(canvasDom, e) {
  let rect = canvasDom.getBoundingClientRect();
  if (e.touches) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    };
  } else {
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }
}

/* ----------  INTERACTIVE  ---------- */
// Draws on ctx canvas
function draw() {
  clear(ctx);

  if (!isDragging) {
    return;
  }

  let startPoint = grid[startingGridPoint[0]][startingGridPoint[1]];

  drawLine(ctx, {
    x0: startPoint.x,
    y0: startPoint.y,
    x1: mousePos.x,
    y1: mousePos.y,
    color: selectedColor,
  });
}

/* ----------  TOOLS  ---------- */
// Redraws chosen canvas
// PARAMS: any given context
function clear(canvas) {
  canvas.clearRect(0, 0, canvasWidth, canvasHeight);
}

// Finds closest grid point 
// PARAMS: given x,y coordinates
// RETURNS: object [col, row]
function findClosestGridPoint(x, y) {
  var closestIndices = [0, 0];

  //find closest column
  var col = 100;
  for (var i = 0; i < grid.length; i++) {
    if (Math.abs(x - grid[i][0].x) < col) {
      col = Math.abs(x - grid[i][0].x);
      closestIndices[0] = i;
    }
  }

  // Find closest row
  var row = 100;
  for (var i = 0; i < grid[0].length; i++) {
    if (Math.abs(y - grid[0][i].y) < row) {
      row = Math.abs(y - grid[0][i].y);
      closestIndices[1] = i;
    }
  }

  return closestIndices;
}

// Checks if x,y coordinate is within hitpoint of grid index
// PARAMS: {// {x, y}, {col, row}
// RETURNS: boolean
function isGridHit(coordinates, gridIndices) {
  var gridCoordinates = grid[gridIndices[0]][gridIndices[1]];

  if (
    Math.abs(gridCoordinates.x - coordinates.x) < config.HIT_THRESHOLD &&
    Math.abs(gridCoordinates.y - coordinates.y) < config.HIT_THRESHOLD
  ) {
    return true;
  } else {
    return false;
  }
}

// Draws a line 
// PARAMS: context, {// x.0, y.0, x1, y1, color }
function drawLine(context, line) {
  context.beginPath();
  context.moveTo(line.x0, line.y0);
  context.lineTo(line.x1, line.y1);
  context.strokeStyle = line.color;
  context.lineWidth = config.GRID_LINE_SIZE;
  context.lineJoin = 'round';
  context.lineCap = 'round';
  context.stroke();
}

// Draws a line 
// PARAMS: context, {x, y, radius, color}
function drawCircle(context, circle) {
  context.beginPath();
  context.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
  context.fillStyle = circle.color;
  context.fill();
}

// Draws a rectangle
// PARAMS: context, {x, y, width, height, color}
function drawRectangle(context, rect) {
  context.beginPath();
  context.rect(rect.x, rect.y, rect.width, rect.height);
  context.fillStyle = rect.color;
  context.fill();
}


function rgbToHex(r, g, b) {
  let rHex = r.toString(16);
  let gHex = g.toString(16);
  let bHex = b.toString(16);

  rHex = (rHex.length == 1) ? '0' + rHex : rHex;
  gHex = (gHex.length == 1) ? '0' + gHex : gHex;
  bHex = (bHex.length == 1) ? '0' + bHex : bHex;

  return '#' + rHex.toString(16) + gHex.toString(16) + bHex.toString(16);
}

/* ----------  EVENT HANDLERS  ---------- */
function handleDownEvent(e) {
  mousePos = getMousePos(canvas2, e);

  if (isSelectingColor) {
    for (var i = 0; i < colors.length; i++) {
      for (var j = 0; j < colors[i].length; j++) {
        var cur = colors[i][j];
        if (mousePos.x > cur.x && mousePos.y > cur.y &&
          mousePos.x < cur.x + cur.width && mousePos.y < cur.y + cur.height) {
          selectedColor = cur.color;
        }
      }
    }
    isSelectingColor = false;
    resetArtboard();
    return;
  }

  var closestIndices = findClosestGridPoint(mousePos.x, mousePos.y);

  // If click is at an grid point, start dragging
  if (isGridHit(mousePos, closestIndices)) {
    startingGridPoint = [closestIndices[0], closestIndices[1]];
    isDragging = true;
  } else {
    // Click is not at a grid point, assess click coordinates,
    // check if clicked on line and delete line if clicked
    // cpa is short for ClickedPixelArray
    // mousePos*2 because our canvas is scaled for retina
    var cpa = base.getImageData(
      getMousePos(canvas0, e).x * 2,
      getMousePos(canvas0, e).y * 2, 1, 1).data;

    // If opacity is greater than .5, a line was clicked
    if (cpa[3] > 128) {
      let idToDelete = rgbToHex(cpa[0], cpa[1], cpa[2]);
      deleteLine(idToDelete);
      requestDeleteLine(idToDelete);
      // TODO: If fails, reset to old state
      resetArtboard();
    }
  }
}

function handleMoveEvent(e) {
  mousePos = getMousePos(canvas2, e);
}

function handleUpEvent(e) {
  if (isDragging) {
    // Check if close to a gridpoint
    let closestGridPoint = findClosestGridPoint(mousePos.x, mousePos.y);
    let spansPoints = (
      startingGridPoint[0] != closestGridPoint[0] ||
      startingGridPoint[1] != closestGridPoint[1]
    );

    if (spansPoints && isGridHit(mousePos, closestGridPoint)) {

      let start = startingGridPoint;
      let end = closestGridPoint;

      // If start point is 'less' than end point, swap
      if (start < end) {
        let temp = start.slice();
        start = end.slice();
        end = temp;
      }

      let currentLine = new Line(start, end, selectedColor);
      // Check if line is valid
      if (lineIsValid(currentLine)) {
        saveLine(currentLine);
        // TODO: If fails, reset to old state
        requestPostLine(currentLine);
      }
      resetArtboard();
    }
  }

  isDragging = false;
}

function handleResize() {
  init();
  resetArtboard();
}

/* ----------  EVENT LISTENERS  ----------*/
document.body.addEventListener('mousedown',
  function(e) {
    if (e.target == canvas2) {
      if (e.button == 2 || e.ctrlKey) {
        e.preventDefault();
        isSelectingColor = !isSelectingColor;
        resetArtboard();
      } else {
        handleDownEvent(e);
      }
    }
  }, false);

document.body.addEventListener('contextmenu',
  function(e) {
    e.preventDefault();
  }, false);

document.body.addEventListener('mousemove',
  function(e) {
    handleMoveEvent(e);
  }, false);

document.body.addEventListener('mouseup',
  function(e) {
    handleUpEvent(e);
  }, false);

document.body.addEventListener('touchstart',
  function(e) {
    if (e.target == canvas2) {
      if (e.touches.length < 2) {
        e.preventDefault();
        handleDownEvent(e);
      } else {
        isSelectingColor = !isSelectingColor;
        resetArtboard();
      }
    }
  }, false);

document.body.addEventListener('touchmove',
  function(e) {
    if (e.target == canvas2 && e.touches.length < 2) {
      e.preventDefault();
    }
    handleMoveEvent(e);
  }, false);

document.body.addEventListener('touchend',
  function(e) {
    if (e.target == canvas2) {
      e.preventDefault();
    }
    handleUpEvent(e);
  }, false);

let resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    handleResize();
  }, 100);
});

/* ----------  RENDER LOOP  ----------*/
function animate() {
  requestAnimFrame(animate);
  draw();
}

// Get a regular interval for drawing to the screen
window.requestAnimFrame = (function() {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( /* function */ callback, /* DOMElement */ element) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

animate();

function saveLine(line) {
  // Save line locally, then push to server
  localLines.push(line);
}

function deleteLine(id) {
  let oldLength = localLines.length;
  let updatedLines = localLines.filter((item) => {
    return item.id !== id;
  });
  if (updatedLines.length == oldLength - 1) {
    localLines = updatedLines;
    return true;
  } else {
    return false;
  }
}