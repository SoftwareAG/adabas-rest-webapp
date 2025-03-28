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
  <div class="clusterlist p-2">
    <Sidebar :url="url" />
    <div class="card border-secondary">
      <div class="card-header border-secondary">
        Adabas cluster
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides access to the list of nodes in an Adabas database cluster to
              be administrate through this Adabas RESTful server.
            </div>
          </div>
          <div class="row">
            <div class="col"><Url url="/adabas/cluster" /> </div>
          </div>
          <div class="row">
            <div class="col text-end">State ID</div>
            <div class="col">UUID: {{ cluster.View.StateID.StateID }}</div>
          </div>
          <div class="row">
            <div class="col text-end"></div>
            <div class="col">Sequence No: {{ cluster.View.StateID.SeqNo }}</div>
          </div>
          <div class="row">
            <div class="col text-end">Last Committed</div>
            <div class="col">UUID: {{ cluster.View.LastCommitted.StateID }}</div>
          </div>
          <div class="row">
            <div class="col text-end"></div>
            <div class="col">Sequence No: {{ cluster.View.LastCommitted.SeqNo }}</div>
          </div>
          <div class="row">
            <div class="col text-end">Number of Members</div>
            <div class="col">{{ cluster.View.NumberOfMembers }}</div>
          </div>
          <div class="row">
            <div class="col text-end">Status</div>
            <div class="col">{{ cluster.View.Status }}</div>
          </div>
          <div class="row">
            <div class="col text-end">Local send</div>
            <div class="col">{{ cluster.View.LocalSendQueue }} / {{ cluster.View.LocalSendQueueMax }}</div>
          </div>
          <div class="row">
            <div class="col text-end">Local receive</div>
            <div class="col">{{ cluster.View.LocalRecvQueue }} / {{ cluster.View.LocalRecvQueueMax }}</div>
          </div>
          <div class="row">
            <div class="col">
              <table class="table table-striped table-bordered table-hover w-100 p-3">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Remote Access</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="member in cluster.Members" :key="member.BaseId" @click="onRowSelected(member)">
                    <td>{{ member.BaseName }}</td>
                    <td>{{ member.Status }}</td>
                    <td>{{ member.BaseIncoming }}</td>
                    <td>{{ member.BaseId }}</td>
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
import { AdabasAdmin } from "../adabas/admin";
import { ref, onMounted, onBeforeUnmount, defineComponent } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import StatusBar from '@/components/StatusBar.vue';
import Url from "./Url.vue";
import { userService } from "../user/service";

export default defineComponent({
  name: "ClusterList",
  components: {
   StatusBar,
    Url,
  },
  props: {
    msg: String,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const perPage = ref(10);
    const currentPage = ref(1);
    const filter = ref("");
    const filterOn = ref([]);
    const fields = ref([
      { label: "Name", key: "BaseName" },
      { label: "Status", key: "Status" },
      { label: "Remote Access", key: "BaseIncoming" },
      { label: "ID", key: "BaseId" },
    ]);
    const cluster = ref({
      members: [],
      View: { StateID: "", Status: "No cluster", NumberOfMembers: 0, LastCommitted: 0 },
    });
    const timer = ref(null);
    const jsonString = ref("<No data received>");

    const loadCluster = () => {
      store
        .dispatch("SYNC_ADMIN_CLUSTER")
        .then((response: any) => {
          cluster.value = response;
          jsonString.value = JSON.stringify(response);
          store.commit("SET_STATUS", "Database list received...");
        })
        .catch((error: any) => {
          if (error.response) {
            store.commit("SET_STATUS", JSON.stringify(error.response));
            if (error.response.status == 401 || error.response.status == 403) {
              userService.logout();
              location.reload();
            }
          } else {
            store.commit("SET_STATUS", JSON.stringify(error));
            userService.logout();
            location.reload();
          }
        });
    };

    const onRowSelected = (items: any) => {
      if (items.length == 0) {
        return;
      }
      router.push({ path: "/information/" + items[0].status.Dbid });
    };

    onMounted(() => {
      loadCluster();
      timer.value = setInterval(loadCluster, 5000);
    });

    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return {
      perPage,
      currentPage,
      filter,
      filterOn,
      fields,
      cluster,
      jsonString,
      onRowSelected,
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
