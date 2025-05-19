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
  <div class="nucleuslog p-2" overflow-y="auto">
    <Sidebar :url="url" />
    <div class="card border-secondary">
      <div class="card-header border-secondary">
        Adabas Databases Nucleus log of database {{ url }}
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the Adabas database nucleus log output.
            </div>
          </div>
          <div class="row">
            <div class="col">
              <Url url="/adabas/database" />
            </div>
          </div>
          <div class="row">
            <div class="col-sm-2">
              Select:
            </div>
            <div class="col-sm-10">
              <select class="form-select" @change="changeLog()" v-model="selected">
                <option v-for="option in nucleusOptions" :key="option" :value="option.value">{{ option.path }}</option>
              </select>
              <br>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div v-if="show" class="overlay rounded-sm">
                <div class="alert alert-secondary">
                  <pre>{{ log }}</pre>
                </div>
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
import Sidebar from './Sidebar.vue';
import StatusBar from '@/components/StatusBar.vue';
import Url from './Url.vue';
import store from '../store/index';
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
      required: true,
    },
  },
  setup(props) {
    const log = ref('');
    const db = ref(null);
    const selected = ref('adanuc.log');
    const nucleusOptions = ref([{ value: 'adanuc.log', path: 'adanuc.log'}]);
    const show = ref(false);
    const timer = ref(null);

    const loadNucleus = async () => {
      try {
        const response = await db.value.nucleusLog(selected.value);
        log.value = response;
        show.value = true;
      } catch (error) {
        //console.log("error.response", JSON.stringify(error.response));
        console.error("Error loading nucleus log:", error);
        store.commit('SET_STATUS', 'Failed to load nucleus log: '+error);
      }
    };

    const changeLog = () => {
      show.value = false;
      loadNucleus();
    };

    onMounted(async () => {
      try {
        db.value = SearchDatabases(props.url);
        if (!db.value) {
          throw new Error("Database not found for URL: " + props.url);
        }   
        await loadNucleus();
        timer.value = setInterval(loadNucleus, 5000);   
        const response = await db.value.nucleusLogList();
        nucleusOptions.value = response.NucleusLogs.map(path => {
          return {
            value: path.split('\\').pop(), // filename
            path: path                      // full path
          };
        });
        console.log("nucleusOptions List = " + JSON.stringify(nucleusOptions.value))
      } catch (error: any) {
        console.error("Error in onMounted:", error.message || error);
      }
    });

    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return {
      log,
      db,
      selected,
      nucleusOptions,
      show,
      loadNucleus,
      changeLog,
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
