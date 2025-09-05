import { createApp } from 'vue';
import DemoApp from './DemoApp.vue';
import VueDynamicForms from '../index';

const app = createApp(DemoApp);

// Устанавливаем плагин
app.use(VueDynamicForms);

app.mount('#app');