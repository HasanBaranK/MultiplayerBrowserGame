let collisionFunctions = require("./collision.js");

module.exports={
    jump,
    meleeAttack,
    generateItem,
    inPlayerInventory,
    deleteItemInventory,
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

function generateItem(x, y, name, type, damage,range, defence, health,items,amount) {
    let item = {
        x: x,
        y: y,
        name: name,
        type: type,
        damage: damage,
        range: range,
        defence: defence,
        health: health,
        amount: amount
    };
    items.push(item);
    return item
}

function lowerHealth(player,amount) {
    player.health -= amount
    console.log("Health: "+player.health)
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
function meleeAttack(players,playerKey,item) {
    let range = item.range;
    console.log(playerKey +  "Attacking")
    for(let otherPlayer in players){

        if(otherPlayer !== playerKey){
            console.log(otherPlayer)
            if(checkPlayerInRange(players[playerKey].x + players[playerKey].sizex,players[playerKey].y + players[playerKey].sizey,players[otherPlayer],range,players[playerKey].facing,players[playerKey].sizey) ){
                console.log("damaged: " + otherPlayer)
                lowerHealth(players[otherPlayer],item.damage);
            }
        }
    }
    return players
}


function checkPlayerInRange(x,y,player,range,facing,attackingSizey) {
    console.log(x)
    console.log(player)
    console.log(x+range)
    console.log(facing)

    if(facing === "both") {
        if (x - range <= player.x + player.sizex && player.x+player.sizex <= x + range && y - attackingSizey <= player.y + player.sizey  && player.y + player.sizey <= y + attackingSizey) {
            console.log(x - range)
            console.log(player.x)
            console.log(x + range)
            return true;
        }
    }else if(facing === "left"){
        if (x - range <= player.x + player.sizex && player.x+ player.sizex <= x && y - attackingSizey <= player.y + player.sizey  && player.y + player.sizey <= y + attackingSizey) {
            console.log(x - range)
            console.log(player.x)
            console.log(x)
            return true;
        }
    }else if(facing === "right"){
        if (x <= player.x+ player.sizex && player.x+ player.sizex <= x + range &&  y - attackingSizey <= player.y + player.sizey  && player.y + player.sizey <= y + attackingSizey) {
            console.log(x)
            console.log(player.x)
            console.log(x + range)
            return true;
        }
    }
    return false
}
function inPlayerInventory(player,name) {
    for(let item in player.inventory){
        console.log(player.inventory[item])
        if(player.inventory[item].name === name){
            return true
        }
    }
    return false
}
function deleteItemInventory(player,name) {
    for(let item in player.inventory){
        if(player.inventory[item].name === name){
            console.log(player)
            player.inventory[item].amount -= 1;
            if(player.inventory[item].amount === 0) {
                player.inventory.splice(item, 1);
            }
            console.log(player)
            return true
        }
    }
    return false
}
