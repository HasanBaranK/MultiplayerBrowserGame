class Player {
  constructor(state){
    this.state = state
    this.facing = 'right'
    this.attacking = false
    this.animations = []
  }
  idle(ctx){
    this.animations[0].draw(ctx, this.state['x'], this.state['y'])
  }
  idleL(ctx){
    this.animations[1].draw(ctx, this.state['x'], this.state['y'])
  }
  up(ctx){
    this.animations[2].draw(ctx, this.state['x'], this.state['y'])
  }
  left(ctx){
    this.animations[3].draw(ctx, this.state['x'], this.state['y'])
  }
  down(ctx){
    this.animations[4].draw(ctx, this.state['x'], this.state['y'])
  }
  right(ctx){
    this.animations[5].draw(ctx, this.state['x'], this.state['y'])
  }
  attack(ctx){
    if(this.animations[6].ended){
      this.attacking = false
    }
    else{
      this.animations[6].draw(ctx, this.state['x'], this.state['y'])
    }
  }
  attackL(ctx){
    if(this.animations[7].ended){
      this.attacking = false
    }
    else{
      this.animations[7].draw(ctx, this.state['x'], this.state['y'])
    }
  }
  addAnimation(img, sx, ex, sy, ey, iw, ih, aw, ah, speed){
    this.animations.push(new Animation(img, sx, ex, sy, ey, iw, ih, aw, ah, speed))
  }
  addAnimation1(img, sx, ex, sy, ey, iw, ih, aw, ah, speed){
    this.animations.push(new Animation1(img, sx, ex, sy, ey, iw, ih, aw, ah, speed))
  }
  resetAnimations(){
    for(let animation in this.animations){
      this.animations[animation].reset()
    }
  }
}
