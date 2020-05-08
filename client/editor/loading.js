const D = {up: "up", down: "down", left: "left", right: "right"};

Tile.load([
  "",
  "tile000",
  "tile001",
  "tile003",
  "tile005",
  "tile006",
  "tile007",
  "tile008",
  "tile009",
  "tile010",
  "tile011",
  "tile012",
  "tile013",
  "dirt1",
  "grass2",
  "dirt1grass2_t-1",
  "dirt1grass2_r-1",
  "dirt1grass2_b-1",
  "dirt1grass2_l-1",
  "dirt1grass2_tr-1",
  "dirt1grass2_tr-2",
  "dirt1grass2_tl-1",
  "dirt1grass2_tl-2",
  "dirt1grass2_br-1",
  "dirt1grass2_br-2",
  "dirt1grass2_bl-1",
  "dirt1grass2_bl-2",
  "dirt1grass2_rl-1",
  "dirt1grass2_tb-1",
  "dirt1grass2_corner-1",
  "dirt1grass2_corner-2",
  "dirt1grass2_trbl-1",
  "dirt1grass2_trbl-2",
  "flooring-wood1",
  "wall"
],()=>{
  console.log("All tiles loaded !");
  Prop.load([
    {id:"brick-stairs-up", stairs: D.up, block:[[D.left, D.right]]},
    {id:"brick-stairs-left", stairs: D.left, block:[null, [D.up, D.down, D.left, D.right]]},
    {id:"boat", block:[[D.up, D.down, D.left, D.right]]},
    {id:"tree"},
    {id:"cherrytree-trunk", block:[null, [D.up]]},
    {id:"cherrytree-top"},
  ],()=>{
    console.log("All props loaded !");
    Spritesheet.load([
      "player",
      "dog"
    ],()=>{
      console.log("All sprites loaded !");
      begin();
    });
  });
});
