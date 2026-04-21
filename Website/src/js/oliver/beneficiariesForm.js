// beneficiaries.form.js

const BeneficiaryForm = (() => {
  function showMessage(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = text;
  }

  function isNumericField(field) {
    return [
      "genderID",
      "ageGroupID",
      "employmentStatusID",
      "educationLevelID",
      "maritalStatusID",
      "regionID",
      "consentGiven"
    ].includes(field);
  }

  async function add() {
    const data = {
      firstName: document.getElementById("firstName")?.value.trim(),
      lastName: document.getElementById("lastName")?.value.trim(),
      genderID: document.getElementById("gender")?.value,
      ageGroupID: document.getElementById("ageGroup")?.value,
      employmentStatusID: document.getElementById("employmentStatus")?.value,
      educationLevelID: document.getElementById("educationLevel")?.value,
      maritalStatusID: document.getElementById("maritalStatus")?.value,
      regionID: document.getElementById("regionID")?.value,
      registrationDate: document.getElementById("registrationDate")?.value
    };

    if (Object.values(data).some(v => !v)) {
      showMessage("formMessage", "Please fill in all fields.");
      return;
    }

    try {
      const result = await BeneficiaryRepo.addBeneficiary(data);
      if (result.success) {
        showMessage("formMessage", "Beneficiary added successfully.");
        document.getElementById("beneficiaryForm")?.reset();
      } else {
        showMessage("formMessage", result.error || "Error adding beneficiary.");
      }
    } catch (error) {
      console.error(error);
      showMessage("formMessage", "Request failed.");
    }
  }

  function toggleHelp() {
    const menu = document.getElementById("helpMenu");
    if (!menu) return;
    menu.style.display =
      menu.style.display === "none" || menu.style.display === "" ? "block" : "none";
  }

  function showEdit() {
    const editSection = document.getElementById("editSection");
    const deleteSection = document.getElementById("deleteSection");
    if (editSection) editSection.style.display = "block";
    if (deleteSection) deleteSection.style.display = "none";
  }

  function showDelete() {
    const editSection = document.getElementById("editSection");
    const deleteSection = document.getElementById("deleteSection");
    if (deleteSection) deleteSection.style.display = "block";
    if (editSection) editSection.style.display = "none";
  }

  async function edit() {
    const id = document.getElementById("editID")?.value;
    const field = document.getElementById("editField")?.value;
    const value = document.getElementById("editValue")?.value.trim();

    if (!id || !field || !value) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const result = await BeneficiaryRepo.updateBeneficiary(
        id,
        field,
        value,
        isNumericField(field)
      );

      if (result.success) {
        alert("Record updated successfully");
      } else {
        alert(result.error || "Error updating record");
      }
    } catch (error) {
      console.error(error);
      alert("Request failed");
    }
  }

  async function remove() {
    const id = document.getElementById("deleteID")?.value;

    if (!id) {
      alert("Enter an ID");
      return;
    }

    const confirmed = confirm(
      "This will delete the beneficiary and any linked enrolments, attendance records, and outcomes. Continue?"
    );
    if (!confirmed) return;

    try {
      const result = await BeneficiaryRepo.deleteBeneficiaryCascade(id);
      if (result.success) {
        alert("Beneficiary and linked records deleted successfully.");
        window.loadAll();
      } else {
        alert(result.error || "Error deleting record");
      }
    } catch (error) {
      console.error(error);
      alert("Request failed");
    }
  }

  return {
    add,
    edit,
    remove,
    toggleHelp,
    showEdit,
    showDelete
  };
})();
