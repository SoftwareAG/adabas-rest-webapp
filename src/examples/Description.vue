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
  <div class="description">
    <MyHeader></MyHeader>
    <div class="card">
      <div class="card-header h5">Adabas example description</div>
      <div class="card-body">
        <p>
          The example database data are prerequisite to use the REST server example pages.
          All Adabas files are delivered in an Adabas backup file. The
          file contains example data records used in the image example and
          contains predefined Adabas Maps. To load the example data, restore the
          delivered backup file which is located in the Software AG installation
          at
          <code>AdabasRestAdministration/data</code>. In addition you need to
          configure the Rest server configuration to add Mapping repository
          using the <code>Mapping</code> configuration.
          <pre lang="xml">{{mappingConfigExample}} </pre>
        </p>
        <p>Except the Adabas image example and Map definitions, all data is equal to the 
            Adabas demo database data.</p>
        <p>Following Adabas Maps are used:
                <table class="table">
                    <thead><th>Map Name</th><th>Usage</th></thead>
                    <tbody>
                    <tr><td>EMPLOYEES-NAT-DDM</td><td>Adabas long name Map for Adabas employees example file (11) imported using DDM.</td></tr>
                    <tr><td>NEW_EMPLOYEES</td><td>Adabas long name Map for new Adabas employees example file (9).</td></tr>
                    <tr><td>LOBEXAMPLE</td><td>Adabas Large object image example Map</td></tr>
                    </tbody>
                </table>
            </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, PropSync, Vue } from "vue-property-decorator";
import store from "../store/index";
import { BootstrapVue } from "bootstrap-vue";
import MyHeader from "@/components/Header.vue";
import "bootstrap/dist/css/bootstrap.css";

@Component({
  components: {
    MyHeader,
  },
})
export default class Description extends Vue {
  @Prop() private msg!: string;
  data() {
    return {
      mappingConfigExample:'<Mapping>\n <Directory url="file:xtsurl.cfg" />\n <Database dbid="111(adatcp://localhost:64111)" file="4" />\n</Mapping>'
    };
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
</style>
