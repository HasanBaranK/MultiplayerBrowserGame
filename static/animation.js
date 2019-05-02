class Animation {
  constructor(img, startColumn, endColumn, row, width, height, cWidth, cHeight, speed){
    this.img = img
    this.startColumn = startColumn
    this.endColumn = endColumn
    this.row = row
    this.width = width
    this.height = height
    this.cWidth = cWidth
    this.cHeight = cHeight
    this.speed = speed

    this.currentColumn = this.startColumn
    this.animTime = new Date().getTime()
  }
  draw(ctx, x, y){
    if(this.currentColumn > this.endColumn){
      this.currentColumn = this.startColumn
    }
    ctx.drawImage(this.img, this.currentColumn * this.width, this.row * this.height,
                  this.width, this.height, x, y, this.cWidth, this.cHeight)
    let t = new Date().getTime()
    if(t > this.animTime){
      this.currentColumn++
      this.animTime = t + this.speed
    }
  }
  reset(){
    this.currentColumn = this.startColumn
  }
}

class AnimationOnce {
  constructor(img, startColumn, endColumn, row, width, height, cWidth, cHeight, speed){
    this.img = img
    this.startColumn = startColumn
    this.endColumn = endColumn
    this.row = row
    this.width = width
    this.height = height
    this.cWidth = cWidth
    this.cHeight = cHeight
    this.speed = speed

    this.currentColumn = this.startColumn
    this.animTime = new Date().getTime()
    this.ended = false
  }
  draw(ctx, x, y){
    if(this.currentColumn > this.endColumn){
      this.currentColumn = this.startColumn
      return true
    }
    ctx.drawImage(this.img, this.currentColumn * this.width, this.row * this.height,
                  this.width, this.height, x, y, this.cWidth, this.cHeight)
    let t = new Date().getTime()
    if(t > this.animTime){
      this.currentColumn++
      this.animTime = t + this.speed
    }
  }
}

class AnimationFinal {
  constructor(img, startColumn, endColumn, row, width, height, cWidth, cHeight, speed){
    this.img = img
    this.startColumn = startColumn
    this.endColumn = endColumn
    this.row = row
    this.width = width
    this.height = height
    this.cWidth = cWidth
    this.cHeight = cHeight
    this.speed = speed

    this.currentColumn = this.startColumn
    this.animTime = new Date().getTime()
    this.ended = false
  }
  draw(ctx, x, y){
    ctx.drawImage(this.img, this.currentColumn * this.width, this.row * this.height,
                  this.width, this.height, x, y, this.cWidth, this.cHeight)
    let t = new Date().getTime()
    if(t > this.animTime && this.currentColumn < this.endColumn){
      this.currentColumn++
      this.animTime = t + this.speed
    }
  }
}
