<template>
  <div class="commandstatsdata p-2" style="overflow-y: auto;">
    <Sidebar :url="url" />
    <div class="card border-secondary">
      <div class="card-header border-secondary">
        Adabas Database command statistics for database {{ url }}
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the statistics of Adabas database command
              to be monitored through this Adabas RESTful server.
            </div>
          </div>
          <div class="row">
            <div class="col">
              <Url :url="'/adabas/database/' + url + '/cmdstats'" />
            </div>
            <div class="col text-end">
              <button class="btn btn-primary" @click="resetCommands()">Reset</button>
            </div>
          </div>
          <div class="row">
            <div class="col-sm-4 h-100 p-1">
              <nav>
                <ul class="pagination">
                  <li class="page-item" :class="{ active: page === tableMetadata.currentPage }" v-for="page in totalPages" :key="page">
                    <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
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
                  <tr v-for="item in paginatedItems" :key="item.CommandName">
                    <td>{{ item.CommandName }}</td>
                    <td>{{ item.CommandCount }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="col-sm-4">
              <div class="small Chart w-100">
                <DoughnutChart v-bind="doughnutChartProps" />
                <div class="mt-3" v-if="imgData">
                  <img style="width: 100%" :src="imgData" />
                </div>
              </div>
            </div>
            
            <div class="col-sm-4">
              <div class="small Chart w-100">
                <BarChart v-bind="barChartProps" />
                <div class="mt-3" v-if="imgData">
                  <img style="width: 100%" :src="imgData" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <StatusBar />
  </div>
</template>

<script setup lang="ts">
import { DoughnutChart, useDoughnutChart, BarChart, useBarChart } from "vue-chart-3";
import {
  ref,
  onMounted,
  computed,
  onBeforeUnmount,
} from "vue";
import Sidebar from "./Sidebar.vue";
import StatusBar from '@/components/StatusBar.vue';
import Url from "./Url.vue";
import { SearchDatabases } from '@/adabas/admin';

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  DoughnutController,
  BarController,
} from 'chart.js';

// Register necessary components
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  DoughnutController,
  BarController
);

const props = defineProps<{ url: string }>();

const data = ref<number[]>([10, 10, 40, 10, 0]);
const legendTop = ref(true);
const imgData = ref<null | string>(null);
const comstats = ref<any[]>([]);
let timer: number | null = null;
const labels = ref<string[]>(["A1", "E1", "L1", "S1", "ET", "CL"]);
const tableMetadata = {
  perPage: 12,
  currentPage: 1,
  sortBy: "CommandCount",
  sortDesc: true,
  fields: ["CommandName", "CommandCount"],
};

let db: any = null;

const options = computed(() => ({
  scales: {
    y: {
      beginAtZero: true,
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
const doughnutOptions = computed(() => ({
  plugins: {
    legend: {
      position: "top",
      display: true,
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
      backgroundColor: [
        "rgb(200,126,64)", "rgb(200,226,202)", "rgb(200,210,172)",
        "rgb(200,189,139)", "rgb(200,162,103)", "rgb(150,126,64)",
        "rgb(150,126,64)", "rgb(150,226,202)", "rgb(150,210,172)",
        "rgb(150,189,139)", "rgb(130,162,103)", "rgb(130,126,64)",
        "rgb(130,126,64)", "rgb(130,226,202)", "rgb(130,210,172)",
        "rgb(130,189,139)", "rgb(130,162,103)", "rgb(226,126,64)",
        "rgb(226,126,64)", "rgb(232,226,202)", "rgb(226,210,172)",
        "rgb(223,189,139)", "rgb(223,162,103)", "rgb(226,126,64)",
        "rgb(226,126,64)", "rgb(232,226,202)", "rgb(226,210,172)",
        "rgb(223,189,139)", "rgb(223,162,103)", "rgb(226,126,64)",
      ],
      borderWidth: 0,
      hoverBorderWidth: 0,
    },
  ],
}));

const { barChartProps, barChartRef } = useBarChart({
  chartData,
  options,
});
const { doughnutChartProps, doughnutChartRef } = useDoughnutChart({
  chartData,
  doughnutOptions,
});
onMounted(() => {
  db = SearchDatabases(props.url);
  if (timer == null) {
    timer = window.setInterval(loadCommandStat, 5000);
  }
  loadCommandStat();
});
onBeforeUnmount(() => {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
});

function resetCommands() {
  if (!db) {
    db = SearchDatabases(props.url);
    return;
  }
  db.commandStatsReset();
}

const loadCommandStat = async () => {
  if (!db) {
    db = SearchDatabases(props.url);
    return;
  }

  try {
    const response = await db.commandStats();

    if (response) {
      comstats.value = response;
      labels.value = [];
      data.value = [];

      response.forEach((element: any) => {
        if (element.CommandCount > 0) {
          labels.value.push(element.CommandName);
          data.value.push(element.CommandCount);
        }
      });

    }
  } catch (error: any) {
    console.error("Error:", error);
    if (error.response?.status === 401 || error.response?.status === 403) {
      userService.logout();
      location.reload();
    }
  }
};

// Pagination logic
const totalPages = computed(() =>
  Math.ceil(comstats.value.length / tableMetadata.perPage)
);

const paginatedItems = computed(() => {
  const start = (tableMetadata.currentPage - 1) * tableMetadata.perPage;
  const end = start + tableMetadata.perPage;
  return comstats.value.slice(start, end);
});

function changePage(page: number) {
  tableMetadata.currentPage = page;
}

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
