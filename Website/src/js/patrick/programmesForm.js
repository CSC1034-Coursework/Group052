/**
 * Programmes Form - Form rendering and validation for programmes
 */
window.programmesForm = {
    openForm(row = null) {
        const fieldSchemas = window.fieldSchemas;
        const validators = window.validators;
        const state = window.programmesAppState;

        const fields = [
            fieldSchemas.text('programmeName', 'Programme Name', true),
            fieldSchemas.select('regionID', 'Region', [{ value: '', label: 'Select region' }, ...state.refs.regions.map((item) => ({
                value: item.regionID,
                label: item.regionName,
            }))], true),
            fieldSchemas.select('teamID', 'Team', [{ value: '', label: 'Select team' }, ...state.refs.teams.map((item) => ({
                value: item.teamID,
                label: item.teamName,
            }))], true),
            fieldSchemas.date('startDate', 'Start Date', true),
            fieldSchemas.date('endDate', 'End Date', false),
            fieldSchemas.number('budget', 'Budget', { min: 0, required: false }),
            fieldSchemas.textarea('objectives', 'Objectives', true),
            fieldSchemas.select('statusID', 'Status', [{ value: '', label: 'Select status' }, ...state.refs.statuses.map((item) => ({
                value: item.statusID,
                label: item.statusName,
            }))], true),
            fieldSchemas.select('focusArea', 'Focus Area', [
                { value: '', label: 'Select focus area' },
                { value: 'Child Marriage', label: 'Child Marriage' },
                { value: 'FGM', label: 'FGM' },
                { value: 'Economic Empowerment', label: 'Economic Empowerment' },
                { value: 'Political Participation', label: 'Political Participation' },
                { value: 'Anti-Violence', label: 'Anti-Violence' },
            ], true),
        ];

        const initialData = row ? { ...row } : { startDate: window.fmt.today() };

        window.openForm(row ? 'Edit Programme' : 'Add Programme', fields, initialData, async (formData) => {
            const validation = this.validate(formData);
            if (!validation.valid) {
                window.ui.error(validation.message);
                throw new Error(validation.message);
            }

            if (row) {
                await runQuery(
                    `UPDATE tblProgramme
                    SET programmeName = ?, regionID = ?, teamID = ?, startDate = ?, endDate = ?,
                        budget = ?, objectives = ?, statusID = ?, focusArea = ?
                    WHERE programmeID = ?`,
                    [
                        formData.programmeName,
                        formData.regionID,
                        formData.teamID,
                        formData.startDate,
                        window.fmt.emptyToNull(formData.endDate),
                        window.fmt.emptyToNull(formData.budget),
                        formData.objectives,
                        formData.statusID,
                        formData.focusArea,
                        row.programmeID,
                    ]
                );
                window.ui.success('Programme updated successfully.');
            } else {
                await runQuery(
                    `INSERT INTO tblProgramme (programmeName, regionID, teamID, startDate, endDate, budget, objectives, statusID, focusArea)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        formData.programmeName,
                        formData.regionID,
                        formData.teamID,
                        formData.startDate,
                        window.fmt.emptyToNull(formData.endDate),
                        window.fmt.emptyToNull(formData.budget),
                        formData.objectives,
                        formData.statusID,
                        formData.focusArea,
                    ]
                );
                window.ui.success('Programme created successfully.');
            }

            window.closeForm('programmes-form-panel');
            await window.programmesTable.render();
        }, 'programmes-form-panel');
    },

    validate(formData) {
        const validation = window.validators.combine(
            window.validators.required(formData.programmeName, 'Programme Name'),
            window.validators.required(formData.regionID, 'Region'),
            window.validators.required(formData.teamID, 'Team'),
            window.validators.required(formData.startDate, 'Start Date'),
            window.validators.required(formData.objectives, 'Objectives'),
            window.validators.required(formData.statusID, 'Status'),
            window.validators.required(formData.focusArea, 'Focus Area'),
            window.validators.conditional(formData.endDate && formData.startDate, () => {
                if (new Date(formData.endDate) <= new Date(formData.startDate)) {
                    return { valid: false, message: 'End Date must be after Start Date or empty.' };
                }
                return { valid: true };
            })
        );

        return validation.valid ? { valid: true } : validation;
    },
};
