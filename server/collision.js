const {myGrid} = require("./map");
const {addItemInventory} = require("./Player/inventory");


module.exports={
    checkCollision,
    checkPlayerPerimeter,
    checkPlayerCloseToItems,
    gravity,
    jump,
    move
}

async function jump(player, amount,collisionMap,gridSize,jumpAmount,speed) {
    for (let i = 0; i < amount ; i++) {
        player.y -= jumpAmount
        if(checkCollision(player,player.sizex,player.sizey,gridSize,collisionMap)){
            player.y += jumpAmount
            break;
        }
        await sleep(speed);
    }
    function sleep(ms){
        return new Promise(resolve=>{
            setTimeout(resolve,ms)
        })
    }
}
function move(direction,player,gridSize,collisionMap,speed){
    if(direction === "left") {
        player.x -= speed;
        player.status = 2;
        player.facing = "left"
        if (checkCollision(player, player.sizex, player.sizey, gridSize, collisionMap)) {
            player.x += speed;
        }
    }if(direction === "right"){
        player.x += speed;
        player.status = 4;
        player.facing = "right"
        if (checkCollision(player, player.sizex, player.sizey, gridSize,collisionMap)) {
            player.x -= speed;

        }
    }if(direction === "down"){
        player.y += speed;
        player.status = 3;
        if (checkCollision(player, player.sizex, player.sizey, gridSize,collisionMap)) {
            player.y -= speed;
        }
    }
}
function checkCollision(player, sizex, sizey, gridSize,collisionMap) {

    let xcoordinate = player.x  + sizex;
    let ycoordinate = player.y  + sizey;

    let MAXX;
    let MINX;
    let MAXY;
    let MINY;
    if (xcoordinate > 0 && ycoordinate > 0) {
        if(ycoordinate < gridSize ){
            MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize));
            MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize);
        }else{
            MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize));
            MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize) + gridSize;
        }
        MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize;
        MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize) + gridSize;

    } else if (xcoordinate > 0 && ycoordinate <= 0) {

        MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize;
        MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize) + gridSize;

        if ((-gridSize) < ycoordinate) {
            MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize));
            MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize);
        } else {
            MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize)) - gridSize;
            MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize);
        }
    } else if (xcoordinate < 0 && ycoordinate > 0) {
        MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize - gridSize;
        MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize);
        MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize));
        MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize) + gridSize;
    } else if (xcoordinate < 0 && ycoordinate < 0) {
        MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize - gridSize;
        MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize);
        MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize)) - gridSize;
        MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize);
    } else {
        MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize;
        MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize) + gridSize;
        MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize));
        MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize);

    }

    if (MAXX === MINX) {
        MAXX = MAXX + gridSize
    }


    for (let i = MINX; i < MAXX; i += gridSize) {
        for (let j = MINY; j < MAXY; j += gridSize) {
            try {
                if (collisionMap[i][j] === undefined) {
                    //console.log("no collision")

                } else if(collisionMap[i][j]){
                    //console.log("collision with: " + i +","+ j)
                    return true;
                } else{
                }
            } catch (e) {
                return false;
            }
        }
    }
    return false;

}
// function checkCollision(player, halfSizex, halfSizey, gridSize,collisionMap) {
//
//     let position = myGrid(player.x,player.y,gridSize);
//
//     let midx = player.x  + halfSizex;
//     let midy = player.y  + halfSizey;
//
//     let amountCheckRightLeft = Math.ceil(halfSizex/gridSize)
//     let amountCheckTopBottom = Math.ceil(halfSizey/gridSize)//himself
//
//     let MAXX = position.x + amountCheckRightLeft * gridSize;
//     let MINX = position.x - amountCheckRightLeft * gridSize;
//     let MAXY = position.y + amountCheckTopBottom * gridSize;
//     let MINY = position.y - amountCheckTopBottom * gridSize;
//     // if (xcoordinate > 0 && ycoordinate > 0) {
//     //     if(ycoordinate < gridSize ){
//     //         MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize));
//     //         MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize);
//     //     }else{
//     //         MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize));
//     //         MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize) + gridSize;
//     //     }
//     //     MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize;
//     //     MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize) + gridSize;
//     //
//     // } else if (xcoordinate > 0 && ycoordinate <= 0) {
//     //
//     //     console.log(ycoordinate)
//     //     MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize;
//     //     MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize) + gridSize;
//     //
//     //     if ((-gridSize) < ycoordinate) {
//     //         MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize));
//     //         MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize);
//     //     } else {
//     //         MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize)) - gridSize;
//     //         MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize);
//     //     }
//     // } else if (xcoordinate < 0 && ycoordinate > 0) {
//     //     MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize - gridSize;
//     //     MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize);
//     //     MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize));
//     //     MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize) + gridSize;
//     // } else if (xcoordinate < 0 && ycoordinate < 0) {
//     //     MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize - gridSize;
//     //     MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize);
//     //     MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize)) - gridSize;
//     //     MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize);
//     // } else {
//     //     MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize;
//     //     MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize) + gridSize;
//     //     MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize));
//     //     MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize);
//     //
//     // }
//     //
//     // if (MAXX === MINX) {
//     //     MAXX = MAXX + gridSize
//     // }
//
//
//     for (let i = MINX; i < MAXX; i += gridSize) {
//         for (let j = MINY; j < MAXY; j += gridSize) {
//             try {
//                 if (collisionMap[i][j] === undefined) {
//                     //console.log("no collision")
//
//                 } else if(collisionMap[i][j]){
//                     //console.log("collision with: " + i +","+ j)
//                     return true;
//                 } else{
//                 }
//             } catch (e) {
//                 return false;
//             }
//         }
//     }
//     return false;
//
// }
// function checkCollision(player, sizex, sizey, gridSize,collisionMap) {
//     let xcoordinate = player.x + sizex;
//     let ycoordinate = player.y + sizey;
//
//     let middlePointX = xcoordinate - (xcoordinate % gridSize)
//     let middlePointY = ycoordinate - (ycoordinate % gridSize)
//
//     let topX = middlePointX
//     let topY = middlePointY -gridSize;
//
//     let botX = middlePointX
//     let botY = middlePointY +gridSize;
//
//     let rightX = middlePointX + gridSize
//     let rightY = middlePointY
//
//     let leftX = middlePointX -gridSize
//     let leftY = middlePointY;
//
//     try {
//         if (collisionMap[middlePointX][middlePointY] === undefined) {
//             //console.log("no collision")
//         } else if (collisionMap[middlePointX][middlePointY]) {
//             //console.log("collision with: " + i +","+ j)
//             return true;
//         }
//
//         if (collisionMap[topX][topY] === undefined) {
//             //console.log("no collision")
//
//         } else if (collisionMap[topX][topY]) {
//             //console.log("collision with: " + i +","+ j)
//             return true;
//         }
//
//         if (collisionMap[botX][botY] === undefined) {
//             //console.log("no collision")
//         } else if (collisionMap[botX][botY]) {
//             //console.log("collision with: " + i +","+ j)
//             return true;
//         }
//
//         if (collisionMap[rightX][rightY] === undefined) {
//             //console.log("no collision")
//         } else if (collisionMap[rightX][rightY]) {
//             //console.log("collision with: " + i +","+ j)
//             return true;
//         }
//         if (collisionMap[leftX][leftY] === undefined) {
//             //console.log("no collision")
//         } else if (collisionMap[leftX][leftY]) {
//             //console.log("collision with: " + i +","+ j)
//             return true;
//         }
//
//
//     } catch (e) {
//         return false;
//     }
//     return false
//
// }
function checkPlayerPerimeter(player, sizex, sizey, sizePerimeter,items,gridSize,collisionMap) {

    //console.log(items);
    if(player.isDead == false) {
        let arrayLength = items.length;
        if (arrayLength > 0) {
            let xcoordinate = player.x + sizex;
            let ycoordinate = player.y + sizey;


            let MAXX = xcoordinate + sizePerimeter;
            let MINX = xcoordinate - sizePerimeter;
            let MAXY = ycoordinate + sizePerimeter;
            let MINY = ycoordinate - sizePerimeter;
            for (let i = 0; i < arrayLength; i++) {
                let item = items[i];
                if (item !== undefined) {
                    if (item.x <= MAXX && item.x >= MINX && item.y < MAXY && item.y > MINY) {
                        let difx = xcoordinate - item.x;
                        let dify = ycoordinate - item.y;
                        if (difx <= 16 && difx >= -16 && dify <= 16 && dify >= -16) {

                            addItemInventory(player, item, items);
                            arrayLength = items.length;
                        } else {
                            if (difx > 0) {
                                item.x = item.x + 5
                            } else {
                                item.x = item.x - 5
                            }
                            if (dify > 0) {
                                item.y = item.y + 5
                            } else {
                                item.y = item.y - 5
                            }
                        }
                    }
                }
            }
        }
    }


}

function checkPlayerCloseToItems(players,items,gridSize,collisionMap) {
    for (let player in players) {
        let currentPlayer = players[player];
        checkPlayerPerimeter(currentPlayer, currentPlayer.sizex, currentPlayer.sizey, 150,items,gridSize,collisionMap);
    }
    for(let item in items){
        item = items[item]
        //gravity for the item
        item.y += 3;
        //console.log(item)
        if (checkCollision(item, 16, 16, gridSize, collisionMap)) {
            item.y -= 3;
        }
    }
}

function gravity(players,mobs,gridSize,collisionMap,projectiles,playerGravity) {
    for (let player in players) {

        let currentPlayer = players[player];
        currentPlayer.y += playerGravity;
        currentPlayer.onair = true;
        if (checkCollision(currentPlayer, currentPlayer.sizex, currentPlayer.sizey, gridSize,collisionMap)) {
            //console.log(collisionMap);
            currentPlayer.y -= playerGravity;
            currentPlayer.onair = false;
            // console.log("In land");
        }
    }
    for (let mob in mobs) {

        let currentPlayer = mobs[mob];
        currentPlayer.y += playerGravity;
        currentPlayer.onair = true;
        if (checkCollision(currentPlayer, currentPlayer.sizex, currentPlayer.sizey, gridSize,collisionMap)) {
            //console.log(collisionMap);
            currentPlayer.y -= playerGravity;
            currentPlayer.onair = false;
            // console.log("In land");
        }
    }
}

