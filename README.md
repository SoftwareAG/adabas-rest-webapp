# Adabas REST server WebApp

## Introduction

This Web Application provides access to Adabas REST server tasks and data.
The pages contain REST API web URLs used to retrieve the JSON content. The received data is displayed on the web page. Actions are added to the web page as well.

![Login screen](image/login_screen.png)

## Installation

The Adabas REST web application can be compiled using the NPM and Node infrastructure. NPM third party packages need to be installed first. The following command will install the corresponding packages in `node_modules`:

```sh
npm install
```

To finally compile the web application, the distribution needs to be built using the following command:

```sh
npm run build
```

The final Web Application is located in the `dist` directory.

Copy all the files from `dist` and paste it to your installed `AdabasRestAdministration/static` directory.

Browser the web application with url: `http://127.0.0.1:<port number>/` and the Adabas REST server need to be online.


## Usage

The example consists of three parts:

1. The web application provides access to Adabas data. The Adabas data access can use the Adabas Map long name which maps a classic database reference to a long name representation. Alternatively, classic database IDs and short name references can be used.
2. Adabas administration tasks and monitoring access is possible. The creation of Adabas databases and maintaining Adabas parameters and resources are possible. Various monitor data can be requested.
3. The Adabas REST server provides the possibility to start jobs inside the Adabas installation. The scripts are defined in the job list.

Beside the main topics above, a number of short data access example pages are included in the Web application. Large objects and Unicode access to the Adabas database are contained in the Web application.

Nearly all pages display the URL query call and the JSON response output in the corresponding `JSON response` tab.

A menu entry provides the Swagger API web page (`http://127.0.0.1:<port number>/docs`) of the Adabas REST server which can be used to get an overview of the available Adabas REST operations.



### Adabas data access

In the `Adabas Data access` menu you can access the Adabas example page using Adabas Map references. The Adabas Map administration is done using the `Adabas Client for Java` product delivered by Software AG. The Software AG Adabas Data Designer manages creation, import from various import formats and other administration of Adabas Maps.

The Data access web page contains a number of search parameters like search query, descriptor read and sort criteria.

In addition, the Adabas classic way of accessing Adabas data is provided. In the classic Adabas data access you need to define the Adabas database ID and the Adabas file. The corresponding field list and possible descriptors are selectable. Press `Query Data` to request the record result.

To get a deep insight into the Adabas Map metadata, it can be evaluated using the `Adabas Map Metadata` entry.

Adabas data records can be modified using the `Modify record` page.

### Adabas administration and monitoring

In the `Database administration` menu entry the corresponding list of Adabas databases can be viewed. It is possible to administrate and monitor various operations on the database. Depending on the online state, some actions are invisible.

**Please keep in mind that shutdown and delete operations and modifications are done on Adabas databases!!!!!**

![Database list](image/databases_list.png)

The start and stop of the Adabas databases is initiated in the background. Please have a look in the Adabas nucleus log to see the current state. The Adabas databases have a number of tasks which are displayed using the corresponding menus.

Various monitoring tasks are updated periodically. Start and stop operations are called directly.

#### Monitoring

Various items of Adabas monitoring data can be retrieved. The number of table entries is not cached or optimized. A huge number of queue entries might influence the web application performance.

![Command statistics](image/command_stats.png)


### Job control

To start and display jobs, the `Job list` menu entry can be used.

![Job control](image/job_control.png)

Job modifications are not added to the web application example.

## Summary

The example pages don't use all of the REST API possibilities. Some new or enhanced features are not available. Even queue modifications, like stop or delete user queue entries, are not possible. The ability to see the full user queue information is not part of the web application example.

**But note: Adabas file delete or refresh operations are part of the web application**

Have fun and stay healthy!

______________________
These tools are provided as-is and without warranty or support. They do not constitute part of the Software AG product suite. Users are free to use, fork and modify them, subject to the license agreement. While Software AG welcomes contributions, we cannot guarantee to include every contribution in the master project.
______________
For more information you can Ask a Question in the [TECHcommunity Forums](https://tech.forums.softwareag.com/tag/adabas).

You can find additional information in the [Software AG TECHcommunity](http://techcommunity.softwareag.com/home/-/product/name/adabas).
______________
Contact us at [TECHcommunity](mailto:technologycommunity@softwareag.com?subject=Github/SoftwareAG) if you have any questions.
