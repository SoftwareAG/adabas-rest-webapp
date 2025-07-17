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
  <div class="commandqueuelist p-2" overflow-y="auto">
    <Sidebar :url="url" />
    <div class="card border-secondary">
      <div class="card-header border-secondary">
        Adabas Database command queue for database {{ url }}
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the list of Adabas database command queue entries to be
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
                  <tr v-for="item in commandqueues" :key="item.CommId">
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
import { ref, onMounted, onBeforeUnmount, defineComponent } from "vue";
import Sidebar from "./Sidebar.vue";
import StatusBar from '@/components/StatusBar.vue';
import Url from "./Url.vue";
import { SearchDatabases } from "@/adabas/admin";

export default defineComponent({
  name: "CommandqueueList",
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
      "APU",
      "CommId",
      "CommandUser",
      "CommandCode",
      "EtFlags",
      "File",
      "Flags",
      "User.Id",
      "User.Node",
      "User.Terminal",
      "User.Timestamp",
    ]);
    const commandqueues = ref([]);
    const timer = ref(null);
    const db = ref(null);

    const loadCommandQueue = () => {
      db.value.commandQueue().then((response: any) => {
        commandqueues.value = response;
        commandqueues.value.forEach(function (part: any, index: number, theArray: any) {
          theArray[index].User.Timestamp = new Date(theArray[index].User.Timestamp).toUTCString();
        });
      });
    };

    onMounted(() => {
      db.value = SearchDatabases(props.url);
      timer.value = setInterval(loadCommandQueue, 5000);
      loadCommandQueue();
    });

    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return {
      fields,
      commandqueues,
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
