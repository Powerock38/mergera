const Entity = require("./Entity.js");
const Cell = require("./Cell.js");
const Inventory = require("./Inventory.js");
const Container = require("./Container.js");
const Item = require("./Item.js");

class Player extends Entity {
  static onConnect(ws) {
    let player = new Player(ws, ws.id, {sprite:"player", hp:20, speed:4}, Cell.list["test"], 7, 7, 0);

    ws.on("keyPress", (data)=>{
      player.pressing[data.input] = data.state;
    });

    ws.emit("selfId", player.id);

    player.inventory.update();

    Player.lastplayer = player;
  }

  static onDisconnect(ws) {
    Player.list[ws.id].cell.removeEntity(ws.id);
    delete Player.list[ws.id];
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
    this.inventory = new Inventory(30, [{id:"sword",amount:1}], this.id, this);
    Player.list[this.id] = this;
  }

  updateStats() {
    let stats = {...this.ogstats};
    for(let i in this.inventory.items) {
      let item = this.inventory.items[i];
      if(item && Item.list[item.id]) {
        for(let stat in Item.list[item.id].stats) {
          stats[stat] += Item.list[item.id].stats[stat];
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
    let id = this.inventory.items[this.inventory.hbslot]?.id;

    if((this.can.useItem[id] === undefined || this.can.useItem[id]) && Item.list[id]) {
      this.can.useItem[id] = false;
      timeout(()=>{
        this.can.useItem[id] = true;
      }, Item.list[id].cd);

      if(Item.list[id].swing) {
        this.swinging.id = id;
        this.swinging.tick = Item.list[id].swing;
        timeout(()=>{
          this.swinging.id = null;
          this.swinging.tick = 0;
        }, Item.list[id].swing);
      }

      Item.list[id].use?.(this);
    }
  }

  use() {
    if(this.can.use && !this.going) {
      this.can.use = false;
      timeout(()=>{
        this.can.use = true;
      }, 10);
      if(this.viewing) {
        Container.list[this.viewing].close(this);
        return;
      }
      let frontProp = this.adjProps[this.facing];
      if(frontProp?.chest) {
        frontProp.container.open(this);
      }
    }
  }

  setCell(cell, x, y, z) {
    let changed = super.setCell(cell, x, y, z);

    if(changed)
      SOCKET_LIST[this.id].emit("initCell", this.cell.initPack);
  }

  move(dir) {
    super.move(dir);
    if(this.viewing)
      Container.list[this.viewing].close(this);
  }
}
Player.list = [];
Player.lastplayer;

module.exports = Player;
