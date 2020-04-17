const hud = {};
for(let hudElem of [
  "canvasContainer",
  "canvas",
  "panel",
  "tilelist",
  "tile",
  "levelUp",
  "levelDown",
  "drawAll",
  "level",
  "startmenu",
  "file",
  "export",
  "exportOutput",
  "addRow",
  "addCol",
  "remRow",
  "remCol"
]) {
  hud[hudElem] = document.getElementById(hudElem);
}

var TILE = [
  {tile:"", pressing:false, color:"white"},
  {tile:"", pressing:false, color:"red"},
  {tile:"", pressing:false, color:"green"},
  {tile:"", pressing:false, color:"yellow"},
  {tile:"", pressing:false, color:"purple"}
];
var CELL;
var LEVEL;

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
    TILE[e.button].tile = (Object.values(Tile.list)[tileNb - 1] || "").id || "";
    drawListAndHover(this, e);
  });

  hud.tilelist.addEventListener("mouseout", function(e) {
    drawListAndHover(this, e);
  });

  hud.canvas.ctx = hud.canvas.getContext("2d");
  Cell.ctx = hud.canvas.ctx;
  hud.canvas.style.display = "none";
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
    putTile(this, e);
    drawHover(this, e);
  });

  hud.canvas.addEventListener("mouseout", function(e) {
    drawCell();
    for(let tile of TILE)
      tile.pressing = false;
  });

  hud.canvas.addEventListener("mousedown", function(e) {
    e.preventDefault();
    TILE[e.button].pressing = true;
    putTile(this, e);
    drawCell();
  });

  hud.canvas.addEventListener("mouseup", function(e) {
    e.preventDefault();
    TILE[e.button].pressing = false;
  });

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

  hud.addRow.onclick = () => {
    cleanTerrainData();
    for(let z in CELL.terrain)
      CELL.terrain[z].unshift([]);
    drawCell();
  }

  hud.addCol.onclick = () => {
    cleanTerrainData();
    for(let z in CELL.terrain)
      for(let y in CELL.terrain[z])
        CELL.terrain[z][y].unshift("");
    drawCell();
  }

  hud.remRow.onclick = () => {
    cleanTerrainData();
    let safe = true;

    for(let z in CELL.terrain)
      if(CELL.terrain[z][0].length !== 0)
        safe = false;

    if(!safe)
      if(!window.confirm("The row contains tiles, proceed anyway?"))
        return;

    for(let z in CELL.terrain)
      CELL.terrain[z].shift();
    drawCell();
  }

  hud.remCol.onclick = () => {
    cleanTerrainData();
    let safe = true;

    for(let z in CELL.terrain)
      for(let y in CELL.terrain[z])
        if(CELL.terrain[z][y][0] !== "" && CELL.terrain[z][y].length !== 0)
          safe = false;

    if(!safe)
      if(!window.confirm("The column contains tiles, proceed anyway?"))
        return;

    for(let z in CELL.terrain)
      for(let y in CELL.terrain[z])
        CELL.terrain[z][y].shift();
    drawCell();
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
}

function putTile(canvas, e) {
  let pos = getCursorTileXY(canvas, e);
  if(CELL.terrain[LEVEL] === undefined)
    CELL.terrain[LEVEL] = [];
  if(CELL.terrain[LEVEL][pos.y] === undefined)
    CELL.terrain[LEVEL][pos.y] = [];

  for(let tile of TILE)
    if(tile.pressing)
      CELL.terrain[LEVEL][pos.y][pos.x] = tile.tile;
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
  let colors = ["white", "red", "green", "yellow", "purple"];
  hud.tile.innerHTML = "";
  for(let tile of TILE) {
    let tileId = tile.tile;
    let tileNb = Object.values(Tile.list).findIndex(t => t.id === tileId) + 1;
    let width = hud.tilelist.width / 32;
    let x = (tileNb % width) || width;
    let y = Math.ceil(tileNb / width);
    hud.tilelist.ctx.strokeStyle = tile.color;
    hud.tilelist.ctx.strokeRect((x - 1) * 32, (y - 1) * 32, 32, 32);
    if(tileId === "") tileId = "(empty)";
    hud.tile.innerHTML += `<span style="color:${tile.color}">${tileId}</span><br>`;
  }
}

function drawCell() {
  Cell.ctx.clearRect(0, 0, Cell.ctx.width, Cell.ctx.height);
  let max = getMax();
  hud.canvas.width = Math.max(hud.canvasContainer.clientWidth, (max.x + 10) * 32);
  hud.canvas.height = Math.max(hud.canvasContainer.clientHeight, (max.y + 10) * 32);
  Cell.ctx.width = hud.canvas.width;
  Cell.ctx.height = hud.canvas.width;

  if(hud.drawAll.checked) {
    CELL.draw();
  } else {
    CELL.drawLevel(LEVEL);
  }
}

function getMax() {
  cleanTerrainData();
  let maxX = 0;
  let maxY = 0;
  for(let i = 0; i < CELL.terrain.length; i++) {
    if(CELL.terrain[i]) {
      let y = CELL.terrain[i].length;
      if(maxY < y) maxY = y;
    }
    for(let j = 0; j < CELL.terrain[i].length; j++) {
      if(CELL.terrain[i][j]) {
        let x = CELL.terrain[i][j].length;
        if(maxX < x) maxX = x;
      }
    }
  }
  return {x: maxX, y: maxY};
}

function cleanTerrainData() {
  for(let z in CELL.terrain) {
    for(let y in CELL.terrain[z]) {
      for(let x = 0; x < CELL.terrain[z][y].length; x++) {
        if(CELL.terrain[z][y][x] === undefined)
          CELL.terrain[z][y][x] = "";
      }
    }
  }

  for(let level in CELL.terrain) {
    for(let row in CELL.terrain[level]) {
      let arrow = CELL.terrain[level][row];
      let lastInd = arrow.length;
      while(lastInd-- && arrow[lastInd] === "");
      CELL.terrain[level][row].length = lastInd + 1;
    }
    let arlvl = CELL.terrain[level];
    let lastInd = arlvl.length;
    while(lastInd-- && (arlvl[lastInd] === undefined || arlvl[lastInd].length === 0));
    CELL.terrain[level].length = lastInd + 1;
  }
}
