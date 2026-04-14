CREATE TABLE IF NOT EXISTS tblProgramme (
programmeID INT AUTO_INCREMENT PRIMARY KEY,
programmeName VARCHAR(100) NOT NULL,
regionID INT NOT NULL,
sourceID INT NOT NULL,
teamID INT NOT NULL,
startDate DATE,
endDate DATE,
budget DECIMAL(19,4),
status ENUM('Planned','Active','Completed','Cancelled'),
focusArea ENUM('Child Marriage','FGM','Economic Empowerment','Political Participation','Anti-Violence'),


FOREIGN KEY (regionID) REFERENCES tblRegion(regionID),
FOREIGN KEY (sourceID) REFERENCES tblFundingSource(sourceID),
FOREIGN KEY (teamID) REFERENCES tblTeam(teamID)
);

CREATE TABLE IF NOT EXISTS tblProgrammeCourse (
pcID INT AUTO_INCREMENT PRIMARY KEY,
programmeID INT NOT NULL,
courseID INT NOT NULL,

FOREIGN KEY (regionID) REFERENCES tblRegion(regionID),
FOREIGN KEY (courseID) REFERENCES tblCourse(courseID)
);


CREATE TABLE IF NOT EXISTS tblCourse(
courseID INT AUTO_INCREMENT PRIMARY KEY,
courseName VARCHAR(100) NOT NULL,
skillCategory ENUM('Legal Rights','Health Education','Financial Literacy','Leadership','Digital Skills') NOT NULL,
durationHours INT NOT NULL,
difficultyLevel ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Beginner',
description TEXT
);
