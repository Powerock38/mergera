Tile.load([
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
  {id:"stairs-up", stairs: D.up},
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

let map, player, dog;

function begin() {
  map = new Cell("test");
  player = new Player("player");
  dog = new Entity("dog");

  map.addEntity(player, 0, 9, 0);
  map.addEntity(dog, 3, 5, 0);

  const canvas = document.getElementById("mainframe");
  Cell.ctx = canvas.getContext("2d");
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;

  //CTX.fillStyle = "rgba(0, 0, 0, 0.8)";
  //CTX.fillRect(0, 0, canvas.width, canvas.height);
  setInterval(() => {
    Cell.ctx.clearRect(0, 0, canvas.width, canvas.height);
    map.draw();
    console.log(player.x+":"+player.y+":"+player.z);
  }, 1000 / 30);
}
