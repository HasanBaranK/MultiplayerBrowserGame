function drawPlayerPosition(players) {
    for(let player in players) {
        ctx.fillRect(players[player].state.x+players[player].state.sizex, players[player].state.y+players[player].state.sizey, 2, 2);
    }
}


function visualizeCollision(players, gridSize) {
    for(let player in players) {
        player = players[player]
        let sizex = player.state.sizex
        let sizey = player.state.sizey

        let xcoordinate = player.state.x  + sizex;
        let ycoordinate = player.state.y  + sizey;

        let MAXX
        let MINX
        let MAXY
        let MINY
        if(xcoordinate > 0 && ycoordinate > 0 ) {
            MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize;
            MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize) + gridSize;
            MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize));
            MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize) + gridSize;
        }else if(xcoordinate > 0 && ycoordinate < 0 ){
            MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize;
            MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize) + gridSize;
            MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize)) -gridSize;
            MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize) ;
        }else if (xcoordinate < 0 && ycoordinate > 0) {
            MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize -gridSize;
            MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize);
            MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize));
            MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize) +gridSize ;
        }else if (xcoordinate < 0 && ycoordinate < 0) {
            MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) - gridSize -gridSize;
            MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize);
            MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize)) -gridSize;
            MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize) ;
        }else {
            MAXX = xcoordinate + sizex + (gridSize - ((xcoordinate + sizex) % gridSize)) +gridSize+ gridSize;
            MINX = xcoordinate - sizex - ((xcoordinate - sizex) % gridSize) + gridSize;
            MAXY = ycoordinate + sizey + (gridSize - ((ycoordinate + sizey) % gridSize));
            MINY = ycoordinate - sizey - ((ycoordinate - sizey) % gridSize) ;
            console.log(MAXX)
            console.log(MINX)
        }
        console.log("X not changed")
        console.log(MAXX)
        console.log(MINX)
        if(MAXX === MINX){
            MAXX = MAXX + gridSize
        }

        console.log("X")
        console.log(MAXX)
        console.log(MINX)
        console.log("Y")
        console.log(MAXY)
        console.log(MINY)
        ctx.fillRect(MINX,MINY, MAXX-MINX, MAXY-MINY);
    }
}

function drawMapCollision(map) {
    ctx.save()
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    for(let block in map){
        for(let insideBlock in map[block]){
            if(map[block][insideBlock]) {
                ctx.fillRect(block, insideBlock, 32, 32);
            }
        }

    }
    ctx.restore()
}

function rangeVisualizer(players,range){
    ctx.save()
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";

    console.log(players)
    for(let player in players) {
        player = players[player]
        if (player.facing === "left") {
            ctx.fillRect(player.state.x + player.state.sizex - range, player.state.y, range, 2*player.state.sizey);
        }
        if (player.facing === "right") {
            ctx.fillRect(player.state.x + player.state.sizex, player.state.y , range, 2*player.state.sizey);
        }
    }
    ctx.restore()
}