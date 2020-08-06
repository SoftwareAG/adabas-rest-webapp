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

import axios from 'axios';

export function authHeader(content: string) {
    let acceptContent = content; // 'application/json';
    if (content === '') {
        acceptContent = '';
    }
    const response = { Authorization: '', Accept: acceptContent };
    // return authorization header with basic auth credentials
    const x = localStorage.getItem('user');
    if (x === null) {
        return response;
    }
    const user = JSON.parse(x);
    if (user.token) {
        const bearerToken = 'Bearer ' + user.token;

        axios.defaults.headers.common.Authorization = authHeader;
        response.Authorization = bearerToken;
        return response;
    }
    if (user && user.authdata) {
        response.Authorization = 'Basic ' + user.authdata;
        return response;
    }
    return response;
}

export function authInitHeader(username: string , password: string) {
    const b = btoa(username + ':' + password);
    return { Authorization: 'Basic ' + b, Accept: 'application/json' };
}

export function jwtAuth() {
    const x = localStorage.getItem('user');
    if (x === null) {
        return '';
    }
    const user = JSON.parse(x);
    return 'Bearer ' + user.token;
}

export function adminRole() : boolean {
    const x = localStorage.getItem('user');
    if (x === null) {
        return false;
    }
    const user = JSON.parse(x);
    return user.AdminRole;
}
