<template>
  <div
    v-if="fieldData.isVisible.value"
    :class="wrapperClasses"
  >
    <!-- Лейбл -->
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

    <!-- Описание -->
    <slot name="description" :field="fieldData.fieldSchema">
      <div
        v-if="fieldData.fieldSchema.description"
        class="field-description"
      >
        {{ fieldData.fieldSchema.description }}
      </div>
    </slot>

    <!-- Контейнер для селекта -->
    <div class="field-input-wrapper">
      <!-- Основной селект -->
      <slot 
        name="input" 
        :field="fieldData" 
        :attrs="selectAttrs" 
        :classes="selectClasses"
        :options="fieldData.fieldOptions"
        :loading="fieldData.loadingOptions.value"
      >
        <select
          v-if="fieldData.fieldSchema.type === 'select'"
          v-bind="selectAttrs"
          :class="[selectClasses, 'field-select']"
          @change="handleSelectChange"
          @focus="fieldData.handleFocus"
          @blur="fieldData.handleBlur"
        >
          <option value="" v-if="!fieldData.isRequired.value">
            {{ fieldData.fieldSchema.attributes?.placeholder || 'Выберите значение' }}
          </option>
          <option
            v-for="option in (Array.isArray(fieldData.fieldOptions) ? fieldData.fieldOptions : [])"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
            :title="option.description"
          >
            {{ option.label }}
          </option>
        </select>
        
        <div
          v-else-if="fieldData.fieldSchema.type === 'multiselect'"
          class="multiselect-container"
        >
          <div 
            class="multiselect-input"
            :class="[selectClasses, 'field-multiselect']"
            @click="toggleDropdown"
          >
            <div class="selected-values">
              <span
                v-for="value in selectedValues"
                :key="value.value"
                class="selected-tag"
              >
                {{ value.label }}
                <button
                  type="button"
                  @click.stop="removeValue(value.value)"
                  class="tag-remove"
                >
                  ×
                </button>
              </span>
              <span
                v-if="selectedValues.length === 0"
                class="placeholder"
              >
                {{ fieldData.fieldSchema.attributes?.placeholder || 'Выберите значения' }}
              </span>
            </div>
            <div class="multiselect-arrow">▼</div>
          </div>
          
          <div
            v-show="dropdownOpen"
            class="multiselect-dropdown"
          >
            <label
              v-for="option in (Array.isArray(fieldData.fieldOptions) ? fieldData.fieldOptions : [])"
              :key="option.value"
              class="multiselect-option"
              :class="{ disabled: option.disabled }"
            >
              <input
                type="checkbox"
                :value="option.value"
                :checked="isSelected(option.value)"
                :disabled="option.disabled"
                @change="handleMultiselectChange(option.value, $event)"
              />
              <span>{{ option.label }}</span>
              <div v-if="option.description" class="option-description">
                {{ option.description }}
              </div>
            </label>
          </div>
        </div>
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
import { computed, ref, onMounted, onUnmounted } from 'vue';
import type { useDynamicField } from '@/composables';

interface Props {
  fieldData: ReturnType<typeof useDynamicField>;
}

const props = defineProps<Props>();

// Состояние для multiselect
const dropdownOpen = ref(false);

// Атрибуты для селекта
const selectAttrs = computed(() => {
  const attrs = { ...props.fieldData.inputAttrs.value };
  const { multiple, ...restAttrs } = attrs;
  return {
    ...restAttrs,
    multiple: props.fieldData.fieldSchema.type === 'multiselect'
  };
});

const selectClasses = computed(() => {
  return props.fieldData.inputClasses;
});

// Выбранные значения для multiselect
const selectedValues = computed(() => {
  if (props.fieldData.fieldSchema.type !== 'multiselect') return [];
  
  const values = props.fieldData.fieldValue.value || [];
  const options = Array.isArray(props.fieldData.fieldOptions) ? props.fieldData.fieldOptions : [];
  return options.filter(option => 
    values.includes(option.value)
  );
});

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

// Методы для обычного селекта
function handleSelectChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  props.fieldData.fieldValue.value = target.value;
}

// Методы для multiselect
function toggleDropdown() {
  if (!props.fieldData.isDisabled.value) {
    dropdownOpen.value = !dropdownOpen.value;
  }
}

function isSelected(value: any): boolean {
  const values = props.fieldData.fieldValue.value || [];
  return values.includes(value);
}

function handleMultiselectChange(value: any, event: Event) {
  const target = event.target as HTMLInputElement;
  const currentValues = props.fieldData.fieldValue.value || [];
  
  if (target.checked) {
    props.fieldData.fieldValue.value = [...currentValues, value];
  } else {
    props.fieldData.fieldValue.value = currentValues.filter((v: any) => v !== value);
  }
}

function removeValue(value: any) {
  const currentValues = props.fieldData.fieldValue.value || [];
  props.fieldData.fieldValue.value = currentValues.filter((v: any) => v !== value);
}

// Закрытие dropdown при клике снаружи
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement;
  const container = document.querySelector('.multiselect-container');
  
  if (container && !container.contains(target)) {
    dropdownOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
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
}

.field-select {
  width: 100%;
  padding: 0.375rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  font-size: 1rem;
  line-height: 1.5;
  background-color: #fff;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  appearance: none;
}

.field-select:focus {
  outline: 0;
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Multiselect */
.multiselect-container {
  position: relative;
}

.multiselect-input {
  display: flex;
  align-items: center;
  min-height: 2.5rem;
  padding: 0.375rem 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background-color: #fff;
  cursor: pointer;
}

.multiselect-input:focus-within {
  outline: 0;
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.selected-values {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background-color: #e9ecef;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  gap: 0.25rem;
}

.tag-remove {
  border: none;
  background: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
}

.tag-remove:hover {
  color: #dc3545;
}

.placeholder {
  color: #6c757d;
}

.multiselect-arrow {
  color: #6c757d;
  transition: transform 0.2s;
}

.multiselect-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  margin-top: 0.25rem;
}

.multiselect-option {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  gap: 0.5rem;
  transition: background-color 0.15s;
}

.multiselect-option:hover:not(.disabled) {
  background-color: #f8f9fa;
}

.multiselect-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-description {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.field-loading,
.field-validating {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.loading-spinner,
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

.field-error .field-select,
.field-error .multiselect-input {
  border-color: #dc3545;
}

.field-error .field-select:focus,
.field-error .multiselect-input:focus-within {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

.field-disabled {
  opacity: 0.65;
  pointer-events: none;
}
</style>