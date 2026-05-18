export type Category = {
  id: number
  name: string
}

export type Tag = {
  id: number
  name: string
}

export type PlaceListItem = {
  id: number
  name: string
  address: string
  latitude: number | string
  longitude: number | string
  main_photo: string
  category: Category | null
}

export type PlaceDetails = {
  id: number
  name: string
  description: string
  address: string
  latitude: number | string
  longitude: number | string
  main_photo: string
  category: Category | null
  photos: { id: number; photo: string; order: number }[]
  tags: { id: number; name: string }[]
}

export type RouteListItem = {
  id: number
  name: string
  description: string
  duration_minutes: number | string
  distance_km: number | string
  main_photo: string
}

export type RouteDetails = {
  id: number
  name: string
  description: string
  duration_minutes: number | string
  distance_km: number | string
  main_photo: string
  points: {
    order_index: number
    place: {
      id: number
      name: string
      address: string
      latitude: number | string
      longitude: number | string
      main_photo: string
    } | null
  }[]
}

export type ViewerState = {
  images: { src: string; alt: string }[]
  index: number
  title: string
}
