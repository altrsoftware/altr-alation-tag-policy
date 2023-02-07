const axios = require('axios').default;
const axiosRetry = require('axios-retry');

// axiosRetry(axios, {
// 	retries: 2,
// 	retryCondition: (error) => {
// 		return axiosRetry.isNetworkOrIdempotentRequestError(error)
// 			|| error.response.status.toString()[0] == '4' || error.response.status.toString()[0] == '5';
// 	},
// 	retryDelay: axiosRetry.exponentialDelay,
// });

/**
 * Gets data of custom fields
 * @param {String} alationDomain The domain of your Alation organization 
 * @param {String} alationApiAccessToken The Alation API Access Token (short-term) 
 * @param {String} field_type The custom field type
 * @param {String} name_plural The custom field name
 * @returns JS Array of Objects
 */
let getMultipleCustomFields = async (alationDomain, alationApiAccessToken, field_type, name_plural) => {
	const options = {
		method: 'GET',
		url: encodeURI(`https://${alationDomain}/integration/v2/custom_field/?field_type=${field_type}&name_plural=${name_plural}`),
		headers: { accept: 'application/json', TOKEN: alationApiAccessToken },
	};

	try {
		let response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error('GET multiple custom fields error');
		if (error.response) {
			console.error(error.response.data);
			console.error(error.response.status);
		}
		throw error;
	}
};
exports.getMultipleCustomFields = getMultipleCustomFields;

/**
 * Gets list of databases from Alation 
 * @param {String} alationDomain The domain of your Alation organization 
 * @param {String} alationApiAccessToken The Alation API Access Token (short-term) 
 * @param {Boolean} includeUndeployed Specifies if undeployed datasources should be included in retrieved list
 * @param {Boolean} includeHidden Specifies if hidden datasources should be included in retrieved list 
 * @returns JS Array of Objects
 */
let getDatabases = async (alationDomain, alationApiAccessToken, includeUndeployed, includeHidden) => {
	const options = {
		method: 'GET',
		url: encodeURI(`https://${alationDomain}/integration/v1/datasource/?include_undeployed=${includeUndeployed}&include_hidden=${includeHidden}`),
		headers: { accept: 'application/json', TOKEN: alationApiAccessToken },
	};

	try {
		let response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error('GET databases error');
		if (error.response) {
			console.error(error.response.data);
			console.error(error.response.status);
		}
		throw error;
	}
};
exports.getDatabases = getDatabases;

/**
 * Gets columns in Alation using custom field
 * @param {String} alationDomain The domain of your Alation organization
 * @param {String} alationApiAccessToken The Alation API Access Token (short-term) 
 * @param {Number} columnId The ID of the column you are requesting info on 
 * @returns JS Array of Objects
 */
let getColumns = async (alationDomain, alationApiAccessToken, alationCustomFieldId) => {
	const options = {
		method: 'GET',
		url: encodeURI(`https://${alationDomain}/integration/v2/column/?custom_fields=[{"field_id":${alationCustomFieldId}}]`),
		headers: { accept: 'application/json', 'content-type': 'application/json', TOKEN: alationApiAccessToken },
	};

	try {
		let response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error('GET alation column info error');
		if (error.response) {
			console.error(error.response.data);
			console.error(error.response.status);
		}
		throw error;
	}
};
exports.getColumns = getColumns;

/**
 * Gets user info based on email
 * @param {String} alationDomain The domain of your Alation organization
 * @param {String} alationApiAccessToken The Alation API Access Token (short-term) 
 * @param {String} email The email of the administrator you are searching for in your Alation organization
 * @returns JS Array of Objects
 */
let getUsers = async (alationDomain, alationApiAccessToken, email) => {
	let options = {
		method: 'GET',
		url: encodeURI(`https://${alationDomain}/integration/v1/user/?email=${email}&limit=100&skip=0`),
		headers: { TOKEN: alationApiAccessToken, accept: 'application/json' }
	};

	try {
		await axios.request(options);
		return true;
	} catch (error) {
		console.error('GET alation users');
		if (error.response) {
			console.error(error.response.data);
			console.error(error.response.status);
		}
		return false;
	}
};
exports.getUsers = getUsers;