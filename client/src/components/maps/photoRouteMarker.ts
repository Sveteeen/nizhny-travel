export type PhotoRouteMarkerPoint = {
  latitude: number
  longitude: number
  orderIndex: number
  name: string
  mainPhoto: string
}

export const createPhotoRouteMarker = (
  ymaps: NonNullable<typeof window.ymaps>,
  point: PhotoRouteMarkerPoint,
  normalizeImageUrl: (value: string) => string,
) => {
  const imageUrl = normalizeImageUrl(point.mainPhoto)
  const markerLayout = ymaps.templateLayoutFactory.createClass(`
    <div style="position: relative; width: 52px; height: 52px;">
      <div style="
        width: 52px;
        height: 52px;
        border-radius: 50%;
        border: 3px solid #c2410c;
        box-shadow: 0 8px 16px rgba(9, 15, 28, 0.45);
        background-image: url('${imageUrl}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      "></div>
      <div style="
        position: absolute;
        top: -2px;
        right: -2px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #c2410c;
        border: 2px solid #fef7ed;
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        line-height: 16px;
        text-align: center;
      ">${point.orderIndex}</div>
    </div>
  `)

  return new ymaps.Placemark(
    [point.latitude, point.longitude],
    {
      hintContent: `${point.orderIndex}. ${point.name}`,
      balloonContentHeader: `${point.orderIndex}. ${point.name}`,
      balloonContentBody: point.name,
    },
    {
      iconLayout: markerLayout,
      iconShape: {
        type: 'Circle',
        coordinates: [26, 26],
        radius: 26,
      },
      iconOffset: [-26, -26],
    },
  )
}
