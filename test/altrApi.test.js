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

describe('TESTING getAltrSnowflakeDbs()', () => {

	const url = `https://${process.env.ALTR_DOMAIN}/api/databases?databaseType=snowflake_external_functions`;

	describe('When the call is successful', () => {
		it('Shall return an array of objects', async () => {
			const expected = [{
				"id": 0,
				"clientId": "string",
				"friendlyDatabaseName": "string",
				"databaseName": "string",
				"databaseUsername": "string",
				"SFCount": 0
			}];

			mock.onGet(url).reply(200, expected);

			const result = await altr.getAltrSnowflakeDbs(process.env.ALTR_DOMAIN);

			expect(mock.history.get[0].url).toEqual(url);
			expect(result).toEqual(expected);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall throw an error', async () => {
			const expectedError = async () => {
				await altr.getAltrSnowflakeDbs(process.env.ALTR_DOMAIN);
			}

			await expect(expectedError()).rejects.toThrowError();
		});
	});

});

describe('TESTING addSnowflakeDbToAltr()', () => {

	const url = `https://${process.env.ALTR_DOMAIN}/api/databases/`;

	describe('When the call is successful', () => {
		it('Shall return a object', async () => {
			const expected = {
				"friendlyDatabaseName": "string",
				"databasePort": 0,
				"maxNumberOfConnections": "5",
				"maxNumberOfBatches": "15",
				"databaseName": "string",
				"databasePassword": "string",
			};

			mock.onPost(url).reply(200, expected);

			const result = await altr.addSnowflakeDbToAltr(process.env.ALTR_DOMAIN, '', 'EXAMPLE_DB_NAME', 'EXAMPLE_DB_PASSWORD', 'EXAMPLE_HOSTNAME', 'EXAMPLE_DB_USERNAME', 'EXAMPLE_SNOWFLAKE_ROLE', 'EXAMPLE_WAREHOUSE_NAME');

			expect(mock.history.post[0].url).toEqual(url);
			expect(result).toEqual(expected);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall throw an error', async () => {
			const expectedError = async () => {
				await altr.addSnowflakeDbToAltr(process.env.ALTR_DOMAIN, '', 'EXAMPLE_DB_NAME', 'EXAMPLE_DB_PASSWORD', 'EXAMPLE_HOSTNAME', 'EXAMPLE_DB_USERNAME', 'EXAMPLE_SNOWFLAKE_ROLE', 'EXAMPLE_WAREHOUSE_NAME');
			}

			await expect(expectedError()).rejects.toThrowError();
		});
	});

});

describe('TESTING updateSnowflakeDbInAltr()', () => {

	const url = `https://${process.env.ALTR_DOMAIN}/api/databases/${0}`;

	describe('When the call is successful', () => {
		it('Shall return a object', async () => {
			const expected = {
				"data": {
					"id": 0,
					"friendlyDatabaseName": "string",
					"maxNumberOfConnections": 0,
					"maxNumberOfBatches": 0,
					"SFCount": 0,
					"dataUsageHistory": true,
					"classificationStarted": true
				},
				"success": true
			}

			mock.onPatch(url).reply(200, expected);

			const result = await altr.updateSnowflakeDbInAltr(process.env.ALTR_DOMAIN, '', 'EXAMPLE_DB_NAME', 'EXAMPLE_DB_PASSWORD', 'EXAMPLE_HOSTNAME', 'EXAMPLE_DB_USERNAME', 'EXAMPLE_SNOWFLAKE_ROLE', 'EXAMPLE_WAREHOUSE_NAME', 0);

			expect(mock.history.patch[0].url).toEqual(url);
			expect(result).toEqual(expected);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall throw an error', async () => {
			const expectedError = async () => {
				await altr.updateSnowflakeDbInAltr(process.env.ALTR_DOMAIN, '', 'EXAMPLE_DB_NAME', 'EXAMPLE_DB_PASSWORD', 'EXAMPLE_HOSTNAME', 'EXAMPLE_DB_USERNAME', 'EXAMPLE_SNOWFLAKE_ROLE', 'EXAMPLE_WAREHOUSE_NAME', 0);
			}

			await expect(expectedError()).rejects.toThrowError();
		});
	});

});


describe('TESTING addColumnToAltr()', () => {

	const url = `https://${process.env.ALTR_DOMAIN}/api/data`;

	describe('When the call is successful', () => {
		it('Shall return a object', async () => {
			const expected = {
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
			}

			mock.onPost(url).reply(200, expected);

			const result = await altr.addColumnToAltr(process.env.ALTR_DOMAIN, '', 0, 'TABLE_NAME_EXAMPLE', 'COLUMN_NAME_EXAMPLE');

			expect(mock.history.post[0].url).toEqual(url);
			expect(result).toEqual(expected);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall throw an error', async () => {
			const expectedError = async () => {
				await altr.addColumnToAltr(process.env.ALTR_DOMAIN, '', 0, 'TABLE_NAME_EXAMPLE', 'COLUMN_NAME_EXAMPLE');
			}

			await expect(expectedError()).rejects.toThrowError();
		});
	});

});


describe('TESTING getClassificationStatus()', () => {

	const url = `https://${process.env.ALTR_DOMAIN}/api/classification/status/${0}`;

	describe('When the call is successful', () => {
		it('Shall return a object', async () => {
			const expected = {
				"Status": "IN_PROGRESS",
				"StatusTime": 0
			}

			mock.onGet(url).reply(200, expected);

			const result = await altr.getClassificationStatus(process.env.ALTR_DOMAIN, '', 0);

			expect(mock.history.get[0].url).toEqual(url);
			expect(result).toEqual(expected);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall throw an error', async () => {
			const expectedError = async () => {
				await altr.getClassificationStatus(process.env.ALTR_DOMAIN, '', 0);
			}

			await expect(expectedError()).rejects.toThrowError();
		});
	});

});


describe('TESTING getAdministrators()', () => {

	const url = `https://${process.env.ALTR_DOMAIN}/api/administrators`;

	describe('When the call is successful', () => {
		it('Shall return true', async () => {
			const expected = true;

			mock.onGet(url).reply(200, expected);

			const result = await altr.getAdministrators(process.env.ALTR_DOMAIN);

			expect(mock.history.get[0].url).toEqual(url);
			expect(result).toEqual(expected);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall return false', async () => {
			const expected = false;

			mock.onGet(url).reply(400, expected);

			const result = await altr.getAdministrators(process.env.ALTR_DOMAIN);

			expect(mock.history.get[0].url).toEqual(url);
			expect(result).toEqual(expected);
		});
	});

});

