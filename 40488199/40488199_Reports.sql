-- =============================================================
-- Report Title: Learning Improvement by Focus Area, Course, Gender

-- Business Question: Which programme focus areas and courses produce the
-- greatest measurable learning gains, are certain  gender groups consistently falling behind?

-- Why this report is useful:
--   NGOs and programme coordinators invest significant resources into
--   training delivery but often lack evidence of whether participants
--   are actually learning. report quantifies the gap between
--   pre and post-assessment scores to identify which focus areas and
--   courses drive real skill development. Breaking results down by gender
--   surfaces hidden inequality a course may show strong average gains
--   overall while one gender group is consistently left behind. it
--   directly supports SDG 5 by making gender disaggregated outcome data
--   visible and actionable for programme managers.

-- Tables used: tblEnrolment, tblProgrammeCourse, tblProgramme,
-- tblCourse, tblBeneficiary, tblGender
-- =============================================================
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



-- =============================================================
-- Report Title: Funding Risk and Cost-Efficiency for Active Programmes

-- Business Question: Which active programmes face a funding shortfall or
-- have expired funding commitments, and how efficiently  is each programme converting budget?

-- Why this report is useful:
--   Programmes that run out of funding  risk abrupt cancellation(harms enrolled beneficiaries)
--   particularly in underserved regions where no alternative provision
--   exists. This report gives funding officers a risk
--   assessment by flagging programmes where the total committed funding
--   falls short of the approved budget, or where all funding agreements
--   have already expired. The cost per enrolment metric allows
--   decision makers to compare financial efficiency across programmes
--   and prioritise renewal for those delivering the most impact per
--   pound spent. This is critical for organisations accountable to
--   donors and grant bodies.

-- Tables used: tblProgramme, tblProgrammeStatus, tblRegion,
-- tblProgrammeFunding, tblProgrammeCourse, tblEnrolment
-- =============================================================
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



-- =============================================================
-- Report Title: Completion and Attendance Rates by Programme and Region

-- Business Question: Where are participants dropping out or disengaging,
-- and which regions and programmes need urgent operational intervention?

-- Why this report is useful:
--   Enrolment numbers alone do not reflect programme success a
--   programme may recruit large numbers but lose most participants
--   before completion. This report combines two distinct engagement
--   signals: attendance rate (are participants showing up to sessions?)
--   and completion rate (are they finishing the programme?). Separating
--   these two metrics reveals different problems low attendance may
--   indicate scheduling or access barriers, while high attendance but
--   low completion may point to assessment difficulty or support gaps.
--   Filtering by focus area allows coordinators to compare dropout
--   patterns across thematic areas such as Economic Empowerment vs
--   Anti-Violence, enabling targeted and evidence-based interventions
--   rather than blanket responses.

-- Tables used: tblProgramme, tblProgrammeCourse, tblEnrolment,
-- tblRegion, tblSession, tblAttendance
-- =============================================================
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
