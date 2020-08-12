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
  <div class="createdatabase p-2">
    <b-button v-b-modal.modal-1 variant="primary"
      >Create Adabas database</b-button
    >

    <b-modal
      @ok="handleOk"
      id="modal-1"
      size="xl"
      variant="outline-danger"
      title="Create Adabas database"
    >
      <p class="my-4">Please provide database parameters</p>
      <b-card bg-variant="light">
        <b-form-group
          label-cols-lg="3"
          label="Adabas database parameters"
          label-size="lg"
          label-class="font-weight-bold pt-0"
          class="mb-0"
        >
          <b-form-group
            label-cols-sm="3"
            label="Database ID (dbid):"
            label-align-sm="right"
            label-for="nested-dbid"
          >
            <b-form-input
              v-model="createDatabase.Dbid"
              id="nested-dbid"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label-cols-sm="3"
            label="Name:"
            label-align-sm="right"
            label-for="nested-name"
          >
            <b-form-input
              v-model="createDatabase.Name"
              id="nested-name"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label-cols-sm="3"
            label="Create database creation job (need extra start):"
            label-align-sm="right"
            class="mb-0"
          >
            <b-form-checkbox
              id="checkbox-job"
              v-model="useJob"
              name="checkbox-job"
              value="true"
              unchecked-value="false"
            >
            </b-form-checkbox>
          </b-form-group>
          <b-form-group
            label-cols-sm="3"
            label="Checkpoint File:"
            label-align-sm="right"
            label-for="nested-checkpoint"
          >
            <b-form-input
              v-model="createDatabase.CheckpointFile"
              id="nested-checkpoint"
              type="number"
            ></b-form-input>
          </b-form-group>

          <b-form-group
            label-cols-sm="3"
            label="Security File:"
            label-align-sm="right"
            label-for="nested-security"
          >
            <b-form-input
              v-model="createDatabase.SecurityFile"
              id="nested-security"
              type="number"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label-cols-sm="3"
            label="User File:"
            label-align-sm="right"
            label-for="nested-user"
          >
            <b-form-input
              v-model="createDatabase.UserFile"
              id="nested-user"
              type="number"
            ></b-form-input>
          </b-form-group>

          <b-form-group
            label-cols-sm="3"
            label="Associator file (ASSO1):"
            label-align-sm="right"
            label-for="nested-state"
          >
            <b-container fluid class="pl-1">
              <b-row>
                <b-col sm="12">
                  <b-form-input
                    id="type-x"
                    v-model="createDatabase.ContainerList[0].Path"
                    type="text"
                  ></b-form-input>
                </b-col>
              </b-row>
              <b-row>
                <b-col sm="3">
                  <b-form-select
                    v-model="createDatabase.ContainerList[0].BlockSize"
                    size="sm"
                    :options="blockOptions"
                  ></b-form-select>
                </b-col>
                <b-col sm="9">
                  <b-form-input
                    v-model="createDatabase.ContainerList[0].ContainerSize"
                    size="sm"
                  ></b-form-input>
                </b-col>
              </b-row>
            </b-container>
          </b-form-group>
          <b-form-group
            label-cols-sm="3"
            label="Associator file (ASSO2):"
            label-align-sm="right"
            label-for="nested-state"
          >
            <b-container fluid class="pl-1">
              <b-row>
                <b-col sm="12">
                  <b-form-input
                    id="type-x"
                    v-model="createDatabase.ContainerList[1].Path"
                    type="text"
                  ></b-form-input>
                </b-col>
              </b-row>
              <b-row>
                <b-col sm="3">
                  <b-form-select
                    v-model="createDatabase.ContainerList[1].BlockSize"
                    size="sm"
                    :options="blockOptions"
                  ></b-form-select>
                </b-col>
                <b-col sm="9">
                  <b-form-input
                    v-model="createDatabase.ContainerList[1].ContainerSize"
                    size="sm"
                  ></b-form-input>
                </b-col>
              </b-row>
            </b-container>
          </b-form-group>
          <b-form-group
            label-cols-sm="3"
            label="Data file (DATA1):"
            label-align-sm="right"
            label-for="nested-state"
          >
            <b-container fluid class="pl-1">
              <b-row>
                <b-col sm="12">
                  <b-form-input
                    id="type-x"
                    v-model="createDatabase.ContainerList[2].Path"
                    type="text"
                  ></b-form-input>
                </b-col>
              </b-row>
              <b-row>
                <b-col sm="3">
                  <b-form-select
                    v-model="createDatabase.ContainerList[2].BlockSize"
                    size="sm"
                    :options="blockOptions"
                  ></b-form-select>
                </b-col>
                <b-col sm="9">
                  <b-form-input
                    v-model="createDatabase.ContainerList[2].ContainerSize"
                    size="sm"
                  ></b-form-input>
                </b-col>
              </b-row>
            </b-container>
          </b-form-group>
          <b-form-group
            label-cols-sm="3"
            label="Work file (WORK1):"
            label-align-sm="right"
            label-for="nested-state"
          >
            <b-container fluid class="pl-1">
              <b-row>
                <b-col sm="12">
                  <b-form-input
                    id="type-x"
                    v-model="createDatabase.ContainerList[3].Path"
                    type="text"
                  ></b-form-input>
                </b-col>
              </b-row>
              <b-row>
                <b-col sm="3">
                  <b-form-select
                    v-model="createDatabase.ContainerList[3].BlockSize"
                    size="sm"
                    :options="blockOptions"
                  ></b-form-select>
                </b-col>
                <b-col sm="9">
                  <b-form-input
                    v-model="createDatabase.ContainerList[3].ContainerSize"
                    size="sm"
                  ></b-form-input>
                </b-col>
              </b-row>
            </b-container>
          </b-form-group>

          <b-form-group
            label-cols-sm="3"
            label="Load examples:"
            label-align-sm="right"
            class="mb-0"
          >
            <b-form-checkbox
              id="checkbox-loadDemo"
              v-model="createDatabase.LoadDemo"
              name="checkbox-loadDemo"
              value="true"
              unchecked-value="false"
            >
            </b-form-checkbox>
          </b-form-group>
        </b-form-group>
      </b-card>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import axios from "axios";
import { config } from "../store/config";
import { authHeader } from "../user/auth-header";
import { insertJob } from "../adabas/jobs";
import { userService } from "../user/service";

@Component
export default class CreateDatabase extends Vue {
  @Prop() private msg!: string;
  data() {
    return {
      useJob: false,
      createDatabase: {
        CheckpointFile: 1,
        SecurityFile: 2,
        UserFile: 3,
        ContainerList: [
          {
            BlockSize: "8K",
            ContainerSize: "20M",
            Path: "${ADADATADIR}/db${DBID}/ASSO1.${DBID}",
          },
          {
            BlockSize: "32K",
            ContainerSize: "20M",
            Path: "${ADADATADIR}/db${DBID}/ASSO2.${DBID}",
          },
          {
            BlockSize: "32K",
            ContainerSize: "20M",
            Path: "${ADADATADIR}/db${DBID}/DATA1.${DBID}",
          },
          {
            BlockSize: "16K",
            ContainerSize: "20M",
            Path: "${ADADATADIR}/db${DBID}/WORK.${DBID}",
          },
        ],
        Dbid: 75,
        LoadDemo: true,
        Name: "DEMODB",
      },
      createJob: {
        Job: {
          User: "",
          Name: "Create-Job",
          Description: "",
          Utility: "ADAFRM",
          Scripts: "(null)",
          Parameters: [
            { Parameter: "dbid=" },
            { Parameter: "name=" },
            { Parameter: "assosize=(300M,300M)" },
            { Parameter: "assoblock=(4k,16k)" },
            { Parameter: "datasize=800M" },
            { Parameter: "datablock=32k" },
            { Parameter: "worksize=500M" },
          ],
          Environments: [],
          CronScheduler: "(null)",
        },
      },
      blockOptions: ["2K", "4K", "8K", "16K", "32K"],
    };
  }
  created() {
    this.$data.createJob.Job.User = userService.getUsername();
    this.$data.createJob.Job.Name = "CreateJob-" + new Date().getTime();
  }
  handleOk(bvModalEvt: any) {
    if (this.$data.useJob) {
      this.createDatabaseJob();
    } else {
      this.createDatabaseAPI();
    }
  }
  createDatabaseAPI(): void {
    const getConfig = {
      headers: authHeader("application/json"),
    };
    axios
      .post(
        config.Url() + "/adabas/database",
        this.$data.createDatabase,
        getConfig
      )
      .then(function(response) {
        console.log(response);
      })
      .catch(function(error) {
        console.log(
          error.response.statusText + ":" + JSON.stringify(error.response)
        );
      });
  }
  changeUseJob(): void {
    console.log("Change use job "+this.$data.useJob);
  }
  createDatabaseJob(): void {
    this.$data.createJob.Job.Parameters = [];
    this.$data.createJob.Job.Parameters.push({
      Parameter: "dbid=" + this.$data.createDatabase.Dbid,
    });
    this.$data.createJob.Job.Parameters.push({
      Parameter: "name=" + this.$data.createDatabase.Name,
    });
    this.$data.createJob.Job.Parameters.push({
      Parameter:
        "sysfiles=(" +
        this.$data.createDatabase.CheckpointFile +
        "," +
        this.$data.createDatabase.SecurityFile +
        "," +
        this.$data.createDatabase.UserFile +
        ")",
    });
    this.$data.createJob.Job.Parameters.push({
      Parameter:
        "assosize=(" +
        this.$data.createDatabase.ContainerList[0].ContainerSize +
        "," +
        this.$data.createDatabase.ContainerList[1].ContainerSize +
        ")",
    });
    this.$data.createJob.Job.Parameters.push({
      Parameter:
        "assoblock=(" +
        this.$data.createDatabase.ContainerList[0].BlockSize +
        "," +
        this.$data.createDatabase.ContainerList[1].BlockSize +
        ")",
    });
    this.$data.createJob.Job.Parameters.push({
      Parameter:
        "datasize=" + this.$data.createDatabase.ContainerList[2].ContainerSize,
    });
    this.$data.createJob.Job.Parameters.push({
      Parameter:
        "datablock=" + this.$data.createDatabase.ContainerList[2].BlockSize,
    });
    this.$data.createJob.Job.Parameters.push({
      Parameter:
        "worksize=" + this.$data.createDatabase.ContainerList[3].ContainerSize,
    });
    this.$data.createJob.Job.Parameters.push({
      Parameter:
        "workblock=" + this.$data.createDatabase.ContainerList[3].BlockSize,
    });
    this.$data.createJob.Job.Environments = [];
    //  this.$data.createJob.Job.Environments.push({
    //   Parameter: "ASSO1=" + this.replaceValue(this.$data.createDatabase.ContainerList[0].Path),
    // });
    // this.$data.createJob.Job.Environments.push({
    //   Parameter: "ASSO2=" + this.replaceValue(this.$data.createDatabase.ContainerList[1].Path),
    // });
    // this.$data.createJob.Job.Environments.push({
    //   Parameter: "DATA1=" + this.replaceValue(this.$data.createDatabase.ContainerList[2].Path),
    // });
    // this.$data.createJob.Job.Environments.push({
    //   Parameter: "WORK1=" + this.replaceValue(this.$data.createDatabase.ContainerList[3].Path),
    // });
    insertJob(this.$data.createJob);
  }
  replaceValue(str: string): string {
    const regex = /\$\{([^$]*)\}/gm;
    let m;
    let newstr = str;
    while ((m = regex.exec(str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      if (m[1] === "DBID") {
        let d = String(this.$data.createDatabase.Dbid).padStart(3, "0");
        newstr = newstr.replace(m[0], d);
      }
    }
    return newstr;
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
