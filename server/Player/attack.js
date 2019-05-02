module.exports={
    lowerHealth,
    killPlayer,
    heal,
    meleeAttack,
    checkPlayerInRange,
}


function lowerHealth(player,amount) {
    player.health -= amount
    console.log("Health: "+player.health)
    if(player.health <= 0){
        console.log("should Dİe")
        killPlayer(player)
    }
}

function killPlayer(player) {
    player.isDead = true;

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