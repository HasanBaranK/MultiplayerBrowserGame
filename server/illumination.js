module.exports = {
    generatelightSource,
    calculateLighting
}

function generatelightSource(x, y, name, range, power, lightSources) {
    let lightSource = {
        x: x,
        y: y,
        type: name,
        range: range,
        power: power,
    }

    lightSources.push(lightSource);
    return lightSource;
}

function calculateLighting(lightSources, lightMap, collisionMap, generalLightAmount) {
    try {
        if (generalLightAmount < 100) {

            for (let mapX in lightMap) {
                for (let mapY in lightMap[mapX]) {
                    //console.log(mapY)
                    lightMap[mapX][mapY] = generalLightAmount;
                }
            }

            for (let lightSource in lightSources) {
                lightSource = lightSources[lightSource];
                if (lightSource.type == "Point") {
                    for (let i = 0; i < lightSource.range; i += 32) {
                        for (let k = 0; k < lightSource.range; k += 32) {
                            let lightAmount = 0;
                            let downNotStopped = true
                            let down2NotStopped = true
                            let upNotStopped = true
                            let up2NotStopped = true
                            if (lightSource.power - i - k > 0) {
                                lightAmount = lightSource.power - i - k;
                            }
                            if (lightMap[lightSource.x + i] !== undefined) {

                                if (lightMap[lightSource.x + i][lightSource.y + k] !== undefined && downNotStopped) {
                                    lightMap[lightSource.x + i][lightSource.y + k] = generalLightAmount + lightAmount;
                                    try {
                                        if (collisionMap[lightSource.x + i][lightSource.y + k] == true) {
                                            downNotStopped == false;
                                        }
                                    } catch (e) {

                                    }
                                }
                                if (lightMap[lightSource.x + i][lightSource.y - k] !== undefined && upNotStopped) {
                                    lightMap[lightSource.x + i][lightSource.y - k] = generalLightAmount + lightAmount;
                                    try {
                                        if (collisionMap[lightSource.x + i][lightSource.y - k] == true) {
                                            upNotStopped == false;
                                        }
                                    } catch (e) {

                                    }
                                }
                            }
                            if (lightMap[lightSource.x - i] !== undefined) {
                                if (lightMap[lightSource.x - i][lightSource.y + k] !== undefined && down2NotStopped) {
                                    lightMap[lightSource.x - i][lightSource.y + k] = generalLightAmount + lightAmount;
                                    try {
                                        if (collisionMap[lightSource.x - i][lightSource.y + k] == true) {
                                            down2NotStopped== false;
                                        }
                                    } catch (e) {

                                    }
                                }
                                if (lightMap[lightSource.x - i][lightSource.y - k] !== undefined && up2NotStopped) {
                                    lightMap[lightSource.x - i][lightSource.y - k] = generalLightAmount + lightAmount
                                    try {
                                        if (collisionMap[lightSource.x - i][lightSource.y - k] == true) {
                                            up2NotStopped == false;
                                        }
                                    } catch (e) {

                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

    } catch (e) {
        console.log(e)
    }
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