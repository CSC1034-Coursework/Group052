-- -------------------------------------------------------------
-- DROP ALL TABLES (strictly in order to avoid FK issues)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS tblOutcome;
DROP TABLE IF EXISTS tblSessionStaff;
DROP TABLE IF EXISTS tblAttendance;
DROP TABLE IF EXISTS tblEnrolment;
DROP TABLE IF EXISTS tblSession;
DROP TABLE IF EXISTS tblProgrammeCourse;
DROP TABLE IF EXISTS tblProgrammeFunding;
DROP TABLE IF EXISTS tblCourse;
DROP TABLE IF EXISTS tblStaff;
DROP TABLE IF EXISTS tblBeneficiary;
DROP TABLE IF EXISTS tblProgramme;
DROP TABLE IF EXISTS tblTeam;
DROP TABLE IF EXISTS tblFundingSource;
DROP TABLE IF EXISTS tblRegion;
DROP TABLE IF EXISTS tblCountry;
DROP TABLE IF EXISTS tblProgrammeStatus;
DROP TABLE IF EXISTS tblOutcomeType;
DROP TABLE IF EXISTS tblMaritalStatus;
DROP TABLE IF EXISTS tblEducationLevel;
DROP TABLE IF EXISTS tblEmploymentStatus;
DROP TABLE IF EXISTS tblAgeGroup;
DROP TABLE IF EXISTS tblGender;
DROP TABLE IF EXISTS tblTeamSpecialisation;
DROP TABLE IF EXISTS tblCourseSkillCategory;
DROP TABLE IF EXISTS tblNames;
DROP TABLE IF EXISTS tblSurnames;
DROP TABLE IF EXISTS tblNumbers;


-- =============================================================
-- LOOKUP TABLES
-- =============================================================

-- =============================================================
--   tblCountry
--   (written by Oliver Statham)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblCountry (
    countryID       INT              UNSIGNED NOT NULL AUTO_INCREMENT,
    countryName     VARCHAR(100)     NOT NULL,
    CONSTRAINT pk_country            PRIMARY KEY (countryID),
    CONSTRAINT uq_country_name       UNIQUE (countryName)
);


-- =============================================================
--   tblGender
--   (written by Oliver Statham)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblGender (
    genderID        INT              UNSIGNED NOT NULL AUTO_INCREMENT,
    genderName      VARCHAR(50)      NOT NULL,
    CONSTRAINT pk_gender             PRIMARY KEY (genderID),
    CONSTRAINT uq_gender_name        UNIQUE (genderName)
);


-- =============================================================
--   tblAgeGroup
--   (written by Oliver Statham)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblAgeGroup (
    ageGroupID      INT              UNSIGNED NOT NULL AUTO_INCREMENT,
    label           VARCHAR(20)      NOT NULL,
    CONSTRAINT pk_age_group          PRIMARY KEY (ageGroupID),
    CONSTRAINT uq_age_group_label    UNIQUE (label)
);


-- =============================================================
--   tblEmploymentStatus
--   (written by Oliver Statham)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblEmploymentStatus (
    statusID        INT              UNSIGNED NOT NULL AUTO_INCREMENT,
    label           VARCHAR(50)      NOT NULL,
    CONSTRAINT pk_employment_status  PRIMARY KEY (statusID),
    CONSTRAINT uq_employment_label   UNIQUE (label)
);


-- =============================================================
--   tblEducationLevel
--   (written by Oliver Statham)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblEducationLevel (
    levelID         INT              UNSIGNED NOT NULL AUTO_INCREMENT,
    label           VARCHAR(50)      NOT NULL,
    CONSTRAINT pk_education_level    PRIMARY KEY (levelID),
    CONSTRAINT uq_education_label    UNIQUE (label)
);


-- =============================================================
--   tblMaritalStatus
--   (written by Oliver Statham)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblMaritalStatus (
    statusID        INT              UNSIGNED NOT NULL AUTO_INCREMENT,
    label           VARCHAR(50)      NOT NULL,
    CONSTRAINT pk_marital_status     PRIMARY KEY (statusID),
    CONSTRAINT uq_marital_label      UNIQUE (label)
);


-- =============================================================
--   tblOutcomeType
--   (written by Roman Kriuchkov)
-- =============================================================    
CREATE TABLE IF NOT EXISTS tblOutcomeType (
    typeID          INT              UNSIGNED NOT NULL AUTO_INCREMENT,
    typeName        VARCHAR(50)      NOT NULL,
    CONSTRAINT pk_outcome_type       PRIMARY KEY (typeID),
    CONSTRAINT uq_outcome_type_name  UNIQUE (typeName)
);


-- =============================================================
--   tblProgrammeStatus
--   (written by Patrick Beattie)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblProgrammeStatus (
    statusID        INT              UNSIGNED NOT NULL AUTO_INCREMENT,
    statusName      VARCHAR(50)      NOT NULL,
    CONSTRAINT pk_programme_status   PRIMARY KEY (statusID),
    CONSTRAINT uq_programme_status   UNIQUE (statusName)
);


-- =============================================================    
--   tblTeamSpecialisation
--   (written by Stephen Brown)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblTeamSpecialisation (
    specialisationID INT              UNSIGNED NOT NULL AUTO_INCREMENT,
    name             VARCHAR(100)     NOT NULL,
    CONSTRAINT pk_team_specialisation PRIMARY KEY (specialisationID),
    CONSTRAINT uq_team_specialisation UNIQUE (name)
);


-- =============================================================
--   tblCourseSkillCategory
--   (written by Patrick Beattie)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblCourseSkillCategory (
    categoryID       INT                UNSIGNED NOT NULL AUTO_INCREMENT,
    name             VARCHAR(100)       NOT NULL,
    CONSTRAINT pk_course_skill_category PRIMARY KEY (categoryID),
    CONSTRAINT uq_course_skill_category UNIQUE (name)
);


-- =============================================================
--   tblFundingSource
--   (written by Roman Kriuchkov)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblFundingSource (
    sourceID        INT             UNSIGNED NOT NULL AUTO_INCREMENT,
    sourceName      VARCHAR(150)    NOT NULL,
    sourceType      ENUM('Government','NGO','Private','UN') NOT NULL,
    contactEmail    VARCHAR(255),
    isActive        BOOLEAN         NOT NULL DEFAULT 1,
    createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_funding_source    PRIMARY KEY (sourceID),
    CONSTRAINT uq_source_name       UNIQUE (sourceName),
    CONSTRAINT chk_contact_email    CHECK (contactEmail IS NULL OR contactEmail LIKE '%@%.%')
);


-- =============================================================
--   tblNames
--   (written by Roman Kriuchkov)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblNames (
    nameID     INT              UNSIGNED NOT NULL AUTO_INCREMENT,
    name       VARCHAR(100)     NOT NULL,
    CONSTRAINT pk_name          PRIMARY KEY (nameID)
);


-- =============================================================
--   tblSurnames
--   (written by Roman Kriuchkov)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblSurnames (
    surnameID       INT              UNSIGNED NOT NULL AUTO_INCREMENT,
    surname         VARCHAR(100)     NOT NULL,
    CONSTRAINT pk_surname            PRIMARY KEY (surnameID)
);


-- =============================================================
--   tblNumbers
--   (written by Roman Kriuchkov, seed support)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblNumbers (
    n INT PRIMARY KEY
);


-- =============================================================
--   tblRegion
--   (written by Oliver Statham)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblRegion (
    regionID        INT             UNSIGNED NOT NULL AUTO_INCREMENT,
    regionName      VARCHAR(100)    NOT NULL,
    countryID       INT             UNSIGNED NOT NULL,
    areaType        ENUM('Urban','Rural','Suburban') NOT NULL,
    populationSize  INT             UNSIGNED,
    createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_region            PRIMARY KEY (regionID),
    CONSTRAINT fk_region_country    FOREIGN KEY (countryID) REFERENCES tblCountry(countryID),
    CONSTRAINT uq_region_name       UNIQUE (regionName, countryID)
);


-- =============================================================
--   tblBeneficiary
--   (written by Oliver Statham)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblBeneficiary (
    beneficiaryID       INT             UNSIGNED NOT NULL AUTO_INCREMENT,
    firstName           VARCHAR(100)    NOT NULL,
    lastName            VARCHAR(100)    NOT NULL,
    genderID            INT             UNSIGNED NOT NULL,
    ageGroupID          INT             UNSIGNED NOT NULL,
    employmentStatusID  INT             UNSIGNED NOT NULL,
    educationLevelID    INT             UNSIGNED NOT NULL,
    maritalStatusID     INT             UNSIGNED NOT NULL,
    phone               VARCHAR(30),
    consentGiven        BOOLEAN         NOT NULL DEFAULT 0,
    regionID            INT             UNSIGNED NOT NULL,
    registrationDate    DATE            NOT NULL DEFAULT (CURRENT_DATE),
    createdAt           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_beneficiary           PRIMARY KEY (beneficiaryID),
    CONSTRAINT fk_ben_region            FOREIGN KEY (regionID)             REFERENCES tblRegion(regionID),
    CONSTRAINT fk_ben_gender            FOREIGN KEY (genderID)             REFERENCES tblGender(genderID),
    CONSTRAINT fk_ben_age_group         FOREIGN KEY (ageGroupID)           REFERENCES tblAgeGroup(ageGroupID),
    CONSTRAINT fk_ben_employment        FOREIGN KEY (employmentStatusID)   REFERENCES tblEmploymentStatus(statusID),
    CONSTRAINT fk_ben_education         FOREIGN KEY (educationLevelID)     REFERENCES tblEducationLevel(levelID),
    CONSTRAINT fk_ben_marital           FOREIGN KEY (maritalStatusID)      REFERENCES tblMaritalStatus(statusID)
);


-- =============================================================
--   tblTeam
--   (written by Stephen Brown)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblTeam (
    teamID          INT             UNSIGNED NOT NULL AUTO_INCREMENT,
    teamName        VARCHAR(150)    NOT NULL,
    specialisationID INT            UNSIGNED NOT NULL,
    createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_team                PRIMARY KEY (teamID),
    CONSTRAINT uq_team_name           UNIQUE (teamName),
    CONSTRAINT fk_team_specialisation FOREIGN KEY (specialisationID) REFERENCES tblTeamSpecialisation(specialisationID)
);


-- =============================================================
--   tblStaff
--   (written by Stephen Brown)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblStaff (
    staffID         INT             UNSIGNED NOT NULL AUTO_INCREMENT,
    firstName       VARCHAR(100)    NOT NULL,
    lastName        VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    phone           VARCHAR(30),
    gender          ENUM('Female','Male','Non-binary','Prefer not to say') NOT NULL,
    role            ENUM('Coordinator','Trainer','Volunteer') NOT NULL,
    certifiedDate   DATE,
    isActive        BOOLEAN         NOT NULL DEFAULT 1,
    teamID          INT             UNSIGNED NOT NULL,
    regionID        INT             UNSIGNED NOT NULL,
    createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_staff             PRIMARY KEY (staffID),
    CONSTRAINT uq_staff_email       UNIQUE (email),
    CONSTRAINT fk_staff_team        FOREIGN KEY (teamID)   REFERENCES tblTeam(teamID),
    CONSTRAINT fk_staff_region      FOREIGN KEY (regionID) REFERENCES tblRegion(regionID),
    CONSTRAINT chk_staff_email      CHECK (email LIKE '%@%.%')
);


-- =============================================================
--   tblCourse
--   (written by Patrick Beattie)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblCourse (
    courseID        INT             UNSIGNED NOT NULL AUTO_INCREMENT,
    courseName      VARCHAR(200)    NOT NULL,
    categoryID      INT             UNSIGNED NOT NULL,
    durationHours   DECIMAL(5,1)    UNSIGNED NOT NULL,
    difficultyLevel ENUM('Beginner','Intermediate','Advanced') NOT NULL DEFAULT 'Beginner',
    description     TEXT,
    createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_course            PRIMARY KEY (courseID),
    CONSTRAINT uq_course_name       UNIQUE (courseName),
    CONSTRAINT fk_course_skill_category FOREIGN KEY (categoryID) REFERENCES tblCourseSkillCategory(categoryID),
    CONSTRAINT chk_duration         CHECK (durationHours > 0)
);


-- =============================================================
--   tblProgramme
--   (written by Patrick Beattie)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblProgramme (
    programmeID     INT             UNSIGNED NOT NULL AUTO_INCREMENT,
    programmeName   VARCHAR(200)    NOT NULL,
    regionID        INT             UNSIGNED NOT NULL,
    teamID          INT             UNSIGNED NOT NULL,
    startDate       DATE            NOT NULL,
    endDate         DATE,
    budget          DECIMAL(15,2)   UNSIGNED,
    objectives      TEXT,
    statusID        INT             UNSIGNED NOT NULL,
    focusArea       ENUM('Child Marriage', 'FGM', 'Economic Empowerment', 'Political Participation', 'Anti-Violence') NOT NULL,
    createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_programme         PRIMARY KEY (programmeID),
    CONSTRAINT fk_prog_region       FOREIGN KEY (regionID) REFERENCES tblRegion(regionID),
    CONSTRAINT fk_prog_team         FOREIGN KEY (teamID)   REFERENCES tblTeam(teamID),
    CONSTRAINT fk_prog_status       FOREIGN KEY (statusID) REFERENCES tblProgrammeStatus(statusID),
    CONSTRAINT chk_prog_dates       CHECK (endDate IS NULL OR endDate >= startDate),
    CONSTRAINT chk_prog_budget      CHECK (budget IS NULL OR budget >= 0)
);


-- =============================================================
--   tblProgrammeCourse  (Programme many-to-many Course)
--   (written by Patrick Beattie)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblProgrammeCourse (
    pcID            INT             UNSIGNED NOT NULL AUTO_INCREMENT,
    programmeID     INT             UNSIGNED NOT NULL,
    courseID        INT             UNSIGNED NOT NULL,
    createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_pc                PRIMARY KEY (pcID),
    CONSTRAINT uq_pc                UNIQUE (programmeID, courseID),
    CONSTRAINT fk_pc_programme      FOREIGN KEY (programmeID) REFERENCES tblProgramme(programmeID) ON DELETE CASCADE,
    CONSTRAINT fk_pc_course         FOREIGN KEY (courseID)    REFERENCES tblCourse(courseID)
);


-- =============================================================
--   tblProgrammeFunding (Programme many-to-many FundingSource)
--   (written by Oliver Statham)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblProgrammeFunding (
    programmeID     INT             UNSIGNED NOT NULL,
    sourceID        INT             UNSIGNED NOT NULL,
    amount          DECIMAL(15,2)   UNSIGNED NOT NULL,
    startDate       DATE            NOT NULL,
    endDate         DATE,
    createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_prog_funding      PRIMARY KEY (programmeID, sourceID, startDate),
    CONSTRAINT fk_pf_programme      FOREIGN KEY (programmeID) REFERENCES tblProgramme(programmeID) ON DELETE CASCADE,
    CONSTRAINT fk_pf_source         FOREIGN KEY (sourceID)    REFERENCES tblFundingSource(sourceID),
    CONSTRAINT chk_pf_amount        CHECK (amount > 0),
    CONSTRAINT chk_pf_dates         CHECK (endDate IS NULL OR endDate >= startDate)
);


-- =============================================================
--   tblSession
--   (written by Roman Kriuchkov)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblSession (
    sessionID       INT             UNSIGNED NOT NULL AUTO_INCREMENT,
    pcID            INT             UNSIGNED NOT NULL,
    sessionDate     DATE            NOT NULL,
    venue           VARCHAR(255)    NOT NULL,
    durationMinutes SMALLINT        UNSIGNED NOT NULL,
    notes           TEXT,
    createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_session           PRIMARY KEY (sessionID),
    CONSTRAINT fk_sess_pc           FOREIGN KEY (pcID) REFERENCES tblProgrammeCourse(pcID) ON DELETE CASCADE,
    CONSTRAINT chk_sess_dur         CHECK (durationMinutes > 0)
);


-- =============================================================
--   tblEnrolment
--   (written by Roman Kriuchkov)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblEnrolment (
    enrolmentID         INT             UNSIGNED NOT NULL AUTO_INCREMENT,
    beneficiaryID       INT             UNSIGNED NOT NULL,
    pcID                INT             UNSIGNED NOT NULL,
    enrolDate           DATE            NOT NULL DEFAULT (CURRENT_DATE),
    completionStatus    ENUM('Enrolled','Completed','Dropped') NOT NULL DEFAULT 'Enrolled',
    dropReason          VARCHAR(255),
    preAssessmentScore  TINYINT         UNSIGNED,
    postAssessmentScore TINYINT         UNSIGNED,
    certificateIssued   BOOLEAN         NOT NULL DEFAULT 0,
    createdAt           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_enrolment             PRIMARY KEY (enrolmentID),
    CONSTRAINT uq_enrolment             UNIQUE (beneficiaryID, pcID),
    CONSTRAINT fk_enrol_ben             FOREIGN KEY (beneficiaryID) REFERENCES tblBeneficiary(beneficiaryID),
    CONSTRAINT fk_enrol_pc              FOREIGN KEY (pcID)          REFERENCES tblProgrammeCourse(pcID) ON DELETE RESTRICT,
    CONSTRAINT chk_pre_score            CHECK (preAssessmentScore  IS NULL OR preAssessmentScore  BETWEEN 0 AND 100),
    CONSTRAINT chk_post_score           CHECK (postAssessmentScore IS NULL OR postAssessmentScore BETWEEN 0 AND 100),
    CONSTRAINT chk_cert_completed       CHECK (certificateIssued = 0 OR completionStatus = 'Completed'),
    CONSTRAINT chk_drop_reason          CHECK ((completionStatus = 'Dropped' AND dropReason IS NOT NULL) OR completionStatus != 'Dropped')
);


-- =============================================================
--   tblAttendance
--   (written by Roman Kriuchkov)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblAttendance (
    enrolmentID     INT             UNSIGNED NOT NULL,
    sessionID       INT             UNSIGNED NOT NULL,
    attended        BOOLEAN         NOT NULL DEFAULT 0,
    createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_attendance        PRIMARY KEY (enrolmentID, sessionID),
    CONSTRAINT fk_att_enrolment     FOREIGN KEY (enrolmentID) REFERENCES tblEnrolment(enrolmentID) ON DELETE CASCADE,
    CONSTRAINT fk_att_session       FOREIGN KEY (sessionID)   REFERENCES tblSession(sessionID) ON DELETE CASCADE
);


-- =============================================================
--   tblOutcome
--   (written by Roman Kriuchkov)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblOutcome (
    outcomeID          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    beneficiaryID      INT UNSIGNED NOT NULL,
    pcID               INT UNSIGNED NOT NULL,
    outcomeTypeID      INT UNSIGNED NOT NULL,
    outcomeValue       VARCHAR(255),
    outcomeScore       TINYINT UNSIGNED,
    outcomeDate        DATE NOT NULL,
    recordedAt         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified           BOOLEAN NOT NULL DEFAULT 0,
    verificationSource ENUM('SelfReported','NGO','Government','ThirdParty') DEFAULT 'SelfReported',
    notes              TEXT,
    CONSTRAINT pk_outcome PRIMARY KEY (outcomeID),
    CONSTRAINT fk_out_beneficiary FOREIGN KEY (beneficiaryID) REFERENCES tblBeneficiary(beneficiaryID),
    CONSTRAINT fk_out_pc FOREIGN KEY (pcID) REFERENCES tblProgrammeCourse(pcID),
    CONSTRAINT fk_out_type FOREIGN KEY (outcomeTypeID) REFERENCES tblOutcomeType(typeID),
    CONSTRAINT chk_out_score CHECK (outcomeScore IS NULL OR outcomeScore BETWEEN 0 AND 100)
);

-- =============================================================
--   tblSessionStaff
--   (written by Stephen Brown)
-- =============================================================
CREATE TABLE IF NOT EXISTS tblSessionStaff (
    sessionID       INT             UNSIGNED NOT NULL,
    staffID         INT             UNSIGNED NOT NULL,
    roleInSession   ENUM('Lead Trainer','Co-Trainer','Coordinator','Observer') NOT NULL DEFAULT 'Lead Trainer',
    createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_sess_staff        PRIMARY KEY (sessionID, staffID),
    CONSTRAINT fk_ss_session        FOREIGN KEY (sessionID) REFERENCES tblSession(sessionID) ON DELETE CASCADE,
    CONSTRAINT fk_ss_staff          FOREIGN KEY (staffID)   REFERENCES tblStaff(staffID)
);






-- =============================================================
--   INDEXES
-- =============================================================

-- --------------------------
-- Oliver Statham
-- tblBeneficiary: filters often combine region + demographics
-- --------------------------
CREATE INDEX idx_ben_region  ON tblBeneficiary (regionID);
CREATE INDEX idx_ben_filters ON tblBeneficiary (regionID, genderID, ageGroupID);


-- --------------------------
-- Patrick Beattie
-- tblProgramme: filters region, team, status, focusArea
-- tblProgrammeCourse: course -> programmes, programme -> courses
-- --------------------------
CREATE INDEX idx_prog_region       ON tblProgramme (regionID);
CREATE INDEX idx_prog_team         ON tblProgramme (teamID);
CREATE INDEX idx_prog_status_focus ON tblProgramme (statusID, focusArea);
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




-- =============================================================
--   VIEWS
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

-- BUSINESS QUESTION: Identifies which programme-course combinations deliver
-- the greatest measurable learning improvement (post minus pre assessment score),
-- broken down by gender. Helps programme managers prioritise high-impact delivery
-- and detect demographic gaps in learning outcomes.
CREATE OR REPLACE VIEW vw_score_improvement AS
SELECT
    p.programmeName,
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
GROUP BY p.programmeID, c.courseID, g.genderID;

-- BUSINESS QUESTION: Flags active programmes where funding has expired or is absent,
-- and calculates cost-per-enrolment to assess financial efficiency.
-- Enables funding officers to prioritise renewal and reallocate resources
-- before programme delivery is disrupted.
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
-- Supports operational decisions about session scheduling, support interventions,
-- and regional resource allocation.
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
        / NULLIF(att.total_sessions, 0),
        1
    ) AS attendance_rate_pct
FROM tblProgramme p
JOIN tblProgrammeCourse pc ON pc.programmeID = p.programmeID
JOIN tblEnrolment e        ON e.pcID = pc.pcID
JOIN tblRegion r           ON p.regionID = r.regionID
LEFT JOIN (
    SELECT
        e.pcID,
        COUNT(*) AS total_sessions,
        SUM(a.attended = 1) AS attended_sessions
    FROM tblAttendance a
    JOIN tblEnrolment e ON e.enrolmentID = a.enrolmentID
    GROUP BY e.pcID
) att ON att.pcID = pc.pcID
GROUP BY p.programmeID, p.programmeName, p.focusArea, r.regionName;



