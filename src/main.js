let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')
let currentCurve = '' // 保留，在选中线段时使用
import { 
  PADDING, 
  logicXToRealX, 
  logicYToRealY, 
  realXToLogicX,
  realYToLogicY,
  createCoordinateSystem } from './coordinateSystem'
import { distanceOf, lineFormula, calculateIntersection } from './utils'
import { demandCurve, supplyCurve } from './charts/normalSupplyDemand'
createCoordinateSystem(ctx)



demandCurve.create(ctx, currentCurve)


supplyCurve.create(ctx, currentCurve)




let isMousedown = false
let lastX = 0
let rect = canvas.getBoundingClientRect()
canvas.addEventListener('mousedown', (e) => {
    // 由于鼠标的坐标位置并不是从canvas的左上角为起点开始计算的，而是从页面的左上角，因此计算时还要考虑到canvas画布位于页面中的位置。
    let x = realXToLogicX(e.clientX - rect.left - PADDING)
    let y = realYToLogicY(canvas.height + rect.top - PADDING - e.clientY)
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
    }
    drawIntersection(calculateIntersection(demandCurve.equation, supplyCurve.equation))

    if (currentCurve == '') reutrn 
    isMousedown = true
    lastX = e.clientX
})

canvas.addEventListener("mousemove", function(e) {
    if (!isMousedown) return
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
    drawIntersection(calculateIntersection(demandCurve.equation, supplyCurve.equation))
  }
)

canvas.addEventListener("mouseup", function(e) {
  isMousedown = false
  currentCurve = '' 
  demandCurve.create(ctx, currentCurve)
  supplyCurve.create(ctx, currentCurve)
  drawIntersection(calculateIntersection(demandCurve.equation, supplyCurve.equation))
})


function drawIntersection(point) {
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
drawIntersection(calculateIntersection(demandCurve.equation, supplyCurve.equation))