class Player {

  constructor(rds, cds){

    this.rds = rds
    this.cds = cds
  }

  draw(ctx){
    ctx.beginPath();
    ctx.arc(this.cds[0], this.cds[1], this.rds, 0, 2 * Math.PI);
    ctx.fill();
  }

  update(cdsN){
    this.cds[0] += cdsN[0]
    this.cds[1] += cdsN[1]
  }
}

keys = {}
document.onkeydown = (key) => {

  keys[key.key] = true
}

document.onkeyup = (key) => {

  keys[key.key] = false
}


let cvs = document.getElementById('canvas')
let ctx = cvs.getContext('2d')
cvs.width = 800
cvs.height = 600
cvs.style.border = 'solid black 1px'

var ws = new WebSocket("wss://138.251.241.114/5000");
ws.onopen = (e) => {
  console.log("Heyyy");
}
ws.onmessage = (e) => {
}
ws.onerror = (e) => {
  console.log(e);
}

player1 = new Player(20, [cvs.width / 2, cvs.height / 2])

setInterval(game, 23)


function game(){

  if(keys['a']){

    player1.update([-5,0])
  }
  if(keys['s']){

    player1.update([0,5])
  }
  if(keys['d']){

    player1.update([5,0])
  }
  if(keys['w']){

    player1.update([0,-5])
  }

  ctx.clearRect(0, 0, cvs.width, cvs.height);
  player1.draw(ctx)
}
