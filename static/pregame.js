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
      console.log(this.name + ': I am being hovered over');
      return true
    }
  }
  isClicked(){
    if(this.isHovered() && mousePressed){
      console.log(this.name + ': I got clicked!');
      inInventory = true
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

    socket = io.connect('http://localhost:5000', {reconnection: false})
    socket.on('connect', () => {
      document.onkeydown = (key) => {
        for(let player in players){
          players[player].resetAnimations()
        }
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
              players[player].addAnimation(images['dwarf1'],0,4,0,0,32,32,64,64,100)//idle right
              players[player].addAnimation(images['dwarf1'],0,4,5,5,32,32,64,64,100)//idle left
              players[player].addAnimation(images['dwarf1'],0,7,1,1,32,32,64,64,100)//up
              players[player].addAnimation(images['dwarf1'],0,7,6,6,32,32,64,64,100)//left
              players[player].addAnimation(images['dwarf1'],0,7,6,6,32,32,64,64,100)//down
              players[player].addAnimation(images['dwarf1'],0,7,1,1,32,32,64,64,100)//right
              players[player].addAnimation1(images['dwarf1'],0,6,2,2,32,32,64,64,100)//attack right
              players[player].addAnimation1(images['dwarf1'],0,6,7,7,32,32,64,64,100)//attack right
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
