let imageNames = ['dwarf1']
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
    console.log(this.ah);
  }
}

class Player {
  constructor(cds){
    this.cds = cds
    this.animations = []
  }
  draw(ctx){
    this.animations[0].draw(ctx, this.cds['x'], this.cds['y'])
  }
  update(cdsN){
    this.cds['x'] += cdsN['x']
    this.cds['y'] += cdsN['y']
  }
  addAnimation(img, sx, ex, sy, ey, iw, ih, aw, ah, speed){
    this.animations.push(new Animation(img, sx, ex, sy, ey, iw, ih, aw, ah, speed))
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
              players[player].addAnimation(images['dwarf1'],0,6,2,2,32,32,64,64,100)
              console.log('New Player joined');
            }
            else{
              players[player].cds = playersM[player]
            }
          }
          else if(players[player]!=null){
            delete players[player]
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
