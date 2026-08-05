/**
 * Servicio de imágenes reutilizable (Bloques 2, 3 y 5).
 *
 * Cubre el camino completo: pedir permisos → cámara o galería → validar
 * tamaño → `POST /uploads` → URL pública lista para guardar en la oferta,
 * la experiencia o el contrato.
 *
 * Uso típico:
 *
 *   const image = await pickAndUploadImage();     // pregunta cámara o galería
 *   if (image) setPhoto(image.url);               // `null` = el usuario canceló
 *
 * Los errores se lanzan como `ImageServiceError` (permisos, tamaño) o
 * `ApiError` (fallo del API): muéstralos con `<ErrorMessage />`.
 */

import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { MAX_UPLOAD_BYTES } from '@/api/config';
import { uploadImage, type UploadedImage } from '@/api/profile';

export type ImageSource = 'camera' | 'library';

export class ImageServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageServiceError';
  }
}

/** Imagen ya elegida por el usuario, aún sin subir. */
export interface PickedImage {
  uri: string;
  /** Contenido en base64, sin el prefijo `data:`. */
  base64: string;
  mimeType: string;
  /** Tamaño en bytes (aproximado si el sistema no lo reporta). */
  sizeBytes: number;
  fileName?: string;
}

export interface PickImageOptions {
  /** Permitir recortar antes de continuar. Por defecto `true`. */
  allowsEditing?: boolean;
  /** Compresión 0–1. Por defecto `0.7`, suficiente para fotos de referencia. */
  quality?: number;
  /** Relación de aspecto al recortar, ej. `[4, 3]`. */
  aspect?: [number, number];
}

const DEFAULT_OPTIONS: Required<Pick<PickImageOptions, 'allowsEditing' | 'quality'>> = {
  allowsEditing: true,
  quality: 0.7,
};

/** Bytes reales que representa una cadena base64. */
function base64SizeInBytes(base64: string): number {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function toPickedImage(asset: ImagePicker.ImagePickerAsset): PickedImage {
  if (!asset.base64) {
    throw new ImageServiceError('No pudimos leer la imagen. Intenta con otra.');
  }

  const mimeType = asset.mimeType ?? 'image/jpeg';
  const sizeBytes = asset.fileSize ?? base64SizeInBytes(asset.base64);

  if (sizeBytes > MAX_UPLOAD_BYTES) {
    const mb = (sizeBytes / (1024 * 1024)).toFixed(1);
    throw new ImageServiceError(
      `La imagen pesa ${mb} MB y el máximo es 8 MB. Elige una más liviana.`,
    );
  }

  return {
    uri: asset.uri,
    base64: asset.base64,
    mimeType,
    sizeBytes,
    fileName: asset.fileName ?? undefined,
  };
}

/* ------------------------------ Permisos ------------------------------ */

async function ensureCameraPermission(): Promise<void> {
  const { granted, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
  if (granted) return;
  throw new ImageServiceError(
    canAskAgain
      ? 'Necesitamos permiso para usar la cámara.'
      : 'Activa el permiso de cámara para Ocupa2 en los ajustes del teléfono.',
  );
}

async function ensureLibraryPermission(): Promise<void> {
  const { granted, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (granted) return;
  throw new ImageServiceError(
    canAskAgain
      ? 'Necesitamos permiso para ver tus fotos.'
      : 'Activa el permiso de fotos para Ocupa2 en los ajustes del teléfono.',
  );
}

/* ----------------------------- Selección ------------------------------ */

/** Toma una foto con la cámara. Devuelve `null` si el usuario cancela. */
export async function pickImageFromCamera(
  options: PickImageOptions = {},
): Promise<PickedImage | null> {
  await ensureCameraPermission();

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    base64: true,
    allowsEditing: options.allowsEditing ?? DEFAULT_OPTIONS.allowsEditing,
    quality: options.quality ?? DEFAULT_OPTIONS.quality,
    aspect: options.aspect,
  });

  if (result.canceled || !result.assets[0]) return null;
  return toPickedImage(result.assets[0]);
}

/** Elige una foto de la galería. Devuelve `null` si el usuario cancela. */
export async function pickImageFromLibrary(
  options: PickImageOptions = {},
): Promise<PickedImage | null> {
  await ensureLibraryPermission();

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    base64: true,
    allowsEditing: options.allowsEditing ?? DEFAULT_OPTIONS.allowsEditing,
    quality: options.quality ?? DEFAULT_OPTIONS.quality,
    aspect: options.aspect,
  });

  if (result.canceled || !result.assets[0]) return null;
  return toPickedImage(result.assets[0]);
}

/**
 * Pregunta al usuario si quiere cámara o galería. `null` si cancela.
 *
 * En web no hay un diálogo de tres opciones (`Alert` con botones no existe en
 * react-native-web), así que se va directo a la galería: el navegador abre su
 * propio selector de archivos.
 */
export function askImageSource(title = 'Agregar foto'): Promise<ImageSource | null> {
  if (Platform.OS === 'web') return Promise.resolve('library');

  return new Promise((resolve) => {
    Alert.alert(title, '¿De dónde quieres tomar la imagen?', [
      { text: 'Cámara', onPress: () => resolve('camera') },
      { text: 'Galería', onPress: () => resolve('library') },
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}

/** Elige una imagen desde la fuente indicada. */
export function pickImage(
  source: ImageSource,
  options: PickImageOptions = {},
): Promise<PickedImage | null> {
  return source === 'camera' ? pickImageFromCamera(options) : pickImageFromLibrary(options);
}

/* ------------------------------- Subida ------------------------------- */

/** Sube al API una imagen ya elegida y devuelve su URL pública. */
export function uploadPickedImage(image: PickedImage): Promise<UploadedImage> {
  return uploadImage({
    image: `data:${image.mimeType};base64,${image.base64}`,
    filename: image.fileName,
  });
}

/**
 * Flujo completo: pregunta la fuente (si no la pasas), abre cámara o galería
 * y sube la imagen. Devuelve `null` si el usuario cancela en cualquier paso.
 */
export async function pickAndUploadImage(
  source?: ImageSource,
  options: PickImageOptions = {},
): Promise<UploadedImage | null> {
  const chosen = source ?? (await askImageSource());
  if (!chosen) return null;

  const picked = await pickImage(chosen, options);
  if (!picked) return null;

  return uploadPickedImage(picked);
}
