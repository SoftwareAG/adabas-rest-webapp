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
  <div class="fileslist p-2">
    <Sidebar :url="url" />
    <b-card
      :header="'Adabas Database files for database ' + url"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-container fluid>
          <b-row>
            <b-col>
              This page provides the list of Adabas database files to be
              administrate through this Adabas RESTful server.
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <CreateFile :url="url" />
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <Url :url="'/adabas/database' + url + '/file'" />
            </b-col>
          </b-row>
          <b-row
            ><b-col sm="10">
              <b-pagination
                v-model="currentPage"
                :total-rows="files.length"
                :per-page="perPage"
                aria-controls="my-table"
              ></b-pagination>
            </b-col><b-col sm="2">
              <b-form-select v-model="perPage" :options="perPageOptions" size="sm" class="mt-3"></b-form-select>
          </b-col></b-row><b-row>
            <b-col sm="12">
              <b-form-group
                label="Filter"
                label-cols-sm="3"
                label-align-sm="right"
                label-size="sm"
                label-for="filterInput"
                class="mb-0"
              >
                <b-input-group size="sm">
                  <b-form-input
                    v-model="filter"
                    type="search"
                    id="filterInput"
                    placeholder="Type to Search"
                  ></b-form-input>
                  <b-input-group-append>
                    <b-button :disabled="!filter" @click="filter = ''"
                      >Clear</b-button
                    >
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
            </b-col></b-row
          ><b-row
            ><b-col>
              <b-table
                id="my-table"
                striped
                bordered
                hover
                selectable
                select-mode="single"
                :per-page="perPage"
                :current-page="currentPage"
                small
                :filter="filter"
                :filterIncludedFields="filterOn"
                @row-selected="onRowSelected"
                :items="files"
                :fields="fields"
              >
                 <template v-slot:cell(RecordCount)="row">
                  {{new Intl.NumberFormat().format(row.item.RecordCount)}}
                </template>
                <template v-slot:cell(action)="row">
                  <b-dropdown
                    size="sm"
                    variant="outline-info"
                    class="mr-2 w-100"
                    text="Actions"
                  >
                    <b-dropdown-item
                      size="sm"
                      variant="outline-primary"
                      v-on:click="infoDeleteFile(row.item)"
                      class="mr-2"
                      >Delete</b-dropdown-item
                    >
                    <b-dropdown-item
                      size="sm"
                      variant="outline-primary"
                      v-on:click="infoRenumberFile(row.item)"
                      class="mr-2"
                      >Add LOB file</b-dropdown-item
                    >
                    <b-dropdown-item
                      size="sm"
                      variant="outline-primary"
                      v-on:click="infoAddLob(row.item)"
                      class="mr-2"
                      >Renumber</b-dropdown-item
                    >
                    <b-dropdown-item
                      size="sm"
                      variant="outline-primary"
                      v-on:click="refreshFile(row.item)"
                      class="mr-2"
                      >Refresh</b-dropdown-item
                    >
                    <b-dropdown-item
                      size="sm"
                      variant="outline-primary"
                      v-on:click="infoRenameFile(row.item)"
                      class="mr-2"
                      >Rename</b-dropdown-item
                    >
                  </b-dropdown>
                </template>
              </b-table>
            </b-col></b-row
          >
          <b-row
            ><b-col>
              <div v-if="hideFileParameter">
                <b-alert show>Please select Adabas file</b-alert>
              </div>
              <div v-else>
                <b-tabs content-class="mt-3">
                  <b-tab title="Information" active>
                    <b-table
                      small
                      :items="fileParameter"
                      :fields="parameterFields"
                    >
                      <template v-slot:cell(Value)="row">
                        <div
                          v-if="
                            row.item.Name === 'NIextents' ||
                              row.item.Name === 'UIextents' ||
                              row.item.Name === 'ACextents' ||
                              row.item.Name === 'DSextents'
                          "
                        >
                          <b-table
                            small
                            :items="row.item.Value"
                            :fields="['FirstRabn', 'LastRabn', 'LenOrIsns']"
                          >
                          </b-table>
                        </div>
                        <div v-else>
                          {{ row.item.Value }}
                        </div>
                      </template>
                    </b-table>
                  </b-tab>
                  <b-tab title="Field definition">
                    <div v-if="!fdtAvailable">
                      <b-alert show
                        >Adabas file definition table only available if Adabas
                        database is online</b-alert
                      >
                    </div>
                    <div v-else>
                      <b-table
                        striped
                        small
                        bordered
                        hover
                        :items="fileFields"
                        :fields="fieldFields"
                      >
                        <template v-slot:cell(Level)="row">
                          <pre> {{ levelSpace(row.item.Level) }}</pre>
                        </template>
                      </b-table>
                    </div>
                  </b-tab>
                </b-tabs>
              </div>
            </b-col></b-row
          ></b-container
        ></b-card-body
      ></b-card
    >
    <b-modal
      id="modal-renumber"
      size="lg"
      title="Renumber Adabas File"
      @ok="renumberFile"
      no-stacking
    >
      <p>Renumber Adabas file {{ currentFile }}</p>
      <b-form-input v-model.number="newNr"></b-form-input>
    </b-modal>
        <b-modal
      id="modal-addlob"
      size="lg"
      title="Add Large Object File for Adabas File"
      @ok="addLobFile"
      no-stacking
    >
      <p>Add Large Object LOB file for Adabas file {{ currentFile }}</p>
      <b-form-input v-model.number="newNr"></b-form-input>
    </b-modal>
            <b-modal
      id="modal-rename"
      size="lg"
      title="Rename Adabas File"
      @ok="renameFile"
      no-stacking
    >
      <p>Rename Adabas file {{ currentFile }}</p>
      <b-form-input v-model.trim="newName"></b-form-input>
    </b-modal>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Sidebar from "./Sidebar.vue";
import store from "../store/index";
import StatusBar from "./StatusBar.vue";
import CreateFile from "./CreateFile.vue";
import Url from "./Url.vue";
import { SearchDatabases } from '@/adabas/admin';

@Component({
  components: {
    Sidebar,
    StatusBar,
    CreateFile,
    Url,
  },
})
export default class FilesList extends Vue {
  @Prop(String) readonly url: string | undefined;
  data() {
    return {
      db: null,
      newName: "",
      newNr: 500,
      currentFile: 0,
      perPage: 10,
      perPageOptions: [10,20,50,100],
      currentPage: 1,
      fields: ["FileNr", "Name","Type", "RecordCount", "IsLob", "IsLobRoot", "action"],
      files: [],
      filter: "",
      filterOn: ["FileNr", "Name"],
      hideFileParameter: true,
      fdtAvailable: false,
      fileParameter: [],
      fileParameterOrder: [
        "Name",
        "Number",
        "StructureLevel",
        "Flags",
        "RecordCount",
        "TopIsn",
        "MaxIsn",
        "IsnCnt",
        "MaxRecordLength",
        "RootFile",
        "LobFile",
        "MaxMuOccurence",
        "LastModification",
        "PaddingFactorAsso",
        "PaddingFactorData",
        "FdtStartRABN",
        "HIRabn",
        "LastUsedDataRABN",
        "HighestIndexLevel",
        "TotalAcBlocks",
        "TotalNiBlocks",
        "TotalUiBlocks",
        "TotalDsBlocks",
        "ACextents",
        "NIextents",
        "UIextents",
        "DSextents",
      ],
      fileParameterDrop: [
        "AdamByteKeys",
        "AdamKey",
        "FdtLength",
        "Owner",
        "ResidualCountDSST",
        "RotatingIsn",
        "RotatingRabnDSST",
        "LastNiExtendIndex",
        "LastUiExtendIndex",
      ],
      parameterFields: ["Name", "Value"],
      fileFields: [],
      fieldFields: ["Level", "Name", "Format", "Flags", "Type", "SubFields"],
      timer: "",
    };
  }
  created(): void {
    this.$data.db = SearchDatabases(this.url);
    this.$data.timer = setInterval(this.loadFiles, 15000);
    if (this.$data.db === undefined) {
      store.dispatch("SYNC_ADMIN_DBS");
      return;
    }
    this.loadFiles();
  }
  loadFiles(): void {
    if (this.$data.db === undefined) {
      this.$data.db = SearchDatabases(this.url);
      if (this.$data.db === undefined) {
        return;
      }
    }
    this.$data.db.fileList().then((response: any) => {
      this.$data.files = response;
    });
  }
  onRowSelected(items: any): void {
    if (items.length == 0) {
      this.$data.fileParameter = [];
      this.$data.fileFields = [];
      return;
    }
    this.$data.db.fileInfo(items[0].FileNr).then((response: any) => {
      let fileParameter = response;
      fileParameter = fileParameter.filter((a: any) => {
        return !(this.$data.fileParameterDrop.indexOf(a.Name) !== -1);
      });
      fileParameter.sort((a: any, b: any) => {
        let ai = this.$data.fileParameterOrder.indexOf(a.Name);
        let bi = this.$data.fileParameterOrder.indexOf(b.Name);
        return ai - bi;
      });
      this.$data.fileParameter = fileParameter;
      this.$data.hideFileParameter = false;
    });
    this.$data.db
      .fileFields(items[0].FileNr)
      .then((response: any) => {
        this.$data.fileFields = response;
        this.$data.fdtAvailable = true;
      })
      .catch((error: any) => {
        this.$data.fdtAvailable = false;
      });
  }
  levelSpace(nr: number): string {
    let res = "";
    for (let i = 0; i < nr; i++) {
      res += " ";
    }

    return res + nr;
  }
  infoDeleteFile(item: any): void {
    this.$data.currentFile = item.FileNr;
    console.log("Delete " + item.FileNr + " " + JSON.stringify(item));
    //  this.$data.db.deleteFile(item.FileNr);
    this.$bvModal
      .msgBoxConfirm(
        "Please confirm that you want to delete the Adabas file " +
          item.FileNr +
          ".",
        {
          title: "Please Confirm",
          size: "sm",
          buttonSize: "sm",
          okVariant: "danger",
          okTitle: "YES",
          cancelTitle: "NO",
          footerClass: "p-2",
          hideHeaderClose: false,
          centered: true,
        }
      )
      .then((value) => {
        console.log(
          "Selected value: " +
            this.$data.currentFile +
            " " +
            JSON.stringify(value)
        );
        if (value) {
          this.$data.db.deleteFile(this.$data.currentFile);
        }
      })
      .catch((err) => {
        // An error occurred
        console.log("Catching err " + err);
      });
  }
  infoRenumberFile(item: any): void {
    this.$data.currentFile = item.FileNr;
    console.log("Renumber " + item.FileNr);
    this.$root.$emit("bv::show::modal", "modal-renumber", "#btnShow");
  }
  infoRenameFile(item: any): void {
    this.$data.currentFile = item.FileNr;
    this.$data.newName = item.Name;
    console.log("Rename " + item.FileNr);
    this.$root.$emit("bv::show::modal", "modal-rename", "#btnShow");
  }
  infoAddLob(item: any): void {
    this.$data.currentFile = item.FileNr;
    console.log("Add Lob file " + item.FileNr);
    this.$root.$emit("bv::show::modal", "modal-addlob", "#btnShow");
  }
  renumberFile(): void {
    console.log(
      "Renumber " + this.$data.currentFile + " to " + this.$data.newNr
    );
    if (this.$data.newNr > 0) {
      this.$data.db.renumberFile(this.$data.currentFile, this.$data.newNr);
    }
    this.$data.newNr = 0;
  }
  addLobFile(): void {
    console.log(
      "Add LOB file for " + this.$data.currentFile + " with " + this.$data.newNr
    );
    if (this.$data.newNr > 0) {
      this.$data.db.addLobFile(this.$data.currentFile, this.$data.newNr);
    }
    this.$data.newNr = 0;
  }
  renameFile(): void {
    console.log(
      "Renamer " + this.$data.currentFile + " with " + this.$data.newName
    );
    if (this.$data.newName != "") {
      this.$data.db.renameFile(this.$data.currentFile, this.$data.newName);
    }
    this.$data.newName = "";
  }
  refreshFile(item: any): void {
    this.$data.currentFile = item.FileNr;
    console.log("Refresh " + item.FileNr + " " + JSON.stringify(item));
    //  this.$data.db.deleteFile(item.FileNr);
    this.$bvModal
      .msgBoxConfirm(
        "Please confirm that you want to refresh the Adabas file " +
          item.FileNr +
          ".",
        {
          title: "Please Confirm",
          size: "sm",
          buttonSize: "sm",
          okVariant: "danger",
          okTitle: "YES",
          cancelTitle: "NO",
          footerClass: "p-2",
          hideHeaderClose: false,
          centered: true,
        }
      )
      .then((value) => {
        console.log(
          "Selected value: " +
            this.$data.currentFile +
            " " +
            JSON.stringify(value)
        );
        if (value) {
          this.$data.db.refreshFile(this.$data.currentFile);
        }
      })
      .catch((err) => {
        // An error occurred
        console.log("Catching err " + err);
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
