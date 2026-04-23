console.log("StaffQuery loaded");

const runTrainerQuery = async () => {

    const sql = `SELECT CONCAT(st.firstName, ' ', st.lastName) AS FullName, ss.staffId, COUNT(s.sessionID) AS NumberOfSessions, SUM(s.durationMinutes) AS TotalMinutes, AVG(s.durationMinutes) AS AverageSessionLength
    FROM tblSessionStaff ss
    LEFT JOIN tblSession s ON ss.sessionID = s.sessionID
    INNER JOIN tblStaff st ON ss.staffID = st.StaffID
    GROUP BY ss.staffID, st.firstName, st.lastName
    HAVING SUM(s.durationMinutes) IS NOT NULL
    ORDER BY TotalMinutes DESC`;
    const output = document.getElementById("outputTrainer");
    const url = "https://sbrown635.webhosting1.eeecs.qub.ac.uk/dbConnector.php";

    if (output.innerHTML !== "") {
        /*If something loaded, clear, makes Toggle*/
        output.innerHTML = "";
        return;
    }

    output.innerHTML = "";

    try {
        const response = await fetch(url, {
            method: "POST",
            body: new URLSearchParams({
                query: sql
            })
        });

        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }

        const result = await response.json();

        if (!result || !result.data || result.data.length === 0) {
            output.textContent = "No Rows Returned";
            return;
        }

        const rows = result.data;
        const table = document.createElement("table");
        const headerRow = document.createElement("tr");
        table.appendChild(headerRow);

        const headings = ["Staff Name", "NumberOfSessions", "TotalMinutes", "AverageSessionLength"];

        for (let heading of headings) {
            const th = document.createElement("th");
            th.textContent = heading;
            headerRow.appendChild(th);
        }

        for (let row of rows) {
            const tr = document.createElement("tr");

            const tdFullName = document.createElement("td");
            tdFullName.textContent = row.FullName;
            tr.appendChild(tdFullName);

            const tdNumberOfSessions = document.createElement("td");
            tdNumberOfSessions.textContent = row.NumberOfSessions;
            tr.appendChild(tdNumberOfSessions);

            const tdTotalMinutes = document.createElement("td");
            tdTotalMinutes.textContent = row.TotalMinutes;
            tr.appendChild(tdTotalMinutes);

            const tdAverageSessionLength = document.createElement("td");
            tdAverageSessionLength.textContent = row.AverageSessionLength;
            tr.appendChild(tdAverageSessionLength);

            table.appendChild(tr);
        }

        output.appendChild(table);

    } catch (error) {
        output.textContent = error.message;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("runTrainerButton")
        .addEventListener("click", runTrainerQuery);
});
