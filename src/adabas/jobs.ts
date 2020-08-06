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
import axios from "axios";
import { triggerCall } from "./admin";

export class JobAdmin {
    private status: any;
    constructor(dbInput: any) {
        this.status = dbInput;
    }
    start() {
        console.log("Starting ...");
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        return axios
            .put(config.Url() + "/scheduler/job/" + this.status.Job.Name, {}, getConfig)
            .catch((error: any) => {
                if (error.response) {
                    if (error.response.status == 401 || error.response.status == 403) {
                        userService.logout();
                        location.reload(true);
                    }
                }
                throw error;
            });
    }
    name(): string {
        return this.status.Job.Name;
    }
    delete() {
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        return axios
            .delete(config.Url() + "/scheduler/job/" + this.status.Job.Name, getConfig)
            .catch((error: any) => {
                if (error.response) {
                    if (error.response.status == 401 || error.response.status == 403) {
                        userService.logout();
                        location.reload(true);
                    }
                }
                throw error;
            });
    }
    delete_execution(id: string) {
        console.log("Starting ...");
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        return axios
            .delete(config.Url() + "/scheduler/job/" + this.status.Job.Name + "/result/" + id, getConfig)
            .catch((error: any) => {
                if (error.response) {
                    if (error.response.status == 401 || error.response.status == 403) {
                        userService.logout();
                        location.reload(true);
                    }
                }
                throw error;
            });

    }
}

export function insertJob(job: any): Promise<any> {
    const getConfig = {
        headers: authHeader("application/json"),
        useCredentails: true,
    };
    return axios
        .post(config.Url() + "/scheduler/job/", job, getConfig)
        .catch((error: any) => {
            if (error.response) {
                if (error.response.status == 401 || error.response.status == 403) {
                    userService.logout();
                    location.reload(true);
                }
            }
            throw error;
        });
}
export function loadJobs(): Promise<any> {
    return triggerCall("/scheduler/job").then((response: any) => {
        const jobs = [] as any[];
        response.JobDefinition.forEach((element: any) => {
            jobs.push(new JobAdmin(element));
        });
        return jobs;
    });
}
