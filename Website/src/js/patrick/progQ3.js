// Allows report to be toggles
let reportVisible3 = false;


// Read all programmes from the database and draw them as an HTML table.
const printReport3 = async () => {
    const outputReport3 = document.querySelector("#outputReport3");
    outputReport3.innerHTML = "";


    // This report will analyse how funding and programmes are distributed across regions
    const sql = `SELECT 
    r.regionName,
    COUNT(DISTINCT p.programmeID) AS total_programmes,
    COALESCE(ROUND(SUM(pf.amount), 2), 0) AS total_funding,
    ROUND(
    COALESCE(SUM(pf.amount), 0) / COUNT(DISTINCT p.programmeID),
    2
    ) AS avg_funding_per_programme
    FROM tblRegion r
    LEFT JOIN tblProgramme p 
    ON r.regionID = p.regionID
    LEFT JOIN tblProgrammeFunding pf 
    ON p.programmeID = pf.programmeID
    GROUP BY r.regionID, r.regionName
    HAVING COUNT(DISTINCT p.programmeID) > 0
    ORDER BY total_funding DESC;`;




    const result = await runQuery(sql);


    if (!result || !result.data || result.data.length === 0) {
        outputReport3.textContent = "No Rows Returned";
        return;
    }

    const rows = result.data;
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    thead.appendChild(headerRow); //puts row inside thead
    table.appendChild(thead); //attaches thead to the table

    // These headings become the top row of the table.
    const headings = ["Region", "Total Programmes", "Total Funding", "Average Funding per Programme"];

    for (let heading of headings) {
        const th = document.createElement("th");
        th.textContent = heading;
        headerRow.appendChild(th);
    }

    for (let row of rows) {
        const tr = document.createElement("tr");

        const tdRegion = document.createElement("td");
        tdRegion.textContent = row.regionName;
        tr.appendChild(tdRegion);

        const tdProgrammes = document.createElement("td");
        tdProgrammes.textContent = row.total_programmes;
        tr.appendChild(tdProgrammes);

        const tdFunding = document.createElement("td");
        tdFunding.textContent = row.total_funding;
        tr.appendChild(tdFunding);

        const tdAvgFunding = document.createElement("td");
        tdAvgFunding.textContent = row.avg_funding_per_programme;
        tr.appendChild(tdAvgFunding);

        table.appendChild(tr);
    }

    
    //creates wrapper for tables
    const wrapper = document.createElement("div");
    wrapper.className = "table-wrapper";
    const scroll = document.createElement("div");
    scroll.className = "table-scroll";

    //sticky heading
    table.classList.add("table");

    scroll.appendChild(table);
    wrapper.appendChild(scroll);

    //generates tabular report
    outputReport3.appendChild(wrapper);
};
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#runReport3").addEventListener("click", async (event) => {
        event.preventDefault();

        const outputReport3 = document.querySelector("#outputReport3");

        if (reportVisible3) {
            //hidden
            outputReport3.innerHTML = "";
            reportVisible3 = false;
        } else {
            //visible
            await printReport3();
            reportVisible3 = true;
        }


    });
});
