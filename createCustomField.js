const { default: axios } = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
const querystring = require('querystring');
const args = require('yargs').argv;


const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

let login = async (domain, account, password) => {
	const url = encodeURI(`https://${domain}/login/`);

	try {
		await client.get(url);
		console.log(jar.toJSON());

		const postLoginOptions = {
			headers: { 'Referer': url },
		};

		const data = querystring.stringify({ 'csrfmiddlewaretoken': jar.toJSON().cookies[0].value, 'ldap_user': account, 'password': password });

		await client.post(url, data, postLoginOptions);
		console.log(jar.toJSON());

		await client.get(`https://${domain}/`);
		console.log(jar.toJSON());

	} catch (error) {
		throw error;
	}
};

let main = async () => {
	try {
		let domain = args.domain;
		await login(domain, args.account, args.password);

		let dataColumn = {
			"field_type": "MULTI_PICKER",
			"name": "ALTR Policy Tags",
			"name_plural": "ALTR Policy Tags",
			"name_singular": "ALTR Policy Tag",
			"backref_name": "null",
			"backref_tooltip_text": "null",
			"allow_multiple": "true",
			"allowed_otypes": [],
			"options": '[{"title":"PCI", "tooltip_text":"", "old_index":null}, {"title":"PII", "tooltip_text":"", "old_index":null}, {"title":"PHI", "tooltip_text":"", "old_index":null}]',
			"builtin_name": "null",
			"universal_field": "false",
			"flavor": "DEFAULT",
			"tooltip_text": "ALTR Policy Tags"
		};

		let postCustomFieldOptions = { headers: { 'X-CSRFToken': jar.toJSON().cookies[0].value, 'Cookie': `csrftoken=${jar.toJSON().cookies[0].value}; sessionid=${jar.toJSON().cookies[1].value}`, 'Referer': `https://${domain}/login/` } };
		let createCustomFieldColumn = await client.post(`https://${domain}/ajax/custom_field/`, dataColumn, postCustomFieldOptions);
		console.log(createCustomFieldColumn.data);

	} catch (error) {
		console.log(error);
		return;
	}

	console.log('\nCUSTOM FIELDS CREATED!');
};

main();