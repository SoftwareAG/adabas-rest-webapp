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
  <div class="commandqueuelist p-2">
    <Sidebar :url="url" />
    <div class="card">
      <div class="card-header h5">
        Adabas Database command queue for database {{ url }}
      </div>
      <div class="card-body">
        <b-container fluid>
          <b-row>
            <b-col class="font-weight-bold text-center h1">
              Adabas command queue
            </b-col>
          </b-row>
          <b-row
            ><b-col>
              This page provide the list of Adabas database command queue to be
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
                :items="commandqueues"
                :fields="fields"
              >
              </b-table>
            </b-col> </b-row
        ></b-container>
      </div>
    </div>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Sidebar from "./Sidebar.vue";
import StatusBar from "./StatusBar.vue";
import store from "../store/index";
import Url from "./Url.vue";

@Component({
  components: {
    Sidebar,
    StatusBar,
    Url,
  },
})
export default class CommandqueueList extends Vue {
  @Prop(String) readonly url: string | undefined;
  data() {
    return {
      fields: [
        "APU",
        "CommId",
        "CommandUser",
        "EtFlags",
        "File",
        "Flags",
        "User.Id",
        "User.Node",
        "User.Terminal",
        "User.Timestamp",
      ],
      commandqueues: [],
    };
  }
  created() {
    const db = store.getters.search(this.url);
    db.commandQueue().then((response: any) => {
      this.$data.commandqueues = response;
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
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
