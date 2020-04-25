const Entity = require("./Entity.js");
const Cell = require("./Cell.js");

class Player extends Entity {
  constructor(sprite, cell, x, y, z, id) {
    super(sprite, cell, x, y, z, id);
    this.pressing = {
      up: false,
      down: false,
      left: false,
      right: false
    }
    Player.list[this.id] = this;
  }

  update() {
    super.update();
    if(this.pressing.up) this.move(D.up);
    else if(this.pressing.down) this.move(D.down);
    else if(this.pressing.left) this.move(D.left);
    else if(this.pressing.right) this.move(D.right);
  }

  setCell(cell, x, y, z) {
    let changed = super.setCell(cell, x, y, z);

    if(changed)
      SOCKET_LIST[this.id].ssend("init", this.cell.initPack);
  }

  static onConnect(ws) {
    let player = new Player("player", Cell.list["test"], 0, 0, 0, ws.id);

    ws.onmsg("keyPress", (data)=>{
      player.pressing[data.input] = data.state;
    });

    ws.ssend("selfId", ws.id);
  }

  static onDisconnect(ws) {
    Player.list[ws.id].cell.removeEntity(ws.id);
    delete Player.list[ws.id];
  }
}
Player.list = [];

module.exports = Player;
