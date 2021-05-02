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
              This page provide the list of Adabas database ADATCP connections.
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
              </b-table>
            </b-col>
          </b-row>
        </b-container> </b-card-body
    ></b-card>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'vue-property-decorator';
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
export default class AdatcpList extends Vue {
  @Prop(String) readonly url: string | undefined;
  @Provide() type = 'static';
  data() {
    return {
      db: null,
      fields: [
        'ID',
        'RecvID',
        'RemoteHost',
        'RemoteIP',
        'RemoteUser',
        'RemotePort',
      ],
      adatcp: [] as any[],
      timer: '',
    };
  }
  created(): void {
    this.$data.db = store.getters.search(this.url);
    this.$data.timer = setInterval(this.queryParameters, 5000);
    this.queryParameters();
  }
  queryParameters(): void {
    this.$data.db.adatcp().then((response: any) => {
      this.$data.adatcp = response.Entry;
    });
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
