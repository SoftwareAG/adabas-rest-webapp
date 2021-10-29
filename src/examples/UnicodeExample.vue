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
  <div class="unicodeexample p-2">
    <MyHeader></MyHeader>
    <b-card
      header="Adabas Unicode example"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <p>
          This example queries employee example file data which contains Unicode
          alpha characters.
        </p>
        <Url :url="URL"/>
        <b-pagination
          v-model="currentPage"
          :total-rows="unicode.length"
          :per-page="perPage"
          aria-controls="my-table"
        ></b-pagination>
        <b-table
          ref="table"
          class="w-100 p-3"
          striped
          bordered
          hover
          small
          :per-page="perPage"
          :current-page="currentPage"
          :items="unicode"
          :fields="fields"
        >
        </b-table
      ></b-card-body>
    </b-card>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { authHeader } from '../user/auth-header';
import { config } from '../store/config';
import { userService } from '../user/service';
import store from '../store/index';
import MyHeader from '@/components/Header.vue';
import StatusBar from '@/components/StatusBar.vue';
import Url from '@/components/Url.vue';
import axios from 'axios';

@Component({
  components: {
    MyHeader,
    Url,
    StatusBar,
  },
})
export default class UnicodeExample extends Vue {
  @Prop() private msg!: string;
  data() {
    return {
      perPage: 10,
      currentPage: 1,
      URL: '/rest/map/NEW_EMPLOYEES?start=1250&fields=personnel-id,full-name',
      fields: [
        { label: 'ISN', key: 'ISN' },
        { label: 'personnel-id', key: 'personnel-data.personnel-id' },
        { label: 'Name', key: 'full-name.name' },
        { label: 'Middle Name', key: 'full-name.middle-name' },
        { label: 'First Name', key: 'full-name.first-name' },
      ],
      unicode: [],
    };
  }
  created() {
    const getConfig = {
      headers: authHeader('application/json'),
      useCredentails: true,
    };
    store.commit('SET_URL', {
      url: config.Url() + this.$data.URL,
      method: 'get',
    });
    return axios
      .get(config.Url() + this.$data.URL, getConfig)
      .then((response: any) => {
        store.commit('SET_STATUS', 'OK');
        store.commit('SET_RESPONSE', JSON.stringify(response));
        this.$data.unicode = response.data.Records;
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
