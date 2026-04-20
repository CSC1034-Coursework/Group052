/**
 * Funding Table - Rendering and actions for funding table
 */
window.fundingTable = {
    async render() {
        const repo = window.fundingRepo;
        const tableColumns = window.tableColumns;
        const uiActions = window.uiActions;

        const rows = await repo.loadFundingData();
        const transformedRows = window.tableTransforms.apply(rows, {
            dates: { startDate: 'startDateDisplay', endDate: 'endDateDisplay' },
            currencies: ['amount'],
        }).map((row) => ({
            ...row,
            endDateDisplay: row.endDateDisplay || '-',
        }));

        window.renderTable(
            'funding-table-container',
            [
                tableColumns.text('programmeName', 'Programme'),
                tableColumns.text('sourceName', 'Funding Source'),
                tableColumns.text('sourceType', 'Source Type'),
                tableColumns.currency('amount', 'Amount (£)', 'amountDisplay'),
                tableColumns.date('startDate', 'Start Date', 'startDateDisplay'),
                tableColumns.date('endDate', 'End Date', 'endDateDisplay'),
            ],
            transformedRows,
            uiActions.standardActions(
                (row) => window.fundingForm.openForm(row),
                async (row) => {
                    await runQuery(
                        'DELETE FROM tblProgrammeFunding WHERE programmeID = ? AND sourceID = ? AND startDate = ?',
                        [row.programmeID, row.sourceID, row.startDate]
                    );

                    window.ui.success('Funding record deleted successfully.');
                    await Promise.all([window.fundingTable.render(), window.reports.fundingRiskReport.load()]);
                },
                'Are you sure you want to delete this funding record?'
            )
        );
    },
};
