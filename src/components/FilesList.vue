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
  <div class="fileslist p-2" overflow-y="auto">
    <Sidebar :url="url" />
    <div class="card border-secondary">
      <div class="card-header border-secondary">
        Adabas Database files for database {{ url }}
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the list of Adabas database files to be
              administrate through this Adabas RESTful server.
            </div>
          </div>
          <div class="row">
            <div class="col">
              <CreateFile :url="url" />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <Url :url="'/adabas/database' + url + '/file'" />
            </div>
          </div>
          <div class="row">
            <div class="col-sm-10">
              <nav aria-label="Page navigation">
                <ul class="pagination">
                  <li class="page-item" v-for="page in totalPages" :key="page">
                    <a class="page-link" href="#" @click="currentPage = page">{{ page }}</a>
                  </li>
                </ul>
              </nav>
            </div>
            <div class="col-sm-2">
              <select v-model="perPage" class="form-select form-select-sm mt-3">
                <option v-for="option in perPageOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <div class="mb-0">
                <label for="filterInput" class="form-label-sm col-sm-3 col-form-label text-sm-end">Filter</label>
                <div class="input-group input-group-sm">
                  <input v-model="filter" type="search" id="filterInput" class="form-control" placeholder="Type to Search">
                  <button class="btn btn-outline-secondary" :disabled="!filter" @click="filter = ''">Clear</button>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <table class="table table-striped table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th v-for="field in fields" :key="field">{{ field }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="file in files" :key="file.FileNr" @click="onRowSelected(file)">
                    <td>{{ file.FileNr }}</td>
                    <td>{{ file.Name }}</td>
                    <td>{{ file.Type }}</td>
                    <td>{{ new Intl.NumberFormat().format(file.RecordCount) }}</td>
                    <td>{{ file.IsLob }}</td>
                    <td>{{ file.IsLobRoot }}</td>
                    <td>
                      <div class="btn-group">
                        <button class="btn btn-outline-info btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          Actions
                        </button>
                        <ul class="dropdown-menu">
                          <li><a class="dropdown-item" href="javascript:void(0)" @click="infoDeleteFile(file)">Delete</a></li>
                          <li><a class="dropdown-item" href="javascript:void(0)" @click="infoAddLob(file)">Add LOB file</a></li>
                          <li><a class="dropdown-item" href="javascript:void(0)" @click="infoRenumberFile(file)">Renumber</a></li>
                          <li><a class="dropdown-item" href="javascript:void(0)" @click="refreshFile(file)">Refresh</a></li>
                          <li><a class="dropdown-item" href="javascript:void(0)" @click="infoRenameFile(file)">Rename</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div v-if="hideFileParameter">
                <div class="alert alert-primary" role="alert">Please select Adabas file</div>
              </div>
              <div v-else>
                <ul class="nav nav-tabs mt-3" id="myTab" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="info-tab" data-bs-toggle="tab" data-bs-target="#info" type="button" role="tab" aria-controls="info" aria-selected="true">Information</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link" id="field-tab" data-bs-toggle="tab" data-bs-target="#field" type="button" role="tab" aria-controls="field" aria-selected="false">Field definition</button>
                  </li>
                </ul>
                <div class="tab-content mt-3" id="myTabContent">
                  <div class="tab-pane fade show active" id="info" role="tabpanel" aria-labelledby="info-tab">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="param in fileParameter" :key="param.Name">
                          <td>{{ param.Name }}</td>
                          <td>
                            <div v-if="['NIextents', 'UIextents', 'ACextents', 'DSextents'].includes(param.Name)">
                              <table class="table table-sm">
                                <thead>
                                  <tr>
                                    <th>FirstRabn</th>
                                    <th>LastRabn</th>
                                    <th>LenOrIsns</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="extent in param.Value" :key="extent.FirstRabn">
                                    <td>{{ extent.FirstRabn }}</td>
                                    <td>{{ extent.LastRabn }}</td>
                                    <td>{{ extent.LenOrIsns }}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div v-else>
                              {{ param.Value }}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="tab-pane fade" id="field" role="tabpanel" aria-labelledby="field-tab">
                    <div v-if="!fdtAvailable">
                      <div class="alert alert-primary" role="alert">Adabas file definition table only available if Adabas database is online</div>
                    </div>
                    <div v-else>
                      <table class="table table-striped table-bordered table-hover table-sm">
                        <thead>
                          <tr>
                            <th>Level</th>
                            <th>Name</th>
                            <th>Length</th>
                            <th>Format</th>
                            <th>Flags</th>
                            <th>Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="field in fileFields" :key="field.Name">
                            <td><pre>{{ levelSpace(field.Level) }}</pre></td>
                            <td>{{ field.Name }}</td>
                            <td>{{ field.Length }}</td>
                            <td>{{ field.Format }}</td>
                            <td>{{ field.Flags }}</td>
                            <td>{{ field.Type }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div v-if="fdtSubAvailable">
                      SubFields
                      <table class="table table-striped table-bordered table-hover table-sm">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Name</th>
                            <th>Length</th>
                            <th>Format</th>
                            <th>Flags</th>
                            <th>Parent field(s)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="subfield in subFields" :key="subfield.Name">
                            <td>{{ subfield.Type }}</td>
                            <td>{{ subfield.Name }}</td>
                            <td>{{ subfield.Length }}</td>
                            <td>{{ subfield.Format }}</td>
                            <td>{{ subfield.Flags }}</td>
                            <td>
                              <ul v-if="subfield.SubFields">
                                <ul v-for="subfd in subfield.SubFields" :key="subfd.Name">
                                  <td>  {{ subfd.SubName }}  </td>
                                  <td>  ( {{ subfd.From }} - {{ subfd.To }} )</td>
                                </ul>
                              </ul>
                              <ul v-if="subfield.Type === 'COLLATION'">
                                  <td>  {{ subfield.CollationParent }}  </td>
                                  <td>  </td>
                                  <td>  {{ subfield.CollationAttribute }}  </td>
                              </ul>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div v-if="fdtRefAvailable">
                      Referential Integrity
                      <table class="table table-striped table-bordered table-hover table-sm">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Name</th>
                            <th>Refer. file</th>
                            <th>Primary field</th>
                            <th>Foreign field</th>
                            <th>Rules</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="reffield in refFields" :key="reffield.Name">
                            <td>{{ reffield.ReferentialType }}</td>
                            <td>{{ reffield.Name }}</td>
                            <td>{{ reffield.ReferentialFile }}</td>
                            <td>{{ reffield.PrimaryField }}</td>
                            <td>{{ reffield.ForeignField }}</td>
                            <td>{{ reffield.Flags }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="modal-renumber" tabindex="-1" aria-labelledby="modal-renumber-label" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modal-renumber-label">Renumber Adabas File</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Renumber Adabas file {{ currentFile }}</p>
            <input type="number" v-model.number="newNr" class="form-control">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="renumberFile">Save changes</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="modal-addlob" tabindex="-1" aria-labelledby="modal-addlob-label" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modal-addlob-label">Add Large Object File for Adabas File</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Add Large Object LOB file for Adabas file {{ currentFile }}</p>
            <input type="number" v-model.number="newNr" class="form-control">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="addLobFile">Save changes</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="modal-rename" tabindex="-1" aria-labelledby="modal-rename-label" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modal-rename-label">Rename Adabas File</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Rename Adabas file {{ currentFile }}</p>
            <input type="text" v-model.trim="newName" class="form-control">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="renameFile">Save changes</button>
          </div>
        </div>
      </div>
    </div>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import Sidebar from './Sidebar.vue';
import store from '../store/index';
import StatusBar from '@/components/StatusBar.vue';
import CreateFile from './CreateFile.vue';
import Url from './Url.vue';
import { SearchDatabases } from '@/adabas/admin';
import { useRouter } from 'vue-router';
import * as bootstrap from 'bootstrap';

export default defineComponent({
  name: 'FilesList',
  components: {
    Sidebar,
   StatusBar,
    CreateFile,
    Url,
  },
  props: {
    url: String,
  },
  setup(props) {
    let modalInstance: bootstrap.Modal | null = null;
    let modalInstanceRename: bootstrap.Modal | null = null;
    let modalInstanceAddLOB: bootstrap.Modal | null = null;
    const router = useRouter();
    const db = ref(null);
    const newName = ref('');
    const newNr = ref(500);
    const currentFile = ref(0);
    const perPage = ref(10);
    const perPageOptions = ref([10, 20, 50, 100]);
    const currentPage = ref(1);
    const fields = ref(['FileNr', 'Name', 'Type', 'RecordCount', 'IsLob', 'IsLobRoot', 'action']);
    const files = ref([]);
    const filter = ref('');
    const filterOn = ref(['FileNr', 'Name']);
    const hideFileParameter = ref(true);
    const fdtAvailable = ref(false);
    const fdtSubAvailable = ref(false);
    const fdtRefAvailable = ref(false);
    const fileParameter = ref([]);
    const fileParameterOrder = ref([
      'Name',
      'Number',
      'StructureLevel',
      'Flags',
      'RecordCount',
      'TopIsn',
      'MaxIsn',
      'IsnCnt',
      'MaxRecordLength',
      'RootFile',
      'LobFile',
      'MaxMuOccurence',
      'LastModification',
      'PaddingFactorAsso',
      'PaddingFactorData',
      'FdtStartRABN',
      'HIRabn',
      'LastUsedDataRABN',
      'HighestIndexLevel',
      'TotalAcBlocks',
      'TotalNiBlocks',
      'TotalUiBlocks',
      'TotalDsBlocks',
      'ACextents',
      'NIextents',
      'UIextents',
      'DSextents',
    ]);
    const fileParameterDrop = ref([
      'AdamByteKeys',
      'AdamKey',
      'FdtLength',
      'Owner',
      'ResidualCountDSST',
      'RotatingIsn',
      'RotatingRabnDSST',
      'LastNiExtendIndex',
      'LastUiExtendIndex',
    ]);
    const parameterFields = ref(['Name', 'Value']);
    const fileFields = ref([]);
    const subFields = ref([]);
    const refFields = ref([]);
    const fieldFields = ref(['Level', 'Name', 'Length', 'Format', 'Flags', 'Type', 'SubFields']);
    const timer = ref('');

    onMounted(() => {
      console.log("onMounted");
      const modalrenumber = document.getElementById('modal-renumber');
      const modalrename = document.getElementById('modal-rename');
      const modalAddLob = document.getElementById('modal-addlob');
      modalInstance = new bootstrap.Modal(modalrenumber);
      modalInstanceRename = new bootstrap.Modal(modalrename);
      modalInstanceAddLOB = new bootstrap.Modal(modalAddLob);
      db.value = SearchDatabases(props.url);
      timer.value = setInterval(loadFiles, 15000);
      if (db.value === undefined) {
        store.dispatch('SYNC_ADMIN_DBS');
        return;
      }
      loadFiles();
    });

    const loadFiles = () => {
      if (db.value === undefined) {
        db.value = SearchDatabases(props.url);
        if (db.value === undefined) {
          return;
        }
      }
      db.value.fileList().then((response: any) => {
        files.value = response;
      });
    };

    const onRowSelected = (items: any) => {
      fdtSubAvailable.value = false;
      fdtRefAvailable.value = false;

      if (items.length == 0) {
        fileParameter.value = [];
        fileFields.value = [];
        subFields.value = [];
        refFields.value = [];
        return;
      }
      db.value.fileInfo(items.FileNr).then((response: any) => {
        let fileParameterData = response;
        fileParameterData = fileParameterData.filter((a: any) => {
          return !(fileParameterDrop.value.indexOf(a.Name) !== -1);
        });
        fileParameterData.sort((a: any, b: any) => {
          let ai = fileParameterOrder.value.indexOf(a.Name);
          let bi = fileParameterOrder.value.indexOf(b.Name);
          return ai - bi;
        });
        fileParameter.value = fileParameterData;
        hideFileParameter.value = false;
      });
      db.value
        .fileFields(items.FileNr)
        .then((response: any) => {
          fileFields.value = response;
          fdtAvailable.value = true;
          subFields.value = fileFields.value.filter(item => 'SubFields' in item);
          refFields.value = fileFields.value.filter(item => item.Type === 'REFERENTIAL');
          subFields.value = subFields.value.filter(item => item.Type !== 'REFERENTIAL');
          fileFields.value = fileFields.value.filter(item => !('SubFields' in item));

          if(refFields.value.length != 0)
          {
            fdtRefAvailable.value = true;
          }
          
          if(subFields.value.length != 0 )
          {
            fdtSubAvailable.value = true;
          }
          
        })
        .catch((error: any) => {
          fdtAvailable.value = false;
        });
    };

    const levelSpace = (nr: number) => {
      let res = '';
      for (let i = 0; i < nr; i++) {
        res += ' ';
      }
      return res + nr;
    };

    const infoDeleteFile = async (item: any) => {
      currentFile.value = item.FileNr;
      const confirmed = window.confirm(`Please confirm that you want to delete the Adabas file ${item.FileNr}.`);
    
      if (confirmed) {
        try {
          await db.value.deleteFile(currentFile.value);
          loadFiles();
        } catch (error) {
          console.error("Failed to delete file:", error);
        }
        return;
      }
    };

    const infoRenumberFile = (item: any) => {
      currentFile.value = item.FileNr;
      console.log('Renumber ' + item.FileNr);
      if (modalInstance) {
        modalInstance.show();
      }
    };

    const infoRenameFile = (item: any) => {
      currentFile.value = item.FileNr;
      newName.value = item.Name;
      console.log('Rename ' + item.FileNr);
      if (modalInstanceRename) {
        modalInstanceRename.show();
      }
    };

    const infoAddLob = (item: any) => {
      currentFile.value = item.FileNr;
      console.log('Add Lob file ' + item.FileNr);
      if (modalInstanceAddLOB) {
        modalInstanceAddLOB.show();
      }
    };

    const renumberFile = async () => {
      console.log('Renumber ' + currentFile.value + ' to ' + newNr.value);
      if (newNr.value > 0) {
        const response = await db.value.renumberFile(currentFile.value, newNr.value);
      }
      loadFiles();
    };

    const addLobFile = () => {
      console.log('Add LOB file for ' + currentFile.value + ' with ' + newNr.value);
      if (newNr.value > 0) {
        db.value.addLobFile(currentFile.value, newNr.value);
      }
      newNr.value = 0;
      loadFiles();
    };

    const renameFile = async () => {
      console.log('Renamer ' + currentFile.value + ' with ' + newName.value);
      if (newName.value != '') {
        const response = await db.value.renameFile(currentFile.value, newName.value);
      }
      newName.value = '';
      loadFiles();
    };

    const refreshFile = async (item: any) => {
      currentFile.value = item.FileNr;
      console.log('Refresh ' + item.FileNr + ' ' + JSON.stringify(item));

      const confirmed = window.confirm(`Please confirm that you want to refresh the Adabas file ${item.FileNr}.`);
      if (confirmed) {
        console.log('Confirmed refresh for ' + currentFile.value);
        await db.value.refreshFile(currentFile.value);
      } else {
        console.log('Refresh cancelled');
      }
    };

    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return {
      db,
      newName,
      newNr,
      currentFile,
      perPage,
      perPageOptions,
      currentPage,
      fields,
      files,
      filter,
      filterOn,
      hideFileParameter,
      fdtAvailable,
      fileParameter,
      fileParameterOrder,
      fileParameterDrop,
      parameterFields,
      fileFields,
      subFields,
      refFields,
      fieldFields,
      timer,
      loadFiles,
      onRowSelected,
      levelSpace,
      infoDeleteFile,
      infoRenumberFile,
      infoRenameFile,
      infoAddLob,
      renumberFile,
      addLobFile,
      renameFile,
      refreshFile,
      fdtSubAvailable,
      fdtRefAvailable,
      modalInstance,
      modalInstanceRename,
      modalInstanceAddLOB,
    };
  },
});
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
