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
  <div class="small Chart">
    <line-chart :chart-data="datacollection"></line-chart>
  </div>
</template>

<script>
  import LineChart from './LineChart.js'

  export default {
    components: {
      LineChart
    },
    data () {
      return {
        datacollection: null
      }
    },
    mounted () {
      this.fillData()
    },
    methods: {
      fillData () {
        this.datacollection = {
        labels: ["Log Level", "Debug", "Info", "Warn", "Error", "Fatal"],
        datasets: [
          {
            label: 'GitHub Commits',
            backgroundColor: ['rgb(226,126,64)', 'rgb(232,226,202)', 'rgb(226,210,172)', 'rgb(223,189,139)', 'rgb(223,162,103)','rgb(226,126,64)'],
            borderWidth: 0,
            hoverBorderWidth: 0,
            data: [10, 10, 40, 10,0],
          }
        ]
      }
      },
      getRandomInt () {
        return Math.floor(Math.random() * (50 - 5 + 1)) + 5
      }
    }
  }
</script>

<style>
  .small {
     max-width: 400px;
    margin: 0 auto;
  }
    .Chart {
    padding: 20px;
    box-shadow: 0px 0px 20px 2px rgba(0, 0, 0, .4);
    border-radius: 20px;
    margin: 50px 0;
  }
</style>
