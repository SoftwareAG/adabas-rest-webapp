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
  <div class="responsebar">
    <div class="card mb-1 border-secondary">
      <div class="card-header p-1" role="tab">
        <button class="btn btn-outline-primary w-100" data-bs-toggle="collapse" data-bs-target="#accordion-2">JSON response</button>
      </div>
      <div id="accordion-2" class="collapse" data-bs-parent="#my-accordion" role="tabpanel">
        <div class="card-body p-1">
          <p class="card-text">{{ jsonString.json }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import store from "../store/index";

export default defineComponent({
  props: {
    url: {
      type: String,
      required: false,
    },
  },
  setup() {
    const jsonString = ref(store.state.respData);

    const setResponse = (data: any) => {
      console.log("Got response ..." + JSON.stringify(data));
    };

    return {
      jsonString,
      setResponse,
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.card-header {
  font-weight: bold;
  font-size: 16px;
}
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
