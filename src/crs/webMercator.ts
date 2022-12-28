import { Crs, MinMaxBounds, Point } from "types"

// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames

function latlng2tile(latLng: Point, zoom: number) {
  const x = ((latLng[1] + 180) / 360) * Math.pow(2, zoom)
  const y = ((1 - Math.log(Math.tan((latLng[0] * Math.PI) / 180) + 1 / Math.cos((latLng[0] * Math.PI) / 180)) / Math.PI) / 2) *
    Math.pow(2, zoom)

  return [x, y] as Point;
}

function tile2latlng(tileCoords: Point, z: number) {
  const n = Math.PI - (2 * Math.PI * tileCoords[1]) / Math.pow(2, z)
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
  const lng = (tileCoords[0] / Math.pow(2, z)) * 360 - 180

  return [lat, lng] as Point;
}

const minLatLng = tile2latlng([0, 0], 10)
const maxLatLng = tile2latlng([Math.pow(2, 10), Math.pow(2, 10)], 10)

// minLat, maxLat, minLng, maxLng
const absoluteMinMax = [
  minLatLng[0],
  maxLatLng[0],
  minLatLng[1],
  maxLatLng[1],
] as MinMaxBounds;

const pixelToLatLng = (pixel: Point, center: Point, zoom: number, width: number, height: number, pixelDelta: [number, number]): Point => {

  const pointDiff = [
    (pixel[0] - width / 2 - (pixelDelta ? pixelDelta[0] : 0)) / 256.0,
    (pixel[1] - height / 2 - (pixelDelta ? pixelDelta[1] : 0)) / 256.0,
  ]

  const tileCoords = latlng2tile(center, zoom)

  const tileX = tileCoords[0] + pointDiff[0]
  const tileY = tileCoords[1] + pointDiff[1]

  const adjustedLatLng = tile2latlng([tileX, tileY], zoom)

  return [
    Math.max(absoluteMinMax[0], Math.min(absoluteMinMax[1], adjustedLatLng[1])),
    Math.max(absoluteMinMax[2], Math.min(absoluteMinMax[3], adjustedLatLng[0])),
  ] as Point
}

const latLngToPixel = (latLng: Point, center: Point, zoom: number, width: number, height: number, pixelDelta: [number, number]): Point => {
  const tileCenter = latlng2tile(center, zoom)
  const tileCoords = latlng2tile(latLng, zoom)

  return [
    (tileCoords[0] - tileCenter[0]) * 256.0 + width / 2 + (pixelDelta ? pixelDelta[0] : 0),
    (tileCoords[1] - tileCenter[1]) * 256.0 + height / 2 + (pixelDelta ? pixelDelta[1] : 0),
  ] as Point
}

export const webMercator: Crs = {
  latlng2tile,
  tile2latlng,
  pixelToLatLng,
  latLngToPixel,
  absoluteMinMax,
}