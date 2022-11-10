const snowflake = require('snowflake-sdk');

/**
 * Adds new tag values to 'ALATION_TAG' in snowflake and applies tag to corresponding columns
 * @param {Pool} connectionPool The connection pool made using snowflake-sdk
 * @param {String} database The database of the column 
 * @param {String} schema The schema of the column
 * @param {String} table The table of the column
 * @param {String} column The column name
 * @param {String} tagValue The tag value from Alation
 */
let updateTagValueApplyToColumn = async (connectionPool, database, schema, table, column, tagValue) => {
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

									await clientConnection.execute({
										sqlText: 'alter tag alation_tag add allowed_values ' + `'${tagValue}'`,
										complete: async (error, stmt) => {
											if (error) {
												console.log(`Unable to execute statement. ${error}`);
												throw error;
											} else {
												console.log(`Statement successfully executed: ${stmt.getSqlText()}`);

												await clientConnection.execute({
													sqlText: `alter table ${table} modify column ${column} set tag alation_tag = '${tagValue}'`,
													complete: (error, stmt) => {
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
					}
				}
			});
		});
		return;
	} catch (error) {
		console.log(error);
		throw error;
	}
};

/**
 * Loops through Alation tags and builds tag objects to be applied in Snowflake
 * @param {String} account The Snowflake account (example: sa32fjd.us-east-1)
 * @param {String} username The Snowflake username (ALTR service user)
 * @param {String} password The password to the Snowflake user
 * @param {Array} tags The tags received from Alation
 */
let applyAlationTags = async (account, username, password, tags) => {
	const connectionPool = snowflake.createPool(
		{
			account: account,
			username: username,
			password: password
		},
		{
			max: 10,
			min: 0
		}
	);

	try {
		tags.forEach(tag => {
			let tagValue = tag.tagName;
			tag.tagSubjects.forEach(async subject => {
				let database = subject.tableName.split('.')[0];
				let schema = subject.tableName.split('.')[1];
				let table = subject.tableName.split('.')[2];
				let column = subject.columnName;
				await updateTagValueApplyToColumn(connectionPool, database, schema, table, column, tagValue);
			});
		});
		return;
	} catch (error) {
		console.error(error);
		throw (error);
	}
};
exports.applyAlationTags = applyAlationTags;

