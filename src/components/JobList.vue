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
      <div class="card-header">Job administration</div>
      <div class="card-body">
        <p>
          This page provides access to the list of Adabas RESTful server jobs to
          be administrate through this Adabas RESTful server. These jobs can
          start long running Adabas utility tasks.
        </p>
        <!-- Create Jobs -->
        <div class="row mb-3">
          <div class="col">
            <a class="btn btn-success" href="/#/createjob">
              Create RESTful server job
            </a>
          </div>
        </div>
        <Url url="/scheduler/jobs" />

        <!-- Pagination + Page Size -->
        <div class="row">
          <div class="col-sm-6">
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

        <!-- Job Table -->
        <div class="row">
          <div class="col-sm-5">
            <table class="table table-striped table-bordered table-hover table-sm">
              <thead>
                <tr>
                  <th v-for="field in fields" :key="field.key || field">{{ field.label || field }}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="job in paginatedJobs" :key="job.status.Job.Name" @click="onJobSelected(job)">
                  <td v-for="field in fields" :key="field.key || field">
                    {{ getNestedValue(job, field.key || field) }}
                  </td>
                  <td>
                    <button class="btn btn-success btn-sm me-2" @click.stop="startJob(job)">Start</button>
                    <button class="btn btn-outline-primary btn-sm me-2" @click.stop="delJob(job.status.Job.Name)">Delete</button>
                    <button class="btn btn-outline-primary btn-sm me-2" @click.stop="viewJob(job.status)">Show</button>
                    <button class="btn btn-outline-primary btn-sm me-2" @click.stop="exportJob(job.status.Job.Name)">Export</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Execution Table -->
          <div class="col-sm-6">
            <div class="row mb-2">
              <div class="col text-start">Start:</div>
              <div class="col text-start">End:</div>
            </div>
            <div class="row mb-2">
              <div class="col">
                <input type="date" v-model="from" class="form-control" :max="maxDateString" />
              </div>
              <div class="col">
                <input type="date" v-model="to" class="form-control" :max="maxDateString" />
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
                    <td>{{ execution.Id }}</td>
                    <td>{{ convertDateTime(execution.Scheduled) }}</td>
                    <td>{{ convertDateTime(execution.Ended) }}</td>
                    <td>{{ execution.ExitCode }}</td>
                    <td>
                      <button class="btn btn-outline-primary btn-sm me-2" @click.stop="delExecution(execution.Id)">Delete</button>
                      <button class="btn btn-outline-primary btn-sm me-2" @click="onExecSelected(execution)">Show Log</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Log Panel -->
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

    <!-- Modal -->
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
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { JobAdmin, loadExecutions, loadJobDefinition } from '../adabas/jobs';
import { userService } from '../user/service';
import store from '../store/index';
import CreateJob from './CreateJob.vue';
import StatusBar from '@/components/StatusBar.vue';
import Url from './Url.vue';
import { Modal } from 'bootstrap';

export default defineComponent({
  components: { StatusBar, CreateJob, Url },
  setup() {
    const perPage = ref(10);
    const currentPage = ref(1);
    const perPageOptions = ref([10, 20, 50, 100]);
    const selectedJob = ref<JobAdmin | null>(null);
    const selectedExecution = ref(null);
    const jobs = ref<JobAdmin[]>([]);
    const currentId = ref('');
    const executions = ref<any[]>([]);
    const log = ref('');
    const from = ref(new Date());
    const to = ref(new Date());
    const currentJob = ref<any>({});
    const max = ref(new Date());
    const timer = ref<number | null>(null);

    const fields = ref([
      { key: 'status.Job.Name', label: 'Name' },
      { key: 'status.Job.User', label: 'User' },
      { key: 'status.Job.Utility', label: 'Utility' },
      { key: 'status.Status', label: 'Status' },
      { key: 'status.Job.Description', label: 'Description' },
    ]);
    const execFields = ref(['ID','Scheduled', 'Ended', 'Exit Code', 'Action']);

    const maxDateString = computed(() => {
      return max.value.toISOString().split('T')[0];
    });

    const paginatedJobs = computed(() => {
      const start = (currentPage.value - 1) * perPage.value;
      const end = start + perPage.value;
      return jobs.value.slice(start, end);
    });

    const totalPages = computed(() => Math.ceil(jobs.value.length / perPage.value));

    const getNestedValue = (obj: any, path: string): any => {
      return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : ''), obj);
    };

    const retrieveJobs = () => {
      store.dispatch('SYNC_ADMIN_JOBS').then((response: any) => {
        if (selectedJob.value != null) {
          const name = selectedJob.value.status.Job.Name;
          const found = response.find((j: JobAdmin) => j.name() === name);
          if (found) selectedJob.value = found;
        }
        jobs.value = response;
      }).catch((error: any) => {
        console.error('ERROR JOBLIST:', error);
        const errMsg = error.response ? JSON.stringify(error.response) : JSON.stringify(error);
        store.commit('SET_STATUS', errMsg);
        userService.logout();
        location.reload();
      });

      if (selectedJob.value != null) {
        loadExecutions(selectedJob.value.status.Job.Name, from.value, to.value).then((response: any) => {
          executions.value = response.map((e: any) => e.JobResult);
        });
      }
    };

    const onJobSelected = (job: JobAdmin) => {
      log.value = '';
      selectedJob.value = job;
      loadExecutions(job.status.Job.Name, from.value, to.value).then((response: any) => {
        executions.value = response.map((e: any) => e.JobResult);
      });
    };

    const onExecSelected = (execution: any) => {
      currentId.value = execution.Id;
      log.value = execution.Log;
    };

    const startJob = (job: JobAdmin) => job.start();
    const delJob = (name: string) => {
      const job = jobs.value.find(j => j.name() === name);
      log.value = "";
      currentId.value = "";
      if (job) job.delete();
    };
    const exportJob = (name: string) => {
      loadJobDefinition(name).then((result: any) => {
        const blob = new Blob([JSON.stringify(result)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'job.json';
        a.click();
      });
    };
    const delExecution = (id: string) => {
      log.value = "";
      currentId.value = "";
      if (selectedJob.value) selectedJob.value.delete_execution(id);
    };
    const viewJob = (job: any) => {
      currentJob.value = job;
      const modal = new Modal(document.getElementById('modal-definition-job')!);
      modal.show();
    };
    const convertDateTime = (dt: string) => new Date(dt).toLocaleString();

    onMounted(() => {
      to.value = new Date();
      from.value = new Date();
      from.value.setMonth(to.value.getMonth() - 1);
      retrieveJobs();
      timer.value = window.setInterval(retrieveJobs, 5000);
    });
    onBeforeUnmount(() => {
      if (timer.value) clearInterval(timer.value);
    });

    return {
      perPage, currentPage, perPageOptions, selectedJob, selectedExecution, fields,
      execFields, jobs, currentId, executions, log, from, to, currentJob,
      paginatedJobs, totalPages, getNestedValue, startJob, delJob,
      exportJob, delExecution, convertDateTime, onJobSelected,
      onExecSelected, viewJob, maxDateString,
    };
  },
});
</script>

<style scoped lang="scss">
.joblist {
  font-size: 14px;
}
.card-header {
  font-weight: bold;
  font-size: 18px;
}
</style>
