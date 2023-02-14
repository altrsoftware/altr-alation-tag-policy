const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const alation = require('../api/alationApi.js');
require('dotenv').config();

let mock;


beforeAll(() => {
	mock = new MockAdapter(axios);
});

afterEach(() => {
	mock.reset();
});

describe('TESTING getMultipleCustomFields()', () => {

	const url = `https://${process.env.ALATION_DOMAIN}/integration/v2/custom_field/?field_type=multi_picker&name_plural=ALTR`;

	describe('When the call is successful', () => {
		it('Shall return an array of custom fields', async () => {
			const mockResponse = [
				{
					"field_id": 10006,
					"ts_updated": "2023-02-06T22:14:13.472Z",
					"otype": "data",
					"oid": 5,
					"value": "string"
				}
			];

			mock.onGet(url).reply(200, mockResponse);

			const result = await alation.getMultipleCustomFields(process.env.ALATION_DOMAIN, null, 'multi_picker', 'ALTR');

			expect(mock.history.get[0].url).toEqual(url);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall throw an error', async () => {
			const expectedError = async () => {
				await alation.getMultipleCustomFields(process.env.ALATION_DOMAIN, null, 'multi_picker', 'ALTR');;
			};

			await expect(expectedError()).rejects.toThrowError();
		});
	});
});

describe('TESTING getDatabases()', () => {

	const url = `https://${process.env.ALATION_DOMAIN}/integration/v1/datasource/?include_undeployed=false&include_hidden=false`;

	describe('When the call is successful', () => {
		it('Shall return an array of databases', async () => {
			const mockResponse = [
				{
					"dbtype": "mysql",
					"host": "10.11.21.125",
					"port": 3306,
					"uri": "mysql://<hostname>:<port>/<db_name>",
					"dbname": "sample_dbname",
					"db_username": "alation",
					"title": "test_mysql",
					"description": "Sample mysql datasource setup",
					"deployment_setup_complete": true,
					"private": false,
					"is_virtual": false,
					"is_hidden": false,
					"id": 0,
					"supports_explain": true,
					"data_upload_disabled_message": "string",
					"hive_logs_source_type": 0,
					"metastore_uri": true,
					"is_hive": true,
					"is_gone": true,
				}
			];

			mock.onGet(url).reply(200, mockResponse);

			const result = await alation.getDatabases(process.env.ALATION_DOMAIN, null, false, false);

			expect(mock.history.get[0].url).toEqual(url);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall throw an error', async () => {
			const expectedError = async () => {
				await alation.getDatabases(process.env.ALATION_DOMAIN, null, false, false);
			};

			await expect(expectedError()).rejects.toThrowError();
		});
	});
});

describe('TESTING getColumns()', () => {

	const url = `https://${process.env.ALATION_DOMAIN}/integration/v2/column/?custom_fields=[{"field_id":${0}}]`;

	// describe('When the call is successful', () => {
	// 	it('Shall return an array of columns', async () => {
	// 		const mockResponse =[
	// 			{
	// 				"id": 161782,
	// 				"name": "sales_id",
	// 				"title": "Employee Quota data sales ids",
	// 				"description": "Stores the sales id amount data from the employee_quota table.",
	// 				"ds_id": 95,
	// 				"key": "95.marketing_dept.employee_quota.sales_id",
	// 				"url": "/attribute/161782/",
	// 			}
	// 		];

	// 		mock.onGet(url).reply(200, mockResponse);

	// 		const result = await alation.getColumns(process.env.ALATION_DOMAIN, null, 0);

	// 		expect(mock.history.get[0].url).toEqual(url);
	// 		expect(result).toEqual(mockResponse);
	// 	});
	// });

	describe('When the call is unsuccessful', () => {
		it('Shall throw an error', async () => {
			const expectedError = async () => {
				await alation.getColumns(process.env.ALATION_DOMAIN, null, 0);
			};

			await expect(expectedError()).rejects.toThrowError();
		});
	});
});


describe('TESTING getUsers()', () => {

	const url = `https://${process.env.ALATION_DOMAIN}/integration/v1/user/?email=${'EXAMPLE@EMAIL.COM'}&limit=100&skip=0`;

	describe('When the call is successful', () => {
		it('Shall return true', async () => {
			const mockResponse = [
				{
					"display_name": "string",
					"email": "string",
					"id": 0,
					"profile_id": 0,
					"url": "string"
				}
			];

			mock.onGet(url).reply(200, mockResponse);

			const result = await alation.getUsers(process.env.ALATION_DOMAIN, null, 'EXAMPLE@EMAIL.COM');

			expect(mock.history.get[0].url).toEqual(url);
			expect(result).toEqual(true);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall return false', async () => {
			const mockResponse = [
				{
					"display_name": "string",
					"email": "string",
					"id": 0,
					"profile_id": 0,
					"url": "string"
				}
			];

			mock.onGet(url).reply(400, mockResponse);

			const result = await alation.getUsers(process.env.ALATION_DOMAIN, null, 'EXAMPLE@EMAIL.COM');

			expect(mock.history.get[0].url).toEqual(url);
			expect(result).toEqual(false);
		});
	});
});

