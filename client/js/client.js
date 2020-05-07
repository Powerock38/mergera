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
      "dog",
      "bullet",
      "aquaneko",
    ],()=>{
      console.log("All sprites loaded !");
      Item.load([
        {id:"hat", name:"Hat", desc:"A weird hat, but a hat nonetheless"},
        {id:"gun", name:"Gun", desc:"Gotta do da job 😤"},
        {id:"ammo", name:"Ammo", desc:""},
        {id:"boots", name:"Boots", desc:"Good ol' leather boots"},
        {id:"sword", name:"Sword", desc:"Your average sharpy sword"},
        {id:"neko-egg", name:"Neko egg", desc:"An egg containing a cute creature"},
      ],()=>{
        console.log("All items loaded !");
        Cell.load([
          "test",
          "test2"
        ],()=>{
          console.log("All cells loaded !");
          hud.loading.remove();
          begin();
        })
      });
    });
  });
});

const hud = {};
for(let hudElem of [
  "loading",
  "mainframe",
  "inventory",
  "inventoryAround",
  "container",
  "containerAround",
  "coos",
  "cmd",
]) hud[hudElem] = document.getElementById(hudElem);

var Zoom = 2;
hud.mainframe.width = document.documentElement.clientWidth;
hud.mainframe.height = document.documentElement.clientHeight;
CTX = hud.mainframe.getContext("2d");
refreshWindowSize = ()=>{
  hud.mainframe.width = document.documentElement.clientWidth;
  hud.mainframe.height = document.documentElement.clientHeight;
  CTX.width = hud.mainframe.width;
  CTX.height = hud.mainframe.height;
  CTX.imageSmoothingEnabled = false;
  CTX.scale(Zoom, Zoom);
};
refreshWindowSize();
window.addEventListener('resize', refreshWindowSize);

var selfId;
var cellId;

function begin() {
  connection = new WebSocket('ws://localhost:2000');

  //custom function
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

      case 'initCell':
        cellId = data.id;
        Cell.list.get(data.id).entities.clear();
        for(let entity of data.entities) {
          Cell.list.get(data.id).entities.set(entity.id, new Entity(entity));
        }
        break;

      case 'init':
        for(let entity of data.entities) {
          Cell.list.get(data.id).entities.set(entity.id, new Entity(entity));
        }
        break;

      case 'update':
        cellId = data.id;
        for(let entity of data.entities) {
          let ent = Cell.list.get(data.id).entities.get(entity.id);
          if(ent)
            for(let p in entity)
              ent[p] = entity[p];
        }
        update();
        break;

      case 'remove':
        for(let id of data.entities)
          Cell.list.get(data.id).entities.delete(id);
        break;

      case 'inventory':
        Inventory.main.update(data.items, data.size);
        if(Inventory.main.displayed)
          Inventory.main.draw();
        else
          Inventory.main.drawHotbar();
        break;

      case 'container':
        if(Container.list.has(data.id))
          Container.list.get(data.id).update(data.items, data.size);
        else new Container(data.id, data.items, data.size);

        const container = Container.list.get(data.id);

        if(data.open === true)
          container.open();
        else if(data.open === false)
          container.close();

        if(container.displayed)
          container.draw();
        break;

      default:
        console.error("erroned message received : " + ev);
    }
  }

  function keyInput(e, state) {
    if(e.button !== undefined)
      e.key = e.button;
    for(let key of [
      {key:["z","ArrowUp"], action:"up"},
      {key:["s","ArrowDown"], action:"down"},
      {key:["q","ArrowLeft"], action:"left"},
      {key:["d","ArrowRight"], action:"right"},
      {key:[2, "e"], action:"use"},
      {key:[0], action:"useItem"},
    ]) {
      if(key.key.includes(e.key))
        connection.emit("keyPress", {input: key.action, state: state});
    }
  }

  document.addEventListener('keydown', (e) => {
    keyInput(e, true);
  });

  document.addEventListener('keyup', (e) => {
    keyInput(e, false);
  });

  document.addEventListener("mousedown", (e) => {
    keyInput(e, true);
  });

  document.addEventListener("mouseup", (e) => {
    keyInput(e, false);
  });

  //client-side controls
  document.addEventListener('keypress', (e) => {
    switch(e.key) {
      case 'e':
        Inventory.main.toggle();
        break;

      case 'Enter':
        connection.emit("eval", hud.cmd.value);
        break;
    }
  });

  document.addEventListener("wheel", e => {
    if(e.deltaY < 0) {
      Inventory.main.previousHBSlot();
    } else if(e.deltaY > 0) {
      Inventory.main.nextHBSlot();
    }
  });

  function update() {
    if(cellId && selfId) {
      CTX.clearRect(0, 0, CTX.width, CTX.height);
      const Player = Cell.list.get(cellId).entities.get(selfId);
      const ctrX = Math.round(Player.animX - CTX.width / (2 * Zoom));
      const ctrY = Math.round(Player.animY - CTX.height / (2 * Zoom));
      Cell.list.get(cellId).draw(ctrX, ctrY);
      hud.coos.textContent = "("+Math.floor(Player.animX / 32)+";"+Math.floor(Player.animY / 32)+";"+Player.z+")";
    }
  }
}
