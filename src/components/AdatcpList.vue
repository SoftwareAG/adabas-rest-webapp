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
  <div class="adatcplist p-2" overflow-y="auto">
    <Sidebar :url="url" />
    <div class="card border-secondary mb-3">
      <div class="card-header border-secondary">
        Adabas Database ADATCP information for database {{ url }}
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the list of Adabas database ADATCP connections.
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
                    <th>ID</th>
                    <th>RecvID</th>
                    <th>RemoteHost</th>
                    <th>RemoteIP</th>
                    <th>RemoteUser</th>
                    <th>RemotePort</th>
                    <th>Stop</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in adatcp" :key="row.ID">
                    <td>{{ row.ID }}</td>
                    <td>{{ row.RecvID }}</td>
                    <td>{{ row.RemoteHost }}</td>
                    <td>{{ row.RemoteIP }}</td>
                    <td>{{ row.RemoteUser }}</td>
                    <td>{{ row.RemotePort }}</td>
                    <td>
                      <div class="mx-auto text-center">
                        <i class="bi bi-x-circle-fill text-danger" @click="stopConnection(row)"></i>
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
import StatusBar from '@/components/StatusBar.vue';
import Url from './Url.vue';
import { SearchDatabases, Database } from '@/adabas/admin';
// import 'bootstrap-icons/font/bootstrap-icons.css';


export default defineComponent({
  name: 'AdatcpList',
  components: {
    StatusBar,
    Sidebar,
    // BIconXCircle,
    Url,
  },
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const db = ref<Database | null>(null);
    const fields = ref([
      'ID',
      'RecvID',
      'RemoteHost',
      'RemoteIP',
      'RemoteUser',
      'RemotePort',
      'Stop',
    ]);
    const adatcp = ref([]);
    const timer = ref(null);

    const queryParameters = () => {
      if (db.value) {
        db.value.adatcp().then((response: any) => {
          adatcp.value = response.data;
        });
      }
    };

    const stopConnection = (tcp: any) => {
      console.log("TCP: " + JSON.stringify(tcp));
      if (db.value) {
        db.value.closeConnection(tcp.ID);
      }
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
      adatcp,
      stopConnection,
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
