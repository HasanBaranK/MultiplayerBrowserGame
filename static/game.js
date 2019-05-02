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
let currentCoords = {x:320,y:200}

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
    ctx.fillText('Health: '+ players[socket.id].state.health, currentTransform.x + 0, currentTransform.y + 600);
    ctx.fillText('Energy: '+ players[socket.id].state.energy, currentTransform.x + 0, currentTransform.y + 620);
    for(let button in buttons){
      buttons[button].isClicked()
      buttons[button].draw(ctx,currentTransform.x,currentTransform.y)
    }
    if(inInventory){
      displays['inventory'].draw(ctx,currentTransform.x,currentTransform.y,players[socket.id].state.inventory)
    }
    requestAnimationFrame(game)
  } catch (e) {
    requestAnimationFrame(game)
  }
}
