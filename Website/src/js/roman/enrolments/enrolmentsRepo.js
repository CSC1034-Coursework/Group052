/**
 * Enrolments Repository - Database queries for enrolments
 */
window.enrolmentsRepo = {
    async loadEnrolmentsData(status, focusArea) {
        return selectRows(
            `SELECT
                e.enrolmentID,
                e.beneficiaryID,
                e.pcID,
                e.enrolDate,
                e.completionStatus,
                e.dropReason,
                e.preAssessmentScore,
                e.postAssessmentScore,
                e.certificateIssued,
                CONCAT(b.firstName, ' ', b.lastName) AS beneficiaryName,
                p.programmeName,
                p.focusArea,
                c.courseName
            FROM tblEnrolment e
            INNER JOIN tblBeneficiary b ON b.beneficiaryID = e.beneficiaryID
            INNER JOIN tblProgrammeCourse pc ON pc.pcID = e.pcID
            INNER JOIN tblProgramme p ON p.programmeID = pc.programmeID
            INNER JOIN tblCourse c ON c.courseID = pc.courseID
            WHERE (? = 'All' OR e.completionStatus = ?)
              AND (? = 'All' OR p.focusArea = ?)
            ORDER BY e.enrolDate DESC, e.enrolmentID DESC`,
            [status, status, focusArea, focusArea]
        );
    },
};
