module.exports={
    inPlayerInventory,
    deleteItemInventory,
    addItemInventory,
    deleteItemInventoryWithAmount
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
    items.splice(items.indexOf(item), 1);
    return 0;
}
