let path = require('path');
let socketIO = require('socket.io');
let express = require('express');

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
let playerFunctions = require("./server/player");


var players = {};
var collisionMap = {};
let items = [];
let map;
let maps = mapFunctions.autoMapGenerator(0, 70, gridSize,collisionMap);
map = maps.map;
collisionMap  = maps.collisionMap;
playerFunctions.generateItem(320, 200, "Health Potion", "Consumable", 0,0, 0, 1,items)
playerFunctions.generateItem(220, 200, "Health Potion", "Consumable", 0,0, 0, 1,items)
playerFunctions.generateItem(120, 200, "Health Potion", "Consumable", 0,0, 0, 1,items)
playerFunctions.generateItem(420, 200, "Health Potion", "Consumable", 0,0, 0, 1,items)


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
            inventory:[],
            attacking:false,
            equipped:null
        };
        io.sockets.emit('map', map);
        io.sockets.emit('mapCollision', collisionMap);
    });
    socket.on('movement', function (data) {
        var player = players[socket.id] || {};
        if (data.a || data.w || data.d || data.s) {
            if (data.a) {
                player.x -= 5;
                player.status = 2;
                if (collisionFunctions.checkCollision(player, player.sizex, player.sizey, gridSize,collisionMap)) {
                    player.x += 5;
                }
            }
            if (data.w) {
                if (player.onair === false) {
                   player.y -= 4;
                    player.status = 1;
                    playerFunctions.jump(player,50,collisionMap,gridSize);
                    // if (checkCollision(player, 32, 32, gridSize)) {
                    //     player.y += 250;
                    // }
                    player.onair = true;
                }

            }
            if (data.d) {
                player.x += 5;
                player.status = 4;
                if (collisionFunctions.checkCollision(player, player.sizex, player.sizey, gridSize,collisionMap)) {
                    player.x -= 5;

                }
            }
            if (data.s) {
                player.y += 5;
                player.status = 3;
                if (collisionFunctions.checkCollision(player, player.sizex, player.sizey, gridSize,collisionMap)) {
                    player.y -= 5;
                }
            }
        } else {
            player.status = 0;
        }
    });
    socket.on('attack', function (evt) {
      players[socket.id].attacking = true
    });
    socket.on('stopattack', function (evt) {
        let item = playerFunctions.generateItem(players[socket.id],players[socket.id],"sword","melee",1000,1000,0,0,items)
        playerFunctions.meleeAttack(players,players[socket.id],item)
      players[socket.id].attacking = false
    });
    socket.on('mouseclick', function (click) {
        maps = mapFunctions.mineBlock(players[socket.id],click.x,click.y,32,collisionMap,map)
        map = maps.map;
        collisionMap = maps.collisionMap;
        io.sockets.emit('map', map);
        console.log(players[socket.id].x +" " + players[socket.id].y)
    });
    socket.on('rightclick', function (click) {
        maps = mapFunctions.addBlock(map,collisionMap,gridSize,click.x,click.y)
        map = maps.map;
        collisionMap = maps.collisionMap;
        io.sockets.emit('map', map);
        io.sockets.emit('mapCollision', collisionMap);
        console.log(players[socket.id].x +" " + players[socket.id].y)
    });
    socket.on('disconnect', function (some) {
        console.log('Player ' + socket.id + ' has disconnected.');
        players[socket.id] = 0
    });
});
//64px 64px


setInterval(function () {
    collisionFunctions.gravity(players,gridSize,collisionMap);
    collisionFunctions.checkPlayerCloseToItems(players,items,gridSize,collisionMap);
    io.sockets.emit('state', players);
    io.sockets.emit('items', items);
}, 1000 / 60);
