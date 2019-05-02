const {generateItem,inPlayerInventory,deleteItemInventory} = require("./player");
module.exports={
    autoMapGenerator,
    mineBlock,
    addBlock
}



function autoMapGenerator(startX, amount, gridSize,collisionMap) {
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
        for (let k = 20; k > minHeight; k--) {
            let block = {};
            collisionMap[i * gridSize ][k * gridSize] = true;
            block["x"] = i * gridSize;
            block["y"] = k * gridSize;
            block["type"] = "dirt_block";
            block["health"] = 100;
            blocks.push(block);
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
                for (let k = minHeight; k > lastY - noise; k--) {
                    let block = {};
                    collisionMap[i * gridSize][k * gridSize] = true;
                    block["x"] = i * gridSize;
                    block["y"] = k * gridSize;
                    block["type"] = "dirt_block";
                    block["health"] = 100;
                    blocks.push(block);
                }
                lastY = lastY - noise
            } catch (e) {
                //map not generated for that part yet
            }
        }
        for (let i = middle; i < end; i++) {
            let noise = Math.floor(Math.random() * 3)
            try {
                for (let k = lastY + noise; k <= minHeight; k++) {
                    let block = {};
                    collisionMap[i * gridSize][k * gridSize] = true;
                    block["x"] = i * gridSize;
                    block["y"] = k * gridSize;
                    block["type"] = "dirt_block";
                    block["health"] = 100;
                    blocks.push(block);
                }
                lastY = lastY + noise
            } catch (e) {
                //map not generated for that part yet
            }
        }

    }
    let maps  = {
        map: blocks,
        collisionMap: collisionMap
    }
    return maps;
}

function mineBlock(player,x,y,gridSize,collisionMap,map,items) {
    try {
        let gridx = x - (x % gridSize)
        let gridy = y - (y % gridSize) //-(3 * gridSize ); //fix later
        console.log(player.x +"," + player.y)
        console.log("attemting to destroy: " + x + " " + y)
        console.log("attemting to destroy: " + gridx + " " + gridy)
        if (collisionMap[gridx][gridy] !== undefined) {
            if (collisionMap[gridx][gridy] === true) {
                console.log("found")
                for (let block in map) {

                    if (map[block].x === gridx && map[block].y === gridy) {
                        map.splice(block, 1);
                        collisionMap[gridx][gridy] =false;
                        generateItem(gridx+gridSize/2,gridy+gridSize/2,"dirt_item","block",0,0,0,100,items);
                        console.log("deleting: " + gridx +","+ gridy)
                        console.log("destroyed");
                        let maps  = {
                            map: map,
                            collisionMap: collisionMap
                        }
                        return maps;
                    }
                }

            }else {
                console.log("already false")
            }
        }else{
            console.log("undefined")
        }
        let maps  = {
            map: map,
            collisionMap: collisionMap
        }
        return maps;
    }catch (e) {
        console.log("error")
        let maps  = {
            map: map,
            collisionMap: collisionMap
        }
        return maps;
    }
}

function addBlock(player,map,collisionMap,gridSize,x,y) {
    let i = x - (x % gridSize)
    let k = y - (y % gridSize)
    if ((collisionMap[i][k] === undefined||collisionMap[i][k] === false) && inPlayerInventory(player,"dirt_item")) {
        let block = {};
        console.log(i)
        console.log(k)
        collisionMap[i ][k] = true;
        block["x"] = i ;
        block["y"] = k ;
        block["type"] = "dirt_block";
        block["health"] = 100;
        map.push(block);
        deleteItemInventory(player,"dirt_item")
    }

    let maps  = {
        map: map,
        collisionMap: collisionMap
    }
    return maps;
}
