const utils = require('../utils.js');

// RETURN NEW OR UPDATE DBS
describe('TESTING returnNewOrUpdateDbs()', () => {
	describe('Passing a tagged Alation column that has corresponding ALTR database', () => {
		it('Shall return an object with an updatable database', () => {
			const tags = [{
				tagId: 50,
				tagName: 'TAG_NAME',
				tagSubjects: [{
					columnName: 'EXAMPLE_COLUMN_NAME',
					columnType: 'EXAMPLE_COLUMN_TYPE',
					tableName: 'EXAMPLE_DB.EXAMPLE_SCHEMA.EXAMPLE_TABLE'
				}]
			}];

			const altrDbsData = [
				{
					"id": 0,
					"clientId": "string",
					"friendlyDatabaseName": "EXAMPLE_DB",
					"databaseName": "EXAMPLE_DB",
					"databaseUsername": "string",
					"SFCount": 0
				}
			];

			const result = utils.returnNewOrUpdateDbs(tags, altrDbsData);
			const expected = { newDbs: [], updateDbs: [{ dbName: 'EXAMPLE_DB', dbId: 0 }] };
			expect(result).toStrictEqual(expected);
		});
	});

	describe('Passing a tagged Alation column that does not have a corresponding ALTR database', () => {
		it('Shall return an object with a new database', () => {
			const tags = [{
				tagId: 54,
				tagName: 'TAG_NAME',
				tagSubjects: [{
					columnName: 'EXAMPLE_COLUMN_NAME',
					columnType: 'EXAMPLE_COLUMN_TYPE',
					tableName: 'EXAMPLE_DB.EXAMPLE_SCHEMA.EXAMPLE_TABLE'
				}]
			}];

			const altrDbsData = [
				{
					"id": 0,
					"clientId": "string",
					"friendlyDatabaseName": "NOT_SAME_EXAMPLE_DB",
					"databaseName": "NOT_SAME_EXAMPLE_DB",
					"databaseUsername": "string",
					"SFCount": 0
				}
			];


			const result = utils.returnNewOrUpdateDbs(tags, altrDbsData);
			const expected = { newDbs: ['EXAMPLE_DB'], updateDbs: [] };
			expect(result).toStrictEqual(expected);
		});
	});

	describe('Passing tagged Alation columns that HAVE and DO NOT have corresponding ALTR databases', () => {
		it('Shall return an object with a new database and an updatable database', () => {
			const tags = [{
				tagId: 54,
				tagName: 'TAG_NAME',
				tagSubjects: [{
					columnName: 'EXAMPLE_COLUMN_NAME',
					columnType: 'EXAMPLE_COLUMN_TYPE',
					tableName: 'EXAMPLE_DB.EXAMPLE_SCHEMA.EXAMPLE_TABLE'
				}]
			}, {
				tagId: 54,
				tagName: 'TAG_NAME_2',
				tagSubjects: [{
					columnName: 'EXAMPLE_COLUMN_NAME_2',
					columnType: 'EXAMPLE_COLUMN_TYPE_2',
					tableName: 'EXAMPLE_DB_2.EXAMPLE_SCHEMA_2.EXAMPLE_TABLE_2'
				}]
			}];

			const altrDbsData = [
				{
					"id": 0,
					"clientId": "string",
					"friendlyDatabaseName": "EXAMPLE_DB_2",
					"databaseName": "EXAMPLE_DB_2",
					"databaseUsername": "string",
					"SFCount": 0
				}
			];


			const result = utils.returnNewOrUpdateDbs(tags, altrDbsData);
			const expected = { newDbs: ['EXAMPLE_DB'], updateDbs: [{ dbName: 'EXAMPLE_DB_2', dbId: 0 }] };
			expect(result).toStrictEqual(expected);
		});
	});

});

// RETURN NEW PROTECTED COLUMNS
describe('TESTING returnNewGovernColumns()', () => {

	describe('Passing a tagged Alation column with a corresponding ALTR database', () => {
		it('Shall return a column to be added to ALTR', () => {
			const tags = [{
				tagId: 50,
				tagName: 'EXAMPLE_TAG_NAME',
				tagSubjects: [{
					columnName: 'EXAMPLE_COLUMN_NAME',
					columnType: 'EXAMPLE_COLUMN_TYPE',
					tableName: 'EXAMPLE_DB_NAME.EXAMPLE_SCHEMA_NAME.EXAMPLE_TABLE_NAME'
				}]
			}];

			const altrDbsData = [
				{
					"id": 0,
					"clientId": "string",
					"friendlyDatabaseName": "EXAMPLE_DB_NAME",
					"databaseName": "EXAMPLE_DB_NAME",
					"databaseUsername": "string",
					"SFCount": 0
				}
			];


			const result = utils.returnNewGovernColumns(tags, altrDbsData);
			const expected = [{ databaseId: 0, tableName: 'EXAMPLE_SCHEMA_NAME.EXAMPLE_TABLE_NAME', columnName: 'EXAMPLE_COLUMN_NAME', nickname: 'EXAMPLE_COLUMN_NAME', protectMode: 'govern' }];
			expect(result).toStrictEqual(expected);
		});
	});

	describe('Passing an empty list of ALTR databases', () => {
		it('Shall return an empty array of columns to be added to ALTR', () => {
			const tags = [{
				tagId: 50,
				tagName: 'EXAMPLE_TAG_NAME',
				tagSubjects: [{
					columnName: 'EXAMPLE_COLUMN_NAME',
					columnType: 'EXAMPLE_COLUMN_TYPE',
					tableName: 'EXAMPLE_DB_NAME.EXAMPLE_SCHEMA_NAME.EXAMPLE_TABLE_NAME'
				}]
			}];

			const altrDbsData = [];

			const result = utils.returnNewGovernColumns(tags, altrDbsData);
			const expected = [];
			expect(result).toStrictEqual(expected);
		});
	});

	describe('Passing a tagged Alation column without a corresponding ALTR database', () => {
		it('Shall return an empty array of columns to be added to ALTR', () => {
			const tags = [{
				tagId: 50,
				tagName: 'EXAMPLE_TAG_NAME',
				tagSubjects: [{
					columnName: 'EXAMPLE_COLUMN_NAME',
					columnType: 'EXAMPLE_COLUMN_TYPE',
					tableName: 'EXAMPLE_DB_NAME.EXAMPLE_SCHEMA_NAME.EXAMPLE_TABLE_NAME'
				}]
			}];

			const altrDbsData = [
				{
					"id": 0,
					"clientId": "string",
					"friendlyDatabaseName": "EXAMPLE_DB_NAME_NOT_MATCHING",
					"databaseName": "EXAMPLE_DB_NAME_NOT_MATCHING",
					"databaseUsername": "string",
					"SFCount": 0
				}
			];


			const result = utils.returnNewGovernColumns(tags, altrDbsData);
			const expected = [];
			expect(result).toStrictEqual(expected);
		});
	});
});
