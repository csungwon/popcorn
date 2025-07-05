type Point = {
  latitude: number
  longitude: number
}

export function calculateDistance(p1: Point, p2: Point) {
  const lat1Rad = p1.latitude * (Math.PI / 180)
  const lat2Rad = p2.latitude * (Math.PI / 180)

  const avgLatRad = (lat1Rad + lat2Rad) / 2

  const deltaLatDeg = p2.latitude - p1.latitude
  const deltaLonDeg = p2.longitude - p1.longitude

  const x = deltaLonDeg * Math.cos(avgLatRad)
  const y = deltaLatDeg

  const distanceDegrees = Math.sqrt(x * x + y * y)

  const milesPerDegree = 69.0

  const distanceMiles = distanceDegrees * milesPerDegree

  // round to 10th
  return Math.round(Math.abs(distanceMiles) * 10) / 10
}