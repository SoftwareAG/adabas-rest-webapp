<template>
  <!--div id="myDoughnutChart3" style="width: 400px"-->
    <DoughnutChart ref="doughtnutRef" :chartData="testData" />
  <!--/div-->
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { DoughnutChart, ExtractComponentData } from "vue-chart-3";
import store from "../store/index";
import { eventBus } from "../main";
import { Chart, DoughnutController, ArcElement, Tooltip } from 'chart.js';
Chart.register(DoughnutController, ArcElement, Tooltip);

export default defineComponent({
  name: "myDoughnutChart3",
  components: { DoughnutChart },
  setup() {
    const doughtnutRef = ref<ExtractComponentData<typeof DoughnutChart>>();
    const data = ref([10, 10, 40, 10, 0, 0]);
    const label = ref(["A1", "E1", "L1", "S1", "ET", "CL"]);
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
    eventBus.$on("commandStats", (dataIn: any) => {
      console.log("DOUGHNAT EVENT:" + JSON.stringify(dataIn));
      label.value = dataIn.Label;
      testData.labels = dataIn.Label;
      testData.datasets[0].data = dataIn.Data;
      data.value = dataIn.Data;
      console.log("DOUGHNAT LABELS:" + JSON.stringify(label.value));
    });

    return { testData, doughtnutRef };
  },
});
</script>
