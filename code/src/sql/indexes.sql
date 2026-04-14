-- =============================================================
--   INDEXES
-- =============================================================

-- --------------------------
-- Oliver Statham
-- tblBeneficiary: filters often combine region + demographics
-- --------------------------
CREATE INDEX idx_ben_region  ON tblBeneficiary (regionID);
CREATE INDEX idx_ben_filters ON tblBeneficiary (regionID, gender, ageGroup);


-- --------------------------
-- Patrick Beattie
-- tblProgramme: filters region, team, status, focusArea
-- tblProgrammeCourse: course -> programmes, programme -> courses
-- --------------------------
CREATE INDEX idx_prog_region       ON tblProgramme (regionID);
CREATE INDEX idx_prog_team         ON tblProgramme (teamID);
CREATE INDEX idx_prog_status_focus ON tblProgramme (status, focusArea);
CREATE INDEX idx_pc_course         ON tblProgrammeCourse (courseID);


-- --------------------------
-- Stephen Brown
-- tblStaff: filters team, region
-- tblSessionStaff: lookup staff -> sessions
-- --------------------------
CREATE INDEX idx_staff_team   ON tblStaff (teamID);
CREATE INDEX idx_staff_region ON tblStaff (regionID);
CREATE INDEX idx_ss_staff     ON tblSessionStaff (staffID);


-- --------------------------
-- Roman Kriuchkov
-- tblSession: sessions per programme-course + by date
-- tblEnrolment: per programme-course, per beneficiary, by status
-- tblAttendance: index needed for session-based queries
-- tblProgrammeFunding: by funding source + date ranges
-- --------------------------
CREATE INDEX idx_sess_pc      ON tblSession (pcID);
CREATE INDEX idx_sess_date    ON tblSession (sessionDate);
CREATE INDEX idx_enrol_pc     ON tblEnrolment (pcID);
CREATE INDEX idx_enrol_ben    ON tblEnrolment (beneficiaryID);
CREATE INDEX idx_enrol_status ON tblEnrolment (completionStatus);
CREATE INDEX idx_att_session  ON tblAttendance (sessionID);
CREATE INDEX idx_pf_source    ON tblProgrammeFunding (sourceID);
CREATE INDEX idx_pf_dates     ON tblProgrammeFunding (startDate, endDate);
