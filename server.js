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

let mapFunctions = require("./server/map");
let collisionFunctions = require("./server/collision");
let attackFunctions = require("./server/Player/attack");
let itemFunctions = require("./server/Player/items");
let inventoryFunctions = require("./server/Player/inventory");

const imageFolder = './static/images';

var players = {};
var collisionMap = {};
var fastMap = {};
let items = [];
let projectiles = [];
let map;
let mapChanged = false;
let images = {};
images = getImages(images)
let maps = mapFunctions.autoMapGenerator(0, 70, gridSize, collisionMap,fastMap);
map = maps.map;
collisionMap = maps.collisionMap;
fastMap = maps.fastMap;
itemFunctions.generateItem(320, 200, "healthpotion_item", "Consumable", 0, 0, 0, 1, items, 1)
itemFunctions.generateItem(220, 200, "healthpotion_item", "Consumable", 0, 0, 0, 1, items, 1)
itemFunctions.generateItem(120, 200, "healthpotion_item", "Consumable", 0, 0, 0, 1, items, 1)
itemFunctions.generateItem(420, 200, "healthpotion_item", "Consumable", 0, 0, 0, 1, items, 1)
console.log("start")
console.log()
console.log("start")

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

io.on('connection', function (socket) {
    console.log('Player ' + socket.id + ' has joined the game');
    socket.on('new player', function () {
        players[socket.id] = {
            x: 320,
            y: 200,
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
        io.sockets.emit('map', map);
        io.sockets.emit('mapCollision', collisionMap);
        let sword = itemFunctions.generateItem(players[socket.id].x, players[socket.id].y, "sword_item", "melee", 50, 50, 0, 0, items, 1)
        inventoryFunctions.addItemInventory(players[socket.id], sword, items)
        socket.join('players');
    });
    socket.on('movement', function (data) {
        let player = players[socket.id] || {};
        if (player.isDead === false) {
            if (data.a || data.w || data.d || data.s) {
                if (data.a) {
                    collisionFunctions.move("left", player, gridSize, collisionMap)
                }
                if (data.w) {
                    if (player.onair === false) {
                        player.y -= 4;
                        player.status = 1;
                        collisionFunctions.jump(player, 50, collisionMap, gridSize);
                        player.onair = true;
                    }

                }
                if (data.d) {
                    collisionFunctions.move("right", player, gridSize, collisionMap)
                }
                if (data.s) {
                    collisionFunctions.move("down", player, gridSize, collisionMap)
                }
            } else {
                player.status = 0;
            }
        }
    });
    socket.on('attack', function (evt) {
        let player = players[socket.id] || {};
        if (player.isDead === false) {
            player.attacking = true
        }
    });
    socket.on('stopattack', function (evt) {
        let player = players[socket.id] || {};
        if (player.isDead === false) {

            let holding = player.holding[0]
            console.log(holding)
            if (holding !== undefined) {
                console.log("hello I am working")
                if (holding.type === "melee") {
                    let peopleGotHit = attackFunctions.meleeAttack(players, socket.id, holding)
                    if (peopleGotHit.length > 0) {
                        console.log(peopleGotHit)
                        io.sockets.emit('peoplegothit', peopleGotHit);
                    }
                    player.attacking = false
                }
            }


        }
    });
    socket.on('leftclick', function (click) {

        let player = players[socket.id] || {};
        if (player.isDead === false) {
            mapChanged = mapFunctions.mineBlock(player, click.x, click.y, 32, collisionMap, map, items, 128,fastMap)
        }
    });
    socket.on('rightclick', function (click) {

        let player = players[socket.id] || {};

        if (player.isDead === false) {
            let holding = player.holding[0]
            console.log(holding)
            if (holding !== undefined) {
                console.log("hello I am working")
                if (holding.type === "block") {
                    mapChanged = mapFunctions.addBlock(player, map, collisionMap, gridSize, click.x, click.y, holding.name, 128)
                }
            }

        }
    });
    socket.on('getimages', function (click) {
        socket.emit('images', images);
    });
    socket.on('holding', function (player) {
        players[socket.id] = player
    });
    socket.on('map', function (player) {
        let partialMap = mapFunctions.sendPartialMap(player.x,player.y,30,10,fastMap,32)
        io.sockets.emit('map', partialMap);
    });
    socket.on('disconnect', function (some) {
        console.log('Player ' + socket.id + ' has disconnected.');
        players[socket.id] = 0
    });
});


setInterval(function () {
    collisionFunctions.gravity(players, gridSize, collisionMap, projectiles);
    collisionFunctions.checkPlayerCloseToItems(players, items, gridSize, collisionMap);
    io.sockets.in('players').emit('state', players);
    io.sockets.in('players').emit('items', items);
}, 1000 / 60);
