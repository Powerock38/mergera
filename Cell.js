const fs = require('fs');
const Entity = require("./Entity.js");
const Prop = require("./Prop.js");
const Container = require("./Container.js");

class Cell {
  static load(list, callback) {
    for(let cell of list) {
      let data = JSON.parse(fs.readFileSync("./client/cells/" + cell + ".json"));
      new Cell(cell, data);
      console.log("Loaded cell " + cell);
    }
    callback();
  }

  constructor(id, data) {
    this.id = id;
    this.resetPacks();
    this.defaultLevel = data.defaultLevel;
    this.terrain = data.terrain;
    this.props = data.props;
    for(let z in this.props) {
      for(let prop of this.props[z]) {
        if(prop.chest) {
          let id = this.id + "-" + prop.id + "-" + prop.x + "-" + prop.y + "-" + z;
          prop.container = new Container(prop.chest.size, prop.chest.items, id);
        }
      }
    }
    this.teleporters = data.teleporters;
    this.entities = [];
    for(let entity of data.entities)
      new Entity(Entity.loadList[entity.id], this, entity.x, entity.y, entity.z);

    Cell.list[this.id] = this;
  }

  getProp(x, y, z) {
    if(this.props[z])
      for(let prop of this.props[z]) {
        let propObj = Prop.list[prop.id];
        if(x >= prop.x && x < prop.x + propObj.width
        && y >= prop.y && y < prop.y + propObj.height) {
          let tileNb = (x - prop.x) + propObj.width * (y - prop.y);
          return {...propObj, tileNb: tileNb, ...prop};
        }
      }
  }

  getEntity(x, y, z) {
    for(let i in this.entities) {
      let entity = this.entities[i];
      if(entity.z === z && entity.y === y && entity.x === x)
        return entity;
    }
  }

  addEntity(entity) {
    this.entities[entity.id] = entity;
    this.nextInitPack.entities.push(entity.initPack);
  }

  removeEntity(id) {
    delete this.entities[id];
    this.nextRemovePack.entities.push(id);
  }

  update() {
    for(let i in this.entities) {
      this.entities[i].update();
    }
  }

  //NET CODE
  get initPack() {
    let entities = [];
    for(let i in this.entities) {
      entities.push(this.entities[i].initPack);
    }
    return {
      id: this.id,
      entities: entities,
    };
  }

  get updatePack() {
    let entities = [];
    for(let i in this.entities) {
      entities.push(this.entities[i].updatePack);
    }
    return {
      id: this.id,
      entities: entities,
    };
  }

  resetPacks() {
    this.nextInitPack = {id: this.id, entities:[]};
    this.nextRemovePack = {id: this.id, entities:[]};
  }
}
Cell.list = [];

module.exports = Cell;
