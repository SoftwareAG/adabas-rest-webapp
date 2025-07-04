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
  <div class="mapmetadata p-2" overflow-y="auto">
    <div class="card border-secondary">
      <div class="card-header bg-secondary text-white">Adabas Map Metadata</div>
      <div class="card-body">
        <p>
          This page query the Adabas Map Metadata of the Adabas Map technology
          used in Adabas Client for Java.
        </p>
        <Url url="/adabas/database" />
        <div class="container-fluid">
          <div class="row my-1">
            <div class="col-sm-2 text-end">
              <label>Select Map to be displayed:</label>
            </div>
            <div class="col-sm-8">
              <select
                v-model="selected"
                @change="getSelectedItem"
                class="form-select form-select-sm w-75"
              >
                <option v-for="option in options" :key="option.value" :value="option.value">
                  {{ option.text }}
                </option>
              </select>
            </div>
            <div class="col-sm-2">
              <button
                class="btn btn-outline-primary btn-sm ms-2"
                @click="refreshMapList"
              >Refresh Map list</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card border-secondary mt-3">
      <div class="card-header bg-light">RESTful HTTP-Request:</div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col-sm-2">URL:</div>
            <div class="col-sm-9">{{ url }}</div>
          </div>
          <div class="row">
            <div class="col-sm-2">Status:</div>
            <div class="col-sm-9">{{ status.status }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="card border-secondary mt-3">
      <div class="card-header p-1">
        <button class="btn btn-outline-primary btn-block text-start" data-bs-toggle="collapse" data-bs-target="#accordion-1">Response</button>
      </div>
      <div id="accordion-1" class="collapse show">
        <div class="card-body">
          <div class="container-fluid">
            <div class="row">
              <div class="col-sm-2 font-weight-bold">Map definition:</div>
              <div class="col-sm-5 font-weight-bold">Target: {{ map.data.target }}</div>
              <div class="col-sm-5 font-weight-bold">File: {{ map.data.file }}</div>
            </div>
            <div class="row">
              <div class="col-sm-2 font-weight-bold">Data reference:</div>
              <div class="col-sm-5 font-weight-bold">Target: {{ map.definition.target }}</div>
              <div class="col-sm-5 font-weight-bold">File: {{ map.definition.file }}</div>
            </div>
            <div class="row">
              <div class="col-sm-2 font-weight-bold">Last modified:</div>
              <div class="col-sm-8">{{ map.lastModified }}</div>
            </div>
          </div>
          <table class="table table-striped table-bordered table-hover table-sm">
            <thead>
              <tr>
                <th v-for="field in fields" :key="field">{{ field }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(field, index) in mapFields" :key="index">
                <td>{{ field.name }}</td>
                <td>{{ field.contentType }}</td>
                <td>{{ field.shortName }}</td>
                <td>{{ field.length }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
        <StatusBar />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import store from '../store/index';
import { config } from '../store/config';
import StatusBar from '@/components/StatusBar.vue';
import Url from './Url.vue';

export default defineComponent({
  name: 'MapMetadata',
  components: { StatusBar, Url },
  setup() {
    const maps = ref(store.state.maps);
    const map = ref({
      data: { target: '', file: '' },
      definition: { target: '', file: '' },
      fields: [],
    });
    const url = ref(config.Url() + '/rest/metadata/map/<to be selected>');
    const selected = ref(null);
    const status = ref(store.state.status);
    const metadata = ref(store.state.metadata);
    const mapFields = ref([]);
    const fields = ref(['name', 'contentType', 'shortName', 'length']);
    const jsonString = ref('No query JSON result available');
    const options = ref([{ value: null, text: 'Please select an Adabas Map' }]);
    const query = ref({ map: '' });

    onMounted(() => {
      store.dispatch('INIT_MAPS').then((response) => {
      }).catch((reason: any) => {
        console.log('Reason(created): ' + JSON.stringify(reason));
      });
      adaptMapOptions();
    });

    function getSelectedItem(myarg: any) {
      myarg = (event.target as HTMLSelectElement).value;
      if (query.value.map !== myarg) {
        url.value = config.Url() + '/rest/metadata/map/' + myarg;
        query.value.map = myarg;
      }

      store.dispatch('QUERY_MAP_FIELDS', myarg).then((response) => {
        mapFields.value = response.data.Map.fields;
        map.value = response.data.Map;
        jsonString.value = JSON.stringify(map.value);
      });
    }

    function refreshMapList() {
      store.dispatch('INIT_MAPS');
    }

    function adaptMapOptions() {
      const optionsList = [{ value: null, text: 'Please select an Adabas Map' }];
      maps.value.forEach((i: any) => {
        optionsList.push({ value: i, text: i });
        options.value = optionsList;
      });
    }

    watch(maps, (value, newvalue) => {
      adaptMapOptions();
    });

    watch(metadata, (value, newvalue) => {
      console.log('Metadata changed:' + JSON.stringify(newvalue));
    });

    return {
      maps,
      map,
      url,
      selected,
      status,
      metadata,
      mapFields,
      fields,
      jsonString,
      options,
      query,
      getSelectedItem,
      refreshMapList,
      adaptMapOptions,
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.mapdata {
  font-size: 14px;
}
.card-header {
  font-weight: bold;
  font-size: 18px;
}
h3 {
  margin: 40px 0 0;
  font-size: 14px;
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
