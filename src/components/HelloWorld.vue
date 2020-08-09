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
  <div class="hello p-2">
    <div class="card">
      <div class="card-header h5">Adabas data access</div>
      <div class="card-body">
        <p>
          The application provides a small overview of accessing Adabas records and form of data provided by Adabas REST API.
          It contains Adabas record data acces as well as Adabas
          administration and monitor tasks. In advance it shows how to use the Adabas Map
          technology defined and used in Adabas Client for Java. The Adabas Map maps the classic Adabas database short name to
          long names, similar to Natural does it. The Adabas Map information are stored in the Adabas database.
        </p>
        <p>The example web application is hosted at GITHUB: <a href="https://github.com/SoftwareAG/adabas-rest-vuejs">https://github.com/SoftwareAG/adabas-rest-vuejs</a></p>
        <p>
          All example data, viewed in the content of this example web appplication, is stored in the Adabas database.
          It contains Alpha field data as well as binary images in large objects
          or unicode content.
        </p>
        <p>
          The Adabas Data Designer or the mappingTool are part of the Adabas
          Client for Java product package. These tools are able to create Adabas
          Maps. Transfer of already available definition on base of an Adabas
          database FDT comment or a SYSOBJH exported DDM are possible. The
          Adabas Maps provide long name and table name access to Adabas data.
          The classic Natural related DDM based types like NATDATE or Logical
          are available in Adabas Maps. The Adabas RESTful server provides data
          access using those definitions.
        </p>
        <p>
          For this example all data is delivered in an Adabas backup file. The
          file contains example data records used in the image example and
          contains predefined Adabas Maps. To load the example data, restore the
          delivered backup file which is located in the Software AG installation
          at
          <code>AdabasRestAdministration/data</code>. In addition you need to
          configure the Rest server configuration to add Mapping repository
          using the <code>Mapping</code> configuration.
          <pre lang="xml">{{mappingConfigExample}} </pre>
        </p>
        <p>
          At the moment are {{ numberMaps }} Adabas Maps in the Mapping
          repository defined by the configuration. There are
          {{ numberDbs }} databases which can be accessed directly.
        </p>
      </div>
    </div>
    <div class="card">
      <div class="card-header h5">Adabas administration</div>
      <div class="card-body">
        <p>
          Beside the Adabas data access, this application provide example how to
          access administration operations being using the REST API of the
          administration layer. This includes online as well as offline
          administration tasks of Adabas. The user needs administration access
          to see administration tasks.
        </p>
        <p>
          Simple administration tasks and monitoring is possible. The job
          control management used to start long running Adabas utility jobs can
          be used as well.
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import store from "../store/index";

@Component
export default class HelloWorld extends Vue {
  @Prop() private msg!: string;
  data() {
    return {
      numberDbs: 0,
      numberMaps: 0,
      mappingConfigExample:'<Mapping>\n <Directory url="file:xtsurl.cfg" />\n <Database dbid="111(adatcp://localhost:64111)" file="4" />\n</Mapping>'
    };
  }
  created(): void {
    store.dispatch("INIT_DATABASES").then((dbs) => {
      this.$data.numberDbs = dbs.length;
    });
    store.dispatch("INIT_MAPS").then((response) => {
      this.$data.numberMaps = response.data.Maps.length;
    });
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
