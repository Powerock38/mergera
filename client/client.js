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
      Item.load([
        {id:"hat", name:"Hat", desc:"A weird hat, but a hat nonetheless"},
        {id:"gun", name:"Gun", desc:"Gotta do da job 😤"},
      ],()=>{
        console.log("All items loaded !");
        begin();
      });
    });
  });
});

const hud = {};
for(let hudElem of [
  "mainframe",
  "inventory",
  "inventoryAround",
  "container",
  "containerAround",
  "coos",
  "cmd",
]) hud[hudElem] = document.getElementById(hudElem);

hud.mainframe.width = document.documentElement.clientWidth;
hud.mainframe.height = document.documentElement.clientHeight;
Cell.ctx = hud.mainframe.getContext("2d");
refreshWindowSize = ()=>{
  hud.mainframe.width = document.documentElement.clientWidth;
  hud.mainframe.height = document.documentElement.clientHeight;
  Cell.ctx.width = hud.mainframe.width;
  Cell.ctx.height = hud.mainframe.height;
};
refreshWindowSize();
window.addEventListener('resize', refreshWindowSize);

var Zoom = 2;
var selfId;
var cellId;

function begin() {
  //listener
  connection = new WebSocket('ws://localhost:2000');
  //custom functions
  connection.emit = (ev, data, channel)=>{
    let obj;
    if(channel) obj = {a: [ev, data], c: channel};
    else obj = {a: [ev, data]};
    connection.send(JSON.stringify(obj));
  }
  connection.onmessage = (message)=>{
    let msg = JSON.parse(message.data);
    let ev = msg.a[0];
    let data = msg.a[1];

    switch(ev) {
      case 'connect':
        console.log("Connected to server");
        break;

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
        update();
        break;

      case 'remove':
        for(let id of data.entities)
          delete Cell.list[data.id].entities[id];
        break;

      case 'inventory':
        Inventory.main.update(data.items, data.size);
        if(Inventory.main.displayed)
          Inventory.main.draw();
        break;

      case 'container':
        if(Container.list[data.id])
          Container.list[data.id].update(data.items, data.size);
        else new Container(data.id, data.items, data.size);

        if(data.open === true)
          Container.list[data.id].open();
        else if(data.open === false)
          Container.list[data.id].close();

        if(Container.list[data.id].displayed)
          Container.list[data.id].draw();
        break;

      default:
        console.error("erroned message received : " + ev);
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
        connection.emit("keyPress", {input: key.action, state: state});
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
      case 'a':
        Inventory.main.toggle();
        break;

      case 'Enter':
        connection.emit("eval", hud.cmd.value);
        break;
    }
  });

  Cell.ctx.imageSmoothingEnabled = false;
  function update() {
    Cell.ctx.clearRect(0, 0, Cell.ctx.width, Cell.ctx.height);
    if(cellId && selfId) {
      let Player = Cell.list[cellId].entities[selfId];
      let ctrX = Math.round(Player.animX - Cell.ctx.width / (2 * Zoom));
      let ctrY = Math.round(Player.animY - Cell.ctx.height / (2 * Zoom));
      Cell.list[cellId].draw(ctrX, ctrY);
      hud.coos.textContent = "("+Math.floor(Player.animX / 32)+";"+Math.floor(Player.animY / 32)+";"+Player.z+")";
    }
  }
}
