const hudElements = ["dl", "export", "loadMap", "load", "tilesetcanvas", "canvas", "tile"];

let hud = {};

for(let hudElem of hudElements) {
  hud[hudElem] = document.getElementById(hudElem);
}

CTX = hud.canvas.getContext("2d");
Cell.ctx = CTX;
hud.canvas.width = document.documentElement.clientWidth;
hud.canvas.height = document.documentElement.clientHeight;

var MAP = null;
var TILE = 1;

hud.load.onclick = () => {
 MAP = new Cell(hud.loadMap.value, () => {
   MAP.draw();
   drawTileset(MAP.tileset);
 });

 hud.canvas.addEventListener("mousemove", function(e) {
   MAP.draw();
   drawHover(this, e);
 });

 hud.canvas.addEventListener("mouseout", function(e) {
   MAP.draw();
 });

 hud.canvas.addEventListener("mousedown", function(e) {
   let pos = getCursorTileXY(this, e);
   MAP.terrain[pos.y][pos.x].id = TILE;
   MAP.draw();
 });
}

hud.export.onclick = () => {
  let data = {
    tileset: MAP.tileset.name,
    terrain: MAP.terrain
  }
  let b64data = btoa(JSON.stringify(data));
  hud.dl.innerHTML = "<a download='map.json' href='data:application/octet-stream;charset=utf-16le;base64," + b64data +"'>download</a>";
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

function drawTileset(tileset) {
  let cnv = hud.tilesetcanvas;
  let ctx = cnv.getContext("2d");
  let img = tileset.image;
  cnv.width = img.width;
  cnv.height = img.height;
  ctx.drawImage(img, 0, 0);
  drawSelect(ctx, tileset.image.width / 32);
  hud.tile.innerHTML = TILE;

  cnv.addEventListener("mousemove", function(e) {
    ctx.drawImage(img, 0, 0);
    drawHover(this, e);
    drawSelect(ctx, tileset.image.width / 32);
  });

  cnv.addEventListener("mouseout", function(e) {
    ctx.drawImage(img, 0, 0);
    drawSelect(ctx, tileset.image.width / 32);
  });

  cnv.addEventListener("mousedown", function(e) {
    TILE = getCursorTile(this, e, tileset.image.width);
    hud.tile.innerHTML = TILE;
    ctx.drawImage(img, 0, 0);
    drawHover(this, e);
    drawSelect(ctx, tileset.image.width / 32);
  });
}

function drawHover(canvas, e) {
  let ctx = canvas.getContext("2d");
  let pos = getCursorPosition(canvas, e);
  let x = Math.floor(pos.x / 32) * 32;
  let y = Math.floor(pos.y / 32) * 32;
  ctx.fillStyle = "rgb(255,255,255,0.4)";
  ctx.fillRect(x, y, 32, 32);
}

function drawSelect(ctx, width) {
  let x = (TILE % width) || width;
  let y = Math.ceil(TILE / width);
  ctx.strokeRect((x - 1) * 32, (y - 1) * 32, 32, 32);
}
