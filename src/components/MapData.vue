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
  <div class="mapdata p-2" overflow-y="auto">
    <div class="card border-secondary mb-3">
      <div class="card-header bg-secondary text-white">Query Access Parameter</div>
      <div class="card-body">
        <p>
          This page provides access to Adabas data using the Adabas Map
          technology used in Adabas Client for Java. Please select query
          information like search and field to be received.
        </p>
        <p>Press 'Query Data' to receive the result list in the table.</p>
        <div class="container-fluid">
          <div class="row my-1" v-if="classicMode == 'false'">
            <div class="col-sm-2 text-end">
              <label>Select Map to be displayed: {{ classicMode }}</label>
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
          </div>
          <div class="row my-1" v-else>
            <div class="col-sm-2 text-end">
              <label>Select Database to be displayed:</label>
            </div>
            <div class="col-sm-4">
              <select
                v-model="selected"
                @change="getSelectedItem"
                class="form-select form-select-sm w-75"
              >
                <option v-for="option in optionsDatabases" :key="option.value" :value="option.value">
                  {{ option.text }}
                </option>
              </select>
            </div>
            <div class="col-sm-4">
              <select
                v-model="file"
                @change="getFileItem"
                class="form-select form-select-sm w-75"
              >
                <option v-for="option in optionsFiles" :key="option.value" :value="option.value">
                  {{ option.text }}
                </option>
              </select>
            </div>
            <div class="col-sm-2">
              <button
                class="btn btn-outline-primary btn-sm ml-2"
                @click="refreshMapList"
              >Refresh Database list</button>
            </div>
          </div>
          <div class="row my-1">
            <div class="col-sm-2 text-end"></div>
            <div class="col-sm-10 text-start">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="checkbox-removeGroup"
                  v-model="query.removeGroup"
                />
                <label class="form-check-label" for="checkbox-removeGroup">
                  Remove group tree (Flatten)
                </label>
              </div>
            </div>
          </div>
          <div class="row my-1">
            <div class="col-sm-2 text-end"></div>
            <div class="col-sm-10 text-start">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="checkbox-compact"
                  v-model="query.compact"
                />
                <label class="form-check-label" for="checkbox-compact">
                  Compact result format
                </label>
              </div>
            </div>
          </div>
          <div class="row my-1">
            <div class="col-sm-2 text-end"></div>
            <div class="col-sm-10 text-start">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="checkbox-descriptor"
                  v-model="query.descriptor"
                />
                <label class="form-check-label" for="checkbox-descriptor">
                  Descriptor only access (Select one Descriptor field or query)
                </label>
              </div>
            </div>
          </div>
          <div class="row my-1">
            <div class="col-sm-2 text-end">
              <label for="input-none">Fields to be queried:</label>
            </div>
            <div class="col-sm-6">
              <input
                type="text"
                class="form-control form-control-sm"
                id="input-none"
                v-model="query.fields"
                placeholder="Enter list of fields to be part of the query"
              />
            </div>
            <div class="col-sm-1">
              <button
                class="btn btn-outline-primary btn-sm ml-2"
                @click="clearFieldList"
              >Remove all fields</button>
            </div>
            <div class="col-sm-1">
              <button
                class="btn btn-outline-primary btn-sm ml-2"
                @click="addAllFieldList"
              >Set all fields</button>
            </div>
          </div>
          <div class="row my-1">
            <div class="col-sm-2 text-end">
              <label for="input-none">Search:</label>
            </div>
            <div class="col-sm-9">
              <input
                type="text"
                class="form-control form-control-sm"
                id="input-none"
                v-model="query.search"
                placeholder="Enter search used in Adabas query"
              />
            </div>
          </div>
          <div class="row my-1">
            <div class="col-md-2 text-end">
              <label for="input-none">Maximum number of records per read:</label>
            </div>
            <div class="col-md-3">
              <input
                type="number"
                class="form-control form-control-sm"
                id="input-limit"
                v-model="query.limit"
                min="0"
                max="1024"
                placeholder="Default"
              />
            </div>
            <div class="col-md-2 text-end">
              <label for="input-none">Offset of the query:</label>
            </div>
            <div class="col-md-3">
              <input
                type="number"
                class="form-control form-control-sm"
                id="input-offset"
                v-model="query.offset"
                min="0"
                placeholder="Default"
              />
            </div>
          </div>
          <div class="row my-1">
            <div class="col-sm-2 text-end">
              <label for="input-none">Sorted by:</label>
            </div>
            <div class="col-sm-9">
              <select
                v-model="selectedSortField"
                id="input-none"
                class="form-select form-select-sm"
              >
                <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                  {{ option.text }}
                </option>
              </select>
            </div>
          </div>
          <button
            class="btn btn-outline-primary ml-2"
            @click="callQuery"
          >Query data</button>
        </div>
        <Url url="/adabas/database" />
      </div>
    </div>
    <div class="card border-secondary mb-3">
      <div class="card-header bg-secondary text-white">
        <button class="btn btn-primary text-start w-100" data-bs-toggle="collapse" data-bs-target="#accordion-1" aria-expanded="true" aria-controls="accordion-1">
          Response
        </button>
      </div>
      <div id="accordion-1" class="collapse show" data-bs-parent="#my-accordion">
        <div class="card-body">
          <div class="card-text">
            <div class="container-fluid">
              <div class="row">
                <div class="col-sm-8">
                  <nav aria-label="Page navigation">
                    <ul class="pagination">
                      <li class="page-item" v-for="page in Math.ceil(rows / perPage)" :key="page">
                        <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
                      </li>
                    </ul>
                  </nav>
                </div>
                <div class="col-sm-2 text-end">Record per page:</div>
                <div class="col-sm-2">
                  <select v-model="perPage" class="form-select form-select-sm">
                    <option v-for="option in perPageOptions" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-sm-8">
                  <div class="input-group input-group-sm mb-3">
                    <span class="input-group-text" id="filterInput">Filter</span>
                    <input
                      type="search"
                      class="form-control"
                      v-model="filter"
                      placeholder="Type to search in result list"
                    />
                    <button class="btn btn-outline-secondary" type="button" :disabled="!filter" @click="filter = ''">Clear</button>
                  </div>
                </div>
              </div>
            </div>
            <p class="mt-3">Current Page: {{ currentPage }}</p>
            <table class="table table-striped table-bordered table-hover table-sm">
              <thead>
                <tr>
                  <th v-for="field in fields" :key="field">{{ field }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in paginatedRecords" :key="record.id">
                  <td v-for="field in fields" :key="field">{{ record[field] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
        <StatusBar />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, computed } from 'vue';
import store from '../store/index';
import { config } from '../store/config';
import StatusBar from '@/components/StatusBar.vue';
import Url from './Url.vue';

export default defineComponent({
  name: 'MapData',
  components: { StatusBar, Url },
  props: {
    classicMode: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const perPage = ref(10);
    const currentPage = ref(1);
    const perPageOptions = ref([10, 20, 50, 100]);
    const filter = ref('');
    const filterOn = ref([]);
    const maps = ref(store.state.maps);
    const url = ref(config.Url() + '/rest/map/');
    const selected = ref(null);
    const file = ref(null);
    const storeRecord = computed(() => store.state.records);
    const status = ref(store.state.status);
    const metadata = ref(store.state.metadata);
    const records = ref([] as any[]);
    const jsonString = ref('No query JSON result available');
    const options = ref([{ value: null, text: 'Please select the Adabas Map used for the query' }]);
    const optionsDatabases = ref([{ value: null, text: 'Please select an Adabas Database' }]);
    const optionsFiles = ref([{ value: null, text: 'Please select an Adabas File' }]);
    const selectedSortField = ref(null);
    const sortOptions = ref([{ value: null, text: 'Please select Field' }]);
    const fields = ref([] as any[]);
    const query = ref({
      map: '',
      database: { url: null as any, file: null as any },
      fields: [] as any[],
      validFields: [] as any[],
      offset: 0,
      limit: 20,
      search: '',
      removeGroup: false,
      compact: false,
      descriptor: false,
    });

    onMounted(() => {
      if (props.classicMode == 'true') {
        store.dispatch('INIT_DATABASES').then((dbs) => {
          adaptDbOptions(dbs);
        });
      } else {
        store.dispatch('INIT_MAPS').then((response) => {
          adaptMapOptions();
        }).catch((reason: any) => {
          console.log('Error reason(created): ' + JSON.stringify(reason));
        });
      }
    });

    watch([perPage, records], () => {
      currentPage.value = 1;
    });

    const paginatedRecords = computed(() => {
      const start = (currentPage.value - 1) * perPage.value;
      const end = start + perPage.value;
      return records.value.slice(start, end);
    });

    const rows = computed(() => {
      if (!records.value) {
        return 0;
      }
      return records.value.length;
    });

    function getSelectedItem(myarg: any) {
        myarg = (event.target as HTMLSelectElement).value;
      if (props.classicMode == 'true') {
        let s = myarg;
        query.value.database.url = s;
        url.value = config.Url() + '/rest/db/' + s;
        store.dispatch('QUERY_DB_FILES', s).then((dbFiles) => {
          const optionsFilesList = [{ value: null, text: 'Please select an Adabas File' }];
          dbFiles.forEach((i: any) => {
            optionsFilesList.push({ value: i, text: i });
          });
          optionsFiles.value = optionsFilesList;
        });
      } else {
        if (query.value.map !== myarg) {
          url.value = config.Url() + '/rest/map/' + myarg;
          query.value.map = myarg;
          query.value.fields = [];
          query.value.validFields = [];
        }

        store.dispatch('QUERY_MAP_FIELDS', myarg).then((response) => {
          generateAllFields(response.data);
        });
      }
    }

    function getFileItem(myarg: any) {
      var n = selected.value.indexOf('(');
      let s = selected.value.substring(0, n != -1 ? n : selected.value.length);
      url.value = config.Url() + '/rest/db/' + s + '/' + file.value;
      query.value.map = '';
      if (selected.value != null) {
        query.value.database.url = s;
        query.value.database.file = file.value;
      }
      query.value.fields = [];
      query.value.validFields = [];
      store.dispatch('QUERY_FILE_FIELDS', query.value.database).then((response) => {
        generateAllFields(response.data);
      });
    }

    function generateUrl() {
      let urlStr = config.Url();
      if (props.classicMode == 'true') {
        var n = query.value.database.url.indexOf('(');
        let s = query.value.database.url.substring(0, n != -1 ? n : query.value.database.url.length);
        urlStr += '/rest/db/' + s + '/' + query.value.database.file;
      } else {
        urlStr += '/rest/map/' + query.value.map;
      }
      let first = false;
      if (query.value.fields.length != query.value.validFields.length) {
        urlStr += '?fields=' + query.value.fields;
        first = true;
      }
      if (query.value.search != '') {
        if (!first) {
          urlStr += '?';
        } else {
          urlStr += '&';
        }
        urlStr += 'search=' + query.value.search;
        first = true;
      }
      if (query.value.limit > 0) {
        if (!first) {
          urlStr += '?';
        } else {
          urlStr += '&';
        }
        urlStr += 'limit=' + query.value.limit;
        first = true;
      }
      if (query.value.offset > 0) {
        if (!first) {
          urlStr += '?';
        } else {
          urlStr += '&';
        }
        urlStr += 'start=' + query.value.offset;
        first = true;
      }
      if (selectedSortField.value !== null) {
        if (!first) {
          urlStr += '?';
        } else {
          urlStr += '&';
        }
        urlStr += 'sorted_by=' + selectedSortField.value;
        first = true;
      }
      if (query.value.removeGroup) {
        if (!first) {
          urlStr += '?';
        } else {
          urlStr += '&';
        }
        urlStr += 'flatten=true';
        first = true;
      }
      if (query.value.compact) {
        if (!first) {
          urlStr += '?';
        } else {
          urlStr += '&';
        }
        urlStr += 'compact=true';
        first = true;
      }
      if (query.value.descriptor) {
        if (!first) {
          urlStr += '?';
        } else {
          urlStr += '&';
        }
        urlStr += 'descriptor=true';
        first = true;
      }
      return urlStr;
    }

    async function callQuery() {
      const urlStr = generateUrl();
      url.value = urlStr;
      fields.value = null;
      try {
        await store.dispatch('QUERY_RECORDS', url.value);
      } catch (err) {
        console.log("Query error: " + JSON.stringify(err));
      }
      jsonString.value = JSON.stringify(records.value);
    }

    function refreshMapList() {
      store.dispatch('INIT_MAPS').then((response) => {
        adaptMapOptions();
      });
    }

    function addAllFieldList() {
      query.value.fields = [];
      query.value.validFields.forEach((f: any) => {
        query.value.fields.push(f);
      });
    }

    function clearFieldList() {
      query.value.fields = [];
    }

    function adaptDbOptions(dbs: any) {
      const optionsDatabasesList = [{ value: null, text: 'Please select an Adabas Database' }];
      dbs.forEach((i: any) => {
        optionsDatabasesList.push({ value: i.url, text: i.url });
      });
      optionsDatabases.value = optionsDatabasesList;
    }

    function adaptMapOptions() {
      const optionsList = [{ value: null, text: 'Please select an Adabas Map' }];
      maps.value.forEach((i: any) => {
        optionsList.push({ value: i, text: i });
      });
      options.value = optionsList;
    }

    function adaptFields(value: any) {
      if (fields.value == null) {
        const fs = [];
        if (records.value && records.value.length > 0) {
          for (const x in records.value[0]) {
            fs.push(x);
          }
        }
        fields.value = fs;
      }
    }

    function generateAllFields(metadata: any) {
      query.value.fields = [];
      query.value.validFields = [];
      sortOptions.value = [{ value: null, text: 'Select field to be sorted for' }];
      if (props.classicMode == 'true') {
        metadata.forEach((m: any) => {
          if (m.label.trim() !== '') {
            query.value.fields.push(m.label);
            query.value.validFields.push(m.label);
            sortOptions.value.push({ value: m.label, text: m.label });
          }
        });
      } else {
        metadata.Map.fields.forEach((m: any) => {
          if (m.name.trim() !== '') {
            query.value.fields.push(m.name);
            query.value.validFields.push(m.name);
            sortOptions.value.push({ value: m.name, text: m.name });
          }
        });
      }
    }

    function tagValidator(tag: string) {
      return query.value.validFields.indexOf(tag) > -1;
    }

    watch(metadata, (newvalue) => {
      query.value.fields = [];
      query.value.validFields = [];
      sortOptions.value = [{ value: null, text: 'No sorting' }];
      newvalue.metadata.Map.fields.forEach((m: any) => {
        if (m.name.trim() !== '') {
          query.value.fields.push(m.name);
          query.value.validFields.push(m.name);
          sortOptions.value.push({ value: m.name, text: m.name });
        }
      });
    });

    watch(storeRecord, (newValue) => {
      if (newValue?.Records) {
        records.value = newValue.Records;
        jsonString.value = JSON.stringify(newValue);

        if (!fields.value) {
          adaptFields(records.value);
        }
      } else {
        records.value = [];
        jsonString.value = '';
      }
    });

    return {
      perPage,
      currentPage,
      perPageOptions,
      filter,
      filterOn,
      maps,
      url,
      selected,
      file,
      storeRecord,
      status,
      metadata,
      records,
      jsonString,
      options,
      optionsDatabases,
      optionsFiles,
      selectedSortField,
      sortOptions,
      fields,
      query,
      get rows() {
        if (!records.value) {
          return 0;
        }
        return records.value.length;
      },
      getSelectedItem,
      getFileItem,
      generateUrl,
      callQuery,
      refreshMapList,
      addAllFieldList,
      clearFieldList,
      adaptDbOptions,
      adaptMapOptions,
      adaptFields,
      generateAllFields,
      tagValidator,
      paginatedRecords,
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
#my-table {
  font-size: 12px;
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
