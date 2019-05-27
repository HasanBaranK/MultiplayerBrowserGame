const {myGrid, calculateDistance} = require("./map");

module.exports = {
    generatelightSource,
    calculateLighting,
    getPartialLightMap,
    removeLightSource
}

function generatelightSource(x, y, name, range, power, lightSources) {

    let index = 0
    if(lightSources.size !== undefined){
        index = lightSources.size
    }
    let lightSource = {
        x: x,
        y: y,
        type: name,
        range: range,
        power: power,
        index: index,
    }
    console.log(lightSource);
    lightSources.push(lightSource);
    return lightSource;
}
function removeLightSource(lightSource,lightSources) {
    lightSources.splice(lightSource.index, 1)
}

function calculateGeneralLight(time, generalLightAmount) {
    if (time.hour < 6 || time.hour > 20) {
        generalLightAmount = 0;
    } else if (time.hour < 11) {
        //6 7 8 9 10
        generalLightAmount = ((time.hour - 6) * 60 + time.minute) * (1 / 3)
    } else if (time.hour >= 11 && time.hour <= 15) {
        generalLightAmount = 100
    } else if (time.hour > 15) {
        //16 17 18 19 20
        generalLightAmount = 100 - (((time.hour - 16) * 60 + time.minute) * (1 / 3))
    }
    return generalLightAmount;
}

function cleanLightMap(lightMap, generalLightAmount,players,gridSize,rangex,rangey,lightSources) {
    let count = 0;
    for (let player in players) {
        player = players[player];
        if (player.isDead && player.followLight != null) {
            removeLightSource(player.followLight, lightSources)
            player.followLight = null;
        }
        let position = myGrid(player.x, player.y, gridSize);
        let partialMap = []

        //console.log(lightMap)

        let startx = position.x - (rangex * gridSize)
        let endx = position.x + (rangex * gridSize)

        let starty = position.y - (rangey * gridSize)
        let endy = position.y + (rangey * gridSize)

        for (let i = startx; i < endx;) {

            if (lightMap[i] !== undefined) {
                for (let k = starty; k < endy;) {
                    if (lightMap[i][k] !== undefined) {
                        if (k <= 352) {
                            lightMap[i][k] = generalLightAmount;
                        } else {
                            lightMap[i][k] = 0;
                        }
                        count++;
                    }
                    k = k + gridSize
                }
            }
            i = i + gridSize
        }
    }
    console.log(count)
    // for (let mapX in lightMap) {
    //     for (let mapY in lightMap[mapX]) {
    //         if (mapY <= 352) {
    //             lightMap[mapX][mapY] = generalLightAmount;
    //         } else {
    //             lightMap[mapX][mapY] = 0;
    //         }
    //     }
    // }
}

function calculateLighting(lightSources, lightMap, collisionMap, generalLightAmount, players, time) {
    generalLightAmount = calculateGeneralLight(time, generalLightAmount);
    cleanLightMap(lightMap, generalLightAmount,players,32,25,20,lightSources);
    for (let lightSource in lightSources) {
        lightSource = lightSources[lightSource];
        let distance = lightSource.range + 800;//800 is players vision range
        let shouldCalculate = false;
        for (let player in players) {
            player = players[player];
            let newDistance = calculateDistance(player.x, player.y, lightSource.x, lightSource.y)
            if (newDistance <= distance) {
                shouldCalculate = true;
                break
            }
        }
        if (lightSource.type == "Point" && shouldCalculate) {
            for (let i = 0; i < lightSource.range; i += 32) {
                for (let k = 0; k < lightSource.range; k += 32) {
                    let lightAmount = 0;
                    if (lightSource.power - i - k > 0) {
                        lightAmount = lightSource.power - i - k;
                    }
                    if (lightMap[lightSource.x + i] !== undefined) {

                        if (lightMap[lightSource.x + i][lightSource.y + k] !== undefined) {
                            lightMap[lightSource.x + i][lightSource.y + k] = generalLightAmount + lightAmount;

                        }
                        if (lightMap[lightSource.x + i][lightSource.y - k] !== undefined) {
                            lightMap[lightSource.x + i][lightSource.y - k] = generalLightAmount + lightAmount;

                        }
                    }
                    if (lightMap[lightSource.x - i] !== undefined) {
                        if (lightMap[lightSource.x - i][lightSource.y + k] !== undefined) {
                            lightMap[lightSource.x - i][lightSource.y + k] = generalLightAmount + lightAmount;
                        }
                        if (lightMap[lightSource.x - i][lightSource.y - k] !== undefined) {
                            lightMap[lightSource.x - i][lightSource.y - k] = generalLightAmount + lightAmount

                        }
                    }
                }
            }
        }
    }
}

function getPartialLightMap(x, y, gridSize, rangex, rangey, lightMap) {
    //createPartial LightMap
    let position = myGrid(x, y, gridSize);
    let partialMap = []

    //console.log(lightMap)

    let startx = position.x - (rangex * gridSize)
    let endx = position.x + (rangex * gridSize)

    let starty = position.y - (rangey * gridSize)
    let endy = position.y + (rangey * gridSize)

    for (let i = startx; i < endx;) {

        if (lightMap[i] !== undefined) {
            for (let k = starty; k < endy;) {
                if (lightMap[i][k] !== undefined) {
                    if (partialMap[i] === undefined) {
                        partialMap[i] = {}
                    }
                    if (partialMap[i][k] === undefined) {
                        partialMap[i][k] = {}
                    }
                    partialMap[i][k] = JSON.parse(JSON.stringify(lightMap[i][k]))
                } else {
                    let block = {};
                    block["light"] = 0
                    lightMap[i][k] = block;
                }
                k = k + gridSize
            }
        } else {
            let block = {};
            block["light"] = 0
            lightMap[i] = {}
            for (let k = starty; k < endy;) {
                lightMap[i][k] = block;
                k = k + gridSize
            }
        }
        i = i + gridSize
    }
    return partialMap;
}

// if (lightMap[lightSource.x + i] !== undefined) {
//     if (lightMap[lightSource.x + i][lightSource.y] !== undefined) {
//         lightMap[lightSource.x + i][lightSource.y] = lightSource.power - i;//right
//     }
//     if (lightMap[lightSource.x + i][lightSource.y + i] !== undefined) {
//         lightMap[lightSource.x + i][lightSource.y + i] = lightSource.power - i;
//     }
//     if (lightMap[lightSource.x + i][lightSource.y - i] !== undefined) {
//         lightMap[lightSource.x + i][lightSource.y - i] = lightSource.power - i;
//     }
// }
// if (lightMap[lightSource.x] !== undefined) {
//
//     if (lightMap[lightSource.x][lightSource.y] !== undefined) {
//
//         lightMap[lightSource.x][lightSource.y] = lightSource.power - i;//down
//     }
//     if (lightMap[lightSource.x][lightSource.y + 1] !== undefined) {
//         lightMap[lightSource.x][lightSource.y + i] = lightSource.power - i;//down
//     }
//     if (lightMap[lightSource.x][lightSource.y - 1] !== undefined) {
//         lightMap[lightSource.x][lightSource.y - i] = lightSource.power - i;//up
//     }
// }
// if (lightMap[lightSource.x - i] !== undefined) {
//     if (lightMap[lightSource.x - i][lightSource.y] !== undefined) {
//         lightMap[lightSource.x - i][lightSource.y] = lightSource.power - i;//left
//
//         if (lightMap[lightSource.x - i][lightSource.y + i] !== undefined) {
//             lightMap[lightSource.x - i][lightSource.y + i] = lightSource.power - i;
//         }
//         if (lightMap[lightSource.x - i][lightSource.y - i] !== undefined) {
//             lightMap[lightSource.x - i][lightSource.y - i] = lightSource.power - i;
//         }
//     }
// }