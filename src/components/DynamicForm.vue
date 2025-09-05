<template>
  <form
    :class="formClasses"
    @submit.prevent="handleSubmit"
    @reset.prevent="handleReset"
  >
    <!-- Заголовок и описание формы -->
    <slot name="header" :schema="formHandler.schema" :state="formHandler.formState">
      <div v-if="schema.title || schema.description" class="form-header">
        <h2 v-if="schema.title" class="form-title">
          {{ schema.title }}
        </h2>
        <p v-if="schema.description" class="form-description">
          {{ schema.description }}
        </p>
      </div>
    </slot>

    <!-- Глобальные ошибки формы -->
    <slot name="errors" :errors="formHandler.fieldErrors.value" :state="formHandler.formState">
      <div
        v-if="showGlobalErrors && formHandler.fieldErrors.value.length > 0"
        class="form-errors"
      >
        <h4 class="form-errors-title">Ошибки валидации:</h4>
        <ul class="form-errors-list">
          <li
            v-for="error in formHandler.fieldErrors.value"
            :key="error.field"
            class="form-error-item"
          >
            <strong>{{ getFieldLabel(error.field) }}:</strong> {{ error.message }}
          </li>
        </ul>
      </div>
    </slot>

    <!-- Группы полей или обычные поля -->
    <div class="form-body">
      <template v-if="schema.groups && schema.groups.length > 0">
        <!-- Рендеринг групп полей -->
        <div
          v-for="group in visibleGroups"
          :key="group.name"
          class="form-group"
        >
          <slot
            name="group"
            :group="group"
            :fields="getGroupFields(group)"
            :schema="formHandler.schema"
            :state="formHandler.formState"
          >
            <fieldset class="form-fieldset">
              <!-- Заголовок группы -->
              <legend
                v-if="group.label"
                class="form-group-legend"
                @click="group.collapsible ? toggleGroup(group.name) : undefined"
                :class="{ collapsible: group.collapsible }"
              >
                {{ group.label }}
                <span
                  v-if="group.collapsible"
                  class="group-toggle"
                  :class="{ collapsed: isGroupCollapsed(group.name) }"
                >
                  ▼
                </span>
              </legend>

              <!-- Описание группы -->
              <div
                v-if="group.description"
                class="form-group-description"
              >
                {{ group.description }}
              </div>

              <!-- Поля группы -->
              <div
                v-show="!isGroupCollapsed(group.name)"
                class="form-group-fields"
                :class="layoutClasses"
              >
                <DynamicField
                  v-for="fieldName in group.fields"
                  :key="fieldName"
                  :fieldData="formHandler.getFieldData(fieldName)!"
                  :customComponents="customComponents"
                >
                  <!-- Проброс слотов для полей -->
                  <template
                    v-for="(slotInfo, index) in typedSlots"
                    :key="`group-slot-${index}`"
                    #[slotInfo.name]="slotProps"
                  >
                    <slot
                      v-if="slotInfo.name.startsWith('field-')"
                      :name="slotInfo.name"
                      v-bind="slotProps"
                    />
                  </template>
                </DynamicField>
              </div>
            </fieldset>
          </slot>
        </div>
      </template>

      <template v-else>
        <!-- Рендеринг полей без групп -->
        <div class="form-fields" :class="layoutClasses">
          <slot
            name="fields"
            :fields="formHandler.visibleFields.value"
            :schema="formHandler.schema"
            :state="formHandler.formState"
          >
            <DynamicField
              v-for="field in formHandler.visibleFields.value"
              :key="field.name"
              :fieldData="formHandler.getFieldData(field.name)!"
              :customComponents="customComponents"
            >
              <!-- Проброс слотов для полей -->
              <template
                v-for="(slotInfo, index) in typedSlots"
                :key="`field-slot-${index}`"
                #[slotInfo.name]="slotProps"
              >
                <slot
                  v-if="slotInfo.name.startsWith('field-')"
                  :name="slotInfo.name"
                  v-bind="slotProps"
                />
              </template>
            </DynamicField>
          </slot>
        </div>
      </template>
    </div>

    <!-- Кнопки действий формы -->
    <slot
      name="actions"
      :submit="handleSubmit"
      :reset="handleReset"
      :state="formHandler.formState"
      :isValid="formHandler.isFormValid.value"
      :isDirty="formHandler.isFormDirty.value"
    >
      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="formHandler.formState.isSubmitting || (!allowInvalidSubmit && !formHandler.isFormValid.value)"
        >
          <span
            v-if="formHandler.formState.isSubmitting"
            class="submit-spinner"
          >
            ⟳
          </span>
          {{ submitText }}
        </button>

        <button
          v-if="showResetButton"
          type="reset"
          class="btn btn-secondary"
          :disabled="formHandler.formState.isSubmitting"
        >
          {{ resetText }}
        </button>
      </div>
    </slot>

    <!-- Подвал формы -->
    <slot
      name="footer"
      :schema="formHandler.schema"
      :state="formHandler.formState"
      :values="formHandler.formData.value"
    />
  </form>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, useSlots, type Component } from 'vue';
import type { FormSchema } from '@/types';
import { useDynamicForm } from '@/composables';
import DynamicField from './DynamicField.vue';

interface Props {
  schema: FormSchema;
  initialData?: Record<string, any>;
  customComponents?: Record<string, Component>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  resetOnSubmit?: boolean;
  allowInvalidSubmit?: boolean;
  showGlobalErrors?: boolean;
  showResetButton?: boolean;
  submitText?: string;
  resetText?: string;
  debounceValidation?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({}),
  customComponents: () => ({}),
  allowInvalidSubmit: false,
  showGlobalErrors: true,
  showResetButton: true,
  submitText: 'Отправить',
  resetText: 'Сбросить',
  debounceValidation: 300
});

// Эмиты
const emit = defineEmits<{
  submit: [data: Record<string, any>, isValid: boolean];
  change: [fieldName: string, value: any, formData: Record<string, any>];
  blur: [fieldName: string, value: any];
  focus: [fieldName: string, value: any];
  reset: [];
  validate: [errors: Record<string, string>];
}>();

const slots = useSlots();

// Состояние групп (свернуты/развернуты)
const collapsedGroups = ref<Set<string>>(new Set());

// Типизированные слоты
const typedSlots = computed((): Array<{ name: string; slot: any }> => {
  return Object.keys(slots).map(name => ({ name, slot: slots[name] }));
});

// Инициализация формы
const formHandler = useDynamicForm(
  {
    schema: props.schema,
    initialData: props.initialData,
    validateOnChange: props.validateOnChange,
    validateOnBlur: props.validateOnBlur,
    validateOnSubmit: props.validateOnSubmit,
    resetOnSubmit: props.resetOnSubmit,
    debounceValidation: props.debounceValidation
  },
  {
    submit: (data, isValid) => emit('submit', data, isValid),
    change: (fieldName, value, formData) => emit('change', fieldName, value, formData),
    blur: (fieldName, value) => emit('blur', fieldName, value),
    focus: (fieldName, value) => emit('focus', fieldName, value),
    reset: () => emit('reset'),
    validate: (errors) => emit('validate', errors)
  }
);

// Инициализация свернутых групп
onMounted(() => {
  if (props.schema.groups) {
    props.schema.groups.forEach(group => {
      if (group.collapsed) {
        collapsedGroups.value.add(group.name);
      }
    });
  }
});

// Очистка при размонтировании
onUnmounted(() => {
  formHandler.dispose();
});

// Вычисляемые свойства
const formClasses = computed(() => {
  const classes = ['dynamic-form'];
  
  if (props.schema.layout) {
    classes.push(`form-layout-${props.schema.layout}`);
  }
  
  if (props.schema.config?.formClass) {
    classes.push(props.schema.config.formClass);
  }
  
  if (formHandler.formState.isSubmitting) {
    classes.push('form-submitting');
  }
  
  if (!formHandler.isFormValid.value) {
    classes.push('form-invalid');
  }
  
  if (formHandler.isFormDirty.value) {
    classes.push('form-dirty');
  }
  
  return classes.join(' ');
});

const layoutClasses = computed(() => {
  const classes = ['fields-container'];
  
  if (props.schema.layout) {
    classes.push(`layout-${props.schema.layout}`);
  }
  
  return classes.join(' ');
});

const visibleGroups = computed(() => {
  if (!props.schema.groups) return [];
  
  return props.schema.groups.filter(() => {
    // Здесь можно добавить логику условного отображения групп
    // Пока показываем все группы
    return true;
  });
});

// Методы
function handleSubmit() {
  formHandler.submitForm();
}

function handleReset() {
  formHandler.resetForm();
  collapsedGroups.value.clear();
  
  // Восстанавливаем изначально свернутые группы
  if (props.schema.groups) {
    props.schema.groups.forEach(group => {
      if (group.collapsed) {
        collapsedGroups.value.add(group.name);
      }
    });
  }
}

function getFieldLabel(fieldName: string): string {
  const field = props.schema.fields.find(f => f.name === fieldName);
  return field?.label || fieldName;
}

function getGroupFields(group: { fields: string[] }) {
  return group.fields
    .map(fieldName => props.schema.fields.find(f => f.name === fieldName))
    .filter(Boolean);
}

function toggleGroup(groupName: string) {
  if (collapsedGroups.value.has(groupName)) {
    collapsedGroups.value.delete(groupName);
  } else {
    collapsedGroups.value.add(groupName);
  }
}

function isGroupCollapsed(groupName: string): boolean {
  return collapsedGroups.value.has(groupName);
}

// Выставляем методы для внешнего доступа
defineExpose({
  formHandler,
  validateForm: formHandler.validateForm,
  validateField: formHandler.validateField,
  resetForm: handleReset,
  submitForm: handleSubmit,
  setFormValues: formHandler.setFormValues,
  setFormErrors: formHandler.setFormErrors,
  clearFormErrors: formHandler.clearFormErrors,
  getFieldData: formHandler.getFieldData,
  formData: formHandler.formData,
  formState: formHandler.formState,
  isValid: formHandler.isFormValid,
  isDirty: formHandler.isFormDirty
});
</script>

<style scoped>
.dynamic-form {
  max-width: 100%;
}

.form-header {
  margin-bottom: 1.5rem;
}

.form-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #212529;
}

.form-description {
  margin: 0;
  color: #6c757d;
  font-size: 1rem;
  line-height: 1.5;
}

.form-errors {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8d7da;
  border: 1px solid #f5c2c7;
  border-radius: 0.375rem;
  color: #721c24;
}

.form-errors-title {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.form-errors-list {
  margin: 0;
  padding-left: 1.25rem;
}

.form-error-item {
  margin-bottom: 0.25rem;
}

.form-body {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 2rem;
}

.form-fieldset {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1.5rem;
  margin: 0;
}

.form-group-legend {
  font-weight: 600;
  font-size: 1.125rem;
  color: #495057;
  padding: 0 0.5rem;
  margin-bottom: 1rem;
}

.form-group-legend.collapsible {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.group-toggle {
  transition: transform 0.2s;
}

.group-toggle.collapsed {
  transform: rotate(-90deg);
}

.form-group-description {
  margin-bottom: 1rem;
  color: #6c757d;
  font-size: 0.875rem;
}

.form-group-fields {
  display: contents;
}

/* Макеты */
.layout-vertical .fields-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.layout-horizontal .fields-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
}

.layout-horizontal .fields-container > :deep(.dynamic-field) {
  flex: 1;
  min-width: 200px;
}

.layout-inline .fields-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-end;
}

.layout-inline .fields-container > :deep(.dynamic-field) {
  margin-bottom: 0;
}

.layout-grid .fields-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-start;
  margin-top: 1.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #fff;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5c636a;
  border-color: #565e64;
}

.submit-spinner {
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

.form-submitting {
  pointer-events: none;
  opacity: 0.8;
}

/* Адаптивность */
@media (max-width: 768px) {
  .layout-horizontal .fields-container,
  .layout-grid .fields-container {
    display: flex;
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-fieldset {
    padding: 1rem;
  }
}
</style>