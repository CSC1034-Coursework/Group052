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
                    ? '<span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:600;white-space:nowrap;">AT RISK</span>'
                    : '<span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:600;white-space:nowrap;">Funded</span>',
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
            return name.length > 30 ? name.substring(0, 30) + '...' : name;
        });

        // Set dynamic height for horizontal bar chart
        chartElement.style.height = (topRows.length * 50 + 80) + 'px';

        const budgetData = topRows.map((row) => Number(row.budget || 0));
        const fundedData = topRows.map((row) => Number(row.total_funded || 0));

        state.charts.fundingRisk = new Chart(chartElement, {
            type: 'bar',
            indexAxis: 'y',
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
                        ticks: {
                            callback: (value) => '£' + (value / 1000).toFixed(0) + 'k',
                        },
                        title: {
                            display: true,
                            text: 'Amount (£)',
                        },
                    },
                    y: {
                        ticks: { maxRotation: 0 },
                    },
                },
            },
        });
    },
};
