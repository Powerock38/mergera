Tile.load([
  "",
  "tile000",
  "tile001",
  "tile003",
  "tile005",
  "tile006",
  "tile007",
  "tile008",
  "tile009",
  "tile010",
  "tile011",
  "tile012",
  "tile013",
  "dirt1",
  "grass2",
  "dirt1grass2_t-1",
  "dirt1grass2_r-1",
  "dirt1grass2_b-1",
  "dirt1grass2_l-1",
  "dirt1grass2_tr-1",
  "dirt1grass2_tr-2",
  "dirt1grass2_tl-1",
  "dirt1grass2_tl-2",
  "dirt1grass2_br-1",
  "dirt1grass2_br-2",
  "dirt1grass2_bl-1",
  "dirt1grass2_bl-2",
  "dirt1grass2_rl-1",
  "dirt1grass2_tb-1",
  "dirt1grass2_corner-1",
  "dirt1grass2_corner-2",
  "dirt1grass2_trbl-1",
  "dirt1grass2_trbl-2",
  "wall"
],()=>{
  console.log("All tiles loaded !");
  Prop.load([
    "brick-stairs-up",
    "brick-stairs-left",
    "boat",
    "tree",
    "cherrytree-trunk",
    "cherrytree-top",
    "wooden-chest-front",
  ],()=>{
    console.log("All props loaded !");
    Spritesheet.load([
      "player",
      "dog"
    ],()=>{
      console.log("All sprites loaded !");
      begin();
    });
  });
});

var MAINLOOP;
var Zoom = 2;
var selfId;
var cellId;

const canvas = document.getElementById("mainframe");
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
Cell.ctx = canvas.getContext("2d");
refreshWindowSize = ()=>{
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  Cell.ctx.width = canvas.width;
  Cell.ctx.height = canvas.height;
};
refreshWindowSize();
window.addEventListener('resize', refreshWindowSize);


function serval(str) {
  connection.send(JSON.stringify({h: 'eval',data: str}));
}

function begin() {
  connection = new WebSocket('ws://localhost:2000');
  //listener
  connection.onmessage = (message)=>{
    let msg = JSON.parse(message.data);
    let data = msg.data;

    switch(msg.h) {
      case 'selfId':
        selfId = data;
        break;

      case 'init':
        if(data.terrain && data.props) {
          new Cell(data.id, data.terrain, data.props);
          cellId = data.id;
        }

        for(let i in data.entities) {
          let entity = data.entities[i];
          Cell.list[data.id].entities[entity.id] = new Entity(entity);
        }
        break;

      case 'update':
        for(let entity of data.entities) {
          let ent = Cell.list[data.id].entities[entity.id];
          if(ent) {
            ent.animX = entity.animX;
            ent.animY = entity.animY;
            ent.z = entity.z;
            ent.frame = entity.frame;
          }
        }
        break;

      case 'remove':
        for(let id of data.entities)
          delete Cell.list[data.id].entities[id];
        break;

      case 'inventory':
        if(Inventory.list[data.id]) {
          let inv = Inventory.list[data.id];
          inv.items = data.items;
          inv.size = data.size;
        } else {
          new Inventory(data.id, data.items, data.size);
        }
        if(data.open)
          Inventory.list[data.id].open();
        break;

      default:
        console.error("erroned message received : " + msg.h);
    }
  }

  function keyboardInput(e, state) {
    for(let key of [
      {key:["z","ArrowUp"], action:"up"},
      {key:["s","ArrowDown"], action:"down"},
      {key:["q","ArrowLeft"], action:"left"},
      {key:["d","ArrowRight"], action:"right"},
      {key:["e"], action:"use"},
    ]) {
      if(key.key.includes(e.key))
        connection.send(JSON.stringify({h: 'keyPress', data: {input: key.action, state: state}}));
    }
  }

  document.addEventListener('keydown', (e) => {
    keyboardInput(e, true);
  });

  document.addEventListener('keyup', (e) => {
    keyboardInput(e, false);
  });

  //client-side controls
  document.addEventListener('keypress', (e) => {
    switch(e.key) {
      case 'i':
        Inventory.list[selfId].open();
        break;
    }
  });

  MAINLOOP = setInterval(() => {
    Cell.ctx.clearRect(0, 0, Cell.ctx.width, Cell.ctx.height);
    if(cellId && selfId) {
      let Player = Cell.list[cellId].entities[selfId];
      let ctrX = Math.round(Player.animX - Cell.ctx.width / (2 * Zoom));
      let ctrY = Math.round(Player.animY - Cell.ctx.height / (2 * Zoom));
      Cell.list[cellId].draw(ctrX, ctrY);
      document.getElementById("coos").innerHTML = "("+Math.floor(Player.animX / 32)+";"+Math.floor(Player.animY / 32)+";"+Player.z+")";
    }
  }, 1000 / 30);
}
