import type { ValidationError } from './form';

/**
 * Функция валидатора
 */
export type ValidatorFunction = (
  value: any,
  formData: Record<string, any>,
  fieldName: string
) => string | boolean | Promise<string | boolean>;

/**
 * Конфигурация валидатора
 */
export interface ValidatorConfig {
  message?: string;
  when?: (formData: Record<string, any>) => boolean;
  debounce?: number;
}

/**
 * Валидатор с конфигурацией
 */
export interface Validator extends ValidatorConfig {
  validate: ValidatorFunction;
  type: string;
}

/**
 * Встроенные валидаторы
 */
export interface BuiltinValidators {
  required: (message?: string) => Validator;
  minLength: (length: number, message?: string) => Validator;
  maxLength: (length: number, message?: string) => Validator;
  min: (min: number, message?: string) => Validator;
  max: (max: number, message?: string) => Validator;
  email: (message?: string) => Validator;
  url: (message?: string) => Validator;
  pattern: (pattern: RegExp | string, message?: string) => Validator;
  oneOf: (values: any[], message?: string) => Validator;
  custom: (validator: ValidatorFunction, message?: string) => Validator;
}

/**
 * Интерфейс для адаптеров внешних валидаторов
 */
export interface ValidatorAdapter {
  name: string;
  validate: (schema: any, value: any, formData: Record<string, any>) => Promise<ValidationError[]>;
  isAvailable: () => boolean;
}

/**
 * Результат асинхронной валидации
 */
export interface AsyncValidationResult {
  field: string;
  isValid: boolean;
  error?: string;
  pending?: boolean;
}

/**
 * Контекст валидации
 */
export interface ValidationContext {
  fieldName: string;
  fieldValue: any;
  formData: Record<string, any>;
  formSchema: import('./form').FormSchema;
  abortSignal?: AbortSignal;
}