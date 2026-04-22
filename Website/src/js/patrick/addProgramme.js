


// Check that a programme object contains valid values before using it in SQL.
const validateProgramme = (programme) => {
    if (!programme || typeof programme !== "object") {
        return "Programme details are required.";
    }

    // Clean up and convert values first so the checks below are easier to write.
    const name = programme.programmeName?.trim() || "";
    const regionID = Number(programme.regionID);
    const teamID = Number(programme.teamID);
    const statusID = Number(programme.statusID);
    const budget = Number(programme.budget);

    const objectives = programme.objectives?.trim() || "";
    const startDate = programme.startDate?.trim();
    const endDate = programme.endDate?.trim();

    //VALIDATION FOR FORM
    // Check each field one at a time and return the first validation message that applies.
    if (!name) {
        return "You must enter a programme name.";
    }
    if (name.length > 200) {
        return "Programme name must be under 200 characters.";
    }
    if (!Number.isInteger(regionID) || regionID < 1) {
        return "Please select a region.";
    }
    if (!Number.isInteger(teamID) || teamID < 1) {
        return "Please select a team.";
    }
    if (!Number.isInteger(statusID) || statusID < 1) {
        return "Please select a status.";
    }
    if (budget && budget < 0) {
        return "Budget must be 0 or greater.";
    }


    if (!objectives) {
        return "You must enter an objective.";
    }
    if (objectives.length > 200) {
        return "Objective must be under 200 characters.";
    }
    if (!startDate) {
        return "A start date is required.";
    }
    if (endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start)
            return "The end date must be after start date or empty.";
    }

    // An empty string means every check passed.
    return "";
}


// Replace single quotes with two single quotes so they are safer inside SQL strings.
// /'/g means "find every single quote in the text" (g = global, so not just the first one).
const escapeSql = (value) => {
return value.replace(/'/g, "''");
}



    //displays a message to the user in output div
    const showMessage = (text, type) => {
    const output = document.querySelector("#output");
    output.textContent = text;
    output.className = `message ${type}`;
    };
    // Clear any old message so the page does not show stale feedback.
    const clearMessage = () => {
    const output = document.querySelector("#output");
    output.textContent = "";
    output.className = "message";
    };

    //event listener listens for submit event and prevents a refresh
    document.querySelector("#programmeForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    //built object with info from form
    const programme = {
    programmeName: document.querySelector("#pName").value.trim(),
    regionID: Number(document.querySelector("#rID").value),
    teamID: Number(document.querySelector("#tID").value),
    startDate: document.querySelector("#startDate").value,
    endDate: document.querySelector("#endDate").value,
    budget: Number(document.querySelector("#budget").value) || 0,
    objectives: document.querySelector("#objectives").value.trim(),
    statusID: Number(document.querySelector("#sID").value),
    focusArea: document.querySelector("#focusArea").value.trim()
                };

    //console.log(programme);

    //validation check for data from form
    const validationMessage = validateProgramme(programme);
    //console.log(validationMessage);
    if (validationMessage) {
        showMessage(validationMessage, "error")
                    return;
                }

    //builds sql string from user input
    const sql = `
    INSERT INTO tblProgramme(programmeName, regionID, teamID, startDate, endDate, budget, objectives, statusID, focusArea)
    VALUES(
    '${escapeSql(programme.programmeName)}',
    ${programme.regionID},
    ${programme.teamID},
    '${programme.startDate}',
    ${programme.endDate ? `'${programme.endDate}'` : 'NULL'},
    ${programme.budget},
    '${escapeSql(programme.objectives)}',
    ${programme.statusID},
    '${escapeSql(programme.focusArea)}'
    );
    `;

    //console.log(sql);

    //executes query with sql string
    const result = await runQuery(sql);

    //acknowledgements for success and errors
    if (result && result.success) {
        showMessage("Programme record added succesfully!", "success");
        document.querySelector("#programmeForm").reset();

        printTable();

    return;
                }

    if (result && result.error) {
        showMessage(result.error, "error");
                } else {
        showMessage("Unable to add the record.", "error");
                }

            });
