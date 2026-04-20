/**
 * Attendance Table - Rendering and actions for attendance table
 */
window.attendanceTable = {
    async render(programmeId) {
        const state = window.enrolmentsAppState;
        const repo = window.attendanceRepo;
        const tableColumns = window.tableColumns;
        const uiActions = window.uiActions;

        const rows = await repo.loadAttendanceData(programmeId);
        const transformedRows = window.tableTransforms.apply(rows, {
            dates: { sessionDate: 'sessionDateDisplay' },
            booleans: { attended: { displayKey: 'attendedDisplay', trueLabel: 'Yes', falseLabel: 'No' } },
        });

        window.renderTable(
            'attendance-table-container',
            [
                tableColumns.text('beneficiaryName', 'Beneficiary Name'),
                tableColumns.text('programmeName', 'Programme'),
                tableColumns.text('courseName', 'Course'),
                tableColumns.date('sessionDate', 'Session Date', 'sessionDateDisplay'),
                tableColumns.text('venue', 'Venue'),
                tableColumns.text('attendedDisplay', 'Attended'),
            ],
            transformedRows,
            uiActions.standardActions(
                (row) => window.attendanceForm.openForm(row),
                async (row) => {
                    await runQuery('DELETE FROM tblAttendance WHERE enrolmentID = ? AND sessionID = ?', [row.enrolmentID, row.sessionID]);
                    window.ui.success('Attendance record deleted successfully.');
                    await window.attendanceTable.render(state.filters.attendanceProgrammeId);
                },
                'Are you sure you want to delete this attendance record?'
            )
        );
    },
};
