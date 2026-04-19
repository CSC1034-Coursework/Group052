//Display table

   
            document.addEventListener("DOMContentLoaded", async () => {
                const outputDisplay = document.querySelector("#outputDisplay");
        const sql = "SELECT programmeName, startDate, endDate, budget, objectives, focusArea FROM tblProgramme";

        //executes query
        const result = await runQuery(sql);
        console.log(result);



            if (!result || !result.success) {
             outputDisplay.textContent = "Error retrieving data";
             return;
             }
             const rows = result.data;


        console.log(rows);

        if (!result || rows.length === 0) {
            outputDisplay.textContent = "No Rows Returned";
                }

        const table = document.createElement("table");
        const headerRow = document.createElement("tr");
        table.appendChild(headerRow);

        const thProgrammeName = document.createElement("th");
        const thStartDate = document.createElement("th");
        const thEndDate = document.createElement("th");
        const thBudget = document.createElement("th");
        const thObjectives = document.createElement("th");
        const thFocusArea = document.createElement("th");
                

        thProgrammeName.textContent = "Programme Name";
        thStartDate.textContent = "Start Date";
        thEndDate.textContent = "End Date";
        thBudget.textContent = "Budget";
        thObjectives.textContent = "Objectives";
        thFocusArea.textContent = "Focus Areas";
                


        headerRow.appendChild(thProgrammeName);
        headerRow.appendChild(thStartDate);
        headerRow.appendChild(thEndDate);
        headerRow.appendChild(thBudget);
        headerRow.appendChild(thObjectives);
        headerRow.appendChild(thFocusArea);
                

            


        for (let row of rows) {
        const tr = document.createElement("tr");

        const tdProgrammeName = document.createElement("td");
        const tdStartDate = document.createElement("td");
        const tdEndDate = document.createElement("td");
        const tdBudget = document.createElement("td");
        const tdObjectives = document.createElement("td");
        const tdFocusArea = document.createElement("td");

        tdProgrammeName.textContent = row.programmeName;
        tdStartDate.textContent = row.startDate;
        tdEndDate.textContent = row.endDate;
        tdBudget.textContent = row.budget;
        tdObjectives.textContent = row.objectives;
        tdFocusArea.textContent = row.focusArea;

        tr.appendChild(tdProgrammeName);
        tr.appendChild(tdStartDate);
        tr.appendChild(tdEndDate);
        tr.appendChild(tdBudget);
        tr.appendChild(tdObjectives);
        tr.appendChild(tdFocusArea);

        table.appendChild(tr);

                }



        outputDisplay.appendChild(table);

            });
