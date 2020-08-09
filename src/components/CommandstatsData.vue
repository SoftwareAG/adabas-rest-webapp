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
  <div class="commandstatsdata p-2">
    <Sidebar :url="url" />
    <div class="card">
      <div class="card-header h5">
        Adabas Database command statistics for database {{ url }}
      </div>
      <div class="card-body">
         <b-container fluid>
          <b-row>
            <b-col class="font-weight-bold text-center h1">
              Adabas command statistics
            </b-col>
          </b-row>
          <b-row>
            <b-col>
            This page provide the list of Adabas database command statistics to be
          administrate through this Adabas RESTful server.
            </b-col>
          </b-row>
          <b-row>
            <b-col>
        <Url :url="'/adabas/database/'+url+'/cmdstats'" />
            </b-col>
          </b-row>
        <b-row>
          <b-col sm="4" class="h-100 p-1">
            <b-pagination
              v-model="currentPage"
              :total-rows="comstats.length"
              :per-page="perPage"
              aria-controls="my-table"
            ></b-pagination>

            <b-table
              id="my-table"
              class="h-100"
              striped
              bordered
              hover
              small
              :per-page="perPage"
              :current-page="currentPage"
              :items="comstats"
              :sort-by.sync="sortBy"
              :sort-desc.sync="sortDesc"
              :fields="fields"
              sort-icon-left
              responsive="sm"
            >
            </b-table>
          </b-col>
          <b-col sm="4">
            <div class="small Chart w-100">
              <commit-chart :chart-data="datacollection"></commit-chart>
            </div>
          </b-col>
          <b-col sm="4">
            <div class="small Chart w-100">
              <bar-chart :chart-data="datacollection"></bar-chart>
            </div>
          </b-col>
        </b-row></b-container>
      </div>
    </div>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Sidebar from "./Sidebar.vue";
import store from "../store/index";
import BarChart from "./BarChart";
import CommitChart from "./DoughnutChart";
import StatusBar from "./StatusBar.vue";
import Url from "./Url.vue";

@Component({
  components: {
    Sidebar,
    StatusBar,
    BarChart,
    CommitChart,
    Url,
  },
})
export default class CommandStatsData extends Vue {
  @Prop(String) readonly url: string | undefined;
  data() {
    return {
      perPage: 12,
      currentPage: 1,
      sortBy: "CommandCount",
      sortDesc: true,
      fields: ["CommandName", "CommandCount"],
      comstats: [],
      datacollection: null,
    };
  }
  mounted() {
    const db = store.getters.search(this.url);
    db.commandStats().then((response: any) => {
      this.$data.comstats = response;
      let labels = [] as string[];
      let data = [] as number[];
      let datacollection = {
        labels: ["A1", "E1", "L1", "S1", "ET", "CL"],
        datasets: [
          {
            label: "Adabas commands",
            backgroundColor: [
              "rgb(200,126,64)",
              "rgb(200,226,202)",
              "rgb(200,210,172)",
              "rgb(200,189,139)",
              "rgb(200,162,103)",
              "rgb(150,126,64)",
              "rgb(150,126,64)",
              "rgb(150,226,202)",
              "rgb(150,210,172)",
              "rgb(150,189,139)",
              "rgb(130,162,103)",
              "rgb(130,126,64)",
              "rgb(130,126,64)",
              "rgb(130,226,202)",
              "rgb(130,210,172)",
              "rgb(130,189,139)",
              "rgb(130,162,103)",
              "rgb(226,126,64)",
              "rgb(226,126,64)",
              "rgb(232,226,202)",
              "rgb(226,210,172)",
              "rgb(223,189,139)",
              "rgb(223,162,103)",
              "rgb(226,126,64)",
              "rgb(226,126,64)",
              "rgb(232,226,202)",
              "rgb(226,210,172)",
              "rgb(223,189,139)",
              "rgb(223,162,103)",
              "rgb(226,126,64)",
            ],
            borderWidth: 0,
            hoverBorderWidth: 0,
            data: [10, 10, 40, 10, 0],
          },
        ],
      };
      response.forEach((element: any) => {
        if (element.CommandCount > 0) {
          labels.push(element.CommandName);
          data.push(element.CommandCount);
        }
      });
      datacollection.labels = labels;
      datacollection.datasets[0].data = data;
      this.$data.datacollection = datacollection;
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
.small {
  margin: 0 auto;
}
.Chart {
  width: 100%;
  padding: 20px;
  box-shadow: 0px 0px 20px 2px rgba(0, 0, 0, 0.4);
  border-radius: 20px;
  margin: 50px 0;
}
</style>
