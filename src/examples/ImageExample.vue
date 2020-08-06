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
  <div class="imageexample">
    <MyHeader></MyHeader>
    <div class="card">
      <div class="card-header h5">Adabas Large objects data example</div>
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
          Adabas database need to be prepared using the backup file delivered in the
          Adabas RESTful server installation.
        </p>
          <Url :url="xURL" />
        <b-modal centered size="xl" id="modal-definition" title="Image" ok-only
          ><b-img fluid :src="currentPic"
        /></b-modal>
        <b-pagination
          v-model="currentPage"
          :total-rows="image.length"
          :per-page="perPage"
          aria-controls="my-table"
        ></b-pagination>
        <b-table
          ref="table"
          class="w-100 p-3"
          striped
          bordered
          hover
          small
          :per-page="perPage"
          :current-page="currentPage"
          :items="image"
          :fields="fields"
        >
          <template v-slot:cell(image)="row">
            <b-button v-b-modal.modal-definition v-on:click="loadImage(row.item.ISN)">
              <b-img-lazy :src="loadThumbnail(row.item.ISN)" alt="Thumbnail" />
            </b-button>
          </template>
        </b-table>
      </div>
    </div>
     <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { authHeader } from "../user/auth-header";
import { config } from "../store/config";
import { userService } from "../user/service";
import store from "../store/index";
import MyHeader from "@/components/Header.vue";
import StatusBar from "@/components/StatusBar.vue";
import Url from "@/components/Url.vue";
import axios, { ResponseType } from "axios";

@Component({
  components: {
    MyHeader,
    Url,
    StatusBar,
  },
})
export default class ImageExample extends Vue {
  @Prop() private msg!: string;
  data() {
    return {
      perPage: 10,
      currentPage: 1,
      currentPic: "",
      fields: [
        { label: "ISN", key: "ISN" },
        { label: "Filename", key: "Location.Filename" },
        { label: "Size", key: "Type.Size" },
        { label: "Camera Model", key: "EXIFinformation.Model" },
        { label: "Date", key: "EXIFinformation.DateOriginal" },
        "image",
        { label: "DateEXIF", key: "EXIFinformation.DateEXIF" },
        { label: "Orientation", key: "EXIFinformation.Orientation" },
        { label: "Height", key: "EXIFinformation.Height" },
        { label: "Width", key: "EXIFinformation.Width" },
        { label: "ExposureTime", key: "EXIFinformation.ExposureTime" },
      ],
      image: [],
      xURL:
        "/rest/map/LOBEXAMPLE?fields=Filename,Size,@Thumbnail,@Picture,Model,DateOriginal,EXIFinformation",
    };
  }
  created() {
    const getConfig = {
      headers: authHeader("application/json"),
      useCredentails: true,
    };
    store.commit("SET_URL", {
      url: config.Url() + this.$data.xURL,
      method: "get",
    });
    return axios
      .get(config.Url() + this.$data.xURL, getConfig)
      .then((response: any) => {
        store.commit("SET_STATUS", "OK");
        store.commit("SET_RESPONSE", JSON.stringify(response));
        this.$data.image = response.data.Records;
      })
      .catch((error: any) => {
        console.log("ERROR: " + JSON.stringify(error));
        if (error.response) {
          store.commit("SET_STATUS", JSON.stringify(error.response));
          if (error.response.status == 401 || error.response.status == 403) {
            userService.logout();
            location.reload(true);
          }
        } else {
          store.commit("SET_STATUS", JSON.stringify(error));
        }
        throw error;
      });
  }
  loadThumbnail(isn: any) {
    let imageFilter = this.$data.image.filter((i:any)=>i.ISN == isn);
    if (imageFilter.length === 0) {
      return "";
    }
    let image = imageFilter[0];
    if (!image.pic) {
      // console.log("Load image " + index);
      const getConfig = {
        headers: authHeader(""),
        useCredentails: true,
        responseType: "arraybuffer" as ResponseType,
      };
      axios
        .get(
          config.Url() + image.Data["@Thumbnail"],
          getConfig
        )
        .then((response: any) => {
          const bytes = new Uint8Array(response.data);
          const binary = bytes.reduce(
            (data, b) => (data += String.fromCharCode(b)),
            ""
          );
          const res = "data:image/jpeg;base64," + btoa(binary);
          image["pic"] = res;
          this.$data.currentPic = res;
          (this.$refs.table as any).refresh();
          //this.$forceUpdate();
          return res;
        })
        .catch((error: any) => {
          console.log("ERROR: " + JSON.stringify(error));
        });
    }
    return image["pic"];
  }
  loadImage(isn: any) {
     let imageFilter = this.$data.image.filter((i:any)=>i.ISN == isn);
    if (imageFilter.length === 0) {
      return "";
    }
    let image = imageFilter[0];
   const getConfig = {
      headers: authHeader(""),
      useCredentails: true,
      responseType: "arraybuffer" as ResponseType,
    };
    return axios
      .get(config.Url() + image.Data["@Picture"], getConfig)
      .then((response: any) => {
        const bytes = new Uint8Array(response.data);
        const binary = bytes.reduce(
          (data, b) => (data += String.fromCharCode(b)),
          ""
        );
        const res = "data:image/jpeg;base64," + btoa(binary);
        this.$data.currentPic = res;
        return res;
      })
      .catch((error: any) => {
        console.log("ERROR: " + JSON.stringify(error));
      });
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
