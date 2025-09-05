<template>
  <div class="demo-app">
    <header class="demo-header">
      <h1>Vue Dynamic Forms</h1>
      <p>Библиотека для создания динамических форм на Vue 3</p>
    </header>

    <nav class="demo-nav">
      <button
        v-for="example in examples"
        :key="example.key"
        @click="currentExample = example.key"
        :class="['nav-button', { active: currentExample === example.key }]"
      >
        {{ example.title }}
      </button>
    </nav>

    <main class="demo-content">
      <component :is="currentExampleComponent" />
    </main>

    <footer class="demo-footer">
      <p>
        Создано с ❤️ для Vue.js сообщества. 
        <a href="https://github.com/yourusername/vue-dynamic-forms" target="_blank">
          Исходный код на GitHub
        </a>
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type Component } from 'vue';
import BasicExample from './BasicExample.vue';
import AdvancedExample from './AdvancedExample.vue';

interface ExampleItem {
  key: string;
  title: string;
  component: Component;
}

const examples: ExampleItem[] = [
  {
    key: 'basic',
    title: 'Простой пример',
    component: BasicExample
  },
  {
    key: 'advanced',
    title: 'Продвинутый пример',
    component: AdvancedExample
  }
];

const currentExample = ref('basic');

const currentExampleComponent = computed(() => {
  const example = examples.find(ex => ex.key === currentExample.value);
  return example?.component || BasicExample;
});
</script>

<style scoped>
.demo-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.demo-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 3rem 2rem;
}

.demo-header h1 {
  margin: 0 0 1rem 0;
  font-size: 3rem;
  font-weight: 700;
}

.demo-header p {
  margin: 0;
  font-size: 1.25rem;
  opacity: 0.9;
}

.demo-nav {
  background: #f8f9fa;
  padding: 1rem 0;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.nav-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  font-size: 1rem;
  font-weight: 500;
}

.nav-button:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.nav-button.active {
  background: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.demo-content {
  flex: 1;
  padding: 2rem;
  background: #fff;
}

.demo-footer {
  background: #f8f9fa;
  padding: 2rem;
  text-align: center;
  border-top: 1px solid #dee2e6;
  color: #6c757d;
}

.demo-footer a {
  color: #0d6efd;
  text-decoration: none;
}

.demo-footer a:hover {
  text-decoration: underline;
}

/* Глобальные стили для демо */
:global(body) {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8f9fa;
}

:global(*) {
  box-sizing: border-box;
}

/* Адаптивность */
@media (max-width: 768px) {
  .demo-header h1 {
    font-size: 2rem;
  }
  
  .demo-header {
    padding: 2rem 1rem;
  }
  
  .demo-nav {
    flex-direction: column;
    padding: 1rem;
    gap: 0.5rem;
  }
  
  .nav-button {
    width: 100%;
  }
  
  .demo-content {
    padding: 1rem;
  }
}
</style>