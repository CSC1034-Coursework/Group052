//Create chart for report 2
const printChartReport2 = async () => {
    const output = document.querySelector("#outputReport2");
    // Only the name and mark fields are needed for this chart.
    const sql = `SELECT 
    p.focusArea,
    COUNT(DISTINCT pc.courseID) AS totalCourses,
    ROUND(AVG(c.durationHours), 1) AS avgCourseDuration
    FROM tblProgramme p
    INNER JOIN tblProgrammeCourse pc 
    ON p.programmeID = pc.programmeID
    INNER JOIN tblCourse c 
    ON pc.courseID = c.courseID
    GROUP BY p.focusArea
    HAVING COUNT(pc.courseID) > 0
    ORDER BY totalCourses DESC;`;

    //execute query
    const result = await runQuery(sql);

    if (!result || !result.data || result.data.length === 0) {
        output.textContent = "No Rows Returned";
        return;
    }

    const rows = result.data;
    const labels = [];
    const totalCourses = [];
    const avgDuration = [];

    for (let row of rows) {
        labels.push(row.focusArea);
        totalCourses.push(Number(row.totalCourses));
        avgDuration.push(Number(row.avgCourseDuration))
    }
    

    const chartCanvas = document.querySelector("#reportChart2");

    //destroys old chart before creating a new one
    if (window.reportChartInstance) {
        window.reportChartInstance.destroy();
    }

    window.reportChartInstance = new Chart(chartCanvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Total Courses",
                data: totalCourses,
                backgroundColor: "#cc0000",
                borderColor: "#7a0000",
                borderWidth: 1
            },
                {
                    label: "Avg Duration (hrs)",
                    data: avgDuration,
                    type: "line"
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });

};
