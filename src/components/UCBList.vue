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
  <div class="ucblist p-2" overflow-y="auto">
    <Sidebar :url="url" />
    <div class="card border-secondary">
      <div class="card-header border-secondary">
        Adabas Database UCB list for database {{ url }}
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the list of Adabas database utility control
              block active in the database.
            </div>
          </div>
          <div class="row">
            <div class="col">
              <Url />
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
                  <tr v-for="item in ucb" :key="item.Id">
                    <td>{{ item.Count }}</td>
                    <td>{{ item.DBMode }}</td>
                    <td>{{ item.Date }}</td>
                    <td>{{ item.Id }}</td>
                    <td>{{ item.Sequence }}</td>
                    <td>{{ listUcbFiles(item.Count, item.ucbFiles) }}</td>
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
    const fields = ref(['Count', 'DBMode', 'Date', 'Id', 'Sequence', 'files']);
    const ucb = ref([]);
    const timer = ref('');
    const db = ref(null);

    const loadUCBList = () => {
      db.value.ucb().then((response: any) => {
        ucb.value = response;
      });
    };

    const listUcbFiles = (count: number, ucbFiles: any) => {
      if (count === -1) {
        return ['*'];
      }
      let f = [] as string[];
      ucbFiles.forEach((element: any) => {
        f.push(element.UcbFile);
      });
      return f;
    };

    onMounted(() => {
      db.value = SearchDatabases(props.url);
      timer.value = setInterval(loadUCBList, 5000);
      loadUCBList();
    });

    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return {
      fields,
      ucb,
      listUcbFiles,
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
