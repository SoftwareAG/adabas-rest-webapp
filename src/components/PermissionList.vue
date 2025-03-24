<!--
 * Copyright (c) 2022 Software AG (http://www.softwareag.com/)
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
  <div class="permissionlist p-2">
    <Sidebar :url="url" />
    <b-card
      :header="'Adabas Database Role-based Access for database ' + url"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-container fluid>
          <b-row>
            <b-col>
              This page provides the list of Adabas Role-based Access definition
              to be administrated through this Adabas RESTful server.
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <Url :url="'/adabas/database' + url + '/file'" />
            </b-col>
          </b-row>
          <b-row>
            <b-col sm="2">
              <b-button v-b-modal.modal-create variant="outline-primary"
                >Create resource</b-button
              > 
            </b-col>
            <b-col sm="2">
              <b-button v-b-modal.modal-grant variant="outline-primary"
                >Grant resource</b-button
              > 
            </b-col>
            <b-col sm="2">
              <b-button v-b-modal.modal-assign variant="outline-primary"
                >Assign role</b-button
              >
            </b-col>
            <b-col sm="6" class="text-right">
              <b-button variant="outline-primary">Refresh</b-button>
            </b-col>
          </b-row>
          <b-row>
            <b-col sm="10">
              <b-tabs content-class="mt-3">
                <b-tab title="Permissions" active>
                  <b-container>
                    <b-row>
                      <b-col sm="10">
                        <b-pagination
                          v-model="currentPage"
                          :total-rows="permission.length"
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
                        ></b-form-select>
                      </b-col>
                    </b-row>
                    <b-row>
                      <b-col sm="12">
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
                      </b-col>
                    </b-row>
                    <b-row>
                      <b-col>
                        <b-table
                          id="my-table"
                          striped
                          bordered
                          hover
                          selectable
                          select-mode="single"
                          :per-page="perPage"
                          :current-page="currentPage"
                          small
                          :filter="filter"
                          :filterIncludedFields="filterOn"
                          @row-selected="onRowSelected"
                          :items="permission"
                          :fields="fields"
                        >
                        </b-table>
                      </b-col>
                    </b-row>
                  </b-container>
                </b-tab>
                <b-tab title="User roles">
                  <b-container>
                    <b-row>
                      <b-col sm="10">
                        <b-pagination
                          v-model="currentPage"
                          :total-rows="resources.length"
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
                        ></b-form-select>
                      </b-col>
                    </b-row>
                    <b-row>
                      <b-col sm="12">
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
                      </b-col>
                    </b-row>
                    <b-row>
                      <b-col>
                        <b-table
                          id="my-table"
                          striped
                          bordered
                          hover
                          selectable
                          select-mode="single"
                          :per-page="perPage"
                          :current-page="currentPage"
                          small
                          :filter="filter"
                          :filterIncludedFields="filterOn"
                          @row-selected="onRowSelected"
                          :items="userrole"
                          :fields="userRoleFields"
                        >
                        </b-table>
                      </b-col>
                    </b-row>
                  </b-container>
                </b-tab>
              </b-tabs>
            </b-col>
          </b-row>
        </b-container>
      </b-card-body>
    </b-card>
    <b-modal
      id="modal-create"
      size="lg"
      title="Create Adabas Role-Base resource"
      @ok="createResource"
      no-stacking
    >
      <p>Create Adabas Role-based Access resource</p>
      <b-container>
        <b-row>
          <b-col sm="2">Resource:</b-col>
          <b-col sm="9">
            <b-form-select
              v-model="newResource"
              :options="options"
              v-on:change="reloadResource()"
            ></b-form-select>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="2">Name:</b-col>
          <b-col sm="9">
            <b-form-input v-model="newName" />
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="2">Assign to:</b-col>
          <b-col sm="9">
            <b-form-select
              v-model="newReference"
              :options="resources"
            ></b-form-select>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
    <b-modal
      id="modal-grant"
      size="lg"
      title="Grant Adabas Role-Base Resource"
      @ok="grantResource"
      no-stacking
    >
      <p>Grant Adabas Role-based Access resource</p>
      <b-container>
        <b-row>
          <b-col sm="2">Object:</b-col>
          <b-col sm="4">
            <b-form-select
              v-model="newObject"
              :options="objects"
            ></b-form-select>
          </b-col>
          <b-col sm="5">
            <b-form-input
              type="number"
              v-model="fnr"
              placeholder="Adabas File"
            ></b-form-input>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="2">Operation:</b-col>
          <b-col sm="9">
            <b-form-select
              v-model="newOperation"
              :options="operations"
            ></b-form-select>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="2">Assign to Role:</b-col>
          <b-col sm="9">
            <b-form-select
              v-model="newRole"
              :options="roles"
            ></b-form-select>
          </b-col>
        </b-row>
      </b-container>
          <template #modal-footer="{ ok, cancel, hide }">
        <b>Custom Footer</b>
        <!-- Emulate built in modal footer ok and cancel button actions -->
        <b-button size="sm" variant="success" @click="ok()"> Grant </b-button>
        <b-button size="sm" variant="danger" @click="cancel()">
          Revoke
        </b-button>
        <!-- Button with custom close trigger value -->
        <b-button size="sm" variant="outline-secondary" @click="hide('forget')">
          Forget it
        </b-button>
      </template>
    </b-modal>
    <!-- Modal for Assigning User -->
    <b-modal
      id="modal-assign"
      size="lg"
      title="Assign Adabas Role-Base Resource to User"
      @ok="assignUser"
      no-stacking
    >
      <p>Assign Adabas Role-based Access resource to user</p>
      <b-container>
        <b-row>
          <b-col sm="2">Assign to User:</b-col>
          <b-col sm="9">
            <b-form-select
              v-model="newName"
              :options="users"
            ></b-form-select>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="2">Assign to Role:</b-col>
          <b-col sm="9">
            <b-form-select
              v-model="newRole"
              :options="roles"
            ></b-form-select>
          </b-col>
        </b-row>
      </b-container>
      <template #modal-footer="{ ok, cancel, hide }">
        <b>Custom Footer</b>
        <!-- Emulate built in modal footer ok and cancel button actions -->
        <b-button size="sm" variant="success" @click="ok()"> Grant </b-button>
        <b-button size="sm" variant="danger" @click="cancel()">
          Revoke
        </b-button>
        <!-- Button with custom close trigger value -->
        <b-button size="sm" variant="outline-secondary" @click="hide('forget')">
          Forget it
        </b-button>
      </template>
    </b-modal>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import Sidebar from './Sidebar.vue';
import store from '../store/index';
import StatusBar from './StatusBar.vue';
import Url from './Url.vue';
import { SearchDatabases } from '@/adabas/admin';

@Component({
  components: {
    Sidebar,
    StatusBar,
    Url,
  },
})
export default class PermissionList extends Vue {
  @Prop({ type: String, required: false }) readonly url!: string | undefined;
  
  db: any = null;
  currentFile: number = 0;
  perPage: number = 10;
  perPageOptions: number[] = [10, 20, 50, 100];
  currentPage: number = 1;
  permission: any[] = [];
  userrole: any[] = [];
  resources: any[] = [];
  operations: any[] = [];
  objects: any[] = [];
  roles: any[] = [];
  users: any[] = [];
  fields: string[] = ['Operation', 'Object', 'Role'];
  userRoleFields: string[] = ['User', 'Role'];
  options: string[] = ['User', 'Role', 'Object', 'Operation'];
  filter: string = '';
  filterOn: string[] = ['User', 'Role', 'Object', 'Operation'];
  timer: number = 0;
  newResource: string = '';
  newName: string = '';
  newReference: string = '';
  newRole: string = '';
  newObject: string = '';
  newOperation: string = '';
  fnr: number | null = null;

  created(): void {
    this.db = SearchDatabases(this.url);
    this.timer = setInterval(this.loadPermissions, 15000);
    if (this.db === undefined) {
      store.dispatch('SYNC_ADMIN_DBS');
      return;
      }
      this.loadPermissions();
  }
  async loadPermissions() {
    if (this.db === undefined) {
      this.db = SearchDatabases(this.url);
      if (this.db === undefined) {
        return;
      }
    }
    if (this.resources.length == 0) {
      this.db.resourceList('role').then((response: any) => {
        this.roles = [];
        response.forEach((element: any) => {
          this.roles.push(element.Role);
        });
      });
    }
    if (this.operations.length == 0) {
      this.db.resourceList('operation').then((response: any) => {
        this.operations = ['any'];
        response.forEach((element: any) => {
          this.operations.push(element.Operation);
        });
      });
    }

    if (this.objects.length == 0) {
      const response = await this.db.resourceList('object');
      this.objects = response.map((item: any) => item.Object);
    }
    if (this.objects.length == 0) {
      this.db.resourceList('object').then((response: any) => {
        this.objects = [];
        response.forEach((element: any) => {
          this.objects.push(element.Object);
        });
      });
    }

    await this.db.permissionList().then((response: any) => {
      this.permission = response;
    });
    await this.db.userRoleList().then((response: any) => {
      this.userrole = response;
    });
  }
  createResource(items: any): void {
    this.db.createRBACResource(
      this.newResource, 
      this.newName
    );
    if (this.newResource === 'User') {
      this.db.assignRole(this.newName, this.newReference);
    }
    if (this.newResource === 'Role') {
      this.db.assignRole(this.newReference, this.newName);
    }
  }
  assignUser(): void {
    this.db.assignRole(this.newName, this.newRole);
  }
  grantResource(): void {
    var def = {
      Definition: [
        {
          Assignment: 'grant',
          Object: this.newObject,
          Operation: this.newOperation,
          Role: this.newRole,
        },
      ],
    };
    if (this.fnr) {
      var s = '000000000' + this.fnr;
      s = s.substr(s.length - 8);

        def.Definition[0].Object = 'FILE.' + s.slice(-8);
      }
      this.db.grantRBAC(def);
  }
  reloadResource() {
    let resource = '';
    switch (this.newResource) {
      case 'User':
        resource = 'role';
        break;
      case 'Role':
        resource = 'user';
        break;
    }
    if (resource === '') {
      return;
    }
    this.db.resourceList(resource).then((response: any) => {
      this.resources = [];
      response.forEach((element: any) => {
        if (resource === 'user') {
          this.resources.push(element.User);
        } else {
          this.resources.push(element.Role);
        }
      });
    });
  }
  onRowSelected(items: any): void {}
  levelSpace(nr: number): string {
    let res = '';
    for (let i = 0; i < nr; i++) {
      res += ' ';
    }

    return res + nr;
  }

  beforeUnmount(): void {
    clearInterval(this.timer);
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
