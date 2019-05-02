let imageNames = ['dwarf1','dirtBlock','coin_1','inventory','inventoryGUI']
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

let socket, cvs, ctx, mousePressed = undefined
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
    // ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.drawImage(images['inventoryGUI'],this.x+ctX, this.y+ctY)
    let spaceBetween = 0
    let sizeOfItem = 20
    let xoffset = 15
    let add = 0
    for(let item in inventory){
      ctx.drawImage(images[inventory[item].name], this.x+ctX + item*30 + add + xoffset, this.y+ctY + 220,sizeOfItem,sizeOfItem)
      add += spaceBetween
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
  cvs = document.getElementById('canvas')
  ctx = cvs.getContext('2d')
  cvs.width = 640
  cvs.height = 640
  cvs.style.border = 'solid black 1px'
  cvs.style.position = 'absolute';

  $('body').on('contextmenu', '#canvas', function(e){ return false; });
  buttons['inventory'] = new UIButton('Inventory', 0, 0, images.inventory, 32, 32)
  displays['inventory'] = new UIDisplay('Inventory', 100, 100, 400, 400)

  cvs.addEventListener('mousedown', function(evt) {
    mousePressed = true;
    if(evt.button == 0){
      socket.emit('leftclick', {x:mousePosition.x+currentTransform.x, y:mousePosition.y+currentTransform.y})
    }
    else{
      socket.emit('rightclick', {x:mousePosition.x+currentTransform.x, y:mousePosition.y+currentTransform.y})
    }
    console.log({x:mousePosition.x+currentTransform.x, y:mousePosition.y+currentTransform.y});
  });
  cvs.addEventListener('mouseup', function(event) {
    mousePressed = false;
  });
  cvs.addEventListener('contextmenu', function(event) {
      console.log({x:mousePosition.x+currentTransform.x, y:mousePosition.y+currentTransform.y});
  });
  cvs.addEventListener('mousemove', function(event) {
   mousePosition.x = event.offsetX || event.layerX;
   mousePosition.y = event.offsetY || event.layerY;
  });

  document.onkeydown = (key) => {
    if(key.key == 'i'){
      inInventory = !inInventory
    }
    if(key.key == 'Escape'){
      inInventory = false
    }
    if(key.key == ' ' && !players[socket.id].attacking){
      socket.emit('attack', null)
    }
    keys[key.key] = true
  }
  document.onkeyup = (key) => {
    keys[key.key] = false
  }

  socket = io.connect('http://localhost:5000', {reconnection: false})
  socket.on('connect', () => {
    socket.emit('new player')
    requestAnimationFrame(game)
    socket.on('state', (playersServer) => {
      for(let player in playersServer){
        if(playersServer[player] != 0){
          if (!players[player]){
            console.log('New Player joined');
            players[player] = new Player(playersServer[player])
            players[player].addAnimation('idleR',images['dwarf1'],0,4,0,32,32,64,64,100)
            players[player].addAnimation('idleL',images['dwarf1'],0,4,5,32,32,64,64,100)
            players[player].addAnimation('up',images['dwarf1'],0,7,1,32,32,64,64,100)
            players[player].addAnimation('runL',images['dwarf1'],0,7,6,32,32,64,64,100)
            players[player].addAnimation('down',images['dwarf1'],0,7,6,32,32,64,64,100)
            players[player].addAnimation('runR',images['dwarf1'],0,7,1,32,32,64,64,50)
            players[player].addAnimationOnce('attackR',images['dwarf1'],0,6,2,32,32,64,64,50)
            players[player].addAnimationOnce('attackL',images['dwarf1'],0,6,7,32,32,64,64,50)
          }
          else{
            if(players[player].state.status != playersServer[player].status){
              players[player].resetAnimations()
            }
            players[player].state = playersServer[player]
          }
        }
        else if(players[player]){
          delete players[player]
        }
      }
    });
    socket.on('map', (map) => {
      this.map = map;
    });
    socket.on('items', (items) => {
      this.items = items;
    });
  });
}
