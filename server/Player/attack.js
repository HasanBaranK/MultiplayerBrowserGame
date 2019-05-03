module.exports = {
    lowerHealth,
    killPlayer,
    heal,
    meleeAttack,
    checkPlayerInRange,
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

function generateProjectile(projectiles, name, speed, startx, starty, finishX, finishY, direction) {

    let projectile = {
        name: name,
        speed: speed,
        direction: direction,
        startx: startx,
        starty: starty,
        finishX: finishX,
        finishY: finishY
    }
    projectiles.push(projectile)

}

async function rangedAttack(player, projectile, players) {

    for (let i = 0; i < amount; i++) {
        calculateDistance()

        projectile.y -= 3
        if (checkCollision(player, player.sizex, player.sizey, gridSize, collisionMap)) {
            player.y += 3
            break;
        }
        await sleep(5);
    }

    function sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    }


}

function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}