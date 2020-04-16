const hud = {};
for(let hudElem of ["canvas", "panel", "tilelist", "tile", "levelUp", "levelDown", "drawAll", "level", "startmenu", "file", "export", "exportOutput"]) {
  hud[hudElem] = document.getElementById(hudElem);
}

var TILE = ["", "", "", "", ""];
var CELL;
var LEVEL;

hud.export.onclick = () => {
  cleanTerrainData();
  let data = {
    defaultLevel: CELL.defaultLevel,
    terrain: CELL.terrain
  }
  let jsonData = JSON.stringify(data);
  hud.exportOutput.innerHTML = jsonData;
  console.log(jsonData);
  hud.exportOutput.style.display = "block";
  hud.exportOutput.select();
  document.execCommand("copy");
  hud.exportOutput.style.display = "none";
  //let b64data = btoa(JSON.stringify(data));
  //hud.dl.innerHTML = "<a download='map.json' href='data:application/octet-stream;charset=utf-16le;base64," + b64data +"'>download</a>";
}

hud.levelUp.onclick = () => {
  LEVEL++;
  drawCell();
  hud.level.innerHTML = LEVEL;
}

hud.levelDown.onclick = () => {
  if(LEVEL !== 0) {
    LEVEL--;
    drawCell();
    hud.level.innerHTML = LEVEL;
  }
}

function begin() {
  hud.tilelist.ctx = hud.tilelist.getContext("2d");
  let width = Math.floor(hud.panel.clientWidth / 32);
  hud.tilelist.width = width * 32;
  hud.tilelist.height = Math.ceil(Object.keys(Tile.list).length / width) * 32;

  hud.tilelist.addEventListener("mousemove", function(e) {
    drawListAndHover(this, e);
  });

  hud.tilelist.addEventListener("mousedown", function(e) {
    e.preventDefault();
    let tileNb = getCursorTile(this, e, hud.tilelist.width);
    TILE[e.button] = (Object.values(Tile.list)[tileNb - 1] || "").id || "";
    drawListAndHover(this, e);
  });

  hud.tilelist.addEventListener("mouseout", function(e) {
    drawListAndHover(this, e);
  });

  hud.canvas.ctx = hud.canvas.getContext("2d");
  hud.canvas.width = document.documentElement.clientWidth - hud.panel.clientWidth;
  hud.canvas.height = document.documentElement.clientHeight;
  hud.canvas.style.display = "none";
  Cell.ctx = hud.canvas.ctx;
  Cell.ctx.width = hud.canvas.width;
  Cell.ctx.height = hud.canvas.width;
  drawTileList();
  drawSelect();
}

function loadCell(file) {
  CELL = new Cell(file);
  LEVEL = CELL.defaultLevel;
  hud.level.innerHTML = LEVEL;
  drawCell();
  hud.canvas.style.display = "inline";
  hud.startmenu.style.display = "none";

  hud.canvas.addEventListener("mousemove", function(e) {
    drawCell();
    drawHover(this, e);
  });

  hud.canvas.addEventListener("mouseout", function(e) {
    drawCell();
  });

  hud.canvas.addEventListener("mousedown", function(e) {
    e.preventDefault();
    let pos = getCursorTileXY(this, e);
    if(CELL.terrain[LEVEL] === undefined)
      CELL.terrain[LEVEL] = [];
    if(CELL.terrain[LEVEL][pos.y] === undefined)
      CELL.terrain[LEVEL][pos.y] = [];
    CELL.terrain[LEVEL][pos.y][pos.x] = TILE[e.button];
    drawCell();
  });
}

function drawTileList() {
  hud.tilelist.ctx.clearRect(0, 0, hud.tilelist.width, hud.tilelist.height);
  let width = hud.tilelist.width / 32;
  for(let i = 0; i < Object.keys(Tile.list).length; i++) {
    let index = i + 1;
    let x = (index % width) || width;
    let y = Math.ceil(index / width);
    Object.values(Tile.list)[i].draw(hud.tilelist.ctx, (x - 1) * 32, (y - 1) * 32);
  }
}

function drawListAndHover(canvas, e) {
  drawTileList();
  drawHover(canvas, e);
  drawSelect();
}

function getCursorPosition(canvas, e) {
  let rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  return {x: x, y: y};
}

function getCursorTileXY(canvas, e) {
  let pos = getCursorPosition(canvas, e);
  let x = Math.ceil(pos.x / 32) - 1;
  let y = Math.ceil(pos.y / 32) - 1;
  return {x: x, y: y};
}

function getCursorTile(canvas, e, width) {
  let pos = getCursorTileXY(canvas, e);
  let tsW = width / 32;
  let tile = pos.x + Math.ceil(pos.y * tsW) + 1;
  return tile;
}

function drawHover(canvas, e) {
  let pos = getCursorPosition(canvas, e);
  let x = Math.floor(pos.x / 32) * 32;
  let y = Math.floor(pos.y / 32) * 32;
  canvas.ctx.fillStyle = "rgb(255,255,255,0.4)";
  canvas.ctx.fillRect(x, y, 32, 32);
}

function drawSelect() {
  let colors = ["blue", "red", "green", "yellow", "purple"];
  hud.tile.innerHTML = "";
  for(let i in TILE) {
    let tileNb = Object.values(Tile.list).findIndex(t => t.id === TILE[i]) + 1;
    let width = hud.tilelist.width / 32;
    let x = (tileNb % width) || width;
    let y = Math.ceil(tileNb / width);
    hud.tilelist.ctx.strokeStyle = colors[i];
    hud.tilelist.ctx.strokeRect((x - 1) * 32, (y - 1) * 32, 32, 32);
    let name = TILE[i];
    if(name === "") name = "(empty)"
    hud.tile.innerHTML += `<span style="color:${colors[i]}">${name}</span><br>`;
  }
}

function drawCell() {
  Cell.ctx.clearRect(0, 0, Cell.ctx.width, Cell.ctx.height);
  if(hud.drawAll.checked) {
    CELL.draw();
  } else {
    CELL.drawLevel(LEVEL);
  }
}

function cleanTerrainData() {
  for(let level in CELL.terrain) {
    for(let row in CELL.terrain[level]) {
      let arrow = CELL.terrain[level][row];
      let lastInd = arrow.length;
      while(lastInd-- && arrow[lastInd] === "");
      CELL.terrain[level][row].length = lastInd + 1;
    }
    let arlvl = CELL.terrain[level];
    let lastInd = arlvl.length;
    while(lastInd-- && arlvl[lastInd].length === 0);
    CELL.terrain[level].length = lastInd + 1;
  }

  for(let z in CELL.terrain) {
    for(let y in CELL.terrain[z]) {
      for(let x = 0; x < CELL.terrain[z][y].length; x++) {
        if(CELL.terrain[z][y][x] === undefined)
          CELL.terrain[z][y][x] = "";
      }
    }
  }
}
