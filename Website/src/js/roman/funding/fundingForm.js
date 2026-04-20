/**
 * Funding Form - Form rendering and validation for funding records
 */
window.fundingForm = {
    openForm(row = null) {
        const state = window.enrolmentsAppState;
        const fieldSchemas = window.fieldSchemas;
        const validators = window.validators;

        const fields = [
            fieldSchemas.select('programmeID', 'Programme', [{ value: '', label: 'Select programme' }, ...state.refs.programmes.map((item) => ({
                value: item.programmeID,
                label: item.programmeName,
            }))], true),
            fieldSchemas.select('sourceID', 'Funding Source', [{ value: '', label: 'Select source' }, ...state.refs.fundingSources.map((item) => ({
                value: item.sourceID,
                label: `${item.sourceName} (${item.sourceType})`,
            }))], true),
            fieldSchemas.currency('amount', 'Amount', { min: 0.01, step: 0.01, required: true }),
            fieldSchemas.date('startDate', 'Start Date', true),
            fieldSchemas.date('endDate', 'End Date', false),
        ];

        window.openForm(row ? 'Edit Funding Record' : 'Add Funding Record', fields, row || { startDate: window.fmt.today() }, async (formData) => {
            const validation = this.validate(formData);
            if (!validation.valid) {
                window.ui.error(validation.message);
                throw new Error(validation.message);
            }

            if (row) {
                await runQuery(
                    'DELETE FROM tblProgrammeFunding WHERE programmeID = ? AND sourceID = ? AND startDate = ?',
                    [row.programmeID, row.sourceID, row.startDate]
                );
            }

            await runQuery(
                'INSERT INTO tblProgrammeFunding (programmeID, sourceID, amount, startDate, endDate) VALUES (?, ?, ?, ?, ?)',
                [
                    formData.programmeID,
                    formData.sourceID,
                    Number(formData.amount),
                    formData.startDate,
                    window.fmt.emptyToNull(formData.endDate),
                ]
            );

            window.ui.success(row ? 'Funding updated successfully.' : 'Funding record created successfully.');
            window.closeForm('funding-form-panel');
            await Promise.all([window.fundingTable.render(), window.reports.fundingRiskReport.load()]);
        }, 'funding-form-panel');
    },

    validate(formData) {
        const validation = validators.combine(
            validators.currency(formData.amount, 0),
            validators.dateRange(formData.startDate, formData.endDate)
        );

        return validation.valid
            ? { valid: true }
            : validation;
    },
};
