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
import { triggerCall } from "./admin";

interface JobJobType {
    Name: string;
    User: string;
    Utility: string;
    Environments: {
        Parameter: string
    }
    Parameters: {
        Parameter: string
    }
}

interface JobExecutionType {
    Ended: string;
    ExitCode: number;
    Log: string;
    Id: string;
    Scheduled: string;
}

interface JobAdminType {
    Executions: JobExecutionType[];
    Job: JobJobType;
    Status: string;
}

export class JobAdmin {
    private status: JobAdminType;
    constructor(dbInput: JobAdminType) {
        this.status = dbInput;
    }
    // Schedule the job
    async start(): Promise<AxiosResponse<any>> {
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        try {
            return axios
                .put(config.Url() + "/scheduler/job/" + this.status.Job.Name, {}, getConfig);
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
    name(): string {
        return this.status.Job.Name;
    }
    async delete(): Promise<AxiosResponse<any>> {
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        try {
            return axios
                .delete(config.Url() + "/scheduler/job/" + this.status.Job.Name, getConfig);
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
    async delete_execution(id: string): Promise<AxiosResponse<any>> {
        console.log("Deleting execution " + id + "...");
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        try {
            return axios
                .delete(config.Url() + "/scheduler/job/" + this.status.Job.Name + "/result/" + id, getConfig);
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

// Insert job in REST server configuration.
export async function insertJob(job: any): Promise<any> {
    const getConfig = {
        headers: authHeader("application/json"),
        useCredentails: true,
    };
    try {
        return axios
            .post(config.Url() + "/scheduler/job/", job, getConfig);
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

// Load all jobs available in REST server. Return array
// of all jobs.
export async function loadJobs(): Promise<any> {
    const response = await triggerCall("/scheduler/jobs");
    const jobs = ([] as JobAdmin[]);
    response.JobDefinition.forEach((element: any) => {
        jobs.push(new JobAdmin(element));
    });
    return jobs;
}

// Load all jobs available in REST server. Return array
// of all jobs.
export async function loadExecutions(jobName: string, from: Date, to: Date): Promise<any> {
    const response = await triggerCall("/scheduler/jobs/" + jobName + "/result?end_time=" + to.toJSON() + "&start_time=" + from.toJSON());
    const executions = ([] as any[]);
    response.JobResults.forEach((element: any) => {
        executions.push(element);
    });
    return executions;
}

export async function loadJobDefinition(jobName: string): Promise<any> {
    return await triggerCall("/scheduler/job/" + jobName);
}
