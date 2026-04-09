CREATE TABLE IF NOT EXIST tblBeneficiary(
    beneficiaryID INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR (20),
    LastName VARCHAR (20),
	gender ENUM('Female','Male','Other'),
    ageGroup ENUM('10-14','15-24','25-34','35-54','55+'),
    employmentStatus ENUM('Employed','Unemployed','Student','Homemaker'),
    educationLevel ENUM('None','Primary','Secondary','Higher'),
    maritalStatus ENUM('Single','Married','Widowed','Divorced','Engaged','Its...Complicated'),
    regionID INT FOREIGN KEY,
    registrationDate DATE;
);

CREATE TABLE IF NOT EXIST tblRegion(
    regionID INT AUTO_INCREMENT PRIMARY KEY,
    countryName VARCHAR(20),
    areaType ENUM('Urban','Rural','Suburban'),
    countryPopulation BIGINT;
);
