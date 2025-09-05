# Vue Dynamic Forms - Testing Guide

## 🧪 Automated Testing

The library includes comprehensive unit tests that you can run:

```bash
# Run tests once
pnpm run test --run

# Run tests in watch mode
pnpm run test

# Run tests with UI interface
pnpm run test:ui

# Run tests with coverage
pnpm run test:coverage
```

### Test Coverage

Current tests cover:
- ✅ **Built-in validators** - All validation functions (required, email, minLength, etc.)
- ✅ **Conditions engine** - Field visibility and conditional logic
- ✅ **Type safety** - TypeScript compilation and type checking

## 🌐 Browser Testing

### Demo Application
The library includes a comprehensive demo application accessible at `http://localhost:3001` when running `pnpm run dev`.

#### Test Scenarios:

**Basic Example:**
1. **Field Validation**
   - Try submitting empty required fields
   - Enter invalid email addresses
   - Test number field limits (age: 18-120)
   - Select country from dropdown

2. **Real-time Validation**
   - Watch errors appear/disappear as you type
   - Validation on blur and on change

**Advanced Example:**
1. **Conditional Logic**
   - Select "Есть работа" → Job-related fields appear
   - Select "Нет работы" → Job-related fields disappear
   - Test different employment types

2. **Complex Fields**
   - Multi-select (contact methods, languages)
   - Range slider (salary)
   - Switch toggle (newsletter)

3. **Form Groups**
   - Collapsible sections
   - Grouped validation

## 🔧 Build Testing

### Library Build
```bash
# Test library build for distribution
pnpm run build:lib

# Test development build
pnpm run build

# Type checking (manual - some Vue component warnings expected)
pnpm run type-check
```

### Build Outputs
After running `build:lib`, check the `dist/` folder:
- ✅ `index.mjs` - ES modules build (~58KB)
- ✅ `index.umd.js` - UMD build (~45KB)  
- ✅ `style.css` - Component styles (~14KB)

## 📊 Performance Testing

### Bundle Size
- **Core library**: ~58KB (gzipped: ~14KB)
- **Zero runtime dependencies** (only Vue 3 peer dependency)
- **Tree-shakable** - import only what you need

### Memory Usage
- Efficient reactive updates
- Conditional field rendering
- Validation debouncing to prevent excessive calls

## 🎯 Integration Testing

### Using the Library
Test the library in your own Vue 3 project:

```bash
# In your project
npm install vue-dynamic-forms
# or
pnpm add vue-dynamic-forms
```

```vue
<template>
  <DynamicForm :schema="schema" @submit="onSubmit" />
</template>

<script setup>
import { DynamicForm } from 'vue-dynamic-forms'

const schema = {
  fields: [
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      validation: { required: true, email: true }
    }
  ]
}

const onSubmit = (data, isValid) => {
  console.log('Form data:', data, 'Is valid:', isValid)
}
</script>
```

### Composables Testing
Test the composable approach:

```vue
<script setup>
import { useDynamicForm } from 'vue-dynamic-forms'

const { formData, validateForm, submitForm } = useDynamicForm({
  schema: mySchema
}, {
  submit: (data, isValid) => {
    // Handle form submission
  }
})

// Programmatic control
await validateForm()
await submitForm()
</script>
```

## 🚨 Known Issues

1. **TypeScript Vue Components**: Some TypeScript warnings for Vue component imports are expected in development mode but don't affect functionality.

2. **VeeValidate/Yup/Zod**: External validators work only when the respective libraries are installed and available globally.

## ✅ Test Checklist

- [ ] All unit tests pass (`pnpm run test --run`)
- [ ] Library builds successfully (`pnpm run build:lib`)
- [ ] Demo application loads without errors
- [ ] Basic form validation works
- [ ] Advanced conditional logic works
- [ ] All field types render correctly
- [ ] Form submission works
- [ ] TypeScript types are available
- [ ] Custom components can be integrated
- [ ] Performance is acceptable for large forms

## 🎉 Production Ready

The library is ready for production use when:
- ✅ All tests pass
- ✅ Demo works in browser
- ✅ Build completes successfully
- ✅ No console errors in demo
- ✅ TypeScript declarations are generated