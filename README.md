<a  href="https://altr.com">
    <img  src="./imgs/altr-logo.jpg"  alt="ALTR log"  title="ALTR"  align="right"  height="42">
</a>

# ALTR + Alation Policy Tags Integration

The ALTR + Alation Policy Tags Integration is a tool to pass column tags in Alation to Snowflake and ALTR.

The tool grabs tags of each column from a custom field in Alation, applies those tag values to the corresponding column in Snowflake, imports Snowflake Object Tags into ALTR and adds said columns to ALTR to be governed.

This tool is plumbing between to available API's..

* [ALTR Management API](https://altrnet.live.altr.com/api/swagger/)

* [Alation API](https://developer.alation.com/dev/reference/refresh-access-token-overview)

and Snowflake.

## How it works

The tool:
01. gets snowflake databases in Alation
02. gets columns that have custom field, 'Policy Tags', values 
03. applies tag values to corresponding Snowflake columns
04. gets databases in ALTR
05. checks for corresponding Alation databases
06. if there is a database in Alation (that has tagged columns) and not in ALTR it adds said database to ALTR
07. adds tagged columns to ALTR to be governed
08. updates existing databases in ALTR to import Snowflake Object Tags

## Why use it

<a  href="https://www.altr.com/">ALTR</a> partnered with <a  href="https://www.alation.com/">Alation</a> to fill a gap between data cataloging and data governance. 

With this powerful tool you can apply tags to a columns in Alation and automatically have those tags applied to the corresponding Snowflake columns. If ALTR is already applying policy on those tags, the new columns will automatically have the same policies applied. If not, you can easily create a tag based policy in ALTR on that new tag.

## Visuals

Integration Flowchart:

<img  src="./imgs/alation-tags-integration-flowchart.png"  alt="Integration Flowchart"  height="700">

## Installation

**Install From Source**

	$ git clone https://github.com/altrsoftware/altr-alation-tag-policy.git
	
	$ cd altr-alation-tag-policy

## Before using the tool  

**1. Fill out the .env file environment variables**

	// ALATION
	ALATION_API_ACCESS_TOKEN = "Your Alation API Access Token"
	ALATION_DOMAIN = "Your Alation domain (example-prod.alationcatalog.com)"
	ALATION_EMAIL = "The email used to sign in and create the API Access Token"
	
	// SNOWFLAKE
	SF_ACCOUNT = "Snowflake account identifier (exampleorg.us-east-1)"
	SF_DB_USERNAME = "Your Snowflake username that has admin rights AND must have ALTR service role granted (PC_ALTR_ROLE or ALTR_SERVICE_ROLE)"
	SF_DB_PASSWORD = "Your Snowflake password"

	SF_HOSTNAME = "The hostname of your Snowflake instance (example.us-west-3.snowflakecomputing.com)"
	SF_WAREHOUSE = "Default warehouse your ALTR service role uses"
	SF_ROLE = "If you connected to ALTR through Snowflake Partner Connect (PC_ALTR_ROLE) | If you created a ALTR service user (ALTR_SERVICE_ROLE)"
	
	//ALTR
	ALTR_DOMAIN = "Your ALTR domain (altrnet.live.altr.com)"
	ALTR_KEY_NAME = "Your ALTR Management API key name"
	ALTR_KEY_PASSWORD = "Your ALTR Management API key password"

**2. Grant Role to Snowflake User**
* The Snowflake user (SF_DB_USERNAME) you put in .env variables file must have the role of PC_ALTR_ROLE or ALTR_SERVICE_ROLE granted to it depending if you connected to ALTR using Snowflake Partner Connect or created your own ALTR Service User
* GRANT ROLE <PC_ALTR_ROLE | ALTR_SERVICE_ROLE> TO USER <SF_DB_USERNAME>;

**3. You must add a custom field to your Alation environment for this application to work successfully**
01. Click the settings gear in the top right of Alation
02. Under the *Catalog Admin* section, click *Customize Catalog*
03. Under the *Custom Fields* tab, add a *Multi-Select Pickers*
    - *Name (plural)*: Policy Tags
    - *Name (singular)*: Policy Tag
    - *Tooltip Text*: Policy Tags set in Alation

04. Click *+ Add Option* and add a list of tags you would like to tag columns as (examples below)
    - PCI
    - PII
    - PHI
05. Save the custom field by clicking the green check mark
06. Click *Custom Templates* (next to the *Custom Fields* tab)
07. Under the *Data Object Templates* section, click *Column*
08. Click *Insert...* -> *Custom Field*
09. Select *Policy Tags*
10. Save the template
  
  

## How To Use

> **Warning:** 
> You must complete the **Before using the tool** section; otherwise, the integration will not work correctly.

**Method 1: <a  href="https://www.docker.com/">Docker</a>**

This method will install the necessary packages needed to run the application for you.

    $ docker build -t altr/alation-classification-integration .
    
    $ docker run -d altr/alation-classification-integration

**Method 2: Manually**

    $ npm install
    
    $ node index.js

## Dependencies

This application was built using the following node packages and their respected version:

* [node](https://nodejs.org/download/release/v16.0.0/) : 0.27.2

  

* [dotenv](https://www.npmjs.com/package/dotenv/v/16.0.3) : 16.0.3

  

* [axios](https://www.npmjs.com/package/axios/v/0.27.2) : 0.27.2

  

* [snowflake-sdk](https://www.npmjs.com/package/snowflake-sdk/v/1.6.14) : 1.6.14

  

* [axios-mock-adapter](https://www.npmjs.com/package/axios-mock-adapter/v/1.21.2) : 1.21.2

  

* [jest](https://www.npmjs.com/package/jest/v/29.2.2) : 29.2.2
  

## Support

Need support to get this application running? Have questions, concerns or comments?

Email *application-engineers@altr.com* with a subject line of "ALTR + Alation Tags Policy Integration".
   
  

## License

[GNU General Public License](LICENSE.md)
