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

const imageFolder = './static/images';

var players = {};
var collisionMap = {};
let items = [];
let projectiles = [];
let map;
let mapChanged = false;
let images = {};
images = getImages(images)
let maps = mapFunctions.autoMapGenerator(0, 70, gridSize, collisionMap);
map = maps.map;
collisionMap = maps.collisionMap;
itemFunctions.generateItem(320, 200, "healthpotion_item", "Consumable", 0, 0, 0, 1, items, 1)
itemFunctions.generateItem(220, 200, "healthpotion_item", "Consumable", 0, 0, 0, 1, items, 1)
itemFunctions.generateItem(120, 200, "healthpotion_item", "Consumable", 0, 0, 0, 1, items, 1)
itemFunctions.generateItem(420, 200, "healthpotion_item", "Consumable", 0, 0, 0, 1, items, 1)

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
            console.log("Socket id:" + socket.id)
            let sword = itemFunctions.generateItem(player.x, player.y, "sword_item", "melee", 50, 50, 0, 0, items, 1)
            let peopleGotHit = attackFunctions.meleeAttack(players, socket.id, sword)
            if (peopleGotHit.length > 0) {
                console.log(peopleGotHit)
                io.sockets.emit('peoplegothit', peopleGotHit);
            }
            player.attacking = false
        }
    });
    socket.on('leftclick', function (click) {

        let player = players[socket.id] || {};
        if (player.isDead === false) {
            mapChanged = mapFunctions.mineBlock(player, click.x, click.y, 32, collisionMap, map, items, 128)
        }
    });
    socket.on('rightclick', function (click) {

        let player = players[socket.id] || {};

        if (player.isDead === false) {
            let holding = player.holding[0]
            console.log(holding)
            if(player.holding != undefined) {
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

    socket.on('disconnect', function (some) {
        console.log('Player ' + socket.id + ' has disconnected.');
        players[socket.id] = 0
    });
});


setInterval(function () {
    collisionFunctions.gravity(players, gridSize, collisionMap, projectiles);
    collisionFunctions.checkPlayerCloseToItems(players, items, gridSize, collisionMap);
    io.sockets.emit('state', players);
    io.sockets.emit('items', items);
    if (mapChanged) {
        io.sockets.emit('map', map);
        mapChanged = false
    }
}, 1000 / 60);
