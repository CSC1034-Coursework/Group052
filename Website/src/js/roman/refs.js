/**
 * Reference data loader - loads all lookup tables from the database
 */
window.enrolmentsAppRefs = {
    async load() {
        const state = window.enrolmentsAppState;
        const dom = window.enrolmentsDom;

        const [focusAreas, beneficiaries, programmes, programmeCourses, sessions, fundingSources] = await Promise.all([
            selectRows('SELECT DISTINCT focusArea FROM tblProgramme ORDER BY focusArea'),
            selectRows("SELECT beneficiaryID, CONCAT(firstName, ' ', lastName) AS beneficiaryName FROM tblBeneficiary ORDER BY lastName, firstName"),
            selectRows('SELECT programmeID, programmeName, focusArea FROM tblProgramme ORDER BY programmeName'),
            selectRows("SELECT pc.pcID, p.programmeID, p.programmeName, p.focusArea, c.courseName, CONCAT(p.programmeName, ' - ', c.courseName) AS pcLabel FROM tblProgrammeCourse pc INNER JOIN tblProgramme p ON p.programmeID = pc.programmeID INNER JOIN tblCourse c ON c.courseID = pc.courseID ORDER BY p.programmeName, c.courseName"),
            selectRows("SELECT s.sessionID, s.pcID, s.sessionDate, s.venue, p.programmeID, p.programmeName, CONCAT(DATE_FORMAT(s.sessionDate, '%Y-%m-%d'), ' - ', s.venue) AS sessionLabel FROM tblSession s INNER JOIN tblProgrammeCourse pc ON pc.pcID = s.pcID INNER JOIN tblProgramme p ON p.programmeID = pc.programmeID ORDER BY s.sessionDate DESC"),
            selectRows('SELECT sourceID, sourceName, sourceType FROM tblFundingSource WHERE isActive = 1 ORDER BY sourceName'),
        ]);

        state.refs.focusAreas = focusAreas;
        state.refs.beneficiaries = beneficiaries;
        state.refs.programmes = programmes;
        state.refs.programmeCourses = programmeCourses;
        state.refs.sessions = sessions;
        state.refs.fundingSources = fundingSources;

        // Populate dropdowns
        window.ui.populateSelect(dom.enrolmentFocusFilter, focusAreas, 'focusArea', 'focusArea', true);
        window.ui.populateSelect(dom.scoreFocusFilter, focusAreas, 'focusArea', 'focusArea', true);
        window.ui.populateSelect(dom.completionFocusFilter, focusAreas, 'focusArea', 'focusArea', true);
        window.ui.populateSelect(dom.attendanceProgrammeFilter, programmes, 'programmeID', 'programmeName', true);
    },
};
