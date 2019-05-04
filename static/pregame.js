let socket, cvs, ctx, mousePressed = undefined
let mousePosition = {}
let buttons = []
let displays = {}
let inInventory = false

let keys = {}
let players = {}
let map;
let items;
let currentTransform = {x:0,y:0}

cvs = document.getElementById('canvas')
ctx = cvs.getContext('2d')
cvs.width  = 1280;
cvs.height = 700;
cvs.style.border = 'solid black 1px'
let currentCoords = {x:cvs.width / 2,y:cvs.height/2 + 100}

$('body').on('contextmenu', '#canvas', function (e) {
  return false;
});

class Inventory{
  constructor(name,img,x,y,xOffset,yOffset,columnCount,rowCount,gridSize,actualSizeOffset,textOffsetX,textOffsetY){
    this.name = name
    this.img = img
    this.x = x
    this.y = y
    this.xOffset = xOffset
    this.yOffset = yOffset
    this.columnCount = columnCount
    this.rowCount = rowCount
    this.gridSize = gridSize
    this.currentRow = 0
    this.actualSizeOffset = actualSizeOffset
    this.textOffsetX = textOffsetX
    this.textOffsetY = textOffsetY
  }
  draw(ctx,ctX,ctY,inventory){
    this.currentRow = 0
    ctx.drawImage(this.img,this.x+ctX, this.y+ctY)
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
      ctx.fillText(inventory[item].amount, xOfItem + this.textOffsetX, yOfItem + this.textOffsetY)
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
      inInventory = !inInventory
    }
    return true
  }
  draw(ctx,ctX,ctY){
    ctx.drawImage(this.img, this.x+ctX, this.y+ctY, this.width, this.height)
  }
}

class Bar {
  constructor(name, x, y,img, width, height){
    this.name = name
    this.x = x
    this.y = y
    this.img = img
    this.width = width || img.width
    this.height = height || img.height
  }
  draw(ctx,ctX,ctY,width){
    ctx.drawImage(this.img, this.x+ctX, this.y+ctY, (width / 100) * this.width, this.height)
  }
}

let images = {}
let promises = []
function loadImagesThen(folders){
  for(let folder in folders){
    for(let image in folders[folder]){
      promises.push(new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = function() {
          resolve('resolved')
        }
        img.src = './images/' + folder + '/' + folders[folder][image];
        images[folders[folder][image].split('.png')[0]] = img
      }))
    }
  }
  Promise.all(promises).then(() => {
    console.log('Finished loading images');
    buttons['inventory'] = new UIButton('Inventory', 0, 0, images['inventory'], 32, 32)
    buttons['inventoryopen'] = new UIButton('Inventoryopen', 0, 0, images['inventoryopen'], 32, 32)
    displays['inventory'] = new Inventory('Inventory',images['inventory_UI'], 80, 50, 1, 9, 13, 5, 32, 12,14,29)
    displays['quickselect'] = new Inventory('Quickselect', images['quickselect_UI'], 0,0,0,0,1,9,32,12,3,17)
    displays['healthbarframe'] = new Bar('barframe', 0, 0, images['health_bg_upscaled'], 200, 200/12.75)
    displays['energybarframe'] = new Bar('barframe', 0, 0, images['health_bg_upscaled'], 200, 200/12.75)
    displays['healthbar'] = new Bar('healthbar', 0, 0, images['health_fg_upscaled'], 196, 180/12.75)
    displays['energybar'] = new Bar('energybar', 0, 0, images['energy_fg_upscaled'], 196, 180/12.75)
    socket.emit('new player')
    window.requestAnimationFrame(game)
  });
}

document.body.onload = () => {

  socket = io.connect('http://localhost:5000')

  socket.on('connect', () => {
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

    socket.on('map', (mapServer) => {
      map = mapServer
    });

    socket.on('items', (itemsServer) => {
      items = itemsServer
    });

    socket.on('peoplegothit', (peoplewhogothit) => {
      for(let player in peoplewhogothit){
        players[peoplewhogothit[player]].isHit = true
      }
    });

    socket.on('images', (folders) => {
      loadImagesThen(folders)
    });

    document.onkeydown = (key) => {
      if(key.key == 'i'){
        inInventory = !inInventory
        return
      }
      if(key.key == 'Escape'){
        inInventory = false
        return
      }
      if(!inInventory){
        if(key.key == ' ' && !players[socket.id].attacking){
          let holding = players[socket.id].state.holding[0]
          if(holding){
            if(holding.type == 'melee'){
              socket.emit('attack', null)
              keys[key.key] = true
            }
          }
          return
        }
        keys[key.key] = true
      }
      let item = key.key-1
      if(!isNaN(item)){
        players[socket.id].state.holding = [players[socket.id].state.inventory[item]]
        socket.emit('holding', players[socket.id].state)
        console.log('sent');
      }
    }

    document.onkeyup = (key) => {
      keys[key.key] = false
    }

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

    cvs.addEventListener('mousemove', function(event) {
     mousePosition.x = event.offsetX || event.layerX;
     mousePosition.y = event.offsetY || event.layerY;
    });

    socket.emit('getimages')
  });

}
