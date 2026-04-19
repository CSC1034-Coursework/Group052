const DB_URL = "https://rkriuchkov01.webhosting1.eeecs.qub.ac.uk/CSC1034 - Data Driven Systems/coursework/dbConnector.php";

async function postSql(sql, params = []) {
	const query = params.length > 0
		? sql.replace(/\?/g, () => {
				const value = params.shift();
				return value === null ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`;
			})
		: sql;

	const response = await fetch(DB_URL, {
		method: 'POST',
		body: new URLSearchParams({ query }),
	});

	if (!response.ok) {
		throw new Error(`HTTP Error: ${response.status}`);
	}

	let result;
	try {
		result = await response.json();
	} catch (error) {
		throw new Error('The database connector returned an invalid response.');
	}

	if (result && result.error) {
		throw new Error(result.error);
	}

	return result;
}

async function runQuery(sql, params = []) {
	return postSql(sql, params);
}

async function selectRows(sql, params = []) {
	const result = await runQuery(sql, params);

	if (Array.isArray(result)) {
		return result;
	}

	if (result && Array.isArray(result.data)) {
		return result.data;
	}

	return [];
}
