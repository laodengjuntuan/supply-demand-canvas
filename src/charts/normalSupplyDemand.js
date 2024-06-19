
import { 
  PADDING, 
  logicXToRealX, 
  logicYToRealY, 
  realXToLogicX, 
  realYToLogicY, 
  createCoordinateSystem 
} from "../coordinateSystem"
import { distanceOf, lineFormula, calculateIntersection } from '../utils'

const SELECT_RANGE = 25

// usage: new Line({x: ,y: }, {x: , y: })
class Line {
  constructor(start, end) {
    this.start = start
    this.end = end
    this.equation = lineFormula(start, end)
    this.width = end.x - start.x
    this.isSelect = false
  }
  create(offset = {start: 0, end: 0}) {  // ctx通过原型链来拿
    let ctx = this.ctx
    ctx.save()
    ctx.beginPath()
    ctx.lineWidth = "2"
    if (this.isSelect) {
      ctx.strokeStyle = '#ffc107'
      this.start.x += offset.start
      this.end.x += offset.end
      if (this.start.x <= 100) {
        this.start.x = 100
        this.end.x = 100 + this.width
      }
    
      if (this.end.x >= 700) {
        this.end.x = 700
        this.start.x = 700 - this.width
      }
      this.equation = lineFormula(this.start, this.end)
    }
    ctx.moveTo(logicXToRealX(this.start.x), logicYToRealY(this.start.y))
    ctx.lineTo(logicXToRealX(this.end.x), logicYToRealY(this.end.y))
    ctx.stroke()
    ctx.closePath()
    ctx.restore()
  }
}

class NormalSupplyDemand {
  constructor() {
    let canvas = document.getElementById('canvas')
    let ctx = canvas.getContext('2d')
    this.canvas = canvas
    this.ctx = ctx
    this.rect = canvas.getBoundingClientRect()
    this.lastX = 0
    this.isMousedown = false
    Line.prototype.ctx = ctx
    this.demandCurve = new Line({ x: 200, y: 400 }, { x: 600, y: 100 })
    this.supplyCurve = new Line({ x: 200, y: 100 }, { x: 600, y: 400 })
  }
  init() {
    let ctx = this.ctx
    createCoordinateSystem(ctx)

    this.demandCurve.create()
    this.supplyCurve.create()
    
    this.canvas.addEventListener('mousedown', e => this.handleMousedown(e))
    this.canvas.addEventListener('mousemove', e => this.handleMousemove(e))
    this.canvas.addEventListener('mouseup', e => this.handleMouseup(e))
    this.drawIntersection(calculateIntersection(this.demandCurve.equation, this.supplyCurve.equation))
  }
  handleMousedown(e) {
    // 由于鼠标的坐标位置并不是从canvas的左上角为起点开始计算的，而是从页面的左上角，因此计算时还要考虑到canvas画布位于页面中的位置。
    let x = realXToLogicX(e.clientX - this.rect.left - PADDING)
    let y = realYToLogicY(canvas.height + this.rect.top - PADDING - e.clientY)
    const demandCurveDistance = distanceOf(this.demandCurve.equation, x, y)
    const supplyCurveDistance = distanceOf(this.supplyCurve.equation, x, y)

    // 选中需求曲线
    if (demandCurveDistance < SELECT_RANGE) {
      this.demandCurve.isSelect = true
    }
    
    // 选中供给曲线
    if (supplyCurveDistance < SELECT_RANGE && demandCurveDistance >= SELECT_RANGE) {
      this.supplyCurve.isSelect = true
    }

    this.repaintCoordinateSystem()
    this.demandCurve.create()
    this.supplyCurve.create()
    this.drawIntersection(calculateIntersection(this.demandCurve.equation, this.supplyCurve.equation))

    if (this.supplyCurve.isSelect || this.demandCurve.isSelect) {
      this.isMousedown = true
      this.lastX = e.clientX
    }

  }
  handleMousemove(e) {
    if (!this.isMousedown) return

    this.repaintCoordinateSystem()
    let offsetX = realXToLogicX(e.clientX - this.lastX)
    
    let offset = {
      start: offsetX,
      end: offsetX
    }
    this.demandCurve.create(offset)
    this.supplyCurve.create(offset)
    this.lastX = e.clientX
    this.drawIntersection(calculateIntersection(this.demandCurve.equation, this.supplyCurve.equation))
  }
  handleMouseup(e) {
    if (!this.isMousedown) return 
    this.isMousedown = false
    this.demandCurve.isSelect = false
    this.supplyCurve.isSelect = false
    this.demandCurve.create()
    this.supplyCurve.create()
  }
  drawIntersection(point) {
    const x = logicXToRealX(point.x)
    const y = logicYToRealY(point.y)
    let ctx = this.ctx
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2, true)
    ctx.fill()
    ctx.moveTo(x, y)
    ctx.lineTo(x, canvas.height - PADDING)
  
    ctx.moveTo(x, y)
    ctx.lineTo(PADDING, y)
  
    ctx.strokeStyle = "#dedede"
    ctx.setLineDash([5, 5])
    ctx.stroke()
    ctx.closePath()
  
    ctx.fillText(point.x.toFixed(2), logicXToRealX(point.x + 10), canvas.height - PADDING - 10)
    ctx.fillText(point.y.toFixed(2), PADDING, y)
    ctx.restore()
  }
  
  repaintCoordinateSystem() {
    this.ctx.clearRect(0, 0, 600, 300)
    createCoordinateSystem(this.ctx)
  }
}

export { NormalSupplyDemand }
