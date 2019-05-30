let path = require('path');
let socketIO = require('socket.io');
let express = require('express');
const fs = require('fs');

const app = express();
const gridSize = 32;
let server = require('http').createServer(app);
let io = socketIO(server);
app.set('port', 5000);

//Directory of static files
const static_dir = 'static';
app.use(express.static(static_dir));

// Starts the server.
server.listen(5000, function () {
    console.log('Starting server on port 5000');
});

//Game Options

//Time
let gameTimeSpeed = 1;


let mapFunctions = require("./server/map");
let collisionFunctions = require("./server/collision");
let attackFunctions = require("./server/Player/attack");
let itemFunctions = require("./server/Player/items");
let inventoryFunctions = require("./server/Player/inventory");
let timeFunctions = require("./server/time.js");
let mobsFunctions = require("./server/Mobs/Mobs");
let illuminationFunctions = require("./server/illumination");

const imageFolder = './static/images';

var players = {};
var collisionMap = {};
var fastMap = {};
var lightMap = {};
let items = [];
let chests = {};
let projectiles = [];
let map;
let lightSources = [];
let mobs = {};
let gameTime = 0;
let day = 0;
let mapChanged = false;
let images = {};
let generalLightAmount = 100;
let lightQuality = 16;
let buildingRange = 128;
images = getImages(images)

let leftEdge = 0;
let rightEdge = 70;

let craftingRecipes = []
let maps = mapFunctions.autoMapGenerator(leftEdge, rightEdge, gridSize, collisionMap, fastMap);

//Crafting recipes
let sword = itemFunctions.generateItem(0, 0, "sword_item", "melee", 250, 66, 0, 0, items, 1)
let worktable = itemFunctions.generateItem(0, 0, "table0_item", "block", 0, 0, 0, 100, items, 1)
let chest = itemFunctions.generateItem(0, 0, "chest0_item", "block", 0, 0, 0, 100, items, 1)
let healthPotion = itemFunctions.generateItem(0, 0, "healthpotion_item", "Consumable", 0, 0, 0, 1, items, 1)

let torch = itemFunctions.generateItem(0, 0, "torch0_item", "light", 150, 256, 0, 1, items, 1)

craftingRecipes.push(worktable, sword, healthPotion, torch)


map = maps.map;
collisionMap = maps.collisionMap;
fastMap = maps.fastMap;
mobs = mobsFunctions.generateMobs(leftEdge, rightEdge - leftEdge, mobs, collisionMap, gridSize, items);
itemFunctions.generateItem(320, 200, "healthpotion_item", "Consumable", 0, 0, 0, 1, items, 1)
itemFunctions.generateItem(220, 200, "healthpotion_item", "Consumable", 0, 0, 0, 1, items, 1)
itemFunctions.generateItem(120, 200, "healthpotion_item", "Consumable", 0, 0, 0, 1, items, 1)
itemFunctions.generateItem(420, 200, "healthpotion_item", "Consumable", 0, 0, 0, 1, items, 1)

mobsFunctions.mobController(players, mobs, collisionMap, 66, 500, io, items, gridSize);

function getImages(images) {
    fs.readdir(imageFolder, (err, files) => {
        files.forEach(folder => {
            fs.readdir(imageFolder + "/" + folder, (err, files) => {
                images[folder] = files
            });
        });
    });
    return images
}

function movePlayer(player, data, speed, jumpAmount, jumpSpeed) {
    if (data == null) {
        return
    }
    let d = new Date();
    let currentTime = Math.round(d.getTime());
    if (player.lastMoveTime + 5 < currentTime) {
        player.lastMoveTime = currentTime;
        if (data.a) {
            collisionFunctions.move("left", player, gridSize, collisionMap, speed)

        }
        if (data.w) {
            if (player.onair === false && player.jumping === false) {
                player.y -= 4;
                player.status = 1;
                collisionFunctions.jump(player, 50, collisionMap, gridSize, jumpAmount, jumpSpeed);//5,3
                player.onair = true;
            }

        }
        if (data.d) {
            collisionFunctions.move("right", player, gridSize, collisionMap, speed)

        }
        if (data.s) {
            collisionFunctions.move("down", player, gridSize, collisionMap, speed)
        }
    }
}

io.on('connection', function (socket) {
    console.log('Player ' + socket.id + ' has joined the game');
    socket.on('new player', function () {
        players[socket.id] = {
            x: 320,
            y: 100,
            status: 0,
            maximumHealth: 150,
            health: 100,
            maximumEnergy: 100,
            energy: 100,
            sizex: 32,
            sizey: 32,
            isDead: false,
            isMob: false,
            inventory: [],
            attacking: false,
            jumping: false,
            facing: "right",
            equipped: [],
            holding: [],
            xp: 0,
            xpToLevel: 1000,
            level: 1,
            healingDelay: 0,
            lastPressTime: 0,
            lastJumpTime: 0,
            lastMoveTime: 0,
            followLight: null,
            data: null,
        };
        let player = players[socket.id]
        let partialMap = mapFunctions.sendPartialMap(player.x, player.y, 30, 20, fastMap, gridSize)
        let partialLightMap = illuminationFunctions.getPartialLightMap(player.x, player.y, lightQuality, 30, 20, lightMap)
        let gameData = {
            map: partialMap,
            lightMap: partialLightMap,
            items: items,
            state: players,
            gameTime: gameTime,
            generalLight: generalLightAmount
        }

        io.sockets.emit('gameData', gameData);
        // io.sockets.emit('map', partialMap);
        // io.sockets.emit('items', items);
        // io.sockets.emit('state', players);
        io.sockets.emit('mobs', mobs);
        // io.sockets.emit('gametime', gameTime);
        // io.sockets.emit('generalLight', generalLightAmount);
        //io.sockets.emit('projectiles', projectiles);
        // io.sockets.emit('mapCollision', collisionMap);
        let sword = itemFunctions.generateItem(players[socket.id].x, players[socket.id].y, "sword_item", "melee", 25, 55, 0, 0, items, 1)
        let torchP = itemFunctions.generateItem(players[socket.id].x, players[socket.id].y, "torch0_item", "light", 150, 256, 0, 1, items, 1)
        let arrow = itemFunctions.generateItem(players[socket.id].x, players[socket.id].y, "arrow0_item", "projectile", 10, 20, 0, 1, items, 1, false)

        players[socket.id].holding.push(players[socket.id].inventory[0]);
        socket.join('players');
    });
    socket.on('movement', function (data) {

        let player = players[socket.id] || {};
        player.data = data;
        if (player.isDead === false) {
            if (data.a || data.w || data.d || data.s || data[' ']) {
                //movePlayer(player, data, speed, jumpAmount, jumpSpeed);
                if (data[' ']) {
                    let d = new Date();
                    let currentTime = Math.round(d.getTime() / 100);
                    if (players[socket.id].lastPressTime + 5 < currentTime) {
                        players[socket.id].lastPressTime = currentTime;
                        if (player.holding[0]) {
                            if (player.holding[0].type == 'melee') {
                                player.attacking = true
                            } else if (player.holding[0].name == 'healthpotion_item') {
                                let dateNow = Date.now()
                                if (player.healingDelay < dateNow) {
                                    if (attackFunctions.heal(players[socket.id], 25)) {
                                        if (inventoryFunctions.deleteItemInventory(players[socket.id], 'healthpotion_item')) {
                                            socket.emit('gothealed', 25)
                                            player.healingDelay = dateNow + 2000
                                        }
                                    }
                                }
                            } else if (player.holding[0].type == 'light') {
                                if (player.followLight == null) {
                                    player.followLight = illuminationFunctions.generatelightSource(player.x, player.y, "Point", player.holding[0].range, player.holding[0].damage, lightSources)
                                } else {
                                    //console.log("hello")
                                    //delete followLight;
                                    illuminationFunctions.removeLightSource(player.followLight, lightSources);
                                    player.followLight = null
                                    //followLight = illuminationFunctions.generatelightSource(player.x, player.y, "Point", player.holding[0].range, player.holding[0].damage, lightSources)
                                }
                            }
                        }
                    }

                }
                let currentGrid = mapFunctions.myGrid(player.x, player.y, gridSize)
                try {
                    player.followLight.x = currentGrid.x
                    player.followLight.y = currentGrid.y + gridSize
                } catch (e) {

                }
            } else {
                player.status = 0;
            }
        }

    });
    socket.on('stopattack', function (evt) {
        let player = players[socket.id] || {};
        if (player.isDead === false) {
            let holding = player.holding[0]
            if (holding !== undefined && holding !== null) {
                if (holding.type === "melee") {
                    let peopleGotHit = attackFunctions.meleeAttack(players, socket.id, holding, mobs, false, items)
                    // if (peopleGotHit.length > 0) {
                    //     io.sockets.emit('peoplegothit', peopleGotHit);
                    // }
                    io.sockets.emit('peoplegothit', peopleGotHit);
                    player.attacking = false
                }
            }


        }
    });
    socket.on('leftclick', function (click) {

        let player = players[socket.id] || {};
        if (player.isDead === false) {
            let damage = 10;
            if (players[socket.id].holding[0] !== undefined && players[socket.id].holding[0] !== null) {
                damage = players[socket.id].holding[0].damage;
            }
            mapChanged = mapFunctions.mineBlock(player, click.x, click.y, gridSize, collisionMap, map, items, 128, fastMap, damage, lightSources)

            if (mapChanged == false) {

                if(players[socket.id].holding[0] !== undefined && players[socket.id].holding[0] !== null&& players[socket.id].holding[0].type ==="projectile") {
                    let arrowStartX
                    let arrowStartY
                    let xdirection;
                    let ydirection;
                    if (click.x > player.x) {
                        xdirection = 2
                        arrowStartX = player.x + gridSize + gridSize;

                    } else {
                        xdirection = 1
                        arrowStartX = player.x - gridSize - gridSize;
                    }
                    if (click.y > player.y + gridSize) {
                        ydirection = 2
                        console.log("down")
                        arrowStartY = player.y + gridSize
                    } else {
                        ydirection = 1
                        console.log("up")
                        arrowStartY = player.y
                    }
                    let projectile = attackFunctions.generateProjectile(projectiles, "arrow0_item", 0.0025, arrowStartX, arrowStartY, 32, click.x, click.y, xdirection, ydirection, 1, 100)
                    attackFunctions.calculateProjectile(projectiles, projectile, players, items, gridSize, collisionMap)
                }
            }
        }


    });
    socket.on('rightclick', function (click) {

        let player = players[socket.id] || {};
        if (player.isDead === false) {
            let holding = player.holding[0]
            let blockGrid = mapFunctions.myGrid(click.x, click.y, gridSize)
            let blockAtClick = fastMap[blockGrid.x][blockGrid.y]
            if (blockAtClick) {
                if (blockAtClick.type.includes("table")) {
                    socket.emit('craftingui', craftingRecipes)
                } else if (blockAtClick.type.includes("chest")) {
                    socket.emit('chestgui', chests[blockGrid.x][blockGrid.y])
                }
            } else {
                if (holding !== undefined) {
                    if (holding !== null) {
                        if (holding.type === "block") {
                            mapChanged = mapFunctions.addBlock(player, map, collisionMap, gridSize, click.x, click.y, holding.name, buildingRange, fastMap)
                            if (holding.name === "chest0_item") {
                                let blockGrid = mapFunctions.myGrid(click.x, click.y, gridSize)
                                itemFunctions.generateChest(blockGrid.x, blockGrid.y, 12, chests)
                            }
                        }else if (holding.type === "light") {

                            if (holding.name === "torch0_item") {
                                let blockGrid = mapFunctions.myGrid(click.x, click.y, gridSize)
                                if (mapFunctions.calculateDistance(blockGrid.x, blockGrid.y, player.x + gridSize, player.y + gridSize + gridSize / 2) <= buildingRange) {
                                    let lightT = illuminationFunctions.generatelightSource(blockGrid.x, blockGrid.y, "Point", buildingRange, holding.damage, lightSources)
                                    mapChanged = mapFunctions.addBlock(player, map, collisionMap, gridSize, click.x, click.y, holding.name, 128, fastMap, lightT.index)
                                    if(mapChanged === false){
                                        illuminationFunctions.removeLightSource(lightT.index,lightSources)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    socket.on('craft', function (recipe) {
        let player = players[socket.id]
        if (!inventoryFunctions.deleteItemInventoryWithAmount(players[socket.id], recipe['recipe'])) {
            socket.emit('generalmessage', {message: 'FAILED CRAFTING', sender: 'SERVER'})
            return
        }
        inventoryFunctions.addItemInventory(players[socket.id], recipe, items)
    });
    socket.on('getimages', function (click) {
        socket.emit('images', images);
    });
    socket.on('gametime', function (click) {
        socket.emit('gametime', timeFunctions.getGameTime(gameTime));
    });
    socket.on('generalmessage', function (message) {
        message.sender = socket.id
        console.log(message)
        io.sockets.in('players').emit('generalmessage', message);
    });
    socket.on('holding', function (player) {
        players[socket.id] = player
        players[socket.id].attacking = false
    });
    socket.on('map', function () {
        let player = players[socket.id] || {};
        let partialMap = mapFunctions.sendPartialMap(player.x, player.y, 30, 20, fastMap, gridSize);//30//20
        //partialMap = mapFunctions.calculateUnreachableBlocks(partialMap, collisionMap, gridSize, lightMap);
        let partialLightMap = illuminationFunctions.getPartialLightMap(player.x, player.y, lightQuality, 30, 20, lightMap)
        //partialMap = mapFunctions.takeOutFullShadows(partialMap);
        let maps = {
            map: partialMap,
            lightMap: partialLightMap,
        }
        socket.emit('map', maps);
    });
    socket.on('disconnect', function (some) {
        console.log('Player ' + socket.id + ' has disconnected.');
        players[socket.id] = 0
    });
    socket.on('items', function (some) {
        socket.emit('items', items);
    });
    socket.on('state', function (some) {
        socket.emit("state", players)
    });
    socket.on('gameData', function (some) {
        let player = players[socket.id] || {};
        let partialMap = mapFunctions.sendPartialMap(player.x, player.y, 30, 20, fastMap, gridSize);//30//20
        //partialMap = mapFunctions.calculateUnreachableBlocks(partialMap, collisionMap, gridSize, lightMap);
        let partialLightMap = illuminationFunctions.getPartialLightMap(player.x, player.y, lightQuality, 30, 20, lightMap)
        //partialMap = mapFunctions.takeOutFullShadows(partialMap);
        let gameData = {
            map: partialMap,
            lightMap: partialLightMap,
            items: items,
            state: players,
            gameTime: gameTime,
            generalLight: generalLightAmount,
            projectiles: projectiles
        }
        socket.emit("gameData", gameData)
    });
    socket.on('projectiles', function (some) {
        socket.emit('projectiles', projectiles);
    });
    socket.on('mobs', function (some) {
        socket.emit('mobs', mobs);
    });
    socket.on('generalLight', function (some) {
        socket.emit('generalLight', generalLightAmount);
    });
})
;


function movePlayers(players) {
    let speed = 5//5
    let jumpAmount = 5//5
    let jumpSpeed = 6//5
    for (let player in players) {
        player = players[player];
        if (player.isDead == false) {
            if (player.holding[0] !== undefined &&player.holding[0].type != null&& player.holding[0].type != 'light') {
                if (player.followLight != null) {
                    illuminationFunctions.removeLightSource(player.followLight, lightSources);
                    player.followLight = null
                }
            }
                movePlayer(player, player.data, speed, jumpAmount, jumpSpeed);
            }
        }
    }

// let tick = new Date()
// let count = 0;


// let average = 0;
    setInterval(function () {
        // let tick2 = new Date()
        //
        // average += 1000/(tick2 - tick)
        // if(count%60 ===0){
        //     console.log(average/60)
        //     count = 0;
        //     average = 0
        //
        // }
        // if(count&2){
        movePlayers(players);


        // }
        // tick = tick2;
        // count++;
        //console.log(items)
        //attackFunctions.projectileGravity(projectiles, players, gridSize, collisionMap, items, 1)
        collisionFunctions.checkPlayerCloseToItems(players, items, gridSize, collisionMap);

        let edges = mapFunctions.checkPlayerAtEdge(players, leftEdge, rightEdge, 256, 200, collisionMap, fastMap, mobs, items, gridSize)
        generalLightAmount = illuminationFunctions.calculateGeneralLight(timeFunctions.getGameTime(gameTime), generalLightAmount);
        lightMap = illuminationFunctions.calculateLighting(lightSources, lightMap, collisionMap, generalLightAmount, players, lightQuality);
        rightEdge = edges.rightEdge
        leftEdge = edges.leftEdge
        mobs = edges.mobs
        collisionFunctions.gravity(players, mobs, gridSize, collisionMap, projectiles, 5);
        gameTime = timeFunctions.updateGameTime(gameTime, 600)
    }, 1000 / 100);
