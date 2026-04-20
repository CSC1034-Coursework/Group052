/**
 * Enrolments Table - Rendering and actions for enrolments table
 */
window.enrolmentsTable = {
    async render(status, focusArea) {
        const state = window.enrolmentsAppState;
        const repo = window.enrolmentsRepo;
        const tableColumns = window.tableColumns;
        const tableTransforms = window.tableTransforms;
        const uiActions = window.uiActions;

        const rows = await repo.loadEnrolmentsData(status, focusArea);
        state.refs.enrolments = rows;
        const transformedRows = tableTransforms.apply(rows, {
            dates: { enrolDate: 'enrolDateDisplay' },
            booleans: { certificateIssued: { displayKey: 'certificateDisplay', trueLabel: 'Yes', falseLabel: 'No' } },
        }).map((row) => ({
            ...row,
            preScoreDisplay: window.fmt.nullableScore(row.preAssessmentScore),
            postScoreDisplay: window.fmt.nullableScore(row.postAssessmentScore),
        }));

        window.renderTable(
            'enrolments-table-container',
            [
                tableColumns.text('beneficiaryName', 'Beneficiary Name'),
                tableColumns.text('programmeName', 'Programme'),
                tableColumns.text('courseName', 'Course'),
                tableColumns.date('enrolDate', 'Enrol Date', 'enrolDateDisplay'),
                tableColumns.text('completionStatus', 'Status'),
                tableColumns.text('preScoreDisplay', 'Pre Score'),
                tableColumns.text('postScoreDisplay', 'Post Score'),
                tableColumns.text('certificateDisplay', 'Certificate'),
            ],
            transformedRows,
            uiActions.standardActions(
                (row) => window.enrolmentsForm.openForm(row),
                async (row) => {
                    await runQuery('DELETE FROM tblEnrolment WHERE enrolmentID = ?', [row.enrolmentID]);
                    window.ui.success('Enrolment deleted successfully.');
                    await Promise.all([
                        window.enrolmentsTable.render(state.filters.enrolmentStatus, state.filters.enrolmentFocusArea),
                        window.attendanceTable.render(state.filters.attendanceProgrammeId),
                        window.reports.completionReport.load(state.filters.completionFocusArea),
                    ]);
                },
                'Are you sure you want to remove this enrolment? Attendance records will also be deleted.'
            )
        );
    },
};
