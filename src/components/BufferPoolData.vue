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
  <div class="bufferpooldisplay p-2" overflow-y="auto">
    <Sidebar :url="url" />
    <div class="card border-secondary mb-3">
      <div class="card-header border-secondary">
        My header {{ url }}
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the statistics of Adabas database Buffer Pool to be
            </div>
          </div>
          <div class="row">
            <div class="col text-right">
              Buffer Pool Size
            </div>
            <div class="col">
              {{ bufferPoolSize.toLocaleString() }}
            </div>
          </div>
          <div class="row">
            <div class="col text-right">
              Write Limit
            </div>
            <div class="col">
              {{ searchValue('Write Limit').toLocaleString() }}
            </div>
          </div>
          <div class="row">
            <div class="col text-right">
              Modified
            </div>
            <div class="col">
              {{ searchValue('Modified').toLocaleString() }}
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="font-weight-bold">
                Pool Allocations
              </div>
              <table class="table table-striped table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>percent</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in search('Alloc')" :key="row.Name">
                    <td>
                      {{
                        row.Name.substring(5)
                          .replace(/([A-Z])/g, ' $1')
                          .trim()
                      }}
                    </td>
                    <td>
                      {{ ((row.Value / bufferPoolSize) * 100).toFixed(2) }}%
                    </td>
                    <td>
                      {{ row.Value.toLocaleString() }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="col">
              <div class="font-weight-bold">
                I/O statistics
              </div>
              <table class="table table-striped table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in search('IO')" :key="row.Name">
                    <td>
                      {{
                        row.Name.substring(2)
                          .replace(/([A-Z])/g, ' $1')
                          .trim()
                      }}
                    </td>
                    <td>
                      {{ row.Value.toLocaleString() }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="font-weight-bold">
                RABNs present
              </div>
              <table class="table table-striped table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in search('Rabns')" :key="row.Name">
                    <td>
                      {{
                        row.Name.substring(5)
                          .replace(/([A-Z])/g, ' $1')
                          .trim()
                      }}
                    </td>
                    <td>
                      {{ row.Value.toLocaleString() }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="col">
              <div class="font-weight-bold">
                Buffer Flushes
              </div>
              <table class="table table-striped table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in search('Flushes')" :key="row.Name">
                    <td>
                      {{
                        row.Name.substring(7)
                          .replace(/([A-Z])/g, ' $1')
                          .trim()
                      }}
                    </td>
                    <td>
                      {{ row.Value.toLocaleString() }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import Sidebar from './Sidebar.vue';
import StatusBar from '@/components/StatusBar.vue';
import Url from './Url.vue';
import { SearchDatabases } from '@/adabas/admin';

export default defineComponent({
  components: {
   StatusBar,
    Sidebar,
    Url,
  },
  props: {
    url: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    // Define reactive state variables
    const bufferPoolSize = ref(0);
    const fields = ref(['Name', 'Value']);
    const statFields = ref(['Name', 'percent', 'Value']);
    const bufferpool = ref([]);

    // Perform logic in created lifecycle
    onMounted(() => {
      const db = SearchDatabases(props.url);
      db.bpStats().then((response: any) => {
        bufferpool.value = response;
        bufferPoolSize.value = searchValue('Size');
      });
    });

    // Search logic
    function searchValue(s: string): number {
      const v = bufferpool.value.filter((row: { Name: string; Value: number }) => row.Name === s);
      return v.length > 0 ? v[0].Value : 0;
    }

    function search(s: string): any {
      return bufferpool.value.filter((row: any) => row.Name.startsWith(s));
    }

    return {
      bufferPoolSize,
      fields,
      statFields,
      bufferpool,
      searchValue,
      search,
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
