const axios = require('axios').default;
const axiosRetry = require('axios-retry');

axiosRetry(axios, {
	retries: 1,
	retryCondition: (error) => {
		return axiosRetry.isNetworkOrIdempotentRequestError(error)
			|| error.response.status.toString()[0] == '4' || error.response.status.toString()[0] == '5';
	},
	retryDelay: axiosRetry.exponentialDelay,
});

// ----------- SUBJECT INFO -----------
/**
 * Gets info about column in Alation
 * @param {String} alationDomain The domain of your Alation organization
 * @param {String} alationApiAccessToken The Alation API Access Token (short-term) 
 * @param {Number} columnId The ID of the column you are requesting info on 
 * @returns JS Array of Objects
 */
let getColumnInfoById = async (alationDomain, alationApiAccessToken, columnId) => {
	const options = {
		method: 'GET',
		url: encodeURI(`https://${alationDomain}/integration/v2/column/?id=${columnId}`),
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
exports.getColumnInfoById = getColumnInfoById;

// ----------- TAGS -----------
/**
 * Gets list of all tags in Alation
* @param {String} alationDomain The domain of your Alation organization
 * @param {String} alationApiAccessToken The Alation API Access Token (short-term) 
 * @returns JS Array of Objects
 */
let getTags = async (alationDomain, alationApiAccessToken) => {
	const options = {
		method: 'GET',
		url: encodeURI(`https://${alationDomain}/integration/tag/`),
		headers: { accept: 'application/json', 'content-type': 'application/json', TOKEN: alationApiAccessToken },
	};

	try {
		let response = await axios.request(options);
		return response.data;
	} catch (error) {
		console.error('GET alation tags error');
		if (error.response) {
			console.error(error.response.data);
			console.error(error.response.status);
		}
		throw error;
	}
};
exports.getTags = getTags;

/**
 * Gets all subjects that are tagged with specific tag
 * @param {String} alationDomain The domain of your Alation organization
 * @param {String} alationApiAccessToken The Alation API Access Token (short-term) 
 * @param {String} tagName The name of the tag
 * @returns JS Array of Objects
 */
let getColumnsOfTag = async (alationDomain, alationApiAccessToken, tagName) => {
	const options = {
		method: 'GET',
		url: encodeURI(`https://${alationDomain}/integration/tag/${tagName}/subject/`),
		headers: { accept: 'application/json', 'content-type': 'application/json', TOKEN: alationApiAccessToken },
	};

	try {
		let response = await axios.request(options);
		response.data = response.data.filter(subject => { return subject.subject.otype == 'attribute' });
		return response.data;
	} catch (error) {
		console.error('GET alation columns of alation tag');
		if (error.response) {
			console.error(error.response.data);
			console.error(error.response.status);
		}
		throw error;
	}
};
exports.getColumnsOfTag = getColumnsOfTag;

// ----------- USERS -----------
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
	}

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