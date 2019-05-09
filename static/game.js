function drawMap(map) {
  for(let block in map){
    try {
      ctx.drawImage(images[map[block].type], map[block].x, map[block].y);
      if(map[block].health < 100){
        ctx.save()
        ctx.fillStyle = "red";
        ctx.globalAlpha = (1 - map[block].health/100) * (0.4)
        ctx.fillRect(map[block].x, map[block].y, 32, 32)
        ctx.restore()
      }
    }catch (e) {
      console.log(map[block])
    }
  }
}
let xCloud = -cvs.width

function drawItems(items){
  for(let item in items){
    ctx.drawImage(images[items[item].name],items[item].x,items[item].y);
  }
}
function drawProjectiles(projectiles){
  for(let projectile in projectiles){
    ctx.save()
    ctx.translate(projectiles[projectile].x, projectiles[projectile].y)
    ctx.rotate(projectiles[projectile].angle)
      console.log(projectiles[projectile].angle * Math.PI * 180)
    ctx.drawImage(images[projectiles[projectile].name],-8,-8);
    ctx.restore()
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
let xDifference = 0
let yDifference = 0
let timeDelayOfMouse = 0
function game(){
  try {
    meter.tickStart();
    let timeDelayOfMouse = perf.now()
    if(leftMousePressed && timeDelayOfMouse > delayMouseClickEmit){
      socket.emit('leftclick', {x:mousePosition.x+currentTransform.x, y:mousePosition.y+currentTransform.y})
      delayMouseClickEmit = timeDelayOfMouse + 500
    }
    else if(rightMousePressed && t > delayMouseClickEmit){
      socket.emit('rightclick', {x:mousePosition.x+currentTransform.x, y:mousePosition.y+currentTransform.y})
      delayMouseClickEmit = t + 500
    }
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
    if(players[socket.id].state.x != currentCoords.x || players[socket.id].state.y != currentCoords.y){
      xDifference = (currentCoords.x - players[socket.id].state.x)
      yDifference = (currentCoords.y - players[socket.id].state.y)
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
    }
    drawMap(map);
    drawItems(items);
    drawProjectiles(projectiles)

    displays['quickselect'].draw(ctx,currentTransform.x + cvs.width - 32, currentTransform.y + cvs.height - 500 ,players[socket.id].state.inventory)
    displays['healthbarframe'].draw(ctx, currentTransform.x, currentTransform.y + cvs.height - 40, 100)
    displays['energybarframe'].draw(ctx, currentTransform.x, currentTransform.y + cvs.height - 20, 100)
    displays['healthbar'].draw(ctx, currentTransform.x + 1, currentTransform.y + cvs.height - 40, players[socket.id].state.health)
    displays['energybar'].draw(ctx, currentTransform.x + 1, currentTransform.y + cvs.height - 20, 100, players[socket.id].state.health)
    buttons['inventoryopen'].isHovered()
    if(inInventory){
      displays['inventory'].draw(ctx,currentTransform.x,currentTransform.y,players[socket.id].state.inventory)
      buttons['inventoryopen'].draw(ctx,currentTransform.x,currentTransform.y)
    }
    else{
      buttons['inventory'].draw(ctx,currentTransform.x,currentTransform.y)
    }
    meter.tick()
    requestAnimationFrame(game)
  } catch (e) {
    console.log(e);
    meter.tick()
    requestAnimationFrame(game)
  }
}
