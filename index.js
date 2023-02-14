require('dotenv').config();
const alation = require('./api/alationApi.js');
const altr = require('./api/altrApi');
const snowflake = require('./snowflakeOperations.js');
const utils = require('./utils');

// Builds Base64 encoded string for ALTR API authentication
const ALTR_AUTH = Buffer.from(`${process.env.ALTR_KEY_NAME}:${process.env.ALTR_KEY_PASSWORD}`).toString('base64');

let main = async () => {
	console.time('Execution Time');

	let alationPermissions = await alation.getUsers(process.env.ALATION_DOMAIN, process.env.ALATION_API_ACCESS_TOKEN, process.env.ALATION_EMAIL);
	let altrPermissions = await altr.getAdministrators(process.env.ALTR_DOMAIN, ALTR_AUTH);
	let snowflakePermissions = await snowflake.checkConnection(process.env.SF_ACCOUNT, process.env.SF_DB_USERNAME, process.env.SF_DB_PASSWORD, process.env.SF_ROLE);

	if (alationPermissions && altrPermissions && snowflakePermissions) {
		console.log('Permissions Passed');
		try {
			// Gets custom field in Alation named, 'Policy Tags' 
			let alationCustomFields = await alation.getMultipleCustomFields(process.env.ALATION_DOMAIN, process.env.ALATION_API_ACCESS_TOKEN, 'MULTI_PICKER', 'ALTR Policy Tags');
			if (alationCustomFields.length == 0) throw new Error('\n Custom Field (MULTI PICKER) "ALTR Policy Tags" is missing in your Alation environment. \n Please follow the Readme "Before using this tool" section.');
			if (alationCustomFields.length > 1) throw new Error('\n Only one Custom Field (MULTI PICKER) "ALTR Policy Tags" can exist in your Alation environment. \n Please remove duplicates');
			let alationCustomFieldId = alationCustomFields[0].id;

			// Gets all databases in Alation
			let alationDatabases = await alation.getDatabases(process.env.ALATION_DOMAIN, process.env.ALATION_API_ACCESS_TOKEN, false, true);
			if (alationDatabases.length == 0) throw new Error('\n There are currently 0 databases in your Alation instance.');

			// Filters out databases that are not from Snowflake
			alationDatabases = utils.filterAlationDatabasesByType(alationDatabases, 'snowflake');
			alationDatabases = utils.filterAlationDatabasesByHost(alationDatabases, process.env.SF_HOSTNAME);
			if (alationDatabases.length == 0) throw new Error('\n This tool only works for Snowflake databases. \n There are currently 0 usable Snowflake databases in your Alation environment.');
			console.log('\nALATION SNOWFLAKE DATABASES: ' + alationDatabases.length);
			console.log(alationDatabases.map(value => value.dbname));

			// Gets Snowflake databases in ALTR
			let altrDatabases = await altr.getDatabases(process.env.ALTR_DOMAIN, ALTR_AUTH, 'snowflake_external_functions');
			console.log('\nALTR DATABASES: ' + altrDatabases.length);
			console.log(altrDatabases.map(value => value.databaseName));

			// Gets all columns in Alation that have 'ALTR Policy Tags' set
			let alationColumns = await alation.getColumns(process.env.ALATION_DOMAIN, process.env.ALATION_API_ACCESS_TOKEN, alationCustomFieldId);
			alationColumns = utils.filterAlationColumnsByHostname(alationColumns, alationDatabases, process.env.SF_HOSTNAME);
			console.log('\nALATION COLUMNS: ' + alationColumns.length);
			console.log(alationColumns.map(value => value.key));

			// Gets all Snowflake columns tagged by 'ALATION_TAG'
			let taggedSnowflakeColumns = await snowflake.getTaggedColumnsFromDatabases(process.env.SF_ACCOUNT, process.env.SF_DB_USERNAME, process.env.SF_DB_PASSWORD, process.env.SF_ROLE, alationDatabases, 'ALATION_TAG');

			// Gets all snowflake columns that are tagged in Snowflake but not tagged in Alation
			let nonMatchingSnowflakeColumns = utils.filterTaggedSnowflakeColumns(taggedSnowflakeColumns, alationColumns);

			// Unset tag from Snowflake columns if matching Alation column does not have tag or the same tag value
			if (nonMatchingSnowflakeColumns.length != 0) await snowflake.dropPolicyTags(process.env.SF_ACCOUNT, process.env.SF_DB_USERNAME, process.env.SF_DB_PASSWORD, process.env.SF_ROLE, nonMatchingSnowflakeColumns);

			// Sets 'ALTR Policy Tags' on Snowflake columns
			if (alationColumns.length != 0) await snowflake.applyPolicyTags(process.env.SF_ACCOUNT, process.env.SF_DB_USERNAME, process.env.SF_DB_PASSWORD, process.env.SF_ROLE, alationColumns, alationCustomFieldId);

			// Gets list of databases that need to be added to ALTR
			let newAltrDatabases = utils.getNewAltrDatabases(alationColumns, altrDatabases);

			// Add new Snowflake databases to ALTR (if Partner Connect else Self made ALTR Service User)
			if (newAltrDatabases.length != 0) {
				if (process.env.SF_ROLE.toUpperCase() === 'PC_ALTR_ROLE') {
					let accounts = await altr.getSnowflakeAccounts(process.env.ALTR_DOMAIN, ALTR_AUTH);
					let accountId = accounts.find(account => account.name.toUpperCase().includes(process.env.SF_HOSTNAME.toUpperCase())).id;

					for (const database of newAltrDatabases) {
						let response = await altr.addSnowflakeDbPC(process.env.ALTR_DOMAIN, ALTR_AUTH, database, accountId);
						dbIds.push(response.id);
					}
				} else {
					for (const database of newAltrDatabases) {
						let response = await altr.addSnowflakeDb(process.env.ALTR_DOMAIN, ALTR_AUTH, database, process.env.SF_DB_PASSWORD, process.env.SF_HOSTNAME, process.env.SF_DB_USERNAME, process.env.SF_ROLE, process.env.SF_WAREHOUSE);
						dbIds.push(response.id);
					}
				}
			}

			// Refresh ALTR database list
			altrDatabases = await altr.getDatabases(process.env.ALTR_DOMAIN, ALTR_AUTH, 'snowflake_external_functions');

			// Creates a list of columns that ALTR will 'govern' from Alation columns list
			let governColumns = utils.getNewGovernColumns(alationColumns, altrDatabases);
			console.log('\nNEW GOVERNED COLUMNS IN ALTR: ' + governColumns.length);
			console.dir(governColumns.map(value => `${value.databaseId}.${value.tableName}.${value.columnName}`));

			// Adds columns to ALTR from the list of 'govern' columns
			for (const column of governColumns) {
				await altr.addColumn(process.env.ALTR_DOMAIN, ALTR_AUTH, column.databaseId, column.tableName, column.columnName);
			}

			// Get list of updatable ALTR databases
			let updatableDatabases = utils.getUpdatableAltrDatabases(alationColumns, altrDatabases, nonMatchingSnowflakeColumns);
			let updatableAltrDatabases = utils.getAltrDatabaseObjects(updatableDatabases, altrDatabases);

			// Update databases
			for (const database of updatableAltrDatabases) {
				await altr.updateSnowflakeDb(process.env.ALTR_DOMAIN, ALTR_AUTH, database.databaseName, database.id);
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