require('dotenv').config();
const alation = require('./api/alationApi.js');
const altr = require('./api/altrApi');
const snowflake = require('./sfOperations.js');
const utils = require('./utils');

// Builds Base64 encoded string for ALTR API authentication
const ALTR_AUTH = Buffer.from(`${process.env.ALTR_KEY_NAME}:${process.env.ALTR_KEY_PASSWORD}`).toString('base64');

let main = async () => {
	console.time('Execution Time');

	let alationPermissions = await alation.getUsers(process.env.ALATION_DOMAIN, process.env.ALATION_API_ACCESS_TOKEN, process.env.ALATION_EMAIL);
	let altrPermissions = await altr.getAdministrators(process.env.ALTR_DOMAIN, ALTR_AUTH);

	if (alationPermissions && altrPermissions) {
		console.log('Permissions Passed');
		try {
			// Gets custom field in Alation named, 'Policy Tags' 

			let alationCustomFields = await alation.getMultipleCustomFields(process.env.ALATION_DOMAIN, process.env.ALATION_API_ACCESS_TOKEN, 'MULTI_PICKER', 'ALTR Policy Tags');
      
			if (alationCustomFields.length == 0) throw new Error('\n Custom Field (MULTI PICKER) "Policy Tags" is missing in your Alation environment. \n Please follow the Readme "Before using this tool" section.');

			let alationCustomFieldId = alationCustomFields[0].id;
			console.log('\nALATION CUSTOM FIELDS:');
			console.log(alationCustomFields);

			// Gets all databases in Alation
			let alationDbs = await alation.getDatabases(process.env.ALATION_DOMAIN, process.env.ALATION_API_ACCESS_TOKEN, false, true);
			if (alationDbs.length == 0) throw new Error('\n There are currently 0 databases in your Alation instance.');
			console.log('\nALATION DATABASES: ' + alationDbs.length);
			console.log(alationDbs);

			// Filters out databases that are not from Snowflake
			alationDbs = utils.filterAlationDbs(alationDbs, 'snowflake');
			if (alationDbs.length == 0) throw new Error('\n This tool only works for Snowflake databases. \n It looks like there are currently 0 usable Snowflake databases in your Alation environment.');
			console.log('\nFILTERED ALATION DATABASES: ' + alationDbs.length);
			console.log(alationDbs);

			// Gets all columns in Alation that have 'Policy Tags' set
			let alationColumns = await alation.getColumns(process.env.ALATION_DOMAIN, process.env.ALATION_API_ACCESS_TOKEN, alationCustomFieldId);
			if (alationColumns.length == 0) throw new Error('\n No columns were found that contain "Policy Tags" values.');
			console.log('\nALATION COLUMNS: ' + alationColumns.length);

			console.dir(alationColumns, { depth: null });

			// Updates corresponding Snowflake columns with 'Policy Tags'
			await snowflake.applyPolicyTags(process.env.SF_ACCOUNT, process.env.SF_DB_USERNAME, process.env.SF_DB_PASSWORD, process.env.SF_ROLE, alationColumns, alationCustomFieldId);

			// Gets Snowflake databases in ALTR
			let altrDbs = await altr.getDatabases(process.env.ALTR_DOMAIN, ALTR_AUTH, 'snowflake_external_functions');
			console.log('\nALTR DATABASES: ' + altrDbs.databases.length);
			console.dir(altrDbs.databases, { depth: null });


			// Creates a list of databases to be added to ALTR and a list of databases that are already in ALTR
			let newAndOldDbs = utils.returnNewAndOldDbs(alationColumns, altrDbs.databases);
			console.log('\nNEW AND OLD DATABASES: ');
			console.dir(newAndOldDbs, { depth: null });

			// Add new Snowflake databases to ALTR (if Partner Connect else Self made ALTR Service User)
			if (newAndOldDbs.newDbs.length != 0) {
				if (process.env.SF_ROLE === 'PC_ALTR_ROLE') {
					let accounts = await altr.getSnowflakeAccounts(process.env.ALTR_DOMAIN, ALTR_AUTH);
					let accountId = accounts.accounts.find(account => account.name.toUpperCase().includes(process.env.SF_HOSTNAME.toUpperCase())).id;

					for (const newDb of newAndOldDbs.newDbs) {
						let response = await altr.addSnowflakeDbPC(process.env.ALTR_DOMAIN, ALTR_AUTH, newDb, accountId);
						dbIds.push(response.id);
					}
				} else {
					for (const newDb of newAndOldDbs.newDbs) {
						let response = await altr.addSnowflakeDb(process.env.ALTR_DOMAIN, ALTR_AUTH, newDb, process.env.SF_DB_PASSWORD, process.env.SF_HOSTNAME, process.env.SF_DB_USERNAME, process.env.SF_ROLE, process.env.SF_WAREHOUSE);
						dbIds.push(response.id);
					}
				}
			}

			// Refresh ALTR database list
			altrDbs = await altr.getDatabases(process.env.ALTR_DOMAIN, ALTR_AUTH, 'snowflake_external_functions');
			console.log('\nREFRESHED ALTR DATABASES: ' + altrDbs.databases.length);
			console.dir(altrDbs.databases, { depth: null });

			// Creates a list of columns that ALTR will 'govern' from Alation columns
			let governColumns = utils.returnNewGovernColumns(alationColumns, altrDbs.databases);
			console.log('\nALTR GOVERN COLUMNS: ' + governColumns.length);
			console.dir(governColumns, { depth: null });


			// Adds columns to ALTR from the list of 'govern' columns
			for (const column of governColumns) {
				await altr.addColumnToAltr(process.env.ALTR_DOMAIN, ALTR_AUTH, column.databaseId, column.tableName, column.columnName)
			}

			// Refreshes list of new and old databases (Should only have 'old' now)
			newAndOldDbs = utils.returnNewAndOldDbs(alationColumns, altrDbs.databases);

			// Updates old ALTR databases to import Snowflake Object Tags
			for (const oldDb of newAndOldDbs.oldDbs) {
				let response = await altr.updateSnowflakeDbInAltr(process.env.ALTR_DOMAIN, ALTR_AUTH, oldDb.dbName, oldDb.dbId);
				console.log('\nALTR UPDATE DATABASE: ');
				console.dir(response, { depth: null });
			}

		} catch (error) {
			if (!error.response) console.error(error);
			return;
		}
	} else {
		console.log('Please check ENV variables and try again.');
	}
	console.timeEnd('Execution Time');
};


main();