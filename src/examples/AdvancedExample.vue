<template>
  <div class="example-container">
    <h1>Vue Dynamic Forms - Продвинутый пример</h1>
    
    <div class="example-section">
      <h2>Анкета с условной логикой</h2>
      
      <DynamicForm
        :schema="formSchema"
        :initialData="initialData"
        @submit="onSubmit"
        @change="onFieldChange"
      />
    </div>

    <div class="example-section">
      <h3>Данные формы:</h3>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { FormSchema } from '../types';
import { DynamicForm } from '../components';

// Данные формы
const formData = ref<Record<string, any>>({});

// Начальные данные для формы
const initialData = {
  name: '',
  age: '',
  hasJob: '',
  jobTitle: '',
  company: '',
  salary: 50,
  experience: '',
  contactMethods: [],
  languages: [],
  newsletter: false
};

// Схема формы с условной логикой
const formSchema: FormSchema = {
  title: 'Анкета пользователя',
  description: 'Форма демонстрирует условную логику и различные типы полей',
  layout: 'vertical',
  groups: [
    {
      name: 'personal',
      label: 'Личная информация',
      fields: ['name', 'age', 'hasJob']
    },
    {
      name: 'employment',
      label: 'Информация о работе',
      fields: ['jobTitle', 'company', 'salary', 'experience']
    },
    {
      name: 'preferences',
      label: 'Предпочтения',
      fields: ['contactMethods', 'languages', 'newsletter']
    }
  ],
  fields: [
    // Личная информация
    {
      name: 'name',
      type: 'text',
      label: 'Полное имя',
      validation: {
        required: true,
        minLength: 2
      },
      attributes: {
        placeholder: 'Введите ваше имя'
      }
    },
    {
      name: 'age',
      type: 'number',
      label: 'Возраст',
      validation: {
        required: true,
        min: 16,
        max: 100
      },
      attributes: {
        min: 16,
        max: 100
      }
    },
    {
      name: 'hasJob',
      type: 'radio',
      label: 'Есть ли у вас работа?',
      validation: {
        required: true
      },
      options: [
        { label: 'Да', value: 'yes' },
        { label: 'Нет', value: 'no' },
        { label: 'Частично занят', value: 'part-time' }
      ]
    },

    // Информация о работе (показывается только если есть работа)
    {
      name: 'jobTitle',
      type: 'text',
      label: 'Должность',
      validation: {
        required: true
      },
      conditions: {
        show: [
          { field: 'hasJob', operator: 'equals', value: 'yes' },
          { field: 'hasJob', operator: 'equals', value: 'part-time' }
        ],
        logic: 'or'
      },
      attributes: {
        placeholder: 'Ваша должность'
      }
    },
    {
      name: 'company',
      type: 'text',
      label: 'Компания',
      conditions: {
        show: [
          { field: 'hasJob', operator: 'equals', value: 'yes' },
          { field: 'hasJob', operator: 'equals', value: 'part-time' }
        ],
        logic: 'or',
        required: [
          { field: 'hasJob', operator: 'equals', value: 'yes' }
        ]
      },
      attributes: {
        placeholder: 'Название компании'
      }
    },
    {
      name: 'salary',
      type: 'range',
      label: 'Зарплата (тыс. руб.)',
      conditions: {
        show: [
          { field: 'hasJob', operator: 'equals', value: 'yes' }
        ]
      },
      attributes: {
        min: 20,
        max: 500,
        step: 10
      }
    },
    {
      name: 'experience',
      type: 'select',
      label: 'Опыт работы',
      conditions: {
        show: [
          { field: 'hasJob', operator: 'equals', value: 'yes' },
          { field: 'hasJob', operator: 'equals', value: 'part-time' }
        ],
        logic: 'or'
      },
      options: [
        { label: 'Менее 1 года', value: '0-1' },
        { label: '1-3 года', value: '1-3' },
        { label: '3-5 лет', value: '3-5' },
        { label: '5-10 лет', value: '5-10' },
        { label: 'Более 10 лет', value: '10+' }
      ]
    },

    // Предпочтения
    {
      name: 'contactMethods',
      type: 'multiselect',
      label: 'Предпочитаемые способы связи',
      options: [
        { label: 'Email', value: 'email' },
        { label: 'Телефон', value: 'phone' },
        { label: 'SMS', value: 'sms' },
        { label: 'Мессенджеры', value: 'messengers' },
        { label: 'Почта', value: 'mail' }
      ],
      validation: {
        custom: (value: any[]) => {
          if (!value || value.length === 0) {
            return 'Выберите хотя бы один способ связи';
          }
          return true;
        }
      }
    },
    {
      name: 'languages',
      type: 'multiselect',
      label: 'Знание языков',
      options: [
        { label: 'Русский', value: 'ru' },
        { label: 'Английский', value: 'en' },
        { label: 'Немецкий', value: 'de' },
        { label: 'Французский', value: 'fr' },
        { label: 'Испанский', value: 'es' },
        { label: 'Китайский', value: 'zh' }
      ]
    },
    {
      name: 'newsletter',
      type: 'switch',
      label: 'Подписаться на рассылку',
      description: 'Получать новости и обновления по email'
    }
  ],
  config: {
    validateOnChange: true,
    validateOnBlur: true,
    validateOnSubmit: true
  }
};

// Обработчики событий
function onSubmit(data: Record<string, any>, isValid: boolean) {
  
  if (isValid) {
    alert('Анкета успешно отправлена!');
    formData.value = data;
  } else {
    alert('Пожалуйста, исправьте ошибки в форме');
  }
}

function onFieldChange(fieldName: string, value: any, currentFormData: Record<string, any>) {
  // Обновляем отображаемые данные
  formData.value = { ...currentFormData };
}
</script>

<style scoped>
.example-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.example-section {
  margin-bottom: 2rem;
}

pre {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
  overflow-x: auto;
}

h1 {
  color: #212529;
  text-align: center;
  margin-bottom: 2rem;
}

h2, h3 {
  color: #495057;
  margin-bottom: 1rem;
}
</style>