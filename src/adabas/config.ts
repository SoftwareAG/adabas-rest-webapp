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

import { authHeader } from "../user/auth-header";
import { config } from "../store/config";
import { userService } from "../user/service";
import axios, { AxiosResponse } from "axios";
import store from "../store/index";
import { triggerCall } from '@/adabas/admin';

interface AdabasConfigType {
    Adadatadir: string
}

/* 
 * This typescript class AdabasAdmin handles all database administration
 * and monitor tasks provided by Adabas REST server.
 */
export class AdabasConfig {
    private status: any;
    async read(): Promise<any> {
        console.log('Created configuration');
        this.status = {};
        return triggerCall('/adabas/config').then((x: any) => {
            this.status = x;
            return x;
        });
    }
    async readUser(): Promise<any> {
        console.log('Read users');
        this.status = {};
        return triggerCall('/adabas/rest/access/User').then((x: any) => {
            return x;
        });
    }
    async readLog(): Promise<any> {
        console.log('Read users');
        this.status = {};
        return triggerCall('/adabas/rest/log').then((x: any) => {
            return x;
        });
    }
    config(): any {
        return status
    }
    async deleteInstallation(l: string): Promise<AxiosResponse<any>> {
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        try {
            return axios
                .delete(config.Url() + "/adabas/config/module/installation?installation=" + l, getConfig);
        }
        catch (error) {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload(true);
                }
            }
            throw error;
        }
    }
    async deleteMapping(l: string, f: number): Promise<AxiosResponse<any>> {
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        try {
            return axios
                .delete(config.Url() + "/adabas/config/mapping&url=" + l + "&file=" + f, getConfig);
        }
        catch (error) {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload(true);
                }
            }
            throw error;
        }
    }
    async deleteAccess(l: string): Promise<AxiosResponse<any>> {
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        try {
            return axios
                .delete(config.Url() + "/adabas/config/classic&url=" + l, getConfig);
        }
        catch (error) {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload(true);
                }
            }
            throw error;
        }
    }
    async deleteDirectory(l: string): Promise<AxiosResponse<any>> {
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        try {
            return axios
                .delete(config.Url() + "/adabas/config/module/directories&url=" + l, getConfig);
        }
        catch (error) {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload(true);
                }
            }
            throw error;
        }
    }
    async deleteMetric(l: string): Promise<AxiosResponse<any>> {
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        try {
            return axios
                .delete(config.Url() + "/adabas/config/metric&url=" + l, getConfig);
        }
        catch (error) {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload(true);
                }
            }
            throw error;
        }
    }
    async putConfig(c: any): Promise<AxiosResponse<any>> {
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        try {
            return axios
                .put(config.Url() + "/adabas/config", c, getConfig);
        }
        catch (error) {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload(true);
                }
            }
            throw error;
        }
    }
    async store(): Promise<AxiosResponse<any>> {
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        try {
            return axios
                .post(config.Url() + "/adabas/config", getConfig);
        }
        catch (error) {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload(true);
                }
            }
            throw error;
        }
    }
}
