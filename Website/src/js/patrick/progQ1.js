// Allows report to be toggled on/off
let reportVisible1 = false;


//updates report whenever dropdown value is selected to filter by chosen dropdown choice
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

    //sets focusValue to null if no focus area is selected, 
    const focusValue = focus || null;

    //executes query
    const result = await runQuery(sql);


    //if no data found returns 'no rows returned' to user
    if (!result || !result.data || result.data.length === 0) {
        outputReport1.textContent = "No Rows Returned";
        return;
    }


    //extracts rows returned from database
    const rows = result.data;

    //creates table element
    const table = document.createElement("table");
    //table heading row
    const headerRow = document.createElement("tr");
    table.appendChild(headerRow);

    // These headings become the top row of the table.
    const headings = ["Programme ID", "Programme Name", "Focus Area", "No. of Courses", "Avg Duration(hours)"];

    //loops through headings
    for (let heading of headings) {
        const th = document.createElement("th"); //creates header
        th.textContent = heading;   //puts text in header
        headerRow.appendChild(th);
    }

    //loops through rows of data from database
    for (let row of rows) {
        const tr = document.createElement("tr"); //creates a table row

        //creates cell for programme id and fills it
        const tdID = document.createElement("td");
        tdID.textContent = row.programmeID;
        tr.appendChild(tdID);

        //creates cell for programme name and fills it
        const tdProgrammeName = document.createElement("td");
        tdProgrammeName.textContent = row.programmeName;
        tr.appendChild(tdProgrammeName);

        //creates cell for focus area and fills it
        const tdFocus = document.createElement("td");
        tdFocus.textContent = row.focusArea;
        tr.appendChild(tdFocus);

        //creates cell for course number and fills it
        const tdCourses = document.createElement("td");
        tdCourses.textContent = row.number_of_courses;
        tr.appendChild(tdCourses);

        //creates cell for average course duration in hours and fills it
        const tdAvg = document.createElement("td");
        tdAvg.textContent = row.avg_course_duration;
        tr.appendChild(tdAvg);

        //adds the finished row to table
        table.appendChild(tr);
    }

    //generates table on the page
    outputReport1.appendChild(table);
};


document.addEventListener("DOMContentLoaded", () => {
    //adds click event to "run report"" button
    document.querySelector("#runReport1").addEventListener("click", async (event) => {
        event.preventDefault();

        const outputReport1 = document.querySelector("#outputReport1");

        if (reportVisible1) {
            //hides report if it was visible
            outputReport1.innerHTML = "";
            reportVisible1 = false;
        } else {
            //generates report if was hidden
            await printReport1();
            reportVisible1 = true;
        }


    });
});
