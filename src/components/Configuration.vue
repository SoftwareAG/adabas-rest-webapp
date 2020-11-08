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
    <b-card
      header="Adabas REST server configuration"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
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
                  <b-form-input v-model="config.Module.AdabasData" /> </b-col
              ></b-row>
              <b-row class="my-1"
                ><b-col>
                  <b-button variant="outline-primary">Add</b-button>
                </b-col></b-row
              ><b-row
                ><b-col>
                  <b-table
                    striped
                    bordered
                    hover
                    small
                    :items="config.Module.Installation"
                    :fields="instFields"
                  >
                    <template v-slot:cell(delete)="row">
                      <div class="mx-auto text-center">
                        <b-icon-x-circle
                          scale="2"
                          variant="danger"
                          v-on:click="del_installation(row.item.Location)"
                        ></b-icon-x-circle>
                      </div>
                    </template> </b-table></b-col></b-row
            ></b-container>
          </b-tab>
          <b-tab title="File transfer">
            <b-button variant="outline-primary">Add</b-button>
            <b-table
              striped
              bordered
              hover
              small
              :items="config.Module.Directories"
              :fields="fileFields"
            >
              <template v-slot:cell(delete)="row">
                <div class="mx-auto text-center">
                  <b-icon-x-circle
                    scale="2"
                    variant="danger"
                    v-on:click="del_directories(row.item.name)"
                  ></b-icon-x-circle>
                </div> </template
            ></b-table>
          </b-tab>
          <b-tab title="Map repositories">
            <b-button variant="outline-primary">Add</b-button>
            <b-table
              striped
              bordered
              hover
              small
              :items="config.Mapping.Database"
              :fields="mapFields"
            >
              <template v-slot:cell(delete)="row">
                <div class="mx-auto text-center">
                  <b-icon-x-circle
                    scale="2"
                    variant="danger"
                    v-on:click="del_mapping(row.item.url, row.item.file)"
                  ></b-icon-x-circle>
                </div> </template
            ></b-table>
          </b-tab>
          <b-tab title="Classic database access">
            <b-container fluid>
              <b-row
                ><b-col align="right" sm="1">
                  <b-checkbox checked="config.DatabaseAccess.global" /> </b-col
                ><b-col align="left" sm="10">
                  Provide access to all classic database ids (global)
                </b-col></b-row
              >
              <b-row class="my-1"
                ><b-col>
                  <b-button variant="outline-primary">Add</b-button>
                </b-col></b-row
              ><b-row
                ><b-col>
                  <b-table
                    striped
                    bordered
                    hover
                    small
                    :items="config.DatabaseAccess.Database"
                    :fields="accessFields"
                  >
                    <template v-slot:cell(delete)="row">
                      <div class="mx-auto text-center">
                        <b-icon-x-circle
                          scale="2"
                          variant="danger"
                          v-on:click="del_access(row.item.url)"
                        ></b-icon-x-circle>
                      </div> </template></b-table></b-col></b-row
            ></b-container>
          </b-tab>
          <b-tab title="Database metrics tracked">
            <b-button variant="outline-primary">Add</b-button>
            <b-table
              striped
              bordered
              hover
              small
              :items="config.Metrics.Database"
              :fields="accessFields"
            >
              <template v-slot:cell(delete)="row">
                <div class="mx-auto text-center">
                  <b-icon-x-circle
                    scale="2"
                    variant="danger"
                    v-on:click="del_metric(row.item.url)"
                  ></b-icon-x-circle>
                </div> </template
            ></b-table>
          </b-tab> </b-tabs></b-card-body
    ></b-card>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import MyHeader from '@/components/Header.vue';
import { AdabasConfig } from '../adabas/config';
import { BIconXCircle } from 'bootstrap-vue';

@Component({
  components: {
    BIconXCircle,
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
        'Delete',
      ],
      serviceFields: [{ key: 'port' }, { key: 'type' }],
      accessFields: [{ key: 'url' }, 'Delete'],
      mapFields: [{ key: 'url' }, { key: 'file' }, 'Delete'],
      fileFields: [{ key: 'name' }, { key: 'location' }, 'Delete'],
    };
  }
  created(): void {
    this.$data.c = new AdabasConfig();
    this.$data.c.read().then((c: any) => {
      console.log('Returned:' + JSON.stringify(c));
      this.$data.config = c;
    });
  }
  del_mapping(location: string, file: number): void {
    console.log('Delete mapping : ' + location + ' ' + file);
    this.$data.c.deleteMapping(location, file);
  }
  del_installation(location: string): void {
    console.log('Delete installation : ' + location);
    this.$data.c.deleteInstallation(location);
  }
  del_access(location: string): void {
    console.log('Delete access : ' + location);
    this.$data.c.deleteAccess(location);
  }
  del_directories(location: string): void {
    console.log('Delete directories : ' + location);
    this.$data.c.deleteDirectory(location);
  }
  del_metric(location: string): void {
    console.log('Delete metrics : ' + location);
    this.$data.c.deleteMetric(location);
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
</style>
