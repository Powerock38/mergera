const express = require('express');
const app = express();
const server = require('http').Server(app);
const WebSocket = require('ws');

app.get('/',(req,res)=>{
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
app.use(express.static(__dirname + '/client'));

const wss = new WebSocket.Server({ server });

SOCKET_LIST = [];
DEBUG = true;

D = {up: "up", down: "down", left: "left", right: "right"};
const Entity = require("./Entity.js");
const Player = require("./Player.js");
const Cell = require("./Cell.js");
const Prop = require("./Prop.js");

uuid = ()=>{
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

wss.on('connection', (ws)=>{
  ws.id = uuid();
  SOCKET_LIST[ws.id] = ws;
  console.log('socket connection ' + ws.id);

  //custom functions
  ws.ssend = (header, data) => {
    let pack = {h: header, data: data};
    try {
      let jsonPack = JSON.stringify(pack);
      ws.send(jsonPack);
    }
    catch(err) {
      console.error(err);
    }
  }
  ws.onmsg = (header, callback) => {
    ws.on('message', (jsonPack)=>{
      try {
        let pack = JSON.parse(jsonPack);
        if(pack.h === header) {
          callback(pack.data);
        }
      }
      catch(err) {
        console.error(err);
      }
    });
  }

  Player.onConnect(ws);

  ws.on('close',(e)=>{
    Player.onDisconnect(ws);
    delete SOCKET_LIST[ws.id];
    console.log("socket deconnection " + ws.id + " (" + e + ")");
  });

  ws.on('error',(e)=>{
    return console.error(e);
  });

  //serval()
  if(DEBUG) {
    ws.onmsg("eval",(data)=>{
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

// Load objects
Prop.load([
  {id:"brick-stairs-up", stairs: D.up, block:[[D.left, D.right]]},
  {id:"brick-stairs-left", stairs: D.left, block:[null, [D.up, D.down, D.left, D.right]]},
  {id:"boat", block:[[D.up, D.down, D.left, D.right]]},
  {id:"tree"},
  {id:"cherrytree-trunk", block:[null, [D.up]]},
  {id:"cherrytree-top"},
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

function packIsNotEmpty(pack) {
  let empty = true;
  for(let i in pack) {
    if(i !== "id" && pack[i].length > 0) {
      empty = false;
    }
  }
  return !empty;
}

var MAINLOOP;

function begin() {
  server.listen(2000);
  console.log("Server started");

  MAINLOOP = setInterval(() => {
    for(let i in Cell.list) {
      Cell.list[i].update();
    }

    for(let i in SOCKET_LIST) {
      let ws = SOCKET_LIST[i];
      let player = Player.list[ws.id];

      if(packIsNotEmpty(player.cell.nextInitPack))
        ws.ssend("init", player.cell.nextInitPack);

      if(packIsNotEmpty(player.cell.nextRemovePack))
        ws.ssend("remove", player.cell.nextRemovePack);

      ws.ssend("update", player.cell.updatePack);
    }

    for(let i in Cell.list) {
      Cell.list[i].resetPacks();
    }

  }, 1000 / 30);
}
