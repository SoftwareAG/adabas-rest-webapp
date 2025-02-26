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
  <div class="userqueuelist p-2">
    <Sidebar :url="url" />
    <div class="card border-secondary mb-3">
      <div class="card-header border-secondary">
        Adabas Database user queue list for database {{ url }}
      </div>
      <div class="card-body">
        <div
          class="modal fade"
          id="modal-error-uqDetails"
          tabindex="-1"
          aria-labelledby="modal-error-uqDetailsLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog modal-xl">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="modal-error-uqDetailsLabel">
                  Error creating file
                </h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                <div class="alert alert-danger" role="alert">
                  <p class="my-2">{{ errorResponse }}</p>
                  <table class="table"></table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="modal fade"
          id="modal-display-uqDetails"
          tabindex="-1"
          aria-labelledby="modal-display-uqDetailsLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="modal-display-uqDetailsLabel">
                  User Queue Details
                </h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                <div class="card border-secondary mb-3">
                  <div class="card-header border-secondary">User Queue Entry</div>
                  <div class="card-body text-center">
                    <div class="row">
                      <div class="col text-end">Id:</div>
                      <div class="col text-start">{{ displayUq.UserQueueDetails.DetailEntry.UqId }}</div>
                    </div>
                    <div class="row">
                      <div class="col text-end">Command Count:</div>
                      <div class="col text-start">{{ displayUq.UserQueueDetails.CommandCount }}</div>
                    </div>
                    <div class="row">
                      <div class="col text-end">Flags:</div>
                      <div class="col text-start">{{ displayUq.UserQueueDetails.DetailEntry.Flags }}</div>
                    </div>
                    <div class="row">
                      <div class="col text-end">ET Flags:</div>
                      <div class="col text-start">{{ displayUq.UserQueueDetails.DetailEntry.EtFlags }}</div>
                    </div>
                    <div class="row">
                      <div class="col text-end">User encoding:</div>
                      <div class="col text-start">{{ displayUq.UserQueueDetails.UserEncoding }}</div>
                    </div>
                    <div class="row">
                      <div class="col text-end">ISN in Hold:</div>
                      <div class="col text-start">{{ displayUq.UserQueueDetails.ISN_Hold }}</div>
                    </div>
                    <div class="row">
                      <div class="col text-end">ISN Lists:</div>
                      <div class="col text-start">{{ displayUq.UserQueueDetails.ISN_Lists }}</div>
                    </div>
                    <div class="row">
                      <div class="col text-end">TNA Limit:</div>
                      <div class="col text-start">{{ displayUq.UserQueueDetails.TNALimit }}</div>
                    </div>
                    <div class="row">
                      <div class="col text-end">TT Limit:</div>
                      <div class="col text-start">{{ displayUq.UserQueueDetails.TTLimit }}</div>
                    </div>
                  </div>
                </div>
                <div class="card border-secondary mb-3">
                  <div class="card-header border-secondary">User</div>
                  <div class="card-body text-center">
                    <div class="row">
                      <div class="col text-end">User Id:</div>
                      <div class="col text-start">{{ displayUq.UserQueueDetails.DetailEntry.Uid.Id }}</div>
                    </div>
                    <div class="row">
                      <div class="col text-end">User Terminal:</div>
                      <div class="col text-start">{{ displayUq.UserQueueDetails.DetailEntry.Uid.Terminal }}</div>
                    </div>
                    <div class="row">
                      <div class="col text-end">User Host:</div>
                      <div class="col text-start">{{ displayUq.UserQueueDetails.DetailEntry.Uid.Node }}</div>
                    </div>
                    <div class="row">
                      <div class="col text-end">User Timestamp:</div>
                      <div class="col text-start">{{ new Date(displayUq.UserQueueDetails.DetailEntry.Uid.Timestamp).toUTCString() }}</div>
                    </div>
                    <div class="row">
                      <div class="col text-end">User:</div>
                      <div class="col text-start">{{ displayUq.UserQueueDetails.DetailEntry.User }}</div>
                    </div>
                  </div>
                </div>
                <div class="card border-secondary mb-3">
                  <div class="card-header border-secondary">Timestamps</div>
                  <div class="card-body text-center">
                    <div class="row">
                      <div class="col text-end">Last Activity:</div>
                      <div class="col text-start">{{ new Date(displayUq.UserQueueDetails.LastActivity).toUTCString() }}</div>
                    </div>
                    <div class="row">
                      <div class="col text-end">Start Session:</div>
                      <div class="col text-start">{{ new Date(displayUq.UserQueueDetails.StartSession).toUTCString() }}</div>
                    </div>
                    <div class="row">
                      <div class="col text-end">Start Transaction:</div>
                      <div class="col text-start">{{ new Date(displayUq.UserQueueDetails.StartTransaction).toUTCString() }}</div>
                    </div>
                  </div>
                </div>
                <div class="card border-secondary mb-3">
                  <div class="card-header border-secondary">User Queue Files</div>
                  <div class="card-body text-center">
                    <div class="row">
                      <div class="col text-end">Used Files:</div>
                      <div class="col text-start">
                        <table class="table" :items="displayUq.UserQueueDetails.files"></table>
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
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the list of Adabas database user queue to be administrate through this Adabas RESTful server.
            </div>
          </div>
          <div class="row">
            <div class="col">
              <Url url="/adabas/database" />
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
                  <tr v-for="userqueue in userqueues" :key="userqueue.UqId">
                    <td>
                      <a href="#" @click="display_detail(userqueue)">{{ userqueue.UqId }}</a>
                    </td>
                    <td>{{ userqueue['Uid.Id'] }}</td>
                    <td>{{ userqueue.Uid.Node }}</td>
                    <td>{{ userqueue.Uid.Terminal }}</td>
                    <td>{{ userqueue['Uid.Timestamp'] }}</td>
                    <td>{{ userqueue.User }}</td>
                    <td>{{ userqueue.Flags }}</td>
                    <td>{{ userqueue.EtFlags }}</td>
                    <td>
                      <div class="text-center">
                        <i class="bi bi-x-circle-fill text-danger" @click="stop_user(userqueue)"></i>
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
        <StatusBar />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import Sidebar from './Sidebar.vue';
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
      required: false,
    },
  },
  setup(props) {
    const fields = ref([
      'UqId',
      { key: 'Uid.Id', label: 'Adabas ID' },
      'Uid.Node',
      'Uid.Terminal',
      { key: 'Uid.Timestamp', label: 'Adabs ID Timestamp' },
      'User',
      'Flags',
      'EtFlags',
      'Delete',
    ]);
    const userqueues = ref([]);
    const displayUq = ref({
      UserQueueDetails: {
        CommandCount: 0,
        LastActivity: '',
        StartSession: '',
        StartTransaction: '',
        UserEncoding: 0,
        DetailEntry: {
          EtFlags: '        ',
          Flags: '  ',
          Uid: { Id: 0, Node: '', Terminal: '     ', Timestamp: '' },
          UqId: 0,
          User: ' ',
        },
      },
      files: [],
    });
    const errorResponse = ref('');
    const db = ref(null);
    const timer = ref('');

    const loadUserQueue = () => {
      db.value.userQueue().then((response: any) => {
        userqueues.value = response;
        userqueues.value.forEach((part: any, index: number, theArray: any) => {
          theArray[index].Uid.Timestamp = new Date(theArray[index].Uid.Timestamp).toUTCString();
        });
      });
    };

    const display_detail = (uq: any) => {
      db.value.userQueueDetails(uq.UqId).then((response: any) => {
        displayUq.value = response;
      });
      this.$root.$emit('bv::show::modal', 'modal-display-uqDetails', '#btnShow');
    };

    const stop_user = (uq: any) => {
      db.value.stopUser(uq.UqId);
    };

    const handleOk = () => {
      console.log('OK clicked');
    };

    onMounted(() => {
      db.value = SearchDatabases(props.url);
      timer.value = setInterval(loadUserQueue, 5000);
      loadUserQueue();
    });

    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return {
      fields,
      userqueues,
      displayUq,
      errorResponse,
      db,
      timer,
      loadUserQueue,
      display_detail,
      stop_user,
      handleOk,
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
