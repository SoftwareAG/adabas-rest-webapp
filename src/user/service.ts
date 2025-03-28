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

import { config } from '../store/config';
import {  authInitHeader } from './auth-header';

function logout(): void {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
    version();
}

async function handleResponse(response: Response) {
    const text = await response.text();
    const data = text && JSON.parse(text);
    if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
            // auto logout if 401 response returned from api
            logout();
            location.reload();
        }

        const error = (data && data.message) || response.statusText;
        return Promise.reject(error);
    }
    return data;
}

function handleVersionResponse(response: Response): Promise<Response>|any {
    return response.text().then((text: any) => {
        const data = text && JSON.parse(text);
        const v = { version: data.Version };
        localStorage.setItem('version', JSON.stringify(v));
        return v;
    });
}
async function version() {
    const requestOptions = {
        method: 'GET',
        headers: { Accept: 'application/json' },
    };

    const response = await fetch(`${config.Url()}/version`, requestOptions);
    return handleVersionResponse(response);
}
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

// call login with username and password
async function login(username: string, password: string): Promise<Response> {
    console.log("Login function");
    const v = localStorage.getItem('version');
    if (v) {
        const version = JSON.parse(v).version;
    }
    const requestOptions = {
        method: 'POST',
        headers: authInitHeader(username, password),
    };
    const response = await fetch(`${config.Url()}/login`, requestOptions);
    const user = await handleResponse(response);
    console.log("Waiting for 5 seconds...");
    console.log("adarest call = ", `${config.Url()}/login`);
    await sleep(5000);
    console.log("5 seconds passed!");
    // login successful if there's a user in the response
    if (user) {
        // store user details and basic auth credentials in local storage
        // to keep user logged in between page refreshes
        if (user.token===undefined) {
            user.authdata = window.btoa(username + ':' + password);
        }
        if (user.AdminRole===undefined) {
            user.AdminRole = true;
        }
        user.username = username;
        localStorage.setItem('user', JSON.stringify(user));
        // console.log("Save user: " + JSON.stringify(user));
    }
    return user;
}

// get login user name
function getUsername() {
    const x = localStorage.getItem('user');
    if (x === null) {
        return "";
    }
    const user = JSON.parse(x);
    return user.username;
}

export const userService = {
    login,
    logout,
    getUsername,
};
