<template>
  <component
    :is="fieldComponent"
    :fieldData="fieldData"
    v-bind="componentProps"
  >
    <!-- Проброс всех слотов -->
    <template
      v-for="(slotInfo, index) in typedSlots"
      :key="`slot-${index}`"
      #[slotInfo.name]="slotProps"
    >
      <slot 
        :name="slotInfo.name" 
        v-bind="slotProps" 
      />
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed, useSlots, type Component } from 'vue';
import type { useDynamicField } from '@/composables';
import BaseField from './BaseField.vue';
import SelectField from './SelectField.vue';
import RadioField from './RadioField.vue';
import CheckboxField from './CheckboxField.vue';

interface Props {
  fieldData: ReturnType<typeof useDynamicField>;
  customComponents?: Record<string, Component>;
}

const props = withDefaults(defineProps<Props>(), {
  customComponents: () => ({})
});

const slots = useSlots();

// Типизированные слоты
const typedSlots = computed((): Array<{ name: string; slot: any }> => {
  return Object.keys(slots).map(name => ({ name, slot: slots[name] }));
});

// Маппинг типов полей к компонентам
const FIELD_TYPE_MAP: Record<string, Component> = {
  // Текстовые поля
  text: BaseField,
  email: BaseField,
  password: BaseField,
  url: BaseField,
  tel: BaseField,
  number: BaseField,
  textarea: BaseField,
  hidden: BaseField,
  date: BaseField,
  'datetime-local': BaseField,
  time: BaseField,
  file: BaseField,
  range: BaseField,
  color: BaseField,
  
  // Выбор из списка
  select: SelectField,
  multiselect: SelectField,
  
  // Радио кнопки
  radio: RadioField,
  
  // Чекбоксы и переключатели
  checkbox: CheckboxField,
  switch: CheckboxField,
};

// Определяем компонент для рендеринга
const fieldComponent = computed(() => {
  const fieldSchema = props.fieldData.fieldSchema;
  
  // Если указан кастомный компонент в схеме поля
  if (fieldSchema.component) {
    if (props.customComponents[fieldSchema.component]) {
      return props.customComponents[fieldSchema.component];
    }
    console.warn(`Custom component "${fieldSchema.component}" not found for field "${fieldSchema.name}"`);
  }
  
  // Используем стандартный компонент для типа поля
  const component = FIELD_TYPE_MAP[fieldSchema.type];
  
  if (!component) {
    console.warn(`No component found for field type "${fieldSchema.type}", using BaseField`);
    return BaseField;
  }
  
  return component;
});

// Дополнительные пропсы для компонента
const componentProps = computed(() => {
  const fieldSchema = props.fieldData.fieldSchema;
  
  // Пропсы из схемы поля
  const schemaProps = fieldSchema.props || {};
  
  return {
    ...schemaProps
  };
});
</script>