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
  <div class="activitydisplay p-2">
    <Sidebar :url="url" />
    <div class="card border-secondary mb-3">
      <div class="card-header border-secondary">
        Adabas Database activity on database {{ url }}
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the activity of Adabas database to be
              monitored through this Adabas RESTful server.
            </div>
          </div>
          <div class="row">
            <div class="col">
              <Url url="/adabas/database" />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="fw-bold">I/O statistics</div>
              <table class="table table-striped table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in searchArray(ioFields)" :key="row.Name">
                    <td>{{ row.Name.replace(/([A-Z])/g, ' $1').trim() }}</td>
                    <td>{{ row.Value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="col">
              <div class="fw-bold">Throwbacks</div>
              <table class="table table-striped table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in search('Thb')" :key="row.Name">
                    <td>{{ row.Name.substring(3).replace(/([A-Z])/g, ' $1').trim() }}</td>
                    <td>{{ row.Value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="fw-bold">Pool Hit Rate</div>
              <table class="table table-striped table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in searchArray(statFields)" :key="row.Name">
                    <td>{{ row.Name.replace(/([A-Z])/g, ' $1').trim() }}</td>
                    <td>{{ row.Value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="col">
              <div class="fw-bold">Interrupts</div>
              <table class="table table-striped table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in searchArray(wpFields)" :key="row.Name">
                    <td>{{ row.Name.substring(2).replace(/([A-Z])/g, ' $1').trim() }}</td>
                    <td>{{ row.Value }}</td>
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
import { defineComponent, ref, onMounted } from 'vue';
import Sidebar from './Sidebar.vue';
import StatusBar from '@/components/StatusBar.vue';
import Url from './Url.vue';
import { SearchDatabases } from '@/adabas/admin';

export default defineComponent({
  name: 'ActivityDisplay',
  components: {
   StatusBar,
    Sidebar,
    Url,
  },
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const fields = ref(['Name', 'Value']);
    const activity = ref([]);
    const ioFields = ref(['BPHitRate', 'WorkReads', 'WorkWrites', 'PlogWrites']);
    const statFields = ref(['BufferPoolIO', 'FPHitRate']);
    const wpFields = ref(['WPSpaceWaitCurrent', 'WpSpaceWaitTotal']);

    const searchArray = (s: any[]) => {
      return activity.value.filter((row: any) => s.indexOf(row.Name) > -1);
    };

    const search = (s: string) => {
      return activity.value.filter((row: any) => row.Name.startsWith(s));
    };

    onMounted(() => {
      const db = SearchDatabases(props.url);
      db.activityStats().then((response: any) => {
        activity.value = response;
      });
    });

    return {
      fields,
      activity,
      ioFields,
      statFields,
      wpFields,
      searchArray,
      search,
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
