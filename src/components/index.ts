/**
 * Componentes de UI compartidos por los 5 bloques.
 *
 *   import { Screen, AppInput, AppButton, Loader, EmptyState, ErrorMessage } from '@/components';
 *
 * Si necesitas un componente nuevo que sirva a más de un bloque, agrégalo aquí
 * y avísale al equipo; si es solo de tu bloque, déjalo en tu carpeta.
 */

export { AppButton } from './AppButton';
export type { AppButtonProps, AppButtonVariant } from './AppButton';

export { AppInput } from './AppInput';
export type { AppInputProps } from './AppInput';

export { Card } from './Card';
export type { CardProps } from './Card';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export { ErrorMessage, errorToMessage } from './ErrorMessage';
export type { ErrorMessageProps } from './ErrorMessage';

export { Loader } from './Loader';
export type { LoaderProps } from './Loader';

export { PlaceholderScreen } from './PlaceholderScreen';
export type { PlaceholderScreenProps } from './PlaceholderScreen';

export { Screen } from './Screen';
export type { ScreenProps } from './Screen';

export * from './dynamic-fields';
