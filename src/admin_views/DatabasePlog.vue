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
  <div class="databaseplog">
    <MyHeader></MyHeader>
    <DatabasePlogStat :url="url" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import MyHeader from '@/components/Header.vue';
import DatabasePlogStat from '@/components/DatabasePlogStat.vue';

export default defineComponent({
  name: 'DatabasePlog',
  components: {
    MyHeader,
    DatabasePlogStat,
  },
  props: {
    url: {
      type: String as PropType<string | undefined>,
      required: false,
    },
  },
});
</script>
