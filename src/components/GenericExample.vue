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
  <div class="descriptorexample">
    <MyHeader></MyHeader>
    <div class="card border-secondary">
      <div class="card-header border-secondary">
        {{ title }}
      </div>
      <div class="card-body">
        <p>
          This application provides access to Adabas data using the Adabas
          RESTful administration and the Adabas Map technology defined and being
          used in Adabas Client for Java.
        </p>
        <p>
          {{ infoText }}
        </p>
        <Url :url="xURL"/>
        <nav aria-label="Page navigation">
          <ul class="pagination">
            <li class="page-item" v-for="page in totalPages" :key="page">
              <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
            </li>
          </ul>
        </nav>
        <table class="table table-striped table-bordered table-hover table-sm">
          <thead>
            <tr>
              <th v-for="field in fields" :key="field">{{ field }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in paginatedRecords" :key="record.id">
              <td v-for="field in fields" :key="field">{{ record[field] }}</td>
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
  name: 'GenericExample',
  components: {
    MyHeader,
    Url,
   StatusBar,
  },
  props: {
    URL: String,
    text: String,
    title: String,
  },
  setup(props) {
    const perPage = ref(10);
    const currentPage = ref(1);
    const xURL = ref(props.URL);
    const infoText = ref(props.text);
    const fields = ref([]);
    const records = ref([]);

    // const totalPages = computed(() => Math.ceil(records.value.length / perPage.value));
    // const paginatedRecords = computed(() => {
    //   const start = (currentPage.value - 1) * perPage.value;
    //   const end = start + perPage.value;
    //   return records.value.slice(start, end);
    // });

    onMounted(() => {
      const getConfig = {
        headers: authHeader('application/json'),
        useCredentails: true,
      };
      store.commit('SET_URL', {
        url: config.Url() + xURL.value,
        method: 'get',
      });
      axios
        .get(config.Url() + xURL.value, getConfig)
        .then((response: any) => {
          store.commit('SET_STATUS', 'OK');
          records.value = response.data.Records;
          adaptFields();
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

    const adaptFields = () => {
      const fs = [];
      if (records.value && records.value.length > 0) {
        for (const x in records.value[0]) {
          fs.push(x);
        }
      }
      fields.value = fs;
    };

    return {
      perPage,
      currentPage,
      xURL,
      infoText,
      fields,
      records,
      // totalPages,
      // paginatedRecords,
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
