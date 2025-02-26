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
  <div class="filesbrowser p-2">
    <div class="modal fade" id="modal-xl" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">File content:</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <pre>{{ filedata }}</pre>
          </div>
        </div>
      </div>
    </div>
    <div class="card border-secondary mb-3">
      <div class="card-header border-secondary">File browser</div>
      <div class="card-body">
        <div class="container-fluid">
          <div class="row mb-3">
            <div class="col">
              This page provides the list of Adabas database files to be administrate through this Adabas RESTful server.
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-sm-2">Select Path:</div>
            <div class="col">
              <select class="form-select" v-model="selected">
                <option v-for="option in options" :key="option.value" :value="option.value">{{ option.text }}</option>
              </select>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-sm-2">Upload file to remote:</div>
            <div class="col-sm-8">
              <input class="form-control" type="file" @change="handleFileUpload">
            </div>
            <div class="col-sm-2">
              <button class="btn btn-primary" @click="upload()">Upload</button>
            </div>
          </div>
          <div class="row mb-3">
            <div class="col-sm-10">
              <nav aria-label="Page navigation">
                <ul class="pagination">
                  <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }">
                    <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
                  </li>
                </ul>
              </nav>
            </div>
            <div class="col-sm-2">
              <select class="form-select form-select-sm mt-3" v-model="perPage">
                <option v-for="option in perPageOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <table class="table table-striped table-bordered table-hover">
                <thead>
                  <tr>
                    <th v-for="field in fields" :key="field.key" @click="sort(field.key)">
                      {{ field.key }}
                      <span v-if="sortKey === field.key && !sortAsc">▲</span>
                      <span v-if="sortKey === field.key && sortAsc">▼</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="file in paginatedFiles" :key="file.Name" @click="onRowSelected(file)">
                    <td>{{ file.Name }}</td>
                    <td>{{ file.Type }}</td>
                    <td class="text-right" v-if="file.Type !== 'Directory'">{{ new Intl.NumberFormat().format(file.Size) }}</td>
                    <td v-else></td>
                    <td>{{ file.Modified ? new Date(file.Modified).toUTCString() : '' }}</td>
                    <td class="text-right">
                      <div class="btn-group" role="group">
                        <button class="btn btn-primary" v-if="file.Type !== 'Directory' && file.Size < 100000" @click="show(file.Name)" data-bs-toggle="modal" data-bs-target="#modal-xl">Show</button>
                        <button class="btn btn-primary" v-if="file.Type !== 'Directory'" @click="download(file.Name)">Download</button>
                        <button class="btn btn-primary" v-if="file.Type !== 'Directory' && file.Size < 100000" @click="deleteFile(file.Name)">Delete</button>
                      </div>
                    </td>
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
import { defineComponent, ref, onMounted, computed } from 'vue';
import Sidebar from './Sidebar.vue';
import StatusBar from '@/components/StatusBar.vue';
import Url from './Url.vue';
import { FilePathBrowser, fileAccessConfig } from '../adabas/file';

export default defineComponent({
  name: 'FileBrowser',
  components: {
    Sidebar,
   StatusBar,
    Url,
  },
  props: {
    url: String,
  },
  setup(props) {
    const perPage = ref(10);
    const currentPage = ref(1);
    const perPageOptions = ref([10, 20, 50, 100]);
    const selected = ref(null);
    const selectedFile = ref(null);
    const options = ref([]);
    const files = ref([]);
    const uploadFile = ref(null);
    const filedata = ref('Loading data ...');
    const path = ref('/');
    const browser = ref<FilePathBrowser | null>(null);
    const fields = ref([
      { key: 'Name', sortable: true },
      { key: 'Type', sortable: true },
      { key: 'Size', sortable: true, tdClass: 'text-right' },
      { key: 'Modified', sortable: true },
      { key: 'Operation', tdClass: 'text-right' },
    ]);

    onMounted(() => {
      fileAccessConfig().then((response: any) => {
        options.value = [];
        response.Directories.forEach((element: any) => {
          options.value.push({
            value: element,
            text: element.Name + ' (' + element.Location + ')',
          });
          if (options.value.length > 0) {
            selected.value = options.value[0].value;
            browser.value = new FilePathBrowser(options.value[0].value.Name);
            loadDirectory();
          }
        });
      });
    });

    const loadDirectory = () => {
      if (browser.value != null && path.value != '') {
        console.log('Load directory ' + browser.value.current + ' path=' + path.value);
        const b = browser.value as FilePathBrowser;
        if (path.value == '..') {
          b.up();
        } else {
          b.addPath(path.value);
        }
        refreshDirectory();
      }
    };

    const refreshDirectory = () => {
      browser.value
        .filesQuery()
        .then((response: any) => {
          files.value = response.Content;
          files.value.push({ Name: '..', Type: 'Directory' });
          path.value = '';
        })
        .catch((error: any) => {
          console.log('Refresh ERROR:' + JSON.stringify(error));
        });
    };

    const sortingChanged = (a: any, b: any, key: any) => {
      if (a['Name'] === '..') {
        return -1;
      }
      if (b['Name'] === '..') {
        return 1;
      }
      if (key === 'day') {
        let day1 = a[key].toLowerCase();
        let day2 = b[key].toLowerCase();
        return files.value[day1] - files.value[day2];
      }

      let day1 = a['Type'].toLowerCase();
      let day2 = b['Type'].toLowerCase();
      if (day1 == 'directory') {
        return -1;
      }
      if (day2 == 'directory') {
        return 1;
      }
      return a['Name'] - b['Name'];
    };

    const onRowSelected = (items: any) => {
      if (items.length == 0) {
        return;
      }
      if (selectedFile.value == items[0]) {
        return;
      }
      selectedFile.value = items[0];
      if (items[0].Name == '..') {
        path.value = '..';
        loadDirectory();
        return;
      }
      if (items[0].Type == 'Directory') {
        path.value = items[0].Name;
        console.log('New path ' + path.value);
        loadDirectory();
      } else {
        console.log('No directory ' + items[0].Type);
      }
    };

    const show = (fileName: string) => {
      console.log('Read ' + fileName);
      filedata.value = 'Loading data ...';
      browser.value.read(fileName).then((response: any) => {
        filedata.value = response;
      });
    };

    const download = (fileName: string) => {
      console.log('Download ' + fileName);
      browser.value.download(fileName);
    };

    const upload = () => {
      console.log('Upload ' + uploadFile.value.Name);
      browser.value.upload(uploadFile.value);
    };

    const deleteFile = (fileName: string) => {
      console.log('Delete ' + fileName);
      this.$bvModal
        .msgBoxConfirm('Really delete file ' + fileName + '?')
        .then((value) => {
          if (value == true) {
            browser.value
              .deleteFile(fileName)
              .then((value: any) => {
                console.log('File deleted');
              })
              .catch((err: any) => {
                console.log('Error deleting file');
              });
            refreshDirectory();
          }
        })
        .catch((err) => {
          console.log('Error: ' + JSON.stringify(err));
        });
    };

    // const totalPages = computed(() => Math.ceil(files.value.length / perPage.value));
    // const paginatedFiles = computed(() => {
    //   const start = (currentPage.value - 1) * perPage.value;
    //   const end = start + perPage.value;
    //   return files.value.slice(start, end);
    // });
    // const handleFileUpload = (event: Event) => {
    //   const target = event.target as HTMLInputElement;
    //   if (target.files && target.files.length > 0) {
    //     uploadFile.value = target.files[0];
    //   }
    // };

    return {
      perPage,
      currentPage,
      perPageOptions,
      selected,
      selectedFile,
      options,
      files,
      uploadFile,
      filedata,
      path,
      browser,
      fields,
      loadDirectory,
      refreshDirectory,
      sortingChanged,
      onRowSelected,
      show,
      download,
      upload,
      deleteFile,
      // totalPages,
      // paginatedFiles,
      // handleFileUpload,
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
