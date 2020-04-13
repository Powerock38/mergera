let map = new Cell("test");
let player = new Player();
let dog = new Entity("dog", 3, 5);
map.addEntity(player);
map.addEntity(dog);

window.onload = function() {
  const canvas = document.getElementById("mainframe");
  CTX = canvas.getContext("2d");
  Cell.ctx = CTX;
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;

  //CTX.fillStyle = "rgba(0, 0, 0, 0.8)";
  setInterval(()=>{
    CTX.clearRect(0, 0, canvas.width, canvas.height);
    map.draw();
    //CTX.fillRect(0, 0, canvas.width, canvas.height);
  }, 1000 / 30);
}
