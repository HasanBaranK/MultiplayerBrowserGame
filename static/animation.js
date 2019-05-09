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
    this.animTime = perf.now()
    this.currentTime = perf.now()
  }
  draw(ctx, x, y){
    if(this.currentColumn > this.endColumn){
      this.currentColumn = this.startColumn
    }
    ctx.drawImage(this.img, this.currentColumn * this.width, this.row * this.height,
                  this.width, this.height, x, y, this.cWidth, this.cHeight)
    this.currentTime = perf.now()
    if(this.currentTime > this.animTime){
      this.currentColumn++
      this.animTime = this.currentTime + this.speed
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
    this.animTime = perf.now()
    this.currentTime = perf.now()
    this.ended = false
  }
  draw(ctx, x, y){
    if(this.currentColumn > this.endColumn){
      this.currentColumn = this.startColumn
      return true
    }
    ctx.drawImage(this.img, this.currentColumn * this.width, this.row * this.height,
                  this.width, this.height, x, y, this.cWidth, this.cHeight)
    this.currentTime = perf.now()
    if(this.currentTime > this.animTime){
      this.currentColumn++
      this.animTime = this.currentTime + this.speed
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
    this.animTime = perf.now()
    this.currentTime = perf.now()
    this.ended = false
  }
  draw(ctx, x, y){
    ctx.drawImage(this.img, this.currentColumn * this.width, this.row * this.height,
                  this.width, this.height, x, y, this.cWidth, this.cHeight)
    this.currentTime = perf.now()
    if(this.currentTime > this.animTime && this.currentColumn < this.endColumn){
      this.currentColumn++
      this.animTime = this.currentTime + this.speed
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

    this.animTime = perf.now()
    this.currentTime = perf.now()
  }
  draw(ctx, ctX , ctY, images){
    if(this.currentFrame > this.numberOfFrames){
      this.currentFrame = 1
    }
    let img = images['bg1 (' + this.currentFrame + ')']
    ctx.drawImage(img, ctX, ctY, this.cWidth, this.cHeight)

    this.currentTime = perf.now()
    if(this.currentTime > this.animTime){
      this.currentFrame++
      this.animTime = this.currentTime + this.speed
    }
  }
}
