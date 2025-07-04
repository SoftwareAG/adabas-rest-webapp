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
  <div class="joblist p-2" style="overflow-y: auto">
    <div class="card border-secondary mb-3">
      <div class="card-header">Create New Job</div>
      <div class="card-body">
        <p>
        </p>
        <div class="row mb-2">
          <div class="col">
            <a class="btn btn-success" href="/#/jobs">
              Back
            </a>
          </div>
        </div>
       <!-- Create Job Modal -->
        <div id="modal-createjob" tabindex="-1" aria-labelledby="modal-createjob-label">
          <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title fw-bold" id="modal-createjob-label">Create RESTful Server Job</h5>
              </div>
        
              <div class="modal-body">
                <p class="mb-4 text-muted">Please provide job parameters below. All fields marked with <span class="text-danger">*</span> are required.</p>
        
                <form ref="jobForm" @submit.prevent="handleSubmit">
                  <!-- Job Info Section -->
                  <div class="mb-4">
                    <h6 class="text-primary fw-semibold mb-3">Job Information</h6>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label">Job Name <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" v-model="newJob.Job.Name" required />
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Job Utility <span class="text-danger">*</span></label>
                        <select class="form-select" v-model="newJob.Job.Utility" required>
                          <option v-for="utility in utilities" :key="utility" :value="utility">{{ utility }}</option>
                        </select>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Job User</label>
                        <input type="text" class="form-control" v-model="newJob.Job.User" disabled />
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Description</label>
                        <input type="text" class="form-control" v-model="newJob.Job.Description" />
                      </div>
                    </div>
                  </div>
        
                  <!-- Parameters Section -->
                  <div class="mb-4">
                    <h6 class="text-primary fw-semibold mb-3">Job Parameters</h6>
                    <table class="table table-bordered table-sm align-middle">
                      <thead class="table-light">
                        <tr>
                          <th>Parameter</th>
                          <th style="width: 140px;">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(parameter, index) in newJob.Job.Parameters" :key="index">
                          <td>{{ parameter.Parameter }}</td>
                          <td>
                            <div class="d-flex gap-2">
                              <button type="button" class="btn btn-danger btn-sm" @click="removeParameter(index)">Remove</button>
                              <button type="button" class="btn btn-primary btn-sm" @click="editParameter(index)" data-bs-toggle="modal" data-bs-target="#modal-parameter">Edit</button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <button type="button" class="btn btn-success btn-sm" @click="prepareParameter" data-bs-toggle="modal" data-bs-target="#modal-parameter">Add Parameter</button>
                  </div>
        
                  <!-- Environment Section -->
                  <div class="mb-4">
                    <h6 class="text-primary fw-semibold mb-3">Job Environment</h6>
                    <table class="table table-bordered table-sm align-middle">
                      <thead class="table-light">
                        <tr>
                          <th>Environment</th>
                          <th style="width: 140px;">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(env, index) in newJob.Job.Environments" :key="index">
                          <td>{{ env.Parameter }}</td>
                          <td>
                            <div class="d-flex gap-2">
                              <button type="button" class="btn btn-danger btn-sm" @click="removeEnvironment(index)">Remove</button>
                              <button type="button" class="btn btn-primary btn-sm" @click="editEnvironment(index)" data-bs-toggle="modal" data-bs-target="#modal-parameter">Edit</button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <button type="button" class="btn btn-success btn-sm" @click="prepareEnvironment" data-bs-toggle="modal" data-bs-target="#modal-parameter">Add Environment</button>
                  </div>
                </form>
              </div>
        
              <div class="modal-footer">
                <a class="btn btn-outline-secondary" href="/#/jobs">Cancel</a>
                <button type="button" class="btn btn-primary" @click="handleSubmit">Save Job</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal -->
    <!-- Parameter Modal -->
    <div class="modal fade" id="modal-parameter" tabindex="-1" aria-labelledby="modal-parameter-label" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-sm"> <!-- Centered & smaller modal -->
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modal-parameter-label">
              {{ operation }} {{ editable }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body">
            <div class="mb-3">
              <label for="parameterInput" class="form-label">
                Enter {{ editable }}
              </label>
              <input
                type="text"
                id="parameterInput"
                class="form-control"
                v-model="parameter"
                required
                placeholder="e.g., db=24 or DISP=CQ"
              />
            </div>
          </div>

          <div class="modal-footer d-flex justify-content-between">
            <button type="button" class="btn btn-outline-secondary w-25" data-bs-dismiss="modal">
              Close
            </button>
            <button type="button" class="btn btn-primary w-25" data-bs-dismiss="modal" @click="handleOk">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { insertJob } from '../adabas/jobs';
import { userService } from '../user/service';
import { Modal } from 'bootstrap';
import StatusBar from '@/components/StatusBar.vue';
import { useRouter } from "vue-router";

export default defineComponent({
  components: { StatusBar},
  setup() {
    const router = useRouter();
    const newJob = ref({
      Job: {
        User: '',
        Name: '',
        Description: 'Job Description',
        Utility: 'ADAOPR',
        Scripts: '',
        Parameters: [{ Parameter: 'db=24' }, { Parameter: 'disp=cq' }],
        Environments: [],
        CronScheduler: '(null)',
      },
    });

    const utilities = ref([
      'ADABCK', 'ADACMP', 'ADADBM', 'ADADCU', 'ADAFDU', 'ADAFIN',
      'ADAFRM', 'ADAMUP', 'ADAOPR', 'ADAORD', 'ADAREP', 'ADAULD'
    ]);

    const parameter = ref('');
    const editable = ref('Parameter');
    const operation = ref('Add');
    const parameterEditIndex = ref(-1);

    onMounted(() => {
      newJob.value.Job.User = userService.getUsername();
    });

    const removeParameter = (index: number) => {
      newJob.value.Job.Parameters.splice(index, 1);
    };

    const editParameter = (index: number) => {
      operation.value = 'Edit';
      editable.value = 'Parameter';
      parameter.value = newJob.value.Job.Parameters[index].Parameter;
      parameterEditIndex.value = index;
    };

    const prepareParameter = () => {
      operation.value = 'Add';
      editable.value = 'Parameter';
      parameter.value = '';
      parameterEditIndex.value = -1;
    };

    const handleOk = () => {
      const index = parameterEditIndex.value;
      const value = parameter.value;
    
      if (editable.value === 'Parameter') {
        if (index >= 0) {
          newJob.value.Job.Parameters[index].Parameter = value;
        } else {
          newJob.value.Job.Parameters.push({ Parameter: value });
        }
      } else if (editable.value === 'Environment') {
        if (index >= 0) {
          newJob.value.Job.Environments[index].Parameter = value;
        } else {
          newJob.value.Job.Environments.push({ Parameter: value });
        }
      }
    
      // Clear index and value after save
      parameterEditIndex.value = -1;
      parameter.value = '';
    };



    const removeEnvironment = (index: number) => {
      newJob.value.Job.Environments.splice(index, 1);
    };

    const editEnvironment = (index: number) => {
      operation.value = 'Edit';
      editable.value = 'Environment';
      parameter.value = newJob.value.Job.Environments[index].Parameter;
      parameterEditIndex.value = index;
    };

    const prepareEnvironment = () => {
      operation.value = 'Add';
      editable.value = 'Environment';
      parameter.value = '';
      parameterEditIndex.value = -1;
    };

    const handleSubmit = () => {
      insertJob(newJob.value);
      router.push({ path: "/jobs"});
    };

    return {
      newJob,
      utilities,
      parameter,
      editable,
      operation,
      parameterEditIndex,
      removeParameter,
      editParameter,
      prepareParameter,
      handleOk,
      removeEnvironment,
      editEnvironment,
      prepareEnvironment,
      handleSubmit,
      StatusBar,
    };
  },
});
</script>

<style scoped lang="scss">
.createjob {
  padding: 1rem;
}

.modal-content {
  overflow-x: hidden;
}

.modal-body {
  overflow-x: hidden;
  padding-right: 1rem;
  padding-left: 1rem;
}
</style>
