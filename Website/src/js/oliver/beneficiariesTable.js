

const BeneficiaryTable = (() => {
  let currentChart = null;

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

  function destroyChart() {
    if (currentChart) {
      currentChart.destroy();
      currentChart = null;
    }
  }

  function renderChart(config) {
    const canvas = document.getElementById("reportChart");
    if (!canvas) return;

    destroyChart();

    const ctx = canvas.getContext("2d");
    currentChart = new Chart(ctx, config);
  }

  function renderRegionalCoverageChart(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
      destroyChart();
      return;
    }

    const labels = rows.map(row => row.regionName);
    const values = rows.map(row => Number(row.totalBeneficiaries) || 0);

    renderChart({
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Total Beneficiaries",
            data: values
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  function renderDemographicBreakdownChart(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
      destroyChart();
      return;
    }

    const labels = rows.map(row =>
      `${row.gender} / ${row.ageGroup}`
    );
    const values = rows.map(row => Number(row.totalBeneficiaries) || 0);

    renderChart({
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Total Beneficiaries",
            data: values
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          x: {
            ticks: {
              autoSkip: false,
              maxRotation: 90,
              minRotation: 45
            }
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  function renderDropoutAnalysisChart(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
      destroyChart();
      return;
    }

    const labels = rows.map(row =>
      `${row.regionName} / ${row.dropReason}`
    );
    const values = rows.map(row => Number(row.totalDropped) || 0);

    renderChart({
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Total Dropped",
            data: values
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          x: {
            ticks: {
              autoSkip: false,
              maxRotation: 90,
              minRotation: 45
            }
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  return {
    render,
    destroyChart,
    renderRegionalCoverageChart,
    renderDemographicBreakdownChart,
    renderDropoutAnalysisChart
  };
})();
