import type { App } from 'vue';

// Типы
export * from './types';

// Composables
export * from './composables';

// Компоненты
export * from './components';

// Валидаторы
export * from './validators';

// Утилиты
export * from './utils/conditions';

// Главные импорты для удобства
export { useDynamicForm, useDynamicField } from './composables';
export { DynamicForm, DynamicField } from './components';
export { ValidationEngine, builtinValidators } from './validators';
export { ConditionsEngine } from './utils/conditions';

// Импорты компонентов для регистрации
import {
  BaseField,
  SelectField,
  RadioField,
  CheckboxField,
  DynamicField,
  DynamicForm
} from './components';

// Плагин для Vue
const VueDynamicForms = {
  install(app: App) {
    // Регистрируем компоненты
    app.component('BaseField', BaseField);
    app.component('SelectField', SelectField);
    app.component('RadioField', RadioField);
    app.component('CheckboxField', CheckboxField);
    app.component('DynamicField', DynamicField);
    app.component('DynamicForm', DynamicForm);
  }
};

export default VueDynamicForms;