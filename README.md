<a  href="https://altr.com">

  

<img  src="./imgs/altr-logo.svg"  alt="ALTR log"  title="ALTR"  align="right"  height="40">

  

</a>

  

  

# Alation Tags Integration

  

The Alation Tags Integration is a tool to pass tags on columns in Alation to Snowflake and ALTR.

 The tool grabs tags from Alation that have been applied to columns, adds/applies those tag values to the corresponding column in Snowflake, imports Snowflake Object Tags into ALTR and adds those columns to ALTR to be governed.

This tool is plumbing between to available API's..

- [ALTR Management API](https://altrnet.live.altr.com/api/swagger/)

- [Alation API](https://developer.alation.com/dev/reference/refresh-access-token-overview)

 and Snowflake.

  

## How it works
  

The tool:

 1. gets tag data from alation
 2. gets column data for said tags
 3. applies tag values to corresponding Snowflake columns
 4. gets databases in ALTR
 5. checks for corresponding Alation databases
 6. if there is a database in Alation (that has tagged columns) and not in ALTR it adds said database to ALTR
 7. adds tagged columns to ALTR to be governed
 8. updates existing databases in ALTR to import Snowflake Object Tags

  

  

## Why use it

  

<a  href="https://www.altr.com/">ALTR</a> partnered with <a  href="https://www.alation.com/">Alation</a> to fill a gap between data cataloging and data governance. 

With this powerful tool you can apply tags to a column in Alation and automatically have that tag applied to the corresponding Snowflake column. If policy on that tag exists in ALTR it will automatically be applied. If not, you can easily create a tag based policy in ALTR on that new tag.

  

  

## Visuals

Integration Flowchart:

  

<img  src="./imgs/alation-tags-integration-flowchart.png"  alt="Integration Flowchart"  height="700">


## Installation

**Install From Source**

    $ git clone <**TODO**: github link>
    
    $ cd <**TODO**: directory>



## Before using the tool  

**1. Fill out the .env file environment variables**

    // ALATION
    ALATION_API_ACCESS_TOKEN = "Your Alation API Access Token"
    ALATION_DOMAIN = "Your Alation domain (example-prod.alationcatalog.com)"
    ALATION_EMAIL = "The email used to sign in and create the Access Token"
    
    // SNOWFLAKE
    SF_ACCOUNT = "Snowflake account identifier (exampleorg.us-east-1)"
	SF_DB_USERNAME = "The login name for your Snowflake user"
	SF_DB_PASSWORD = "The password for your Snowflake user"
	SF_HOSTNAME = "The hostname of your Snowflake instance (example.us-west-3.snowflakecomputing.com)"
    SF_WAREHOUSE = ""
    SF_ROLE = "The Snowflake role (make sure this role has access to the Snowflake database(s) you are creating tags in. Make sure your user has access to this role.)"
    
    //ALTR CALL SPECIFICS
    ALTR_DOMAIN = "Your ALTR domain (altrnet.live.altr.com)"
    ALTR_KEY_NAME = "Your ALTR Managment API key name"
    ALTR_KEY_PASSWORD = "The password to your key"

  
## How To Use

> **Warning**
You must complete the **Before using the tool** section; otherwise, the integration will not work correctly.

**Method 1: <a  href="https://www.docker.com/">Docker</a>**

This method will install the necessary packages needed to run the application for you.

    $ docker build -t altr/alation-classification-integration .
    
    $ docker run -d altr/alation-classification-integration

**Method 2: Manually**

    $ npm install
    
    $ node index.js


## Dependencies

This application was built using the following node packages and their respected version:

- [node](https://nodejs.org/download/release/v16.0.0/) : 0.27.2

  

- [dotenv](https://www.npmjs.com/package/dotenv/v/16.0.3) : 16.0.3

  

- [axios](https://www.npmjs.com/package/axios/v/0.27.2) : 0.27.2

  

- [snowflake-sdk](https://www.npmjs.com/package/snowflake-sdk/v/1.6.14) : 1.6.14

  

- [axios-mock-adapter](https://www.npmjs.com/package/axios-mock-adapter/v/1.21.2) : 1.21.2

  

- [jest](https://www.npmjs.com/package/jest/v/29.2.2) : 29.2.2
  

## Support

Need support to get this application running? Have questions, concerns or comments?
Email *application-engineers@altr.com* with a subject line of "Alation Classification Integration Support".

  

  

## Roadmap

If you have ideas for releases in the future, it is a good idea to list them in the README.

  

**TODO** (Support multiple snowflake instances?) (If you remove tag in alation this could check and remove values from snowflake columns?)

  

  

## Contributing

  

State if you are open to contributions and what your requirements are for accepting them.

  

  

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

  

  

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

  

**TODO**

  

**Testing**

    $ npm run test

  

## License

  

For open source projects, say how it is licensed.

  

**TODO**