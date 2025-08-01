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

import { reactive } from 'vue';
import { createStore } from "vuex";
import { authHeader } from '../user/auth-header';
import axios from 'axios';
import { config } from './config';
import router from '../router/index';
import { userService } from '../user/service';
import { AdabasAdmin, loadDatabases, loadCluster } from '../adabas/admin';
import {  JobAdmin,loadJobs } from '../adabas/jobs';

export default createStore({
  state: {
    databases: [] as any[],
    adminDatabases: [] as AdabasAdmin[],
    adminJobs: [] as JobAdmin[],
    maps: [] as any[],
    records: [] as any[],
    metadata: {
      Map: null as any,
    },
    fields: {
      File: null as any,
    },
    url: {
      query: "",
    },
    cluster: {},
    status: { status: "No status", Dbid: "", },
    respData: {json: ""},
  },
  mutations: {
    SET_DATABASES: (state: any, dbs: any) => {
      dbs.forEach((element: any, index: number) => {
        state.databases[index] = element;
      });
    },
    SET_ADMIN_DATABASES: (state: any, dbs: any) => {
      state.adminDatabases = dbs;
    },
    SET_ADMIN_CLUSTER: (state: any, cls: any) => {
      state.cluster = { ...state.cluster, cluster: cls };
    },
    SET_ADMIN_JOBS: (state: any, jobs: any) => {
      jobs.forEach((element: any, index: number) => {
        state.adminJobs[index] = element;
      });
    },
    SET_MAPS: (state: any, maps: any) => {
      // console.log("Set maps " + JSON.stringify(maps));
      maps.forEach((element: any, index: number) => {
        state.maps[index] = element;
      });
    },
    SET_METADATA: (state: any, metadata: any) => {
      // console.log("Set metadata " + JSON.stringify(metadata));
      state.metadata.Map = metadata.Map;
    },
    SET_FIELDS: (state: any, fields: any) => {
      // console.log("Set fields " + JSON.stringify(fields));
      state.fields.File = fields;
    },
    SET_RECORDS: (state: any, records: any) => {
      state.records = records;
    },
    CLEAR_RECORDS: (state: any, records: any) => {
      state.records = [];
    },
    SET_URL: (state: any, url: any) => {
      state.url.query = url;
    },
    SET_STATUS: (state: any, status: any) => {
      // state.status = status;
      state.status.status = status;
    },
    SET_RESPONSE: (state: any, respData: any) => {
      state.respData = reactive({ json: respData });
    },
  },
  actions: {
    INIT_DATABASES: async (context: any): Promise<any> => {
      
      const getConfig = {
        headers: authHeader('application/json'),
        useCredentails: true,
      };
      // console.log('Init receiving Adabas Databases');
      context.commit('SET_URL',{url:  config.Url() + "/rest/db",method: "get"});
      return await axios.get(config.Url() + '/rest/db',
        getConfig).then((response: any) => {
          // console.log("Received: " + JSON.stringify(response));
          if (response.status !== 200) {
            console.log('Error receiving Albums ' + response.status);
            if (response.status === 401 || response.status === 404) {
              // auto logout if 401 response returned from api
              userService.logout();
              location.reload();
            }

            const error = response.statusText;
            return Promise.reject(new Error(error));
          }
          if (response === undefined) {
            // console.log("Response undefined ..." + response.text());
            return;
          }
          if (response.data === undefined) {
            console.log('Response data undefined ...' + response.text());
            console.log('Error receiving Albums: ' + JSON.stringify(response));
            return;
          }
          context.commit('SET_DATABASES', response.data.Databases);
          context.commit('SET_STATUS', JSON.stringify(response.statusText));
          return response.data.Databases;
        })
        .catch((error: any) => {
          console.log("Error init map: " + JSON.stringify(error));
          context.commit('SET_STATUS', JSON.stringify(error));

          if ((error.response.status == 401) || (error.response.status == 403)) {
            userService.logout();
            if (router.currentRoute.name !== 'login') {
              location.reload();
            }
          }
          return error
        });
    },
    INIT_MAPS: async (context: any): Promise<any> => {
      const getConfig = {
        headers: authHeader('application/json'),
        useCredentails: true,
      };
      // console.log('Init receiving Adabas Maps');
      context.commit('SET_URL',{url:  config.Url() + "/rest/map",method: "get"});
      return await axios.get(config.Url() + '/rest/map',
        getConfig).then((response: any) => {
          if (response.status !== 200) {
            console.log('Error receiving Albums ' + response.status);
            if (response.status === 401 || response.status === 404) {
              // auto logout if 401 response returned from api
              userService.logout();
              location.reload();
            }

            const error = response.statusText;
            return Promise.reject(error);
          }
          if (response === undefined) {
            console.log("Response undefined ..." + response.text());
            return;
          }
          if (response.data === undefined) {
            console.log('Response data undefined ...' + response.text());
            console.log('Error receiving Albums: ' + JSON.stringify(response));
            return;
          }
          context.commit('SET_MAPS', response.data.Maps);
          context.commit('SET_STATUS', JSON.stringify(response.statusText));
          return response;
        })
        .catch((error: any) => {
          console.log("Error init map: " + JSON.stringify(error));
          context.commit('SET_STATUS', JSON.stringify(error));

          if ((error.response.status == 401) || (error.response.status == 403)) {
            userService.logout();
            if (router.currentRoute.name !== 'login') {
              location.reload();
            }
          }
          return error
        });
    },
    SYNC_ADMIN_DBS: async (context: any): Promise<any> => {
      return loadDatabases().then((databases) => {
        context.commit('SET_ADMIN_DATABASES', databases);
        context.commit("SET_RESPONSE", JSON.stringify(databases));
        return databases;
      });
    },
    SYNC_ADMIN_CLUSTER: async (context: any): Promise<any> => {
      return loadCluster().then((cluster) => {
        context.commit('SET_ADMIN_CLUSTER', cluster);
        context.commit("SET_RESPONSE", JSON.stringify(cluster));
        return cluster;
      });
    },
    SYNC_ADMIN_JOBS: async (context: any): Promise<any> => {
      return loadJobs().then((jobs) => {
        context.commit('SET_ADMIN_JOBS', jobs);
        context.commit("SET_RESPONSE", JSON.stringify(jobs));
        return jobs;
      });
    },
    QUERY_DB_FILES: async (context: any, db: any): Promise<any> => {
      const getConfig = {
        headers: authHeader('application/json'),
        useCredentails: true,
      };
      if ((db === null) || (db === '')) {
        return Promise.reject("Map name missing");
      }
      // console.log('Evaluate map fields for ' + db);
      context.commit('SET_URL',{url:  config.Url() + "/rest/db/"+db,method: "get"});
      return await axios.get(config.Url() + '/rest/db/' + db,
        getConfig).then((response: any) => {
          // console.log("Response database files " + JSON.stringify(response));
          context.commit('SET_STATUS', response.statusText);
          context.commit("SET_RESPONSE", JSON.stringify(response));
          return response.data.Files;
        }).catch((error) => {
          context.commit('SET_STATUS', JSON.stringify(error));
          if ((error.response.status == 401) || (error.response.status == 403)) {
            userService.logout();
            if (router.currentRoute.name !== 'login') {
              location.reload();
            }
          }
          return error;
        });
    },
    QUERY_MAP_FIELDS: async (context: any, mapname: any): Promise<any> => {
      const getConfig = {
        headers: authHeader('application/json'),
        useCredentails: true,
      };
      if ((mapname === null) || (mapname === '')) {
        return Promise.reject("Map name missing");
      }
      // console.log('Evaluate map fields for ' + mapname);
      context.commit('SET_URL',{url:  config.Url() + "/rest/metadata/map//"+mapname,method: "get"});
      return await axios.get(config.Url() + '/rest/metadata/map/' + mapname,
        getConfig).then((response: any) => {
          // console.log("Response map metadata " + JSON.stringify(response));
          context.commit('SET_METADATA', response.data);
          context.commit('SET_RESPONSE',JSON.stringify(response));
          return response;
        }).catch((error) => {
          context.commit('SET_STATUS', JSON.stringify(error));
          if ((error.response.status == 401) || (error.response.status == 403)) {
            userService.logout();
            if (router.currentRoute.name !== 'login') {
              location.reload();
            }
          }
          return error;
        });
    },
    QUERY_FILE_FIELDS: async (context: any, db: any): Promise<any> => {
      const getConfig = {
        headers: authHeader('application/json'),
        useCredentails: true,
      };
      if ((db.file === null) || (db.file === '')) {
        return Promise.reject("Field name missing");
      }
      context.commit('SET_URL',{url:  config.Url() + '/rest/fields/'+db.url+'/' + db.file,method: "get"});
      return await axios.get(config.Url() + '/rest/fields/'+db.url+'/' + db.file,
        getConfig).then((response: any) => {
          context.commit('SET_FIELDS', response.data);
          return response;
        }).catch((error) => {
          context.commit('SET_STATUS', JSON.stringify(error));
          if ((error.response.status == 401) || (error.response.status == 403)) {
            userService.logout();
            if (router.currentRoute.name !== 'login') {
              location.reload();
            }
          }
          return error;
        });
    },
    QUERY_RECORDS: async (context: any, query: any): Promise<any> => {
      const getConfig = {
        headers: authHeader('application/json'),
        useCredentails: true,
      };
      context.commit('SET_URL',{url: query,method: "get"});
      return await axios.get(query,
        getConfig).then((response: any) => {
          context.commit('SET_RECORDS', response.data);
          context.commit('SET_STATUS', response.statusText);
          context.commit("SET_RESPONSE", JSON.stringify(response));
          console.log("Query response status: " + response.statusText);
          return response;
        }).catch((error: any) => {
          console.log("Query data error: " + JSON.stringify(error));
          console.log("Query data response: " + error.response.statusText);
          context.commit('CLEAR_RECORDS', null);
          if ((error.response.status == 401) || (error.response.status == 403)) {
            userService.logout();
            location.reload();
          }
          if (error.response.data.Error) {
            context.commit('SET_STATUS', JSON.stringify(error.response.data.Error));
          } else {
            context.commit('SET_STATUS', error.response.statusText);
          }
          throw error;
        });
    },
  },
  getters: {
    search: (state: { adminDatabases: { dbid: () => number }[] }) => (dbid: number) => {
      if (state.adminDatabases.length === 0) {
        console.log("No admin databases found");
        return undefined;
      } 
      const x = state.adminDatabases.filter((s) => s.dbid() == dbid);
      
      if (x.length > 0) {
        return x[0];
      }

      return undefined;
    }
  },
  modules: {
  }
})
