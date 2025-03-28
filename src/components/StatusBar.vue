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
  <div class="statusbar p-0 mb-0">
    <ResponseBar />
    <div class="alert alert-primary" role="alert">Status: {{ status.status }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import store from "../store/index";
import ResponseBar from "./ResponseBar.vue";

export default defineComponent({
  components: { ResponseBar },
  props: {
    msg: {
      type: String,
      required: true,
    },
  },
  setup() {
    const status = ref(store.state.status);

    return {
      status,
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
