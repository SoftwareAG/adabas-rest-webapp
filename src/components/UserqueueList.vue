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
    <b-card
      :header="'Adabas Database user queue list for database ' + url"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-modal
          id="modal-error-uqDetails"
          size="xl"
          title="Error creating file"
          ok-only
        >
          <b-alert show variant="danger">
            <p class="my-2">{{ errorResponse }}</p>
            <b-table></b-table>
          </b-alert>
        </b-modal>
        <b-modal
          @ok="handleOk"
          id="modal-display-uqDetails"
          size="lg"
          variant="outline-danger"
          title="User Queue Details"
          ok-only
        >
          <b-card
            border-variant="secondary"
            header-border-variant="secondary"
            header="User Queue Entry"
            align="center"
          >
            <b-row
              ><b-col class="text-right">Id:</b-col
              ><b-col class="text-left">{{
                displayUq.UserQueueDetails.DetailEntry.UqId
              }}</b-col></b-row
            >
            <b-row
              ><b-col class="text-right">Command Count:</b-col
              ><b-col class="text-left">{{
                displayUq.UserQueueDetails.CommandCount
              }}</b-col></b-row
            >
            <b-row
              ><b-col class="text-right">Flags:</b-col
              ><b-col class="text-left">{{
                displayUq.UserQueueDetails.DetailEntry.Flags
              }}</b-col></b-row
            >
            <b-row
              ><b-col class="text-right">ET Flags:</b-col
              ><b-col class="text-left">{{
                displayUq.UserQueueDetails.DetailEntry.EtFlags
              }}</b-col></b-row
            >
            <b-row
              ><b-col class="text-right">User encoding:</b-col
              ><b-col class="text-left">{{
                displayUq.UserQueueDetails.UserEncoding
              }}</b-col></b-row
            >
            <b-row
              ><b-col class="text-right">ISN in Hold:</b-col
              ><b-col class="text-left">{{
                displayUq.UserQueueDetails.ISN_Hold
              }}</b-col></b-row
            >
            <b-row
              ><b-col class="text-right">ISN Lists:</b-col
              ><b-col class="text-left">{{
                displayUq.UserQueueDetails.ISN_Lists
              }}</b-col></b-row
            >
            <b-row
              ><b-col class="text-right">TNA Limit:</b-col
              ><b-col class="text-left">{{
                displayUq.UserQueueDetails.TNALimit
              }}</b-col></b-row
            >
            <b-row
              ><b-col class="text-right">TT Limit:</b-col
              ><b-col class="text-left">{{
                displayUq.UserQueueDetails.TTLimit
              }}</b-col></b-row
            >
          </b-card>
          <b-card
            border-variant="secondary"
            header-border-variant="secondary"
            header="User"
            align="center"
          >
            <b-row
              ><b-col class="text-right">User Id:</b-col
              ><b-col class="text-left">{{
                displayUq.UserQueueDetails.DetailEntry.Uid.Id
              }}</b-col></b-row
            >
            <b-row
              ><b-col class="text-right">User Terminal:</b-col
              ><b-col class="text-left">{{
                displayUq.UserQueueDetails.DetailEntry.Uid.Terminal
              }}</b-col></b-row
            >
            <b-row
              ><b-col class="text-right">User Host:</b-col
              ><b-col class="text-left">{{
                displayUq.UserQueueDetails.DetailEntry.Uid.Node
              }}</b-col></b-row
            >
            <b-row
              ><b-col class="text-right">User Timestamp:</b-col
              ><b-col class="text-left">{{
                new Date(
                  displayUq.UserQueueDetails.DetailEntry.Uid.Timestamp
                ).toUTCString()
              }}</b-col></b-row
            >
            <b-row
              ><b-col class="text-right">User:</b-col
              ><b-col class="text-left">{{
                displayUq.UserQueueDetails.DetailEntry.User
              }}</b-col></b-row
            ></b-card
          >
          <b-card
            border-variant="secondary"
            header-border-variant="secondary"
            header="Timestamps"
            align="center"
          >
            <b-row
              ><b-col class="text-right">Last Activity:</b-col
              ><b-col class="text-left">{{
                new Date(displayUq.UserQueueDetails.LastActivity).toUTCString()
              }}</b-col></b-row
            >
            <b-row
              ><b-col class="text-right">Start Session:</b-col
              ><b-col class="text-left">{{
                new Date(displayUq.UserQueueDetails.StartSession).toUTCString()
              }}</b-col></b-row
            >
            <b-row
              ><b-col class="text-right">Start Transaction:</b-col
              ><b-col class="text-left">{{
                new Date(displayUq.UserQueueDetails.StartTransaction).toUTCString()
              }}</b-col></b-row
            >
          </b-card>
          <b-card
            border-variant="secondary"
            header-border-variant="secondary"
            align="center"
            header="User Queue Files"
          >
            <b-row
              ><b-col class="text-right">Used Files:</b-col
              ><b-col class="text-left"
                ><b-table
                  :items="displayUq.UserQueueDetails.files"
                ></b-table></b-col
            ></b-row>
          </b-card>
        </b-modal>
        <b-container fluid>
          <b-row
            ><b-col>
              This page provide the list of Adabas database user queue to be
              administrate through this Adabas RESTful server.
            </b-col>
          </b-row>
          <b-row
            ><b-col>
              <Url url="/adabas/database" />
            </b-col>
          </b-row>
          <b-row
            ><b-col>
              <b-table
                striped
                bordered
                hover
                small
                :items="userqueues"
                :fields="fields"
              >
                <template v-slot:cell(UqId)="row">
                  <b-link v-on:click="display_detail(row.item)">{{
                    row.item.UqId
                  }}</b-link>
                </template>
                <template v-slot:cell(delete)="row">
                  <div class="mx-auto text-center">
                    <b-icon-x-circle
                      scale="2"
                      variant="danger"
                      v-on:click="stop_user(row.item)"
                    ></b-icon-x-circle>
                  </div>
                </template>
              </b-table>
            </b-col> </b-row></b-container></b-card-body
    ></b-card>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Sidebar from "./Sidebar.vue";
import { BIconXCircle } from "bootstrap-vue";
import StatusBar from "./StatusBar.vue";
import Url from "./Url.vue";
import store from "../store/index";

@Component({
  components: {
    Sidebar,
    StatusBar,
    BIconXCircle,
    Url,
  },
})
export default class UserqueueList extends Vue {
  @Prop(String) readonly url: string | undefined;
  data() {
    return {
      fields: [
        "UqId",
        "Uid.Id",
        "Uid.Node",
        "Uid.Terminal",
        "Uid.Timestamp",
        "User",
        "Flags",
        "EtFlags",
        "Delete",
      ],
      userqueues: [],
      displayUq: {
        UserQueueDetails: {
          CommandCount: 0,
          LastActivity: "",
          StartSession: "",
          StartTransaction: "",
          UserEncoding: 0,
          DetailEntry: {
            EtFlags: "        ",
            Flags: "  ",
            Uid: { Id: 0, Node: "", "": "     ", Timestamp: "" },
            UqId: 0,
            User: " ",
          },
        },
        files: [],
      } as any,
      timer: "",
      errorResponse: "",
      db: null,
    };
  }
  created() {
    this.$data.db = store.getters.search(this.url);
    this.$data.timer = setInterval(this.loadUserQueue, 5000);
    this.loadUserQueue();
  }
  loadUserQueue() {
    this.$data.db.userQueue().then((response: any) => {
      this.$data.userqueues = response;
    });
  }
  display_detail(uq: any) {
    this.$data.db.userQueueDetails(uq.UqId).then((response: any) => {
      this.$data.displayUq = response;
    });
    this.$root.$emit("bv::show::modal", "modal-display-uqDetails", "#btnShow");
  }
  stop_user(uq: any): void {
    this.$data.db.stopUser(uq.UqId);
  }
  handleOk(bvModalEvt: any): void {
    console.log("OK clicked");
  }
  beforeDestroy() {
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
