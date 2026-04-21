/**
 * Score Improvement Report - Table and chart for score analysis
 */
window.reports = window.reports || {};

window.reports.scoreReport = {
    async load(focusArea) {
        const dom = window.enrolmentsDom;
        const tableColumns = window.tableColumns;

        const rows = await selectRows(
            `SELECT *
            FROM vw_score_improvement
            WHERE avg_improvement IS NOT NULL
              AND (focusArea = ? OR ? = 'All')
              AND avg_improvement > 0
            ORDER BY avg_improvement DESC
            LIMIT 20`,
            [focusArea, focusArea]
        );

        console.log('[scoreReport] API response:', { focusArea, rowCount: rows.length, rows });

        window.renderTable(
            'score-report-table',
            [
                tableColumns.text('focusArea', 'Focus Area'),
                tableColumns.text('courseName', 'Course'),
                tableColumns.text('genderName', 'Gender'),
                tableColumns.text('total_enrolled', 'Enrolled'),
                tableColumns.text('avg_pre', 'Avg Pre'),
                tableColumns.text('avg_post', 'Avg Post'),
                tableColumns.html('avgImprovementDisplay', 'Avg Improvement'),
            ],
            rows.map((row) => ({
                ...row,
                avgImprovementDisplay: `<strong>${Number(row.avg_improvement).toFixed(1)}</strong>`,
            })),
            []
        );

        this.renderChart(rows, dom.scoreChart);
    },

    renderChart(rows, chartElement) {
        const state = window.enrolmentsAppState;

        if (typeof Chart === 'undefined' || !chartElement) {
            return;
        }

        if (state.charts.score) {
            state.charts.score.destroy();
        }

        const labels = Array.from(new Set(rows.map((row) => `${row.programmeName} - ${row.courseName}`)));
        const genders = Array.from(new Set(rows.map((row) => row.genderName)));

        const datasets = genders.map((gender, index) => {
            const data = labels.map((label) => {
                const row = rows.find((item) => `${item.programmeName} - ${item.courseName}` === label && item.genderName === gender);
                return row ? Number(row.avg_improvement) : 0;
            });

            const palette = ['#2459b8', '#0f6b2a', '#b08006', '#d94d4d', '#5f5f5f'];
            return {
                label: gender,
                data,
                backgroundColor: palette[index % palette.length],
            };
        });

        state.charts.score = new Chart(chartElement, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                indexAxis: 'y',
                responsive: true,
                scales: {
                    x: { beginAtZero: true, title: { display: true, text: 'Avg Improvement' } },
                },
            },
        });
    },
};
