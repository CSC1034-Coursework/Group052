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
                tableColumns.text('budgetDisplay', 'Total Budget'),
                tableColumns.text('fundedDisplay', 'Confirmed Funding'),
                tableColumns.html('gapDisplay', 'Shortfall'),
                tableColumns.text('costDisplay', 'Cost per Participant'),
                tableColumns.html('statusDisplay', 'Risk Status'),
            ],
            rows.map((row) => ({
                ...row,
                budgetDisplay: window.fmt.currency(row.budget),
                fundedDisplay: window.fmt.currency(row.total_funded),
                gapDisplay: Number(row.funding_gap || 0) > 0
                    ? '<span style="color:#dc2626;font-weight:600;">' + window.fmt.currency(row.funding_gap) + '</span>'
                    : '<span style="color:#16a34a;font-weight:600;">' + window.fmt.currency(row.funding_gap) + '</span>',
                costDisplay: row.cost_per_enrolment === null ? '-' : window.fmt.currency(row.cost_per_enrolment),
                statusDisplay: row.funding_status === 'AT RISK'
                    ? '<span style="background:#dc2626;color:#ffffff;padding:3px 8px;border-radius:999px;display:inline-block;font-weight:600;">AT RISK</span>'
                    : '<span style="background:#16a34a;color:#ffffff;padding:3px 8px;border-radius:999px;display:inline-block;font-weight:600;">Funded</span>',
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

        const topRows = rows
            .filter((row) => Number(row.total_funded || 0) <= Number(row.budget || 0))
            .sort((a, b) => Number(b.funding_gap || 0) - Number(a.funding_gap || 0))
            .slice(0, 10);

        const labels = topRows.map((row) => {
            const name = row.programmeName;
            return name.length > 25 ? name.substring(0, 25) + '...' : name;
        });

        const budgetData = topRows.map((row) => Number(row.budget || 0));
        const fundedData = topRows.map((row) => Number(row.total_funded || 0));

        state.charts.fundingRisk = new Chart(chartElement, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Total Budget (£)',
                        data: budgetData,
                        backgroundColor: '#6366f1',
                    },
                    {
                        label: 'Confirmed Funding (£)',
                        data: fundedData,
                        backgroundColor: '#22c55e',
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    title: {
                        display: true,
                        text: 'Top 10 Programmes by Funding Shortfall',
                    },
                },
                scales: {
                    x: {
                        ticks: { maxRotation: 45 },
                    },
                    y: {
                        ticks: {
                            callback: (value) => '£' + Number(value).toLocaleString(),
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
