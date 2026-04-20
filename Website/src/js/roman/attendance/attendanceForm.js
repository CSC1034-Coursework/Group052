/**
 * Attendance Form - Form rendering for attendance records
 */
window.attendanceForm = {
    openForm(row = null) {
        const state = window.enrolmentsAppState;
        const fieldSchemas = window.fieldSchemas;

        const enrolmentOptions = state.refs.enrolments.map((item) => ({
            value: item.enrolmentID,
            label: `${item.beneficiaryName} - ${item.programmeName} / ${item.courseName}`,
        }));

        const filteredSessions = state.filters.attendanceProgrammeId === 'All'
            ? state.refs.sessions
            : state.refs.sessions.filter((item) => String(item.programmeID) === String(state.filters.attendanceProgrammeId));

        const fields = [
            fieldSchemas.select('enrolmentID', 'Enrolment', [{ value: '', label: 'Select enrolment' }, ...enrolmentOptions], true),
            fieldSchemas.select('sessionID', 'Session', [{ value: '', label: 'Select session' }, ...filteredSessions.map((item) => ({
                value: item.sessionID,
                label: item.sessionLabel,
            }))], true),
            fieldSchemas.checkbox('attended', 'Attended'),
        ];

        window.openForm(row ? 'Edit Attendance' : 'Add Attendance', fields, row || { attended: true }, async (formData) => {
            if (!formData.enrolmentID || !formData.sessionID) {
                const message = 'Both enrolment and session are required.';
                window.ui.error(message);
                throw new Error(message);
            }

            if (row) {
                await runQuery(
                    'DELETE FROM tblAttendance WHERE enrolmentID = ? AND sessionID = ?',
                    [row.enrolmentID, row.sessionID]
                );
            }

            await runQuery(
                'INSERT INTO tblAttendance (enrolmentID, sessionID, attended) VALUES (?, ?, ?)',
                [formData.enrolmentID, formData.sessionID, formData.attended ? 1 : 0]
            );

            window.ui.success(row ? 'Attendance updated successfully.' : 'Attendance created successfully.');
            window.closeForm('attendance-form-panel');
            await window.attendanceTable.render(state.filters.attendanceProgrammeId);
        }, 'attendance-form-panel');
    },
};
