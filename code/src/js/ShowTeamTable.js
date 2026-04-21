const printTeamTable = async () => {
  const output = document.querySelector("#tableTeamOutput");
  const sql = "SELECT * FROM tblTeam;";
  const result = await runQuery(sql);

  if (output.innerHTML !== "") {
        output.innerHTML = ""; 
        return;
    }

    output.innerHTML = "";

  if (!result || !result.data || result.data.length === 0) {
    output.textContent = "No Rows Returned";
    return;
  }

  const rows = result.data;
  const table = document.createElement("table");
  const headerRow = document.createElement("tr");
  table.appendChild(headerRow);

  const headings = ["Team ID", "Team Name", "Specialisation ID", "Created At", "Updated At"];

  for (let heading of headings) {
    const th = document.createElement("th");
    th.textContent = heading;
    headerRow.appendChild(th);
  }

  for (let row of rows) {
    const tr = document.createElement("tr");

    const tdTeam = document.createElement("td");
    tdTeam.textContent = row.teamID;
    tr.appendChild(tdTeam);

    const tdTeamName = document.createElement("td");
    tdTeamName.textContent = row.teamName;
    tr.appendChild(tdTeamName);

    const tdSpecialisation = document.createElement("td");
    tdSpecialisation.textContent = row.specialisationID;
    tr.appendChild(tdSpecialisation);

    const tdCreated = document.createElement("td");
    tdCreated.textContent = row.createdAt;
    tr.appendChild(tdCreated);

    const tdUpdated = document.createElement("td");
    tdUpdated.textContent = row.updatedAt;
    tr.appendChild(tdUpdated);

    table.appendChild(tr);
  }

  output.appendChild(table);
};

document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("runAllTeamButton")
        .addEventListener("click", printTeamTable);
});