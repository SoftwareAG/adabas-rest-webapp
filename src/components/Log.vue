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
    <MyHeader />
    <b-card
      :header="'Adabas REST server log'"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-container fluid>
          <b-row>
            <b-col>
              This page provides the Adabas REST server log output.
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <Url url="/adabas/rest/log" />
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-alert show variant="secondary">
                <pre>{{ log }}</pre>
              </b-alert>
            </b-col>
          </b-row>
        </b-container>
      </b-card-body>
    </b-card>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import MyHeader from '@/components/Header.vue';
import Url from './Url.vue';
import StatusBar from './StatusBar.vue';
import { AdabasConfig } from '../adabas/config';

export default {
  components: {
    MyHeader,
    Url,
    StatusBar,
  },
  setup() {
    const log = ref<string>('');  // reactive reference for log
    const c = new AdabasConfig(); // instance of AdabasConfig
    let timer: ReturnType<typeof setInterval> | null = null;  // interval reference

    // Function to load logs
    const loadLog = async () => {
      const response = await c.readLog();
      log.value = response?.Log?.Log ?? '';  // Update log
    };

    // Mounted hook to start loading logs and set interval
    onMounted(() => {
      loadLog();
      timer = setInterval(loadLog, 5000);  // reload log every 5 seconds
    });

    // Before unmount hook to clear the interval
    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);  // clear interval when component is destroyed
    });

    return {
      log,  // expose log variable for template
    };
  },
};
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
