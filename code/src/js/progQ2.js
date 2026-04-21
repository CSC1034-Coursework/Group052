// Allows report to be toggles
let reportVisible2 = false;


// Read all programmes from the database and draw them as an HTML table.
const printReport2 = async () => {
    const outputReport2 = document.querySelector("#outputReport2");
    outputReport2.innerHTML = "";


    // This report shows which SDG 5 focus areas are best supported based on the amount of available courses and their average duration.
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




    const result = await runQuery(sql);
    

    if (!result || !result.data || result.data.length === 0) {
        outputReport2.textContent = "No Rows Returned";
        return;
    }

    const rows = result.data;
    const table = document.createElement("table");
    const headerRow = document.createElement("tr");
    table.appendChild(headerRow);

    // These headings become the top row of the table.
    const headings = ["Focus Area", "Total Courses", "Average Duration (hours)"];

    for (let heading of headings) {
        const th = document.createElement("th");
        th.textContent = heading;
        headerRow.appendChild(th);
    }

    for (let row of rows) {
        const tr = document.createElement("tr");

        const tdFocus = document.createElement("td");
        tdFocus.textContent = row.focusArea;
        tr.appendChild(tdFocus);

        const tdCourses = document.createElement("td");
        tdCourses.textContent = row.totalCourses;
        tr.appendChild(tdCourses);

        const tdAvg = document.createElement("td");
        tdAvg.textContent = row.avgCourseDuration;
        tr.appendChild(tdAvg);

        table.appendChild(tr);
    }

    //generates table
    outputReport2.appendChild(table);
};
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#runReport2").addEventListener("click", async (event) => {
        event.preventDefault();

        const outputReport2 = document.querySelector("#outputReport2");

        if (reportVisible2) {
            //hidden
            outputReport2.innerHTML = "";

            if (window.reportChartInstance) {
                window.reportChartInstance.destroy();
                window.reportChartInstance = null;
            }

            reportVisible2 = false;
        } else {
            //visible
            await printReport2();
            await printChartReport2();
            reportVisible2 = true;
        }


    });
});
