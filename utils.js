/**
 * Filters out Alation databases to only include specified type
 * @param {Array} alationDbs Alation databases
 * @param {String} dbType Database type
 * @returns JS Array
 */
let filterAlationDbs = (alationDbs, dbType) => {
	return alationDbs.filter(db => db.dbtype == dbType && db.is_gone == false && db.deleted == false && db.dbname != null);
}
exports.filterAlationDbs = filterAlationDbs;

/**
 * Sorts which databases are already in ALTR and which need to be added to ALTR
 * @param {Array} alationColumns Columns in Alation
 * @param {Array} altrDbs ALTR databases
 * @returns JS Object
 */
let returnNewAndOldDbs = (alationColumns, altrDbs) => {
	let alationDbNames = [];
	let altrDbNames = [];

	// Gets all Alation database names
	for (const column of alationColumns) {
		if (column != null) alationDbNames.push(column.key.split('.')[1].toUpperCase());
	}

	// Gets ALTR database names
	for (const db of altrDbs) {
		if (db != null) altrDbNames.push(db.databaseName.toUpperCase());
	}

	// If Alation database has no corresponding ALTR database 
	let newDbs = [...new Set(alationDbNames.filter(alationDbName => !altrDbNames.includes(alationDbName)))];

	// If Alation database has a corresponding ALTR database
	let oldDbs = [...new Set(alationDbNames.filter(alationDbName => altrDbNames.includes(alationDbName)))];

	// Add database id for old databases (for updating later on)
	let finalOldDbs = [];
	for (const db of oldDbs) {
		let altrDb = altrDbs.find(altrDb => altrDb.databaseName.toUpperCase() === db);
		finalOldDbs.push({ dbName: altrDb.databaseName.toUpperCase(), dbId: altrDb.id })
	}

	return {
		newDbs: newDbs,
		oldDbs: finalOldDbs
	}
}
exports.returnNewAndOldDbs = returnNewAndOldDbs;

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
}
exports.returnNewGovernColumns = returnNewGovernColumns;