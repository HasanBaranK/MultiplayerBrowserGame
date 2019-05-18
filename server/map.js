const {inPlayerInventory} = require("./Player/inventory");
const {deleteItemInventory} = require("./Player/inventory");
const {generateItem} = require("./Player/items");
const {generateMobs} = require("./Mobs/Mobs");

module.exports = {
    autoMapGenerator,
    mineBlock,
    addBlock,
    myGrid,
    sendPartialMap,
    checkPlayerAtEdge,
}


function autoMapGenerator(startX, amount, gridSize, collisionMap, fastMap,mobs) {
    //Rules
    //world has max 2000 depth mountains and and min 500 depth flat land
    //blocks should be connected and should not defy the laws of gravity(no fling blocks)
    //no extreme changes (a tower of 2000 in an instant should notdw be possible)
    let minHeight = 10;
    let blocks = [];
    let size = startX + amount;
    if (startX < 0) {
        size = Math.abs(startX) + amount
    }
    let hills = []
    let trees = []
    if (amount > 20) {
        let amountOfHills = Math.floor(Math.random() * Math.floor((amount / 15))) + 1;
        console.log("Amount of Hills: " + amountOfHills)
        for (let i = 0; i < amountOfHills; i++) {
            let hill = {}
            let widthOfHill = Math.floor(Math.random() * amount);
            let start = startX + widthOfHill
            let end = start + Math.floor(Math.random() * (amount - widthOfHill));
            hill["start"] = start
            hill["end"] = end
            console.log(start *32 +" ," + end*32)
            //randomize hills lenght
            hills.push(hill);
        }
        let amountOfTrees = Math.floor(Math.random() * Math.floor((amount / 10))) + 1;
        let density = 10
        console.log("Amount of Trees: " + amountOfTrees)
        let lastTree = startX +5
        for (let i = 0; i < amountOfTrees; i++) {

            let start = lastTree + Math.floor(Math.random() * ((amount + startX-lastTree)/density));
            if(start >= startX + amount-7){
                break
            }
            lastTree = start + 5
            trees.push(start)
        }

    }

    for (let i = startX; i < size; i++) {

        collisionMap[i * gridSize] = {};
        fastMap[i * gridSize] = {};
        let k = 20

        generateBlock(i * gridSize, k * gridSize, 100, blocks, "stone", collisionMap, fastMap)
        k--;

        for (; k > minHeight+1; k--) {
            generateBlock(i * gridSize, k * gridSize, 100, blocks, "dirt", collisionMap, fastMap)
        }
        generateBlock(i * gridSize, k * gridSize, 100, blocks, "dirt10", collisionMap, fastMap)

    }

    //hill generation
    for (let hill in hills) {
        let start = hills[hill].start;
        let end = hills[hill].end;
        //console.log(start);
        let size = end - start;
        let middle = start + Math.floor(size / 2);
        //middle = Math.floor(Math.random() * Math.floor(size /10) - Math.floor(size/20))
        //console.log(middle)
        //console.log(end);
        let lastY = minHeight
        for (let i = start; i < middle; i++) {
            let noise = Math.floor(Math.random() * 3)
            try {
                let k = minHeight +1
                for (; k > lastY + 1; k--) {
                    generateBlock(i * gridSize, k * gridSize, 100, blocks, "dirt", collisionMap, fastMap)
                }
                for (; k > lastY - noise; k--) {
                    generateBlock(i * gridSize, k * gridSize, 100, blocks, "stone", collisionMap, fastMap)
                }
                lastY = lastY - noise
            } catch (e) {
                //map not generated for that part yet
            }
        }
        for (let i = middle; i < end; i++) {
            let noise = Math.floor(Math.random() * 3)
            try {
                let k = minHeight +1
                for (; k > lastY + 2; k--) {
                    generateBlock(i * gridSize, k * gridSize, 100, blocks, "dirt", collisionMap, fastMap)
                }
                for (; k > lastY + noise; k--) {
                    generateBlock(i * gridSize, k * gridSize, 100, blocks, "stone", collisionMap, fastMap)
                }
                lastY = lastY + noise
            } catch (e) {
                //map not generated for that part yet
            }
        }

    }
    //tree generation

    for (let tree in trees) {
        let x = trees[tree];
        let size = 3 + Math.floor(Math.random() * 3);

        let height = getHeight(x, collisionMap,gridSize,640)
        //console.log(height)
        try {
            let k = height
            for (; k > height - size * gridSize; k -= gridSize) {
                generateBlock(x*gridSize, k, 100, blocks, "wood", collisionMap, fastMap)

            }
            // hardcoded for now
            generateBlock(x*gridSize -gridSize -gridSize,height - size * gridSize + gridSize,100,blocks,"leaves",collisionMap,fastMap)
            generateBlock(x*gridSize -gridSize,height - size * gridSize + gridSize,100,blocks,"leaves",collisionMap,fastMap)
            generateBlock(x*gridSize +gridSize,height - size * gridSize + gridSize,100,blocks,"leaves",collisionMap,fastMap)
            generateBlock(x*gridSize +gridSize + gridSize,height - size * gridSize + gridSize,100,blocks,"leaves",collisionMap,fastMap)


            generateBlock(x*gridSize -gridSize -gridSize,height - size * gridSize,100,blocks,"leaves",collisionMap,fastMap)
            generateBlock(x*gridSize -gridSize,height - size * gridSize,100,blocks,"leaves",collisionMap,fastMap)
            generateBlock(x*gridSize ,height - size * gridSize,100,blocks,"leaves",collisionMap,fastMap)
            generateBlock(x*gridSize +gridSize,height - size * gridSize,100,blocks,"leaves",collisionMap,fastMap)
            generateBlock(x*gridSize +gridSize + gridSize,height - size * gridSize,100,blocks,"leaves",collisionMap,fastMap)

            generateBlock(x*gridSize -gridSize,height - size * gridSize -gridSize,100,blocks,"leaves",collisionMap,fastMap)
            generateBlock(x*gridSize ,height - size * gridSize -gridSize,100,blocks,"leaves",collisionMap,fastMap)
            generateBlock(x*gridSize +gridSize,height - size * gridSize -gridSize,100,blocks,"leaves",collisionMap,fastMap)

            generateBlock(x*gridSize ,height - size * gridSize - 2 * gridSize,100,blocks,"leaves",collisionMap,fastMap)
        } catch (e) {
            //map not generated for that part yet
        }


    }
    let maps = {
        map: blocks,
        collisionMap: collisionMap,
        fastMap: fastMap
    }
    return maps;


}
function getHeight(x, collisionMap,gridSize,start) {
    if (collisionMap[x * gridSize] !== undefined) {
        let searched = Object.keys(collisionMap[x * gridSize]).length;
        let result = start - searched * gridSize
        return result
    }
}
function mineBlock(player, x, y, gridSize, collisionMap, map, items, range, fastMap,damage) {

    try {
        let position = myGrid(x, y, gridSize)
        let gridx = position.x
        let gridy = position.y

        if (calculateDistance(gridx, gridy, player.x+ gridSize, player.y+gridSize+gridSize/2) <= range) {
            console.log(player.x + "," + player.y)
            if (fastMap[gridx][gridy] !== undefined) {

                    console.log("found")

                    let block = fastMap[gridx][gridy];
                    if (block !== undefined && block !== null) {
                        let blockType = block.type

                        if(block.type.includes("stone")){
                            damage = Math.ceil(damage/3);
                        }
                        if(damage <= 0){
                        damage++;
                        }
                        block.health = block.health - damage
                        if(block.health <= 0) {
                            blockType = blockType.split("_")[0];
                            blockType = blockType.substr(0, blockType.length - 1)
                            let itemName = blockType + "0_item";
                            if(blockType === "dirt1"){
                                itemName = "dirt0_item"
                            }
                            deleteBlock(gridx, gridy, block, map, collisionMap, fastMap)
                            generateItem(gridx + gridSize / 2, gridy + gridSize / 2, itemName, "block", 0, 0, 0, 100, items, 1);
                            return true
                        }else {
                            fastMap[gridx][gridy] = block;
                            map[map.indexOf(block)] = block

                        }
                        return true
                    }
            } else {
                console.log("undefined")
                return false
            }
        }
        return false
    } catch (e) {
        console.log("error")
        return false;
    }
}

function deleteBlock(gridx, gridy, block, map, collisionMap, fastMap) {
    //map.splice(map.indexOf(block), 1);
    if(collisionMap[gridx][gridy] !== undefined ) {
        collisionMap[gridx][gridy] = false;
    }
    fastMap[gridx][gridy] = undefined;
}

function addBlock(player, map, collisionMap, gridSize, x, y, blockType, range, fastMap) {

    let position = myGrid(x, y, gridSize)

    let i = position.x
    let k = position.y

    //let playerPosition = myGrid(player.x,player.y,gridSize)
    if (calculateDistance(i, y, player.x+ gridSize, player.y+gridSize+gridSize/2) <= range) {
        blockType = blockType.split("_")[0];
        let blockName = blockType + "_block";
        let itemName = blockType + "_item";
        blockType = blockType.substr(0,blockType.length-1)

        if ((collisionMap[i][k] === undefined || collisionMap[i][k] === false) && inPlayerInventory(player, itemName)) {
            generateBlock(i, k, 100, map, blockType, collisionMap, fastMap,true)
            deleteItemInventory(player, itemName)
        }
        return true;
    }
    return false
}

function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}

function generateBlock(x, y, health, map, blockName, collisionMap, fastMap,playerAdded) {
    let random = Math.floor(Math.random() * 9)

    if (blockName === "wood" || blockName === "leaves") {
        random = 0
    }else {
        collisionMap[x][y] = true;
    }
    if(playerAdded === true){
        collisionMap[x][y] = true;
    }
    if(blockName === "dirt10"){
        blockName = blockName + "_block"
    }else {
        blockName = blockName.replace("0", "");
        blockName = blockName + "" + random;
        blockName = blockName + "_block"
    }
    let block = {};

    health = 100;

    block["x"] = x;
    block["y"] = y;
    block["type"] = blockName;
    block["health"] = health;
    map.push(block);
    if (fastMap[x] === undefined) {
        fastMap[x] = {}
    }
    fastMap[x][y] = block;

}

function myGrid(x, y, gridSize) {
    let gridx = x - (x % gridSize)
    let gridy = y - (y % gridSize)

    if (gridx < 0) {
        gridx = gridx - gridSize
    }
    if (gridy < 0) {
        gridy = gridy - gridSize
    }

    if (x < 0 && (0 - gridSize) < x) {
        gridx = x - (x % gridSize) - gridSize
    }
    if (y < 0 && (0 - gridSize) < y) {
        gridy = y - (y % gridSize) - gridSize
    }
    let position = {
        x: gridx,
        y: gridy
    }
    return position
}

function sendPartialMap(x, y, halfsizex, halfsizey, map, gridSize) {

    let position = myGrid(x, y, gridSize);
    let partialMap = []

    //console.log(map)

    let startx = position.x - (halfsizex * gridSize)
    let endx = position.x + (halfsizex * gridSize)

    let starty = position.y - (halfsizey * gridSize)
    let endy = position.y + (halfsizey * gridSize)

    for (let i = startx; i < endx;) {

        if (map[i] !== undefined) {
            for (let k = starty; k < endy;) {
                if (map[i][k] !== undefined) {
                    partialMap.push(map[i][k])
                }
                k = k + gridSize
            }
        }
        i = i + gridSize
    }
    return partialMap
}

function checkPlayerAtEdge(players, leftEdge, rightEdge, proximity, amount, collisionMap, fastMap,mobs,items) {
    for (let player in players) {
        if (players[player].x + proximity >= rightEdge * 32) {
            //console.log(rightEdge)
            autoMapGenerator(rightEdge, amount, 32, collisionMap, fastMap)
            mobs = generateMobs(rightEdge,amount,mobs,collisionMap,32,items);
            rightEdge = rightEdge + (amount - 1)
            //console.log(rightEdge)
        }
        if (players[player].x - proximity <= leftEdge * 32) {
            // autoMapGenerator(leftEdge-amount,amount,32,collisionMap,fastMap)
            // leftEdge= leftEdge - amount * 32
        }
    }

    let edges = {
        leftEdge: leftEdge,
        rightEdge: rightEdge,
        mobs: mobs
    }

    return edges

}