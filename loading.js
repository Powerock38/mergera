const D = {up: "up", down: "down", left: "left", right: "right"};

Tile.load([
  {id:""},
  {id:"tile000"},
  {id:"tile001"},
  {id:"tile003"},
  {id:"tile005"},
  {id:"tile006"},
  {id:"tile007"},
  {id:"tile008"},
  {id:"tile009"},
  {id:"tile010"},
  {id:"tile011"},
  {id:"tile012"},
  {id:"tile013"},
  {id:"dirt1"},
  {id:"grass2"},
  {id:"dirt1grass2_bl-1"},
  {id:"dirt1grass2_bl-2"},
  {id:"dirt1grass2_br-1"},
  {id:"dirt1grass2_br-2"},
  {id:"dirt1grass2_corner-1"},
  {id:"dirt1grass2_corner-2"},
  {id:"dirt1grass2_rl-1"},
  {id:"dirt1grass2_tb-1"},
  {id:"dirt1grass2_tl-1"},
  {id:"dirt1grass2_tl-2"},
  {id:"dirt1grass2_tr-1"},
  {id:"dirt1grass2_tr-2"},
  {id:"dirt1grass2_trbl-1"},
  {id:"dirt1grass2_trbl-2"},
  {id:"wall"},
  {id:"stairs-up", stairs: D.up},
  {id:"stairs-left-1", stairs: D.left},
  {id:"stairs-left-2", stairs: D.left},
],()=>{
  console.log("All tiles loaded !");
  Prop.load([
    {id:"boat"},
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
