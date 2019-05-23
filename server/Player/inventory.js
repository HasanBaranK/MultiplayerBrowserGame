const {generateItem} = require("./items");


module.exports={
    inPlayerInventory,
    deleteItemInventory,
    addItemInventory,
    deleteItemInventoryWithAmount,
    dropItem,
    dropAllInventory,
    deleteItemFromWorld
}

function inPlayerInventory(player,name) {
    for(let item in player.inventory){
        if(player.inventory[item].name === name){
            return true
        }
    }
    return false
}
function deleteItemInventory(player,name) {
    for(let item in player.inventory){
        if(player.inventory[item].name === name){
            player.inventory[item].amount -= 1;
            if(player.inventory[item].amount === 0) {
                player.inventory.splice(item, 1);
            }
            return true
        }
    }
    return false
}
function fullyDeleteInventory(player) {

    player.inventory=[];
    return false
}

function deleteItemInventoryWithAmount(player,recipes) {
  let itemsFound = 0
  for (let recipe in recipes) {
    for(let item in player.inventory){
      if(player.inventory[item].name === recipe){
        if(player.inventory[item].amount < recipes[recipe]){
          return false
        }
        itemsFound++
      }
    }
  }
  if(itemsFound != Object.keys(recipes).length){
    return false
  }
    for(let recipe in recipes){
      loop1:
      for(let item in player.inventory){
          if(player.inventory[item].name === recipe){
              if(player.inventory[item].amount >= recipes[recipe]){
                player.inventory[item].amount -= recipes[recipe];
                if(player.inventory[item].amount === 0) {
                    player.inventory.splice(item, 1);
                }
                continue loop1
              }
          }
      }
    }
    return true
}

function addItemInventory(player,item,items) {

    for(let inventoryItem in player.inventory){
        if(player.inventory[inventoryItem].name === item.name){
            player.inventory[inventoryItem].amount += item.amount
            items.splice(items.indexOf(item), 1);
            return 0;
        }
    }
    player.inventory.push(item)
    deleteItemFromWorld(items,item)
    return 0;
}
function deleteItemFromWorld(items,item) {
    items.splice(items.indexOf(item), 1);
}
function dropItem(player,name,items) {
    for(let inventoryItem in player.inventory){
        if(player.inventory[inventoryItem].name === name){
            let item = player.inventory[inventoryItem];
            deleteItemInventory(player,name);
            generateItem(item.x, item.y, item.name, item.type, item.damage,item.range, item.defence, item.health,items,1,item.equipable)
        }
    }
}

function dropAllInventory(player,items) {
    for(let inventoryItem in player.inventory){
            let item = player.inventory[inventoryItem];
            let number = getRandomInt(30)-10;
            generateItem(player.x + number, player.y, item.name, item.type, item.damage,item.range, item.defence, item.health,items,item.amount,item.equipable)
    }
    fullyDeleteInventory(player)
}
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
function holdItem(player) {
}