const Snowflake = require('snowflake-promise').Snowflake;

/**
 * Makes a connection to Snowflake to check if credentials are correct
 * @param {String} account account The Snowflake account (example: sa32fjd.us-east-1)
 * @param {String} username username The Snowflake username (ALTR service user)
 * @param {String} password password The password to the Snowflake user
 * @param {String} role snowflake role (ALTR Service Role or ACCOUNTADMIN)
 * @returns true if connection was successful | false if connection failed
 */
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
 * Loops through Alation columns adds 'Policy Tags' to Snowflake Object Tag named, 'ALATION_TAG', and applies tag values to column
 * @param {String} account account The Snowflake account (example: sa32fjd.us-east-1)
 * @param {String} username username The Snowflake username (ALTR service user)
 * @param {String} password password The password to the Snowflake user
 * @param {String} role snowflake role (ALTR Service Role or ACCOUNTADMIN)
 * @param {Array} alationColumns alationColumns
 * @param {Number} customFieldId custom field id
 * @returns Promise
 */
let applyPolicyTags = async (account, username, password, role, alationColumns, customFieldId) => {
	const snowflake = new Snowflake({
		account: account,
		username: username,
		password: password,
		role: role
	}, { logSql: console.log });

	try {
		await snowflake.connect();
		console.log(`\nSet Snowflake Object Tags: `);

		let tagArray = [];

		// Create an array of unique tags mapped to databases
		for (const column of alationColumns) {
			if (column == null) {
				continue;
			}
			const customField = column.custom_fields.find(customField => customField.field_id === customFieldId);
			for (const tag of customField.value) {
				tagArray.push({ database: column.key.split('.')[1], schema: column.key.split('.')[2], tagValue: tag });
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

		await snowflake.destroy();
		return;
	} catch (error) {
		throw (error);
	}
};
exports.applyPolicyTags = applyPolicyTags;

/**
 * Adds tag values to 'Alation Tag' per database in Snowflake
 * @param {Snowflake Connection Object} snowflake snowflake connection object
 * @param {String} database database
 * @param {String} schema schema
 * @param {String} tagValue tag value
 * @returns Promise
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
};


/**
 * Applies tag value to column
 * @param {Snowflake Connection Object} snowflake snowflake connection object
 * @param {String} database database
 * @param {String} schema schema
 * @param {String} table table
 * @param {String} column column
 * @param {String} tagValue tag value
 * @returns Promise
 */
let applyToColumn = async (snowflake, database, schema, table, column, tagValue) => {
	try {
		await snowflake.execute(`use ${database}.${schema}`);
		await snowflake.execute(`alter table ${table} modify column ${column} set tag alation_tag = '${tagValue}'`);
		return;
	} catch (error) {
		throw error;
	}
};

/**
 * Gets all columns in Snowflake that are tagged by specified tag name and are in specified databases
 * @param {String} account account The Snowflake account (example: sa32fjd.us-east-1)
 * @param {String} username username The Snowflake username (ALTR service user)
 * @param {String} password password The password to the Snowflake user
 * @param {String} role snowflake role (ALTR Service Role or ACCOUNTADMIN)
 * @param {String} alationDbs Alation databases
 * @param {String} tagName tag name
 * @returns Array of Snowflake columns
 */
let getTaggedColumnsFromDatabases = async (account, username, password, role, alationDbs, tagName) => {
	const snowflake = new Snowflake({
		account: account,
		username: username,
		password: password,
		role: role
	}, { logSql: console.log });

	try {
		await snowflake.connect();
		let tables = await getAllTables(snowflake, alationDbs);
		let taggedColumns = await getTaggedColumnsFromTables(snowflake, tables, tagName);
		await snowflake.destroy();

		return taggedColumns;
	} catch (error) {
		throw error;
	}
};
exports.getTaggedColumnsFromDatabases = getTaggedColumnsFromDatabases;

/**
 * Gets all table names from specified databases
 * @param {Snowflake Connection Object} snowflake snowflake connection object
 * @param {Array} alationDbs Alation databases
 * @returns Array of Snowflake tables
 */
let getAllTables = async (snowflake, alationDbs) => {
	let tables = [];
	let currentDatabase = '';
	for (const database of alationDbs) {
		if (currentDatabase != `${database.dbname}`) {
			currentDatabase = `${database.dbname}`;
			await snowflake.execute(`use ${currentDatabase}`);
		}
		let response = await snowflake.execute(`show tables`).then(response => response.map(value => value.name));
		tables.push({ database: database.dbname, tables: response });
	}
	return tables;
};

/**
 * Gets all columns in Snowflake that are tagged by specified tag name and are in specified tables
 * @param {Snowflake Connection Object} snowflake snowflake connection object
 * @param {Array} tables Snowflake tables
 * @param {String} tagName tag name
 * @returns tagged Snowflake columns
 */
let getTaggedColumnsFromTables = async (snowflake, tables, tagName) => {
	let taggedColumns = [];
	let currentDatabase = '';
	for (const table of tables) {
		if (currentDatabase != `${table.database}`) {
			currentDatabase = `${table.database}`;
			await snowflake.execute(`use ${currentDatabase}`);
		}
		for (const obj of table.tables) {
			let columns = await snowflake.execute(`select * from table(information_schema.tag_references_all_columns('${obj}', 'table'))`);
			columns = columns.filter(column => column.TAG_NAME == tagName);
			columns = columns.map(column => ({ column: `${column.OBJECT_DATABASE}.${column.OBJECT_SCHEMA}.${obj.toUpperCase()}.${column.COLUMN_NAME}`, tagValue: column.TAG_VALUE }));
			taggedColumns = taggedColumns.concat(columns);
		}
	}

	return taggedColumns;
};

/**
 * Unset 'ALATION_TAG' in Snowflake for specified columns
 * @param {String} account account The Snowflake account (example: sa32fjd.us-east-1)
 * @param {String} username username The Snowflake username (ALTR service user)
 * @param {String} password password The password to the Snowflake user
 * @param {String} role snowflake role (ALTR Service Role or ACCOUNTADMIN)
 * @param {Array} columns Snowflake columns
 * @returns Promise
 */
let dropPolicyTags = async (account, username, password, role, columns) => {
	const snowflake = new Snowflake({
		account: account,
		username: username,
		password: password,
		role: role
	}, { logSql: console.log });

	try {
		await snowflake.connect();
		console.log(`\nUnset Snowflake Object Tags: `);

		let currentDatabase = '';
		for (const column of columns) {
			let values = column.column.split('.');
			if (currentDatabase != `${values[0]}.${values[1]}`) {
				currentDatabase = `${values[0]}.${values[1]}`;
				await snowflake.execute(`use ${currentDatabase}`);
			}
			await snowflake.execute(`alter table ${values[2]} modify column ${values[3]} unset tag alation_tag`);
		}

		return;
	} catch (error) {
		throw error;
	}

};
exports.dropPolicyTags = dropPolicyTags;
