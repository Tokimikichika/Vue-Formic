import type { FieldSchema } from './field';

/**
 * Конфигурация формы
 */
export interface FormConfig {
  // Автоматическая валидация
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  
  // Поведение формы
  resetOnSubmit?: boolean;
  preventSubmitOnEnter?: boolean;
  
  // CSS классы
  formClass?: string;
  fieldWrapperClass?: string;
  errorClass?: string;
  
  // Локализация
  locale?: string;
  messages?: Record<string, string>;
}

/**
 * Схема формы
 */
export interface FormSchema {
  fields: FieldSchema[];
  config?: FormConfig;
  groups?: FormGroup[];
  layout?: 'vertical' | 'horizontal' | 'inline' | 'grid';
  title?: string;
  description?: string;
}

/**
 * Группа полей
 */
export interface FormGroup {
  name: string;
  label?: string;
  description?: string;
  fields: string[];
  collapsible?: boolean;
  collapsed?: boolean;
  conditions?: import('./field').ConditionalLogic;
}

/**
 * Ошибка валидации
 */
export interface ValidationError {
  field: string;
  message: string;
  type: string;
  value?: any;
}

/**
 * Состояние поля
 */
export interface FieldState {
  value: any;
  error: string | null;
  touched: boolean;
  dirty: boolean;
  validating: boolean;
  valid: boolean;
  visible: boolean;
  disabled: boolean;
  required: boolean;
}

/**
 * Состояние формы
 */
export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  
  // Глобальное состояние
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;
  
  // Состояния полей
  fields: Record<string, FieldState>;
}

/**
 * События формы
 */
export interface FormEvents {
  submit: (data: Record<string, any>, isValid: boolean) => void;
  change: (fieldName: string, value: any, formData: Record<string, any>) => void;
  blur: (fieldName: string, value: any) => void;
  focus: (fieldName: string, value: any) => void;
  reset: () => void;
  validate: (errors: Record<string, string>) => void;
}

/**
 * Результат валидации
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  fieldErrors: ValidationError[];
}