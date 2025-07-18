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

/* eslint-disable no-console */

import { register } from 'register-service-worker'

if (process.env.NODE_ENV === 'production') {
  // register(`${process.env.BASE_URL}service.ts`, {
  //   ready () {
  //     console.log(
  //       'App is being served from cache by a service worker.\n' +
  //       'For more details, visit https://goo.gl/AFskqB'
  //     )
  //   },
  //   registered () {
  //     console.log('Service worker has been registered.')
  //   },
  //   cached () {
  //     console.log('Content has been cached for offline use.')
  //   },
  //   updatefound () {
  //     console.log('New content is downloading.')
  //   },
  //   updated () {
  //     console.log('New content is available; please refresh.')
  //   },
  //   offline () {
  //     console.log('No internet connection found. App is running in offline mode.')
  //   },
  //   error (error) {
  //     console.error('Error during service worker registration:', error)
  //   }
  // })
}
