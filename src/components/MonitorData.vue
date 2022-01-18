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
  <div class="monitordata p-2">
    <Sidebar :url="url" />
    <b-card
      :header="'Adabas Database command statistics for database ' + url"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-container fluid>
          <b-row>
            <b-col>
              This page provides the statistics of Adabas database commands per
              second and I/O to be monitored through this Adabas RESTful server.
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <Url :url="'/adabas/database/' + url + '/cmdstats'" />
            </b-col>
          </b-row>
          <b-row>
            <b-col sm="4" class="h-100 p-1">
              <b-pagination
                v-model="tableMetadata.currentPage"
                :total-rows="comstats.length"
                :per-page="tableMetadata.perPage"
                aria-controls="my-table"
              ></b-pagination>

              <b-table
                id="my-table"
                class="h-100"
                striped
                bordered
                hover
                small
                :per-page="tableMetadata.perPage"
                :current-page="tableMetadata.currentPage"
                :items="comstats"
                :sort-by.sync="tableMetadata.sortBy"
                :sort-desc.sync="tableMetadata.sortDesc"
                :fields="tableMetadata.fields"
                sort-icon-left
                responsive="sm"
              >
              </b-table>
            </b-col>
            <b-col sm="8">
              <div class="small Chart w-100">
                <LineChart v-bind="lineChartProps" />
                <img style="width: 300px" v-if="imgData" :src="imgData" />
              </div>
            </b-col> </b-row></b-container></b-card-body
    ></b-card>
    <StatusBar />
  </div>
</template>

<script>
import { Chart } from "chart.js/auto";
import { LineChart, Utils, useLineChart } from "vue-chart-3";
import {
  ref,
  onMounted,
  computed,
  onBeforeUnmount,
  defineComponent,
} from "@vue/composition-api";
import Sidebar from "./Sidebar.vue";
import StatusBar from "./StatusBar.vue";
import Url from "./Url.vue";
import { SearchDatabases } from '@/adabas/admin';

export default defineComponent({
  name: "MonitorData",
  components: {
    LineChart,
    Sidebar,
    StatusBar,
    Url,
  },
  props: ["url"],
  setup(props) {
    const data = ref([]);
    const dataIO = ref([]);
    const assoIO = ref([]);
    const workIO = ref([]);
    const legendTop = ref(true);
    const imgData = ref(null);
    const url = props.url;
    let last = null;
    const comstats = ref([
      {
        Commands: 0,
        "ASSO I/O": 0,
        "DATA I/O": 0,
        "WORK I/O": 0,
        "PLOG I/O": 0,
        "Throw backs": 0,
        "Buffer flush": 0,
      },
    ]);
    let timer = null;
    let index = 1;
    const labels = ref(["Interval"]);
    const tableMetadata = {
      perPage: 20,
      currentPage: 1,
      sortBy: "CommandCount",
      sortDesc: true,
      fields: [
        "Commands",
        "ASSO I/O",
        "DATA I/O",
        "WORK I/O",
        "PLOG I/O",
        "Throw backs",
        "Buffer flush",
      ],
    };
    let db = null;
    const options = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          stacked: true,
          position: "left",
        },
        y2: {
          beginAtZero: true,
          stacked: true,
          position: "right",
        },
      },
      plugins: {
        legend: {
          position: "top",
          display: false,
        },
        title: {
          display: true,
          text: "Adabas calls and I/O",
        },
      },
    }));
    const chartData = computed(() => ({
      labels: labels.value,
      datasets: [
        {
          label: "Adabas calls/sec",
          data: data.value,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.4,
          yAxisID: "y",
        },
        {
          label: "DATA I/O sec",
          data: dataIO.value,
          borderColor: "rgb(255, 204, 204)",
          stack: "stack 0",
          type: "bar",
          yAxisID: "y2",
        },
        {
          label: "ASSO I/O sec",
          data: assoIO.value,
          borderColor: "rgb(255, 204, 204)",
          //backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
          stack: "stack 1",
          type: "bar",
          yAxisID: "y2",
        },
        {
          label: "WORK I/O sec",
          data: workIO.value,
           backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
           // backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
          stack: "stack 3",
          type: "bar",
          yAxisID: "y2",
        },
      ],
    }));

    const { lineChartProps, lineChartRef } = useLineChart({
      chartData,
      options,
    });
    onMounted(() => {
      db = SearchDatabases(props.url);
      if (timer == null) {
        timer = setInterval(loadCommandStat, 1000);
      }
      loadCommandStat();
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
      timer = null;
    });
    function loadCommandStat() {
      if (!db || db == null) {
        db = SearchDatabases(props.url);
        return;
      }
      db.monitor().then((response) => {
        if (!response) {
          return;
        }
        // console.log("MONITOR:" + JSON.stringify(response));
        response = response.Statistics;
        let monitorElement = {};
        if (last != null) {
          // console.log(response.ApioCnt + " " + last.ApioCnt);
          monitorElement.Commands = response.AcmdCnt - last.AcmdCnt;
          monitorElement["ASSO I/O"] = response.AaioCnt - last.AaioCnt;
          monitorElement["DATA I/O"] = response.AdioCnt - last.AdioCnt;
          monitorElement["WORK I/O"] = response.AwioCnt - last.AwioCnt;
          monitorElement["PLOG I/O"] = response.ApioCnt - last.ApioCnt;
          monitorElement["Throw backs"] = response.AthbCnt - last.AthbCnt;
          monitorElement["Buffer flush"] = response.AbflCnt - last.AbflCnt;
        } else {
          monitorElement.Commands = 0;
          monitorElement["ASSO I/O"] = 0;
          monitorElement["DATA I/O"] = 0;
          monitorElement["WORK I/O"] = 0;
          monitorElement["PLOG I/O"] = 0;
          monitorElement["Throw backs"] = 0;
          monitorElement["Buffer flush"] = 0;
        }
        assoIO.value.push(monitorElement["ASSO I/O"]);
        dataIO.value.push(monitorElement["DATA I/O"]);
        workIO.value.push(monitorElement["WORK I/O"]);
        data.value.push(monitorElement.Commands);
        labels.value.push(index);
        index++;
        comstats.value.push(monitorElement);
        if (comstats.value.length > 15) {
          comstats.value.shift();
        }
        if (data.value.length > 50) {
          data.value.shift();
          labels.value.shift();
          assoIO.value.shift();
          dataIO.value.shift();
          workIO.value.shift();
        }
        last = response;
      });
    }

    return {
      tableMetadata,
      comstats,
      lineChartProps,
      lineChartRef,
      imgData,
    };
  },
});
</script>

<style>
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
