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
io.on('connection', function(socket) {
  console.log('Player ' + socket.id + ' has joined the game');
    socket.on('new player', function() {
        players[socket.id] = {
            x: 300,
            y: 300
        };
    });
    socket.on('movement', function(data) {
        var player = players[socket.id] || {};
        console.log(data)
        if (data.a) {
            player.x -= 5;
        }
        if (data.w) {
            player.y -= 5;
        }
        if (data.d) {
            player.x += 5;
        }
        if (data.s) {
            player.y += 5;
        }
    });
    socket.on('disconnect', function(some) {

      console.log('Player ' + socket.id + ' has disconnected.');
    });
});

setInterval(function() {
    io.sockets.emit('state', players);
}, 1000 / 60);
