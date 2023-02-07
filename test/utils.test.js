const utils = require('../utils.js');

describe('TESTING filterAlationDatabaseByType()', () => {
	describe('Passing an array of Alation databases and dbType of "snowflake"', () => {
		it('Shall only return databases of type "snowflake"', () => {
			const alationDbs = [
				{
					"dbtype": "snowflake",
					"is_gone": false,
					"deleted": false,
					"dbname": "database1",
					"host": "example.eu-east-1"
				},
				{
					"dbtype": "dbt",
					"is_gone": false,
					"deleted": false,
					"dbname": "database2",
					"host": "not.same"
				}
			];

			const expected = [
				{
					"dbtype": "snowflake",
					"is_gone": false,
					"deleted": false,
					"dbname": "database1",
					"host": "example.eu-east-1"
				}
			];

			const result = utils.filterAlationDatabasesByType(alationDbs, 'snowflake');
			expect(result).toEqual(expected);
		});
	});
});

describe('TESTING filterAlationDatabaseByHost()', () => {
	describe('Passing an array of Alation databases and hostname of "example.eu-east-1"', () => {
		it('Shall only return databases of host "example.eu-east-1"', () => {
			const alationDbs = [
				{
					"dbtype": "snowflake",
					"is_gone": false,
					"deleted": false,
					"dbname": "database1",
					"host": "example.eu-east-1",
					"id": 1
				},
				{
					"dbtype": "snowflake",
					"is_gone": false,
					"deleted": false,
					"dbname": "database2",
					"host": "not.same",
					"id": 2
				}
			];

			const expected = [
				{
					"dbtype": "snowflake",
					"is_gone": false,
					"deleted": false,
					"dbname": "database1",
					"host": "example.eu-east-1",
					"id": 1
				}
			];

			const result = utils.filterAlationDatabasesByHost(alationDbs, 'example.eu-east-1');
			expect(result).toEqual(expected);
		});
	});
});

describe('TESTING filterAlationColumnsByHostname()', () => {
	describe('Passing an array of Alation columns and hostname of "example.eu-east-1"', () => {
		it('Shall only return columns that belong to database of host "example.eu-east-1"', () => {
			const alationDbs = [
				{
					"dbtype": "snowflake",
					"is_gone": false,
					"deleted": false,
					"dbname": "database1",
					"host": "example.eu-east-1",
					"id": 1
				},
				{
					"dbtype": "snowflake",
					"is_gone": false,
					"deleted": false,
					"dbname": "database2",
					"host": "not.same",
					"id": 2
				}
			];

			const alationColumns = [
				{
					"id": 1,
					"name": "column_1",
					"title": "Employee Quota data sales ids",
					"description": "Stores the sales id amount data from the employee_quota table.",
					"ds_id": 1,
					"key": "1.marketing_dept.employee_quota.column_1",
				},
				{
					"id": 2,
					"name": "column_2",
					"title": "Employee Quota data sales ids",
					"description": "Stores the sales id amount data from the employee_quota table.",
					"ds_id": 2,
					"key": "2.marketing_dept.employee_quota.column_2",
				}
			];

			const expected = [
				{
					"id": 1,
					"name": "column_1",
					"title": "Employee Quota data sales ids",
					"description": "Stores the sales id amount data from the employee_quota table.",
					"ds_id": 1,
					"key": "1.marketing_dept.employee_quota.column_1",
				}
			];

			const result = utils.filterAlationColumnsByHostname(alationColumns, alationDbs, 'example.eu-east-1');
			expect(result).toEqual(expected);
		});
	});
});

describe('TESTING getNewAltrDatabases()', () => {
	describe('Passing an array of Alation columns that do not have a matching ALTR database', () => {
		it('Shall return an array of database names that are not matching', () => {
			const altrDbs = [
				{
					"id": 1,
					"clientId": "string",
					"friendlyDatabaseName": "database1",
					"databaseName": "database1",
					"databaseUsername": "string",
					"SFCount": 0,
					"inProgress": 0,
					"lastConnectedTime": "2020-06-10T20:00:37.000Z"
				}
			];

			const alationColumns = [
				{
					"id": 1,
					"name": "column_1",
					"title": "Employee Quota data sales ids",
					"description": "Stores the sales id amount data from the employee_quota table.",
					"ds_id": 1,
					"key": "1.marketing_dept.employee_quota.column_1",
				},
				{
					"id": 2,
					"name": "column_2",
					"title": "Employee Quota data sales ids",
					"description": "Stores the sales id amount data from the employee_quota table.",
					"ds_id": 2,
					"key": "2.marketing_dept.employee_quota.column_2",
				}
			];

			const expected = ['MARKETING_DEPT'];

			const result = utils.getNewAltrDatabases(alationColumns, altrDbs);
			expect(result).toEqual(expected);
		});
	});
});

describe('TESTING getUpdatableAltrDatabases()', () => {
	describe('Passing an array of Alation columns that has a matching ALTR database', () => {
		it('Shall return an array of database names that are not matching', () => {
			const altrDbs = [
				{
					"id": 1,
					"clientId": "string",
					"friendlyDatabaseName": "database1",
					"databaseName": "database1",
					"databaseUsername": "string",
					"SFCount": 0,
					"inProgress": 0,
					"lastConnectedTime": "2020-06-10T20:00:37.000Z"
				}
			];

			const alationColumns = [
				{
					"id": 1,
					"name": "column_1",
					"title": "Employee Quota data sales ids",
					"description": "Stores the sales id amount data from the employee_quota table.",
					"ds_id": 1,
					"key": "1.database1.employee_quota.column_1",
				},
				{
					"id": 2,
					"name": "column_2",
					"title": "Employee Quota data sales ids",
					"description": "Stores the sales id amount data from the employee_quota table.",
					"ds_id": 2,
					"key": "2.marketing_dept.employee_quota.column_2",
				}
			];

			const nonMatchingSnowflakeColumns = [{ column: 'database3.employee_quota.column_5', tagValue: 'tag1' }];

			const expected = ['DATABASE1'];

			const result = utils.getUpdatableAltrDatabases(alationColumns, altrDbs, nonMatchingSnowflakeColumns);
			expect(result).toEqual(expected);
		});
	});
});

describe('TESTING getNewGovernColumns()', () => {
	describe('Passing an array of Alation columns that have a matching ALTR database', () => {
		it('Shall return an array of column objects with necessary information to add to ALTR', () => {
			const altrDbs = [
				{
					"id": 1,
					"clientId": "string",
					"friendlyDatabaseName": "database1",
					"databaseName": "database1",
					"databaseUsername": "string",
					"SFCount": 0,
					"inProgress": 0,
					"lastConnectedTime": "2020-06-10T20:00:37.000Z"
				}
			];

			const alationColumns = [
				{
					"id": 1,
					"name": "column_1",
					"title": "Employee Quota data sales ids",
					"description": "Stores the sales id amount data from the employee_quota table.",
					"ds_id": 1,
					"key": "1.database1.public.employee_quota.column_1",
				},
				{
					"id": 2,
					"name": "column_2",
					"title": "Employee Quota data sales ids",
					"description": "Stores the sales id amount data from the employee_quota table.",
					"ds_id": 1,
					"key": "2.database1.public.employee_quota.column_2",
				}
			];

			const expected = [
				{
					"databaseId": 1,
					"tableName": 'PUBLIC.EMPLOYEE_QUOTA',
					"columnName": "COLUMN_1",
					"nickname": "COLUMN_1",
					"protectMode": "govern"
				},
				{
					"databaseId": 1,
					"tableName": 'PUBLIC.EMPLOYEE_QUOTA',
					"columnName": "COLUMN_2",
					"nickname": "COLUMN_2",
					"protectMode": "govern"
				}
			];

			const result = utils.getNewGovernColumns(alationColumns, altrDbs);
			expect(result).toEqual(expected);
		});
	});

	describe('Passing an array of Alation columns that do not have a matching ALTR database', () => {
		it('Shall return an array of column objects with necessary information to add to ALTR', () => {
			const altrDbs = [
				{
					"id": 1,
					"clientId": "string",
					"friendlyDatabaseName": "database5",
					"databaseName": "database5",
					"databaseUsername": "string",
					"SFCount": 0,
					"inProgress": 0,
					"lastConnectedTime": "2020-06-10T20:00:37.000Z"
				}
			];

			const alationColumns = [
				{
					"id": 1,
					"name": "column_1",
					"title": "Employee Quota data sales ids",
					"description": "Stores the sales id amount data from the employee_quota table.",
					"ds_id": 1,
					"key": "1.database1.public.employee_quota.column_1",
				},
				{
					"id": 2,
					"name": "column_2",
					"title": "Employee Quota data sales ids",
					"description": "Stores the sales id amount data from the employee_quota table.",
					"ds_id": 1,
					"key": "2.database1.public.employee_quota.column_2",
				}
			];

			const expected = [];

			const result = utils.getNewGovernColumns(alationColumns, altrDbs);
			expect(result).toEqual(expected);
		});
	});

	describe('Passing an array of Alation columns that includes a null column', () => {
		it('Shall return an array of column objects with necessary information to add to ALTR and skip the null column', () => {
			const altrDbs = [
				{
					"id": 1,
					"clientId": "string",
					"friendlyDatabaseName": "database1",
					"databaseName": "database1",
					"databaseUsername": "string",
					"SFCount": 0,
					"inProgress": 0,
					"lastConnectedTime": "2020-06-10T20:00:37.000Z"
				}
			];

			const alationColumns = [
				{
					"id": 1,
					"name": "column_1",
					"title": "Employee Quota data sales ids",
					"description": "Stores the sales id amount data from the employee_quota table.",
					"ds_id": 1,
					"key": "1.database1.public.employee_quota.column_1",
				},
				{
					"id": 2,
					"name": "column_2",
					"title": "Employee Quota data sales ids",
					"description": "Stores the sales id amount data from the employee_quota table.",
					"ds_id": 1,
					"key": "2.database1.public.employee_quota.column_2",
				},
				null
			];

			const expected = [
				{
					"databaseId": 1,
					"tableName": 'PUBLIC.EMPLOYEE_QUOTA',
					"columnName": "COLUMN_1",
					"nickname": "COLUMN_1",
					"protectMode": "govern"
				},
				{
					"databaseId": 1,
					"tableName": 'PUBLIC.EMPLOYEE_QUOTA',
					"columnName": "COLUMN_2",
					"nickname": "COLUMN_2",
					"protectMode": "govern"
				}
			];

			const result = utils.getNewGovernColumns(alationColumns, altrDbs);
			expect(result).toEqual(expected);
		});
	});
});

describe('TESTING filterTaggedSnowflakeColumns()', () => {
	describe('Passing an array of tagged Snowflake columns that have exact matching Alation columns', () => {
		it('Shall an empty array', () => {
			const alationColumns = [
				{
					"id": 1,
					"name": "column_1",
					"title": "Employee Quota data sales ids",
					"description": "Stores the sales id amount data from the employee_quota table.",
					"ds_id": 1,
					"key": "1.database1.public.employee_quota.column_1",
					"custom_fields": [{
						"value": ["tag1"],
						"field_id": 10009,
						"field_name": "ALTR Policy Tag"
					}]
				},
				{
					"id": 2,
					"name": "column_2",
					"title": "Employee Quota data sales ids",
					"description": "Stores the sales id amount data from the employee_quota table.",
					"ds_id": 1,
					"key": "1.database1.public.employee_quota.column_2",
					"custom_fields": [{
						"value": ["tag1"],
						"field_id": 10009,
						"field_name": "ALTR Policy Tag"
					}]
				}
			];

			const taggedSnowflakeColumns = [{ column: 'database1.public.employee_quota.column_1', tagValue: 'tag1' }, { column: 'database1.public.employee_quota.column_2', tagValue: 'tag1' }];

			const expected = [];

			const result = utils.filterTaggedSnowflakeColumns(taggedSnowflakeColumns, alationColumns);
			expect(result).toEqual(expected);
		});
	});
});

describe('TESTING getAltrDatabaseObjects()', () => {
	describe('Passing an array of ALTR databases that match array of updatable databases names', () => {
		it('Shall return the same ALTR databases', () => {
			const altrDbs = [
				{
					"id": 1,
					"clientId": "string",
					"friendlyDatabaseName": "database1",
					"databaseName": "database1",
					"databaseUsername": "string",
					"SFCount": 0,
					"inProgress": 0,
					"lastConnectedTime": "2020-06-10T20:00:37.000Z"
				}
			];

			const updatableDatabase = ['database1'];


			const expected = [
				{
					"id": 1,
					"clientId": "string",
					"friendlyDatabaseName": "database1",
					"databaseName": "database1",
					"databaseUsername": "string",
					"SFCount": 0,
					"inProgress": 0,
					"lastConnectedTime": "2020-06-10T20:00:37.000Z"
				}
			];

			const result = utils.getAltrDatabaseObjects(updatableDatabase, altrDbs);
			expect(result).toEqual(expected);
		});
	});
});