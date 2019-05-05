const {checkCollision} = require("../collision");
const {generateItem} = require("./items");
module.exports = {
    lowerHealth,
    killPlayer,
    heal,
    meleeAttack,
    checkPlayerInRange,
    calculateProjectiles,
    generateProjectile
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

function meleeAttack(players, playerKey, item) {
    let peopleHit = []
    let range = item.range;
    console.log(playerKey + "Attacking")
    for (let otherPlayer in players) {

        if (otherPlayer !== playerKey) {
            console.log(otherPlayer)
            if (checkPlayerInRange(players[playerKey].x + players[playerKey].sizex, players[playerKey].y + players[playerKey].sizey, players[otherPlayer], range, players[playerKey].facing, players[playerKey].sizey)) {
                console.log("damaged: " + otherPlayer)
                lowerHealth(players[otherPlayer], item.damage);
                peopleHit.push(otherPlayer)
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

function generateProjectile(projectiles, name, speed, startx, starty, range, finishX, finishY, direction, damage, power) {
    let xLength = Math.abs(finishX - startx)
    let yLength = Math.abs(finishY - starty)
    let total = xLength + yLength;
    let xPercentage = Math.floor(xLength * 100 / total)
    let yPercentage = Math.floor(yLength * 100 / total)
    let projectile = {
        name: name,
        speed: speed,
        direction: direction,
        range: range,
        x: startx,
        y: starty,
        xPercentage: xPercentage,
        yPercentage: yPercentage,
        power: power,
        damage: damage
    }
    projectiles.push(projectile)

}

async function calculateProjectiles(projectiles, players, items, gridSize, collisionMap) {
    let sleepTime = 10;
    for (let projectile in projectiles) {

        projectile = projectiles[projectile]
        for (let player in players) {
            player = players[player]
            if (projectile.range >= calculateDistance(projectile.x, projectile.y, player.x, player.y)) {
                lowerHealth(player, projectile.damage);
            }
        }
        if(projectile.power >= 0) {
            if (projectile.direction == "right") {

                projectile.y -= projectile.power * (projectile.yPercentage / 10)
                projectile.x += projectile.power * (projectile.xPercentage / 10)

                projectile.power = projectile.power - 1;

                if (checkCollision(projectile, 32, 32, gridSize, collisionMap)) {
                    deleteProjectile(projectiles, projectile)
                    generateItem(projectile.x, projectile.y, "arrow0_item", "projectile", 10, 32, 0, 1, items, 1, false)
                    break;
                }
            } else {
                projectile.y -= projectile.power * (projectile.yPercentage / 10)
                projectile.x -= projectile.power * (projectile.xPercentage / 10)
                if (checkCollision(projectile, 32, 32, gridSize, collisionMap)) {
                    deleteProjectile(projectiles, projectile)
                    generateItem(projectile.x, projectile.y, "arrow0_item", "projectile", 10, 32, 0, 1, items, 1, false)
                    break;
                }
            }
        }
        for (let player in players) {
            player = players[player]
            if (projectile.range >= calculateDistance(projectile.x, projectile.y, player.x, player.y)) {
                lowerHealth(player, projectile.damage);
            }
            projectile.y += 3
            if (checkCollision(player, player.sizex, player.sizey, gridSize, collisionMap)) {
                deleteProjectile(projectiles, projectile)
                generateItem(projectile.x, projectile.y, "arrow0_item", "projectile", 10, 32, 0, 1, items, 1, false)
                break;
            }
        }


    }


}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}

function deleteProjectile(projectiles, projectile) {
    projectiles[projectile] == undefined
}