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
players = {}
self = new Player(20, {x:300, y:300})


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

    socket.on('state', (playersM) => {
      for(let player in playersM){
        if(!players[player]){
          players[player] = new Player(20, playersM[player])
        }
        else{
          if(playersM[player] == 0){
            delete players[player]
          }
          else{
            
            players[player].cds = playersM[player]
          }
        }
      }
    });

    socket.emit('new player')
    console.log('Connected to server');
    setInterval(game, 1000/fps)
  });
}


function game(){

  socket.emit('movement', keys)
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  for(let player in players){
    players[player].draw(ctx)
  }
}
