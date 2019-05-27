function drawMap(map) {
    ctx.save()

    for (let block in map) {
        try {
            ctx.drawImage(images[map[block].type], map[block].x, map[block].y)
            if (map[block].health < 100) {
                if (map[block].health <= 50) {
                    if (map[block].health <= 25) {
                        ctx.drawImage(images['crack03_block'], map[block].x, map[block].y)
                        continue
                    }
                    ctx.drawImage(images['crack02_block'], map[block].x, map[block].y)
                    continue
                }
                ctx.drawImage(images['crack01_block'], map[block].x, map[block].y)
                continue
            }
        } catch (e) {
            console.log(map[block])
        }
    }
    ctx.restore();
}

function drawShadows(lightMap) {
    ctx.save()

    for (let mapX in lightMap) {
        for (let mapY in lightMap[mapX]) {
            if (lightMap[mapX][mapY] < 100) {
                let shadowAmount = 1 - lightMap[mapX][mapY] / 100;
                ctx.fillStyle = "rgb(0,0,0," + shadowAmount + ")";
                ctx.fillRect(mapX, mapY, 32, 32);
            }
        }
    }
    ctx.restore();
}

function drawItems(items) {
    for (let item in items) {
        ctx.drawImage(images[items[item].name], items[item].x, items[item].y);
    }
}

function drawProjectiles(projectiles) {
    for (let projectile in projectiles) {
        ctx.save()
        ctx.translate(projectiles[projectile].x, projectiles[projectile].y)
        ctx.rotate(projectiles[projectile].angle)
        ctx.drawImage(images[projectiles[projectile].name], -8, -8);
        ctx.restore()
    }
}

function determineAnimation(player) {
    switch (player.state.status) {
        case 0:
            if (player.facing == 'right') {
                player.draw(ctx, 'idleR')
            } else {
                player.draw(ctx, 'idleL')
            }
            break;
        case 1:
            player.draw(ctx, 'up')
            break;
        case 2:
            player.draw(ctx, 'runL');
            player.facing = 'left'
            break;
        case 3:
            player.draw(ctx, 'down')
            break;
        case 4:
            player.draw(ctx, 'runR');
            player.facing = 'right';
            break;
        default:
    }
}

function determineAnimationSkeleton(skeleton) {
    switch (skeleton.state.status) {
        case 0:
            if (skeleton.state.facing == 'right') {
                skeleton.draw(ctx, 'idleR')
            } else {
                skeleton.draw(ctx, 'idleL')
            }
            break;
        case 1:
            skeleton.draw(ctx, 'up')
            break;
        case 2:
            skeleton.draw(ctx, 'walkL');
            break;
        case 3:
            skeleton.draw(ctx, 'down')
            break;
        case 4:
            skeleton.draw(ctx, 'walkR')
            break;
        default:
    }
}

let xDifference = 0
let yDifference = 0
let xComm = 0
let yComm = 0
let timeDelayOfMouse = 0
let uiDelay = 0
let currentuiTime = 0


function game() {
    try {
        if (socket.disconnected) {
            return
        }
        meter.tickStart();
        timeDelayOfMouse = perf.now()
        if (!inInventory && leftMousePressed && timeDelayOfMouse > delayMouseClickEmit) {
            socket.emit('leftclick', {x: mousePosition.x + camera.x, y: mousePosition.y + camera.y})
            delayMouseClickEmit = timeDelayOfMouse + 500
        } else if (!inInventory && rightMousePressed && timeDelayOfMouse > delayMouseClickEmit) {
            socket.emit('rightclick', {x: mousePosition.x + camera.x, y: mousePosition.y + camera.y})
            delayMouseClickEmit = timeDelayOfMouse + 500
        }
        if (keys['ArrowLeft']) {
            currentCoords.x += 5
        }
        if (keys['ArrowRight']) {
            currentCoords.x -= 5
        }
        if (keys['ArrowDown']) {
            currentCoords.y -= 5
        }
        if (keys['ArrowUp']) {
            currentCoords.y += 5
        }
        socket.emit('movement', keys)
        if (players[socket.id].state.x != currentCoords.x || players[socket.id].state.y != currentCoords.y) {
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
        drawMap(map);
        drawShadows(lightMap);
        drawItems(items);
        drawProjectiles(projectiles)
        drawPopUps()
        drawHealedPops()
        for (let player in players) {
            if (players[player].state.isDead) {
                if (players[player].drawFinal(ctx, 'dieR')) {
                    players[player].isHit = false
                }
            } else {
                if (players[player].isHit) {
                    if (players[player].facing == 'right') {
                        if (players[player].drawOnce(ctx, 'gothitR')) {
                            players[player].isHit = false
                            determineAnimation(players[player])
                        }
                    }
                    if (players[player].facing == 'left') {
                        if (players[player].drawOnce(ctx, 'gothitL')) {
                            players[player].isHit = false
                            determineAnimation(players[player])
                        }
                    }
                } else if (players[player].state.attacking) {
                    if (players[player].facing == 'right') {
                        if (players[player].drawOnce(ctx, 'attackR')) {
                            if (player == socket.id) {
                                socket.emit('stopattack', players[player].facing)
                                players[player].state.attacking = false
                            }
                            determineAnimation(players[player])
                        }
                    } else {
                        if (players[player].drawOnce(ctx, 'attackL')) {
                            if (player == socket.id) {
                                socket.emit('stopattack', players[player].facing)
                                players[player].state.attacking
                            }
                            determineAnimation(players[player])
                        }
                    }
                } else {
                    determineAnimation(players[player])
                }
            }
        }
        for (let mob in mobs) {
            if (mobs[mob].state.isDead) {
                if (mobs[mob].drawFinal(ctx, 'dead')) {
                    mobs[mob].isHit = false
                }
            } else {
                if (mobs[mob].isHit) {
                    if (mobs[mob].drawOnce(ctx, 'gothit')) {
                        mobs[mob].isHit = false
                    }
                } else if (mobs[mob].state.isAttacking) {
                    if (mobs[mob].state.facing == 'left') {
                        mobs[mob].animationsOnce['attackL'].currentColumn = Math.round(mobs[mob].state.progress / 100 * mobs[mob].animationsOnce['attackL'].endColumn)
                        mobs[mob].drawOnce(ctx, 'attackL')
                    } else {
                        mobs[mob].animationsOnce['attackR'].currentColumn = Math.round(mobs[mob].state.progress / 100 * mobs[mob].animationsOnce['attackL'].endColumn)
                        mobs[mob].drawOnce(ctx, 'attackR')
                    }
                } else {
                    determineAnimationSkeleton(mobs[mob])
                }
            }
        }

        currentuiTime = perf.now()
        if (shouldUpdateUI || currentuiTime > uiDelay) {
            updateUI()
            shouldUpdateUI = false
            uiDelay = currentuiTime + 1000
        }
        meter.tick()
        requestAnimationFrame(game)
    } catch (e) {
        console.log(e);
        meter.tick()
        requestAnimationFrame(game)
    }
}
