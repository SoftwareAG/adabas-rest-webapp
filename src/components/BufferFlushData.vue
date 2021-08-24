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
  <div class="bufferflushdisplay p-2">
    <Sidebar :url="url" />
    <b-card
      :header="'Adabas Database Buffer Flush for database ' + url"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-container fluid>
          <b-row
            ><b-col>
              This page provides the statistics of Adabas database Buffer Flush.
            </b-col>
          </b-row>
          <b-row
            ><b-col>
              <Url url="/adabas/database" />
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right"> Total number of flushed </b-col>
            <b-col>
              {{ countFlushes() }}
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right"> Explicit </b-col>
            <b-col>
              {{ checkUndefinedIndex(bufferflush.BfFlushCounter, 1) }}
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right"> Write Limit </b-col>
            <b-col>
              {{ checkUndefinedIndex(bufferflush.BfFlushCounter, 0) }}
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right"> WORK Limit </b-col>
            <b-col>
              {{ checkUndefinedIndex(bufferflush.BfFlushCounter, 2) }}
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right"> Space </b-col>
            <b-col>
              {{ checkUndefinedIndex(bufferflush.BfFlushCounter, 3) }}
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right"> Emergency </b-col>
            <b-col>
              {{ checkUndefinedIndex(bufferflush.BfFlushCounter, 4) }}
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right"> Ignored blocks </b-col>
            <b-col>
              {{ checkUndefinedIndex(bufferflush.BfFlushCounter, 5) }}
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">
              <b-table :items="bufferflush.LStat" :fields="tableMetadata.fields">
                <template v-slot:cell(WriteLimit)="row">
                  {{ row.item.WriteLimit / 10 }}
                </template>
                <template v-slot:cell(FlushPagesSum)="row">
                  {{ formatBytes(row.item.FlushPagesSum) }}
                </template>
                <template v-slot:cell(StartTime)="row">
                  {{ new Date(row.item.StartTime).toUTCString() }}
                </template>
                <template v-slot:cell(AverageIO)="row">
                  {{ avgioMsec(row.item) }}
                </template>
                <template v-slot:cell(Duration)="row">
                  {{ checkUndefined(row.item.BfDiffEndBf) }}
                </template>
                <template v-slot:cell(Rejected)="row">
                  {{ checkUndefined(row.item.BfListEntryLockReject) }}
                </template>
              </b-table>
            </b-col>
            <b-col class="text-right">
              <div class="small Chart w-100">
                <LineChart v-bind="lineChartProps" />
                <img style="width: 300px" v-if="imgData" :src="imgData" />
              </div>
            </b-col>
          </b-row>
        </b-container>
      </b-card-body>
    </b-card>
    <StatusBar />
  </div>
</template>

<script>
import { Chart } from "chart.js/auto";
import { LineChart, useLineChart } from "vue-chart-3";
import {
  ref,
  onMounted,
  computed,
  onBeforeUnmount,
  defineComponent,
} from "@vue/composition-api";
import { Component, Prop, Vue } from "vue-property-decorator";
import Sidebar from "./Sidebar.vue";
import store from "../store/index";
import StatusBar from "./StatusBar.vue";
import Url from "./Url.vue";
import { SearchDatabases } from '@/adabas/admin';

export default defineComponent({
  name: "BufferFlushData",
  components: {
    LineChart,
    Sidebar,
    StatusBar,
    Url,
  },
  props: ["url"],
  setup(props) {
    const data = ref([]);
    const legendTop = ref(true);
    const imgData = ref(null);
    const url = props.url;
    let last = null;
    const bufferflush = ref({ LStat: [] });
    let timer = null;
    let index = 1;
    const labels = ref(["Interval"]);
    const tableMetadata = {
      perPage: 20,
      currentPage: 1,
      sortBy: "CommandCount",
      sortDesc: true,
      fields: [
        "StartTime",
        "WriteLimit",
        "NoEntries",
        "FlushPagesSum",
        "AverageIO",
        "Duration",
        "Rejected",
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
      },
      plugins: {
        legend: {
          position: "top",
          display: false,
        },
        title: {
          display: false,
          text: "Adabas calls",
        },
      },
    }));
    const chartData = computed(() => ({
      labels: labels.value,
      datasets: [
        {
          label: "Adabas calls",
          data: data.value,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.4,
          yAxisID: "y",
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
      db.bfStats().then((response) => {
        if (!response) {
          return;
        }
        bufferflush.value = response;
        data.value = [];
        //console.log("RESPONSE: "+JSON.stringify(response));
        response.LStat.forEach((l)=>{
          data.value.push(l.FlushPagesSum);
        });
      });
    }
    function formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return "0 Bytes";

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    }
    function avgioMsec(item) {
      var avgioMsec = 0;
      if (!item.BfDiffEndBf || !item.BfFlushPagesSum) {
        return 0;
      }
      if (item.BfDiffEndBf != 0 && item.BfFlushPagesSum > 0) {
        /* Average I/O time in msec*100 (because of editing) */
        avgioMsec =
          ((item.BfDiffEndBf - item.BfDiffStartIO) * 100) /
          item.BfFlushPagesSum;
      }
      return avgioMsec;
    }
    function checkUndefined(v) {
      if (!v) {
        return 0;
      }
      return v;
    }
    function checkUndefinedIndex(v, index) {
      if (!v) {
        return 0;
      }
      return v[index];
    }
    function countFlushes() {
      let c = 0;
      if (!bufferflush.value.BfFlushCounter) {
        return 0;
      }
      bufferflush.value.BfFlushCounter.foreach((element, index) => {
        if (index != 6) {
          c += element;
        }
      });
      return c;
    }
    return {
      avgioMsec,
      checkUndefined,
      checkUndefinedIndex,
      countFlushes,
      formatBytes,
      tableMetadata,
      bufferflush,
      lineChartProps,
      lineChartRef,
      imgData,
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
a {
  color: #42b983;
}
</style>
