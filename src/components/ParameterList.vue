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
  <div class="parameterlist p-2">
    <Sidebar :url="url" />
    <b-card :header="'Parameters for Adabas Database ' + url" border-variant="secondary" header-border-variant="secondary">
      <b-card-body>
        <b-container fluid>
          <b-row>
            <b-col>
              This page provides the parameters of the Adabas database to be administrated through this Adabas RESTful server.
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <Url :url="'/adabas/database'" />
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-select
                v-model="type"
                @change="getTypeItem"
                :options="options"
                size="sm"
              />
            </b-col>
            <b-col>
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
                  />
                  <b-input-group-append>
                    <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
            </b-col>
            <b-col>
              <b-button
                size="sm"
                variant="outline-primary"
                class="ml-2"
                @click="updateParameter"
              >Update parameter</b-button>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-table
                ref="paraTable"
                striped
                bordered
                hover
                small
                :filter="filter"
                :filterIncludedFields="filterOn"
                :items="parameters"
                :fields="fields"
              >
                <template #cell(edit)="row">
                  <div v-if="['ADATCP', 'BI', 'PLOG'].includes(row.item.Name)">
                    <b-form-checkbox
                      switch
                      v-model="row.item.Value"
                      @change="submit(row.item)"
                      value="YES"
                    />
                  </div>
                  <div v-else-if="row.item.Name === 'AR'">
                    <b-form-select
                      @change="submit(row.item)"
                      v-model="row.item.Value"
                      :options="['ABORT', 'CONTINUE']"
                    />
                  </div>
                  <div v-else-if="row.item.Name === 'LOGGING'">
                    <b-form-group>
                      <template #label>
                        <b-form-checkbox
                          v-model="allSelected"
                          :indeterminate="indeterminate"
                          aria-describedby="flavours"
                          aria-controls="flavours"
                          @change="toggleAll"
                        >
                          {{ allSelected ? 'Un-select All' : 'Select All' }}
                        </b-form-checkbox>
                      </template>

                      <b-form-checkbox-group
                        id="logging"
                        v-model="spaLogging"
                        :options="loggingParameters"
                        name="logging"
                        class="ml-4"
                        aria-label="Individual flavours"
                        @change="submit(row.item)"
                        stacked
                      />
                    </b-form-group>
                  </div>
                  <div v-else-if="row.item.Name === 'USEREXITS'">
                    <b-form-checkbox-group
                      id="userexits"
                      v-model="spaUserexits"
                      :options="userexitsParameters"
                      name="userexits"
                      class="ml-4"
                      aria-label="Individual flavours"
                      stacked
                      @change="submit(row.item)"
                    />
                  </div>
                  <div v-else-if="row.item.Name === 'OPTIONS'">
                    <b-form-select 
                      multiple 
                      @change="submit(row.item)" 
                      v-model="spaOptions" 
                      :options="optionOptions" 
                    />
                  </div>
                  <div v-else>
                    <b-form-input 
                      @change="submit(row.item)"
                      v-model="row.item.Value"
                    />
                  </div>
                </template>
                <template #cell(changed)="row">
                  <b-form-checkbox disabled v-model="row.item.changed" />
                </template>
              </b-table>
            </b-col>
          </b-row>
        </b-container>
      </b-card-body>
    </b-card>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import { authHeader } from '../user/auth-header';
import { config } from '../store/config';
import { userService } from '../user/service';
import Sidebar from './Sidebar.vue';
import store from '../store/index';
import StatusBar from './StatusBar.vue';
import Url from './Url.vue';
import axios from 'axios';
import { SearchDatabases } from '@/adabas/admin';

export default defineComponent({
  components: {
    StatusBar,
    Sidebar,
    Url,
  },
  props: {
    url: {
      type: String,
      required: false
    }
  },
  setup(props) {
    const type = ref('static');
    const allSelected = ref(false);
    const indeterminate = ref(false);
    const filter = ref('');
    const filterOn = ref(['Name', 'Description']);
    const fields = ref([
      { key: 'Name', sortable: true },
      { key: 'Description', sortable: true },
      'MinValue',
      'MaxValue',
      { key: 'OrgValue', label: 'Original value' },
      { key: 'edit', label: 'Edited' },
      'changed',
    ]);
    const options = ref([
      { value: 'static', text: 'Static parameters' },
      { value: 'dynamic', text: 'Dynamic parameters' },
    ]);
    const parameters = ref<any[]>([]);
    const optionOptionsOffline = ref([
      { text: 'Auto Expand', value: 'AUTO_EXPAND' },
      { text: 'Utilities only', value: 'UTILITIES_ONLY' },
      { text: 'Local utilities', value: 'LOCAL_UTILITIES' },
      { text: 'Open required', value: 'OPEN_REQUIRED' },
      { text: 'Fault tolerant AR', value: 'FAULT_TOLERANT_AR' },
      { text: 'Autorestart only', value: 'AUTORESTART_ONLY' },
      { text: 'Read-only', value: 'READONLY' },
      { text: 'XA', value: 'XA' },
      { text: 'Truncation', value: 'TRUNCATION' },
      { text: 'Deactivate dynamic options', value: 'DEACTIVATE' },
      { text: 'NO PLOG replication', value: 'NOPLOG_REPLICATION' },
    ]);
    const optionOptionsOnline = ref([
      { text: 'Utilities only', value: 'UTILITIES_ONLY' },
      { text: 'Local utilities', value: 'LOCAL_UTILITIES' },
    ]);
    const optionOptions = ref<any[]>([]);
    const spaOptions = ref<any[]>([]);
    const spaLogging = ref<any[]>([]);
    const loggingParameters = ref(['CB', 'FB', 'RB', 'SB', 'VB', 'IB', 'BD', 'AR']);
    const spaUserexits = ref<any[]>([]);
    const userexitsParameters = ref([
      { text: 'Userexit 1', value: 1 },
      { text: 'Userexit 2', value: 2 },
      { text: 'Userexit 4', value: 4 },
      { text: 'Userexit 11', value: 11 },
      { text: 'Userexit 14', value: 14 },
    ]);
    let db: any = null;

    const queryParameters = () => {
      if (!db) {
        db = SearchDatabases(props.url);
      }

      if (!db) {
        return;
      }

      let doStaticType = type.value === 'static';
      db.parameters(doStaticType).then((response: any) => {
        parameters.value = response;
        parameters.value.forEach((element: any) => {
          element.OrgValue = element.Value;
        });
        let p = parameters.value.filter((i: any) => i.Name === 'OPTIONS');
        parseOptions(p[0].Value);
        p = parameters.value.filter((i: any) => i.Name === 'LOGGING');
        parseLogging(p[0].Value);
        p = parameters.value.filter((i: any) => i.Name === 'USEREXITS');
        parseUserexits(p[0].Value);
        optionOptions.value = doStaticType ? optionOptionsOffline.value : optionOptionsOffline.value;
        getParameterInfo();
      });
    };

    const getParameterInfo = () => {
      db.parameterInfo().then((response: any) => {
        parameters.value.forEach((element: any) => {
          let name = element.Name;
          switch (element.Name) {
            case 'ADATCPATB':
              name = 'TCPATB';
              break;
            case 'ADATCPCONNECTIONS':
              name = 'TCPCONNECTIONS';
              break;
            case 'ADATCPPORT':
              name = 'PORTNUMBER';
              break;
            case 'ADATCPRECEIVER':
              name = 'TCPRECEIVER';
              break;
            case 'SSLPORT':
              name = 'SSLPORTNUMBER';
              break;
            default:
              break;
          }
          let v = response.filter((f: any) => f.Acronym === name);
          if (v.length > 0) {
            element.Description = v[0].Description;
            element.OnlineValue = v[0].OnlineValue;
            element.InifileValue = v[0].InifileValue;
            if (v[0].IsMaxValueAvailable) {
              element.IsMaxValueAvailable = true;
              element.MinValue = v[0].MinValue;
              element.MaxValue = v[0].MaxValue;
            }
          } else {
            element.Description = '<not available>';
          }
        });
      });
    };

    const getTypeItem = (newtype: any) => {
      type.value = newtype;
      queryParameters();
    };

    const parseOptions = (value: string) => {
      spaOptions.value = value.split(',');
    };

    const parseLogging = (value: string) => {
      spaLogging.value = value.split(',');
    };

    const parseUserexits = (value: string) => {
      spaUserexits.value = value.split(',');
    };

    const submit = (item: any) => {
      item.changed = true;
    };

    const updateParameter = () => {
      const changedParameter = parameters.value.filter((i: any) => i.changed);
      if (changedParameter.length === 0) {
        return;
      }

      let changeUrl =
        config.Url() +
        '/adabas/database/' +
        db.dbid() +
        '/parameter?type=' +
        type.value;

      changedParameter.forEach((element: any) => {
        switch (element.Name) {
          case 'LOGGING':
            changeUrl += '&' + element.Name + '=' + JSON.stringify(spaLogging.value);
            break;
          case 'OPTIONS':
            changeUrl += '&' + element.Name + '=' + JSON.stringify(spaOptions.value);
            break;
          case 'USEREXITS':
            changeUrl += '&' + element.Name + '=' + JSON.stringify(spaUserexits.value);
            break;
          default:
            changeUrl += '&' + element.Name + '=' + element.Value;
            break;
        }
      });

      const getConfig = {
        headers: authHeader('application/json'),
        useCredentails: true,
      };

      axios.put(changeUrl, {}, getConfig).catch((error: any) => {
        store.commit('SET_STATUS', JSON.stringify(error));
        if (error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            userService.logout();
            location.reload();
          }
        }
        throw error;
      });
    };

    const toggleAll = (checked: boolean) => {
      spaLogging.value = checked ? loggingParameters.value.slice() : [];
    };

    onMounted(() => {
      queryParameters();
    });

    return {
      type,
      allSelected,
      indeterminate,
      filter,
      filterOn,
      fields,
      options,
      parameters,
      optionOptions,
      spaOptions,
      spaLogging,
      loggingParameters,
      spaUserexits,
      userexitsParameters,
      queryParameters,
      getTypeItem,
      submit,
      updateParameter,
      toggleAll,
    };
  }
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
