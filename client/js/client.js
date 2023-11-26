Tile.load(()=>{
  console.log("All tiles loaded !");
  Prop.load(()=>{
    console.log("All props loaded !");
    Spritesheet.load(()=>{
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
        Cell.load(()=>{
          console.log("All cells loaded !");
          hud.loading.remove();
          begin();
        });
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
  "chatdiv",
  "chatinput",
  "globalbox",
  "localbox",
  "global",
  "local",
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
  connection = new WebSocket('ws://' + window.location.host.split(':')[0] + ":2000");

  //custom function
  connection.emit = (ev, data, channel)=>{
    let obj;
    if(channel) obj = {a: [ev, data], c: channel};
    else obj = {a: [ev, data]};
    connection.send(JSON.stringify(obj));
  }

  connection.onmessage = (message)=>{
    const msg = JSON.parse(message.data);
    const ev = msg.a[0];
    const data = msg.a[1];

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

      case 'chat':
        const msg = document.createElement("li");
        msg.innerHTML = data.m;
        const room = ["globalbox", "localbox"][data.c];
        hud[room].appendChild(msg);
        hud[room].scrollTop = hud[room].scrollHeight;
        break;

      default:
        console.error("erroned message received : " + ev);
    }
  }

  const keyInput = (e, state)=>{
    if(hud.chatinput === document.activeElement)
      return;


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
        if (hud.chatinput !== document.activeElement)
          Inventory.main.toggle();
        break;

      case 'Enter':
        if (hud.chatinput === document.activeElement)
          if (hud.chatinput.value[0] === "!")
           connection.emit("eval", hud.chatinput.value);
          else if (hud.chatinput.value) {
            connection.emit("chatmsg", { p: (hud.local.checked ? 1 : 0), m: hud.chatinput.value});
            hud.chatinput.value = "";
          }
        break;
    }
  });

  hud.chatdiv.addEventListener("mousedown", e => e.stopPropagation());
  
  document.addEventListener("wheel", e => {
    if(e.deltaY < 0) {
      Inventory.main.previousHBSlot();
    } else if(e.deltaY > 0) {
      Inventory.main.nextHBSlot();
    }
  });

  const update = ()=>{
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
