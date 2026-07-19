import type { EmbeddableLocation } from './types'

export interface LocationValue {
  latitude: number | null
  longitude: number | null
  height: number | null
  locationName: string
}

export const emptyLocation: LocationValue = {
  latitude: null,
  longitude: null,
  height: null,
  locationName: '',
}

export function locationHasValue(value: LocationValue): boolean {
  return value.latitude != null || value.longitude != null || value.locationName.trim() !== ''
}

export function toEmbeddableLocation(value: LocationValue): EmbeddableLocation | null {
  if (!locationHasValue(value)) return null
  const trimmedName = value.locationName.trim()
  return {
    latitude: value.latitude,
    longitude: value.longitude,
    height: value.height,
    locationName: trimmedName || null,
  }
}

export function fromEmbeddableLocation(location: EmbeddableLocation | null): LocationValue {
  if (!location) return emptyLocation
  return {
    latitude: location.latitude,
    longitude: location.longitude,
    height: location.height,
    locationName: location.locationName ?? '',
  }
}

export function formatLocation(location: EmbeddableLocation | null): string | null {
  if (!location) return null
  const coords =
    location.latitude != null && location.longitude != null
      ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
      : null
  if (location.locationName && coords) return `${location.locationName} (${coords})`
  return location.locationName || coords
}
