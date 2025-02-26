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
    <div class="card border-secondary mb-3">
      <div class="card-header border-secondary">
        Adabas Database containers and Free Space Table data for database {{ url }}
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the list of Adabas database containers to be
              administrate through this Adabas RESTful server. The Free Space table is in an extra table.
            </div>
          </div>
          <div class="row">
            <div class="col">
              <Url url="/adabas/database" />
            </div>
          </div>
          <div class="row">
            <div class="col">
              <ul class="nav nav-tabs mt-3" id="myTab" role="tablist">
                <li class="nav-item" role="presentation">
                  <button class="nav-link active" id="container-tab" data-bs-toggle="tab" data-bs-target="#container" type="button" role="tab" aria-controls="container" aria-selected="true">Container</button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="fst-tab" data-bs-toggle="tab" data-bs-target="#fst" type="button" role="tab" aria-controls="fst" aria-selected="false">Free Space Table</button>
                </li>
              </ul>
              <div class="tab-content mt-3" id="myTabContent">
                <div class="tab-pane fade show active" id="container" role="tabpanel" aria-labelledby="container-tab">
                  <table class="table table-striped table-bordered table-hover table-sm">
                    <thead>
                      <tr>
                        <th v-for="field in fields" :key="field.key || field">{{ field.label || field }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="container in containers" :key="container.Path">
                        <td v-for="field in fields" :key="field.key || field">
                          <template v-if="field.key === 'calc'">
                            {{ calculate(container) }}
                          </template>
                          <template v-else>
                            {{ container[field] }}
                          </template>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="tab-pane fade" id="fst" role="tabpanel" aria-labelledby="fst-tab">
                  <table class="table table-striped table-bordered table-hover table-sm">
                    <thead>
                      <tr>
                        <th v-for="field in fstFields" :key="field">{{ field }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="fstItem in fst" :key="fstItem.FirstRABN">
                        <td v-for="field in fstFields" :key="field">
                          <template v-if="field === 'BlockSize'">
                            {{ fstItem[field] }}KB
                          </template>
                          <template v-else>
                            {{ fstItem[field] }}
                          </template>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import Sidebar from './Sidebar.vue';
import store from '../store/index';
import StatusBar from '@/components/StatusBar.vue';
import Url from './Url.vue';
import { SearchDatabases } from '@/adabas/admin';

export default defineComponent({
  components: {
    Sidebar,
   StatusBar,
    Url,
  },
  props: {
    url: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const fields = ref([
      'Path',
      'Type',
      'ContainerNumber',
      'DeviceType',
      'BlockSize',
      'FirstExtentRabn',
      'LastExtentRabn',
      'FirstUnusedRabn',
      { label: 'Size', key: 'calc' },
    ]);
    const fstFields = ref([
       'Type',
       'FirstRABN',
       'LastRABN',
       'BlockSize'
    ]);
    const containers = ref([]);
    const fst = ref([]);

    onMounted(() => {
      const db = SearchDatabases(props.url);
      db.containerList().then((response: any) => {
        containers.value = response.Container.ContainerList;
        fst.value = response.Container.FreeSpaceTable;
      });
    });

    const calculate = (container: any): string => {
      const size =
        container.BlockSize *
        (container.LastExtentRabn - container.FirstExtentRabn + 1);
      return formatSizeUnits(size);
    };

    const formatSizeUnits = (bytes: number): string => {
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
    };

    return {
      fields,
      fstFields,
      containers,
      fst,
      calculate,
      formatSizeUnits,
    };
  },
});
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
