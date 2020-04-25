const hud = {};
for(let hudElem of [
  "canvasContainer",
  "canvas",
  "panel",
  "tilelist",
  "proplist",
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
  "remCol",
  "coos",
  "removeProp"
]) {
  hud[hudElem] = document.getElementById(hudElem);
}

var PROP = null;
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
  drawProplist();
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
    if(PROP)
      putProp(this, e);
    else
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
      terrain: CELL.terrain,
      props: CELL.props,
      entities: CELL.entities,
      teleporters: CELL.teleporters
    }
    let jsonData = JSON.stringify(data);
    hud.exportOutput.innerHTML = jsonData;
    console.log(jsonData);
    hud.exportOutput.style.display = "block";
    hud.exportOutput.select();
    document.execCommand("copy");
    hud.exportOutput.style.display = "none";
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

function selectProp(id) {
  PROP = id;
  hud.canvas.classList.remove("deleteSelected");
  hud.removeProp.classList.remove("selected");
  for(let i of Object.keys(Prop.list)) {
    hud.proplist.querySelector("#" + Prop.list[i].id).classList.remove("selected");
  }
  if(id === "DELETE_PROP") {
    hud.canvas.classList.add("deleteSelected");
    hud.removeProp.classList.add("selected");
  } else if(id) {
    hud.proplist.querySelector("#" + id).classList.add("selected");
  }
}

function getProp(x, y, z) {
  for(let prop of CELL.props[z]) {
    let propObj = Prop.list[prop.id];
    if(x >= prop.x && x < prop.x + propObj.width
    && y >= prop.y && y < prop.y + propObj.height) {
      let tileNb = (x - prop.x) + propObj.width * (y - prop.y);
      return prop;
    }
  }
}

function putProp(canvas, e) {
  let pos = getCursorTileXY(canvas, e);
  if(PROP === "DELETE_PROP") {
    let index = CELL.props[LEVEL].indexOf(getProp(pos.x, pos.y, LEVEL));
    if(index !== -1) {
      CELL.props[LEVEL].splice(index, 1);
    }
    selectProp(null);
    return;
  }

  if(CELL.props[LEVEL] === undefined)
    CELL.props[LEVEL] = [];

  CELL.props[LEVEL].push({id:PROP, x: pos.x, y: pos.y});
  selectProp(null);
}

function drawProplist() {
  for(let i of Object.keys(Prop.list)) {
    let img = hud.proplist.appendChild(Prop.list[i].image);
    img.id = Prop.list[i].id;
    img.onclick = () => {
      selectProp(img.id);
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
    let x = ((index % width) || width) - 1;
    let y = Math.ceil(index / width) - 1;
    Object.values(Tile.list)[i].draw(hud.tilelist.ctx, x, y);
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
  hud.coos.innerHTML = "(" + x / 32 + ":" + y / 32 + ")";
  canvas.ctx.fillStyle = "rgb(255,255,255,0.4)";
  canvas.ctx.fillRect(x, y, 32, 32);
}

function drawSelect() {
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
      if(CELL.terrain[z][y] == undefined)
        CELL.terrain[z][y] = [];
      for(let x = 0; x < CELL.terrain[z][y].length; x++) {
        if(CELL.terrain[z][y][x] == undefined)
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
