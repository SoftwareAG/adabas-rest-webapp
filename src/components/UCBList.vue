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
  <div class="ucblist p-2">
    <Sidebar :url="url" />
    <b-card
      :header="'Adabas Database UCB list for database ' + url"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-container fluid>
          <b-row
            ><b-col>
              This page provides the list of Adabas database utility control
              block active in the database.
            </b-col>
          </b-row>
          <b-row
            ><b-col>
              <Url />
            </b-col>
          </b-row>
          <b-row
            ><b-col>
              <b-table
                striped
                bordered
                hover
                small
                :items="ucb"
                :fields="fields"
              >
                <template v-slot:cell(files)="row">
                  {{ listUcbFiles(row.item.Count, row.item.ucbFiles) }}
                </template>
              </b-table>
            </b-col>
          </b-row></b-container
        ></b-card-body
      ></b-card
    >
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Sidebar from './Sidebar.vue';
import StatusBar from './StatusBar.vue';
import Url from './Url.vue';
import store from '../store/index';
import { SearchDatabases } from '@/adabas/admin';

@Component({
  components: {
    Sidebar,
    StatusBar,
    Url,
  },
})
export default class UCBList extends Vue {
  @Prop(String) readonly url: string | undefined;
  data() {
    return {
      fields: ['Count', 'DBMode', 'Date', 'Id', 'Sequence', 'files'],
      ucb: [],
      timer: '',
      db: null,
    };
  }
  created() {
    this.$data.db = SearchDatabases(this.url);
    this.$data.timer = setInterval(this.loadUCBList, 5000);
    this.loadUCBList();
  }
  loadUCBList() {
    this.$data.db.ucb().then((response: any) => {
      this.$data.ucb = response;
    });
  }
  listUcbFiles(count: number, ucbFiles: any) {
    if (count === -1) {
      return ['*'];
    }
    let f = [] as string[];
    ucbFiles.forEach((element: any) => {
      f.push(element.UcbFile);
    });
    return f;
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
