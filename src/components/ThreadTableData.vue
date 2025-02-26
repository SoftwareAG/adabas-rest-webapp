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
  <div class="threadtabledata p-2">
    <Sidebar :url="url" />
    <div class="card border-secondary mb-3">
      <div class="card-header border-secondary">
        Adabas Database thread table for database {{ url }}
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the list of Adabas database threads to be
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
              <table class="table table-striped table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th v-for="field in fields" :key="field">{{ field }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="thread in threads" :key="thread.Thread">
                    <td>{{ thread.Thread }}</td>
                    <td>{{ thread.APU }}</td>
                    <td>{{ thread.CommandCode }}</td>
                    <td>{{ new Intl.NumberFormat().format(thread.CommandCount) }}</td>
                    <td>{{ thread.File }}</td>
                    <td>{{ thread.Status }}</td>
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
import StatusBar from '@/components/StatusBar.vue';
import store from '../store/index';
import Url from './Url.vue';
import { SearchDatabases } from '@/adabas/admin';

export default defineComponent({
  components: {
    Sidebar,
    StatusBar,
    Url,
  },
  props: {
    url: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const fields = ref([
      'Thread',
      'APU',
      'CommandCode',
      'CommandCount',
      'File',
      'Status',
    ]);
    const threads = ref([]);
    const timer = ref(null);
    const db = ref(null);

    const loadThreadTable = () => {
      if (db.value) {
        db.value.threadTable().then((response: any) => {
          threads.value = response;
        });
      }
    };

    onMounted(() => {
      db.value = SearchDatabases(props.url);
      loadThreadTable();
      timer.value = setInterval(loadThreadTable, 5000);
    });

    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return {
      fields,
      threads,
      loadThreadTable,
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
