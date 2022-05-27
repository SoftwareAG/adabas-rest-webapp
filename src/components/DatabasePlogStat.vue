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
  <div class="databaseplogstats p-2">
    <Sidebar :url="url" />
    <b-card
      :header="'Adabas Database PLOG information for database ' + url"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-row>
          <b-col>
        <Url url="/adabas/database" />
          </b-col>
            <b-col class="text-right">
              <b-button v-on:click="forceFEOF()">Force EOF</b-button>
            </b-col>
        </b-row>
        <b-row>
        <b-table
          class="w-100 p-3"
          striped
          bordered
          hover
          small
          :items="infos"
          :fields="fields"
        ></b-table>
        </b-row>
      </b-card-body>
    </b-card>
    <StatusBar />
    <ErrorModal />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'vue-property-decorator';
import Sidebar from './Sidebar.vue';
import StatusBar from './StatusBar.vue';
import store from '../store/index';
import Url from './Url.vue';
import ErrorModal from '@/components/ErrorModal.vue';
import { SearchDatabases } from '@/adabas/admin';

@Component({
  components: {
    Sidebar,
    StatusBar,
    Url,
    ErrorModal,
  },
})
export default class DatabasePlogStat extends Vue {
  @Prop(String) readonly url: string | undefined;
  @Provide() type = 'static';
  data() {
    return {
      db: null,
      infos: [],
      fields: ['Name', 'Value'],
    };
  }
  created() {
    this.$data.db = SearchDatabases(this.url);
    this.queryInformation();
  }
  queryInformation(): void {
    this.$data.db.plogstats().then((response: any) => {
      console.log(JSON.stringify(response));
      this.$data.information = response.PLOG;
      this.$data.DatabaseInfos = [];
      Object.entries(response["PLOG"]).forEach((key: any) => {
        this.$data.infos.push({ Name: key[0], Value: key[1] });
      });
    });
  }
  getTypeItem(newtype: any): void {
    console.log('Get type item ' + newtype);
    this.queryInformation();
  }
  forceFEOF(newtype: any): void {
    this.$data.db.feofplog();
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
