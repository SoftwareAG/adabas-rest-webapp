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
  <div class="home">
    <MyHeader></MyHeader>
    <HelloWorld msg="Adabas RESTful server"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MyHeader from '@/components/Header.vue';
import HelloWorld from '@/components/HelloWorld.vue';

export default defineComponent({
  components: {
    MyHeader,
    HelloWorld,
  },
});
</script>
