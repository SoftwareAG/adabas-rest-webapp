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
    <div class="card">
      <div class="card-header h5">{{title}}</div>
      <div class="card-body">
        <p>
          This application provides access to Adabas data using the Adabas
          RESTful administration and the Adabas Map technology defined and being
          used in Adabas Client for Java.
        </p>
        <p>
          {{infoText}}
          </p>
           <Url :url="xURL" />
        <b-pagination
          v-model="currentPage"
          :total-rows="records.length"
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
          :items="records"
          :fields="fields"
        >
        </b-table>
      </div>
    </div>
     <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { authHeader } from "../user/auth-header";
import { config } from "../store/config";
import { userService } from "../user/service";
import store from "../store/index";
import MyHeader from "@/components/Header.vue";
import StatusBar from "@/components/StatusBar.vue";
import Url from "@/components/Url.vue";
import axios from "axios";

@Component({
  components: {
    MyHeader,
    Url,
    StatusBar,
  },
})
export default class GenericExample extends Vue {
  @Prop() private URL!: string;
  @Prop() private text!: string;
  @Prop() private title!: string;
  data() {
    return {
      perPage: 10,
      currentPage: 1,
      xURL: this.URL,
      infoText: this.text,
      fields: [] as any[],
      records: [],
    };
  }
  created() {
    const getConfig = {
      headers: authHeader("application/json"),
      useCredentails: true,
    };
    store.commit('SET_URL',{url: config.Url() + this.$data.xURL,method: "get"});
    return axios
      .get(config.Url() + this.$data.xURL, getConfig)
      .then((response: any) => {
        store.commit("SET_STATUS", "OK");
        this.$data.records = response.data.Records;
        this.adaptFields();
      })
      .catch((error: any) => {
        console.log("ERROR: " + JSON.stringify(error));
        if (error.response) {
          store.commit("SET_STATUS", JSON.stringify(error.response));
          if (error.response.status == 401 || error.response.status == 403) {
            userService.logout();
            location.reload(true);
          }
        } else {
          store.commit("SET_STATUS", JSON.stringify(error));
        }
        throw error;
      });
  }
  adaptFields() {
    const fs = [];
    /* Adapt and parse received data */
    if (this.$data.records && this.$data.records.length > 0) {
      for (const x in this.$data.records[0]) {
        fs.push(x);
      }
    }
    this.$data.fields = fs;
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
a {
  color: #42b983;
}
</style>
