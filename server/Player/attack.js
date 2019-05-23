const {checkCollision} = require("../collision");
const {generateItem} = require("./items");
const {dropAllInventory} = require("./inventory");
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


function lowerHealth(player, amount,items) {
    player.health -= amount
    console.log("Health: " + player.health)
    if (player.health <= 0) {
        console.log("should Dİe")
        killPlayer(player,items)
    }
}

function killPlayer(player,items) {
    player.isDead = true;
    dropAllInventory(player,items)
}

function heal(player, amount) {
  if(player.health == player.maximumHealth){
    return false
  }
    if (player.health + amount > player.maximumHealth) {
        player.health = player.maximumHealth;
    } else {
        player.health += amount
    }
    return true
}

function meleeAttack(players, attackerKey, item,mobs,isMob,items) {
    let peopleHit = {}
    peopleHit.mobs =[]
    peopleHit.players =[]
    let range = item.range;
    console.log(attackerKey + "Attacking")
    if(isMob === false) {
        for (let otherPlayer in players) {
            if (otherPlayer !== attackerKey) {
                if (checkPlayerInRange(players[attackerKey],players[otherPlayer], range, players[attackerKey].facing, players[attackerKey].sizey)) {
                    console.log("damaged: " + otherPlayer)
                    lowerHealth(players[otherPlayer], item.damage,items);
                    if(players[otherPlayer].health <= 0){
                      peopleHit.players.push({attackerId:attackerKey,attackedId:otherPlayer,damage:item.damage, xpGained:50, isMob:false})
                      players[attackerKey].xp += 50
                    }
                    else{
                      peopleHit.players.push({attackerId:attackerKey,attackedId:otherPlayer,damage:item.damage, isMob:false})
                    }
                }
            }
        }
        for (let otherPlayer in mobs) {
            if (checkPlayerInRange(players[attackerKey], mobs[otherPlayer],range, players[attackerKey].facing, players[attackerKey].sizey)) {
                console.log("damaged: " + otherPlayer)
                lowerHealth(mobs[otherPlayer], item.damage,items);
                if(mobs[otherPlayer].health <= 0){
                  peopleHit.mobs.push({attackerId:attackerKey,attackedId:otherPlayer,damage:item.damage, xpGained:200, isMob:true})
                  players[attackerKey].xp += 200
                }
                else{
                  peopleHit.mobs.push({attackerId:attackerKey,attackedId:otherPlayer, damage:item.damage, isMob:true})
                }
            }
        }
    }else {
        for (let otherPlayer in players) {
            if (checkPlayerInRange(mobs[attackerKey],players[otherPlayer] , range, mobs[attackerKey].facing, mobs[attackerKey].sizey)) {
                console.log("damaged: " + otherPlayer)
                lowerHealth(players[otherPlayer], item.damage,items);
                peopleHit.players.push({attackerId:attackerKey,attackedId:otherPlayer,damage:item.damage})
            }
        }
    }
    return peopleHit
}

function checkPlayerInRange(attacker, attacked, range, facing, attackingSizey) {

    if(attacked === 0 || attacked.isDead == true){
        return false;
    }
    var attackedHitBox = {
        left:   attacked.x,
        top:    attacked.y ,
        right:  attacked.x + (attacked.sizex *2),
        bottom: attacked.y + (attacked.sizey *2)
    };
    var attackerLeftAttackBox = {
        left:   attacker.x + (attacker.sizex *1.5) - range,
        top:    attacker.y  ,
        right:  attacker.x + (attacker.sizex *1.5) ,
        bottom: attacker.y + (attacker.sizex *2)
    };
    var attackerRightAttackBox = {
        left:   attacker.x + (attacker.sizex *0.5),
        top:    attacker.y ,
        right:  attacker.x + range,
        bottom: attacker.y + (attacker.sizex *2)
    };

    if (facing === "both") {
        if (attacker.x - range <= attacked.x + attacked.sizex && attacked.x + attacked.sizex <= attacker.x + range && attacker.y - attackingSizey <= attacked.y + attacked.sizey && attacked.y + attacked.sizey <= attacker.y + attackingSizey && attacked.health >0) {
            return true;
        }
    } else if (facing === "left") {
        if (doesBoxesIntersect(attackerLeftAttackBox,attackedHitBox)) {
            return true;
        }
    } else if (facing === "right") {
        if (doesBoxesIntersect(attackerRightAttackBox,attackedHitBox)) {
            return true;
        }
    }
    return false
}
// function doesBoxesIntersect(a, b) {
//     if (a.left > b.right || b.left > a.right) {
//         return false;
//     }
//
//     // If one rectangle is above other
//     if (a.top < b.bottom || a.bottom < a.bottom) {
//         return false;
//     }
//
//     return true;
// }
function doesBoxesIntersect(r1, r2) {
    return !(r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top);
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
                lowerHealth(player, projectile.damage,items);
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
                lowerHealth(player, projectile.damage,items);
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
                lowerHealth(player, projectile.damage,items);
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
