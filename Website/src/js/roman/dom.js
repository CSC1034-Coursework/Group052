/**
 * DOM element cache for the enrolments page
 */
window.enrolmentsDom = {
    initialized: false,

    cache() {
        this.enrolmentStatusFilter = document.getElementById('enrolment-status-filter');
        this.enrolmentFocusFilter = document.getElementById('enrolment-focus-filter');
        this.attendanceProgrammeFilter = document.getElementById('attendance-programme-filter');
        this.fundingProgrammeFilter = document.getElementById('funding-programme-filter');
        this.fundingSourceTypeFilter = document.getElementById('funding-source-type-filter');
        this.scoreFocusFilter = document.getElementById('score-focus-filter');
        this.completionFocusFilter = document.getElementById('completion-focus-filter');

        this.scoreChart = document.getElementById('score-report-chart');
        this.fundingRiskChart = document.getElementById('funding-risk-report-chart');
        this.completionChart = document.getElementById('completion-attendance-report-chart');

        this.addEnrolmentButton = document.getElementById('btn-add-enrolment');
        this.addAttendanceButton = document.getElementById('btn-add-attendance');
        this.addFundingButton = document.getElementById('btn-add-funding');

        this.initialized = true;
    },
};
