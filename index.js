class Input {

  keys = {}

  constructor() {
    this.keys = {}
    document.onkeydown = this.keydown
    document.onkeyup = this.keyup
  }

  keydown(key) {

    this.keys[key.key] = true
  }
  keyup(key) {

    this.keys[key.key] = false
  }
}

class Player {

  constructor(rds, cds){

    this.rds = rds
    this.cds = cds
  }

  draw(ctx){
    ctx.beginPath();
    ctx.arc(100, 75, 50, 0, 2 * Math.PI);
    ctx.fill();
  }

  update(cdsN){
    this.cds[0] += cdsN[0]
    this.cds[1] += cdsN[1]
  }
}


let cvs = document.getElementById('canvas')
let ctx = cvs.getContext('2d')
cvs.width = 800
cvs.height = 600
cvs.style.border = 'solid black 1px'

input = new Input()

var ws = new WebSocket("wss://138.251.241.114/5000");
ws.onopen = (e) => {
  console.log("Heyyy");
}
ws.onmessage = (e) => {
}
ws.onerror = (e) => {
  console.log(e);
}
