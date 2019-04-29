let imageNames = ['dwarf1','dirtBlock']
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

class Animation {

  constructor(img, sx, ex, sy, ey, iw, ih, aw, ah, speed){
    this.img = img
    this.sx = sx
    this.ex = ex
    this.sy = sy
    this.ey = ey
    this.cx = sx
    this.cy = sy
    this.iw = iw
    this.ih = ih
    this.aw = aw
    this.ah = ah
    this.speed = speed
    this.animTime = new Date().getTime()
  }
  draw(ctx, x, y){
    let t = new Date().getTime()
    if(t > this.animTime){
      this.cx++
      this.animTime = t + this.speed
    }
    if(this.cx >= this.ex){
      this.cx = this.sx
    }
    if(this.cy > this.ey){
      this.cy = this.sy
    }
    ctx.drawImage(this.img,this.cx * this.iw,this.cy * this.ih,this.iw,this.ih, x, y, this.aw, this.ah)
  }
}

class Player {
  constructor(state){
    this.state = state
    this.animations = []
  }
  idle(ctx){
    this.animations[0].draw(ctx, this.state['x'], this.state['y'])
  }
  up(ctx){
    this.animations[1].draw(ctx, this.state['x'], this.state['y'])
  }
  left(ctx){
    this.animations[2].draw(ctx, this.state['x'], this.state['y'])
  }
  down(ctx){
    this.animations[3].draw(ctx, this.state['x'], this.state['y'])
  }
  right(ctx){
    this.animations[4].draw(ctx, this.state['x'], this.state['y'])
  }

  update(cdsN){
    this.state['x'] += cdsN['x']
    this.state['y'] += cdsN['y']
  }
  addAnimation(img, sx, ex, sy, ey, iw, ih, aw, ah, speed){
    this.animations.push(new Animation(img, sx, ex, sy, ey, iw, ih, aw, ah, speed))
  }
}

let socket, cvs, fps, ctx = undefined

keys = {}
players = {}
var map;
function whenImagesLoad(){
  socket = null
  fps = 60
  cvs = document.getElementById('canvas')
  ctx = cvs.getContext('2d')
  cvs.width = 640
  cvs.height = 640
  cvs.style.border = 'solid black 1px'

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
          if(playersM[player] != 0){
            if (!players[player]){
              players[player] = new Player(playersM[player])
              players[player].addAnimation(images['dwarf1'],0,4,0,0,32,32,64,64,100)//idle
              players[player].addAnimation(images['dwarf1'],0,7,1,1,32,32,64,64,100)//up
              players[player].addAnimation(images['dwarf1'],0,7,6,6,32,32,64,64,100)//left
              players[player].addAnimation(images['dwarf1'],0,7,6,6,32,32,64,64,100)//down
              players[player].addAnimation(images['dwarf1'],0,7,1,1,32,32,64,64,100)//right
              console.log('New Player joined');
            }
            else{
              players[player].state = playersM[player]
            }
          }
          else if(players[player]!=null){
            delete players[player]
          }
        }
      });
      socket.emit('new player')
      socket.on('map', (map) => {
        this.map = map;
          drawMap(map);
      });
      console.log('Connected to server');

      setInterval(game, 1000/fps)
    });
  }
}
function drawMap(map) {
  for(let block in map){
    console.log()
    ctx.drawImage(images.dirtBlock,map[block].x,map[block].y+90);
  }
}

function game(){
  socket.emit('movement', keys)

  ctx.clearRect(0, 0, cvs.width, cvs.height);
  for(let player in players){
    switch (players[player].state.status) {
      case 0: players[player].idle(ctx)
        break;
      case 1: players[player].up(ctx)
        break;
      case 2: players[player].left(ctx)
        break;
      case 3: players[player].down(ctx)
        break;
      case 4: players[player].right(ctx)
        break;
      default: ;

    }
  }
  drawMap(map);
}
