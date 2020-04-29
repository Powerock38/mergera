const Entity = require("./Entity.js");
const Cell = require("./Cell.js");
const Inventory = require("./Inventory.js");

class Player extends Entity {
  constructor(sprite, cell, x, y, z, id) {
    super(sprite, cell, x, y, z, id);
    this.pressing = {};
    this.canUse = true;
    this.inventory = new Inventory(30, [], this.id, [this.id]);
    Player.list[this.id] = this;
  }

  update() {
    super.update();
    if(this.pressing.up) this.move(D.up);
    else if(this.pressing.down) this.move(D.down);
    else if(this.pressing.left) this.move(D.left);
    else if(this.pressing.right) this.move(D.right);

    if(this.pressing.use) this.use();
  }

  use() {
    if(this.canUse) {
      this.canUse = false;
      let frontProp = this.adjProps[this.facing];
      if(frontProp && frontProp.chest) {
        frontProp.inventory.open(this.id);
      }
      console.log(frontProp);
      setTimeout(()=>{
        this.canUse = true;
      }, 500);
    }
  }

  setCell(cell, x, y, z) {
    let changed = super.setCell(cell, x, y, z);

    if(changed)
      SOCKET_LIST[this.id].ssend("init", this.cell.initPack);
  }

  static onConnect(ws) {
    let player = new Player("player", Cell.list["test"], 7, 7, 0, ws.id);

    ws.onmsg("keyPress", (data)=>{
      player.pressing[data.input] = data.state;
    });

    ws.ssend("selfId", ws.id);
    player.inventory.send(ws);

    Player.lastplayer = player;
  }

  static onDisconnect(ws) {
    Player.list[ws.id].cell.removeEntity(ws.id);
    delete Player.list[ws.id];
  }
}
Player.list = [];
Player.lastplayer;

module.exports = Player;
