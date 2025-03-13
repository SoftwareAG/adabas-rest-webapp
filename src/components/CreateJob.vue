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
  <div class="createjob">
    <b-button variant="success" v-b-modal.modal-createjob
      >Create RESTful server job</b-button
    >

    <b-modal
      @ok="insertJobInServer"
      id="modal-createjob"
      size="xl"
      title="Create job"
    >
      <p class="my-4">Please provide job parameters</p>
      <b-card bg-variant="light">
        <form ref="jobForm" @submit.stop.prevent="handleSubmit">
          <b-form-group
            label-cols-lg="3"
            label="Job information"
            label-size="lg"
            label-class="font-weight-bold pt-0"
            class="mb-0"
          >
            <b-form-group
              label-cols-sm="3"
              label="Job name:"
              label-align-sm="right"
              label-for="nested-jobname"
              invalid-feedback="Name is required"
            >
              <b-form-input
                v-model="newJob.Job.Name"
                id="nested-jobname"
                required
              ></b-form-input>
            </b-form-group>
            <b-form-group
              label-cols-sm="3"
              label="Job Utility:"
              label-align-sm="right"
              label-for="nested-utility"
            >
              <b-form-select
                v-model="newJob.Job.Utility"
                :options="utilities"
                id="nested-utility"
                size="sm"
                class="mt-3"
              ></b-form-select>
            </b-form-group>
            <b-form-group
              label-cols-sm="3"
              label="Job User:"
              label-align-sm="right"
              label-for="nested-user"
            >
              <b-form-input
                v-model="newJob.Job.User"
                id="nested-user"
                disabled="true"
              ></b-form-input>
            </b-form-group>
            <b-form-group
              label-cols-sm="3"
              label="Job Description:"
              label-align-sm="right"
              label-for="nested-description"
            >
              <b-form-input
                v-model="newJob.Job.Description"
                id="nested-description"
              ></b-form-input>
            </b-form-group>
            <b-form-group
              label-cols-sm="3"
              label="Job Parameters:"
              label-align-sm="right"
              label-for="nested-parameters"
            >
              <b-table :items="newJob.Job.Parameters" :fields="paraFields">
                <template v-slot:head(action)>
                  <b-button
                    v-on:click="prepareParameter"
                    v-b-modal.modal-parameter
                    >Add</b-button
                  >
                </template>
                <template v-slot:cell(action)="row">
                  <b-button v-on:click="removeParameter(row.index)"
                    >Remove</b-button
                  >
                  <b-button
                    v-on:click="editParameter(row.index)"
                    v-b-modal.modal-parameter
                    >Edit</b-button
                  >
                </template>
              </b-table>
              <b-modal
                id="modal-parameter"
                ref="modal"
                :title="operation + ' ' + editable"
                @show="resetModal"
                @hidden="resetModal"
                @ok="handleOk"
              >
                <form ref="form">
                  <b-form-group
                    :state="nameState"
                    :label="description"
                    label-for="name-input"
                    invalid-feedback="Name is required"
                  >
                    <b-form-input
                      id="name-input"
                      v-model="parameter"
                      :state="nameState"
                      required
                    ></b-form-input>
                  </b-form-group>
                </form>
              </b-modal>
            </b-form-group>
            <b-form-group
              label-cols-sm="3"
              label="Job Environment:"
              label-align-sm="right"
              label-for="nested-environment"
            >
              <b-table
                :items="newJob.Job.Environments"
                :fields="envFields"
                responsive="sm"
              >
                <template v-slot:head(action)>
                  <b-button
                    v-on:click="prepareEnvironment"
                    v-b-modal.modal-parameter
                    >Add</b-button
                  >
                </template>
              </b-table>
            </b-form-group>
          </b-form-group>
        </form>
      </b-card>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import { userService } from "../user/service";
import { insertJob } from "../adabas/jobs";

@Component
export default class CreateJob extends Vue {
  @Prop() private msg!: string;
  data() {
    return {
      newJob: {
        Job: {
          User: "",
          Name: "",
          Description: "Job Description",
          Utility: "ADAOPR",
          Scripts: "",
          Parameters: [{ Parameter: "db=24" }, { Parameter: "disp=cq" }],
          Environments: [],
          CronScheduler: "(null)",
        },
      },
      newSavedJob: null,
      editable: "Parameter",
      operation: "Add",
      description: "xxx",
      parameterDescription: "The parameter for the Adabas utility",
      environmentDescription:
        "The environment defined with {VAR}={VALUE} for the Adabas utility",
      parameter: "",
      parameterEditIndex: -1,
      nameState: null,
      submittedNames: [],
      paraFields: ["Parameter", "action"],
      envFields: ["Parameter", "action"],
      utilities: [
        "ADABCK",
        "ADACMP",
        "ADADBM",
        "ADADCU",
        "ADAFDU",
        "ADAFIN",
        "ADAFRM",
        "ADAMUP",
        "ADAOPR",
        "ADAORD",
        "ADAREP",
        "ADAULD",
      ],
    };
  }
  created() {
    this.$data.newJob.Job.User = userService.getUsername();
    this.$data.newSavedJob = this.$data.newJob;
    this.$root.$on("editJob", (data: any) => {
      this.$data.newJob = data;
    });

  }
  removeParameter(parameter: number): void {
    this.$data.newJob.Job.Parameters.splice(parameter, 1);
  }
  editParameter(parameter: number): void {
    console.log("Edit " + parameter);
    this.$data.parameterEditIndex = parameter;
    this.$data.parameter = this.$data.newJob.Job.Parameters[
      parameter
    ].Parameter;
    this.$data.editable = "Parameter";
    this.$data.operation = "Edit";
    this.$data.description = this.$data.parameterDescription;
  }
  prepareParameter(): void {
    this.$data.editable = "Parameter";
    this.$data.operation = "Add";
    this.$data.description = this.$data.parameterDescription;
  }
  prepareEnvironment(): void {
    this.$data.editable = "Environment";
    this.$data.operation = "Add";
    this.$data.description = this.$data.environmentDescription;
  }
  handleOk(bvModalEvt: any): void {
    if (this.$data.operation === "Edit") {
      if (this.$data.editable === "Environment") {
        this.$data.newJob.Job.Environments[
          this.$data.parameterEditIndex
        ].Parameter = this.$data.parameter;
      } else {
        this.$data.newJob.Job.Parameters[
          this.$data.parameterEditIndex
        ].Parameter = this.$data.parameter;
      }
    } else {
      if (this.$data.editable === "Environment") {
        console.log("Add environment " + this.$data.parameter);
        this.$data.newJob.Job.Environments.push({
          Parameter: this.$data.parameter,
        });
      } else {
        this.$data.newJob.Job.Parameters.push({
          Parameter: this.$data.parameter,
        });
      }
    }
  }
  checkFormValidity(): boolean {
    //const valid = this.$refs.jobForm.checkValidity()
    const valid = (this.$refs.jobForm as Vue & {
      checkValidity: () => boolean;
    }).checkValidity();
    return valid;
  }
  insertJobInServer(bvModalEvt: any): void {
    // Prevent modal from closing
    bvModalEvt.preventDefault();
    // Trigger submit handler
    this.handleSubmit();
  }
  handleSubmit(): void {
    // Exit when the form isn't valid
    if (!this.checkFormValidity()) {
      return;
    }
    console.log("Insert job");
    insertJob(this.$data.newJob);
    // Hide the modal manually
    this.$nextTick(() => {
      this.$bvModal.hide("modal-createjob");
    });
  }
  resetModal(): void {
    this.$data.name = "";
    this.$data.nameState = null;
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
