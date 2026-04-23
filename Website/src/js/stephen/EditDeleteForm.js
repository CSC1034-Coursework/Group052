let selectedStaffID = null;

          // Show a message to explain what happened after an action.
          const showEditDeleteMessage = (text, type) => {
            const output = document.querySelector("#message");
            output.textContent = text;
            output.className = `message ${type}`;
          };

          // Remove any old message before the next action starts.
          const clearMessage = () => {
            const output = document.querySelector("#message");
            output.textContent = "";
            output.className = "message";
          };

          // Return the form to its default state with no student selected.
          const resetForm = () => {
            const form = document.querySelector("#formEdit");
            const selectedStaffText = document.querySelector("#selectedStaffText");

            form.reset();
            selectedStaffID = null;
            selectedStaffText.textContent = "Choose a staff from the table first.";
          };

          // Copy the chosen row's values into the form so they can be edited.
          const selectStaff = (staff) => {
            const selectedStaffText = document.querySelector("#selectedStaffText");

            selectedStaffID = Number(staff.staffID);
            document.querySelector("#staffIDEdit").value = staff.staffID;
            document.querySelector("#firstNameEdit").value = staff.firstName;
            document.querySelector("#lastNameEdit").value = staff.lastName;
            document.querySelector("#emailEdit").value = staff.email;
            document.querySelector("#phoneEdit").value = staff.phone;
            document.querySelector("#genderEdit").value = staff.gender;
            document.querySelector("#roleEdit").value = staff.role;
            document.querySelector("#certifiedDateEdit").value = staff.certifiedDate;
            document.querySelector("#isActiveEdit").value = staff.isActive;
            document.querySelector("#teamIDEdit").value = staff.teamID;
            document.querySelector("#regionIDEdit").value = staff.regionID;
            document.querySelector("#createdAtEdit").value = staff.createdAt;
            document.querySelector("#updatedAtEdit").value = staff.updatedAt;
            selectedStaffText.textContent = `Editing staff ${staff.staffID}: ${staff.firstName} ${staff.lastName}`;
            clearMessage();
          };

          // Build the table of students and add Edit/Delete buttons to each row.
          const printTable = async () => {
            const output = document.querySelector("#tableOutput");
            output.textContent = "";

            // Read the whole students table from the database.
            const sql = "SELECT * FROM tblStaff ORDER BY staffID;";
            const result = await runQuery(sql);

            if (!result || !result.data || result.data.length === 0) {
              output.textContent = "No Rows Returned";
              return;
            }

            const rows = result.data;
            const table = document.createElement("table");
            const headerRow = document.createElement("tr");
            table.appendChild(headerRow);

            // These headings label each column in the table.
            const headings = ["Staff ID", "First Name", "Last Name", "Email", "Phone", "Gender", "Role", "Certified Date", "Active", "Team ID", "Region ID", "Created At", "Updated At", "Action"];

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

              const tdAction = document.createElement("td");
              const editButton = document.createElement("button");
              editButton.type = "button";
              editButton.textContent = "Edit";
              editButton.addEventListener("click", () => {
                // Load this student's details into the form.
                selectStaff(row);
              });
              tdAction.appendChild(editButton);

              const deleteButton = document.createElement("button");
              deleteButton.type = "button";
              deleteButton.textContent = "Delete";
              deleteButton.classList.add("btn--action--danger");
              deleteButton.addEventListener("click", async () => {
                const shouldDelete = confirm(`Delete staff ${row.staffID}?`);
                if (!shouldDelete) {
                  return;
                }

                const checkSql = `SELECT COUNT(*) AS sessionCount
                FROM tblSessionStaff
                WHERE staffID = ${row.staffID};`;

                const checkResult = await runQuery(checkSql);

                if (checkResult && checkResult.data && checkResult.data[0].sessionCount > 0) {
                  showEditDeleteMessage("Cannot delete this staff member because they are assigned to one or more sessions.","error");
                  return;
                }

                // Remove the chosen student from the database table.
                const deleteSql = `DELETE FROM tblStaff WHERE staffID = ${row.staffID}`;
                const deleteResult = await runQuery(deleteSql);

                if (deleteResult && deleteResult.success) {
                  showEditDeleteMessage("Staff record deleted successfully.", "success");

                  if (selectedStaffID === Number(row.staffID)) {
                    resetForm();
                  }

                  printTable();
                  return;
                }

                if (deleteResult && deleteResult.error) {
                  showEditDeleteMessage(deleteResult.error, "error");
                } else {
                  showEditDeleteMessage("Unable to delete the record.", "error");
                }
              });
              tdAction.appendChild(deleteButton);
              tr.appendChild(tdAction);

              table.appendChild(tr);
            }

            output.appendChild(table);
          };

          // Wait for the page to load before attaching event listeners and drawing the table.
          document.addEventListener("DOMContentLoaded", () => {
            const form = document.querySelector("#formEdit");

            resetForm();
            printTable();

            form.addEventListener("submit", async (event) => {
              event.preventDefault();

              if (selectedStaffID === null) {
                showEditDeleteMessage("Choose a staff from the table before updating.", "error");
                return;
              }

              const staff = {
                staffID: Number(document.querySelector("#staffIDEdit").value),
                firstName: document.querySelector("#firstNameEdit").value.trim(),
                lastName: document.querySelector("#lastNameEdit").value.trim(),
                email: document.querySelector("#emailEdit").value.trim(),
                phone: document.querySelector("#phoneEdit").value.trim(),
                gender: document.querySelector("#genderEdit").value.trim(),
                role: document.querySelector("#roleEdit").value.trim(),
                certifiedDate: document.querySelector("#certifiedDateEdit").value.trim(),
                isActive: Number(document.querySelector("#isActiveEdit").value),
                teamID: Number(document.querySelector("#teamIDEdit").value),
                regionID: Number(document.querySelector("#regionIDEdit").value),
                createdAt: document.querySelector("#createdAtEdit").value.trim(),
                updatedAt: document.querySelector("#updatedAtEdit").value.trim(),
              };

              // Check the edited values before sending them to the database.
              const validationMessage = validateStaff(staff);
              if (validationMessage) {
                showEditDeleteMessage(validationMessage, "error");
                return;
              }

              const certifiedDateValue =
                staff.certifiedDate === ""
                  ? "NULL"
                  : `'${escapeSql(staff.certifiedDate)}'`;

              // Update the row that was originally selected, even if the ID itself was changed in the form.
              const sql = `
          UPDATE tblStaff
          SET
            staffID = ${staff.staffID},
            firstName = '${escapeSql(staff.firstName)}',
            lastName = '${escapeSql(staff.lastName)}',
            email = '${escapeSql(staff.email)}',
            phone = '${escapeSql(staff.phone)}',
            gender = '${escapeSql(staff.gender)}',
            role = '${escapeSql(staff.role)}',
            certifiedDate = ${certifiedDateValue},
            isActive = ${staff.isActive},
            teamID = ${staff.teamID},
            regionID = ${staff.regionID},
            createdAt = '${escapeSql(staff.createdAt)}',
            updatedAt = '${escapeSql(staff.updatedAt)}'
          WHERE staffID = ${selectedStaffID}
        `;

              // Send the SQL UPDATE statement and wait for the result.
              const result = await runQuery(sql);

              if (result && result.success) {
                showEditDeleteMessage("Staff record updated successfully.", "success");
                resetForm();
                printTable();
                return;
              }

              if (result && result.error) {
                showEditDeleteMessage(result.error, "error");
              } else {
                showEditDeleteMessage("Unable to update the record.", "error");
              }
            });
          });