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
  <div class="parameterlist p-2">
    <Sidebar :url="url" />
    <div class="card">
      <div class="card-header h5">
        Adabas Database parameters for database {{ url }}
      </div>
      <div class="card-body">
        <b-container fluid>
          <b-row>
            <b-col class="font-weight-bold text-center h1">
              Adabas Parameters
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              This page provide the list of Adabas database parameters to be
              administrate through this Adabas RESTful server.
            </b-col>
          </b-row>
          <b-row>
            <b-col> <Url url="/adabas/database" /> </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-form-select
                v-model="type"
                v-on:change="getTypeItem"
                :options="options"
                size="sm"
              />
            </b-col>
            <b-col>
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
            <b-col>
              <b-button
                size="sm"
                variant="outline-primary"
                class="ml-2"
                @click="updateParameter()"
                >Update parameter</b-button
              >
            </b-col> </b-row
          ><b-row>
            <b-col>
              <b-table
                ref="paraTable"
                striped
                bordered
                hover
                small
                :filter="filter"
                :filterIncludedFields="filterOn"
                :items="parameters"
                :fields="fields"
              >
                <template v-slot:cell(edit)="row">
                  <div
                    v-if="
                      row.item.Name === 'ADATCP' ||
                        row.item.Name === 'BI' ||
                        row.item.Name === 'PLOG'
                    "
                  >
                    <b-form-checkbox
                      switch
                      v-model="row.item.Value"
                      v-on:change="submit(row.item)"
                      value="YES"
                    />
                  </div>
                  <div v-else-if="row.item.Name === 'AR'">
                    <b-form-select
                      v-on:change="submit(row.item)"
                      v-model="row.item.Value"
                      :options="['ABORT', 'CONTINUE']"
                    />
                  </div>
                  <div v-else-if="row.item.Name === 'LOGGING'">
                    <b-form-group>
                      <template v-slot:label>
                        <b-form-checkbox
                          v-model="allSelected"
                          :indeterminate="indeterminate"
                          aria-describedby="flavours"
                          aria-controls="flavours"
                          @change="toggleAll"
                        >
                          {{ allSelected ? "Un-select All" : "Select All" }}
                        </b-form-checkbox>
                      </template>

                      <b-form-checkbox-group
                        id="logging"
                        v-model="spaLogging"
                        :options="loggingParameters"
                        name="logging"
                        class="ml-4"
                        aria-label="Individual flavours"
                        @change="submit(row.item)"
                        stacked
                      ></b-form-checkbox-group>
                    </b-form-group>
                  </div>
                  <div v-else-if="row.item.Name === 'USEREXITS'">
                    <b-form-checkbox-group
                      id="userexits"
                      v-model="spaUserexits"
                      :options="userexitsParameters"
                      name="userexits"
                      class="ml-4"
                      aria-label="Individual flavours"
                      stacked
                      @change="submit(row.item)"
                    ></b-form-checkbox-group>
                  </div>
                  <div v-else-if="row.item.Name === 'OPTIONS'">
                    <b-form-select
                      multiple
                      v-on:change="submit(row.item)"
                      v-model="spaOptions"
                      :options="optionOptions"
                    />
                  </div>
                  <div v-else>
                    <b-form-input
                      v-on:change="submit(row.item)"
                      v-model="row.item.Value"
                    />
                  </div>
                </template>
                <template v-slot:cell(changed)="row">
                  <b-form-checkbox disabled v-model="row.item.changed" />
                </template>
              </b-table> </b-col
          ></b-row>
        </b-container>
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
import store from "../store/index";
import StatusBar from "./StatusBar.vue";
import Url from "./Url.vue";
import axios from "axios";

@Component({
  components: {
    StatusBar,
    Sidebar,
    Url,
  },
})
export default class ParameterList extends Vue {
  @Prop(String) readonly url: string | undefined;
  @Provide() type = "static";
  data() {
    return {
      allSelected: false,
      indeterminate: false,
      filter: "",
      filterOn: ["Name", "Description"],
      fields: [
        { key: "Name", sortable: true },
        { key: "Description", sortable: true },
        "MinValue",
        "MaxValue",
        { key: "OrgValue", label: "Original value" },
        { key: "edit", label: "Edited" },
        "changed",
      ],
      options: [
        { value: "static", text: "Static parameters" },
        { value: "dynamic", text: "Dynamic parameters" },
      ],
      parameters: [] as any[],
      optionOptionsOffline: [
        { text: "Auto Expand", value: "AUTO_EXPAND" },
        { text: "Utilities only", value: "UTILITIES_ONLY" },
        { text: "Local utilities", value: "LOCAL_UTILITIES" },
        { text: "Open required", value: "OPEN_REQUIRED" },
        { text: "Fault teolerant AR", value: "FAULT_TOLERANT_AR" },
        { text: "Autorestart only", value: "AUTORESTART_ONLY" },
        { text: "Read-only", value: "READONLY" },
        { text: "XA", value: "XA" },
        { text: "Truncation", value: "TRUNCATION" },
        { text: "Deactivate dynamic options", value: "DEACTIVATE" },
        { text: "NO PLOG replication", value: "NOPLOG_REPLICATION" },
      ],
      optionOptionsOnline: [
        { text: "Utilities only", value: "UTILITIES_ONLY" },
        { text: "Local utilities", value: "LOCAL_UTILITIES" },
      ],
      optionOptions: [],
      spaOptions: [],
      spaLogging: [],
      loggingParameters: ["CB", "FB", "RB", "SB", "VB", "IB", "BD", "AR"],
      spaUserexits: [],
      userexitsParameters: [
        { text: "Userexit 1", value: 1 },
        { text: "Userexit 2", value: 2 },
        { text: "Userexit 4", value: 4 },
        { text: "Userexit 11", value: 11 },
        { text: "Userexit 14", value: 14 },
      ],
      db: null,
    };
  }
  created() {
    console.log("Create ..." + this.url);
    this.$data.db = store.getters.search(this.url);
    this.queryParameters();
  }
  queryParameters(): void {
    if (!this.$data.db) {
      this.$data.db = store
        .dispatch("INIT_DATABASES")
        .then((dbs) => {
          return store.getters.search(this.url);
        })
        .catch((err) => {
          console.log("ERR: " + JSON.stringify(err));
          return undefined;
        });
    }
    if (!this.$data.db) {
      return;
    }
    let doStaticType = this.type == "static";
    this.$data.db.parameters(doStaticType).then((response: any) => {
      this.$data.parameters = response;
      this.$data.parameters.forEach((element: any) => {
        element.OrgValue = element.Value;
      });
      let p = this.$data.parameters.filter((i: any) => i.Name === "OPTIONS");
      this.parseOptions(p[0].Value);
      p = this.$data.parameters.filter((i: any) => i.Name === "LOGGING");
      this.parseLogging(p[0].Value);
      p = this.$data.parameters.filter((i: any) => i.Name === "USEREXITS");
      this.parseUserexits(p[0].Value);
      if (doStaticType) {
        this.$data.optionOptions = this.$data.optionOptionsOffline;
      } else {
        this.$data.optionOptions = this.$data.optionOptionsOffline;
      }
      this.getParameterInfo();
    });
  }
  getParameterInfo() {
    this.$data.db.parameterInfo().then((response: any) => {
      this.$data.parameters.forEach((element: any) => {
        let v = response.filter((f: any) => f.Acronym === element.Name);
        if (v.length > 0) {
          element.Description = v[0].Description;
          element.OnlineValue = v[0].OnlineValue;
          element.InifileValue = v[0].InifileValue;
          if (v[0].IsMaxValueAvailable) {
            element.IsMaxValueAvailable = true;
            element.MinValue = v[0].MinValue;
            element.MaxValue = v[0].MaxValue;
          }
        } else {
          element.Description = "<not available>";
        }
      });
      (this.$refs.paraTable as any).refresh();
    });
  }
  getTypeItem(newtype: any) {
    this.type = newtype;
    this.queryParameters();
  }
  parseOptions(value: string) {
    let s = value.split(",");
    this.$data.spaOptions = s;
  }
  parseLogging(value: string) {
    let s = value.split(",");
    this.$data.spaLogging = s;
  }
  parseUserexits(value: string) {
    let s = value.split(",");
    this.$data.spaUserexits = s;
  }
  submit(item: any) {
    item.changed = true;
    (this.$refs.paraTable as any).refresh();
  }
  updateParameter() {
    let changedParameter = this.$data.parameters.filter((i: any) => i.changed);
    if (changedParameter.length == 0) {
      return;
    }
    let changeUrl =
      config.Url() +
      "/adabas/database/" +
      this.$data.db.dbid() +
      "/parameter?type=" +
      this.type;
    changedParameter.forEach((element: any) => {
      switch (element.Name) {
        case "LOGGING":
          changeUrl =
            changeUrl +
            "&" +
            element.Name +
            "=" +
            JSON.stringify(this.$data.spaLogging);
          break;
        case "OPTIONS":
          changeUrl =
            changeUrl +
            "&" +
            element.Name +
            "=" +
            JSON.stringify(this.$data.spaOptions);
          break;
        case "USEREXITS":
          changeUrl =
            changeUrl +
            "&" +
            element.Name +
            "=" +
            JSON.stringify(this.$data.spaUserexits);
          break;
        default:
          changeUrl = changeUrl + "&" + element.Name + "=" + element.Value;
          break;
      }
    });
    const getConfig = {
      headers: authHeader("application/json"),
      useCredentails: true,
    };
    return axios.put(changeUrl, {}, getConfig).catch((error: any) => {
      store.commit("SET_STATUS", JSON.stringify(error));
      if (error.response) {
        if (error.response.status == 401 || error.response.status == 403) {
          userService.logout();
          location.reload(true);
        }
      }
      throw error;
    });
  }
  toggleAll(checked: boolean) {
    this.$data.spaLogging = checked ? this.$data.loggingParameters.slice() : [];
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
