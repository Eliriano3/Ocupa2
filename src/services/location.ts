/**
 * Servicio de ubicación (Bloques 2 y 4).
 *
 * Pide el permiso y devuelve latitud / longitud en el mismo formato que usa
 * el API (`{ lat, lng }` en `OfferInput.location`).
 *
 *   const coords = await getCurrentLocation();   // lanza si niegan el permiso
 *   setLocation(coords);                          // { lat, lng }
 */

import * as Location from 'expo-location';

import type { GeoLocation } from '@/api/types';

export class LocationServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LocationServiceError';
  }
}

/** Pide el permiso de ubicación. Lanza `LocationServiceError` si lo niegan. */
export async function ensureLocationPermission(): Promise<void> {
  const { granted, canAskAgain } = await Location.requestForegroundPermissionsAsync();
  if (granted) return;
  throw new LocationServiceError(
    canAskAgain
      ? 'Necesitamos permiso para usar tu ubicación.'
      : 'Activa el permiso de ubicación para Ocupa2 en los ajustes del teléfono.',
  );
}

/** `true` si el GPS del teléfono está encendido. */
export function isLocationEnabled(): Promise<boolean> {
  return Location.hasServicesEnabledAsync();
}

/**
 * Coordenadas actuales del dispositivo.
 * Lanza `LocationServiceError` si falta el permiso, el GPS está apagado o no
 * se pudo obtener la posición.
 */
export async function getCurrentLocation(): Promise<GeoLocation> {
  await ensureLocationPermission();

  if (!(await isLocationEnabled())) {
    throw new LocationServiceError('Enciende la ubicación (GPS) del teléfono e intenta de nuevo.');
  }

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { lat: position.coords.latitude, lng: position.coords.longitude };
  } catch {
    throw new LocationServiceError('No pudimos obtener tu ubicación. Intenta de nuevo.');
  }
}

/**
 * Convierte unas coordenadas en una dirección legible (para prellenar el
 * campo `address` al publicar). Devuelve `null` si no hay resultados.
 */
export async function getAddressFromLocation(coords: GeoLocation): Promise<string | null> {
  try {
    const [place] = await Location.reverseGeocodeAsync({
      latitude: coords.lat,
      longitude: coords.lng,
    });
    if (!place) return null;

    const parts = [place.street, place.streetNumber, place.district, place.city, place.region];
    const address = parts.filter(Boolean).join(', ');
    return address.length > 0 ? address : null;
  } catch {
    return null;
  }
}
