
import { CoordinateSystem } from "../coordinateSystem"
import { distanceOf, lineFormula, calculateIntersection } from '../utils'
import { Line } from '../elements/line'
const painter = {
  ctx: '',
  methods: [],
  receive(obj) {
    if (typeof obj.create !== 'function') {
      throw new Error('Only function can be registered')
    }
    // 尝试一下在这用用bind绑定this值来避免paint调用时的this丢失问题
    this.methods.push(obj.create.bind(obj))
  },
  paint() {
    this.ctx.clearRect(0, 0, 600, 300)
    this.methods.forEach(method => method())
  }
}

let xInterval = 0
let yInterval = 0
let PADDING = 20
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

// usage: new Line({x: ,y: }, {x: , y: })


class NormalSupplyDemand {
  constructor(options) {
    let canvas = document.getElementById('canvas')
    let ctx = canvas.getContext('2d')
    this.canvas = canvas
    this.ctx = ctx
    this.rect = canvas.getBoundingClientRect()
    this.lastX = 0
    this.isMousedown = false
    this.SELECT_RANGE = 25

    xInterval = (canvas.width - 2 * PADDING) / (options.xCoordinates.length + .5)
    yInterval = (canvas.height - 2 * PADDING) / (options.yCoordinates.length + .5)

    CoordinateSystem.prototype.ctx = ctx
    this.coordinateSystem = new CoordinateSystem({
      xCoordinates: options.xCoordinates,
      yCoordinates: options.yCoordinates
    })

    Line.prototype.ctx = ctx
    Line.prototype.logicXToRealX = logicXToRealX
    Line.prototype.logicYToRealY = logicYToRealY
    Line.prototype.realXToLogicX = realXToLogicX
    Line.prototype.realYToLogicY = realYToLogicY
    this.demandCurve = new Line({ x: 200, y: 400 }, { x: 600, y: 100 })
    this.supplyCurve = new Line({ x: 200, y: 100 }, { x: 600, y: 400 })

    painter.ctx = ctx
    painter.receive(this.coordinateSystem)
    painter.receive(this.demandCurve)
    painter.receive(this.supplyCurve)
  }
  init() {
    painter.paint()
    
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
    if (demandCurveDistance < this.SELECT_RANGE) {
      this.demandCurve.isSelect = true
    }
    
    // 选中供给曲线
    if (supplyCurveDistance < this.SELECT_RANGE && demandCurveDistance >= this.SELECT_RANGE) {
      this.supplyCurve.isSelect = true
    }

    painter.paint()
    this.drawIntersection(calculateIntersection(this.demandCurve.equation, this.supplyCurve.equation))

    if (this.supplyCurve.isSelect || this.demandCurve.isSelect) {
      this.isMousedown = true
      this.lastX = e.clientX
    }

  }
  handleMousemove(e) {
    if (!this.isMousedown) return

    let offsetX = realXToLogicX(e.clientX - this.lastX)
    
    let offset = {
      start: offsetX,
      end: offsetX
    }
    // 找到被选中的曲线并改变其位置
    if (this.demandCurve.isSelect) {
      this.demandCurve.changLocation(offset)
    }
    if (this.supplyCurve.isSelect) {
      this.supplyCurve.changLocation(offset)
    }

    painter.paint()

    this.lastX = e.clientX
    this.drawIntersection(calculateIntersection(this.demandCurve.equation, this.supplyCurve.equation))
  }
  handleMouseup(e) {
    if (!this.isMousedown) return 
    this.isMousedown = false
    this.demandCurve.isSelect = false
    this.supplyCurve.isSelect = false
    painter.paint()
    this.drawIntersection(calculateIntersection(this.demandCurve.equation, this.supplyCurve.equation))
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
}

export { NormalSupplyDemand }
