/**
 * Attendance Repository - Database queries for attendance
 */
window.attendanceRepo = {
    async loadAttendanceData(programmeId) {
        return selectRows(
            `SELECT
                a.enrolmentID,
                a.sessionID,
                a.attended,
                CONCAT(b.firstName, ' ', b.lastName) AS beneficiaryName,
                p.programmeID,
                p.programmeName,
                c.courseName,
                s.sessionDate,
                s.venue
            FROM tblAttendance a
            INNER JOIN tblEnrolment e ON e.enrolmentID = a.enrolmentID
            INNER JOIN tblBeneficiary b ON b.beneficiaryID = e.beneficiaryID
            INNER JOIN tblProgrammeCourse pc ON pc.pcID = e.pcID
            INNER JOIN tblProgramme p ON p.programmeID = pc.programmeID
            INNER JOIN tblCourse c ON c.courseID = pc.courseID
            INNER JOIN tblSession s ON s.sessionID = a.sessionID
            WHERE (? = 'All' OR p.programmeID = ?)
            ORDER BY s.sessionDate DESC`,
            [programmeId, programmeId]
        );
    },
};
