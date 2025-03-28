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
    <Sidebar :url="url" />
    <div class="card border-secondary mb-3">
      <div class="card-header border-secondary">
        Checkpoint List of Adabas database {{ url }}
      </div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row">
            <div class="col">
              This page provides the list of Adabas database checkpoint to
              be administrate through this Adabas RESTful server.
            </div>
          </div>
          <div class="row">
            <div class="col">
              <Url url="/adabas/database" />
            </div>
          </div>
          <div class="row">
            <div class="col text-right">Start data:</div>
            <div class="col">
              <input
                type="date"
                v-model="from"
                class="form-control mb-2"
                :min="min"
                :max="max"
                @change="onContext"
              />
            </div>
            <div class="col">
              <input
                type="time"
                v-model="fromTime"
                class="form-control"
              />
            </div>
          </div>
          <div class="row">
            <div class="col text-right">End data:</div>
            <div class="col">
              <input
                type="date"
                v-model="to"
                class="form-control mb-2"
                :min="min"
                :max="max"
              />
            </div>
            <div class="col">
              <input
                type="time"
                v-model="toTime"
                class="form-control"
              />
            </div>
          </div>
          <div class="row">
            <div class="col text-right">
              <div class="form-group row mb-0">
                <label for="filterInput" class="col-sm-3 col-form-label col-form-label-sm text-right">Filter</label>
                <div class="col-sm-9">
                  <div class="input-group input-group-sm">
                    <input
                      v-model="filter"
                      type="search"
                      id="filterInput"
                      class="form-control"
                      placeholder="Type to Search"
                    />
                    <div class="input-group-append">
                      <button class="btn btn-secondary" :disabled="!filter" @click="filter = ''">Clear</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <table class="table table-striped table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th v-for="field in fields" :key="field">{{ field }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="checkpoint in checkpoints" :key="checkpoint.id">
                    <td v-for="field in fields" :key="field">{{ checkpoint[field] }}</td>
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
import { ref, onMounted, defineComponent } from "vue";
import Sidebar from "./Sidebar.vue";
import StatusBar from '@/components/StatusBar.vue';
import Url from "./Url.vue";
import { SearchDatabases } from "@/adabas/admin";

export default defineComponent({
  name: "CheckpointList",
  components: {
    Sidebar,
   StatusBar,
    Url,
  },
  props: {
    url: String,
  },
  setup(props) {
    const filter = ref("");
    const filterOn = ref(["Details", "Name"]);
    const min = ref(new Date(new Date().setFullYear(new Date().getFullYear() - 2)));
    const max = ref(new Date());
    const from = ref(null);
    const to = ref(null);
    const fromTime = ref(null);
    const toTime = ref(null);
    const fields = ref(["Date", "Details", "Name", "Session"]);
    const checkpoints = ref([]);

    const convertDate = (currentdate: Date): string => {
      return (
        new String(currentdate.getFullYear()).padStart(4, "0") +
        "-" +
        new String(currentdate.getMonth() + 1).padStart(2, "0") +
        "-" +
        new String(currentdate.getDate()).padStart(2, "0")
      );
    };

    const convertTime = (currentdate: Date): string => {
      return (
        new String(currentdate.getHours()).padStart(2, "0") +
        ":" +
        new String(currentdate.getMinutes()).padStart(2, "0") +
        ":" +
        new String(currentdate.getSeconds()).padStart(2, "0")
      );
    };

    const updateCheckpoints = () => {
      let toDate = to.value + "+" + toTime.value;
      let fromDate = from.value + "+" + fromTime.value;
      const db = SearchDatabases(props.url);
      db.checkpoints(fromDate, toDate).then((response: any) => {
        checkpoints.value = response;
      });
    };

    const onContext = (ctx: any) => {
      updateCheckpoints();
    };

    onMounted(() => {
      var currentdate = new Date();
      to.value = convertDate(currentdate);
      toTime.value = convertTime(currentdate);
      currentdate = new Date();
      var day = 60 * 60 * 1000;
      currentdate = new Date(currentdate.getTime() - day);
      from.value = convertDate(currentdate);
      fromTime.value = convertTime(currentdate);
      updateCheckpoints();
    });

    return {
      filter,
      filterOn,
      min,
      max,
      from,
      to,
      fromTime,
      toTime,
      fields,
      checkpoints,
      onContext,
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
