<template>
  <div class="joblist p-2">
    <b-card
      header="Job administration"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <p>
          This page provides access to the list of Adabas RESTful server jobs to
          be administrated through this Adabas RESTful server. These jobs can
          start long running Adabas utility tasks.
        </p>
        <CreateJob msg="ABC" />
        <Url url="/scheduler/jobs" />
        <b-row>
          <b-col sm="5">
            <b-pagination
              v-model="currentPage"
              :total-rows="jobs.length"
              :per-page="perPage"
              aria-controls="my-table"
            ></b-pagination>
          </b-col>
          <b-col sm="1">
            <b-form-select
              v-model="perPage"
              :options="perPageOptions"
              size="sm"
              class="mt-3"
            ></b-form-select>
          </b-col>
        </b-row>
        <b-row>
          <b-col sm="6">
            <b-table
              id="my-table"
              class="w-100 p-3"
              striped
              bordered
              hover
              :per-page="perPage"
              :current-page="currentPage"
              small
              selectable
              select-mode="single"
              @row-selected="onJobSelected"
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
                  variant="outline-primary"
                  v-on:click="delJob(row.item.status.Job.Name)"
                  class="mr-2"
                  >Delete</b-button
                >
                <b-button
                  variant="outline-primary"
                  class="mr-2"
                  v-on:click="viewJob(row.item.status)"
                  >Show</b-button
                >
                <b-button
                  variant="outline-primary"
                  id="expJob"
                  class="mr-2"
                  v-on:click="exportJob(row.item.status.Job.Name)"
                  >Export</b-button
                >
              </template>
            </b-table>
          </b-col>
          <b-col sm="6">
            <b-row>
              <b-col class="text-left">Start:</b-col>
              <b-col class="text-left">End:</b-col>
            </b-row>
            <b-row>
              <b-col>
                <b-form-datepicker
                  id="from-datepicker"
                  v-model="from"
                  class="mb-2"
                  :max="max"
                ></b-form-datepicker>
              </b-col>
              <b-col>
                <b-form-datepicker
                  id="to-datepicker"
                  v-model="to"
                  class="mb-2"
                  :max="max"
                ></b-form-datepicker>
              </b-col>
            </b-row>
            <b-row>
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
                <template v-slot:cell(Scheduled)="row">
                  {{ convertDateTime(row.item.Scheduled) }}
                </template>
                <template v-slot:cell(Ended)="row">
                  {{ convertDateTime(row.item.Ended) }}
                </template>
                <template v-slot:cell(log)="row">
                  <b-button
                    variant="outline-primary"
                    class="mr-2"
                    v-on:click="delExecution(row.item.Id)"
                    >Delete</b-button
                  >
                </template>
              </b-table>
            </b-row>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-badge pill variant="secondary"
              >Log Output {{ currentId }}:</b-badge
            >
            <b-alert show variant="secondary">
              <pre>{{ log }}</pre>
            </b-alert>
          </b-col>
        </b-row>
      </b-card-body>
    </b-card>
    <b-modal
      size="xl"
      id="modal-definition-job"
      :title="'Job definition ' + currentJob.Name"
      ok-only
    >
      <pre class="my-4">{{ currentJob }}</pre>
    </b-modal>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import { JobAdmin, loadExecutions, loadJobDefinition } from '../adabas/jobs';
import { userService } from '../user/service';
import store from '../store/index';
import CreateJob from './CreateJob.vue';
import StatusBar from './StatusBar.vue';
import Url from './Url.vue';
import { BModal } from 'bootstrap-vue-3';

export default defineComponent({
  components: {
    StatusBar,
    CreateJob,
    Url,
  },
  setup() {
    // Reactive state
    const modalRef = ref<BModal>(null); 
    const perPage = ref(10);
    const currentPage = ref(1);
    const perPageOptions = ref([10, 20, 50, 100]);
    const selectedJob = ref<any>(null);
    const selectedExecution = ref<any>(null);
    const fields = ref([
      { key: 'status.Job.Name', label: 'Name' },
      { key: 'status.Job.User', label: 'User' },
      { key: 'status.Job.Utility', label: 'Utility' },
      { key: 'status.Status', label: 'Status' },
      { key: 'status.Job.Description', label: 'Description' },
      'info',
    ]);
    const execFields = ref(['Id', 'Scheduled', 'Ended', 'ExitCode', 'log']);
    const jobs = ref<JobAdmin[]>([]);
    const currentId = ref('');
    const executions = ref<any[]>([]);
    const timer = ref<any>(0);
    const max = new Date();
    const log = ref('');
    const from = ref<any>(null);
    const to = ref<any>(null);
    const currentJob = ref<any>({});

    // Lifecycle hooks
    onMounted(() => {
      to.value = new Date();
      from.value = new Date();
      from.value.setMonth(to.value.getMonth() - 1);
      retrieveJobs();
      timer.value = setInterval(retrieveJobs, 5000);
    });

    onBeforeUnmount(() => {
      if (timer.value) {
        clearInterval(timer.value);
      }
    });

    // Methods
    const convertDate = (currentdate: Date): string => {
      return (
        new String(currentdate.getFullYear()).padStart(4, '0') +
        '-' +
        new String(currentdate.getMonth() + 1).padStart(2, '0') +
        '-' +
        new String(currentdate.getDate()).padStart(2, '0')
      );
    };

    const convertTime = (currentdate: Date): string => {
      return (
        new String(currentdate.getHours()).padStart(2, '0') +
        ':' +
        new String(currentdate.getMinutes()).padStart(2, '0') +
        ':' +
        new String(currentdate.getSeconds()).padStart(2, '0')
      );
    };

    const convertDateTime = (d: string): string => {
      var de = new Date(d);
      return de.toUTCString();
    };

    const viewJob = (item: any): void => {
      console.log('View job ' + JSON.stringify(item));
      loadJobDefinition(item.Job.Name).then((result: any) => {
        console.log('Return ' + JSON.stringify(result));
        currentJob.value = result;
        // Show modal using the ref
        if (modalRef.value) {
          modalRef.value.show(); // Show the modal
        }
      });
    };

    const retrieveJobs = (): void => {
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
          console.log(from.value);
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

    const onJobSelected = (items: any): void => {
      if (items.length === 0) {
        return;
      }
      log.value = '';
      selectedJob.value = items[0];
      loadExecutions(items[0].status.Job.Name, from.value, to.value).then(
        (response: any) => {
          executions.value = [];
          response.forEach((element: any) => {
            executions.value.push(element.JobResult);
          });
        }
      );
    };

    const onExecSelected = (items: any): void => {
      if (items.length === 0) {
        return;
      }
      currentId.value = items[0].Id;
      log.value = items[0].log;
    };

    const startJob = (items: JobAdmin): void => {
      items.start();
    };

    const delJob = (name: string): void => {
      console.log('disable function for now. need to check again');
      //const jobToDelete = jobs.find(
      //  (j: JobAdmin) => j.name() === name
      //);
      //console.log('Job to delete: ' + name);
      //jobToDelete.delete();
    };

    const exportJob = (name: string): void => {
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

    const delExecution = (id: string): void => {
      console.log('Delete id ' + id);
      console.log('disable the function for now, need to check');
      //selectedJob.delete_execution(id);
    };

    const showLog = (item: any): void => {
      console.log('Show log id ' + JSON.stringify(item));
      currentId.value = item.ID;
      log.value = item.Log;
    };
    const beforeDestroy = (): void => {
      if (timer.value) {
        clearInterval(timer.value);
      }
    };

    return {
      jobs,
      perPage,
      currentPage,
      fields,
      execFields,
      currentId,
      log,
      from,
      to,
      executions,
      currentJob,
      max,
      convertDate,
      convertTime,
      convertDateTime,
      viewJob,
      retrieveJobs,
      onJobSelected,
      onExecSelected,
      startJob,
      delJob,
      exportJob,
      delExecution,
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
