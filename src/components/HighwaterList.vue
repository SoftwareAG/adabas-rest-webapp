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
  <div class="highwaterlist p-2">
    <Sidebar :url="url" />
    <div class="card">
      <div class="card-header h5">
        Adabas Database High Watermark for database {{ url }}
      </div>
      <div class="card-body">
        <b-container fluid>
          <b-row>
            <b-col class="font-weight-bold text-center h1">
              Adabas Highwater Mark
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              This page provide the list of Adabas database High Watermark.
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <Url url="/adabas/database" />
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <b-table
                striped
                bordered
                hover
                small
                :items="highwater"
                :fields="fields"
              >
                <template v-slot:cell(statistics)="row">
                  <b-progress
                    show-value=false
                    :value="row.item.Percent"
                    max="100"
                    :precision="2"
                    class="mb-3"
                  ></b-progress>
                </template>
              </b-table>
            </b-col>
          </b-row>
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
      db: null,
      fields: [
        "Area",
        "Size",
        "High",
        "InUse",
        "Time",
        "Percent",
        "statistics",
      ],
      highwater: [] as any[],
      timer: "",
    };
  }
  created() {
    this.$data.db = store.getters.search(this.url);
    this.$data.timer = setInterval(this.queryParameters, 5000);
    this.queryParameters();
  }
  queryParameters() {
    this.$data.db.highWaterMark().then((response: any) => {
      this.$data.highwater = response;
    });
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
