const PADDING$1 = 20;
// canvas直接从页面上拿
class CoordinateSystem {
  constructor({ xCoordinates, yCoordinates }) {
    this.PADDING = 20;
    this.xCoordinates = xCoordinates;
    this.yCoordinates = yCoordinates;
    this.xAxisWidth = canvas.width - 2 * PADDING$1;
    this.yAxisHeight = canvas.height - 2 * PADDING$1;
    this.xInterval = this.xAxisWidth / (xCoordinates.length + .5);
    this.yInterval = this.yAxisHeight / (yCoordinates.length + .5);
  }
  createXAxis() {
    let ctx = this.ctx; // ctx通过原型去拿
    const PADDING = this.PADDING;

    ctx.beginPath();
    ctx.moveTo(PADDING, canvas.height - PADDING);
    ctx.lineTo(PADDING + this.xAxisWidth, canvas.height - PADDING);
    ctx.closePath();
    ctx.stroke();
  
    for (let i = 0; i < this.xCoordinates.length; i++) {
      const x = this.xInterval * (i + 1) + PADDING;
      const y = canvas.height - PADDING;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 5);
      ctx.stroke();
      ctx.fillText(this.xCoordinates[i], x - 10, y + 15);
      ctx.closePath();
      ctx.restore();
    }
  }
  createYAxis() {
    let ctx = this.ctx; // ctx通过原型去拿
    const PADDING = this.PADDING;
    ctx.beginPath();
    ctx.moveTo(PADDING, canvas.height - PADDING);
    ctx.lineTo(PADDING, PADDING);
    ctx.closePath();
    ctx.stroke();
  
    for (let i = 0; i < this.yCoordinates.length; i++) {
      const x = PADDING;
      const y = canvas.height - PADDING - this.yInterval * (i + 1);
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([4,2]);
      ctx.strokeStyle = "#dedede";
      ctx.moveTo(x, y);
      ctx.lineTo(x + this.xAxisWidth, y);
      ctx.stroke();
      ctx.fillText(this.yCoordinates[i], x - 20, y + 5);
      ctx.closePath();
      ctx.closePath();
      ctx.restore();
    }
  }
  create() {
    let ctx = this.ctx; // ctx通过原型去拿
    this.createXAxis();
    this.createYAxis();
  
    ctx.fillText(0, this.PADDING - 12, canvas.height - this.PADDING + 12); // 原点坐标
  }
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
    ctx.moveTo(this.logicXToRealX(this.start.x), this.logicYToRealY(this.start.y));
    ctx.lineTo(this.logicXToRealX(this.end.x), this.logicYToRealY(this.end.y));
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

const painter = {
  ctx: '',
  methods: [],
  receive(obj) {
    if (typeof obj.create !== 'function') {
      throw new Error('Only function can be registered')
    }
    // 尝试一下在这用用bind绑定this值来避免paint调用时的this丢失问题
    this.methods.push(obj.create.bind(obj));
  },
  paint() {
    this.ctx.clearRect(0, 0, 600, 300);
    this.methods.forEach(method => method());
  }
};

let xInterval = 0;
let yInterval = 0;
let PADDING = 20;
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
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.ctx = ctx;
    this.rect = canvas.getBoundingClientRect();
    this.lastX = 0;
    this.isMousedown = false;
    this.SELECT_RANGE = 25;

    xInterval = (canvas.width - 2 * PADDING) / (options.xCoordinates.length + .5);
    yInterval = (canvas.height - 2 * PADDING) / (options.yCoordinates.length + .5);

    CoordinateSystem.prototype.ctx = ctx;
    this.coordinateSystem = new CoordinateSystem({
      xCoordinates: options.xCoordinates,
      yCoordinates: options.yCoordinates
    });

    Line.prototype.ctx = ctx;
    Line.prototype.logicXToRealX = logicXToRealX;
    Line.prototype.logicYToRealY = logicYToRealY;
    Line.prototype.realXToLogicX = realXToLogicX;
    Line.prototype.realYToLogicY = realYToLogicY;
    this.demandCurve = new Line({ x: 200, y: 400 }, { x: 600, y: 100 });
    this.supplyCurve = new Line({ x: 200, y: 100 }, { x: 600, y: 400 });

    painter.ctx = ctx;
    painter.receive(this.coordinateSystem);
    painter.receive(this.demandCurve);
    painter.receive(this.supplyCurve);
  }
  init() {
    painter.paint();
    
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
    if (demandCurveDistance < this.SELECT_RANGE) {
      this.demandCurve.isSelect = true;
    }
    
    // 选中供给曲线
    if (supplyCurveDistance < this.SELECT_RANGE && demandCurveDistance >= this.SELECT_RANGE) {
      this.supplyCurve.isSelect = true;
    }

    painter.paint();
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

    painter.paint();

    this.lastX = e.clientX;
    this.drawIntersection(calculateIntersection(this.demandCurve.equation, this.supplyCurve.equation));
  }
  handleMouseup(e) {
    if (!this.isMousedown) return 
    this.isMousedown = false;
    this.demandCurve.isSelect = false;
    this.supplyCurve.isSelect = false;
    painter.paint();
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
}

new NormalSupplyDemand({
  xCoordinates: [100, 200, 300, 400, 500, 600, 700],
  yCoordinates: [100, 200, 300, 400],
}).init();
