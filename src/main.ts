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

import 'mutationobserver-shim';
import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; 

const app = createApp(App).use(router).use(store);
app.config.globalProperties.productionTip = false
export const eventBus = app;

const DEFAULT_TITLE = 'Adabas REST server';
/*router.afterEach((to, from) => {
  // Use next tick to handle router history correctly
  // see: https://github.com/vuejs/vue-router/issues/914#issuecomment-384477609
  Vue.nextTick(() => {
    document.title = to.meta?.title || DEFAULT_TITLE;
  });
});*/
router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: any) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('user');
  // console.log(to.fullPath+" -> "+from.fullPath+" "+JSON.stringify(next));
  if (to.path === '/login' && authRequired) {
    next('/'); // Redirect to home if already logged in
  }
  if (authRequired && !loggedIn) {
    next({
      path: '/login',
      query: { returnUrl: to.path },
    });
  } else {
    next();
  }
});

app.use(router);
app.use(store);
app.mount('#app');
