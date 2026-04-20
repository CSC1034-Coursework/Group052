/**
 * Enrolments Form - Form rendering and validation for enrolments
 */
window.enrolmentsForm = {
    openForm(row = null) {
        const state = window.enrolmentsAppState;
        const fieldSchemas = window.fieldSchemas;
        const validators = window.validators;

        const fields = [
            fieldSchemas.datalist('beneficiaryID', 'Beneficiary', state.refs.beneficiaries.map((item) => ({
                value: item.beneficiaryID,
                label: item.beneficiaryName,
            })), true),
            fieldSchemas.select('pcID', 'Programme-Course', [{ value: '', label: 'Select programme-course' }, ...state.refs.programmeCourses.map((item) => ({
                value: item.pcID,
                label: item.pcLabel,
            }))], true),
            fieldSchemas.date('enrolDate', 'Enrol Date', true),
            fieldSchemas.select('completionStatus', 'Completion Status', [
                { value: 'Enrolled', label: 'Enrolled' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Dropped', label: 'Dropped' },
            ], true),
            fieldSchemas.score('preAssessmentScore', 'Pre Assessment Score', false),
            fieldSchemas.score('postAssessmentScore', 'Post Assessment Score', false),
            fieldSchemas.textarea('dropReason', 'Drop Reason', false),
            fieldSchemas.checkbox('certificateIssued', 'Certificate Issued'),
        ];

        const initialData = row
            ? {
                beneficiaryID: row.beneficiaryID,
                pcID: row.pcID,
                enrolDate: window.fmt.date(row.enrolDate),
                completionStatus: row.completionStatus,
                dropReason: row.dropReason || '',
                preAssessmentScore: row.preAssessmentScore,
                postAssessmentScore: row.postAssessmentScore,
                certificateIssued: Number(row.certificateIssued) === 1,
            }
            : {
                enrolDate: window.fmt.today(),
                completionStatus: 'Enrolled',
                certificateIssued: false,
            };

        const form = window.openForm(row ? 'Edit Enrolment' : 'Add Enrolment', fields, initialData, async (formData) => {
            const validation = this.validate(formData);
            if (!validation.valid) {
                window.ui.error(validation.message);
                throw new Error(validation.message);
            }

            if (row) {
                await runQuery(
                    `UPDATE tblEnrolment
                    SET beneficiaryID = ?, pcID = ?, enrolDate = ?, completionStatus = ?, dropReason = ?,
                        preAssessmentScore = ?, postAssessmentScore = ?, certificateIssued = ?
                    WHERE enrolmentID = ?`,
                    [
                        formData.beneficiaryID,
                        formData.pcID,
                        formData.enrolDate,
                        formData.completionStatus,
                        formData.completionStatus === 'Dropped' ? window.fmt.emptyToNull(formData.dropReason) : null,
                        window.fmt.emptyToNull(formData.preAssessmentScore),
                        window.fmt.emptyToNull(formData.postAssessmentScore),
                        formData.completionStatus === 'Completed' && formData.certificateIssued ? 1 : 0,
                        row.enrolmentID,
                    ]
                );
                window.ui.success('Enrolment updated successfully.');
            } else {
                await runQuery(
                    `INSERT INTO tblEnrolment
                    (beneficiaryID, pcID, enrolDate, completionStatus, dropReason, preAssessmentScore, postAssessmentScore, certificateIssued)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        formData.beneficiaryID,
                        formData.pcID,
                        formData.enrolDate,
                        formData.completionStatus,
                        formData.completionStatus === 'Dropped' ? window.fmt.emptyToNull(formData.dropReason) : null,
                        window.fmt.emptyToNull(formData.preAssessmentScore),
                        window.fmt.emptyToNull(formData.postAssessmentScore),
                        formData.completionStatus === 'Completed' && formData.certificateIssued ? 1 : 0,
                    ]
                );
                window.ui.success('Enrolment created successfully.');
            }

            window.closeForm('form-panel');
            await Promise.all([
                window.enrolmentsTable.render(state.filters.enrolmentStatus, state.filters.enrolmentFocusArea),
                window.attendanceTable.render(state.filters.attendanceProgrammeId),
                window.reports.completionReport.load(state.filters.completionFocusArea),
                window.reports.scoreReport.load(state.filters.scoreFocusArea),
            ]);
        }, 'form-panel');

        if (form) {
            const statusElement = form.elements.namedItem('completionStatus');
            const dropReasonElement = form.elements.namedItem('dropReason');
            const certificateElement = form.elements.namedItem('certificateIssued');

            const syncStatusBehaviour = () => {
                const status = statusElement.value;

                if (status !== 'Dropped') {
                    dropReasonElement.value = '';
                    dropReasonElement.disabled = true;
                } else {
                    dropReasonElement.disabled = false;
                }

                if (status !== 'Completed') {
                    certificateElement.checked = false;
                }
            };

            statusElement.addEventListener('change', syncStatusBehaviour);
            syncStatusBehaviour();
        }
    },

    validate(formData) {
        const validation = validators.combine(
            validators.required(formData.beneficiaryID, 'Beneficiary'),
            validators.required(formData.pcID, 'Programme-course'),
            validators.conditional(formData.completionStatus === 'Dropped', validators.required, formData.dropReason, 'Drop Reason'),
            validators.conditional(formData.certificateIssued && formData.completionStatus !== 'Completed', () => ({
                valid: false,
                message: 'Certificate can only be issued for Completed status.',
            })),
            validators.score(formData.preAssessmentScore),
            validators.score(formData.postAssessmentScore)
        );

        if (!validation.valid) {
            return validation;
        }

        return { valid: true };
    },
};
