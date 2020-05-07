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
    this.terrain = data.terrain;
    this.props = data.props;
    for(let z in this.props) {
      for(let prop of this.props[z]) {
        if(prop.chest) {
          const id = this.id + "-" + prop.id + "-" + prop.x + "-" + prop.y + "-" + z;
          prop.container = new Container(prop.chest.size, prop.chest.items, id);
        }
      }
    }
    this.teleporters = data.teleporters;
    this.entities = new Map();
    for(const entity of data.entities)
      new Entity(Entity.loadList[entity.id], this, entity.x, entity.y, entity.z);

    Cell.list.set(this.id, this);
  }

  getProp(x, y, z) {
    if(this.props[z])
      for(let prop of this.props[z]) {
        let propObj = Prop.list.get(prop.id);
        if(x >= prop.x && x < prop.x + propObj.width
        && y >= prop.y && y < prop.y + propObj.height) {
          let tileNb = (x - prop.x) + propObj.width * (y - prop.y);
          return {...propObj, tileNb: tileNb, ...prop};
        }
      }
  }

  getEntity(x, y, z) {
    for(const entity of this.entities.values()) {
      if(entity.z === z && entity.y === y && entity.x === x)
        return entity;
    }
  }

  addEntity(entity) {
    this.entities.set(entity.id, entity);
    this.nextInitPack.entities.push(entity.initPack);
  }

  removeEntity(id) {
    this.entities.delete(id);
    this.nextRemovePack.entities.push(id);
  }

  update() {
    for(const entity of this.entities.values()) {
      entity.update();
    }
  }

  //NET CODE
  get initPack() {
    let entities = [];
    for(const entity of this.entities.values()) {
      entities.push(entity.initPack);
    }
    return {
      id: this.id,
      entities: entities,
    };
  }

  get updatePack() {
    let entities = [];
    for(const entity of this.entities.values()) {
      entities.push(entity.updatePack);
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
Cell.list = new Map();

module.exports = Cell;
