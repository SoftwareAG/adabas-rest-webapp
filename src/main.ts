/*
* Copyright © 2020 Software AG, Darmstadt, Germany and/or its licensors
*
* SPDX-License-Identifier: Apache-2.0
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*
*/

import { createApp } from 'vue'; // Import createApp from Vue 3
import '@babel/polyfill';
import 'mutationobserver-shim';
import './publicpath.js';
import './plugins/bootstrap-vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import { Route } from 'vue-router';

// Create the Vue app instance
const app = createApp(App);

const DEFAULT_TITLE = 'Adabas REST server';

/* Uncomment to handle document title change in Vue 3
router.afterEach((to, from) => {
  // Use next tick to handle router history correctly
  // see: https://github.com/vuejs/vue-router/issues/914#issuecomment-384477609
  app.config.globalProperties.$nextTick(() => {
    document.title = to.meta?.title || DEFAULT_TITLE;
  });
});
*/

router.beforeEach((to: Route, from: Route, next: any) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('user');
  //console.log(to.fullPath+" -> "+from.fullPath+" "+JSON.stringify(next));
  if (authRequired && !loggedIn) {
    next({
      path: '/login',
      query: { returnUrl: to.path },
    });
  } else {
    next();
  }
});

// Mount the app
app.use(router);
app.use(store);
app.mount('#app'); // Mount the app to the DOM

