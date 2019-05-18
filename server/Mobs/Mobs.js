const {move} = require("./../collision");
const {meleeAttack} = require("./../Player/attack");
const {addItemInventory} = require("./../Player/inventory");
const {generateItem} = require("./../Player/items");
module.exports = {
    generateMobs,
    generateMob,
    playerCloseToMob
}

function MobAI(players,player,mob, collisionMap,attackRange) {
    //go a bit right from the current then a bit left
    //check if a player is close if it is go to him
    //if he is close enogh then attack not then follow him

    if (player == null) {
        let number = Math.floor(Math.random());
        if (number == 0) {
            move("left", mob, 32, collisionMap, 5)
        } else {
            move("right", mob, 32, collisionMap, 5)
        }

    } else {
        if (player.x > mob.x) {
            move("right", mob, 32, collisionMap, 5)
        } else {
            move("left", mob, 32, collisionMap, 5)
        }
        let distance = calculateDistance(player.x + player.sizex, player.y + player.sizey, mob.x + mob.sizex, mob.y + mob.sizey)
        if(distance < attackRange){
            meleeAttack(players,null,mob.inventory[0])
        }
    }
}

function generateMobs(startX, amount, mobs, collisionMap, gridSize,items) {
    let amountOfMobs = Math.floor(Math.random() * Math.floor((amount / 10))) + 1;
    let density = 10
    let lastMob = startX + 5
    for (let i = 0; i < amountOfMobs; i++) {

        let start = lastMob + Math.floor(Math.random() * ((amount + startX - lastMob) / density));
        if (start >= startX + amount - 7) {
            break
        }
        lastMob = start + 5
        mobs = generateMob(start, collisionMap, gridSize, mobs,items);
    }

    return mobs;

}

function generateMob(start, collisionMap, gridSize, mobs,items) {
    let id = Math.floor(Math.random() * 100000000);
    mobs["asd" + id + "asd"] = {
        name: "Skeleton",
        x: start * 32,
        y: getHeight(start, collisionMap, gridSize, 640) - gridSize * 2,
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
    let sword = generateItem(mobs["asd" + id + "asd"].x, mobs["asd" + id + "asd"].y, "sword_item", "melee", 25, 50, 0, 0, items, 1)
    addItemInventory(mobs["asd" + id + "asd"], sword, items)
    return mobs
}

function getHeight(x, collisionMap, gridSize, start) {
    if (collisionMap[x * gridSize] !== undefined) {
        let searched = Object.keys(collisionMap[x * gridSize]).length;
        let result = start - searched * gridSize
        return result
    }
}

function playerCloseToMob(players, mobs, range,collisionMap) {

    for (let mob in mobs) {
        let minRange= range + 1;
        let closestPlayer;
        for (let player in players) {
            let distance = calculateDistance(player.x + player.sizex, player.y + player.sizey, mob.x + mob.sizex, mob.y + mob.sizey)
            if (range >= distance) {
                if (minRange > distance) {
                    minRange = distance;
                    closestPlayer = player;
                }
            }
        }
        MobAI(players,closestPlayer,mob,collisionMap,50)
    }
}

function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}