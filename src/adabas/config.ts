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
            console.log("Trigger return" + JSON.stringify(x));
            this.status = x;
            return x;
        });
        // catch (error) {
        //         if (error.response.status == 401 || error.response.status == 403) {
        //             userService.logout();
        //             location.reload(true);
        //         }
        //         throw error;
        //     });
    }
    config(): any {
        return status
    }
}