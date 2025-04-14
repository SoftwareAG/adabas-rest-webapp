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
  <div class="joblist p-2" overflow-y="auto">
    <div class="card border-secondary mb-3">
      <div class="card-header">Job administration</div>
      <div class="card-body">
        <p>
          This page provides access to the list of Adabas RESTful server jobs to
          be administrate through this Adabas RESTful server. These jobs can
          start long running Adabas utility tasks.
        </p>
        <CreateJob msg="ABC" />
        <Url url="/scheduler/jobs" />
        <div class="row">
          <div class="col-sm-5">
            <nav>
              <ul class="pagination">
                <li class="page-item" v-for="page in totalPages" :key="page">
                  <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
                </li>
              </ul>
            </nav>
          </div>
          <div class="col-sm-1">
            <select v-model="perPage" class="form-select form-select-sm mt-3">
              <option v-for="option in perPageOptions" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-6">
            <table class="table table-striped table-bordered table-hover table-sm">
              <thead>
                <tr>
                  <th v-for="field in fields" :key="field.key">{{ field.label }}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="job in paginatedJobs" :key="job.status.Job.Name" @click="onJobSelected(job)">
                  <td v-for="field in fields" :key="field.key">{{ job[field.key] }}</td>
                  <td>
                    <button class="btn btn-success btn-sm mr-2" @click="startJob(job)">Start</button>
                    <button class="btn btn-outline-primary btn-sm mr-2" @click="delJob(job.status.Job.Name)">Delete</button>
                    <button class="btn btn-outline-primary btn-sm mr-2" @click="viewJob(job.status)">Show</button>
                    <button class="btn btn-outline-primary btn-sm mr-2" @click="exportJob(job.status.Job.Name)">Export</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="col-sm-6">
            <div class="row">
              <div class="col text-left">Start:</div>
              <div class="col text-left">End:</div>
            </div>
            <div class="row">
              <div class="col">
                <input type="date" v-model="from" class="form-control mb-2" :max="max">
              </div>
              <div class="col">
                <input type="date" v-model="to" class="form-control mb-2" :max="max">
              </div>
            </div>
            <div class="row">
              <table class="table table-striped table-bordered table-hover table-sm">
                <thead>
                  <tr>
                    <th v-for="field in execFields" :key="field">{{ field }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="execution in executions" :key="execution.Id" @click="onExecSelected(execution)">
                    <td>{{ convertDateTime(execution.Scheduled) }}</td>
                    <td>{{ convertDateTime(execution.Ended) }}</td>
                    <td>
                      <button class="btn btn-outline-primary btn-sm mr-2" @click="delExecution(execution.Id)">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <span class="badge bg-secondary">Log Output {{ currentId }}:</span>
            <div class="alert alert-secondary">
              <pre>{{ log }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="modal-definition-job" tabindex="-1" aria-labelledby="modal-definition-job-label" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modal-definition-job-label">Job definition {{ currentJob.Name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <pre class="my-4">{{ currentJob }}</pre>
          </div>
        </div>
      </div>
    </div>
        <StatusBar />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import { JobAdmin, loadExecutions, loadJobDefinition } from '../adabas/jobs';
import { userService } from '../user/service';
import store from '../store/index';
import CreateJob from './CreateJob.vue';
import StatusBar from '@/components/StatusBar.vue';
import Url from './Url.vue';

export default defineComponent({
  components: {
    StatusBar,
    CreateJob,
    Url,
  },
  props: {
    msg: String,
  },
  setup() {
    const perPage = ref(10);
    const currentPage = ref(1);
    const perPageOptions = ref([10, 20, 50, 100]);
    const selectedJob = ref(null);
    const selectedExecution = ref(null);
    const fields = ref([
      { key: 'status.Job.Name', label: 'Name' },
      { key: 'status.Job.User', label: 'User' },
      { key: 'status.Job.Utility', label: 'Utility' },
      { key: 'status.Status', label: 'Status' },
      { key: 'status.Job.Description', label: 'Description' },
      'info',
    ]);
    const execFields = ref(['Id', 'Scheduled', 'Ended', 'ExitCode', 'log']);
    const jobs = ref([] as JobAdmin[]);
    const currentId = ref('');
    const executions = ref([]);
    const timer = ref('');
    const max = ref(new Date());
    const log = ref('');
    const from = ref(new Date());
    const to = ref(new Date());
    const currentJob = ref({} as any);

    const retrieveJobs = () => {
      store
        .dispatch('SYNC_ADMIN_JOBS')
        .then((response: any) => {
          if (selectedJob.value != null) {
            const name = selectedJob.value.status.Job.Name;
            let x = response.find((j: JobAdmin) => j.name() === name);
            if (!x) {
              console.log('No name found');
              return;
            }
            selectedJob.value = x;
          }
          jobs.value = response;
        })
        .catch((error: any) => {
          console.log('ERROR JOBLIST: ' + JSON.stringify(error));
          if (error.response) {
            store.commit('SET_STATUS', JSON.stringify(error.response));
            if (error.response.status == 401 || error.response.status == 403) {
              userService.logout();
              location.reload();
            }
          } else {
            store.commit('SET_STATUS', JSON.stringify(error));
            userService.logout();
            location.reload();
          }
          throw error;
        });
      if (selectedJob.value != null) {
        loadExecutions(
          selectedJob.value.status.Job.Name,
          from.value,
          to.value
        ).then((response: any) => {
          executions.value = [];
          response.forEach((element: any) => {
            executions.value.push(element.JobResult);
            if (
              selectedExecution.value != null &&
              selectedExecution.value.Id == element.JobResult.Id
            ) {
              selectedExecution.value = element.JobResult;
            }
          });
        });
      }
    };

    const onJobSelected = (items: any) => {
      if (items.length == 0) {
        return;
      }
      log.value = '';
      selectedJob.value = items[0];
      loadExecutions(
        items[0].status.Job.Name,
        from.value,
        to.value
      ).then((response: any) => {
        executions.value = [];
        response.forEach((element: any) => {
          executions.value.push(element.JobResult);
        });
      });
      return;
    };

    const onExecSelected = (items: any) => {
      if (items.length == 0) {
        return;
      }
      currentId.value = items[0].Id;
      log.value = items[0].Log;
    };

    const startJob = (items: JobAdmin) => {
      items.start();
    };

    const delJob = (name: string) => {
      const jobToDelete = jobs.value.find(
        (j: JobAdmin) => j.name() === name
      );
      console.log('Job to delete: ' + name);
      jobToDelete.delete();
    };

    const exportJob = (name: string) => {
      loadJobDefinition(name).then((result: any) => {
        var filename = 'job.json';
        const a = document.createElement('a');
        const type = filename.split('.').pop();
        a.href = URL.createObjectURL(
          new Blob([JSON.stringify(result)], {
            type: `text/${type === 'txt' ? 'plain' : type}`,
          })
        );
        a.download = filename;
        a.click();
      });
    };

    const delExecution = (id: string) => {
      console.log('Delete id ' + id);
      selectedJob.value.delete_execution(id);
    };

    const showLog = (item: any) => {
      console.log('Show log id ' + JSON.stringify(item));
      currentId.value = item.ID;
      log.value = item.Log;
    };

    onMounted(() => {
      to.value = new Date();
      from.value = new Date();
      from.value.setMonth(to.value.getMonth() - 1);
      retrieveJobs();
      timer.value = setInterval(retrieveJobs, 5000);
    });

    onBeforeUnmount(() => {
      clearInterval(timer.value);
    });

    return {
      perPage,
      currentPage,
      perPageOptions,
      selectedJob,
      selectedExecution,
      fields,
      execFields,
      jobs,
      currentId,
      executions,
      log,
      from,
      to,
      currentJob,
      onJobSelected,
      onExecSelected,
      startJob,
      delJob,
      exportJob,
      delExecution,
      showLog,
    };
  },
});
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
