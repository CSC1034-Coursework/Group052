-- =============================================================
--   EXAMPLES FOR SQL REPORT YOU'LL CREATE IN THE COURSEWORK
--   3 VIEWS PER STUDENT SHOULD BE IN INDIVIDUAL FOLDERS BUT
--   WE DUPPLICATE THEM HERE FOR EASE OF ACCESS AND EASY RUN IN phpMyAdmin
--   BEGINING
-- =============================================================


-- Beneficiary enrolment summary
CREATE OR REPLACE VIEW vw_BeneficiaryProgress AS
SELECT
    b.beneficiaryID,
    CONCAT(b.firstName, ' ', b.lastName)    AS beneficiaryName,
    b.ageGroup,
    b.gender,
    r.regionName,
    c.courseName,
    p.programmeName,
    e.completionStatus,
    e.preAssessmentScore,
    e.postAssessmentScore,
    (e.postAssessmentScore - e.preAssessmentScore) AS scoreImprovement,
    e.certificateIssued
FROM tblEnrolment        e
JOIN tblBeneficiary      b  ON b.beneficiaryID = e.beneficiaryID
JOIN tblProgrammeCourse  pc ON pc.pcID         = e.pcID
JOIN tblProgramme        p  ON p.programmeID   = pc.programmeID
JOIN tblCourse           c  ON c.courseID      = pc.courseID
JOIN tblRegion           r  ON r.regionID      = b.regionID;


-- Session attendance rate
CREATE OR REPLACE VIEW vw_SessionAttendanceRate AS
SELECT
    s.sessionID,
    s.sessionDate,
    pc.pcID,
    c.courseName,
    COUNT(a.attendanceID)                                   AS totalEnrolled,
    SUM(a.attended)                                         AS totalAttended,
    ROUND(100.0 * SUM(a.attended) / COUNT(a.attendanceID), 1) AS attendancePct
FROM tblSession         s
JOIN tblProgrammeCourse pc ON pc.pcID      = s.pcID
JOIN tblCourse          c  ON c.courseID   = pc.courseID
LEFT JOIN tblAttendance a  ON a.sessionID  = s.sessionID
GROUP BY s.sessionID, s.sessionDate, pc.pcID, c.courseName;


-- Programme funding totals
CREATE OR REPLACE VIEW vw_ProgrammeFundingTotals AS
SELECT
    p.programmeID,
    p.programmeName,
    p.status,
    p.budget,
    SUM(pf.amount)  AS totalFundingReceived,
    (p.budget - COALESCE(SUM(pf.amount), 0)) AS fundingGap
FROM tblProgramme        p
LEFT JOIN tblProgrammeFunding pf ON pf.programmeID = p.programmeID
GROUP BY p.programmeID, p.programmeName, p.status, p.budget;



-- =============================================================
--   EXAMPLES END
-- =============================================================



-- =============================================================
--   WRITTEN BY OLIVER STATHAM
-- =============================================================


-- =============================================================
--   WRITTEN BY PATRICK BEATTIE
-- =============================================================


-- =============================================================
--   WRITTEN BY STEPHEN BROWN
-- =============================================================


-- =============================================================
--   WRITTEN BY ROMAN KRIUCHKOV
-- =============================================================

