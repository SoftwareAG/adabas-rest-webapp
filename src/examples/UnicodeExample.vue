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
  <div class="unicodeexample p-2" overflow-y="auto">
    <MyHeader></MyHeader>
    <div class="card border-secondary mb-3">
      <div class="card-header">Adabas Unicode example</div>
      <div class="card-body text-secondary">
        <p>
          This example queries employee example file data which contains Unicode
          alpha characters.
        </p>
        <Url :url="URL"/>
        <nav>
          <ul class="pagination">
            <li class="page-item" v-for="page in totalPages" :key="page">
              <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
            </li>
          </ul>
        </nav>
        <table class="table table-striped table-bordered table-hover table-sm">
          <thead>
            <tr>
              <th v-for="field in fields" :key="field.key">{{ field.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedData" :key="item.ISN">
              <td v-for="field in fields" :key="field.key">{{ item[field.key] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
        <StatusBar />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { authHeader } from '../user/auth-header';
import { config } from '../store/config';
import { userService } from '../user/service';
import store from '../store/index';
import MyHeader from '@/components/Header.vue';
import StatusBar from '@/components/StatusBar.vue';
import Url from '@/components/Url.vue';
import axios from 'axios';

export default defineComponent({
  components: {
    MyHeader,
    Url,
    StatusBar,
  },
  setup() {
    const perPage = ref(10);
    const currentPage = ref(1);
    const URL = ref('/rest/map/NEW_EMPLOYEES?start=1250&fields=personnel-id,full-name');
    const fields = ref([
      { label: 'ISN', key: 'ISN' },
      { label: 'personnel-id', key: 'personnel-data.personnel-id' },
      { label: 'Name', key: 'full-name.name' },
      { label: 'Middle Name', key: 'full-name.middle-name' },
      { label: 'First Name', key: 'full-name.first-name' },
    ]);
    const unicode = ref([]);

    // const totalPages = computed(() => Math.ceil(unicode.value.length / perPage.value));
    // const paginatedData = computed(() => {
    //   const start = (currentPage.value - 1) * perPage.value;
    //   const end = start + perPage.value;
    //   return unicode.value.slice(start, end);
    // });

    onMounted(() => {
      const getConfig = {
        headers: authHeader('application/json'),
        useCredentails: true,
      };
      store.commit('SET_URL', {
        url: config.Url() + URL.value,
        method: 'get',
      });
      axios
        .get(config.Url() + URL.value, getConfig)
        .then((response: any) => {
          store.commit('SET_STATUS', 'OK');
          store.commit('SET_RESPONSE', JSON.stringify(response));
          unicode.value = response.data.Records;
        })
        .catch((error: any) => {
          console.log('ERROR: ' + JSON.stringify(error));
          if (error.response) {
            store.commit('SET_STATUS', JSON.stringify(error.response));
            if (error.response.status == 401 || error.response.status == 403) {
              userService.logout();
              location.reload();
            }
          } else {
            store.commit('SET_STATUS', JSON.stringify(error));
          }
          throw error;
        });
    });

    return {
      perPage,
      currentPage,
      URL,
      fields,
      unicode,
      // totalPages,
      // paginatedData,
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
