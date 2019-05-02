let collisionFunctions = require("./collision.js");

module.exports={
    jump,
    meleeAttack,
    generateItem
}
async function jump(player, amount,collisionMap,gridSize) {
    for (let i = 0; i < amount ; i++) {
        player.y -= 3
        if(collisionFunctions.checkCollision(player,player.sizex,player.sizey,gridSize,collisionMap)){
            player.y += 3
            break;
        }
        await sleep(5);
    }
}
function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}
function generateItem(x, y, name, type, damage,range, defence, health,items) {
    let item = {
        x: x,
        y: y,
        name: name,
        type: type,
        damage: damage,
        range: range,
        defence: defence,
        health: health
    };
    items.push(item);
    return item
}

function lowerHealth(player,amount) {
    player.health -= amount
    console.log(player.health)
    if(player.health <= 0){
        console.log("should Dİe")
        player.isDead = true;
    }
}

function playerDead(player) {
    //players.splice(players.indexOf(player),1)

}

function heal(player, amount) {
    if(player.health + amount > 100){
        player.health = 100;
    } else {
        player.health += amount
    }
}
function meleeAttack(players,player,item) {
    let range = item.range;
    console.log("Attacking")
    for(let otherPlayer in players){

        if(otherPlayer !== player){
            console.log(otherPlayer)
            if(player.x - range <= otherPlayer.x <= player.x + range && player.y - range <= otherPlayer.y   <= player.y + range ){
                console.log("Is gonna get killed: " + otherPlayer)
                lowerHealth(players[otherPlayer],item.damage);
            }
        }
    }
    return players
}