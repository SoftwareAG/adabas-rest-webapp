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
    <b-navbar toggleable="lg" type="light" variant="light">
      <b-navbar-brand to="/"
        ><img
          src="img/logo_sag.png"
          style="width: auto; height: 15px;"
        /><br />Adabas RESTful server</b-navbar-brand
      >

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item-dropdown text="Adabas Data access" right>
            <b-dropdown-item to="/map">Adabas Map access</b-dropdown-item>
            <b-dropdown-item to="/database">Adabas classic access</b-dropdown-item>
            <b-dropdown-item to="/metadata">Adabas Map Metadata</b-dropdown-item>
            <b-dropdown-item to="/modify">Modify record</b-dropdown-item>
          </b-nav-item-dropdown>
            <b-nav-item :disabled="!isAdministrator" to="/databases">Database Administration</b-nav-item>
            <b-nav-item :disabled="!isAdministrator" to="/jobs">Job list</b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto" right>
            <b-nav-item target="_blank" href="/api/">Swagger API</b-nav-item>
          <b-nav-item-dropdown text="Examples" right>
            <b-dropdown-item to="/example_description">Description</b-dropdown-item>
            <b-dropdown-item to="/example_image">Image example</b-dropdown-item>
            <b-dropdown-item to="/example_unicode"
              >Unicode access</b-dropdown-item
            >
            <b-dropdown-item to="/example_new_employees"
              >New employees file</b-dropdown-item
            >
            <b-dropdown-item to="/example_sorted"
              >Sorted access</b-dropdown-item
            >
            <b-dropdown-item to="/example_descriptor"
              >Descriptor read</b-dropdown-item
            >
          </b-nav-item-dropdown>
          <b-nav-item v-on:click="logout">Logout<br/>&lt;{{user}}&gt;</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import {  Vue } from "vue-property-decorator";
import {
  NavbarPlugin,
  ButtonPlugin,
  FormInputPlugin,
  TablePlugin,
  FormCheckboxPlugin,
} from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import { userService } from "../user/service";
import { authHeader, adminRole } from '../user/auth-header';

Vue.use(NavbarPlugin);
Vue.use(ButtonPlugin);
Vue.use(FormInputPlugin);
Vue.use(FormCheckboxPlugin);
Vue.use(TablePlugin);

// @Component({
//     NavbarPlugin,
//     ButtonPlugin,
//     FormInputPlugin,
//     TablePlugin,
//      store,
// })
export default Vue.extend({
  name: "Header",
  data() {
    return {
      user: "",
      isAdministrator: false,
      checked: true,
    };
  },
  created() {
    this.$data.isAdministrator = adminRole();
    this.$data.user = userService.getUsername()
  },
  methods: {
    logout() {
      userService.logout();
      location.reload(true);
    },
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
