const PADDING = 20
const xCoordinates = [100, 200, 300, 400, 500, 600, 700]
const yCoordinates = [100, 200, 300, 400]

const xAxisWidth = canvas.width - 2 * PADDING
const yAxisHeight = canvas.height - 2 * PADDING

const xInterval = xAxisWidth / (xCoordinates.length + .5)
const yInterval = yAxisHeight / (yCoordinates.length + .5)

function createXAxis(ctx) {
  ctx.beginPath()
  ctx.moveTo(PADDING, canvas.height - PADDING)
  ctx.lineTo(PADDING + xAxisWidth, canvas.height - PADDING)
  ctx.closePath()
  ctx.stroke()

  for (let i = 0; i < xCoordinates.length; i++) {
    const x = xInterval * (i + 1) + PADDING
    const y = canvas.height - PADDING
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x, y - 5)
    ctx.stroke()
    ctx.fillText(xCoordinates[i], x - 10, y + 15)
    ctx.closePath()
    ctx.restore()
  }
}

function createYAxis(ctx) {
  ctx.beginPath()
  ctx.moveTo(PADDING, canvas.height - PADDING)
  ctx.lineTo(PADDING, PADDING)
  ctx.closePath()
  ctx.stroke()

  for (let i = 0; i < yCoordinates.length; i++) {
    const x = PADDING
    const y = canvas.height - PADDING - yInterval * (i + 1)
    ctx.save()
    ctx.beginPath()
    ctx.setLineDash([4,2])
    ctx.strokeStyle = "#dedede"
    ctx.moveTo(x, y)
    ctx.lineTo(x + xAxisWidth, y)
    ctx.stroke()
    ctx.fillText(yCoordinates[i], x - 20, y + 5)
    ctx.closePath()
    ctx.closePath()
    ctx.restore()
  }
}

function createCoordinateSystem(ctx) {
  createXAxis(ctx)
  createYAxis(ctx)

  ctx.fillText(0, PADDING - 12, canvas.height - PADDING + 12) // 原点坐标
}

export { 
  PADDING,
  xInterval,
  yInterval,
  createCoordinateSystem
}