
module.exports = {
    generateMobs,
    generateMob
}

function idleMob() {
    //go a bit right from the current then a bit left
    //check if a player is close if it is go to him
    //if he is close enogh then attack not then follow him


}

function generateMobs(startX,amount,mobs,collisionMap,gridSize) {
    let amountOfMobs = Math.floor(Math.random() * Math.floor((amount / 10))) + 1;
    let density = 10
    console.log("Amount of Trees: " + amountOfMobs)
    let lastMob = startX +5
    for (let i = 0; i < amountOfMobs; i++) {

        let start = lastMob + Math.floor(Math.random() * ((amount + startX-lastMob)/density));
        if(start >= startX + amount-7){
            break
        }
        lastMob = start + 5
        let mob = generateMob(start,collisionMap,gridSize);
        mobs.push(mob)
    }

    return mobs;

}

function generateMob(start,collisionMap,gridSize) {
    let mob = {
        name: "Skeleton",
        x: start,
        y: getHeight(start,collisionMap,gridSize,640),
        status: 0,
        health: 100,
        energy: 100,
        sizex: 32,
        sizey: 32,
        isDead: false,
        inventory: [],
        attacking: false,
        facing: "right",
        equipped: [],
        holding: []
    };
    return mob
}
function getHeight(x, collisionMap,gridSize,start) {
    if (collisionMap[x * gridSize] !== undefined) {
        let searched = Object.keys(collisionMap[x * gridSize]).length;
        let result = start - searched * gridSize
        return result
    }
}