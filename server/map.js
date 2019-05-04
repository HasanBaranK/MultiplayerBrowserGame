const {inPlayerInventory} = require("./Player/inventory");
const {deleteItemInventory} = require("./Player/inventory");
const {generateItem} = require("./Player/items");

module.exports={
    autoMapGenerator,
    mineBlock,
    addBlock,
    myGrid,
    sendPartialMap
}



function autoMapGenerator(startX, amount, gridSize,collisionMap,fastMap) {
    //Rules
    //world has max 2000 depth mountains and and min 500 depth flat land
    //blocks should be connected and should not defy the laws of gravity(no fling blocks)
    //no extreme changes (a tower of 2000 in an instant should not be possible)
    let minHeight = 10;
    let blocks = [];
    let size = startX + amount;
    if (startX < 0) {
        size = Math.abs(startX) + amount
    }
    let hills = []
    if (amount > 20) {
        let amountOfHills = Math.floor(Math.random() * Math.floor((size / 20)));
        console.log("Amount of Hills: " + amountOfHills)
        for (let i = 0; i < amountOfHills; i++) {
            let hill = {}
            let start = startX + Math.floor(Math.random() * amount);
            let end = start + Math.floor(Math.random() * (amount - start));
            hill["start"] = start
            hill["end"] = end
            //randomize hills lenght
            hills.push(hill);
        }
    }

    for (let i = startX; i < size; i++) {

        collisionMap[i * gridSize] = {};
        fastMap[i * gridSize] = {};
        let k = 20

        generateBlock(i*gridSize,k*gridSize,100,blocks,"stone",collisionMap,fastMap)
        k--;

        for (; k > minHeight; k--) {
            generateBlock(i*gridSize,k*gridSize,100,blocks,"dirt",collisionMap,fastMap)
        }
    }

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
                let k = minHeight
                for (; k > lastY+1; k--) {
                    generateBlock(i*gridSize,k*gridSize,100,blocks,"dirt",collisionMap,fastMap)
                }
                for ( ;k > lastY - noise; k--) {
                    generateBlock(i*gridSize,k*gridSize,100,blocks,"stone",collisionMap,fastMap)
                }
                lastY = lastY - noise
            } catch (e) {
                //map not generated for that part yet
            }
        }
        for (let i = middle; i < end; i++) {
            let noise = Math.floor(Math.random() * 3)
            try {
                let k = minHeight
                for (; k > lastY +2 ; k--) {
                    generateBlock(i*gridSize,k*gridSize,100,blocks,"dirt",collisionMap,fastMap)
                }
                for (; k > lastY + noise; k--) {
                    generateBlock(i*gridSize,k*gridSize,100,blocks,"stone",collisionMap,fastMap)
                }
                lastY = lastY + noise
            } catch (e) {
                //map not generated for that part yet
            }
        }

    }
    let maps  = {
        map: blocks,
        collisionMap: collisionMap,
        fastMap: fastMap
    }
    return maps;
}

function mineBlock(player,x,y,gridSize,collisionMap,map,items,range) {

    try {
        let position = myGrid(x,y,gridSize)
        let gridx = position.x
        let gridy = position.y

        if(calculateDistance(gridx,gridy,player.x,player.y)<= range) {
            console.log(player.x + "," + player.y)
            console.log("attemting to destroy: " + x + " " + y)
            console.log("attemting to destroy: " + gridx + " " + gridy)
            if (collisionMap[gridx][gridy] !== undefined) {
                if (collisionMap[gridx][gridy] === true) {
                    console.log("found")
                    for (let block in map) {
                        if (map[block].x === gridx && map[block].y === gridy) {
                            let blockType = map[block].type
                            blockType = blockType.split("_")[0];
                            blockType = blockType.substr(0,blockType.length-1)
                            let itemName = blockType + "0_item";
                            console.log(itemName)
                            map.splice(block, 1);
                            collisionMap[gridx][gridy] = false;
                            generateItem(gridx + gridSize / 2, gridy + gridSize / 2, itemName, "block", 0, 0, 0, 100, items, 1);
                            console.log("deleting: " + gridx + "," + gridy)
                            console.log("destroyed");
                            return true
                        }
                    }

                } else {
                    console.log("already false")
                    return false
                }
            } else {
                console.log("undefined")
                return false
            }
        }
        return false
    }catch (e) {
        console.log("error")
        return false;
    }
}

function addBlock(player,map,collisionMap,gridSize,x,y,blockType,range) {

    let position = myGrid(x,y,gridSize)

    let i = position.x
    let k = position.y


    if(calculateDistance(i,y,player.x,player.y)<= range) {
        blockType = blockType.split("_")[0];
        let blockName = blockType + "_block";
        let itemName = blockType + "_item";
        if ((collisionMap[i][k] === undefined || collisionMap[i][k] === false) && inPlayerInventory(player, itemName)) {
            generateBlock(i,k,100,map,blockType,collisionMap)
            deleteItemInventory(player, itemName)
        }
        return true;
    }
    return false
}

function calculateDistance(x1,y1,x2,y2) {
    return Math.sqrt( Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) );
}

function generateBlock(x,y,health,map,blockName,collisionMap,fastMap){
    let random = Math.floor(Math.random() * 9)

    blockName = blockName.replace("0","");
    blockName = blockName +""+ random;
    blockName = blockName + "_block"
    let block = {};
    collisionMap[x][y] = true;

    block["x"] = x;
    block["y"] = y;
    block["type"] = blockName;
    block["health"] = 100;
    map.push(block);
    fastMap[x][y] = block;

}
function myGrid(x,y,gridSize) {
    let gridx  = x - (x % gridSize)
    let gridy  = y - (y % gridSize)

    if(gridx < 0){
        gridx = gridx - gridSize
    }
    if(gridy < 0){
        gridy = gridy - gridSize
    }

    if(x<0 && (0-gridSize)< x){
        gridx  = x - (x % gridSize) -gridSize
    }
    if(y<0 && (0-gridSize)< y){
        gridy  = y - (y % gridSize) -gridSize
    }
    let position = {
        x:gridx,
        y: gridy
    }
    return position
}

function sendPartialMap(x,y,halfsizex,halfsizey,map,gridSize) {

    let position = myGrid(x,y,gridSize);
    let partialMap = []

    //console.log(map)

    let startx = position.x - halfsizex
    let endx = position.x + halfsizex

    let starty = position.y - halfsizey
    let endy = position.y + halfsizey

    console.log(map)
    console.log(position)

    for (;startx < endx;startx += gridSize){

        console.log(startx)
        if(map[startx] !== undefined) {
            console.log(map[startx])
            for (; starty < endy; starty += gridSize) {

                if (map[startx][starty] !== undefined) {
                    console.log(map[startx][starty])
                    partialMap.push(map[startx][starty])
                }
            }
        }
    }
    console.log(partialMap)

    return partialMap

}