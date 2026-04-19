(() => {
	const state = {
		initialized: false,
		modal: null,
		enrolments: {
			loaded: false,
			loading: false,
			rows: [],
		},
		funding: {
			loaded: false,
			loading: false,
			rows: [],
		},
		reports: {
			score: { loaded: false, loading: false, filter: 'All', rows: [], chart: null },
			coverage: { loaded: false, loading: false, filter: 'All', rows: [], chart: null },
			dropout: { loaded: false, loading: false, filter: 'All', rows: [], chart: null },
		},
	};

	const dom = {};

	document.addEventListener('DOMContentLoaded', init);
	document.addEventListener('components:loaded', init);

	function init() {
		if (state.initialized) {
			return;
		}

		if (!document.querySelector('.enrolments-page')) {
			return;
		}

		state.initialized = true;
		cacheDom();
		bindEvents();
		setDefaultDate();
		updateEnrolmentDropReasonVisibility();

		void bootstrap();
	}

	async function bootstrap() {
		await loadSelectOptions();
		await Promise.all([
			loadEnrolments(),
			loadFundingSources(),
			loadAllReports(),
		]);
	}

	function cacheDom() {
		dom.enrolmentsTable = document.getElementById('enrolments-table-container');
		dom.fundingTable = document.getElementById('funding-table-container');

		dom.enrolmentForm = document.getElementById('enrolment-form');
		dom.fundingForm = document.getElementById('funding-form');

		dom.enrolmentBeneficiary = document.getElementById('enrolment-beneficiary');
		dom.enrolmentProgrammeCourse = document.getElementById('enrolment-programme-course');
		dom.enrolmentDate = document.getElementById('enrolment-date');
		dom.enrolmentPreScore = document.getElementById('enrolment-pre-score');
		dom.enrolmentStatus = document.getElementById('enrolment-status');
		dom.enrolmentDropReasonGroup = document.getElementById('enrolment-dropReason-group');
		dom.enrolmentDropReason = document.getElementById('enrolment-dropReason');

		dom.fundingSourceName = document.getElementById('funding-source-name');
		dom.fundingSourceType = document.getElementById('funding-source-type');
		dom.fundingContactEmail = document.getElementById('funding-contact-email');
		dom.fundingActive = document.getElementById('funding-active');

		dom.scoreFilter = document.getElementById('score-filter');
		dom.coverageFilter = document.getElementById('coverage-filter');
		dom.dropoutFilter = document.getElementById('dropout-filter');

		dom.scoreTable = document.getElementById('score-report-table');
		dom.coverageTable = document.getElementById('coverage-report-table');
		dom.dropoutTable = document.getElementById('dropout-report-table');

		dom.scoreChart = document.getElementById('score-report-chart');
		dom.coverageChart = document.getElementById('coverage-report-chart');
		dom.dropoutChart = document.getElementById('dropout-report-chart');

		dom.modalRoot = document.getElementById('modal-root');
		dom.toastRoot = document.getElementById('toast-root');
	}

	function bindEvents() {
		if (dom.enrolmentForm) {
			dom.enrolmentForm.addEventListener('submit', handleEnrolmentCreate);
		}

		if (dom.fundingForm) {
			dom.fundingForm.addEventListener('submit', handleFundingCreate);
		}

		if (dom.enrolmentStatus) {
			dom.enrolmentStatus.addEventListener('change', updateEnrolmentDropReasonVisibility);
		}

		if (dom.enrolmentsTable) {
			dom.enrolmentsTable.addEventListener('click', handleEnrolmentsTableClick);
		}

		if (dom.fundingTable) {
			dom.fundingTable.addEventListener('click', handleFundingTableClick);
		}

		if (dom.scoreFilter) {
			state.reports.score.filter = dom.scoreFilter.value || 'All';
			dom.scoreFilter.addEventListener('change', () => {
				state.reports.score.filter = dom.scoreFilter.value || 'All';
				loadScoreReport(true);
			});
		}

		if (dom.coverageFilter) {
			state.reports.coverage.filter = dom.coverageFilter.value || 'All';
			dom.coverageFilter.addEventListener('change', () => {
				state.reports.coverage.filter = dom.coverageFilter.value || 'All';
				loadCoverageReport(true);
			});
		}

		if (dom.dropoutFilter) {
			state.reports.dropout.filter = dom.dropoutFilter.value || 'All';
			dom.dropoutFilter.addEventListener('change', () => {
				state.reports.dropout.filter = dom.dropoutFilter.value || 'All';
				loadDropoutReport(true);
			});
		}

		bindFieldClearHandlers(dom.enrolmentForm);
		bindFieldClearHandlers(dom.fundingForm);
	}

	function bindFieldClearHandlers(form) {
		if (!form) {
			return;
		}

		form.querySelectorAll('[data-error-for]').forEach((node) => {
			const fieldName = node.dataset.errorFor;
			const field = form.elements.namedItem(fieldName);

			if (!field || typeof field.addEventListener !== 'function') {
				return;
			}

			field.addEventListener('input', () => clearFieldError(form, fieldName));
			field.addEventListener('change', () => clearFieldError(form, fieldName));
		});
	}

	async function loadSelectOptions() {
		await Promise.all([
			loadBeneficiaryOptions(),
			loadProgrammeCourseOptions(),
			loadProgrammeStatusOptions(),
			loadFocusAreaOptions(),
		]);
	}

	async function loadBeneficiaryOptions() {
		const rows = await selectRows(
			"SELECT beneficiaryID, CONCAT(firstName, ' ', lastName) AS label FROM tblBeneficiary ORDER BY lastName, firstName"
		);
		populateSelect(dom.enrolmentBeneficiary, rows, 'beneficiaryID', 'label', 'Select beneficiary');
	}

	async function loadProgrammeCourseOptions() {
		const rows = await selectRows(
			"SELECT pc.pcID, CONCAT(p.programmeName, ' — ', c.courseName) AS label FROM tblProgrammeCourse pc INNER JOIN tblProgramme p ON p.programmeID = pc.programmeID INNER JOIN tblCourse c ON c.courseID = pc.courseID ORDER BY p.programmeName, c.courseName"
		);
		populateSelect(dom.enrolmentProgrammeCourse, rows, 'pcID', 'label', 'Select programme-course');
	}

	async function loadProgrammeStatusOptions() {
		const rows = await selectRows('SELECT statusID, statusName FROM tblProgrammeStatus ORDER BY statusName');
		populateSelect(dom.coverageFilter, rows, 'statusID', 'statusName', 'All Statuses', 'All');
	}

	async function loadFocusAreaOptions() {
		const rows = await selectRows('SELECT DISTINCT focusArea AS label FROM tblProgramme ORDER BY focusArea');
		populateSelect(dom.dropoutFilter, rows, 'label', 'label', 'All', 'All');
	}

	function populateSelect(select, rows, valueKey, labelKey, placeholder, placeholderValue = '') {
		if (!select) {
			return;
		}

		const currentValue = select.value;
		select.innerHTML = '';

		const placeholderOption = document.createElement('option');
		placeholderOption.value = placeholderValue;
		placeholderOption.textContent = placeholder;
		select.appendChild(placeholderOption);

		rows.forEach((row) => {
			const option = document.createElement('option');
			option.value = row[valueKey];
			option.textContent = row[labelKey];
			select.appendChild(option);
		});

		if (currentValue) {
			select.value = currentValue;
		}
	}

	function setDefaultDate() {
		if (!dom.enrolmentDate) {
			return;
		}

		const today = toDateInputValue(new Date());
		dom.enrolmentDate.value = today;
		dom.enrolmentDate.max = today;
	}

	function updateEnrolmentDropReasonVisibility() {
		if (!dom.enrolmentStatus || !dom.enrolmentDropReasonGroup) {
			return;
		}

		const isDropped = dom.enrolmentStatus.value === 'Dropped';
		dom.enrolmentDropReasonGroup.hidden = !isDropped;

		if (!isDropped && dom.enrolmentDropReason) {
			dom.enrolmentDropReason.value = '';
			clearFieldError(dom.enrolmentForm, 'dropReason');
		}
	}

	async function loadEnrolments(force = false) {
		if (state.enrolments.loading) {
			return;
		}

		if (state.enrolments.loaded && !force) {
			renderEnrolmentsTable(state.enrolments.rows);
			return;
		}

		state.enrolments.loading = true;

		try {
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
					c.courseName
				FROM tblEnrolment e
				INNER JOIN tblBeneficiary b ON b.beneficiaryID = e.beneficiaryID
				INNER JOIN tblProgrammeCourse pc ON pc.pcID = e.pcID
				INNER JOIN tblProgramme p ON p.programmeID = pc.programmeID
				INNER JOIN tblCourse c ON c.courseID = pc.courseID
				ORDER BY e.enrolDate DESC, e.enrolmentID DESC`
			);

			state.enrolments.rows = rows;
			state.enrolments.loaded = true;
			renderEnrolmentsTable(rows);
		} catch (error) {
			renderMessage(dom.enrolmentsTable, error.message);
		} finally {
			state.enrolments.loading = false;
		}
	}

	function renderEnrolmentsTable(rows) {
		renderTable(
			dom.enrolmentsTable,
			['ID', 'Beneficiary', 'Programme', 'Course', 'Date', 'Status', 'Pre-score', 'Post-score', 'Certificate', 'Actions'],
			rows,
			(row) => `
				<tr>
					<td>${escapeHtml(row.enrolmentID)}</td>
					<td>${escapeHtml(row.beneficiaryName)}</td>
					<td>${escapeHtml(row.programmeName)}</td>
					<td>${escapeHtml(row.courseName)}</td>
					<td>${escapeHtml(formatDateDisplay(row.enrolDate))}</td>
					<td>${escapeHtml(row.completionStatus)}</td>
					<td>${escapeHtml(formatCellNumber(row.preAssessmentScore))}</td>
					<td>${escapeHtml(formatCellNumber(row.postAssessmentScore))}</td>
					<td>${Number(row.certificateIssued) ? 'Yes' : 'No'}</td>
					<td>
						<button type="button" class="btn btn--outline" data-action="edit-enrolment" data-enrolment-id="${escapeHtml(row.enrolmentID)}">Edit</button>
						<button type="button" class="btn btn--outline" data-action="delete-enrolment" data-enrolment-id="${escapeHtml(row.enrolmentID)}">Delete</button>
					</td>
				</tr>
			`,
			'No enrolments found.'
		);
	}

	function handleEnrolmentsTableClick(event) {
		const button = event.target.closest('[data-action]');

		if (!button) {
			return;
		}

		const enrolmentID = button.dataset.enrolmentId;

		if (button.dataset.action === 'edit-enrolment') {
			openEditEnrolmentModal(enrolmentID);
		}

		if (button.dataset.action === 'delete-enrolment') {
			confirmDeleteEnrolment(enrolmentID);
		}
	}

	function openEditEnrolmentModal(enrolmentID) {
		const row = state.enrolments.rows.find((item) => String(item.enrolmentID) === String(enrolmentID));

		if (!row) {
			return;
		}

		const dialog = openModal(`
			<div class="modal-dialog__header">
				<h2 class="modal-dialog__title">Edit Enrolment #${escapeHtml(row.enrolmentID)}</h2>
				<button type="button" class="modal-dialog__close" aria-label="Close modal" data-modal-close>&times;</button>
			</div>
			<div class="modal-dialog__body">
				<form data-edit-form novalidate>
					<div class="form-grid">
						<div class="form-field">
							<label>Beneficiary</label>
							<input type="text" value="${escapeHtml(row.beneficiaryName)}" disabled />
						</div>
						<div class="form-field">
							<label>Programme</label>
							<input type="text" value="${escapeHtml(row.programmeName)}" disabled />
						</div>
						<div class="form-field">
							<label>Course</label>
							<input type="text" value="${escapeHtml(row.courseName)}" disabled />
						</div>
						<div class="form-field">
							<label for="edit-enrolment-status">Completion status</label>
							<select id="edit-enrolment-status" data-edit-status name="completionStatus">
								<option value="Enrolled">Enrolled</option>
								<option value="Completed">Completed</option>
								<option value="Dropped">Dropped</option>
							</select>
							<p class="field-error" data-error-for="completionStatus"></p>
						</div>
					</div>

					<div class="form-field" data-edit-drop-group hidden>
						<label for="edit-drop-reason">Drop reason</label>
						<textarea id="edit-drop-reason" data-edit-drop name="dropReason" rows="3"></textarea>
						<p class="field-error" data-error-for="dropReason"></p>
					</div>

					<div class="form-grid">
						<div class="form-field" data-edit-post-group hidden>
							<label for="edit-post-score">Post-assessment score</label>
							<input id="edit-post-score" data-edit-post name="postAssessmentScore" type="number" min="0" max="100" />
							<p class="field-error" data-error-for="postAssessmentScore"></p>
						</div>
						<div class="form-field form-field--inline" data-edit-cert-group hidden>
							<label for="edit-certificate">Certificate issued</label>
							<input id="edit-certificate" data-edit-cert name="certificateIssued" type="checkbox" />
							<p class="field-error" data-error-for="certificateIssued"></p>
						</div>
					</div>

					<div class="form-actions">
						<button type="button" class="btn btn--outline" data-modal-close>Cancel</button>
						<button type="submit" class="btn btn--primary" data-modal-submit>Save Changes</button>
					</div>
					<p class="form-feedback" data-modal-feedback></p>
				</form>
			</div>
		`, (modal) => {
			const form = modal.querySelector('[data-edit-form]');
			const statusSelect = modal.querySelector('[data-edit-status]');
			const dropGroup = modal.querySelector('[data-edit-drop-group]');
			const postGroup = modal.querySelector('[data-edit-post-group]');
			const certGroup = modal.querySelector('[data-edit-cert-group]');
			const dropReason = modal.querySelector('[data-edit-drop]');
			const postScore = modal.querySelector('[data-edit-post]');
			const certificateIssued = modal.querySelector('[data-edit-cert]');
			const submitButton = modal.querySelector('[data-modal-submit]');
			const cancelButton = modal.querySelectorAll('[data-modal-close]')[1] || modal.querySelector('[data-modal-close]');
			const feedback = modal.querySelector('[data-modal-feedback]');

			statusSelect.value = row.completionStatus || 'Enrolled';
			dropReason.value = row.dropReason || '';
			postScore.value = row.postAssessmentScore ?? '';
			certificateIssued.checked = Boolean(Number(row.certificateIssued));

			const syncVisibility = () => {
				const status = statusSelect.value;
				const isDropped = status === 'Dropped';
				const isCompleted = status === 'Completed';

				dropGroup.hidden = !isDropped;
				postGroup.hidden = !isCompleted;
				certGroup.hidden = !isCompleted;

				if (!isDropped) {
					clearFieldError(form, 'dropReason');
				}

				if (!isCompleted) {
					clearFieldError(form, 'postAssessmentScore');
					clearFieldError(form, 'certificateIssued');
				}
			};

			statusSelect.addEventListener('change', syncVisibility);
			syncVisibility();

			form.addEventListener('submit', async (event) => {
				event.preventDefault();
				clearFormErrors(form);
				setFeedbackNode(feedback, '', '');
				setButtonLoading(submitButton, true);
				cancelButton.disabled = true;

				const values = {
					completionStatus: statusSelect.value,
					dropReason: dropReason.value.trim(),
					postAssessmentScore: postScore.value,
					certificateIssued: certificateIssued.checked,
				};

				const validation = validateEnrolmentEdit(values);
				if (!validation.valid) {
					renderInlineErrors(form, validation.errors);
					setFeedbackNode(feedback, validation.message, 'error');
					setButtonLoading(submitButton, false);
					cancelButton.disabled = false;
					return;
				}

				try {
					await runQuery(
						'UPDATE tblEnrolment SET completionStatus = ?, dropReason = ?, postAssessmentScore = ?, certificateIssued = ? WHERE enrolmentID = ?',
						[
							values.completionStatus,
							values.completionStatus === 'Dropped' ? values.dropReason : null,
							values.completionStatus === 'Completed' ? Number(values.postAssessmentScore) : null,
							values.completionStatus === 'Completed' && values.certificateIssued ? 1 : 0,
							enrolmentID,
						]
					);

					setFeedbackNode(feedback, 'Enrolment updated successfully.', 'success');
					showToast('Enrolment updated successfully.');
					closeModal();
					await loadEnrolments(true);
				} catch (error) {
					setFeedbackNode(feedback, error.message, 'error');
					showToast(error.message, 'error');
					setButtonLoading(submitButton, false);
					cancelButton.disabled = false;
				}
			});

			return form;
		});

		return dialog;
	}

	function validateEnrolmentEdit(values) {
		const errors = {};

		if (values.completionStatus === 'Dropped' && !values.dropReason) {
			errors.dropReason = 'Drop reason is required for dropped enrolments.';
		}

		if (values.completionStatus === 'Completed') {
			const score = Number(values.postAssessmentScore);
			if (!Number.isFinite(score) || score < 0 || score > 100) {
				errors.postAssessmentScore = 'Post-assessment score must be between 0 and 100.';
			}
		}

		if (values.certificateIssued && values.completionStatus !== 'Completed') {
			errors.certificateIssued = 'Certificate can only be issued for completed enrolments.';
		}

		if (Object.keys(errors).length) {
			return { valid: false, errors, message: 'Please correct the highlighted fields.' };
		}

		return { valid: true, errors: {}, message: '' };
	}

	async function handleEnrolmentCreate(event) {
		event.preventDefault();

		const submitButton = event.submitter || dom.enrolmentForm.querySelector('button[type="submit"]');
		clearFeedback('enrolment');
		clearFormErrors(dom.enrolmentForm);
		setButtonLoading(submitButton, true);

		const values = {
			beneficiaryID: dom.enrolmentBeneficiary.value,
			pcID: dom.enrolmentProgrammeCourse.value,
			enrolDate: dom.enrolmentDate.value,
			preAssessmentScore: dom.enrolmentPreScore.value,
			completionStatus: dom.enrolmentStatus.value,
			dropReason: dom.enrolmentDropReason.value.trim(),
		};

		const validation = validateEnrolmentCreate(values);
		if (!validation.valid) {
			renderInlineErrors(dom.enrolmentForm, validation.errors);
			setFeedback('enrolment', validation.message, 'error');
			setButtonLoading(submitButton, false);
			return;
		}

		try {
			await runQuery(
				'INSERT INTO tblEnrolment (beneficiaryID, pcID, enrolDate, completionStatus, dropReason, preAssessmentScore, certificateIssued) VALUES (?, ?, ?, ?, ?, ?, ?)',
				[
					values.beneficiaryID,
					values.pcID,
					values.enrolDate,
					values.completionStatus,
					values.completionStatus === 'Dropped' ? values.dropReason : null,
					values.preAssessmentScore === '' ? null : Number(values.preAssessmentScore),
					0,
				]
			);

			dom.enrolmentForm.reset();
			setDefaultDate();
			dom.enrolmentStatus.value = 'Enrolled';
			updateEnrolmentDropReasonVisibility();
			setFeedback('enrolment', 'Enrolment saved successfully.', 'success');
			showToast('Enrolment registered successfully.');
			await loadEnrolments(true);
		} catch (error) {
			setFeedback('enrolment', error.message, 'error');
			showToast(error.message, 'error');
		} finally {
			setButtonLoading(submitButton, false);
		}
	}

	function validateEnrolmentCreate(values) {
		const errors = {};

		if (!values.beneficiaryID) {
			errors.beneficiaryID = 'Select a beneficiary.';
		}

		if (!values.pcID) {
			errors.pcID = 'Select a programme-course.';
		}

		if (!values.enrolDate) {
			errors.enrolDate = 'Choose an enrolment date.';
		}

		if (values.preAssessmentScore !== '') {
			const score = Number(values.preAssessmentScore);
			if (!Number.isFinite(score) || score < 0 || score > 100) {
				errors.preAssessmentScore = 'Pre-assessment score must be between 0 and 100.';
			}
		}

		if (values.completionStatus === 'Dropped' && !values.dropReason) {
			errors.dropReason = 'Drop reason is required for dropped enrolments.';
		}

		if (Object.keys(errors).length) {
			return { valid: false, errors, message: 'Please correct the highlighted fields.' };
		}

		return { valid: true, errors: {}, message: '' };
	}

	function confirmDeleteEnrolment(enrolmentID) {
		openConfirmModal('Delete Enrolment', 'Delete this enrolment? This cannot be undone.', async () => {
			await runQuery('DELETE FROM tblEnrolment WHERE enrolmentID = ?', [enrolmentID]);
			state.enrolments.rows = state.enrolments.rows.filter((row) => String(row.enrolmentID) !== String(enrolmentID));
			renderEnrolmentsTable(state.enrolments.rows);
			showToast('Enrolment deleted successfully.');
		});
	}

	async function loadFundingSources(force = false) {
		if (state.funding.loading) {
			return;
		}

		if (state.funding.loaded && !force) {
			renderFundingTable(state.funding.rows);
			return;
		}

		state.funding.loading = true;

		try {
			const rows = await selectRows(
				'SELECT sourceID, sourceName, sourceType, contactEmail, isActive, createdAt FROM tblFundingSource ORDER BY sourceName'
			);

			state.funding.rows = rows;
			state.funding.loaded = true;
			renderFundingTable(rows);
		} catch (error) {
			renderMessage(dom.fundingTable, error.message);
		} finally {
			state.funding.loading = false;
		}
	}

	function renderFundingTable(rows) {
		renderTable(
			dom.fundingTable,
			['ID', 'Name', 'Type', 'Contact email', 'Status', 'Created', 'Actions'],
			rows,
			(row) => `
				<tr data-source-id="${escapeHtml(row.sourceID)}" data-is-active="${Number(row.isActive)}">
					<td>${escapeHtml(row.sourceID)}</td>
					<td>${escapeHtml(row.sourceName)}</td>
					<td>${escapeHtml(row.sourceType)}</td>
					<td>${escapeHtml(row.contactEmail || '—')}</td>
					<td>${Number(row.isActive) ? 'Active' : 'Inactive'}</td>
					<td>${escapeHtml(formatDateDisplay(row.createdAt))}</td>
					<td>
						<button type="button" class="btn btn--outline" data-action="toggle-funding" data-source-id="${escapeHtml(row.sourceID)}">Toggle Active</button>
						<button type="button" class="btn btn--outline" data-action="delete-funding" data-source-id="${escapeHtml(row.sourceID)}">Delete</button>
					</td>
				</tr>
			`,
			'No funding sources found.'
		);
	}

	function handleFundingTableClick(event) {
		const button = event.target.closest('[data-action]');

		if (!button) {
			return;
		}

		const sourceID = button.dataset.sourceId;

		if (button.dataset.action === 'toggle-funding') {
			toggleFundingSource(sourceID);
		}

		if (button.dataset.action === 'delete-funding') {
			confirmDeleteFunding(sourceID);
		}
	}

	async function toggleFundingSource(sourceID) {
		try {
			await runQuery('UPDATE tblFundingSource SET isActive = NOT isActive WHERE sourceID = ?', [sourceID]);
			const row = state.funding.rows.find((item) => String(item.sourceID) === String(sourceID));

			if (row) {
				row.isActive = Number(row.isActive) ? 0 : 1;
			}

			renderFundingTable(state.funding.rows);
			showToast('Funding source status updated successfully.');
		} catch (error) {
			showToast(error.message, 'error');
		}
	}

	async function handleFundingCreate(event) {
		event.preventDefault();

		const submitButton = event.submitter || dom.fundingForm.querySelector('button[type="submit"]');
		clearFeedback('funding');
		clearFormErrors(dom.fundingForm);
		setButtonLoading(submitButton, true);

		const values = {
			sourceName: dom.fundingSourceName.value.trim(),
			sourceType: dom.fundingSourceType.value,
			contactEmail: dom.fundingContactEmail.value.trim(),
			isActive: dom.fundingActive.checked,
		};

		const validation = validateFundingCreate(values);
		if (!validation.valid) {
			renderInlineErrors(dom.fundingForm, validation.errors);
			setFeedback('funding', validation.message, 'error');
			setButtonLoading(submitButton, false);
			return;
		}

		try {
			await runQuery(
				'INSERT INTO tblFundingSource (sourceName, sourceType, contactEmail, isActive) VALUES (?, ?, ?, ?)',
				[values.sourceName, values.sourceType, values.contactEmail || null, values.isActive ? 1 : 0]
			);

			dom.fundingForm.reset();
			dom.fundingActive.checked = true;
			setFeedback('funding', 'Funding source added successfully.', 'success');
			showToast('Funding source added successfully.');
			await loadFundingSources(true);
		} catch (error) {
			setFeedback('funding', error.message, 'error');
			showToast(error.message, 'error');
		} finally {
			setButtonLoading(submitButton, false);
		}
	}

	function validateFundingCreate(values) {
		const errors = {};

		if (!values.sourceName) {
			errors.sourceName = 'Source name is required.';
		}

		if (!values.sourceType) {
			errors.sourceType = 'Select a source type.';
		}

		if (values.contactEmail && !/.+@.+\..+/.test(values.contactEmail)) {
			errors.contactEmail = 'Enter a valid email address.';
		}

		if (Object.keys(errors).length) {
			return { valid: false, errors, message: 'Please correct the highlighted fields.' };
		}

		return { valid: true, errors: {}, message: '' };
	}

	async function loadAllReports() {
		await Promise.all([
			loadScoreReport(),
			loadCoverageReport(),
			loadDropoutReport(),
		]);
	}

	async function loadScoreReport(force = false) {
		if (state.reports.score.loading) {
			return;
		}

		if (state.reports.score.loaded && !force) {
			renderScoreReport(state.reports.score.rows);
			return;
		}

		state.reports.score.loading = true;

		try {
			const rows = await selectRows(buildScoreReportSql(state.reports.score.filter), buildScoreReportParams(state.reports.score.filter));
			state.reports.score.rows = rows;
			state.reports.score.loaded = true;
			renderScoreReport(rows);
		} catch (error) {
			renderMessage(dom.scoreTable, error.message);
			destroyChart(state.reports.score.chart);
		} finally {
			state.reports.score.loading = false;
		}
	}

	function buildScoreReportSql(filterValue) {
		let sql = 'SELECT * FROM vw_ScoreImprovement';

		if (filterValue !== 'All') {
			sql += ' WHERE difficultyLevel = ?';
		}

		return `${sql} ORDER BY avgImprovement DESC`;
	}

	function buildScoreReportParams(filterValue) {
		return filterValue === 'All' ? [] : [filterValue];
	}

	function renderScoreReport(rows) {
		renderTable(
			dom.scoreTable,
			['Programme', 'Difficulty', 'Completed', 'Avg improvement', 'Avg pre', 'Avg post'],
			rows,
			(row) => `
				<tr>
					<td>${escapeHtml(row.programmeName)}</td>
					<td>${escapeHtml(row.difficultyLevel)}</td>
					<td>${escapeHtml(row.totalCompleted)}</td>
					<td>${escapeHtml(formatCellNumber(row.avgImprovement))}</td>
					<td>${escapeHtml(formatCellNumber(row.avgPre))}</td>
					<td>${escapeHtml(formatCellNumber(row.avgPost))}</td>
				</tr>
			`,
			'No score report data found.'
		);

		renderScoreChart(rows);
	}

	function renderScoreChart(rows) {
		destroyChart(state.reports.score.chart);

		if (!rows.length || !dom.scoreChart) {
			return;
		}

		state.reports.score.chart = new Chart(dom.scoreChart, {
			type: 'bar',
			data: {
				labels: rows.map((row) => `${row.programmeName} (${row.difficultyLevel})`),
				datasets: [
					{
						label: 'Average improvement',
						data: rows.map((row) => Number(row.avgImprovement) || 0),
						backgroundColor: '#0f6b2a',
						borderColor: '#0f6b2a',
						borderWidth: 1,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				indexAxis: 'y',
				plugins: {
					legend: { display: false },
					title: { display: true, text: 'Average Score Improvement by Programme' },
				},
				scales: {
					x: { beginAtZero: true },
				},
			},
		});
	}

	async function loadCoverageReport(force = false) {
		if (state.reports.coverage.loading) {
			return;
		}

		if (state.reports.coverage.loaded && !force) {
			renderCoverageReport(state.reports.coverage.rows);
			return;
		}

		state.reports.coverage.loading = true;

		try {
			const rows = await selectRows(buildCoverageReportSql(state.reports.coverage.filter), buildCoverageReportParams(state.reports.coverage.filter));
			state.reports.coverage.rows = rows;
			state.reports.coverage.loaded = true;
			renderCoverageReport(rows);
		} catch (error) {
			renderMessage(dom.coverageTable, error.message);
			destroyChart(state.reports.coverage.chart);
		} finally {
			state.reports.coverage.loading = false;
		}
	}

	function buildCoverageReportSql(filterValue) {
		let sql = 'SELECT * FROM vw_FundingCoverage';

		if (filterValue !== 'All') {
			sql += ' WHERE statusID = ?';
		}

		return `${sql} ORDER BY coveragePct ASC`;
	}

	function buildCoverageReportParams(filterValue) {
		return filterValue === 'All' ? [] : [filterValue];
	}

	function renderCoverageReport(rows) {
		renderTable(
			dom.coverageTable,
			['Programme', 'Focus area', 'Status', 'Budget', 'Funded', 'Coverage %', 'Streams', 'Expiry'],
			rows,
			(row) => `
				<tr>
					<td>${escapeHtml(row.programmeName)}</td>
					<td>${escapeHtml(row.focusArea)}</td>
					<td>${escapeHtml(row.statusName)}</td>
					<td>${escapeHtml(formatCurrency(row.budget))}</td>
					<td>${escapeHtml(formatCurrency(row.totalFunded))}</td>
					<td>${escapeHtml(formatCellNumber(row.coveragePct))}%</td>
					<td>${escapeHtml(row.fundingStreams)}</td>
					<td>${escapeHtml(formatDateDisplay(row.earliestFundingExpiry))}</td>
				</tr>
			`,
			'No coverage report data found.'
		);

		renderCoverageChart(rows);
	}

	function renderCoverageChart(rows) {
		destroyChart(state.reports.coverage.chart);

		if (!rows.length || !dom.coverageChart) {
			return;
		}

		state.reports.coverage.chart = new Chart(dom.coverageChart, {
			type: 'bar',
			data: {
				labels: rows.map((row) => row.programmeName),
				datasets: [
					{
						label: 'Coverage %',
						data: rows.map((row) => Number(row.coveragePct) || 0),
						backgroundColor: '#2459b8',
						borderColor: '#2459b8',
						borderWidth: 1,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				indexAxis: 'y',
				plugins: {
					legend: { display: false },
					title: { display: true, text: 'Funding Coverage by Programme' },
				},
				scales: {
					x: { beginAtZero: true, max: 100 },
				},
			},
		});
	}

	async function loadDropoutReport(force = false) {
		if (state.reports.dropout.loading) {
			return;
		}

		if (state.reports.dropout.loaded && !force) {
			renderDropoutReport(state.reports.dropout.rows);
			return;
		}

		state.reports.dropout.loading = true;

		try {
			const rows = await selectRows(buildDropoutReportSql(state.reports.dropout.filter), buildDropoutReportParams(state.reports.dropout.filter));
			state.reports.dropout.rows = rows;
			state.reports.dropout.loaded = true;
			renderDropoutReport(rows);
		} catch (error) {
			renderMessage(dom.dropoutTable, error.message);
			destroyChart(state.reports.dropout.chart);
		} finally {
			state.reports.dropout.loading = false;
		}
	}

	function buildDropoutReportSql(filterValue) {
		let sql = 'SELECT * FROM vw_DropoutByRegion';

		if (filterValue !== 'All') {
			sql += ' WHERE focusArea = ?';
		}

		return `${sql} ORDER BY dropoutRate DESC`;
	}

	function buildDropoutReportParams(filterValue) {
		return filterValue === 'All' ? [] : [filterValue];
	}

	function renderDropoutReport(rows) {
		renderTable(
			dom.dropoutTable,
			['Focus area', 'Region', 'Enrolled', 'Completed', 'Dropped', 'Completion %', 'Dropout %'],
			rows,
			(row) => `
				<tr>
					<td>${escapeHtml(row.focusArea)}</td>
					<td>${escapeHtml(row.regionName)}</td>
					<td>${escapeHtml(row.totalEnrolled)}</td>
					<td>${escapeHtml(row.completed)}</td>
					<td>${escapeHtml(row.dropped)}</td>
					<td>${escapeHtml(formatCellNumber(row.completionRate))}%</td>
					<td>${escapeHtml(formatCellNumber(row.dropoutRate))}%</td>
				</tr>
			`,
			'No dropout report data found.'
		);

		renderDropoutChart(rows);
	}

	function renderDropoutChart(rows) {
		destroyChart(state.reports.dropout.chart);

		if (!rows.length || !dom.dropoutChart) {
			return;
		}

		state.reports.dropout.chart = new Chart(dom.dropoutChart, {
			type: 'bar',
			data: {
				labels: rows.map((row) => `${row.focusArea} - ${row.regionName}`),
				datasets: [
					{
						label: 'Completed',
						data: rows.map((row) => Number(row.completed) || 0),
						backgroundColor: '#2196f3',
					},
					{
						label: 'Dropped',
						data: rows.map((row) => Number(row.dropped) || 0),
						backgroundColor: '#d94d4d',
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { position: 'bottom' },
					title: { display: true, text: 'Dropout and Completion by Focus Area' },
				},
				scales: {
					x: { stacked: false },
					y: { beginAtZero: true },
				},
			},
		});
	}

	function openConfirmModal(title, message, onConfirm) {
		openModal(`
			<div class="modal-dialog__header">
				<h2 class="modal-dialog__title">${escapeHtml(title)}</h2>
				<button type="button" class="modal-dialog__close" aria-label="Close modal" data-modal-close>&times;</button>
			</div>
			<div class="modal-dialog__body">
				<p>${escapeHtml(message)}</p>
				<p class="form-feedback" data-modal-feedback></p>
				<div class="form-actions">
					<button type="button" class="btn btn--outline" data-modal-close>Cancel</button>
					<button type="button" class="btn btn--primary" data-modal-confirm>Confirm</button>
				</div>
			</div>
		`, (modal) => {
			const confirmButton = modal.querySelector('[data-modal-confirm]');
			const cancelButton = modal.querySelectorAll('[data-modal-close]')[1] || modal.querySelector('[data-modal-close]');
			const feedback = modal.querySelector('[data-modal-feedback]');

			confirmButton.addEventListener('click', async () => {
				setButtonLoading(confirmButton, true);
				cancelButton.disabled = true;

				try {
					await onConfirm();
					closeModal();
				} catch (error) {
					setFeedbackNode(feedback, error.message, 'error');
					setButtonLoading(confirmButton, false);
					cancelButton.disabled = false;
				}
			});

			cancelButton.addEventListener('click', closeModal);
		});
	}

	function openModal(html, onOpen) {
		closeModal();

		if (!dom.modalRoot) {
			return null;
		}

		const overlay = document.createElement('div');
		overlay.className = 'modal-overlay';

		const dialog = document.createElement('div');
		dialog.className = 'modal-dialog modal--large';
		dialog.setAttribute('role', 'dialog');
		dialog.setAttribute('aria-modal', 'true');
		dialog.innerHTML = html;

		overlay.appendChild(dialog);
		dom.modalRoot.innerHTML = '';
		dom.modalRoot.appendChild(overlay);

		const escapeHandler = (event) => {
			if (event.key === 'Escape') {
				closeModal();
			}
		};

		overlay.addEventListener('click', (event) => {
			if (event.target === overlay) {
				closeModal();
			}
		});

		dialog.querySelectorAll('[data-modal-close]').forEach((button) => {
			button.addEventListener('click', closeModal);
		});

		document.addEventListener('keydown', escapeHandler);
		state.modal = { overlay, dialog, escapeHandler };

		if (typeof onOpen === 'function') {
			onOpen(dialog);
		}

		return dialog;
	}

	function closeModal() {
		if (state.modal && state.modal.escapeHandler) {
			document.removeEventListener('keydown', state.modal.escapeHandler);
		}

		if (dom.modalRoot) {
			dom.modalRoot.innerHTML = '';
		}

		state.modal = null;
	}

	function showToast(message, type = 'success') {
		if (!dom.toastRoot) {
			return;
		}

		const toast = document.createElement('div');
		toast.className = `toast toast--${type}`;
		toast.textContent = message;
		dom.toastRoot.appendChild(toast);

		window.setTimeout(() => {
			toast.remove();
		}, 3000);
	}

	function setButtonLoading(button, isLoading) {
		if (button) {
			button.disabled = Boolean(isLoading);
		}
	}

	function setFeedback(key, message, stateName) {
		const node = document.querySelector(`[data-form-feedback="${cssEscape(key)}"]`);
		setFeedbackNode(node, message, stateName);
	}

	function clearFeedback(key) {
		setFeedback(key, '', '');
	}

	function setFeedbackNode(node, message, stateName) {
		if (!node) {
			return;
		}

		node.textContent = message || '';
		node.hidden = !message;
		node.dataset.state = stateName || '';
	}

	function renderInlineErrors(form, errors) {
		Object.entries(errors).forEach(([fieldName, message]) => {
			const node = form.querySelector(`[data-error-for="${cssEscape(fieldName)}"]`);
			if (node) {
				node.textContent = message;
			}
		});
	}

	function clearFormErrors(form) {
		if (!form) {
			return;
		}

		form.querySelectorAll('[data-error-for]').forEach((node) => {
			node.textContent = '';
		});
	}

	function clearFieldError(form, fieldName) {
		if (!form) {
			return;
		}

		const node = form.querySelector(`[data-error-for="${cssEscape(fieldName)}"]`);
		if (node) {
			node.textContent = '';
		}
	}

	function renderTable(container, headers, rows, rowRenderer, emptyMessage) {
		if (!container) {
			return;
		}

		if (!rows.length) {
			renderMessage(container, emptyMessage);
			return;
		}

		const table = document.createElement('table');
		const thead = document.createElement('thead');
		const headerRow = document.createElement('tr');

		headers.forEach((header) => {
			const th = document.createElement('th');
			th.textContent = header;
			headerRow.appendChild(th);
		});

		thead.appendChild(headerRow);

		const tbody = document.createElement('tbody');
		tbody.innerHTML = rows.map((row) => rowRenderer(row)).join('');

		table.appendChild(thead);
		table.appendChild(tbody);
		container.innerHTML = '';
		container.appendChild(table);
	}

	function renderMessage(container, message) {
		if (!container) {
			return;
		}

		container.innerHTML = `<p>${escapeHtml(message)}</p>`;
	}

	function destroyChart(chart) {
		if (chart && typeof chart.destroy === 'function') {
			chart.destroy();
		}
	}

	function formatDateDisplay(value) {
		if (!value) {
			return '—';
		}

		const date = new Date(`${value}T00:00:00`);
		if (Number.isNaN(date.getTime())) {
			return String(value);
		}

		return new Intl.DateTimeFormat('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		}).format(date);
	}

	function toDateInputValue(date) {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function formatCurrency(value) {
		const number = Number(value);
		if (!Number.isFinite(number)) {
			return '—';
		}

		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: 'GBP',
			maximumFractionDigits: 0,
		}).format(number);
	}

	function formatCellNumber(value) {
		if (value === null || value === undefined || value === '') {
			return '—';
		}

		const number = Number(value);
		if (!Number.isFinite(number)) {
			return String(value);
		}

		return Number.isInteger(number) ? String(number) : number.toFixed(1);
	}

	function escapeHtml(value) {
		return String(value === null || value === undefined ? '' : value)
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#39;');
	}

	function cssEscape(value) {
		if (window.CSS && typeof window.CSS.escape === 'function') {
			return window.CSS.escape(value);
		}

		return String(value).replace(/"/g, '\\"');
	}
})();
