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
  <div class="footer">
      <b-container fluid class="bg-light text-dark w-100">
        <b-row><b-col class="text-left">Adabas REST WebApp {{webAppVersion}}</b-col>
        <b-col  class="text-right">
          Adabas RESTfull application with REST server version: {{version}}
        </b-col></b-row>
      </b-container>
  </div>
</template>

<script lang="ts">
import {  Vue } from "vue-property-decorator";
import { config } from "../store/config";

export default Vue.extend({
  name: "Footer",
  data() {
    return {
      webAppVersion: config.Version(),
      checked: true,
      version: null,
    };
  },
  created() {
    const v = localStorage.getItem("version");
    if (v) {
        this.$data.version = JSON.parse(v).version;
    }

  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.footer {
    font-size: 12px;
}
</style>
