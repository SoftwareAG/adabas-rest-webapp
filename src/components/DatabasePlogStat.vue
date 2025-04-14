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
  <div class="databaseplogstats p-2" overflow-y="auto">
    <Sidebar :url="url" />
    <div class="card border-secondary">
      <div class="card-header border-secondary">
        Adabas Database PLOG information for database {{ url }}
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col">
            <Url url="/adabas/database" />
          </div>
          <div class="col text-end">
            <button class="btn btn-primary" @click="forceFEOF()">Force EOF</button>
          </div>
        </div>
        <div class="row">
          <table class="table table-striped table-bordered table-hover table-sm w-100 p-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="info in infos" :key="info.Name">
                <td>{{ info.Name }}</td>
                <td>{{ info.Value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    StatusBar /
    <ErrorModal />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, provide } from 'vue';
import Sidebar from './Sidebar.vue';
import StatusBar from '@/components/StatusBar.vue';
import store from '../store/index';
import Url from './Url.vue';
import ErrorModal from '@/components/ErrorModal.vue';
import { SearchDatabases } from '@/adabas/admin';

export default defineComponent({
  name: 'DatabasePlogStat',
  components: {
    Sidebar,
   StatusBar,
    Url,
    ErrorModal,
  },
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    provide('type', 'static');
    const db = ref(null);
    const infos = ref([]);
    const fields = ref(['Name', 'Value']);

    const queryInformation = () => {
      db.value.plogstats().then((response: any) => {
        console.log(JSON.stringify(response));
        infos.value = [];
        Object.entries(response["PLOG"]).forEach((key: any) => {
          infos.value.push({ Name: key[0], Value: key[1] });
        });
      });
    };

    const forceFEOF = () => {
      db.value.feofplog();
    };

    onMounted(() => {
      db.value = SearchDatabases(props.url);
      queryInformation();
    });

    return {
      infos,
      fields,
      forceFEOF,
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
