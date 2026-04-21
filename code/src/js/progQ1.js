// Allows report to be toggles
let reportVisible1 = false;


//updates report whenever dropdown value is selected
document.querySelector("#focusFilter1").addEventListener("change", async () => {
    if (reportVisible1) {
        await printReport1();
    }
});

// Read all programmes from the database and draw them as an HTML table.
const printReport1 = async () => {
    const outputReport1 = document.querySelector("#outputReport1");
    outputReport1.innerHTML = "";

    //creates focus
    const focus = document.querySelector("#focusFilter1").value;

    // This SQL query will identify which programmes have the most time intensive training on average.
    //Also allows user to filter by focus area dynamically
    const sql = `SELECT
    p.programmeID,
    p.programmeName,
    p.focusArea,
    COUNT(pc.courseID) AS number_of_courses,
    ROUND(AVG(c.durationHours), 1) AS avg_course_duration
FROM tblProgramme p
INNER JOIN tblProgrammeCourse pc 
    ON p.programmeID = pc.programmeID
INNER JOIN tblCourse c 
    ON pc.courseID = c.courseID
${focus ? `WHERE p.focusArea = '${focus}'` : ""}
GROUP BY p.programmeID, p.programmeName, p.focusArea
HAVING COUNT(pc.courseID) > 0
ORDER BY avg_course_duration DESC
LIMIT 10;`;




    const result = await runQuery(sql);

    if (!result || !result.data || result.data.length === 0) {
        outputReport1.textContent = "No Rows Returned";
        return;
    }

    const rows = result.data;
    const table = document.createElement("table");
    const headerRow = document.createElement("tr");
    table.appendChild(headerRow);

    // These headings become the top row of the table.
    const headings = ["Programme ID", "Programme Name", "Focus Area", "No. of Courses", "Avg Duration(hours)"];

    for (let heading of headings) {
        const th = document.createElement("th");
        th.textContent = heading;
        headerRow.appendChild(th);
    }

    for (let row of rows) {
        const tr = document.createElement("tr");

        const tdID = document.createElement("td");
        tdID.textContent = row.programmeID;
        tr.appendChild(tdID);

        const tdProgrammeName = document.createElement("td");
        tdProgrammeName.textContent = row.programmeName;
        tr.appendChild(tdProgrammeName);

        const tdFocus = document.createElement("td");
        tdFocus.textContent = row.focusArea;
        tr.appendChild(tdFocus);

        const tdCourses = document.createElement("td");
        tdCourses.textContent = row.number_of_courses;
        tr.appendChild(tdCourses);

        const tdAvg = document.createElement("td");
        tdAvg.textContent = row.avg_course_duration;
        tr.appendChild(tdAvg);

        table.appendChild(tr);
    }

    //generates table
    outputReport1.appendChild(table);
    };
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#runReport1").addEventListener("click", async (event) => {
        event.preventDefault();

        const outputReport1 = document.querySelector("#outputReport1");

        if (reportVisible1) {
            //hidden
            outputReport1.innerHTML = "";
            reportVisible1 = false;
        } else {
            //visible
            await printReport1();
            reportVisible1 = true;
        }


    });
});
