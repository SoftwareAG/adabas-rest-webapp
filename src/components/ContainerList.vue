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
  <div class="containerlist p-2">
    <Sidebar :url="url" />
    <b-card
      :header="'Adabas Database containers for database ' + url"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-container fluid>
          <b-row
            ><b-col>
              This page provides the list of Adabas database containers to be
              administrate through this Adabas RESTful server.
            </b-col></b-row
          >
          <b-row
            ><b-col> <Url url="/adabas/database" /> </b-col
          ></b-row>
          <b-row
            ><b-col>
              <b-table
                striped
                bordered
                hover
                small
                :items="containers"
                :fields="fields"
              >
                <template v-slot:cell(calc)="row">
                  {{ calculate(row.item) }}
                </template>
              </b-table>
            </b-col></b-row
          >
        </b-container>
      </b-card-body></b-card
    >
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Sidebar from './Sidebar.vue';
import store from '../store/index';
import StatusBar from './StatusBar.vue';
import Url from './Url.vue';

@Component({
  components: {
    Sidebar,
    StatusBar,
    Url,
  },
})
export default class DatabaseList extends Vue {
  @Prop(String) readonly url: string | undefined;
  data() {
    return {
      fields: [
        'Path',
        'Type',
        'ContainerNumber',
        'DeviceType',
        'BlockSize',
        'FirstExtentRabn',
        'LastExtentRabn',
        'FirstUnusedRabn',
        { label: 'Size', key: 'calc' },
      ],
      containers: [],
    };
  }
  created() {
    const db = store.getters.search(this.url);
    db.containerList().then((response: any) => {
      this.$data.containers = response;
    });
  }
  calculate(container: any): string {
    const size =
      container.BlockSize *
      (container.LastExtentRabn - container.FirstExtentRabn + 1);
    return this.formatSizeUnits(size);
  }
  formatSizeUnits(bytes: number): string {
    let formatedSize = '';
    if (bytes >= 1073741824) {
      formatedSize = (bytes / 1073741824).toFixed(2) + ' GB';
    } else if (bytes >= 1048576) {
      formatedSize = (bytes / 1048576).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
      formatedSize = (bytes / 1024).toFixed(2) + ' KB';
    } else if (bytes > 1) {
      formatedSize = bytes + ' bytes';
    } else if (bytes == 1) {
      formatedSize = bytes + ' byte';
    } else {
      formatedSize = '0 bytes';
    }
    return formatedSize;
  }
}
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
