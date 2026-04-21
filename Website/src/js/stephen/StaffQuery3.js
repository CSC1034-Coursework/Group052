console.log("StaffQuery loaded");

const runUncertifiedStaffQuery = async () => {

    const sql = `SELECT staffID, certifiedDate 
    FROM tblStaff
    WHERE certifiedDate IS NULL;`;
    const output = document.getElementById("outputUncertifiedStaff");
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
            output.textContent = "No Uncertfied Staff!";
            return;
        }

        const rows = result.data;
        const table = document.createElement("table");
        const headerRow = document.createElement("tr");
        table.appendChild(headerRow);

        const headings = ["Staff ID", "Certified Date"];

        for (let heading of headings) {
            const th = document.createElement("th");
            th.textContent = heading;
            headerRow.appendChild(th);
        }

        for (let row of rows) {
            const tr = document.createElement("tr");

            const tdStaffId = document.createElement("td");
            tdStaffId.textContent = row.staffID;
            tr.appendChild(tdStaffId);

            const tdcertifiedDate = document.createElement("td");
            tdcertifiedDate.textContent = row.certifiedDate;
            tr.appendChild(tdcertifiedDate);

            table.appendChild(tr);
        }

        output.appendChild(table);

    } catch (error) {
        output.textContent = error.message;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("runUncertifiedStaffButton")
        .addEventListener("click", runUncertifiedStaffQuery);
});