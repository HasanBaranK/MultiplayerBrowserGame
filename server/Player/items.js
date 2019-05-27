module.exports={
    generateItem,
    generateChest
}
function generateItem(x, y, name, type, damage,range, defence, health,items,amount,equipable) {
    let item = {
        x: x,
        y: y,
        name: name,
        type: type,
        damage: damage,
        range: range,
        defence: defence,
        health: health,
        amount: amount,
        equipable: equipable,
        recipe: {stone0_item:1, wood0_item:1, dirt0_item:1}
    };
    items.push(item)
    return item
}

function generateChest(x, y, capacity, chests){
  let chest = {
    x:x,
    y:y,
    capacity:capacity,
    items:[],
    level:1,
    owner:null
  }
  if(chests[x] == null){
    chests[x] = {}
  }
  chests[x][y] = chest
  return chest
}

function addItemToChest(chest, item){
  chest.items.push(item)
}

function removeItemFromChest(chest, itemIndex){
  chest.items.splice(itemIndex, 1)
}
