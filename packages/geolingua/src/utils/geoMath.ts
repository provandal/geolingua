import * as THREE from 'three';

/**
 * Convert a 3D point on the unit sphere to latitude/longitude.
 *
 * Three.js SphereGeometry UV mapping:
 *   x = -cos(φ) · sin(θ)     where φ = u·2π, θ = v·π
 *   y =  cos(θ)
 *   z =  sin(φ) · sin(θ)
 *
 * So the texture center (u=0.5 → longitude 0°) maps to +X on the sphere,
 * and the seam (u=0 → longitude -180°) maps to -X.
 */
export function cartesianToLatLng(point: THREE.Vector3): [number, number] {
  const r = point.length() || 1;
  const lat = 90 - (Math.acos(Math.max(-1, Math.min(1, point.y / r))) * 180) / Math.PI;

  // Recover the azimuthal angle φ that Three.js used to place this vertex
  let phi = Math.atan2(point.z, -point.x); // atan2(sin(φ), -(-cos(φ))) = atan2(sinφ, cosφ) — but note the sign
  if (phi < 0) phi += 2 * Math.PI;

  // φ ∈ [0, 2π]  →  u ∈ [0, 1]  →  lng ∈ [-180, 180]
  const lng = (phi / (2 * Math.PI)) * 360 - 180;

  return [lat, lng];
}

/**
 * Convert latitude/longitude to a 3D point on a sphere of given radius.
 */
export function latLngToCartesian(
  lat: number,
  lng: number,
  radius: number = 1,
): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/**
 * Convert equirectangular texture coordinates to lat/lng.
 */
export function uvToLatLng(u: number, v: number): [number, number] {
  const lng = u * 360 - 180;
  const lat = 90 - v * 180;
  return [lat, lng];
}

/**
 * Convert lat/lng to equirectangular texture coordinates.
 */
export function latLngToUv(lat: number, lng: number): [number, number] {
  const u = (lng + 180) / 360;
  const v = (90 - lat) / 180;
  return [u, v];
}
