class Player {

  constructor(rds, cds){

    this.rds = rds
    this.cds = cds
  }

  draw(ctx){
    ctx.beginPath();
    ctx.arc(this.cds['x'], this.cds['y'], this.rds, 0, 2 * Math.PI);
    ctx.fill();
  }

  update(cdsN){
    this.cds['x'] += cdsN['x']
    this.cds['y'] += cdsN['y']
  }
}

keys = {}
let socket = null




fps = 60
let cvs = document.getElementById('canvas')
let ctx = cvs.getContext('2d')
cvs.width = 800
cvs.height = 600
cvs.style.border = 'solid black 1px'
player1 = new Player(20, {x:300, y:300})


document.getElementById('connect').onclick = () =>{

  socket = io.connect('http://localhost:5000', {reconnection: false})
  socket.on('connect', () => {
    console.log(socket.id)

    document.onkeydown = (key) => {

      keys[key.key] = true
    }
    document.onkeyup = (key) => {

      keys[key.key] = false

    }
    socket.on('state', (players) => {
      console.log(players[socket.id]);
      player1.cds = players[socket.id]
    });
    socket.emit('new player')
    console.log('Connected to server');
    setInterval(game, 1000/fps)
  });
}


function game(){

  // if(keys['a']){
  //
  //   player1.update([-5,0])
  // }
  // if(keys['s']){
  //
  //   player1.update([0,5])
  // }
  // if(keys['d']){
  //
  //   player1.update([5,0])
  // }
  // if(keys['w']){
  //
  //   player1.update([0,-5])
  // }
  socket.emit('movement', keys)
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  player1.draw(ctx)
}
