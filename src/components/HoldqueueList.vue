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
  <div class="holdqueuelist p-2" overflow-y="auto">
    <Sidebar :url="url" />
    <div class="card border-secondary mb-3">
      <div class="card-header border-secondary">
        Adabas Database hold queue list on database {{ url }}
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the list of Adabas database hold queue to be
              administrate through this Adabas RESTful server.
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
                  <tr v-for="item in holdqueues" :key="item.id">
                    <td v-for="field in fields" :key="field">{{ item[field] }}</td>
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
    Sidebar,
   StatusBar,
    Url,
  },
  props: {
    url: String,
  },
  setup(props) {
    const fields = ref([
      'File',
      'Flags',
      'Hid[0].Id',
      'Hid[0].Node',
      'Hid[0].Terminal',
      'Hid[0].Timestamp',
      'HqCommid',
      'Isn',
      'Locks',
      'User',
    ]);
    const holdqueues = ref([]);
    const timer = ref('');
    const db = ref(null);

    const loadHoldQueue = () => {
      db.value.holdQueue().then((response: any) => {
        holdqueues.value = response;
      });
    };

    onMounted(() => {
      db.value = SearchDatabases(props.url);
      timer.value = setInterval(loadHoldQueue, 5000);
      loadHoldQueue();
    });

    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return {
      fields,
      holdqueues,
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
