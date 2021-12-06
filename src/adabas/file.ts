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
    async download(file: string): Promise<any> {
        return triggerCall("/file/access/" + this.current + "?file=" + this.filePath() + "/" + file);
    }
    async upload(file: File): Promise<any> {
        const getConfig = {
            headers: authHeader("multipart/form-data"),
        };
        let fileData = new FormData();
        fileData.append("FileKey", file);
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
            });
    }
}
export async function fileAccessConfig(): Promise<any> {
    return triggerCall("/file/browse");
}