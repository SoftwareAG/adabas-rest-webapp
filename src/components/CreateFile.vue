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
  <div class="createfile p-2" overflow-y="auto">
    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-1">Create Adabas file</button>
    <div class="modal fade" id="modal-multi-1" tabindex="-1" aria-labelledby="modal-multi-1-label" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modal-multi-1-label">Error creating file</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-danger" role="alert">
              <p class="my-2">{{ errorResponse }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="modal-1" tabindex="-1" aria-labelledby="modal-1-label" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modal-1-label">Create Adabas file</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="my-4">Please provide new file parameters</p>
            <div class="card bg-light">
              <div class="card-body">
                <div class="mb-3 row">
                  <label for="nested-dbid" class="col-sm-3 col-form-label text-end">Database file number:</label>
                  <div class="col-sm-9">
                    <input type="number" class="form-control" id="nested-dbid" v-model.number="createFile.fileNumber">
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="nested-name" class="col-sm-3 col-form-label text-end">Name:</label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control" id="nested-name" v-model="createFile.fduOptions.fduName">
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="nested-checkpoint" class="col-sm-3 col-form-label text-end">Lob File:</label>
                  <div class="col-sm-9">
                    <input type="number" class="form-control" id="nested-checkpoint" v-model.number="lobFile">
                  </div>
                </div>
                <table class="table">
                  <thead>
                    <tr>
                      <th v-for="field in fields" :key="field.key">{{ field.text }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in fdtFields" :key="item.shortName">
                      <td v-for="field in fields" :key="field.key">{{ item[field.key] }}</td>
                    </tr>
                  </tbody>
                </table>
                <table class="table">
                  <thead>
                    <tr>
                      <th v-for="field in constructorFields" :key="field">{{ field }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in fdtConstructors" :key="item.descriptor">
                      <td>{{ item.descriptor }}</td>
                    </tr>
                  </tbody>
                </table>
                <div class="mb-3">
                  <input class="form-control" type="file" accept=".fdt" @change="handleFileChange" placeholder="Choose a file or drop it here...">
                </div>
                <button type="button" class="btn btn-primary" @click="handleFileUpload">Upload</button>
                <div class="mt-3">Selected file: {{ file ? file.name : "" }}</div>
                <div v-if="errorMsg" class="text-danger mt-3">{{ errorMsg }}</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="handleOk">Save changes</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import axios from "axios";
import { config } from "../store/config";
import { authHeader } from "../user/auth-header";
import store from "../store/index";
// import { ModalPlugin } from "bootstrap-vue-next";
import { SearchDatabases } from '@/adabas/admin';

export default defineComponent({
  props: {
    url: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const file = ref<File | null>(null);
    const errorMsg = ref<string>('');
    const useJob = ref(false);
    const fdtFields = ref<{ level: any; shortName: any; length: any; format: any; flags: any; comment: any }[]>([]);
    const fields = ref([
      { key: "level", text: "Level" },
      { key: "shortName", text: "ShortName" },
      { key: "length", text: "Length" },
      { key: "format", text: "Format" },
      { key: "flags", text: "Flags" },
    ]);
    const constructorFields = ref(["descriptor"]);
    const fdtConstructors = ref([]);
    const createFile = ref({
      fileNumber: "350",
      fduOptions: {
        fduName: "GO_TEST",
        fduBlocksizeDS: "0",
        fduBlocksizeAC: "0",
        fduBlocksizeNI: "0",
        fduBlocksizeUI: "0",
        fduACrabn: "0",
        fduAssoPfac: "0",
        fduNiBlocksize: "0",
        fduNobt: "0",
        fduCipher: "0",
        fduContiguous: "0",
        fduDataPfac: "0",
        fduNoDsst: "0",
        fduUiBlocksize: "0",
        fduDSRabn: "0",
        fduDSSize: "0",
        fduErase: "0",
        fduPGMRefresh: "0",
        fduDSMUnitNILong: "0",
        fduDSMUnitUILong: "0",
        fduIsnSize: "0",
        fduNiRabn: "0",
        fduNISize: "0",
        fduReuse: "0",
        fduUIRabn: "0",
        fduUISize: "0",
        fduDSMUnitDS: "0",
        fduDSMUnitNI: "0",
        fduDSMUnitUI: "0",
        fduAdamKey: "0",
        fduLobFileOption: "0",
        fduMaxRecordLength: "0",
        fduAdamDsBlocks: "0",
        fduParamAdam: "0",
        fduLobFile: "0",
        fduAdamOffset: "0",
        fduAdamByteKey: "",
        fduOverflowAdam: "0",
        fduNiLongRabn: "0",
        fduNiLongSize: "0",
        fduUiLongRabn: "0",
        fduUiLongSize: "0",
        fduSystemFileMaxMu: "0",
      },
      fdtDefinition: "1,AQ%2,AF,15,A,NU%1,NN,20,A,DE,UQ%1,VN,20,A,DE",
    });
    const lobFile = ref(0);
    const db = ref(null);
    const errorResponse = ref(null);

    onMounted(() => {
      errorMsg.value="";
      db.value = SearchDatabases(props.url);

      // Predefined
      let x = createFile.value.fdtDefinition.split("%");
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
        fdtFields.value.push(fdtField);
      });
    });

    const handleFileChange = (e: Event) => {
      errorMsg.value="";
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        file.value = target.files[0];
        console.log('Selected file:', file.value.name);
      } else {
        errorMsg.value = 'No file selected in input.';
        console.log('No file selected in input');
      }
    };

    const handleFileUpload = () => {
      errorMsg.value="";
      if (!file.value) {
        errorMsg.value = 'No file selected.';
        console.warn("No file selected");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e?.target?.result) {
          const contents = e.target.result as string;
          const lines = contents.split("\n");
          
          fdtFields.value = [];
          fdtConstructors.value = [];
          createFile.value.fdtDefinition = "";
          lines.forEach((line: string) => {
            line = line.replace(/;.*/g, "").trim();
            if (line !== "") {
              createFile.value.fdtDefinition += line + "%";

              if (line.includes("=")) {
                const fdtField = { descriptor: line };
                fdtConstructors.value.push(fdtField);
              } else {
                const f = line.split(",");
                const fdtField = {
                  level: f[0],
                  shortName: f[1],
                  length: f[2],
                  format: f[3],
                  flags: f[4],
                  comment: f[5],
                };
                fdtFields.value.push(fdtField);
              }
            }
          });
        }
      };
      reader.readAsText(file.value);
    };

    const handleOk = (bvModalEvt: any) => {
      errorMsg.value="";
      createFile.value.fileNumber = String(createFile.value.fileNumber);
      const getConfig = {
        headers: authHeader("application/json"),
      };
      axios
        .post(
          config.Url() + "/adabas/database/" + db.value.dbid() + "/file",
          createFile.value,
          getConfig
        )
        .then((response: any) => {
          console.log("Response file creation" + response);
          if (response.status == 200) {
            addLobFile();
          }
        })
        .catch((error) => {
          if (error.response.data.Error) {
            errorResponse.value = error.response.data.Error;
          } else {
            errorResponse.value = error.response;
          }
          errorMsg.value=error.response.status+":"+error.response.statusText+","+error.response.data.Error.code+":"+error.response.data.Error.message;
          console.log(
            error.response.statusText + ":" + JSON.stringify(error.response)
          );
        });
        return;
    };

    const addLobFile = () => {
      errorMsg.value="";
      if (lobFile.value > 0) {
        const getConfig = {
          headers: authHeader("application/json"),
        };
        axios
          .put(
            config.Url() +
              "/adabas/database/" +
              db.value.dbid() +
              "/file/" +
              createFile.value.fileNumber +
              ":addlob?number=" +
              lobFile.value,
            null,
            getConfig
          )
          .then((response: any) => {
            console.log(JSON.stringify(response));
          })
          .catch((error) => {
            if (error.response.data.Error) {
              errorResponse.value = error.response.data.Error;
            } else {
              errorResponse.value = error.response;
            }
            this.$root.$emit("bv::show::modal", "modal-multi-1", "#btnShow");
          });
      }
    };

    return {
      file,
      errorMsg,
      useJob,
      fdtFields,
      fields,
      constructorFields,
      fdtConstructors,
      createFile,
      lobFile,
      db,
      errorResponse,
      handleFileUpload,
      handleFileChange,
      handleOk,
      addLobFile,
    };
  },
});
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
