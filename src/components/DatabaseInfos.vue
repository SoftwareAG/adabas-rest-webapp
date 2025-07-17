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
  <div class="databaseinfos p-2" overflow-y="auto">
    <Sidebar :url="url" />
    <div class="card border-secondary">
      <div class="card-header bg-secondary text-white">
        Adabas Database information for database {{ url }}
      </div>
      <div class="card-body">
        <Url url="/adabas/database" />
        <button class="btn btn-outline-primary" @click="infoRenameDatabase">
          Rename database
        </button>
        <div class="modal fade" id="modal-rename" tabindex="-1" aria-labelledby="modal-rename-label" aria-hidden="true">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="modal-rename-label">Rename Adabas database</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <p>Rename Adabas database {{ infos['Name'] }}</p>
                <input type="text" class="form-control" v-model="newName" />
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" @click="renameDatabase">Save changes</button>
              </div>
            </div>
          </div>
        </div>
        <table class="table table-striped table-bordered table-hover w-100 p-3">
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="info in infos" :key="info.Name">
              <td>{{ info.Name }}</td>
              <td>{{ info.Value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <StatusBar />
    <ErrorModal />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, provide } from 'vue';
import Sidebar from './Sidebar.vue';
import StatusBar from '@/components/StatusBar.vue';
import store from '../store/index';
import Url from './Url.vue';
import ErrorModal from '@/components/ErrorModal.vue';
import { SearchDatabases } from '@/adabas/admin';

export default defineComponent({
  name: 'DatabaseInfos',
  components: {
    Sidebar,
   StatusBar,
    Url,
    ErrorModal,
  },
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    provide('type', 'static');
    const db = ref(null);
    const newName = ref('');
    const infos = ref([]);
    const fields = ref(['Name', 'Value']);
    const information = ref({
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
    });

    const queryInformation = () => {
      db.value.information().then((response: any) => {
        infos.value = [];
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
          infos.value.push({
            Name: element,
            Value: response.Gcb[element],
          });
        });
        information.value = response;
      });
    };

    const infoRenameDatabase = () => {
      this.$root.$emit('bv::show::modal', 'modal-rename', '#btnShow');
    };

    const renameDatabase = () => {
      if (newName.value !== '') {
        db.value
          .renameDatabase(newName.value)
          .then(() => {
            queryInformation();
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
      newName.value = '';
    };

    onMounted(() => {
      db.value = SearchDatabases(props.url);
      queryInformation();
    });

    return {
      newName,
      infos,
      fields,
      information,
      infoRenameDatabase,
      renameDatabase,
    };
  },
});
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
