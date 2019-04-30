let imageNames = ['dwarf1','dirtBlock','coin_1','inventory']
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

let socket, cvs, fps, ctx, mousePressed = undefined
let mousePosition = {}
let buttons = []
let displays = {}
let inInventory = false

class UIDisplay{

  constructor(name,x,y,width,height){
    this.name = name
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  draw(ctx,ctX,ctY,inventory){
    ctx.save()
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(this.x+ctX, this.y+ctY, this.width, this.height)
    let add = 0
    for(let item in inventory){
      ctx.fillStyle = "rgba(255, 0, 0, 1)";
      ctx.fillRect(this.x+ctX + item*20 + add, this.y+ctY,20,20)
      add += 2
    }
    ctx.restore()
  }
}

class UIButton {
  constructor(name,x,y,img,width,height){
    this.name = name
    this.x = x
    this.y = y
    this.img = img
    this.width = width
    this.height = height
  }
  isHovered(){
    if(mousePosition.x >= this.x && mousePosition.x <= this.x + this.width && mousePosition.y >= this.y && mousePosition.y <= this.y + this.height){
      // console.log(this.name + ': I am being hovered over');
      return true
    }
  }
  isClicked(){
    if(this.isHovered() && mousePressed){
      console.log(this.name + ': I got clicked!');
    }
    return true
  }
  draw(ctx,ctX,ctY){
    ctx.drawImage(this.img, this.x+ctX, this.y+ctY, this.width, this.height)
  }
}

let keys = {}
let players = {}
var map;
var items;
let health = 100
let energy = 100
let currentTransform = {x:0,y:0}


function whenImagesLoad(){
  socket = null
  fps = 60
  cvs = document.getElementById('canvas')
  ctx = cvs.getContext('2d')
  cvs.width = 640
  cvs.height = 640
  cvs.style.border = 'solid black 1px'
  cvs.style.position = 'absolute';

  $('body').on('contextmenu', '#canvas', function(e){ return false; });
  buttons['inventory'] = new UIButton('Inventory', 0, 0, images.inventory, 32, 32)
  displays['inventory'] = new UIDisplay('Inventory', 100, 100, 400, 400)

  cvs.addEventListener('mousedown', function(event) {
    if(buttons['inventory'].isClicked()){
      inInventory = !inInventory
    }
    mousePressed = true;
    socket.emit('mouseclick', {x:mousePosition.x+currentTransform.x, y:mousePosition.y+currentTransform.y})
    console.log({x:mousePosition.x+currentTransform.x, y:mousePosition.y+currentTransform.y});
  });
  cvs.addEventListener('mouseup', function(event) {
    mousePressed = false;
  });

  cvs.addEventListener('mousemove', function(event) {
   mousePosition.x = event.offsetX || event.layerX;
   mousePosition.y = event.offsetY || event.layerY;
  });

  document.getElementById('connect').onclick = () =>{
    socket = io.connect('http://localhost:5000', {reconnection: false})
    socket.on('connect', () => {
      document.onkeydown = (key) => {
        if(key.key == 'Escape'){
          inInventory = false
        }
        if(key.key == 'i'){
          inInventory = !inInventory
        }
        if(!inInventory){
          keys[key.key] = true
        }
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
      socket.on('items', (items) => {
        this.items = items;
      });
      console.log('Connected to server');

      setInterval(game, 1000/fps)
    });
  }
}
function drawMap(map) {
  for(let block in map){
    ctx.drawImage(images.dirtBlock,map[block].x,map[block].y+90);
  }
}
function drawItems(items){
  for(let item in items){
    ctx.drawImage(images.coin_1,items[item].x-3,items[item].y+50);
  }
}
let currentCoords = {x:320,y:200}
let movespeed = 5
function game(){
  socket.emit('movement', keys)
  if(players[socket.id].state.x != currentCoords.x || players[socket.id].state.y != currentCoords.y){
    currentTransform.x -= currentCoords.x - players[socket.id].state.x
    currentTransform.y -= currentCoords.y - players[socket.id].state.y
    ctx.translate(currentCoords.x - players[socket.id].state.x,currentCoords.y - players[socket.id].state.y)
    currentCoords.x = players[socket.id].state.x
    currentCoords.y = players[socket.id].state.y
  }
  ctx.clearRect(currentTransform.x, currentTransform.y, cvs.width, cvs.height);
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
    ctx.font = "10px serif"
    if(player != socket.id){
      ctx.fillText(player, players[player].state.x, players[player].state.y);
    }
  }
  drawMap(map);
  drawItems(items);
  ctx.font = "bold 16px serif"
  ctx.fillText('Health: '+health, currentTransform.x + 0, currentTransform.y + 600);
  ctx.fillText('Energy: '+energy, currentTransform.x + 0, currentTransform.y + 620);
  for(let button in buttons){
    buttons[button].draw(ctx,currentTransform.x,currentTransform.y)
  }
  if(inInventory){
    displays['inventory'].draw(ctx,currentTransform.x,currentTransform.y,players[socket.id].state.inventory)
  }
}
