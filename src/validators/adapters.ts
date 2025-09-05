import type { ValidatorAdapter, ValidationError } from '@/types';

/**
 * Безопасная проверка наличия библиотеки
 */
function isLibraryAvailable(libraryName: string): boolean {
  if (typeof window !== 'undefined') {
    // В браузере проверяем глобальные переменные
    switch (libraryName) {
      case 'yup':
        return !!(window as any).yup;
      case 'zod':
        return !!(window as any).z;
      case 'vee-validate':
        return !!(window as any).VeeValidate;
      default:
        return false;
    }
  }
  // В Node.js просто возвращаем false для упрощения
  return false;
}

/**
 * Адаптер для Yup
 */
export const yupAdapter: ValidatorAdapter = {
  name: 'yup',
  
  isAvailable(): boolean {
    return isLibraryAvailable('yup');
  },
  
  async validate(schema: any, value: any, _formData: Record<string, any>): Promise<ValidationError[]> {
    if (!this.isAvailable()) {
      return [{
        field: 'unknown',
        message: 'Yup library is not available',
        type: 'error',
        value
      }];
    }
    
    try {
      await schema.validate(value, { 
        context: _formData,
        abortEarly: false 
      });
      return [];
    } catch (error: any) {
      if (error.inner) {
        return error.inner.map((err: any) => ({
          field: err.path || 'unknown',
          message: err.message,
          type: err.type || 'validation',
          value: err.value
        }));
      }
      
      return [{
        field: error.path || 'unknown',
        message: error.message,
        type: error.type || 'validation',
        value
      }];
    }
  }
};

/**
 * Адаптер для Zod
 */
export const zodAdapter: ValidatorAdapter = {
  name: 'zod',
  
  isAvailable(): boolean {
    return isLibraryAvailable('zod');
  },
  
  async validate(schema: any, value: any, _formData: Record<string, any>): Promise<ValidationError[]> {
    if (!this.isAvailable()) {
      return [{
        field: 'unknown',
        message: 'Zod library is not available',
        type: 'error',
        value
      }];
    }
    
    try {
      schema.parse(value);
      return [];
    } catch (error: any) {
      if (error.errors) {
        return error.errors.map((err: any) => ({
          field: err.path?.join('.') || 'unknown',
          message: err.message,
          type: err.code || 'validation',
          value
        }));
      }
      
      return [{
        field: 'unknown',
        message: error.message || 'Validation failed',
        type: 'validation',
        value
      }];
    }
  }
};

/**
 * Адаптер для VeeValidate правил
 */
export const veeValidateAdapter: ValidatorAdapter = {
  name: 'vee-validate',
  
  isAvailable(): boolean {
    return isLibraryAvailable('vee-validate');
  },
  
  async validate(rule: string | Function, value: any, formData: Record<string, any>): Promise<ValidationError[]> {
    if (!this.isAvailable()) {
      return [{
        field: 'unknown',
        message: 'VeeValidate library is not available',
        type: 'error',
        value
      }];
    }
    
    try {
      let validator: Function;
      
      if (typeof rule === 'string') {
        const VeeValidate = (window as any).VeeValidate;
        validator = VeeValidate[rule];
        if (!validator) {
          throw new Error(`VeeValidate rule "${rule}" not found`);
        }
      } else {
        validator = rule;
      }
      
      const result = await validator(value, [], { form: formData });
      
      if (result === true || result === undefined) {
        return [];
      }
      
      return [{
        field: 'unknown',
        message: typeof result === 'string' ? result : 'Validation failed',
        type: 'vee-validate',
        value
      }];
    } catch (error: any) {
      return [{
        field: 'unknown',
        message: error.message || 'Validation failed',
        type: 'vee-validate',
        value
      }];
    }
  }
};

/**
 * Реестр адаптеров
 */
export const validatorAdapters = new Map<string, ValidatorAdapter>([
  ['yup', yupAdapter],
  ['zod', zodAdapter],
  ['vee-validate', veeValidateAdapter]
]);

/**
 * Получить доступный адаптер
 */
export function getValidatorAdapter(name: string): ValidatorAdapter | null {
  const adapter = validatorAdapters.get(name);
  return adapter && adapter.isAvailable() ? adapter : null;
}

/**
 * Получить все доступные адаптеры
 */
export function getAvailableAdapters(): ValidatorAdapter[] {
  return Array.from(validatorAdapters.values()).filter(adapter => adapter.isAvailable());
}