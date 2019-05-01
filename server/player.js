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

}

function lowerHealth(player,amount) {
    player.health -= amount
    if(player.health <= 0){
        playerDead(player)
    }
}

function playerDead(player) {
    players.splice(players.indexOf(player),1)

}

function heal(player, amount) {
    if(player.health + amount > 100){
        player.health = 100;
    } else {
        player.health += amount
    }
}
function meleeAttack(player,item) {
    let range = item.range;
    for(let otherPlayer in players ){
        if(otherPlayer !== player){
            if(player.x -range <= otherPlayer.x && otherPlayer.x   <= player.x + range && player.y - range <= otherPlayer.y && otherPlayer.y   <= player.y + range ){
                lowerHealth(otherPlayer,item.damage);
                return true
            }
        }
    }
    return false;
}