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
  <div class="mapdata p-2">
    <b-card
      header="Query Access Parameter"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <p>
          This page provides access to Adabas data using the Adabas Map
          technology used in Adabas Client for Java. Please select query
          information like search and field to be received.
        </p>
        <p>Press 'Query Data' to receive the result list in the table.</p>
        <b-container fluid>
          <b-row class="my-1" v-if="classicMode === 'false'">
            <b-col sm="2" class="text-right">
              <label>Select Map to be displayed: {{ classicMode }}</label>
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
          </b-row>
          <b-row class="my-1" v-else>
            <b-col sm="2" class="text-right">
              <label>Select Database to be displayed:</label>
            </b-col>
            <b-col sm="4">
              <b-form-select
                v-model="selected"
                @change="getSelectedItem"
                :options="optionsDatabases"
                size="sm"
                class="w-75"
              />
            </b-col>
            <b-col sm="4">
              <b-form-select
                v-model="file"
                @change="getFileItem"
                :options="optionsFiles"
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
                >Refresh Database list</b-button
              >
            </b-col>
          </b-row>
          <b-row class="my-1">
            <b-col sm="2" class="text-right" />
            <b-col sm="10" class="text-left">
              <b-form-checkbox
                id="checkbox-removeGroup"
                v-model="query.removeGroup"
                name="checkbox-removeGroup"
              >
                Remove group tree (Flatten)
              </b-form-checkbox>
            </b-col>
          </b-row>
          <b-row class="my-1">
            <b-col sm="2" class="text-right" />
            <b-col sm="10" class="text-left">
              <b-form-checkbox
                id="checkbox-compact"
                v-model="query.compact"
                name="checkbox-compact"
              >
                Compact result format
              </b-form-checkbox>
            </b-col>
          </b-row>
          <b-row class="my-1">
            <b-col sm="2" class="text-right" />
            <b-col sm="10" class="text-left">
              <b-form-checkbox
                id="checkbox-descriptor"
                v-model="query.descriptor"
                name="checkbox-descriptor"
              >
                Descriptor only access (Select one Descriptor field or query)
              </b-form-checkbox>
            </b-col>
          </b-row>
          <b-row class="my-1">
            <b-col sm="2" class="text-right">
              <label for="input-none">Fields to be queried:</label>
            </b-col>
            <b-col sm="6">
              <b-form-tags
                list="field-list"
                v-model="query.fields"
                type="text"
                size="sm"
                separator=" ,;"
                :tags="query.validFields"
                remove-on-delete
                :tag-validator="tagValidator"
                placeholder="Enter list of fields to be part of the query"
              >
              </b-form-tags>
            </b-col>
            <b-col sm="1">
              <b-button
                size="sm"
                variant="outline-primary"
                class="ml-2"
                v-on:click="clearFieldList"
                >Remove all fields</b-button
              >
            </b-col>
            <b-col sm="1">
              <b-button
                size="sm"
                variant="outline-primary"
                class="ml-2"
                v-on:click="addAllFieldList"
                >Set all fields</b-button
              >
            </b-col>
          </b-row>
          <b-row class="my-1">
            <b-col sm="2" class="text-right">
              <label for="input-none">Search:</label>
            </b-col>
            <b-col sm="9">
              <b-form-input
                id="input-none"
                v-model="query.search"
                :state="null"
                size="sm"
                placeholder="Enter search used in Adabas query"
              ></b-form-input>
            </b-col>
          </b-row>
          <b-row class="my-1">
            <b-col md="2" class="text-right">
              <label for="input-none"
                >Maximum number of records per read:</label
              >
            </b-col>
            <b-col md="3">
              <b-form-input
                id="input-limit"
                :state="null"
                v-model="query.limit"
                type="number"
                min="0"
                max="1024"
                size="sm"
                placeholder="Default"
              ></b-form-input>
            </b-col>
            <b-col md="2" class="text-right">
              <label for="input-none">Offset of the query:</label>
            </b-col>
            <b-col md="3">
              <b-form-input
                id="input-offset"
                :state="null"
                size="sm"
                type="number"
                min="0"
                v-model="query.offset"
                placeholder="Default"
              ></b-form-input>
            </b-col>
          </b-row>
          <b-row class="my-1">
            <b-col sm="2" class="text-right">
              <label for="input-none">Sorted by:</label>
            </b-col>
            <b-col sm="9">
              <b-form-select
                v-model="selectedSortField"
                id="input-none"
                :options="sortOptions"
                size="sm"
              />
            </b-col>
          </b-row>
          <b-button
            class="ml-2"
            href="#"
            variant="outline-primary"
            @click="callQuery"
            >Query data</b-button
          >
        </b-container>
        <Url url="/adabas/database" />
      </b-card-body>
    </b-card>
    <b-card
      no-body
      class="mb-1"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button class="text-left" block v-b-toggle.accordion-1 variant="primary"
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
                <b-col sm="8">
                  <b-pagination
                    v-model="currentPage"
                    :total-rows="rows"
                    :per-page="perPage"
                    aria-controls="my-table"
                  ></b-pagination>
                </b-col>
                <b-col class="text-right" sm="2">Record per page:</b-col>
                <b-col sm="2">
                  <b-form-select v-model="perPage" :options="perPageOptions"></b-form-select>
                </b-col>
              </b-row>
              <b-row>
                <b-col sm="8">
                  <b-form-group
                    label="Filter"
                    label-cols-sm="3"
                    label-align-sm="right"
                    label-size="sm"
                    label-for="filterInput"
                    class="mb-0"
                  >
                    <b-input-group size="sm">
                      <b-form-input
                        v-model="filter"
                        type="search"
                        id="filterInput"
                        placeholder="Type to search in result list"
                      ></b-form-input>
                      <b-input-group-append>
                        <b-button :disabled="!filter" @click="filter = ''"
                          >Clear</b-button
                        >
                      </b-input-group-append>
                    </b-input-group>
                  </b-form-group>
                </b-col>
              </b-row>
            </b-container>
            <p class="mt-3">Current Page: {{ currentPage }}</p>
            <b-table
              id="my-table"
              striped
              bordered
              hover
              :filter="filter"
              :filter-included-fields="filterOn"
              :per-page="perPage"
              :current-page="currentPage"
              small
              :items="records"
              :fields="fields"
            >
              <template v-for="(field, index) in fields" :key="index">
                <div>
                  {{ index }}{{ field.name }}
                  Am Confused
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

<script lang="ts" setup>
  import { ref, computed, onMounted } from 'vue';
  import store from '../store/index';
  import { config } from '../store/config';
  import StatusBar from './StatusBar.vue';
  import Url from './Url.vue';
  import { useRoute } from 'vue-router';

  const props = defineProps<{ classicMode: string }>();

  const perPage = ref(10);
  const currentPage = ref(1);
  const perPageOptions = ref([10, 20, 50, 100]);
  const filter = ref('');
  const filterOn = ref([]);
  const maps = store.state.maps;
  const records = ref<any[]>([]);
  const url = ref(config.Url() + '/rest/map/');
  const selected = ref(null);
  const file = ref(null);
  const jsonString = ref('No query JSON result available');
  const selectedSortField = ref(null);
  const sortOptions = ref([{ value: null, text: 'Please select Field' }]);
  const options = ref([{ value: null, text: 'Please select the Adabas Map used for the query' }]);
  const optionsDatabases = ref([{ value: null, text: 'Please select an Adabas Database' }]);
  const optionsFiles = ref([{ value: null, text: 'Please select an Adabas File' }]);

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

  const rows = computed(() => {
    return records.value ? records.value.length : 0;
  });

  onMounted(() => {
    if (props.classicMode === 'true') {
      store.dispatch('INIT_DATABASES').then((dbs) => {
        adaptDbOptions(dbs);
      });
    } else {
      store.dispatch('INIT_MAPS').then(() => {
        adaptMapOptions();
      });
    }
  });
  created(): void {
    // console.log("Created " + this.classicMode);
    if (this.classicMode == 'true') {
      store.dispatch('INIT_DATABASES').then((dbs) => {
        this.adaptDbOptions(dbs);
      });
    } else {
      store
        .dispatch('INIT_MAPS')
        .then((response) => {
          // console.log("Init maps response: " + JSON.stringify(response));
          this.adaptMapOptions();
        })
        .catch((reason: any) => {
          console.log('Error reason(created): ' + JSON.stringify(reason));
        });
    }
  }
  get rows(): number {
    if (!this.$data.records) {
      return 0;
    }
    return this.$data.records.length;
  }
  getSelectedItem(myarg: any): void {
    // Just a regular js function that takes 1 arg
    if (this.classicMode == 'true') {
      var n = myarg.indexOf('(');
      let s = myarg.substring(0, n != -1 ? n : myarg.length);
      this.$data.query.database.url = s;
      this.$data.url = config.Url() + '/rest/db/' + s;
      store.dispatch('QUERY_DB_FILES', s).then((dbFiles) => {
        const optionsFiles = [
          { value: null, text: 'Please select an Adabas File' },
        ];
        dbFiles.forEach((i: any, index: any) => {
          optionsFiles.push({ value: i, text: i });
        });
        this.$data.optionsFiles = optionsFiles;
      });
    } else {
      if (this.$data.query.map !== myarg) {
        this.$data.url = config.Url() + '/rest/map/' + myarg;
        this.$data.query.map = myarg;
        this.$data.query.fields = [];
        this.$data.query.validFields = [];
      }

      store.dispatch('QUERY_MAP_FIELDS', myarg).then((response) => {
        this.generateAllFields(response.data);
      });
    }
  }
  getFileItem(myarg: any): void {
    var n = this.$data.selected.indexOf('(');
    let s = this.$data.selected.substring(
      0,
      n != -1 ? n : this.$data.selected.length,
    );
    this.$data.url = config.Url() + '/rest/db/' + s + '/' + this.$data.file;
    this.$data.query.map = '';
    if (this.$data.selected != null) {
      this.$data.query.database.url = s;
      this.$data.query.database.file = this.$data.file;
    }
    this.$data.query.fields = [];
    this.$data.query.validFields = [];
    store
      .dispatch('QUERY_FILE_FIELDS', this.$data.query.database)
      .then((response) => {
        this.generateAllFields(response.data);
      });
  }
  generateUrl(): string {
    let url = config.Url();
    if (this.classicMode == 'true') {
      var n = this.$data.query.database.url.indexOf('(');
      let s = this.$data.query.database.url.substring(
        0,
        n != -1 ? n : this.$data.query.database.url.length,
      );
      url += '/rest/db/' + s + '/' + this.$data.query.database.file;
    } else {
      url += '/rest/map/' + this.$data.query.map;
    }
    let first = false;
    if (this.$data.query.fields.length != this.$data.query.validFields.length) {
      url += '?fields=' + this.$data.query.fields;
      first = true;
    }
    if (this.$data.query.search != '') {
      if (!first) {
        url += '?';
      } else {
        url += '&';
      }
      url += 'search=' + this.$data.query.search;
      first = true;
    }
    if (this.$data.query.limit > 0) {
      if (!first) {
        url += '?';
      } else {
        url += '&';
      }
      url += 'limit=' + this.$data.query.limit;
      first = true;
    }
    if (this.$data.query.offset > 0) {
      if (!first) {
        url += '?';
      } else {
        url += '&';
      }
      url += 'start=' + this.$data.query.offset;
      first = true;
    }
    if (this.$data.selectedSortField !== null) {
      if (!first) {
        url += '?';
      } else {
        url += '&';
      }
      url += 'sorted_by=' + this.$data.selectedSortField;
      first = true;
    }
    if (this.$data.query.removeGroup) {
      if (!first) {
        url += '?';
      } else {
        url += '&';
      }
      url += 'flatten=true';
      first = true;
    }
    if (this.$data.query.compact) {
      if (!first) {
        url += '?';
      } else {
        url += '&';
      }
      url += 'compact=true';
      first = true;
    }
    if (this.$data.query.descriptor) {
      if (!first) {
        url += '?';
      } else {
        url += '&';
      }
      url += 'descriptor=true';
      first = true;
    }
    return url;
  }
  callQuery(): void {
    const url = this.generateUrl();
    this.$data.url = url;
    this.$data.fields = null;
    store.dispatch('QUERY_RECORDS', this.$data.url).catch((reason: any) => {
      console.log('Query error: ' + JSON.stringify(reason));
    });
    this.$data.jsonString = JSON.stringify(this.$data.records);
  }
  refreshMapList(): void {
    store.dispatch('INIT_MAPS').then((response) => {
      this.adaptMapOptions();
    });
  }
  addAllFieldList(): void {
    this.$data.query.fields = [];
    this.$data.query.validFields.forEach((f: any) => {
      this.$data.query.fields.push(f);
    });
  }
  clearFieldList(): void {
    this.$data.query.fields = [];
  }
  adaptDbOptions(dbs: any): void {
    const optionsDatabases = [
      { value: null, text: 'Please select an Adabas Database' },
    ];
    dbs.forEach((i: any, index: any) => {
      optionsDatabases.push({ value: i.url, text: i.url });
    });
    this.$data.optionsDatabases = optionsDatabases;
  }
  adaptMapOptions(): void {
    const options = [{ value: null, text: 'Please select an Adabas Map' }];
    this.$data.maps.forEach((i: any, index: any) => {
      options.push({ value: i, text: i });
    });
    this.$data.options = options;
  }
  adaptFields(value: any): void {
    if (this.$data.fields == null) {
      const fs = [];
      /* Adapt and parse received data */
      if (this.$data.records && this.$data.records.length > 0) {
        for (const x in this.$data.records[0]) {
          fs.push(x);
        }
      }
      this.$data.fields = fs;
    }
  }
  generateAllFields(metadata: any): void {
    this.$data.query.fields = [];
    this.$data.query.validFields = [];
    this.$data.sortOptions = [
      { value: null, text: 'Select field to be sorted for' },
    ];
    if (this.classicMode == 'true') {
      metadata.forEach((m: any) => {
        if (m.label.trim() !== '') {
          this.$data.query.fields.push(m.label);
          this.$data.query.validFields.push(m.label);
          this.$data.sortOptions.push({ value: m.label, text: m.label });
        }
      });
    } else {
      metadata.Map.fields.forEach((m: any) => {
        if (m.name.trim() !== '') {
          this.$data.query.fields.push(m.name);
          this.$data.query.validFields.push(m.name);
          this.$data.sortOptions.push({ value: m.name, text: m.name });
        }
      });
    }
  }
  tagValidator(tag: string): boolean {
    return this.$data.query.validFields.indexOf(tag) > -1;
  }
  @Watch('metadata')
  onMetadataChange(value: any, newvalue: any) {
    this.$data.query.fields = [];
    this.$data.query.validFields = [];
    this.$data.sortOptions = [{ value: null, text: 'No sorting' }];
    newvalue.metadata.Map.fields.forEach((m: any) => {
      if (m.name.trim() !== '') {
        this.$data.query.fields.push(m.name);
        this.$data.query.validFields.push(m.name);
        this.$data.sortOptions.push({ value: m.name, text: m.name });
      }
    });
  }
  @Watch('storeRecord')
  onStoreRecordChange(value: any, newvalue: any) {
    this.$data.records = newvalue[0].Records;
    if (this.$data.fields == null) {
      this.adaptFields(this.$data.records);
    }
    this.$data.jsonString = JSON.stringify(newvalue[0]);
  }
}
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
</style>
