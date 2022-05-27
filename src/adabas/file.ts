/*
* Copyright © 2020-2021 Software AG, Darmstadt, Germany and/or its licensors
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

import { triggerCall } from "./admin";
import { authHeader } from "../user/auth-header";
import axios, { AxiosResponse } from "axios";
import { config } from "../store/config";
import { userService } from "../user/service";

export class FilePathBrowser {
    private current = "";
    private currentPath = ["/"] as string[];

    constructor(pathName: string) {
        this.current = pathName;
    }
    async config(): Promise<any> {
        return triggerCall("/file/browse");
    }
    set files(path: string) {
        this.currentPath = path.split("/");
    }
    private filePath(): string {
        var fp = "/"
        this.currentPath.forEach((e: string) => {
            fp += e + "/";
        });
        return fp;
    }
    addPath(p: string) {
        this.currentPath.push(p);
    }
    up() {
        this.currentPath.pop();
    }
    async filesQuery(): Promise<any> {
        return triggerCall("/file/browse/" + this.current + "?file=" + this.filePath());
    }
    async read(fileName: string): Promise<any> {
        return triggerCall("/file/access/" + this.current + "?file=" + this.filePath() + "/" + fileName);
    }
    async download(fileName: string): Promise<any> {
        var h = authHeader("application/json");
        const getConfig = {
            headers: authHeader("application/json"),
        };
        axios.get(
            config.Url() + "/file/access/" + this.current + "?file=" + this.filePath() + "/" + fileName,
            { responseType: 'blob', headers: h }
        ).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName); //or any other extension
            document.body.appendChild(link);
            link.click();
        });
    }
    async upload(file: File): Promise<any> {
        const getConfig = {
            headers: authHeader("multipart/form-data"),
        };
        console.log("Upload file...");
        let fileData = new FormData();
        fileData.append("uploadFile", file);
        return axios
            .post(
                config.Url() + "/file/access/" + this.current + "?file=" + this.filePath() + "/" + file.name,
                fileData,
                getConfig
            )
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(
                    error.response.statusText + ":" + JSON.stringify(error.response)
                );
                if (error.response) {
                    if (error.response.status == 401 || error.response.status == 403) {
                        userService.logout();
                        location.reload();
                    }
                }
            });
    }
    async deleteFile(fileName: string): Promise<any> {
        const getConfig = {
            headers: authHeader("application/json"),
        };
        console.log("Delete file...");
        return axios
            .delete(
                config.Url() + "/file/access/" + this.current + "?file=" + this.filePath() + "/" + fileName,
                getConfig
            )
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(
                    error.response.statusText + ":" + JSON.stringify(error.response)
                );
                if (error.response) {
                    if (error.response.status == 401 || error.response.status == 403) {
                        userService.logout();
                        location.reload();
                    }
                }
            });
    }
}
export async function fileAccessConfig(): Promise<any> {
    return triggerCall("/file/browse");
}