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
              to be administrate through this Adabas RESTful server.
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
              > </b-col
            ><b-col sm="2">
              <b-button v-b-modal.modal-grant variant="outline-primary"
                >Grant resource</b-button
              > </b-col
            ><b-col sm="2">
              <b-button v-b-modal.modal-assign variant="outline-primary"
                >Assign role</b-button
              >
            </b-col>
            <b-col sm="6" class="text-right">
              <b-button variant="outline-primary">Refresh</b-button>
            </b-col>
          </b-row>
          <b-row
            ><b-col sm="10">
              <b-tabs content-class="mt-3">
                <b-tab title="Permissions" active>
                  <b-container
                    ><b-row
                      ><b-col sm="10">
                        <b-pagination
                          v-model="currentPage"
                          :total-rows="permission.length"
                          :per-page="perPage"
                          aria-controls="my-table"
                        ></b-pagination> </b-col
                      ><b-col sm="2">
                        <b-form-select
                          v-model="perPage"
                          :options="perPageOptions"
                          size="sm"
                          class="mt-3"
                        ></b-form-select> </b-col></b-row
                    ><b-row>
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
                      </b-col></b-row
                    ><b-row
                      ><b-col>
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
                        </b-table></b-col></b-row
                  ></b-container>
                </b-tab>
                <b-tab title="User roles" active>
                  <b-container>
                    <b-row
                      ><b-col sm="10">
                        <b-pagination
                          v-model="currentPage"
                          :total-rows="resources.length"
                          :per-page="perPage"
                          aria-controls="my-table"
                        ></b-pagination> </b-col
                      ><b-col sm="2">
                        <b-form-select
                          v-model="perPage"
                          :options="perPageOptions"
                          size="sm"
                          class="mt-3"
                        ></b-form-select> </b-col></b-row
                    ><b-row>
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
                      </b-col></b-row
                    ><b-row
                      ><b-col>
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
                        </b-table></b-col></b-row
                  ></b-container> </b-tab></b-tabs></b-col
          ></b-row> </b-container></b-card-body
    ></b-card>
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
            ></b-form-select> </b-col
        ></b-row>
        <b-row>
          <b-col sm="2">Name:</b-col>
          <b-col sm="9"> <b-form-input v-model="newName" /> </b-col
        ></b-row>
        <b-row>
          <b-col sm="2">Assign to:</b-col>
          <b-col sm="9">
            <b-form-select
              v-model="newReference"
              :options="resources"
            ></b-form-select> </b-col
        ></b-row>
      </b-container>
    </b-modal>
    <b-modal
      id="modal-grant"
      size="lg"
      title="Create Adabas Role-Base resource"
      @ok="grantResource"
      no-stacking
    >
      <p>Create Adabas Role-based Access resource</p>
      <b-container>
        <b-row>
          <b-col sm="2">Object:</b-col>
          <b-col sm="4">
            <b-form-select
              v-model="newObject"
              :options="objects"
            ></b-form-select> </b-col
          ><b-col sm="5">
            <b-form-input
              type="number"
              v-model="fnr"
              placeholder="Adabas File"
            ></b-form-input></b-col
        ></b-row>
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
            ></b-form-select> </b-col
        ></b-row>
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
       <b-modal
      id="modal-assign"
      size="lg"
      title="Assignn Adabas Role-Base resource to user"
      @ok="assignUser"
      no-stacking
    >
      <p>Assign Adabas Role-based Access resource</p>
      <b-container>
        <b-row>
          <b-col sm="2">Assign to User:</b-col>
          <b-col sm="9">
            <b-form-select
              v-model="newName"
              :options="users"
            ></b-form-select> </b-col
        ></b-row>
        <b-row>
          <b-col sm="2">Assign to Role:</b-col>
          <b-col sm="9">
            <b-form-select
              v-model="newRole"
              :options="roles"
            ></b-form-select> </b-col
        ></b-row>
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
import { Component, Prop, Vue } from 'vue-property-decorator';
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
  @Prop(String) readonly url: string | undefined;
  data() {
    return {
      db: null,
      currentFile: 0,
      perPage: 10,
      perPageOptions: [10, 20, 50, 100],
      currentPage: 1,
      permission: [],
      userrole: [],
      resources: [],
      operations: [],
      objects: [],
      roles: [],
      users: [],
      fields: ['Operation', 'Object', 'Role'],
      userRoleFields: ['User', 'Role'],
      options: ['User', 'Role', 'Object', 'Operation'],
      filter: '',
      filterOn: ['User', 'Role', 'Object', 'Operation'],
      timer: '',
      newResource: '',
      newName: '',
      newReference: '',
      newRole: '',
      newObject: '',
      newOperation: '',
      fnr: undefined as number | undefined,
    };
  }
  created(): void {
    this.$data.db = SearchDatabases(this.url);
    this.$data.timer = setInterval(this.loadPermissions, 15000);
    if (this.$data.db === undefined) {
      store.dispatch('SYNC_ADMIN_DBS');
      return;
    }
    this.loadPermissions();
  }
  async loadPermissions() {
    if (this.$data.db === undefined) {
      this.$data.db = SearchDatabases(this.url);
      if (this.$data.db === undefined) {
        return;
      }
    }
    if (this.$data.resources.length == 0) {
      this.$data.db.resourceList('role').then((response: any) => {
        this.$data.roles = [];
        response.forEach((element: any) => {
          this.$data.roles.push(element.Role);
        });
      });
    }
    if (this.$data.operations.length == 0) {
      this.$data.db.resourceList('operation').then((response: any) => {
        this.$data.operations = ['any'];
        response.forEach((element: any) => {
          this.$data.operations.push(element.Operation);
        });
      });
    }
    if (this.$data.objects.length == 0) {
      this.$data.db.resourceList('object').then((response: any) => {
        this.$data.objects = [];
        response.forEach((element: any) => {
          this.$data.objects.push(element.Object);
        });
      });
    }
    if (this.$data.users.length == 0) {
      this.$data.db.resourceList('user').then((response: any) => {
        this.$data.users = [];
        response.forEach((element: any) => {
        console.log("USER: "+JSON.stringify(element)+'->'+element.User);
          this.$data.users.push(element.User);
        });
      });
    }

    await this.$data.db.permissionList().then((response: any) => {
      this.$data.permission = response;
    });
    await this.$data.db.userRoleList().then((response: any) => {
      this.$data.userrole = response;
    });
  }
  createResource(items: any): void {
    this.$data.db.createRBACResource(
      this.$data.newResource,
      this.$data.newName
    );
    if (this.$data.newResource === 'User') {
      this.$data.db.assignRole(this.$data.newName, this.$data.newReference);
    }
    if (this.$data.newResource === 'Role') {
      this.$data.db.assignRole(this.$data.newReference, this.$data.newName);
    }
  }
  assignUser(): void {
    this.$data.db.assignRole(this.$data.newName, this.$data.newRole);
  }
  grantResource(): void {
    var def = {
      Definition: [
        {
          Assignment: 'grant',
          Object: this.$data.newObject,
          Operation: this.$data.newOperation,
          Role: this.$data.newRole,
        },
      ],
    };
    if (this.$data.fnr) {
      var s = '000000000' + this.$data.fnr;
      s = s.substr(s.length - 8);

      def.Definition[0].Object = 'FILE.' + s;
    }
    this.$data.db.grantRBAC(def);
  }
  reloadResource() {
    var resource = '';
    switch (this.$data.newResource) {
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
    this.$data.db.resourceList(resource).then((response: any) => {
      this.$data.resources = [];
      response.forEach((element: any) => {
        if (resource === 'user') {
          this.$data.resources.push(element.User);
        } else {
          this.$data.resources.push(element.Role);
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
a {
  color: #42b983;
}
</style>
