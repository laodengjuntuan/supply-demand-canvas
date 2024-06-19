const PADDING = 20;
const xCoordinates = [100, 200, 300, 400, 500, 600, 700];
const yCoordinates = [100, 200, 300, 400];

const xAxisWidth = canvas.width - 2 * PADDING;
const yAxisHeight = canvas.height - 2 * PADDING;

const xInterval = xAxisWidth / (xCoordinates.length + .5);
const yInterval = yAxisHeight / (yCoordinates.length + .5);

function createXAxis(ctx) {
  ctx.beginPath();
  ctx.moveTo(PADDING, canvas.height - PADDING);
  ctx.lineTo(PADDING + xAxisWidth, canvas.height - PADDING);
  ctx.closePath();
  ctx.stroke();

  for (let i = 0; i < xCoordinates.length; i++) {
    const x = xInterval * (i + 1) + PADDING;
    const y = canvas.height - PADDING;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 5);
    ctx.stroke();
    ctx.fillText(xCoordinates[i], x - 10, y + 15);
    ctx.closePath();
    ctx.restore();
  }
}

function createYAxis(ctx) {
  ctx.beginPath();
  ctx.moveTo(PADDING, canvas.height - PADDING);
  ctx.lineTo(PADDING, PADDING);
  ctx.closePath();
  ctx.stroke();

  for (let i = 0; i < yCoordinates.length; i++) {
    const x = PADDING;
    const y = canvas.height - PADDING - yInterval * (i + 1);
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([4,2]);
    ctx.strokeStyle = "#dedede";
    ctx.moveTo(x, y);
    ctx.lineTo(x + xAxisWidth, y);
    ctx.stroke();
    ctx.fillText(yCoordinates[i], x - 20, y + 5);
    ctx.closePath();
    ctx.closePath();
    ctx.restore();
  }
}

function createCoordinateSystem(ctx) {
  createXAxis(ctx);
  createYAxis(ctx);

  ctx.fillText(0, PADDING - 12, canvas.height - PADDING + 12); // 原点坐标
}

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

function distanceOf(curve, x, y) {
  return Math.abs(curve[0] * x + curve[1] * y + curve[2]) / Math.sqrt(curve[0]**2 + curve[1]**2)
}

function lineFormula(point1, point2) {
  return [point1.y - point2.y, point2.x - point1.x, point1.x * point2.y - point2.x * point1.y]
}

function calculateIntersection(line1, line2) {
  let [a, b] = line1;
  let [c, d] = line2;
  let m = -line1[2];
  let n = -line2[2];
  let x = (m * d - n * b) / (a * d - b * c);
  let y = (a * n - m * c) / (a * d - b * c);
  return {x, y}
}

const SELECT_RANGE = 25;

// usage: new Line({x: ,y: }, {x: , y: })
class Line {
  constructor(start, end) {
    this.start = start;
    this.end = end;
    this.equation = lineFormula(start, end);
    this.width = end.x - start.x;
    this.isSelect = false;
  }
  create() {  // ctx通过原型链来拿
    let ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = "2";
    if (this.isSelect) {
      ctx.strokeStyle = '#ffc107';
    }
    ctx.moveTo(logicXToRealX(this.start.x), logicYToRealY(this.start.y));
    ctx.lineTo(logicXToRealX(this.end.x), logicYToRealY(this.end.y));
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
  changLocation(offset) {
    this.start.x += offset.start;
    this.end.x += offset.end;
    // 边界检测
    this.chechBound(100, 700);
    this.equation = lineFormula(this.start, this.end);
  }
  chechBound(leftSide, rightSide) {
    if (this.start.x <= leftSide) {
      this.start.x = leftSide;
      this.end.x = leftSide + this.width;
    }
  
    if (this.end.x >= rightSide) {
      this.end.x = rightSide;
      this.start.x = rightSide - this.width;
    }
  } 
}

class NormalSupplyDemand {
  constructor() {
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.ctx = ctx;
    this.rect = canvas.getBoundingClientRect();
    this.lastX = 0;
    this.isMousedown = false;
    Line.prototype.ctx = ctx;
    this.demandCurve = new Line({ x: 200, y: 400 }, { x: 600, y: 100 });
    this.supplyCurve = new Line({ x: 200, y: 100 }, { x: 600, y: 400 });
  }
  init() {
    this.repaint();
    
    this.canvas.addEventListener('mousedown', e => this.handleMousedown(e));
    this.canvas.addEventListener('mousemove', e => this.handleMousemove(e));
    this.canvas.addEventListener('mouseup', e => this.handleMouseup(e));
    this.drawIntersection(calculateIntersection(this.demandCurve.equation, this.supplyCurve.equation));
  }
  handleMousedown(e) {
    // 由于鼠标的坐标位置并不是从canvas的左上角为起点开始计算的，而是从页面的左上角，因此计算时还要考虑到canvas画布位于页面中的位置。
    let x = realXToLogicX(e.clientX - this.rect.left - PADDING);
    let y = realYToLogicY(canvas.height + this.rect.top - PADDING - e.clientY);
    const demandCurveDistance = distanceOf(this.demandCurve.equation, x, y);
    const supplyCurveDistance = distanceOf(this.supplyCurve.equation, x, y);

    // 选中需求曲线
    if (demandCurveDistance < SELECT_RANGE) {
      this.demandCurve.isSelect = true;
    }
    
    // 选中供给曲线
    if (supplyCurveDistance < SELECT_RANGE && demandCurveDistance >= SELECT_RANGE) {
      this.supplyCurve.isSelect = true;
    }

    this.repaint();
    this.drawIntersection(calculateIntersection(this.demandCurve.equation, this.supplyCurve.equation));

    if (this.supplyCurve.isSelect || this.demandCurve.isSelect) {
      this.isMousedown = true;
      this.lastX = e.clientX;
    }

  }
  handleMousemove(e) {
    if (!this.isMousedown) return

    let offsetX = realXToLogicX(e.clientX - this.lastX);
    
    let offset = {
      start: offsetX,
      end: offsetX
    };
    // 找到被选中的曲线并改变其位置
    if (this.demandCurve.isSelect) {
      this.demandCurve.changLocation(offset);
    }
    if (this.supplyCurve.isSelect) {
      this.supplyCurve.changLocation(offset);
    }

    this.repaint();

    this.lastX = e.clientX;
    this.drawIntersection(calculateIntersection(this.demandCurve.equation, this.supplyCurve.equation));
  }
  handleMouseup(e) {
    if (!this.isMousedown) return 
    this.isMousedown = false;
    this.demandCurve.isSelect = false;
    this.supplyCurve.isSelect = false;
    this.repaint();
    this.drawIntersection(calculateIntersection(this.demandCurve.equation, this.supplyCurve.equation));
  }
  drawIntersection(point) {
    const x = logicXToRealX(point.x);
    const y = logicYToRealY(point.y);
    let ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.moveTo(x, y);
    ctx.lineTo(x, canvas.height - PADDING);
  
    ctx.moveTo(x, y);
    ctx.lineTo(PADDING, y);
  
    ctx.strokeStyle = "#dedede";
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.closePath();
  
    ctx.fillText(point.x.toFixed(2), logicXToRealX(point.x + 10), canvas.height - PADDING - 10);
    ctx.fillText(point.y.toFixed(2), PADDING, y);
    ctx.restore();
  }
  
  repaint() {
    this.ctx.clearRect(0, 0, 600, 300);
    createCoordinateSystem(this.ctx);
    this.demandCurve.create();
    this.supplyCurve.create();
  }
}

new NormalSupplyDemand().init();
