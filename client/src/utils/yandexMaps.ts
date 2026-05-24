const YMAPS_SCRIPT_ID = 'yandex-maps-script'

export type YMapsGeoObject = {
  events: { add: (event: string, handler: () => void) => void }
  geometry?: { getBounds: () => number[][] }
}

export type YMapsMapInstance = {
  destroy: () => void
  geoObjects: { add: (object: YMapsGeoObject) => void }
  setBounds: (
    bounds: number[][],
    options?: Record<string, unknown>,
  ) => Promise<void> | void
  setCenter: (center: number[], zoom: number) => void
  setZoom: (zoom: number, options?: { duration?: number }) => void
  getZoom: () => number
}

type YMapsApi = {
  ready: (callback: () => void) => void
  Map: new (
    element: HTMLElement,
    state: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => YMapsMapInstance
  Placemark: new (
    coordinates: number[],
    properties?: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => YMapsGeoObject
  Polyline: new (
    coordinates: number[][],
    properties?: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => YMapsGeoObject
  templateLayoutFactory: {
    createClass: (html: string) => unknown
  }
}

declare global {
  interface Window {
    ymaps?: YMapsApi
  }
}

export const loadYandexMaps = (apiKey: string) =>
  new Promise<void>((resolve, reject) => {
    if (window.ymaps) {
      window.ymaps.ready(() => resolve())
      return
    }

    const existingScript = document.getElementById(YMAPS_SCRIPT_ID) as HTMLScriptElement | null
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        window.ymaps?.ready(() => resolve())
      })
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Yandex Maps')))
      return
    }

    const script = document.createElement('script')
    script.id = YMAPS_SCRIPT_ID
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`
    script.async = true
    script.onload = () => window.ymaps?.ready(() => resolve())
    script.onerror = () => reject(new Error('Failed to load Yandex Maps'))
    document.head.appendChild(script)
  })
