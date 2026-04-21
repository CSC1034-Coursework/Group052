
// Send an SQL query to dbConnector.php and return the JSON response.
const runQuery = async (sql) => {
    try {
        // This is the PHP endpoint that talks to the database for us.
<<<<<<< HEAD
        const url = "https://pbeattie10.webhosting1.eeecs.qub.ac.uk/dbConnector.php";
=======
        const url = "dbConnector.php";
>>>>>>> a9f120feeb91c6c6f7725f230ee37e6914b1711b

        // Send the SQL statement in the body of a POST request.
        const response = await fetch(url, {
            method: "POST",
            body: new URLSearchParams({ query: sql })
        });

        // Stop and report a problem if the web request itself failed.
        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        // Convert the JSON text from PHP into a JavaScript object.
        const result = await response.json();
        return result;

    } catch (error) {
        // Log errors so they can be seen in the browser console during debugging.
        console.log(error.message);
    }
};


// drop down logic CHANGE THIS FOR LATERSSSSSSSSSSSSSSSSSSSSSSSSSSSS
const loadDropdown = async (sql, selectId, valueField, textField) => {

    const result = await runQuery(sql);

    if (!result.success) {
        console.error("Query failed:", result);
        return;
    }

    const select = document.querySelector(selectId);

    result.data.forEach(item => {
        const option = document.createElement("option");
        option.value = item[valueField];
        option.textContent = `${item[valueField]} - ${item[textField]}`;
        select.appendChild(option);
    });

    return result;
};

document.addEventListener("DOMContentLoaded", async () => {

    //add form dropdowns
    await loadDropdown("SELECT regionID, regionName FROM tblRegion", "#rID", "regionID", "regionName");
    await loadDropdown("SELECT teamID, teamName FROM tblTeam", "#tID", "teamID", "teamName");
    await loadDropdown("SELECT statusID, statusName FROM tblProgrammeStatus", "#sID", "statusID", "statusName");

    //edit form dropdowns
    await loadDropdown("SELECT regionID, regionName FROM tblRegion", "#editRID", "regionID", "regionName");
    await loadDropdown("SELECT teamID, teamName FROM tblTeam", "#editTID", "teamID", "teamName");
    await loadDropdown("SELECT statusID, statusName FROM tblProgrammeStatus", "#editSID", "statusID", "statusName");
});
