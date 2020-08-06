<!-- TOC -->

- [1. Adabas Data access](#1-adabas-data-access)
  - [1.1. Adabas REST Server API](#11-adabas-rest-server-api)
  - [1.2. Format](#12-format)
  - [1.3. Type](#13-type)
  - [1.4. Location Reference Path](#14-location-reference-path)
- [2. Access Adabas data](#2-access-adabas-data)
  - [2.1. Adabas read and search](#21-adabas-read-and-search)
  - [2.2. Adabas insert and update](#22-adabas-insert-and-update)
  - [2.3. Adabas delete](#23-adabas-delete)
  - [2.4. Adabas Search](#24-adabas-search)
    - [2.4.1. Direct search](#241-direct-search)
    - [2.4.2. Search ranges](#242-search-ranges)
    - [2.4.3. Special searches](#243-special-searches)
    - [2.4.4. Result schema](#244-result-schema)
  - [2.5. Update and insert](#25-update-and-insert)
  - [2.6. Adabas RESTful Example Application](#26-adabas-restful-example-application)
    - [2.6.1. Prerequisites](#261-prerequisites)
      - [2.6.1.1. TestMapEmployee](#2611-testmapemployee)
      - [2.6.1.2. TestMapVehicles](#2612-testmapvehicles)
  - [2.7. The Example](#27-the-example)

<!-- /TOC -->

# 1. Adabas Data access

The Adabas REST server included in the Adabas Client for Java package can be used to access Adabas data using any programming language that supports the HTTP protocol. The REST server provides an HTTP entry point to read (GET), create (POST), update (PUT) and delete (DELETE) Adabas records. The read (GET) functionality is set up in advance to be used with query search and sort parameters. The server can deliver the response in two formats, JSON and XML.

## 1.1. Adabas REST Server API

This section describes the Adabas REST Server API; a sample application that uses the REST interface is described in the following section.

The complete REST API is defined using the Standard called Swagger. The corresponding `swagger.yaml` file is part of the delivery.

A standard request URL to read Adabas data from a database has the following form:

```http
http(s)://<host name>:<port>/<format>/<type>/<location reference path>
```

The host name is the name or an alias name of the machine on which the REST server is running. You must ensure that this name can be resolved using the standard naming service mechanisms. The port number is specified in the REST server configuration file (see Adabas REST Server Configuration).

- Format
- Type
- Location Reference Path
- Examples
- Adabas RESTful Example Application

## 1.2. Format

A request path starts with the format specification. The following formats are available:

| Format  |  Explanation |
|---|---|
| /rest/  | The /rest/ path is the main point from which to query data. The default format when you use REST is JSON. However, the return type can be changed by using the "Accept:" header entry.  |

The HTTP-Accept header is used to determine the response format. If the header is sent, it is used to specify the format.

## 1.3. Type

The second element of the request path is the type specification. It can be `/db/`, to access a database directly, or `/map/`, to access the database via a map definition. The type path element is followed by the location reference path.

**Note:**
a Adabas Map definition always contains a reference to the database ID and file number, so it is not necessary to specify them in a request.

## 1.4. Location Reference Path

The HTTP location reference path consists of several parts that define the resource to be accessed. Depending on the type, the reference path consists of various path elements:

| Type  |Path Element|  Explanation |
|---|---|---|
| /db/  |* Database ID * File number * [ISN] * [Adabas field]| The database ID and file number can be specified. If you want to access a specific record and know the associated ISN, the ISN can be addressed directly. |
| /map/	| * Map name *[ISN] * [Map field name]|A predefined map can be accessed directly by using the map reference.|

In addition to the location reference, a number of parameters can be used to modify the request that is sent:

|Parameter|	Explanation|
|---|---|
|fields	|Defines a list of field requests for the resulting data.|
|start	|Defines the offset or ISN from which to start reading.|
|limit	|Limits the number of returned entries.|
|sorted_by	|Provides one field that will be used to sort the resulting data. Currently, the field used with sorted_by must be an Adabas descriptor.|
|search	|With the search parameter a standard search phrase can be provided. For example "AE='SMITH'" or "LastName='SMITH'"; *a complex JSON query with additional information can be sent to the server. |

These parameters are specified in the standard HTTP fashion - '?fileds=AC,AE&limit=10'.

# 2. Access Adabas data

The RESTful read and search access to Adabas REST server is defined by the HTTP GET method.

## 2.1. Adabas read and search

A request to read ISN 1 from database ID 4 and file 11 has the following form:

```http
http://localhost:8190/rest/db/4/11/1
```

This request will return the following data in JSON format (default):

```JSON
{"NrRecords":1,"FileRecords":-1,"Records":[{"ISN":1,"AA":"50005800","AB":{"AC":"SIMONE","AD":"","AE":"ADAM"},"AF":"M","AG":"F","AH":712981,"A1":{"AI":["26 AVENUE RHIN ET DA"],"AJ":"JOIGNY","AK":"89300","AL":"F"},"A2":{"AM":"44864858","AN":"1033"},"AO":"VENT59","AP":"CHEF DE SERVICE","AQ":[{"AR":"EUR","AS":963,"AT":[138]}],"A3":{"AU":19,"AV":5},"AW":[{"AX":19990801,"AY":19990831}],"AZ":["FRE","ENG"]}]}
```

The same request with an HTTP-Accept header 'Accept: application/xml' (or use format specification '/xml/') will result in the following output:

```xml
<?xml version="1.0" encoding="UTF-8"?><Response><Record ISN="1"><AA sn="AA">50005800</AA><Group sn="AB"><AC sn="AC">SIMONE</AC><AE sn="AE">ADAM</AE><AD sn="AD"></AD></Group><AF sn="AF">M</AF><AG sn="AG">F</AG><AH sn="AH">712981</AH><Group sn="A1"><Multiple sn="AI"><AI sn="AI">26 AVENUE RHIN ET DA</AI></Multiple><AJ sn="AJ">JOIGNY</AJ><AK sn="AK">89300</AK><AL sn="AL">F</AL></Group><Group sn="A2"><AN sn="AN">1033</AN><AM sn="AM">44864858</AM></Group><AO sn="AO">VENT59</AO><AP sn="AP">CHEF DE SERVICE</AP><Period sn="AQ"><Entry><AR sn="AR">EUR</AR><AS sn="AS">963</AS><Multiple sn="AT"><AT sn="AT">138</AT></Multiple></Entry></Period><Group sn="A3"><AU sn="AU">19</AU><AV sn="AV">5</AV></Group><Period sn="AW"><Entry><AX sn="AX">19990801</AX><AY sn="AY">19990831</AY></Entry></Period><Multiple sn="AZ"><AZ sn="AZ">FRE</AZ><AZ sn="AZ">ENG</AZ></Multiple></Record></Response>
```

A request to read only 20 records and only the fields AC and AE from database ID 4 and file 11 has the following form:

```http
http://localhost/:8190/rest/db/4/11?fields=AC,AE&limit=20
```

If there is a map definition with the name "MY-EMPLOYEES-MAP", created with the Adabas Data Designer for the example file 11 (EMPLOYEES-NAT) of database 4, a request to read ISN 1 using this map definition has the following form:

```http
http://localhost:8190/rest/map/MY-EMPLOYEES-MAP/1
```

This request will return the following data in JSON format (default):

```json
{"NrRecords":1,"FileRecords":-1,"Records":[{"ISN":1,"personnnel-id":"50005800","full-name":{"name":"ADAM","middle-name":"","first-name":"SIMONE"},"mar-stat":"M","sex":"F","birth":712981,"full-address":{"post-code":"89300","address-line":["26 AVENUE RHIN ET DA"],"country":"F","city":"JOIGNY"},"telephone":{"area-code":"1033","phone":"44864858"},"dept":"VENT59","job-title":"CHEF DE SERVICE","income":[{"curr-code":"EUR","bonus":[138],"salary":963}],"leave-date":{"leave-taken":5,"leave-due":19},"leave-booked":[{"leave-start":19990801,"leave-end":19990831}],"language":["FRE","ENG"]}]}
```

**Note:**
The long names for the fields defined in the map are returned rather than the short names (see the first example above).

A request to read only 20 records and only the two fields first-name and name from the map has the following form:

```http
GET
http://localhost:8190/rest/map/EMPLOYEES-MAP?fields=first-name,name&limit=20
```

This request will return the following data in JSON format (default):

```JSON
{"NrRecords":20,"FileRecords":-1,"Records":[{"ISN":1,"full-name":{"name":"ADAM","first-name":"SIMONE"}},{"ISN":2,"full-name":{"name":"MORENO","first-name":"HUMBERTO"}},{"ISN":3,"full-name":{"name":"BLOND","first-name":"ALEXANDRE"}},{"ISN":4,"full-name":{"name":"MAIZIERE","first-name":"ELISABETH"}},{"ISN":5,"full-name":{"name":"CAOUDAL","first-name":"ALBERT"}},{"ISN":6,"full-name":{"name":"VERDIE","first-name":"BERNARD"}}...]}
```

Example requests:

| Request | Result |
|---|---|
| GET http://localhost:8190/rest/map/EMPLOYEES-MAP/*/name | Returns field name of all records in ISN order |
| GET http://localhost:8190/rest/map/EMPLOYEES-MAP?search=name=ADAM | Search all fields for name is equal 'ADAM' |
| GET http://localhost:8190/rest/map/EMPLOYEES-MAP?search=name=ADAM&descriptor=true | Search fields with name equal 'ADAM' and return the quantity of the records |
| GET http://localhost:8190/rest/map/EMPLOYEES-MAP/*/NAME?sorted_by=name | Read and sort field 'name' |
| GET http://localhost:8190/rest/map/EMPLOYEES-MAP?search=name=ADAM&fields=full-name,full-address |Search for 'name' contains 'ADAM' and return full-name and full-address of the record |
| GET http://localhost:8190/rest/map/EMPLOYEES-MAP?search=name=ADAM&fields=full-name,full-address |Search for 'name' contains 'ADAM' and return full-name and full-address of the record |
| GET http://localhost:8190/rest/map/EMPLOYEES-MAP?search=name=ADAM&fields=full-name,full-address&flatten=true |Search for 'name' contains 'ADAM' and return full-name and full-address of the record, group hierarch is removed (flatten) |
| GET http://localhost:8190/rest/map/EMPLOYEES-MAP?search=name=ADAM&fields=full-name,full-address&compact=true |Search for 'name' contains 'ADAM' and return full-name and full-address of the record, the result contains a header with field names and a array containing flat data |
| GET http://localhost:8190/rest/map/EMPLOYEES-MAP/*/NAME?limit=5&sorted_by=name&search=name>'CANALE' |Search for 'name' greater then 'CANALE' and return sorted list of name of the record. The result is limited to 5 records |
| GET http://localhost:8190/rest/map/EMPLOYEES-MAP/*/NAME?start=5&sorted_by=name&search=name>'CANALE' |Search for 'name' greater then 'CANALE' and return sorted list of name of the record. The result skips the first 5 records |

## 2.2. Adabas insert and update

To update data in Adabas the HTTP PUT method need to be used. The PUT request updates records in the database. The record may contain all or only updated record fields.

To insert data into Adabas the HTTP PUSH method is used. The data input content of the request is send in the body.

For insert and update the input array of records need to be provided in the `Store` or `Record` tag of the format.

Example JSON input for update and insert:

```HTTP
PUSH
http://<host name>/rest/map/<map name>
```

```JSON
{"Store":[{"ISN":1,"full-name":{"name":"ADAM","first-name":"SIMONES"}}]}
```

Result of the store query will be the number of stored records and the ISN where the data is stored to.

This examples stores data into two records with ISN 23 and ISN 100.

```JSON
{"NrStored":2,"Stored":[23,100]}
```

## 2.3. Adabas delete

The HTTP Delete method is used to delete Adabas database records in the database. The database ISN need to be known.

```HTTP
DELETE
http://<host name>/rest/map/<map name>/<isn>
```

## 2.4. Adabas Search

The Adabas RESTful API provide search queries based on Adabas queries. The search syntax is limited. See Adabas documentation.

Following search queries are possible.

### 2.4.1. Direct search

It is possible to search for a special value. For example this query will search for the field `PERSONNEL-ID` to be `40003001`.

```sql
PERSONNEL-ID=40003001
```

Similar approach is to search for Alpha or Unicode fields with

```sql
FIRSTNAME='ADAM'
```

The search value can be linked together using the `AND` or `OR` keywords. For example this will search for all with name equals `SMITH` and first name equals `ADAM`.

```sql
FIRSTNAME='ADAM' AND NAME='SMITH'
```

It is possible to use the 'greater then' and 'lower then' queries. Here an example for the 'greater then' query

```sql
NAME>'SMITH' OR NUMBER>10
```

or for a 'lower then'

```sql
NAME<'SMITH' AND NUMBER<10
```

or for a 'lower then'

```sql
NAME<='SMITH'
```

Similar approach is to not equals. Here an example

```sql
NUMBER!=10
```

### 2.4.2. Search ranges

Adabas provides the possibily to search for ranges. Inside the API the range search is providing with or without first range start value. Corresponding it is with last range value. This example will search in the range of `40003001` to `40005001` including the two values.

```sql
PERSONNEL-ID=[40003001:40005001]
```

This example will exclude the first range value `40003001`:

```sql
PERSONNEL-ID=(40003001:40005001]
```

It is possible to search for Alpha or Unicode field ranges as well. Here an example which search for all strings beginning on `SMITH` up to `Y`:

```sql
PERSONELL_ID=['SMITH':'Y']
```

Ranges can be combined with `AND` or `OR`:

```sql
NAME='ADAM' AND NAME=['FR':'FRZ']
```

### 2.4.3. Special searches

Sometime it is needed to use special characters.
Search using the hexadecimal value of a number:

```sql
NUMBER=0xF1
```

Following example search for a Super descriptor with a repeated `0x21` at the end:

```sql
S2='BADABAS__'0x21*

S2=['BADABAS__'0:'BADABAS__'255]

S2=['BADABAS__'0x00:'BADABAS__'0xFF(10)]

S2=['BADABAS__'0x00:'BADABAS__'0xFFFFFFFFFFFFFFFFFFFF]
```

### 2.4.4. Result schema

Adabas RESTful server returns a JSON or XML result. The main entry point referencing a list of records is named `Records`. The result number of records for the query are returned. The result set may be limited to the query parameter `limit`.

Example result:

```JSON
{"Records":[
    {"ISN":1,
    "personnnel-id":"50005800",
    "language":["FRE","ENG"]
    }
  ],
  "FileRecords":10,
  "NrRecords":1}
```

## 2.5. Update and insert




## 2.6. Adabas RESTful Example Application

The Adabas RESTful example is an application that shows you how to use the Adabas REST interface. It is located in the examples subdirectory of the Adabas REST Interface installation directory, and as a 'war' file in the war subdirectory.

### 2.6.1. Prerequisites

Before you start with the example, you must prepare a database with the necessary files and mapping definitions:

1. Create a standard Adabas demo database with the crdemodb command, for example, crdemodb 4
2. Load the backup file example.bck into the database, (for example, use the following command sequence: adadbm db=4 delete=4-202, BCK001=example.bck, adabck db=4 restore=4-202), do not renumber the files. The backup file is located in the data subdirectory of the REST Interface installation.
3. Create two mappings with the Data Designer: TestMapEmployee for file 11, and TestMapVehicle for file 12. The required mappings are shown in the tables below; it is necessary to create the mappings exactly as shown.
4. Configure the REST Server in order to gain access to the database files and the mapping files (refer to Adabas REST Server Configuration for further information).

#### 2.6.1.1. TestMapEmployee

|Adabas Field	|Long Name|
|---|---|
|AA	|ID|
|AC	|FirstName|
|AE	|LastName|
|AO	|Department|
|AS	|Salary|
|AT	|Bonus|

#### 2.6.1.2. TestMapVehicles

|Adabas Field	| Long Name|
|---|---|
|AD	|Vendor|
|AE	|Model|
|AF	|Color|

## 2.7. The Example

The first step is to choose the correct database. The example uses the DBID 24 as default. This can be changed by choosing the Select demo database button. If the DBID is to be changed persistently, the index.html file has to be changed accordingly (see AdabasRestInterface/examples directory). There are some predefined JSON queries that request data from the database and show the results in the lower part of the window.

Additionally, the URL of the query will be shown, and the result is displayed in JSON format. Click on the Rest Interface URL: or Result: button to see all of the data.

Choose the Free Form tab if you want to make more flexible requests, and the Modify Record tab for a demonstration of update and delete requests. Note that the data in the database will not be modified, it just constructs the URLs for PUT and DELETE and shows the JSON format for these type of requests.

Running the example will produce a screen similar to the one shown below:


