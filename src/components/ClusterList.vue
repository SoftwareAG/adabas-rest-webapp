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
    <b-card
      header="Adabas cluster"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-container fluid>
          <b-row>
            <b-col>
              This page provides access to the list of nodes in an Adabas database cluster to
              be administrated through this Adabas RESTful server.
            </b-col>
          </b-row>
          <b-row>
            <b-col><Url url="/adabas/cluster" /> </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">State ID</b-col>
            <b-col>UUID: {{ cluster.View.StateID.StateID }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right"></b-col>
            <b-col>Sequence No: {{ cluster.View.StateID.SeqNo }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Last Committed</b-col>
            <b-col>UUID: {{ cluster.View.LastCommitted.StateID }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right"></b-col>
            <b-col>Sequence No: {{ cluster.View.LastCommitted.SeqNo }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Number of Members</b-col>
            <b-col>{{ cluster.View.NumberOfMembers }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Status</b-col>
            <b-col>{{ cluster.View.Status }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Local send</b-col>
            <b-col>{{ cluster.View.LocalSendQueue }} / {{ cluster.View.LocalSendQueueMax }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Local receive</b-col>
            <b-col>{{ cluster.View.LocalRecvQueue }} / {{ cluster.View.LocalRecvQueueMax }}</b-col>
          </b-row>
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
                :items="cluster.Members"
                :fields="fields"
              ></b-table>
            </b-col>
          </b-row>
        </b-container>
      </b-card-body>
    </b-card>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import { AdabasAdmin } from "../adabas/admin";
import { userService } from "../user/service";
import { BIconXCircle } from "bootstrap-vue";
import store from "../store/index";
import StatusBar from "./StatusBar.vue";
import Url from "./Url.vue";
import router from "../router/index";

@Component({
  components: {
    BIconXCircle,
    StatusBar,
    Url,
  },
})
export default class ClusterList extends Vue {
  @Prop() private msg!: string;

  // Data properties with types
  perPage: number = 10;
  currentPage: number = 1;
  filter: string = "";
  filterOn: string[] = [];
  fields: Array<{ label: string; key: string }> = [
    { label: "Name", key: "BaseName" },
    { label: "Status", key: "Status" },
    { label: "Remote Access", key: "BaseIncoming" },
    { label: "ID", key: "BaseId" },
  ];
  cluster: {
    View: {
      StateID: { StateID: string; SeqNo: number };
      LastCommitted: { StateID: string; SeqNo: number };
      NumberOfMembers: number;
      Status: string;
      LocalSendQueue: number;
      LocalSendQueueMax: number;
      LocalRecvQueue: number;
      LocalRecvQueueMax: number;
    };
    Members: Array<any>;
  } = {
    View: {
      StateID: { StateID: "", SeqNo: 0 },
      LastCommitted: { StateID: "", SeqNo: 0 },
      NumberOfMembers: 0,
      Status: "No cluster",
      LocalSendQueue: 0,
      LocalSendQueueMax: 0,
      LocalRecvQueue: 0,
      LocalRecvQueueMax: 0,
    },
    Members: [],
  };
  timer: any = null;
  jsonString: string = "<No data received>";

  created() {
    this.loadCluster();
    this.timer = setInterval(this.loadCluster, 5000);
  }

  // Submit the request to get the list of Adabas databases
  loadCluster(): void {
    store
      .dispatch("SYNC_ADMIN_CLUSTER")
      .then((response: any) => {
        this.cluster = response;
        this.jsonString = JSON.stringify(response);
        store.commit("SET_STATUS", "Database list received...");
      })
      .catch((error: any) => {
        if (error.response) {
          store.commit("SET_STATUS", JSON.stringify(error.response));
          if (error.response.status === 401 || error.response.status === 403) {
            userService.logout();
            location.reload();
          }
        } else {
          store.commit("SET_STATUS", JSON.stringify(error));
          userService.logout();
          location.reload();
        }
      });
  }

  onRowSelected(items: any): void {
    if (items.length > 0) {
      this.$router.push({ path: `/information/${items[0].status.Dbid}` });
    }
  }

  beforeDestroy(): void {
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
</style>
