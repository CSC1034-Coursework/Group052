

document.addEventListener("DOMContentLoaded", () => {
  function setMessage(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function clearReportMessage() {
    setMessage("reportMessage", "");
  }

  async function loadAll() {
    try {
      const result = await BeneficiaryRepo.getAllBeneficiaries();

      if (result.success) {
        BeneficiaryTable.render("table", result.data);
      } else {
        BeneficiaryTable.render("table", []);
      }
    } catch (error) {
      console.error(error);
      setMessage("message", "Request failed.");
    }
  }

  async function searchData() {
    const searchType = document.getElementById("searchType")?.value;
    const searchValue = document.getElementById("searchValue")?.value.trim();

    setMessage("message", "");
    const table = document.getElementById("resultsTable");
    if (table) table.innerHTML = "";

    if (!searchValue) {
      setMessage("message", "Please enter a search value.");
      return;
    }

    try {
      const result = await BeneficiaryRepo.searchBeneficiaries(searchType, searchValue);

      if (result.error) {
        setMessage("message", result.error);
        return;
      }

      if (result.success && result.data?.length > 0) {
        setMessage("message", `Found ${result.data.length} record(s).`);
        BeneficiaryTable.render("resultsTable", result.data);
      } else {
        setMessage("message", "No matching records found.");
      }
    } catch (error) {
      console.error(error);
      setMessage("message", "Request failed.");
    }
  }

  async function loadRegionalCoverage() {
  clearReportMessage();
  try {
    const result = await BeneficiaryRepo.getRegionalCoverageReport();
    if (result.error) {
      setMessage("reportMessage", result.error);
      BeneficiaryTable.destroyChart();
      return;
    }
    BeneficiaryTable.render("reportTable", result.data);
    BeneficiaryTable.renderRegionalCoverageChart(result.data);
    setMessage("reportMessage", "Showing number of beneficiaries in each region.");
  } catch (error) {
    console.error(error);
    BeneficiaryTable.destroyChart();
    setMessage("reportMessage", "Could not load regional coverage report.");
  }
}

async function loadDemographicBreakdown() {
  clearReportMessage();
  try {
    const result = await BeneficiaryRepo.getDemographicBreakdownReport();
    if (result.error) {
      setMessage("reportMessage", result.error);
      BeneficiaryTable.destroyChart();
      return;
    }
    BeneficiaryTable.render("reportTable", result.data);
    BeneficiaryTable.renderDemographicBreakdownChart(result.data);
    setMessage("reportMessage", "Showing demographic breakdown.");
  } catch (error) {
    console.error(error);
    BeneficiaryTable.destroyChart();
    setMessage("reportMessage", "Could not load demographic breakdown report.");
  }
}

async function loadDropoutAnalysis() {
  clearReportMessage();
  try {
    const result = await BeneficiaryRepo.getDropoutAnalysisReport();
    if (result.error) {
      setMessage("reportMessage", result.error);
      BeneficiaryTable.destroyChart();
      return;
    }
    BeneficiaryTable.render("reportTable", result.data);
    BeneficiaryTable.renderDropoutAnalysisChart(result.data);
    setMessage("reportMessage", "Showing dropout analysis by region and reason.");
  } catch (error) {
    console.error(error);
    BeneficiaryTable.destroyChart();
    setMessage("reportMessage", "Could not load dropout analysis.");
  }
}

  window.loadAll = loadAll;
  window.searchData = searchData;
  window.loadRegionalCoverage = loadRegionalCoverage;
  window.loadDemographicBreakdown = loadDemographicBreakdown;
  window.loadDropoutAnalysis = loadDropoutAnalysis;

  window.addBeneficiary = BeneficiaryForm.add;
  window.editRecord = BeneficiaryForm.edit;
  window.deleteRecord = BeneficiaryForm.remove;
  window.toggleHelp = BeneficiaryForm.toggleHelp;
  window.showEdit = BeneficiaryForm.showEdit;
  window.showDelete = BeneficiaryForm.showDelete;
});
