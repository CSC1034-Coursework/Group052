-- BUSINESS QUESTION: Identifies which programme-course combinations deliver
-- the greatest measurable learning improvement (post minus pre assessment score),
-- broken down by gender. 
CREATE OR REPLACE VIEW vw_score_improvement AS
SELECT
    p.focusArea,
    c.courseName,
    g.genderName,
    COUNT(e.enrolmentID)                                                                            AS total_enrolled,
    ROUND(AVG(e.preAssessmentScore), 1)                                                             AS avg_pre,
    ROUND(AVG(e.postAssessmentScore), 1)                                                            AS avg_post,
    ROUND(AVG(CAST(e.postAssessmentScore AS SIGNED) - CAST(e.preAssessmentScore AS SIGNED)), 1)     AS avg_improvement
FROM tblEnrolment e
INNER JOIN tblProgrammeCourse pc ON e.pcID          = pc.pcID
INNER JOIN tblProgramme p        ON pc.programmeID  = p.programmeID
INNER JOIN tblCourse c           ON pc.courseID     = c.courseID
INNER JOIN tblBeneficiary b      ON e.beneficiaryID = b.beneficiaryID
INNER JOIN tblGender g           ON b.genderID      = g.genderID
WHERE e.preAssessmentScore  IS NOT NULL
  AND e.postAssessmentScore IS NOT NULL
GROUP BY p.focusArea, c.courseID, g.genderID;

-- BUSINESS QUESTION: Flags active programmes where funding has expired or is absent,
-- and calculates cost-per-enrolment to assess financial efficiency.
CREATE OR REPLACE VIEW vw_funding_risk AS
SELECT
    p.programmeID,
    p.programmeName,
    p.focusArea,
    r.regionName,
    p.budget,
    COALESCE(SUM(pf.amount), 0)                                      AS total_funded,
    ROUND(p.budget - COALESCE(SUM(pf.amount), 0), 2)                 AS funding_gap,
    COUNT(DISTINCT e.enrolmentID)                                     AS total_enrolments,
    CASE
        WHEN COUNT(DISTINCT e.enrolmentID) > 0
        THEN ROUND(p.budget / COUNT(DISTINCT e.enrolmentID), 2)
        ELSE NULL
    END                                                               AS cost_per_enrolment,
    MAX(pf.endDate)                                                   AS latest_funding_end,
    CASE
        WHEN MAX(pf.endDate) < CURDATE() OR MAX(pf.endDate) IS NULL
        THEN 'AT RISK'
        ELSE 'Funded'
    END                                                               AS funding_status
FROM tblProgramme p
INNER JOIN tblProgrammeStatus ps ON p.statusID    = ps.statusID
INNER JOIN tblRegion r           ON p.regionID    = r.regionID
LEFT JOIN  tblProgrammeFunding pf ON p.programmeID = pf.programmeID
LEFT JOIN  tblProgrammeCourse pc  ON p.programmeID = pc.programmeID
LEFT JOIN  tblEnrolment e         ON pc.pcID       = e.pcID
WHERE ps.statusName = 'Active'
GROUP BY p.programmeID, r.regionID;

-- BUSINESS QUESTION: Measures attendance rate and completion status per programme
-- and region to identify where participants are disengaging.
CREATE OR REPLACE VIEW vw_completion_attendance AS
SELECT
    p.programmeID,
    p.programmeName,
    p.focusArea,
    r.regionName,
    COUNT(DISTINCT e.enrolmentID) AS total_enrolled,
    SUM(e.completionStatus = 'Completed') AS completed,
    SUM(e.completionStatus = 'Dropped')   AS dropped,
    ROUND(
        100.0 * SUM(e.completionStatus = 'Completed')
        / NULLIF(COUNT(DISTINCT e.enrolmentID), 0),
        1
    ) AS completion_rate_pct,
    ROUND(
        100.0 * att.attended_sessions
        / NULLIF(att.total_possible, 0),
        1
    ) AS attendance_rate_pct
FROM tblProgramme p
JOIN tblProgrammeCourse pc ON pc.programmeID = p.programmeID
JOIN tblEnrolment e        ON e.pcID = pc.pcID
JOIN tblRegion r           ON p.regionID = r.regionID
LEFT JOIN (
    SELECT
        s.pcID,
        COUNT(DISTINCT s.sessionID) * COUNT(DISTINCT a.enrolmentID) AS total_possible,
        SUM(a.attended = 1) AS attended_sessions
    FROM tblSession s
    LEFT JOIN tblAttendance a ON a.sessionID = s.sessionID
    GROUP BY s.pcID
) att ON att.pcID = pc.pcID
GROUP BY p.programmeID, p.programmeName, p.focusArea, r.regionName;
