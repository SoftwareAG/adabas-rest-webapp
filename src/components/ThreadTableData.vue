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
  <div class="threadtabledata p-2">
    <Sidebar :url="url" />
    <b-card
      :header="'Adabas Database thread table for database ' + url"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-container fluid>
          <b-row
            ><b-col>
              This page provides the list of Adabas database threads to be
              monitored through this Adabas RESTful server.
            </b-col>
          </b-row>
          <b-row
            ><b-col>
              <Url url="/adabas/database" />
            </b-col>
          </b-row>
          <b-row
            ><b-col>
              <b-table
                striped
                bordered
                hover
                small
                :items="threads"
                :fields="fields"
              >
                 <template v-slot:cell(CommandCount)="row">
                  {{new Intl.NumberFormat().format(row.item.CommandCount)}}
                </template>
             </b-table>
            </b-col> </b-row></b-container></b-card-body
    ></b-card>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Sidebar from './Sidebar.vue';
import StatusBar from './StatusBar.vue';
import store from '../store/index';
import Url from './Url.vue';
import { SearchDatabases } from '@/adabas/admin';

@Component({
  components: {
    Sidebar,
    StatusBar,
    Url,
  },
})
export default class ThreadTableData extends Vue {
  @Prop(String) readonly url: string | undefined;
  data() {
    return {
      fields: [
        'Thread',
        'APU',
        'CommandCode',
        'CommandCount',
        'File',
        'Status',
      ],
      threads: [],
      timer: '',
      db: null,
    };
  }
  created(): void {
    this.$data.db = SearchDatabases(this.url);
    this.loadThreadTable();
    this.$data.timer = setInterval(this.loadThreadTable, 5000);
  }
  loadThreadTable(): void {
    if (this.$data.db && this.$data.db != null) {
      this.$data.db.threadTable().then((response: any) => {
        this.$data.threads = response;
      });
    }
  }
  beforeDestroy(): void {
    clearInterval(this.$data.timer);
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
