const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const altr = require('../api/altrApi.js');
require('dotenv').config();

let mock;

beforeAll(() => {
	mock = new MockAdapter(axios);
});

afterEach(() => {
	mock.reset();
});

describe('TESTING getDatabases()', () => {

	const url = `https://${process.env.ALTR_DOMAIN}/api/databases?databaseType=snowflake_external_functions`;

	describe('When the call is successful', () => {
		it('Shall return an array of databases', async () => {
			const mockResponse = {
				"data": {
					"databases": [
						{
							"id": 0,
							"clientId": "string",
							"friendlyDatabaseName": "string",
							"databaseName": "string",
							"databaseUsername": "string",
							"SFCount": 0,
							"inProgress": 0,
							"lastConnectedTime": "2020-06-10T20:00:37.000Z"
						}
					],
					"count": 0
				},
				"success": true
			};

			mock.onGet(url).reply(200, mockResponse);

			const result = await altr.getDatabases(process.env.ALTR_DOMAIN, null, 'snowflake_external_functions');

			expect(mock.history.get[0].url).toEqual(url);
			expect(result).toEqual(mockResponse.data.databases);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall throw an error', async () => {
			const expectedError = async () => {
				await altr.getDatabases(process.env.ALTR_DOMAIN, null, 'snowflake_external_functions');
			};

			await expect(expectedError()).rejects.toThrowError();
		});
	});

});

describe('TESTING addSnowflakeDb()', () => {
	const url = `https://${process.env.ALTR_DOMAIN}/api/databases/`;
	describe('When the call is successful', () => {
		it('Shall return a object', async () => {
			const mockResponse = {
				"data": {
					"id": 0,
					"friendlyDatabaseName": "string",
					"maxNumberOfConnections": 0,
					"maxNumberOfBatches": 0,
					"databasePort": 0,
					"databaseUsername": "string",
					"databaseType": "sqlserver",
					"databaseName": "string",
					"hostname": "string",
					"connectionString": true,
					"clientId": "string",
					"snowflakeRole": "string",
					"warehouseName": "string",
					"SFCount": 0,
					"dataUsageHistory": true,
					"classificationStarted": true,
					"lastConnectedTime": "2020-06-10T20:00:37.000Z",
					"inProgress": 0
				},
				"success": true
			};

			mock.onPost(url).reply(200, mockResponse);

			const result = await altr.addSnowflakeDb(process.env.ALTR_DOMAIN, null, 'EXAMPLE_DB_NAME', 'EXAMPLE_DB_PASSWORD', 'EXAMPLE_HOSTNAME', 'EXAMPLE_DB_USERNAME', 'EXAMPLE_SNOWFLAKE_ROLE', 'EXAMPLE_WAREHOUSE_NAME');

			expect(mock.history.post[0].url).toEqual(url);
			expect(result).toEqual(mockResponse.data);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall throw an error', async () => {
			const expectedError = async () => {
				await altr.addSnowflakeDb(process.env.ALTR_DOMAIN, '', 'EXAMPLE_DB_NAME', 'EXAMPLE_DB_PASSWORD', 'EXAMPLE_HOSTNAME', 'EXAMPLE_DB_USERNAME', 'EXAMPLE_SNOWFLAKE_ROLE', 'EXAMPLE_WAREHOUSE_NAME');
			};

			await expect(expectedError()).rejects.toThrowError();
		});
	});

});

describe('TESTING addSnowflakeDbPC()', () => {
	const url = `https://${process.env.ALTR_DOMAIN}/api/databases/snowflake/connect`;
	describe('When the call is successful', () => {
		it('Shall return a object', async () => {
			const mockResponse = {
				"data": {
					"id": 0,
					"friendlyDatabaseName": "string",
					"maxNumberOfConnections": 0,
					"maxNumberOfBatches": 0,
					"databasePort": 0,
					"databaseUsername": "string",
					"databaseType": "sqlserver",
					"databaseName": "string",
					"hostname": "string",
					"connectionString": true,
					"clientId": "string",
					"snowflakeRole": "string",
					"warehouseName": "string",
					"SFCount": 0,
					"dataUsageHistory": true,
					"classificationStarted": true,
					"lastConnectedTime": "2020-06-10T20:00:37.000Z",
					"inProgress": 0
				},
				"success": true
			};

			mock.onPost(url).reply(200, mockResponse);

			const result = await altr.addSnowflakeDbPC(process.env.ALTR_DOMAIN, null, 'EXAMPLE_DB_NAME', 'EXAMPLE_DB_PASSWORD', 'EXAMPLE_HOSTNAME', 'EXAMPLE_DB_USERNAME', 'EXAMPLE_SNOWFLAKE_ROLE', 'EXAMPLE_WAREHOUSE_NAME');

			expect(mock.history.post[0].url).toEqual(url);
			expect(result).toEqual(mockResponse.data);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall throw an error', async () => {
			const expectedError = async () => {
				await altr.addSnowflakeDbPC(process.env.ALTR_DOMAIN, '', 'EXAMPLE_DB_NAME', 'EXAMPLE_DB_PASSWORD', 'EXAMPLE_HOSTNAME', 'EXAMPLE_DB_USERNAME', 'EXAMPLE_SNOWFLAKE_ROLE', 'EXAMPLE_WAREHOUSE_NAME');
			};

			await expect(expectedError()).rejects.toThrowError();
		});
	});
});

describe('TESTING updateSnowflakeDb()', () => {

	const url = `https://${process.env.ALTR_DOMAIN}/api/databases/${0}`;

	describe('When the call is successful', () => {
		it('Shall return a object', async () => {
			const mockResponse = {
				"data": {
					"id": 0,
					"friendlyDatabaseName": "string",
					"maxNumberOfConnections": 0,
					"maxNumberOfBatches": 0,
					"databasePort": 0,
					"databaseUsername": "string",
					"databaseType": "sqlserver",
					"databaseName": "string",
					"hostname": "string",
					"connectionString": true,
					"clientId": "string",
					"snowflakeRole": "string",
					"warehouseName": "string",
					"SFCount": 0,
					"dataUsageHistory": true,
					"classificationStarted": true,
					"lastConnectedTime": "2020-06-10T20:00:37.000Z",
					"inProgress": 0
				},
				"success": true
			};

			mock.onPatch(url).reply(200, mockResponse);

			const result = await altr.updateSnowflakeDb(process.env.ALTR_DOMAIN, '', 'EXAMPLE_DB_NAME', 0);

			expect(mock.history.patch[0].url).toEqual(url);
			expect(result).toEqual(mockResponse.data);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall throw an error', async () => {
			const expectedError = async () => {
				await altr.updateSnowflakeDb(process.env.ALTR_DOMAIN, '', 'EXAMPLE_DB_NAME', 0);
			};

			await expect(expectedError()).rejects.toThrowError();
		});
	});

});

describe('TESTING addColumnToAltr()', () => {

	const url = `https://${process.env.ALTR_DOMAIN}/api/data`;

	describe('When the call is successful', () => {
		it('Shall return a object', async () => {
			const mockResponse = {
				"data": {
					"fieldId": 28,
					"nickname": "userNameWithLocks",
					"databaseId": 1,
					"tableId": 1,
					"tableName": "users",
					"scatterStatus": "unscattered",
					"pct": 100,
					"jobId": null,
					"groupId": null,
					"implementation": 1,
					"columnName": "username",
					"friendlyDatabaseName": "Eli's Database 2",
					"databaseHelperId": "f6450e74-f327-40ec-8d04-25acda3d9256"
				},
				"success": true
			};

			mock.onPost(url).reply(200, mockResponse);

			const result = await altr.addColumn(process.env.ALTR_DOMAIN, '', 0, 'TABLE_NAME_EXAMPLE', 'COLUMN_NAME_EXAMPLE');

			expect(mock.history.post[0].url).toEqual(url);
			expect(result).toEqual(mockResponse.data);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall throw an error', async () => {
			const expectedError = async () => {
				await altr.addColumn(process.env.ALTR_DOMAIN, '', 0, 'TABLE_NAME_EXAMPLE', 'COLUMN_NAME_EXAMPLE');
			};

			await expect(expectedError()).rejects.toThrowError();
		});
	});

});

describe('TESTING getSnowflakeAccounts()', () => {

	const url = `https://${process.env.ALTR_DOMAIN}/api/databases/snowflake/accounts`;

	describe('When the call is successful', () => {
		it('Shall return an array of accounts', async () => {
			const mockResponse = {
				"data": {
					"accounts": [
						{
							"id": 0,
							"name": "string",
							"username": "string"
						}
					]
				},
				"success": true
			};

			mock.onGet(url).reply(200, mockResponse);

			const result = await altr.getSnowflakeAccounts(process.env.ALTR_DOMAIN, null);

			expect(mock.history.get[0].url).toEqual(url);
			expect(result).toEqual(mockResponse.data.accounts);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall throw an error', async () => {
			const expectedError = async () => {
				await altr.getSnowflakeAccounts(process.env.ALTR_DOMAIN, null);
			};

			await expect(expectedError()).rejects.toThrowError();
		});
	});

});

describe('TESTING getAdministrators()', () => {

	const url = `https://${process.env.ALTR_DOMAIN}/api/administrators`;

	describe('When the call is successful', () => {
		it('Shall return true', async () => {
			const mockResponse = {
				"data": {
					"administrators": [
						{
							"id": 100,
							"firstName": "George",
							"lastName": "Washington",
							"name": "Washington, George",
							"email": "George@altr.com",
							"phone": 1115555555,
							"phoneNumber": "+11115555555",
							"activityTimestamp": "2023-02-07T15:43:14.906Z",
							"userStatus": "active",
							"role": "SUPERADMINISTRATOR",
							"countryCode": 1,
							"createdAt": "2020-06-10T20:00:37.000Z",
							"isLocked": false
						}
					],
					"count": 1
				},
				"success": true
			};

			mock.onGet(url).reply(200, mockResponse);

			const result = await altr.getAdministrators(process.env.ALTR_DOMAIN, null);

			expect(mock.history.get[0].url).toEqual(url);
			expect(result).toEqual(true);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall return false', async () => {
			const mockResponse = {
				"data": {
					"administrators": [
						{
							"id": 100,
							"firstName": "George",
							"lastName": "Washington",
							"name": "Washington, George",
							"email": "George@altr.com",
							"phone": 1115555555,
							"phoneNumber": "+11115555555",
							"activityTimestamp": "2023-02-07T15:43:14.906Z",
							"userStatus": "active",
							"role": "SUPERADMINISTRATOR",
							"countryCode": 1,
							"createdAt": "2020-06-10T20:00:37.000Z",
							"isLocked": false
						}
					],
					"count": 1
				},
				"success": true
			};

			mock.onGet(url).reply(400, mockResponse);

			const result = await altr.getAdministrators(process.env.ALTR_DOMAIN, null);

			expect(mock.history.get[0].url).toEqual(url);
			expect(result).toEqual(false);
		});
	});

});


