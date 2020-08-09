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
  <div class="checkpointlist p-2">
    <div class="card">
      <div class="card-header h5">Checkpoint List</div>
      <div class="card-body">
        <b-container fluid>
          <b-row>
            <b-col class="font-weight-bold text-center h1">
              Adabas checkpoint list
            </b-col>
          </b-row>
          <b-row
            ><b-col>
              This page provide the list of Adabas database checkpoint list to
              be administrate through this Adabas RESTful server.
            </b-col>
          </b-row>
          <b-row
            ><b-col>
              <Sidebar :url="url" />
            </b-col>
          </b-row>
          <b-row
            ><b-col>
              <Url url="/adabas/database" />
            </b-col>
          </b-row>
          <b-row
            ><b-col class="text-right">Start data:</b-col
            ><b-col>
              <b-form-datepicker
                id="from-datepicker"
                v-model="from"
                class="mb-2"
                :min="min"
                :max="max"
                @context="onContext"
              ></b-form-datepicker> </b-col
            ><b-col>
              <b-form-timepicker
                v-model="fromTime"
                locale="en"
              ></b-form-timepicker> </b-col></b-row
          ><b-row
            ><b-col class="text-right">End data:</b-col
            ><b-col>
              <b-form-datepicker
                id="to-datepicker"
                v-model="to"
                class="mb-2"
                :min="min"
                :max="max"
              ></b-form-datepicker></b-col
            ><b-col>
              <b-form-timepicker
                v-model="toTime"
                locale="en"
              ></b-form-timepicker> </b-col></b-row
          ><b-row
            ><b-col class="text-right">
              <b-form-group
                label="Filter"
                label-cols-sm="3"
                label-align-sm="right"
                label-size="sm"
                label-for="filterInput"
                class="mb-0"
              >
                <b-input-group size="sm">
                  <b-form-input
                    v-model="filter"
                    type="search"
                    id="filterInput"
                    placeholder="Type to Search"
                  ></b-form-input>
                  <b-input-group-append>
                    <b-button :disabled="!filter" @click="filter = ''"
                      >Clear</b-button
                    >
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
            </b-col></b-row
          ><b-row
            ><b-col>
              <b-table
                :filter="filter"
                :filterIncludedFields="filterOn"
                striped
                bordered
                hover
                small
                :items="checkpoints"
                :fields="fields"
              >
              </b-table> </b-col></b-row
        ></b-container>
      </div>
    </div>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Sidebar from "./Sidebar.vue";
import store from "../store/index";
import StatusBar from "./StatusBar.vue";
import Url from "./Url.vue";

@Component({
  components: {
    StatusBar,
    Sidebar,
    Url,
  },
})
export default class CheckpointList extends Vue {
  @Prop(String) readonly url: string | undefined;
  data() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // 15th two months prior
    const minDate = new Date(today);
    minDate.setFullYear(minDate.getFullYear() - 2);
    // 15th in two months
    const maxDate = now;

    return {
      filter: "",
      filterOn: ["Details", "Name"],
      min: minDate,
      max: maxDate,
      from: null,
      to: null,
      fromTime: null,
      toTime: null,
      fields: ["Date", "Details", "Name", "Session"],
      checkpoints: [],
    };
  }
  created() {
    var currentdate = new Date();
    this.$data.to = this.convertDate(currentdate);
    this.$data.toTime = this.convertTime(currentdate);
    currentdate = new Date();
    var day = 60 * 60 * 1000;
    currentdate = new Date(currentdate.getTime() - day);
    this.$data.from = this.convertDate(currentdate);
    this.$data.fromTime = this.convertTime(currentdate);
    this.updateCheckpoints();
  }
  updateCheckpoints(): void {
    let to = this.$data.to + "+" + this.$data.toTime;
    let from = this.$data.from + "+" + this.$data.fromTime;
    const db = store.getters.search(this.url);
    db.checkpoints(from, to).then((response: any) => {
      this.$data.checkpoints = response;
    });
  }
  convertDate(currentdate: Date): string {
    return (
      new String(currentdate.getFullYear()).padStart(4, "0") +
      "-" +
      new String(currentdate.getMonth() + 1).padStart(2, "0") +
      "-" +
      new String(currentdate.getDate()).padStart(2, "0")
    );
  }
  convertTime(currentdate: Date): string {
    return (
      new String(currentdate.getHours()).padStart(2, "0") +
      ":" +
      new String(currentdate.getMinutes()).padStart(2, "0") +
      ":" +
      new String(currentdate.getSeconds()).padStart(2, "0")
    );
  }
  onContext(ctx: any): void {
    this.updateCheckpoints();
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
