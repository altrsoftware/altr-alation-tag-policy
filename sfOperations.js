const snowflake = require('snowflake-sdk');

/**
 * Adds new tag values to 'ALATION_TAG' in Snowflake 
 * @param {Pool} connectionPool The connection pool made using snowflake-sdk
 * @param {String} database The database of the column 
 * @param {String} schema The schema of the column
 * @param {String} tagValue The tag value from Alation
 * @returns Promise
 */
let updateTagValue = async (connectionPool, database, schema, tagValue) => {
	try {

		connectionPool.use(async (clientConnection) => {
			await clientConnection.execute({
				sqlText: `use ${database}.${schema}`,
				complete: async (error, stmt) => {
					if (error) {
						console.log(`Unable to execute statement. ${error}`);
						throw error;
					} else {
						console.log(`Statement successfully executed: ${stmt.getSqlText()}`);

						await clientConnection.execute({
							sqlText: `create tag if not exists alation_tag`,
							complete: async (error, stmt) => {
								if (error) {
									console.log(`Unable to execute statement. ${error}`);
									throw error;
								} else {
									console.log(`Statement successfully executed: ${stmt.getSqlText()}`);
									await new Promise(r => setTimeout(r, 3000));
									await clientConnection.execute({
										sqlText: 'alter tag alation_tag add allowed_values ' + `'${tagValue}'`,
										complete: async (error, stmt) => {
											if (error) {
												console.log(`Unable to execute statement. ${error}`);
												throw error;
											} else {
												console.log(`Statement successfully executed: ${stmt.getSqlText()}`);
											}
										}
									});
								}
							}
						});
					}
				}
			});
		});

		return;
	} catch (error) {
		throw error;
	}
};

/**
 * Applies tag values to column in Snowflake
 * @param {*} connectionPool The connection pool made using snowflake-sdk
 * @param {*} database The database of the column
 * @param {*} schema The schema of the column
 * @param {*} table The table of the column
 * @param {*} column The column
 * @param {*} tagValue The "Policy Tag"
 * @returns Promise
 */
let applyToColumn = async (connectionPool, database, schema, table, column, tagValue) => {
	try {

		connectionPool.use(async (clientConnection) => {
			await clientConnection.execute({
				sqlText: `use ${database}.${schema}`,
				complete: async (error, stmt) => {
					if (error) {
						console.log(`Unable to execute statement. ${error}`);
						throw error;
					} else {
						console.log(`Statement successfully executed: ${stmt.getSqlText()}`);
						await clientConnection.execute({
							sqlText: `alter table ${table} modify column ${column} set tag alation_tag = '${tagValue}'`,
							complete: async (error, stmt) => {
								if (error) {
									console.log(`Unable to execute statement. ${error}`);
									throw error;
								} else {
									console.log(`Statement successfully executed: ${stmt.getSqlText()}`);
								}
							}
						});
					}
				}
			});
		});

		return;
	} catch (error) {
		throw error;
	}
};

/**
 * Loops through Alation columns adds 'Policy Tags' to Snowflake Object Tag named, 'ALATION_TAG', and applies tag values to column
 * @param {String} account The Snowflake account (example: sa32fjd.us-east-1)
 * @param {String} username The Snowflake username (ALTR service user)
 * @param {String} password The password to the Snowflake user
 * @param {Array} alationColumns The Alation columns with "Policy Tags"
 */
let applyPolicyTags = async (account, username, password, role, alationColumns, customFieldId) => {
	try {
		const connectionPool = snowflake.createPool(
			{
				account: account,
				username: username,
				password: password,
				role: role,
			},
			{
				max: 10,
				min: 0
			}
		);

		for (const column of alationColumns) {
			if (column != null) {
				const customField = column.custom_fields.find(customField => customField.field_id === customFieldId);
				for (const tag of customField.value) {
					await updateTagValue(connectionPool, column.key.split('.')[1], column.key.split('.')[2], tag);
					await new Promise(r => setTimeout(r, 5000));
					await applyToColumn(connectionPool, column.key.split('.')[1], column.key.split('.')[2], column.key.split('.')[3], column.key.split('.')[4], tag);
				}
			}
		}

		return;
	} catch (error) {
		throw (error);
	}
};
exports.applyPolicyTags = applyPolicyTags;


