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
  <div class="sidebar p-2">
    <div class="offcanvas offcanvas-start" tabindex="-1" id="sidebar-1">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">Sidebar</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body">
        Database {{ url }} is {{ state() }}
        <ul class="nav flex-column">
          <li class="nav-item">
            <span class="nav-link">Information</span>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="'/information/' + url">Information</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="'/parameters/' + url">Parameters</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="'/nuclog/' + url">Nucleus Log</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="'/containers/' + url">Containers</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="'/files/' + url">Files</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ disabled: !active() }" :to="'/permission/' + url">Permissions</router-link>
          </li>
          <li class="nav-item">
            <span class="nav-link">Statistics</span>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ disabled: !active() }" :to="'/highwater/' + url">High Watermark</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ disabled: !active() && !isMonitor() }" :to="'/monitor/' + url">Monitor</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ disabled: !active() }" :to="'/cmdstats/' + url">Command statistics</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ disabled: !active() }" :to="'/bufferpool/' + url">Buffer Pool statistics</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ disabled: !active() }" :to="'/plogstat/' + url">PLOG statistics</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ disabled: !active() && !isMonitor() }" :to="'/bufferflush/' + url">Buffer Flush statistics</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ disabled: !active() }" :to="'/threadtable/' + url">Thread table</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ disabled: !active() }" :to="'/adatcp/' + url">TCP connections</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ disabled: !active() }" :to="'/activity/' + url">Activity</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ disabled: !active() }" :to="'/checkpoints/' + url">Checkpoints</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ disabled: !active() }" :to="'/cluster/' + url">Cluster</router-link>
          </li>
          <li class="nav-item">
            <span class="nav-link">Queues</span>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ disabled: !active() }" :to="'/userqueue/' + url">User queue</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ disabled: !active() }" :to="'/commandqueue/' + url">Command queue</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ disabled: !active() }" :to="'/holdqueue/' + url">Hold queue</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ disabled: !active() }" :to="'/ucb/' + url">UCB entries</router-link>
          </li>
        </ul>
      </div>
    </div>
    <button class="btn btn-primary btn-sm mr-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebar-1" aria-controls="sidebar-1">
      <i class="bi bi-chevron-double-left"></i> Menu
    </button>
    <router-link class="btn btn-primary btn-sm mr-2" :to="'/databases'">Database List</router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
// import { BIconChevronDoubleLeft } from "bootstrap-vue-next";
import { SearchDatabases } from '@/adabas/admin';

export default defineComponent({
  components: {
    // BIconChevronDoubleLeft,
  },
  props: {
    url: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const db = ref(null);

    const active = () => {
      if (!db.value?.status) {
        return false;
      }
      return db.value.status.Active;
    };

    const state = () => {
      if (!db.value || !db.value.status) {
        return "Unknown";
      }
      return db.value.status.Active ? "Online" : "Offline";
    };

    const isMonitor = () => {
      return db.value?.status.StructureLevel > 21;
    };

    db.value = SearchDatabases(props.url);

    return {
      db,
      active,
      state,
      isMonitor,
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
</style>
