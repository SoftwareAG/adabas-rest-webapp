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
  <div class="bufferpooldisplay p-2">
    <Sidebar :url="url" />
    <b-card
      :header="'Adabas Database Buffer Pool for database ' + url"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-container fluid>
          <b-row
            ><b-col>
              This page provide the list of Adabas database Buffer Pool to be
              administrate through this Adabas RESTful server.
            </b-col>
          </b-row>
          <b-row
            ><b-col>
              <Url url="/adabas/database" />
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">
              Buffer Pool Size
            </b-col>
            <b-col>
              {{ bufferPoolSize.toLocaleString() }}
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">
              Write Limit
            </b-col>
            <b-col>
              {{
                searchValue('WriteLimit').toLocaleString() +
                  ' (' +
                  ((searchValue('WriteLimit') / bufferPoolSize) * 100).toFixed(
                    2,
                  ) +
                  '%)'
              }}
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">
              Modified
            </b-col>
            <b-col>
              {{ searchValue('Modified').toLocaleString() }}
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <div class="font-weight-bold">
                Pool Allocations
              </div>
              <b-table
                striped
                bordered
                hover
                small
                :items="search('Alloc')"
                :fields="statFields"
              >
                <template v-slot:cell(Name)="row">
                  {{
                    row.item.Name.substring(5)
                      .replace(/([A-Z])/g, ' $1')
                      .trim()
                  }}
                </template>
                <template v-slot:cell(Value)="row">
                  {{ row.item.Value.toLocaleString() }}
                </template>
                <template v-slot:cell(percent)="row">
                  {{ ((row.item.Value / bufferPoolSize) * 100).toFixed(2) }}%
                </template>
              </b-table>
            </b-col>
            <b-col>
              <div class="font-weight-bold">
                I/O statistics
              </div>
              <b-table
                striped
                bordered
                hover
                small
                :items="search('IO')"
                :fields="fields"
              >
                <template v-slot:cell(Name)="row">
                  {{
                    row.item.Name.substring(2)
                      .replace(/([A-Z])/g, ' $1')
                      .trim()
                  }}
                </template>
                <template v-slot:cell(Value)="row">
                  {{ row.item.Value.toLocaleString() }}
                </template>
              </b-table>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <div class="font-weight-bold">
                RABNs present
              </div>
              <b-table
                striped
                bordered
                hover
                small
                :items="search('Rabns')"
                :fields="fields"
              >
                <template v-slot:cell(Name)="row">
                  {{
                    row.item.Name.substring(5)
                      .replace(/([A-Z])/g, ' $1')
                      .trim()
                  }}
                </template>
                <template v-slot:cell(Value)="row">
                  {{ row.item.Value.toLocaleString() }}
                </template>
              </b-table>
            </b-col>
            <b-col>
              <div class="font-weight-bold">
                Buffer Flushes
              </div>
              <b-table
                striped
                bordered
                hover
                small
                :items="search('Flushes')"
                :fields="fields"
              >
                <template v-slot:cell(Name)="row">
                  {{
                    row.item.Name.substring(7)
                      .replace(/([A-Z])/g, ' $1')
                      .trim()
                  }}
                </template>
                <template v-slot:cell(Value)="row">
                  {{ row.item.Value.toLocaleString() }}
                </template>
              </b-table>
            </b-col>
          </b-row>
        </b-container>
      </b-card-body>
    </b-card>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Sidebar from './Sidebar.vue';
import store from '../store/index';
import StatusBar from './StatusBar.vue';
import Url from './Url.vue';

@Component({
  components: {
    StatusBar,
    Sidebar,
    Url,
  },
})
export default class BufferPoolData extends Vue {
  @Prop(String) readonly url: string | undefined;
  data() {
    return {
      bufferPoolSize: 0,
      fields: ['Name', 'Value'],
      statFields: ['Name', 'percent', 'Value'],
      bufferpool: [],
    };
  }
  created() {
    const db = store.getters.search(this.url);
    db.bpStats().then((response: any) => {
      this.$data.bufferpool = response;
      this.$data.bufferPoolSize = this.searchValue('Size');
    });
  }
  searchValue(s: string): number {
    let v = this.$data.bufferpool.filter((row: any) => {
      return row.Name === s;
    });
    if (v.length > 0) {
      return v[0].Value;
    }
    return 0;
  }
  search(s: string): any {
    return this.$data.bufferpool.filter((row: any) => {
      return row.Name.startsWith(s);
    });
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
