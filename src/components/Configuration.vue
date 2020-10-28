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
  <div class="configuration p-2">
    <MyHeader></MyHeader>
    <div class="card">
      <div class="card-header h5">Adabas REST server configuration</div>
      <div class="card-body">
        <b-tabs content-class="mt-3">
          <b-tab title="Server services" active>
            <b-table
              striped
              bordered
              hover
              small
              :items="config.Server.Service"
              :fields="serviceFields"
            />
          </b-tab>
          <b-tab title="Suite installations">
            <b-container fluid>
              <b-row class="my-1">
                <b-col sm="2"> Adabas Database location:</b-col>
                <b-col sm="9">
                  <b-form-input
                    v-model="config.Module.AdabasData"
                  /> </b-col></b-row
              ><b-row
                ><b-col>
                  <b-table
                    striped
                    bordered
                    hover
                    small
                    :items="config.Module.Installation"
                    :fields="instFields"/></b-col></b-row
            ></b-container>
          </b-tab>
          <b-tab title="File transfer">
            <b-table
              striped
              bordered
              hover
              small
              :items="config.Module.Directories"
              :fields="fileFields"
            />
          </b-tab>
          <b-tab title="Map repositories">
            <b-table
              striped
              bordered
              hover
              small
              :items="config.Mapping.Database"
              :fields="mapFields"
            />
          </b-tab>
          <b-tab title="Classic database access">
            <b-container fluid>
              <b-row
                ><b-col align="right" sm="1">
                  <b-checkbox checked="config.DatabaseAccess.global" /> </b-col
                ><b-col align="left" sm="10">
                  Provide access to all classic database ids (global)
                </b-col></b-row
              ><b-row
                ><b-col>
                  <b-table
                    striped
                    bordered
                    hover
                    small
                    :items="config.DatabaseAccess.Database"
                    :fields="accessFields"/></b-col></b-row
            ></b-container>
          </b-tab>
          <b-tab title="Database metrics tracked">
            <b-table
              striped
              bordered
              hover
              small
              :items="config.Metrics.Database"
              :fields="accessFields"
            />
          </b-tab>
        </b-tabs>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import MyHeader from '@/components/Header.vue';
import { AdabasConfig } from '../adabas/config';

@Component({
  components: {
    MyHeader,
  },
})
export default class Configuration extends Vue {
  @Prop() private msg!: string;
  data() {
    return {
      c: null,
      config: {
        DatabaseAccess: {
          Database: [],
          Global: false,
        },
        Mapping: {
          Database: [],
        },
        Metrics: { Database: [] },
        Module: {
          AdabasData: '',
          Directories: [],
          Installation: [],
        },
        Server: {
          Content: './static',
          LogLocation: { directory: 'logs/server.log', level: 'info' },
          Service: [],
        },
      },
      instFields: [
        { key: 'Location', name: 'Installation' },
        { key: 'Active' },
        { key: 'StructureLevel', name: 'Structure level' },
        { key: 'Version', name: 'Adabas Version' },
      ],
      serviceFields: [{ key: 'port' }, { key: 'type' }],
      accessFields: [{ key: 'url' }],
      mapFields: [{ key: 'url' }, { key: 'file' }],
      fileFields: [{ key: 'name' }, { key: 'location' }],
    };
  }
  created(): void {
    this.$data.c = new AdabasConfig();
    this.$data.c.read().then((c: any) => {
      console.log('Returned:' + JSON.stringify(c));
      this.$data.config = c;
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
</style>
