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

SOCKET_LIST = [];
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
  {id:"brick-stairs-left", stairs: D.left, block:[null, [D.up, D.down, D.left, D.right]]},
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
  SOCKET_LIST[ws.id] = ws;
  console.log("socket connection " + ws.id);
  Player.onConnect(ws);

  ws.on("close",()=>{
    Player.onDisconnect(ws);
    delete SOCKET_LIST[ws.id];
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
    for(let i in Cell.list) {
      Cell.list[i].update();
    }

    for(let i in Player.list) {
      let player = Player.list[i];

      if(packIsNotEmpty(player.cell.nextInitPack))
        player.ws.emit("init", player.cell.nextInitPack);

      if(packIsNotEmpty(player.cell.nextRemovePack))
        player.ws.emit("remove", player.cell.nextRemovePack);

      player.ws.emit("update", player.cell.updatePack);
    }

    for(let i in Cell.list) {
      Cell.list[i].resetPacks();
    }

  }, 1000 / 30);
}
