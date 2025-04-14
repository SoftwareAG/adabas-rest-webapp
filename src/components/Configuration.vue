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
  <div class="configuration p-2" overflow-y="auto">
    <MyHeader></MyHeader>
    <div class="modal fade" id="modal-db" tabindex="-1" aria-labelledby="modalTitle" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalTitle">{{ modalTitle }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="my-4">{{ modalDescription }}</p>
            <div class="card bg-light">
              <div class="card-body">
                <div class="mb-3 row">
                  <label for="nested-dbid" class="col-sm-3 col-form-label text-sm-end">Database ID (dbid):</label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control" v-model="dbid" :class="{'is-invalid': !dbidState()}" id="nested-dbid" aria-describedby="input-live-help input-live-feedback" />
                    <div class="invalid-feedback" id="input-live-feedback">Out of range</div>
                    <div class="form-text" id="input-live-help">Database id in the range of greater 0 and smaller as 65536</div>
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="nested-url" class="col-sm-3 col-form-label text-sm-end">URL:</label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control" v-model="inputUrl" :class="{'is-invalid': !urlState()}" id="nested-url" aria-describedby="input-liveurl-help input-liveurl-feedback" />
                    <div class="invalid-feedback" id="input-liveurl-feedback">URL not correct</div>
                    <div class="form-text" id="input-liveurl-help">Either empty or it need to be a ADATCP URL</div>
                  </div>
                </div>
                <div class="collapse" id="mapFile-collapse">
                  <div class="mb-3 row">
                    <label for="nested-file" class="col-sm-3 col-form-label text-sm-end">Adabas file (file):</label>
                    <div class="col-sm-9">
                      <input type="number" class="form-control" v-model="file" :class="{'is-invalid': !fileState()}" id="nested-file" aria-describedby="input-file-live-help input-file-live-feedback" />
                      <div class="invalid-feedback" id="input-file-live-feedback">Out of range</div>
                      <div class="form-text" id="input-file-live-help">Database file in the range of greater 0 and smaller as 65536</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-danger" @click="handleOk">OK</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="modal-location" tabindex="-1" aria-labelledby="modalLocationTitle" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalLocationTitle">Add installation location</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="my-4">Add the Software AG suite installation location containing the Adabas installation.</p>
            <div class="card bg-light">
              <div class="card-body">
                <div class="mb-3 row">
                  <label for="nested-xlocation" class="col-sm-3 col-form-label text-sm-end">Software AG suite installation path:</label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control" v-model="location" :class="{'is-invalid': !locationState()}" id="nested-xlocation" aria-describedby="input-live-help input-live-feedback" />
                    <div class="invalid-feedback" id="input-live-feedback">Empty</div>
                    <div class="form-text" id="input-live-help">Directory of Software AG installation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-danger" @click="handleLocationOk">OK</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="modal-fileTransfer" tabindex="-1" aria-labelledby="modalFileTransferTitle" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalFileTransferTitle">Add allowed File transfer location</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="my-4">Add the Software AG file transfer location allowed to upload or download files.</p>
            <div class="card bg-light">
              <div class="card-body">
                <div class="mb-3 row">
                  <label for="nested-fileTransferName" class="col-sm-3 col-form-label text-sm-end">File transfer name:</label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control" v-model="fileTransferName" id="nested-fileTransferName" aria-describedby="input-live-help" />
                    <div class="form-text" id="input-live-help">Directory to upload or download files</div>
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="nested-fileTransferLocation" class="col-sm-3 col-form-label text-sm-end">File transfer location:</label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control" v-model="location" id="nested-fileTransferLocation" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-danger" @click="handleOk">OK</button>
          </div>
        </div>
      </div>
    </div>
    <div class="card border-secondary">
      <div class="card-header border-secondary">Adabas REST server configuration</div>
      <div class="card-body">
        <label>The configuration are applied when the action is set.</label>
        <ul class="nav nav-tabs mt-3" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="server-services-tab" data-bs-toggle="tab" data-bs-target="#server-services" type="button" role="tab" aria-controls="server-services" aria-selected="true">Server services</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="suite-installations-tab" data-bs-toggle="tab" data-bs-target="#suite-installations" type="button" role="tab" aria-controls="suite-installations" aria-selected="false">Suite installations</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="file-transfer-tab" data-bs-toggle="tab" data-bs-target="#file-transfer" type="button" role="tab" aria-controls="file-transfer" aria-selected="false">File transfer</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="data-access-tab" data-bs-toggle="tab" data-bs-target="#data-access" type="button" role="tab" aria-controls="data-access" aria-selected="false">Data access</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="database-metrics-tab" data-bs-toggle="tab" data-bs-target="#database-metrics" type="button" role="tab" aria-controls="database-metrics" aria-selected="false">Database metrics tracked</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="user-authorization-tab" data-bs-toggle="tab" data-bs-target="#user-authorization" type="button" role="tab" aria-controls="user-authorization" aria-selected="false">User Authorization</button>
          </li>
        </ul>
        <div class="tab-content mt-3" id="myTabContent">
          <div class="tab-pane fade show active" id="server-services" role="tabpanel" aria-labelledby="server-services-tab">
            <div class="card">
              <div class="card-header info-header">Server configuration</div>
              <div class="card-body">
                <div class="container-fluid">
                  <div class="row my-1">
                    <div class="col-sm-11">
                      The content location contains this web application to handle a number of configurations. The location may be changed to disable this web application. This need to be done manually changing the config.xml file.
                    </div>
                  </div>
                  <div class="row my-1">
                    <div class="col-sm-2">Content location:</div>
                    <div class="col-sm-9">
                      <input type="text" class="form-control" readonly v-model="config.Server.Content" />
                    </div>
                  </div>
                  <div class="row my-1">
                    <div class="col-sm-2">Log location:</div>
                    <div class="col-sm-2">
                      <select class="form-select" v-model="config.Server.LogLocation.level">
                        <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
                      </select>
                    </div>
                    <div class="col-sm-7">
                      <input type="text" class="form-control" v-model="config.Server.LogLocation.directory" />
                    </div>
                  </div>
                  <div class="row my-1">
                    <div class="col">
                      <table class="table table-striped table-bordered table-hover table-sm">
                        <thead>
                          <tr>
                            <th v-for="field in serviceFields" :key="field.key">{{ field.key }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="item in config.Server.Service" :key="item.port">
                            <td v-for="field in serviceFields" :key="field.key">{{ item[field.key] }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card">
              <div class="card-header info-header">Job Store</div>
              <div class="card-body">
                <div class="container">
                  <div class="row">
                    <div class="col-sm-2">Job store file location:</div>
                    <div class="col-sm-9">
                      <input type="text" class="form-control" v-model="config.JobStore.config" />
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-sm-2">Job store database:</div>
                    <div class="col-sm-9">
                      <input type="text" class="form-control" v-model="config.JobStore.Database.url" />
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-sm-2">Job store file:</div>
                    <div class="col-sm-9">
                      <input type="number" class="form-control" v-model="config.JobStore.Database.file" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="tab-pane fade" id="suite-installations" role="tabpanel" aria-labelledby="suite-installations-tab">
            <div class="container-fluid">
              <div class="row my-1">
                <div class="col-sm-2">Adabas Database location:</div>
                <div class="col-sm-9">
                  <input type="text" class="form-control" v-model="config.Module.AdabasData" />
                </div>
              </div>
              <div class="row my-1">
                <div class="col">
                  <button type="button" class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modal-location">Add</button>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <table class="table table-striped table-bordered table-hover table-sm">
                    <thead>
                      <tr>
                        <th v-for="field in instFields" :key="field.key">{{ field.name || field.key }}</th>
                        <th>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in config.Module.Installation" :key="item.Location">
                        <td v-for="field in instFields" :key="field.key">{{ item[field.key] }}</td>
                        <td>
                          <div class="mx-auto text-center">
                            <i class="bi bi-x-circle" @click="del_installation(item.Location)"></i>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="tab-pane fade" id="file-transfer" role="tabpanel" aria-labelledby="file-transfer-tab">
            <div class="container-fluid">
              <div class="row my-1">
                <div class="col">
                  <button type="button" class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modal-fileTransfer" @click="showMsgOk('filetransfer')">Add</button>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <table class="table table-striped table-bordered table-hover table-sm">
                    <thead>
                      <tr>
                        <th v-for="field in fileFields" :key="field.key">{{ field.key }}</th>
                        <th>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in config.Module.Directories" :key="item.name">
                        <td v-for="field in fileFields" :key="field.key">{{ item[field.key] }}</td>
                        <td>
                          <div class="mx-auto text-center">
                            <i class="bi bi-x-circle" @click="del_directories(item.name)"></i>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="tab-pane fade" id="data-access" role="tabpanel" aria-labelledby="data-access-tab">
            <div class="card">
              <div class="card-header info-header">Map repositories</div>
              <div class="card-body">
                <button type="button" class="btn btn-outline-primary" data-bs-toggle="collapse" data-bs-target="#mapFile-collapse" @click="showMsgOk('map')">Add</button>
                <table class="table table-striped table-bordered table-hover table-sm">
                  <thead>
                    <tr>
                      <th v-for="field in mapFields" :key="field.key">{{ field.key }}</th>
                      <th>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in config.Mapping.Database" :key="item.url + item.file">
                      <td v-for="field in mapFields" :key="field.key">{{ item[field.key] }}</td>
                      <td>
                        <div class="mx-auto text-center">
                          <i class="bi bi-x-circle" @click="del_mapping(item.url, item.file)"></i>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="card">
              <div class="card-header info-header">Classic database access</div>
              <div class="card-body">
                <div class="container-fluid">
                  <div class="row">
                    <div class="col-sm-1 text-end">
                      <input type="checkbox" class="form-check-input" v-model="config.DatabaseAccess.global" />
                    </div>
                    <div class="col-sm-10">
                      Provide access to all classic database ids (global)
                    </div>
                  </div>
                  <div class="row my-1">
                    <div class="col">
                      <button type="button" class="btn btn-outline-primary" @click="showMsgOk('classic')">Add</button>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col">
                      <table class="table table-striped table-bordered table-hover table-sm">
                        <thead>
                          <tr>
                            <th v-for="field in accessFields" :key="field.key">{{ field.key }}</th>
                            <th>Delete</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="item in config.DatabaseAccess.Database" :key="item.url">
                            <td v-for="field in accessFields" :key="field.key">{{ item[field.key] }}</td>
                            <td>
                              <div class="mx-auto text-center">
                                <i class="bi bi-x-circle" @click="del_access(item.url)"></i>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="tab-pane fade" id="database-metrics" role="tabpanel" aria-labelledby="database-metrics-tab">
            <div class="container-fluid">
              <div class="row my-1">
                <div class="col">
                  <button type="button" class="btn btn-outline-primary" @click="showMsgOk('metrics')">Add</button>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <table class="table table-striped table-bordered table-hover table-sm">
                    <thead>
                      <tr>
                        <th v-for="field in accessFields" :key="field.key">{{ field.key }}</th>
                        <th>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in config.Metrics.Database" :key="item.url">
                        <td v-for="field in accessFields" :key="field.key">{{ item[field.key] }}</td>
                        <td>
                          <div class="mx-auto text-center">
                            <i class="bi bi-x-circle" @click="del_metric(item.url)"></i>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="tab-pane fade" id="user-authorization" role="tabpanel" aria-labelledby="user-authorization-tab">
            <div class="container-fluid">
              <div class="row my-1">
                <div class="col">
                  <button type="button" class="btn btn-outline-primary">Add</button>
                </div>
                <div class="col">
                  Default read:<input type="text" class="form-control" v-model="user.readPermission" />
                </div>
                <div class="col">
                  Default write:<input type="text" class="form-control" v-model="user.writePermission" />
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <table class="table table-striped table-bordered table-hover table-sm">
                    <thead>
                      <tr>
                        <th v-for="field in userFields" :key="field.key">{{ field.key }}</th>
                        <th>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in user.Users" :key="item.name">
                        <td v-for="field in userFields" :key="field.key">
                          <template v-if="field.key === 'administrator'">
                            <input type="checkbox" class="form-check-input" v-model="item.administrator" @change="toggle(item)" />
                          </template>
                          <template v-else-if="field.key === 'readPermission'">
                            <input type="text" class="form-control" v-model="item.readPermission" />
                          </template>
                          <template v-else-if="field.key === 'writePermission'">
                            <select class="form-select" v-model="item.writePermission">
                              <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
                            </select>
                          </template>
                          <template v-else>
                            {{ item[field.key] }}
                          </template>
                        </td>
                        <td>
                          <div class="mx-auto text-center">
                            <i class="bi bi-x-circle" @click="del_metric(item.url)"></i>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-outline-primary" @click="adaptChanges()">Apply</button>
        <button type="button" class="btn btn-outline-primary" @click="storeChanges()">Store</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import MyHeader from '@/components/Header.vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import { AdabasConfig } from '../adabas/config';
import { Modal } from 'bootstrap';
// import { BIconXCircle } from 'bootstrap-vue-next/dist/icons';

export default defineComponent({
  components: {
    // BIconXCircle,
    MyHeader,
  },
  props: {
    msg: {
      type: String,
      required: true,
    },
  },
  setup() {
    const c = ref<AdabasConfig | null>(null);
    const fileTransferName = ref('');
    const location = ref('');
    const dbid = ref<number>(0);
    const inputUrl = ref('');
    const file = ref(100);
    const mapFileDisplay = ref(false);
    const modalType = ref('');
    const modalTitle = ref('Add Database');
    const modalDescription = ref('Enter Database id');
    const modalLabel = ref('Database');
    interface Installation {
      changed: boolean;
      deleted: boolean;
      Location: string;
    }

    const config = ref({
      DatabaseAccess: {
        Database: [] as Array<{ url: string; changed: boolean; deleted: boolean }>,
        Global: false,
      },
      Mapping: {
        Database: [],
        Installation: [] as Installation[],
      },
      Metrics: { Database: [] },
      Module: {
        AdabasData: '',
        Directories: [],
        Installation: [] as Installation[],
      },
      JobStore: {
        config: '',
        Database: {
          url: '',
          file: 0,
        },
      },
      Server: {
        Content: './static',
        LogLocation: { directory: 'logs/server.log', level: 'info' },
        Service: [],
      },
    });
    
    const originConfig = ref(null);
    const user = ref({
      readPermission: '',
      writePermission: '',
      Users: [],
    });
    const originUser = ref(null);
    const instFields = ref([
      { key: 'Location', name: 'Installation' },
      { key: 'Active' },
      { key: 'StructureLevel', name: 'Structure level' },
      { key: 'Version', name: 'Adabas Version' },
      'Delete',
    ]);
    const serviceFields = ref([{ key: 'port' }, { key: 'type' }]);
    const accessFields = ref([{ key: 'url' }, 'Delete']);
    const mapFields = ref([{ key: 'url' }, { key: 'file' }, 'Delete']);
    const fileFields = ref([{ key: 'name' }, { key: 'location' }, 'Delete']);
    const userFields = ref([
      { key: 'name' },
      { key: 'administrator' },
      { key: 'readPermission' },
      { key: 'writePermission' },
      'Delete',
    ]);
    const options = ref(['debug', 'info', 'error']);

    onMounted(() => {
      const adabasConfig = new AdabasConfig();
      c.value = adabasConfig;
      adabasConfig.read().then((configData: any) => {
        if (!configData.JobStore) {
          configData.JobStore = { config: '', Database: { url: '', file: 0 } };
        } else {
          if (!configData.JobStore.Database) {
            configData.JobStore.Database = { url: '', file: 0 };
          }
        }
        config.value = configData;
        originConfig.value = JSON.parse(JSON.stringify(configData));
      });
      adabasConfig.readUser().then((userData: any) => {
        user.value = userData;
        originUser.value = JSON.parse(JSON.stringify(c));
      });
    });

    const del_mapping = (location: string, file: number) => {
      console.log('Delete mapping : ' + location + ' ' + file);
      config.value.Mapping.Database.forEach((element: any) => {
        if (element.url === location && element.file === file) {
          element.Deleted = true;
        }
      });
    }; 

    const del_installation = (location: string) => {
      console.log('Delete installation : ' + location);
      config.value.Module.Installation.forEach((element: any) => {
        if (element.Location === location) {
          console.log('Remove -> ' + location);
          element.Deleted = true;
        }
      });
    }; 

    const del_access = (location: string) => {
      console.log('Delete access : ' + location);
      config.value.DatabaseAccess.Database.forEach((element: any) => {
        if (element.url === location) {
          element.Deleted = true;
        }
      });
    };

    const del_directories = (location: string) => {
      console.log('Delete directories : ' + location);
      config.value.Module.Directories.forEach((element: any) => {
        if (element.location === location) {
          element.Deleted = true;
        }
      });
    };

    const del_metric = (url: string) => {
      console.log('Delete metrics : ' + location);
      config.value.Metrics.Database.forEach((element: any) => {
        if (element.url === url) {
          element.Deleted = true;
        }
      });
    };

    const locationState = () => {
      return location.value === '' ? false : true;
    };



    const handleLocationOk = () => {
      console.log('handle location state check of ' + location.value);
      modalType.value = 'installation';
      handleOk();
    };

    const dbidState = () => {
      const dbidNumber = Number(dbid.value);
      return dbidNumber > 0 && dbidNumber < 65536 ? true : false;
    };

    const urlState = () => {
      if (inputUrl.value == '') {
        return true;
      }
      return /^adatcp[s]?:\/\/[\w\.]*:\d*$/.test(inputUrl.value);
    };

    const fileState = () => {
      return file.value > 0 && file.value < 64536 ? true : false;
    };

    const showMsgOk = (modalType: string) => {
      switch (modalType) {
        case 'classic':
          mapFileDisplay.value = false;
          modalTitle.value = 'Classic Database access';
          modalDescription.value =
            'Enter the classic database which should be able to access directly using classical database parameters like database id, file number and short name.';
          break;
        case 'metrics':
          mapFileDisplay.value = false;
          modalTitle.value = 'Enable Database metrics';
          modalDescription.value =
            'Enter the Adabas database which should be tracked for metrics requests.';
          break;
        case 'map':
          mapFileDisplay.value = true;
          modalTitle.value = 'Add Database repository';
          modalDescription.value =
            'Enter the Adabas database and Adabas file number of the Adabas Map repository which should be search in for Adabas Maps.';
          break;
      }

      const modalDb = new Modal(document.getElementById('modal-db'));
      modalDb.show();
    };

    const handleOk = () => {
      console.log('Handle ok show db modal ' + modalType.value);
      switch (modalType.value) {
        case 'installation':
          config.value.Module.Installation.push({
            changed: true,
            deleted: false,
            Location: location.value,
          });
          break;
        case 'classic':
          if (dbid.value > 0) {
            let notFound = config.value.DatabaseAccess.Database.every(
              (element: any) => {
                if (element.url == dbid.value + '') {
                  return false;
                }
                return true;
              }
            );
            if (!notFound) {
              return;
            }
            config.value.DatabaseAccess.Database.push({
              url: dbid.value + '',
              changed: true,
              deleted: false,
            });
          }
          break;
        case 'filetransfer':
          config.value.Module.FileAccess.Directories.push({
            location: location.value,
            name: fileTransferName.value,
            changed: true,
            deleted: false,
          });
          break;
        case 'map':
          if (dbid.value > 0) {
            let notFound = config.value.Mapping.Database.every(
              (element: any) => {
                if (
                  element.url == dbid.value + '' &&
                  element.file == file.value
                ) {
                  return false;
                }
                return true;
              }
            );
            if (!notFound) {
              return;
            }
            config.value.Mapping.Database.push({
              url: dbid.value + '',
              file: Number(file.value),
              changed: true,
              deleted: false,
            });
          }
          break;
        case 'metrics':
          if (dbid.value > 0) {
            if (config.value.Metrics.Database != null) {
              let notFound = config.value.Metrics.Database.every(
                (element: any) => {
                  if (element.url == dbid.value + '') {
                    return false;
                  }
                  return true;
                }
              );
              if (!notFound) {
                return;
              }
            } else {
              config.value.Metrics.Database = [];
            }
            config.value.Metrics.Database.push({
              url: dbid.value + '',
              changed: true,
            });
          }
          break;
        default:
          console.log('Unknown modal type');
      }
    };

    const toggle = (item: any) => {
      item.administrator = !item.administrator;
    };

    const adaptChanges = () => {
      console.log('Apply changes');
      if (c.value) {
        return c.value.putConfig(config.value).then((result: any) => {
          console.log('Applying ...');
        });
      }
    };

    const storeChanges = () => {
      console.log('Store changes');
      if (c.value) {
        return c.value.store().then((result: any) => {
          console.log('Storing ...');
        });
      }
    };

    return {
      c,
      fileTransferName,
      location,
      dbid,
      inputUrl,
      file,
      mapFileDisplay,
      modalType,
      modalTitle,
      modalDescription,
      modalLabel,
      config,
      originConfig,
      user,
      originUser,
      instFields,
      serviceFields,
      accessFields,
      mapFields,
      fileFields,
      userFields,
      options,
      del_mapping,
      del_installation,
      del_access,
      del_directories,
      del_metric,
      locationState,
      handleLocationOk,
      dbidState,
      urlState,
      fileState,
      showMsgOk,
      handleOk,
      toggle,
      adaptChanges,
      storeChanges,
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
.info-header {
  font-size: 12px;
}
.card-header {
  font-weight: bold;
  //font-size: 18px;
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
