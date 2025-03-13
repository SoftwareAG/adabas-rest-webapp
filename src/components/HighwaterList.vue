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
  <div class="highwaterlist p-2">
    <Sidebar :url="url" />
    <b-card
      :header="'Adabas Database High Watermark for database ' + url"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-container fluid>
          <b-row>
            <b-col>
              This page provides the statistics of Adabas database High Watermark.
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <Url url="/adabas/database" />
            </b-col>
            <b-col class="text-right">
              <b-button v-on:click="resetHWM()">Reset</b-button>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-table
                striped
                bordered
                hover
                small
                :items="highwater"
                :fields="fields"
              >
                <template v-slot:cell(Time)="row">
                  {{new Date(row.item.Time).toUTCString()}}
                </template>
                <template v-slot:cell(size)="row">
                  {{new Intl.NumberFormat().format(row.item.Size)}}
                </template>
                <template v-slot:cell(high)="row">
                  {{new Intl.NumberFormat().format(row.item.High)}}
                </template>
                <template v-slot:cell(inuse)="row">
                  {{new Intl.NumberFormat().format(row.item.InUse)}}
                </template>
                <template v-slot:cell(statistics)="row">
                  <b-progress
                    :show-value="false"
                    :value="row.item.Percent"
                    max="100"
                    :precision="2"
                    class="mb-3"
                  ></b-progress>
                </template>
              </b-table>
            </b-col>
          </b-row>
        </b-container> </b-card-body
    ></b-card>
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

@Component({
  components: {
    StatusBar,
    Sidebar,
    Url,
  },
})
export default class ParameterList extends Vue {
  @Prop(String) readonly url: string | undefined;
  @Provide() type = 'static';
  data() {
    return {
      db: null,
      fields: [
        'Area',
        'Size',
        'High',
        'InUse',
        'Time',
        'Percent',
        'statistics',
      ],
      highwater: [] as any[],
      timer: '',
    };
  }
  created(): void {
    this.$data.db = SearchDatabases(this.url);
    this.$data.timer = setInterval(this.queryParameters, 5000);
    this.queryParameters();
  }
  queryParameters(): void {
    this.$data.db.highWaterMark().then((response: any) => {
      this.$data.highwater = response;
    });
  }
  resetHWM(): void {
    this.$data.db.highWaterMarkReset();
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
