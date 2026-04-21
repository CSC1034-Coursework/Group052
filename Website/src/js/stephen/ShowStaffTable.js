const printStaffTable = async () => {
  const output = document.querySelector("#tableStaffOutput");
  const sql = "SELECT * FROM tblStaff;";
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

  const headings = ["Staff ID", "First Name", "Last Name", "Email", "Phone", "Gender", "Role", "Certified Date", "Active", "Team ID", "Region ID", "Created At", "Updated At"];

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

    const tdFirstName = document.createElement("td");
    tdFirstName.textContent = row.firstName;
    tr.appendChild(tdFirstName);

    const tdLastName = document.createElement("td");
    tdLastName.textContent = row.lastName;
    tr.appendChild(tdLastName);

    const tdEmail = document.createElement("td");
    tdEmail.textContent = row.email;
    tr.appendChild(tdEmail);

    const tdPhone = document.createElement("td");
    tdPhone.textContent = row.phone;
    tr.appendChild(tdPhone);

    const tdGender = document.createElement("td");
    tdGender.textContent = row.gender;
    tr.appendChild(tdGender);

    const tdRole = document.createElement("td");
    tdRole.textContent = row.role;
    tr.appendChild(tdRole);

    const tdCertifiedDate = document.createElement("td");
    tdCertifiedDate.textContent = row.certifiedDate;
    tr.appendChild(tdCertifiedDate);

    const tdActive = document.createElement("td");
    tdActive.textContent = row.isActive;
    tr.appendChild(tdActive);

    const tdTeam = document.createElement("td");
    tdTeam.textContent = row.teamID;
    tr.appendChild(tdTeam);

    const tdRegion = document.createElement("td");
    tdRegion.textContent = row.regionID;
    tr.appendChild(tdRegion);

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
        .getElementById("runAllStaffButton")
        .addEventListener("click", printStaffTable);
});