# Vue Dynamic Forms

Мощная библиотека для создания динамических форм в Vue 3 на основе JSON-схем.

## ✨ Особенности

- 🎯 **Декларативные JSON-схемы** - описывайте формы в JSON формате
- 🎨 **Полная кастомизация** - слоты для каждого элемента формы
- ✅ **Встроенная валидация** - поддержка популярных библиотек (Yup, Zod, VeeValidate)
- 🔀 **Условная логика** - динамическое показ/скрытие полей на основе значений
- 📘 **TypeScript** - полная типизация из коробки
- 🪶 **Легковесность** - zero dependencies (только Vue 3)
- 🧩 **Композиционность** - используйте composables в любых компонентах

## 📦 Установка

```bash
npm install vue-dynamic-forms
# или
pnpm add vue-dynamic-forms
# или
yarn add vue-dynamic-forms
```

## 🚀 Быстрый старт

### 1. Регистрация плагина

```typescript
import { createApp } from 'vue'
import VueDynamicForms from 'vue-dynamic-forms'
import App from './App.vue'

const app = createApp(App)
app.use(VueDynamicForms)
app.mount('#app')
```

### 2. Использование компонента

```vue
<template>
  <DynamicForm :schema="formSchema" @submit="onSubmit" />
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { FormSchema } from 'vue-dynamic-forms'

const formSchema: FormSchema = {
  fields: [
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      validation: { required: true, email: true }
    },
    {
      name: 'password',
      type: 'password', 
      label: 'Пароль',
      validation: { required: true, minLength: 6 }
    }
  ]
}

const onSubmit = (data: any, isValid: boolean) => {
  console.log('Данные формы:', data)
}
</script>
```

## 📖 Подробная документация

### Схема формы (FormSchema)

```typescript
interface FormSchema {
  fields: FieldSchema[]           // Поля формы
  config?: FormConfig             // Конфигурация формы
  groups?: FormGroup[]            // Группировка полей
  layout?: 'vertical' | 'horizontal' | 'inline' | 'grid'
  title?: string                  // Заголовок формы
  description?: string            // Описание формы
}
```

### Схема поля (FieldSchema)

```typescript
interface FieldSchema {
  name: string                    // Имя поля (обязательно)
  type: FieldType                 // Тип поля
  label?: string                  // Лейбл поля
  description?: string            // Описание поля
  defaultValue?: any              // Значение по умолчанию
  
  // Валидация
  validation?: ValidationRule     // Правила валидации
  externalValidation?: ExternalValidation // Внешние валидаторы
  
  // Опции для селектов/радио
  options?: FieldOption[] | (() => Promise<FieldOption[]>)
  
  // HTML атрибуты
  attributes?: BaseInputAttributes
  
  // Условная логика
  conditions?: ConditionalLogic
  
  // Кастомизация
  component?: string              // Кастомный компонент
  props?: Record<string, any>     // Пропсы для компонента
  wrapperClass?: string           // CSS класс обертки
  fieldClass?: string             // CSS класс поля
  
  // Слоты
  slots?: {
    prefix?: string
    suffix?: string
    help?: string
  }
}
```

### Типы полей

Поддерживаются следующие типы полей:

- **Текстовые**: `text`, `email`, `password`, `url`, `tel`, `textarea`
- **Числовые**: `number`, `range`
- **Даты**: `date`, `datetime-local`, `time`
- **Выбор**: `select`, `multiselect`, `radio`
- **Логические**: `checkbox`, `switch`
- **Файлы**: `file`
- **Другие**: `color`, `hidden`, `custom`

### Валидация

#### Встроенная валидация

```typescript
{
  name: 'username',
  type: 'text',
  validation: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Только латиница, цифры и подчеркивание'
  }
}
```

#### Внешние валидаторы

```typescript
// Yup
{
  name: 'email',
  type: 'email',
  externalValidation: {
    yup: yup.string().email().required()
  }
}

// Zod  
{
  name: 'age',
  type: 'number',
  externalValidation: {
    zod: z.number().min(18).max(100)
  }
}

// Кастомный валидатор
{
  name: 'confirmPassword',
  type: 'password',
  externalValidation: {
    custom: (value, formData) => {
      return value === formData.password || 'Пароли не совпадают'
    }
  }
}
```

### Условная логика

```typescript
{
  name: 'employmentDetails',
  type: 'text',
  conditions: {
    show: [
      { field: 'hasJob', operator: 'equals', value: true }
    ],
    required: [
      { field: 'jobType', operator: 'equals', value: 'full-time' }
    ],
    disabled: [
      { field: 'isMinor', operator: 'equals', value: true }
    ]
  }
}
```

#### Операторы условий

- `equals` / `notEquals` - точное соответствие
- `contains` / `notContains` - содержит подстроку
- `gt` / `gte` / `lt` / `lte` - числовые сравнения
- `empty` / `notEmpty` - проверка на пустоту
- `in` / `notIn` - вхождение в массив значений

### Группировка полей

```typescript
{
  groups: [
    {
      name: 'personal',
      label: 'Личная информация',
      fields: ['firstName', 'lastName', 'email'],
      collapsible: true,
      collapsed: false
    },
    {
      name: 'work',
      label: 'Рабочая информация', 
      fields: ['company', 'position'],
      conditions: {
        show: [{ field: 'hasJob', operator: 'equals', value: true }]
      }
    }
  ]
}
```

## 🎨 Кастомизация

### Слоты

```vue
<DynamicForm :schema="schema" @submit="onSubmit">
  <!-- Кастомный header -->
  <template #header="{ schema }">
    <div class="custom-header">
      <h1>{{ schema.title }}</h1>
    </div>
  </template>
  
  <!-- Кастомное поле -->
  <template #field-email="{ field }">
    <MyCustomEmailField :field="field" />
  </template>
  
  <!-- Кастомные действия -->
  <template #actions="{ submit, reset, isValid }">
    <button @click="submit" :disabled="!isValid">
      Отправить форму
    </button>
  </template>
</DynamicForm>
```

### Кастомные компоненты полей

```vue
<!-- Регистрируем кастомный компонент -->
<DynamicForm 
  :schema="schema" 
  :customComponents="{ 'my-field': MyCustomFieldComponent }"
  @submit="onSubmit" 
/>
```

```typescript
// В схеме указываем кастомный компонент
{
  name: 'specialField',
  type: 'custom',
  component: 'my-field',
  props: {
    customProp: 'value'
  }
}
```

## 🧩 Composables

### useDynamicForm

```vue
<script setup lang="ts">
import { useDynamicForm } from 'vue-dynamic-forms'

const formHandler = useDynamicForm({
  schema: mySchema,
  initialData: { name: 'John' },
  validateOnChange: true
}, {
  submit: (data, isValid) => {
    // Обработка отправки
  },
  change: (fieldName, value, formData) => {
    // Обработка изменений
  }
})

// Программное управление
formHandler.setFormValues({ email: 'new@email.com' })
formHandler.validateForm()
formHandler.resetForm()
</script>
```

### useDynamicField

```vue
<script setup lang="ts">
import { useDynamicField } from 'vue-dynamic-forms'

const fieldHandler = useDynamicField(fieldSchema, {
  formData: formDataRef,
  validationEngine,
  conditionsEngine
})

// Использование в шаблоне
</script>

<template>
  <input 
    v-bind="fieldHandler.inputAttrs"
    :class="fieldHandler.inputClasses"
    @input="fieldHandler.handleInput"
    @blur="fieldHandler.handleBlur"
  />
</template>
```

## 🔧 Конфигурация

```typescript
const formConfig: FormConfig = {
  validateOnChange: true,        // Валидация при изменении
  validateOnBlur: true,          // Валидация при потере фокуса
  validateOnSubmit: true,        // Валидация при отправке
  resetOnSubmit: false,          // Сброс после отправки
  preventSubmitOnEnter: false,   // Предотвращать отправку по Enter
  formClass: 'my-form',          // CSS класс формы
  fieldWrapperClass: 'my-field', // CSS класс обертки полей
  errorClass: 'my-error'         // CSS класс ошибок
}
```

## 📝 Примеры

См. папку `examples/` для полных примеров использования:

- `BasicExample.vue` - простая форма регистрации
- `AdvancedExample.vue` - сложная форма с условной логикой
- `DemoApp.vue` - демо-приложение

## 🤝 Совместимость

- Vue 3.3+
- TypeScript 5.0+
- Поддержка SSR/SSG

## 🐛 Отчеты об ошибках

Если вы нашли ошибку, пожалуйста, создайте issue на GitHub с подробным описанием проблемы.

## 📄 Лицензия

MIT © [Your Name]