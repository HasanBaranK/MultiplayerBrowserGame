module.exports={
    inPlayerInventory,
    deleteItemInventory,
    addItemInventory
}

function inPlayerInventory(player,name) {
    for(let item in player.inventory){
        console.log(player.inventory[item])
        if(player.inventory[item].name === name){
            return true
        }
    }
    return false
}
function deleteItemInventory(player,name) {
    for(let item in player.inventory){
        if(player.inventory[item].name === name){
            console.log(player)
            player.inventory[item].amount -= 1;
            if(player.inventory[item].amount === 0) {
                player.inventory.splice(item, 1);
            }
            console.log(player)
            return true
        }
    }
    return false
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