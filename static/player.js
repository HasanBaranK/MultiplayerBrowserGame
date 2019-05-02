class Player {
  constructor(state){
    this.state = state
    this.facing = 'right'
    this.attacking = false
    this.animations = []
    this.animationsOnce = []
    this.animationsFinal = []
  }
  draw(ctx, name){
    this.animations[name].draw(ctx, this.state.x, this.state.y)
  }
  drawOnce(ctx, name){
    return this.animationsOnce[name].draw(ctx, this.state.x, this.state.y)
  }
  drawFinal(ctx, name){
    return this.animationsFinal[name].draw(ctx, this.state.x, this.state.y)
  }
  addAnimation(name, img, startColumn, endColumn, row, width, height, cWidth, cHeight, speed){
    this.animations[name] = new Animation(img, startColumn, endColumn, row, width, height, cWidth, cHeight, speed)
  }
  addAnimationOnce(name, img, startColumn, endColumn, row, width, height, cWidth, cHeight, speed){
    this.animationsOnce[name] = new AnimationOnce(img, startColumn, endColumn, row, width, height, cWidth, cHeight, speed)
  }
  addAnimationFinal(name, img, startColumn, endColumn, row, width, height, cWidth, cHeight, speed){
    this.animationsFinal[name] = new AnimationFinal(img, startColumn, endColumn, row, width, height, cWidth, cHeight, speed)
  }
  resetAnimations(){
    for(let animation in this.animations){
      this.animations[animation].reset()
    }
  }
}
