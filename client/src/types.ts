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

export type PlannerBuildRequest = {
  placeIds: number[]
  startPlaceId?: number
  optimize?: boolean
  source?: 'all' | 'favorites'
}

export type PlannerOrderedPlace = {
  place_id: number
  order_index: number
  name: string
  address: string
  latitude: number
  longitude: number
  main_photo: string
  leg_duration_minutes: number | null
  leg_distance_km: number | null
}

export type PlannerBuildResponse = {
  ordered_places: PlannerOrderedPlace[]
  distance_km: number
  duration_minutes: number
  geometry: number[][]
  optimized: boolean
  start_place_id: number
}

export type SavedRouteListItem = {
  id: number
  name: string
  distance_km: number
  duration_minutes: number
  places_count: number
  main_photo: string | null
  created_at: string
}

export type SavedRouteDetails = PlannerBuildResponse & {
  id: number
  name: string
  created_at: string
}

export type PlannerSaveRequest = {
  name: string
  preview: PlannerBuildResponse
}
