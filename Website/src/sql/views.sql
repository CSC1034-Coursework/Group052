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
-- Report 1: show average learning gain by programme and difficulty level.
DROP VIEW IF EXISTS vw_score_improvement;
CREATE VIEW vw_score_improvement AS
SELECT
    p.programmeID,
    p.programmeName,
    c.difficultyLevel,
    COUNT(e.enrolmentID) AS totalCompleted,
    ROUND(AVG(e.preAssessmentScore), 1) AS avgPre,
    ROUND(AVG(e.postAssessmentScore), 1) AS avgPost,
    ROUND(AVG(e.postAssessmentScore - e.preAssessmentScore), 1) AS avgImprovement
FROM tblEnrolment e
INNER JOIN tblProgrammeCourse pc ON pc.pcID = e.pcID
INNER JOIN tblProgramme p ON p.programmeID = pc.programmeID
INNER JOIN tblCourse c ON c.courseID = pc.courseID
WHERE e.completionStatus = 'Completed'
  AND e.preAssessmentScore IS NOT NULL
  AND e.postAssessmentScore IS NOT NULL
GROUP BY p.programmeID, p.programmeName, c.difficultyLevel;

-- View: vw_FundingCoverage
-- Purpose: Summarise funding coverage per programme against the current budget.
-- Used by: Report 2 on enrolments.html
DROP VIEW IF EXISTS vw_FundingCoverage;
CREATE VIEW vw_FundingCoverage AS
SELECT
    p.programmeID,
    p.programmeName,
    p.focusArea,
    p.budget,
    ps.statusID,
    ps.statusName,
    COUNT(pf.sourceID) AS fundingStreams,
    COALESCE(SUM(pf.amount), 0) AS totalFunded,
    ROUND(COALESCE(SUM(pf.amount), 0) / NULLIF(p.budget, 0) * 100, 1) AS coveragePct,
    MIN(pf.endDate) AS earliestFundingExpiry
FROM tblProgramme p
INNER JOIN tblProgrammeStatus ps ON ps.statusID = p.statusID
LEFT JOIN tblProgrammeFunding pf ON pf.programmeID = p.programmeID
GROUP BY p.programmeID, p.programmeName, p.focusArea, p.budget, ps.statusID, ps.statusName;

-- View: vw_DropoutByRegion
-- Purpose: Compare enrolment completion and dropout rates by focus area and region.
-- Used by: Report 3 on enrolments.html
DROP VIEW IF EXISTS vw_DropoutByRegion;
CREATE VIEW vw_DropoutByRegion AS
SELECT
    p.focusArea,
    r.regionName,
    COUNT(e.enrolmentID) AS totalEnrolled,
    SUM(CASE WHEN e.completionStatus = 'Completed' THEN 1 ELSE 0 END) AS completed,
    SUM(CASE WHEN e.completionStatus = 'Dropped' THEN 1 ELSE 0 END) AS dropped,
    ROUND(100.0 * SUM(CASE WHEN e.completionStatus = 'Completed' THEN 1 ELSE 0 END) / NULLIF(COUNT(e.enrolmentID), 0), 1) AS completionRate,
    ROUND(100.0 * SUM(CASE WHEN e.completionStatus = 'Dropped' THEN 1 ELSE 0 END) / NULLIF(COUNT(e.enrolmentID), 0), 1) AS dropoutRate
FROM tblEnrolment e
INNER JOIN tblProgrammeCourse pc ON pc.pcID = e.pcID
INNER JOIN tblProgramme p ON p.programmeID = pc.programmeID
INNER JOIN tblRegion r ON r.regionID = p.regionID
GROUP BY p.focusArea, r.regionID, r.regionName;