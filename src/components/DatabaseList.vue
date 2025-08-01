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
  <div class="databaselist p-2" overflow-y="auto">
    <div class="card border-secondary">
      <div class="card-header border-secondary">
        List of local Adabas Databases available for administration
      </div>

      <div class="card-body">
        <div class="container-fluid">

          <!-- Intro -->
          <div class="row mb-2">
            <div class="col">
              This page provides access to the list of Adabas databases to be administered through this Adabas RESTful server.
            </div>
          </div>

          <!-- API Endpoint -->
          <div class="row mb-2">
            <div class="col">
              <Url url="/adabas/database" />
            </div>
          </div>

          <!-- Create Database -->
          <div class="row mb-3">
            <div class="col">
              <CreateDatabase />
            </div>
          </div>

          <!-- Pagination and Per Page -->
          <div class="row mb-3 align-items-center">
            <div class="col-sm-10">
              <nav aria-label="Page navigation">
                <ul class="pagination">
                  <li class="page-item" v-for="page in totalPages" :key="page">
                    <a class="page-link" @click="currentPage = page">{{ page }}</a>
                  </li>
                </ul>
              </nav>
            </div>
            <div class="col-sm-2">
              <select v-model="perPage" class="form-select form-select-sm mt-2">
                <option v-for="option in perPageOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
          </div>

          <!-- Filter Input -->
          <div class="row mb-3 align-items-center">
            <label for="filterInput" class="col-sm-2 col-form-label col-form-label-sm text-end">
              Filter
            </label>
            <div class="col-sm-6">
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

          <!-- Database Table -->
          <div class="row">
            <div class="col">
              <table class="table table-striped table-bordered table-hover table-sm p-3">
                <thead>
                  <tr>
                    <th v-for="field in fields" :key="field.key">{{ field.label }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in databases" :key="row.status.Dbid">
                    <td>{{ row.status.Dbid }}</td>
                    <td>
                      <router-link :to="'/information/' + row.status.Dbid">{{ row.status.Name }}</router-link>
                    </td>
                    <td>{{ row.status.StructureLevel }}</td>
                    <td>{{ row.status.Version }}</td>
                    <td>{{ row.status.Location }}</td>
                    <td>
                      <span v-if="row.online()">Online</span>
                      <span v-else>Offline</span>
                    </td>

                    <!-- Start/Stop Buttons -->
                    <td>
                      <div v-if="row.status.Active">
                        <div class="dropdown">
                          <button class="btn btn-outline-danger btn-sm dropdown-toggle w-100" type="button" data-bs-toggle="dropdown">
                            Stop
                          </button>
                          <ul class="dropdown-menu">
                            <li><a class="dropdown-item" @click="stopDatabase(row, 'shutdown')">Shutdown</a></li>
                            <li><a class="dropdown-item" @click="stopDatabase(row, 'cancel')">Cancel</a></li>
                            <li><a class="dropdown-item" @click="stopDatabase(row, 'abort')">Abort</a></li>
                          </ul>
                        </div>
                      </div>
                      <div v-else>
                        <button class="btn btn-outline-success btn-sm w-100" @click="startDatabase(row)">Start</button>
                      </div>
                    </td>

                    <!-- Show Details -->
                    <td>
                      <router-link :to="'/parameters/' + row.status.Dbid" class="btn btn-outline-primary btn-sm">Parameters</router-link>
                      <router-link :to="'/containers/' + row.status.Dbid" class="btn btn-outline-primary btn-sm">Containers</router-link>
                      <router-link :to="'/nuclog/' + row.status.Dbid" class="btn btn-outline-primary btn-sm">Nucleus Log</router-link>
                      <router-link :to="'/files/' + row.status.Dbid" class="btn btn-outline-primary btn-sm">Files</router-link>
                      <router-link :to="'/permission/' + row.status.Dbid" v-if="row.status.Active" class="btn btn-outline-primary btn-sm">Permissions</router-link>

                      <!-- Statistics Dropdown -->
                      <div v-if="row.status.Active" class="dropdown d-inline-block me-1">
                        <button class="btn btn-outline-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                          Statistics
                        </button>
                        <ul class="dropdown-menu">
                          <li><router-link class="dropdown-item" :to="'/highwater/' + row.status.Dbid">High Water</router-link></li>
                          <li><router-link class="dropdown-item" :to="'/cmdstats/' + row.status.Dbid">Command Stats</router-link></li>
                          <li>
                            <router-link
                              class="dropdown-item"
                              :to="'/monitor/' + row.status.Dbid"
                              :class="{ disabled: !isMonitor(row) }"
                              :tabindex="!isMonitor(row) ? -1 : 0"
                              @click.prevent="!isMonitor(row) && $event.preventDefault()"
                            >
                              Monitor Stats
                            </router-link>
                          </li>
                          <li><router-link class="dropdown-item" :to="'/bufferpool/' + row.status.Dbid">Buffer Pool</router-link></li>
                          <li>
                            <router-link
                              class="dropdown-item"
                              :to="'/bufferflush/' + row.status.Dbid"
                              :class="{ disabled: !isMonitor(row) }"
                              :tabindex="!isMonitor(row) ? -1 : 0"
                              @click.prevent="!isMonitor(row) && $event.preventDefault()"
                            >
                              Buffer Flush
                            </router-link>
                          </li>
                          <li><router-link class="dropdown-item" :to="'/checkpoints/' + row.status.Dbid">Checkpoints</router-link></li>
                          <li><router-link class="dropdown-item" :to="'/activity/' + row.status.Dbid">Activity</router-link></li>
                          <li><router-link class="dropdown-item" :to="'/plogstat/' + row.status.Dbid">PLOG</router-link></li>
                          <li><router-link class="dropdown-item" :to="'/threadtable/' + row.status.Dbid">Thread Table</router-link></li>
                          <li><router-link class="dropdown-item" :to="'/adatcp/' + row.status.Dbid">TCP Connection</router-link></li>
                          <li><router-link class="dropdown-item" :to="'/cluster/' + row.status.Dbid">Cluster</router-link></li>
                        </ul>
                      </div>

                      <!-- Queues Dropdown -->
                      <div v-if="row.status.Active" class="dropdown d-inline-block">
                        <button class="btn btn-outline-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                          Queues
                        </button>
                        <ul class="dropdown-menu">
                          <li><router-link class="dropdown-item" :to="'/userqueue/' + row.status.Dbid">User Queues</router-link></li>
                          <li><router-link class="dropdown-item" :to="'/commandqueue/' + row.status.Dbid">Command Queues</router-link></li>
                          <li><router-link class="dropdown-item" :to="'/holdqueue/' + row.status.Dbid">Hold Queues</router-link></li>
                          <li><router-link class="dropdown-item" :to="'/ucb/' + row.status.Dbid">UCB</router-link></li>
                        </ul>
                      </div>
                    </td>
                    <!-- Delete -->
                    <td>
                      <div class="text-center" v-if="!row.status.Active">
                        <button class="btn btn-outline-danger btn-sm w-100" @click="del_database(row)">Delete</button>
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

    <!-- Footer Status Bar -->
    <StatusBar />
  </div>
</template>


<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import { AdabasAdmin } from '../adabas/admin';
import { userService } from '../user/service';
import CreateDatabase from './CreateDatabase.vue';
// import { BIconXCircle } from 'bootstrap-vue-next/es/icons';
import store from '../store/index';
import StatusBar from '@/components/StatusBar.vue';
import Url from './Url.vue';
import router from '../router/index';

export default defineComponent({
  name: 'DatabaseList',
  components: {
    CreateDatabase,
    // BIconXCircle,
   StatusBar,
    Url,
  },
  setup() {
    const perPage = ref(10);
    const currentPage = ref(1);
    const perPageOptions = ref([10, 20, 50, 100]);
    const filter = ref('');
    const filterOn = ref([]);
    const fields = ref([
      { label: 'Dbid', key: 'status.Dbid' },
      { label: 'Name', key: 'status.Name' },
      { label: 'Strukture Level', key: 'status.StructureLevel' },
      { label: 'Version', key: 'status.Version' },
      { label: 'Location', key: 'status.Location' },
      { label: 'Active', key: 'status.Active' },
      { label: 'Action', key: 'action' },
      { label: 'Show Details', key: 'show_details' },
      { label: 'Delete', key: 'delete' }
    ]);
    const databases = ref([] as AdabasAdmin[]);
    const timer = ref('');
    const jsonString = ref('<No data received>');
    const loadDatabases = async () => {
      try {
        const response = await store.dispatch('SYNC_ADMIN_DBS');

        if (response) {
          databases.value = response;
          jsonString.value = JSON.stringify(response);
          store.commit('SET_STATUS', 'Database list received.');
        } else {
        }
      } catch (error: any) {

        const errorMessage = error.response
          ? JSON.stringify(error.response)
          : JSON.stringify(error);

        store.commit('SET_STATUS', errorMessage);

        // Handle authentication errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          userService.logout();
          location.reload();
        }
      }
    };

    const startDatabase = (dbid: AdabasAdmin) => {
      operation(dbid, 'start');
    };

    const stopDatabase = (dbid: AdabasAdmin, stopType: string) => {
      operation(dbid, stopType);
    };

    const operation = (dbid: AdabasAdmin, operation: string) => {
      router.push('/nuclog/' + dbid.dbid());
      dbid
        .callOperation(operation)
        .then((response: any) => {
          store.commit(
            'SET_STATUS',
            "Calling operation '" + operation + "' initiated..."
          );
          console.log('Route to ' + dbid.dbid());
        })
        .catch((error: any) => {
          console.log("error stop database = " + JSON.stringify(error.response));
          store.commit(
            'SET_STATUS',
            'Error calling' + operation + ':' + JSON.stringify(error)
          );
        });
    };

    const del_database = async (dbid: AdabasAdmin) => {
      const confirmed = window.confirm(
        `Please confirm that you want to delete the Adabas database ${dbid.dbid()} (${dbid.name()}).`
      );

      if (!confirmed) return;

      try {
        const response = await dbid.delete();
        console.log('Delete response:', response);
        store.commit('SET_STATUS', 'Database delete initiated...');
      } catch (error: any) {
        console.error('Delete error:', error);

        const errorMsg = error?.response
          ? JSON.stringify(error.response)
          : JSON.stringify(error);

        store.commit('SET_STATUS', errorMsg);
        throw error;
      }
    };



    const onRowSelected = (items: any) => {
      if (items.length == 0) {
        return;
      }
      this.$router.push({ path: '/information/' + items[0].status.Dbid });
      return;
    };

    const isMonitor = (item: any) => {
      if (item.status.StructureLevel > 21) {
        return true;
      }
      return false;
    };

    onMounted(() => {
      loadDatabases();
      timer.value = setInterval(loadDatabases, 5000);
    });

    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return {
      perPage,
      currentPage,
      perPageOptions,
      filter,
      filterOn,
      fields,
      databases,
      jsonString,
      startDatabase,
      stopDatabase,
      del_database,
      onRowSelected,
      isMonitor,
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
</style>
