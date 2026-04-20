/**
 * Funding Risk Report - Table and chart for funding risk analysis
 */
window.reports.fundingRiskReport = {
    async load() {
        const dom = window.enrolmentsDom;
        const tableColumns = window.tableColumns;

        const rows = await selectRows('SELECT * FROM vw_funding_risk ORDER BY funding_gap DESC, programmeName');

        window.renderTable(
            'funding-risk-report-table',
            [
                tableColumns.text('programmeName', 'Programme'),
                tableColumns.text('focusArea', 'Focus Area'),
                tableColumns.text('regionName', 'Region'),
                tableColumns.text('budgetDisplay', 'Budget'),
                tableColumns.text('fundedDisplay', 'Funded'),
                tableColumns.text('gapDisplay', 'Gap'),
                tableColumns.text('costDisplay', 'Cost/Enrolment'),
                tableColumns.html('statusDisplay', 'Status'),
            ],
            rows.map((row) => ({
                ...row,
                budgetDisplay: window.fmt.currency(row.budget),
                fundedDisplay: window.fmt.currency(row.total_funded),
                gapDisplay: window.fmt.currency(row.funding_gap),
                costDisplay: row.cost_per_enrolment === null ? '-' : window.fmt.currency(row.cost_per_enrolment),
                statusDisplay: row.funding_status === 'AT RISK'
                    ? '<span style="background:#d94d4d;color:#ffffff;padding:3px 8px;border-radius:5px;display:inline-block;">AT RISK</span>'
                    : '<span class="badge badge--sdg">Funded</span>',
            })),
            []
        );

        this.renderChart(rows, dom.fundingRiskChart);
    },

    renderChart(rows, chartElement) {
        const state = window.enrolmentsAppState;

        if (typeof Chart === 'undefined' || !chartElement) {
            return;
        }

        if (state.charts.fundingRisk) {
            state.charts.fundingRisk.destroy();
        }

        const labels = rows.map((row) => {
            const name = row.programmeName;
            return name.length > 20 ? name.substring(0, 20) + '...' : name;
        });

        const budgetData = rows.map((row) => Number(row.budget || 0));
        const fundedData = rows.map((row) => Number(row.total_funded || 0));

        state.charts.fundingRisk = new Chart(chartElement, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Budget (£)',
                        data: budgetData,
                        backgroundColor: '#6366f1',
                    },
                    {
                        label: 'Total Funded (£)',
                        data: fundedData,
                        backgroundColor: '#22c55e',
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                },
                scales: {
                    x: {
                        ticks: { maxRotation: 45 },
                    },
                    y: {
                        ticks: {
                            callback: (value) => '£' + value.toLocaleString(),
                        },
                        title: {
                            display: true,
                            text: 'Amount (£)',
                        },
                    },
                },
            },
        });
    },
};
