--search for beneficiary/ies
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

        --add a Beneficiary to db
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

        --delete beneficiary record
      DELETE a
      FROM tblAttendance a
      JOIN tblEnrolment e ON a.enrolmentID = e.enrolmentID
      WHERE e.beneficiaryID = ${Number(beneficiaryID)}

      DELETE FROM tblOutcome WHERE beneficiaryID = ${Number(beneficiaryID)}
      DELETE FROM tblEnrolment WHERE beneficiaryID = ${Number(beneficiaryID)}
      DELETE FROM tblBeneficiary WHERE beneficiaryID = ${Number(beneficiaryID)}

        --regional coverage report
        --"Where are our beneficiaries located?"
        --useful for seeing what countries have the most enrolments in our programmes
        --uses beneficiary, region and country tables
      SELECT 
        r.regionName,
        c.countryName,
        COUNT(b.beneficiaryID) AS totalBeneficiaries
      FROM tblBeneficiary b
      JOIN tblRegion r ON b.regionID = r.regionID
      JOIN tblCountry c ON r.countryID = c.countryID
      GROUP BY r.regionID, r.regionName, c.countryName
      ORDER BY totalBeneficiaries DESC, r.regionName ASC

        --demographic breakdown report
        --"Who are our beneficiaries?"
        --helps identify trends and norms of our beneficiaries
        --uses gender, age group, employment status, education level, marital status tables (formerly enums), and the beneficiary table
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

        --dropout analysis report
        --"Where and why are people struggling to finish courses?"
        --where people to struggle with courses, or if there is a common reason, we can provide extra support
        --uses enrolment, beneficiary, region and country tables
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

      
