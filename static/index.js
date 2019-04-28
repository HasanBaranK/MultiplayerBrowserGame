let imageNames = ['bird','wings','heart']
let images = {}
let promises = []

for(let image in imageNames){
  promises.push(new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = function() {
        resolve('resolved')
    }
    img.src = './images/' + imageNames[image] + '.png' ;
    images[imageNames[image]] = img
  }))
}

Promise.all(promises).then(whenImagesLoad)

class Sprite {
  constructor(img){
    this.img = img
  }
}

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

let socket, cvs, fps, ctx = undefined

keys = {}
players = {}

function whenImagesLoad(){
  socket = null
  fps = 60
  cvs = document.getElementById('canvas')
  ctx = cvs.getContext('2d')
  cvs.width = 640
  cvs.height = 640
  cvs.style.border = 'solid black 1px'
  let sprite = new Sprite()
  ctx.drawImage(images['heart'], 0, 0, images['heart'].width, images['heart'].height, cvs.width/2 - 25, cvs.height/2 - 25, 50, 50)

  document.getElementById('connect').onclick = () =>{
    socket = io.connect('http://localhost:5000', {reconnection: false})
    socket.on('connect', () => {
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
}


function game(){
  socket.emit('movement', keys)
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  for(let player in players){
    players[player].draw(ctx)
  }
}
