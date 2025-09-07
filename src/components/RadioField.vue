<template>
  <div
    v-if="fieldData.isVisible.value"
    :class="wrapperClasses"
  >
    <!-- Лейбл группы -->
    <slot name="label" :field="fieldData.fieldSchema" :required="fieldData.isRequired.value">
      <fieldset class="radio-fieldset">
        <legend
          v-if="fieldData.fieldSchema.label"
          :class="labelClasses"
        >
          {{ fieldData.fieldSchema.label }}
          <span v-if="fieldData.isRequired.value" class="field-required">*</span>
        </legend>

        <!-- Описание -->
        <slot name="description" :field="fieldData.fieldSchema">
          <div
            v-if="fieldData.fieldSchema.description"
            class="field-description"
          >
            {{ fieldData.fieldSchema.description }}
          </div>
        </slot>

        <!-- Радио кнопки -->
        <div class="radio-group">
          <slot 
            name="input" 
            :field="fieldData" 
            :options="fieldData.fieldOptions"
            :loading="fieldData.loadingOptions.value"
          >
            <label
              v-for="option in fieldData.fieldOptions.value"
              :key="option.value"
              class="radio-option"
              :class="{ disabled: option.disabled || fieldData.isDisabled.value }"
            >
              <input
                type="radio"
                :name="fieldData.fieldSchema.name"
                :value="option.value"
                :checked="fieldData.fieldValue.value === option.value"
                :disabled="option.disabled || fieldData.isDisabled.value"
                :required="fieldData.isRequired.value"
                class="radio-input"
                @change="handleRadioChange"
                @focus="fieldData.handleFocus"
                @blur="fieldData.handleBlur"
              />
              <span class="radio-label">{{ option.label }}</span>
              <div
                v-if="option.description"
                class="option-description"
              >
                {{ option.description }}
              </div>
            </label>
          </slot>

          <!-- Индикатор загрузки -->
          <div
            v-if="fieldData.loadingOptions.value"
            class="field-loading"
          >
            <slot name="loading">
              <span class="loading-spinner">⟳</span>
            </slot>
          </div>
        </div>
      </fieldset>
    </slot>

    <!-- Справочная информация -->
    <slot name="help" :field="fieldData.fieldSchema">
      <div
        v-if="fieldData.fieldSchema.slots?.help"
        class="field-help"
        v-html="fieldData.fieldSchema.slots.help"
      />
    </slot>

    <!-- Ошибки -->
    <slot name="error" :field="fieldData" :error="fieldData.fieldState.value.error">
      <div
        v-if="fieldData.hasError.value"
        :id="`field-${fieldData.fieldSchema.name}-error`"
        :class="errorClasses"
      >
        {{ fieldData.fieldState.value.error }}
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { useDynamicField } from '@/composables';

interface Props {
  fieldData: ReturnType<typeof useDynamicField>;
}

const props = defineProps<Props>();

// CSS классы
const wrapperClasses = computed(() => {
  const classes = ['dynamic-field', 'field-type-radio'];
  
  if (props.fieldData.fieldSchema.wrapperClass) {
    classes.push(props.fieldData.fieldSchema.wrapperClass);
  }
  
  if (props.fieldData.hasError.value) {
    classes.push('field-error');
  }
  
  if (props.fieldData.isDisabled.value) {
    classes.push('field-disabled');
  }
  
  return classes.join(' ');
});

const labelClasses = computed(() => {
  const classes = ['field-label'];
  
  if (props.fieldData.fieldSchema.labelClass) {
    classes.push(props.fieldData.fieldSchema.labelClass);
  }
  
  return classes.join(' ');
});

const errorClasses = computed(() => {
  const classes = ['field-error-message'];
  
  if (props.fieldData.fieldSchema.errorClass) {
    classes.push(props.fieldData.fieldSchema.errorClass);
  }
  
  return classes.join(' ');
});

// Обработчик изменения радио
function handleRadioChange(event: Event) {
  const target = event.target as HTMLInputElement;
  props.fieldData.fieldValue.value = target.value;
}
</script>

<style scoped>
.dynamic-field {
  margin-bottom: 1rem;
}

.radio-fieldset {
  border: none;
  padding: 0;
  margin: 0;
  min-width: 0;
}

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
}

.field-required {
  color: #dc3545;
}

.field-description {
  margin-bottom: 0.75rem;
  color: #6c757d;
  font-size: 0.875rem;
}

.radio-group {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-option {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.radio-option:hover:not(.disabled) {
  background-color: #f8f9fa;
}

.radio-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.radio-input {
  margin: 0;
  width: 1rem;
  height: 1rem;
  accent-color: #0d6efd;
  cursor: pointer;
}

.radio-input:disabled {
  cursor: not-allowed;
}

.radio-label {
  flex: 1;
  font-size: 1rem;
  line-height: 1.5;
  cursor: pointer;
}

.disabled .radio-label {
  cursor: not-allowed;
}

.option-description {
  flex: 1;
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.25rem;
  line-height: 1.4;
}

.field-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: #6c757d;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.field-help {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.field-error-message {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #dc3545;
}

.field-error .radio-option {
  border-color: #dc3545;
}

.field-disabled {
  opacity: 0.65;
}

/* Кастомные стили для радио кнопок */
.radio-input {
  position: relative;
}

.radio-input::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid #dee2e6;
  border-radius: 50%;
  background-color: #fff;
  transform: translate(-50%, -50%);
  transition: all 0.15s ease-in-out;
}

.radio-input:checked::before {
  border-color: #0d6efd;
  background-color: #0d6efd;
}

.radio-input:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.375rem;
  height: 0.375rem;
  background-color: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.radio-input:focus::before {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.radio-input:disabled::before {
  background-color: #e9ecef;
  border-color: #dee2e6;
}
</style>