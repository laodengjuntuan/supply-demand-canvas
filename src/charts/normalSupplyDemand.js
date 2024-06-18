
import { 
  PADDING, 
  logicXToRealX, 
  logicYToRealY, 
  realXToLogicX, 
  realYToLogicY, 
  createCoordinateSystem 
} from "../coordinateSystem"
import { distanceOf, lineFormula, calculateIntersection } from '../utils'
let currentCurve = '' // 保留，在选中线段时使用


let demandCurve = {
  name: 'demand',
  start: { x: 200, y: 400 },
  end: { x: 600, y: 100 },
  equation: lineFormula({x: 200, y: 400}, {x: 600, y: 100}),
  width: 600 - 200,
  create(ctx, currentCurve) {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(logicXToRealX(this.start.x), logicYToRealY(this.start.y))
    ctx.lineTo(logicXToRealX(this.end.x), logicYToRealY(this.end.y))
    ctx.lineWidth = "2"
    if (currentCurve.name == this.name) {
      ctx.strokeStyle = '#ffc107'
    }
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
  create(ctx, currentCurve) {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(logicXToRealX(this.start.x), logicYToRealY(this.start.y))
    ctx.lineTo(logicXToRealX(this.end.x), logicYToRealY(this.end.y))
    ctx.lineWidth = "2"
    if (currentCurve.name == this.name) {
      ctx.strokeStyle = '#ffc107'
    }
    ctx.stroke()
    ctx.closePath()
    ctx.restore()
  }
}
let isMousedown = false
let lastX = 0

function drawIntersection(point, ctx) {
  const x = logicXToRealX(point.x)
  const y = logicYToRealY(point.y)
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
class NormalSupplyDemand {
  constructor() {
    let canvas = document.getElementById('canvas')
    let ctx = canvas.getContext('2d')
    this.canvas = canvas
    this.ctx = ctx
    this.rect = canvas.getBoundingClientRect()
  }
  init() {
    let ctx = this.ctx
    createCoordinateSystem(ctx)
    demandCurve.create(ctx, currentCurve)
    supplyCurve.create(ctx, currentCurve)
    
    this.canvas.addEventListener('mousedown', e => this.handleMousedown(e))
    this.canvas.addEventListener('mousemove', e => this.handleMousemove(e))
    this.canvas.addEventListener('mouseup', e => this.handleMouseup(e))
    drawIntersection(calculateIntersection(demandCurve.equation, supplyCurve.equation), ctx)
  }
  handleMousedown(e) {
    // 由于鼠标的坐标位置并不是从canvas的左上角为起点开始计算的，而是从页面的左上角，因此计算时还要考虑到canvas画布位于页面中的位置。
    let ctx = this.ctx
    let x = realXToLogicX(e.clientX - this.rect.left - PADDING)
    let y = realYToLogicY(canvas.height + this.rect.top - PADDING - e.clientY)
    const demandCurveDistance = distanceOf(demandCurve.equation, x, y)
    const supplyCurveDistance = distanceOf(supplyCurve.equation, x, y)

    if (demandCurveDistance < 25) { // 设判定范围为25
      currentCurve = demandCurve
      ctx.clearRect(0, 0, 600, 300)
      createCoordinateSystem(ctx)
      ctx.save()
      ctx.strokeStyle = '#ffc107'
      demandCurve.create(ctx, currentCurve)
      ctx.restore()
      supplyCurve.create(ctx, currentCurve)
      drawIntersection(calculateIntersection(demandCurve.equation, supplyCurve.equation), ctx)
    }

    if (supplyCurveDistance < 25 && demandCurveDistance >= 25) {
      currentCurve = supplyCurve
      ctx.clearRect(0, 0, 600, 300)
      createCoordinateSystem(ctx)
      demandCurve.create(ctx, currentCurve)
      ctx.save()
      ctx.strokeStyle = '#ffc107'
      supplyCurve.create(ctx, currentCurve)
      ctx.restore()
      drawIntersection(calculateIntersection(demandCurve.equation, supplyCurve.equation), ctx)
    }

    if (currentCurve == '') return
    isMousedown = true
    lastX = e.clientX
  }
  handleMousemove(e) {
    if (!isMousedown) return
    let ctx = this.ctx
    ctx.clearRect(0, 0, 600, 300)
    createCoordinateSystem(ctx)
  
    currentCurve.start.x += realXToLogicX(e.clientX - lastX)
    currentCurve.end.x += realXToLogicX(e.clientX - lastX)
    lastX = e.clientX
  
    if (currentCurve.start.x <= 100) {
      currentCurve.start.x = 100
      currentCurve.end.x = 100 + currentCurve.width
    }
  
    if (currentCurve.end.x >= 700) {
      currentCurve.end.x = 700
      currentCurve.start.x = 700 - currentCurve.width
    }
  
    currentCurve.equation = lineFormula(currentCurve.start, currentCurve.end)
  
    demandCurve.create(ctx, currentCurve)
    supplyCurve.create(ctx, currentCurve)
    drawIntersection(calculateIntersection(demandCurve.equation, supplyCurve.equation), ctx)
  }
  handleMouseup(e) {
    if (!isMousedown) return 
    let ctx = this.ctx
    isMousedown = false
    currentCurve = '' 
    demandCurve.create(ctx, currentCurve)
    supplyCurve.create(ctx, currentCurve)
  }
}
export { NormalSupplyDemand }