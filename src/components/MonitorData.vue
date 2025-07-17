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
  <div class="monitordata p-2" overflow-y="auto">
    <Sidebar :url="url" />
    <div class="card border-secondary mb-3">
      <div class="card-header">
        Adabas Database command statistics for database {{ url }}
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the statistics of Adabas database commands per
              second and I/O to be monitored through this Adabas RESTful server.
            </div>
          </div>
          <div class="row">
            <div class="col">
              <Url :url="'/adabas/database/' + url + '/cmdstats'" />
            </div>
          </div>
          <div class="row">
            <div class="col-sm-4 h-100 p-1">
              <nav aria-label="Page navigation">
                <ul class="pagination">
                  <li class="page-item" v-for="page in totalPages" :key="page">
                    <a class="page-link" href="#" @click="changePage(page)">{{ page }}</a>
                  </li>
                </ul>
              </nav>
              <table class="table table-striped table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th v-for="field in tableMetadata.fields" :key="field">{{ field }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in paginatedItems" :key="item.id">
                    <td v-for="field in tableMetadata.fields" :key="field">{{ item[field] }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="col-sm-8">
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

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { LineChart, useLineChart } from 'vue-chart-3';
import { DoughnutChart, useDoughnutChart } from 'vue-chart-3';
import Sidebar from './Sidebar.vue';
import StatusBar from '@/components/StatusBar.vue';
import Url from './Url.vue';
import { SearchDatabases } from '@/adabas/admin';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  DoughnutController,
  ArcElement,
  BarController,
  LineController,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  DoughnutController,
  ArcElement,
  BarController,
  LineController
);


export default defineComponent({
  name: 'MonitorData',
  components: {
    LineChart,
    Sidebar,
    StatusBar,
    Url,
  },
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const data = ref([]);
    const dataIO = ref([]);
    const assoIO = ref([]);
    const workIO = ref([]);
    const legendTop = ref(true);
    const imgData = ref(null);
    const comstats = ref([
      {
        Commands: 0,
        'ASSO I/O': 0,
        'DATA I/O': 0,
        'WORK I/O': 0,
        'PLOG I/O': 0,
        'Throw backs': 0,
        'Buffer flush': 0,
      },
    ]);
    const labels = ref(['Interval']);
    const tableMetadata = ref({
      perPage: 20,
      currentPage: 1,
      sortBy: 'CommandCount',
      sortDesc: true,
      fields: [
        'Commands',
        'ASSO I/O',
        'DATA I/O',
        'WORK I/O',
        'PLOG I/O',
        'Throw backs',
        'Buffer flush',
      ],
    });
    const db = ref(null);
    let last = null;
    let timer = null;
    let index = 1;

    const options = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          stacked: true,
          position: 'left',
        },
        y2: {
          beginAtZero: true,
          stacked: true,
          position: 'right',
        },
      },
      plugins: {
        legend: {
          position: 'top',
          display: false,
        },
        title: {
          display: true,
          text: 'Adabas calls and I/O',
        },
      },
    }));
    const chartData = computed(() => ({
      labels: labels.value,
      datasets: [
        {
          label: 'Adabas calls/sec',
          data: data.value,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.4,
          yAxisID: 'y',
        },
        {
          label: 'DATA I/O sec',
          data: dataIO.value,
          borderColor: 'rgb(255, 204, 204)',
          stack: 'stack 0',
          type: 'bar',
          yAxisID: 'y2',
        },
        {
          label: 'ASSO I/O sec',
          data: assoIO.value,
          borderColor: 'rgb(255, 204, 204)',
          //backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
          stack: 'stack 1',
          type: 'bar',
          yAxisID: 'y2',
        },
        {
          label: 'WORK I/O sec',
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
          stack: 'stack 3',
          type: 'bar',
          yAxisID: 'y2',
        },
      ],
    }));

    const { lineChartProps, lineChartRef } = useLineChart({
      chartData,
      options,
    });
    onMounted(() => {
      db.value = SearchDatabases(props.url);
      if (timer == null) {
        timer = setInterval(loadCommandStat, 5000);
      }
      loadCommandStat();
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
      timer = null;
    });
    function loadCommandStat() {
      if (!db.value || db.value == null) {
        db.value = SearchDatabases(props.url);
        return;
      }
      db.value.monitor().then((response) => {
        if (!response) {
          return;
        }
        // console.log("MONITOR:" + JSON.stringify(response));
        response = response.Statistics;
        let monitorElement = {};
        if (last != null) {
          // console.log(response.ApioCnt + " " + last.ApioCnt);
          monitorElement.Commands = response.AcmdCnt - last.AcmdCnt;
          monitorElement['ASSO I/O'] = response.AaioCnt - last.AaioCnt;
          monitorElement['DATA I/O'] = response.AdioCnt - last.AdioCnt;
          monitorElement['WORK I/O'] = response.AwioCnt - last.AwioCnt;
          monitorElement['PLOG I/O'] = response.ApioCnt - last.ApioCnt;
          monitorElement['Throw backs'] = response.AthbCnt - last.AthbCnt;
          monitorElement['Buffer flush'] = response.AbflCnt - last.AbflCnt;
        } else {
          monitorElement.Commands = 0;
          monitorElement['ASSO I/O'] = 0;
          monitorElement['DATA I/O'] = 0;
          monitorElement['WORK I/O'] = 0;
          monitorElement['PLOG I/O'] = 0;
          monitorElement['Throw backs'] = 0;
          monitorElement['Buffer flush'] = 0;
        }
        assoIO.value.push(monitorElement['ASSO I/O']);
        dataIO.value.push(monitorElement['DATA I/O']);
        workIO.value.push(monitorElement['WORK I/O']);
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

    const totalPages = computed(() => Math.ceil(comstats.value.length / tableMetadata.value.perPage));
    const paginatedItems = computed(() => {
      const start = (tableMetadata.value.currentPage - 1) * tableMetadata.value.perPage;
      const end = start + tableMetadata.value.perPage;
      return comstats.value.slice(start, end);
    });
    function changePage(page) {
      tableMetadata.value.currentPage = page;
    }

    return {
      tableMetadata,
      comstats,
      lineChartProps,
      lineChartRef,
      imgData,
      totalPages,
      paginatedItems,
      changePage,
    };
  },
});

const doughnutData = computed(() => ({
  labels: ['Red', 'Blue', 'Yellow'],
  datasets: [{
    label: 'My Doughnut',
    data: [300, 50, 100],
    backgroundColor: ['red', 'blue', 'yellow'],
  }],
}));

const doughnutOptions = computed(() => ({
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Doughnut Chart Example',
    },
  },
}));

const { doughnutChartProps } = useDoughnutChart({
  chartData: doughnutData,
  options: doughnutOptions,
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
