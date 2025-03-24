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
  <div class="mapmetadata p-2">
    <b-card
      header="Adabas Map Metadata"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <p>
          This page queries the Adabas Map Metadata of the Adabas Map technology
          used in Adabas Client for Java.
        </p>
        <Url url="/adabas/database" />
        <b-container fluid>
          <b-row class="my-1">
            <b-col sm="2" class="text-right">
              <label>Select Map to be displayed:</label>
            </b-col>
            <b-col sm="8">
              <b-form-select
                v-model="selected"
                @change="getSelectedItem"
                :options="options"
                size="sm"
                class="w-75"
              />
            </b-col>
            <b-col sm="2">
              <b-button
                size="sm"
                variant="outline-primary"
                class="ml-2"
                @click="refreshMapList"
                >Refresh Map list</b-button
              >
            </b-col>
          </b-row>
        </b-container>
      </b-card-body>
    </b-card>
    <b-card
      header="RESTful HTTP-Request:"
      header-bg-variant="light"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-container fluid>
          <b-row>
            <b-col sm="2">URL:</b-col>
            <b-col sm="9">
              {{ url }}
            </b-col>
          </b-row>
          <b-row>
            <b-col sm="2">Status:</b-col>
            <b-col sm="9"> {{ status.status }}</b-col>
          </b-row>
        </b-container>
      </b-card-body>
    </b-card>
    <b-card
      no-body
      class="mb-1"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button class="text-left" block v-b-toggle.accordion-1 variant="outline-primary"
          >Response</b-button
        >
      </b-card-header>
      <b-collapse
        id="accordion-1"
        accordion="my-accordion"
        visible
        role="tabpanel"
      >
        <b-card-body>
          <b-card-text>
            <b-container fluid>
              <b-row>
                <b-col sm="2"
                  ><div class="font-weight-bold">Map definition:</div>
                </b-col>
                <b-col sm="5"
                  ><div class="font-weight-bold">Target:</div>
                  {{ map.data.target }}
                </b-col>
                <b-col sm="5"
                  ><div class="font-weight-bold">File:</div>
                  {{ map.data.file }}
                </b-col>
              </b-row>
              <b-row>
                <b-col sm="2"
                  ><div class="font-weight-bold">Data reference:</div>
                </b-col>
                <b-col sm="5"
                  ><div class="font-weight-bold">Target:</div>
                  {{ map.definition.target }}
                </b-col>
                <b-col sm="5"
                  ><div class="font-weight-bold">File:</div>
                  {{ map.definition.file }}
                </b-col>
              </b-row>
              <b-row>
                <b-col sm="2"
                  ><div class="font-weight-bold">Last modified:</div>
                </b-col>
                <b-col sm="8">{{ map.lastModified }} </b-col>
              </b-row>
            </b-container>
            <b-table
              striped
              bordered
              hover
              small
              :items="mapFields"
              :fields="fields"
            >
              <template v-for="(field, index) in fields" :key="index">
                <div>
                  {{ index }}{{ field.name }}
                </div>
              </template>
            </b-table>
          </b-card-text>
        </b-card-body>
      </b-collapse>
    </b-card>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import 'bootstrap/dist/css/bootstrap.css';
import store from '../store/index';
import { config } from '../store/config';
import StatusBar from './StatusBar.vue';
import Url from './Url.vue';

export default {
  name: 'MapMetadata',
  components: { StatusBar, Url },
  setup() {
    const maps = reactive(store.state.maps);
    const map = reactive({
      data: { target: '', file: '' },
      definition: { target: '', file: '' },
      fields: [],
    });
    const url = ref(config.Url() + '/rest/metadata/map/<to be selected>');
    const selected = ref(null);
    const status = reactive(store.state.status);
    const metadata = reactive(store.state.metadata);
    const mapFields = ref([]);
    const fields = ['name', 'contentType', 'shortName', 'length'];
    const jsonString = ref('No query JSON result available');
    const options = ref([{ value: null, text: 'Please select an Adabas Map' }]);
    const query = reactive({ map: '' });

    // Lifecycle hook for mounting
    onMounted(() => {
      store
        .dispatch('INIT_MAPS')
        .then((response) => {
          console.log('Response: ' + JSON.stringify(response));
        })
        .catch((reason: any) => {
          console.log('Reason(onMounted): ' + JSON.stringify(reason));
        });
      adaptMapOptions();
    });

    // Methods
    const getSelectedItem = (myarg: any) => {
      if (query.map !== myarg) {
        url.value = config.Url() + '/rest/metadata/map/' + myarg;
        query.map = myarg;
      }

      store.dispatch('QUERY_MAP_FIELDS', myarg).then((response) => {
        mapFields.value = response.data.Map.fields;
        map.data = response.data.Map.data;
        map.definition = response.data.Map.definition;
        jsonString.value = JSON.stringify(map);
      });
    };

    const refreshMapList = () => {
      store.dispatch('INIT_MAPS');
    };

    const adaptMapOptions = () => {
      const optionsList = [{ value: null, text: 'Please select an Adabas Map' }];
      maps.forEach((i: any) => {
        optionsList.push({ value: i, text: i });
      });
      options.value = optionsList;
    };

    // Watchers
    watch(maps, () => {
      adaptMapOptions(); // Called within the watch
    });

    watch(metadata, (newvalue: any) => {
      console.log('Metadata changed:', JSON.stringify(newvalue));
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
    };
  },
};
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
