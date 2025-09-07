import { ref, computed, watch, readonly, type Ref } from 'vue';
import type { 
  FieldSchema, 
  FieldState, 
  FieldOption,
  AsyncValidationResult 
} from '@/types';
import { ValidationEngine } from '@/validators';
import { ConditionsEngine, evaluateFieldLogic } from '@/utils/conditions';

export interface UseDynamicFieldOptions {
  formData: Ref<Record<string, any>>;
  validationEngine: ValidationEngine;
  conditionsEngine: ConditionsEngine;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceValidation?: number;
}

export function useDynamicField(
  fieldSchema: FieldSchema,
  options: UseDynamicFieldOptions
) {
  const {
    formData,
    validationEngine,
    conditionsEngine,
    validateOnChange = true,
    validateOnBlur = true,
    debounceValidation = 300
  } = options;

  // Состояние поля
  const fieldState = ref<FieldState>({
    value: fieldSchema.defaultValue ?? '',
    error: null,
    touched: false,
    dirty: false,
    validating: false,
    valid: true,
    visible: true,
    disabled: false,
    required: fieldSchema.validation?.required ?? false
  });

  // Опции для селектов/радио
  const fieldOptions = ref<FieldOption[]>([]);
  const loadingOptions = ref(false);

  // Вычисляемые свойства
  const fieldValue = computed({
    get: () => fieldState.value.value,
    set: (newValue) => {
      fieldState.value.value = newValue;
      fieldState.value.dirty = true;
      
      // Обновляем данные формы
      formData.value[fieldSchema.name] = newValue;
      
      if (validateOnChange) {
        validateField();
      }
    }
  });

  const isVisible = computed(() => fieldState.value.visible);
  const isDisabled = computed(() => fieldState.value.disabled || fieldSchema.attributes?.disabled);
  const isRequired = computed(() => fieldState.value.required);
  const hasError = computed(() => !!fieldState.value.error);
  const isValidating = computed(() => fieldState.value.validating);

  // Вычисляем состояние поля на основе условий
  const conditionalState = computed(() => {
    if (fieldSchema.conditions) {
      return evaluateFieldLogic(fieldSchema.conditions, formData.value);
    }
    return {
      visible: true,
      required: fieldSchema.validation?.required ?? false,
      disabled: fieldSchema.attributes?.disabled ?? false
    };
  });

  // Обновляем состояние поля при изменении условий
  watch(conditionalState, (newState) => {
    fieldState.value.visible = newState.visible;
    fieldState.value.required = newState.required;
    fieldState.value.disabled = newState.disabled;
  }, { immediate: true });

  // Валидация поля
  async function validateField(): Promise<AsyncValidationResult> {
    fieldState.value.validating = true;
    
    try {
      let result: AsyncValidationResult;
      
      if (debounceValidation > 0) {
        result = await validationEngine.validateFieldDebounced(
          fieldSchema,
          fieldState.value.value,
          formData.value,
          debounceValidation
        );
      } else {
        result = await validationEngine.validateField(
          fieldSchema,
          fieldState.value.value,
          formData.value
        );
      }
      
      fieldState.value.error = result.error || null;
      fieldState.value.valid = result.isValid;
      
      return result;
    } finally {
      fieldState.value.validating = false;
    }
  }

  // Обработчики событий
  function handleFocus() {
    // Событие фокуса
  }

  function handleBlur() {
    fieldState.value.touched = true;
    
    if (validateOnBlur) {
      validateField();
    }
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    let value: any = target.value;
    
    // Обработка разных типов полей
    switch (fieldSchema.type) {
      case 'number':
        // Если поле пустое, оставляем пустую строку
        if (target.value === '') {
          value = '';
        } else {
          const numValue = target.valueAsNumber;
          // Если значение не число (NaN), оставляем как строку для валидации
          value = isNaN(numValue) ? target.value : numValue;
        }
        break;
      case 'checkbox':
        value = (target as HTMLInputElement).checked;
        break;
      case 'date':
      case 'datetime-local':
        value = target.valueAsDate || target.value;
        break;
      case 'file':
        value = (target as HTMLInputElement).files;
        break;
      default:
        value = target.value;
    }
    
    fieldValue.value = value;
  }

  function handleChange(event: Event) {
    handleInput(event);
  }

  // Загрузка опций для селектов
  async function loadOptions() {
    
    if (Array.isArray(fieldSchema.options)) {
      fieldOptions.value = fieldSchema.options;
      return;
    }
    
    if (typeof fieldSchema.options === 'function') {
      loadingOptions.value = true;
      try {
        fieldOptions.value = await fieldSchema.options();
      } catch (error) {
        fieldOptions.value = [];
      } finally {
        loadingOptions.value = false;
      }
    }
  }

  // Сброс поля
  function resetField() {
    fieldState.value.value = fieldSchema.defaultValue ?? '';
    fieldState.value.error = null;
    fieldState.value.touched = false;
    fieldState.value.dirty = false;
    fieldState.value.validating = false;
    fieldState.value.valid = true;
    
    formData.value[fieldSchema.name] = fieldState.value.value;
  }

  // Установка значения
  function setValue(value: any) {
    fieldValue.value = value;
  }

  // Установка ошибки
  function setError(error: string | null) {
    fieldState.value.error = error;
    fieldState.value.valid = !error;
  }

  // Очистка ошибки
  function clearError() {
    setError(null);
  }

  // Атрибуты для привязки к input
  const inputAttrs = computed(() => {
    const attrs: Record<string, any> = {
      id: `field-${fieldSchema.name}`,
      name: fieldSchema.name,
      type: fieldSchema.type,
      value: fieldValue.value,
      required: isRequired.value,
      disabled: isDisabled.value,
      readonly: fieldSchema.attributes?.readonly,
      placeholder: fieldSchema.attributes?.placeholder,
      autocomplete: fieldSchema.attributes?.autocomplete,
      pattern: fieldSchema.attributes?.pattern,
      min: fieldSchema.attributes?.min,
      max: fieldSchema.attributes?.max,
      step: fieldSchema.attributes?.step,
      multiple: fieldSchema.attributes?.multiple,
      accept: fieldSchema.attributes?.accept,
      rows: fieldSchema.attributes?.rows,
      cols: fieldSchema.attributes?.cols,
      maxlength: fieldSchema.attributes?.maxlength,
      minlength: fieldSchema.attributes?.minlength,
      'aria-invalid': hasError.value ? 'true' : 'false',
      'aria-describedby': hasError.value ? `field-${fieldSchema.name}-error` : undefined
    };

    // Убираем undefined значения
    return Object.fromEntries(
      Object.entries(attrs).filter(([, value]) => value !== undefined)
    );
  });

  // Классы CSS
  const inputClasses = computed(() => {
    const classes: string[] = [];
    
    if (fieldSchema.fieldClass) {
      classes.push(fieldSchema.fieldClass);
    }
    
    if (hasError.value && fieldSchema.errorClass) {
      classes.push(fieldSchema.errorClass);
    }
    
    return classes.join(' ');
  });

  // Инициализация
  function initialize() {
    // Устанавливаем начальное значение в форме
    formData.value[fieldSchema.name] = fieldState.value.value;
    
    // Загружаем опции если нужно
    if (fieldSchema.options) {
      loadOptions();
    }
    
    // Регистрируем условия в движке
    if (fieldSchema.conditions) {
      conditionsEngine.registerFieldConditions(fieldSchema.name, fieldSchema.conditions);
    }
  }

  // Инициализируем поле
  initialize();

  return {
    // Состояние
    fieldState: readonly(fieldState),
    fieldValue,
    fieldOptions: readonly(fieldOptions),
    loadingOptions: readonly(loadingOptions),
    
    // Вычисляемые свойства
    isVisible,
    isDisabled,
    isRequired,
    hasError,
    isValidating,
    
    // Методы
    validateField,
    resetField,
    setValue,
    setError,
    clearError,
    loadOptions,
    
    // Обработчики событий
    handleFocus,
    handleBlur,
    handleInput,
    handleChange,
    
    // Атрибуты для привязки
    inputAttrs,
    inputClasses,
    
    // Схема поля
    fieldSchema: readonly(fieldSchema)
  };
}