<template>
  <div class="commandstatsdata p-2">
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
              This page provide the list of Adabas database command statistics
              to be administrate through this Adabas RESTful server.
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
            <b-col sm="4">
              <div class="small Chart w-100">
                <DoughnutChart v-bind="doughnutChartProps" />
                <img style="width: 300px" v-if="imgData" :src="imgData" />
              </div>
            </b-col>
            <b-col sm="4">
              <div class="small Chart w-100">
                <BarChart v-bind="barChartProps" />
                <img style="width: 300px" v-if="imgData" :src="imgData" />
              </div>
            </b-col> </b-row></b-container></b-card-body
    ></b-card>
    <StatusBar />
  </div>
</template>

<script>
import { Chart } from "chart.js/auto";
import { DoughnutChart, useDoughnutChart, BarChart, useBarChart } from "vue-chart-3";
import {
  ref,
  onMounted,
  computed,
  onBeforeUnmount,
  defineComponent,
} from "@vue/composition-api";
import { shuffle } from "lodash";
import Sidebar from "./Sidebar.vue";
import StatusBar from "./StatusBar.vue";
import Url from "./Url.vue";
import store from "../store/index";

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
      db = store.getters.search(props.url);
      if (timer==null) {
        timer = setInterval(loadCommandStat, 10000);
      }
      loadCommandStat();
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
      timer = null;
    });
    function loadCommandStat() {
      if (!db || db==null) {
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

    return {
      tableMetadata,
      comstats,
      doughnutChartProps,
      doughnutChartRef,
      barChartProps,
      barChartRef,
      imgData,
    };
  },
});
</script>

<style>
.commandstatsdata {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
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
