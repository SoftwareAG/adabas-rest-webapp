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

// CommitChart.ts
import { Bar, mixins } from 'vue-chartjs';
import { Component } from 'vue-property-decorator';

@Component({
    extends: Bar, // this is important to add the functionality to your component
    mixins: [mixins.reactiveProp]
})
export default class CommitChart extends Bar {
  mounted (): void {
    // Overwriting base render method with actual data.
    this.renderChart({
      labels: ['CL','BT','ET'],
      datasets: [
        {
          label: 'Adabas calls',
          backgroundColor: '#f87979',
          data: [0,0,0]
        }
      ]
    })
  }
}

