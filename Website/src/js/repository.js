const DB_URL = "https://rkriuchkov01.webhosting1.eeecs.qub.ac.uk/CSC1034 - Data Driven Systems/coursework/dbConnector.php";

async function query(sql) {
	const response = await fetch(DB_URL, {
		method: 'POST',
		body: new URLSearchParams({ query: sql })
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	const result = await response.json();

	if (result?.error) {
		throw new Error(result.error);
	}

	if (Array.isArray(result)) return result;
	if (Array.isArray(result?.data)) return result.data;
	if (result && typeof result === 'object') return [result];

	return [];
}

async function runQuery(sql, params = []) {
	return postSql(sql, params);
}

async function selectRows(sql, params = []) {
	const result = await runQuery(sql, params);

	if (Array.isArray(result)) return result;
	if (result?.data) return result.data;

	return [];
}