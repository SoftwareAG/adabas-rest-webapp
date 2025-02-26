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
    <div class="btn-toolbar" role="toolbar" aria-label="Url">
      <div class="btn-group btn-group-sm mr-2" role="group">
        <button type="button" class="btn btn-secondary" disabled>URL:</button>
        <button type="button" class="btn btn-outline-primary" disabled>{{ storedUrl.query.method }}</button>
      </div>
      <div class="input-group input-group-sm w-50">
        <div class="input-group-prepend">
          <span class="input-group-text">></span>
        </div>
        <input type="text" class="form-control text-left" readonly v-model="storedUrl.query.url">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import store from '../store/index';

export default defineComponent({
  props: {
    url: {
      type: String,
      required: false,
    },
  },
  setup() {
    const storedUrl = ref(store.state.url);
    return {
      storedUrl,
    };
  },
});
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
