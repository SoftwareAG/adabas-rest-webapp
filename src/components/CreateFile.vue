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
  <div class="createfile p-2">
    <b-button v-b-modal.modal-1 variant="primary">Create Adabas file</b-button>
    <b-modal id="modal-multi-1" size="xl" title="Error creating file" ok-only>
      <b-alert show variant="danger">
        <p class="my-2">{{ errorResponse }}</p>
      </b-alert>
    </b-modal>
    <b-modal
      @ok="handleOk"
      id="modal-1"
      size="xl"
      variant="outline-danger"
      title="Create Adabas file"
    >
      <p class="my-4">Please provide new file parameters</p>
      <b-card bg-variant="light">
        <b-form-group
          label-cols-lg="3"
          label="Adabas file parameters"
          label-size="lg"
          label-class="font-weight-bold pt-0"
          class="mb-0"
        >
          <b-form-group
            label-cols-sm="3"
            label="Database file number:"
            label-align-sm="right"
            label-for="nested-dbid"
          >
            <b-form-input
              v-model.number="createFile.fileNumber"
              id="nested-dbid"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label-cols-sm="3"
            label="Name:"
            label-align-sm="right"
            label-for="nested-name"
          >
            <b-form-input
              v-model="createFile.fduOptions.fduName"
              id="nested-name"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label-cols-sm="3"
            label="Lob File:"
            label-align-sm="right"
            label-for="nested-checkpoint"
          >
            <b-form-input
              v-model.number="lobFile"
              id="nested-checkpoint"
              type="number"
            ></b-form-input>
          </b-form-group>
        </b-form-group>
        <b-table :fields="fields" :items="fdtFields"></b-table>
        <b-table :fields="constructorFields" :items="fdtConstructors"></b-table>
        <b-form-file
          v-model="file"
          :state="Boolean(file)"
          accept=".fdt"
          placeholder="Choose a file or drop it here..."
          drop-placeholder="Drop file here..."
        ></b-form-file>
        <b-button @click="handleFileUpload()">Upload</b-button>
        <div class="mt-3">Selected file: {{ file ? file.name : "" }}</div>
      </b-card>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import axios from "axios";
import { config } from "../store/config";
import { authHeader } from "../user/auth-header";
import store from "../store/index";
import { ModalPlugin } from "bootstrap-vue";
import { SearchDatabases } from '@/adabas/admin';

Vue.use(ModalPlugin);

@Component
export default class CreateFile extends Vue {
  @Prop(String) readonly url: string | undefined;
  data() {
    return {
      file: null,
      useJob: false,
      fdtFields: [],
      fields: [
        { key: "level", text: "Level" },
        { key: "shortName", text: "ShortName" },
        { key: "length", text: "Length" },
        { key: "format", text: "Format" },
        { key: "flags", text: "Flags" },
      ],
      constructorFields: ["descriptor"],
      fdtConstructors: [],
      createFile: {
        fileNumber: 350,
        fduOptions: {
          fduName: "GO_TEST",
          fduBlocksizeDS: 0,
          fduBlocksizeAC: 0,
          fduBlocksizeNI: 0,
          fduBlocksizeUI: 0,
          fduACrabn: 0,
          fduAssoPfac: 0,
          fduNiBlocksize: 0,
          fduNobt: 0,
          fduCipher: 0,
          fduContiguous: 0,
          fduDataPfac: 0,
          fduNoDsst: 0,
          fduUiBlocksize: 0,
          fduDSRabn: 0,
          fduDSSize: 0,
          fduErase: 0,
          fduPGMRefresh: 0,
          fduDSMUnitNILong: 0,
          fduDSMUnitUILong: 0,
          fduIsnSize: 0,
          fduNiRabn: 0,
          fduNISize: 0,
          fduReuse: 0,
          fduUIRabn: 0,
          fduUISize: 0,
          fduDSMUnitDS: 0,
          fduDSMUnitNI: 0,
          fduDSMUnitUI: 0,
          fduAdamKey: 0,
          fduLobFileOption: 0,
          fduMaxRecordLength: 0,
          fduAdamDsBlocks: 0,
          fduParamAdam: 0,
          fduLobFile: 0,
          fduAdamOffset: 0,
          fduAdamByteKey: "",
          fduOverflowAdam: 0,
          fduNiLongRabn: 0,
          fduNiLongSize: 0,
          fduUiLongRabn: 0,
          fduUiLongSize: 0,
          fduSystemFileMaxMu: 0,
        },
        fdtDefinition: "1,AQ%2,AF,15,A,NU%1,NN,20,A,DE,UQ%1,VN,20,A,DE",
      },
      lobFile: 0,
      db: null,
      errorResponse: null,
    };
  }
  created() {
    this.$data.db = SearchDatabases(this.url);

    // Predefined
    let x = this.$data.createFile.fdtDefinition.split("%");
    x.forEach((element: any) => {
      let f = element.split(",");
      let fdtField = {
        level: f[0],
        shortName: f[1],
        length: f[2],
        format: f[3],
        flags: f[4],
        comment: f[5],
      };
      this.$data.fdtFields.push(fdtField);
    });
  }
  handleFileUpload(): void {
    if (!this.$data.file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = (e) => {
      if (e && e.target != null) {
        var contents = e.target.result;
        var v = contents as string;
        let lines = v.split("\n");
        this.$data.fdtFields = [];
        this.$data.createFile.fdtDefinition = "";
        lines.forEach((line: string) => {
          line = line.replace(/;.*/g, "").trim();
          if (line != "") {
            this.$data.createFile.fdtDefinition =
              this.$data.createFile.fdtDefinition + line + "%";
            if (line.indexOf("=") > 0) {
              let fdtField = {
                descriptor: line,
              };
              this.$data.fdtConstructors.push(fdtField);
            } else {
              let f = line.split(",");
              let fdtField = {
                level: f[0],
                shortName: f[1],
                length: f[2],
                format: f[3],
                flags: f[4],
                comment: f[5],
              };
              this.$data.fdtFields.push(fdtField);
            }
          }
        });
      }
    };
    reader.readAsText(this.$data.file);
  }
  handleOk(bvModalEvt: any): void {
    const getConfig = {
      headers: authHeader("application/json"),
    };
    axios
      .post(
        config.Url() + "/adabas/database/" + this.$data.db.dbid() + "/file",
        this.$data.createFile,
        getConfig
      )
      .then((response: any) => {
        console.log("Response file creation" + response);
        if (response.status == 200) {
          this.addLobFile();
        }
      })
      .catch((error) => {
        if (error.response.data.Error) {
          this.$data.errorResponse = error.response.data.Error;
        } else {
          this.$data.errorResponse = error.response;
        }
        this.$root.$emit("bv::show::modal", "modal-multi-1", "#btnShow");
        console.log(
          error.response.statusText + ":" + JSON.stringify(error.response)
        );
      });
  }
  addLobFile(): void {
    if (this.$data.lobFile > 0) {
      const getConfig = {
        headers: authHeader("application/json"),
      };
      axios
        .put(
          config.Url() +
            "/adabas/database/" +
            this.$data.db.dbid() +
            "/file/" +
            this.$data.createFile.fileNumber +
            ":addlob?number=" +
            this.$data.lobFile,
          null,
          getConfig
        )
        .then((response: any) => {
          console.log(JSON.stringify(response));
        })
        .catch((error) => {
          if (error.response.data.Error) {
            this.$data.errorResponse = error.response.data.Error;
          } else {
            this.$data.errorResponse = error.response;
          }
          this.$root.$emit("bv::show::modal", "modal-multi-1", "#btnShow");
        });
    }
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
a {
  color: #42b983;
}
</style>
