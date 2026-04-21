

// This remembers which record was chosen from the table.
let selectedProgrammeID = null;

//displays a message to the user in output div
const showMessageEdit = (text, type) => {
    const output = document.querySelector("#outputEdit");
    output.textContent = text;
    output.className = `message ${type}`;
};

//clears messages for edit form
const clearMessageEdit = () => {
    const output = document.querySelector("#outputEdit");
    output.textContent = "";
    output.className = "message";
};

// Put the form back into its starting state.
const resetForm = () => {
    const form = document.querySelector("#editForm");
    const selectedProgrammeText = document.querySelector("#selectedProgrammeText");

    form.reset();
    selectedProgrammeID = null;
    selectedProgrammeText.textContent = "Choose a programme from the table first please.";
};


//Copy the chosen programme's data from the table into the form fields.
const selectProgramme = (tblProgramme) => {
    const selectedProgrammeText = document.querySelector("#selectedProgrammeText");

    //stores selected ID
    selectedProgrammeID = Number(tblProgramme.programmeID);


    //fills form fields
    document.querySelector("#editPName").value = tblProgramme.programmeName;
    document.querySelector("#editStartDate").value = tblProgramme.startDate;
    document.querySelector("#editEndDate").value = tblProgramme.endDate;
    document.querySelector("#editBudget").value = tblProgramme.budget;
    document.querySelector("#editObjectives").value = tblProgramme.objectives;
    document.querySelector("#editFocusArea").value = tblProgramme.focusArea;

    //timeout will wait for dropdowns to be ready
    setTimeout(() => {
        document.querySelector("#editRID").value = tblProgramme.regionID;
        document.querySelector("#editTID").value = tblProgramme.teamID;
        document.querySelector("#editSID").value = tblProgramme.statusID;
    },200 );

    // user feedback text
    selectedProgrammeText.textContent =
        `Editing Programme ${tblProgramme.programmeID}: ${tblProgramme.programmeName}`;
    clearMessageEdit();
};

// Read all programmes from the database and draw them as an HTML table.
const printTable = async () => {
    const outputDelete = document.querySelector("#outputDelete");
    outputDelete.textContent = "";


    // Select every programme so we can display the whole table.
    
    const sql = "SELECT programmeID, programmeName, regionID, teamID, startDate, endDate, budget, objectives, statusID, focusArea FROM tblProgramme ORDER BY programmeID";




    const result = await runQuery(sql);

    if (!result || !result.data || result.data.length === 0) {
        outputDelete.textContent = "No Rows Returned";
        return;
    }

    const rows = result.data;
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    thead.appendChild(headerRow); //puts row inside thead
    table.appendChild(thead); //attaches thead to the table

    // These headings become the top row of the table.
    const headings = ["Programme Name", "Start Date", "End Date", "Budget", "Objectives", "Focus Areas","Delete","Edit"];

    for (let heading of headings) {
        const th = document.createElement("th");
        th.textContent = heading;
        headerRow.appendChild(th);
    }

    for (let row of rows) {
        const tr = document.createElement("tr");

        const tdProgrammeName = document.createElement("td");
        tdProgrammeName.textContent = row.programmeName;
        tr.appendChild(tdProgrammeName);

        const tdStartDate = document.createElement("td");
        tdStartDate.textContent = row.startDate;
        tr.appendChild(tdStartDate);

        const tdEndDate = document.createElement("td");
        tdEndDate.textContent = row.endDate;
        tr.appendChild(tdEndDate);

        const tdBudget = document.createElement("td");
        tdBudget.textContent = row.budget;
        tr.appendChild(tdBudget);

        const tdObjectives = document.createElement("td");
        tdObjectives.textContent = row.objectives;
        tr.appendChild(tdObjectives);

        const tdFocusAreas = document.createElement("td");
        tdFocusAreas.textContent = row.focusArea;
        tr.appendChild(tdFocusAreas);

        // ADD DELETE FUNCTIONALITY HERE
        const tdDelete = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete No. " + row.programmeID;

        //confirms action with user
        deleteButton.addEventListener("click", async () => {
            const shouldDelete = confirm(`Delete Programme ${row.programmeID}?`);
            if (!shouldDelete) {
                return;
            }

            const deleteSQL = `DELETE FROM tblProgramme WHERE programmeID = ${row.programmeID};`;
            console.log(deleteSQL);

            const deleteResult = await runQuery(deleteSQL);

            if (deleteResult && deleteResult.success) {
                showMessageEdit("Programme record deleted successfully.", "success");
                printTable();
                return;
            }

            if (deleteResult && deleteResult.error) {
                showMessageEdit(deleteResult.error, "error");
            } else {
                showMessageEdit("Unable to delete this record", "error");
            }
        });



        tdDelete.appendChild(deleteButton);
        tr.appendChild(tdDelete);
        


        //Edit button FUNCTIONALITY
        const tdEdit = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";


        editButton.addEventListener("click", () => {
            selectProgramme(row);
        });


        tdEdit.appendChild(editButton);
        tr.appendChild(tdEdit);
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

    //generates table
    outputDelete.appendChild(wrapper);

};

document.addEventListener("DOMContentLoaded", () => {
    resetForm();
    printTable();
    
});

//event listener listens for submit event and prevents a refresh
document.querySelector("#editForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    if (selectedProgrammeID == null) {
        showMessageEdit("Please select a programme to edit first.", "error");
        return;
    }

    //built object with info from form
    const programme = {
        programmeName: document.querySelector("#editPName").value.trim(),
        regionID: Number(document.querySelector("#editRID").value),
        teamID: Number(document.querySelector("#editTID").value),
        startDate: document.querySelector("#editStartDate").value,
        endDate: document.querySelector("#editEndDate").value,
        budget: Number(document.querySelector("#editBudget").value) || 0,
        objectives: document.querySelector("#editObjectives").value.trim(),
        statusID: Number(document.querySelector("#editSID").value),
        focusArea: document.querySelector("#editFocusArea").value.trim()
    };

    //console.log(programme);

    //validation check for data from form
    const validationMessage = validateProgramme(programme);
    //console.log(validationMessage);
    if (validationMessage) {
        showMessageEdit(validationMessage, "error")
        return;
    }

    //builds sql string
    const sql = `
    UPDATE tblProgramme
    SET
        programmeName = '${escapeSql(programme.programmeName)}',
        regionID = ${programme.regionID},
        teamID = ${programme.teamID},
        startDate = '${programme.startDate}',
        endDate = ${programme.endDate ? `'${programme.endDate}'` : 'NULL'},
        budget = ${programme.budget},
        objectives = '${escapeSql(programme.objectives)}',
        statusID = ${programme.statusID},
        focusArea = '${escapeSql(programme.focusArea)}'
        WHERE programmeID = ${selectedProgrammeID};
        `;

    //console.log(sql);

    //executes query
    const result = await runQuery(sql);

    //acknowledgements for success and errors
    if (result && result.success) {
        showMessageEdit("Programme record updated successfully!", "success");

        resetForm();
        printTable();
        return;
    }

    if (result && result.error) {
        showMessageEdit(result.error, "error");
    } else {
        showMessageEdit("Unable to update the record.", "error");
    }

});
