<template>
  <!--div id="barChart3" style="width: 400px"-->
    <BarChart ref="barChartRef" :chartData="testData" />
  <!--/div-->
</template>

<script lang="ts">
import { Chart } from "chart.js/auto";
import {
  defineComponent,
  ref,
  computed,
  onMounted,
} from "@vue/composition-api";
import { BarChart, useBarChart } from "vue-chart-3";
import store from "../store/index";
import { eventBus } from "../main";

export default defineComponent({
  name: "myBarChart3",
  components: { BarChart },
  setup(props) {
    const barChartRef = ref<typeof BarChart>();
    const data = ref([10,20]);
    const label = ref(["CL","OP"]);
    const testData = {
      labels: label.value,
      datasets: [
        {
          label: label.value,
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
          data: data.value,
        },
      ],
    };
    /*const options = computed(() => ({
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    }));
    const chartData = computed(() => ({
      labels: ["Paris", "Nîmes", "Toulon", "Perpignan", "Autre"],
      datasets: [
        {
          data: data.value,
          backgroundColor: [
            "#77CEFF",
            "#0079AF",
            "#123E6B",
            "#97B0C4",
            "#A5C8ED",
          ],
        },
      ],
    }));
    const { barChartProps, barChartRef } = useBarChart({
      chartData,
      options,
    });*/
    /*eventBus.$on("commandStats", (dataIn: any) => {
      console.log("BAR EVENT:" + JSON.stringify(dataIn));
      label.value = dataIn.Label;
      testData.labels = dataIn.Label;
      testData.datasets[0].data = dataIn.Data;
      data.value = dataIn.Data;
      console.log("BAR LABELS:" + JSON.stringify(label.value));
    });*/

    return { testData, barChartRef };
    //    return { barChartProps,barChartRef,chartData };
  },
});
</script>
