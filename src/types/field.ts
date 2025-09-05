/**
 * Базовые типы полей формы
 */
export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url'
  | 'textarea' 
  | 'select' 
  | 'multiselect'
  | 'radio' 
  | 'checkbox' 
  | 'switch'
  | 'date' 
  | 'datetime-local' 
  | 'time'
  | 'file' 
  | 'range' 
  | 'color'
  | 'hidden'
  | 'custom';

/**
 * Опция для селектов и радио кнопок
 */
export interface FieldOption {
  label: string;
  value: any;
  disabled?: boolean;
  description?: string;
}

/**
 * Базовые атрибуты HTML input
 */
export interface BaseInputAttributes {
  placeholder?: string;
  readonly?: boolean;
  disabled?: boolean;
  autocomplete?: string;
  pattern?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  multiple?: boolean;
  accept?: string;
  rows?: number;
  cols?: number;
  maxlength?: number;
  minlength?: number;
}

/**
 * Правила валидации поля
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string | RegExp;
  email?: boolean;
  url?: boolean;
  custom?: (value: any, formData: Record<string, any>) => string | boolean | Promise<string | boolean>;
  message?: string;
}

/**
 * Интеграция с внешними валидаторами
 */
export interface ExternalValidation {
  yup?: any;
  zod?: any;
  veeValidate?: string | ((value: any) => any);
  custom?: (value: any, formData: Record<string, any>) => any;
}

/**
 * Условие для показа/скрытия поля
 */
export interface FieldCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'gt' | 'gte' | 'lt' | 'lte' | 'empty' | 'notEmpty' | 'in' | 'notIn';
  value?: any;
  values?: any[];
}

/**
 * Логика условий (AND/OR)
 */
export interface ConditionalLogic {
  show?: FieldCondition[];
  hide?: FieldCondition[];
  required?: FieldCondition[];
  disabled?: FieldCondition[];
  logic?: 'and' | 'or';
}

/**
 * Определение поля формы
 */
export interface FieldSchema {
  name: string;
  type: FieldType;
  label?: string;
  description?: string;
  defaultValue?: any;
  
  // Валидация
  validation?: ValidationRule;
  externalValidation?: ExternalValidation;
  
  // Опции для селектов/радио
  options?: FieldOption[] | (() => Promise<FieldOption[]>);
  
  // HTML атрибуты
  attributes?: BaseInputAttributes;
  
  // Условная логика
  conditions?: ConditionalLogic;
  
  // CSS классы и стили
  wrapperClass?: string;
  fieldClass?: string;
  labelClass?: string;
  errorClass?: string;
  
  // Кастомные свойства
  component?: string;
  props?: Record<string, any>;
  
  // Группировка
  group?: string;
  order?: number;
  
  // Слоты
  slots?: {
    prefix?: string;
    suffix?: string;
    help?: string;
  };
}