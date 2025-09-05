<template>
  <div
    v-if="fieldData.isVisible.value"
    :class="wrapperClasses"
  >
    <!-- Слот для кастомного лейбла -->
    <slot name="label" :field="fieldData.fieldSchema" :required="fieldData.isRequired.value">
      <label
        v-if="fieldData.fieldSchema.label"
        :for="fieldData.inputAttrs.id"
        :class="labelClasses"
      >
        {{ fieldData.fieldSchema.label }}
        <span v-if="fieldData.isRequired.value" class="field-required">*</span>
      </label>
    </slot>

    <!-- Слот для описания -->
    <slot name="description" :field="fieldData.fieldSchema">
      <div
        v-if="fieldData.fieldSchema.description"
        class="field-description"
      >
        {{ fieldData.fieldSchema.description }}
      </div>
    </slot>

    <!-- Контейнер для поля с префиксом/суффиксом -->
    <div class="field-input-wrapper">
      <!-- Слот для префикса -->
      <slot name="prefix" :field="fieldData.fieldSchema">
        <div
          v-if="fieldData.fieldSchema.slots?.prefix"
          class="field-prefix"
          v-html="fieldData.fieldSchema.slots.prefix"
        />
      </slot>

      <!-- Основное поле ввода -->
      <slot name="input" :field="fieldData" :attrs="fieldData.inputAttrs" :classes="fieldData.inputClasses">
        <input
          v-bind="fieldData.inputAttrs"
          :class="[fieldData.inputClasses, 'field-input']"
          @input="fieldData.handleInput"
          @change="fieldData.handleChange"
          @focus="fieldData.handleFocus"
          @blur="fieldData.handleBlur"
        />
      </slot>

      <!-- Слот для суффикса -->
      <slot name="suffix" :field="fieldData.fieldSchema">
        <div
          v-if="fieldData.fieldSchema.slots?.suffix"
          class="field-suffix"
          v-html="fieldData.fieldSchema.slots.suffix"
        />
      </slot>

      <!-- Индикатор валидации -->
      <div
        v-if="fieldData.isValidating.value"
        class="field-validating"
      >
        <slot name="validating">
          <span class="validation-spinner">⟳</span>
        </slot>
      </div>
    </div>

    <!-- Слот для справочной информации -->
    <slot name="help" :field="fieldData.fieldSchema">
      <div
        v-if="fieldData.fieldSchema.slots?.help"
        class="field-help"
        v-html="fieldData.fieldSchema.slots.help"
      />
    </slot>

    <!-- Слот для ошибок -->
    <slot name="error" :field="fieldData" :error="fieldData.fieldState.error">
      <div
        v-if="fieldData.hasError.value"
        :id="`field-${fieldData.fieldSchema.name}-error`"
        :class="errorClasses"
      >
        {{ fieldData.fieldState.error }}
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import type { useDynamicField } from '@/composables';

interface Props {
  fieldData: ReturnType<typeof useDynamicField>;
}

const props = defineProps<Props>();

// CSS классы
const wrapperClasses = computed(() => {
  const classes = ['dynamic-field', `field-type-${props.fieldData.fieldSchema.type}`];
  
  if (props.fieldData.fieldSchema.wrapperClass) {
    classes.push(props.fieldData.fieldSchema.wrapperClass);
  }
  
  if (props.fieldData.hasError.value) {
    classes.push('field-error');
  }
  
  if (props.fieldData.isDisabled.value) {
    classes.push('field-disabled');
  }
  
  if (props.fieldData.fieldState.touched) {
    classes.push('field-touched');
  }
  
  if (props.fieldData.fieldState.dirty) {
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
</script>

<style scoped>
.dynamic-field {
  margin-bottom: 1rem;
}

.field-label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.field-required {
  color: #dc3545;
}

.field-description {
  margin-bottom: 0.5rem;
  color: #6c757d;
  font-size: 0.875rem;
}

.field-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field-input {
  flex: 1;
  padding: 0.375rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  font-size: 1rem;
  line-height: 1.5;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.field-input:focus {
  outline: 0;
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.field-input:disabled,
.field-input[readonly] {
  background-color: #e9ecef;
  opacity: 1;
}

.field-prefix,
.field-suffix {
  padding: 0.375rem 0.75rem;
  margin-bottom: 0;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #6c757d;
  text-align: center;
  white-space: nowrap;
  background-color: #e9ecef;
  border: 1px solid #dee2e6;
}

.field-prefix {
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
  border-right: 0;
}

.field-suffix {
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  border-left: 0;
}

.field-validating {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
}

.validation-spinner {
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
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.field-error-message {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #dc3545;
}

.field-error .field-input {
  border-color: #dc3545;
}

.field-error .field-input:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

.field-disabled {
  opacity: 0.65;
}
</style>