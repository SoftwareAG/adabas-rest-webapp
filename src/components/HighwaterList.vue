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
  <div class="highwaterlist p-2" overflow-y="auto">
    <Sidebar :url="url" />
    <div class="card border-secondary">
      <div class="card-header border-secondary">
        Adabas Database High Watermark for database {{ url }}
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the statistics of Adabas database High Watermark.
            </div>
          </div>
          <div class="row">
            <div class="col">
              <Url url="/adabas/database" />
            </div>
            <div class="col text-end">
              <button class="btn btn-secondary" @click="resetHWM()">Reset</button>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <table class="table table-striped table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Size</th>
                    <th>High</th>
                    <th>InUse</th>
                    <th>Time</th>
                    <th>Percent</th>
                    <th>Statistics</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in highwater" :key="row.Area">
                    <td>{{ row.Area }}</td>
                    <td>{{ new Intl.NumberFormat().format(row.Size) }}</td>
                    <td>{{ new Intl.NumberFormat().format(row.High) }}</td>
                    <td>{{ new Intl.NumberFormat().format(row.InUse) }}</td>
                    <td>{{ new Date(row.Time).toUTCString() }}</td>
                    <td>{{ row.Percent }}</td>
                    <td>
                      <div class="progress mb-3">
                        <div
                          class="progress-bar"
                          role="progressbar"
                          :style="{ width: row.Percent + '%' }"
                          :aria-valuenow="row.Percent"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
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
import Sidebar from './Sidebar.vue';
import store from '../store/index';
import StatusBar from '@/components/StatusBar.vue';
import Url from './Url.vue';
import { SearchDatabases } from '@/adabas/admin';

export default defineComponent({
  components: {
   StatusBar,
    Sidebar,
    Url,
  },
  props: {
    url: String,
  },
  setup(props) {
    const db = ref(null);
    const fields = ref([
      'Area',
      'Size',
      'High',
      'InUse',
      'Time',
      'Percent',
      'statistics',
    ]);
    const highwater = ref([] as any[]);
    const timer = ref('');

    const queryParameters = () => {
      db.value.highWaterMark().then((response: any) => {
        highwater.value = response;
      });
    };

    const resetHWM = () => {
      db.value.highWaterMarkReset();
    };

    onMounted(() => {
      db.value = SearchDatabases(props.url);
      timer.value = setInterval(queryParameters, 5000);
      queryParameters();
    });

    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return {
      fields,
      highwater,
      resetHWM,
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
a {
  color: #42b983;
}
</style>
