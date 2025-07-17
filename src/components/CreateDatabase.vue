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
  <div class="createdatabase p-2" overflow-y="auto">
    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modal-1">
      Create Adabas database
    </button>

    <div class="modal fade" id="modal-1" tabindex="-1" aria-labelledby="modal-1-label" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modal-1-label">Create Adabas database</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="my-4">Please provide database parameters</p>
            <div class="card bg-light">
              <div class="card-body">
                <h5 class="mb-3 font-weight-bold">Adabas Database Parameters</h5>
                <div class="mb-3 row">
                  <label for="nested-dbid" class="col-sm-4 col-form-label text-end">Database ID (dbid):</label>
                  <div class="col-sm-8">
                    <input type="number" class="form-control" id="nested-dbid" v-model.number="DbidtoCreate">
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="nested-name" class="col-sm-4 col-form-label text-end">Name:</label>
                  <div class="col-sm-8">
                    <input type="text" class="form-control" id="nested-name" v-model="createDatabase.Name">
                  </div>
                </div>
                <div class="mb-3 row">
                  <label class="col-sm-4 col-form-label text-end">Create Job:</label>
                  <div class="col-sm-8">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="checkbox-job" v-model="useJob">
                      <label class="form-check-label" for="checkbox-job">Create database creation job (needs extra start)</label>
                    </div>
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="nested-checkpoint" class="col-sm-4 col-form-label text-end">Checkpoint File:</label>
                  <div class="col-sm-8">
                    <input type="number" class="form-control" id="nested-checkpoint" v-model.number="createDatabase.CheckpointFile">
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="nested-security" class="col-sm-4 col-form-label text-end">Security File:</label>
                  <div class="col-sm-8">
                    <input type="number" class="form-control" id="nested-security" v-model.number="createDatabase.SecurityFile">
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="nested-user" class="col-sm-4 col-form-label text-end">User File:</label>
                  <div class="col-sm-8">
                    <input type="number" class="form-control" id="nested-user" v-model.number="createDatabase.UserFile">
                  </div>
                </div>
                <!-- Container Paths -->
                <template v-for="(label, index) in ['ASSO1', 'ASSO2', 'DATA1', 'WORK1']" :key="index">
                  <div class="mb-3 row">
                    <label class="col-sm-4 col-form-label text-end">{{ label }} File:</label>
                    <div class="col-sm-8">
                      <input disabled type="text" class="form-control" :id="'path-' + label" v-model="createDatabase.ContainerList[index].Path">

                      <div class="row mt-2">
                        <div class="col-sm-5">
                          <select class="form-select form-select-sm" v-model="createDatabase.ContainerList[index].BlockSize">
                            <option v-for="option in blockOptions" :key="option" :value="option">{{ option }}</option>
                          </select>
                        </div>
                        <div class="col-sm-7">
                          <input type="text" class="form-control form-control-sm" v-model="createDatabase.ContainerList[index].ContainerSize">
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <div class="mb-3 row">
                  <label class="col-sm-4 col-form-label text-end">Load Examples:</label>
                  <div class="col-sm-8">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="checkbox-loadDemo" v-model="createDatabase.LoadDemo">
                      <label class="form-check-label" for="checkbox-loadDemo">Include demo data</label>
                    </div>
                  </div>
                </div>
                <!-- Success and Error Message Section -->
                <div v-if="successMessage || errorMessage" class="mt-4">
                  <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
                    {{ successMessage }}
                    <button type="button" class="btn-close" @click="successMessage = ''" aria-label="Close"></button>
                  </div>
                  <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
                    {{ errorMessage }}
                    <button type="button" class="btn-close" @click="errorMessage = ''" aria-label="Close"></button>
                  </div>
                </div>
              </div>
            </div>
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
import { defineComponent, ref, onMounted, watch } from "vue";
import axios from "axios";
import { config } from "../store/config";
import { authHeader } from "../user/auth-header";
import { insertJob } from "../adabas/jobs";
import { userService } from "../user/service";

export default defineComponent({
  props: {
    msg: {
      type: String,
      required: true,
    },
  },
  setup() {
    const successMessage = ref('');
    const errorMessage = ref('');
    const DbidtoCreate = ref(75)
    const adadatadir = ref('')
    const environmentDetails = ref({
      ADAPROGDIR: '',
      SAG: '',
      StructureLevel: 0,
      Version: ''
    })
    const useJob = ref(false);
    const createDatabase = ref({
      CheckpointFile: 1,
      SecurityFile: 2,
      UserFile: 3,
      ContainerList: [
        {
          BlockSize: "8K",
          ContainerSize: "20M",
          Path: "",
        },
        {
          BlockSize: "32K",
          ContainerSize: "20M",
          Path: "",
        },
        {
          BlockSize: "32K",
          ContainerSize: "20M",
          Path: "",
        },
        {
          BlockSize: "16K",
          ContainerSize: "20M",
          Path: "",
        },
      ],
      Dbid: 75 as string,
      LoadDemo: true,
      Name: "DEMODB",
    });
    const createJob = ref({
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
    });
    const blockOptions = ref(["2K", "4K", "8K", "16K", "32K"]);

    onMounted(async () => {
      await getEnv();
      updateCreateDatabase();
      createJob.value.Job.User = userService.getUsername();
      createJob.value.Job.Name = "CreateJob-" + new Date().getTime();
    });

    // Watch for changes on DbidtoCreate
    watch(DbidtoCreate, (newVal) => {
      createDatabase.value.Dbid = newVal.toString();
      updateCreateDatabase();
    })

    const updateCreateDatabase = () => {
      let db = '';
      let basePath = "";

      if (createDatabase.value.Dbid < 100) {
        db = String(createDatabase.value.Dbid).padStart(3, '0');
      } else {
        db = String(createDatabase.value.Dbid);
      }
      basePath = adadatadir.value + "\\db" + db + "\\";
      createDatabase.value.ContainerList.forEach((container, index) => {
        switch (index) {
          case 0:
            container.Path = basePath + "ASSO1." + db;
            break;
          case 1:
            container.Path = basePath + "ASSO2." + db;
            break;
          case 2:
            container.Path = basePath + "DATA1." + db;
            break;
          case 3:
            container.Path = basePath + "WORK1." + db;
            break;
          default:
            container.Path = ''; // or handle additional containers as needed
        }
      });
      return;
    }

    const getEnv = async () => {
      const getConfig = {
          headers: authHeader("application/json"),
          useCredentails: true,
      };
      try {
        const response = await axios.get(config.Url() + "/adabas/env",getConfig);
        const env = response.data.Environment
        adadatadir.value = env.ADADATADIR

        if (env.EnvironmentList && env.EnvironmentList.length > 0) {
          const envItem = env.EnvironmentList[0]
          environmentDetails.value = {
            ADAPROGDIR: envItem.ADAPROGDIR,
            SAG: envItem.SAG,
            StructureLevel: envItem.StructureLevel,
            Version: envItem.Version
          }
        }
        return;
      }
      catch (error: any) {
        if (error.response) {
            if (error.response.status == 401 || error.response.status == 403) {
                //userService.logout();
                //location.reload();
            }
        }
        throw error;
      }
    };

    const handleOk = (bvModalEvt: any) => {
      if (useJob.value) {
        createDatabaseJob();
      } else {
        createDatabaseAPI();
      }
    };

    const createDatabaseAPI = async() => {
      createDatabase.value.Dbid = String(createDatabase.value.Dbid);
      const getConfig = {
        headers: authHeader("application/json"),
      };
      try {
        const response = await axios.post(
          config.Url() + "/adabas/database",
          createDatabase.value,
          getConfig
        );
        successMessage.value = `Database ${createDatabase.value.Dbid} created successfully!`;
        errorMessage.value = '';
      } catch (error) {
        successMessage.value = '';
        errorMessage.value = error.response?.data?.Error?.message || 'An error occurred while creating the database.';
      }
    };

    const changeUseJob = () => {
      console.log("Change use job " + useJob.value);
    };

    const createDatabaseJob = () => {
      createJob.value.Job.Parameters = [];
      createJob.value.Job.Parameters.push({
        Parameter: "dbid=" + createDatabase.value.Dbid,
      });
      createJob.value.Job.Parameters.push({
        Parameter: "name=" + createDatabase.value.Name,
      });
      createJob.value.Job.Parameters.push({
        Parameter:
          "sysfiles=(" +
          createDatabase.value.CheckpointFile +
          "," +
          createDatabase.value.SecurityFile +
          "," +
          createDatabase.value.UserFile +
          ")",
      });
      createJob.value.Job.Parameters.push({
        Parameter:
          "assosize=(" +
          createDatabase.value.ContainerList[0].ContainerSize +
          "," +
          createDatabase.value.ContainerList[1].ContainerSize +
          ")",
      });
      createJob.value.Job.Parameters.push({
        Parameter:
          "assoblock=(" +
          createDatabase.value.ContainerList[0].BlockSize +
          "," +
          createDatabase.value.ContainerList[1].BlockSize +
          ")",
      });
      createJob.value.Job.Parameters.push({
        Parameter:
          "datasize=" + createDatabase.value.ContainerList[2].ContainerSize,
      });
      createJob.value.Job.Parameters.push({
        Parameter:
          "datablock=" + createDatabase.value.ContainerList[2].BlockSize,
      });
      createJob.value.Job.Parameters.push({
        Parameter:
          "worksize=" + createDatabase.value.ContainerList[3].ContainerSize,
      });
      createJob.value.Job.Parameters.push({
        Parameter:
          "workblock=" + createDatabase.value.ContainerList[3].BlockSize,
      });
      createJob.value.Job.Environments = [];
      //  createJob.value.Job.Environments.push({
      //   Parameter: "ASSO1=" + replaceValue(createDatabase.value.ContainerList[0].Path),
      // });
      // createJob.value.Job.Environments.push({
      //   Parameter: "ASSO2=" + replaceValue(createDatabase.value.ContainerList[1].Path),
      // });
      // createJob.value.Job.Environments.push({
      //   Parameter: "DATA1=" + replaceValue(createDatabase.value.ContainerList[2].Path),
      // });
      // createJob.value.Job.Environments.push({
      //   Parameter: "WORK1=" + replaceValue(createDatabase.value.ContainerList[3].Path),
      // });
      insertJob(createJob.value);
    };

    const replaceValue = (str: string): string => {
      const regex = /\$\{([^$]*)\}/gm;
      let m;
      let newstr = str;
      while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        if (m[1] === "DBID") {
          let d = String(createDatabase.value.Dbid).padStart(3, "0");
          newstr = newstr.replace(m[0], d);
        }
      }
      return newstr;
    };

    return {
      useJob,
      createDatabase,
      createJob,
      blockOptions,
      handleOk,
      createDatabaseAPI,
      changeUseJob,
      createDatabaseJob,
      replaceValue,
      environmentDetails,
      adadatadir,
      DbidtoCreate,
      errorMessage,
      successMessage,
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
