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
  <div class="databaseinfos p-2">
    <Sidebar :url="url" />
    <b-card
      :header="'Adabas Database information for database ' + url"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <Url url="/adabas/database" />
        <b-button variant="outline-primary" v-on:click="infoRenameDatabase()"
          >Rename database</b-button
        >
        <b-modal
          id="modal-rename"
          size="lg"
          title="Rename Adabas database"
          @ok="renameDatabase"
          no-stacking
        >
          <p>Rename Adabas database {{ infos['Name'] }}</p>
          <b-form-input v-model="newName"></b-form-input>
        </b-modal>
        <b-table
          class="w-100 p-3"
          striped
          bordered
          hover
          small
          :items="infos"
          :fields="fields"
        >
          <template v-slot:cell(Name)="data">
           <div class="toCapitalFirst">{{ data.value }}</div>
          </template>
        </b-table>
      </b-card-body>
    </b-card>
    <StatusBar />
    <ErrorModal />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'vue-facing-decorator';
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
export default class DatabaseInfos extends Vue {
  @Prop({ type: String, required: false }) readonly url!: string | undefined;
  @Provide() type = 'static';
  data() {
    return {
      db: null,
      newName: '',
      infos: [],
      fields: ['Name', 'Value'],
      information: {
        ACRABNLength: 4,
        ASSO1BlockSize: 8192,
        AlphaEncoding: 4,
        Architecture: '',
        CheckpointFile: 1,
        CurrentPLOGNumber: 1,
        Date: '1975-05-18T21:07:10.000+02:00',
        Dbid: 0,
        ETDataFile: 3,
        ExtentRABNASSOArray: [11, 0, 0, 0],
        ExtentRABNDATAArray: [15, 0, 0, 0, 0, 0, 0, 0],
        ExtentRABNDSSTArray: [13, 0, 0, 0],
        Flags: '',
        MaxFileNumber: 320,
        MaxFileNumberLoaded: 48,
        Name: '',
        SecurityFile: 2,
        StructureLevel: 'Adabas v6.7 (21)',
        TimeStampLog: '2020-05-18T21:07:25.000+02:00',
        TimeStampReplication: '1970-01-01T01:00:00.000+01:00',
        WORKExtents: [
          {
            BlockSize: 4096,
            DeviceType: 'Filesystem',
            Id: 'W',
            Number: 1,
            RABNfirst: 1,
            RABNlast: 5120,
            RABNunused: 1,
          },
        ],
        WORKPart1Size: 5110,
        WideEncoding: 4091,
      },
    };
  }
  created() {
    this.$data.db = SearchDatabases(this.url);
    this.queryInformation();
  }
  queryInformation(): void {
    this.$data.db.information().then((response: any) => {
      this.$data.infos = [];
      [
        'Dbid',
        'Name',
        'StructureLevel',
        'Architecture',
        'Date',
        'Flags',
        'PLOGCount',
        'PLOGExtent',
        'CurrentPLOGNumber',
        'CurrentCLOGNumber',
        'MaxFileNumberLoaded',
        'TimeStampReplication',
        'TimeStampLog',
        'MaxFileNumber',
        'SecurityFile',
        'CheckpointFile',
        'ETDataFile',
        'Encrypted',
        'EncryptAlgorithm',
        'EncryptKMSTarget',
        'RBACSecurity',
        'RBACSystemFile',
      ].forEach((element: string) => {
        this.$data.infos.push({
          Name: element,
          Value: response.Gcb[element],
        });
      });
      this.$data.information = response;
    });
  }
  getTypeItem(newtype: any): void {
    console.log('Get type item ' + newtype);
    this.queryInformation();
  }
  infoRenameDatabase(): void {
    this.$root.$emit('bv::show::modal', 'modal-rename', '#btnShow');
  }
  renameDatabase(): void {
    if (this.$data.newName !== '') {
      this.$data.db
        .renameDatabase(this.$data.newName)
        .then(() => {
          this.queryInformation();
        })
        .catch((error: any) => {
          let errorText = 'unknown error to rename database';
          if (error.response !== undefined) {
            errorText =
              error.response.data.Error.code +
              ': ' +
              error.response.data.Error.message;
          }
          this.$root.$emit('error-message', errorText);
          this.$root.$emit('bv::show::modal', 'modal-error', '#btnShow');
        });
    }
    this.$data.newName = '';
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
.toCapitalFirst {
  text-transform: capitalize;
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
