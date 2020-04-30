const Inventory = require("./Inventory.js");

class Container extends Inventory {
  constructor(size, items, id) {
    super(size, items, id, null);
    Container.list[this.id] = this;
  }

  send(ws, open) { // open = true => this inventory will open on the client
    ws.emit("container", {
      id: this.id,
      items: this.items,
      size: this.size,
      open: open,
    });
  }

  open(player) {
    player.viewing = this.id;
    this.send(SOCKET_LIST[player.id], true);
    SOCKET_LIST[player.id].of("inv:"+this.id).on("moveToMyInventory", (data)=>{
      this.moveToInventory(data.id, data.amount, player.inventory);
    });
    SOCKET_LIST[player.id].on("moveToContainer", (data)=>{
      player.inventory.moveToInventory(data.id, data.amount, this);
    });
  }

  close(player) {
    player.viewing = null;
    this.send(SOCKET_LIST[player.id], false);
    SOCKET_LIST[player.id].of("inv:"+this.id).removeAllListeners("moveToMyInventory");
    SOCKET_LIST[player.id].removeAllListeners("moveToContainer");
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
