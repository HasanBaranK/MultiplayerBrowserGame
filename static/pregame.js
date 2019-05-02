let imageNames = ['dwarf1','dirt_block','coin_item','inventory','inventory_UI','dirt_item','healthpotion_item','sword_item']
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

class Inventory{
  constructor(name,x,y,xOffset,yOffset,columnCount,rowCount,gridSize,actualSizeOffset){
    this.name = name
    this.x = x
    this.y = y
    this.xOffset = xOffset
    this.yOffset = yOffset
    this.columnCount = columnCount
    this.rowCount = rowCount
    this.gridSize = gridSize
    this.currentRow = 0
    this.actualSizeOffset = actualSizeOffset
  }
  draw(ctx,ctX,ctY,inventory){
    this.currentRow = 0
    ctx.drawImage(images['inventory_UI'],this.x+ctX, this.y+ctY)
    for(let item in inventory){
      if(item % this.columnCount == 0 && item != 0){
        this.currentRow++
      }
      let xOfItem = (this.x+ctX)+((item%this.columnCount)*this.gridSize)+(this.xOffset*this.gridSize) + this.actualSizeOffset/2
      let yOfItem = (this.y+ctY)+(this.yOffset*this.gridSize)+(this.currentRow*this.gridSize)+ (this.actualSizeOffset/2)
      ctx.drawImage(images[inventory[item].name],xOfItem,yOfItem,this.gridSize - this.actualSizeOffset,this.gridSize - this.actualSizeOffset)
      ctx.save()
      ctx.font = '16px bold'
      ctx.fillStyle = 'white'
      ctx.fillText(inventory[item].amount, xOfItem + 14, yOfItem + 29)
      ctx.restore()
    }
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
      return true
    }
  }
  isClicked(){
    if(this.isHovered() && mousePressed){
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
  displays['inventory'] = new Inventory('Inventory',80,50,1,9,13,5,32,12)

  cvs.addEventListener('mousedown', function(evt) {
    mousePressed = true;
    if(!inInventory){
      if(evt.button == 0){
        socket.emit('leftclick', {x:mousePosition.x+currentTransform.x, y:mousePosition.y+currentTransform.y})
      }
      else{
        socket.emit('rightclick', {x:mousePosition.x+currentTransform.x, y:mousePosition.y+currentTransform.y})
      }
    }
  });
  cvs.addEventListener('mouseup', function(event) {
    mousePressed = false;
  });
  cvs.addEventListener('contextmenu', function(event) {
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
    if(!inInventory){
      if(key.key == ' ' && !players[socket.id].attacking){
        socket.emit('attack', null)
      }
      keys[key.key] = true
    }
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
            players[player].addAnimation('runR',images['dwarf1'],0,7,1,32,32,64,64,100)
            players[player].addAnimationOnce('attackR',images['dwarf1'],0,6,2,32,32,64,64,50)
            players[player].addAnimationOnce('attackL',images['dwarf1'],0,6,7,32,32,64,64,50)
            players[player].addAnimationOnce('gothitR',images['dwarf1'],0,3,3,32,32,64,64,100)
            players[player].addAnimationOnce('gothitL',images['dwarf1'],0,3,8,32,32,64,64,100)
            players[player].addAnimationFinal('dieR',images['dwarf1'],0,6,4,32,32,64,64,50)
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
    socket.on('peoplegothit', (peoplewhogothit) => {
      for(let player in peoplewhogothit){
        players[peoplewhogothit[player]].isHit = true
      }
    })
  });
}
