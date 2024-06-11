let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')
let currentCurve = '' // 保留，在选中线段时使用

import { PADDING, xInterval, yInterval, createCoordinateSystem } from './coordinateSystem'




createCoordinateSystem(ctx)

function logicXToRealX(x) {
  return PADDING + xInterval * (Math.floor(x / 100) + x % 100 / 100) 
}

function logicYToRealY(y) {
  return canvas.height - PADDING - yInterval * (Math.floor(y / 100) + y % 100 / 100)
}

function realXToLogicX(x) {
  return x / xInterval * 100
}

function realYToLogicY(y) {
  return y / yInterval * 100
}

let demandCurve = {
  name: 'demand',
  start: { x: 200, y: 400 },
  end: { x: 600, y: 100 },
  equation: lineFormula({x: 200, y: 400}, {x: 600, y: 100}),
  width: 600 - 200,
  create() {
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
demandCurve.create()

let supplyCurve = {
  name: 'supply',
  start: { x: 200, y: 100 },
  end: { x: 600, y: 400 },
  equation: lineFormula({ x: 200, y: 100 }, { x: 600, y: 400 }),
  width: 600 - 200,
  create() {
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
supplyCurve.create()

function distanceOf(curve, x, y) {
  return Math.abs(curve[0] * x + curve[1] * y + curve[2]) / Math.sqrt(curve[0]**2 + curve[1]**2)
}

function lineFormula(point1, point2) {
  return [point1.y - point2.y, point2.x - point1.x, point1.x * point2.y - point2.x * point1.y]
}
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
      demandCurve.create()
      ctx.restore()
      supplyCurve.create()
    }

    if (supplyCurveDistance < 25 && demandCurveDistance >= 25) {
      currentCurve = supplyCurve
      ctx.clearRect(0, 0, 600, 300)
      createCoordinateSystem(ctx)
      demandCurve.create()
      ctx.save()
      ctx.strokeStyle = '#ffc107'
      supplyCurve.create()
      ctx.restore()
    }
    drawIntersection(calculateIntersection())

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

    demandCurve.create()
    supplyCurve.create()
    drawIntersection(calculateIntersection())
  }
)

canvas.addEventListener("mouseup", function(e) {
  isMousedown = false
  currentCurve = '' 
  demandCurve.create()
  supplyCurve.create()
  drawIntersection(calculateIntersection())
})

function calculateIntersection() {
  let [a, b] = demandCurve.equation
  let [c, d] = supplyCurve.equation
  let m = -demandCurve.equation[2]
  let n = -supplyCurve.equation[2]
  let x = (m * d - n * b) / (a * d - b * c)
  let y = (a * n - m * c) / (a * d - b * c)
  return {x, y}
}

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
drawIntersection(calculateIntersection())