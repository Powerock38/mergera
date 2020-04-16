const D = {up: 11, down: 2, left: 5, right: 8};

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
  {id:"wall"},
  {id:"stairs-up", stairs: D.up},
  {id:"stairs-left-1", stairs: D.left},
  {id:"stairs-left-2", stairs: D.left},
],()=>{
  console.log("All tiles loaded !");
  Spritesheet.load([
    "player",
    "dog"
  ],()=>{
    console.log("All sprites loaded !");
    begin();
  });
});
