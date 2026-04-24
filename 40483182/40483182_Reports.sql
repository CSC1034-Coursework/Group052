-- Report Title: Staff per region
-- Business Question: How are staff distributed across all regions and are any regions over/understaffed?
-- Why this report is useful: Displays region name and how much staff is in that region which can be used to see if certain regions have more staff than others / if staff is equally split across all regions.
-- Tables used: tblStaff, tblRegion
SELECT r.regionName, COUNT(s.staffID) AS NumberOfStaff
    FROM tblRegion r
    LEFT JOIN tblStaff s ON s.regionID = r.regionID
    ${region ? `AND r.regionID = ${region}` : ""}
    GROUP BY r.regionName
    ORDER BY r.regionName ASC;

-- Report Title: Trainer Session Workload
-- Business Question: Which trainers are being underworked and overworked in sessions?
-- Why this report is useful: Displays all staff by name and how much sessions + total minutes they have done, allowing user to see if anyone is being underutilised or overworked.
-- Tables used: tblSessionStaff, tblSession, tblStaff
SELECT CONCAT(st.firstName, ' ', st.lastName) AS FullName, ss.staffId, COUNT(s.sessionID) AS NumberOfSessions, SUM(s.durationMinutes) AS TotalMinutes, AVG(s.durationMinutes) AS AverageSessionLength
    FROM tblSessionStaff ss
    LEFT JOIN tblSession s ON ss.sessionID = s.sessionID
    INNER JOIN tblStaff st ON ss.staffID = st.StaffID
    GROUP BY ss.staffID, st.firstName, st.lastName
    HAVING SUM(s.durationMinutes) IS NOT NULL
    ORDER BY TotalMinutes DESC;

-- Report Title: Uncertified Staff lessons
-- Business Question: Which staff have no valid certification / therefore needs training?
-- Why this report is useful: Displays any staff that have a Null certification date, allowing the user to see if any staff shouldn't be doing sessions or need training.
-- Tables used: tblStaff
SELECT CONCAT(firstName, ' ', lastName) AS FullName, certifiedDate 
    FROM tblStaff
    WHERE certifiedDate IS NULL OR certifiedDate = '0000-00-00'
    ORDER BY staffID;
