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
  <div class="bufferflushdisplay p-2">
    <Sidebar :url="url" />
    <b-card
      :header="'Adabas Database Buffer Flush for database ' + url"
      border-variant="secondary"
      header-border-variant="secondary"
    >
      <b-card-body>
        <b-container fluid>
          <b-row
            ><b-col>
              This page provide the list of Adabas database Buffer Flush to be
              administrate through this Adabas RESTful server.
            </b-col>
          </b-row>
          <b-row
            ><b-col>
              <Url url="/adabas/database" />
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right"> Total number of flushed </b-col>
            <b-col>
              {{ countFlushes() }}
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right"> Explicit </b-col>
            <b-col>
              {{ checkUndefinedIndex(bufferflush.BfFlushCounter,1) }}
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right"> Write Limit </b-col>
            <b-col>
              {{ checkUndefinedIndex(bufferflush.BfFlushCounter,0) }}
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right"> WORK Limit </b-col>
            <b-col>
              {{ checkUndefinedIndex(bufferflush.BfFlushCounter,2) }}
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right"> Space  </b-col>
            <b-col>
              {{ checkUndefinedIndex(bufferflush.BfFlushCounter,3) }}
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right"> Emergency </b-col>
            <b-col>
              {{ checkUndefinedIndex(bufferflush.BfFlushCounter,4) }}
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right"> Ignored blocks </b-col>
            <b-col>
              {{ checkUndefinedIndex(bufferflush.BfFlushCounter,5) }}
            </b-col>
          </b-row>
          <b-row>
            <b-col class="text-right">
              <b-table :items="bufferflush.LStat" :fields="fields">
                <template v-slot:cell(WriteLimit)="row">
                  {{ row.item.WriteLimit / 10 }}
                </template>
                <template v-slot:cell(FlushPagesSum)="row">
                  {{ formatBytes(row.item.FlushPagesSum) }}
                </template>
                <template v-slot:cell(StartTime)="row">
                  {{ new Date(row.item.StartTime).toUTCString() }}
                </template>
                <template v-slot:cell(AverageIO)="row">
                  {{ avgioMsec(row.item) }}
                </template>
                <template v-slot:cell(Duration)="row">
                  {{ checkUndefined(row.item.BfDiffEndBf) }}
                </template>
                <template v-slot:cell(Rejected)="row">
                  {{ checkUndefined(row.item.BfListEntryLockReject) }}
                </template>
              </b-table>
            </b-col>
          </b-row>
        </b-container>
      </b-card-body>
    </b-card>
    <StatusBar />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Sidebar from "./Sidebar.vue";
import store from "../store/index";
import StatusBar from "./StatusBar.vue";
import Url from "./Url.vue";

@Component({
  components: {
    StatusBar,
    Sidebar,
    Url,
  },
})
export default class BufferFlushData extends Vue {
  @Prop(String) readonly url: string | undefined;
  data() {
    return {
      fields: [
        "StartTime",
        "WriteLimit",
        "NoEntries",
        "FlushPagesSum",
        "AverageIO",
        "Duration",
        "Rejected",
      ],
      bufferflush: { LStat: [] },
    };
  }
  created() {
    const db = store.getters.search(this.url);
    db.bfStats().then((response: any) => {
      this.$data.bufferflush = response;
    });
  }
  formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
  avgioMsec(item:any) {
			var avgioMsec = 0
      if (!item.BfDiffEndBf || !item.BfFlushPagesSum) {
        return 0
      }
			if (item.BfDiffEndBf != 0 && item.BfFlushPagesSum > 0 ){
				/* Average I/O time in msec*100 (because of editing) */
				avgioMsec = ((item.BfDiffEndBf-item.BfDiffStartIO)*100) / (item.BfFlushPagesSum)
			}
      return avgioMsec
  } 
  checkUndefined(v:any) {
    if (!v) {
      return 0
    }
    return v
  }
  checkUndefinedIndex(v:any,index:number) {
    if (!v) {
      return 0
    }
    return v[index]
  }
  countFlushes() {
  	let c = (0)
    if (!this.$data.bufferflush.BfFlushCounter) {
      return 0
    }
	 this.$data.bufferflush.BfFlushCounter.foreach((element:number,index:number) => {
		  if (index != 6) {
			  c += element
		  }     
   });
  }
}
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
