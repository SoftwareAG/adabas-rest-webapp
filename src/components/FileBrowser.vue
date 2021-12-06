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
  <div class="filesbrowser p-2">
    <b-modal id="modal-xl" size="xl" title="File data">
      <pre>{{ filedata }}</pre>
    </b-modal>
    <b-card
      :header="'File browser'"
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
          <b-row
            ><b-col sm="2"> Select Path:</b-col
            ><b-col>
              <b-form-select
                v-model="selected"
                :options="options"
              ></b-form-select> </b-col
          ></b-row>
          <b-row
            ><b-col sm="2"> Upload file to remote:</b-col
            ><b-col sm="8">
              <b-form-file
                v-model="uploadFile"
                :state="Boolean(uploadFile)"
                placeholder="Choose a file or drop it here..."
                drop-placeholder="Drop file here..."
              ></b-form-file></b-col
            ><b-col sm="2">
              <b-button @click="upload()">Upload</b-button>
            </b-col></b-row
          >
          <b-row
            ><b-col sm="10">
              <b-pagination
                v-model="currentPage"
                :total-rows="files.length"
                :per-page="perPage"
                aria-controls="my-table"
              ></b-pagination>
            </b-col>
            <b-col sm="2">
              <b-form-select
                v-model="perPage"
                :options="perPageOptions"
                size="sm"
                class="mt-3"
              ></b-form-select> </b-col
          ></b-row>
          <b-row
            ><b-col>
              <b-table
                striped
                bordered
                hover
                :per-page="perPage"
                :current-page="currentPage"
                small
                selectable
                select-mode="single"
                @row-selected="onRowSelected"
                :items="files"
                :fields="fields"
                primary-key="Name"
                sort-by="Type"
                :sort-compare="sortingChanged"
              >
                <template v-slot:cell(Size)="row">
                  <div v-if="row.item.Type != 'Directory'">
                    {{ new Intl.NumberFormat().format(row.item.Size) }}
                  </div>
                </template>
                <template v-slot:cell(Modified)="row">
                  <div v-if="row.item.Modified">
                    {{ new Date(row.item.Modified).toUTCString() }}
                  </div>
                </template>
                <template v-slot:cell(Operation)="row">
                  <b-button-group class="mr-1">
                    <b-button
                      class="mr-1"
                      v-if="
                        row.item.Type != 'Directory' && row.item.Size < 100000
                      "
                      @click="show(row.item.Name)"
                      v-b-modal.modal-xl
                      variant="primary"
                      >Show</b-button
                    >
                    <b-button
                      class="mr-1"
                      v-if="row.item.Type != 'Directory'"
                      @click="download(row.item.Name)"
                      variant="primary"
                      >Download</b-button
                    >
                    <b-button
                      class="mr-1"
                      v-if="
                        row.item.Type != 'Directory' && row.item.Size < 100000
                      "
                      @click="deleteFile(row.item.Name)"
                      variant="primary"
                      >Delete</b-button
                    ></b-button-group
                  >
                </template>
              </b-table></b-col
            >
          </b-row>
        </b-container></b-card-body
      ></b-card
    >
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Sidebar from "./Sidebar.vue";
import StatusBar from "./StatusBar.vue";
import Url from "./Url.vue";
import { FilePathBrowser, fileAccessConfig } from "../adabas/file";

@Component({
  components: {
    Sidebar,
    StatusBar,
    Url,
  },
})
export default class FileBrowser extends Vue {
  @Prop(String) readonly url: string | undefined;
  data() {
    return {
      perPage: 10,
      currentPage: 1,
      perPageOptions: [10, 20, 50, 100],
      selected: null,
      selectedFile: null,
      timer: "",
      options: [],
      files: [],
      uploadFile: null,
      filedata: "Loading data ...",
      path: "/",
      browser: null as FilePathBrowser | null,
      fields: [
        { key: "Name", sortable: true },
        { key: "Type", sortable: true },
        {
          key: "Size",
          sortable: true,
          tdClass: "text-right",
        },
        { key: "Modified", sortable: true },
        { key: "Operation", tdClass: "text-right" },
      ],
    };
  }
  created(): void {
    fileAccessConfig().then((response: any) => {
      this.$data.options = [];
      response.Directories.forEach((element: any) => {
        this.$data.options.push({
          value: element,
          text: element.Name + " (" + element.Location + ")",
        });
        if (this.$data.options.length > 0) {
          this.$data.selected = this.$data.options[0].value;
          this.$data.browser = new FilePathBrowser(
            this.$data.options[0].value.Name
          );
          this.loadDirectory();
        }
      });
    });
  }
  loadDirectory() {
    if (this.$data.browser != null && this.$data.path != "") {
      console.log(
        "Load directory " +
          this.$data.browser.current +
          " path=" +
          this.$data.path
      );
      const b = this.$data.browser as FilePathBrowser;
      // b.files = this.$data.path;
      if (this.$data.path == "..") {
        b.up();
      } else {
        b.addPath(this.$data.path);
      }
      this.refreshDirectory();
    }
  }
  refreshDirectory() {
    this.$data.browser
      .filesQuery()
      .then((response: any) => {
        this.$data.current = this.$data.path;
        this.$data.files = response.Content;
        this.$data.files.push({ Name: "..", Type: "Directory" });
        this.$data.path = "";
      })
      .catch((error: any) => {
        console.log("Refresh ERROR:" + JSON.stringify(error));
      });
  }
  sortingChanged(a: any, b: any, key: any) {
    let result = 0;
    if (a["Name"] === "..") {
      return -1;
    }
    if (b["Name"] === "..") {
      return 1;
    }
    if (key === "day") {
      let day1 = a[key].toLowerCase();
      let day2 = b[key].toLowerCase();
      return this.$data.files[day1] - this.$data.files[day2];
    }

    let day1 = a["Type"].toLowerCase();
    let day2 = b["Type"].toLowerCase();
    if (day1 == "directory") {
      return -1;
    }
    if (day2 == "directory") {
      return 1;
    }
    return a["Name"] - b["Name"];
  }
  onRowSelected(items: any) {
    if (items.length == 0) {
      return;
    }
    console.log(
      "Selected " +
        JSON.stringify(items) +
        " " +
        JSON.stringify(this.$data.selected)
    );
    if (this.$data.selectedFile == items[0]) {
      return;
    }
    this.$data.selectedFile = items[0];
    if (items[0].Name == "..") {
      this.$data.path = "..";
      this.loadDirectory();
      return;
    }
    if (items[0].Type == "Directory") {
      this.$data.path = items[0].Name;
      console.log("New path " + this.$data.path);
      this.loadDirectory();
    } else {
      console.log("No directory " + items[0].Type);
    }
  }
  show(fileName: string) {
    console.log("Read " + fileName);
    this.$data.filedata = "Loading data ...";
    this.$data.browser.read(fileName).then((response: any) => {
      this.$data.filedata = response;
    });
  }
  download(fileName: string) {
    console.log("Download " + fileName);
    this.$data.browser.download(fileName);
  }
  upload() {
    console.log("Upload " + this.$data.uploadFile.Name);
    this.$data.browser.upload(this.$data.uploadFile);
  }
  deleteFile(fileName: string) {
    console.log("Delete " + fileName);
    this.$bvModal
      .msgBoxConfirm("Really delete file " + fileName + "?")
      .then((value) => {
        if (value == true) {
          this.$data.browser
            .deleteFile(fileName)
            .then((value: any) => {
              console.log("File deleted");
            })
            .catch((err: any) => {
              console.log("Error deleting file");
            });
          this.refreshDirectory();
        }
      })
      .catch((err) => {
        // An error occurred
        console.log("Error: " + JSON.stringify(err));
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
a {
  color: #42b983;
}
</style>
