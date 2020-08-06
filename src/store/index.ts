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

import Vue from 'vue'
import Vuex from 'vuex'
import { authHeader } from '../user/auth-header';
import axios from 'axios';
import { config } from './config';
import router from '../router/index';
import { userService } from '../user/service';
import { AdabasAdmin, loadDatabases } from '@/adabas/admin';
import {  JobAdmin,loadJobs } from '@/adabas/jobs';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    databases: [],
    adminDatabases: [] as AdabasAdmin[],
    adminJobs: [] as JobAdmin[],
    maps: [],
    records: [],
    metadata: {
      Map: null as any,
    },
    fields: {
      File: null as any,
    },
    url: {
      query: "",
    },
    status: { status: "No status", Dbid: "", },
    respData: {json: ""},
  },
  mutations: {
    SET_DATABASES: (state, dbs) => {
      dbs.forEach((element: any, index: number) => {
        Vue.set(state.databases, index, element);
      });
    },
    SET_ADMIN_DATABASES: (state, dbs) => {
      dbs.forEach((element: any, index: number) => {
        Vue.set(state.adminDatabases, index, element);
      });
    },
    SET_ADMIN_JOBS: (state, jobs) => {
      jobs.forEach((element: any, index: number) => {
        Vue.set(state.adminJobs, index, element);
      });
    },
    SET_MAPS: (state, maps) => {
      // console.log("Set maps " + JSON.stringify(maps));
      maps.forEach((element: any, index: number) => {
        Vue.set(state.maps, index, element);
      });
    },
    SET_METADATA: (state, metadata) => {
      // console.log("Set metadata " + JSON.stringify(metadata));
      Vue.set(state.metadata, 'Map', metadata.Map);
    },
    SET_FIELDS: (state, fields) => {
      // console.log("Set fields " + JSON.stringify(fields));
      Vue.set(state.fields, 'File', fields);
    },
    SET_RECORDS: (state, records) => {
      Vue.set(state.records, 0, records);
    },
    CLEAR_RECORDS: (state, records) => {
      Vue.set(state.records, 0, []);
    },
    SET_URL: (state, url) => {
      Vue.set(state.url, 'query', url);
    },
    SET_STATUS: (state, status) => {
      // state.status = status;
      Vue.set(state.status, 'status', status);
    },
    SET_RESPONSE: (state, respData) => {
      Vue.set(state.respData, 'json', respData);
    },
  },
  actions: {
    INIT_DATABASES: async (context): Promise<any> => {
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
              location.reload(true);
            }

            const error = response.statusText;
            return Promise.reject(new Error(error));
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
              location.reload(true);
            }
          }
          return error
        });
    },
    INIT_MAPS: async (context): Promise<any> => {
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
              location.reload(true);
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
              location.reload(true);
            }
          }
          return error
        });
    },
    SYNC_ADMIN_DBS: async (context): Promise<any> => {
      return loadDatabases().then((databases) => {
        context.commit('SET_ADMIN_DATABASES', databases);
        context.commit("SET_RESPONSE", JSON.stringify(databases));
        return databases;
      });
    },
    SYNC_ADMIN_JOBS: async (context): Promise<any> => {
      return loadJobs().then((jobs) => {
        context.commit('SET_ADMIN_JOBS', jobs);
        context.commit("SET_RESPONSE", JSON.stringify(jobs));
        return jobs;
      });
    },
    QUERY_DB_FILES: async (context, db): Promise<any> => {
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
              location.reload(true);
            }
          }
          return error;
        });
    },
    QUERY_MAP_FIELDS: async (context, mapname): Promise<any> => {
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
              location.reload(true);
            }
          }
          return error;
        });
    },
    QUERY_FILE_FIELDS: async (context, db): Promise<any> => {
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
              location.reload(true);
            }
          }
          return error;
        });
    },
    QUERY_RECORDS: async (context, query): Promise<any> => {
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
            location.reload(true);
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
    search: (state) => (dbid: number) => {
      if (state.adminDatabases.length == 0) {
        console.log("No admin databases found");
        return undefined;
      }
      const x = state.adminDatabases.filter(s => s.dbid() == dbid);
      if (x.length > 0) {
        return x[0];
      }
      console.log("Result fail: "+JSON.stringify(x)+" for "+dbid);
      return undefined;
    }
  },
  modules: {
  }
})
