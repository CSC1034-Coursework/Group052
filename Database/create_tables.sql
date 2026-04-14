-- -------------------------------------------------------------
-- DROP ALL TABLES (strictly in order to avoid FK issues)
-- -------------------------------------------------------------
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
DROP TABLE IF EXISTS tblNames;
DROP TABLE IF EXISTS tblSurnames;
DROP TABLE IF EXISTS tblProbabilities;


-- =============================================================
--   tblCountry
--   (written by Oliver Statham)
-- =============================================================
CREATE TABLE tblCountry (
    countryID       INT              UNSIGNED NOT NULL AUTO_INCREMENT,
    countryName     VARCHAR(100)     NOT NULL,
    CONSTRAINT pk_country            PRIMARY KEY (countryID),
    CONSTRAINT uq_country_name       UNIQUE (countryName)
);


-- =============================================================
--   tblRegion
--   (written by Oliver Statham)
-- =============================================================
CREATE TABLE tblRegion (
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
--   tblCourse
--   (written by Patrick Beattie)
-- =============================================================
CREATE TABLE tblCourse (
    courseID        INT             UNSIGNED NOT NULL AUTO_INCREMENT,
    courseName      VARCHAR(200)    NOT NULL,
    skillCategory   ENUM('Legal Rights', 'Health Education', 'Financial Literacy', 'Leadership', 'Digital Skills') NOT NULL,
    durationHours   DECIMAL(5,1)    UNSIGNED NOT NULL,
    difficultyLevel ENUM('Beginner','Intermediate','Advanced') NOT NULL DEFAULT 'Beginner',
    description     TEXT,
    createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_course            PRIMARY KEY (courseID),
    CONSTRAINT uq_course_name       UNIQUE (courseName),
    CONSTRAINT chk_duration         CHECK (durationHours > 0)
);


-- =============================================================
--   tblTeam
--   (written by Stephen Brown)
-- =============================================================
CREATE TABLE tblTeam (
    teamID          INT             UNSIGNED NOT NULL AUTO_INCREMENT,
    teamName        VARCHAR(150)    NOT NULL,
    specialisation  ENUM('Legal Reform', 'Education', 'Healthcare', 'Economic Empowerment', 'Anti-Violence') NOT NULL,
    createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_team              PRIMARY KEY (teamID),
    CONSTRAINT uq_team_name         UNIQUE (teamName)
);


-- =============================================================
--   tblFundingSource
--   (written by Roman Kriuchkov)
-- =============================================================
CREATE TABLE tblFundingSource (
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
--   tblBeneficiary 
--   (written by Oliver Statham)
-- =============================================================
CREATE TABLE tblBeneficiary (
    beneficiaryID       INT             UNSIGNED NOT NULL AUTO_INCREMENT,
    firstName           VARCHAR(100)    NOT NULL,
    lastName            VARCHAR(100)    NOT NULL,
    gender              ENUM('Female','Male','Non-binary') NOT NULL,
    ageGroup            ENUM('10-14','15-18','19-24','25-34','35-54','55+') NOT NULL,
    employmentStatus    ENUM('Employed','Unemployed','Student','Homemaker') NOT NULL,
    educationLevel      ENUM('None','Primary','Secondary','Higher') NOT NULL,
    maritalStatus       ENUM('Single','Married','Widowed','Divorced') NOT NULL,
    phone               VARCHAR(30),
    consentGiven        BOOLEAN         NOT NULL DEFAULT 0,
    regionID            INT             UNSIGNED NOT NULL,
    registrationDate    DATE            NOT NULL DEFAULT (CURRENT_DATE),
    createdAt           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_beneficiary           PRIMARY KEY (beneficiaryID),
    CONSTRAINT fk_ben_region            FOREIGN KEY (regionID) REFERENCES tblRegion(regionID)
);


-- =============================================================
--   tblProgramme
--   (written by Patrick Beattie)
-- =============================================================
CREATE TABLE tblProgramme (
    programmeID     INT             UNSIGNED NOT NULL AUTO_INCREMENT,
    programmeName   VARCHAR(200)    NOT NULL,
    regionID        INT             UNSIGNED NOT NULL,
    teamID          INT             UNSIGNED NOT NULL,
    startDate       DATE            NOT NULL,
    endDate         DATE,
    budget          DECIMAL(15,2)   UNSIGNED,
    objectives      TEXT,
    status          ENUM('Planned','Active','Completed','Cancelled') NOT NULL DEFAULT 'Planned',
    focusArea       ENUM('Child Marriage', 'FGM', 'Economic Empowerment', 'Political Participation', 'Anti-Violence') NOT NULL,
    createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_programme         PRIMARY KEY (programmeID),
    CONSTRAINT fk_prog_region       FOREIGN KEY (regionID) REFERENCES tblRegion(regionID),
    CONSTRAINT fk_prog_team         FOREIGN KEY (teamID)   REFERENCES tblTeam(teamID),
    CONSTRAINT chk_prog_dates       CHECK (endDate IS NULL OR endDate >= startDate),
    CONSTRAINT chk_prog_budget      CHECK (budget IS NULL OR budget >= 0)
);


-- =============================================================
--   tblStaff
--   (written by Stephen Brown)
-- =============================================================
CREATE TABLE tblStaff (
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
--   tblProgrammeCourse  (Programme many-to-many Course)
--   (written by Patrick Beattie)
-- =============================================================
CREATE TABLE tblProgrammeCourse (
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
CREATE TABLE tblProgrammeFunding (
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
CREATE TABLE tblSession (
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
CREATE TABLE tblEnrolment (
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
--   tblSessionStaff
--   (written by Stephen Brown)
-- =============================================================
CREATE TABLE tblSessionStaff (
    sessionID       INT             UNSIGNED NOT NULL,
    staffID         INT             UNSIGNED NOT NULL,
    roleInSession   ENUM('Lead Trainer','Co-Trainer','Coordinator','Observer') NOT NULL DEFAULT 'Lead Trainer',
    createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_sess_staff        PRIMARY KEY (sessionID, staffID),
    CONSTRAINT fk_ss_session        FOREIGN KEY (sessionID) REFERENCES tblSession(sessionID) ON DELETE CASCADE,
    CONSTRAINT fk_ss_staff          FOREIGN KEY (staffID)   REFERENCES tblStaff(staffID)
);


-- =============================================================
--   tblAttendance 
--   (written by Roman Kriuchkov)
-- =============================================================
CREATE TABLE tblAttendance (
    attendanceID    INT             UNSIGNED NOT NULL AUTO_INCREMENT,
    enrolmentID     INT             UNSIGNED NOT NULL,
    sessionID       INT             UNSIGNED NOT NULL,
    attended        BOOLEAN         NOT NULL DEFAULT 0,
    createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_attendance        PRIMARY KEY (attendanceID),
    CONSTRAINT uq_attendance        UNIQUE (enrolmentID, sessionID),
    CONSTRAINT fk_att_enrolment     FOREIGN KEY (enrolmentID) REFERENCES tblEnrolment(enrolmentID) ON DELETE CASCADE,
    CONSTRAINT fk_att_session       FOREIGN KEY (sessionID)   REFERENCES tblSession(sessionID) ON DELETE CASCADE
);


-- =============================================================
--   tblNames
--   (written by Roman Kriuchkov)
-- =============================================================
CREATE TABLE tblNames (
    nameID     INT              UNSIGNED NOT NULL AUTO_INCREMENT,
    name       VARCHAR(100)     NOT NULL,
    CONSTRAINT pk_name          PRIMARY KEY (nameID)
);


-- =============================================================
--   tblSurnames
--   (written by Roman Kriuchkov)
-- =============================================================
CREATE TABLE tblSurnames (
    surnameID       INT              UNSIGNED NOT NULL AUTO_INCREMENT,
    surname         VARCHAR(100)     NOT NULL,
    CONSTRAINT pk_surname            PRIMARY KEY (surnameID)
);


-- =============================================================
--   tblProbabilities
--   (written by Roman Kriuchkov)
-- =============================================================
CREATE TABLE tblProbabilities (
    probabilityID     INT              UNSIGNED NOT NULL AUTO_INCREMENT,
    probabilityName   VARCHAR(50)      NOT NULL,
    probabilityValue  DECIMAL(3,2)     NOT NULL,
    CONSTRAINT pk_probability          PRIMARY KEY (probabilityID)
);




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




-- =============================================================
--   Scripts for  data generation
-- =============================================================
