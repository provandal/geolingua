import type { DenseRegion } from '../types';

export const DENSE_REGIONS: DenseRegion[] = [
  {
    id: 'caribbean',
    label: 'Caribbean',
    bounds: { north: 27, south: 10, east: -59, west: -85 },
    triggerZoomThreshold: 2.5,
  },
  {
    id: 'central_america',
    label: 'Central America',
    bounds: { north: 18, south: 7, east: -76, west: -93 },
    triggerZoomThreshold: 2.5,
  },
  {
    id: 'western_europe',
    label: 'Western Europe',
    bounds: { north: 71, south: 36, east: 32, west: -11 },
    triggerZoomThreshold: 2.0,
  },
  {
    id: 'southeast_asia',
    label: 'SE Asia & Pacific Islands',
    bounds: { north: 28, south: -12, east: 145, west: 92 },
    triggerZoomThreshold: 2.0,
  },
];

export function isInDenseRegion(lat: number, lng: number, zoom: number): DenseRegion | null {
  return DENSE_REGIONS.find(
    (r) =>
      lat <= r.bounds.north &&
      lat >= r.bounds.south &&
      lng >= r.bounds.west &&
      lng <= r.bounds.east &&
      zoom < r.triggerZoomThreshold,
  ) ?? null;
}
