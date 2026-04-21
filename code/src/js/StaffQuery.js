console.log("StaffQuery loaded");

const runStaffRegionQuery = async () => {

    const sql = `SELECT r.regionName, COUNT(s.staffID) AS NumberOfStaff
    FROM tblStaff s
    JOIN tblRegion r ON s.regionID = r.regionID
    GROUP BY r.regionName;`;
    const output = document.getElementById("outputStaff");
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

        const headings = ["Region Name", "Number of Staff"];

        for (let heading of headings) {
            const th = document.createElement("th");
            th.textContent = heading;
            headerRow.appendChild(th);
        }

        for (let row of rows) {
            const tr = document.createElement("tr");

            const tdregionName = document.createElement("td");
            tdregionName.textContent = row.regionName;
            tr.appendChild(tdregionName);

            const tdNumberOfStaff = document.createElement("td");
            tdNumberOfStaff.textContent = row.NumberOfStaff;
            tr.appendChild(tdNumberOfStaff);

            table.appendChild(tr);
        }

        output.appendChild(table);

    } catch (error) {
        output.textContent = error.message;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("runStaffButton")
        .addEventListener("click", runStaffRegionQuery);
});