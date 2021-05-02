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
    <b-sidebar id="sidebar-1" title="Sidebar" shadow>
      Database {{ url }} is {{ state() }}
      <b-nav class="px-3 py-2" pills vertical>
        <b-nav-text>Information<br /></b-nav-text>
        <b-nav-item :to="'/information/' + url">Information</b-nav-item>
        <b-nav-item :to="'/parameters/' + url">Parameters</b-nav-item>
        <b-nav-item :to="'/nuclog/' + url">Nucleus Log</b-nav-item>
        <b-nav-item :to="'/containers/' + url">Containers</b-nav-item>
        <b-nav-item :to="'/files/' + url">Files</b-nav-item>
        <b-nav-text>Statistics</b-nav-text>
        <b-nav-item :disabled="!active()" :to="'/highwater/' + url"
          >High Watermark</b-nav-item
        >
        <b-nav-item :disabled="!active()" :to="'/cmdstats/' + url"
          >Command statistics</b-nav-item
        >
        <b-nav-item :disabled="!active()" :to="'/bufferpool/' + url"
          >Buffer Pool statistics</b-nav-item
        >
        <b-nav-item :disabled="!active()" :to="'/threadtable/' + url"
          >Thread table</b-nav-item
        >
        <b-nav-item :disabled="!active()" :to="'/adatcp/' + url"
          >TCP connections</b-nav-item
        >
        <b-nav-item :disabled="!active()" :to="'/activity/' + url"
          >Activity</b-nav-item
        >
        <b-nav-item :disabled="!active()" :to="'/checkpoints/' + url"
          >Checkpoints</b-nav-item
        >
        <b-nav-text>Queues</b-nav-text>
        <b-nav-item :disabled="!active()" :to="'/userqueue/' + url"
          >User queue</b-nav-item
        >
        <b-nav-item :disabled="!active()" :to="'/commandqueue/' + url"
          >Command queue</b-nav-item
        >
        <b-nav-item :disabled="!active()" :to="'/holdqueue/' + url"
          >Hold queue</b-nav-item
        >
        <b-nav-item :disabled="!active()" :to="'/ucb/' + url"
          >UCB entries</b-nav-item
        >
      </b-nav>
    </b-sidebar>
    <b-button
      small
      variant="primary"
      size="sm"
      class="mr-2"
      v-b-toggle.sidebar-1
    >
      <b-icon-chevron-double-left
        variant="light"
      ></b-icon-chevron-double-left>
      Menu</b-button
    >
    <b-button small variant="primary" size="sm" class="mr-2" :to="'/databases'"
      >Database List</b-button
    >
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import store from "../store/index";
import { BIconChevronDoubleLeft } from "bootstrap-vue";

@Component({
  components: {
    BIconChevronDoubleLeft,
  },
})
export default class Sidebar extends Vue {
  @Prop(String) readonly url: string | undefined;
  data() {
    return {
      db: null,
    };
  }
  created() {
    this.$data.db = store.getters.search(this.url);
  }
  active() {
    //    console.log("Active sidebar db: "+JSON.stringify(this.$data.db));
    if (!this.$data.db.status) {
      return false;
    }
    return this.$data.db.status.Active;
  }
  state() {
    if (!this.$data.db.status) {
      return "Unknown";
    }
    if (this.$data.db.status.Active) {
      return "Online";
    }
    return "Offline";
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
</style>
