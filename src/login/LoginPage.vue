<!--
 * Copyright (c) 2020 Software AG (http://www.softwareag.com/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.-->

<template>
  <div class="login">
    <div>
      <img
        src="../../public/img/AdabasNatural.png"
        class="img-fluid rounded"
        alt="Responsive image"
      />
    </div>
    <h2>Adabas REST-Console Login</h2>
    <form @submit.prevent="handleSubmit">
      <div>
        <table class="table table-striped">
          <tr>
            <td class="text-end">Info:</td>
            <td class="text-start">Default user is 'admin'</td>
          </tr>
          <tr>
            <td class="text-start" colspan="2">
              Passsword is generated in the installation procedure. Use 'service.sh' to create new users or to set the password afterwards.
            </td>
          </tr>
        </table>
      </div>
      <div class="mb-3">
        <input
          type="text"
          v-model="username"
          name="username"
          class="form-control"
          :class="{ 'is-invalid': submitted && !username }"
          placeholder="User name"
        />
        <div v-show="submitted && !username" class="invalid-feedback">
          Username is required
        </div>
      </div>
      <div class="mb-3">
        <input
          type="password"
          v-model="password"
          name="password"
          class="form-control"
          :class="{ 'is-invalid': submitted && !password }"
          placeholder="Password"
        />
        <div v-show="submitted && !password" class="invalid-feedback">
          Password is required
        </div>
      </div>
      <div class="mb-3">
        <button class="btn btn-primary" :disabled="loading">Login</button>
        <img
          v-show="loading"
          src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="
        />
      </div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
    </form>
  </div>
</template>
<style>
.login {
  border: 1px solid black;
  border-radius: 5px;
  padding: 1.5rem;
  width: 500px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  overflow: hidden;
  .container-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.3);
    img {
      width: 2rem;
      height: 2rem;
    }
  }
  form {
    display: flex;
    flex-flow: column;
    *:not(:last-child) {
      margin-bottom: 1rem;
    }
    input {
      padding: 0.5rem;
    }
    button {
      padding: 0.5rem;
      background-color: lightgray;
      border: 1px solid gray;
      border-radius: 3px;
      cursor: pointer;
      &:hover {
        background-color: lightslategray;
      }
    }
  }
}
</style>
<script>
import { ref, reactive, onMounted } from 'vue';
import router from '../router';
import { userService } from '../user/service';

export default {
  setup() {
    const username = ref('');
    const password = ref('');
    const submitted = ref(false);
    const loading = ref(false);
    const returnUrl = ref('');
    const error = ref('');

    onMounted(() => {
      userService.logout();
      returnUrl.value = router.currentRoute.value.query.returnUrl || '/';
    });

    const handleSubmit = () => {
      submitted.value = true;
      if (!(username.value && password.value)) {
        return;
      }
      let version = 'unknown';
      const v = localStorage.getItem('version');
      if (v) {
        version = JSON.parse(v).version;
      }
      if (version === 'dev' || version.startsWith('6.7')) {
        console.log('Using baseauth authentication');
        let user = {
          authdata: window.btoa(username.value + ':' + password.value),
          username: username.value,
        };
        localStorage.setItem('user', JSON.stringify(user));
        router.push(returnUrl.value);
        location.reload();
        return;
      }
      loading.value = true;
      // userService.login(username.value, password.value).then(
      userService.login("admin", "manage").then(
        (user) => {
          router.push(returnUrl.value);
          if (returnUrl.value === '/') {
            location.reload();
          }
        },
        (error) => {
          error.value = error;
          console.log('Login error:' + JSON.stringify(error));
          loading.value = false;
        }
      );
    };

    return {
      username,
      password,
      submitted,
      loading,
      returnUrl,
      error,
      handleSubmit,
    };
  },
};
</script>
