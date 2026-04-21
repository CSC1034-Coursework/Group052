//Report 1 - Programme's Average Course Intensity

Which programme's courses are the most time intensive on average

  SELECT
    p.programmeID,
    p.programmeName,
    p.focusArea,
    COUNT(pc.courseID) AS number_of_courses,
    ROUND(AVG(c.durationHours), 1) AS avg_course_duration
FROM tblProgramme p
INNER JOIN tblProgrammeCourse pc 
    ON p.programmeID = pc.programmeID
INNER JOIN tblCourse c 
    ON pc.courseID = c.courseID
${focus ? `WHERE p.focusArea = '${focus}'` : ""}
GROUP BY p.programmeID, p.programmeName, p.focusArea
HAVING COUNT(pc.courseID) > 0
ORDER BY avg_course_duration DESC
LIMIT 10;


//Report 2 - Course Options by Focus Areas

The total amount of courses each focus area has and their average duration

SELECT 
    p.focusArea,
    COUNT(DISTINCT pc.courseID) AS totalCourses,
    ROUND(AVG(c.durationHours), 1) AS avgCourseDuration
    FROM tblProgramme p
    INNER JOIN tblProgrammeCourse pc 
    ON p.programmeID = pc.programmeID
    INNER JOIN tblCourse c 
    ON pc.courseID = c.courseID
    GROUP BY p.focusArea
    HAVING COUNT(pc.courseID) > 0
    ORDER BY totalCourses DESC;



//Report 3 - Region-Based Programme Coverage Report

Analysis of programme total funding per region and number of programmes across regions

SELECT 
    r.regionName,
    COUNT(DISTINCT p.programmeID) AS total_programmes,
    COALESCE(ROUND(SUM(pf.amount), 2), 0) AS total_funding,
    ROUND(
    COALESCE(SUM(pf.amount), 0) / COUNT(DISTINCT p.programmeID),
    2
    ) AS avg_funding_per_programme
    FROM tblRegion r
    LEFT JOIN tblProgramme p 
    ON r.regionID = p.regionID
    LEFT JOIN tblProgrammeFunding pf 
    ON p.programmeID = pf.programmeID
    GROUP BY r.regionID, r.regionName
    HAVING COUNT(DISTINCT p.programmeID) > 0
    ORDER BY total_funding DESC
