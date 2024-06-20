const PADDING = 20
// canvas直接从页面上拿
class CoordinateSystem {
  constructor({ xCoordinates, yCoordinates }) {
    this.PADDING = 20
    this.xCoordinates = xCoordinates
    this.yCoordinates = yCoordinates
    this.xAxisWidth = canvas.width - 2 * PADDING
    this.yAxisHeight = canvas.height - 2 * PADDING
    this.xInterval = this.xAxisWidth / (xCoordinates.length + .5)
    this.yInterval = this.yAxisHeight / (yCoordinates.length + .5)
  }
  createXAxis() {
    let ctx = this.ctx // ctx通过原型去拿
    const PADDING = this.PADDING

    ctx.beginPath()
    ctx.moveTo(PADDING, canvas.height - PADDING)
    ctx.lineTo(PADDING + this.xAxisWidth, canvas.height - PADDING)
    ctx.closePath()
    ctx.stroke()
  
    for (let i = 0; i < this.xCoordinates.length; i++) {
      const x = this.xInterval * (i + 1) + PADDING
      const y = canvas.height - PADDING
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y - 5)
      ctx.stroke()
      ctx.fillText(this.xCoordinates[i], x - 10, y + 15)
      ctx.closePath()
      ctx.restore()
    }
  }
  createYAxis() {
    let ctx = this.ctx // ctx通过原型去拿
    const PADDING = this.PADDING
    ctx.beginPath()
    ctx.moveTo(PADDING, canvas.height - PADDING)
    ctx.lineTo(PADDING, PADDING)
    ctx.closePath()
    ctx.stroke()
  
    for (let i = 0; i < this.yCoordinates.length; i++) {
      const x = PADDING
      const y = canvas.height - PADDING - this.yInterval * (i + 1)
      ctx.save()
      ctx.beginPath()
      ctx.setLineDash([4,2])
      ctx.strokeStyle = "#dedede"
      ctx.moveTo(x, y)
      ctx.lineTo(x + this.xAxisWidth, y)
      ctx.stroke()
      ctx.fillText(this.yCoordinates[i], x - 20, y + 5)
      ctx.closePath()
      ctx.closePath()
      ctx.restore()
    }
  }
  create() {
    let ctx = this.ctx // ctx通过原型去拿
    this.createXAxis()
    this.createYAxis()
  
    ctx.fillText(0, this.PADDING - 12, canvas.height - this.PADDING + 12) // 原点坐标
  }
}

export { CoordinateSystem }