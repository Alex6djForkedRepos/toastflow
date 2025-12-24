import { createApp } from 'vue';
import { createPinia } from 'pinia';

import './globals.css';

import App from './App.vue';
import { createToastflow } from 'vue-toastflow';
import 'highlight.js/styles/atom-one-dark.css';
import 'highlight.js/lib/common';
import hljsVuePlugin from '@highlightjs/vue-plugin';

const app = createApp(App);

app.use(createPinia());
app.use(createToastflow());
app.use(hljsVuePlugin);

app.mount('#app');
