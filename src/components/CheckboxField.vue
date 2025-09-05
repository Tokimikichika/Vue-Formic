<template>
  <div
    v-if="fieldData.isVisible.value"
    :class="wrapperClasses"
  >
    <slot name="input" :field="fieldData" :attrs="checkboxAttrs" :classes="checkboxClasses">
      <label class="checkbox-container">
        <input
          v-bind="checkboxAttrs"
          :class="[checkboxClasses, 'checkbox-input']"
          @change="handleCheckboxChange"
          @focus="fieldData.handleFocus"
          @blur="fieldData.handleBlur"
        />
        
        <span class="checkbox-checkmark"></span>
        
        <div class="checkbox-content">
          <!-- Лейбл -->
          <slot name="label" :field="fieldData.fieldSchema" :required="fieldData.isRequired.value">
            <span
              v-if="fieldData.fieldSchema.label"
              :class="labelClasses"
            >
              {{ fieldData.fieldSchema.label }}
              <span v-if="fieldData.isRequired.value" class="field-required">*</span>
            </span>
          </slot>

          <!-- Описание -->
          <slot name="description" :field="fieldData.fieldSchema">
            <div
              v-if="fieldData.fieldSchema.description"
              class="field-description"
            >
              {{ fieldData.fieldSchema.description }}
            </div>
          </slot>
        </div>
      </label>
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

// Атрибуты для чекбокса
const checkboxAttrs = computed(() => {
  const attrs = { ...props.fieldData.inputAttrs };
  return {
    ...attrs,
    type: 'checkbox',
    checked: !!props.fieldData.fieldValue.value
  };
});

const checkboxClasses = computed(() => {
  return props.fieldData.inputClasses;
});

// CSS классы
const wrapperClasses = computed(() => {
  const classes = ['dynamic-field', 'field-type-checkbox'];
  
  if (props.fieldData.fieldSchema.wrapperClass) {
    classes.push(props.fieldData.fieldSchema.wrapperClass);
  }
  
  if (props.fieldData.hasError.value) {
    classes.push('field-error');
  }
  
  if (props.fieldData.isDisabled.value) {
    classes.push('field-disabled');
  }
  
  if (props.fieldData.fieldState.value.touched) {
    classes.push('field-touched');
  }
  
  if (props.fieldData.fieldState.value.dirty) {
    classes.push('field-dirty');
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

// Обработчик изменения чекбокса
function handleCheckboxChange(event: Event) {
  const target = event.target as HTMLInputElement;
  props.fieldData.fieldValue.value = target.checked;
}
</script>

<style scoped>
.dynamic-field {
  margin-bottom: 1rem;
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 0;
  position: relative;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 1.25rem;
  height: 1.25rem;
  margin: 0;
}

.checkbox-checkmark {
  position: relative;
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #dee2e6;
  border-radius: 0.25rem;
  background-color: #fff;
  transition: all 0.15s ease-in-out;
  flex-shrink: 0;
}

.checkbox-checkmark::after {
  content: '';
  position: absolute;
  display: none;
  left: 0.375rem;
  top: 0.1875rem;
  width: 0.3125rem;
  height: 0.625rem;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-input:checked + .checkbox-checkmark {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.checkbox-input:checked + .checkbox-checkmark::after {
  display: block;
}

.checkbox-input:focus + .checkbox-checkmark {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.checkbox-input:disabled + .checkbox-checkmark {
  background-color: #e9ecef;
  border-color: #dee2e6;
  opacity: 0.5;
}

.checkbox-container:hover:not(.field-disabled) .checkbox-checkmark {
  border-color: #86b7fe;
}

.checkbox-content {
  flex: 1;
  min-width: 0;
}

.field-label {
  display: block;
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.5;
  color: #212529;
  margin-bottom: 0.25rem;
}

.field-required {
  color: #dc3545;
}

.field-description {
  margin-top: 0.25rem;
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.4;
}

.field-help {
  margin-top: 0.5rem;
  margin-left: 2rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.field-error-message {
  margin-top: 0.5rem;
  margin-left: 2rem;
  font-size: 0.875rem;
  color: #dc3545;
}

.field-error .checkbox-checkmark {
  border-color: #dc3545;
}

.field-error .checkbox-input:focus + .checkbox-checkmark {
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

.field-disabled {
  opacity: 0.65;
}

.field-disabled .checkbox-container {
  cursor: not-allowed;
}

/* Switch вариант для type="switch" */
.field-type-switch .checkbox-checkmark {
  width: 2.5rem;
  height: 1.25rem;
  border-radius: 1.25rem;
  background-color: #6c757d;
  border: none;
  position: relative;
  transition: background-color 0.15s ease-in-out;
}

.field-type-switch .checkbox-checkmark::after {
  content: '';
  position: absolute;
  display: block;
  width: 1rem;
  height: 1rem;
  background-color: #fff;
  border-radius: 50%;
  top: 0.125rem;
  left: 0.125rem;
  transition: transform 0.15s ease-in-out;
  border: none;
  transform: none;
}

.field-type-switch .checkbox-input:checked + .checkbox-checkmark {
  background-color: #0d6efd;
}

.field-type-switch .checkbox-input:checked + .checkbox-checkmark::after {
  transform: translateX(1.25rem);
}

.field-type-switch .checkbox-input:focus + .checkbox-checkmark {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.field-type-switch .checkbox-input:disabled + .checkbox-checkmark {
  background-color: #e9ecef;
  opacity: 0.5;
}
</style>