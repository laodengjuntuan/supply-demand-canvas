function distanceOf(curve, x, y) {
  return Math.abs(curve[0] * x + curve[1] * y + curve[2]) / Math.sqrt(curve[0]**2 + curve[1]**2)
}

function lineFormula(point1, point2) {
  return [point1.y - point2.y, point2.x - point1.x, point1.x * point2.y - point2.x * point1.y]
}

function calculateIntersection(line1, line2) {
  let [a, b] = line1
  let [c, d] = line2
  let m = -line1[2]
  let n = -line2[2]
  let x = (m * d - n * b) / (a * d - b * c)
  let y = (a * n - m * c) / (a * d - b * c)
  return {x, y}
}

export { distanceOf, lineFormula, calculateIntersection }