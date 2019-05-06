let socket, cvs, ctx, leftMousePressed, rightMousePressed = undefined
let delayMouseClickEmit = new Date().getTime()
let mousePosition = {}
let buttons = []
let displays = {}
let inInventory = false
let nameBuffer = 'Enter your message'
let messageHistory = []
let inChat = false

let keys = {}
let players = {}
let map;
let items;
let projectiles;
let currentTransform = {x:0,y:0}
let itemHoldingIndex = 0
let background = null
let chatInput = null
let chatBox = null

cvs = document.getElementById('canvas')
ctx = cvs.getContext('2d')
cvs.width  = 32*42;
cvs.height = 32*22;
cvs.style.border = 'solid black 1px'
let currentCoords = {x:cvs.width / 2,y:cvs.height/2 + 64}


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

class QuickSelect{
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
    ctx.drawImage(this.img,this.x+ctX, this.y+ctY)
    for(this.currentRow = 0; this.currentRow < 9; this.currentRow++){
      let itemCurrent = inventory[this.currentRow]
      let xOfItem = (this.x+ctX)+((this.currentRow%this.columnCount)*this.gridSize)+(this.xOffset*this.gridSize) + (this.actualSizeOffset/2)
      let yOfItem = (this.y+ctY)+(this.yOffset*this.gridSize)+(this.currentRow*this.gridSize)+ (this.actualSizeOffset/2)
      if(itemCurrent){
        ctx.drawImage(images[inventory[this.currentRow].name],xOfItem,yOfItem,this.gridSize - this.actualSizeOffset,this.gridSize - this.actualSizeOffset)
        ctx.save()
        ctx.font = '16px '
        ctx.fillStyle = 'white'
        ctx.fillText(inventory[this.currentRow].amount, xOfItem + this.textOffsetX, yOfItem + this.textOffsetY)
        ctx.restore()
      }
      if(this.currentRow == itemHoldingIndex){
        ctx.fillStyle = 'rgba(250,0,0,0.2)'
        ctx.fillRect(xOfItem - 5, yOfItem - 5, this.gridSize, this.gridSize)
        ctx.restore()
      }
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
    if(this.isHovered()){
      inInventory = !inInventory
      leftMousePressed = false
      rightMousePressed = false
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

class ChatInput {
  constructor(x, y, width, height){
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }
  draw(ctx, ctX, ctY, opacity, borderColor){
    ctx.save()
    ctx.globalAlpha = opacity
    ctx.fillStyle = 'white'
    ctx.fillRect(ctX + this.x, ctY + this.y, this.width, this.height)
    ctx.strokeStyle = borderColor
    ctx.rect(ctX + this.x -1, ctY + this.y - 1, this.width + 1, this.height + 1)
    ctx.stroke()
    ctx.fillStyle = 'black'
    ctx.font = "18px serif"
    ctx.fillText(nameBuffer, ctX + this.x + 2, ctY + this.y + 15)
    ctx.restore()
  }
  isHovered(){
    if(mousePosition.x >= this.x && mousePosition.x <= this.x + this.width && mousePosition.y >= this.y && mousePosition.y <= this.y + this.height){
      document.body.style.cursor = 'text';
      return true
    }
    return false
  }
  isClicked(){
    if(this.isHovered()){
      inChat = true
      if(nameBuffer == 'Enter your message'){
        nameBuffer = ''
      }
      leftMousePressed = false
      rightMousePressed = false
      return true
    }
    this.borderColor = 'black'
    return false
  }
}

class ChatBox{

  constructor(x, y, width, height){
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  draw(ctx, ctX, ctY){
    ctx.save()
    ctx.fillStyle = 'white'
    ctx.fillRect(ctX + this.x, ctY + this.y, this.width, this.height)
    ctx.fillStyle = 'black'
    let offSet = 15
    let messageSender = 'you'
    for(let message in messageHistory){
      if(messageHistory[message].sender != socket.id){
        ctx.fillText(messageHistory[message].sender + ': ' + messageHistory[message].message, this.x + ctX, this.y + ctY + offSet)
      }
      else{
        ctx.fillText(messageSender + ': ' + messageHistory[message].message, this.x + ctX, this.y + ctY + offSet)
      }
      offSet+= 15
    }
    ctx.restore()
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
    displays['quickselect'] = new QuickSelect('Quickselect', images['quickselect_UI'], 0,0,0,0,1,9,32,12,2,17)
    displays['healthbarframe'] = new Bar('barframe', 0, 0, images['health_bg_upscaled'], 200, 200/12.75)
    displays['energybarframe'] = new Bar('barframe', 0, 0, images['health_bg_upscaled'], 200, 200/12.75)
    displays['healthbar'] = new Bar('healthbar', 0, 0, images['health_fg_upscaled'], 196, 180/12.75)
    displays['energybar'] = new Bar('energybar', 0, 0, images['energy_fg_upscaled'], 196, 180/12.75)
    background = new AnimationsFiles(104, 500, cvs.width, cvs.height)
    chatInput = new ChatInput(cvs.width - 253, cvs.height - 28, 250, 24, 'black')
    chatBox = new ChatBox(chatInput.x, chatInput.y - 140, chatInput.width, chatInput.height + 100)

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

    socket.on('projectiles', (projectilesServer) => {
      projectiles = projectilesServer
    });

    socket.on('peoplegothit', (peoplewhogothit) => {
      for(let player in peoplewhogothit){
        players[peoplewhogothit[player]].isHit = true
      }
    });

    socket.on('images', (folders) => {
      loadImagesThen(folders)
    });

    socket.on('generalmessage', (message) => {
      messageHistory.push(message)
    })

    document.onkeydown = (key) => {
      if(inChat){
        var keycode = parseInt(key.which);
        if (keycode == 46 || keycode == 8) {
          event.preventDefault();
          nameBuffer = nameBuffer.slice(0,nameBuffer.length-1);
        }
        if(key.key == 'Enter' && nameBuffer.trim() != ''){
          socket.emit('generalmessage', {message:nameBuffer})
          nameBuffer = ''
        }
        if(key.key == 'Escape'){
          inChat = false
        }
      }
      else{
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
          itemHoldingIndex = item
          players[socket.id].state.holding = [players[socket.id].state.inventory[item]]
          socket.emit('holding', players[socket.id].state)
          console.log('sent');
        }
      }
    }

    document.onkeypress = (key) => {
      if(inChat){
        var keycode = parseInt(key.which);
        if (nameBuffer.length < 50)
        {
          nameBuffer += String.fromCharCode(keycode);
        }
      }
    }

    document.onkeyup = (key) => {
      keys[key.key] = false
    }

    cvs.addEventListener('mousedown', function(evt) {
      if(!inInventory){
        if(evt.button == 0){
          leftMousePressed = true
          buttons['inventory'].isClicked()
          if(!chatInput.isClicked()){
            inChat = false
          }
        }
        else{
          rightMousePressed = true
        }
      }
      else{
        if(evt.button == 0){
          buttons['inventory'].isClicked()
          if(!chatInput.isClicked()){
            inChat = false
          }
        }
      }
    });

    cvs.addEventListener('mouseup', function(evt) {
      if(!inInventory){
        if(evt.button == 0){
          leftMousePressed = false
        }
        else{
          rightMousePressed = false
        }
      }
    });

    cvs.addEventListener('mousemove', function(event) {
     mousePosition.x = event.offsetX || event.layerX;
     mousePosition.y = event.offsetY || event.layerY;
     try {
       if(!chatInput.isHovered()){
         document.body.style.cursor = 'auto';
       }
     } catch (e) {
     }
    });

    cvs.addEventListener('wheel', function(event) {
      if(event.deltaY > 0){
        itemHoldingIndex++
        if(itemHoldingIndex > 8){
          itemHoldingIndex = 0
        }
      }
      else{
        itemHoldingIndex--
        if(itemHoldingIndex < 0){
          itemHoldingIndex = 8
        }
      }
      players[socket.id].state.holding = [players[socket.id].state.inventory[itemHoldingIndex]]
      socket.emit('holding', players[socket.id].state)
      console.log('sent');
    });

    socket.emit('getimages')
  });

}
