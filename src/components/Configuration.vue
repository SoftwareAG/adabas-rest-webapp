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
    <b-modal
      @ok="handleOk"
      id="modal-db"
      size="xl"
      variant="outline-danger"
      :title="modalTitle"
    >
      <p class="my-4">{{ modalDescription }}</p>
      <b-card bg-variant="light">
        <b-form-group
          label-cols-sm="3"
          label="Database ID (dbid):"
          label-align-sm="right"
          label-for="nested-dbid"
        >
          <b-form-input
            v-model="dbid"
            type="text"
            :state="dbidState()"
            aria-describedby="input-live-help input-live-feedback"
            id="nested-dbid"
            trim
          ></b-form-input>
          <b-form-invalid-feedback id="input-live-feedback">
            Out of range
          </b-form-invalid-feedback>
          <b-form-text id="input-live-help"
            >Database id in the range of greater 0 and smaller as
            65536</b-form-text
          >
        </b-form-group>
        <b-collapse id="mapFile-collapse">
          <b-form-group
            label-cols-sm="3"
            label="Adabas file (file):"
            label-align-sm="right"
            label-for="nested-file"
          >
            <b-form-input
              v-model="file"
              type="number"
              :state="fileState()"
              aria-describedby="input-file-live-help input-file-live-feedback"
              id="nested-file"
              trim
            ></b-form-input>
            <b-form-invalid-feedback id="input-file-live-feedback">
              Out of range
            </b-form-invalid-feedback>
            <b-form-text id="input-file-live-help"
              >Database file in the range of greater 0 and smaller as
              65536</b-form-text
            >
          </b-form-group>
        </b-collapse>
      </b-card>
    </b-modal>
    <b-modal
      @ok="handleLocationOk"
      id="modal-location"
      size="xl"
      variant="outline-danger"
      title="Add installation location"
    >
      <p class="my-4">
        Add the Software AG suite installation location containing the Adabas
        installation.
      </p>
      <b-card bg-variant="light">
        <b-form-group
          label-cols-sm="3"
          label="Software AG suite installation path:"
          label-align-sm="right"
          label-for="nested-location"
        >
          <b-form-input
            v-model="location"
            type="text"
            :state="locationState()"
            aria-describedby="input-live-help input-live-feedback"
            id="nested-xlocation"
            trim
          ></b-form-input>
          <b-form-invalid-feedback id="input-live-feedback">
            Empty
          </b-form-invalid-feedback>
          <b-form-text id="input-live-help"
            >Directory of Software AG installation</b-form-text
          >
        </b-form-group>
      </b-card>
    </b-modal>
    <b-modal
      @ok="handleOk"
      id="modal-fileTransfer"
      size="xl"
      variant="outline-danger"
      title="Add allowed File transfer location"
    >
      <p class="my-4">
        Add the Software AG file transfer location allowed to upload or download
        files.
      </p>
      <b-card bg-variant="light">
        <b-form-group
          label-cols-sm="3"
          label="File transfer name:"
          label-align-sm="right"
          label-for="nested-fileTransfer"
        >
          <b-form-input
            v-model="fileTransferName"
            type="text"
            aria-describedby="input-live-help"
            id="nested-fileTransferName"
            trim
          ></b-form-input>
          <b-form-text id="input-live-help"
            >Directory to upload or download files</b-form-text
          >
        </b-form-group>
        <b-form-group
          label-cols-sm="3"
          label="File transfer location:"
          label-align-sm="right"
          label-for="nested-fileTransfer"
        >
          <b-form-input
            v-model="location"
            type="text"
            id="nested-fileTransferLocation"
            trim
          ></b-form-input>
        </b-form-group>
      </b-card>
    </b-modal>
    <b-card
      header="Adabas REST server configuration"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <label> The configuration are applied when the action is set. </label>
        <b-tabs content-class="mt-3">
          <b-tab title="Server services" active>
            <b-container fluid>
              <b-row class="my-1">
                <b-col sm="11">
                  The content location contains this web application to handle a
                  number of configurations. The location may be changed to
                  disable this web application. This need to be done manually
                  changing the config.xml file.</b-col
                ></b-row
              >
              <b-row class="my-1">
                <b-col sm="2"> Content location:</b-col>
                <b-col sm="9">
                  <b-form-input
                    readonly
                    v-model="config.Server.Content"
                  /> </b-col
              ></b-row>
              <b-row class="my-1">
                <b-col sm="2"> Log location:</b-col>
                <b-col sm="2">
                  <b-form-select
                    v-model="config.Server.LogLocation.level"
                    :options="options"
                  ></b-form-select>
                </b-col>
                <b-col sm="7">
                  <b-form-input
                    v-model="config.Server.LogLocation.directory"
                  /> </b-col
              ></b-row>
              <b-row class="my-1"
                ><b-col>
                  <b-table
                    striped
                    bordered
                    hover
                    small
                    :items="config.Server.Service"
                    :fields="serviceFields"/></b-col></b-row
            ></b-container>
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
                  <b-button v-b-modal.modal-location variant="outline-primary"
                    >Add</b-button
                  >
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
            <b-container
              ><b-row
                ><b-col>
                  <b-button
                    v-b-modal.modal-fileTransfer
                    @click="showMsgOk('filetransfer')"
                    variant="outline-primary"
                    >Add</b-button
                  ></b-col
                ></b-row
              ><b-row
                ><b-col>
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
                      </div> </template></b-table></b-col></b-row
            ></b-container>
          </b-tab>
          <b-tab title="Map repositories">
            <b-button
              v-b-toggle.mapFile-collapse
              v-b-modal.modal-db
              @click="showMsgOk('map')"
              variant="outline-primary"
              >Add</b-button
            >
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
                  <b-button
                    @click="showMsgOk('classic')"
                    variant="outline-primary"
                    >Add</b-button
                  >
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
            <b-container fluid>
              <b-row
                ><b-col>
                  <b-button
                    @click="showMsgOk('metrics')"
                    variant="outline-primary"
                    >Add</b-button
                  ></b-col
                ></b-row
              ><b-row
                ><b-col>
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
                      </div> </template></b-table></b-col></b-row
            ></b-container>
          </b-tab>
          <b-tab title="User">
            <b-container
              ><b-row
                ><b-col>
                  <b-button variant="outline-primary">Add</b-button></b-col
                >
                <b-col
                  >Default read:<b-form-input v-model="user.readPermission"
                /></b-col>
                <b-col
                  >Default write:<b-form-input v-model="user.writePermission"
                /></b-col> </b-row
              ><b-row
                ><b-col>
                  <b-table
                    striped
                    bordered
                    hover
                    small
                    :items="user.Users"
                    :fields="userFields"
                  >
                    <template v-slot:cell(administrator)="row">
                      <b-form-checkbox
                        switch
                        v-model="row.item.administrator"
                        v-on:change="toggle(row.item)"
                      />
                    </template>
                    <template v-slot:cell(readPermission)="row">
                      <b-form-input v-model="row.item.readPermission" />
                    </template>
                    <template v-slot:cell(writePermission)="row">
                      <b-form-input v-model="row.item.writePermission" />
                    </template>
                    <template v-slot:cell(delete)="row">
                      <div class="mx-auto text-center">
                        <b-icon-x-circle
                          scale="2"
                          variant="danger"
                          v-on:click="del_metric(row.item.url)"
                        ></b-icon-x-circle>
                      </div> </template></b-table></b-col></b-row
            ></b-container>
          </b-tab> 
          <b-tab title="Job Store">
            <b-container>
              <b-row class="my-1">
                <b-col sm="2">Job store file location:</b-col>
                <b-col sm="9">
                  <b-form-input v-model="config.JobStore.config" /> </b-col
              ></b-row>
              <b-row class="my-1">
                <b-col sm="2">Job store database:</b-col>
                <b-col sm="9">
                  <b-form-input v-model="config.JobStore.Database.url" /> </b-col
              ></b-row>
              <b-row class="my-1">
                <b-col sm="2">Job store file:</b-col>
                <b-col sm="9">
                  <b-form-input v-model="config.JobStore.Database.file" /> </b-col
              ></b-row>
            </b-container>
          </b-tab>
          </b-tabs></b-card-body
      ><b-button @click="adaptChanges()" variant="outline-primary"
        >Apply</b-button
      ><b-button @click="storeChanges()" variant="outline-primary"
        >Store</b-button
      ></b-card
    >
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
      fileTransferName: '',
      location: '',
      dbid: '0' as string,
      file: 100 as number,
      mapFileDisplay: false,
      modalType: '',
      modalTitle: 'Add Database',
      modalDescription: 'Enter Database id',
      modalLabel: 'Database',
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
        JobStore: {
          config: '',
          Database: {
            url: '',
            file: 0
          }
        },
        Server: {
          Content: './static',
          LogLocation: { directory: 'logs/server.log', level: 'info' },
          Service: [],
        },
      },
      originConfig: null,
      user: {
        readPermission: "",
        writePermission:"",
        Users: [],
      },
      originUser: null,
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
      userFields: [
        { key: 'name' },
        { key: 'administrator' },
        { key: 'readPermission' },
        { key: 'writePermission' },
        'Delete',
      ],
      options: ['debug', 'info', 'error'],
    };
  }
  created(): void {
    this.$data.c = new AdabasConfig();
    this.$data.c.read().then((c: any) => {
      if (!c.JobStore) {
        c.JobStore = {config:"",Database:{url:"",file:0}}
      } else {
        if (!c.JobStore.Database) {
          c.JobStore.Database = {url:"",file:0}
        }
      }
      this.$data.config = c;
      this.$data.originConfig = JSON.parse(JSON.stringify(c));
    });
    this.$data.c.readUser().then((c: any) => {
      this.$data.user = c;
      this.$data.originUser = JSON.parse(JSON.stringify(c));
    });
  }
  del_mapping(location: string, file: number): void {
    console.log('Delete mapping : ' + location + ' ' + file);
    this.$data.config.Mapping.Database.forEach((element: any) => {
      if (element.url === location && element.file === file) {
        element.Deleted = true;
      }
    });
    // this.$data.c.deleteMapping(location, file);
  }
  del_installation(location: string): void {
    console.log('Delete installation : ' + location);
    this.$data.config.Module.Installation.forEach((element: any) => {
      console.log('Installation -> ' + JSON.stringify(element));
      if (element.Location === location) {
        console.log('Remove -> ' + location);
        element.Deleted = true;
      }
    });
    // this.$data.c.deleteInstallation(location);
  }
  del_access(location: string): void {
    console.log('Delete access : ' + location);
    this.$data.config.DatabaseAccess.Database.forEach((element: any) => {
      if (element.url === location) {
        element.Deleted = true;
      }
    });
    //   this.$data.c.deleteAccess(location);
  }
  del_directories(location: string): void {
    console.log('Delete directories : ' + location);
    this.$data.config.Module.Directories.forEach((element: any) => {
      if (element.location === location) {
        element.Deleted = true;
      }
    });
    // this.$data.c.deleteDirectory(location);
  }
  del_metric(url: string): void {
    console.log('Delete metrics : ' + location);
    this.$data.config.Metrics.Database.forEach((element: any) => {
      if (element.url === url) {
        element.Deleted = true;
      }
    });
    // var dbAccess = this.$data.config.Metrics.Database.filter(function(db: any) {
    //   return db.url !== location;
    // });
    // this.$data.config.Metrics.Database = dbAccess;
    // this.$data.c.deleteMetric(location);
  }
  locationState() {
    return this.$data.location === '' ? false : true;
  }
  handleLocationOk() {
    console.log('handle location state check of ' + this.$data.location);
    this.$data.modalType = 'installation';
    this.handleOk();
  }
  dbidState() {
    return this.$data.dbid > 0 && this.$data.dbid < 64536 ? true : false;
  }
  fileState() {
    return this.$data.file > 0 && this.$data.file < 64536 ? true : false;
  }
  showMsgOk(modalType: string) {
    this.$data.modalType = modalType;
    switch (this.$data.modalType) {
      case 'classic':
        this.$data.mapFileDisplay = false;
        this.$data.modalTitle = 'Classic Database access';
        this.$data.modalDescription =
          'Enter the classic database which should be able to access directly using classical database parameters like database id, file number and short name.';
        break;
      case 'metrics':
        this.$data.mapFileDisplay = false;
        this.$data.modalTitle = 'Enable Database metrics';
        this.$data.modalDescription =
          'Enter the Adabas database which should be tracked for metrics requests.';
        break;
      case 'map':
        this.$data.mapFileDisplay = true;
        this.$data.modalTitle = 'Add Database repository';
        this.$data.modalDescription =
          'Enter the Adabas database and Adabas file number of the Adabas Map repository which should be search in for Adabas Maps.';
        break;
      default:
    }
    this.$bvModal.show('modal-db');
  }
  handleOk() {
    console.log('Handle ok show db modal ' + this.$data.modalType);
    switch (this.$data.modalType) {
      case 'installation':
        this.$data.config.Module.Installation.push({
          changed: true,
          deleted: false,
          Location: this.$data.location,
        });
        break;
      case 'classic':
        if (this.$data.dbid > 0) {
          notFound = this.$data.config.DatabaseAccess.Database.every(
            (element: any) => {
              if (element.url == this.$data.dbid + '') {
                return false;
              }
              return true;
            },
          );
          if (!notFound) {
            return;
          }
          this.$data.config.DatabaseAccess.Database.push({
            url: this.$data.dbid + '',
            changed: true,
            deleted: false,
          });
        }
        break;
      case 'filetransfer':
        this.$data.config.Module.Directories.push({
          location: this.$data.location,
          name: this.$data.fileTransferName,
          changed: true,
          deleted: false,
        });
        break;
      case 'map':
        if (this.$data.dbid > 0) {
          var notFound = this.$data.config.Mapping.Database.every(
            (element: any) => {
              if (
                element.url == this.$data.dbid + '' &&
                element.file == this.$data.file
              ) {
                return false;
              }
              return true;
            },
          );
          if (!notFound) {
            return;
          }
          this.$data.config.Mapping.Database.push({
            url: this.$data.dbid + '',
            file: Number(this.$data.file),
            changed: true,
            deleted: false,
          });
        }
        break;
      case 'metrics':
        if (this.$data.dbid > 0) {
          if (this.$data.config.Metrics.Database != null) {
            notFound = this.$data.config.Metrics.Database.every(
              (element: any) => {
                if (element.url == this.$data.dbid + '') {
                  return false;
                }
                return true;
              },
            );
            if (!notFound) {
              return;
            }
          } else {
            this.$data.config.Metrics.Database = [];
          }
          this.$data.config.Metrics.Database.push({
            url: this.$data.dbid + '',
            changed: true,
          });
        }
        break;
      default:
        console.log('Unknown modal type');
    }
  }
  toggle(item: any) {
    item.administrator = !item.administrator;
  }
  adaptChanges() {
    console.log('Apply changes');
    return this.$data.c.putConfig(this.$data.config).then((result: any) => {
      console.log('Applying ...');
    });
  }
  storeChanges() {
    console.log('Store changes');
    return this.$data.c.store().then((result: any) => {
      console.log('Storing ...');
    });
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
.hidden {
  display: none;
}
</style>
