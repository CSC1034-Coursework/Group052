// beneficiaries.table.js

const BeneficiaryTable = (() => {
  function render(tableId, rows) {
    const table = document.getElementById(tableId);
    if (!table) return;

    table.innerHTML = "";

    if (rows && rows.success && Array.isArray(rows.data)) {
      rows = rows.data;
    }

    if (!Array.isArray(rows)) {
      console.error("Expected array but got:", rows);
      table.innerHTML = `
        <tbody>
          <tr>
            <td colspan="100%">Invalid data returned</td>
          </tr>
        </tbody>
      `;
      return;
    }

    if (rows.length === 0) {
      table.innerHTML = `
        <tbody>
          <tr>
            <td colspan="100%">No data found</td>
          </tr>
        </tbody>
      `;
      return;
    }

    let headerRow = "<tr>";
    for (const key in rows[0]) {
      headerRow += `<th>${key}</th>`;
    }
    headerRow += "</tr>";

    let bodyRows = "";
    rows.forEach(row => {
      bodyRows += "<tr>";
      for (const key in row) {
        bodyRows += `<td>${row[key] ?? ""}</td>`;
      }
      bodyRows += "</tr>";
    });

    table.innerHTML = `
      <thead>${headerRow}</thead>
      <tbody>${bodyRows}</tbody>
    `;
  }

  return { render };
})();
