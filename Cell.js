const fs = require('fs');
const Entity = require("./Entity.js");
const Prop = require("./Prop.js");

class Cell {
  static load(list, callback) {
    for(let cell of list) {
      let data = JSON.parse(fs.readFileSync("./cells/" + cell + ".json"));
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
    this.teleporters = data.teleporters;
    this.entities = [];
    for(let entity of data.entities)
      new Entity(entity.sprite, this, entity.x, entity.y, entity.z);

    Cell.list[this.id] = this;
  }

  getProp(x, y, z) {
    if(this.props[z])
    for(let prop of this.props[z]) {
      let propObj = Prop.list[prop.id];
      if(x >= prop.x && x < prop.x + propObj.width
      && y >= prop.y && y < prop.y + propObj.height) {
        let tileNb = (x - prop.x) + propObj.width * (y - prop.y);
        return {...propObj, tileNb: tileNb};
      }
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
      terrain: this.terrain,
      props: this.props,
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
