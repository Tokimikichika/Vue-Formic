import type { Validator, ValidatorFunction } from '@/types';

/**
 * Создает валидатор
 */
function createValidator(
  type: string,
  validate: ValidatorFunction,
  defaultMessage?: string
): (message?: string) => Validator {
  return (message?: string) => ({
    type,
    validate,
    message: message || defaultMessage || `Validation failed for ${type}`
  });
}

/**
 * Валидатор обязательного поля
 */
export const required = createValidator(
  'required',
  (value: any) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return true;
    if (typeof value === 'number') return !isNaN(value);
    return true;
  },
  'Это поле обязательно для заполнения'
);

/**
 * Валидатор минимальной длины
 */
export const minLength = (length: number, message?: string) =>
  createValidator(
    'minLength',
    (value: any) => {
      if (value === null || value === undefined || value === '') return true;
      const str = String(value);
      return str.length >= length;
    },
    message || `Минимальная длина: ${length} символов`
  )();

/**
 * Валидатор максимальной длины
 */
export const maxLength = (length: number, message?: string) =>
  createValidator(
    'maxLength',
    (value: any) => {
      if (value === null || value === undefined || value === '') return true;
      const str = String(value);
      return str.length <= length;
    },
    message || `Максимальная длина: ${length} символов`
  )();

/**
 * Валидатор минимального значения
 */
export const min = (minValue: number, message?: string) =>
  createValidator(
    'min',
    (value: any) => {
      if (value === null || value === undefined || value === '') return true;
      const num = Number(value);
      return !isNaN(num) && num >= minValue;
    },
    message || `Минимальное значение: ${minValue}`
  )();

/**
 * Валидатор максимального значения
 */
export const max = (maxValue: number, message?: string) =>
  createValidator(
    'max',
    (value: any) => {
      if (value === null || value === undefined || value === '') return true;
      const num = Number(value);
      return !isNaN(num) && num <= maxValue;
    },
    message || `Максимальное значение: ${maxValue}`
  )();

/**
 * Валидатор email
 */
export const email = createValidator(
  'email',
  (value: any) => {
    if (!value) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(value));
  },
  'Введите корректный email адрес'
);

/**
 * Валидатор URL
 */
export const url = createValidator(
  'url',
  (value: any) => {
    if (!value) return true;
    try {
      new URL(String(value));
      return true;
    } catch {
      return false;
    }
  },
  'Введите корректный URL'
);

/**
 * Валидатор регулярного выражения
 */
export const pattern = (regex: RegExp | string, message?: string) =>
  createValidator(
    'pattern',
    (value: any) => {
      if (!value) return true;
      const pattern = typeof regex === 'string' ? new RegExp(regex) : regex;
      return pattern.test(String(value));
    },
    message || 'Значение не соответствует требуемому формату'
  )();

/**
 * Валидатор соответствия одному из значений
 */
export const oneOf = (values: any[], message?: string) =>
  createValidator(
    'oneOf',
    (value: any) => {
      if (value === null || value === undefined) return true;
      return values.includes(value);
    },
    message || `Значение должно быть одним из: ${values.join(', ')}`
  )();

/**
 * Валидатор исключения значений
 */
export const notOneOf = (values: any[], message?: string) =>
  createValidator(
    'notOneOf',
    (value: any) => {
      if (value === null || value === undefined) return true;
      return !values.includes(value);
    },
    message || `Значение не может быть одним из: ${values.join(', ')}`
  )();

/**
 * Валидатор числового значения
 */
export const number = createValidator(
  'number',
  (value: any) => {
    if (value === null || value === undefined || value === '') return true;
    return !isNaN(Number(value));
  },
  'Значение должно быть числом'
);

/**
 * Валидатор целого числа
 */
export const integer = createValidator(
  'integer',
  (value: any) => {
    if (value === null || value === undefined || value === '') return true;
    const num = Number(value);
    return !isNaN(num) && Number.isInteger(num);
  },
  'Значение должно быть целым числом'
);

/**
 * Кастомный валидатор
 */
export const custom = (validator: ValidatorFunction, message?: string) =>
  createValidator(
    'custom',
    validator,
    message || 'Кастомная валидация не прошла'
  )();

/**
 * Валидатор сравнения с другим полем
 */
export const sameAs = (fieldName: string, message?: string) =>
  createValidator(
    'sameAs',
    (value: any, formData: Record<string, any>) => {
      const otherValue = formData[fieldName];
      return value === otherValue;
    },
    message || `Значение должно совпадать с полем ${fieldName}`
  )();

/**
 * Валидатор отличия от другого поля
 */
export const differentFrom = (fieldName: string, message?: string) =>
  createValidator(
    'differentFrom',
    (value: any, formData: Record<string, any>) => {
      const otherValue = formData[fieldName];
      return value !== otherValue;
    },
    message || `Значение должно отличаться от поля ${fieldName}`
  )();

/**
 * Собираем все встроенные валидаторы
 */
export const builtinValidators = {
  required,
  minLength,
  maxLength,
  min,
  max,
  email,
  url,
  pattern,
  oneOf,
  notOneOf,
  number,
  integer,
  custom,
  sameAs,
  differentFrom
};