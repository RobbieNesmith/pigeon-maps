import { Crs, MinMaxBounds, Point } from "types"

// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
const lng2tile = (lon: number, zoom: number): number => ((lon + 180) / 360) * Math.pow(2, zoom)
const lat2tile = (lat: number, zoom: number): number =>
  ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
  Math.pow(2, zoom)

function tile2lng(x: number, z: number): number {
  return (x / Math.pow(2, z)) * 360 - 180
}

function tile2lat(y: number, z: number): number {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z)
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
}


// minLat, maxLat, minLng, maxLng
const absoluteMinMax = [
  tile2lat(Math.pow(2, 10), 10),
  tile2lat(0, 10),
  tile2lng(0, 10),
  tile2lng(Math.pow(2, 10), 10),
] as MinMaxBounds;

const pixelToLatLng = (pixel: Point, center: Point, zoom: number, width: number, height: number, pixelDelta: [number, number]): Point => {

  const pointDiff = [
    (pixel[0] - width / 2 - (pixelDelta ? pixelDelta[0] : 0)) / 256.0,
    (pixel[1] - height / 2 - (pixelDelta ? pixelDelta[1] : 0)) / 256.0,
  ]

  const tileX = lng2tile(center[1], zoom) + pointDiff[0]
  const tileY = lat2tile(center[0], zoom) + pointDiff[1]

  return [
    Math.max(absoluteMinMax[0], Math.min(absoluteMinMax[1], tile2lat(tileY, zoom))),
    Math.max(absoluteMinMax[2], Math.min(absoluteMinMax[3], tile2lng(tileX, zoom))),
  ] as Point
}

const latLngToPixel = (latLng: Point, center: Point, zoom: number, width: number, height: number, pixelDelta: [number, number]): Point => {

  const tileCenterX = lng2tile(center[1], zoom)
  const tileCenterY = lat2tile(center[0], zoom)

  const tileX = lng2tile(latLng[1], zoom)
  const tileY = lat2tile(latLng[0], zoom)

  return [
    (tileX - tileCenterX) * 256.0 + width / 2 + (pixelDelta ? pixelDelta[0] : 0),
    (tileY - tileCenterY) * 256.0 + height / 2 + (pixelDelta ? pixelDelta[1] : 0),
  ] as Point
}

const webMercator: Crs = {
  lng2tile,
  lat2tile,
  tile2lng,
  tile2lat,
  pixelToLatLng,
  latLngToPixel,
  absoluteMinMax,
}

export default webMercator;