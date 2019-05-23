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

const imageFolder = './static/images';

var players = {};
var collisionMap = {};
var fastMap = {};
let items = [];
let projectiles = [];
let map;
let mobs = {};
let gameTime = 0;
let day = 0;
let mapChanged = false;
let images = {};
images = getImages(images)

let leftEdge = 0;
let rightEdge = 70;

let craftingRecipes = []

let maps = mapFunctions.autoMapGenerator(leftEdge, rightEdge, gridSize, collisionMap, fastMap);

//Crafting recipes
let sword = itemFunctions.generateItem(0, 0, "sword_item", "melee", 250, 66, 0, 0, items, 1)
let worktable = itemFunctions.generateItem(0, 0, "table0_item", "block", 0, 0, 0, 100, items, 1)
let healthPotion = itemFunctions.generateItem(0, 0, "healthpotion_item", "Consumable", 0, 0, 0, 1, items, 1)
craftingRecipes.push(worktable, sword, healthPotion)

map = maps.map;
collisionMap = maps.collisionMap;
fastMap = maps.fastMap;
mobs = mobsFunctions.generateMobs(leftEdge,rightEdge-leftEdge,mobs,collisionMap,gridSize,items);
itemFunctions.generateItem(320, 200, "healthpotion_item", "Consumable", 0, 0, 0, 1, items, 1)
itemFunctions.generateItem(220, 200, "healthpotion_item", "Consumable", 0, 0, 0, 1, items, 1)
itemFunctions.generateItem(120, 200, "healthpotion_item", "Consumable", 0, 0, 0, 1, items, 1)
itemFunctions.generateItem(420, 200, "healthpotion_item", "Consumable", 0, 0, 0, 1, items, 1)

mobsFunctions.mobController(players,mobs,collisionMap,66,500, io,items);

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
            y: 287,
            status: 0,
            health: 100,
            energy: 100,
            sizex: 32,
            sizey: 32,
            isDead: false,
            isMob: false,
            inventory: [],
            attacking: false,
            facing: "right",
            equipped: [],
            holding: [],
            xp:0,
            xpToLevel:1000,
            level:1
        };
        let player = players[socket.id]
        let partialMap = mapFunctions.sendPartialMap(player.x, player.y, 30, 20, fastMap, 32)
        io.sockets.emit('map', partialMap);
        io.sockets.emit('items', items);
        io.sockets.emit('state', players);
        io.sockets.emit('mobs', mobs);
        io.sockets.emit('gametime', gameTime);
        //io.sockets.emit('projectiles', projectiles);
        io.sockets.emit('mapCollision', collisionMap);
        let sword = itemFunctions.generateItem(players[socket.id].x, players[socket.id].y, "sword_item", "melee", 25, 55, 0, 0, items, 1)
        inventoryFunctions.addItemInventory(players[socket.id], sword, items)
        players[socket.id].holding.push(players[socket.id].inventory[0]);
        socket.join('players');
    });
    socket.on('movement', function (data) {
        let player = players[socket.id] || {};
        if (player.isDead === false) {
            let speed = 5//5
            let jumpAmount = 4//5
            let jumpSpeed = 6//5
            if (data.a || data.w || data.d || data.s) {
                if (data.a) {
                    collisionFunctions.move("left", player, gridSize, collisionMap,speed)
                }
                if (data.w) {
                    if (player.onair === false) {
                        player.y -= 4;
                        player.status = 1;
                        collisionFunctions.jump(player, 50, collisionMap, gridSize,jumpAmount,jumpSpeed);//5,3
                        player.onair = true;
                    }

                }
                if (data.d) {
                    collisionFunctions.move("right", player, gridSize, collisionMap,speed)
                }
                if (data.s) {
                    collisionFunctions.move("down", player, gridSize, collisionMap,speed)
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
    socket.on('consume', function (consumable){
      if(consumable.name == 'healthpotion_item'){
        attackFunctions.heal(players[socket.id], 25)
        inventoryFunctions.deleteItemInventory(players[socket.id],'healthpotion_item')
      }
    });
    socket.on('stopattack', function (evt) {
        let player = players[socket.id] || {};
        if (player.isDead === false) {
            let holding = player.holding[0]
            if (holding !== undefined && holding !== null) {
                if (holding.type === "melee") {
                    let peopleGotHit = attackFunctions.meleeAttack(players, socket.id, holding,mobs,false,items)
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
            let damage =  10;
            if(players[socket.id].holding[0] !== undefined && players[socket.id].holding[0] !== null){
                damage = players[socket.id].holding[0].damage;
            }
            mapChanged = mapFunctions.mineBlock(player, click.x, click.y, 32, collisionMap, map, items, 128, fastMap,damage)

            // if(mapChanged == false) {
            //     let xdirection;
            //     let ydirection;
            //     if(click.x > player.x) {
            //         xdirection = "right"
            //
            //     }else{
            //         xdirection = "left"
            //     }
            //     if(click.y > player.y){
            //         ydirection = "up"
            //     }else{
            //         ydirection = "down"
            //     }
            // let projectile = attackFunctions.generateProjectile(projectiles, "arrow0_item", 10, player.x, player.y -32, 25, click.x, click.y, xdirection,ydirection, 10, 100)
            //                  attackFunctions.calculateProjectile(projectiles, projectile, players, items, gridSize, collisionMap)
            //
            // }
        }

    });
    socket.on('rightclick', function (click) {

        let player = players[socket.id] || {};
        if (player.isDead === false) {
            let holding = player.holding[0]
            let blockGrid = mapFunctions.myGrid(click.x, click.y, 32)
            let blockAtClick = fastMap[blockGrid.x][blockGrid.y]
            if(blockAtClick){
              if(blockAtClick.type.includes("table")){
                socket.emit('craftingui', craftingRecipes)
              }
            }
            if (holding !== undefined) {
                if (holding !== null) {
                    if (holding.type === "block") {
                        mapChanged = mapFunctions.addBlock(player, map, collisionMap, gridSize, click.x, click.y, holding.name, 128, fastMap)
                    }
                }
            }
        }
    });
    socket.on('craft', function (recipe) {
        let player = players[socket.id]
        if(!inventoryFunctions.deleteItemInventoryWithAmount(players[socket.id],recipe['recipe'])){
          socket.emit('generalmessage', {message:'FAILED CRAFTING', sender:'SERVER'})
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
    });
    socket.on('map', function () {
        let player = players[socket.id]
        let partialMap = mapFunctions.sendPartialMap(player.x, player.y, 30, 20, fastMap, 32)
        socket.emit('map', partialMap);
    });
    socket.on('disconnect', function (some) {
        console.log('Player ' + socket.id + ' has disconnected.');
        players[socket.id] = 0
    });
    socket.on('items', function (some) {
        socket.emit('items', items);
    });
    socket.on('state', function (some) {
        socket.emit("state",players)
    });
    socket.on('projectiles', function (some) {
        socket.emit('projectiles',projectiles);
    });
    socket.on('mobs', function (some) {
        socket.emit('mobs',mobs);
    });
});


setInterval(function () {
    //console.log(items)
    //attackFunctions.projectileGravity(projectiles,players,gridSize,collisionMap,items,1)
    for (let player in players) {
      if(players[player].xp >= players[player].xpToLevel){
        players[player].level++
        players[player].xp = 0
        players[player].xpToLevel *= 2
      }
    }
    collisionFunctions.checkPlayerCloseToItems(players, items, gridSize, collisionMap);
    let edges = mapFunctions.checkPlayerAtEdge(players,leftEdge,rightEdge,256,200,collisionMap,fastMap,mobs,items)

    rightEdge= edges.rightEdge
    leftEdge = edges.leftEdge
    mobs = edges.mobs
    //mobsFunctions.playerCloseToMob(players,mobs,1000,collisionMap)
    collisionFunctions.gravity(players,mobs, gridSize, collisionMap, projectiles,5);
    //io.sockets.in('players').emit('state', players);
    //io.sockets.in('players').emit('items', items);
    //io.sockets.in('players').emit('projectiles',projectiles);
    gameTime = timeFunctions.updateGameTime(gameTime,60)
}, 1000 / 60);
