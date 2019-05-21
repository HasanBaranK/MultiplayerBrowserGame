module.exports={
    generateItem
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
        recipe:{wood0_item:4, dirt0_item:4}
    };
    items.push(item)
    return item
}
