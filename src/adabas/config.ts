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
    private getAxiosConfig(): any {
        return {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
    }
    private status: any;
    async read(): Promise<any> {
        this.status = {};
        return triggerCall('/adabas/config').then((x: any) => {
            this.status = x;
            return x;
        });
    }
    async readUser(): Promise<any> {
        this.status = {};
        return triggerCall('/adabas/rest/access/User').then((x: any) => {
            return x;
        });
    }
    async AddUser(username: string): Promise<any> {
        this.status = {};
        const getConfig = this.getAxiosConfig();
        try {
            return axios
                .post(config.Url() + "/adabas/rest/access/User?user=" + username, {},getConfig);
        }
        catch (error: any) {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload();
                }
            }
            throw error;
        }
    }
    async DeleteUser(username: string): Promise<any> {
        this.status = {};
        const getConfig = this.getAxiosConfig();

        try {
            return axios
                .delete(config.Url() + "/adabas/rest/access/User?user=" + username, getConfig);
        }
        catch (error: any) {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload();
                }
            }
            throw error;
        }
    }
    async AddAdmin(username: string): Promise<any> {
        this.status = {};
        const getConfig = this.getAxiosConfig();

        try {
            return axios
                .post(config.Url() + "/adabas/rest/access/Administrator?user=" + username, {},getConfig);
        }
        catch (error: any) {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload();
                }
            }
            throw error;
        }
    }
    async DeleteAdmin(username: string): Promise<any> {
        this.status = {};
        const getConfig = this.getAxiosConfig();
        try {
            return axios
                .delete(config.Url() + "/adabas/rest/access/Administrator?user=" + username, getConfig);
        }
        catch (error: any) {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload();
                }
            }
            throw error;
        }
    }
    async readLog(): Promise<any> {
        this.status = {};
        return triggerCall('/adabas/rest/log').then((x: any) => {
            return x;
        });
    }
    config(): any {
        return status
    }
    async deleteInstallation(l: string): Promise<AxiosResponse<any>> {
        const getConfig = this.getAxiosConfig();
        try {
            return axios
                .delete(config.Url() + "/adabas/config/module/installation?installation=" + l, getConfig);
        }
        catch (error: any) {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload();
                }
            }
            throw error;
        }
    }
    async deleteMapping(l: string, f: number): Promise<AxiosResponse<any>> {
        const getConfig = this.getAxiosConfig();
        try {
            return axios
                .delete(config.Url() + "/adabas/config/mapping&url=" + l + "&file=" + f, getConfig);
        }
        catch (error: any) {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload();
                }
            }
            throw error;
        }
    }
    async deleteAccess(l: string): Promise<AxiosResponse<any>> {
        const getConfig = this.getAxiosConfig();
        try {
            return axios
                .delete(config.Url() + "/adabas/config/classic&url=" + l, getConfig);
        }
        catch (error: any) {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload();
                }
            }
            throw error;
        }
    }
    async deleteDirectory(l: string): Promise<AxiosResponse<any>> {
        const getConfig = this.getAxiosConfig();
        try {
            return axios
                .delete(config.Url() + "/adabas/config/module/directories&url=" + l, getConfig);
        }
        catch (error: any) {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload();
                }
            }
            throw error;
        }
    }
    async deleteMetric(l: string): Promise<AxiosResponse<any>> {
        const getConfig = this.getAxiosConfig();
        try {
            return axios
                .delete(config.Url() + "/adabas/config/metric&url=" + l, getConfig);
        }
        catch (error: any) {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload();
                }
            }
            throw error;
        }
    }
    async putConfig(c: any): Promise<AxiosResponse<any>> {
        const getConfig = this.getAxiosConfig();
        try {
            return axios
                .put(config.Url() + "/adabas/config", c, getConfig);
        }
        catch (error: any) {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload();
                }
            }
            throw error;
        }
    }
    async store(): Promise<AxiosResponse<any>> {
        const getConfig = this.getAxiosConfig();
        try {
            return axios
                .post(config.Url() + "/adabas/config","", getConfig);
        }
        catch (error: any) {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload();
                }
            }
            throw error;
        }
    }
}
