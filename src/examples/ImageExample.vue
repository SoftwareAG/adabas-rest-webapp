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
  <div class="imageexample p-2">
    <MyHeader></MyHeader>
    <div class="card border-secondary mb-3">
      <div class="card-header">Adabas Large objects data example</div>
      <div class="card-body">
        <p>
          This application shows the direct access to picture data stored in an
          Adabas large object field. Each image and corresponding thumbnail is
          stored in a record.
        </p>
        <p>
          This example shows a direct request to Large Objects data. The Large
          objects are defined as Alpha fields with LA flag in Adabas. All data
          including the image data is stored in Adabas. The query of binary data
          can be done using direct binary requests.
        </p>
        <p>
          Adabas database need to be prepared using the backup file delivered in
          the Adabas RESTful server installation.
        </p>
        <Url :url="xURL"/>
        <div class="modal fade" id="modal-definition" tabindex="-1" aria-labelledby="modal-definition-label" aria-hidden="true">
          <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="modal-definition-label">Image</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <img :src="currentPic" class="img-fluid" />
              </div>
            </div>
          </div>
        </div>
        <nav aria-label="Page navigation">
          <ul class="pagination">
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
              <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
            </li>
          </ul>
        </nav>
        <table class="table table-striped table-bordered table-hover table-sm w-100 p-3">
          <thead>
            <tr>
              <th v-for="field in fields" :key="field.key">{{ field.label }}</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paginatedData" :key="row.ISN">
              <td v-for="field in fields" :key="field.key">{{ row[field.key] }}</td>
              <td>
                <button type="button" class="btn btn-link" data-bs-toggle="modal" data-bs-target="#modal-definition" @click="loadImage(row.ISN)">
                  <img :src="loadThumbnail(row.ISN)" alt="Thumbnail" class="img-thumbnail" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
        <StatusBar />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { authHeader } from '../user/auth-header';
import { config } from '../store/config';
import { userService } from '../user/service';
import store from '../store/index';
import MyHeader from '@/components/Header.vue';
import StatusBar from '@/components/StatusBar.vue';
import Url from '@/components/Url.vue';
import axios, { ResponseType } from 'axios';

export default defineComponent({
  components: {
    MyHeader,
    Url,
    StatusBar,
  },
  setup() {
    const perPage = ref(10);
    const currentPage = ref(1);
    const currentPic = ref('');
    const fields = ref([
      { label: 'ISN', key: 'ISN' },
      { label: 'Filename', key: 'Location.Filename' },
      { label: 'Size', key: 'Type.Size' },
      { label: 'Camera Model', key: 'EXIFinformation.Model' },
      { label: 'Date', key: 'EXIFinformation.DateOriginal' },
      'image',
      { label: 'DateEXIF', key: 'EXIFinformation.DateEXIF' },
      { label: 'Orientation', key: 'EXIFinformation.Orientation' },
      { label: 'Height', key: 'EXIFinformation.Height' },
      { label: 'Width', key: 'EXIFinformation.Width' },
      { label: 'ExposureTime', key: 'EXIFinformation.ExposureTime' },
    ]);
    const image = ref([]);
    const xURL = ref(
      '/rest/map/LOBEXAMPLE?fields=Filename,Size,@Thumbnail,@Picture,Model,DateOriginal,EXIFinformation&limit=0'
    );

    onMounted(() => {
      const getConfig = {
        headers: authHeader('application/json'),
        useCredentails: true,
      };
      store.commit('SET_URL', {
        url: config.Url() + xURL.value,
        method: 'get',
      });
      axios
        .get(config.Url() + xURL.value, getConfig)
        .then((response: any) => {
          store.commit('SET_STATUS', 'OK');
          store.commit('SET_RESPONSE', JSON.stringify(response));
          image.value = response.data.Records;
        })
        .catch((error: any) => {
          console.log('ERROR: ' + JSON.stringify(error));
          if (error.response) {
            store.commit('SET_STATUS', JSON.stringify(error.response));
            if (error.response.status == 401 || error.response.status == 403) {
              userService.logout();
              location.reload();
            }
          } else {
            store.commit('SET_STATUS', JSON.stringify(error));
          }
          throw error;
        });
    });

    const loadThumbnail = (isn: any): string => {
      let imageFilter = image.value.filter((i: any) => i.ISN == isn);
      if (imageFilter.length === 0) {
        return '';
      }
      let imageItem = imageFilter[0];
      if (!imageItem.pic) {
        const getConfig = {
          headers: authHeader(''),
          useCredentails: true,
          responseType: 'arraybuffer' as ResponseType,
        };
        axios
          .get(config.Url() + imageItem.Data['@Thumbnail'], getConfig)
          .then((response: any) => {
            const bytes = new Uint8Array(response.data);
            const binary = bytes.reduce(
              (data, b) => (data += String.fromCharCode(b)),
              ''
            );
            const res = 'data:image/jpeg;base64,' + btoa(binary);
            imageItem['pic'] = res;
            currentPic.value = res;
            return res;
          })
          .catch((error: any) => {
            console.log('ERROR: ' + JSON.stringify(error));
          });
        return '';
      }
      return imageItem['pic'];
    };

    const loadImage = (isn: any) => {
      let imageFilter = image.value.filter((i: any) => i.ISN == isn);
      if (imageFilter.length === 0) {
        return '';
      }
      let imageItem = imageFilter[0];
      const getConfig = {
        headers: authHeader(''),
        useCredentails: true,
        responseType: 'arraybuffer' as ResponseType,
      };
      return axios
        .get(config.Url() + imageItem.Data['@Picture'], getConfig)
        .then((response: any) => {
          const bytes = new Uint8Array(response.data);
          const binary = bytes.reduce(
            (data, b) => (data += String.fromCharCode(b)),
            ''
          );
          const res = 'data:image/jpeg;base64,' + btoa(binary);
          currentPic.value = res;
          return res;
        })
        .catch((error: any) => {
          console.log('ERROR: ' + JSON.stringify(error));
        });
    };

    // const totalPages = computed(() => Math.ceil(image.value.length / perPage.value));
    // const paginatedData = computed(() => {
    //   const start = (currentPage.value - 1) * perPage.value;
    //   const end = start + perPage.value;
    //   return image.value.slice(start, end);
    // });

    return {
      perPage,
      currentPage,
      currentPic,
      fields,
      image,
      xURL,
      loadThumbnail,
      loadImage,
      // totalPages,
      // paginatedData,
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
