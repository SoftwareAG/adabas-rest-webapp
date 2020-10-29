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

interface AdabasAdminType {
    Active: boolean;
    Dbid: number;
    Name: string;
    StructureLevel: number;
    Version: string;
}

/* 
 * This typescript class AdabasAdmin handles all database administration
 * and monitor tasks provided by Adabas REST server.
 */
export class AdabasAdmin {
    private status: AdabasAdminType;
    constructor(dbInput: AdabasAdminType) {
        this.status = dbInput;
    }
    // Provide online status of this database
    online(): boolean {
        return this.status.Active;
    }
    // Provide the database id of the database
    dbid(): number {
        return this.status.Dbid;
    }
    // Provide the database name defined in the configuration of the database
    name(): string {
        return this.status.Name;
    }
    // Provide text file of Nucleus Log
    async nucleusLog(): Promise<any> {
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        store.commit('SET_URL', { url: config.Url() + "/adabas/database/" + this.status.Dbid + "/nuclog", method: "get" });
        try {
            const response = await axios
                .get(config.Url() + "/adabas/database/" + this.status.Dbid + "/nuclog", getConfig);
            return response.data.Log.Log;
        }
        catch (error) {
            if (error.response.status == 401 || error.response.status == 403) {
                userService.logout();
                location.reload(true);
            }
            throw error;
        }
    }
    // General database operation call which provide start, shutdown, cancel and abort of the Adabas database.
    callOperation(operation: string): Promise<any> {
        return triggerCall("/adabas/database/" + this.status.Dbid + ":" + operation);
    }
    // Delete the database with all container and data !!!!!!
    async delete(): Promise<AxiosResponse<any>> {
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        try {
            return axios
                .delete(config.Url() + "/adabas/database/" + this.status.Dbid, getConfig);
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
    // Provide the activity statistics
    activityStats(): Promise<any> {
        return triggerCallOnParameter("/adabas/database/" + this.status.Dbid + "/actstats", "Statistics");
    }
    // Provide Bufferpool statistics values
    bpStats(): Promise<any> {
        return triggerCallOnParameter("/adabas/database/" + this.status.Dbid + "/bpstats", "Statistics");
    }
    // Provide the current active command queue entries
    commandQueue(): Promise<any> {
        return triggerCallOnArray("/adabas/database/" + this.status.Dbid + "/commandqueue", ["CommandQueue", "Commands"]);
    }
    // Provide the current active user queue entries
    userQueue(): Promise<any> {
        return triggerCallOnArray("/adabas/database/" + this.status.Dbid + "/userqueue", ["UserQueue", "UserQueueEntry"]);
    }
    // Provide the current active hold queue entries
    holdQueue(): Promise<any> {
        return triggerCallOnArray("/adabas/database/" + this.status.Dbid + "/holdqueue", ["HoldQueue"]);
    }
    // Provide the current command statistics showing the number of call per Adabas command
    commandStats(): Promise<any> {
        return triggerCallOnArray("/adabas/database/" + this.status.Dbid + "/commandstats", ["CommandStats", "Commands"]);
    }
    // Provide the container list with size
    containerList(): Promise<any> {
        return triggerCallOnArray("/adabas/database/" + this.status.Dbid + "/container", ["Container", "ContainerList"]);
    }
    // Get the Adabas file list of the Adabas database
    fileList(): Promise<any> {
        return triggerCallOnArray("/adabas/database/" + this.status.Dbid + "/file", ["Files"]);
    }
    // Get detailed file information of a file in the Adabas database
    fileInfo(file: number): Promise<any> {
        return triggerCallOnParameter("/adabas/database/" + this.status.Dbid + "/file/" + file, "File");
    }
    // Get detailed database detailed parameter information
    parameterInfo(): Promise<any> {
        return triggerCallOnArray("/adabas/database/" + this.status.Dbid + "/parameterinfo", ["ParameterInfo", "Parameter"]);
    }
    // Get parameters (without metadata) of the Adabas database
    async parameters(staticType: boolean): Promise<any> {
        let r = await triggerCallOnParameter("/adabas/database/" + this.status.Dbid + "/parameter?type=" + (staticType ? "static" : "dynamic"), "Parameter");
        if (!staticType) {
            const dynamicFields = (["BFIO", "LOGGING", "NISNHQ", "OPTIONS",
                "TNAA", "TNAE", "TNAX", "TT",
                "RPL_RECORDS", "RPL_BLOCKS", "RPL_TOTAL", "WRL"] as string[]);
            r = r.filter((a: any) => {
                return (dynamicFields.indexOf(a.Name) !== -1);
            });
            return r;
        }
        return r;
    }
    // Get the current thread table usage of the Adabas database
    threadTable(): Promise<any> {
        return triggerCallOnArray("/adabas/database/" + this.status.Dbid + "/threadtable", ["Threads"]);
    }
    // Get the list of utility communication block (UCB) which are pending
    ucb(): Promise<any> {
        return triggerCallOnArray("/adabas/database/" + this.status.Dbid + "/ucb", ["UCB", "UCB"]);
    }
    // Get the general control block information of the Adabas database
    information(): Promise<any> {
        return triggerCall("/adabas/database/" + this.status.Dbid + "/gcb");
    }
    // Delete the given Adabas file number (all data is removed as well)!!
    async deleteFile(file: number): Promise<any> {
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        try {
            return axios
                .delete(config.Url() + "/adabas/database/" + this.status.Dbid + "/file/" + file, getConfig);
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
    async renameDatabase(newName: string): Promise<any> {
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        return axios
            .put(config.Url() + "/adabas/database/"
                + this.status.Dbid + "?name=" + newName, {}, getConfig)
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
    // Adabas file number can be renumbered
    async renumberFile(file: number, newNr: string): Promise<any> {
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        return axios
            .put(config.Url() + "/adabas/database/"
                + this.status.Dbid + "/file/" + file
                + ":renumber?number=" + newNr, {}, getConfig)
            .catch((error: any) => {
                console.log("E: " + JSON.stringify(error));
                if (error.response) {
                    if (error.response.status == 401 || error.response.status == 403) {
                        userService.logout();
                        location.reload(true);
                    }
                }
                throw error;
            });
    }
    // Refresh content of a given Adabas file number (attention: data is lost)!!!
    async refreshFile(file: number): Promise<any> {
        const getConfig = {
            headers: authHeader("application/json"),
            useCredentails: true,
        };
        try {
            return axios
                .put(config.Url() + "/adabas/database/" + this.status.Dbid + "/file/" + file + ":refresh", {}, getConfig);
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
    // Retrieve the field information of a given Adabas file number (FDT)
    async fileFields(file: number): Promise<any> {
        const response = await triggerCall("/adabas/database/" + this.status.Dbid + "/fields/" + file);
        const f = ([] as any[]);
        response.FDT.Fields.forEach((element: any) => {
            f.push(element);
        });
        if (response.FDT.Descriptors !== null) {
            response.FDT.Descriptors.forEach((element_1: any) => {
                f.push(element_1);
            });
        }
        if (response.FDT.Referentials !== null) {
            response.FDT.Referentials.forEach((element_2: any) => {
                f.push(element_2);
            });
        }
        return f;
    }
    // Retrieve current Adabas Highwater mark information
    async highWaterMark(): Promise<any> {
        const response = await triggerCall("/adabas/database/" + this.status.Dbid + "/hwm");
        const highwater = ([] as any[]);
        ["UserQueue", "APU", "AttachedBuffer", "Bufferpool", "ClientQueue", "CommandQueue",
            "ProtectionArea", "TransactionTime", "Workpool", "ProtectionAreaActive", "LABX",
            "ComplexSearch", "GroupCommit", "HQUserLimit", "HoldQueue", "Threads"].forEach((element: string) => {
                const high = response.HighWater[element + "HighWaterMark"];
                let size = response.HighWater[element + "Size"];
                if (element == "Threads") {
                    size = response.HighWater["ThreadSize"];
                }
                if (!size) {
                    size = 1;
                }
                if (high) {
                    let p = "";
                    if (size > 0) {
                        p = (high.inuse / size * 100).toFixed(2);
                        //                   console.log(element+" "+high.inuse+" "+high.high+" "+p);
                    }
                    highwater.push({
                        Area: element, Size: size, InUse: high.inuse,
                        High: high.high, Time: high.time, Percent: p
                    });
                }
                else {
                    console.log("Unknown " + element);
                }
            });
        return highwater;
    }
    // Retrieve a list of checkpoints in the database in an given time frame
    checkpoints(from: string, to: string): Promise<any> {
        return triggerCallOnArray("/adabas/database/" + this.status.Dbid + "/checkpoints?end_time=" + to + "&start_time=" + from, ["Checkpoints"]);
    }
}

// This is a trigger call wrapper methods which takes JSON parameter and generates
// any array of parameters needed for a table.
async function triggerCallOnParameter(resource: string, dataName: string): Promise<any> {
    const response = await triggerCall(resource);
    const p = ([] as any[]);
    Object.entries(response[dataName]).forEach((key: any) => {
        p.push({ Name: key[0], Value: key[1] });
    });
    store.commit('SET_STATUS', 'OK');
    return p;
}

// trigger a call which receives an array, dependent on the given Array path
// the array is found.
async function triggerCallOnArray(resource: string, dataNames: string[]): Promise<any> {
    const response = await triggerCall(resource);
    const p = ([] as any[]);
    let r = response;
    for (const i in dataNames) {
        r = r[dataNames[i]];
        if (!r) {
            console.log("Error data " + dataNames[i] + ":" + JSON.stringify(response));
            return;
        }
    }
    r.forEach((element: any) => {
        p.push(element);
    });
    store.commit('SET_STATUS', 'OK');
    return p;
}
// Trigger a AXIOS REST API call retrieving the corresponding content of 
// the trigger and handle error code, statistic storage which will be displayed
// in the web page. Stored are URL and content of the retrieved call
export async function triggerCall(resource: string): Promise<any> {
    const getConfig = {
        headers: authHeader("application/json"),
        useCredentails: true,
    };
    store.commit('SET_URL', { url: config.Url() + resource, method: "get" });
    try {
        const response = await axios
            .get(config.Url() + resource, getConfig);
        store.commit('SET_STATUS', 'OK');
        store.commit('SET_RESPONSE', JSON.stringify(response));
        return response.data;
    }
    catch (error) {
        if (error.response) {
            store.commit('SET_STATUS', JSON.stringify(error.response));
            if (error.response.status == 401 || error.response.status == 403) {
                userService.logout();
                location.reload(true);
            }
        }
        else {
            store.commit('SET_STATUS', JSON.stringify(error));
            console.log("Skip logout" + JSON.stringify(error));
        }
        throw error;
    }
}

// Trigger a call loading all database and create a list of AdabasAdmin instances
// per stored database.
export async function loadDatabases(): Promise<any> {
    const response = await triggerCall("/adabas/database");
    store.commit('SET_STATUS', 'OK');
    const databases = ([] as AdabasAdmin[]);
    response.Database.forEach((element: AdabasAdminType) => {
        databases.push(new AdabasAdmin(element));
    });
    return databases;
}
