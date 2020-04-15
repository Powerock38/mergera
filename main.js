Tile.loadList([
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
],()=>{
  console.log("All tiles loaded !");
  Spritesheet.loadList([
    "player",
    "dog"
  ],()=>{
    console.log("All sprites loaded !");
    begin();
  });
});

function begin() {
  let map = new Cell("test");
  let player = new Player("player");
  let dog = new Entity("dog");
  map.addEntity(player, 0, 0, 0);
  map.addEntity(dog, 3, 5, 0);

  const canvas = document.getElementById("mainframe");
  CTX = canvas.getContext("2d");
  Cell.ctx = CTX;
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;

  //CTX.fillStyle = "rgba(0, 0, 0, 0.8)";
  setInterval(() => {
    CTX.clearRect(0, 0, canvas.width, canvas.height);
    map.draw();
    //CTX.fillRect(0, 0, canvas.width, canvas.height);
  }, 1000 / 30);
}
