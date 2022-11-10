require('dotenv').config();
const alation = require('./api/alationApi.js');
const altr = require('./api/altrApi');
const snowflake = require('./sfOperations.js');
const utils = require('./utils');

// BUILDS BASE64 ENCODED STRING FOR ALTR API AUTH
const altrAuth = Buffer.from(`${process.env.ALTR_KEY_NAME}:${process.env.ALTR_KEY_PASSWORD}`).toString('base64');

let main = async () => {
	console.time('Execution Time');

	let alationPermissions = await alation.getUsers(process.env.ALATION_DOMAIN, process.env.ALATION_API_ACCESS_TOKEN, process.env.ALATION_EMAIL);
	let altrPermissions = await altr.getAdministrators(process.env.ALTR_DOMAIN, altrAuth);

	if (alationPermissions && altrPermissions) {
		console.log('Permissions Passed');
		try {
			// GETS TAG DATA FROM ALATION
			let tags = await utils.getTagsAndData(process.env.ALATION_DOMAIN, process.env.ALATION_API_ACCESS_TOKEN);
			if (tags.length == 0) return;

			// UPDATES SNOWFLAKE TAG VALUES AND APPLIES TAG VALUES TO SNOWFLAKE COLUMN 
			await snowflake.applyAlationTags(process.env.SF_ACCOUNT, process.env.SF_DB_USERNAME, process.env.SF_DB_PASSWORD, tags);

			// GETS DATABASES IN ALTR
			let altrDbs = await altr.getAltrSnowflakeDbs(process.env.ALTR_DOMAIN, altrAuth);

			// CREATES A LIST OF NEW DATABASES TO BE ADDED TO ALTR AND DATABASES THAT NEED TO BE UPDATED
			let newOrUpdateDbs = utils.returnNewOrUpdateDbs(tags, altrDbs.data.databases);

			// ADDS SNOWFLAKE DATABASES TO ALTR IF THEY WERE TAGGED BY ALATION
			let dbIds = [];
			newOrUpdateDbs.newDbs.forEach(async db => {
				let response = await altr.addSnowflakeDbToAltr(process.env.ALTR_DOMAIN, altrAuth, db, process.env.SF_DB_PASSWORD, process.env.SF_HOSTNAME, process.env.SF_DB_USERNAME, process.env.SF_ROLE, process.env.SF_WAREHOUSE);
				dbIds.push(response.id);
			});

			// CHECKS IF ALL NEW DBS HAVE IMPORTED OBJECT TAGS
			if (dbIds.length != 0) await utils.checkDbStatus(dbIds);

			// REFRESHES GETS DATABASES IN ALTR 
			altrDbs = await altr.getAltrSnowflakeDbs(process.env.ALTR_DOMAIN, altrAuth);

			// CREATES A LIST OF NEW COLUMNS TO PROTECT IN ALTR
			let governColumns = utils.returnNewGovernColumns(tags, altrDbs.data.databases);

			// ADDS COLUMNS IN ALTR TO BE GOVERNED
			governColumns.forEach(async column => {
				await altr.addColumnToAltr(process.env.ALTR_DOMAIN, altrAuth, column.databaseId, column.tableName, column.columnName);
			});

			// CREATES A LIST OF NEW DATABASES TO BE ADDED TO ALTR AND DATABASES THAT NEED TO BE UPDATED
			newOrUpdateDbs = utils.returnNewOrUpdateDbs(tags, altrDbs.data.databases);

			// UPDATES EXISTING DATABASES IN ALTR IF ALATION TAGS EXIST IN THEM
			newOrUpdateDbs.updateDbs.forEach(async db => {
				await altr.updateSnowflakeDbInAltr(process.env.ALTR_DOMAIN, altrAuth, db.dbName, process.env.SF_DB_PASSWORD, process.env.SF_HOSTNAME, process.env.SF_DB_USERNAME, process.env.SF_ROLE, process.env.SF_WAREHOUSE, db.dbId);
			});

			// LOGGING
			console.log('\nALATION TAGS:');
			console.dir(tags, { depth: null });

			console.log('\nAFFECTED ALTR DATABASES:');
			console.dir(newOrUpdateDbs, { depth: null });

			console.log('\nAFFECTED ALTR COLUMNS:');
			console.dir(governColumns, { depth: null });

		} catch (error) {
			console.error(error);
			return;
		}
	} else {
		console.log('Please check ENV variables and try again.');
	}
	console.timeEnd('Execution Time');
};


main();