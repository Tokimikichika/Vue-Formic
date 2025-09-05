import { ref, computed, watch, reactive, readonly } from 'vue';
import type { 
  FormSchema, 
  FormState, 
  FormEvents,
  ValidationResult
} from '@/types';
import { ValidationEngine } from '@/validators';
import { ConditionsEngine } from '@/utils/conditions';
import { useDynamicField } from './useDynamicField';

export interface UseDynamicFormOptions {
  schema: FormSchema;
  initialData?: Record<string, any>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  resetOnSubmit?: boolean;
  debounceValidation?: number;
}

export interface UseDynamicFormEvents extends Partial<FormEvents> {}

export function useDynamicForm(
  options: UseDynamicFormOptions,
  events?: UseDynamicFormEvents
) {
  const {
    schema,
    initialData = {},
    validateOnChange = schema.config?.validateOnChange ?? true,
    validateOnBlur = schema.config?.validateOnBlur ?? true,
    validateOnSubmit = schema.config?.validateOnSubmit ?? true,
    resetOnSubmit = schema.config?.resetOnSubmit ?? false,
    debounceValidation = 300
  } = options;

  // Инициализируем движки
  const validationEngine = new ValidationEngine();
  const conditionsEngine = new ConditionsEngine(initialData);

  // Данные формы
  const formData = ref<Record<string, any>>({});
  
  // Состояние формы
  const formState = reactive<FormState>({
    values: {},
    errors: {},
    touched: {},
    dirty: {},
    isSubmitting: false,
    isValidating: false,
    isValid: true,
    isDirty: false,
    submitCount: 0,
    fields: {}
  });

  // Поля формы
  const fieldComposables = new Map<string, ReturnType<typeof useDynamicField>>();

  // Инициализация полей
  function initializeFields() {
    // Устанавливаем начальные значения
    const initialValues: Record<string, any> = {};
    
    schema.fields.forEach(fieldSchema => {
      const initialValue = initialData[fieldSchema.name] ?? fieldSchema.defaultValue ?? getDefaultValueForType(fieldSchema.type);
      initialValues[fieldSchema.name] = initialValue;
      
      // Создаем composable для поля
      const fieldComposable = useDynamicField(fieldSchema, {
        formData,
        validationEngine,
        conditionsEngine,
        validateOnChange,
        validateOnBlur,
        debounceValidation
      });
      
      fieldComposables.set(fieldSchema.name, fieldComposable);
      
      // Инициализируем состояние поля в форме
      formState.fields[fieldSchema.name] = {
        value: initialValue,
        error: null,
        touched: false,
        dirty: false,
        validating: false,
        valid: true,
        visible: true,
        disabled: false,
        required: fieldSchema.validation?.required ?? false
      };
    });
    
    formData.value = { ...initialValues };
    formState.values = { ...initialValues };
    
    // Обновляем движок условий
    conditionsEngine.updateFormData(formData.value);
  }

  // Получение значений по умолчанию для разных типов полей
  function getDefaultValueForType(fieldType: string): any {
    switch (fieldType) {
      case 'checkbox':
        return false;
      case 'number':
      case 'range':
        return 0;
      case 'multiselect':
        return [];
      case 'file':
        return null;
      default:
        return '';
    }
  }

  // Вычисляемые свойства
  const visibleFields = computed(() => {
    return schema.fields.filter(field => {
      const fieldComposable = fieldComposables.get(field.name);
      return fieldComposable?.isVisible.value ?? true;
    });
  });

  const isFormValid = computed(() => {
    return Object.values(formState.errors).every(error => !error);
  });

  const isFormDirty = computed(() => {
    return Object.values(formState.dirty).some(dirty => dirty);
  });

  const fieldErrors = computed(() => {
    return Object.entries(formState.errors)
      .filter(([, error]) => error)
      .map(([field, message]) => ({
        field,
        message: message!,
        type: 'validation',
        value: formData.value[field]
      }));
  });

  // Слежение за изменениями данных формы
  watch(formData, (newData) => {
    formState.values = { ...newData };
    conditionsEngine.updateFormData(newData);
    
    // Обновляем состояние dirty для каждого поля
    Object.keys(newData).forEach(fieldName => {
      const initialValue = initialData[fieldName] ?? schema.fields.find(f => f.name === fieldName)?.defaultValue;
      formState.dirty[fieldName] = newData[fieldName] !== initialValue;
    });
    
    formState.isDirty = isFormDirty.value;
    
    // Вызываем событие изменения
    if (events?.change) {
      const changedField = Object.keys(newData).find(key => 
        newData[key] !== formState.values[key]
      );
      if (changedField) {
        events.change(changedField, newData[changedField], newData);
      }
    }
  }, { deep: true });

  // Валидация формы
  async function validateForm(): Promise<ValidationResult> {
    formState.isValidating = true;
    
    try {
      const result = await validationEngine.validateForm(schema.fields, formData.value);
      
      // Обновляем состояние ошибок
      formState.errors = { ...result.errors };
      formState.isValid = result.isValid;
      
      // Обновляем состояние полей
      Object.keys(formState.fields).forEach(fieldName => {
        formState.fields[fieldName].error = result.errors[fieldName] || null;
        formState.fields[fieldName].valid = !result.errors[fieldName];
      });
      
      if (events?.validate) {
        events.validate(result.errors);
      }
      
      return result;
    } finally {
      formState.isValidating = false;
    }
  }

  // Валидация отдельного поля
  async function validateField(fieldName: string): Promise<boolean> {
    const fieldComposable = fieldComposables.get(fieldName);
    if (!fieldComposable) return false;
    
    const result = await fieldComposable.validateField();
    
    // Обновляем состояние поля в форме
    formState.errors[fieldName] = result.error || '';
    formState.fields[fieldName].error = result.error || null;
    formState.fields[fieldName].valid = result.isValid;
    formState.fields[fieldName].validating = result.pending || false;
    
    return result.isValid;
  }

  // Отправка формы
  async function submitForm(): Promise<void> {
    if (formState.isSubmitting) return;
    
    formState.isSubmitting = true;
    formState.submitCount++;
    
    try {
      // Отмечаем все поля как touched
      Object.keys(formState.fields).forEach(fieldName => {
        formState.touched[fieldName] = true;
        formState.fields[fieldName].touched = true;
      });
      
      // Валидация перед отправкой
      let isValid = true;
      if (validateOnSubmit) {
        const validationResult = await validateForm();
        isValid = validationResult.isValid;
      }
      
      // Вызываем событие отправки
      if (events?.submit) {
        await events.submit(formData.value, isValid);
      }
      
      // Сбрасываем форму если нужно
      if (resetOnSubmit && isValid) {
        resetForm();
      }
    } finally {
      formState.isSubmitting = false;
    }
  }

  // Сброс формы
  function resetForm(): void {
    // Сбрасываем все поля
    fieldComposables.forEach(fieldComposable => {
      fieldComposable.resetField();
    });
    
    // Сбрасываем состояние формы
    formState.errors = {};
    formState.touched = {};
    formState.dirty = {};
    formState.isDirty = false;
    formState.isValid = true;
    formState.submitCount = 0;
    
    // Сбрасываем состояние полей
    Object.keys(formState.fields).forEach(fieldName => {
      const field = schema.fields.find(f => f.name === fieldName);
      const defaultValue = field?.defaultValue ?? getDefaultValueForType(field?.type || 'text');
      
      formState.fields[fieldName] = {
        value: defaultValue,
        error: null,
        touched: false,
        dirty: false,
        validating: false,
        valid: true,
        visible: true,
        disabled: false,
        required: field?.validation?.required ?? false
      };
    });
    
    if (events?.reset) {
      events.reset();
    }
  }

  // Установка значений формы
  function setFormValues(values: Record<string, any>): void {
    Object.entries(values).forEach(([fieldName, value]) => {
      const fieldComposable = fieldComposables.get(fieldName);
      if (fieldComposable) {
        fieldComposable.setValue(value);
      }
    });
  }

  // Установка ошибок формы
  function setFormErrors(errors: Record<string, string>): void {
    Object.entries(errors).forEach(([fieldName, error]) => {
      const fieldComposable = fieldComposables.get(fieldName);
      if (fieldComposable) {
        fieldComposable.setError(error);
      }
      
      formState.errors[fieldName] = error;
      if (formState.fields[fieldName]) {
        formState.fields[fieldName].error = error;
        formState.fields[fieldName].valid = !error;
      }
    });
    
    formState.isValid = isFormValid.value;
  }

  // Очистка ошибок формы
  function clearFormErrors(): void {
    fieldComposables.forEach(fieldComposable => {
      fieldComposable.clearError();
    });
    
    formState.errors = {};
    Object.keys(formState.fields).forEach(fieldName => {
      formState.fields[fieldName].error = null;
      formState.fields[fieldName].valid = true;
    });
    
    formState.isValid = true;
  }

  // Получение данных поля
  function getFieldData(fieldName: string) {
    return fieldComposables.get(fieldName);
  }

  // Получение всех данных полей
  function getAllFieldsData() {
    const fieldsData: Record<string, ReturnType<typeof useDynamicField>> = {};
    fieldComposables.forEach((fieldComposable, fieldName) => {
      fieldsData[fieldName] = fieldComposable;
    });
    return fieldsData;
  }

  // Обработчики событий полей
  function handleFieldFocus(fieldName: string) {
    if (events?.focus) {
      events.focus(fieldName, formData.value[fieldName]);
    }
  }

  function handleFieldBlur(fieldName: string) {
    formState.touched[fieldName] = true;
    if (formState.fields[fieldName]) {
      formState.fields[fieldName].touched = true;
    }
    
    if (events?.blur) {
      events.blur(fieldName, formData.value[fieldName]);
    }
  }

  // Очистка ресурсов
  function dispose(): void {
    validationEngine.dispose();
  }

  // Инициализация
  initializeFields();

  return {
    // Данные
    formData: readonly(formData),
    formState: readonly(formState),
    schema: readonly(schema),
    
    // Поля
    fields: getAllFieldsData(),
    visibleFields,
    
    // Состояние
    isFormValid,
    isFormDirty,
    fieldErrors,
    
    // Методы валидации
    validateForm,
    validateField,
    
    // Методы управления формой
    submitForm,
    resetForm,
    setFormValues,
    setFormErrors,
    clearFormErrors,
    
    // Получение данных
    getFieldData,
    getAllFieldsData,
    
    // Обработчики событий
    handleFieldFocus,
    handleFieldBlur,
    
    // Движки
    validationEngine,
    conditionsEngine,
    
    // Очистка
    dispose
  };
}