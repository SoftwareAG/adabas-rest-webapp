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
  <div class="adatcplist p-2">
    <Sidebar :url="url" />
    <b-card
      :header="'Adabas Database ADATCP information for database ' + url"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-container fluid>
          <b-row>
            <b-col>
              This page provides the list of Adabas database ADATCP connections.
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <Url url="/adabas/database" />
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-table
                striped
                bordered
                hover
                small
                :items="adatcp"
                :fields="fields"
              >
                <template v-slot:cell(statistics)="row">
                  <b-progress
                    :show-value="false"
                    :value="row.item.Percent"
                    max="100"
                    :precision="2"
                    class="mb-3"
                  ></b-progress>
                </template>
                <template v-slot:cell(stop)="row">
                  <div class="mx-auto text-center">
                    <b-icon-x-circle
                      scale="2"
                      variant="danger"
                      @click="stopConnection(row.item)"
                    ></b-icon-x-circle>
                  </div>
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
import { Component, Prop, Provide, Vue } from 'vue-facing-decorator';
import Sidebar from './Sidebar.vue';
import store from '../store/index';
import StatusBar from './StatusBar.vue';
import Url from './Url.vue';
import { SearchDatabases } from '@/adabas/admin';
import { BIconXCircle } from "bootstrap-vue";

@Component({
  components: {
    StatusBar,
    Sidebar,
    BIconXCircle,
    Url,
  },
})
export default class AdatcpList extends Vue {
  @Prop(String) readonly url!: string;
  @Provide() type: string = 'static';

  db: any = null;
  adatcp: any[] = [];
  fields: string[] = [
    'ID',
    'RecvID',
    'RemoteHost',
    'RemoteIP',
    'RemoteUser',
    'RemotePort',
    'Stop',
  ];
  timer: any = null;

  created(): void {
    this.db = SearchDatabases(this.url);
    this.timer = setInterval(this.queryParameters, 5000);
    this.queryParameters();
  }

  queryParameters(): void {
    this.db.adatcp().then((response: any) => {
      this.adatcp = response.Entry;
    });
  }

  beforeDestroy(): void {
    clearInterval(this.timer);
  }

  stopConnection(tcp: any): void {
    console.log("TCP: " + JSON.stringify(tcp));
    this.db.closeConnection(tcp.ID);
  }
}
</script>

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
  display: inline-bl
}