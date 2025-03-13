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
  <div class="holdqueue">
    <MyHeader></MyHeader>
    <HoldqueueList :url="url" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import MyHeader from '@/components/Header.vue';
import HoldqueueList from '@/components/HoldqueueList.vue';

@Component({
  components: {
    MyHeader,
    HoldqueueList,
  },
})
export default class Holdqueue extends Vue {
        @Prop({ type: String, required: false }) readonly url!: string | undefined;
}
</script>
