/*
* Copyright © 2020 Software AG, Darmstadt, Germany and/or its licensors
*
* SPDX-License-Identifier: Apache-2.0
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*
*/


import Home from '@/views/Home.vue'
import Map from '@/views/Map.vue'
import Modify from '@/views/Modify.vue'
import Database from '@/views/Database.vue'
import Metadata from '@/views/Metadata.vue'
import LoginPage from '@/login/LoginPage.vue';
import Databases from '@/admin_views/Databases.vue'
import Containers from '@/admin_views/Containers.vue'
import Browser from '@/admin_views/Browser.vue'
import Files from '@/admin_views/Files.vue'
import Permission from '@/admin_views/Permission.vue'
import Userqueue from '@/admin_views/Userqueue.vue'
import Commandqueue from '@/admin_views/Commandqueue.vue'
import Holdqueue from '@/admin_views/Holdqueue.vue'
import Parameters from '@/admin_views/Parameters.vue'
import Highwater from '@/admin_views/Highwater.vue'
import Adatcp from '@/admin_views/Adatcp.vue'
import NucLog from '@/admin_views/NucLog.vue'
import Threadtable from '@/admin_views/Threadtable.vue'
import UCB from '@/admin_views/UCB.vue'
import Activity from '@/admin_views/Activity.vue'
import Bufferpool from '@/admin_views/Bufferpool.vue'
import Bufferflush from '@/admin_views/Bufferflush.vue'
import Commandstats from '@/admin_views/Commandstats.vue'
import Monitor from '@/admin_views/Monitor.vue'
import DatabaseInfo from '@/admin_views/DatabaseInfo.vue'
import DatabasePlog from '@/admin_views/DatabasePlog.vue'
import Cluster from '@/admin_views/Cluster.vue'
import DatabaseCluster from '@/admin_views/DatabaseCluster.vue'
import Jobs from '@/admin_views/Jobs.vue'
import CreateJob from '@/admin_views/CreateNewJob.vue'
import Checkpoints from '@/admin_views/Checkpoints.vue'
import Description from '@/examples/Description.vue'
import ImageExample from '@/examples/ImageExample.vue'
import UnicodeExample from '@/examples/UnicodeExample.vue'
import NewEmployeeExample from '@/examples/NewEmployeeExample.vue'
import SortedExample from '@/examples/SortedExample.vue'
import DescriptorExample from '@/examples/DescriptorExample.vue'
import Configuration from '@/components/Configuration.vue'
import Log from '@/components/Log.vue'

import { createRouter, createWebHashHistory } from 'vue-router';
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  { path: '/login', 
    name: 'Login', 
    component: LoginPage 
  },
  {
    path: '/map',
    name: 'Map',
    component: Map
  },
  {
    path: '/browser',
    name: 'Browser',
    component: Browser
  },
  {
    path: '/modify',
    name: 'Modify',
    component: Modify
  },
  {
    path: '/metadata',
    name: 'Metadata',
    component: Metadata
  },
  {
    path: '/database',
    name: 'Database',
    component: Database
  },
  {
    path: '/databases',
    name: 'Database List',
    component: Databases
  },
  {
    path: '/cluster',
    name: 'Cluster',
    component: Cluster
  },
  {
    path: '/cluster/:url',
    name: 'Database Cluster',
    component: DatabaseCluster
  },
  {
    path: '/information/:url',
    name: 'Database information',
    component: DatabaseInfo, props: true
  },
  {
    path: '/plogstat/:url',
    name: 'Database PLOG statistics',
    component: DatabasePlog, props: true
  },
  {
    path: '/parameters/:url',
    name: 'Database Parameter',
    component: Parameters, props: true
  },
  {
    path: '/containers/:url',
    name: 'Database Container',
    component: Containers, props: true
  },
  {
    path: '/files/:url',
    name: 'Database Files',
    component: Files, props: true
  },
  {
    path: '/permission/:url',
    name: 'Role-Based-Access Permission',
    component: Permission, props: true
  },
  {
    path: '/userqueue/:url',
    name: 'Database Userqueues',
    component: Userqueue, props: true
  },
  {
    path: '/commandqueue/:url',
    name: 'Database Commandqueues',
    component: Commandqueue, props: true
  },
  {
    path: '/holdqueue/:url',
    name: 'Database Holdqueues',
    component: Holdqueue, props: true
  },
  {
    path: '/highwater/:url',
    name: 'Database High Watermark',
    component: Highwater, props: true
  },
  {
    path: '/adatcp/:url',
    name: 'Database ADATCP Connections',
    component: Adatcp, props: true
  },
  {
    path: '/activity/:url',
    name: 'Database Activity',
    component: Activity, props: true
  },
  {
    path: '/bufferpool/:url',
    name: 'Database Buffer Pool',
    component: Bufferpool, props: true
  },
  {
    path: '/bufferflush/:url',
    name: 'Database Buffer Flush',
    component: Bufferflush, props: true
  },
  {
    path: '/nuclog/:url',
    name: 'Database Nucleus Log',
    component: NucLog, props: true
  },
  {
    path: '/threadtable/:url',
    name: 'Database Thread Table',
    component: Threadtable, props: true
  },
  {
    path: '/ucb/:url',
    name: 'Database UCB',
    component: UCB, props: true
  },
  {
    path: '/cmdstats/:url',
    name: 'Database Command statistics',
    component: Commandstats, props: true
  },
  {
    path: '/monitor/:url',
    name: 'Database Monitor statistics',
    component: Monitor, props: true
  },
  {
    path: '/checkpoints/:url',
    name: 'Database Checkpoints',
    component: Checkpoints, props: true
  },
  {
    path: '/jobs',
    name: 'Job List',
    component: Jobs
  },
  {
    path: '/createjob',
    name: 'Create Job',
    component: CreateJob
  },
  {
    path: '/example_description',
    name: 'Example description',
    component: Description,
    meta: { title: 'Example description' }
  },
  {
    path: '/example_image',
    name: 'Image Example',
    component: ImageExample,
    meta: { title: 'Image example' }
  },
  {
    path: '/example_unicode',
    name: 'Unicode Example',
    component: UnicodeExample,
    meta: { title: 'Unicode example' }
  },
  {
    path: '/example_new_employees',
    name: 'New Employee Example',
    component: NewEmployeeExample,
    meta: { title: 'New employees example' }
  },
  {
    path: '/example_sorted',
    name: 'Sorted Example',
    component: SortedExample,
    meta: { title: 'Sort example' }
  },
  {
    path: '/example_descriptor',
    name: 'Descriptor Example',
    component: DescriptorExample,
    meta: { title: 'Descriptor example' }
  },
  {
    path: '/configuration',
    name: 'Configuration',
    component: Configuration,
    meta: { title: 'Configuration' }
  },
  {
    path: '/log',
    name: 'Log',
    component: Log,
    meta: { title: 'Log' }
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
],
});

export default router;
