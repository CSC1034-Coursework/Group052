/**
 * Enrolments Page Controller - Main orchestrator for page initialization and event binding
 */
(() => {
    const dom = window.enrolmentsDom;
    const state = window.enrolmentsAppState;
    const refs = window.enrolmentsAppRefs;

    document.addEventListener('DOMContentLoaded', init);
    document.addEventListener('components:loaded', init);

    function init() {
        if (!document.querySelector('.enrolments-page')) {
            return;
        }

        if (dom.initialized) {
            return;
        }

        dom.cache();
        bindEvents();
        void bootstrap();
    }

    function bindEvents() {
        dom.enrolmentStatusFilter?.addEventListener('change', () => {
            state.filters.enrolmentStatus = dom.enrolmentStatusFilter.value;
            void window.enrolmentsTable.render(state.filters.enrolmentStatus, state.filters.enrolmentFocusArea);
        });

        dom.enrolmentFocusFilter?.addEventListener('change', () => {
            state.filters.enrolmentFocusArea = dom.enrolmentFocusFilter.value;
            void window.enrolmentsTable.render(state.filters.enrolmentStatus, state.filters.enrolmentFocusArea);
        });

        dom.attendanceProgrammeFilter?.addEventListener('change', () => {
            state.filters.attendanceProgrammeId = dom.attendanceProgrammeFilter.value;
            void window.attendanceTable.render(state.filters.attendanceProgrammeId);
        });

        dom.fundingProgrammeFilter?.addEventListener('change', () => {
            state.filters.fundingProgrammeId = dom.fundingProgrammeFilter.value;
            void window.fundingTable.render(state.filters.fundingProgrammeId, state.filters.fundingSourceType);
        });

        dom.fundingSourceTypeFilter?.addEventListener('change', () => {
            state.filters.fundingSourceType = dom.fundingSourceTypeFilter.value;
            void window.fundingTable.render(state.filters.fundingProgrammeId, state.filters.fundingSourceType);
        });

        dom.scoreFocusFilter?.addEventListener('change', () => {
            state.filters.scoreFocusArea = dom.scoreFocusFilter.value;
            void window.reports.scoreReport.load(state.filters.scoreFocusArea);
        });

        dom.completionFocusFilter?.addEventListener('change', () => {
            state.filters.completionFocusArea = dom.completionFocusFilter.value;
            void window.reports.completionReport.load(state.filters.completionFocusArea);
        });

        dom.addEnrolmentButton?.addEventListener('click', () => window.enrolmentsForm.openForm());
        dom.addAttendanceButton?.addEventListener('click', () => window.attendanceForm.openForm());
        dom.addFundingButton?.addEventListener('click', () => window.fundingForm.openForm());
    }

    async function bootstrap() {
        await refs.load();
        await Promise.all([
            window.enrolmentsTable.render(state.filters.enrolmentStatus, state.filters.enrolmentFocusArea),
            window.attendanceTable.render(state.filters.attendanceProgrammeId),
            window.fundingTable.render(state.filters.fundingProgrammeId, state.filters.fundingSourceType),
            window.reports.scoreReport.load(state.filters.scoreFocusArea),
            window.reports.fundingRiskReport.load(),
            window.reports.completionReport.load(state.filters.completionFocusArea),
        ]);
    }
})();
