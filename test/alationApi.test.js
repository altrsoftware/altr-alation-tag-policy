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


describe('TESTING getColumnInfoById()', () => {

	const url = `https://${process.env.ALATION_DOMAIN}/integration/v2/column/?id=${0}`;

	describe('When the call is successful', () => {
		it('Shall return an array with a single column', async () => {
			const expected = [
				{
					"id": 161782,
					"name": "sales_id",
					"title": "Employee Quota data sales ids",
					"description": "Stores the sales id amount data from the employee_quota table.",
					"ds_id": 95,
					"key": "95.marketing_dept.employee_quota.sales_id",
					"url": "/attribute/161782/",
				}
			];

			mock.onGet(url).reply(200, expected);

			const result = await alation.getColumnInfoById(process.env.ALATION_DOMAIN, null, 0);

			expect(mock.history.get[0].url).toEqual(url);
			expect(result).toEqual(expected);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall throw an error', async () => {
			const expectedError = async () => {
				await alation.getColumnInfoById(process.env.ALATION_DOMAIN, null, 0);
			}

			await expect(expectedError()).rejects.toThrowError();
		});
	});
});

describe('TESTING getTags()', () => {

	const url = `https://${process.env.ALATION_DOMAIN}/integration/tag/`;

	describe('When the call is successful', () => {
		it('Shall return an array of tags', async () => {
			const expected = [
				{
					"id": 1,
					"name": "Test Database",
					"description": "<p>This tag is for test db's</p>",
					"number_of_objects_tagged": 1,
					"ts_created": "2017-09-26T17:40:07.456130Z",
					"url": "/tag/1/"
				},
				{
					"id": 2,
					"name": "@Mentions",
					"description": "",
					"number_of_objects_tagged": 3,
					"ts_created": "2017-09-26T18:26:07.144050Z",
					"url": "/tag/2/"
				}
			];

			mock.onGet(url).reply(200, expected);

			const result = await alation.getTags(process.env.ALATION_DOMAIN, null);

			expect(mock.history.get[0].url).toEqual(url);
			expect(result).toEqual(expected);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall throw an error', async () => {
			const expectedError = async () => {
				await alation.getTags(process.env.ALATION_DOMAIN, null);
			}

			await expect(expectedError()).rejects.toThrowError();
		});
	});
});

describe('TESTING getColumnsOfTag()', () => {

	const url = `https://${process.env.ALATION_DOMAIN}/integration/tag/TAG_NAME/subject/`;

	describe('When the call is successful', () => {
		it('Shall return an array of columns', async () => {
			const expected = [
				{
					"ts_tagged": "2017-09-22T23:57:29.682968Z",
					"subject": {
						"url": "/user/1/",
						"otype": "attribute",
						"id": 1
					}
				}
			];

			mock.onGet(url).reply(200, expected);

			const result = await alation.getColumnsOfTag(process.env.ALATION_DOMAIN, null, 'TAG_NAME');

			expect(mock.history.get[0].url).toEqual(url);
			expect(result).toEqual(expected);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall throw an error', async () => {
			const expectedError = async () => {
				await alation.getColumnsOfTag(process.env.ALATION_DOMAIN, null, 'TAG_NAME');
			}

			await expect(expectedError()).rejects.toThrowError();
		});
	});
});

describe('TESTING getUsers()', () => {

	const url = `https://${process.env.ALATION_DOMAIN}/integration/v1/user/?email=${'EXAMPLE@EMAIL.COM'}&limit=100&skip=0`;

	describe('When the call is successful', () => {
		it('Shall return true', async () => {
			const expected = true;

			mock.onGet(url).reply(200, expected);

			const result = await alation.getUsers(process.env.ALATION_DOMAIN, null, 'EXAMPLE@EMAIL.COM');

			expect(mock.history.get[0].url).toEqual(url);
			expect(result).toEqual(expected);
		});
	});

	describe('When the call is unsuccessful', () => {
		it('Shall return false', async () => {
			const expected = false;

			mock.onGet(url).reply(400, expected);

			const result = await alation.getUsers(process.env.ALATION_DOMAIN, null, 'EXAMPLE@EMAIL.COM');

			expect(mock.history.get[0].url).toEqual(url);
			expect(result).toEqual(expected);
		});
	});
});

