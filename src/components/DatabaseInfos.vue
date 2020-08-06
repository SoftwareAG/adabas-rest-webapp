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
  <div class="databaseinfos p-2">
    <div class="card">
      <div class="card-header h5">Adabas Database information</div>
      <div class="card-body">
        <p>
          This page provide the list of Adabas database information to be
          administrate through this Adabas RESTful server.
        </p>
      </div>
    </div>
    <Sidebar :url="url" />
    <div class="card">
      <div class="card-header h5">
        Adabas Database information for database {{ url }}
      </div>
      <div class="card-body">
        <Url url="/adabas/database" />
        <b-button variant="outline-primary" v-on:click="infoRenameDatabase()"
          >Rename database</b-button
        >
        <b-modal
          id="modal-rename"
          size="lg"
          title="Rename Adabas database"
          @ok="renameDatabase"
          no-stacking
        >
          <p>Rename Adabas database {{ infos["Name"] }}</p>
          <b-form-input v-model="newName"></b-form-input>
        </b-modal>
        <b-table
          class="w-100 p-3"
          
          striped
          bordered
          hover
          small
          :items="infos"
          :fields="fields"
        ></b-table>
      </div>
    </div>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from "vue-property-decorator";
import { authHeader } from "../user/auth-header";
import { config } from "../store/config";
import { userService } from "../user/service";
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
export default class ParameterList extends Vue {
  @Prop(String) readonly url: string | undefined;
  @Provide() type = "static";
  data() {
    return {
      db: null,
      newName: "",
      infos: [],
      fields: ["Name", "Value"],
      information: {
        ACRABNLength: 4,
        ASSO1BlockSize: 8192,
        AlphaEncoding: 4,
        Architecture: "ASCII7,BYTESWAPPED,IEEE",
        CheckpointFile: 1,
        CurrentPLOGNumber: 1,
        Date: "2020-05-18T21:07:10.000+02:00",
        Dbid: 23,
        ETDataFile: 3,
        ExtentRABNASSOArray: [11, 0, 0, 0],
        ExtentRABNDATAArray: [15, 0, 0, 0, 0, 0, 0, 0],
        ExtentRABNDSSTArray: [13, 0, 0, 0],
        Flags: "NEW_DATABASE,RECOVER_DONE",
        MaxFileNumber: 320,
        MaxFileNumberLoaded: 48,
        Name: "GENERAL_DATABASE",
        SecurityFile: 2,
        StructureLevel: "Adabas v6.7 (21)",
        TimeStampLog: "2020-05-18T21:07:25.000+02:00",
        TimeStampReplication: "1970-01-01T01:00:00.000+01:00",
        WORKExtents: [
          {
            BlockSize: 4096,
            DeviceType: "Filesystem",
            Id: "W",
            Number: 1,
            RABNfirst: 1,
            RABNlast: 5120,
            RABNunused: 1,
          },
        ],
        WORKPart1Size: 5110,
        WideEncoding: 4091,
      },
    };
  }
  created() {
    this.$data.db = store.getters.search(this.url);
    this.queryInformation();
  }
  queryInformation() {
    this.$data.db.information().then((response: any) => {
      this.$data.infos = [];
      [
        "Dbid",
        "Name",
        "StructureLevel",
        "Architecture",
        "Date",
        "Flags",
        "Last changed",
        "PLOG count",
        "CurrentPLOGNumber",
        "Files loaded",
        "TimeStampLog",
        "MaxFileNumber",
        "SecurityFile",
        "CheckpointFile",
        "ETDataFile",
      ].forEach((element: string) => {
        this.$data.infos.push({ Name: element, Value: response.Gcb[element] });
      });
      this.$data.information = response;
    });
  }
  getTypeItem(newtype: any) {
    console.log("Get type item " + newtype);
    this.queryInformation();
  }
  infoRenameDatabase() {
    this.$root.$emit("bv::show::modal", "modal-rename", "#btnShow");
  }
  renameDatabase() {
    if (this.$data.newName !== "") {
      this.$data.db.renameDatabase(this.$data.newName).then(()=> {
            this.queryInformation();
      });
    }
    this.$data.newName = "";
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
