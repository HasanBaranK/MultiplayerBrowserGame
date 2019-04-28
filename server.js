// Dependencies
let path = require('path');
let socketIO = require('socket.io');
let express = require('express');

const app = express();

let server = require('http').createServer(app);
let io = socketIO(server);
app.set('port', 5000);

//Directory of static files
const static_dir = 'static';
app.use(express.static(static_dir));

// Starts the server.
server.listen(5000, function() {
    console.log('Starting server on port 5000');
});

var players = {};
var collisonMap = {};
let map = autoMapgenerator(0,1000,10);

io.on('connection', function(socket) {
  console.log('Player ' + socket.id + ' has joined the game');
    socket.on('new player', function() {
        players[socket.id] = {
            x: 320,
            y: 320,
            status: 0
        };
    });
    socket.on('movement', function(data) {
        var player = players[socket.id] || {};
        var today = new Date();
        player.time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        if (data.a) {
            player.x -= 5;
            player.status = 2;
            if(checkCollision(player,64,64,10)){
                player.x += 5;
                console.log("Collision")
            }
        }
        if (data.w) {
            player.y -= 5;
            player.status = 1;
            if(checkCollision(player,64,64,10)){
                player.y += 5;
                console.log("Collision")
            }

        }
        if (data.d) {
            player.x += 5;
            player.status = 4;
            if(checkCollision(player,64,64,10)){
                player.x -= 5;
                console.log("Collision")

            }
        }
        if (data.s) {
            player.y += 5;
            player.status = 3;
            if(checkCollision(player,64,64,10)){
                player.y -= 5;
                console.log("Collision")
            }
        }
    });
    socket.on('disconnect', function(some) {
      console.log('Player ' + socket.id + ' has disconnected.');
      players[socket.id] = 0
    });
});




function autoMapgenerator(startX,amount,gridSize){
    //Rules
    //world has max 2000 depth mountains and and min 500 depth flat land
    //blocks should be connected and should not defy the laws of gravity(no fling blocks)
    //no extreme changes (a tower of 2000 in an instant should not be possible)
    let blocks = [];
    for(let i=startX;i<startX+amount;i++){
        collisonMap[i*gridSize] = {};
        for(let k=64;k>25;k--){
            let block = {};


            collisonMap[i *gridSize][k*gridSize] = true;
            block["x"] = i * gridSize;
            block["y"] = k * gridSize;
            block["type"] = "dirt";
            block["health"] = 100;
            blocks.push(block);
        }

    }
    console.log(blocks);
    console.log(collisonMap);
    return blocks;
}

//64px 64px
function checkCollision(player,sizex,sizey,gridSize){
    let MAXX = player.x + sizex + (gridSize - ((player.x + sizex) % gridSize )) ;
    let MINX = player.x - sizex - ((player.x - sizex) % gridSize ) ;
    let MAXY = player.y + sizey + (gridSize - ((player.y + sizey) % gridSize )) ;
    let MINY = player.y-sizey - ((player.y - sizey) % gridSize ) ;
    console.log("Checking collision for = " + player.x+ "," + player.y);
    console.log(MAXX+ "," + MINX);
    console.log(MAXY+ "," + MINY);

    for (let i = MINX; i <= MAXX ; i += gridSize) {
        for (let j = MINY; j < MAXY; j+= gridSize) {
            try {
                if (collisonMap[i][j] === undefined) {
                    console.log("no collision")
                    return false;
                } else {
                    return true;

                }
            }catch (e) {
                return false;
            }
        }
    }

}


setInterval(function() {
    io.sockets.emit('state', players);
}, 1000 / 60);
