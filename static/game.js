function drawMap(map) {
  for(let block in map){
    ctx.drawImage(images[map[block].type],map[block].x,map[block].y);
  }
}

function drawItems(items){
  for(let item in items){
    ctx.drawImage(images[items[item].name],items[item].x,items[item].y);
  }
}

function determineAnimation(player){
  switch (player.state.status) {
    case 0: if(player.facing == 'right'){player.draw(ctx, 'idleR')}else{player.draw(ctx, 'idleL')}
      break;
    case 1: player.draw(ctx, 'up')
      break;
    case 2: player.draw(ctx, 'runL');player.facing = 'left'
      break;
    case 3: player.draw(ctx, 'down')
      break;
    case 4: player.draw(ctx, 'runR');player.facing = 'right';
      break;
    default:
  }
}

function game(){
  try {
    if(keys['ArrowLeft']){
      currentCoords.x+=5
    }
    if(keys['ArrowRight']){
      currentCoords.x-=5
    }
    if(keys['ArrowDown']){
      currentCoords.y-=5
    }
    if(keys['ArrowUp']){
      currentCoords.y+=5
    }
    socket.emit('movement', keys)
    socket.emit('map', players[socket.id].state)
    if(players[socket.id].state.x != currentCoords.x || players[socket.id].state.y != currentCoords.y){
      let xDifference = (currentCoords.x - players[socket.id].state.x)
      let yDifference = (currentCoords.y - players[socket.id].state.y)
      currentTransform.x -= xDifference
      currentTransform.y -= yDifference
      ctx.translate(xDifference, yDifference)
      currentCoords.x = players[socket.id].state.x
      currentCoords.y = players[socket.id].state.y
    }
    ctx.clearRect(currentTransform.x, currentTransform.y, cvs.width, cvs.height);
    for(let player in players){
      if(players[player].state.isDead){
        players[player].drawFinal(ctx, 'dieR')
      }
      else{
        if(players[player].isHit){
          if(players[player].facing == 'right'){
            if(players[player].drawOnce(ctx, 'gothitR')){
              players[player].isHit = false
              determineAnimation(players[player])
            }
          }
          if(players[player].facing == 'left'){
            if(players[player].drawOnce(ctx, 'gothitL')){
              players[player].isHit = false
              determineAnimation(players[player])
            }
          }
        }
        else if(players[player].state.attacking){
          if(players[player].facing == 'right'){
            if(players[player].drawOnce(ctx, 'attackR')){
              if(player == socket.id){
                socket.emit('stopattack', players[player].facing)
                }
              determineAnimation(players[player])
              }
            }
          else {
            if(players[player].drawOnce(ctx, 'attackL')){
              if(player == socket.id){
                socket.emit('stopattack', players[player].facing)
                }
              determineAnimation(players[player])
              }
            }
        }
        else {
          determineAnimation(players[player])
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
    buttons['inventory'].isClicked()
    displays['quickselect'].draw(ctx,currentTransform.x + cvs.width - 32, currentTransform.y + cvs.height - 500 ,players[socket.id].state.inventory)
    displays['healthbarframe'].draw(ctx, currentTransform.x, currentTransform.y + cvs.height - 40, 100)
    displays['energybarframe'].draw(ctx, currentTransform.x, currentTransform.y + cvs.height - 20, 100)
    displays['healthbar'].draw(ctx, currentTransform.x + 1, currentTransform.y + cvs.height - 40, players[socket.id].state.health)
    displays['energybar'].draw(ctx, currentTransform.x + 1, currentTransform.y + cvs.height - 20, 100, players[socket.id].state.health)

    if(inInventory){
      displays['inventory'].draw(ctx,currentTransform.x,currentTransform.y,players[socket.id].state.inventory)
      buttons['inventoryopen'].draw(ctx,currentTransform.x,currentTransform.y)
    }
    else{
      buttons['inventory'].draw(ctx,currentTransform.x,currentTransform.y)
    }
    requestAnimationFrame(game)
  } catch (e) {
    console.log(e);
    requestAnimationFrame(game)
  }
}
function whichGridIamOn(x, y, gridSize) {
  console.log(x + "," + y)
  ctx.save()
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";

  let gridx = x - (x % gridSize)
  let gridy = y - (y % gridSize)

  if (gridx < 0) {
    gridx = gridx - gridSize
  }
  if (gridy < 0) {
    gridy = gridy - gridSize
  }

  if (x < 0 && (0 - gridSize) < x) {
    gridx = x - (x % gridSize) - gridSize
  }
  if (y < 0 && (0 - gridSize) < y) {
    gridy = y - (y % gridSize) - gridSize
  }
  ctx.fillRect(gridx, gridy, gridSize, gridSize);
  ctx.restore()
}
