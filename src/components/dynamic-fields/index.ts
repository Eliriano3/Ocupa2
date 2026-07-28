/**
 * Motor de campos dinámicos compartido (Bloque 2 y Bloque 4).
 *
 *   import { DynamicForm, useDynamicForm, fromOfferQuestion } from '@/components/dynamic-fields';
 */

export { DynamicField } from './DynamicField';
export type { DynamicFieldProps } from './DynamicField';

export { DynamicForm, useDynamicForm } from './DynamicForm';
export type { DynamicFormProps, UseDynamicFormResult } from './DynamicForm';

export { fromCustomField, fromOfferQuestion } from './types';
export type {
  DynamicFieldType,
  DynamicFormErrors,
  DynamicFormValues,
  FieldDefinition,
  FieldValue,
} from './types';

export {
  emptyValueFor,
  initialValues,
  isEmptyValue,
  isValid,
  toApiValues,
  validateField,
  validateFields,
} from './validation';
