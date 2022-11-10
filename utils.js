const alation = require('./api/alationApi.js');
const altr = require('./api/altrApi');

/**
 * Sorts which databases are already in ALTR and which need to be added to ALTR
 * @param {Array} tags The tags from Alation
 * @param {Array} altrDbsData The databases from ALTR
 * @returns JS Object
 */
let returnNewOrUpdateDbs = (tags, altrDbsData) => {
	let alationDbs = [];
	let altrDbs = [];
	let finalUpdateDbs = [];

	// GETS ALL ALATION DBS THAT HAVE TAGGED COLUMNS
	tags.forEach(tag => {
		tag.tagSubjects.forEach(subject => {
			alationDbs.push(subject.tableName.split('.')[0].toUpperCase());
		});
	});

	// GETS ALL ALTR DBS
	altrDbsData.forEach(db => {
		altrDbs.push(db.databaseName.toUpperCase());
	});

	// IF ALATION DB HAS NO CORRESPONDING ALTR DB
	let newDbs = [...new Set(alationDbs.filter(alationDb => !altrDbs.includes(alationDb)))];

	// IF ALATION DB HAS CORRESPONDING ALTR DB
	let updateDbs = [...new Set(alationDbs.filter(alationDb => altrDbs.includes(alationDb)))];

	// ADD DB INFO NEEDED FOR UPDATABLE DBS
	updateDbs.forEach(db => {
		let obj = altrDbsData.find(o => o.databaseName.toUpperCase() === db);
		finalUpdateDbs.push({ dbName: obj.databaseName.toUpperCase(), dbId: obj.id });
	});

	return {
		newDbs: newDbs,
		updateDbs: finalUpdateDbs
	}
}
exports.returnNewOrUpdateDbs = returnNewOrUpdateDbs;

/**
 * Creates a list of columns to be governed by ALTR from Alation tags
 * @param {Array} tags The tags from Alation
 * @param {Array} altrDbsData The databases from ALTR
 * @returns JS Array of Objects
 */
let returnNewGovernColumns = (tags, altrDbsData) => {
	let columns = [];
	let finalColumns = [];

	// LOOPS THROUGH ALATION TAGS AND CREATES COLUMN DATA OBJECT
	tags.forEach(tag => {
		tag.tagSubjects.forEach(subject => {
			columns.push({
				databaseName: subject.tableName.split('.')[0],
				tableName: subject.tableName.split('.')[1] + '.' + subject.tableName.split('.')[2], //SCHEMA.TABLE
				columnName: subject.columnName,
				nickname: subject.columnName,
			});
		});
	});

	// FINDS CORRELATING ALTR DB FOR COLUMN AND CREATES COLUMN OBJECTS TO BE ADDED TO ALTR
	// POSSIBLE PROBLEM: SHOULD IT FIND MATCHING SCHEMA AND TABLE AS WELL
	columns.forEach(column => {
		let obj = altrDbsData.find(o => o.databaseName.toUpperCase() === column.databaseName.toUpperCase());
		if (obj) finalColumns.push({ databaseId: obj.id, tableName: column.tableName.toUpperCase(), columnName: column.columnName.toUpperCase(), nickname: column.nickname.toUpperCase(), protectMode: 'govern' });
	});

	// ARRAY OF COLUMNS TO ADD
	return finalColumns;
}
exports.returnNewGovernColumns = returnNewGovernColumns;

/**
 * Loops through all databases that were added to ALTR and continuously polls API to check if database classification is complete
 * @param {Array} dbIds 
 * @returns 
 */
let checkDbStatus = async (dbIds) => {
	try {
		for (const dbId in dbIds) {
			let status;
			while (status == 'IN_PROGRESS') {
				let response = await altr.getClassificationStatus(process.env.ALTR_DOMAIN, altrAuth, dbId);
				status = response.status;
			}
		}
		return;
	} catch (error) {
		throw error;
	}
};
exports.checkDbStatus = checkDbStatus;

/**
 * Builds a list of tags and corresponding column info found in Alation
 * @param {String} alationDomain The domain of your Alation organization
 * @param {String} alationApiAccessToken The Alation API Access Token (short-term)  
 * @returns JS Array of Objects
 */
let getTagsAndData = async (alationDomain, apiAccessToken) => {
	// GETS TAGS FROM ALATION, THEN GETS COLUMNS OF EACH TAG, THEN GETS INFO OF EACH COLUMN, THEN CREATES AN ARRAY OF OBJECTS (TAG + COLUMN DATA)
	try {
		let tags = await alation.getTags(alationDomain, apiAccessToken);
		if (tags.length == 0) return [];

		let tagObjects = await Promise.all(tags.map(async tag => {
			let columnsOfTag = await alation.getColumnsOfTag(alationDomain, apiAccessToken, tag.name);
			let infoOfColumns = await Promise.all(columnsOfTag.map(async subject => {
				let column = await alation.getColumnInfoById(alationDomain, apiAccessToken, subject.subject.id);
				if (column != null || column.length != 0) {
					return {
						columnName: column[0].name,
						columnType: column[0].column_type,
						tableName: column[0].table_name
					}
				}
			}));

			return {
				tagId: tag.id,
				tagName: tag.name,
				tagSubjects: infoOfColumns
			}
		}));
		return tagObjects;

	} catch (error) {
		throw error;
	}
};
exports.getTagsAndData = getTagsAndData;

