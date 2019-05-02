module.exports={
    generateItem
}
function generateItem(x, y, name, type, damage,range, defence, health,items,amount) {
    let item = {
        x: x,
        y: y,
        name: name,
        type: type,
        damage: damage,
        range: range,
        defence: defence,
        health: health,
        amount: amount
    };
    items.push(item);
    return item
}
