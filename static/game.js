function drawMap(map) {
  for(let block in map){
    try {
      ctx.drawImage(images[map[block].type], map[block].x, map[block].y)
      if(map[block].health < 100){
        if(map[block].health <= 50){
          if(map[block].health <= 25){
            ctx.drawImage(images['crack03_block'], map[block].x, map[block].y)
            continue
          }
          ctx.drawImage(images['crack02_block'], map[block].x, map[block].y)
          continue
        }
        ctx.drawImage(images['crack01_block'], map[block].x, map[block].y)
        continue
      }
    }catch (e) {
      console.log(map[block])
    }
  }
}
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
let xComm = 0
let yComm = 0
let timeDelayOfMouse = 0
function game(){
  try {
    meter.tickStart();
    timeDelayOfMouse = perf.now()
    if(leftMousePressed && timeDelayOfMouse > delayMouseClickEmit){
      socket.emit('leftclick', {x:mousePosition.x+camera.x, y:mousePosition.y+camera.y})
      delayMouseClickEmit = timeDelayOfMouse + 500
    }
    else if(rightMousePressed && timeDelayOfMouse > delayMouseClickEmit){
      socket.emit('rightclick', {x:mousePosition.x+camera.x, y:mousePosition.y+camera.y})
      delayMouseClickEmit = timeDelayOfMouse + 500
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
      camera.move(-xDifference, -yDifference)
      currentCoords.x = players[socket.id].state.x
      currentCoords.y = players[socket.id].state.y
    }
    // xDifference = (currentCoords.x - players[socket.id].state.x)
    // yDifference = (currentCoords.y - players[socket.id].state.y)
    // currentCoords.x = players[socket.id].state.x
    // currentCoords.y = players[socket.id].state.y
    // xComm += xDifference
    // yComm += yDifference
    // if(xComm <= -camera.speed){
    //   xComm += camera.speed
    //   camera.move(camera.speed, 0)
    // }
    // else if(xComm >= camera.speed){
    //   xComm -= camera.speed
    //   camera.move(-camera.speed, 0)
    // }
    // else{
    //   camera.move(-xComm, 0)
    //   xComm = 0
    // }
    //
    // if(yComm <= -camera.speed){
    //   yComm += camera.speed
    //   camera.move(0, camera.speed)
    // }
    // else if(yComm >= camera.speed){
    //   yComm -= camera.speed
    //   camera.move(0, -camera.speed)
    // }
    // else{
    //   camera.move(0, -yComm)
    //   yComm = 0
    // }
    ctx.clearRect(camera.x, camera.y, cvs.width, cvs.height);
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
    for(let mob in mobs){
      switch (mobs[mob].state.status) {
        case 0: mobs[mob].draw(ctx, 'idle');
          break;
        default:
      }
    }
    drawMap(map);
    drawItems(items);
    drawProjectiles(projectiles)

    if(shouldUpdateUI){
      ctxChat.clearRect(0, 0, cvs.width, cvs.height);
      input.render()
      displays['messagebox'].draw(ctxChat, inChat)
      displays['quickselect'].draw(ctxChat,cvs.width - 32,cvs.height - 500 ,players[socket.id].state.inventory)
      displays['healthbarframe'].draw(ctxChat, 0,cvs.height - 40, 100)
      displays['energybarframe'].draw(ctxChat, 0,cvs.height - 20, 100)
      displays['healthbar'].draw(ctxChat, 1,cvs.height - 40, players[socket.id].state.health)
      displays['energybar'].draw(ctxChat, 1,cvs.height - 20, 100, players[socket.id].state.health)
      buttons['inventoryopen'].isHovered()
      if(inInventory){
        displays['inventory'].draw(ctxChat,0,0,players[socket.id].state.inventory)
        buttons['inventoryopen'].draw(ctxChat,0,0)
      }
      else{
        buttons['inventory'].draw(ctxChat,0,0)
      }
      shouldUpdateUI = false
    }
    meter.tick()
    requestAnimationFrame(game)
  } catch (e) {
    console.log(e);
    meter.tick()
    requestAnimationFrame(game)
  }
}
