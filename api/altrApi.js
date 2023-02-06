const axios = require('axios');
const axiosRetry = require('axios-retry');


axiosRetry(axios, {
	retries: 2,
	retryCondition: (error) => {
		return axiosRetry.isNetworkOrIdempotentRequestError(error)
			|| error.response.status.toString()[0] == '4' || error.response.status.toString()[0] == '5' && error.response.status.toString() != '409';
	},
	retryDelay: axiosRetry.exponentialDelay,
});

/**
 * Gets databases in ALTR of specific database type
 * @param {String} altrDomain The domain of your ALTR organization
 * @param {String} basicAuth Base64 encoded string using your ALTR API key and password 
 * @returns JS Array of Objects
 */
let getDatabases = async (altrDomain, basicAuth, databaseType) => {
	const options = {
		method: 'GET',
		url: encodeURI(`https://${altrDomain}/api/databases?databaseType=${databaseType}`),
		headers: {
			'Authorization': 'Basic ' + basicAuth,
			'Content-Type': 'application/json'
		}
	};

	try {
		let response = await axios.request(options);
		return response.data.data.databases;
	} catch (error) {
		console.error('GET altr databases error');
		if (error.response) {
			console.error(error.response.data);
			console.error(error.response.status);
		}
		throw error;
	}

};
exports.getDatabases = getDatabases;

/**
 * Adds Snowflake database to ALTR
 * @param {String} altrDomain The domain of your ALTR organization
 * @param {String} basicAuth Base64 encoded string using your ALTR API key and password 
 * @param {String} dbName The name of the database on the host you are trying to connect 
 * @param {String} dbPassword The password of the database on the host you're trying to connect 
 * @param {String} hostname The host where the database you're trying to connect is located 
 * @param {String} dbUsername The username of the ALTR service user 
 * @param {String} snowflakeRole The role the ALTR service user is under 
 * @param {String} warehouseName The warehouse that was granted to the ALTR service user
 * @returns JS Object
 */
let addSnowflakeDb = async (altrDomain, basicAuth, dbName, dbPassword, hostname, dbUsername, snowflakeRole, warehouseName) => {
	let options = {
		method: 'POST',
		url: encodeURI(`https://${altrDomain}/api/databases/`),
		headers: {
			'Authorization': 'Basic ' + basicAuth,
			'Content-Type': 'application/json'
		},
		data: {
			friendlyDatabaseName: dbName.toUpperCase(),
			databasePort: 443,
			maxNumberOfConnections: '5',
			maxNumberOfBatches: '15',
			databaseName: dbName,
			databasePassword: dbPassword,
			databaseType: 'snowflake_external_functions',
			hostname: hostname,
			databaseUsername: dbUsername,
			snowflakeRole: snowflakeRole,
			warehouseName: warehouseName,
			shouldClassify: false,
			dataUsageHistory: false,
			classificationType: '3',
		}
	};

	try {
		let response = await axios.request(options);
		console.log('Added ALTR database: ' + dbName);
		return response.data.data;
	} catch (error) {
		console.error('POST add database to altr error');
		if (error.response) {
			console.error(error.response.data);
			console.error(error.response.status);
		}
		throw error;
	}
};
exports.addSnowflakeDb = addSnowflakeDb;

/**
 * Adds a Snowflake database to ALTR using partner connect account
 * @param {String} altrDomain The domain of your ALTR organization
 * @param {String} basicAuth Base64 encoded string using your ALTR API key and password
 * @param {String} dbName The name of the database on the host you are trying to connect
 * @param {Number} accountId The id of the partner connect snowflake account
 * @returns JS Object
 */
let addSnowflakeDbPC = async (altrDomain, basicAuth, dbName, accountId) => {
	let options = {
		method: 'POST',
		url: encodeURI(`https://${altrDomain}/api/databases/snowflake/connect`),
		headers: {
			'Authorization': 'Basic ' + basicAuth,
			'Content-Type': 'application/json'
		},
		data: {
			friendlyDatabaseName: dbName.toUpperCase(),
			databaseName: dbName,
			accountId: accountId,
			shouldClassify: false,
			dataUsageHistory: false,
			classificationType: '3',
		}
	};

	try {
		let response = await axios.request(options);
		console.log('Added ALTR database (Partner Connect): ' + dbName);
		return response.data.data;
	} catch (error) {
		console.error('POST add database to altr error (Partner Connect)');
		if (error.response) {
			console.error(error.response.data);
			console.error(error.response.status);
		}
		throw error;
	}
};
exports.addSnowflakeDbPC = addSnowflakeDbPC;

/**
 * Updates Snowflake database in ALTR
 * @param {String} altrDomain The domain of your ALTR organization
 * @param {String} basicAuth Base64 encoded string using your ALTR API key and password 
 * @param {String} dbName The name of the database on the host you are trying to connect 
 * @param {Number} dbId The database ID that correlates to the data being govern or protected belongs to
 * @returns JS Object
 */
let updateSnowflakeDbInAltr = async (altrDomain, basicAuth, dbName, dbId) => {
	let options = {
		method: 'PATCH',
		url: encodeURI(`https://${altrDomain}/api/databases/${dbId}`),
		headers: {
			'Authorization': 'Basic ' + basicAuth,
			'Content-Type': 'application/json'
		},
		data: {
			shouldClassify: true,
			dataUsageHistory: true,
			classificationType: '3',
		}
	};

	try {
		let response = await axios.request(options);
		console.log('Updated ALTR database: ' + dbName);
		return response.data;
	} catch (error) {
		console.error('PATCH update database in altr error');
		if (error.response) {
			console.error(error.response.data);
			console.error(error.response.status);
		}
		throw error;
	}
};
exports.updateSnowflakeDbInAltr = updateSnowflakeDbInAltr;

/**
 * Adds column to ALTR
 * @param {String} altrDomain The domain of your ALTR organization
 * @param {String} basicAuth Base64 encoded string using your ALTR API key and password 
 * @param {Number} dbId The database ID that correlates to the data being govern or protected belongs to
 * @param {String} tableName The name of the table the data being govern or protected belongs to
 * @param {String} columnName The name of the column the data being govern or protected belongs to
 * @returns JS Object
 */
let addColumnToAltr = async (altrDomain, basicAuth, dbId, tableName, columnName) => {
	let options = {
		method: 'POST',
		url: encodeURI(`https://${altrDomain}/api/data`),
		headers: {
			'Authorization': 'Basic ' + basicAuth,
			'Content-Type': 'application/json'
		},
		data: {
			databaseId: dbId,
			tableName: tableName,
			columnName: columnName,
			nickname: columnName,
			protectMode: 'govern',
		}
	};

	try {
		let response = await axios.request(options);
		console.log('Added ALTR column: ' + columnName);
		return response.data;
	} catch (error) {
		if (error.response) {
			if (error.response.status != 409) {
				console.error('POST add column to altr error');
				console.error(error.response.data);
				console.error(error.response.status);
				throw error;
			}
		}
	}
};
exports.addColumnToAltr = addColumnToAltr;

/**
 * Gets snowflake account information
 * @param {String} altrDomain The domain of your ALTR organization
 * @param {String} basicAuth Base64 encoded string using your ALTR API key and password
 * @returns JS Array of Objects
 */
let getSnowflakeAccounts = async (altrDomain, basicAuth) => {
	const options = {
		method: 'GET',
		url: encodeURI(`https://${altrDomain}/api/databases/snowflake/accounts`),
		headers: {
			'Authorization': 'Basic ' + basicAuth,
			'Content-Type': 'application/json'
		}
	};

	try {
		let response = await axios.request(options);
		return response.data.data;
	} catch (error) {
		console.error('GET altr Snowflake accounts error');
		if (error.response) {
			console.error(error.response.data);
			console.error(error.response.status);
		}
		throw error;
	}
};
exports.getSnowflakeAccounts = getSnowflakeAccounts;

/**
 * Gets list of administrators in ALTR organization
 * @param {String} altrDomain The domain of your ALTR organization
 * @param {String} basicAuth Base64 encoded string using your ALTR API key and password 
 * @returns True || False
 */
let getAdministrators = async (altrDomain, basicAuth) => {
	const options = {
		method: 'GET',
		url: encodeURI(`https://${altrDomain}/api/administrators`),
		headers: {
			'Authorization': 'Basic ' + basicAuth,
			'Content-Type': 'application/json'
		}
	};

	try {
		await axios.request(options);
		return true;
	} catch (error) {
		console.error('GET altr administrators error');
		if (error.response) {
			console.error(error.response.data);
			console.error(error.response.status);
		}
		return false;
	}
};
exports.getAdministrators = getAdministrators;
