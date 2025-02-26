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
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="/">
        <img src="../../public/img/logo_sag.png" style="width: auto; height: 15px;" />
        <br />Adabas RESTful server
      </a>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav-collapse" aria-controls="nav-collapse" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="nav-collapse">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="adabasDataAccessDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Adabas Data access
            </a>
            <ul class="dropdown-menu" aria-labelledby="adabasDataAccessDropdown">
              <li><a class="dropdown-item" href="/map">Adabas Map access</a></li>
              <li><a class="dropdown-item" href="/database">Adabas classic access</a></li>
              <li><a class="dropdown-item" href="/metadata">Adabas Map Metadata</a></li>
              <li><a class="dropdown-item" href="/modify">Modify record</a></li>
            </ul>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ disabled: !isAdministrator }" href="/databases/">Database Administration</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ disabled: !isAdministrator }" href="/jobs">List of tasks</a>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="configureRestServerDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Configure REST server
            </a>
            <ul class="dropdown-menu" aria-labelledby="configureRestServerDropdown">
              <li><a class="dropdown-item" href="/configuration/">Configuration</a></li>
              <li><a class="dropdown-item" href="/browser/">File Browser</a></li>
              <li><a class="dropdown-item" href="/log/">RESTful Log</a></li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="examplesDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Examples
            </a>
            <ul class="dropdown-menu" aria-labelledby="examplesDropdown">
              <li><a class="dropdown-item" href="/example_description">Description</a></li>
              <li><a class="dropdown-item" href="/example_image">Image example</a></li>
              <li><a class="dropdown-item" href="/example_unicode">Unicode access</a></li>
              <li><a class="dropdown-item" href="/example_new_employees">New employees file</a></li>
              <li><a class="dropdown-item" href="/example_sorted">Sorted access</a></li>
              <li><a class="dropdown-item" href="/example_descriptor">Descriptor read</a></li>
            </ul>
          </li>
          <li class="nav-item">
            <a class="nav-link" target="_blank" href="/docs">Swagger API</a>
          </li>
        </ul>
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link" href="#" @click="logout">Logout<br />&lt;{{ user }}&gt;</a>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 

import { userService } from '../user/service';
import { authHeader, adminRole } from '../user/auth-header';

export default defineComponent({
  name: 'Header',
  setup() {
    const user = ref('');
    const isAdministrator = ref(false);
    const isClusterAdministrator = ref(false);

    onMounted(() => {
      isAdministrator.value = adminRole();
      user.value = userService.getUsername();
    });

    const logout = () => {
      userService.logout();
      location.reload();
    };

    return {
      user,
      isAdministrator,
      isClusterAdministrator,
      logout,
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
a {
  text-decoration: none;
  color: black;
}

.router-link-exact-active {
  color: black;
}
</style>
