<template>
  <div class="example-container">
    <h1>Vue Dynamic Forms - Простой пример</h1>
    
    <div class="example-section">
      <h2>Форма регистрации пользователя</h2>
      
      <DynamicForm
        :schema="formSchema"
        :initialData="initialData"
        @submit="onSubmit"
      />
    </div>

    <div class="example-section">
      <h3>Данные формы:</h3>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { FormSchema } from '../types';
import { DynamicForm } from '../components';

// Данные формы
const formData = ref<Record<string, any>>({});

// Начальные данные
const initialData = {
  name: '',
  email: '',
  age: '',
  country: '',
  newsletter: false
};

// Схема формы
const formSchema: FormSchema = {
  title: 'Регистрация пользователя',
  description: 'Заполните форму для создания учетной записи',
  layout: 'vertical',
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Имя пользователя',
      description: '',
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50,
        message: 'Имя должно содержать от 2 до 50 символов'
      },
      attributes: {
        placeholder: 'Введите ваше имя'
      }
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email адрес',
      validation: {
        required: true,
        email: true,
        message: 'Введите корректный email адрес'
      },
      attributes: {
        placeholder: 'example@mail.com'
      }
    },
    {
      name: 'age',
      type: 'number',
      label: 'Возраст',
      validation: {
        required: true,
        min: 18,
        max: 120,
        message: 'Возраст должен быть от 18 до 120 лет'
      },
      attributes: {
        min: 18,
        max: 120
      }
    },
    {
      name: 'country',
      type: 'select',
      label: 'Страна',
      validation: {
        required: true
      },
      options: [
        { label: 'Россия', value: 'ru' },
        { label: 'Беларусь', value: 'by' },
        { label: 'Казахстан', value: 'kz' },
        { label: 'Украина', value: 'ua' },
        { label: 'Другая', value: 'other' }
      ],
      attributes: {
        placeholder: 'Выберите страну'
      }
    },
    {
      name: 'newsletter',
      type: 'checkbox',
      label: 'Подписаться на новости',
      description: 'Получать уведомления о новых функциях и обновлениях'
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
    alert('Форма успешно отправлена!');
    formData.value = data;
  } else {
    alert('Пожалуйста, исправьте ошибки в форме');
  }
}

</script>

<style scoped>
.example-container {
  max-width: 800px;
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