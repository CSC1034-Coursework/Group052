/**
 * Funding Table - Rendering and actions for funding table
 */
window.fundingTable = {
    async render(programmeID, sourceType) {
        const repo = window.fundingRepo;
        const tableColumns = window.tableColumns;
        const uiActions = window.uiActions;
        const dom = window.enrolmentsDom;

        // Default filter values
        programmeID = programmeID || 'All';
        sourceType = sourceType || 'All';

        // Update filter UI
        if (dom.fundingProgrammeFilter) {
            dom.fundingProgrammeFilter.value = programmeID;
        }
        if (dom.fundingSourceTypeFilter) {
            dom.fundingSourceTypeFilter.value = sourceType;
        }

        // Populate programme dropdown if empty
        if (dom.fundingProgrammeFilter && dom.fundingProgrammeFilter.children.length === 1) {
            const programmes = await repo.loadProgrammes();
            programmes.forEach((prog) => {
                const option = document.createElement('option');
                option.value = prog.programmeID;
                option.textContent = prog.programmeName;
                dom.fundingProgrammeFilter.appendChild(option);
            });
        }

        const rows = await repo.loadFundingData(programmeID, sourceType);
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
                    await Promise.all([window.fundingTable.render(programmeID, sourceType), window.reports.fundingRiskReport.load()]);
                },
                'Are you sure you want to delete this funding record?'
            )
        );
    },
};
