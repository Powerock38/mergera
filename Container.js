const Inventory = require("./Inventory.js");

class Container extends Inventory {
  constructor(size, items, id) {
    super(size, items, id, null);
    Container.list[this.id] = this;
  }

  send(ws, open) { // open = true => this inventory will open on the client
    ws.ssend("container", {
      id: this.id,
      items: this.items,
      size: this.size,
      open: open,
    });
  }

  open(player) {
    player.viewing = this.id;
    this.send(SOCKET_LIST[player.id], true);
  }

  close(player) {
    player.viewing = null;
    this.send(SOCKET_LIST[player.id], false);
  }

  update(open) {
    let playerlist = require("./Player.js").list;
    let viewers = [];
    for(let i in playerlist) {
      let player = playerlist[i];
      if(player.viewing === this.id)
        viewers.push(player);
    }

    for(let viewer of viewers)
      if(SOCKET_LIST[viewer.id])
        this.send(SOCKET_LIST[viewer.id], null);
  }
}
Container.list = [];

module.exports = Container;
