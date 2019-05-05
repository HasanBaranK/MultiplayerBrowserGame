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

class AnimationsFiles {
  constructor(numberOfFrames, speed, cWidth, cHeight){
    this.numberOfFrames = numberOfFrames
    this.speed = speed
    this.currentFrame = 1
    this.cWidth = cWidth
    this.cHeight = cHeight

    this.animTime = new Date().getTime()
  }
  draw(ctx, ctX , ctY, images){
    if(this.currentFrame > this.numberOfFrames){
      this.currentFrame = 1
    }
    let img = images['bg1 (' + this.currentFrame + ')']
    ctx.drawImage(img, ctX, ctY, this.cWidth, this.cHeight)

    let t = new Date().getTime()
    if(t > this.animTime){
      this.currentFrame++
      this.animTime = t + this.speed
    }
  }
  decreaseFrame(){
    this.currentFrame--
    if(this.currentFrame == 0){
      this.currentFrame = this.numberOfFrames
    }
  }
  increaseFrame(){
    this.currentFrame++
    if(this.currentFrame == this.numberOfFrames){
      this.currentFrame = 0
    }
  }
}
