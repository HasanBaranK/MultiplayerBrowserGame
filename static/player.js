class Player {
  constructor(state){
    this.state = state
    this.facing = 'right'
    this.attacking = false
    this.animations = []
    this.animationsOnce = []
  }
  draw(ctx, name){
    this.animations[name].draw(ctx, this.state.x, this.state.y)
  }
  drawOnce(ctx, name){
    if(this.animationsOnce[name].draw(ctx, this.state.x, this.state.y)){
      return true
    }
    return false
  }
  addAnimation(name, img, startColumn, endColumn, row, width, height, cWidth, cHeight, speed){
    this.animations[name] = new Animation(img, startColumn, endColumn, row, width, height, cWidth, cHeight, speed)
  }
  addAnimationOnce(name, img, startColumn, endColumn, row, width, height, cWidth, cHeight, speed){
    this.animationsOnce[name] = new AnimationOnce(img, startColumn, endColumn, row, width, height, cWidth, cHeight, speed)
  }
  resetAnimations(){
    for(let animation in this.animations){
      this.animations[animation].reset()
    }
  }
}
