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

// import Vue from 'vue';
import { version } from 'vue'; // Import the version property from the Vue package
import App from '../App.vue'

export function Url() {
   if (process.env.NODE_ENV === 'development') {
         // return 'https://localhost:61091'; // GO
         return 'http://localhost:8130'; // GO
      // return 'http://localhost:8091'; // Java
   }
   let ref = window.location.origin+window.location.pathname;
   console.log('Ref before:' + ref + ':');
   ref =  ref.replace(/\/+$/g,'')
   console.log('Ref after:' + ref + ':');
   return ref;
}

export function AppName() {
   if (process.env.NODE_ENV === 'development') {
      return '/';
   }
   return '/app';
}

export function Version(): string {
   if (process.env.NODE_ENV === 'development') {
      return 'dev';
   }
   return version;
}

export const config = {
   Url,
   Version,
};
