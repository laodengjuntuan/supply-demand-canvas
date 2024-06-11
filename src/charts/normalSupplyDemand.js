import { lineFormula } from "../utils"
import { logicXToRealX, logicYToRealY } from "../coordinateSystem"

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

export { demandCurve, supplyCurve }