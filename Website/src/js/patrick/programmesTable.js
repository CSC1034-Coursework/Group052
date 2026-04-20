/**
 * Programmes Table - Rendering and actions for programmes table
 */
window.programmesTable = {
    async render() {
        const state = window.programmesAppState;
        const repo = window.programmesRepo;
        const tableColumns = window.tableColumns;
        const uiActions = window.uiActions;

        const rows = await repo.loadProgrammesData();
        state.programmes = rows;

        const transformedRows = window.tableTransforms.apply(rows, {
            dates: { startDate: 'startDateDisplay', endDate: 'endDateDisplay' },
        }).map((row) => ({
            ...row,
            endDateDisplay: row.endDateDisplay || '-',
        }));

        window.renderTable(
            'programmes-table-container',
            [
                tableColumns.text('programmeName', 'Programme Name'),
                tableColumns.text('regionID', 'Region ID'),
                tableColumns.text('teamID', 'Team ID'),
                tableColumns.date('startDate', 'Start Date', 'startDateDisplay'),
                tableColumns.date('endDate', 'End Date', 'endDateDisplay'),
                tableColumns.text('budget', 'Budget'),
                tableColumns.text('objectives', 'Objectives'),
                tableColumns.text('statusID', 'Status ID'),
                tableColumns.text('focusArea', 'Focus Area'),
            ],
            transformedRows,
            uiActions.standardActions(
                (row) => window.programmesForm.openForm(row),
                async (row) => {
                    await runQuery('DELETE FROM tblProgramme WHERE programmeID = ?', [row.programmeID]);
                    window.ui.success('Programme deleted successfully.');
                    await window.programmesTable.render();
                },
                'Are you sure you want to delete this programme?'
            )
        );
    },
};
