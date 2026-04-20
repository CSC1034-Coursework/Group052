/**
 * Completion & Attendance Report - Table and chart for completion analysis
 */
window.reports.completionReport = {
    async load(focusArea) {
        const dom = window.enrolmentsDom;
        const tableColumns = window.tableColumns;

        const rows = await selectRows(
            `SELECT *
            FROM vw_completion_attendance
            WHERE (focusArea = ? OR ? = 'All')
            ORDER BY completion_rate_pct ASC
            LIMIT 15`,
            [focusArea, focusArea]
        );

        window.renderTable(
            'completion-attendance-report-table',
            [
                tableColumns.text('programmeName', 'Programme'),
                tableColumns.text('focusArea', 'Focus Area'),
                tableColumns.text('regionName', 'Region'),
                tableColumns.text('total_enrolled', 'Enrolled'),
                tableColumns.text('completed', 'Completed'),
                tableColumns.text('dropped', 'Dropped'),
                tableColumns.text('completion_rate_pct', 'Completion %'),
                tableColumns.text('attendance_rate_pct', 'Attendance %'),
            ],
            rows,
            []
        );

        this.renderChart(rows, dom.completionChart);
    },

    renderChart(rows, chartElement) {
        const state = window.enrolmentsAppState;

        if (typeof Chart === 'undefined' || !chartElement) {
            return;
        }

        if (state.charts.completion) {
            state.charts.completion.destroy();
        }

        const regionMap = new Map();

        rows.forEach((row) => {
            const key = row.regionName;
            if (!regionMap.has(key)) {
                regionMap.set(key, { completed: 0, dropped: 0, enrolled: 0 });
            }

            const agg = regionMap.get(key);
            const completed = Number(row.completed || 0);
            const dropped = Number(row.dropped || 0);
            const total = Number(row.total_enrolled || 0);
            const stillEnrolled = Math.max(total - completed - dropped, 0);

            agg.completed += completed;
            agg.dropped += dropped;
            agg.enrolled += stillEnrolled;
        });

        const labels = Array.from(regionMap.keys());
        const completedData = labels.map((label) => regionMap.get(label).completed);
        const droppedData = labels.map((label) => regionMap.get(label).dropped);
        const enrolledData = labels.map((label) => regionMap.get(label).enrolled);

        state.charts.completion = new Chart(chartElement, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    { label: 'Completed', data: completedData, backgroundColor: '#0f6b2a' },
                    { label: 'Dropped', data: droppedData, backgroundColor: '#d94d4d' },
                    { label: 'Still Enrolled', data: enrolledData, backgroundColor: '#6d6d6d' },
                ],
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                scales: {
                    x: { stacked: true, beginAtZero: true },
                    y: { stacked: true },
                },
            },
        });
    },
};
