module.exports={
    checkCollision,
    checkPlayerPerimeter,
    checkPlayerCloseToItems,
    gravity
}



function checkCollision(player, sizex, sizey, gridSize,collisionMap) {

    let xcoordinate = player.x  + sizex;
    let ycoordinate = player.y  + sizey;

    let MAXX;
    let MINX;
    let MAXY;
    let MINY;
    if(xcoordinate > 0 && ycoordinate > 0 ) {
        MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize;
        MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize) + gridSize;
        MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize));
        MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize) + gridSize;
    }else if(xcoordinate > 0 && ycoordinate < 0 ){
        MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize;
        MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize) + gridSize;
        MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize)) -gridSize;
        MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize) ;
    }else if (xcoordinate < 0 && ycoordinate > 0) {
        MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize -gridSize;
        MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize);
        MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize));
        MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize) +gridSize ;
    }else if (xcoordinate < 0 && ycoordinate < 0) {
        MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize -gridSize;
        MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize);
        MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize)) -gridSize;
        MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize) ;
    }else {
        MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize;
        MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize) + gridSize;
        MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize));
        MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize) ;

    }

    if(MAXX === MINX){
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


    let arrayLength = items.length;
    if(arrayLength > 0) {
        let xcoordinate = player.x + sizex;
        let ycoordinate = player.y - sizey;


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
                    if (difx <= 1 && difx >= -1 && dify <= 1 && dify >= -1) {
                        item.x = "Inventory";
                        item.y = "Inventory";
                        player.inventory.push(item)
                        items.splice(i, 1);
                        arrayLength = items.length;
                    } else {
                        if (difx > 0) {
                            item.x = item.x + 2
                        } else {
                            item.x = item.x - 2
                        }
                        if (dify > 0) {
                            item.y = item.y + 2
                        } else {
                            item.y = item.y - 2
                        }
                    }
                } else {
                    //gravity for the item
                    item.y += 3;
                    if (checkCollision(item, 32,10, gridSize,collisionMap)) {
                        item.y -= 3;
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
}

function gravity(players,gridSize,collisionMap) {
    for (let player in players) {

        let currentPlayer = players[player];
        currentPlayer.y += 3;
        currentPlayer.onair = true;
        if (checkCollision(currentPlayer, currentPlayer.sizex, currentPlayer.sizey, gridSize,collisionMap)) {
            //console.log(collisionMap);
            currentPlayer.y -= 3;
            currentPlayer.onair = false;
            // console.log("In land");
        }
    }

}