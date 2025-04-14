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
  <div class="permissionlist p-2" overflow-y="auto">
    <Sidebar :url="url" />
    <div class="card border-secondary">
      <div class="card-header border-secondary">
        Adabas Database Role-based Access for database {{ url }}
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the list of Adabas Role-based Access definition
              to be administrate through this Adabas RESTful server.
            </div>
          </div>
          <div class="row">
            <div class="col">
              <Url :url="'/adabas/database' + url + '/file'" />
            </div>
          </div>
          <div class="row">
            <div class="col-sm-2">
              <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modal-create">Create resource</button>
            </div>
            <div class="col-sm-2">
              <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modal-grant">Grant resource</button>
            </div>
            <div class="col-sm-2">
              <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#modal-assign">Assign role</button>
            </div>
            <div class="col-sm-6 text-end">
              <button class="btn btn-outline-primary">Refresh</button>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-10">
              <ul class="nav nav-tabs mt-3">
                <li class="nav-item">
                  <a class="nav-link active" data-bs-toggle="tab" href="#permissions">Permissions</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" data-bs-toggle="tab" href="#user-roles">User roles</a>
                </li>
              </ul>
              <div class="tab-content mt-3">
                <div class="tab-pane fade show active" id="permissions">
                  <div class="container">
                    <div class="row">
                      <div class="col-sm-10">
                        <nav aria-label="Page navigation">
                          <ul class="pagination">
                            <!-- Pagination logic here -->
                          </ul>
                        </nav>
                      </div>
                      <div class="col-sm-2">
                        <select class="form-select form-select-sm mt-3" v-model="perPage">
                          <option v-for="option in perPageOptions" :key="option" :value="option">{{ option }}</option>
                        </select>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-sm-12">
                        <div class="mb-0">
                          <label for="filterInput" class="form-label">Filter</label>
                          <div class="input-group input-group-sm">
                            <input type="search" class="form-control" v-model="filter" id="filterInput" placeholder="Type to Search">
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
                            <tr v-for="item in permission" :key="item.id">
                              <td v-for="field in fields" :key="field">{{ item[field] }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="tab-pane fade" id="user-roles">
                  <div class="container">
                    <div class="row">
                      <div class="col-sm-10">
                        <nav aria-label="Page navigation">
                          <ul class="pagination">
                            <!-- Pagination logic here -->
                          </ul>
                        </nav>
                      </div>
                      <div class="col-sm-2">
                        <select class="form-select form-select-sm mt-3" v-model="perPage">
                          <option v-for="option in perPageOptions" :key="option" :value="option">{{ option }}</option>
                        </select>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-sm-12">
                        <div class="mb-0">
                          <label for="filterInput" class="form-label">Filter</label>
                          <div class="input-group input-group-sm">
                            <input type="search" class="form-control" v-model="filter" id="filterInput" placeholder="Type to Search">
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
                              <th v-for="field in userRoleFields" :key="field">{{ field }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="item in userrole" :key="item.id">
                              <td v-for="field in userRoleFields" :key="field">{{ item[field] }}</td>
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
    </div>
    <!-- Modal Create -->
    <div class="modal fade" id="modal-create" tabindex="-1" aria-labelledby="modal-create-label" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modal-create-label">Create Adabas Role-Base resource</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Create Adabas Role-based Access resource</p>
            <div class="container">
              <div class="row">
                <div class="col-sm-2">Resource:</div>
                <div class="col-sm-9">
                  <select class="form-select" v-model="newResource" @change="reloadResource()">
                    <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-sm-2">Name:</div>
                <div class="col-sm-9">
                  <input type="text" class="form-control" v-model="newName">
                </div>
              </div>
              <div class="row">
                <div class="col-sm-2">Assign to:</div>
                <div class="col-sm-9">
                  <select class="form-select" v-model="newReference">
                    <option v-for="resource in resources" :key="resource" :value="resource">{{ resource }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="createResource">Save changes</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Grant -->
    <div class="modal fade" id="modal-grant" tabindex="-1" aria-labelledby="modal-grant-label" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modal-grant-label">Create Adabas Role-Base resource</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Create Adabas Role-based Access resource</p>
            <div class="container">
              <div class="row">
                <div class="col-sm-2">Object:</div>
                <div class="col-sm-4">
                  <select class="form-select" v-model="newObject">
                    <option v-for="object in objects" :key="object" :value="object">{{ object }}</option>
                  </select>
                </div>
                <div class="col-sm-5">
                  <input type="number" class="form-control" v-model="fnr" placeholder="Adabas File">
                </div>
              </div>
              <div class="row">
                <div class="col-sm-2">Operation:</div>
                <div class="col-sm-9">
                  <select class="form-select" v-model="newOperation">
                    <option v-for="operation in operations" :key="operation" :value="operation">{{ operation }}</option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-sm-2">Assign to Role:</div>
                <div class="col-sm-9">
                  <select class="form-select" v-model="newRole">
                    <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="grantResource">Save changes</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Assign -->
    <div class="modal fade" id="modal-assign" tabindex="-1" aria-labelledby="modal-assign-label" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modal-assign-label">Assign Adabas Role-Base resource to user</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Assign Adabas Role-based Access resource</p>
            <div class="container">
              <div class="row">
                <div class="col-sm-2">Assign to User:</div>
                <div class="col-sm-9">
                  <select class="form-select" v-model="newName">
                    <option v-for="user in users" :key="user" :value="user">{{ user }}</option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-sm-2">Assign to Role:</div>
                <div class="col-sm-9">
                  <select class="form-select" v-model="newRole">
                    <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="assignUser">Save changes</button>
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
import Url from './Url.vue';
import { SearchDatabases } from '@/adabas/admin';

export default defineComponent({
  components: {
    Sidebar,
    StatusBar,
    Url,
  },
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const db = ref(null);
    const currentFile = ref(0);
    const perPage = ref(10);
    const perPageOptions = ref([10, 20, 50, 100]);
    const currentPage = ref(1);
    const permission = ref([]);
    const userrole = ref([]);
    const resources = ref([]);
    const operations = ref([]);
    const objects = ref([]);
    const roles = ref([]);
    const users = ref([]);
    const fields = ref(['Operation', 'Object', 'Role']);
    const userRoleFields = ref(['User', 'Role']);
    const options = ref(['User', 'Role', 'Object', 'Operation']);
    const filter = ref('');
    const filterOn = ref(['User', 'Role', 'Object', 'Operation']);
    const timer = ref('');
    const newResource = ref('');
    const newName = ref('');
    const newReference = ref('');
    const newRole = ref('');
    const newObject = ref('');
    const newOperation = ref('');
    const fnr = ref<number | undefined>(undefined);

    const loadPermissions = async () => {
      if (!db.value) {
        db.value = SearchDatabases(props.url);
        if (!db.value) return;
      }
      if (resources.value.length === 0) {
        db.value.resourceList('role').then((response: any) => {
          roles.value = response.map((element: any) => element.Role);
        });
      }
      if (operations.value.length === 0) {
        db.value.resourceList('operation').then((response: any) => {
          operations.value = ['any', ...response.map((element: any) => element.Operation)];
        });
      }
      if (objects.value.length === 0) {
        db.value.resourceList('object').then((response: any) => {
          objects.value = response.map((element: any) => element.Object);
        });
      }
      if (users.value.length === 0) {
        db.value.resourceList('user').then((response: any) => {
          users.value = response.map((element: any) => element.User);
        });
      }
      permission.value = await db.value.permissionList();
      userrole.value = await db.value.userRoleList();
    };

    const createResource = () => {
      db.value.createRBACResource(newResource.value, newName.value);
      if (newResource.value === 'User') {
        db.value.assignRole(newName.value, newReference.value);
      }
      if (newResource.value === 'Role') {
        db.value.assignRole(newReference.value, newName.value);
      }
    };

    const assignUser = () => {
      db.value.assignRole(newName.value, newRole.value);
    };

    const grantResource = () => {
      const def = {
        Definition: [
          {
            Assignment: 'grant',
            Object: newObject.value,
            Operation: newOperation.value,
            Role: newRole.value,
          },
        ],
      };
      if (fnr.value) {
        const s = ('000000000' + fnr.value).slice(-8);
        def.Definition[0].Object = 'FILE.' + s;
      }
      db.value.grantRBAC(def);
    };

    const reloadResource = () => {
      let resource = '';
      switch (newResource.value) {
        case 'User':
          resource = 'role';
          break;
        case 'Role':
          resource = 'user';
          break;
      }
      if (!resource) return;
      db.value.resourceList(resource).then((response: any) => {
        resources.value = response.map((element: any) => (resource === 'user' ? element.User : element.Role));
      });
    };

    onMounted(() => {
      db.value = SearchDatabases(props.url);
      timer.value = setInterval(loadPermissions, 15000);
      if (!db.value) {
        store.dispatch('SYNC_ADMIN_DBS');
        return;
      }
      loadPermissions();
    });

    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return {
      db,
      currentFile,
      perPage,
      perPageOptions,
      currentPage,
      permission,
      userrole,
      resources,
      operations,
      objects,
      roles,
      users,
      fields,
      userRoleFields,
      options,
      filter,
      filterOn,
      timer,
      newResource,
      newName,
      newReference,
      newRole,
      newObject,
      newOperation,
      fnr,
      loadPermissions,
      createResource,
      assignUser,
      grantResource,
      reloadResource,
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
