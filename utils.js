/**
 * Filters out Alation databases that are not of specified type
 * @param {Array} alationDbs Alation databases
 * @param {String} dbType Database type
 * @returns Array of Alation databases that match specified type
 */
let filterAlationDatabasesByType = (alationDbs, dbType) => {
	return alationDbs.filter(db => db.dbtype == dbType && db.is_gone == false && db.deleted == false && db.dbname != null);
};
exports.filterAlationDatabasesByType = filterAlationDatabasesByType;

/**
 * Filters Alation databases that are not from specified host 
 * @param {Array} alationDbs Alation databases
 * @param {String} hostname hostname
 * @returns Array of Alation databases that come from specified host
 */
let filterAlationDatabasesByHost = (alationDbs, hostname) => {
	return alationDbs.filter(database => database.host.toUpperCase() == hostname.toUpperCase());
};
exports.filterAlationDatabasesByHost = filterAlationDatabasesByHost;

/**
 * Filters out Alation columns that are not from specified host
 * @param {Array} alationColumns Alation columns
 * @param {Array} alationDbs Alation databases
 * @param {String} hostname hostname
 * @returns Array of Alation columns that come from specified host
 */
let filterAlationColumnsByHostname = (alationColumns, alationDbs, hostname) => {
	return alationColumns.filter(column => {
		let database = alationDbs.find(database => column.ds_id == database.id);
		if (database != null) return database.host.toUpperCase() == hostname.toUpperCase();
	});
};
exports.filterAlationColumnsByHostname = filterAlationColumnsByHostname;

/**
 * Gets databases that need to be added to ALTR by comparing Alation databases (parsed from column information) with ALTR databases 
 * @param {Array} alationColumns Alation columns
 * @param {Array} altrDbs ALTR databases
 * @returns Array of database names that need to be added to ALTR
 */
let getNewAltrDatabases = (alationColumns, altrDbs) => {
	let alationDbNames = new Set();
	let altrDbNames = new Set();

	// Gets Alation database names
	for (const column of alationColumns) {
		if (column != null) alationDbNames.add(column.key.split('.')[1].toUpperCase());
	}

	// Gets ALTR database names
	for (const db of altrDbs) {
		if (db != null) altrDbNames.add(db.databaseName.toUpperCase());
	}

	// Compare sets and remove database names that exist in both sets
	for (const altrDbName of altrDbNames) {
		alationDbNames.delete(altrDbName);
	}

	return Array.from(alationDbNames);
};
exports.getNewAltrDatabases = getNewAltrDatabases;

/**
 * Compares Alation databases (parsed from column information) with ALTR databases and gets updatable ALTR databases
 * @param {Array} alationColumns Alation columns
 * @param {Array} altrDbs ALTR databases
 * @returns Array of database names that need to be updated in ALTR (Already exist in ALTR)
 */
let getUpdatableAltrDatabases = (alationColumns, altrDbs, nonMatchingSnowflakeColumns) => {
	let alationDbNames = new Set();
	let altrDbNames = [];
	let databasesFromNonMatchingSnowflakeColumns = new Set();

	// Gets all Alation database names
	for (const column of alationColumns) {
		if (column != null) alationDbNames.add(column.key.split('.')[1].toUpperCase());
	}
	alationDbNames = Array.from(alationDbNames);

	// Gets ALTR database names
	for (const db of altrDbs) {
		if (db != null) altrDbNames.push(db.databaseName.toUpperCase());
	}

	for (const column of nonMatchingSnowflakeColumns) {
		if (column != null) databasesFromNonMatchingSnowflakeColumns.add(column.column.split('.')[0]);
	}
	databasesFromNonMatchingSnowflakeColumns = Array.from(databasesFromNonMatchingSnowflakeColumns);

	// Compare sets and remove database names that exist in both sets
	let updatableDbs = [];
	for (const altrDbName of altrDbNames) {
		let foundMatchingAlationDatabase = alationDbNames.some(alationDbName => alationDbName == altrDbName);
		let foundMatchingNMSCDatabase = databasesFromNonMatchingSnowflakeColumns.some(databaseName => databaseName == altrDbName);
		if (foundMatchingAlationDatabase || foundMatchingNMSCDatabase) updatableDbs.push(altrDbName);
	}

	return updatableDbs;
};
exports.getUpdatableAltrDatabases = getUpdatableAltrDatabases;

/**
 * Creates a list of columns to be governed by ALTR from Alation tags
 * @param {Array} alationColumns Columns in Alation
 * @param {Array} altrDbs ALTR databases
 * @returns JS Array of Objects
 */
let returnNewGovernColumns = (alationColumns, altrDbs) => {
	let governColumns = [];

	for (const column of alationColumns) {
		if (column != null) {
			let schemaName = column.key.split('.')[2].toUpperCase();
			let tableName = column.key.split('.')[3].toUpperCase();

			let altrDb = altrDbs.find(altrDb => altrDb.databaseName.toUpperCase() === column.key.split('.')[1].toUpperCase());
			if (altrDb) governColumns.push({ databaseId: altrDb.id, tableName: `${schemaName}.${tableName}`, columnName: column.name.toUpperCase(), nickname: column.name.toUpperCase(), protectMode: 'govern' });
		}
	}

	return governColumns;
};
exports.returnNewGovernColumns = returnNewGovernColumns;

/**
	* Filters out Snowflake columns that are tagged and have matching tag in Alation
 * @param {Array} taggedSnowflakeColumns Snowflake columns that are tagged
 * @param {Array} alationColumns Alation columns
 * @returns Array of Snowflake columns
 */
let filterTaggedSnowflakeColumns = (taggedSnowflakeColumns, alationColumns) => {
	return taggedSnowflakeColumns.filter(snowflakeColumn => {
		return !alationColumns.some(alationColumn => {
			let columnsMatch = alationColumn.key.split('.')[1].toUpperCase() == snowflakeColumn.column.split('.')[0].toUpperCase()
				&& alationColumn.key.split('.')[2].toUpperCase() == snowflakeColumn.column.split('.')[1].toUpperCase()
				&& alationColumn.key.split('.')[3].toUpperCase() == snowflakeColumn.column.split('.')[2].toUpperCase()
				&& alationColumn.key.split('.')[4].toUpperCase() == snowflakeColumn.column.split('.')[3].toUpperCase();

			let altrPolicyTags = alationColumn.custom_fields.find(field => field.field_name == 'ALTR Policy Tag');
			let tagValueMatch = altrPolicyTags.value.some(tag => tag == snowflakeColumn.tagValue);

			return columnsMatch && tagValueMatch;

		});
	});
};
exports.filterTaggedSnowflakeColumns = filterTaggedSnowflakeColumns;

/**
 * For each updatable database in updatableDatabases, get the matching ALTR databases
 * @param {Array} updatableDatabases Databases that should be updated
 * @param {Array} altrDatabases ALTR databases
 * @returns Array of ALTR databases
 */
let getAltrDatabaseObjects = (updatableDatabases, altrDatabases) => {
	let updatableAltrDatabases = [];

	for (const updatableDatabase of updatableDatabases) {
		updatableAltrDatabases.push(altrDatabases.find(altrDatabase => altrDatabase.databaseName == updatableDatabase));
	}

	return updatableAltrDatabases;
};
exports.getAltrDatabaseObjects = getAltrDatabaseObjects;