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
  <div class="nucleuslog p-2">
    <Sidebar :url="url" />
    <b-card
      :header="'Adabas Databases Nucleus log of database ' + url"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-container fluid>
          <b-row
            ><b-col>
              This page provides the Adabas database nucleus log output.
            </b-col></b-row
          >
          <b-row
            ><b-col> <Url url="/adabas/database" /> </b-col
          ></b-row>
          <b-row
            ><b-col sm="2">
           Select:
            </b-col><b-col sm="10">
              <b-form-select v-on:change="changeLog()" v-model="selected" :options="nucleusOptions"></b-form-select>
            </b-col></b-row>
          <b-row
            ><b-col>
   <b-overlay :show="show" rounded="sm">
               <b-alert show variant="secondary"
                ><pre>{{ log }}</pre></b-alert
              >
   </b-overlay>
            </b-col></b-row
          ></b-container
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
export default class DatabaseList extends Vue {
  @Prop(String) readonly url: string | undefined;
  data() {
    return {
      log: '' as string,
      db: null,
      selected: 'adanuc.log',
      nucleusOptions: ["adanuc.log"] as string[],
      show: true,
    };
  }
  created() {
    this.$data.db = SearchDatabases(this.url);
    this.$data.timer = setInterval(this.loadNucleus, 5000);
    this.loadNucleus();
    this.$data.db.nucleusLogList().then((response: any) => {
      this.$data.nucleusOptions = response.NucleusLogs;
    });
  }
  loadNucleus() {
    this.$data.db.nucleusLog(this.$data.selected).then((response: any) => {
      this.$data.log = response;
      this.$data.show = false;
    });
  }
  beforeDestroy() {
    clearInterval(this.$data.timer);
  }
  changeLog() {
    this.$data.show = false;
    this.loadNucleus();
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
