/**
 * Shared state for the enrolments page
 * Holds filters, reference data, and chart instances
 */
window.enrolmentsAppState = {
    filters: {
        enrolmentStatus: 'All',
        enrolmentFocusArea: 'All',
        attendanceProgrammeId: 'All',
        scoreFocusArea: 'All',
        completionFocusArea: 'All',
    },
    refs: {
        focusAreas: [],
        beneficiaries: [],
        programmes: [],
        programmeCourses: [],
        sessions: [],
        fundingSources: [],
        enrolments: [],
    },
    charts: {
        score: null,
        fundingRisk: null,
        completion: null,
    },
};
