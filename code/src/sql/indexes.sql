-- =============================================================
--   INDEXES
-- =============================================================

-- --------------------------
-- Oliver Statham
-- tblBeneficiary: regionID often used in reports "beneficiaries in region X"
-- --------------------------
CREATE INDEX idx_ben_region ON tblBeneficiary (regionID);
CREATE INDEX idx_ben_gender ON tblBeneficiary (gender);
CREATE INDEX idx_ben_ageGroup ON tblBeneficiary (ageGroup);
CREATE INDEX idx_ben_employmentStatus ON tblBeneficiary (employmentStatus);


-- --------------------------
-- Patrick Beattie
-- tblProgramme: regionID + teamID are common filters "programmes in region X", "programmes by team Y"
-- tblProgrammeCourse: courseID are not in WHERE but used for JOIN "which programmes include course X"
-- --------------------------
CREATE INDEX idx_prog_region ON tblProgramme (regionID);
CREATE INDEX idx_prog_team ON tblProgramme (teamID);
CREATE INDEX idx_pc_course ON tblProgrammeCourse (courseID);
CREATE INDEX idx_prog_status_focus ON tblProgramme (status, focusArea);


-- --------------------------
-- Stephen Brown
-- tblStaff: teamID і regionID filters "which staff are in team X", "which staff are in region Y"
-- tblSessionStaff: staffID opposite side of JOIN "which sessions does staff X work on"
-- --------------------------
CREATE INDEX idx_staff_team ON tblStaff (teamID);
CREATE INDEX idx_staff_region ON tblStaff (regionID);
CREATE INDEX idx_ss_staff ON tblSessionStaff (staffID);


-- --------------------------
-- Roman Kriuchkov
-- tblSession: pcID all sessions for a programme course
-- tblEnrolment: pcID opposite side of JOIN "which enrolments are for programme course X"
-- tblAttendance: sessionID all ssessions for an attendance record, but also UNIQUE (enrolmentID, sessionID) so no need to index enrolmentID separately
-- tblProgrammeFunding: sourceID for all funding records from a source
-- --------------------------
CREATE INDEX idx_sess_pc ON tblSession (pcID);
CREATE INDEX idx_enrol_pc ON tblEnrolment (pcID);
CREATE INDEX idx_att_session ON tblAttendance (sessionID);
CREATE INDEX idx_pf_source ON tblProgrammeFunding (sourceID);
CREATE INDEX idx_enrol_ben ON tblEnrolment (beneficiaryID);
