const express = require('express');
const app = express();
const server = require('http').Server(app);
const WebSocket = require('ws');

app.get('/',(req,res)=>{
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
app.use(express.static(__dirname + '/client'));

const WebSocketServer = require("ws").Server;
const WebSocketServerWrapper = require("ws-server-wrapper");
const wss = new WebSocketServerWrapper(new WebSocketServer({ server }));

SOCKET_LIST = new Map();
DEBUG = true;

D = {up: "up", down: "down", left: "left", right: "right"};
const Entity = require("./Entity.js");
const Player = require("./Player.js");
const Cell = require("./Cell.js");
const Prop = require("./Prop.js");
const Container = require("./Container.js");

uuid = ()=>{
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Load objects
Prop.load([
  {id:"brick-stairs-up", stairs: D.up, block:[[D.left, D.right]]},
  {id:"brick-stairs-left", stairs: D.left, block:[[D.up], [D.up, D.down, D.left, D.right]]},
  {id:"boat", block:[[D.up, D.down, D.left, D.right]]},
  {id:"tree"},
  {id:"cherrytree-trunk", block:[null, [D.up]]},
  {id:"cherrytree-top"},
  {id:"wooden-chest-front", block:[[D.up, D.down, D.left, D.right]]},
],()=>{
  console.log("All props loaded");
  Cell.load([
    "test",
    "test2"
  ], ()=>{
    console.log("All cells loaded");
    begin();
  })
});

wss.on("connection", (ws)=>{
  ws.id = uuid();
  SOCKET_LIST.set(ws.id, ws);
  console.log("socket connection " + ws.id);
  Player.onConnect(ws);

  ws.on("close",()=>{
    Player.onDisconnect(ws);
    SOCKET_LIST.delete(ws.id);
    console.log("socket deconnection " + ws.id);
  });

  ws.on("error",(e)=>{
    return console.error(e);
  });

  //serval()
  if(DEBUG) {
    ws.on("eval",(data)=>{
      try {
        eval(data);
      }
      catch(error) {
        console.log("==== SERVAL ERROR ====");
        console.error(error);
        console.log("======================");
      }
    });
  }
});

TIMEOUTS = [];
timeout = (cb, time)=>{
  TIMEOUTS.push({cb: cb, time: time});
}

function packIsNotEmpty(pack) {
  let empty = true;
  for(let i in pack) {
    if(i !== "id" && pack[i].length > 0) {
      empty = false;
    }
  }
  return !empty;
}

server.listen(2000);
console.log("Server started");

var MAINLOOP;
function begin() {
  MAINLOOP = setInterval(() => {
    for(let i in TIMEOUTS) {
      let to = TIMEOUTS[i];
      to.time--;
      if(to.time <= 0) {
        to.cb();
        delete TIMEOUTS[i];
        let lastInd = TIMEOUTS.length;
        while(lastInd-- && TIMEOUTS[lastInd] == null);
        TIMEOUTS.length = lastInd + 1;
      }
    }

    for(const cell of Cell.list.values()) {
      cell.update();
    }

    for(const player of Player.list.values()) {
      if(packIsNotEmpty(player.cell.nextInitPack))
        player.ws.emit("init", player.cell.nextInitPack);

      if(packIsNotEmpty(player.cell.nextRemovePack))
        player.ws.emit("remove", player.cell.nextRemovePack);

      player.ws.emit("update", player.cell.updatePack);
    }

    for(const cell of Cell.list.values()) {
      cell.resetPacks();
    }

  }, 1000 / 30);
}
