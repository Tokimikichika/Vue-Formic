import type { 
  FieldSchema, 
  ValidationResult, 
  ValidationError,
  Validator,
  AsyncValidationResult,
  ValidationContext
} from '@/types';
import { builtinValidators } from './builtin';
import { getValidatorAdapter } from './adapters';

/**
 * Движок валидации
 */
export class ValidationEngine {
  private abortControllers = new Map<string, AbortController>();
  private validationCache = new Map<string, ValidationResult>();
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

  /**
   * Валидирует одно поле
   */
  async validateField(
    fieldSchema: FieldSchema,
    value: any,
    formData: Record<string, any>,
    context?: Partial<ValidationContext>
  ): Promise<AsyncValidationResult> {
    const fieldName = fieldSchema.name;
    
    // Отменяем предыдущую валидацию если она есть
    this.cancelFieldValidation(fieldName);
    
    // Создаем новый контроллер отмены
    const abortController = new AbortController();
    this.abortControllers.set(fieldName, abortController);
    
    const validationContext: ValidationContext = {
      fieldName,
      fieldValue: value,
      formData,
      formSchema: context?.formSchema!,
      abortSignal: abortController.signal,
      ...context
    };

    try {
      // Валидация встроенными валидаторами
      const builtinErrors = await this.validateWithBuiltinValidators(
        fieldSchema,
        value,
        formData,
        validationContext
      );
      
      if (builtinErrors.length > 0) {
        return {
          field: fieldName,
          isValid: false,
          error: builtinErrors[0].message,
          pending: false
        };
      }
      
      // Валидация внешними валидаторами
      const externalErrors = await this.validateWithExternalValidators(
        fieldSchema,
        value,
        formData,
        validationContext
      );
      
      if (externalErrors.length > 0) {
        return {
          field: fieldName,
          isValid: false,
          error: externalErrors[0].message,
          pending: false
        };
      }
      
      return {
        field: fieldName,
        isValid: true,
        pending: false
      };
      
    } catch (error: any) {
      // Проверяем, была ли операция отменена
      if (error.name === 'AbortError') {
        return {
          field: fieldName,
          isValid: false,
          pending: true
        };
      }
      
      return {
        field: fieldName,
        isValid: false,
        error: error.message || 'Ошибка валидации',
        pending: false
      };
    } finally {
      this.abortControllers.delete(fieldName);
    }
  }

  /**
   * Валидирует всю форму
   */
  async validateForm(
    fields: FieldSchema[],
    formData: Record<string, any>
  ): Promise<ValidationResult> {
    const validationPromises = fields.map(field => 
      this.validateField(field, formData[field.name], formData)
    );
    
    const results = await Promise.allSettled(validationPromises);
    const errors: Record<string, string> = {};
    const fieldErrors: ValidationError[] = [];
    
    results.forEach((result, index) => {
      const field = fields[index];
      
      if (result.status === 'fulfilled') {
        const validationResult = result.value;
        if (!validationResult.isValid && validationResult.error) {
          errors[field.name] = validationResult.error;
          fieldErrors.push({
            field: field.name,
            message: validationResult.error,
            type: 'validation',
            value: formData[field.name]
          });
        }
      } else {
        errors[field.name] = 'Ошибка валидации';
        fieldErrors.push({
          field: field.name,
          message: 'Ошибка валидации',
          type: 'error',
          value: formData[field.name]
        });
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      fieldErrors
    };
  }

  /**
   * Валидация с встроенными валидаторами
   */
  private async validateWithBuiltinValidators(
    fieldSchema: FieldSchema,
    value: any,
    formData: Record<string, any>,
    _context: ValidationContext
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const validation = fieldSchema.validation;
    
    if (!validation) return errors;
    
    // Создаем валидаторы на основе правил валидации
    const validators: Validator[] = [];
    
    if (validation.required) {
      validators.push(builtinValidators.required(validation.message));
    }
    
    if (validation.minLength !== undefined) {
      validators.push(builtinValidators.minLength(validation.minLength, validation.message));
    }
    
    if (validation.maxLength !== undefined) {
      validators.push(builtinValidators.maxLength(validation.maxLength, validation.message));
    }
    
    if (validation.min !== undefined) {
      validators.push(builtinValidators.min(validation.min, validation.message));
    }
    
    if (validation.max !== undefined) {
      validators.push(builtinValidators.max(validation.max, validation.message));
    }
    
    if (validation.email) {
      validators.push(builtinValidators.email(validation.message));
    }
    
    if (validation.url) {
      validators.push(builtinValidators.url(validation.message));
    }
    
    if (validation.pattern) {
      validators.push(builtinValidators.pattern(validation.pattern, validation.message));
    }
    
    if (validation.custom) {
      validators.push(builtinValidators.custom(validation.custom, validation.message));
    }
    
    // Выполняем валидацию
    for (const validator of validators) {
      try {
        const result = await validator.validate(value, formData, fieldSchema.name);
        
        if (result !== true) {
          errors.push({
            field: fieldSchema.name,
            message: typeof result === 'string' ? result : validator.message || 'Ошибка валидации',
            type: validator.type,
            value
          });
          break; // Останавливаемся на первой ошибке
        }
      } catch (error: any) {
        errors.push({
          field: fieldSchema.name,
          message: error.message || 'Ошибка валидации',
          type: 'error',
          value
        });
        break;
      }
    }
    
    return errors;
  }

  /**
   * Валидация с внешними валидаторами
   */
  private async validateWithExternalValidators(
    fieldSchema: FieldSchema,
    value: any,
    formData: Record<string, any>,
    _context: ValidationContext
  ): Promise<ValidationError[]> {
    const externalValidation = fieldSchema.externalValidation;
    if (!externalValidation) return [];
    
    const errors: ValidationError[] = [];
    
    // Yup валидация
    if (externalValidation.yup) {
      const adapter = getValidatorAdapter('yup');
      if (adapter) {
        try {
          const yupErrors = await adapter.validate(externalValidation.yup, value, formData);
          errors.push(...yupErrors);
        } catch (error) {
          // Ошибки уже обработаны в адаптере
        }
      }
    }
    
    // Zod валидация
    if (externalValidation.zod) {
      const adapter = getValidatorAdapter('zod');
      if (adapter) {
        try {
          const zodErrors = await adapter.validate(externalValidation.zod, value, formData);
          errors.push(...zodErrors);
        } catch (error) {
          // Ошибки уже обработаны в адаптере
        }
      }
    }
    
    // VeeValidate валидация
    if (externalValidation.veeValidate) {
      const adapter = getValidatorAdapter('vee-validate');
      if (adapter) {
        try {
          const veeErrors = await adapter.validate(externalValidation.veeValidate, value, formData);
          errors.push(...veeErrors);
        } catch (error) {
          // Ошибки уже обработаны в адаптере
        }
      }
    }
    
    // Кастомная валидация
    if (externalValidation.custom) {
      try {
        const result = await externalValidation.custom(value, formData);
        if (result !== true) {
          errors.push({
            field: fieldSchema.name,
            message: typeof result === 'string' ? result : 'Кастомная валидация не прошла',
            type: 'custom',
            value
          });
        }
      } catch (error: any) {
        errors.push({
          field: fieldSchema.name,
          message: error.message || 'Ошибка кастомной валидации',
          type: 'custom-error',
          value
        });
      }
    }
    
    return errors;
  }

  /**
   * Отменяет валидацию поля
   */
  cancelFieldValidation(fieldName: string): void {
    const controller = this.abortControllers.get(fieldName);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(fieldName);
    }
    
    const timer = this.debounceTimers.get(fieldName);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(fieldName);
    }
  }

  /**
   * Валидация с debounce
   */
  validateFieldDebounced(
    fieldSchema: FieldSchema,
    value: any,
    formData: Record<string, any>,
    delay: number = 300
  ): Promise<AsyncValidationResult> {
    return new Promise((resolve) => {
      const fieldName = fieldSchema.name;
      
      // Отменяем предыдущий таймер
      const existingTimer = this.debounceTimers.get(fieldName);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      
      // Устанавливаем новый таймер
      const timer = setTimeout(() => {
        this.debounceTimers.delete(fieldName);
        this.validateField(fieldSchema, value, formData).then(resolve);
      }, delay);
      
      this.debounceTimers.set(fieldName, timer);
    });
  }

  /**
   * Очистка ресурсов
   */
  dispose(): void {
    // Отменяем все активные валидации
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
    this.abortControllers.clear();
    
    // Очищаем таймеры
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    
    // Очищаем кеш
    this.validationCache.clear();
  }
}