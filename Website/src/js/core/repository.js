// core/repository.js — Database communication layer. All SQL goes through here.

const DB_URL = "https://rkriuchkov01.webhosting1.eeecs.qub.ac.uk/CSC1034 - Data Driven Systems/coursework/dbConnector.php";

/**
 * Send parameterized SQL to the database backend and return results.
 * @example postSql('INSERT INTO tblStaff (name) VALUES (?)', ['John'])
 */
async function postSql(sql, params = []) {
	const query = params.length > 0
		? sql.replace(/\?/g, () => {
			const value = params.shift();
			return value === null ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`;
		})
		: sql;

	const response = await fetch(DB_URL, {
		method: 'POST',
		body: new URLSearchParams({ query })
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

/**
 * Execute any SQL query (INSERT, UPDATE, DELETE, SELECT) with automatic parameter substitution.
 * @example runQuery('DELETE FROM tblStaff WHERE staffID = ?', [3])
 */
async function runQuery(sql, params = []) {
	return postSql(sql, params);
}

/**
 * Execute a SELECT query and return rows as an array.
 * @example selectRows('SELECT staffID, name FROM tblStaff WHERE active = ?', [1])
 */
async function selectRows(sql, params = []) {
	const result = await postSql(sql, params);

	if (Array.isArray(result)) return result;
	if (result?.data) return result.data;

	return [];
}

/**
 * Alias for selectRows; executes SELECT query and returns array of rows.
 * @example query('SELECT * FROM tblRegion')
 */
async function query(sql, params = []) {
	return selectRows(sql, params);
}

window.postSql = postSql;
window.runQuery = runQuery;
window.selectRows = selectRows;
window.query = query;
