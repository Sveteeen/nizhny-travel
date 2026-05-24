const buildYandexMapsUrl = (points: Array<{ latitude: number; longitude: number }>) => {
  if (points.length < 2) return null

  const rtext = points.map((point) => `${point.latitude},${point.longitude}`).join('~')
  return `https://yandex.ru/maps/?rtext=${encodeURIComponent(rtext)}&rtt=pd`
}

export { buildYandexMapsUrl }
