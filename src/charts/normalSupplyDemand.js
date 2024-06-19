
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

let demandCurve = {
  name: 'demand',
  start: { x: 200, y: 400 },
  end: { x: 600, y: 100 },
  equation: lineFormula({x: 200, y: 400}, {x: 600, y: 100}),
  width: 600 - 200,
  isSelect: false,
  create(ctx, offset = {start: 0, end: 0}) {
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

let supplyCurve = {
  name: 'supply',
  start: { x: 200, y: 100 },
  end: { x: 600, y: 400 },
  equation: lineFormula({ x: 200, y: 100 }, { x: 600, y: 400 }),
  width: 600 - 200,
  isSelect: false,
  create(ctx, offset = {start: 0, end: 0}) {
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
    this.canvas = document.getElementById('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.rect = canvas.getBoundingClientRect()
    this.lastX = 0
    this.isMousedown = false
  }
  init() {
    let ctx = this.ctx
    createCoordinateSystem(ctx)
    demandCurve.create(ctx)
    supplyCurve.create(ctx)
    
    this.canvas.addEventListener('mousedown', e => this.handleMousedown(e))
    this.canvas.addEventListener('mousemove', e => this.handleMousemove(e))
    this.canvas.addEventListener('mouseup', e => this.handleMouseup(e))
    this.drawIntersection(calculateIntersection(demandCurve.equation, supplyCurve.equation))
  }
  handleMousedown(e) {
    // 由于鼠标的坐标位置并不是从canvas的左上角为起点开始计算的，而是从页面的左上角，因此计算时还要考虑到canvas画布位于页面中的位置。
    let ctx = this.ctx
    let x = realXToLogicX(e.clientX - this.rect.left - PADDING)
    let y = realYToLogicY(canvas.height + this.rect.top - PADDING - e.clientY)
    const demandCurveDistance = distanceOf(demandCurve.equation, x, y)
    const supplyCurveDistance = distanceOf(supplyCurve.equation, x, y)

    // 选中需求曲线
    if (demandCurveDistance < SELECT_RANGE) {
      demandCurve.isSelect = true
      this.repaintCoordinateSystem()
      ctx.save()
      ctx.strokeStyle = '#ffc107'
      demandCurve.create(ctx)
      ctx.restore()
      supplyCurve.create(ctx)
      this.drawIntersection(calculateIntersection(demandCurve.equation, supplyCurve.equation))
    }
    
    // 选中供给曲线
    if (supplyCurveDistance < SELECT_RANGE && demandCurveDistance >= SELECT_RANGE) {
      supplyCurve.isSelect = true
      this.repaintCoordinateSystem()
      demandCurve.create(ctx)
      ctx.save()
      ctx.strokeStyle = '#ffc107'
      supplyCurve.create(ctx)
      ctx.restore()
      this.drawIntersection(calculateIntersection(demandCurve.equation, supplyCurve.equation))
    }

    if (supplyCurve.isSelect || demandCurve.isSelect) {
      this.isMousedown = true
      this.lastX = e.clientX
    }

  }
  handleMousemove(e) {
    if (!this.isMousedown) return
    let ctx = this.ctx

    this.repaintCoordinateSystem()
    let offsetX = realXToLogicX(e.clientX - this.lastX)
    
    let offset = {
      start: offsetX,
      end: offsetX
    }
    demandCurve.create(ctx, offset)
    supplyCurve.create(ctx, offset)
    this.lastX = e.clientX
    this.drawIntersection(calculateIntersection(demandCurve.equation, supplyCurve.equation))
  }
  handleMouseup(e) {
    if (!this.isMousedown) return 
    let ctx = this.ctx
    this.isMousedown = false
    demandCurve.isSelect = false
    supplyCurve.isSelect = false
    demandCurve.create(ctx)
    supplyCurve.create(ctx)
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
