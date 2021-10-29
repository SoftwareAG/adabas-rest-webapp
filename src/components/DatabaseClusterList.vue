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
  <div class="databaseclusterlist p-2">
    <Sidebar :url="url" />
    <b-card
      header="Adabas database cluster"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-container fluid>
          <b-row>
            <b-col>
              This page provides access to the list of nodes in an Adabas database cluster to
              be administrate through this Adabas RESTful server.
            </b-col>
          </b-row>
          <b-row>
            <b-col><Url url="/adabas/cluster" /> </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">State ID</b-col
            ><b-col>UUID: {{ cluster.View.StateID.StateID }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right"></b-col
            ><b-col>Sequence No: {{ cluster.View.StateID.SeqNo }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Last Committed</b-col
            ><b-col>UUID: {{ cluster.View.LastCommitted.StateID }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right"></b-col
            ><b-col>Sequence No: {{ cluster.View.LastCommitted.SeqNo }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Number of Members</b-col
            ><b-col>{{ cluster.View.NumberOfMembers }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Status</b-col
            ><b-col>{{ cluster.View.Status }}</b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">Local send</b-col
            ><b-col
              >{{ cluster.View.LocalSendQueue }} /
              {{ cluster.View.LocalSendQueueMax }}</b-col
            >
          </b-row>
          <b-row>
            <b-col class="text-right">Local receive</b-col
            ><b-col
              >{{ cluster.View.LocalRecvQueue }} /
              {{ cluster.View.LocalRecvQueueMax }}</b-col
            >
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
                :items="cluster.Members"
                :fields="fields"
              ></b-table></b-col
          ></b-row>
        </b-container>
      </b-card-body>
    </b-card>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
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
export default class DatabaseClusterList extends Vue {
  @Prop(String) readonly url: string | undefined;
  @Prop() private msg!: string;
  data() {
    return {
      perPage: 10,
      currentPage: 1,
      filter: "",
      filterOn: [],
      fields: [
        { label: "Name", key: "BaseName" },
        { label: "Status", key: "Status" },
        { label: "Remote Access", key: "BaseIncoming" },
        { label: "ID", key: "BaseId" },
      ],
      cluster: {
        members: [],
        View: { StateID: "", Status: "No cluster", NumberOfMembers: 0, 
        LastCommitted: 0 },
      },
      timer: "",
      jsonString: "<No data received>",
    };
  }
  created() {
    this.loadCluster();
    this.$data.timer = setInterval(this.loadCluster, 5000);
  }
  /*
   * submit the request to get the list of Adabas databases.
   * The list contains database which are able to be administrated.
   */
  loadCluster(): void {
    this.$data.db.cluster().then((response: any) => {
        this.$data.cluster = response;
        this.$data.jsonString = JSON.stringify(response);
     })      .catch((error: any) => {
        // console.log('ERROR DBLIST: ' + JSON.stringify(error));
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
        // throw error;
      });
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
