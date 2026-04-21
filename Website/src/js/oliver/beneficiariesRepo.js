

const BeneficiaryRepo = (() => {
  const DB_URL = "https://ostatham01.webhosting1.eeecs.qub.ac.uk/dbConnector.php";

  function escapeSql(value) {
    return String(value).replace(/'/g, "''");
  }

  function likeValue(value) {
    return `%${escapeSql(value.trim())}%`;
  }

  async function runQuery(sql) {
    const response = await fetch(DB_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "query=" + encodeURIComponent(sql)
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      console.error("Invalid JSON from server:", text);
      throw new Error("Server did not return valid JSON.");
    }
  }

  function getBaseBeneficiarySelect() {
    return `
      SELECT 
        b.beneficiaryID,
        b.firstName,
        b.lastName,
        g.genderName AS gender,
        ag.label AS ageGroup,
        es.label AS employmentStatus,
        el.label AS educationLevel,
        ms.label AS maritalStatus,
        b.phone,
        b.consentGiven,
        r.regionName,
        c.countryName,
        b.regionID,
        b.registrationDate,
        b.createdAt,
        b.updatedAt
      FROM tblBeneficiary b
      JOIN tblRegion r ON b.regionID = r.regionID
      JOIN tblCountry c ON r.countryID = c.countryID
      JOIN tblGender g ON b.genderID = g.genderID
      JOIN tblAgeGroup ag ON b.ageGroupID = ag.ageGroupID
      JOIN tblEmploymentStatus es ON b.employmentStatusID = es.statusID
      JOIN tblEducationLevel el ON b.educationLevelID = el.levelID
      JOIN tblMaritalStatus ms ON b.maritalStatusID = ms.statusID
    `;
  }

  function getSearchQuery(searchType, searchValue) {
    const safeLike = likeValue(searchValue);

    switch (searchType) {
      case "country":
        return `${getBaseBeneficiarySelect()} WHERE LOWER(c.countryName) LIKE LOWER('${safeLike}') ORDER BY b.beneficiaryID`;
      case "region":
        return `${getBaseBeneficiarySelect()} WHERE LOWER(r.regionName) LIKE LOWER('${safeLike}') ORDER BY b.beneficiaryID`;
      case "gender":
        return `${getBaseBeneficiarySelect()} WHERE LOWER(g.genderName) LIKE LOWER('${safeLike}') ORDER BY b.beneficiaryID`;
      case "ageGroup":
        return `${getBaseBeneficiarySelect()} WHERE LOWER(ag.label) LIKE LOWER('${safeLike}') ORDER BY b.beneficiaryID`;
      case "firstName":
        return `${getBaseBeneficiarySelect()} WHERE LOWER(b.firstName) LIKE LOWER('${safeLike}') ORDER BY b.beneficiaryID`;
      case "lastName":
        return `${getBaseBeneficiarySelect()} WHERE LOWER(b.lastName) LIKE LOWER('${safeLike}') ORDER BY b.beneficiaryID`;
      case "employmentStatus":
        return `${getBaseBeneficiarySelect()} WHERE LOWER(es.label) LIKE LOWER('${safeLike}') ORDER BY b.beneficiaryID`;
      case "maritalStatus":
        return `${getBaseBeneficiarySelect()} WHERE LOWER(ms.label) LIKE LOWER('${safeLike}') ORDER BY b.beneficiaryID`;
      case "educationLevel":
        return `${getBaseBeneficiarySelect()} WHERE LOWER(el.label) LIKE LOWER('${safeLike}') ORDER BY b.beneficiaryID`;
      default:
        return "";
    }
  }

  async function getAllBeneficiaries() {
    return runQuery(`${getBaseBeneficiarySelect()} ORDER BY b.beneficiaryID`);
  }

  async function searchBeneficiaries(searchType, searchValue) {
    const query = getSearchQuery(searchType, searchValue);
    if (!query) throw new Error("Invalid search type.");
    return runQuery(query);
  }

  async function addBeneficiary(data) {
    const query = `
      INSERT INTO tblBeneficiary
      (
        firstName,
        lastName,
        genderID,
        ageGroupID,
        employmentStatusID,
        educationLevelID,
        maritalStatusID,
        regionID,
        registrationDate
      )
      VALUES
      (
        '${escapeSql(data.firstName)}',
        '${escapeSql(data.lastName)}',
        ${Number(data.genderID)},
        ${Number(data.ageGroupID)},
        ${Number(data.employmentStatusID)},
        ${Number(data.educationLevelID)},
        ${Number(data.maritalStatusID)},
        ${Number(data.regionID)},
        '${escapeSql(data.registrationDate)}'
      )
    `;
    return runQuery(query);
  }

  async function updateBeneficiary(id, field, value, isNumeric) {
    const sqlValue = isNumeric ? Number(value) : `'${escapeSql(value)}'`;

    const query = `
      UPDATE tblBeneficiary
      SET ${field} = ${sqlValue}
      WHERE beneficiaryID = ${Number(id)}
    `;

    return runQuery(query);
  }

  async function deleteBeneficiaryCascade(beneficiaryID) {
    let query = `
      DELETE a
      FROM tblAttendance a
      JOIN tblEnrolment e ON a.enrolmentID = e.enrolmentID
      WHERE e.beneficiaryID = ${Number(beneficiaryID)}
    `;
    let data = await runQuery(query);
    if (data.error) return data;

    query = `DELETE FROM tblOutcome WHERE beneficiaryID = ${Number(beneficiaryID)}`;
    data = await runQuery(query);
    if (data.error) return data;

    query = `DELETE FROM tblEnrolment WHERE beneficiaryID = ${Number(beneficiaryID)}`;
    data = await runQuery(query);
    if (data.error) return data;

    query = `DELETE FROM tblBeneficiary WHERE beneficiaryID = ${Number(beneficiaryID)}`;
    return runQuery(query);
  }

  async function getRegionalCoverageReport() {
    const sql = `
      SELECT 
        r.regionName,
        c.countryName,
        COUNT(b.beneficiaryID) AS totalBeneficiaries
      FROM tblBeneficiary b
      JOIN tblRegion r ON b.regionID = r.regionID
      JOIN tblCountry c ON r.countryID = c.countryID
      GROUP BY r.regionID, r.regionName, c.countryName
      ORDER BY totalBeneficiaries DESC, r.regionName ASC
    `;
    return runQuery(sql);
  }

  async function getDemographicBreakdownReport() {
    const sql = `
      SELECT
        g.genderName AS gender,
        ag.label AS ageGroup,
        es.label AS employmentStatus,
        el.label AS educationLevel,
        ms.label AS maritalStatus,
        COUNT(*) AS totalBeneficiaries
      FROM tblBeneficiary b
      JOIN tblGender g ON b.genderID = g.genderID
      JOIN tblAgeGroup ag ON b.ageGroupID = ag.ageGroupID
      JOIN tblEmploymentStatus es ON b.employmentStatusID = es.statusID
      JOIN tblEducationLevel el ON b.educationLevelID = el.levelID
      JOIN tblMaritalStatus ms ON b.maritalStatusID = ms.statusID
      GROUP BY g.genderName, ag.label, es.label, el.label, ms.label
      ORDER BY totalBeneficiaries DESC
    `;
    return runQuery(sql);
  }

  async function getDropoutAnalysisReport() {
    const sql = `
      SELECT
        r.regionName,
        c.countryName,
        e.dropReason,
        COUNT(*) AS totalDropped
      FROM tblEnrolment e
      JOIN tblBeneficiary b ON e.beneficiaryID = b.beneficiaryID
      JOIN tblRegion r ON b.regionID = r.regionID
      JOIN tblCountry c ON r.countryID = c.countryID
      WHERE e.completionStatus = 'Dropped'
        AND e.dropReason IS NOT NULL
      GROUP BY r.regionName, c.countryName, e.dropReason
      ORDER BY totalDropped DESC, r.regionName ASC
    `;
    return runQuery(sql);
  }

  return {
    getAllBeneficiaries,
    searchBeneficiaries,
    addBeneficiary,
    updateBeneficiary,
    deleteBeneficiaryCascade,
    getRegionalCoverageReport,
    getDemographicBreakdownReport,
    getDropoutAnalysisReport
  };
})();
