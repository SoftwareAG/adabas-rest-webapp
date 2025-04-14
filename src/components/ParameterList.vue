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
  <div class="parameterlist p-2" overflow-y="auto">
    <Sidebar :url="url" />
    <div class="card border-secondary mb-3">
      <div class="card-header border-secondary">
        Parameters for Adabas Database {{ url }}
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the parameters of Adabas database to be
              administrate through this Adabas RESTful server.
            </div>
          </div>
          <div class="row">
            <div class="col"> <Url url="/adabas/database" /> </div>
          </div>
          <div class="row">
            <div class="col">
              <select
                v-model="type"
                @change="getTypeItem"
                class="form-select form-select-sm"
              >
                <option v-for="option in options" :key="option.value" :value="option.value">
                  {{ option.text }}
                </option>
              </select>
            </div>
            <div class="col">
              <div class="mb-0 row">
                <label for="filterInput" class="col-sm-3 col-form-label col-form-label-sm text-sm-end">
                  Filter
                </label>
                <div class="col-sm-9">
                  <div class="input-group input-group-sm">
                    <input
                      v-model="filter"
                      type="search"
                      id="filterInput"
                      class="form-control"
                      placeholder="Type to Search"
                    />
                    <button class="btn btn-outline-secondary" :disabled="!filter" @click="filter = ''">
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="col">
              <button
                class="btn btn-outline-primary btn-sm ms-2"
                @click="updateParameter()"
              >
                Update parameter
              </button>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <table class="table table-striped table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th v-for="field in fields" :key="field.key">
                      {{ field.label || field.key }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in parameters" :key="row.Name">
                    <td v-for="field in fields" :key="field.key">
                      <template v-if="field.key === 'edit'">
                        <div v-if="['ADATCP', 'BI', 'PLOG'].includes(row.Name)">
                          <div class="form-check form-switch">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              v-model="row.Value"
                              @change="submit(row)"
                            />
                          </div>
                        </div>
                        <div v-else-if="row.Name === 'AR'">
                          <select
                            class="form-select form-select-sm"
                            v-model="row.Value"
                            @change="submit(row)"
                          >
                            <option value="ABORT">ABORT</option>
                            <option value="CONTINUE">CONTINUE</option>
                          </select>
                        </div>
                        <div v-else-if="row.Name === 'LOGGING'">
                          <div class="form-check">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              v-model="allSelected"
                              :indeterminate="indeterminate"
                              @change="toggleAll"
                            />
                            <label class="form-check-label">
                              {{ allSelected ? 'Un-select All' : 'Select All' }}
                            </label>
                          </div>
                          <div class="form-check" v-for="log in loggingParameters" :key="log">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              v-model="spaLogging"
                              :value="log"
                              @change="submit(row)"
                            />
                            <label class="form-check-label">{{ log }}</label>
                          </div>
                        </div>
                        <div v-else-if="row.Name === 'USEREXITS'">
                          <div class="form-check" v-for="exit in userexitsParameters" :key="exit.value">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              v-model="spaUserexits"
                              :value="exit.value"
                              @change="submit(row)"
                            />
                            <label class="form-check-label">{{ exit.text }}</label>
                          </div>
                        </div>
                        <div v-else-if="row.Name === 'OPTIONS'">
                          <select
                            class="form-select form-select-sm"
                            multiple
                            v-model="spaOptions"
                            @change="submit(row)"
                          >
                            <option v-for="option in optionOptions" :key="option.value" :value="option.value">
                              {{ option.text }}
                            </option>
                          </select>
                        </div>
                        <div v-else>
                          <input
                            class="form-control form-control-sm"
                            type="text"
                            v-model="row.Value"
                            @change="submit(row)"
                          />
                        </div>
                      </template>
                      <template v-else-if="field.key === 'changed'">
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            disabled
                            v-model="row.changed"
                          />
                        </div>
                      </template>
                      <template v-else>
                        {{ row[field.key] }}
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
        <StatusBar />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { authHeader } from '../user/auth-header';
import { config } from '../store/config';
import { userService } from '../user/service';
import Sidebar from './Sidebar.vue';
import store from '../store/index';
import StatusBar from '@/components/StatusBar.vue';
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
      required: true,
    },
  },
  setup(props) {
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
    const parameters = ref([]);
    const optionOptionsOffline = ref([
      { text: 'Auto Expand', value: 'AUTO_EXPAND' },
      { text: 'Utilities only', value: 'UTILITIES_ONLY' },
      { text: 'Local utilities', value: 'LOCAL_UTILITIES' },
      { text: 'Open required', value: 'OPEN_REQUIRED' },
      { text: 'Fault teolerant AR', value: 'FAULT_TOLERANT_AR' },
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
    const optionOptions = ref([]);
    const spaOptions = ref([]);
    const spaLogging = ref([]);
    const loggingParameters = ref(['CB', 'FB', 'RB', 'SB', 'VB', 'IB', 'BD', 'AR']);
    const spaUserexits = ref([]);
    const userexitsParameters = ref([
      { text: 'Userexit 1', value: 1 },
      { text: 'Userexit 2', value: 2 },
      { text: 'Userexit 4', value: 4 },
      { text: 'Userexit 11', value: 11 },
      { text: 'Userexit 14', value: 14 },
    ]);
    const db = ref(null);
    const type = ref('static');

    const queryParameters = () => {
      if (!db.value) {
        db.value = store
          .dispatch('INIT_DATABASES')
          .then((dbs) => {
            return SearchDatabases(props.url);
          })
          .catch((err) => {
            console.log('ERR: ' + JSON.stringify(err));
            return undefined;
          });
      }
      if (!db.value) {
        return;
      }
      const doStaticType = type.value === 'static';
      db.value.parameters(doStaticType).then((response: any) => {
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
        optionOptions.value = doStaticType ? optionOptionsOffline.value : optionOptionsOnline.value;
        getParameterInfo();
      });
    };

    const getParameterInfo = () => {
      db.value.parameterInfo().then((response: any) => {
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
          const v = response.filter((f: any) => f.Acronym === name);
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
        (this.$refs.paraTable as any).refresh();
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
      (this.$refs.paraTable as any).refresh();
    };

    const updateParameter = () => {
      const changedParameter = parameters.value.filter((i: any) => i.changed);
      if (changedParameter.length === 0) {
        return;
      }
      let changeUrl =
        config.Url() +
        '/adabas/database/' +
        db.value.dbid() +
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
      return axios.put(changeUrl, {}, getConfig).catch((error: any) => {
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
      console.log('Create ...' + props.url);
      db.value = SearchDatabases(props.url);
      queryParameters();
    });

    return {
      allSelected,
      indeterminate,
      filter,
      filterOn,
      fields,
      options,
      parameters,
      optionOptionsOffline,
      optionOptionsOnline,
      optionOptions,
      spaOptions,
      spaLogging,
      loggingParameters,
      spaUserexits,
      userexitsParameters,
      db,
      type,
      queryParameters,
      getParameterInfo,
      getTypeItem,
      parseOptions,
      parseLogging,
      parseUserexits,
      submit,
      updateParameter,
      toggleAll,
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
