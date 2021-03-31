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
  <div class="joblist p-2">
    <b-card
      header="Job administration"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <p>
          This page provide access to the list of Adabas RESTful server jobs to
          be administrate through this Adabas RESTful server. These jobs can
          start long running Adabas utility tasks.
        </p>
        <CreateJob msg="ABC" />
        <Url url="/adabas/database" />
        <b-row>
          <b-col sm="6">
            <b-table
              class="w-100 p-3"
              striped
              bordered
              hover
              small
              selectable
              select-mode="single"
              @row-selected="onRowSelected"
              :items="jobs"
              :fields="fields"
            >
              <template v-slot:cell(info)="row">
                <b-button
                  variant="success"
                  v-on:click="startJob(row.item)"
                  class="mr-2"
                  >Start</b-button
                >
                <b-button
                  variant="info"
                  v-on:click="delJob(row.item.status.Job.Name)"
                  class="mr-2"
                  >Delete</b-button
                >
                <b-button
                  variant="info"
                  class="mr-2"
                  v-b-modal="'modal-definition-' + row.item.status.Job.Name"
                  >Show</b-button
                >
                <b-modal
                  size="xl"
                  :id="'modal-definition-' + row.item.status.Job.Name"
                  title="Job definition"
                  ok-only
                >
                  <pre class="my-4">{{ row.item.status.Job }}</pre>
                </b-modal>
                <b-button
                  variant="info"
                  id="expJob"
                  class="mr-2"
                  v-on:click="exportJob(row.item.status.Job.Name)"
                  >Export</b-button
                >
              </template>
            </b-table>
          </b-col>
          <b-col sm="6">
            <b-table
              class="w-100 p-3"
              striped
              bordered
              hover
              small
              selectable
              select-mode="single"
              @row-selected="onExecSelected"
              :items="executions"
              :fields="execFields"
            >
              <template v-slot:cell(log)="row">
                <b-button
                  variant="info"
                  class="mr-2"
                  v-on:click="delExecution(row.item.Id)"
                  >Delete</b-button
                >
              </template>
            </b-table>
          </b-col>
        </b-row>
        <b-row
          ><b-col>
            <b-badge pill variant="secondary">Log Output {{currentId}}:</b-badge>
            <b-alert show variant="secondary">             
              <pre>{{ log }}</pre>
            </b-alert>
          </b-col>
        </b-row>
      </b-card-body>
    </b-card>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { JobAdmin, loadExecutions } from "../adabas/jobs";
import { userService } from "../user/service";
import store from "../store/index";
import CreateJob from "./CreateJob.vue";
import StatusBar from "./StatusBar.vue";
import Url from "./Url.vue";

@Component({
  components: {
    StatusBar,
    CreateJob,
    Url,
  },
})
export default class JobList extends Vue {
  @Prop() private msg!: string;
  data() {
    return {
      selected: null,
      fields: [
        { key: "status.Job.Name", label: "Name" },
        { key: "status.Job.User", label: "User" },
        { key: "status.Job.Utility", label: "Utility" },
        { key: "status.Status", label: "Status" },
        { key: "status.Job.Description", label: "Description" },
        "info",
      ],
      execFields: ["Id", "Scheduled", "Ended", "ExitCode", "log"],
      jobs: [] as JobAdmin[],
      currentId: "",
      executions: [],
      timer: "",
      log: "",
    };
  }
  created(): void {
    this.retrieveJobs();
    this.$data.timer = setInterval(this.retrieveJobs, 5000);
  }
  retrieveJobs(): void {
    store
      .dispatch("SYNC_ADMIN_JOBS")
      .then((response: any) => {
        if (this.$data.selected != null) {
          const name = this.$data.selected.status.Job.Name;
          let x = response.find((j: JobAdmin) => j.name() === name);
          if (!x) {
            return;
          }
          this.$data.selected = x;
          this.$data.executions = this.$data.selected.status.Executions;
        }
        this.$data.jobs = response;
      })
      .catch((error: any) => {
        console.log("ERROR JOBLIST: " + JSON.stringify(error));
        if (error.response) {
          store.commit("SET_STATUS", JSON.stringify(error.response));
          if (error.response.status == 401 || error.response.status == 403) {
            userService.logout();
            location.reload(true);
          }
        } else {
          store.commit("SET_STATUS", JSON.stringify(error));
          userService.logout();
          location.reload(true);
        }
        throw error;
      });
  }
  onRowSelected(items: any): void {
    if (items.length == 0) {
      return;
    }
    this.$data.log = "";
    loadExecutions(items[0].status.Job.Name).then((response: any) => {
      this.$data.executions = [];
      response.forEach((element: any) => {
        this.$data.executions.push(element.JobResult);
      });
    });
    return;
  }
  onExecSelected(items: any): void {
    if (items.length == 0) {
      return;
    }
    this.$data.currentId = items[0].Id;
    this.$data.log = items[0].Log;
  }
  startJob(items: JobAdmin): void {
    items.start();
  }
  delJob(name: string): void {
    const jobToDelete = this.$data.jobs.find(
      (j: JobAdmin) => j.name() === name
    );
    console.log("Job to delete: " + name);
    jobToDelete.delete();
  }
  exportJob(name: string): void {
    const jobToExport = this.$data.jobs.find(
      (j: JobAdmin) => j.name() === name
    );
    console.log(
      "Job to export: " + name + " " + JSON.stringify(jobToExport.status.Job)
    );
  }
  delExecution(id: string): void {
    console.log("Delete id " + id + " of " + this.$data.selected.name());
    this.$data.selected.delete_execution(id);
  }
  showLog(item: any): void {
    console.log("Show log id " + JSON.stringify(item));
    this.$data.currentId = item.ID;
    this.$data.log = item.Log;
  }
  beforeDestroy(): void {
    clearInterval(this.$data.timer);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.joblist {
  font-size: 14px;
}
.card-header {
  font-weight: bold;
  font-size: 18px;
}
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
