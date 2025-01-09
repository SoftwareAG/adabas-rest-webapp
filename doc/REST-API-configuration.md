<!-- TOC -->

- [1. Adabas REST server](#1-adabas-rest-server)
  - [1.1. Adabas REST Server](#11-adabas-rest-server)
  - [1.2. Adabas REST Server Prerequisites](#12-adabas-rest-server-prerequisites)
  - [1.3. Adabas REST Server Configuration](#13-adabas-rest-server-configuration)
  - [1.4. `<Server>`](#14-server)
    - [1.4.1. `<Content>`](#141-content)
    - [1.4.2. Service port](#142-service-port)
    - [1.4.3. LoginService](#143-loginservice)
    - [1.4.4. Shutdown passCode](#144-shutdown-passcode)
  - [1.5. `<Directory>`](#15-directory)
  - [1.6. Mapping](#16-mapping)
  - [1.7. DatabaseAccess](#17-databaseaccess)
  - [1.8. REST Server Runtime](#18-rest-server-runtime)
  - [1.9. REST Server Authentication](#19-rest-server-authentication)
    - [1.9.1. JAAS](#191-jaas)
      - [1.9.1.1. Adabas password file](#1911-adabas-password-file)
        - [1.9.1.1.1. Creating an MD5 Hash](#19111-creating-an-md5-hash)
      - [1.9.1.2. System authentification on Unix platforms](#1912-system-authentification-on-unix-platforms)
      - [1.9.1.3. System authentification  on Windows platforms](#1913-system-authentification-on-windows-platforms)
      - [1.9.1.4. Third party JAAS modules](#1914-third-party-jaas-modules)
  - [1.10. Writing an individual Authentication Class](#110-writing-an-individual-authentication-class)

<!-- /TOC -->

# 1. Adabas REST server

The Adabas REST server is a sub component of the Adabas product installation. It need to be installed separately. It can be used to access Adabas data as well as requesting Adabas administration tasks and monitoring.
All programming language that supports the HTTP protocol and XML or JSON-based REST API's can access the Adabas data and administration.

The Adabas REST server HTTP entry point supports to read (GET), create (POST), update (PUT) and delete (DELETE) Adabas records. The read (GET) functionality is set up in advance to be used with query search and sort parameters. The server can deliver the response in two formats, JSON and XML.

## 1.1. Adabas REST Server

This section provides information about how to configure the Adabas REST server before it is used for the first time.

- Adabas REST Server Prerequisites
- Adabas REST Server Configuration
- REST Server Startup
- REST Server Authentication

## 1.2. Adabas REST Server Prerequisites

During installation the Adabas REST server is installed as a service task. To manually uninstall or install the service, the script `system_service.sh` or `system_service.bat` handles the service installation.

The Adabas REST server can access Adabas databases using local IPC, Entire Network or ADATCP. It is possible to access the new Adabas TCP/IP and Entire Network databases directly.

A ADATCP TCP/IP Adabas database connection is configured using following schema

```sh
<dbid>(adatcp://<host>:<port>)
```

A Entire Network-based Adabas database connection is configured using following schema

```sh
<dbid>(tcpip://<host>:<port>)
```

To access the database id 100 on host `databasehost` on port 61100 you need to define `100(adatcp://databasehost:61100)`.
In some circumstances the URL need to be used as well although local IPC- or Entire Network based access using the Adabas Client libraries are requested. In the case if only the database id like `100` or the port is set to 0 like `100(adatcp://databasehost:0)` the IPC- or Adabas Client ADALNKX-based access is used.

If you want to access remote Adabas databases via Entire Net-Work, the corresponding Software AG Directory Server may also be configured.

## 1.3. Adabas REST Server Configuration

The Adabas REST server uses port for HTTP access and for HTTPS access which are configured during the installation process.

All configuration parameters are defined in the file config.xml, which is located in the configuration subdirectory of the Adabas RESTfull administration installation. A default configuration file config.default.xml is provided, and can be replaced to config.xml.
The configuration file looks similar to the following content:

```xml
<RestServer>
    <Server>
        <Content directory="examples" />
        <Service port="8190" type="http" />
        <Service port="8191" type="https">
            <KeyStore file="keys/keystore.jks" />
            <KeyPassword password="test123" />
        </Service>
        <LoginService class="" type="jaas" module="Adabas" />
        <Shutdown passCode="shut123" />
    </Server>
    <Directory url="file:xtsurl.cfg" />
    <Mapping>
        <Database dbid="24" file="4" />
        <Database dbid="23" file="250" />
        <Database dbid="100(adatcp://databasehost:61100)" file="250" />
    </Mapping>
    <DatabaseAccess global="false">
        <Database dbid="1234" />
    </DatabaseAccess>
</RestServer>
```

## 1.4. `<Server>`

The Server element contains the basic attributes for running the REST server.

### 1.4.1. `<Content>`

The `<Content>` tag defines the directory of static HTML files which are used to provide a RESTful service. The examples subdirectory of the Adabas Rest Interface provides an example application to help you learn more about accessing Adabas using the REST interface.

### 1.4.2. Service port

This sets the TCP/IP listen port for HTTP and HTTPS requests. The access URL for the example application has the following form: https://localhost:<port>/. For HTTPS access, SSL certificates are necessary. The KeyStore and KeyPassword attributes are used to define the necessary settings.

**Note:** The keystore.jks provided is only an example keystore with self-signed certificates. You must not use them in a production environment.

### 1.4.3. LoginService

This defines the authentication method used by the REST server. The possible values for `type` are:

- jaas: Java JAAS login module
- saf: the mainframe authentication ADASAF/RACF is used.

The class attribute can be used to specify an individual authentication class. If it is left empty, the built-in login service is used, that will provide the JAAS and saf authentication methods.

See below for a detailed description of login modules and how to write an individual authentication class.

### 1.4.4. Shutdown passCode

This defines the password that is used for the shutdown command of the REST server. The shutdown password is an aditional barrier to suppress unauthorized shutdown of the server. The shutdown password validates to shutdown the REST server. To stop the server manually the shell script stopAdaRest.sh can be used.

## 1.5. `<Directory>`

The directory tag sets the reference to the Software AG Directory Server (see Entire Net-Work). This might be a file reference like `file:<directory>/xtsurl.cfg`. This reference indicate to a file that contains the access URLs of remote databases. The format of the file is exactly the same as for the Adabas Directory Server. It is possible to use a reference URL to the Software AG Directory Server. The URL should look like that: `tcpip://<host>:4952`.

## 1.6. Mapping

Mapping definitions are used in the product `Adabas Client for Java` to map database names and long name fields to shot names. You can use Natural DDM's to define the long names. To create long field names, you can use the Adabas Data Designer (see Adabas Data Designer for more information). The Adabas Maps are stored in an Adabas file. Each database can contain multiple mapping file, but at least one mapping file to define the long name references. The `<Database>` tag is used to make these Adabas Map definitions known to the RESTful service. The Adabas Map name definitions should be unique.

## 1.7. DatabaseAccess

The DatabaseAccess attribute determines whether direct database references are allowed or not. Direct Database reference use the classic Adabas database id to request Adabas data. If DatabaseAccess attribute `global` is set to true, all known local database can be access directly.
If `global` is set to false, it is not possible to use the `http://<rest server>:<port>/rest/db/<dbid>` for direct access to the database. You can need to explicitly enabled access by using the `<Database>` configuration. Two attributes of the `<Database>`are used to set the dbid:

- dbid is used to set the database ID;
- url is used to set an access path to a remote database (e.g. for a database 2000 on the mainframe url="2000(tcpip://1.2.3.4:3000)" or the new Adabas TCP/IP reference with url="100(adatcp://databasehost:61100)")

## 1.8. REST Server Runtime

In general the Adabas RESTful server is added to the system service startup procedure. The configuration is done during Adabas RESTful administration installation. To add or remove the Adabas RESTful server after installation, use the `system_service.bat` or `system_service.sh` batch scripts.

Output of server log will be stored in the `log` directory of the installation. In the file `wrapper.log` you can see server output of the server started as an service. Trace info and debug information will be stored in the `server.log` file.

The REST server can be started manuelly with the script `startAdaRest.sh` on Unix/Linux platforms, or with `startAdaRest.bat` on Windows platforms. The manuel start of the server will open a console window to show the REST server output.

The REST server example page can be accessed via `http://localhost:<port>` or `https://localhost:<port>`. The initial user name is `admin` and the default password is set during the installation of the Adabas RESTful server.

## 1.9. REST Server Authentication

#### 1.9.1. Adabas password file

The REST server supports a minimal authentication realm. In order to set up the authentication using MD5 or SHASUM hash encoding, modify the realm.properties from the configuration subdirectory as required. By default, the user `admin` with the default password set during the installation of the REST server.

A simple password file called `realm.properties` contains user name and password information. The format of the password
file is as following.

```sh
<user name>:<user password>, <roles of the user>
```

The user password can be prefixed with a the hashsum algorithm name like `MD5:` or `SHA:` which represents the `md5sum` or `shasum` hash of the password.
The user roles are defined in the configuration. For example you can define the role for job control in the
configuration file `config.xml` like this

```xml
  <Job role="jobadmin" use_role="false" />
```

Similar configuration are possible for `<Directories />` file upload and download rights and for the `<Admin />` to
control administration tasks.

The realm.properties file defines users belonging to a role. Example of a password content:

```txt
Administrator: MD5:70682896e24287b0476eff2a14c148f0, sagadmin, jobadmin
sag:  MD5:20384856e54267b7488eefea1ac1a8fa, saguser
user: MD5:d47f18dc7780fe47c24759714e2cd58f, saguser
```

To add a new user to the `realm.properties` you can start the `server.<sh or bat> add_user` command.


##### 1.9.1.1.1. Creating an MD5 Hash

You can add new user and passwords manually. The password hash need to be generated.
This is only an example how to create the hash code, there are many tools available; this example uses the md5sum tool on Linux:

```sh
echo -n ThisIsMyPassword | md5sum
d47f18dc7780fe47c24759714e2cd58f -
```

Copy the hash code and paste it into the realm.properties file.

#### 1.9.1.2. System authentification on Unix platforms

Adabas RESTful administration delivers a JAAS moduled defined with `LocalUnix` inside the JAAS configuration
named `security.conf`. This JAAS module provides the authentification of users defined in the local system.
The SSX modules uses unix system PAM authorizations to authenticate with user and password.

For detailed information how the Software AG Security eXtensions (SSX) have a look into the documentation located
in Empower. The chapter `Using the Pluggable Authentication Module (PAM) on UNIX` describe possible configurations.

#### 1.9.1.3. System authentification  on Windows platforms

On Windows platforms the Java JAAS module called Waffle provides a huge number of configuration doing local Windows
authentification.

#### 1.9.1.4. Third party JAAS modules

Java JAAS is a standard where a number of third party product exists, which can support various single-sign-on systems or authentifications services.

## 1.10. Writing an individual Authentication Class

The authentication class has to follow the principles of the jetty security (LoginService). Please see the jetty documentation for further details. The class has to implement the following interface:

```Java
/*
 * Copyright (c) 2015-2020 Software AG, Darmstadt, Germany and/or Software AG USA
 * Inc., Reston, VA, USA, and/or its subsidiaries and/or its affiliates
 * and/or their licensors.
 * Use, reproduction, transfer, publication or disclosure is prohibited except
 * as specifically provided for in your License Agreement with Software AG.
*/

import org.eclipse.jetty.security.ConstraintSecurityHandler;

import org.eclipse.jetty.security.LoginService;

public interface ISecurityHandler {
  public ConstraintSecurityHandler getSecurityHandler();

  public LoginService getLoginService();
}
```
