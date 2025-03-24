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
  <div class="modifydata p-2">
    <b-card
      header="Modify Adabas database"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <p>
          This application provides access to Adabas data using the Adabas
          RESTful administration and the Adabas Map technology defined and being
          used in Adabas Client for Java.
        </p>
        <p>
          This application provide administration operations being called to
          Adabas database.
        </p>
        <b-container fluid>
          <b-row class="my-1">
            <b-col sm="3" class="text-right">
              <label>Select Map to be displayed:</label>
            </b-col>
            <b-col sm="5">
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
          <b-row class="my-1">
            <b-col sm="3" class="text-right">
              <label for="input-none">Fields:</label>
            </b-col>
            <b-col sm="5">
              <b-form-input
                id="input-none"
                v-model="query.fields"
                :state="null"
                size="sm"
                placeholder="Enter fields to restrict to"
              />
            </b-col>
          </b-row>
          <b-row class="my-1">
            <b-col sm="3" class="text-right">
              <label for="input-none">Search:</label>
            </b-col>
            <b-col sm="5">
              <b-form-input
                id="input-none"
                v-model="query.search"
                :state="null"
                size="sm"
                placeholder="Enter search"
              />
            </b-col>
            <b-col sm="2">
              <b-button
                size="sm"
                variant="outline-primary"
                class="ml-2"
                @click="readData()"
                >Apply query parameter</b-button
              ></b-col>
            </b-row>
          <b-row>
            <b-col sm="3">
              <b-button
                size="sm"
                variant="outline-primary"
                class="ml-2"
                @click="decrement()"
                >Previous</b-button
              >
              <b-button
                size="sm"
                variant="outline-primary"
                class="ml-2"
                @click="increment()"
                >Next</b-button
              >
            </b-col>
            <b-col sm="5">
              <label>Records found:</label>{{ record.length }}
            </b-col>
            <b-col sm="2">
              <b-button
                size="sm"
                variant="outline-primary"
                class="ml-2"
                @click="updateRecord()"
                >Update record</b-button
              >
            </b-col>
          </b-row>
        </b-container>
        {{ data }}
        <b-table
          id="my-table"
          ref="table"
          striped
          bordered
          hover
          small
          :items="mapFields"
          :fields="fields"
        >
          <template v-slot:cell(field)="row">
            {{ row.item.name + '(' + row.item.shortName + ')' }}
          </template>
          <template v-slot:cell(input)="row">
            <div v-if="row.item.name == 'ISN'">
              {{ getCurrentIsn() }}
            </div>
            <div
              v-else-if="
                row.item.formatType.trim() == 'A' ||
                  row.item.formatType.trim() == 'U' ||
                  row.item.formatType.trim() == 'B' ||
                  row.item.formatType.trim() == 'P'
              "
            >
              <b-form-input
                @input="changeInput($event, row.item)"
                :value="getData(row.item.reference)"
              />
            </div>
            <div v-else>----------------</div>
          </template>
        </b-table>
      </b-card-body></b-card>
    </div>
  </template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator';
import store from '../store/index';
import { config } from '../store/config';
import { authHeader } from '../user/auth-header';
import axios, { AxiosResponse } from 'axios';
import { userService } from '../user/service';

@Component
export default class ModifyData extends Vue {
  curIndex: number = 0;
  maps: string[] = store.state.maps;
  url: string = config.Url() + '/rest/metadata/map/<to be selected>';
  dataUrl: string = '';
  mapFields: any[] = [];
  selected: any = null;
  index: number = 1;
  mapName: string = '';
  fields: [string, string, string, string, string] = ['field', 'contentType', 'formatType', 'length', 'input'];
  options: any[] = [{ value: null, text: 'Please select an Adabas Map' }];
  record: any[] = [];
  query: { search: string, fields: string } = { search: '', fields: '' };


  created() {
    if (this.maps.length == 0) {
      this.refreshMapList();
    } else {
      this.adaptMapOptions();
    }
  }
  increment(): void {
    if (this.curIndex < this.record.length - 1) {
      this.curIndex++;
      (this.$refs.table as any).refresh();
    }
  }
  decrement(): void {
    if (this.curIndex === 0) {
      alert('Negative quantity not allowed');
    } else {
      this.curIndex--;
      (this.$refs.table as any).refresh();
    }
  }
  getCurrentIsn(): number {
    if (this.record.length > this.curIndex) {
      return this.record[this.curIndex].ISN;
    }
    return -1;
  }
  getSelectedItem(myarg: any): void {
    // Just a regular js function that takes 1 arg
    this.query.search = '';
    this.query.fields = '';
    this.mapName = myarg;
    this.url = config.Url() + '/rest/metadata/map/' + myarg;

    store.dispatch('QUERY_MAP_FIELDS', myarg).then((response) => {
      this.mapFields = [{ name: 'ISN', formatType: 'B', shortName: '' }];
      response.data.Map.fields.forEach((element: any) => {
        this.mapFields.push(element);
      });
      this.readData();
    });
  }
  changeInput(event: any, item: any): void {
    const ref = item.reference;
    let r = this.record[this.curIndex];
    //let l = r;
    // console.log("Reference " + ref+" -> "+JSON.stringify(r));
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
  getData(ref: string): void {
    let r = this.record[this.curIndex];
    // console.log("Reference " + ref+" -> "+JSON.stringify(r));
    if (ref) {
      ref.split('.').forEach((x: any) => {
        r = r[x];
        // console.log("X " + x+" -> "+JSON.stringify(r));
      });
    }
    return r;
  }
  adaptMapOptions(): void {
    const options = [{ value: null, text: 'Please select an Adabas Map' }];
    this.maps.forEach((i: any) => {
      options.push({ value: i, text: i });
      this.options = options;
    });
  }
  refreshMapList(): void {
    console.log('Refresh maps: ' + this.maps.length);
    store
      .dispatch('INIT_MAPS')
      .then((response) => {
        console.log('Response: ' + JSON.stringify(response));
        this.adaptMapOptions();
      })
      .catch((reason: any) => {
        console.log('Reason(created): ' + JSON.stringify(reason));
      });
  }
  readData(): Promise<void> {
    this.dataUrl = config.Url() + '/rest/map/' + this.mapName; //+ "/" + this.index;
    if (this.query.search !== '' || this.query.fields !== '') {
      this.dataUrl = this.dataUrl + '?';
      if (this.query.search !== '') {
        this.dataUrl =
          this.dataUrl + 'search=' + this.query.search;
      }
      if (this.query.search !== '' && this.query.fields !== '') {
        this.dataUrl = this.dataUrl + '&';
      }
      if (this.query.fields !== '') {
        this.dataUrl =
          this.dataUrl + 'fields=' + this.query.fields;
      }
    }
    const getConfig = {
      headers: authHeader('application/json'),
      useCredentails: true,
    };
    store.commit('SET_URL', { url: this.dataUrl, method: 'get' });
    return axios
      .get(this.dataUrl, getConfig)
      .then((response: any) => {
        console.log('Data response: ' + JSON.stringify(response));
        this.curIndex = 0;
        this.record = response.data.Records;
        this.mapFields.forEach((element: any) => {
          //console.log("Work on " + element.name);
          let n = this.searchReference(element.name, this.record[0]);
          // console.log("Found search " + n);
          // element.reference = n;
          // console.log("Search : " + JSON.stringify(element));
          if (n) {
            element.reference = n;
          }
        });
        if (this.query.fields !== '') {
          this.refreshRecordMapList(this.record[0]);
          (this.$refs.table as any).refresh();
        }
      })
      .catch((error: any) => {
        if (error.response) {
          if (error.response.status == 401 || error.response.status == 403) {
            userService.logout();
            location.reload();
          }
        }
        throw error;
      });
  }
  refreshRecordMapList(data: any): void {
    let newMapList = [] as any[];
    this.mapFields.forEach((element: any) => {
      // console.log("Search "+element.name);
      let s = this.searchReference(
        element.name,
        this.record[this.curIndex],
      );
      // console.log("Found for "+element.name+" -> "+s);
      if (s !== '') {
        newMapList.push(element);
      }
    });
    this.mapFields = newMapList;
  }
  updateRecord(): Promise<void> {
    const getConfig = {
      headers: authHeader('application/json'),
      useCredentails: true,
    };
    const inputData = { Store: [] as any[] };
    inputData.Store.push(this.record[this.curIndex]);
    let url = config.Url() + '/rest/map/' + this.mapName;
    return axios
      .put(url, inputData, getConfig)
      .then((response: AxiosResponse<any>) => {
        console.log('Updated');
      })
      .catch((error: any) => {
        console.log('Update error:' + error);
      });
  }
  searchReference(field: string, data: any): string {
    //console.log("Search field "+field+" in "+JSON.stringify(data));
    let x = '';
    // const self = this;
    Object.keys(data).every((element: any, index: number) => {
      //  console.log("Check: " + element + " -> " + field+" "+typeof data[element]+" "+data[element]);
      if (field === element) {
        //console.log(index + ": Found " + element);
        x = element;
        return false;
      }
      if (data[element] && typeof data[element] === 'object') {
        //console.log(field+" -> Search in element "+element);
        let s = this.searchReference(field, data[element]);

        if (s !== '') {
          x = element + '.' + s;
          return false;
        }
      }
      return true;
    });
    return x;
  }
}
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
