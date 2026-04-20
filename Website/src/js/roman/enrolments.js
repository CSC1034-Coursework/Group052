(() => {
    const state = {
        filters: {
            enrolmentStatus: 'All',
            enrolmentFocusArea: 'All',
            attendanceProgrammeId: 'All',
            scoreFocusArea: 'All',
            completionFocusArea: 'All',
        },
        refs: {
            focusAreas: [],
            beneficiaries: [],
            programmes: [],
            programmeCourses: [],
            sessions: [],
            fundingSources: [],
            enrolments: [],
        },
        charts: {
            score: null,
            fundingRisk: null,
            completion: null,
        },
    };

    const dom = {};

    document.addEventListener('DOMContentLoaded', init);
    document.addEventListener('components:loaded', init);

    function init() {
        if (!document.querySelector('.enrolments-page')) {
            return;
        }

        if (dom.initialized) {
            return;
        }

        dom.initialized = true;
        cacheDom();
        bindEvents();
        void bootstrap();
    }

    function cacheDom() {
        dom.enrolmentStatusFilter = document.getElementById('enrolment-status-filter');
        dom.enrolmentFocusFilter = document.getElementById('enrolment-focus-filter');
        dom.attendanceProgrammeFilter = document.getElementById('attendance-programme-filter');
        dom.scoreFocusFilter = document.getElementById('score-focus-filter');
        dom.completionFocusFilter = document.getElementById('completion-focus-filter');

        dom.scoreChart = document.getElementById('score-report-chart');
        dom.fundingRiskChart = document.getElementById('funding-risk-report-chart');
        dom.completionChart = document.getElementById('completion-attendance-report-chart');

        dom.addEnrolmentButton = document.getElementById('btn-add-enrolment');
        dom.addAttendanceButton = document.getElementById('btn-add-attendance');
        dom.addFundingButton = document.getElementById('btn-add-funding');
    }

    function bindEvents() {
        dom.enrolmentStatusFilter?.addEventListener('change', () => {
            state.filters.enrolmentStatus = dom.enrolmentStatusFilter.value;
            void loadEnrolments();
        });

        dom.enrolmentFocusFilter?.addEventListener('change', () => {
            state.filters.enrolmentFocusArea = dom.enrolmentFocusFilter.value;
            void loadEnrolments();
        });

        dom.attendanceProgrammeFilter?.addEventListener('change', () => {
            state.filters.attendanceProgrammeId = dom.attendanceProgrammeFilter.value;
            void loadAttendance();
        });

        dom.scoreFocusFilter?.addEventListener('change', () => {
            state.filters.scoreFocusArea = dom.scoreFocusFilter.value;
            void loadScoreReport();
        });

        dom.completionFocusFilter?.addEventListener('change', () => {
            state.filters.completionFocusArea = dom.completionFocusFilter.value;
            void loadCompletionReport();
        });

        dom.addEnrolmentButton?.addEventListener('click', () => openEnrolmentForm());
        dom.addAttendanceButton?.addEventListener('click', () => openAttendanceForm());
        dom.addFundingButton?.addEventListener('click', () => openFundingForm());
    }

    async function bootstrap() {
        await loadReferenceData();
        await Promise.all([
            loadEnrolments(),
            loadAttendance(),
            loadFunding(),
            loadScoreReport(),
            loadFundingRiskReport(),
            loadCompletionReport(),
        ]);
    }

    async function loadReferenceData() {
        const [focusAreas, beneficiaries, programmes, programmeCourses, sessions, fundingSources] = await Promise.all([
            selectRows('SELECT DISTINCT focusArea FROM tblProgramme ORDER BY focusArea'),
            selectRows("SELECT beneficiaryID, CONCAT(firstName, ' ', lastName) AS beneficiaryName FROM tblBeneficiary ORDER BY lastName, firstName"),
            selectRows('SELECT programmeID, programmeName, focusArea FROM tblProgramme ORDER BY programmeName'),
            selectRows("SELECT pc.pcID, p.programmeID, p.programmeName, p.focusArea, c.courseName, CONCAT(p.programmeName, ' - ', c.courseName) AS pcLabel FROM tblProgrammeCourse pc INNER JOIN tblProgramme p ON p.programmeID = pc.programmeID INNER JOIN tblCourse c ON c.courseID = pc.courseID ORDER BY p.programmeName, c.courseName"),
            selectRows("SELECT s.sessionID, s.pcID, s.sessionDate, s.venue, p.programmeID, p.programmeName, CONCAT(DATE_FORMAT(s.sessionDate, '%Y-%m-%d'), ' - ', s.venue) AS sessionLabel FROM tblSession s INNER JOIN tblProgrammeCourse pc ON pc.pcID = s.pcID INNER JOIN tblProgramme p ON p.programmeID = pc.programmeID ORDER BY s.sessionDate DESC"),
            selectRows('SELECT sourceID, sourceName, sourceType FROM tblFundingSource WHERE isActive = 1 ORDER BY sourceName'),
        ]);

        state.refs.focusAreas = focusAreas;
        state.refs.beneficiaries = beneficiaries;
        state.refs.programmes = programmes;
        state.refs.programmeCourses = programmeCourses;
        state.refs.sessions = sessions;
        state.refs.fundingSources = fundingSources;

        populateSelect(dom.enrolmentFocusFilter, focusAreas, 'focusArea', 'focusArea', true);
        populateSelect(dom.scoreFocusFilter, focusAreas, 'focusArea', 'focusArea', true);
        populateSelect(dom.completionFocusFilter, focusAreas, 'focusArea', 'focusArea', true);
        populateSelect(dom.attendanceProgrammeFilter, programmes, 'programmeID', 'programmeName', true);
    }

    function populateSelect(selectElement, rows, valueKey, labelKey, includeAll) {
        if (!selectElement) {
            return;
        }

        const previousValue = selectElement.value;
        selectElement.innerHTML = '';

        if (includeAll) {
            const allOption = document.createElement('option');
            allOption.value = 'All';
            allOption.textContent = 'All';
            selectElement.appendChild(allOption);
        }

        rows.forEach((row) => {
            const option = document.createElement('option');
            option.value = String(row[valueKey]);
            option.textContent = row[labelKey];
            selectElement.appendChild(option);
        });

        if ([...selectElement.options].some((option) => option.value === previousValue)) {
            selectElement.value = previousValue;
        }
    }

    async function loadEnrolments() {
        const rows = await selectRows(
            `SELECT
                e.enrolmentID,
                e.beneficiaryID,
                e.pcID,
                e.enrolDate,
                e.completionStatus,
                e.dropReason,
                e.preAssessmentScore,
                e.postAssessmentScore,
                e.certificateIssued,
                CONCAT(b.firstName, ' ', b.lastName) AS beneficiaryName,
                p.programmeName,
                p.focusArea,
                c.courseName
            FROM tblEnrolment e
            INNER JOIN tblBeneficiary b ON b.beneficiaryID = e.beneficiaryID
            INNER JOIN tblProgrammeCourse pc ON pc.pcID = e.pcID
            INNER JOIN tblProgramme p ON p.programmeID = pc.programmeID
            INNER JOIN tblCourse c ON c.courseID = pc.courseID
            WHERE (? = 'All' OR e.completionStatus = ?)
              AND (? = 'All' OR p.focusArea = ?)
            ORDER BY e.enrolDate DESC, e.enrolmentID DESC`,
            [
                state.filters.enrolmentStatus,
                state.filters.enrolmentStatus,
                state.filters.enrolmentFocusArea,
                state.filters.enrolmentFocusArea,
            ]
        );

        state.refs.enrolments = rows;

        renderTable(
            'enrolments-table-container',
            [
                { key: 'beneficiaryName', label: 'Beneficiary Name' },
                { key: 'programmeName', label: 'Programme' },
                { key: 'courseName', label: 'Course' },
                { key: 'enrolDateDisplay', label: 'Enrol Date' },
                { key: 'completionStatus', label: 'Status' },
                { key: 'preScoreDisplay', label: 'Pre Score' },
                { key: 'postScoreDisplay', label: 'Post Score' },
                { key: 'certificateDisplay', label: 'Certificate' },
            ],
            rows.map((row) => ({
                ...row,
                enrolDateDisplay: formatDate(row.enrolDate),
                preScoreDisplay: nullableScore(row.preAssessmentScore),
                postScoreDisplay: nullableScore(row.postAssessmentScore),
                certificateDisplay: Number(row.certificateIssued) === 1 ? 'Yes' : 'No',
            })),
            [
                {
                    label: 'Edit',
                    className: 'btn btn--outline',
                    onClick: (row) => openEnrolmentForm(row),
                },
                {
                    label: 'Delete',
                    className: 'btn btn--outline',
                    onClick: async (row) => {
                        const ok = await confirmAction('Are you sure you want to remove this enrolment? Attendance records will also be deleted.');
                        if (!ok) {
                            return;
                        }

                        await runQuery('DELETE FROM tblEnrolment WHERE enrolmentID = ?', [row.enrolmentID]);
                        showSuccess('Enrolment deleted successfully.');
                        await Promise.all([loadEnrolments(), loadAttendance(), loadCompletionReport()]);
                    },
                },
            ]
        );
    }

    function openEnrolmentForm(row = null) {
        const fields = [
            {
                name: 'beneficiaryID',
                label: 'Beneficiary',
                type: 'datalist',
                required: true,
                options: state.refs.beneficiaries.map((item) => ({
                    value: item.beneficiaryID,
                    label: item.beneficiaryName,
                })),
            },
            {
                name: 'pcID',
                label: 'Programme-Course',
                type: 'select',
                required: true,
                options: [{ value: '', label: 'Select programme-course' }, ...state.refs.programmeCourses.map((item) => ({
                    value: item.pcID,
                    label: item.pcLabel,
                }))],
            },
            {
                name: 'enrolDate',
                label: 'Enrol Date',
                type: 'date',
                required: true,
            },
            {
                name: 'completionStatus',
                label: 'Completion Status',
                type: 'select',
                required: true,
                options: [
                    { value: 'Enrolled', label: 'Enrolled' },
                    { value: 'Completed', label: 'Completed' },
                    { value: 'Dropped', label: 'Dropped' },
                ],
            },
            {
                name: 'dropReason',
                label: 'Drop Reason',
                type: 'textarea',
                required: false,
            },
            {
                name: 'preAssessmentScore',
                label: 'Pre Assessment Score',
                type: 'number',
                min: 0,
                max: 100,
                required: false,
            },
            {
                name: 'postAssessmentScore',
                label: 'Post Assessment Score',
                type: 'number',
                min: 0,
                max: 100,
                required: false,
            },
            {
                name: 'certificateIssued',
                label: 'Certificate Issued',
                type: 'checkbox',
                required: false,
            },
        ];

        const initialData = row
            ? {
                beneficiaryID: row.beneficiaryID,
                pcID: row.pcID,
                enrolDate: formatDate(row.enrolDate),
                completionStatus: row.completionStatus,
                dropReason: row.dropReason || '',
                preAssessmentScore: row.preAssessmentScore,
                postAssessmentScore: row.postAssessmentScore,
                certificateIssued: Number(row.certificateIssued) === 1,
            }
            : {
                enrolDate: getTodayDate(),
                completionStatus: 'Enrolled',
                certificateIssued: false,
            };

        const form = openForm(row ? 'Edit Enrolment' : 'Add Enrolment', fields, initialData, async (formData) => {
            const validation = validateEnrolment(formData);
            if (!validation.valid) {
                showError(validation.message);
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
                        formData.completionStatus === 'Dropped' ? emptyToNull(formData.dropReason) : null,
                        emptyToNull(formData.preAssessmentScore),
                        emptyToNull(formData.postAssessmentScore),
                        formData.completionStatus === 'Completed' && formData.certificateIssued ? 1 : 0,
                        row.enrolmentID,
                    ]
                );
                showSuccess('Enrolment updated successfully.');
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
                        formData.completionStatus === 'Dropped' ? emptyToNull(formData.dropReason) : null,
                        emptyToNull(formData.preAssessmentScore),
                        emptyToNull(formData.postAssessmentScore),
                        formData.completionStatus === 'Completed' && formData.certificateIssued ? 1 : 0,
                    ]
                );
                showSuccess('Enrolment created successfully.');
            }

            closeForm();
            await Promise.all([loadEnrolments(), loadAttendance(), loadCompletionReport(), loadScoreReport()]);
        });

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
                    certificateElement.disabled = true;
                } else {
                    certificateElement.disabled = false;
                }
            };

            statusElement.addEventListener('change', syncStatusBehaviour);
            syncStatusBehaviour();
        }
    }

    function validateEnrolment(formData) {
        if (!formData.beneficiaryID) {
            return { valid: false, message: 'Please select a beneficiary from the list.' };
        }

        if (!formData.pcID) {
            return { valid: false, message: 'Programme-course is required.' };
        }

        if (formData.completionStatus === 'Dropped' && !String(formData.dropReason || '').trim()) {
            return { valid: false, message: 'Drop Reason is required when status is Dropped.' };
        }

        if (formData.certificateIssued && formData.completionStatus !== 'Completed') {
            return { valid: false, message: 'Certificate can only be issued for Completed status.' };
        }

        if (!isValidOptionalScore(formData.preAssessmentScore)) {
            return { valid: false, message: 'Pre Assessment Score must be between 0 and 100.' };
        }

        if (!isValidOptionalScore(formData.postAssessmentScore)) {
            return { valid: false, message: 'Post Assessment Score must be between 0 and 100.' };
        }

        return { valid: true };
    }

    async function loadAttendance() {
        const rows = await selectRows(
            `SELECT
                a.enrolmentID,
                a.sessionID,
                a.attended,
                CONCAT(b.firstName, ' ', b.lastName) AS beneficiaryName,
                p.programmeID,
                p.programmeName,
                c.courseName,
                s.sessionDate,
                s.venue
            FROM tblAttendance a
            INNER JOIN tblEnrolment e ON e.enrolmentID = a.enrolmentID
            INNER JOIN tblBeneficiary b ON b.beneficiaryID = e.beneficiaryID
            INNER JOIN tblProgrammeCourse pc ON pc.pcID = e.pcID
            INNER JOIN tblProgramme p ON p.programmeID = pc.programmeID
            INNER JOIN tblCourse c ON c.courseID = pc.courseID
            INNER JOIN tblSession s ON s.sessionID = a.sessionID
            WHERE (? = 'All' OR p.programmeID = ?)
            ORDER BY s.sessionDate DESC`,
            [state.filters.attendanceProgrammeId, state.filters.attendanceProgrammeId]
        );

        renderTable(
            'attendance-table-container',
            [
                { key: 'beneficiaryName', label: 'Beneficiary Name' },
                { key: 'sessionDateDisplay', label: 'Session Date' },
                { key: 'venue', label: 'Venue' },
                { key: 'attendedDisplay', label: 'Attended' },
            ],
            rows.map((row) => ({
                ...row,
                sessionDateDisplay: formatDate(row.sessionDate),
                attendedDisplay: Number(row.attended) === 1 ? 'Yes' : 'No',
            })),
            [
                {
                    label: 'Edit',
                    className: 'btn btn--outline',
                    onClick: (row) => openAttendanceForm(row),
                },
                {
                    label: 'Delete',
                    className: 'btn btn--outline',
                    onClick: async (row) => {
                        const ok = await confirmAction('Are you sure you want to delete this attendance record?');
                        if (!ok) {
                            return;
                        }

                        await runQuery('DELETE FROM tblAttendance WHERE enrolmentID = ? AND sessionID = ?', [row.enrolmentID, row.sessionID]);
                        showSuccess('Attendance record deleted successfully.');
                        await loadAttendance();
                    },
                },
            ]
        );
    }

    function openAttendanceForm(row = null) {
        const enrolmentOptions = state.refs.enrolments.map((item) => ({
            value: item.enrolmentID,
            label: `${item.beneficiaryName} - ${item.programmeName} / ${item.courseName}`,
        }));

        const filteredSessions = state.filters.attendanceProgrammeId === 'All'
            ? state.refs.sessions
            : state.refs.sessions.filter((item) => String(item.programmeID) === String(state.filters.attendanceProgrammeId));

        const fields = [
            {
                name: 'enrolmentID',
                label: 'Enrolment',
                type: 'select',
                required: true,
                options: [{ value: '', label: 'Select enrolment' }, ...enrolmentOptions],
            },
            {
                name: 'sessionID',
                label: 'Session',
                type: 'select',
                required: true,
                options: [{ value: '', label: 'Select session' }, ...filteredSessions.map((item) => ({
                    value: item.sessionID,
                    label: item.sessionLabel,
                }))],
            },
            {
                name: 'attended',
                label: 'Attended',
                type: 'checkbox',
                required: false,
            },
        ];

        openForm(row ? 'Edit Attendance' : 'Add Attendance', fields, row || { attended: true }, async (formData) => {
            if (!formData.enrolmentID || !formData.sessionID) {
                const message = 'Both enrolment and session are required.';
                showError(message);
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

            showSuccess(row ? 'Attendance updated successfully.' : 'Attendance created successfully.');
            closeForm();
            await loadAttendance();
        });
    }

    async function loadFunding() {
        const rows = await selectRows(
            `SELECT
                pf.programmeID,
                pf.sourceID,
                pf.amount,
                pf.startDate,
                pf.endDate,
                p.programmeName,
                fs.sourceName,
                fs.sourceType
            FROM tblProgrammeFunding pf
            INNER JOIN tblProgramme p ON p.programmeID = pf.programmeID
            INNER JOIN tblFundingSource fs ON fs.sourceID = pf.sourceID
            ORDER BY pf.startDate DESC`
        );

        renderTable(
            'funding-table-container',
            [
                { key: 'programmeName', label: 'Programme' },
                { key: 'sourceName', label: 'Funding Source' },
                { key: 'sourceType', label: 'Source Type' },
                { key: 'amountDisplay', label: 'Amount (£)' },
                { key: 'startDateDisplay', label: 'Start Date' },
                { key: 'endDateDisplay', label: 'End Date' },
            ],
            rows.map((row) => ({
                ...row,
                amountDisplay: Number(row.amount).toFixed(2),
                startDateDisplay: formatDate(row.startDate),
                endDateDisplay: row.endDate ? formatDate(row.endDate) : '-',
            })),
            [
                {
                    label: 'Edit',
                    className: 'btn btn--outline',
                    onClick: (row) => openFundingForm(row),
                },
                {
                    label: 'Delete',
                    className: 'btn btn--outline',
                    onClick: async (row) => {
                        const ok = await confirmAction('Are you sure you want to delete this funding record?');
                        if (!ok) {
                            return;
                        }

                        await runQuery(
                            'DELETE FROM tblProgrammeFunding WHERE programmeID = ? AND sourceID = ? AND startDate = ?',
                            [row.programmeID, row.sourceID, row.startDate]
                        );

                        showSuccess('Funding record deleted successfully.');
                        await Promise.all([loadFunding(), loadFundingRiskReport()]);
                    },
                },
            ]
        );
    }

    function openFundingForm(row = null) {
        const fields = [
            {
                name: 'programmeID',
                label: 'Programme',
                type: 'select',
                required: true,
                options: [{ value: '', label: 'Select programme' }, ...state.refs.programmes.map((item) => ({
                    value: item.programmeID,
                    label: item.programmeName,
                }))],
            },
            {
                name: 'sourceID',
                label: 'Funding Source',
                type: 'select',
                required: true,
                options: [{ value: '', label: 'Select source' }, ...state.refs.fundingSources.map((item) => ({
                    value: item.sourceID,
                    label: `${item.sourceName} (${item.sourceType})`,
                }))],
            },
            {
                name: 'amount',
                label: 'Amount',
                type: 'number',
                min: 0.01,
                step: 0.01,
                required: true,
            },
            {
                name: 'startDate',
                label: 'Start Date',
                type: 'date',
                required: true,
            },
            {
                name: 'endDate',
                label: 'End Date',
                type: 'date',
                required: false,
            },
        ];

        openForm(row ? 'Edit Funding Record' : 'Add Funding Record', fields, row || { startDate: getTodayDate() }, async (formData) => {
            const validation = validateFunding(formData);
            if (!validation.valid) {
                showError(validation.message);
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
                    emptyToNull(formData.endDate),
                ]
            );

            showSuccess(row ? 'Funding updated successfully.' : 'Funding record created successfully.');
            closeForm();
            await Promise.all([loadFunding(), loadFundingRiskReport()]);
        });
    }

    function validateFunding(formData) {
        const amount = Number(formData.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            return { valid: false, message: 'Amount must be greater than 0.' };
        }

        if (formData.endDate && formData.endDate < formData.startDate) {
            return { valid: false, message: 'End Date must be the same or after Start Date.' };
        }

        return { valid: true };
    }

    async function loadScoreReport() {
        const rows = await selectRows(
            `SELECT *
            FROM vw_score_improvement
            WHERE avg_improvement IS NOT NULL
              AND (focusArea = ? OR ? = 'All')
              AND avg_improvement > 0
            ORDER BY avg_improvement DESC
            LIMIT 20`,
            [state.filters.scoreFocusArea, state.filters.scoreFocusArea]
        );

        renderTable(
            'score-report-table',
            [
                { key: 'programmeName', label: 'Programme' },
                { key: 'courseName', label: 'Course' },
                { key: 'genderName', label: 'Gender' },
                { key: 'total_enrolled', label: 'Enrolled' },
                { key: 'avg_pre', label: 'Avg Pre' },
                { key: 'avg_post', label: 'Avg Post' },
                { key: 'avgImprovementDisplay', label: 'Avg Improvement', isHtml: true },
            ],
            rows.map((row) => ({
                ...row,
                avgImprovementDisplay: `<strong>${Number(row.avg_improvement).toFixed(1)}</strong>`,
            })),
            []
        );

        renderScoreChart(rows);
    }

    function renderScoreChart(rows) {
        if (typeof Chart === 'undefined' || !dom.scoreChart) {
            return;
        }

        if (state.charts.score) {
            state.charts.score.destroy();
        }

        const labels = Array.from(new Set(rows.map((row) => `${row.programmeName} - ${row.courseName}`)));
        const genders = Array.from(new Set(rows.map((row) => row.genderName)));

        const datasets = genders.map((gender, index) => {
            const data = labels.map((label) => {
                const row = rows.find((item) => `${item.programmeName} - ${item.courseName}` === label && item.genderName === gender);
                return row ? Number(row.avg_improvement) : 0;
            });

            const palette = ['#2459b8', '#0f6b2a', '#b08006', '#d94d4d', '#5f5f5f'];
            return {
                label: gender,
                data,
                backgroundColor: palette[index % palette.length],
            };
        });

        state.charts.score = new Chart(dom.scoreChart, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                indexAxis: 'y',
                responsive: true,
                scales: {
                    x: { beginAtZero: true, title: { display: true, text: 'Avg Improvement' } },
                },
            },
        });
    }

    async function loadFundingRiskReport() {
        const rows = await selectRows('SELECT * FROM vw_funding_risk ORDER BY funding_gap DESC, programmeName');

        renderTable(
            'funding-risk-report-table',
            [
                { key: 'programmeName', label: 'Programme' },
                { key: 'focusArea', label: 'Focus Area' },
                { key: 'regionName', label: 'Region' },
                { key: 'budgetDisplay', label: 'Budget' },
                { key: 'fundedDisplay', label: 'Funded' },
                { key: 'gapDisplay', label: 'Gap' },
                { key: 'costDisplay', label: 'Cost/Enrolment' },
                { key: 'statusDisplay', label: 'Status', isHtml: true },
            ],
            rows.map((row) => ({
                ...row,
                budgetDisplay: Number(row.budget || 0).toFixed(2),
                fundedDisplay: Number(row.total_funded || 0).toFixed(2),
                gapDisplay: Number(row.funding_gap || 0).toFixed(2),
                costDisplay: row.cost_per_enrolment === null ? '-' : Number(row.cost_per_enrolment).toFixed(2),
                statusDisplay: row.funding_status === 'AT RISK'
                    ? '<span style="background:#d94d4d;color:#ffffff;padding:3px 8px;border-radius:5px;display:inline-block;">AT RISK</span>'
                    : '<span class="badge badge--sdg">Funded</span>',
            })),
            []
        );

        renderFundingRiskChart(rows);
    }

    function renderFundingRiskChart(rows) {
        if (typeof Chart === 'undefined' || !dom.fundingRiskChart) {
            return;
        }

        if (state.charts.fundingRisk) {
            state.charts.fundingRisk.destroy();
        }

        const totalFunded = rows.reduce((sum, row) => sum + Number(row.total_funded || 0), 0);
        const totalGap = rows.reduce((sum, row) => sum + Number(row.funding_gap || 0), 0);
        const totalBudget = rows.reduce((sum, row) => sum + Number(row.budget || 0), 0);

        state.charts.fundingRisk = new Chart(dom.fundingRiskChart, {
            type: 'doughnut',
            data: {
                labels: ['Total Funded', 'Funding Gap'],
                datasets: [{
                    data: [totalFunded, totalGap],
                    backgroundColor: ['#0f6b2a', '#d94d4d'],
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                },
            },
            plugins: [{
                id: 'centreLabel',
                afterDraw(chart) {
                    const { ctx, chartArea } = chart;
                    if (!chartArea) {
                        return;
                    }

                    const x = (chartArea.left + chartArea.right) / 2;
                    const y = (chartArea.top + chartArea.bottom) / 2;

                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#161616';
                    ctx.font = '14px Arial';
                    ctx.fillText(`Budget ${totalBudget.toFixed(2)}`, x, y);
                    ctx.restore();
                },
            }],
        });
    }

    async function loadCompletionReport() {
        const rows = await selectRows(
            `SELECT *
            FROM vw_completion_attendance
            WHERE (focusArea = ? OR ? = 'All')
            ORDER BY completion_rate_pct ASC
            LIMIT 15`,
            [state.filters.completionFocusArea, state.filters.completionFocusArea]
        );

        renderTable(
            'completion-attendance-report-table',
            [
                { key: 'programmeName', label: 'Programme' },
                { key: 'focusArea', label: 'Focus Area' },
                { key: 'regionName', label: 'Region' },
                { key: 'total_enrolled', label: 'Enrolled' },
                { key: 'completed', label: 'Completed' },
                { key: 'dropped', label: 'Dropped' },
                { key: 'completion_rate_pct', label: 'Completion %' },
                { key: 'attendance_rate_pct', label: 'Attendance %' },
            ],
            rows,
            []
        );

        renderCompletionChart(rows);
    }

    function renderCompletionChart(rows) {
        if (typeof Chart === 'undefined' || !dom.completionChart) {
            return;
        }

        if (state.charts.completion) {
            state.charts.completion.destroy();
        }

        const regionMap = new Map();

        rows.forEach((row) => {
            const key = row.regionName;
            if (!regionMap.has(key)) {
                regionMap.set(key, { completed: 0, dropped: 0, enrolled: 0 });
            }

            const agg = regionMap.get(key);
            const completed = Number(row.completed || 0);
            const dropped = Number(row.dropped || 0);
            const total = Number(row.total_enrolled || 0);
            const stillEnrolled = Math.max(total - completed - dropped, 0);

            agg.completed += completed;
            agg.dropped += dropped;
            agg.enrolled += stillEnrolled;
        });

        const labels = Array.from(regionMap.keys());
        const completedData = labels.map((label) => regionMap.get(label).completed);
        const droppedData = labels.map((label) => regionMap.get(label).dropped);
        const enrolledData = labels.map((label) => regionMap.get(label).enrolled);

        state.charts.completion = new Chart(dom.completionChart, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    { label: 'Completed', data: completedData, backgroundColor: '#0f6b2a' },
                    { label: 'Dropped', data: droppedData, backgroundColor: '#d94d4d' },
                    { label: 'Still Enrolled', data: enrolledData, backgroundColor: '#6d6d6d' },
                ],
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                scales: {
                    x: { stacked: true, beginAtZero: true },
                    y: { stacked: true },
                },
            },
        });
    }

    function nullableScore(value) {
        return value === null || value === undefined || value === '' ? '-' : String(value);
    }

    function isValidOptionalScore(value) {
        if (value === null || value === undefined || value === '') {
            return true;
        }

        const num = Number(value);
        return Number.isFinite(num) && num >= 0 && num <= 100;
    }

    function emptyToNull(value) {
        return value === '' || value === undefined ? null : value;
    }

    function getTodayDate() {
        const now = new Date();
        const month = `${now.getMonth() + 1}`.padStart(2, '0');
        const day = `${now.getDate()}`.padStart(2, '0');
        return `${now.getFullYear()}-${month}-${day}`;
    }

    function formatDate(value) {
        if (!value) {
            return '';
        }

        if (typeof value === 'string' && value.length >= 10) {
            return value.slice(0, 10);
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '';
        }

        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${date.getFullYear()}-${month}-${day}`;
    }
})();
