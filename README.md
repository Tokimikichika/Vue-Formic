# Vue Dynamic Forms

[![npm version](https://badge.fury.io/js/vue-dynamic-forms.svg)](https://badge.fury.io/js/vue-dynamic-forms)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Powerful library for creating dynamic, validated forms in Vue 3 based on JSON schemas.

## ✨ Features

🎯 **Declarative JSON Schemas** - Define forms using JSON configuration  
🎨 **Highly Customizable** - Slots for every form element, UI library integration  
✅ **Built-in Validation** - Integration with yup, zod, vee-validate  
🔀 **Conditional Logic** - Dynamic field visibility based on form values  
📘 **TypeScript Support** - Full type safety out of the box  
🪶 **Zero Dependencies** - Only Vue 3 as peer dependency  
🧩 **Composable Architecture** - Use composables in any component structure

## 📦 Installation

```bash
npm install vue-dynamic-forms
# or
pnpm add vue-dynamic-forms
# or
yarn add vue-dynamic-forms
```

## 🚀 Quick Start

### 1. Register the plugin

```typescript
import { createApp } from 'vue'
import VueDynamicForms from 'vue-dynamic-forms'
import 'vue-dynamic-forms/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(VueDynamicForms)
app.mount('#app')
```

### 2. Use the component

```vue
<template>
  <DynamicForm :schema="formSchema" @submit="onSubmit" />
</template>

<script setup lang="ts">
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
      label: 'Password',
      validation: { required: true, minLength: 6 }
    }
  ]
}

</script>
```

## 🎯 Advanced Usage

### Conditional Logic

```typescript
{
  name: 'jobDetails',
  type: 'text',
  label: 'Job Details',
  conditions: {
    show: [{ field: 'hasJob', operator: 'equals', value: true }]
  }
}
```

### Custom Validation

```typescript
{
  name: 'username',
  type: 'text',
  validation: {
    custom: (value, formData) => {
      return value.length >= 3 || 'Username must be at least 3 characters'
    }
  }
}
```

### Using Composables

```vue
<script setup>
import { useDynamicForm } from 'vue-dynamic-forms'

const { formData, validateForm, submitForm } = useDynamicForm({
  schema: mySchema
}, {
  submit: (data, isValid) => {
    // Handle submission
  }
})
</script>
```

## Лицензия

MIT © [Your Name]