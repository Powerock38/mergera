const Entity = require("./Entity.js");
const Cell = require("./Cell.js");
const Inventory = require("./Inventory.js");
const Container = require("./Container.js");
const Item = require("./Item.js");

class Player extends Entity {
  static onConnect(ws) {
    ws.emit("selfId", ws.id);

    let player = new Player(ws, ws.id, {sprite:"player", hp:20, speed:4}, Cell.list.get("test"), 7, 7, 0);
    
    ws.on("keyPress", (data)=>{
      player.pressing[data.input] = data.state;
    });
    
    ws.on("chatmsg", (data)=>{
      const msg = data.m.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
      switch(data.p) {
        case 0:
          Player.broadcastMessage(player.id + " : " + msg);
          break;
        
        case 1:
          player.cell.chatMessage(player.id + " : " + msg);
          break;
      }
    });

    player.inventory.update();

    if(DEBUG)
      Player.lastplayer = player;
  }

  static onDisconnect(ws) {
    Player.list.get(ws.id).cell.removeEntity(ws.id);
    Player.list.delete(ws.id);
  }

  static broadcastMessage(msg) {
    for (const player of Player.list.values())
      player.ws.emit("chat", { c: 0, m: msg });
  }

  constructor(ws, id, sprite, cell, x, y, z) {
    super(sprite, cell, x, y, z, id);
    this.ws = ws;
    this.pressing = {};
    this.viewing = null;
    this.swinging = {id:null, tick:0};
    this.can = {
      ...this.can,
      use: true,
      useItem: [],
    };
    this.stats = {
      ...this.stats,
    };
    this.ogstats = {...this.stats};
    this.inventory = new Inventory(30, [{id:"sword",amount:1},{id:"gun",amount:1}], this.id, this);
    Player.list.set(this.id, this);
  }

  updateStats() {
    const stats = {...this.ogstats};

    for(const item of this.inventory.items) {
      if(item && Item.list.has(item.id)) {
        for(const stat in Item.list.get(item.id).stats) {
          stats[stat] += Item.list.get(item.id).stats[stat];
        }
      }
    }

    this.stats = stats;
  }

  update() {
    super.update();
    if(this.pressing.up) this.move(D.up);
    else if(this.pressing.down) this.move(D.down);
    else if(this.pressing.left) this.move(D.left);
    else if(this.pressing.right) this.move(D.right);

    if(this.pressing.use) this.use();
    if(this.pressing.useItem) this.useItem();
  }

  useItem() {
    const id = this.inventory.items[this.inventory.hbslot]?.id;

    if((this.can.useItem[id] === undefined || this.can.useItem[id]) && Item.list.has(id) && !this.viewing) {
      const item = Item.list.get(id);

      this.can.useItem[id] = false;
      timeout(()=>{
        this.can.useItem[id] = true;
      }, item.cd);

      if(item.swing) {
        this.swinging.id = id;
        this.swinging.tick = item.swing;
        timeout(()=>{
          this.swinging.id = null;
          this.swinging.tick = 0;
        }, item.swing);
      }

      item.use?.(this);
    }
  }

  use() {
    if(this.can.use && !this.going) {
      this.can.use = false;
      timeout(()=>{
        this.can.use = true;
      }, 10);
      if(this.viewing) {
        Container.list.get(this.viewing).close(this);
        return;
      }
      let frontProp = this.adjProps[this.facing];
      frontProp?.container?.open(this);
    }
  }

  setCell(cell, x, y, z) {
    let changed = super.setCell(cell, x, y, z);

    if(changed)
      SOCKET_LIST.get(this.id).emit("initCell", this.cell.initPack);
  }

  move(dir) {
    super.move(dir);
    if(this.viewing)
      Container.list.get(this.viewing).close(this);
  }
}
Player.list = new Map();
Player.lastplayer;

module.exports = Player;
