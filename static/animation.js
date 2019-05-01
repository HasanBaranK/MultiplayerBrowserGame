class Animation {
  constructor(img, sx, ex, sy, ey, iw, ih, aw, ah, speed){
    this.img = img
    this.sx = sx
    this.ex = ex
    this.sy = sy
    this.ey = ey
    this.cx = sx
    this.cy = sy
    this.iw = iw
    this.ih = ih
    this.aw = aw
    this.ah = ah
    this.speed = speed
    this.animTime = new Date().getTime()
  }
  draw(ctx, x, y){
    let t = new Date().getTime()
    if(t > this.animTime){
      this.cx++
      this.animTime = t + this.speed
    }
    if(this.cx >= this.ex){
      this.cx = this.sx
    }
    if(this.cy >= this.ey){
      this.cy = this.sy
    }
    ctx.drawImage(this.img,this.cx * this.iw,this.cy * this.ih,this.iw,this.ih, x, y, this.aw, this.ah)
  }
  reset(){
    this.cx = this.sx
    this.cy = this.sy
  }
}

class Animation1 {
  constructor(img, sx, ex, sy, ey, iw, ih, aw, ah, speed){
    this.img = img
    this.sx = sx
    this.ex = ex
    this.sy = sy
    this.ey = ey
    this.cx = sx
    this.cy = sy
    this.iw = iw
    this.ih = ih
    this.aw = aw
    this.ah = ah
    this.speed = speed
    this.ended = false
    this.animTime = new Date().getTime()
  }
  draw(ctx, x, y){
    let t = new Date().getTime()
    if(t > this.animTime){
      this.cx++
      this.animTime = t + this.speed
    }
    if(this.cx >= this.ex){
      this.cx = this.sx
    }
    if(this.cy >= this.ey){
      this.cy = this.sy
    }
    ctx.drawImage(this.img,this.cx * this.iw,this.cy * this.ih,this.iw,this.ih, x, y, this.aw, this.ah)

    if(this.cx == this.ex - 1){
      this.ended = true
      this.reset()
    }
  }
  reset(){
    this.cx = this.sx
    this.cy = this.sy
  }
}
