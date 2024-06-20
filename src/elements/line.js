import { lineFormula } from '../utils'
class Line {
  constructor(start, end) {
    this.start = start
    this.end = end
    this.equation = lineFormula(start, end)
    this.width = end.x - start.x
    this.isSelect = false
  }
  create() {  // ctx通过原型链来拿
    let ctx = this.ctx
    ctx.save()
    ctx.beginPath()
    ctx.lineWidth = "2"
    if (this.isSelect) {
      ctx.strokeStyle = '#ffc107'
    }
    ctx.moveTo(this.logicXToRealX(this.start.x), this.logicYToRealY(this.start.y))
    ctx.lineTo(this.logicXToRealX(this.end.x), this.logicYToRealY(this.end.y))
    ctx.stroke()
    ctx.closePath()
    ctx.restore()
  }
  changLocation(offset) {
    this.start.x += offset.start
    this.end.x += offset.end
    // 边界检测
    this.chechBound(100, 700)
    this.equation = lineFormula(this.start, this.end)
  }
  chechBound(leftSide, rightSide) {
    if (this.start.x <= leftSide) {
      this.start.x = leftSide
      this.end.x = leftSide + this.width
    }
  
    if (this.end.x >= rightSide) {
      this.end.x = rightSide
      this.start.x = rightSide - this.width
    }
  } 
}

export { Line }