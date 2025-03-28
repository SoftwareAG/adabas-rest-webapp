<!--
 * Copyright (c) 2021 Software AG (http://www.softwareag.com/)
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
  <div class="log p-2">
    <MyHeader></MyHeader>
    <div class="card border-secondary">
      <div class="card-header border-secondary">
        Adabas REST server log
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the Adabas REST server log output.
            </div>
          </div>
          <div class="row">
            <div class="col">
              <Url url="/adabas/rest/log" />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="alert alert-secondary" role="alert">
                <pre>{{ log }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
        <StatusBar />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import MyHeader from '@/components/Header.vue';
import { AdabasConfig } from '../adabas/config';
import Url from './Url.vue';
import store from '../store/index';
import StatusBar from '@/components/StatusBar.vue';

export default defineComponent({
  components: {
    MyHeader,
    Url,
    StatusBar,
  },
  props: {
    url: String,
  },
  setup() {
    const log = ref('');
    const c = ref(null);
    const timer = ref(null);

    const loadLog = () => {
      c.value.readLog().then((response: any) => {
        log.value = response.Log.Log;
      });
    };

    onMounted(() => {
      c.value = new AdabasConfig();
      timer.value = setInterval(loadLog, 5000);
      loadLog();
    });

    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return {
      log,
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
.card-header {
  font-weight: bold;
  font-size: 18px;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
.hidden {
  display: none;
}
</style>
