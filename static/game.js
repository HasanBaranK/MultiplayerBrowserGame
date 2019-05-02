function drawMap(map) {
  for(let block in map){
    ctx.drawImage(images.dirtBlock,map[block].x,map[block].y);
  }
}

function drawItems(items){
  for(let item in items){
    ctx.drawImage(images.coin_1,items[item].x-3,items[item].y);
  }
}
let currentCoords = {x:320,y:200}

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
    if(players[player].state.attacking){
      if(players[player].facing == 'right'){if(players[player].drawOnce(ctx, 'attackR')){socket.emit('stopattack', null)}}else {if(players[player].drawOnce(ctx, 'attackL')){socket.emit('stopattack', null)}}
    }
    else{
      switch (players[player].state.status) {
        case 0: if(players[player].facing == 'right'){players[player].draw(ctx, 'idleR')}else{players[player].draw(ctx, 'idleL')}
          break;
        case 1: players[player].draw(ctx, 'up')
          break;
        case 2: players[player].draw(ctx, 'runL');players[player].facing = 'left'
          break;
        case 3: players[player].draw(ctx, 'down')
          break;
        case 4: players[player].draw(ctx, 'runR');players[player].facing = 'right';
          break;
        default:
      }
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
    buttons[button].isClicked()
    buttons[button].draw(ctx,currentTransform.x,currentTransform.y)
  }
  if(inInventory){
    displays['inventory'].draw(ctx,currentTransform.x,currentTransform.y,players[socket.id].state.inventory)
  }
}
