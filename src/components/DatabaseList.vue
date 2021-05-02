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
  <div class="databaselist p-2">
    <b-card
      header="List of local Adabas Databases available for administration"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-container fluid>
          <b-row>
            <b-col>
              This page provide access to the list of Adabas database to be
              administrate through this Adabas RESTful server.
            </b-col>
          </b-row>
          <b-row>
            <b-col><Url url="/adabas/database" /> </b-col>
          </b-row>
          <b-row>
            <b-col> <CreateDatabase /> </b-col>
          </b-row>
          <b-row
            ><b-col sm="4">
              <b-pagination
                v-model="currentPage"
                :total-rows="databases.length"
                :per-page="perPage"
                aria-controls="my-table"
              ></b-pagination>
            </b-col>
            <b-col sm="8">
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
          >
          <b-row>
            <b-col>
              <b-table
                id="my-table"
                class="w-100 p-3"
                striped
                bordered
                hover
                :per-page="perPage"
                :current-page="currentPage"
                small
                :filter="filter"
                :filterIncludedFields="filterOn"
                selectable
                responsive="true"
                select-mode="single"
                no-select-on-click
                @row-selected="onRowSelected"
                :items="databases"
                :fields="fields"
              >
                <template v-slot:[`cell(status.Name)`]="row">
                  <router-link :to="'/information/' + row.item.status.Dbid">{{
                    row.item.status.Name
                  }}</router-link>
                </template>
                <template v-slot:[`cell(status.Active)`]="row">
                  <div v-if="row.item.online()">
                    Online
                  </div>
                  <div v-else>
                    Offline
                  </div>
                </template>
                <template v-slot:cell(action)="row">
                  <div v-if="row.item.status.Active">
                    <b-dropdown
                      size="sm"
                      variant="outline-danger"
                      class="mr-2 w-100"
                      text="Stop"
                    >
                      <b-dropdown-item
                        size="sm"
                        variant="danger"
                        v-on:click="stopDatabase(row.item, 'shutdown')"
                        class="mr-2"
                      >
                        Shutdown
                      </b-dropdown-item>
                      <b-dropdown-item
                        size="sm"
                        variant="danger"
                        v-on:click="stopDatabase(row.item, 'cancel')"
                        class="mr-2"
                      >
                        Cancel
                      </b-dropdown-item>
                      <b-dropdown-item
                        size="sm"
                        variant="danger"
                        v-on:click="stopDatabase(row.item, 'abort')"
                        class="mr-2"
                      >
                        Abort
                      </b-dropdown-item>
                    </b-dropdown>
                  </div>
                  <div v-else>
                    <b-button
                      size="sm"
                      variant="outline-success"
                      v-on:click="startDatabase(row.item)"
                      class="mr-2 w-100"
                      >Start</b-button
                    >
                  </div>
                </template>
                <template v-slot:cell(show_details)="row">
                  <b-button
                    size="sm"
                    variant="outline-primary"
                    :to="'/parameters/' + row.item.status.Dbid"
                    class="mr-2"
                  >
                    Parameters
                  </b-button>
                  <b-button
                    size="sm"
                    :to="'/containers/' + row.item.status.Dbid"
                    class="mr-2"
                    variant="outline-primary"
                  >
                    Containers
                  </b-button>
                  <b-button
                    size="sm"
                    variant="outline-primary"
                    :to="'/nuclog/' + row.item.status.Dbid"
                    class="mr-2"
                  >
                    Nucleus Log
                  </b-button>
                  <b-button
                    size="sm"
                    variant="outline-primary"
                    :to="'/files/' + row.item.status.Dbid"
                    class="mr-2"
                  >
                    Files
                  </b-button>
                  <div v-if="row.item.status.Active">
                    <b-dropdown
                      size="sm"
                      variant="outline-primary"
                      class="mr-2"
                      right
                      text="Statistics"
                    >
                      <b-dropdown-item
                        size="sm"
                        :to="'/highwater/' + row.item.status.Dbid"
                        class="mr-2"
                      >
                        High Water
                      </b-dropdown-item>
                      <b-dropdown-item
                        size="sm"
                        :to="'/cmdstats/' + row.item.status.Dbid"
                        class="mr-2"
                      >
                        Command statistics
                      </b-dropdown-item>
                      <b-dropdown-item
                        size="sm"
                        :to="'/bufferpool/' + row.item.status.Dbid"
                        class="mr-2"
                      >
                        Buffer Pool
                      </b-dropdown-item>
                      <b-dropdown-item
                        size="sm"
                        :to="'/checkpoints/' + row.item.status.Dbid"
                        class="mr-2"
                      >
                        Checkpoints
                      </b-dropdown-item>
                      <b-dropdown-item
                        size="sm"
                        :to="'/activity/' + row.item.status.Dbid"
                        class="mr-2"
                      >
                        Activity
                      </b-dropdown-item>
                      <b-dropdown-item
                        size="sm"
                        :to="'/threadtable/' + row.item.status.Dbid"
                        class="mr-2"
                      >
                        Thread Table
                      </b-dropdown-item>
                      <b-dropdown-item
                        size="sm"
                        :to="'/adatcp/' + row.item.status.Dbid"
                        class="mr-2"
                      >
                        TCP connection
                      </b-dropdown-item>
                      <b-dropdown-item
                        size="sm"
                        :to="'/cluster/' + row.item.status.Dbid"
                        class="mr-2"
                      >
                        Cluster
                      </b-dropdown-item>
                    </b-dropdown>
                    <b-dropdown
                      size="sm"
                      variant="outline-primary"
                      class="mr-2"
                      right
                      text="Queues"
                    >
                      <b-dropdown-item
                        size="sm"
                        :to="'/userqueue/' + row.item.status.Dbid"
                        class="mr-2"
                      >
                        User queues
                      </b-dropdown-item>
                      <b-dropdown-item
                        size="sm"
                        :to="'/commandqueue/' + row.item.status.Dbid"
                        class="mr-2"
                      >
                        Command queues
                      </b-dropdown-item>
                      <b-dropdown-item
                        size="sm"
                        :to="'/holdqueue/' + row.item.status.Dbid"
                        class="mr-2"
                      >
                        Hold queues
                      </b-dropdown-item>
                      <b-dropdown-item
                        size="sm"
                        :to="'/ucb/' + row.item.status.Dbid"
                        class="mr-2"
                      >
                        UCB
                      </b-dropdown-item>
                    </b-dropdown>
                  </div>
                </template>
                <template v-slot:cell(delete)="row">
                  <div
                    class="mx-auto text-center"
                    v-if="!row.item.status.Active"
                  >
                    <b-icon-x-circle
                      scale="2"
                      variant="danger"
                      v-on:click="del_database(row.item)"
                    ></b-icon-x-circle>
                  </div>
                </template> </b-table></b-col
          ></b-row>
        </b-container>
      </b-card-body>
    </b-card>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { AdabasAdmin } from '../adabas/admin';
import { userService } from '../user/service';
import CreateDatabase from './CreateDatabase.vue';
import { BIconXCircle } from 'bootstrap-vue';
import store from '../store/index';
import StatusBar from './StatusBar.vue';
import Url from './Url.vue';
import router from '../router/index';

@Component({
  components: {
    CreateDatabase,
    BIconXCircle,
    StatusBar,
    Url,
  },
})
export default class DatabaseList extends Vue {
  @Prop() private msg!: string;
  data() {
    return {
      perPage: 10,
      currentPage: 1,
      filter: '',
      filterOn: [],
      fields: [
        { label: 'Dbid', key: 'status.Dbid' },
        { label: 'Name', key: 'status.Name' },
        { label: 'Strukture Level', key: 'status.StructureLevel' },
        { label: 'Version', key: 'status.Version' },
        { label: 'Active', key: 'status.Active' },
        'action',
        'show_details',
        'Delete',
      ],
      databases: [] as AdabasAdmin[],
      timer: '',
      jsonString: '<No data received>',
    };
  }
  created() {
    this.loadDatabases();
    this.$data.timer = setInterval(this.loadDatabases, 5000);
  }
  /*
   * submit the request to get the list of Adabas databases.
   * The list contains database which are able to be administrated.
   */
  loadDatabases(): void {
    store
      .dispatch('SYNC_ADMIN_DBS')
      .then((response: any) => {
        this.$data.databases = response;
        this.$data.jsonString = JSON.stringify(response);
        store.commit('SET_STATUS', 'Database list received...');
      })
      .catch((error: any) => {
        console.log('ERROR DBLIST: ' + JSON.stringify(error));
        if (error.response) {
          store.commit('SET_STATUS', JSON.stringify(error.response));
          if (error.response.status == 401 || error.response.status == 403) {
            userService.logout();
            location.reload(true);
          }
        } else {
          store.commit('SET_STATUS', JSON.stringify(error));
          userService.logout();
          location.reload(true);
        }
        throw error;
      });
  }
  /*
   * Start the selected database
   */
  startDatabase(dbid: AdabasAdmin): void {
    this.operation(dbid, 'start');
  }
  /*
   * Stop the selected database by giving the corresponding
   * stop operation. Possible values are 'shutdown','cancel'
   * and 'abort'.
   */
  stopDatabase(dbid: AdabasAdmin, stopType: string): void {
    this.operation(dbid, stopType);
  }
  /*
   * General entry point to call operations to the database.
   */

  operation(dbid: AdabasAdmin, operation: string): void {
    dbid
      .callOperation(operation)
      .then((response: any) => {
        store.commit(
          'SET_STATUS',
          "Calling operation '" + operation + "' initiated...",
        );
        console.log('Route to ' + dbid.dbid());
        router.push('/nuclog/' + dbid.dbid());
      })
      .catch((error: any) => {
        store.commit(
          'SET_STATUS',
          'Error calling' + operation + ':' + JSON.stringify(error),
        );
      });
  }
  /*
   * Delete the selected Adabas database
   */
  del_database(dbid: AdabasAdmin): void {
    console.log('Delete database : ' + dbid);
    this.$bvModal
      .msgBoxConfirm(
        'Please confirm that you want to delete the Adabas database ' +
          dbid.dbid() +
          '(' +
          dbid.name() +
          ')' +
          '.',
        {
          title: 'Please Confirm',
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'YES',
          cancelTitle: 'NO',
          footerClass: 'p-2',
          hideHeaderClose: false,
          centered: true,
        },
      )
      .then((value) => {
        if (value) {
          dbid
            .delete()
            .then((response: any) => {
              console.log('Delete response: ' + JSON.stringify(response));
              store.commit('SET_STATUS', 'Database delete initiated...');
            })
            .catch((error: any) => {
              console.log('Error: ' + JSON.stringify(error));
              if (error.response) {
                store.commit('SET_STATUS', JSON.stringify(error.response));
              } else {
                store.commit('SET_STATUS', JSON.stringify(error));
              }
              throw error;
            });
        }
      });
  }
  onRowSelected(items: any): void {
    if (items.length == 0) {
      return;
    }
    this.$router.push({ path: '/information/' + items[0].status.Dbid });
    return;
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
</style>
