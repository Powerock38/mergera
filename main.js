var mainLoop;
var grid = false;
let map, player, dog;

function begin() {
  map = new Cell("test");
  player = new Player("player");
  //dog = new Entity("dog");

  map.addEntity(player, 11, 6, 0);
  //map.addEntity(dog, 3, 5, 0);

  const canvas = document.getElementById("mainframe");
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  Cell.ctx = canvas.getContext("2d");
  Cell.ctx.width = canvas.width;
  Cell.ctx.height = canvas.width;

  let coos = document.getElementById("coos");

  //CTX.fillStyle = "rgba(0, 0, 0, 0.8)";
  //CTX.fillRect(0, 0, canvas.width, canvas.height);
  mainLoop = setInterval(() => {
    Cell.ctx.clearRect(0, 0, Cell.ctx.width, Cell.ctx.height);
    map.draw();
    if(grid) {
      for(let i = 0; i < 15; i++) {
        Cell.ctx.beginPath();
        Cell.ctx.moveTo(i * 32,0);
        Cell.ctx.lineTo(i * 32, 15 * 32);
        Cell.ctx.stroke();

        Cell.ctx.beginPath();
        Cell.ctx.moveTo(0,i * 32);
        Cell.ctx.lineTo(15 * 32, i * 32);
        Cell.ctx.stroke();
      }
    }
    coos.innerHTML = "XYZ : ("+player.x+";"+player.y+";"+player.z+")";
  }, 1000 / 30);
}
