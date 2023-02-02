const Snowflake = require('snowflake-promise').Snowflake;

let checkConnection = async (account, username, password, role) => {
	const snowflake = new Snowflake({
		account: account,
		username: username,
		password: password,
		role: role
	});

	try {
		await snowflake.connect();
		await snowflake.destroy();
		return true;
	} catch (error) {
		console.log('Snowflake connection test failed. Please check .env variables and try again.');
		return false;
	}
};
exports.checkConnection = checkConnection;

/**
 * 
 * @param {String} account 
 * @param {String} username 
 * @param {String} password 
 * @param {String} role 
 * @param {Array} alationColumns 
 * @param {Number} customFieldId 
 * @returns Promise
 */
let applyPolicyTags = async (account, username, password, role, alationColumns, customFieldId) => {
	const snowflake = new Snowflake({
		account: account,
		username: username,
		password: password,
		role: role
	}, {logSql: console.log});

	try {
		await snowflake.connect();

		let tagArray = [];

		// Create an array of unique tags mapped to databases
		for (const column of alationColumns) {
			if (column == null) {
				continue;
			}
			const customField = column.custom_fields.find(customField => customField.field_id === customFieldId);
			for (const tag of customField.value) {
				tagArray.push({database: column.key.split('.')[1], schema: column.key.split('.')[2], tagValue: tag})
			}
		}
		tagArray = [...new Set(tagArray.map(JSON.stringify))].map(JSON.parse);

		// Update tag values
		for (const tag of tagArray) {
			await updateTagValue(snowflake, tag.database, tag.schema, tag.tagValue);
		}

		// Apply tag values to columns
		for (const column of alationColumns) {
			if (column == null) {
				continue;
			}
			const customField = column.custom_fields.find(customField => customField.field_id === customFieldId);
			for (const tag of customField.value) {
				await applyToColumn(snowflake, column.key.split('.')[1], column.key.split('.')[2], column.key.split('.')[3], column.key.split('.')[4], tag);
			}
		}

		return;
	} catch (error) {
		throw (error);
	}
};
exports.applyPolicyTags = applyPolicyTags;

/**
 * 
 * @param {*} snowflake 
 * @param {*} database 
 * @param {*} schema 
 * @param {*} tagValue 
 * @returns 
 */
let updateTagValue = async (snowflake, database, schema, tagValue) => {
	try {
		await snowflake.execute(`use ${database}.${schema}`);
		await snowflake.execute(`create tag if not exists alation_tag`);
		await snowflake.execute(`alter tag alation_tag add allowed_values '${tagValue}'`);
		return;
	} catch (error) {
		throw error;
	}
}
exports.updateTagValue = updateTagValue;

/**
 * 
 * @param {*} snowflake 
 * @param {*} database 
 * @param {*} schema 
 * @param {*} table 
 * @param {*} column 
 * @param {*} tagValue 
 * @returns 
 */
let applyToColumn = async (snowflake, database, schema, table, column, tagValue) => {
	try {
		await snowflake.execute(`use ${database}.${schema}`);
		await snowflake.execute(`alter table ${table} modify column ${column} set tag alation_tag = '${tagValue}'`);
		return;
	} catch (error) {
		throw error;
	}
}
exports.applyToColumn = applyToColumn;

