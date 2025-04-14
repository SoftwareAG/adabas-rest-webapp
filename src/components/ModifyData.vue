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
  <div class="modifydata p-2" overflow-y="auto">
    <div class="card border-secondary">
      <div class="card-header border-secondary">
        Modify Adabas database
      </div>
      <div class="card-body">
        <p>
          This application provides access to Adabas data using the Adabas
          RESTful administration and the Adabas Map technology defined and being
          used in Adabas Client for Java.
        </p>
        <p>
          This application provide administration operations being called to
          Adabas database.
        </p>
        <div class="container-fluid">
          <div class="row my-1">
            <div class="col-sm-3 text-end">
              <label>Select Map to be displayed:</label>
            </div>
            <div class="col-sm-5">
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
              >
                Refresh Map list
              </button>
            </div>
          </div>
          <div class="row my-1">
            <div class="col-sm-3 text-end">
              <label for="input-none">Fields:</label>
            </div>
            <div class="col-sm-5">
              <input
                id="input-none"
                v-model="query.fields"
                class="form-control form-control-sm"
                placeholder="Enter fields to restrict to"
              />
            </div>
            <div class="col"></div>
          </div>
          <div class="row my-1">
            <div class="col-sm-3 text-end">
              <label for="input-none">Search:</label>
            </div>
            <div class="col-sm-5">
              <input
                id="input-none"
                v-model="query.search"
                class="form-control form-control-sm"
                placeholder="Enter search"
              />
            </div>
            <div class="col-sm-2">
              <button
                class="btn btn-outline-primary btn-sm ms-2"
                @click="readData()"
              >
                Apply query parameter
              </button>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-3">
              <button
                class="btn btn-outline-primary btn-sm ms-2"
                @click="decrement()"
              >
                Previous
              </button>
              <button
                class="btn btn-outline-primary btn-sm ms-2"
                @click="increment()"
              >
                Next
              </button>
            </div>
            <div class="col-sm-5">
              <label>Records found:</label>{{ record.length }}
            </div>
            <div class="col-sm-2">
              <button
                class="btn btn-outline-primary btn-sm ms-2"
                @click="updateRecord()"
              >
                Update record
              </button>
            </div>
          </div>
        </div>
        {{ data }}
        <table
          id="my-table"
          ref="table"
          class="table table-striped table-bordered table-hover table-sm"
        >
          <thead>
            <tr>
              <th v-for="field in fields" :key="field">{{ field }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in mapFields" :key="row.name">
              <td>{{ row.name + '(' + row.shortName + ')' }}</td>
              <td>
                <div v-if="row.name == 'ISN'">
                  {{ getCurrentIsn() }}
                </div>
                <div
                  v-else-if="
                    row.formatType.trim() == 'A' ||
                      row.formatType.trim() == 'U' ||
                      row.formatType.trim() == 'B' ||
                      row.formatType.trim() == 'P'
                  "
                >
                  <input
                    @input="changeInput($event, row)"
                    :value="getData(row.reference)"
                    class="form-control form-control-sm"
                  />
                </div>
                <div v-else>----------------</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import store from '../store/index';
import { config } from '../store/config';
import { authHeader } from '../user/auth-header';
import axios, { AxiosResponse } from 'axios';
import { userService } from '../user/service';

export default defineComponent({
  name: 'ModifyData',
  setup() {
    const curIndex = ref(0);
    const maps = ref(store.state.maps);
    const url = ref(config.Url() + '/rest/metadata/map/<to be selected>');
    const dataUrl = ref('');
    const mapFields = ref([]);
    const selected = ref(null);
    const index = ref(1);
    const mapName = ref('');
    const fields = ref(['field', 'contentType', 'formatType', 'length', 'input']);
    const options = ref([{ value: null, text: 'Please select an Adabas Map' }]);
    const record = ref([] as any[]);
    const query = ref({ search: '', fields: '' });

    onMounted(() => {
      if (maps.value.length == 0) {
        refreshMapList();
      } else {
        adaptMapOptions();
      }
    });

    function increment() {
      if (curIndex.value < record.value.length - 1) {
        curIndex.value++;
        (this.$refs.table as any).refresh();
      }
    }

    function decrement() {
      if (curIndex.value === 0) {
        alert('Negative quantity not allowed');
      } else {
        curIndex.value--;
        (this.$refs.table as any).refresh();
      }
    }

    function getCurrentIsn() {
      if (record.value.length > curIndex.value) {
        return record.value[curIndex.value].ISN;
      }
      return -1;
    }

    function getSelectedItem(myarg: any) {
      query.value.search = '';
      query.value.fields = '';
      mapName.value = myarg;
      url.value = config.Url() + '/rest/metadata/map/' + myarg;

      store.dispatch('QUERY_MAP_FIELDS', myarg).then((response) => {
        mapFields.value = [{ name: 'ISN', formatType: 'B', shortName: '' }];
        response.data.Map.fields.forEach((element: any) => {
          mapFields.value.push(element);
        });
        readData();
      });
    }

    function changeInput(event: any, item: any) {
      const ref = item.reference;
      let r = record.value[curIndex.value];
      if (ref) {
        let s = ref.split('.');
        s.forEach((x: any) => {
          if (s[s.length - 1] == x) {
            r[x] = event;
          }
          r = r[x];
        });
      }
    }

    function getData(ref: string) {
      let r = record.value[curIndex.value];
      if (ref) {
        ref.split('.').forEach((x: any) => {
          r = r[x];
        });
      }
      return r;
    }

    function adaptMapOptions() {
      const optionsList = [{ value: null, text: 'Please select an Adabas Map' }];
      maps.value.forEach((i: any) => {
        optionsList.push({ value: i, text: i });
        options.value = optionsList;
      });
    }

    function refreshMapList() {
      store.dispatch('INIT_MAPS').then((response) => {
        adaptMapOptions();
      }).catch((reason: any) => {
        console.log('Reason(created): ' + JSON.stringify(reason));
      });
    }

    function readData(): Promise<void> {
      dataUrl.value = config.Url() + '/rest/map/' + mapName.value;
      if (query.value.search !== '' || query.value.fields !== '') {
        dataUrl.value = dataUrl.value + '?';
        if (query.value.search !== '') {
          dataUrl.value = dataUrl.value + 'search=' + query.value.search;
        }
        if (query.value.search !== '' && query.value.fields !== '') {
          dataUrl.value = dataUrl.value + '&';
        }
        if (query.value.fields !== '') {
          dataUrl.value = dataUrl.value + 'fields=' + query.value.fields;
        }
      }
      const getConfig = {
        headers: authHeader('application/json'),
        useCredentails: true,
      };
      store.commit('SET_URL', { url: dataUrl.value, method: 'get' });
      return axios.get(dataUrl.value, getConfig).then((response: any) => {
        curIndex.value = 0;
        record.value = response.data.Records;
        mapFields.value.forEach((element: any) => {
          let n = searchReference(element.name, record.value[0]);
          if (n) {
            element.reference = n;
          }
        });
        if (query.value.fields !== '') {
          refreshRecordMapList(record.value[0]);
          (this.$refs.table as any).refresh();
        }
      }).catch((error: any) => {
        if (error.response) {
          if (error.response.status == 401 || error.response.status == 403) {
            userService.logout();
            location.reload();
          }
        }
        throw error;
      });
    }

    function refreshRecordMapList(data: any) {
      let newMapList = [] as any[];
      mapFields.value.forEach((element: any) => {
        let s = searchReference(element.name, record.value[curIndex.value]);
        if (s !== '') {
          newMapList.push(element);
        }
      });
      mapFields.value = newMapList;
    }

    function updateRecord(): Promise<void> {
      const getConfig = {
        headers: authHeader('application/json'),
        useCredentails: true,
      };
      const inputData = { Store: [] as any[] };
      inputData.Store.push(record.value[curIndex.value]);
      let url = config.Url() + '/rest/map/' + mapName.value;
      return axios.put(url, inputData, getConfig).then((response: AxiosResponse<any>) => {
        console.log('Updated');
      }).catch((error: any) => {
        console.log('Update error:' + error);
      });
    }

    function searchReference(field: string, data: any): string {
      let x = '';
      Object.keys(data).every((element: any) => {
        if (field === element) {
          x = element;
          return false;
        }
        if (data[element] && typeof data[element] === 'object') {
          let s = searchReference(field, data[element]);
          if (s !== '') {
            x = element + '.' + s;
            return false;
          }
        }
        return true;
      });
      return x;
    }

    return {
      curIndex,
      maps,
      url,
      dataUrl,
      mapFields,
      selected,
      index,
      mapName,
      fields,
      options,
      record,
      query,
      increment,
      decrement,
      getCurrentIsn,
      getSelectedItem,
      changeInput,
      getData,
      adaptMapOptions,
      refreshMapList,
      readData,
      refreshRecordMapList,
      updateRecord,
      searchReference,
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
