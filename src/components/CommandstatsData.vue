<template>
  <div class="commandstatsdata p-2">
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
                  <li class="page-item" v-for="page in totalPages" :key="page">
                    <a class="page-link" @click="changePage(page)">{{ page }}</a>
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
                <img style="width: 300px" v-if="imgData" :src="imgData" />
              </div>
            </div>
            <div class="col-sm-4">
              <div class="small Chart w-100">
                <BarChart v-bind="barChartProps" />
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
import { DoughnutChart, useDoughnutChart, BarChart, useBarChart } from "vue-chart-3";
import {
  ref,
  onMounted,
  computed,
  onBeforeUnmount,
  defineComponent,
} from "vue";
import Sidebar from "./Sidebar.vue";
import StatusBar from '@/components/StatusBar.vue';
import Url from "./Url.vue";
import { SearchDatabases } from '@/adabas/admin';

export default defineComponent({
  name: "CommandstatsData",
  components: {
    BarChart,
    DoughnutChart,
    Sidebar,
   StatusBar,
    Url,
  },
  props: ["url"],
  setup(props) {
    const data = ref([10, 10, 40, 10, 0]);
    const legendTop = ref(true);
    const imgData = ref(null);
    const url = props.url;
    const comstats = ref([]);
    let timer = null;
    const labels = ref(["A1", "E1", "L1", "S1", "ET", "CL"]);
    const tableMetadata = {
      perPage: 12,
      currentPage: 1,
      sortBy: "CommandCount",
      sortDesc: true,
      fields: ["CommandName", "CommandCount"],
    };
    let db = null;
    const options = computed(() => ({
      scales: {
        y: {
          beginAtZero: true,
        },
      },
     plugins: {
        legend: {
          position:  "top",
          display: false,
        },
        title: {
          display: false,
          text: "Adabas calls",
        },
      },
    }));
    const doughnutOptions = computed(() => ({
      scales: {
        y: {
          beginAtZero: true,
        },
      },
     plugins: {
        legend: {
          position:  "top",
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
      if (timer==null) {
        timer = setInterval(loadCommandStat, 5000);
      }
      loadCommandStat();
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
      timer = null;
    });
    function resetCommands() {
     if (!db || db==null) {
        db = SearchDatabases(props.url);
        return;
      }
      db.commandStatsReset();
    };
    function loadCommandStat() {
      if (!db || db==null) {
        db = SearchDatabases(props.url);
        return;
      }
      db.commandStats().then((response) => {
        if (!response) {
          return;
        }
        comstats.value = response;
        labels.value = [];
        data.value = [];
        response.forEach((element) => {
          if (element.CommandCount > 0) {
            labels.value.push(element.CommandName);
            data.value.push(element.CommandCount);
          }
        });
      });
    }

    // const totalPages = computed(() => Math.ceil(comstats.value.length / tableMetadata.perPage));
    // const paginatedItems = computed(() => {
    //   const start = (tableMetadata.currentPage - 1) * tableMetadata.perPage;
    //   const end = start + tableMetadata.perPage;
    //   return comstats.value.slice(start, end);
    // });
    // function changePage(page) {
    //   tableMetadata.currentPage = page;
    // }

    return {
      tableMetadata,
      comstats,
      doughnutChartProps,
      doughnutChartRef,
      barChartProps,
      barChartRef,
      resetCommands,
      imgData,
      // totalPages,
      // paginatedItems,
      // changePage,
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
