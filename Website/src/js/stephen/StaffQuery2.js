console.log("StaffQuery loaded");

const runTrainerQuery = async () => {

    const sql = `SELECT tblSessionStaff.staffID, SUM(tblSession.durationMinutes) AS TotalMinutes
    FROM tblSessionStaff
    LEFT JOIN tblSession ON tblSessionStaff.sessionID = tblSession.sessionID
    GROUP BY tblSessionStaff.staffID
    ORDER BY tblSessionStaff.staffID;`;
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

        const headings = ["Staff ID", "TotalMinutes"];

        for (let heading of headings) {
            const th = document.createElement("th");
            th.textContent = heading;
            headerRow.appendChild(th);
        }

        for (let row of rows) {
            const tr = document.createElement("tr");

            const tdstaffID = document.createElement("td");
            tdstaffID.textContent = row.staffID;
            tr.appendChild(tdstaffID);

            const tdTotalMinutes = document.createElement("td");
            tdTotalMinutes.textContent = row.TotalMinutes;
            tr.appendChild(tdTotalMinutes);

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