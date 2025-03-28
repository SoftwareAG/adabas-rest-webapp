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
    <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#modal-createjob">
      Create RESTful server job
    </button>

    <div class="modal fade" id="modal-createjob" tabindex="-1" aria-labelledby="modal-createjob-label" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modal-createjob-label">Create job</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="my-4">Please provide job parameters</p>
            <div class="card bg-light">
              <form ref="jobForm" @submit.stop.prevent="handleSubmit">
                <div class="mb-3 row">
                  <label for="nested-jobname" class="col-sm-3 col-form-label text-end">Job name:</label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control" id="nested-jobname" v-model="newJob.Job.Name" required>
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="nested-utility" class="col-sm-3 col-form-label text-end">Job Utility:</label>
                  <div class="col-sm-9">
                    <select class="form-select mt-3" id="nested-utility" v-model="newJob.Job.Utility">
                      <option v-for="utility in utilities" :key="utility" :value="utility">{{ utility }}</option>
                    </select>
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="nested-user" class="col-sm-3 col-form-label text-end">Job User:</label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control" id="nested-user" v-model="newJob.Job.User" disabled>
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="nested-description" class="col-sm-3 col-form-label text-end">Job Description:</label>
                  <div class="col-sm-9">
                    <input type="text" class="form-control" id="nested-description" v-model="newJob.Job.Description">
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="nested-parameters" class="col-sm-3 col-form-label text-end">Job Parameters:</label>
                  <div class="col-sm-9">
                    <table class="table">
                      <thead>
                        <tr>
                          <th>Parameter</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(parameter, index) in newJob.Job.Parameters" :key="index">
                          <td>{{ parameter.Parameter }}</td>
                          <td>
                            <button type="button" class="btn btn-danger" @click="removeParameter(index)">Remove</button>
                            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-parameter" @click="editParameter(index)">Edit</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <button type="button" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#modal-parameter" @click="prepareParameter">Add</button>
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="nested-environment" class="col-sm-3 col-form-label text-end">Job Environment:</label>
                  <div class="col-sm-9">
                    <table class="table">
                      <thead>
                        <tr>
                          <th>Parameter</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(environment, index) in newJob.Job.Environments" :key="index">
                          <td>{{ environment.Parameter }}</td>
                          <td>
                            <button type="button" class="btn btn-danger" @click="removeEnvironment(index)">Remove</button>
                            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-parameter" @click="editEnvironment(index)">Edit</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <button type="button" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#modal-parameter" @click="prepareEnvironment">Add</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="insertJobInServer">Save changes</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="modal-parameter" tabindex="-1" aria-labelledby="modal-parameter-label" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modal-parameter-label">{{ operation + ' ' + editable }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form ref="form">
              <div class="mb-3">
                <label for="name-input" class="form-label">{{ description }}</label>
                <input type="text" class="form-control" id="name-input" v-model="parameter" :class="{'is-invalid': !nameState}" required>
                <div class="invalid-feedback">Name is required</div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="handleOk">Save changes</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { userService } from "../user/service";
import { insertJob } from "../adabas/jobs";

export default defineComponent({
  props: {
    msg: {
      type: String,
      required: true,
    },
  },
  setup() {
    const newJob = ref({
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
    });
    const newSavedJob = ref(null);
    const editable = ref("Parameter");
    const operation = ref("Add");
    const description = ref("xxx");
    const parameterDescription = ref("The parameter for the Adabas utility");
    const environmentDescription = ref("The environment defined with {VAR}={VALUE} for the Adabas utility");
    const parameter = ref("");
    const parameterEditIndex = ref(-1);
    const nameState = ref(null);
    const submittedNames = ref([]);
    const paraFields = ref(["Parameter", "action"]);
    const envFields = ref(["Parameter", "action"]);
    const utilities = ref([
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
    ]);

    onMounted(() => {
      newJob.value.Job.User = userService.getUsername();
      newSavedJob.value = newJob.value;
      this.$root.$on("editJob", (data: any) => {
        newJob.value = data;
      });
    });

    const removeParameter = (parameter: number) => {
      newJob.value.Job.Parameters.splice(parameter, 1);
    };

    const editParameter = (parameter: number) => {
      console.log("Edit " + parameter);
      parameterEditIndex.value = parameter;
      parameter.value = newJob.value.Job.Parameters[parameter].Parameter;
      editable.value = "Parameter";
      operation.value = "Edit";
      description.value = parameterDescription.value;
    };

    const prepareParameter = () => {
      editable.value = "Parameter";
      operation.value = "Add";
      description.value = parameterDescription.value;
    };

    const prepareEnvironment = () => {
      editable.value = "Environment";
      operation.value = "Add";
      description.value = environmentDescription.value;
    };

    const handleOk = (bvModalEvt: any) => {
      if (operation.value === "Edit") {
        if (editable.value === "Environment") {
          newJob.value.Job.Environments[parameterEditIndex.value].Parameter = parameter.value;
        } else {
          newJob.value.Job.Parameters[parameterEditIndex.value].Parameter = parameter.value;
        }
      } else {
        if (editable.value === "Environment") {
          console.log("Add environment " + parameter.value);
          newJob.value.Job.Environments.push({
            Parameter: parameter.value,
          });
        } else {
          newJob.value.Job.Parameters.push({
            Parameter: parameter.value,
          });
        }
      }
    };

    const checkFormValidity = (): boolean => {
      const valid = (this.$refs.jobForm as Vue & {
        checkValidity: () => boolean;
      }).checkValidity();
      return valid;
    };

    const insertJobInServer = (bvModalEvt: any) => {
      bvModalEvt.preventDefault();
      handleSubmit();
    };

    const handleSubmit = () => {
      if (!checkFormValidity()) {
        return;
      }
      console.log("Insert job");
      insertJob(newJob.value);
      this.$nextTick(() => {
        this.$bvModal.hide("modal-createjob");
      });
    };

    const resetModal = () => {
      parameter.value = "";
      nameState.value = null;
    };

    return {
      newJob,
      newSavedJob,
      editable,
      operation,
      description,
      parameterDescription,
      environmentDescription,
      parameter,
      parameterEditIndex,
      nameState,
      submittedNames,
      paraFields,
      envFields,
      utilities,
      removeParameter,
      editParameter,
      prepareParameter,
      prepareEnvironment,
      handleOk,
      checkFormValidity,
      insertJobInServer,
      handleSubmit,
      resetModal,
    };
  },
});
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
