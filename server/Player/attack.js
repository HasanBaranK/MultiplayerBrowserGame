const {checkCollision} = require("../collision");
const {generateItem} = require("./items");
module.exports = {
    lowerHealth,
    killPlayer,
    heal,
    meleeAttack,
    checkPlayerInRange,
    calculateProjectile,
    generateProjectile,
    projectileGravity
}


function lowerHealth(player, amount) {
    player.health -= amount
    console.log("Health: " + player.health)
    if (player.health <= 0) {
        console.log("should Dİe")
        killPlayer(player)
    }
}

function killPlayer(player) {
    player.isDead = true;

}

function heal(player, amount) {
    if (player.health + amount > 100) {
        player.health = 100;
    } else {
        player.health += amount
    }
}

function meleeAttack(players, attackerKey, item,mobs,isMob) {
    let peopleHit = {}
    peopleHit.mobs =[]
    peopleHit.players =[]
    let range = item.range;
    console.log(attackerKey + "Attacking")
    if(isMob === false) {
        for (let otherPlayer in players) {

            if (otherPlayer !== attackerKey) {
                console.log(otherPlayer)
                if (checkPlayerInRange(players[attackerKey].x + players[attackerKey].sizex, players[attackerKey].y + players[attackerKey].sizey, players[otherPlayer], range, players[attackerKey].facing, players[attackerKey].sizey)) {
                    console.log("damaged: " + otherPlayer)
                    lowerHealth(players[otherPlayer], item.damage);
                      peopleHit.players.push({attackedId:otherPlayer, damage:item.damage})
                }
            }
        }
        for (let otherPlayer in mobs) {
            if (checkPlayerInRange(players[attackerKey].x + players[attackerKey].sizex, players[attackerKey].y + players[attackerKey].sizey, mobs[otherPlayer], range, players[attackerKey].facing, players[attackerKey].sizey)) {
                console.log("damaged: " + otherPlayer)
                lowerHealth(mobs[otherPlayer], item.damage);
                if(mobs[otherPlayer].health < 0){
                  players[attackerKey].xp += 50
                  peopleHit.mobs.push({attackerId:attackerKey,attackedId:otherPlayer, damage:item.damage, xp:50})
                }
                else{
                  peopleHit.mobs.push({attackerId:attackerKey,attackedId:otherPlayer, damage:item.damage})
                }
            }
        }
    }else {
        for (let otherPlayer in players) {
            if (checkPlayerInRange(mobs[attackerKey].x + mobs[attackerKey].sizex, mobs[attackerKey].y + mobs[attackerKey].sizey, players[otherPlayer], range, mobs[attackerKey].facing, mobs[attackerKey].sizey)) {
                console.log("damaged: " + otherPlayer)
                lowerHealth(players[otherPlayer], item.damage);
                peopleHit.players.push({id:otherPlayer, damage:item.damage})
            }

        }
    }
    return peopleHit
}

function checkPlayerInRange(x, y, player, range, facing, attackingSizey) {


    if (facing === "both") {
        if (x - range <= player.x + player.sizex && player.x + player.sizex <= x + range && y - attackingSizey <= player.y + player.sizey && player.y + player.sizey <= y + attackingSizey) {
            return true;
        }
    } else if (facing === "left") {
        if (x - range <= player.x + player.sizex && player.x + player.sizex <= x && y - attackingSizey <= player.y + player.sizey && player.y + player.sizey <= y + attackingSizey) {
            return true;
        }
    } else if (facing === "right") {
        if (x <= player.x + player.sizex && player.x + player.sizex <= x + range && y - attackingSizey <= player.y + player.sizey && player.y + player.sizey <= y + attackingSizey) {
            return true;
        }
    }
    return false
}

function generateProjectile(projectiles, name, speed, startx, starty, range, finishX, finishY, xdirection,ydirection, damage, power) {
    let xLength = Math.abs(finishX - startx)
    let yLength = Math.abs(finishY - starty)
    let total = xLength + yLength;
    let xPercentage = Math.floor(xLength * 100 / total)
    let yPercentage = Math.floor(yLength * 100 / total)
    let projectile = {
        name: name,
        speed: speed,
        xdirection: xdirection,
        ydirection: ydirection,
        range: range,
        x: startx,
        y: starty,
        xPercentage: xPercentage,
        yPercentage: yPercentage,
        power: power,
        damage: damage,
        angle: 0
    }
    projectiles.push(projectile)
    return projectiles.indexOf(projectile)
}

async function calculateProjectile(projectiles,projectile, players, items, gridSize, collisionMap) {
    let sleepTime = 25;
    let speed = 0.002
    let gravityAmount = 5
    let indexProjectile = projectile
    projectile = projectiles[projectile]
    let startPower = projectile.power

    let xamountTraveled = 0;
    let yamountTraveled = 0;

    while (projectile.power >= 0) {

        if (projectile.xdirection == "right") {


            xamountTraveled = speed * (startPower * (projectile.xPercentage))
            projectile.x += xamountTraveled
        } else {
            xamountTraveled = speed * projectile.power * (projectile.xPercentage )
            projectile.x -=xamountTraveled
        }
        if(projectile.ydirection == "up"){
            yamountTraveled = speed * (projectile.power * (projectile.yPercentage))
            projectile.y -= yamountTraveled
        }else{
            yamountTraveled = speed * projectile.power * (projectile.yPercentage)
            projectile.y -=yamountTraveled
        }


        projectile.power = projectile.power - 1;

        projectile.y += gravityAmount
        if (checkCollision(projectile, 32, 32, gridSize, collisionMap)) {
            deleteProjectile(projectiles, indexProjectile)
            generateItem(projectile.x, projectile.y, "arrow0_item", "projectile", 10, 20, 0, 1, items, 1, false)
            break;
        }
        for (let player in players) {
            player = players[player]
            if (projectile.range >= calculateDistance(projectile.x, projectile.y, player.x+player.sizex, player.y+player.sizey)) {
                lowerHealth(player, projectile.damage);
            }
        }
        projectile.angle = getAngleRad(xamountTraveled,yamountTraveled+gravityAmount)
        await sleep(sleepTime)

    }

    for (;startPower > projectile.power ;projectile.power++) {

        if (projectile.direction == "right") {
            xamountTraveled = speed * projectile.power * (projectile.xPercentage / 10)
            projectile.x += xamountTraveled
        }{
            xamountTraveled = speed * projectile.power * (projectile.xPercentage / 10)
            projectile.x -= xamountTraveled
        }

        projectile.y += gravityAmount
        if (checkCollision(projectile, 32, 32, gridSize, collisionMap)) {
            deleteProjectile(projectiles, indexProjectile)
            generateItem(projectile.x, projectile.y, "arrow0_item", "projectile", 10, 32, 0, 1, items, 1, false)
            break;
        }
        for (let player in players) {
            player = players[player]
            if (projectile.range >= calculateDistance(projectile.x, projectile.y, player.x+player.sizex, player.y+player.sizey)) {
                lowerHealth(player, projectile.damage);
            }
        }
        projectile.angle = getAngleRad(xamountTraveled,gravityAmount)
        await sleep(sleepTime)
    }


    function sleep(ms){
        return new Promise(resolve=>{
            setTimeout(resolve,ms)
        })
    }

}

function getAngleRad(xamount,yamount) {
    var angleRad = Math.atan((yamount)/(xamount));
    return(angleRad);
}
function projectileGravity(projectiles, players, gridSize, collisionMap, items,gravityAmount) {
    for (let projectile in projectiles) {
        let indexProjectile = projectile
        projectile = projectiles[projectile]

        projectile.y += gravityAmount
        for (let player in players) {
            player = players[player]
            if (projectile.range >= calculateDistance(projectile.x, projectile.y, player.x+player.sizex, player.y+player.sizey)) {
                lowerHealth(player, projectile.damage);
            }
        }
        if (checkCollision(projectile, 32, 32, gridSize, collisionMap)) {
            deleteProjectile(projectiles, indexProjectile)
            generateItem(projectile.x, projectile.y, "arrow0_item", "projectile", 10, 64, 0, 1, items, 1, false)
            break;
        }

    }
}

function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}

function deleteProjectile(projectiles, indexProjectile) {
    projectiles.splice(indexProjectile, 1)
}
