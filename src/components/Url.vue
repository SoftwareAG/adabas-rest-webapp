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
  <div class="url p-2 w-75">
    <b-button-toolbar aria-label="Url">
      <b-button-group size="sm" class="mr-2">
        <b-button disabled>URL:</b-button>
        <b-button disabled variant="outline-primary">{{ storedUrl.query.method }}</b-button>
      </b-button-group>
      <b-input-group size="sm" prepend=">" class="w-50">
        <b-form-input readonly class="text-left" v-model="storedUrl.query.url"></b-form-input>
      </b-input-group>
    </b-button-toolbar>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import store from "../store/index";

@Component
export default class UrlDisplay extends Vue {
  @Prop(String) readonly url: string | undefined;
  data() {
    return {
      storedUrl: store.state.url,
    };
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
