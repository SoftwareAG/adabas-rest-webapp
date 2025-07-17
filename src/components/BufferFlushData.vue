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
  <div class="bufferflushdisplay p-2" overflow-y="auto">
    <Sidebar :url="url" />
    <div class="card border-secondary mb-3">
      <div class="card-header border-secondary">
        Adabas Database Buffer Flush for database {{ url }}
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the statistics of Adabas database Buffer Flush.
            </div>
          </div>
          <div class="row">
            <div class="col">
              <Url url="/adabas/database" />
            </div>
          </div>
          <div class="row">
            <div class="col text-right"> Total number of flushed </div>
            <div class="col">
              {{ countFlushes() }}
            </div>
          </div>
          <div class="row">
            <div class="col text-right"> Explicit </div>
            <div class="col">
              {{ checkUndefinedIndex(bufferflush.BfFlushCounter, 1) }}
            </div>
          </div>
          <div class="row">
            <div class="col text-right"> Write Limit </div>
            <div class="col">
              {{ checkUndefinedIndex(bufferflush.BfFlushCounter, 0) }}
            </div>
          </div>
          <div class="row">
            <div class="col text-right"> WORK Limit </div>
            <div class="col">
              {{ checkUndefinedIndex(bufferflush.BfFlushCounter, 2) }}
            </div>
          </div>
          <div class="row">
            <div class="col text-right"> Space </div>
            <div class="col">
              {{ checkUndefinedIndex(bufferflush.BfFlushCounter, 3) }}
            </div>
          </div>
          <div class="row">
            <div class="col text-right"> Emergency </div>
            <div class="col">
              {{ checkUndefinedIndex(bufferflush.BfFlushCounter, 4) }}
            </div>
          </div>
          <div class="row">
            <div class="col text-right"> Ignored blocks </div>
            <div class="col">
              {{ checkUndefinedIndex(bufferflush.BfFlushCounter, 5) }}
            </div>
          </div>
          <div class="row">
            <div class="col text-right">
              <table class="table table-striped table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th v-for="field in tableMetadata.fields" :key="field">{{ field }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="l in bufferflush.LStat" :key="l.StartTime">
                    <td>{{ new Date(l.StartTime).toUTCString() }}</td>
                    <td>{{ l.WriteLimit / 10 }}</td>
                    <td>{{ l.NoEntries }}</td>
                    <td>{{ formatBytes(l.FlushPagesSum) }}</td>
                    <td>{{ avgioMsec(l) }}</td>
                    <td>{{ checkUndefined(l.BfDiffEndBf) }}</td>
                    <td>{{ checkUndefined(l.BfListEntryLockReject) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="col text-right">
              <div class="small Chart w-100">
                <LineChart v-bind="lineChartProps" />
                <img style="width: 300px" v-if="imgData" :src="imgData" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <StatusBar />
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, computed, defineComponent } from "vue";
import { LineChart, useLineChart } from "vue-chart-3";
import Sidebar from "./Sidebar.vue";
import StatusBar from '@/components/StatusBar.vue';
import Url from "./Url.vue";
import { SearchDatabases } from "@/adabas/admin";

export default defineComponent({
  name: "BufferFlushData",
  components: {
    LineChart,
    Sidebar,
    StatusBar,
    Url,
  },
  props: {
    url: String,
  },
  setup(props) {
    const data = ref([]);
    const legendTop = ref(true);
    const imgData = ref(null);
    const bufferflush = ref({ LStat: [] });
    const timer = ref(null);
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

    const loadCommandStat = () => {
      if (!db || db == null) {
        db = SearchDatabases(props.url);
        return;
      }
      db.bfStats().then((response) => {
        if (!response) {
          return;
        }
        bufferflush.value = response.Statistics;
        data.value = [];
        response.Statistics.LStat.forEach((l) => {
          data.value.push(l.FlushPagesSum);
        });
      });
    };

    const formatBytes = (bytes, decimals = 2) => {
      if (bytes === 0) return "0 Bytes";

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    const avgioMsec = (item) => {
      var avgioMsec = 0;
      if (!item.BfDiffEndBf || !item.BfFlushPagesSum) {
        return 0;
      }
      if (item.BfDiffEndBf != 0 && item.BfFlushPagesSum > 0) {
        avgioMsec =
          ((item.BfDiffEndBf - item.BfDiffStartIO) * 100) /
          item.BfFlushPagesSum;
      }
      return avgioMsec;
    };

    const checkUndefined = (v) => {
      if (!v) {
        return 0;
      }
      return v;
    };

    const checkUndefinedIndex = (v, index) => {
      if (!v) {
        return 0;
      }
      return v[index];
    };

    const countFlushes = () => {
      let c = 0;
      if (!bufferflush.value.BfFlushCounter) {
        return 0;
      }
      bufferflush.value.BfFlushCounter.forEach((element, index) => {
        if (index != 6) {
          c += element;
        }
      });
      return c;
    };

    onMounted(() => {
      db = SearchDatabases(props.url);
      if (timer.value == null) {
        timer.value = setInterval(loadCommandStat, 5000);
      }
      loadCommandStat();
    });

    onBeforeUnmount(() => {
      clearInterval(timer.value);
      timer.value = null;
    });

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
