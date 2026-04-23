console.log("StaffQuery loaded");
console.log("test loaded");

const loadRegions = async () => {
        const sql = `SELECT regionID, regionName 
        FROM tblRegion 
        ORDER BY regionName;`;
        const select = document.getElementById("regionFilter");

        try {
          const result = await runQuery(sql);

          if (!result || !result.data) return;

          result.data.forEach(region => {
            const option = document.createElement("option");
            option.value = region.regionID; 
            option.textContent = region.regionName;
            select.appendChild(option);
          });

        } catch (error) {
          console.error(error);
        }
      };

const runStaffRegionQuery = async () => {
    const region = document.getElementById("regionFilter").value;
    const sql = `SELECT r.regionName, COUNT(s.staffID) AS NumberOfStaff
    FROM tblRegion r
    LEFT JOIN tblStaff s ON s.regionID = r.regionID
    ${region ? `WHERE r.regionID = ${region}` : ""}
    GROUP BY r.regionName
    ORDER BY r.regionName ASC;`;
    // If region is there, display that region row, else display nothing
    const output = document.getElementById("outputStaff");
    const url = "https://sbrown635.webhosting1.eeecs.qub.ac.uk/dbConnector.php";

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
        console.log(region);

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

document.addEventListener("DOMContentLoaded", async () => {
    await loadRegions();
    document.getElementById("regionFilter").addEventListener("change", runStaffRegionQuery);
    runStaffRegionQuery();
});
