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
  <div class="activitydisplay p-2">
    <Sidebar :url="url" />
    <b-card
      :header="'Adabas Database activity on database ' + url"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-container fluid>
          <b-row
            ><b-col>
              This page provides the activity of Adabas database to be
              monitored through this Adabas RESTful server.
            </b-col>
          </b-row>
          <b-row
            ><b-col>
              <Url url="/adabas/database" />
            </b-col>
          </b-row>
          <b-row
            ><b-col
              ><div class="font-weight-bold">
                I/O statistics
              </div>
              <b-table
                striped
                bordered
                hover
                small
                :items="searchArray(ioFields)"
                :fields="fields"
              >
                <template v-slot:cell(Name)="row">
                  {{ row.item.Name.replace(/([A-Z])/g, ' $1').trim() }}
                </template>
              </b-table> </b-col
            ><b-col
              ><div class="font-weight-bold">
                Throwbacks
              </div>
              <b-table
                striped
                bordered
                hover
                small
                :items="search('Thb')"
                :fields="fields"
              >
                <template v-slot:cell(Name)="row">
                  {{
                    row.item.Name.substring(3)
                      .replace(/([A-Z])/g, ' $1')
                      .trim()
                  }}
                </template>
              </b-table>
            </b-col>
          </b-row>
          <b-row
            ><b-col>
              <div class="font-weight-bold">
                Pool Hit Rate
              </div>
              <b-table
                striped
                bordered
                hover
                small
                :items="searchArray(statFields)"
                :fields="fields"
              >
                <template v-slot:cell(Name)="row">
                  {{ row.item.Name.replace(/([A-Z])/g, ' $1').trim() }}
                </template>
              </b-table> </b-col
            ><b-col
              ><div class="font-weight-bold">
                Interrupts
              </div>
              <b-table
                striped
                bordered
                hover
                small
                :items="searchArray(wpFields)"
                :fields="fields"
              >
                <template v-slot:cell(Name)="row">
                  {{
                    row.item.Name.substring(2)
                      .replace(/([A-Z])/g, ' $1')
                      .trim()
                  }}
                </template>
              </b-table>
            </b-col>
          </b-row>
        </b-container></b-card-body
      ></b-card
    >
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Sidebar from './Sidebar.vue';
import store from '../store/index';
import StatusBar from './StatusBar.vue';
import Url from './Url.vue';
import { SearchDatabases } from '@/adabas/admin';

@Component({
  components: {
    StatusBar,
    Sidebar,
    Url,
  },
})
export default class ActivityDisplay extends Vue {
  @Prop(String) readonly url: string | undefined;
  data() {
    return {
      fields: ['Name', 'Value'],
      activity: [],
      ioFields: ['BPHitRate', 'WorkReads', 'WorkWrites', 'PlogWrites'],
      statFields: ['BufferPoolIO', 'FPHitRate'],
      wpFields: ['WPSpaceWaitCurrent', 'WpSpaceWaitTotal'],
    };
  }
  created() {
    const db = SearchDatabases(this.url);
    db.activityStats().then((response: any) => {
      this.$data.activity = response;
    });
  }
  searchArray(s: any[]): any {
    return this.$data.activity.filter((row: any) => {
      return s.indexOf(row.Name) > -1;
    });
  }
  search(s: string): any {
    return this.$data.activity.filter((row: any) => {
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
